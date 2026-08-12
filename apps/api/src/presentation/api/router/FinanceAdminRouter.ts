import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { FinanceAdminUseCases } from '@manaratak/application';
import { InvoiceStatus } from '@manaratak/domain';

const moneySchema = z.object({
  amountMinorUnits: z.string().regex(/^-?\d+$/),
  currencyCode: z.string().regex(/^[A-Z]{3}$/),
  scale: z.number().int().min(0).max(6)
});

const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: moneySchema,
  metadata: z.record(z.string(), z.unknown()).nullable().optional()
});

export class FinanceAdminRouter {
  public static create(cradle: { financeAdminUseCases: FinanceAdminUseCases }): Router {
    const router = Router();
    const { financeAdminUseCases } = cradle;

    const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

    const listQuerySchema = z.object({
      status: z.nativeEnum(InvoiceStatus).optional(),
      originDomain: z.string().optional(),
      originReferenceId: z.string().optional(),
      studentReferenceId: z.string().optional(),
      payerReferenceId: z.string().optional(),
      page: z.string().optional().transform((value) => value ? parseInt(value, 10) : 1),
      pageSize: z.string().optional().transform((value) => value ? Math.min(parseInt(value, 10), 50) : 20)
    });

    const issueInvoiceSchema = z.object({
      correlationId: z.string().nullable().optional(),
      originDomain: z.string().min(1),
      originReferenceId: z.string().min(1),
      studentReferenceId: z.string().nullable().optional(),
      payerReferenceId: z.string().nullable().optional(),
      lineItems: z.array(lineItemSchema).min(1),
      dueDate: z.string().datetime().nullable().optional(),
      metadata: z.record(z.string(), z.unknown()).nullable().optional()
    });

    const recordPaymentSchema = z.object({
      idempotencyKey: z.string().nullable().optional(),
      amount: moneySchema,
      paymentMethod: z.string().min(1),
      gatewayProvider: z.string().nullable().optional(),
      gatewayReference: z.string().nullable().optional(),
      metadata: z.record(z.string(), z.unknown()).nullable().optional()
    });

    router.get('/invoices', asyncHandler(async (req: Request, res: Response) => {
      const filters = listQuerySchema.parse(req.query);
      res.json(await financeAdminUseCases.listInvoices(filters));
    }));

    router.post('/invoices', asyncHandler(async (req: Request, res: Response) => {
      const body = issueInvoiceSchema.parse(req.body);
      res.status(201).json(await financeAdminUseCases.issueInvoice(body));
    }));

    router.get('/invoices/:id', asyncHandler(async (req: Request, res: Response) => {
      res.json(await financeAdminUseCases.getInvoice(req.params.id));
    }));

    router.post('/invoices/:id/void', asyncHandler(async (req: Request, res: Response) => {
      await financeAdminUseCases.voidInvoice(req.params.id);
      res.json({ success: true });
    }));

    router.get('/invoices/:id/payments', asyncHandler(async (req: Request, res: Response) => {
      res.json(await financeAdminUseCases.listPaymentsForInvoice(req.params.id));
    }));

    router.post('/invoices/:id/payments/captured', asyncHandler(async (req: Request, res: Response) => {
      const body = recordPaymentSchema.parse(req.body);
      res.status(201).json(await financeAdminUseCases.recordCapturedPayment({
        invoiceId: req.params.id,
        ...body
      }));
    }));

    router.use((err: any, req: Request, res: Response, next: NextFunction) => {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation Error', details: err.issues });
      }
      res.status(400).json({ error: err.message || 'An error occurred' });
    });

    return router;
  }
}
