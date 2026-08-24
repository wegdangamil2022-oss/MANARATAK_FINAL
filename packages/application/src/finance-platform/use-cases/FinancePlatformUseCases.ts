import { createHash, randomUUID } from 'node:crypto';
import {
  assertCheckerEligible,
  assertSameCurrency,
  assertTransferTransition,
  assertValidMoneyAmount,
  calculateInvoiceLines,
  compareMoneyAmounts,
  convertMoneyExact,
  FinanceMutationContext,
  FinancialEstimateDto,
  IFinanceRepository,
  InvoiceStatus,
  MoneyAmount,
  PaymentStatus,
  TransferStatus,
  validateBalancedPostings,
  validateInstallmentPlan,
} from '@manaratak/domain';

export interface FinanceCommandIdentity {
  actorId: string;
  correlationId?: string;
  idempotencyKey: string;
  reason?: string;
}
const context = (identity: FinanceCommandIdentity): FinanceMutationContext => {
  if (!identity.actorId.trim()) throw new Error('Authenticated actor is required');
  if (!identity.idempotencyKey.trim()) throw new Error('Idempotency key is required');
  return { ...identity, correlationId: identity.correlationId?.trim() || randomUUID() };
};
const hash = (value: string) => createHash('sha256').update(value).digest('hex');

export class FinancePlatformUseCases {
  constructor(private readonly repository: IFinanceRepository) {}

  async postLedger(
    input: {
      businessReferenceType: string;
      businessReferenceId: string;
      postings: Parameters<typeof validateBalancedPostings>[0];
    },
    identity: FinanceCommandIdentity,
  ) {
    validateBalancedPostings(input.postings);
    return this.repository.postLedgerTransaction({
      ...context(identity),
      ...input,
      postings: [...input.postings],
    });
  }

  async createFinancialAccount(
    input: {
      publicId?: string;
      ownerReferenceId: string;
      type: 'ASSET' | 'LIABILITY' | 'REVENUE' | 'EXPENSE' | 'EQUITY';
      currencyCode: string;
      scale: number;
    },
    identity: FinanceCommandIdentity,
  ) {
    return this.repository.createFinancialAccount(
      {
        publicId: input.publicId || `fin_account_${randomUUID()}`,
        ownerReferenceId: input.ownerReferenceId,
        type: input.type,
        currencyCode: input.currencyCode,
        scale: input.scale,
        active: true,
      },
      context(identity),
    );
  }

  async createWallet(
    input: { ownerReferenceId: string; accountId: string; currencyCode: string; scale: number },
    identity: FinanceCommandIdentity,
  ) {
    return this.repository.createWallet(
      { publicId: `fin_wallet_${randomUUID()}`, ...input, status: 'ACTIVE' },
      context(identity),
    );
  }

  async reverseLedger(transactionId: string, identity: FinanceCommandIdentity) {
    return this.repository.reverseLedgerTransaction(transactionId, context(identity));
  }

  async createDraftInvoice(
    input: {
      originDomain: string;
      originReferenceId: string;
      studentReferenceId?: string | null;
      payerReferenceId?: string | null;
      lineItems: Array<{
        description: string;
        quantity: number;
        unitPrice: MoneyAmount;
        metadata?: Record<string, unknown> | null;
      }>;
      dueDate?: Date | string | null;
    },
    identity: FinanceCommandIdentity,
  ) {
    if (!input.originDomain.trim() || !input.originReferenceId.trim())
      throw new Error('Origin reference is required');
    const calculated = calculateInvoiceLines(input.lineItems);
    return this.repository.createDraftInvoice(
      {
        publicId: `fin_inv_${randomUUID()}`,
        invoiceNumber: `DRAFT-${randomUUID()}`,
        originDomain: input.originDomain,
        originReferenceId: input.originReferenceId,
        studentReferenceId: input.studentReferenceId,
        payerReferenceId: input.payerReferenceId,
        totalAmount: calculated.total,
        amountDue: calculated.total,
        lineItems: calculated.lines,
        dueDate: input.dueDate,
      },
      context(identity),
    );
  }

