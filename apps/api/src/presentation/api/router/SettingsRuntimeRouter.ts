import { Router, Request, Response, NextFunction } from 'express';
import { ResolveConfigurationUseCase } from '@manaratak/application';
import { ResponseFormatter } from '../response/ResponseFormatter';
import { z } from 'zod';

export class SettingsRuntimeRouter {
  public static create({ resolveConfigurationUseCase  }: { resolveConfigurationUseCase: ResolveConfigurationUseCase }): Router {
    const router = Router();
    const responseFormatter = new ResponseFormatter('v1');

    const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

    const resolveQuerySchema = z.object({
      identityId: z.string().optional(),
      tenantId: z.string().optional(),
      scopeId: z.string().optional(),
      organizationId: z.string().optional(), // deprecated
    });

    router.get('/resolve/:key', asyncHandler(async (req: Request, res: Response) => {
      const query = resolveQuerySchema.parse(req.query);
      const { identityId, tenantId, scopeId, organizationId } = query;

      // Map deprecated organizationId to tenantId/scopeId if needed
      if (organizationId) {
        console.warn('organizationId query parameter is deprecated, use tenantId or scopeId instead');
      }

      const activeScopeId = tenantId || scopeId || organizationId;

      const value = await resolveConfigurationUseCase.resolveSetting(
        req.params.key,
        identityId,
        activeScopeId
      );
      res.status(200).json(responseFormatter.success({ value }));
    }));

    router.use((err: any, req: Request, res: Response, next: NextFunction) => {
      if (err instanceof z.ZodError) {
        return res.status(400).json(responseFormatter.error({ code: 'VALIDATION_ERROR', message: 'Validation Error', details: { issues: err.issues } }));
      }
      res.status(400).json(responseFormatter.error({ code: 'RESOLUTION_ERROR', message: err.message || 'An error occurred' }));
    });

    return router;
  }
}
