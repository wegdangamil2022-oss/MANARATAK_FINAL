import { NextFunction, Request, Response, Router } from 'express';
import { z } from 'zod';
import { CertificateUseCases } from '@manaratak/application';
import { CertificateStatus, CertificateTemplateStatus } from '@manaratak/domain';

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);
const actor = (req: Request) =>
  String((req as any).identity?.id ?? req.header('x-actor-id') ?? 'admin');
const optionalAsset = z.string().max(160).nullable().optional();
const templateBody = z.object({
  code: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[A-Z0-9_-]+$/),
  name: z.string().min(3).max(120),
  nameAr: z.string().min(3).max(160),
  nameEn: z.string().min(3).max(160),
  templateVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
  issuerName: z.string().min(2).max(120),
  issuerReferenceId: z.string().max(100).nullable().optional(),
  language: z.enum(['ARABIC', 'ENGLISH', 'BILINGUAL']),
  layout: z.enum(['LANDSCAPE', 'PORTRAIT']),
  accentColor: z.string(),
  secondaryColor: z.string(),
  titleAr: z.string().min(3),
  titleEn: z.string().min(3),
  bodyAr: z.string().min(10),
  bodyEn: z.string().min(10),
  signatoryNameAr: z.string().nullable().optional(),
  signatoryNameEn: z.string().nullable().optional(),
  signatoryTitleAr: z.string().nullable().optional(),
  signatoryTitleEn: z.string().nullable().optional(),
  logoAssetId: optionalAsset,
  sealAssetId: optionalAsset,
  signatureAssetId: optionalAsset,
  designAssetId: optionalAsset,
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export class CertificateAdminRouter {
  public static create(cradle: { certificateUseCases: CertificateUseCases }): Router {
    const router = Router();
    const useCases = cradle.certificateUseCases;

    router.get(
      '/',
      asyncHandler(async (req: Request, res: Response) =>
        res.json(
          await useCases.list({
            search: String(req.query.search ?? '') || undefined,
            status: req.query.status
              ? z.nativeEnum(CertificateStatus).parse(req.query.status)
              : undefined,
            templateId: String(req.query.templateId ?? '') || undefined,
            page: Number(req.query.page ?? 1),
            pageSize: Number(req.query.pageSize ?? 25),
          }),
        ),
      ),
    );
    router.get(
      '/analytics',
      asyncHandler(async (_req: Request, res: Response) => res.json(await useCases.analytics())),
    );
    router.get(
      '/templates',
      asyncHandler(async (_req: Request, res: Response) =>
        res.json({ data: await useCases.listTemplates() }),
      ),
    );
    router.post(
      '/templates',
      asyncHandler(async (req: Request, res: Response) =>
        res.status(201).json(await useCases.createTemplate(templateBody.parse(req.body))),
      ),
    );
    router.patch(
      '/templates/:id',
      asyncHandler(async (req: Request, res: Response) =>
        res.json(
          await useCases.updateTemplate(req.params.id, templateBody.partial().parse(req.body)),
        ),
      ),
    );
    router.post(
      '/templates/:id/transition',
      asyncHandler(async (req: Request, res: Response) =>
        res.json(
          await useCases.transitionTemplate(
            req.params.id,
            z.object({ status: z.nativeEnum(CertificateTemplateStatus) }).parse(req.body).status,
          ),
        ),
      ),
    );

    router.post(
      '/course-completions/issue',
      asyncHandler(async (req: Request, res: Response) => {
        const body = z
          .object({
            courseId: z.string().min(1),
            studentReferenceId: z.string().min(1),
            completedAt: z.coerce.date(),
            completionId: z.string().min(1),
            eligibleForCertificate: z.boolean(),
            recipientDisplayName: z.string().nullable().optional(),
            templateId: z.string().optional(),
            grade: z.string().optional(),
            score: z.number().min(0).max(100).optional(),
            skills: z.array(z.string()).max(50).optional(),
            competencies: z.array(z.string()).max(50).optional(),
          })
          .parse(req.body);
        res
          .status(201)
          .json(
            await useCases.issueFromCourseCompletion({
              ...body,
              certificateOwnerPhase: 'Phase 14 - Enterprise Certificates Platform',
              sourcePhase: 'Phase 13 - Learning Platform',
              actorId: actor(req),
              correlationId: req.header('x-correlation-id') ?? undefined,
            }),
          );
      }),
    );
    router.get(
      '/students/:studentReferenceId',
      asyncHandler(async (req: Request, res: Response) =>
        res.json({ data: await useCases.listStudentCertificates(req.params.studentReferenceId) }),
      ),
    );
    router.get(
      '/:id/ledger',
      asyncHandler(async (req: Request, res: Response) =>
        res.json({ data: await useCases.listLedger(req.params.id) }),
      ),
    );
    router.get(
      '/:id',
      asyncHandler(async (req: Request, res: Response) => {
        const item = await useCases.getCertificate(req.params.id);
        if (!item) return res.status(404).json({ error: 'Certificate not found' });
        res.json(item);
      }),
    );
    router.post(
      '/:id/revoke',
      asyncHandler(async (req: Request, res: Response) =>
        res.json(
          await useCases.revoke(
            req.params.id,
            z.object({ reason: z.string().min(8) }).parse(req.body).reason,
            actor(req),
          ),
        ),
      ),
    );
    router.post(
      '/:id/reissue',
      asyncHandler(async (req: Request, res: Response) => {
        const body = z
          .object({
            reason: z.string().min(8),
            recipientDisplayName: z.string().optional(),
            templateId: z.string().optional(),
          })
          .parse(req.body);
        res
          .status(201)
          .json(
            await useCases.reissue(
              req.params.id,
              body.reason,
              actor(req),
              body.recipientDisplayName,
              body.templateId,
            ),
          );
      }),
    );
    router.post(
      '/:id/archive',
      asyncHandler(async (req: Request, res: Response) =>
        res.json(
          await useCases.archive(
            req.params.id,
            z.object({ reason: z.string().min(3) }).parse(req.body).reason,
            actor(req),
          ),
        ),
      ),
    );

    router.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      if (err instanceof z.ZodError)
        return res.status(400).json({ error: 'Validation Error', details: err.issues });
      const message = err.message || 'Certificate operation failed';
      const status = /NOT_FOUND|not found/.test(message)
        ? 404
        : /IMMUTABLE|ARCHIVED|TRANSITION|MUST_BE/.test(message)
          ? 409
          : 400;
      return res.status(status).json({ error: message });
    });
    return router;
  }
}
