import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  FinanceAdminUseCases,
  FinanceCommandIdentity,
  FinancePlatformUseCases,
} from '@manaratak/application';
import { InvoiceStatus, TransferStatus } from '@manaratak/domain';

const moneySchema = z.object({
  amountMinorUnits: z.string().regex(/^-?\d+$/),
  currencyCode: z.string().regex(/^[A-Z]{3}$/),
  scale: z.number().int().min(0).max(6),
});

const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: moneySchema,
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export class FinanceAdminRouter {
  public static create(cradle: {
    financeAdminUseCases: FinanceAdminUseCases;
    financePlatformUseCases: FinancePlatformUseCases;
  }): Router {
    const router = Router();
    const { financeAdminUseCases } = cradle;
    const { financePlatformUseCases } = cradle;
    const identity = (req: Request): FinanceCommandIdentity => {
      if (!req.authUserId) throw new Error('Authenticated finance actor is required');
      return {
        actorId: req.authUserId,
        correlationId: String(req.headers['x-correlation-id'] || ''),
        idempotencyKey: String(req.headers['idempotency-key'] || ''),
        reason: typeof req.body?.reason === 'string' ? req.body.reason : undefined,
      };
    };

    const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

    const listQuerySchema = z.object({
      status: z.nativeEnum(InvoiceStatus).optional(),
      originDomain: z.string().optional(),
      originReferenceId: z.string().optional(),
      studentReferenceId: z.string().optional(),
      payerReferenceId: z.string().optional(),
      page: z
        .string()
        .optional()
        .transform((value) => (value ? parseInt(value, 10) : 1)),
      pageSize: z
        .string()
        .optional()
        .transform((value) => (value ? Math.min(parseInt(value, 10), 50) : 20)),
    });

    const issueInvoiceSchema = z.object({
      correlationId: z.string().nullable().optional(),
      originDomain: z.string().min(1),
      originReferenceId: z.string().min(1),
      studentReferenceId: z.string().nullable().optional(),
      payerReferenceId: z.string().nullable().optional(),
      lineItems: z.array(lineItemSchema).min(1),
      dueDate: z.string().datetime().nullable().optional(),
      metadata: z.record(z.string(), z.unknown()).nullable().optional(),
    });

    const recordPaymentSchema = z.object({
      idempotencyKey: z.string().nullable().optional(),
      amount: moneySchema,
      paymentMethod: z.string().min(1),
      gatewayProvider: z.string().nullable().optional(),
      gatewayReference: z.string().nullable().optional(),
      metadata: z.record(z.string(), z.unknown()).nullable().optional(),
    });

    router.get(
      '/invoices',
      asyncHandler(async (req: Request, res: Response) => {
        const filters = listQuerySchema.parse(req.query);
        res.json(await financeAdminUseCases.listInvoices(filters));
      }),
    );

    router.post(
      '/invoices',
      asyncHandler(async (req: Request, res: Response) => {
        const body = issueInvoiceSchema.parse(req.body);
        res.status(201).json(await financePlatformUseCases.createDraftInvoice(body, identity(req)));
      }),
    );

    router.put(
      '/invoices/:id/items',
      asyncHandler(async (req: Request, res: Response) => {
        const body = z.object({ lineItems: z.array(lineItemSchema).min(1) }).parse(req.body);
        res.json(
          await financePlatformUseCases.updateDraftInvoice(
            req.params.id,
            body.lineItems,
            identity(req),
          ),
        );
      }),
    );

    router.post(
      '/invoices/:id/issue',
      asyncHandler(async (req: Request, res: Response) => {
        res.json(await financePlatformUseCases.issueInvoice(req.params.id, identity(req)));
      }),
    );

    router.post(
      '/invoices/:id/installment-plans',
      asyncHandler(async (req: Request, res: Response) => {
        const body = z
          .object({
            installments: z
              .array(z.object({ amount: moneySchema, dueDate: z.coerce.date() }))
              .min(1),
          })
          .parse(req.body);
        res
          .status(201)
          .json(
            await financePlatformUseCases.createInstallments(
              req.params.id,
              body.installments,
              identity(req),
            ),
          );
      }),
    );
    router.post(
      '/invoices/:id/credit-notes',
      asyncHandler(async (req: Request, res: Response) => {
        const body = z.object({ amount: moneySchema, reason: z.string().min(3) }).parse(req.body);
        res
          .status(201)
          .json(
            await financePlatformUseCases.createCreditNote(
              req.params.id,
              body.amount,
              body.reason,
              identity(req),
            ),
          );
      }),
    );

    router.get(
      '/invoices/:id',
      asyncHandler(async (req: Request, res: Response) => {
        res.json(await financeAdminUseCases.getInvoice(req.params.id));
      }),
    );

    router.post(
      '/invoices/:id/void',
      asyncHandler(async (req: Request, res: Response) => {
        res.json(await financePlatformUseCases.voidInvoice(req.params.id, identity(req)));
      }),
    );

    router.get(
      '/invoices/:id/payments',
      asyncHandler(async (req: Request, res: Response) => {
        res.json(await financeAdminUseCases.listPaymentsForInvoice(req.params.id));
      }),
    );

    router.post(
      '/invoices/:id/payments/captured',
      asyncHandler(async (req: Request, res: Response) => {
        const body = recordPaymentSchema.parse(req.body);
        if (!body.idempotencyKey && !req.headers['idempotency-key'])
          throw new Error('Idempotency-Key header is required');
        res.status(201).json(
          await financePlatformUseCases.capturePayment(
            {
              invoiceId: req.params.id,
              amount: body.amount,
              paymentMethodToken: body.paymentMethod,
              gatewayProvider: body.gatewayProvider,
              gatewayReference: body.gatewayReference,
            },
            {
              ...identity(req),
              idempotencyKey: String(req.headers['idempotency-key'] || body.idempotencyKey),
            },
          ),
        );
      }),
    );

    router.get(
      '/overview',
      asyncHandler(async (_req: Request, res: Response) =>
        res.json(await financePlatformUseCases.overview()),
      ),
    );
    router.post(
      '/accounts',
      asyncHandler(async (req: Request, res: Response) => {
        const body = z
          .object({
            ownerReferenceId: z.string().min(1),
            type: z.enum(['ASSET', 'LIABILITY', 'REVENUE', 'EXPENSE', 'EQUITY']),
            currencyCode: z.string().regex(/^[A-Z]{3}$/),
            scale: z.number().int().min(0).max(6),
          })
          .parse(req.body);
        res
          .status(201)
          .json(await financePlatformUseCases.createFinancialAccount(body, identity(req)));
      }),
    );
    router.post(
      '/ledger/transactions',
      asyncHandler(async (req: Request, res: Response) => {
        const body = z
          .object({
            businessReferenceType: z.string().min(1),
            businessReferenceId: z.string().min(1),
            postings: z
              .array(
                z.object({
                  accountId: z.string().min(1),
                  direction: z.enum(['DEBIT', 'CREDIT']),
                  amount: moneySchema,
                  memo: z.string().optional(),
                }),
              )
              .min(2),
          })
          .parse(req.body);
        res.status(201).json(await financePlatformUseCases.postLedger(body, identity(req)));
      }),
    );
    router.post(
      '/ledger/transactions/:id/reverse',
      asyncHandler(async (req: Request, res: Response) =>
        res
          .status(201)
          .json(await financePlatformUseCases.reverseLedger(req.params.id, identity(req))),
      ),
    );
    router.post(
      '/wallets',
      asyncHandler(async (req: Request, res: Response) => {
        const body = z
          .object({
            ownerReferenceId: z.string().min(1),
            accountId: z.string().min(1),
            currencyCode: z.string().regex(/^[A-Z]{3}$/),
            scale: z.number().int().min(0).max(6),
          })
          .parse(req.body);
        res.status(201).json(await financePlatformUseCases.createWallet(body, identity(req)));
      }),
    );
    router.post(
      '/wallets/:id/holds',
      asyncHandler(async (req: Request, res: Response) => {
        const body = z
          .object({ amount: moneySchema, businessReferenceId: z.string().min(1) })
          .parse(req.body);
        res
          .status(201)
          .json(
            await financePlatformUseCases.createWalletHold(
              { walletId: req.params.id, ...body },
              identity(req),
            ),
          );
      }),
    );
    router.post(
      '/wallet-holds/:id/release',
      asyncHandler(async (req: Request, res: Response) =>
        res.json(
          await financePlatformUseCases.resolveWalletHold(req.params.id, 'RELEASE', identity(req)),
        ),
      ),
    );
    router.post(
      '/wallet-holds/:id/capture',
      asyncHandler(async (req: Request, res: Response) =>
        res.json(
          await financePlatformUseCases.resolveWalletHold(req.params.id, 'CAPTURE', identity(req)),
        ),
      ),
    );
    router.get(
      '/transfers',
      asyncHandler(async (_req: Request, res: Response) =>
        res.json(await financePlatformUseCases.listTransfers()),
      ),
    );
    router.post(
      '/transfers',
      asyncHandler(async (req: Request, res: Response) => {
        const body = z
          .object({
            sourceWalletId: z.string().min(1),
            destinationReferenceId: z.string().min(1),
            sourceAmount: moneySchema,
          })
          .parse(req.body);
        res.status(201).json(await financePlatformUseCases.requestTransfer(body, identity(req)));
      }),
    );
    router.post(
      '/transfers/:id/transitions',
      asyncHandler(async (req: Request, res: Response) => {
        const body = z
          .object({
            status: z.enum([
              'REQUESTED',
              'VALIDATED',
              'RATE_LOCKED',
              'FEES_CALCULATED',
              'PENDING_APPROVAL',
              'APPROVED',
              'PROCESSING',
              'SETTLED',
              'COMPLETED',
              'REJECTED',
              'FAILED',
              'CANCELLED',
              'REVERSED',
            ]),
          })
          .parse(req.body);
        res.json(
          await financePlatformUseCases.transitionTransfer(
            req.params.id,
            body.status as TransferStatus,
            identity(req),
          ),
        );
      }),
    );
    router.get(
      '/exchange-rates',
      asyncHandler(async (_req: Request, res: Response) =>
        res.json(await financePlatformUseCases.listRates()),
      ),
    );
    router.post(
      '/exchange-rates',
      asyncHandler(async (req: Request, res: Response) => {
        const body = z
          .object({
            sourceCurrencyCode: z.string().regex(/^[A-Z]{3}$/),
            targetCurrencyCode: z.string().regex(/^[A-Z]{3}$/),
            rateNumerator: z.string().regex(/^\d+$/),
            rateDenominator: z.string().regex(/^[1-9]\d*$/),
            source: z.enum(['MANUAL_OVERRIDE', 'AUTOMATIC_PROVIDER']),
            providerReference: z.string().optional(),
            approved: z.boolean(),
            effectiveFrom: z.coerce.date(),
            effectiveTo: z.coerce.date().optional(),
            marginBasisPoints: z.number().int().min(0).max(10000).optional(),
            reason: z.string().optional(),
          })
          .parse(req.body);
        res.status(201).json(
          await financePlatformUseCases.saveExchangeRate(body, {
            ...identity(req),
            reason: body.reason,
          }),
        );
      }),
    );
    router.get(
      '/approvals',
      asyncHandler(async (req: Request, res: Response) =>
        res.json(
          await financePlatformUseCases.listApprovals(
            typeof req.query.status === 'string' ? req.query.status : undefined,
          ),
        ),
      ),
    );
    router.post(
      '/approvals',
      asyncHandler(async (req: Request, res: Response) => {
        const body = z
          .object({
            actionType: z.string().min(1),
            targetReferenceId: z.string().min(1),
            amount: moneySchema.optional(),
            requiredApprovals: z.number().int().min(1).max(5),
            expiresAt: z.coerce.date().optional(),
          })
          .parse(req.body);
        res.status(201).json(await financePlatformUseCases.createApproval(body, identity(req)));
      }),
    );
    router.post(
      '/approvals/:id/decisions',
      asyncHandler(async (req: Request, res: Response) => {
        const body = z
          .object({ decision: z.enum(['APPROVE', 'REJECT']), reason: z.string().optional() })
          .parse(req.body);
        const commandIdentity = identity(req);
        res.json(
          await financePlatformUseCases.decideApproval(
            req.params.id,
            body.decision,
            commandIdentity.actorId,
            body.reason,
            commandIdentity,
          ),
        );
      }),
    );
    router.get(
      '/refunds',
      asyncHandler(async (_req: Request, res: Response) =>
        res.json(await financePlatformUseCases.listRefunds()),
      ),
    );
    router.post(
      '/refunds',
      asyncHandler(async (req: Request, res: Response) => {
        const body = z
          .object({ paymentId: z.string().min(1), amount: moneySchema, reason: z.string().min(3) })
          .parse(req.body);
        res.status(201).json(await financePlatformUseCases.createRefund(body, identity(req)));
      }),
    );
    router.get(
      '/commissions',
      asyncHandler(async (_req: Request, res: Response) =>
        res.json(await financePlatformUseCases.listCommissions()),
      ),
    );
    router.post(
      '/commissions',
      asyncHandler(async (req: Request, res: Response) => {
        const body = z
          .object({
            recipientReferenceId: z.string().min(1),
            sourcePaymentId: z.string().min(1),
            amount: moneySchema,
            policyReference: z.string().min(1),
          })
          .parse(req.body);
        res.status(201).json(await financePlatformUseCases.accrueCommission(body, identity(req)));
      }),
    );
    router.post(
      '/estimates',
      asyncHandler(async (req: Request, res: Response) => {
        const body = z
          .object({
            subjectReferenceId: z.string().optional(),
            displayCurrencyCode: z.string().regex(/^[A-Z]{3}$/),
            displayScale: z.number().int().min(0).max(6),
            lines: z
              .array(
                z.object({
                  category: z.string().min(1),
                  amount: moneySchema,
                  sourceReference: z.string().min(1),
                  certainty: z.enum(['EXACT', 'ESTIMATED']),
                }),
              )
              .min(1),
          })
          .parse(req.body);
        res.status(201).json(await financePlatformUseCases.generateEstimate(body));
      }),
    );
    router.post(
      '/reconciliation/run',
      asyncHandler(async (_req: Request, res: Response) =>
        res.json({ issues: await financePlatformUseCases.reconcile() }),
      ),
    );
    router.get(
      '/reports',
      asyncHandler(async (_req: Request, res: Response) =>
        res.json(await financePlatformUseCases.report()),
      ),
    );

    router.use((err: any, req: Request, res: Response, next: NextFunction) => {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation Error', details: err.issues });
      }
      res.status(400).json({ error: err.message || 'An error occurred' });
    });

    return router;
  }
}
