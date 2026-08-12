import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PublicUniversityUseCases } from '@manaratak/application';

export class UniversityPublicRouter {
  public static create(cradle: { publicUniversityUseCases: PublicUniversityUseCases }): Router {
    const router = Router();
    const { publicUniversityUseCases } = cradle;

    const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

    const listQuerySchema = z.object({
      country: z.string().optional(),
      institutionType: z.string().optional(),
      city: z.string().optional(),
      page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
      pageSize: z.string().optional().transform((val) => {
        const parsed = val ? parseInt(val, 10) : 20;
        return Math.min(parsed, 50);
      }),
    });

    router.get('/', asyncHandler(async (req: Request, res: Response) => {
      const filters = listQuerySchema.parse(req.query);
      const result = await publicUniversityUseCases.listUniversities(filters);
      res.json(result);
    }));

    router.get('/:slug', asyncHandler(async (req: Request, res: Response) => {
      try {
        const university = await publicUniversityUseCases.getUniversity(req.params.slug);
        res.json(university);
      } catch (err: any) {
        if (err.message === 'University not found') {
          return res.status(404).json({ error: 'Not found' });
        }
        throw err;
      }
    }));

    router.use((err: any, req: Request, res: Response, next: NextFunction) => {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation Error', details: err.issues });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    });

    return router;
  }
}
