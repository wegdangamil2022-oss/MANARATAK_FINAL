import { Router, Request, Response } from 'express';
import { 
  ManageRolesUseCase,
  AssignRoleUseCase
} from '@manaratak/application';
import { IAuditRecordRepository } from '@manaratak/domain';
import { ResponseFormatter } from '../response/ResponseFormatter';
import { AuditHelper } from '../../audit/AuditHelper';
import type { AdminBootstrapVerifier } from '@manaratak/infrastructure';

export class AuthorizationAdminRouter {
  public static create({ manageRolesUseCase, assignRoleUseCase, auditRecordRepo, adminBootstrapVerifier }: { manageRolesUseCase: ManageRolesUseCase, assignRoleUseCase: AssignRoleUseCase, auditRecordRepo?: IAuditRecordRepository, adminBootstrapVerifier?: AdminBootstrapVerifier }): Router {
    const router = Router();
    const responseFormatter = new ResponseFormatter('v1');
    const mutationContext = (req: Request) => ({
      actorId: (req as any).user?.id || (req as any).user?.identityId || 'SYSTEM',
      actorType: (req as any).user?.type || 'IDENTITY',
      correlationId: (req.headers['x-correlation-id'] as string | undefined) || (req.headers['x-request-id'] as string | undefined),
      source: 'admin-authorization-api',
    });

    router.get('/bootstrap-verification', async (_req: Request, res: Response) => {
      if (!adminBootstrapVerifier) {
        res.status(503).json(responseFormatter.success({ status: 'UNAVAILABLE', capability: 'PERSISTED_RBAC_ADMIN_BOOTSTRAP', databaseWrites: 0 }));
        return;
      }
      const report = await adminBootstrapVerifier.verify();
      res.status(report.status === 'UNAVAILABLE' ? 503 : 200).json(responseFormatter.success(report));
    });


    router.post('/roles', async (req: Request, res: Response) => {
      try {
        await manageRolesUseCase.createRole(req.body, mutationContext(req));
        res.status(201).json(responseFormatter.success({ message: 'Role created successfully' }));
      } catch (error: any) {
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'CREATE_ROLE',
          category: 'AUTHORIZATION',
          targetType: 'ROLE',
          targetId: req.body?.id || req.body?.name,
          result: 'FAILURE',
          error
        });
        res.status(400).json(responseFormatter.error({
          code: 'VALIDATION_ERROR',
          message: error.message || 'Failed to create role'
        }));
      }
    });

    router.get('/roles/:id', async (req: Request, res: Response) => {
      try {
        const role = await manageRolesUseCase.getRole(req.params.id);
        if (!role) {
          return res.status(404).json(responseFormatter.error({
            code: 'NOT_FOUND',
            message: 'Role not found'
          }));
        }
        res.status(200).json(responseFormatter.success(role));
      } catch (error: any) {
        res.status(400).json(responseFormatter.error({
          code: 'VALIDATION_ERROR',
          message: error.message || 'Failed to get role'
        }));
      }
    });

    router.post('/assignments', async (req: Request, res: Response) => {
      try {
        await assignRoleUseCase.execute(req.body, mutationContext(req));
        res.status(201).json(responseFormatter.success({ message: 'Role assigned successfully' }));
      } catch (error: any) {
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'ASSIGN_ROLE',
          category: 'AUTHORIZATION',
          targetType: 'ROLE_ASSIGNMENT',
          targetId: req.body?.assignmentId || req.body?.identityId || req.body?.roleId,
          result: 'FAILURE',
          error
        });
        res.status(400).json(responseFormatter.error({
          code: 'VALIDATION_ERROR',
          message: error.message || 'Failed to assign role'
        }));
      }
    });

    return router;
  }
}
