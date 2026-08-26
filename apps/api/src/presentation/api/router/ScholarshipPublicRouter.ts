import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PublicScholarshipUseCases } from '@manaratak/application';

export class ScholarshipPublicRouter {
  public static create(cradle: { publicScholarshipUseCases: PublicScholarshipUseCases }): Router {
    const router = Router();
    const { publicScholarshipUseCases } = cradle;
    const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

    const date = z.string().datetime({ offset: true }).transform((value) => new Date(value));
    const listQuerySchema = z.object({
      studyCountry: z.string().min(1).optional(),
      countryReferenceId: z.string().min(1).optional(),
      degreeLevel: z.string().min(1).optional(),
      fundingCoverage: z.string().min(1).optional(),
      sponsorName: z.string().min(1).optional(),
      applicationDeadlineFrom: date.optional(),
      applicationDeadlineTo: date.optional(),
      page: z.coerce.number().int().min(1).default(1),
      pageSize: z.coerce.number().int().min(1).transform((value) => Math.min(value, 50)).default(20),
    }).refine((value) => !value.applicationDeadlineFrom || !value.applicationDeadlineTo || value.applicationDeadlineFrom <= value.applicationDeadlineTo, {
      message: 'applicationDeadlineFrom must be <= applicationDeadlineTo',
    });

    router.get('/', asyncHandler(async (req: Request, res: Response) => {
      const filters = listQuerySchema.parse(req.query);
      res.json(await publicScholarshipUseCases.listScholarships(filters));
    }));

    router.get('/:slug', asyncHandler(async (req: Request, res: Response) => {
      try {
        res.json(await publicScholarshipUseCases.getScholarship(req.params.slug));
      } catch (err: any) {
        if (err.message === 'Scholarship not found') return res.status(404).json({ error: 'Not found' });
        throw err;
      }
    }));

    router.use((err: any, req: Request, res: Response, next: NextFunction) => {
      if (err instanceof z.ZodError) return res.status(400).json({ error: 'Validation Error', details: err.issues });
      res.status(500).json({ error: 'Internal Server Error' });
    });
    return router;
  }
}
