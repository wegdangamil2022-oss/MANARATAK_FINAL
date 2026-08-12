import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  FinanceInvoiceDto,
  IFinanceRepository,
  InvoiceStatus,
  PaymentStatus
} from '@manaratak/domain';
import { FinanceAdminUseCases } from '../../src/finance-platform/use-cases/FinanceAdminUseCases';

describe('FinanceAdminUseCases', () => {
  let repository: IFinanceRepository;
  let useCases: FinanceAdminUseCases;

  const issuedInvoice: FinanceInvoiceDto = {
    id: 'inv-1',
    publicId: 'fin_inv_1',
    invoiceNumber: 'INV-1',
    originDomain: 'SERVICES',
    originReferenceId: 'svc-order-1',
    status: InvoiceStatus.ISSUED,
    totalAmount: { amountMinorUnits: '15000', currencyCode: 'USD', scale: 2 },
    amountDue: { amountMinorUnits: '15000', currencyCode: 'USD', scale: 2 },
    lineItems: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    repository = {
      createInvoice: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'inv-1', createdAt: new Date(), updatedAt: new Date(), ...data })),
      findInvoiceById: vi.fn().mockResolvedValue(issuedInvoice),
      findInvoiceByNumber: vi.fn(),
      listInvoices: vi.fn(),
      updateInvoiceStatus: vi.fn(),
      updateInvoiceAmountDue: vi.fn(),
      createPayment: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'pay-1', createdAt: new Date(), updatedAt: new Date(), ...data })),
      findPaymentByIdempotencyKey: vi.fn().mockResolvedValue(null),
      listPaymentsForInvoice: vi.fn(),
      updatePaymentStatus: vi.fn()
    };
    useCases = new FinanceAdminUseCases(repository);
  });

  it('issues an invoice by calculating line totals using integer minor units', async () => {
    const invoice = await useCases.issueInvoice({
      originDomain: 'SERVICES',
      originReferenceId: 'svc-order-1',
      lineItems: [
        {
          description: 'Visa preparation',
          quantity: 2,
          unitPrice: { amountMinorUnits: '7500', currencyCode: 'USD', scale: 2 }
        }
      ]
    });

    expect(invoice.totalAmount.amountMinorUnits).toBe('15000');
    expect(repository.createInvoice).toHaveBeenCalledWith(expect.objectContaining({
      status: InvoiceStatus.ISSUED,
      amountDue: { amountMinorUnits: '15000', currencyCode: 'USD', scale: 2 }
    }));
  });

  it('rejects mixed currencies on invoice creation', async () => {
    await expect(useCases.issueInvoice({
      originDomain: 'SERVICES',
      originReferenceId: 'svc-order-1',
      lineItems: [
        { description: 'A', quantity: 1, unitPrice: { amountMinorUnits: '100', currencyCode: 'USD', scale: 2 } },
        { description: 'B', quantity: 1, unitPrice: { amountMinorUnits: '100', currencyCode: 'YER', scale: 0 } }
      ]
    })).rejects.toThrow('currencyCode');
  });

  it('records captured payment and marks invoice paid when amount due becomes zero', async () => {
    const payment = await useCases.recordCapturedPayment({
      invoiceId: 'inv-1',
      idempotencyKey: 'idem-1',
      amount: { amountMinorUnits: '15000', currencyCode: 'USD', scale: 2 },
      paymentMethod: 'MANUAL_BANK_TRANSFER'
    });

    expect(payment.status).toBe(PaymentStatus.CAPTURED);
    expect(repository.updateInvoiceAmountDue).toHaveBeenCalledWith(
      'inv-1',
      { amountMinorUnits: '0', currencyCode: 'USD', scale: 2 },
      InvoiceStatus.PAID,
      expect.any(Date)
    );
  });

  it('prevents payment amounts greater than amountDue', async () => {
    await expect(useCases.recordCapturedPayment({
      invoiceId: 'inv-1',
      amount: { amountMinorUnits: '15001', currencyCode: 'USD', scale: 2 },
      paymentMethod: 'MANUAL_BANK_TRANSFER'
    })).rejects.toThrow('cannot exceed');
  });
});
