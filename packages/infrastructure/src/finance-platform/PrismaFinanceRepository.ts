import { createHash, randomUUID } from 'node:crypto';
import {
  assertCheckerEligible,
  assertSameCurrency,
  assertTransferTransition,
  compareMoneyAmounts,
  CreateFinanceInvoiceDto,
  CreateFinancePaymentDto,
  ExchangeRateDto,
  FinanceInvoiceDto,
  FinanceInvoiceFilters,
  FinanceMutationContext,
  FinancePaymentDto,
  IFinanceRepository,
  InvoiceStatus,
  MoneyAmount,
  PaginatedFinanceResult,
  PaymentStatus,
  PostLedgerTransactionInput,
  TransferStatus,
  validateBalancedPostings,
} from '@manaratak/domain';

type Db = any;
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const money = (units: string, currencyCode: string, scale: number): MoneyAmount => ({
  amountMinorUnits: units,
  currencyCode,
  scale,
});

export class PrismaFinanceRepository implements IFinanceRepository {
  constructor(private readonly db: Db) {}

  async findInvoiceById(id: string): Promise<FinanceInvoiceDto | null> {
    const row = await this.db.financeInvoiceRecord.findFirst({
      where: { OR: [{ id }, { publicId: id }] },
    });
    return row ? this.invoice(row) : null;
  }
  async findInvoiceByNumber(invoiceNumber: string): Promise<FinanceInvoiceDto | null> {
    const row = await this.db.financeInvoiceRecord.findUnique({ where: { invoiceNumber } });
    return row ? this.invoice(row) : null;
  }
  async listInvoices(
    filters: FinanceInvoiceFilters,
  ): Promise<PaginatedFinanceResult<FinanceInvoiceDto>> {
    const page = Math.max(1, filters.page || 1);
    const pageSize = Math.min(100, Math.max(1, filters.pageSize || 20));
    const where = {
      ...(filters.status && { status: filters.status }),
      ...(filters.originDomain && { originDomain: filters.originDomain }),
      ...(filters.originReferenceId && { originReferenceId: filters.originReferenceId }),
      ...(filters.studentReferenceId && { studentReferenceId: filters.studentReferenceId }),
      ...(filters.payerReferenceId && { payerReferenceId: filters.payerReferenceId }),
    };
    const [rows, total] = await Promise.all([
      this.db.financeInvoiceRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.db.financeInvoiceRecord.count({ where }),
    ]);
    return {
      data: rows.map((row: any) => this.invoice(row)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
  async listPaymentsForInvoice(invoiceId: string): Promise<FinancePaymentDto[]> {
    const rows = await this.db.financePaymentRecord.findMany({
      where: { invoiceId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row: any) => this.payment(row));
  }
  async createDraftInvoice(
    data: Omit<CreateFinanceInvoiceDto, 'status' | 'issuedAt'>,
    ctx: FinanceMutationContext,
  ): Promise<FinanceInvoiceDto> {
    return this.tx(async (tx) => {
      const existing = await tx.financeInvoiceRecord.findFirst({
        where: {
          correlationId: ctx.correlationId,
          originDomain: data.originDomain,
          originReferenceId: data.originReferenceId,
        },
      });
      if (existing) return this.invoice(existing);
      const row = await tx.financeInvoiceRecord.create({
        data: {
          publicId: data.publicId,
          invoiceNumber: data.invoiceNumber,
          correlationId: ctx.correlationId,
          originDomain: data.originDomain,
          originReferenceId: data.originReferenceId,
          studentReferenceId: data.studentReferenceId,
          payerReferenceId: data.payerReferenceId,
          status: InvoiceStatus.DRAFT,
          currencyCode: data.totalAmount.currencyCode,
          scale: data.totalAmount.scale,
          totalMinorUnits: data.totalAmount.amountMinorUnits,
          dueMinorUnits: data.totalAmount.amountMinorUnits,
          lineItems: data.lineItems as any,
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          metadata: data.metadata as any,
        },
      });
      await this.govern(tx, ctx, 'FINANCE_INVOICE_DRAFT_CREATED', row.id, {
        invoiceNumber: row.invoiceNumber,
      });
      return this.invoice(row);
    });
  }
  async updateDraftInvoice(
    id: string,
    lineItems: CreateFinanceInvoiceDto['lineItems'],
    total: MoneyAmount,
    ctx: FinanceMutationContext,
  ): Promise<FinanceInvoiceDto> {
    return this.tx(async (tx) => {
      const current = await tx.financeInvoiceRecord.findUnique({ where: { id } });
      if (!current || current.status !== InvoiceStatus.DRAFT)
        throw new Error('Only DRAFT invoices can be edited');
      const row = await tx.financeInvoiceRecord.update({
        where: { id, version: current.version },
        data: {
          lineItems: lineItems as any,
          currencyCode: total.currencyCode,
          scale: total.scale,
          totalMinorUnits: total.amountMinorUnits,
          dueMinorUnits: total.amountMinorUnits,
          version: { increment: 1 },
        },
      });
      await this.govern(tx, ctx, 'FINANCE_INVOICE_DRAFT_UPDATED', id, {});
      return this.invoice(row);
    });
  }
  async issueDraftInvoice(id: string, ctx: FinanceMutationContext): Promise<FinanceInvoiceDto> {
    return this.tx(async (tx) => {
      const current = await tx.financeInvoiceRecord.findUnique({ where: { id } });
      if (!current || current.status !== InvoiceStatus.DRAFT)
        throw new Error('Only DRAFT invoices can be issued');
      const row = await tx.financeInvoiceRecord.update({
        where: { id, version: current.version },
        data: {
          status: InvoiceStatus.ISSUED,
          invoiceNumber: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${current.publicId.slice(-8).toUpperCase()}`,
          issuedAt: new Date(),
          version: { increment: 1 },
        },
      });
      const receivable = await this.systemAccount(
        tx,
        'ACCOUNTS_RECEIVABLE',
        'ASSET',
        current.currencyCode,
        current.scale,
      );
      const revenue = await this.systemAccount(
        tx,
        `REVENUE:${current.originDomain}`,
        'REVENUE',
        current.currencyCode,
        current.scale,
      );
      await this.postWithinTx(tx, {
        ...ctx,
        businessReferenceType: 'INVOICE',
        businessReferenceId: current.id,
        postings: [
          {
            accountId: receivable.id,
            direction: 'DEBIT',
            amount: money(current.totalMinorUnits, current.currencyCode, current.scale),
          },
          {
            accountId: revenue.id,
            direction: 'CREDIT',
            amount: money(current.totalMinorUnits, current.currencyCode, current.scale),
          },
        ],
      });
      await this.govern(tx, ctx, 'FINANCE_INVOICE_ISSUED', id, {});
      return this.invoice(row);
    });
  }

  async voidInvoiceAtomic(id: string, ctx: FinanceMutationContext): Promise<FinanceInvoiceDto> {
    return this.tx(async (tx) => {
      const current = await tx.financeInvoiceRecord.findUnique({ where: { id } });
      if (
        !current ||
        ![InvoiceStatus.DRAFT, InvoiceStatus.ISSUED, InvoiceStatus.OVERDUE].includes(current.status)
      )
        throw new Error('Invoice cannot be voided');
      const row = await tx.financeInvoiceRecord.update({
        where: { id, version: current.version },
        data: { status: InvoiceStatus.VOIDED, voidedAt: new Date(), version: { increment: 1 } },
      });
      if (current.status !== InvoiceStatus.DRAFT) {
        const receivable = await this.systemAccount(
          tx,
          'ACCOUNTS_RECEIVABLE',
          'ASSET',
          current.currencyCode,
          current.scale,
        );
        const revenue = await this.systemAccount(
          tx,
          `REVENUE:${current.originDomain}`,
          'REVENUE',
          current.currencyCode,
          current.scale,
        );
        const amount = money(current.dueMinorUnits, current.currencyCode, current.scale);
        await this.postWithinTx(tx, {
          ...ctx,
          idempotencyKey: `${ctx.idempotencyKey}:ledger`,
          businessReferenceType: 'INVOICE_VOID',
          businessReferenceId: current.id,
          postings: [
            { accountId: revenue.id, direction: 'DEBIT', amount },
            { accountId: receivable.id, direction: 'CREDIT', amount },
          ],
        });
      }
      await this.govern(tx, ctx, 'FINANCE_INVOICE_VOIDED', id, {});
      return this.invoice(row);
    });
  }
  async recordCapturedPaymentAtomic(
    data: CreateFinancePaymentDto,
    ctx: FinanceMutationContext,
  ): Promise<FinancePaymentDto> {
    return this.tx(async (tx) => {
      const keyHash = hash(ctx.idempotencyKey);
      const duplicate = await tx.financePaymentRecord.findUnique({
        where: { idempotencyKeyHash: keyHash },
      });
      if (duplicate) return this.payment(duplicate);
      const invoice = await tx.financeInvoiceRecord.findUnique({ where: { id: data.invoiceId } });
      if (
        !invoice ||
        ![InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE].includes(
          invoice.status,
        )
      )
        throw new Error('Invoice is not payable');
      const amount = data.amount;
      if (
        amount.currencyCode !== invoice.currencyCode ||
        amount.scale !== invoice.scale ||
        BigInt(amount.amountMinorUnits) <= BigInt(0) ||
        BigInt(amount.amountMinorUnits) > BigInt(invoice.dueMinorUnits)
      )
        throw new Error('Invalid captured amount');
      const row = await tx.financePaymentRecord.create({
        data: {
          ...this.paymentCreate(data),
          idempotencyKeyHash: keyHash,
          attempts: {
            create: [
              { sequence: 1, status: PaymentStatus.PENDING },
              {
                sequence: 2,
                status: PaymentStatus.AUTHORIZED,
                gatewayReference: data.gatewayReference,
              },
              {
                sequence: 3,
                status: PaymentStatus.CAPTURED,
                gatewayReference: data.gatewayReference,
              },
            ],
          },
        },
      });
      const cash = await this.systemAccount(
        tx,
        'PAYMENT_CLEARING',
        'ASSET',
        amount.currencyCode,
        amount.scale,
      );
      const receivable = await this.systemAccount(
        tx,
        'ACCOUNTS_RECEIVABLE',
        'ASSET',
        amount.currencyCode,
        amount.scale,
      );
      await this.postWithinTx(tx, {
        ...ctx,
        idempotencyKey: `${ctx.idempotencyKey}:ledger`,
        businessReferenceType: 'PAYMENT',
        businessReferenceId: row.id,
        postings: [
          { accountId: cash.id, direction: 'DEBIT', amount },
          { accountId: receivable.id, direction: 'CREDIT', amount },
        ],
      });
      const due = BigInt(invoice.dueMinorUnits) - BigInt(amount.amountMinorUnits);
      await tx.financeInvoiceRecord.update({
        where: { id: invoice.id, version: invoice.version },
        data: {
          dueMinorUnits: due.toString(),
          status: due === BigInt(0) ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID,
          paidAt: due === BigInt(0) ? new Date() : null,
          version: { increment: 1 },
        },
      });
      await tx.financeDocumentRecord.create({
        data: {
          publicId: `fin_receipt_${randomUUID()}`,
          type: 'RECEIPT',
          invoiceId: invoice.id,
          paymentId: row.id,
          amountMinorUnits: amount.amountMinorUnits,
          currencyCode: amount.currencyCode,
          scale: amount.scale,
          issuedBy: ctx.actorId,
        },
      });
      await this.govern(tx, ctx, 'FINANCE_PAYMENT_CAPTURED', row.id, { invoiceId: invoice.id });
      return this.payment(row);
    });
  }
  async createCreditNote(
    invoiceId: string,
    amount: MoneyAmount,
    reason: string,
    ctx: FinanceMutationContext,
  ) {
    return this.tx(async (tx) => {
      const invoice = await tx.financeInvoiceRecord.findUnique({ where: { id: invoiceId } });
      if (!invoice || invoice.status === InvoiceStatus.DRAFT)
        throw new Error('Issued invoice not found');
      if (
        amount.currencyCode !== invoice.currencyCode ||
        amount.scale !== invoice.scale ||
        BigInt(amount.amountMinorUnits) <= BigInt(0) ||
        BigInt(amount.amountMinorUnits) > BigInt(invoice.totalMinorUnits)
      )
        throw new Error('Invalid credit note amount');
      const row = await tx.financeDocumentRecord.create({
        data: {
          publicId: `fin_credit_${randomUUID()}`,
          type: 'CREDIT_NOTE',
          invoiceId,
          amountMinorUnits: amount.amountMinorUnits,
          currencyCode: amount.currencyCode,
          scale: amount.scale,
          reason,
          issuedBy: ctx.actorId,
        },
      });
      const revenue = await this.systemAccount(
        tx,
        `REVENUE:${invoice.originDomain}`,
        'REVENUE',
        amount.currencyCode,
        amount.scale,
      );
      const receivable = await this.systemAccount(
        tx,
        'ACCOUNTS_RECEIVABLE',
        'ASSET',
        amount.currencyCode,
        amount.scale,
      );
      await this.postWithinTx(tx, {
        ...ctx,
        idempotencyKey: `${ctx.idempotencyKey}:ledger`,
        businessReferenceType: 'CREDIT_NOTE',
        businessReferenceId: row.id,
        postings: [
          { accountId: revenue.id, direction: 'DEBIT', amount },
          { accountId: receivable.id, direction: 'CREDIT', amount },
        ],
      });
      await this.govern(tx, ctx, 'FINANCE_CREDIT_NOTE_CREATED', row.id, { invoiceId });
      return {
        id: row.id,
        publicId: row.publicId,
        invoiceId,
        amount,
        reason,
        issuedBy: row.issuedBy,
        issuedAt: row.issuedAt,
      };
    });
  }
  async createReceipt(
    invoiceId: string,
    paymentId: string,
    amount: MoneyAmount,
    ctx: FinanceMutationContext,
  ) {
    return this.tx(async (tx) => {
      const existing = await tx.financeDocumentRecord.findFirst({
        where: { type: 'RECEIPT', paymentId },
      });
      const row =
        existing ||
        (await tx.financeDocumentRecord.create({
          data: {
            publicId: `fin_receipt_${randomUUID()}`,
            type: 'RECEIPT',
            invoiceId,
            paymentId,
            amountMinorUnits: amount.amountMinorUnits,
            currencyCode: amount.currencyCode,
            scale: amount.scale,
            issuedBy: ctx.actorId,
          },
        }));
      return {
        id: row.id,
        publicId: row.publicId,
        invoiceId,
        paymentId,
        amount,
        issuedAt: row.issuedAt,
      };
    });
  }
  async createInstallmentPlan(invoiceId: string, plan: any, ctx: FinanceMutationContext) {
    return this.tx(async (tx) => {
      const row = await tx.financeInstallmentPlanRecord.create({
        data: {
          publicId: `fin_plan_${randomUUID()}`,
          invoiceId,
          totalMinorUnits: plan.totalAmount.amountMinorUnits,
          currencyCode: plan.totalAmount.currencyCode,
          scale: plan.totalAmount.scale,
          status: plan.status,
          schedule: plan.installments,
        },
      });
      await this.govern(tx, ctx, 'FINANCE_INSTALLMENT_PLAN_CREATED', row.id, {});
      return {
        id: row.id,
        publicId: row.publicId,
        invoiceId,
        totalAmount: money(row.totalMinorUnits, row.currencyCode, row.scale),
        status: row.status,
        installments: row.schedule,
        createdAt: row.createdAt,
      };
    });
  }

  async createFinancialAccount(data: any, ctx: FinanceMutationContext) {
    return this.tx(async (tx) => {
      const row = await tx.financialAccountRecord.create({ data });
      await this.govern(tx, ctx, 'FINANCIAL_ACCOUNT_CREATED', row.id, {});
      return row;
    });
  }
  async postLedgerTransaction(data: PostLedgerTransactionInput) {
    validateBalancedPostings(data.postings);
    return this.tx(async (tx) => {
      const idempotencyKeyHash = hash(data.idempotencyKey);
      const duplicate = await tx.financialTransactionRecord.findUnique({
        where: { idempotencyKeyHash },
        include: { entries: true },
      });
      if (duplicate) return this.transaction(duplicate);
      const accounts = await tx.financialAccountRecord.findMany({
        where: { id: { in: data.postings.map((item) => item.accountId) }, active: true },
      });
      if (accounts.length !== new Set(data.postings.map((item) => item.accountId)).size)
        throw new Error('Financial account missing or inactive');
      const first = data.postings[0].amount;
      if (
        accounts.some(
          (account: any) =>
            account.currencyCode !== first.currencyCode || account.scale !== first.scale,
        )
      )
        throw new Error('Ledger account currency mismatch');
      const row = await tx.financialTransactionRecord.create({
        data: {
          publicId: `fin_tx_${randomUUID()}`,
          correlationId: data.correlationId,
          businessReferenceType: data.businessReferenceType,
          businessReferenceId: data.businessReferenceId,
          idempotencyKeyHash,
          currencyCode: first.currencyCode,
          scale: first.scale,
          reversalOfId: data.reversalOfId,
          createdBy: data.actorId,
          entries: {
            create: data.postings.map((entry, sequence) => ({
              accountId: entry.accountId,
              direction: entry.direction,
              amountMinorUnits: entry.amount.amountMinorUnits,
              currencyCode: entry.amount.currencyCode,
              scale: entry.amount.scale,
              sequence,
              memo: entry.memo,
            })),
          },
        },
        include: { entries: true },
      });
      await this.govern(tx, data, 'FINANCIAL_LEDGER_POSTED', row.id, {
        businessReferenceType: data.businessReferenceType,
        businessReferenceId: data.businessReferenceId,
      });
      return this.transaction(row);
    });
  }
  async reverseLedgerTransaction(transactionId: string, ctx: FinanceMutationContext) {
    const original = await this.db.financialTransactionRecord.findFirst({
      where: { OR: [{ id: transactionId }, { publicId: transactionId }] },
      include: { entries: true },
    });
    if (!original) throw new Error('Financial transaction not found');
    return this.postLedgerTransaction({
      ...ctx,
      businessReferenceType: 'REVERSAL',
      businessReferenceId: original.publicId,
      reversalOfId: original.id,
      postings: original.entries.map((entry: any) => ({
        accountId: entry.accountId,
        direction: entry.direction === 'DEBIT' ? 'CREDIT' : 'DEBIT',
        amount: money(entry.amountMinorUnits, entry.currencyCode, entry.scale),
        memo: `Reversal of ${original.publicId}`,
      })),
    });
  }

  async createWallet(data: any, ctx: FinanceMutationContext) {
    return this.tx(async (tx) => {
      const row = await tx.financeWalletRecord.create({ data });
      await this.govern(tx, ctx, 'FINANCE_WALLET_CREATED', row.id, {});
      return row;
    });
  }
  async getWallet(id: string) {
    return this.db.financeWalletRecord.findFirst({ where: { OR: [{ id }, { publicId: id }] } });
  }
  async getWalletBalance(walletId: string) {
    const wallet = await this.getWallet(walletId);
    if (!wallet) throw new Error('Wallet not found');
    const entries = await this.db.financialLedgerEntryRecord.findMany({
      where: { accountId: wallet.accountId },
    });
    const holds = await this.db.financeWalletHoldRecord.findMany({
      where: { walletId: wallet.id, status: 'ACTIVE' },
    });
    const current = entries.reduce(
      (sum: bigint, item: any) =>
        sum +
        (item.direction === 'CREDIT'
          ? BigInt(item.amountMinorUnits)
          : -BigInt(item.amountMinorUnits)),
      BigInt(0),
    );
    const locked = holds.reduce(
      (sum: bigint, item: any) => sum + BigInt(item.amountMinorUnits),
      BigInt(0),
    );
    return {
      walletId: wallet.id,
      currentBalance: money(current.toString(), wallet.currencyCode, wallet.scale),
      availableBalance: money((current - locked).toString(), wallet.currencyCode, wallet.scale),
      lockedBalance: money(locked.toString(), wallet.currencyCode, wallet.scale),
      asOf: new Date(),
    };
  }
  async createWalletHold(
    walletId: string,
    amount: MoneyAmount,
    businessReferenceId: string,
    ctx: FinanceMutationContext,
  ) {
    return this.tx(async (tx) => {
      const wallet = await tx.financeWalletRecord.findUnique({ where: { id: walletId } });
      if (!wallet || wallet.status !== 'ACTIVE') throw new Error('Wallet is not active');
      const balance = await this.getWalletBalance(walletId);
      assertSameCurrency(balance.availableBalance, amount);
      if (compareMoneyAmounts(balance.availableBalance, amount) === -1)
        throw new Error('Insufficient available balance');
      const duplicate = await tx.financeWalletHoldRecord.findUnique({
        where: { idempotencyKeyHash: hash(ctx.idempotencyKey) },
      });
      if (duplicate) return this.hold(duplicate);
      await tx.financeWalletRecord.update({
        where: { id: walletId, version: wallet.version },
        data: { version: { increment: 1 } },
      });
      const row = await tx.financeWalletHoldRecord.create({
        data: {
          publicId: `fin_hold_${randomUUID()}`,
          walletId,
          amountMinorUnits: amount.amountMinorUnits,
          currencyCode: amount.currencyCode,
          scale: amount.scale,
          status: 'ACTIVE',
          businessReferenceId,
          idempotencyKeyHash: hash(ctx.idempotencyKey),
        },
      });
      await this.govern(tx, ctx, 'FINANCE_WALLET_HOLD_CREATED', row.id, {});
      return this.hold(row);
    });
  }
  async resolveWalletHold(
    holdId: string,
    action: 'RELEASE' | 'CAPTURE',
    ctx: FinanceMutationContext,
  ) {
    return this.tx(async (tx) => {
      const current = await tx.financeWalletHoldRecord.findUnique({ where: { id: holdId } });
      if (!current || current.status !== 'ACTIVE') throw new Error('Wallet hold is not active');
      const wallet = await tx.financeWalletRecord.findUnique({ where: { id: current.walletId } });
      if (!wallet) throw new Error('Wallet not found');
      await tx.financeWalletRecord.update({
        where: { id: wallet.id, version: wallet.version },
        data: { version: { increment: 1 } },
      });
      const row = await tx.financeWalletHoldRecord.update({
        where: { id: holdId },
        data: { status: action === 'RELEASE' ? 'RELEASED' : 'CAPTURED', resolvedAt: new Date() },
      });
      if (action === 'CAPTURE') {
        const settlement = await this.systemAccount(
          tx,
          'WALLET_SETTLEMENT_CLEARING',
          'ASSET',
          current.currencyCode,
          current.scale,
        );
        const amount = money(current.amountMinorUnits, current.currencyCode, current.scale);
        await this.postWithinTx(tx, {
          ...ctx,
          idempotencyKey: `${ctx.idempotencyKey}:ledger`,
          businessReferenceType: 'WALLET_HOLD_CAPTURE',
          businessReferenceId: row.id,
          postings: [
            { accountId: wallet.accountId, direction: 'DEBIT', amount },
            { accountId: settlement.id, direction: 'CREDIT', amount },
          ],
        });
      }
      await this.govern(tx, ctx, `FINANCE_WALLET_HOLD_${action}D`, row.id, {});
      return this.hold(row);
    });
  }

  async saveExchangeRate(data: any, ctx: FinanceMutationContext) {
    return this.tx(async (tx) => {
      if (
        !/^\d+$/.test(data.rateNumerator) ||
        !/^\d+$/.test(data.rateDenominator) ||
        BigInt(data.rateDenominator) === BigInt(0)
      )
        throw new Error('Invalid exact exchange rate');
      const row = await tx.financeExchangeRateRecord.create({ data });
      await this.govern(tx, ctx, 'FINANCE_EXCHANGE_RATE_SAVED', row.id, { approved: row.approved });
      return row;
    });
  }
  async findEffectiveExchangeRate(
    sourceCurrencyCode: string,
    targetCurrencyCode: string,
    at: Date,
  ): Promise<ExchangeRateDto | null> {
    return this.db.financeExchangeRateRecord.findFirst({
      where: {
        sourceCurrencyCode,
        targetCurrencyCode,
        approved: true,
        effectiveFrom: { lte: at },
        OR: [{ effectiveTo: null }, { effectiveTo: { gt: at } }],
      },
      orderBy: [{ source: 'asc' }, { effectiveFrom: 'desc' }],
    });
  }
  async listExchangeRates() {
    return this.db.financeExchangeRateRecord.findMany({ orderBy: { effectiveFrom: 'desc' } });
  }
  async createTransfer(data: any, ctx: FinanceMutationContext) {
    return this.tx(async (tx) => {
      const existing = await tx.financeTransferRecord.findUnique({
        where: { idempotencyKeyHash: hash(ctx.idempotencyKey) },
      });
      if (existing) return this.transfer(existing);
      const row = await tx.financeTransferRecord.create({
        data: {
          publicId: data.publicId,
          sourceWalletId: data.sourceWalletId,
          destinationReferenceId: data.destinationReferenceId,
          sourceCurrencyCode: data.sourceAmount.currencyCode,
          sourceScale: data.sourceAmount.scale,
          sourceAmountMinorUnits: data.sourceAmount.amountMinorUnits,
          targetCurrencyCode: data.targetAmount?.currencyCode,
          targetScale: data.targetAmount?.scale,
          targetAmountMinorUnits: data.targetAmount?.amountMinorUnits,
          rateId: data.rateId,
          feeAmountMinorUnits: data.feeAmount?.amountMinorUnits,
          status: data.status,
          makerId: data.makerId,
          correlationId: data.correlationId,
          idempotencyKeyHash: hash(ctx.idempotencyKey),
        },
      });
      await this.govern(tx, ctx, 'FINANCE_TRANSFER_REQUESTED', row.id, {});
      return this.transfer(row);
    });
  }
  async getTransfer(id: string) {
    const row = await this.db.financeTransferRecord.findFirst({
      where: { OR: [{ id }, { publicId: id }] },
    });
    return row ? this.transfer(row) : null;
  }
  async transitionTransfer(id: string, status: TransferStatus, ctx: FinanceMutationContext) {
    return this.tx(async (tx) => {
      const current = await tx.financeTransferRecord.findUnique({ where: { id } });
      if (!current) throw new Error('Transfer not found');
      assertTransferTransition(current.status, status);
      if (status === 'PENDING_APPROVAL') {
        const wallet = await tx.financeWalletRecord.findUnique({
          where: { id: current.sourceWalletId },
        });
        if (!wallet || wallet.status !== 'ACTIVE') throw new Error('Source wallet is not active');
        const amountUnits =
          BigInt(current.sourceAmountMinorUnits) + BigInt(current.feeAmountMinorUnits || '0');
        const balance = await this.getWalletBalance(wallet.id);
        if (BigInt(balance.availableBalance.amountMinorUnits) < amountUnits)
          throw new Error('Insufficient available wallet balance');
        await tx.financeWalletRecord.update({
          where: { id: wallet.id, version: wallet.version },
          data: { version: { increment: 1 } },
        });
        await tx.financeWalletHoldRecord.create({
          data: {
            publicId: `fin_hold_${randomUUID()}`,
            walletId: wallet.id,
            amountMinorUnits: amountUnits.toString(),
            currencyCode: current.sourceCurrencyCode,
            scale: current.sourceScale,
            status: 'ACTIVE',
            businessReferenceId: current.publicId,
            idempotencyKeyHash: hash(`${ctx.idempotencyKey}:hold`),
          },
        });
      }
      if (status === 'APPROVED') {
        const approval = await tx.financeApprovalRecord.findFirst({
          where: { targetReferenceId: { in: [current.id, current.publicId] }, status: 'APPROVED' },
        });
        if (!approval) throw new Error('Transfer requires completed maker-checker approval');
      }
      if (status === 'SETTLED') {
        const hold = await tx.financeWalletHoldRecord.findFirst({
          where: {
            walletId: current.sourceWalletId,
            businessReferenceId: { in: [current.id, current.publicId] },
            status: 'ACTIVE',
          },
        });
        if (!hold) throw new Error('Transfer settlement requires an active funds hold');
        const wallet = await tx.financeWalletRecord.findUnique({
          where: { id: current.sourceWalletId },
        });
        if (!wallet) throw new Error('Source wallet not found');
        const settlement = await this.systemAccount(
          tx,
          'TRANSFER_SETTLEMENT_CLEARING',
          'ASSET',
          current.sourceCurrencyCode,
          current.sourceScale,
        );
        const amount = money(
          hold.amountMinorUnits,
          current.sourceCurrencyCode,
          current.sourceScale,
        );
        await this.postWithinTx(tx, {
          ...ctx,
          idempotencyKey: `${ctx.idempotencyKey}:ledger`,
          businessReferenceType: 'TRANSFER',
          businessReferenceId: current.id,
          postings: [
            { accountId: wallet.accountId, direction: 'DEBIT', amount },
            { accountId: settlement.id, direction: 'CREDIT', amount },
          ],
        });
        await tx.financeWalletHoldRecord.update({
          where: { id: hold.id },
          data: { status: 'CAPTURED', resolvedAt: new Date() },
        });
      }
      if (status === 'CANCELLED' || status === 'REJECTED') {
        await tx.financeWalletHoldRecord.updateMany({
          where: {
            walletId: current.sourceWalletId,
            businessReferenceId: current.publicId,
            status: 'ACTIVE',
          },
          data: { status: 'RELEASED', resolvedAt: new Date() },
        });
      }
      const row = await tx.financeTransferRecord.update({
        where: { id, version: current.version },
        data: { status, version: { increment: 1 } },
      });
      await this.govern(tx, ctx, `FINANCE_TRANSFER_${status}`, id, {});
      return this.transfer(row);
    });
  }
  async listTransfers() {
    const rows = await this.db.financeTransferRecord.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map((row: any) => this.transfer(row));
  }
  async createApproval(data: any, ctx: FinanceMutationContext) {
    return this.tx(async (tx) => {
      const row = await tx.financeApprovalRecord.create({
        data: {
          publicId: data.publicId,
          actionType: data.actionType,
          targetReferenceId: data.targetReferenceId,
          amountMinorUnits: data.amount?.amountMinorUnits,
          currencyCode: data.amount?.currencyCode,
          scale: data.amount?.scale,
          makerId: data.makerId,
          requiredApprovals: data.requiredApprovals,
          status: data.status,
          expiresAt: data.expiresAt,
        },
        include: { decisions: true },
      });
      await this.govern(tx, ctx, 'FINANCE_APPROVAL_CREATED', row.id, {});
      return this.approval(row);
    });
  }
  async decideApproval(
    id: string,
    decision: 'APPROVE' | 'REJECT',
    checkerId: string,
    reason: string | undefined,
    ctx: FinanceMutationContext,
  ) {
    return this.tx(async (tx) => {
      const current = await tx.financeApprovalRecord.findFirst({
        where: { OR: [{ id }, { publicId: id }] },
        include: { decisions: true },
      });
      if (!current || current.status !== 'PENDING') throw new Error('Approval is not pending');
      assertCheckerEligible(current.makerId, checkerId, current.decisions);
      if (current.expiresAt && current.expiresAt <= new Date()) throw new Error('Approval expired');
      await tx.financeApprovalDecisionRecord.create({
        data: { approvalId: current.id, approverId: checkerId, decision, reason },
      });
      const count =
        current.decisions.filter((item: any) => item.decision === 'APPROVE').length +
        (decision === 'APPROVE' ? 1 : 0);
      const status =
        decision === 'REJECT'
          ? 'REJECTED'
          : count >= current.requiredApprovals
            ? 'APPROVED'
            : 'PENDING';
      const row = await tx.financeApprovalRecord.update({
        where: { id: current.id },
        data: { status },
        include: { decisions: true },
      });
      await this.govern(tx, ctx, `FINANCE_APPROVAL_${decision}D`, current.id, { checkerId });
      return this.approval(row);
    });
  }
  async listApprovals(status?: string) {
    const rows = await this.db.financeApprovalRecord.findMany({
      where: status ? { status } : {},
      include: { decisions: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row: any) => this.approval(row));
  }
  async createRefund(data: any, ctx: FinanceMutationContext) {
    return this.tx(async (tx) => {
      const payment = await tx.financePaymentRecord.findUnique({ where: { id: data.paymentId } });
      if (
        !payment ||
        ![PaymentStatus.CAPTURED, PaymentStatus.PARTIALLY_REFUNDED].includes(payment.status)
      )
        throw new Error('Payment is not refundable');
      const completed = await tx.financeRefundRecord.findMany({
        where: { paymentId: data.paymentId, status: 'COMPLETED' },
      });
      const refunded = completed.reduce(
        (sum: bigint, row: any) => sum + BigInt(row.amountMinorUnits),
        BigInt(0),
      );
      if (
        data.amount.currencyCode !== payment.currencyCode ||
        data.amount.scale !== payment.scale ||
        refunded + BigInt(data.amount.amountMinorUnits) > BigInt(payment.amountMinorUnits)
      )
        throw new Error('Refund exceeds captured amount');
      const row = await tx.financeRefundRecord.create({
        data: {
          publicId: data.publicId,
          paymentId: data.paymentId,
          amountMinorUnits: data.amount.amountMinorUnits,
          currencyCode: data.amount.currencyCode,
          scale: data.amount.scale,
          reason: data.reason,
          status: data.status,
          makerId: data.makerId,
          approvalId: data.approvalId,
        },
      });
      await this.govern(tx, ctx, 'FINANCE_REFUND_REQUESTED', row.id, {});
      return this.refund(row);
    });
  }
  async listRefunds() {
    const rows = await this.db.financeRefundRecord.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map((row: any) => this.refund(row));
  }
  async createCommission(data: any, ctx: FinanceMutationContext) {
    return this.tx(async (tx) => {
      const payment = await tx.financePaymentRecord.findUnique({
        where: { id: data.sourcePaymentId },
      });
      if (!payment || payment.status !== PaymentStatus.CAPTURED)
        throw new Error('Commission requires a captured payment');
      const row = await tx.financeCommissionRecord.create({
        data: {
          publicId: data.publicId,
          recipientReferenceId: data.recipientReferenceId,
          sourcePaymentId: data.sourcePaymentId,
          amountMinorUnits: data.amount.amountMinorUnits,
          currencyCode: data.amount.currencyCode,
          scale: data.amount.scale,
          status: data.status,
          policyReference: data.policyReference,
        },
      });
      await this.govern(tx, ctx, 'FINANCE_COMMISSION_ACCRUED', row.id, {});
      return this.commission(row);
    });
  }
  async listCommissions() {
    const rows = await this.db.financeCommissionRecord.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map((row: any) => this.commission(row));
  }
  async saveEstimate(data: any) {
    const row = await this.db.financeEstimateRecord.create({
      data: {
        publicId: data.publicId,
        subjectReferenceId: data.subjectReferenceId,
        displayCurrencyCode: data.displayCurrencyCode,
        scale: data.total.scale,
        totalMinorUnits: data.total.amountMinorUnits,
        lines: data.lines,
      },
    });
    return {
      id: row.id,
      publicId: row.publicId,
      subjectReferenceId: row.subjectReferenceId,
      displayCurrencyCode: row.displayCurrencyCode,
      lines: row.lines,
      total: money(row.totalMinorUnits, row.displayCurrencyCode, row.scale),
      generatedAt: row.generatedAt,
    };
  }
  async runReconciliation() {
    const issues: any[] = [];
    const [transactions, badInvoices, captured, settled, callbacks, transfers, wallets] =
      await Promise.all([
        this.db.financialTransactionRecord.findMany({ include: { entries: true } }),
        this.db.financeInvoiceRecord.findMany({
          where: { status: InvoiceStatus.PAID, NOT: { dueMinorUnits: '0' } },
        }),
        this.db.financePaymentRecord.findMany({ where: { status: PaymentStatus.CAPTURED } }),
        this.db.financeTransferRecord.findMany({
          where: { status: { in: ['SETTLED', 'COMPLETED'] } },
        }),
        this.db.financePaymentRecord.findMany({ where: { gatewayReference: { not: null } } }),
        this.db.financeTransferRecord.findMany({ where: { rateId: { not: null } } }),
        this.db.financeWalletRecord.findMany(),
      ]);
    for (const tx of transactions) {
      const debit = tx.entries
        .filter((item: any) => item.direction === 'DEBIT')
        .reduce((sum: bigint, item: any) => sum + BigInt(item.amountMinorUnits), BigInt(0));
      const credit = tx.entries
        .filter((item: any) => item.direction === 'CREDIT')
        .reduce((sum: bigint, item: any) => sum + BigInt(item.amountMinorUnits), BigInt(0));
      if (debit !== credit)
        issues.push({
          code: 'LEDGER_IMBALANCE',
          severity: 'CRITICAL',
          referenceId: tx.publicId,
          details: 'Debit and credit totals differ',
        });
    }
    issues.push(
      ...badInvoices.map((row: any) => ({
        code: 'PAID_INVOICE_DUE',
        severity: 'CRITICAL',
        referenceId: row.publicId,
        details: 'Paid invoice has amount due',
      })),
    );
    for (const payment of captured)
      if (
        !transactions.some(
          (tx: any) =>
            tx.businessReferenceType === 'PAYMENT' && tx.businessReferenceId === payment.id,
        )
      )
        issues.push({
          code: 'CAPTURE_WITHOUT_POSTING',
          severity: 'HIGH',
          referenceId: payment.publicId,
          details: 'Captured payment has no ledger posting',
        });
    for (const transfer of settled)
      if (
        !transactions.some(
          (tx: any) =>
            tx.businessReferenceType === 'TRANSFER' && tx.businessReferenceId === transfer.id,
        )
      )
        issues.push({
          code: 'ORPHAN_SETTLEMENT',
          severity: 'CRITICAL',
          referenceId: transfer.publicId,
          details: 'Settled transfer has no ledger settlement',
        });
    const callbackKeys = new Set<string>();
    for (const payment of callbacks) {
      const key = `${payment.gatewayProvider}:${payment.gatewayReference}`;
      if (callbackKeys.has(key))
        issues.push({
          code: 'DUPLICATE_GATEWAY_CALLBACK',
          severity: 'HIGH',
          referenceId: payment.publicId,
          details: 'Duplicate gateway reference',
        });
      callbackKeys.add(key);
    }
    for (const transfer of transfers) {
      const rate = await this.db.financeExchangeRateRecord.findUnique({
        where: { id: transfer.rateId },
      });
      if (!rate)
        issues.push({
          code: 'FX_MISMATCH',
          severity: 'CRITICAL',
          referenceId: transfer.publicId,
          details: 'Transfer rate snapshot is missing',
        });
    }
    for (const wallet of wallets) {
      const balance = await this.getWalletBalance(wallet.id);
      if (BigInt(balance.availableBalance.amountMinorUnits) < BigInt(0))
        issues.push({
          code: 'WALLET_BALANCE_MISMATCH',
          severity: 'CRITICAL',
          referenceId: wallet.publicId,
          details: 'Available wallet balance is negative',
        });
    }
    return issues;
  }
  async getFinanceOverview(): Promise<import('@manaratak/domain').FinanceOverviewDto> {
    const [pendingPayments, pendingTransfers, pendingApprovals, issues] = await Promise.all([
      this.db.financePaymentRecord.count({
        where: { status: { in: [PaymentStatus.PENDING, PaymentStatus.AUTHORIZED] } },
      }),
      this.db.financeTransferRecord.count({
        where: {
          status: {
            in: [
              'REQUESTED',
              'VALIDATED',
              'RATE_LOCKED',
              'FEES_CALCULATED',
              'PENDING_APPROVAL',
              'APPROVED',
              'PROCESSING',
              'SETTLED',
            ],
          },
        },
      }),
      this.db.financeApprovalRecord.count({ where: { status: 'PENDING' } }),
      this.runReconciliation(),
    ]);
    return {
      pendingPayments,
      pendingTransfers,
      pendingApprovals,
      reconciliationHealth: issues.some((item) => item.severity === 'CRITICAL')
        ? 'CRITICAL'
        : 'HEALTHY',
      attention: issues,
    };
  }
  async getFinancialReport(): Promise<import('@manaratak/domain').FinancialReportDto> {
    const [payments, invoices, refunds, transfers, commissions, wallets, issues] =
      await Promise.all([
        this.db.financePaymentRecord.findMany({ where: { status: PaymentStatus.CAPTURED } }),
        this.db.financeInvoiceRecord.findMany({
          where: {
            status: {
              in: [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE],
            },
          },
        }),
        this.db.financeRefundRecord.findMany({ where: { status: 'COMPLETED' } }),
        this.db.financeTransferRecord.findMany({
          where: { status: { in: ['SETTLED', 'COMPLETED'] } },
        }),
        this.db.financeCommissionRecord.findMany({
          where: { status: { in: ['ACCRUED', 'APPROVED', 'PAYABLE'] } },
        }),
        this.db.financeWalletRecord.findMany(),
        this.runReconciliation(),
      ]);
    const sum = (rows: any[], units: (row: any) => string, currency: (row: any) => string) =>
      rows.reduce((totals: Record<string, string>, row) => {
        const code = currency(row);
        totals[code] = (BigInt(totals[code] || '0') + BigInt(units(row))).toString();
        return totals;
      }, {});
    const walletBalances = await Promise.all(
      wallets.map((row: any) => this.getWalletBalance(row.id)),
    );
    return {
      generatedAt: new Date(),
      revenueByCurrency: sum(
        payments,
        (row) => row.amountMinorUnits,
        (row) => row.currencyCode,
      ),
      outstandingByCurrency: sum(
        invoices,
        (row) => row.dueMinorUnits,
        (row) => row.currencyCode,
      ),
      refundsByCurrency: sum(
        refunds,
        (row) => row.amountMinorUnits,
        (row) => row.currencyCode,
      ),
      transferVolumeByCurrency: sum(
        transfers,
        (row) => row.sourceAmountMinorUnits,
        (row) => row.sourceCurrencyCode,
      ),
      walletLiabilityByCurrency: sum(
        walletBalances,
        (row) => row.currentBalance.amountMinorUnits,
        (row) => row.currentBalance.currencyCode,
      ),
      commissionsByCurrency: sum(
        commissions,
        (row) => row.amountMinorUnits,
        (row) => row.currencyCode,
      ),
      reconciliationStatus: issues.some((item) => item.severity === 'CRITICAL')
        ? 'CRITICAL'
        : 'HEALTHY',
    };
  }

  async getStudentFinancialReadModel(
    studentReferenceId: string,
  ): Promise<import('@manaratak/domain').StudentFinancialReadModelDto> {
    const [invoiceRows, walletRows] = await Promise.all([
      this.db.financeInvoiceRecord.findMany({
        where: { studentReferenceId },
        orderBy: { createdAt: 'desc' },
      }),
      this.db.financeWalletRecord.findMany({
        where: { ownerReferenceId: studentReferenceId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    const wallets = await Promise.all(
      walletRows.map(async (wallet: any) => ({
        wallet,
        balance: await this.getWalletBalance(wallet.id),
      })),
    );
    const transfers = await this.db.financeTransferRecord.findMany({
      where: { sourceWalletId: { in: walletRows.map((wallet: any) => wallet.id) } },
      orderBy: { createdAt: 'desc' },
    });
    return {
      studentReferenceId,
      invoices: invoiceRows.map((row: any) => this.invoice(row)),
      wallets,
      transfers: transfers.map((row: any) => this.transfer(row)),
      generatedAt: new Date(),
    };
  }

  private async tx<T>(work: (tx: Db) => Promise<T>): Promise<T> {
    return this.db.$transaction(work);
  }
  private async systemAccount(
    tx: Db,
    ownerReferenceId: string,
    type: string,
    currencyCode: string,
    scale: number,
  ) {
    const existing = await tx.financialAccountRecord.findFirst({
      where: { ownerReferenceId, type, currencyCode },
    });
    return (
      existing ||
      tx.financialAccountRecord.create({
        data: {
          publicId: `fin_account_${randomUUID()}`,
          ownerReferenceId,
          type,
          currencyCode,
          scale,
          active: true,
        },
      })
    );
  }
  private async postWithinTx(tx: Db, data: PostLedgerTransactionInput) {
    validateBalancedPostings(data.postings);
    const idempotencyKeyHash = hash(data.idempotencyKey);
    const duplicate = await tx.financialTransactionRecord.findUnique({
      where: { idempotencyKeyHash },
      include: { entries: true },
    });
    if (duplicate) return duplicate;
    const first = data.postings[0].amount;
    return tx.financialTransactionRecord.create({
      data: {
        publicId: `fin_tx_${randomUUID()}`,
        correlationId: data.correlationId,
        businessReferenceType: data.businessReferenceType,
        businessReferenceId: data.businessReferenceId,
        idempotencyKeyHash,
        currencyCode: first.currencyCode,
        scale: first.scale,
        reversalOfId: data.reversalOfId,
        createdBy: data.actorId,
        entries: {
          create: data.postings.map((entry, sequence) => ({
            accountId: entry.accountId,
            direction: entry.direction,
            amountMinorUnits: entry.amount.amountMinorUnits,
            currencyCode: entry.amount.currencyCode,
            scale: entry.amount.scale,
            sequence,
            memo: entry.memo,
          })),
        },
      },
      include: { entries: true },
    });
  }
  private async govern(
    tx: Db,
    ctx: FinanceMutationContext,
    action: string,
    targetId: string,
    payload: Record<string, unknown>,
  ) {
    const now = new Date();
    const auditId = randomUUID();
    await tx.auditRecord.create({
      data: {
        id: auditId,
        reference: `finance-audit-${auditId}`,
        action,
        category: 'FINANCE',
        severity: action.includes('IMBALANCE') ? 'CRITICAL' : 'INFO',
        actorId: ctx.actorId,
        actorType: 'IDENTITY',
        targetId,
        targetType: 'FINANCE',
        source: 'PHASE19',
        timestamp: now,
        contextMetadata: { ...payload, reason: ctx.reason },
        correlationReference: ctx.correlationId,
      },
    });
    await tx.transactionalOutboxRecord.create({
      data: {
        id: randomUUID(),
        eventType: action,
        domain: 'FINANCE',
        aggregateType: 'FINANCE',
        aggregateId: targetId,
        payload: { targetId, ...payload },
        metadata: { idempotencyKeyHash: hash(`${action}:${ctx.idempotencyKey}`) },
        state: 'PENDING',
        attempts: 0,
        availableAt: now,
        correlationId: ctx.correlationId,
      },
    });
  }
  private invoice(row: any): FinanceInvoiceDto {
    return {
      id: row.id,
      publicId: row.publicId,
      invoiceNumber: row.invoiceNumber,
      correlationId: row.correlationId,
      originDomain: row.originDomain,
      originReferenceId: row.originReferenceId,
      studentReferenceId: row.studentReferenceId,
      payerReferenceId: row.payerReferenceId,
      status: row.status,
      totalAmount: money(row.totalMinorUnits, row.currencyCode, row.scale),
      amountDue: money(row.dueMinorUnits, row.currencyCode, row.scale),
      lineItems: row.lineItems,
      dueDate: row.dueDate,
      issuedAt: row.issuedAt,
      paidAt: row.paidAt,
      voidedAt: row.voidedAt,
      metadata: row.metadata,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
  private paymentCreate(data: CreateFinancePaymentDto) {
    return {
      publicId: data.publicId,
      invoiceId: data.invoiceId,
      idempotencyKeyHash: hash(data.idempotencyKey || data.publicId),
      amountMinorUnits: data.amount.amountMinorUnits,
      currencyCode: data.amount.currencyCode,
      scale: data.amount.scale,
      status: data.status,
      paymentMethod: data.paymentMethod,
      gatewayProvider: data.gatewayProvider,
      gatewayReference: data.gatewayReference,
      failureReason: data.failureReason,
      capturedAt: data.capturedAt,
      safeMaskedMetadata: data.metadata as any,
    };
  }
  private payment(row: any): FinancePaymentDto {
    return {
      id: row.id,
      publicId: row.publicId,
      invoiceId: row.invoiceId,
      idempotencyKey: null,
      amount: money(row.amountMinorUnits, row.currencyCode, row.scale),
      status: row.status,
      paymentMethod: row.paymentMethod,
      gatewayProvider: row.gatewayProvider,
      gatewayReference: row.gatewayReference,
      failureReason: row.failureReason,
      capturedAt: row.capturedAt,
      metadata: row.safeMaskedMetadata,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
  private transaction(row: any) {
    return {
      id: row.id,
      publicId: row.publicId,
      correlationId: row.correlationId,
      businessReferenceType: row.businessReferenceType,
      businessReferenceId: row.businessReferenceId,
      idempotencyKeyHash: row.idempotencyKeyHash,
      currencyCode: row.currencyCode,
      scale: row.scale,
      reversalOfId: row.reversalOfId,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      entries: row.entries.map((entry: any) => ({
        id: entry.id,
        transactionId: entry.transactionId,
        accountId: entry.accountId,
        direction: entry.direction,
        amount: money(entry.amountMinorUnits, entry.currencyCode, entry.scale),
        sequence: entry.sequence,
        memo: entry.memo,
        createdAt: entry.createdAt,
      })),
    };
  }
  private hold(row: any) {
    return {
      id: row.id,
      publicId: row.publicId,
      walletId: row.walletId,
      amount: money(row.amountMinorUnits, row.currencyCode, row.scale),
      status: row.status,
      businessReferenceId: row.businessReferenceId,
      expiresAt: row.expiresAt,
      createdAt: row.createdAt,
      resolvedAt: row.resolvedAt,
    };
  }
  private transfer(row: any) {
    return {
      id: row.id,
      publicId: row.publicId,
      sourceWalletId: row.sourceWalletId,
      destinationReferenceId: row.destinationReferenceId,
      sourceAmount: money(row.sourceAmountMinorUnits, row.sourceCurrencyCode, row.sourceScale),
      targetAmount: row.targetAmountMinorUnits
        ? money(row.targetAmountMinorUnits, row.targetCurrencyCode, row.targetScale)
        : null,
      rateId: row.rateId,
      feeAmount: row.feeAmountMinorUnits
        ? money(row.feeAmountMinorUnits, row.sourceCurrencyCode, row.sourceScale)
        : null,
      status: row.status,
      makerId: row.makerId,
      correlationId: row.correlationId,
      idempotencyKeyHash: row.idempotencyKeyHash,
      version: row.version,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
  private approval(row: any) {
    return {
      id: row.id,
      publicId: row.publicId,
      actionType: row.actionType,
      targetReferenceId: row.targetReferenceId,
      amount: row.amountMinorUnits
        ? money(row.amountMinorUnits, row.currencyCode, row.scale)
        : null,
      makerId: row.makerId,
      requiredApprovals: row.requiredApprovals,
      status: row.status,
      expiresAt: row.expiresAt,
      createdAt: row.createdAt,
      decisions: row.decisions,
    };
  }
  private refund(row: any) {
    return {
      id: row.id,
      publicId: row.publicId,
      paymentId: row.paymentId,
      amount: money(row.amountMinorUnits, row.currencyCode, row.scale),
      reason: row.reason,
      status: row.status,
      makerId: row.makerId,
      approvalId: row.approvalId,
      completedAt: row.completedAt,
      createdAt: row.createdAt,
    };
  }
  private commission(row: any) {
    return {
      id: row.id,
      publicId: row.publicId,
      recipientReferenceId: row.recipientReferenceId,
      sourcePaymentId: row.sourcePaymentId,
      amount: money(row.amountMinorUnits, row.currencyCode, row.scale),
      status: row.status,
      policyReference: row.policyReference,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
