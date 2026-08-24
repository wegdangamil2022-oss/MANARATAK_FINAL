import { NextFunction, Request, Response, Router } from 'express';
import { z } from 'zod';
import { AdminCmsUseCases } from '@manaratak/application';
import { CmsCategoryStatus, CmsContentStatus, CmsContentType } from '@manaratak/domain';

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const nullableAsset = z.string().trim().min(1).nullable().optional();
const seoSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  canonicalUrl: z.string().url().nullable().optional(),
  keywords: z.array(z.string().trim().min(1)).default([]),
  noIndex: z.boolean().default(false),
  noFollow: z.boolean().default(false),
  openGraphTitle: z.string().trim().nullable().optional(),
  openGraphDescription: z.string().trim().nullable().optional(),
  openGraphAssetId: nullableAsset,
});
const workflowSchema = z.object({
  locale: z.enum(['ar', 'en']),
  expectedVersion: z.number().int().positive().optional(),
  comments: z.string().trim().max(2000).nullable().optional(),
});

export class CmsAdminRouter {
  public static create(cradle: { adminCmsUseCases: AdminCmsUseCases }): Router {
    const router = Router();
    const { adminCmsUseCases } = cradle;
    const asyncHandler =
      (fn: (req: Request, res: Response) => Promise<void>) =>
      (req: Request, res: Response, next: NextFunction) =>
        Promise.resolve(fn(req, res)).catch(next);
    const actor = (req: Request) => {
      if (!req.authUserId) throw new Error('CMS_AUTHENTICATED_ACTOR_REQUIRED');
      return req.authUserId;
    };
    const querySchema = z.object({
      status: z.nativeEnum(CmsContentStatus).optional(),
      contentType: z.nativeEnum(CmsContentType).optional(),
      categorySlug: slug.optional(),
      tag: z.string().optional(),
      locale: z.enum(['ar', 'en']).optional(),
      siteIdentifier: z.string().optional(),
      q: z.string().trim().optional(),
      page: z.coerce.number().int().positive().default(1),
      pageSize: z.coerce.number().int().min(1).max(100).default(20),
    });
    const contentSchema = z.object({
      slug,
      siteIdentifier: z.string().trim().min(1).default('manaratak'),
      primaryLocale: z.enum(['ar', 'en']).default('ar'),
      contentType: z.nativeEnum(CmsContentType),
      title: z.string().trim().min(1),
      summary: z.string().trim().nullable().optional(),
      categoryId: z.string().trim().nullable().optional(),
      categorySlug: slug.nullable().optional(),
      ownerId: z.string().trim().optional(),
      featuredAssetId: nullableAsset,
      seoMetadata: seoSchema.nullable().optional(),
      editorialMetadata: z.record(z.string(), z.unknown()).nullable().optional(),
      metadata: z.record(z.string(), z.unknown()).nullable().optional(),
    });
    const localizedSchema = z.object({
      locale: z.enum(['ar', 'en']),
      localizedSlug: slug,
      title: z.string().trim().min(1),
      summary: z.string().trim().nullable().optional(),
      body: z.string().trim().min(1),
      readingTimeMinutes: z.number().int().positive().nullable().optional(),
      featuredAssetId: nullableAsset,
      attachmentAssetIds: z.array(z.string().trim().min(1)).max(50).default([]),
      tagIds: z.array(z.string().trim().min(1)).max(30).default([]),
      expectedVersion: z.number().int().positive().optional(),
      seoMetadata: seoSchema.nullable().optional(),
      metadata: z.record(z.string(), z.unknown()).nullable().optional(),
    });
    const categorySchema = z.object({
      slug,
      nameAr: z.string().trim().min(1),
      nameEn: z.string().trim().min(1),
      descriptionAr: z.string().trim().nullable().optional(),
      descriptionEn: z.string().trim().nullable().optional(),
      parentCategoryId: z.string().trim().nullable().optional(),
      status: z.nativeEnum(CmsCategoryStatus).default(CmsCategoryStatus.ACTIVE),
      metadata: z.record(z.string(), z.unknown()).nullable().optional(),
    });
    const tagSchema = z.object({
      normalizedValue: z.string().trim().min(1),
      labelAr: z.string().trim().min(1),
      labelEn: z.string().trim().min(1),
    });

    router.get(
      '/content',
      asyncHandler(async (req, res) => {
        res.json(await adminCmsUseCases.listContent(querySchema.parse(req.query)));
      }),
    );
    router.post(
      '/content',
      asyncHandler(async (req, res) => {
        res
          .status(201)
          .json(await adminCmsUseCases.createContent(contentSchema.parse(req.body), actor(req)));
      }),
    );
    router.get(
      '/content/:id',
      asyncHandler(async (req, res) => {
        res.json(await adminCmsUseCases.getContent(req.params.id));
      }),
    );
    router.patch(
      '/content/:id',
      asyncHandler(async (req, res) => {
        res.json(
          await adminCmsUseCases.updateContent(
            req.params.id,
            contentSchema.partial().parse(req.body),
            actor(req),
          ),
        );
      }),
    );
    router.put(
      '/content/:id/localized',
      asyncHandler(async (req, res) => {
        res.json(
          await adminCmsUseCases.upsertLocalizedContent(
            { contentId: req.params.id, ...localizedSchema.parse(req.body) },
            actor(req),
          ),
        );
      }),
    );
    router.get(
      '/content/:id/readiness/:locale',
      asyncHandler(async (req, res) => {
        res.json(
          await adminCmsUseCases.getReadiness(
            req.params.id,
            z.enum(['ar', 'en']).parse(req.params.locale),
          ),
        );
      }),
    );
    router.get(
      '/content/:id/revisions/:locale',
      asyncHandler(async (req, res) => {
        res.json({
          data: await adminCmsUseCases.listRevisions(
            req.params.id,
            z.enum(['ar', 'en']).parse(req.params.locale),
          ),
        });
      }),
    );
    router.post(
      '/content/:id/revisions/:locale/:revisionId/restore',
      asyncHandler(async (req, res) => {
        const body = z
          .object({ expectedVersion: z.number().int().positive().optional() })
          .parse(req.body);
        res.json(
          await adminCmsUseCases.restoreRevision(
            req.params.id,
            z.enum(['ar', 'en']).parse(req.params.locale),
            req.params.revisionId,
            actor(req),
            body.expectedVersion,
          ),
        );
      }),
    );
    const workflow = (
      method: 'submitForReview' | 'approveReview' | 'rejectReview' | 'publish' | 'archive',
    ) =>
      asyncHandler(async (req, res) => {
        const body = workflowSchema.parse(req.body);
        if (method === 'rejectReview' && !body.comments)
          throw new Error('CMS_REJECTION_REASON_REQUIRED');
        let result;
        if (method === 'rejectReview')
          result = await adminCmsUseCases.rejectReview(
            req.params.id,
            body.locale,
            actor(req),
            body.comments!,
            body.expectedVersion,
          );
        else if (method === 'submitForReview' || method === 'approveReview')
          result = await adminCmsUseCases[method](
            req.params.id,
            body.locale,
            actor(req),
            body.expectedVersion,
            body.comments,
          );
        else
          result = await adminCmsUseCases[method](
            req.params.id,
            body.locale,
            actor(req),
            body.expectedVersion,
          );
        res.json(result);
      });
    router.post('/content/:id/submit-review', workflow('submitForReview'));
    router.post('/content/:id/approve', workflow('approveReview'));
    router.post('/content/:id/reject', workflow('rejectReview'));
    router.post('/content/:id/publish', workflow('publish'));
    router.post('/content/:id/archive', workflow('archive'));
    router.post(
      '/content/:id/schedule',
      asyncHandler(async (req, res) => {
        const body = workflowSchema.extend({ scheduledAt: z.coerce.date() }).parse(req.body);
        res.json(
          await adminCmsUseCases.schedule(
            req.params.id,
            body.locale,
            actor(req),
            body.scheduledAt,
            body.expectedVersion,
          ),
        );
      }),
    );
    router.get(
      '/categories',
      asyncHandler(async (_req, res) => {
        res.json({ data: await adminCmsUseCases.listCategories() });
      }),
    );
    router.post(
      '/categories',
      asyncHandler(async (req, res) => {
        res
          .status(201)
          .json(await adminCmsUseCases.createCategory(categorySchema.parse(req.body), actor(req)));
      }),
    );
    router.get(
      '/tags',
      asyncHandler(async (_req, res) => {
        res.json({ data: await adminCmsUseCases.listTags() });
      }),
    );
    router.post(
      '/tags',
      asyncHandler(async (req, res) => {
        res
          .status(201)
          .json(await adminCmsUseCases.createTag(tagSchema.parse(req.body), actor(req)));
      }),
    );
    router.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
      if (err instanceof z.ZodError)
        return res.status(400).json({ error: 'CMS_VALIDATION_ERROR', details: err.issues });
      const message = err instanceof Error ? err.message : 'CMS_REQUEST_FAILED';
      const status = message.includes('NOT_FOUND')
        ? 404
        : message.includes('AUTHENTICATED') || message.includes('MAKER_CHECKER')
          ? 403
          : message.includes('CONFLICT') ||
              message.includes('IMMUTABLE') ||
              message.includes('LOCKED')
            ? 409
            : message.includes('NOT_READY') ||
                message.includes('TRANSITION') ||
                message.includes('APPROVAL')
              ? 422
              : 400;
      return res.status(status).json({ error: message });
    });
    return router;
  }
}
