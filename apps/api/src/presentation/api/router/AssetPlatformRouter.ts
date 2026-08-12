import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  AssetSecurityClassification,
  AssetRetentionCategory,
  IAuditRecordRepository
} from '@manaratak/domain';
import {
  IngestAssetUseCase,
  ProcessAssetLifecycleUseCase,
  RequestAssetUploadLocatorDto,
  RegisterQuarantinedAssetDto
} from '@manaratak/application';
import { AuditHelper } from '../../audit/AuditHelper';

export interface AssetPlatformRouterCradle {
  ingestAssetUseCase: IngestAssetUseCase;
  processAssetLifecycleUseCase: ProcessAssetLifecycleUseCase;
  auditRecordRepo?: IAuditRecordRepository;
}

export class AssetPlatformRouter {
  public static create(cradle: AssetPlatformRouterCradle): Router {
    const router = Router();
    const { ingestAssetUseCase, processAssetLifecycleUseCase, auditRecordRepo } = cradle;

    const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
      (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
      };

    const urlCheck = (val: string, ctx: z.RefinementCtx, fieldName: string) => {
      if (/^https?:\/\//i.test(val.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${fieldName} must be a Phase 05 EAP handle, not a raw URL`
        });
      }
    };

    const requestUploadLocatorSchema = z.object({
      assetId: z.string().min(1, 'assetId is required').superRefine((val, ctx) => urlCheck(val, ctx, 'assetId')),
      assetReference: z.string().min(1, 'assetReference is required').superRefine((val, ctx) => urlCheck(val, ctx, 'assetReference')),
      ownerId: z.string().min(1, 'ownerId is required'),
      ownerType: z.string().min(1, 'ownerType is required'),
      originalFilename: z.string().min(1, 'originalFilename is required'),
      mimeType: z.string().min(1, 'mimeType is required'),
      fileExtension: z.string().min(1, 'fileExtension is required'),
      byteSize: z.number().positive('byteSize must be greater than 0'),
      classification: z.nativeEnum(AssetSecurityClassification),
      retentionCategory: z.nativeEnum(AssetRetentionCategory).optional(),
      expiresAt: z.string().optional()
    });

    const registerQuarantinedSchema = z.object({
      assetId: z.string().min(1, 'assetId is required').superRefine((val, ctx) => urlCheck(val, ctx, 'assetId')),
      assetReference: z.string().min(1, 'assetReference is required').superRefine((val, ctx) => urlCheck(val, ctx, 'assetReference')),
      ownerId: z.string().min(1, 'ownerId is required'),
      ownerType: z.string().min(1, 'ownerType is required'),
      originalFilename: z.string().min(1, 'originalFilename is required'),
      mimeType: z.string().min(1, 'mimeType is required'),
      fileExtension: z.string().min(1, 'fileExtension is required'),
      byteSize: z.number().positive('byteSize must be greater than 0'),
      classification: z.nativeEnum(AssetSecurityClassification),
      retentionCategory: z.nativeEnum(AssetRetentionCategory).optional(),
      expiresAt: z.string().optional()
    });

    // POST /upload-locator
    router.post('/upload-locator', asyncHandler(async (req: Request, res: Response) => {
      try {
        const payload = requestUploadLocatorSchema.parse(req.body);
        const result = await ingestAssetUseCase.requestUploadLocator(payload as RequestAssetUploadLocatorDto);
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'REQUEST_ASSET_UPLOAD',
          category: 'ASSET_PLATFORM',
          targetType: 'ASSET',
          targetId: payload.assetId,
          result: 'SUCCESS',
          metadata: { mimeType: payload.mimeType, classification: payload.classification }
        });
        res.status(201).json(result);
      } catch (error: any) {
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'REQUEST_ASSET_UPLOAD',
          category: 'ASSET_PLATFORM',
          targetType: 'ASSET',
          targetId: req.body?.assetId,
          result: 'FAILURE',
          error
        });
        throw error;
      }
    }));

    // POST /register-quarantined
    router.post('/register-quarantined', asyncHandler(async (req: Request, res: Response) => {
      try {
        const payload = registerQuarantinedSchema.parse(req.body);
        const result = await ingestAssetUseCase.registerQuarantinedAsset(payload as RegisterQuarantinedAssetDto);
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'REGISTER_QUARANTINED_ASSET',
          category: 'ASSET_PLATFORM',
          targetType: 'ASSET',
          targetId: payload.assetId,
          result: 'SUCCESS',
          metadata: { mimeType: payload.mimeType }
        });
        res.status(201).json(result);
      } catch (error: any) {
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'REGISTER_QUARANTINED_ASSET',
          category: 'ASSET_PLATFORM',
          targetType: 'ASSET',
          targetId: req.body?.assetId,
          result: 'FAILURE',
          error
        });
        throw error;
      }
    }));

    // POST /:assetId/validate
    router.post('/:assetId/validate', asyncHandler(async (req: Request, res: Response) => {
      const assetId = req.params.assetId;
      if (/^https?:\/\//i.test(assetId.trim())) {
        return res.status(400).json({ error: 'AssetId must be a Phase 05 EAP handle, not a raw URL' });
      }
      try {
        const result = await processAssetLifecycleUseCase.validateAsset({ assetId });
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'VALIDATE_ASSET',
          category: 'ASSET_PLATFORM',
          targetType: 'ASSET',
          targetId: assetId,
          result: 'SUCCESS'
        });
        res.json(result);
      } catch (error: any) {
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'VALIDATE_ASSET',
          category: 'ASSET_PLATFORM',
          targetType: 'ASSET',
          targetId: assetId,
          result: 'FAILURE',
          error
        });
        throw error;
      }
    }));

    // POST /:assetId/malware-failed
    router.post('/:assetId/malware-failed', asyncHandler(async (req: Request, res: Response) => {
      const assetId = req.params.assetId;
      if (/^https?:\/\//i.test(assetId.trim())) {
        return res.status(400).json({ error: 'AssetId must be a Phase 05 EAP handle, not a raw URL' });
      }
      const reason = req.body?.reason || 'Malware scan failed';
      try {
        const result = await processAssetLifecycleUseCase.markMalwareScanFailed({ assetId, reason });
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'MARK_ASSET_MALWARE_FAILED',
          category: 'ASSET_PLATFORM',
          targetType: 'ASSET',
          targetId: assetId,
          result: 'SUCCESS',
          metadata: { reason }
        });
        res.json(result);
      } catch (error: any) {
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'MARK_ASSET_MALWARE_FAILED',
          category: 'ASSET_PLATFORM',
          targetType: 'ASSET',
          targetId: assetId,
          result: 'FAILURE',
          error
        });
        throw error;
      }
    }));

    // POST /:assetId/sanitize
    router.post('/:assetId/sanitize', asyncHandler(async (req: Request, res: Response) => {
      const assetId = req.params.assetId;
      if (/^https?:\/\//i.test(assetId.trim())) {
        return res.status(400).json({ error: 'AssetId must be a Phase 05 EAP handle, not a raw URL' });
      }
      const { exifStripped, sanitizerNotes } = req.body || {};
      try {
        const result = await processAssetLifecycleUseCase.sanitizeAsset({
          assetId,
          exifStripped,
          sanitizerNotes
        });
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'SANITIZE_ASSET',
          category: 'ASSET_PLATFORM',
          targetType: 'ASSET',
          targetId: assetId,
          result: 'SUCCESS',
          metadata: { exifStripped }
        });
        res.json(result);
      } catch (error: any) {
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'SANITIZE_ASSET',
          category: 'ASSET_PLATFORM',
          targetType: 'ASSET',
          targetId: assetId,
          result: 'FAILURE',
          error
        });
        throw error;
      }
    }));

    // POST /:assetId/activate
    router.post('/:assetId/activate', asyncHandler(async (req: Request, res: Response) => {
      const assetId = req.params.assetId;
      if (/^https?:\/\//i.test(assetId.trim())) {
        return res.status(400).json({ error: 'AssetId must be a Phase 05 EAP handle, not a raw URL' });
      }
      const { cleanBucketName, cleanPathKey, checksumAlgorithm, checksumHash } = req.body || {};
      try {
        const result = await processAssetLifecycleUseCase.activateAsset({
          assetId,
          cleanBucketName,
          cleanPathKey,
          checksumAlgorithm,
          checksumHash
        });
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'ACTIVATE_ASSET',
          category: 'ASSET_PLATFORM',
          targetType: 'ASSET',
          targetId: assetId,
          result: 'SUCCESS'
        });
        res.json(result);
      } catch (error: any) {
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'ACTIVATE_ASSET',
          category: 'ASSET_PLATFORM',
          targetType: 'ASSET',
          targetId: assetId,
          result: 'FAILURE',
          error
        });
        throw error;
      }
    }));

    // POST /:assetId/archive
    router.post('/:assetId/archive', asyncHandler(async (req: Request, res: Response) => {
      const assetId = req.params.assetId;
      if (/^https?:\/\//i.test(assetId.trim())) {
        return res.status(400).json({ error: 'AssetId must be a Phase 05 EAP handle, not a raw URL' });
      }
      try {
        const result = await processAssetLifecycleUseCase.archiveAsset({ assetId });
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'ARCHIVE_ASSET',
          category: 'ASSET_PLATFORM',
          targetType: 'ASSET',
          targetId: assetId,
          result: 'SUCCESS'
        });
        res.json(result);
      } catch (error: any) {
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'ARCHIVE_ASSET',
          category: 'ASSET_PLATFORM',
          targetType: 'ASSET',
          targetId: assetId,
          result: 'FAILURE',
          error
        });
        throw error;
      }
    }));

    // DELETE /:assetId
    router.delete('/:assetId', asyncHandler(async (req: Request, res: Response) => {
      const assetId = req.params.assetId;
      if (/^https?:\/\//i.test(assetId.trim())) {
        return res.status(400).json({ error: 'AssetId must be a Phase 05 EAP handle, not a raw URL' });
      }
      try {
        const result = await processAssetLifecycleUseCase.softDeleteAsset({ assetId });
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'SOFT_DELETE_ASSET',
          category: 'ASSET_PLATFORM',
          targetType: 'ASSET',
          targetId: assetId,
          result: 'SUCCESS'
        });
        res.json(result);
      } catch (error: any) {
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'SOFT_DELETE_ASSET',
          category: 'ASSET_PLATFORM',
          targetType: 'ASSET',
          targetId: assetId,
          result: 'FAILURE',
          error
        });
        throw error;
      }
    }));

    // POST /:assetId/restore
    router.post('/:assetId/restore', asyncHandler(async (req: Request, res: Response) => {
      const assetId = req.params.assetId;
      if (/^https?:\/\//i.test(assetId.trim())) {
        return res.status(400).json({ error: 'AssetId must be a Phase 05 EAP handle, not a raw URL' });
      }
      try {
        const result = await processAssetLifecycleUseCase.restoreAsset({ assetId });
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'RESTORE_ASSET',
          category: 'ASSET_PLATFORM',
          targetType: 'ASSET',
          targetId: assetId,
          result: 'SUCCESS'
        });
        res.json(result);
      } catch (error: any) {
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'RESTORE_ASSET',
          category: 'ASSET_PLATFORM',
          targetType: 'ASSET',
          targetId: assetId,
          result: 'FAILURE',
          error
        });
        throw error;
      }
    }));

    // DELETE /:assetId/purge
    router.delete('/:assetId/purge', asyncHandler(async (req: Request, res: Response) => {
      const assetId = req.params.assetId;
      if (/^https?:\/\//i.test(assetId.trim())) {
        return res.status(400).json({ error: 'AssetId must be a Phase 05 EAP handle, not a raw URL' });
      }
      try {
        await processAssetLifecycleUseCase.purgeAsset({ assetId });
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'PURGE_ASSET',
          category: 'ASSET_PLATFORM',
          targetType: 'ASSET',
          targetId: assetId,
          result: 'SUCCESS'
        });
        res.status(200).json({ success: true, message: `Asset ${assetId} purged successfully` });
      } catch (error: any) {
        await AuditHelper.recordMutation(auditRecordRepo, req, {
          action: 'PURGE_ASSET',
          category: 'ASSET_PLATFORM',
          targetType: 'ASSET',
          targetId: assetId,
          result: 'FAILURE',
          error
        });
        throw error;
      }
    }));

    // Router error handler for Zod and Use Case errors
    router.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation Error', details: err.issues });
      }
      return res.status(400).json({ error: err.message || 'An error occurred' });
    });

    return router;
  }
}

