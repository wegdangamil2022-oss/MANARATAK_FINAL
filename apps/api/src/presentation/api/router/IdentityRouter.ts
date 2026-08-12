import { Router, Request, Response } from 'express';
import { 
  ProvisionIdentityUseCase,
  ActivateIdentityUseCase,
  SuspendIdentityUseCase,
  ArchiveIdentityUseCase,
  PurgeIdentityUseCase,
  UpdateProfileUseCase,
  UpdateContactUseCase,
  GetIdentityUseCase,
  ListIdentitiesUseCase,
  ProvisionIdentityInput,
  ListIdentitiesInput
} from '@manaratak/application';
import { IAuditRecordRepository } from '@manaratak/domain';
import { ResponseFormatter } from '../response/ResponseFormatter';
import { AuditHelper } from '../../audit/AuditHelper';

export class IdentityRouter {
  public static create({ provisionIdentityUseCase, activateIdentityUseCase, suspendIdentityUseCase, archiveIdentityUseCase, purgeIdentityUseCase, updateProfileUseCase, updateContactUseCase, getIdentityUseCase, listIdentitiesUseCase, auditRecordRepo }: { provisionIdentityUseCase: ProvisionIdentityUseCase, activateIdentityUseCase: ActivateIdentityUseCase, suspendIdentityUseCase: SuspendIdentityUseCase, archiveIdentityUseCase: ArchiveIdentityUseCase, purgeIdentityUseCase: PurgeIdentityUseCase, updateProfileUseCase: UpdateProfileUseCase, updateContactUseCase: UpdateContactUseCase, getIdentityUseCase: GetIdentityUseCase, listIdentitiesUseCase: ListIdentitiesUseCase, auditRecordRepo?: IAuditRecordRepository }): Router {
    const router = Router();
    const responseFormatter = new ResponseFormatter('v1');

    const provisionUseCase = provisionIdentityUseCase;
    const activateUseCase = activateIdentityUseCase;
    const suspendUseCase = suspendIdentityUseCase;
    const archiveUseCase = archiveIdentityUseCase;
    const purgeUseCase = purgeIdentityUseCase;

    // 1. Provision Identity
    router.post('/', async (req: Request, res: Response) => {
      const result = await provisionUseCase.execute({
        type: req.body.type as ProvisionIdentityInput['type'],
        displayName: req.body.displayName,
        avatarUrl: req.body.avatarUrl,
        preferredLanguage: req.body.preferredLanguage,
        timeZone: req.body.timeZone,
        primaryEmail: req.body.primaryEmail,
        primaryPhone: req.body.primaryPhone,
        technicalMetadata: req.body.technicalMetadata
      });

      if (result.isSuccess) {
        const val = result.getValue();
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'PROVISION_IDENTITY',
          category: 'IDENTITY',
          targetType: 'IDENTITY',
          targetId: (val as any)?.id || (val as any)?.identityId || req.body.primaryEmail,
          result: 'SUCCESS',
          metadata: { type: req.body.type, primaryEmail: req.body.primaryEmail }
        });
        res.status(201).json(responseFormatter.success(val));
      } else {
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'PROVISION_IDENTITY',
          category: 'IDENTITY',
          targetType: 'IDENTITY',
          targetId: req.body.primaryEmail,
          result: 'FAILURE',
          error: result.error
        });
        res.status(400).json(responseFormatter.error({
          code: result.error?.code || 'VALIDATION_ERROR',
          message: result.error?.message || 'Failed to provision identity'
        }));
      }
    });

    // 2. Get Identity Details (Read-only, no audit)
    router.get('/:id', async (req: Request, res: Response) => {
      const result = await getIdentityUseCase.execute(req.params.id);
      if (result.isSuccess) {
        res.status(200).json(responseFormatter.success(result.getValue()));
      } else {
        res.status(404).json(responseFormatter.error({
          code: result.error?.code || 'NOT_FOUND',
          message: result.error?.message || 'Identity not found'
        }));
      }
    });

    // 3. List Identities (Paged & Filtered, Read-only, no audit)
    router.get('/', async (req: Request, res: Response) => {
      const result = await listIdentitiesUseCase.execute({
        type: req.query.type as ListIdentitiesInput['type'],
        status: req.query.status as ListIdentitiesInput['status'],
        limit: req.query.limit ? Number(req.query.limit) : 20,
        offset: req.query.offset ? Number(req.query.offset) : 0
      });

      if (result.isSuccess) {
        res.status(200).json(responseFormatter.success(result.getValue()));
      } else {
        res.status(400).json(responseFormatter.error({
          code: result.error?.code || 'VALIDATION_ERROR',
          message: result.error?.message || 'Failed to query identities'
        }));
      }
    });

    // 4. Activate Identity
    router.post('/:id/activate', async (req: Request, res: Response) => {
      const result = await activateUseCase.execute(req.params.id);
      if (result.isSuccess) {
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'ACTIVATE_IDENTITY',
          category: 'IDENTITY',
          targetType: 'IDENTITY',
          targetId: req.params.id,
          result: 'SUCCESS'
        });
        res.status(200).json(responseFormatter.success(result.getValue()));
      } else {
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'ACTIVATE_IDENTITY',
          category: 'IDENTITY',
          targetType: 'IDENTITY',
          targetId: req.params.id,
          result: 'FAILURE',
          error: result.error
        });
        res.status(400).json(responseFormatter.error({
          code: result.error?.code || 'VALIDATION_ERROR',
          message: result.error?.message || 'Failed to activate identity'
        }));
      }
    });

    // 5. Suspend Identity
    router.post('/:id/suspend', async (req: Request, res: Response) => {
      const result = await suspendUseCase.execute({
        identityId: req.params.id,
        reason: req.body.reason
      });
      if (result.isSuccess) {
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'SUSPEND_IDENTITY',
          category: 'IDENTITY',
          targetType: 'IDENTITY',
          targetId: req.params.id,
          result: 'SUCCESS',
          metadata: { reason: req.body.reason }
        });
        res.status(200).json(responseFormatter.success(result.getValue()));
      } else {
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'SUSPEND_IDENTITY',
          category: 'IDENTITY',
          targetType: 'IDENTITY',
          targetId: req.params.id,
          result: 'FAILURE',
          error: result.error
        });
        res.status(400).json(responseFormatter.error({
          code: result.error?.code || 'VALIDATION_ERROR',
          message: result.error?.message || 'Failed to suspend identity'
        }));
      }
    });

    // 6. Archive Identity
    router.post('/:id/archive', async (req: Request, res: Response) => {
      const result = await archiveUseCase.execute({
        identityId: req.params.id,
        reason: req.body.reason
      });
      if (result.isSuccess) {
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'ARCHIVE_IDENTITY',
          category: 'IDENTITY',
          targetType: 'IDENTITY',
          targetId: req.params.id,
          result: 'SUCCESS',
          metadata: { reason: req.body.reason }
        });
        res.status(200).json(responseFormatter.success(result.getValue()));
      } else {
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'ARCHIVE_IDENTITY',
          category: 'IDENTITY',
          targetType: 'IDENTITY',
          targetId: req.params.id,
          result: 'FAILURE',
          error: result.error
        });
        res.status(400).json(responseFormatter.error({
          code: result.error?.code || 'VALIDATION_ERROR',
          message: result.error?.message || 'Failed to archive identity'
        }));
      }
    });

    // 7. Purge/Delete Identity (GDPR compliant)
    router.delete('/:id', async (req: Request, res: Response) => {
      const result = await purgeUseCase.execute({
        identityId: req.params.id,
        reason: req.body.reason
      });
      if (result.isSuccess) {
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'PURGE_IDENTITY',
          category: 'IDENTITY',
          targetType: 'IDENTITY',
          targetId: req.params.id,
          result: 'SUCCESS',
          metadata: { reason: req.body.reason }
        });
        res.status(200).json(responseFormatter.success(result.getValue()));
      } else {
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'PURGE_IDENTITY',
          category: 'IDENTITY',
          targetType: 'IDENTITY',
          targetId: req.params.id,
          result: 'FAILURE',
          error: result.error
        });
        res.status(400).json(responseFormatter.error({
          code: result.error?.code || 'VALIDATION_ERROR',
          message: result.error?.message || 'Failed to purge identity'
        }));
      }
    });

    // 8. Update Profile Details
    router.put('/:id/profile', async (req: Request, res: Response) => {
      const result = await updateProfileUseCase.execute({
        identityId: req.params.id,
        displayName: req.body.displayName,
        avatarUrl: req.body.avatarUrl,
        preferredLanguage: req.body.preferredLanguage,
        timeZone: req.body.timeZone
      });
      if (result.isSuccess) {
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'UPDATE_IDENTITY_PROFILE',
          category: 'IDENTITY',
          targetType: 'IDENTITY',
          targetId: req.params.id,
          result: 'SUCCESS'
        });
        res.status(200).json(responseFormatter.success(result.getValue()));
      } else {
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'UPDATE_IDENTITY_PROFILE',
          category: 'IDENTITY',
          targetType: 'IDENTITY',
          targetId: req.params.id,
          result: 'FAILURE',
          error: result.error
        });
        res.status(400).json(responseFormatter.error({
          code: result.error?.code || 'VALIDATION_ERROR',
          message: result.error?.message || 'Failed to update profile'
        }));
      }
    });

    // 9. Update Contact Registry
    router.put('/:id/contact', async (req: Request, res: Response) => {
      const result = await updateContactUseCase.execute({
        identityId: req.params.id,
        email: req.body.email,
        phone: req.body.phone,
        verifyEmail: req.body.verifyEmail,
        verifyPhone: req.body.verifyPhone
      });
      if (result.isSuccess) {
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'UPDATE_IDENTITY_CONTACT',
          category: 'IDENTITY',
          targetType: 'IDENTITY',
          targetId: req.params.id,
          result: 'SUCCESS'
        });
        res.status(200).json(responseFormatter.success(result.getValue()));
      } else {
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'UPDATE_IDENTITY_CONTACT',
          category: 'IDENTITY',
          targetType: 'IDENTITY',
          targetId: req.params.id,
          result: 'FAILURE',
          error: result.error
        });
        res.status(400).json(responseFormatter.error({
          code: result.error?.code || 'VALIDATION_ERROR',
          message: result.error?.message || 'Failed to update contact registry'
        }));
      }
    });

    return router;
  }
}