  async updateDraftInvoice(
    invoiceId: string,
    lineItems: Array<{
      description: string;
      quantity: number;
      unitPrice: MoneyAmount;
      metadata?: Record<string, unknown> | null;
    }>,
    identity: FinanceCommandIdentity,
  ) {
    const invoice = await this.requireInvoice(invoiceId);
    if (invoice.status !== InvoiceStatus.DRAFT)
      throw new Error('Only DRAFT invoices can be edited');
    const calculated = calculateInvoiceLines(lineItems);
    return this.repository.updateDraftInvoice(
      invoiceId,
      calculated.lines,
      calculated.total,
      context(identity),
    );
  }

  async issueInvoice(invoiceId: string, identity: FinanceCommandIdentity) {
    const invoice = await this.requireInvoice(invoiceId);
    if (invoice.status !== InvoiceStatus.DRAFT)
      throw new Error('Only DRAFT invoices can be issued');
    if (invoice.dueDate && new Date(invoice.dueDate).getTime() <= Date.now())
      throw new Error('Invoice due date must be in the future');
    return this.repository.issueDraftInvoice(invoiceId, context(identity));
  }

  async voidInvoice(invoiceId: string, identity: FinanceCommandIdentity) {
    const invoice = await this.requireInvoice(invoiceId);
    if (
      ![InvoiceStatus.DRAFT, InvoiceStatus.ISSUED, InvoiceStatus.OVERDUE].includes(invoice.status)
    ) {
      throw new Error('Invoice cannot be voided after payment');
    }
    return this.repository.voidInvoiceAtomic(invoiceId, context(identity));
  }

  async capturePayment(
    input: {
      invoiceId: string;
      amount: MoneyAmount;
      paymentMethodToken: string;
      gatewayProvider?: string | null;
      gatewayReference?: string | null;
    },
    identity: FinanceCommandIdentity,
  ) {
    const invoice = await this.requireInvoice(input.invoiceId);
    if (
      ![InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE].includes(
        invoice.status,
      )
    )
      throw new Error('Invoice is not payable');
    assertValidMoneyAmount(input.amount);
    assertSameCurrency(invoice.amountDue, input.amount);
    if (
      BigInt(input.amount.amountMinorUnits) <= BigInt(0) ||
      compareMoneyAmounts(input.amount, invoice.amountDue) === 1
    )
      throw new Error('Payment amount must be positive and cannot exceed amountDue');
    if (/\b(?:\d[ -]*?){13,19}\b/.test(input.paymentMethodToken))
      throw new Error('Raw card PAN is forbidden; provide a provider token');
    return this.repository.recordCapturedPaymentAtomic(
      {
        publicId: `fin_pay_${randomUUID()}`,
        invoiceId: input.invoiceId,
        idempotencyKey: hash(identity.idempotencyKey),
        amount: input.amount,
        status: PaymentStatus.CAPTURED,
        paymentMethod: 'PROVIDER_TOKEN',
        gatewayProvider: input.gatewayProvider,
        gatewayReference: input.gatewayReference,
        capturedAt: new Date(),
      },
      context(identity),
    );
  }

  async createWalletHold(
    input: { walletId: string; amount: MoneyAmount; businessReferenceId: string },
    identity: FinanceCommandIdentity,
  ) {
    assertValidMoneyAmount(input.amount);
    if (BigInt(input.amount.amountMinorUnits) <= BigInt(0))
      throw new Error('Hold must be positive');
    return this.repository.createWalletHold(
      input.walletId,
      input.amount,
      input.businessReferenceId,
      context(identity),
    );
  }
  async resolveWalletHold(
    holdId: string,
    action: 'RELEASE' | 'CAPTURE',
    identity: FinanceCommandIdentity,
  ) {
    return this.repository.resolveWalletHold(holdId, action, context(identity));
  }

