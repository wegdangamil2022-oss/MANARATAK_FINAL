import { NextFunction, Request, Response, Router } from 'express';
import { z } from 'zod';
import { PublicCmsUseCases } from '@manaratak/application';
import { CmsContentType } from '@manaratak/domain';

export class CmsPublicRouter {
  public static create(cradle: { publicCmsUseCases: PublicCmsUseCases }): Router {
    const router = Router();
    const { publicCmsUseCases } = cradle;
    const asyncHandler =
      (fn: (req: Request, res: Response) => Promise<void>) =>
      (req: Request, res: Response, next: NextFunction) =>
        Promise.resolve(fn(req, res)).catch(next);
    const querySchema = z.object({
      contentType: z.nativeEnum(CmsContentType).optional(),
      categorySlug: z.string().optional(),
      tag: z.string().optional(),
      q: z.string().trim().optional(),
      locale: z.enum(['ar', 'en']).default('ar'),
      siteIdentifier: z.string().default('manaratak'),
      page: z.coerce.number().int().positive().default(1),
      pageSize: z.coerce.number().int().min(1).max(50).default(20),
    });
    const deliveryHeaders = (res: Response, payload: unknown) => {
      const etag = `W/\"cms-${Buffer.from(JSON.stringify(payload)).toString('base64url').slice(0, 24)}\"`;
      res.set({
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        ETag: etag,
        Vary: 'Accept-Language',
      });
    };
    router.get(
      '/content',
      asyncHandler(async (req, res) => {
        const { locale, ...filters } = querySchema.parse(req.query);
        const payload = await publicCmsUseCases.listPublished(filters, locale);
        deliveryHeaders(res, payload);
        res.json(payload);
      }),
    );
    router.get(
      '/content/:slug',
      asyncHandler(async (req, res) => {
        const locale = z.enum(['ar', 'en']).default('ar').parse(req.query.locale);
        const payload = await publicCmsUseCases.getBySlug(req.params.slug, locale);
        deliveryHeaders(res, payload);
        res.json(payload);
      }),
    );
    router.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
      if (err instanceof z.ZodError)
        return res.status(400).json({ error: 'CMS_VALIDATION_ERROR', details: err.issues });
      const message = err instanceof Error ? err.message : 'CMS_REQUEST_FAILED';
      return res.status(message === 'CMS_CONTENT_NOT_FOUND' ? 404 : 400).json({ error: message });
    });
    return router;
  }
}
