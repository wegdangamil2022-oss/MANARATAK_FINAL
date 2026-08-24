import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ITokenProvider } from '@manaratak/core';
import { FinanceStudentUseCases, StudentWorkspaceUseCases } from '@manaratak/application';
import { StudentCollectionType, StudentSavedItemType } from '@manaratak/domain';
import { AuthMiddleware } from '../../middleware/AuthMiddleware';

export class StudentWorkspaceRouter {
  public static create(cradle: {
    studentWorkspaceUseCases: StudentWorkspaceUseCases;
    financeStudentUseCases: FinanceStudentUseCases;
    tokenProvider: ITokenProvider;
  }): Router {
    const router = Router();
    const { studentWorkspaceUseCases, financeStudentUseCases, tokenProvider } = cradle;

    const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

    const workspaceSchema = z.object({
      expectedVersion: z.number().int().positive().optional(),
      displayName: z.string().nullable().optional(),
      preferredLanguage: z.string().nullable().optional(),
      timezone: z.string().nullable().optional(),
      theme: z.enum(['LIGHT', 'DARK', 'SYSTEM']).nullable().optional(),
      avatarAssetId: z.string().nullable().optional(),
      layoutPreferences: z.record(z.string(), z.unknown()).nullable().optional(),
      notificationMatrix: z
        .object({
          inApp: z.boolean(),
          email: z.boolean(),
          push: z.boolean(),
          learning: z.boolean(),
          certificates: z.boolean(),
          scholarships: z.boolean(),
          payments: z.boolean(),
        })
        .nullable()
        .optional(),
      privacyPreferences: z
        .object({
          retainSearchHistory: z.boolean(),
          allowPersonalization: z.boolean(),
          allowProductAnalytics: z.boolean(),
          publicProfileEnabled: z.boolean(),
        })
        .nullable()
        .optional(),
      accessibilityPreferences: z
        .object({
          textScale: z.enum(['SMALL', 'DEFAULT', 'LARGE']),
          reduceMotion: z.boolean(),
          highContrast: z.boolean(),
        })
        .nullable()
        .optional(),
      metadata: z.record(z.string(), z.unknown()).nullable().optional(),
    });

    const savedItemSchema = z.object({
      entityType: z.nativeEnum(StudentSavedItemType),
      entityId: z.string().min(1),
      collectionId: z.string().uuid().nullable().optional(),
      entitySlug: z.string().nullable().optional(),
      displayName: z.string().nullable().optional(),
      notes: z.string().nullable().optional(),
      metadata: z.record(z.string(), z.unknown()).nullable().optional(),
    });

    const collectionSchema = z.object({
      name: z.string().trim().min(1).max(80),
      description: z.string().trim().max(240).nullable().optional(),
      type: z.nativeEnum(StudentCollectionType).optional(),
      color: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .nullable()
        .optional(),
      icon: z.string().trim().max(40).nullable().optional(),
    });

    router.use(new AuthMiddleware(tokenProvider).generate());
    const ownStudent = (req: Request): string => {
      if (!req.authUserId) throw new Error('STUDENT_AUTHENTICATION_REQUIRED');
      return req.authUserId;
    };

    router.get('/workspace', asyncHandler(async (req: Request, res: Response) => {
      res.json(await studentWorkspaceUseCases.getOrCreateWorkspace(ownStudent(req)));
    }));
    router.put('/workspace', asyncHandler(async (req: Request, res: Response) => {
      res.json(await studentWorkspaceUseCases.upsertWorkspace({ studentReferenceId: ownStudent(req), ...workspaceSchema.parse(req.body) }));
    }));
    router.get('/dashboard', asyncHandler(async (req: Request, res: Response) => {
      res.json(await studentWorkspaceUseCases.getDashboard(ownStudent(req)));
    }));
    router.get('/collections', asyncHandler(async (req: Request, res: Response) => {
      res.json({ data: await studentWorkspaceUseCases.listCollections(ownStudent(req)) });
    }));
    router.post('/collections', asyncHandler(async (req: Request, res: Response) => {
      res.status(201).json(await studentWorkspaceUseCases.createCollection({ studentReferenceId: ownStudent(req), ...collectionSchema.parse(req.body) }));
    }));
    router.patch('/collections/:collectionId', asyncHandler(async (req: Request, res: Response) => {
      res.json(await studentWorkspaceUseCases.updateCollection(ownStudent(req), req.params.collectionId, collectionSchema.partial().omit({ type: true }).parse(req.body)));
    }));
    router.delete('/collections/:collectionId', asyncHandler(async (req: Request, res: Response) => {
      await studentWorkspaceUseCases.deleteCollection(ownStudent(req), req.params.collectionId); res.status(204).send();
    }));
    router.post('/saved-items/:itemId/move', asyncHandler(async (req: Request, res: Response) => {
      const body = z.object({ collectionId: z.string().uuid().nullable() }).parse(req.body);
      res.json(await studentWorkspaceUseCases.moveSavedItem(ownStudent(req), req.params.itemId, body.collectionId));
    }));
    router.get('/recently-viewed', asyncHandler(async (req: Request, res: Response) => {
      res.json({ data: await studentWorkspaceUseCases.listRecentlyViewed(ownStudent(req)) });
    }));
    router.post('/recently-viewed', asyncHandler(async (req: Request, res: Response) => {
      const body = savedItemSchema.pick({ entityType: true, entityId: true, entitySlug: true }).parse(req.body);
      res.status(201).json(await studentWorkspaceUseCases.recordRecentlyViewed({ studentReferenceId: ownStudent(req), ...body }));
    }));
    router.delete('/recently-viewed', asyncHandler(async (req: Request, res: Response) => {
      await studentWorkspaceUseCases.clearRecentlyViewed(ownStudent(req)); res.status(204).send();
    }));
    router.get('/snapshots', asyncHandler(async (req: Request, res: Response) => {
      res.json({ data: await studentWorkspaceUseCases.listSnapshots(ownStudent(req)) });
    }));
    router.post('/snapshots', asyncHandler(async (req: Request, res: Response) => {
      const body = z.object({ label: z.string().max(80).nullable().optional() }).parse(req.body);
      res.status(201).json(await studentWorkspaceUseCases.createSnapshot(ownStudent(req), body.label));
    }));
    router.post('/snapshots/:snapshotId/restore', asyncHandler(async (req: Request, res: Response) => {
      const body = z.object({ expectedVersion: z.number().int().positive() }).parse(req.body);
      res.json(await studentWorkspaceUseCases.restoreSnapshot(ownStudent(req), req.params.snapshotId, body.expectedVersion));
    }));
    router.post('/dashboard/layout/reset', asyncHandler(async (req: Request, res: Response) => {
      const body = z.object({ expectedVersion: z.number().int().positive() }).parse(req.body);
      res.json(await studentWorkspaceUseCases.resetLayout(ownStudent(req), body.expectedVersion));
    }));
    router.delete('/search-history', asyncHandler(async (req: Request, res: Response) => {
      await studentWorkspaceUseCases.clearSearchHistory(ownStudent(req)); res.status(204).send();
    }));

    router.use('/:studentReferenceId', (req: Request, res: Response, next: NextFunction) => {
      if (req.authUserId !== req.params.studentReferenceId) {
        res.status(403).json({ error: 'STUDENT_WORKSPACE_ACCESS_DENIED' });
        return;
      }
      next();
    });

    router.get(
      '/:studentReferenceId/workspace',
      asyncHandler(async (req: Request, res: Response) => {
        res.json(
          await studentWorkspaceUseCases.getOrCreateWorkspace(req.params.studentReferenceId),
        );
      }),
    );

    router.put(
      '/:studentReferenceId/workspace',
      asyncHandler(async (req: Request, res: Response) => {
        const body = workspaceSchema.parse(req.body);
        res.json(
          await studentWorkspaceUseCases.upsertWorkspace({
            studentReferenceId: req.params.studentReferenceId,
            ...body,
          }),
        );
      }),
    );

    router.get(
      '/:studentReferenceId/dashboard',
      asyncHandler(async (req: Request, res: Response) => {
        res.json(await studentWorkspaceUseCases.getDashboard(req.params.studentReferenceId));
      }),
    );

    router.get(
      '/:studentReferenceId/saved-items',
      asyncHandler(async (req: Request, res: Response) => {
        res.json({
          data: await studentWorkspaceUseCases.listSavedItems(req.params.studentReferenceId),
        });
      }),
    );

    router.get(
      '/:studentReferenceId/collections',
      asyncHandler(async (req: Request, res: Response) => {
        res.json({
          data: await studentWorkspaceUseCases.listCollections(req.params.studentReferenceId),
        });
      }),
    );

    router.post(
      '/:studentReferenceId/collections',
      asyncHandler(async (req: Request, res: Response) => {
        const body = collectionSchema.parse(req.body);
        const collection = await studentWorkspaceUseCases.createCollection({
          studentReferenceId: req.params.studentReferenceId,
          ...body,
        });
        res.status(201).json(collection);
      }),
    );

    router.post(
      '/:studentReferenceId/saved-items',
      asyncHandler(async (req: Request, res: Response) => {
        const body = savedItemSchema.parse(req.body);
        const saved = await studentWorkspaceUseCases.saveItem({
          studentReferenceId: req.params.studentReferenceId,
          ...body,
        });
        res.status(201).json(saved);
      }),
    );

    router.delete(
      '/:studentReferenceId/saved-items/:entityType/:entityId',
      asyncHandler(async (req: Request, res: Response) => {
        const entityType = z.nativeEnum(StudentSavedItemType).parse(req.params.entityType);
        await studentWorkspaceUseCases.removeSavedItem(
          req.params.studentReferenceId,
          entityType,
          req.params.entityId,
        );
        res.status(204).send();
      }),
    );

    router.post(
      '/:studentReferenceId/activity',
      asyncHandler(async (req: Request, res: Response) => {
        const body = z
          .object({
            activityType: z.string().trim().min(1).max(60),
            title: z.string().trim().min(1).max(160),
            entityType: z.string().trim().max(60).nullable().optional(),
            entityId: z.string().trim().max(160).nullable().optional(),
            entitySlug: z.string().trim().max(160).nullable().optional(),
            metadata: z.record(z.string(), z.unknown()).nullable().optional(),
          })
          .parse(req.body);
        res.status(201).json(
          await studentWorkspaceUseCases.recordActivity({
            studentReferenceId: req.params.studentReferenceId,
            ...body,
          }),
        );
      }),
    );

    router.post(
      '/:studentReferenceId/search-history',
      asyncHandler(async (req: Request, res: Response) => {
        const { query } = z.object({ query: z.string().trim().min(1).max(160) }).parse(req.body);
        await studentWorkspaceUseCases.recordSearch(req.params.studentReferenceId, query);
        res.status(204).send();
      }),
    );

    router.delete(
      '/:studentReferenceId/search-history',
      asyncHandler(async (req: Request, res: Response) => {
        await studentWorkspaceUseCases.clearSearchHistory(req.params.studentReferenceId);
        res.status(204).send();
      }),
    );

    router.post(
      '/:studentReferenceId/snapshots',
      asyncHandler(async (req: Request, res: Response) => {
        const { label } = z
          .object({ label: z.string().trim().max(80).nullable().optional() })
          .parse(req.body ?? {});
        res
          .status(201)
          .json(
            await studentWorkspaceUseCases.createSnapshot(req.params.studentReferenceId, label),
          );
      }),
    );

    router.get(
      '/:studentReferenceId/finance/invoices',
      asyncHandler(async (req: Request, res: Response) => {
        res.json(await financeStudentUseCases.listStudentInvoices(req.params.studentReferenceId));
      }),
    );

    router.get(
      '/:studentReferenceId/finance/invoices/:invoiceId',
      asyncHandler(async (req: Request, res: Response) => {
        res.json(
          await financeStudentUseCases.getStudentInvoice(
            req.params.studentReferenceId,
            req.params.invoiceId,
          ),
        );
      }),
    );

    router.get(
      '/:studentReferenceId/finance/invoices/:invoiceId/payments',
      asyncHandler(async (req: Request, res: Response) => {
        res.json({
          data: await financeStudentUseCases.listStudentInvoicePayments(
            req.params.studentReferenceId,
            req.params.invoiceId,
          ),
        });
      }),
    );

    router.use((err: any, req: Request, res: Response, next: NextFunction) => {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation Error', details: err.issues });
      }
      const code = err.message || 'An error occurred';
      const status = code.includes('VERSION_CONFLICT')
        ? 409
        : code.includes('SUSPENDED') || code.includes('ARCHIVED')
          ? 423
          : code.includes('NOT_FOUND')
            ? 404
            : 400;
      res.status(status).json({ error: code });
    });

    return router;
  }
}
