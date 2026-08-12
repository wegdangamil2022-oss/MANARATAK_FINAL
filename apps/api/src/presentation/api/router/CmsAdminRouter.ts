import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AdminCmsUseCases } from '@manaratak/application';
import { CmsCategoryStatus, CmsContentStatus, CmsContentType } from '@manaratak/domain';

export class CmsAdminRouter {
  public static create(cradle: { adminCmsUseCases: AdminCmsUseCases }): Router {
    const router = Router();
    const { adminCmsUseCases } = cradle;

    const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

    const querySchema = z.object({
      status: z.nativeEnum(CmsContentStatus).optional(),
      contentType: z.nativeEnum(CmsContentType).optional(),
      categorySlug: z.string().optional(),
      q: z.string().optional(),
      page: z.string().optional().transform((value) => value ? parseInt(value, 10) : 1),
      pageSize: z.string().optional().transform((value) => value ? parseInt(value, 10) : 20)
    });

    const contentSchema = z.object({
      slug: z.string().min(1),
      contentType: z.nativeEnum(CmsContentType),
      status: z.nativeEnum(CmsContentStatus).optional(),
      title: z.string().min(1),
      summary: z.string().nullable().optional(),
      categorySlug: z.string().nullable().optional(),
      featuredAssetId: z.string().nullable().optional(),
      seoMetadata: z.record(z.string(), z.unknown()).nullable().optional(),
      editorialMetadata: z.record(z.string(), z.unknown()).nullable().optional(),
      metadata: z.record(z.string(), z.unknown()).nullable().optional()
    });

    const localizedSchema = z.object({
      locale: z.string().min(2),
      title: z.string().min(1),
      summary: z.string().nullable().optional(),
      body: z.string().min(1),
      readingTimeMinutes: z.number().int().positive().nullable().optional(),
      seoMetadata: z.record(z.string(), z.unknown()).nullable().optional(),
      metadata: z.record(z.string(), z.unknown()).nullable().optional()
    });

    const categorySchema = z.object({
      slug: z.string().min(1),
      name: z.string().min(1),
      description: z.string().nullable().optional(),
      status: z.nativeEnum(CmsCategoryStatus).optional(),
      metadata: z.record(z.string(), z.unknown()).nullable().optional()
    });

    router.get('/content', asyncHandler(async (req: Request, res: Response) => {
      res.json(await adminCmsUseCases.listContent(querySchema.parse(req.query)));
    }));

    router.post('/content', asyncHandler(async (req: Request, res: Response) => {
      res.status(201).json(await adminCmsUseCases.createContent(contentSchema.parse(req.body)));
    }));

    router.get('/content/:id', asyncHandler(async (req: Request, res: Response) => {
      res.json(await adminCmsUseCases.getContent(req.params.id));
    }));

    router.patch('/content/:id', asyncHandler(async (req: Request, res: Response) => {
      res.json(await adminCmsUseCases.updateContent(req.params.id, contentSchema.partial().parse(req.body)));
    }));

    router.put('/content/:id/localized', asyncHandler(async (req: Request, res: Response) => {
      res.json(await adminCmsUseCases.upsertLocalizedContent({
        contentId: req.params.id,
        ...localizedSchema.parse(req.body)
      }));
    }));

    router.post('/content/:id/publish', asyncHandler(async (req: Request, res: Response) => {
      res.json(await adminCmsUseCases.publish(req.params.id));
    }));

    router.post('/content/:id/archive', asyncHandler(async (req: Request, res: Response) => {
      res.json(await adminCmsUseCases.archive(req.params.id));
    }));

    router.get('/categories', asyncHandler(async (req: Request, res: Response) => {
      res.json({ data: await adminCmsUseCases.listCategories() });
    }));

    router.post('/categories', asyncHandler(async (req: Request, res: Response) => {
      const body = categorySchema.parse(req.body);
      res.status(201).json(await adminCmsUseCases.createCategory({
        ...body,
        status: body.status || CmsCategoryStatus.ACTIVE
      }));
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
