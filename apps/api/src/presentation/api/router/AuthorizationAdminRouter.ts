import { Router, Request, Response } from 'express';
import { 
  ManageRolesUseCase,
  AssignRoleUseCase
} from '@manaratak/application';
import { IAuditRecordRepository } from '@manaratak/domain';
import { ResponseFormatter } from '../response/ResponseFormatter';
import { AuditHelper } from '../../audit/AuditHelper';

export class AuthorizationAdminRouter {
  public static create({ manageRolesUseCase, assignRoleUseCase, auditRecordRepo }: { manageRolesUseCase: ManageRolesUseCase, assignRoleUseCase: AssignRoleUseCase, auditRecordRepo?: IAuditRecordRepository }): Router {
    const router = Router();
    const responseFormatter = new ResponseFormatter('v1');


    router.post('/roles', async (req: Request, res: Response) => {
      try {
        await manageRolesUseCase.createRole(req.body);
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'CREATE_ROLE',
          category: 'AUTHORIZATION',
          targetType: 'ROLE',
          targetId: req.body?.id || req.body?.name,
          result: 'SUCCESS',
          metadata: { name: req.body?.name }
        });
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
        await assignRoleUseCase.execute(req.body);
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'ASSIGN_ROLE',
          category: 'AUTHORIZATION',
          targetType: 'ROLE_ASSIGNMENT',
          targetId: req.body?.assignmentId || req.body?.identityId || req.body?.roleId,
          result: 'SUCCESS',
          metadata: { roleId: req.body?.roleId, identityId: req.body?.identityId }
        });
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

