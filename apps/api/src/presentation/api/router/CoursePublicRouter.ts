import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CourseAccessType, CourseOriginType } from '@manaratak/domain';
import { PublicCourseUseCases } from '@manaratak/application';

export class CoursePublicRouter {
  public static create(cradle: { publicCourseUseCases: PublicCourseUseCases }): Router {
    const router = Router();
    const { publicCourseUseCases } = cradle;

    const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

    const listQuerySchema = z.object({
      accessType: z.nativeEnum(CourseAccessType).optional(),
      originType: z.nativeEnum(CourseOriginType).optional(),
      platformName: z.string().optional(),
      category: z.string().optional(),
      learningLanguage: z.string().optional(),
      page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
      pageSize: z.string().optional().transform((val) => {
        const parsed = val ? parseInt(val, 10) : 20;
        return Math.min(parsed, 50);
      }),
    });

    router.get('/', asyncHandler(async (req: Request, res: Response) => {
      const filters = listQuerySchema.parse(req.query);
      const result = await publicCourseUseCases.listCourses(filters);
      res.json(result);
    }));

    router.get('/:slug', asyncHandler(async (req: Request, res: Response) => {
      try {
        const course = await publicCourseUseCases.getCourse(req.params.slug);
        res.json(course);
      } catch (err: any) {
        if (err.message === 'Course not found') {
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