  async convert(input: {
    amount: MoneyAmount;
    targetCurrencyCode: string;
    targetScale: number;
    at?: Date;
  }) {
    const rate = await this.repository.findEffectiveExchangeRate(
      input.amount.currencyCode,
      input.targetCurrencyCode,
      input.at ?? new Date(),
    );
    if (!rate) throw new Error('No approved effective exchange rate; conversion failed closed');
    return {
      amount: convertMoneyExact(
        input.amount,
        input.targetCurrencyCode,
        input.targetScale,
        rate.rateNumerator,
        rate.rateDenominator,
        rate.marginBasisPoints,
      ),
      rate,
    };
  }

  async transitionTransfer(id: string, to: TransferStatus, identity: FinanceCommandIdentity) {
    const transfer = await this.repository.getTransfer(id);
    if (!transfer) throw new Error('Transfer not found');
    assertTransferTransition(transfer.status, to);
    if (to === 'APPROVED') {
      const approvals = await this.repository.listApprovals('APPROVED');
      if (
        !approvals.some(
          (item) =>
            item.targetReferenceId === transfer.id || item.targetReferenceId === transfer.publicId,
        )
      )
        throw new Error('Transfer requires completed maker-checker approval');
    }
    return this.repository.transitionTransfer(id, to, context(identity));
  }

  async requestTransfer(
    input: { sourceWalletId: string; destinationReferenceId: string; sourceAmount: MoneyAmount },
    identity: FinanceCommandIdentity,
  ) {
    assertValidMoneyAmount(input.sourceAmount);
    if (BigInt(input.sourceAmount.amountMinorUnits) <= BigInt(0))
      throw new Error('Transfer amount must be positive');
    return this.repository.createTransfer(
      {
        publicId: `fin_transfer_${randomUUID()}`,
        sourceWalletId: input.sourceWalletId,
        destinationReferenceId: input.destinationReferenceId,
        sourceAmount: input.sourceAmount,
        status: 'REQUESTED',
        makerId: identity.actorId,
        correlationId: identity.correlationId || randomUUID(),
        idempotencyKeyHash: hash(identity.idempotencyKey),
      },
      context(identity),
    );
  }

  async createApproval(
    input: {
      actionType: string;
      targetReferenceId: string;
      amount?: MoneyAmount;
      requiredApprovals: number;
      expiresAt?: Date;
    },
    identity: FinanceCommandIdentity,
  ) {
    if (!Number.isInteger(input.requiredApprovals) || input.requiredApprovals < 1)
      throw new Error('At least one checker is required');
    return this.repository.createApproval(
      {
        publicId: `fin_approval_${randomUUID()}`,
        ...input,
        makerId: identity.actorId,
        status: 'PENDING',
      },
      context(identity),
    );
  }

  async saveExchangeRate(
    input: {
      sourceCurrencyCode: string;
      targetCurrencyCode: string;
      rateNumerator: string;
      rateDenominator: string;
      source: 'MANUAL_OVERRIDE' | 'AUTOMATIC_PROVIDER';
      providerReference?: string;
      approved: boolean;
      effectiveFrom: Date;
      effectiveTo?: Date;
      marginBasisPoints?: number;
    },
    identity: FinanceCommandIdentity,
  ) {
    if (input.source === 'MANUAL_OVERRIDE' && !identity.reason?.trim())
      throw new Error('Manual exchange override reason is required');
    return this.repository.saveExchangeRate(
      {
        publicId: `fin_rate_${randomUUID()}`,
        ...input,
        marginBasisPoints: input.marginBasisPoints || 0,
      },
      context(identity),
    );
  }

  async accrueCommission(
    input: {
      recipientReferenceId: string;
      sourcePaymentId: string;
      amount: MoneyAmount;
      policyReference: string;
    },
    identity: FinanceCommandIdentity,
  ) {
    assertValidMoneyAmount(input.amount);
    return this.repository.createCommission(
      { publicId: `fin_commission_${randomUUID()}`, ...input, status: 'ACCRUED' },
      context(identity),
    );
  }

  async decideApproval(
    id: string,
    decision: 'APPROVE' | 'REJECT',
    checkerId: string,
    reason: string | undefined,
    identity: FinanceCommandIdentity,
  ) {
    const approvals = await this.repository.listApprovals();
    const approval = approvals.find((item) => item.id === id || item.publicId === id);
    if (!approval) throw new Error('Approval not found');
    assertCheckerEligible(approval.makerId, checkerId, approval.decisions);
    if (decision === 'REJECT' && !reason?.trim()) throw new Error('Reject reason is required');
    return this.repository.decideApproval(id, decision, checkerId, reason, context(identity));
  }

