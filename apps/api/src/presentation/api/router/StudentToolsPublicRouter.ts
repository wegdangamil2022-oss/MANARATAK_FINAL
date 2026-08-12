import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { StudentToolExecutionUseCases, StudentToolRegistryUseCases } from '@manaratak/application';
import { StudentToolVisibilityStatus } from '@manaratak/domain';

export class StudentToolsPublicRouter {
  public static create(cradle: { studentToolRegistryUseCases: StudentToolRegistryUseCases; studentToolExecutionUseCases: StudentToolExecutionUseCases }): Router {
    const router = Router();
    const { studentToolRegistryUseCases, studentToolExecutionUseCases } = cradle;

    const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

    const querySchema = z.object({
      category: z.string().optional(),
      visibilityStatus: z.nativeEnum(StudentToolVisibilityStatus).optional()
    });

    router.get('/', asyncHandler(async (req: Request, res: Response) => {
      res.json({ data: await studentToolRegistryUseCases.listPublicTools(querySchema.parse(req.query)) });
    }));

    const executionSchema = z.object({
      input: z.string().min(1).max(8000),
      requesterReferenceId: z.string().optional().nullable(),
      locale: z.string().optional().nullable(),
      metadata: z.record(z.string(), z.unknown()).optional().nullable()
    });

    router.post('/:toolKey/execute', asyncHandler(async (req: Request, res: Response) => {
      res.json(await studentToolExecutionUseCases.execute(req.params.toolKey, executionSchema.parse(req.body)));
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
