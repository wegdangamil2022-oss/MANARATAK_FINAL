import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CertificateUseCases } from '@manaratak/application';

export class CertificateAdminRouter {
  public static create(cradle: { certificateUseCases: CertificateUseCases }): Router {
    const router = Router();
    const { certificateUseCases } = cradle;

    const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

    const issueBodySchema = z.object({
      courseId: z.string().min(1),
      studentReferenceId: z.string().min(1),
      completedAt: z.union([z.string(), z.date()]),
      completionId: z.string().min(1),
      eligibleForCertificate: z.boolean(),
      recipientDisplayName: z.string().nullable().optional(),
      templateName: z.string().optional()
    });

    const revokeBodySchema = z.object({
      reason: z.string().min(1)
    });

    router.post('/course-completions/issue', asyncHandler(async (req: Request, res: Response) => {
      const body = issueBodySchema.parse(req.body);
      const certificate = await certificateUseCases.issueFromCourseCompletion({
        ...body,
        completedAt: body.completedAt as string | Date,
        certificateOwnerPhase: 'Phase 14 - Enterprise Certificates Platform',
        sourcePhase: 'Phase 13 - Learning Platform'
      });
      res.status(201).json(certificate);
    }));

    router.get('/students/:studentReferenceId', asyncHandler(async (req: Request, res: Response) => {
      res.json({ data: await certificateUseCases.listStudentCertificates(req.params.studentReferenceId) });
    }));

    router.post('/:certificateId/revoke', asyncHandler(async (req: Request, res: Response) => {
      const body = revokeBodySchema.parse(req.body);
      res.json(await certificateUseCases.revoke(req.params.certificateId, body.reason));
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
