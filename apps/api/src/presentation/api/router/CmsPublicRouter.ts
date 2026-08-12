import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PublicCmsUseCases } from '@manaratak/application';
import { CmsContentType } from '@manaratak/domain';

export class CmsPublicRouter {
  public static create(cradle: { publicCmsUseCases: PublicCmsUseCases }): Router {
    const router = Router();
    const { publicCmsUseCases } = cradle;

    const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

    const querySchema = z.object({
      contentType: z.nativeEnum(CmsContentType).optional(),
      categorySlug: z.string().optional(),
      q: z.string().optional(),
      locale: z.string().optional(),
      page: z.string().optional().transform((value) => value ? parseInt(value, 10) : 1),
      pageSize: z.string().optional().transform((value) => value ? parseInt(value, 10) : 20)
    });

    router.get('/content', asyncHandler(async (req: Request, res: Response) => {
      const { locale, ...filters } = querySchema.parse(req.query);
      res.json(await publicCmsUseCases.listPublished(filters, locale));
    }));

    router.get('/content/:slug', asyncHandler(async (req: Request, res: Response) => {
      const locale = typeof req.query.locale === 'string' ? req.query.locale : undefined;
      res.json(await publicCmsUseCases.getBySlug(req.params.slug, locale));
    }));

    router.use((err: any, req: Request, res: Response, next: NextFunction) => {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation Error', details: err.issues });
      }
      if (err.message === 'CMS content not found') {
        return res.status(404).json({ error: err.message });
      }
      res.status(400).json({ error: err.message || 'An error occurred' });
    });

    return router;
  }
}
