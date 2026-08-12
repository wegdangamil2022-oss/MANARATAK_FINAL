import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { StudentToolRegistryUseCases } from '@manaratak/application';
import {
  StudentToolAiDependencyLevel,
  StudentToolExecutionType,
  StudentToolImplementationPriority,
  StudentToolVisibilityStatus
} from '@manaratak/domain';

export class StudentToolsAdminRouter {
  public static create(cradle: { studentToolRegistryUseCases: StudentToolRegistryUseCases }): Router {
    const router = Router();
    const { studentToolRegistryUseCases } = cradle;

    const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

    const querySchema = z.object({
      category: z.string().optional(),
      visibilityStatus: z.nativeEnum(StudentToolVisibilityStatus).optional(),
      implementationPriority: z.nativeEnum(StudentToolImplementationPriority).optional()
    });

    const toolSchema = z.object({
      toolKey: z.string().min(1),
      displayName: z.string().min(1),
      description: z.string().nullable().optional(),
      category: z.string().min(1),
      executionType: z.nativeEnum(StudentToolExecutionType),
      visibilityStatus: z.nativeEnum(StudentToolVisibilityStatus),
      implementationPriority: z.nativeEnum(StudentToolImplementationPriority),
      aiDependencyLevel: z.nativeEnum(StudentToolAiDependencyLevel),
      publicEnabled: z.boolean().optional(),
      anonymousEnabled: z.boolean().optional(),
      authenticatedEnabled: z.boolean().optional(),
      adminOnly: z.boolean().optional(),
      launchOrder: z.number().int().optional(),
      dependencyMetadata: z.record(z.string(), z.unknown()).nullable().optional(),
      costRiskMetadata: z.record(z.string(), z.unknown()).nullable().optional(),
      metadata: z.record(z.string(), z.unknown()).nullable().optional()
    });

    const visibilitySchema = z.object({
      visibilityStatus: z.nativeEnum(StudentToolVisibilityStatus)
    });

    router.post('/seed', asyncHandler(async (req: Request, res: Response) => {
      res.status(201).json({ data: await studentToolRegistryUseCases.seedOfficialTools() });
    }));

    router.get('/', asyncHandler(async (req: Request, res: Response) => {
      res.json({ data: await studentToolRegistryUseCases.listAdminTools(querySchema.parse(req.query)) });
    }));

    router.put('/:toolKey', asyncHandler(async (req: Request, res: Response) => {
      const body = toolSchema.parse({ ...req.body, toolKey: req.params.toolKey });
      res.json(await studentToolRegistryUseCases.upsertTool(body));
    }));

    router.patch('/:toolKey/visibility', asyncHandler(async (req: Request, res: Response) => {
      const body = visibilitySchema.parse(req.body);
      res.json(await studentToolRegistryUseCases.updateVisibility(req.params.toolKey, body.visibilityStatus));
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