  async createRefund(
    input: { paymentId: string; amount: MoneyAmount; reason: string },
    identity: FinanceCommandIdentity,
  ) {
    assertValidMoneyAmount(input.amount);
    if (!input.reason.trim()) throw new Error('Refund reason is required');
    if (BigInt(input.amount.amountMinorUnits) <= BigInt(0))
      throw new Error('Refund amount must be positive');
    return this.repository.createRefund(
      {
        publicId: `fin_ref_${randomUUID()}`,
        paymentId: input.paymentId,
        amount: input.amount,
        reason: input.reason,
        status: 'PENDING_APPROVAL',
        makerId: identity.actorId,
      },
      context(identity),
    );
  }

  async createInstallments(
    invoiceId: string,
    installments: Array<{ amount: MoneyAmount; dueDate: Date | string }>,
    identity: FinanceCommandIdentity,
  ) {
    const invoice = await this.requireInvoice(invoiceId);
    validateInstallmentPlan(invoice.totalAmount, installments);
    return this.repository.createInstallmentPlan(
      invoiceId,
      {
        invoiceId,
        totalAmount: invoice.totalAmount,
        status: 'ACTIVE',
        installments: installments.map((item) => ({
          id: randomUUID(),
          ...item,
          status: 'PENDING',
        })),
      },
      context(identity),
    );
  }

  async createCreditNote(
    invoiceId: string,
    amount: MoneyAmount,
    reason: string,
    identity: FinanceCommandIdentity,
  ) {
    if (!reason.trim()) throw new Error('Credit note reason is required');
    assertValidMoneyAmount(amount);
    return this.repository.createCreditNote(invoiceId, amount, reason, context(identity));
  }

  async generateEstimate(input: {
    subjectReferenceId?: string;
    displayCurrencyCode: string;
    displayScale: number;
    lines: Array<{
      category: string;
      amount: MoneyAmount;
      sourceReference: string;
      certainty: 'EXACT' | 'ESTIMATED';
    }>;
  }): Promise<FinancialEstimateDto> {
    if (!input.lines.length) throw new Error('Estimate requires canonical source lines');
    const converted = await Promise.all(
      input.lines.map(async (line) =>
        line.amount.currencyCode === input.displayCurrencyCode
          ? { ...line, convertedAmount: line.amount }
          : (() =>
              this.convert({
                amount: line.amount,
                targetCurrencyCode: input.displayCurrencyCode,
                targetScale: input.displayScale,
              }).then(({ amount, rate }) => ({
                ...line,
                convertedAmount: amount,
                rateId: rate.id,
              })))(),
      ),
    );
    const total = converted.reduce(
      (sum, line) => sum + BigInt(line.convertedAmount.amountMinorUnits),
      BigInt(0),
    );
    return this.repository.saveEstimate({
      publicId: `fin_est_${randomUUID()}`,
      subjectReferenceId: input.subjectReferenceId,
      displayCurrencyCode: input.displayCurrencyCode,
      lines: converted,
      total: {
        amountMinorUnits: total.toString(),
        currencyCode: input.displayCurrencyCode,
        scale: input.displayScale,
      },
    });
  }

  listTransfers() {
    return this.repository.listTransfers();
  }
  listRates() {
    return this.repository.listExchangeRates();
  }
  listApprovals(status?: string) {
    return this.repository.listApprovals(status);
  }
  listRefunds() {
    return this.repository.listRefunds();
  }
  listCommissions() {
    return this.repository.listCommissions();
  }
  overview() {
    return this.repository.getFinanceOverview();
  }
  report() {
    return this.repository.getFinancialReport();
  }
  reconcile() {
    return this.repository.runReconciliation();
  }
  private async requireInvoice(id: string) {
    const invoice = await this.repository.findInvoiceById(id);
    if (!invoice) throw new Error('Invoice not found');
    return invoice;
  }
}
