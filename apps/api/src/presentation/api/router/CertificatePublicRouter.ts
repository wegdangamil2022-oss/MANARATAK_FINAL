import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CertificateUseCases } from '@manaratak/application';

export class CertificatePublicRouter {
  public static create(cradle: { certificateUseCases: CertificateUseCases }): Router {
    const router = Router();
    const { certificateUseCases } = cradle;

    const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

    const codeSchema = z.string().min(4).max(80);

    router.get('/verify/:verificationCode', asyncHandler(async (req: Request, res: Response) => {
      const verificationCode = codeSchema.parse(req.params.verificationCode);
      res.json(await certificateUseCases.verifyByCode(verificationCode));
    }));

    router.use((err: any, req: Request, res: Response, next: NextFunction) => {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation Error', details: err.issues });
      }
      if (err.message === 'Certificate not found') {
        return res.status(404).json({ error: err.message });
      }
      res.status(400).json({ error: err.message || 'An error occurred' });
    });

    return router;
  }
}
