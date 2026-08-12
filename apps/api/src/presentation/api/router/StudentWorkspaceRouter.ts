import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { FinanceStudentUseCases, StudentWorkspaceUseCases } from '@manaratak/application';
import { StudentSavedItemType, StudentWorkspaceStatus } from '@manaratak/domain';

export class StudentWorkspaceRouter {
  public static create(cradle: { studentWorkspaceUseCases: StudentWorkspaceUseCases; financeStudentUseCases: FinanceStudentUseCases }): Router {
    const router = Router();
    const { studentWorkspaceUseCases, financeStudentUseCases } = cradle;

    const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

    const workspaceSchema = z.object({
      displayName: z.string().nullable().optional(),
      preferredLanguage: z.string().nullable().optional(),
      avatarAssetId: z.string().nullable().optional(),
      status: z.nativeEnum(StudentWorkspaceStatus).optional(),
      layoutPreferences: z.record(z.string(), z.unknown()).nullable().optional(),
      notificationMatrix: z.record(z.string(), z.unknown()).nullable().optional(),
      metadata: z.record(z.string(), z.unknown()).nullable().optional()
    });

    const savedItemSchema = z.object({
      entityType: z.nativeEnum(StudentSavedItemType),
      entityId: z.string().min(1),
      entitySlug: z.string().nullable().optional(),
      displayName: z.string().nullable().optional(),
      notes: z.string().nullable().optional(),
      metadata: z.record(z.string(), z.unknown()).nullable().optional()
    });

    router.get('/:studentReferenceId/workspace', asyncHandler(async (req: Request, res: Response) => {
      res.json(await studentWorkspaceUseCases.getOrCreateWorkspace(req.params.studentReferenceId));
    }));

    router.put('/:studentReferenceId/workspace', asyncHandler(async (req: Request, res: Response) => {
      const body = workspaceSchema.parse(req.body);
      res.json(await studentWorkspaceUseCases.upsertWorkspace({
        studentReferenceId: req.params.studentReferenceId,
        ...body
      }));
    }));

    router.get('/:studentReferenceId/dashboard', asyncHandler(async (req: Request, res: Response) => {
      res.json(await studentWorkspaceUseCases.getDashboard(req.params.studentReferenceId));
    }));

    router.get('/:studentReferenceId/saved-items', asyncHandler(async (req: Request, res: Response) => {
      res.json({ data: await studentWorkspaceUseCases.listSavedItems(req.params.studentReferenceId) });
    }));

    router.post('/:studentReferenceId/saved-items', asyncHandler(async (req: Request, res: Response) => {
      const body = savedItemSchema.parse(req.body);
      const saved = await studentWorkspaceUseCases.saveItem({
        studentReferenceId: req.params.studentReferenceId,
        ...body
      });
      res.status(201).json(saved);
    }));

    router.delete('/:studentReferenceId/saved-items/:entityType/:entityId', asyncHandler(async (req: Request, res: Response) => {
      const entityType = z.nativeEnum(StudentSavedItemType).parse(req.params.entityType);
      await studentWorkspaceUseCases.removeSavedItem(req.params.studentReferenceId, entityType, req.params.entityId);
      res.status(204).send();
    }));

    router.get('/:studentReferenceId/finance/invoices', asyncHandler(async (req: Request, res: Response) => {
      res.json(await financeStudentUseCases.listStudentInvoices(req.params.studentReferenceId));
    }));

    router.get('/:studentReferenceId/finance/invoices/:invoiceId', asyncHandler(async (req: Request, res: Response) => {
      res.json(await financeStudentUseCases.getStudentInvoice(req.params.studentReferenceId, req.params.invoiceId));
    }));

    router.get('/:studentReferenceId/finance/invoices/:invoiceId/payments', asyncHandler(async (req: Request, res: Response) => {
      res.json({ data: await financeStudentUseCases.listStudentInvoicePayments(req.params.studentReferenceId, req.params.invoiceId) });
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
