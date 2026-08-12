import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { InternationalTestPublicUseCases } from '@manaratak/application';
import { InternationalTestCategory, InternationalTestCompletenessStatus } from '@manaratak/domain';

export class InternationalTestPublicRouter {
  public static create(cradle: { internationalTestPublicUseCases: InternationalTestPublicUseCases }): Router {
    const router = Router();
    const { internationalTestPublicUseCases } = cradle;
    const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => Promise.resolve(fn(req, res, next)).catch(next);

    const querySchema = z.object({
      completenessStatus: z.nativeEnum(InternationalTestCompletenessStatus).optional(),
      testCategory: z.nativeEnum(InternationalTestCategory).optional(),
      providerName: z.string().optional(),
      page: z.string().optional().transform((value) => value ? parseInt(value, 10) : 1),
      pageSize: z.string().optional().transform((value) => value ? Math.min(parseInt(value, 10), 50) : 20)
    });

    router.get('/', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestPublicUseCases.listPublished(querySchema.parse(req.query)));
    }));

    router.get('/:slug', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestPublicUseCases.getPublishedBySlug(req.params.slug));
    }));

    router.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
      if (err instanceof z.ZodError) return res.status(400).json({ error: 'Validation Error', details: err.issues });
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('not found')) return res.status(404).json({ error: message });
      res.status(400).json({ error: message || 'An error occurred' });
    });

    return router;
  }
}
