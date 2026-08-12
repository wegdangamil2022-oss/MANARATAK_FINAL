import {
  addMoneyAmounts,
  assertSameCurrency,
  assertValidMoneyAmount,
  CreateFinanceInvoiceDto,
  CreateFinancePaymentDto,
  FinanceInvoiceDto,
  FinanceInvoiceFilters,
  FinancePaymentDto,
  IFinanceRepository,
  InvoiceLineItemDto,
  InvoiceStatus,
  multiplyMoneyAmount,
  PaginatedFinanceResult,
  PaymentStatus
} from '@manaratak/domain';

export interface IssueInvoiceInput {
  correlationId?: string | null;
  originDomain: string;
  originReferenceId: string;
  studentReferenceId?: string | null;
  payerReferenceId?: string | null;
  lineItems: Array<Omit<InvoiceLineItemDto, 'totalPrice'>>;
  dueDate?: Date | string | null;
  metadata?: Record<string, unknown> | null;
}

export interface RecordPaymentInput {
  invoiceId: string;
  idempotencyKey?: string | null;
  amount: {
    amountMinorUnits: string;
    currencyCode: string;
    scale: number;
  };
  paymentMethod: string;
  gatewayProvider?: string | null;
  gatewayReference?: string | null;
  metadata?: Record<string, unknown> | null;
}

export class FinanceAdminUseCases {
  constructor(private readonly repository: IFinanceRepository) {}

  public async issueInvoice(input: IssueInvoiceInput): Promise<FinanceInvoiceDto> {
    if (!input.originDomain.trim() || !input.originReferenceId.trim()) {
      throw new Error('originDomain and originReferenceId are required');
    }
    if (!Array.isArray(input.lineItems) || input.lineItems.length === 0) {
      throw new Error('At least one invoice line item is required');
    }

    const lineItems = input.lineItems.map((item) => {
      assertValidMoneyAmount(item.unitPrice);
      const totalPrice = multiplyMoneyAmount(item.unitPrice, item.quantity);
      return {
        ...item,
        totalPrice
      };
    });
    const totalAmount = addMoneyAmounts(lineItems.map((item) => item.totalPrice));

    const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString(36).toUpperCase()}`;

    const data: CreateFinanceInvoiceDto = {
      publicId: `fin_inv_${Date.now().toString(36)}`,
      invoiceNumber,
      correlationId: input.correlationId,
      originDomain: input.originDomain,
      originReferenceId: input.originReferenceId,
      studentReferenceId: input.studentReferenceId,
      payerReferenceId: input.payerReferenceId,
      status: InvoiceStatus.ISSUED,
      totalAmount,
      amountDue: totalAmount,
      lineItems,
      dueDate: input.dueDate,
      issuedAt: new Date(),
      metadata: input.metadata
    };

    return this.repository.createInvoice(data);
  }

  public async listInvoices(filters: FinanceInvoiceFilters): Promise<PaginatedFinanceResult<FinanceInvoiceDto>> {
    return this.repository.listInvoices(filters);
  }

  public async getInvoice(id: string): Promise<FinanceInvoiceDto> {
    const invoice = await this.repository.findInvoiceById(id);
    if (!invoice) {
      throw new Error(`Invoice with id ${id} not found`);
    }
    return invoice;
  }

  public async voidInvoice(id: string): Promise<void> {
    const invoice = await this.getInvoice(id);
    if (invoice.status === InvoiceStatus.PAID) {
      throw new Error('Cannot void a PAID invoice');
    }
    if (invoice.status === InvoiceStatus.VOIDED) {
      return;
    }
    await this.repository.updateInvoiceStatus(id, InvoiceStatus.VOIDED, { voidedAt: new Date() });
  }

  public async recordCapturedPayment(input: RecordPaymentInput): Promise<FinancePaymentDto> {
    const invoice = await this.getInvoice(input.invoiceId);
    if (invoice.status === InvoiceStatus.VOIDED) {
      throw new Error('Cannot record payment against a VOIDED invoice');
    }
    if (invoice.status === InvoiceStatus.PAID) {
      throw new Error('Cannot record payment against an already PAID invoice');
    }

    assertValidMoneyAmount(input.amount);
    assertSameCurrency(invoice.amountDue, input.amount);

    if (BigInt(input.amount.amountMinorUnits) <= BigInt(0)) {
      throw new Error('Payment amount must be greater than zero');
    }
    if (BigInt(input.amount.amountMinorUnits) > BigInt(invoice.amountDue.amountMinorUnits)) {
      throw new Error('Payment amount cannot exceed amountDue');
    }

    if (input.idempotencyKey) {
      const existing = await this.repository.findPaymentByIdempotencyKey(input.idempotencyKey);
      if (existing) {
        return existing;
      }
    }

    const paymentData: CreateFinancePaymentDto = {
      publicId: `fin_pay_${Date.now().toString(36)}`,
      invoiceId: input.invoiceId,
      idempotencyKey: input.idempotencyKey,
      amount: input.amount,
      status: PaymentStatus.CAPTURED,
      paymentMethod: input.paymentMethod,
      gatewayProvider: input.gatewayProvider,
      gatewayReference: input.gatewayReference,
      capturedAt: new Date(),
      metadata: input.metadata
    };

    const payment = await this.repository.createPayment(paymentData);
    const newAmountDueMinorUnits = BigInt(invoice.amountDue.amountMinorUnits) - BigInt(input.amount.amountMinorUnits);
    const nextAmountDue = {
      ...invoice.amountDue,
      amountMinorUnits: newAmountDueMinorUnits.toString()
    };
    const nextStatus = newAmountDueMinorUnits === BigInt(0) ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;

    await this.repository.updateInvoiceAmountDue(
      invoice.id,
      nextAmountDue,
      nextStatus,
      nextStatus === InvoiceStatus.PAID ? new Date() : undefined
    );

    return payment;
  }

  public async listPaymentsForInvoice(invoiceId: string): Promise<FinancePaymentDto[]> {
    await this.getInvoice(invoiceId);
    return this.repository.listPaymentsForInvoice(invoiceId);
  }
}
