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

    const listQuerySchema = z.object({
      studyCountry: z.string().optional(),
      degreeLevel: z.string().optional(),
      fundingCoverage: z.string().optional(),
      sponsorName: z.string().optional(),
      applicationDeadlineFrom: z.string().optional().transform(val => val ? new Date(val) : undefined),
      applicationDeadlineTo: z.string().optional().transform(val => val ? new Date(val) : undefined),
      page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
      pageSize: z.string().optional().transform(val => {
        const parsed = val ? parseInt(val, 10) : 20;
        return Math.min(parsed, 50); // Bound max page size
      }),
    });

    // GET /public/scholarships
    router.get('/', asyncHandler(async (req: Request, res: Response) => {
      const filters = listQuerySchema.parse(req.query);
      const result = await publicScholarshipUseCases.listScholarships(filters);
      res.json(result);
    }));

    // GET /public/scholarships/:slug
    router.get('/:slug', asyncHandler(async (req: Request, res: Response) => {
      try {
        const scholarship = await publicScholarshipUseCases.getScholarship(req.params.slug);
        res.json(scholarship);
      } catch (err: any) {
        if (err.message === 'Scholarship not found') {
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
