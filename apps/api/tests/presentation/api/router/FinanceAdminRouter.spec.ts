import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { FinanceAdminRouter } from '../../../../src/presentation/api/router/FinanceAdminRouter';

describe('FinanceAdminRouter', () => {
  it('issues invoices through the admin route', async () => {
    const financeAdminUseCases = {
      issueInvoice: vi.fn().mockResolvedValue({ id: 'inv-1', invoiceNumber: 'INV-1' }),
      listInvoices: vi.fn(),
      getInvoice: vi.fn(),
      voidInvoice: vi.fn(),
      recordCapturedPayment: vi.fn(),
      listPaymentsForInvoice: vi.fn()
    };
    const app = express();
    app.use(express.json());
    app.use('/admin/finance', FinanceAdminRouter.create({ financeAdminUseCases: financeAdminUseCases as any }));

    const response = await request(app)
      .post('/admin/finance/invoices')
      .send({
        originDomain: 'SERVICES',
        originReferenceId: 'svc-order-1',
        lineItems: [
          {
            description: 'Visa preparation',
            quantity: 1,
            unitPrice: { amountMinorUnits: '5000', currencyCode: 'USD', scale: 2 }
          }
        ]
      });

    expect(response.status).toBe(201);
    expect(financeAdminUseCases.issueInvoice).toHaveBeenCalledWith(expect.objectContaining({
      originDomain: 'SERVICES'
    }));
  });

  it('rejects malformed money payloads', async () => {
    const financeAdminUseCases = {
      issueInvoice: vi.fn(),
      listInvoices: vi.fn(),
      getInvoice: vi.fn(),
      voidInvoice: vi.fn(),
      recordCapturedPayment: vi.fn(),
      listPaymentsForInvoice: vi.fn()
    };
    const app = express();
    app.use(express.json());
    app.use('/admin/finance', FinanceAdminRouter.create({ financeAdminUseCases: financeAdminUseCases as any }));

    const response = await request(app)
      .post('/admin/finance/invoices')
      .send({
        originDomain: 'SERVICES',
        originReferenceId: 'svc-order-1',
        lineItems: [
          {
            description: 'Visa preparation',
            quantity: 1,
            unitPrice: { amountMinorUnits: '50.25', currencyCode: 'USD', scale: 2 }
          }
        ]
      });

    expect(response.status).toBe(400);
    expect(financeAdminUseCases.issueInvoice).not.toHaveBeenCalled();
  });
});
