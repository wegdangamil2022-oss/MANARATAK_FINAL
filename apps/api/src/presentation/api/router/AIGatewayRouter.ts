import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AIExecutionOrchestrator } from '@manaratak/application';
import { AIExecutionStatus, AIRequestPurpose } from '@manaratak/domain';

export class AIGatewayRouter {
  public static create(cradle: { aiExecutionUseCases: AIExecutionOrchestrator }): Router {
    const router = Router();
    const { aiExecutionUseCases } = cradle;
    const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => Promise.resolve(fn(req, res, next)).catch(next);

    const executeSchema = z.object({
      purpose: z.nativeEnum(AIRequestPurpose),
      promptKey: z.string().min(1),
      input: z.string().min(1).max(8000),
      locale: z.string().optional().nullable(),
      requesterReferenceId: z.string().optional().nullable(),
      sourceDomain: z.string().optional().nullable(),
      metadata: z.record(z.string(), z.unknown()).optional().nullable()
      ,capabilityKey: z.string().min(1).optional().nullable()
      ,consumerKey: z.string().min(1).optional().nullable()
      ,idempotencyKey: z.string().min(1).max(200).optional().nullable()
      ,structuredOutputSchema: z.record(z.string(), z.unknown()).optional().nullable()
      ,maxOutputTokens: z.number().int().positive().max(32768).optional().nullable()
    });

    const logQuerySchema = z.object({
      purpose: z.nativeEnum(AIRequestPurpose).optional(),
      status: z.nativeEnum(AIExecutionStatus).optional(),
      requesterReferenceId: z.string().optional(),
      page: z.string().optional().transform((value) => value ? parseInt(value, 10) : 1),
      pageSize: z.string().optional().transform((value) => value ? Math.min(parseInt(value, 10), 50) : 20)
    });

    router.post('/execute', asyncHandler(async (req: Request, res: Response) => {
      const payload = executeSchema.parse(req.body);
      res.json(await aiExecutionUseCases.execute(payload));
    }));

    router.post('/executions', asyncHandler(async (req: Request, res: Response) => {
      const payload = executeSchema.parse(req.body);
      res.status(202).json(await aiExecutionUseCases.submitAsync(payload));
    }));

    router.get('/executions/:publicId', asyncHandler(async (req: Request, res: Response) => {
      const value = await aiExecutionUseCases.find(req.params.publicId);
      if (!value) return res.status(404).json({ error: 'AI_EXECUTION_NOT_FOUND' });
      res.json(value);
    }));

    router.post('/executions/:publicId/cancel', asyncHandler(async (req: Request, res: Response) => {
      res.json(await aiExecutionUseCases.cancel(req.params.publicId));
    }));

    router.get('/logs', asyncHandler(async (req: Request, res: Response) => {
      res.json(await aiExecutionUseCases.listLogs(logQuerySchema.parse(req.query)));
    }));

    router.use((err: any, req: Request, res: Response, next: NextFunction) => {
      if (err instanceof z.ZodError) return res.status(400).json({ error: 'Validation Error', details: err.issues });
      res.status(400).json({ error: err.message || 'An error occurred' });
    });

    return router;
  }
}
