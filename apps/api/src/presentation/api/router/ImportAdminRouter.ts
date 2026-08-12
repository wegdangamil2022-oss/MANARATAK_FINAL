import { Router, Request, Response, NextFunction } from 'express';
import { readFile } from 'fs/promises';
import * as path from 'path';
import { z } from 'zod';
import { ImportAdminUseCases, MajorImportStagingUseCase } from '@manaratak/application';
import { ImportRecordDto, ImportRecordStatus, ImportTargetDomain } from '@manaratak/domain';

type ImportBatchLike = {
  id?: string;
  dataType?: string;
};

type ImportRecordWithBatch = ImportRecordDto & {
  batchId?: string;
  targetDomain?: string;
  batch?: ImportBatchLike;
};

export class ImportAdminRouter {
  public static create(cradle: { 
    importAdminUseCases: ImportAdminUseCases;
    majorImportStagingUseCase: MajorImportStagingUseCase;
    importRepository?: {
      getRecordById(id: string): Promise<ImportRecordWithBatch | null>;
      getBatchById?(id: string): Promise<ImportBatchLike | null>;
      listRecords?(filters?: { batchId?: string; page?: number; pageSize?: number }): Promise<{ data: ImportRecordWithBatch[]; total: number; page: number; pageSize: number }>;
      updateRecord?(id: string, updates: { status?: string; validationErrors?: unknown; promotedEntityId?: string; processingNotes?: string }): Promise<ImportRecordWithBatch | null>;
    };
    internationalTestImportPromotionUseCase?: { promote(record: ImportRecordWithBatch): Promise<{ type: string }> };
    majorImportPromotionUseCase?: { promote(record: ImportRecordWithBatch): Promise<{ type: string; majorId?: string; existingId?: string; versionNumber?: number; reason?: string; error?: string }> };
    fellowshipImportPromotionUseCase?: { promote(record: ImportRecordWithBatch): Promise<{ type: string; fellowshipId?: string; existingId?: string; reason?: string; error?: string }> };
  }): Router {
    const router = Router();
    const {
      importAdminUseCases,
      majorImportStagingUseCase,
      importRepository,
      internationalTestImportPromotionUseCase,
      majorImportPromotionUseCase,
      fellowshipImportPromotionUseCase,
    } = cradle;

    type RouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;
    const asyncHandler = (fn: RouteHandler) => (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

    const INLINE_IMPORT_MAX_LENGTH = 90 * 1024; // 90KB max string length
    const DEFAULT_PAGE = 1;
    const DEFAULT_PAGE_SIZE = 50;
    const MAX_PAGE_SIZE = 100;
    const MAJOR_CATALOG_FILES = {
      BACHELOR: 'MANARATAK_Bachelor_Majors_By_Colleges_v1.0.md',
      MASTER: 'MANARATAK_Master_Specializations_By_Academic_Fields_v1.0.md',
      DOCTORATE: 'MANARATAK_Doctoral_Specializations_By_Academic_Fields_v1.0.md',
      FELLOWSHIP: 'MANARATAK_Fellowships_By_Professional_Domains_v1.0.md',
    } as const;
    const MAJOR_DETAIL_DOSSIER_FILES = {
      BACHELOR: 'MANARATAK_Bachelor_Majors_Medicine_01_First_10.md',
      MASTER: 'masters_MAS-0001_to_MAS-0010.md',
      DOCTORATE: 'doctorates_DOC-0001_to_DOC-0010.md',
      FELLOWSHIP: 'fellowships_FEL-0001_to_FEL-0010.md',
    } as const;
    const MAJOR_DETAIL_SUBDIRS = {
      BACHELOR: 'bachelor',
      MASTER: 'master',
      DOCTORATE: 'doctorate',
      FELLOWSHIP: '',
    } as const;

    const majorCatalogKindSchema = z.enum(['BACHELOR', 'MASTER', 'DOCTORATE', 'FELLOWSHIP']);
    
    const importBodySchema = z.object({
      dataText: z.string()
        .min(1, 'Import text or CSV content is required')
        .max(INLINE_IMPORT_MAX_LENGTH, 'Import payload is too large. Large imports must use the future artifact/EAP import flow. Inline dataText is only for small/manual imports.'),
      sourceSystem: z.string().optional(),
      dataType: z.nativeEnum(ImportTargetDomain)
        .or(z.literal('INTERNATIONAL_TESTS'))
        .optional()
        .transform(val => val === 'INTERNATIONAL_TESTS' ? ImportTargetDomain.Tests : val),
    });

    const majorCatalogBodySchema = z.object({
      dataText: z.string().min(1).optional(),
      catalogKind: majorCatalogKindSchema,
      sourceSystem: z.string().optional(),
      sourceFileName: z.string().optional(),
    }).refine((value) => Boolean(value.dataText), {
      message: 'dataText is required for direct catalog import.',
      path: ['dataText'],
    });

    const majorDetailDossierBodySchema = z.object({
      dataText: z.string().min(1).optional(),
      catalogKind: majorCatalogKindSchema,
      sourceSystem: z.string().optional(),
      sourceFileName: z.string().optional(),
    }).refine((value) => Boolean(value.dataText), {
      message: 'dataText is required for direct detail dossier import.',
      path: ['dataText'],
    });

    const majorTextImportFileSchema = z.object({
      dataText: z.string().min(1),
      sourceSystem: z.string().optional(),
      sourceFileName: z.string().optional(),
    });

    const majorMultiFileBodySchema = z.object({
      catalogKind: majorCatalogKindSchema,
      sourceSystem: z.string().optional(),
      files: z.array(majorTextImportFileSchema).min(1).max(50),
    });

    // POST /admin/imports
    router.post('/', asyncHandler(async (req: Request, res: Response) => {
       const payload = importBodySchema.parse(req.body);
       const result = await importAdminUseCases.importData(payload);
       res.status(201).json(result);
     }));

    router.post('/major-catalogs', asyncHandler(async (req: Request, res: Response) => {
      const payload = majorCatalogBodySchema.parse(req.body);
      const result = await majorImportStagingUseCase.importMajorCatalogText({
        dataText: payload.dataText ?? '',
        catalogKind: payload.catalogKind,
        sourceSystem: payload.sourceSystem,
        sourceFileName: payload.sourceFileName,
      });
      res.status(201).json(result);
    }));

    router.post('/major-catalogs/preview', asyncHandler(async (req: Request, res: Response) => {
      const payload = majorCatalogBodySchema.parse(req.body);
      const result = majorImportStagingUseCase.previewMajorCatalogText({
        dataText: payload.dataText ?? '',
        catalogKind: payload.catalogKind,
        sourceFileName: payload.sourceFileName,
      });
      res.status(200).json(result);
    }));

    router.post('/major-catalogs/bulk', asyncHandler(async (req: Request, res: Response) => {
      const payload = majorMultiFileBodySchema.parse(req.body);
      const result = await majorImportStagingUseCase.importMajorCatalogFiles({
        catalogKind: payload.catalogKind,
        sourceSystem: payload.sourceSystem,
        files: payload.files,
      });
      res.status(201).json(result);
    }));

    router.post('/major-catalogs/bulk/preview', asyncHandler(async (req: Request, res: Response) => {
      const payload = majorMultiFileBodySchema.parse(req.body);
      const result = majorImportStagingUseCase.previewMajorCatalogFiles({
        catalogKind: payload.catalogKind,
        sourceSystem: payload.sourceSystem,
        files: payload.files,
      });
      res.status(200).json(result);
    }));

    router.post('/major-catalogs/workspace/:catalogKind', asyncHandler(async (req: Request, res: Response) => {
      const catalogKind = majorCatalogKindSchema.parse(req.params.catalogKind);
      const sourceFileName = MAJOR_CATALOG_FILES[catalogKind];
      const catalogPath = path.resolve(process.cwd(), 'workspace', 'phase-10-major-catalogs', sourceFileName);
      const dataText = await readFile(catalogPath, 'utf8');

      const result = await majorImportStagingUseCase.importMajorCatalogText({
        dataText,
        catalogKind,
        sourceSystem: `PHASE_10_${catalogKind}_CATALOG`,
        sourceFileName,
      });
      res.status(201).json(result);
    }));

    router.get('/major-catalogs/workspace/:catalogKind/preview', asyncHandler(async (req: Request, res: Response) => {
      const catalogKind = majorCatalogKindSchema.parse(req.params.catalogKind);
      const sourceFileName = MAJOR_CATALOG_FILES[catalogKind];
      const catalogPath = path.resolve(process.cwd(), 'workspace', 'phase-10-major-catalogs', sourceFileName);
      const dataText = await readFile(catalogPath, 'utf8');

      const result = majorImportStagingUseCase.previewMajorCatalogText({
        dataText,
        catalogKind,
        sourceFileName,
      });
      res.status(200).json(result);
    }));

    router.post('/major-detail-dossiers', asyncHandler(async (req: Request, res: Response) => {
      const payload = majorDetailDossierBodySchema.parse(req.body);
      const result = await majorImportStagingUseCase.importMajorDetailDossierText({
        dataText: payload.dataText ?? '',
        catalogKind: payload.catalogKind,
        sourceSystem: payload.sourceSystem,
        sourceFileName: payload.sourceFileName,
      });
      res.status(201).json(result);
    }));

    router.post('/major-detail-dossiers/preview', asyncHandler(async (req: Request, res: Response) => {
      const payload = majorDetailDossierBodySchema.parse(req.body);
      const result = majorImportStagingUseCase.previewMajorDetailDossierText({
        dataText: payload.dataText ?? '',
        catalogKind: payload.catalogKind,
        sourceFileName: payload.sourceFileName,
      });
      res.status(200).json(result);
    }));

    router.post('/major-detail-dossiers/bulk', asyncHandler(async (req: Request, res: Response) => {
      const payload = majorMultiFileBodySchema.parse(req.body);
      const result = await majorImportStagingUseCase.importMajorDetailDossierFiles({
        catalogKind: payload.catalogKind,
        sourceSystem: payload.sourceSystem,
        files: payload.files,
      });
      res.status(201).json(result);
    }));

    router.post('/major-detail-dossiers/bulk/preview', asyncHandler(async (req: Request, res: Response) => {
      const payload = majorMultiFileBodySchema.parse(req.body);
      const result = majorImportStagingUseCase.previewMajorDetailDossierFiles({
        catalogKind: payload.catalogKind,
        sourceSystem: payload.sourceSystem,
        files: payload.files,
      });
      res.status(200).json(result);
    }));

    router.post('/major-detail-dossiers/workspace/:catalogKind', asyncHandler(async (req: Request, res: Response) => {
      const catalogKind = majorCatalogKindSchema.parse(req.params.catalogKind);
      const sourceFileName = MAJOR_DETAIL_DOSSIER_FILES[catalogKind];
      const subDir = MAJOR_DETAIL_SUBDIRS[catalogKind] || '';
      const dossierPath = path.resolve(process.cwd(), 'workspace', 'phase-10-major-detail-dossiers', subDir, sourceFileName);
      const dataText = await readFile(dossierPath, 'utf8');

      const result = await majorImportStagingUseCase.importMajorDetailDossierText({
        dataText,
        catalogKind,
        sourceSystem: `PHASE_10_${catalogKind}_DETAIL_DOSSIER`,
        sourceFileName,
      });
      res.status(201).json(result);
    }));

    router.get('/major-detail-dossiers/workspace/:catalogKind/preview', asyncHandler(async (req: Request, res: Response) => {
      const catalogKind = majorCatalogKindSchema.parse(req.params.catalogKind);
      const sourceFileName = MAJOR_DETAIL_DOSSIER_FILES[catalogKind];
      const subDir = MAJOR_DETAIL_SUBDIRS[catalogKind] || '';
      const dossierPath = path.resolve(process.cwd(), 'workspace', 'phase-10-major-detail-dossiers', subDir, sourceFileName);
      const dataText = await readFile(dossierPath, 'utf8');

      const result = majorImportStagingUseCase.previewMajorDetailDossierText({
        dataText,
        catalogKind,
        sourceFileName,
      });
      res.status(200).json(result);
    }));

    // GET /admin/imports/queue/jobs/:batchId
    router.get('/queue/jobs/:batchId', asyncHandler(async (req: Request, res: Response) => {
      const batchId = req.params.batchId;
      const status = await importAdminUseCases.getQueueJobStatus(batchId);
      if (!status) {
        return res.status(404).json({ error: `Queue job status not found for batchId: ${batchId}` });
      }
      res.json(status);
    }));

    // POST /admin/imports/queue/jobs/:batchId/pause
    router.post('/queue/jobs/:batchId/pause', asyncHandler(async (req: Request, res: Response) => {
      const batchId = req.params.batchId;
      const { reason } = req.body || {};
      const success = await importAdminUseCases.pauseQueueJob(batchId, reason);
      if (!success) {
        return res.status(409).json({ error: 'Queue job action is not valid for current state or job does not exist.' });
      }
      res.json({ status: 'ok', action: 'pause', batchId });
    }));

    // POST /admin/imports/queue/jobs/:batchId/resume
    router.post('/queue/jobs/:batchId/resume', asyncHandler(async (req: Request, res: Response) => {
      const batchId = req.params.batchId;
      const success = await importAdminUseCases.resumeQueueJob(batchId);
      if (!success) {
        return res.status(409).json({ error: 'Queue job action is not valid for current state or job does not exist.' });
      }
      res.json({ status: 'ok', action: 'resume', batchId });
    }));

    // POST /admin/imports/queue/jobs/:batchId/cancel
    router.post('/queue/jobs/:batchId/cancel', asyncHandler(async (req: Request, res: Response) => {
      const batchId = req.params.batchId;
      const { reason } = req.body || {};
      const success = await importAdminUseCases.cancelQueueJob(batchId, reason);
      if (!success) {
        return res.status(409).json({ error: 'Queue job action is not valid for current state or job does not exist.' });
      }
      res.json({ status: 'ok', action: 'cancel', batchId });
    }));

    // POST /admin/imports/queue/jobs/:batchId/replay
    router.post('/queue/jobs/:batchId/replay', asyncHandler(async (req: Request, res: Response) => {
      const batchId = req.params.batchId;
      const { fromCheckpoint } = req.body || {};
      const success = await importAdminUseCases.replayQueueJob(batchId, typeof fromCheckpoint === 'boolean' ? fromCheckpoint : undefined);
      if (!success) {
        return res.status(409).json({ error: 'Queue job action is not valid for current state or job does not exist.' });
      }
      res.json({ status: 'ok', action: 'replay', batchId });
    }));

    // GET /admin/imports/batches
    router.get('/batches', asyncHandler(async (req: Request, res: Response) => {
      let dataTypeFilter = req.query.dataType === 'ALL' || !req.query.dataType ? undefined : req.query.dataType as string;
      if (dataTypeFilter === 'INTERNATIONAL_TESTS') {
        dataTypeFilter = ImportTargetDomain.Tests;
      }
      
      if (dataTypeFilter && !(Object.values(ImportTargetDomain) as string[]).includes(dataTypeFilter)) {
         return res.status(400).json({ error: 'Validation Error', details: [{ message: 'Invalid dataType filter' }] });
      }

      const batches = await importAdminUseCases.listBatches(dataTypeFilter ? { dataType: dataTypeFilter } : {});
      res.json(batches);
    }));

    // GET /admin/imports/records
    router.get('/records', asyncHandler(async (req: Request, res: Response) => {
      const batchId = req.query.batchId as string;
      const status = req.query.status as string;
      
      let dataTypeFilter = req.query.dataType === 'ALL' || !req.query.dataType ? undefined : req.query.dataType as string;
      if (dataTypeFilter === 'INTERNATIONAL_TESTS') {
        dataTypeFilter = ImportTargetDomain.Tests;
      }
      
      if (dataTypeFilter && !(Object.values(ImportTargetDomain) as string[]).includes(dataTypeFilter)) {
         return res.status(400).json({ error: 'Validation Error', details: [{ message: 'Invalid dataType filter' }] });
      }

      let page = parseInt(req.query.page as string, 10);
      if (isNaN(page) || page < 1) {
        page = DEFAULT_PAGE;
      }

      let pageSize = parseInt(req.query.pageSize as string, 10);
      if (isNaN(pageSize) || pageSize < 1) {
        pageSize = DEFAULT_PAGE_SIZE;
      } else if (pageSize > MAX_PAGE_SIZE) {
        pageSize = MAX_PAGE_SIZE;
      }

      const records = await importAdminUseCases.listRecords({
        batchId,
        status,
        dataType: dataTypeFilter,
        page,
        pageSize,
      });
      res.json(records);
    }));

    const promoteRecord = async (record: ImportRecordWithBatch) => {
      const batch = record.batch || (record.batchId ? await importRepository?.getBatchById?.(record.batchId) : undefined);
      const targetDomain = record.targetDomain || batch?.dataType;

      if (targetDomain === ImportTargetDomain.Tests || targetDomain === 'INTERNATIONAL_TESTS' || targetDomain === 'TESTS') {
        if (!internationalTestImportPromotionUseCase) {
           return { statusCode: 500, body: { error: 'International Test promotion use case not available' } };
        }

        const result = await internationalTestImportPromotionUseCase.promote(record);
        return { statusCode: result.type === 'REJECTED' || result.type === 'FAILED' ? 422 : 200, body: result };
      }

      if (targetDomain === ImportTargetDomain.Majors || targetDomain === 'MAJORS') {
        if (!majorImportPromotionUseCase) {
          return { statusCode: 500, body: { error: 'Major promotion use case not available' } };
        }

        const result = await majorImportPromotionUseCase.promote(record);
        if (importRepository?.updateRecord) {
          if (result.type === 'CREATED' || result.type === 'VERSION_CREATED' || result.type === 'DUPLICATE') {
            await importRepository.updateRecord(record.id as string, {
              status: ImportRecordStatus.PROMOTED,
              promotedEntityId: result.majorId || result.existingId,
              processingNotes: result.type === 'VERSION_CREATED'
                ? `Promoted into existing major as version ${result.versionNumber}.`
                : `Promoted to majors workspace with result ${result.type}.`,
            });
          } else {
            await importRepository.updateRecord(record.id as string, {
              status: ImportRecordStatus.FAILED,
              validationErrors: result.type === 'REJECTED' ? [result.reason] : [result.error],
              processingNotes: 'Major promotion failed; record remains reviewable from import logs.',
            });
          }
        }
        return { statusCode: result.type === 'REJECTED' || result.type === 'FAILED' ? 422 : 200, body: result };
      }

      if (targetDomain === ImportTargetDomain.Fellowships || targetDomain === 'FELLOWSHIPS') {
        if (!fellowshipImportPromotionUseCase) {
          return { statusCode: 500, body: { error: 'Fellowship promotion use case not available' } };
        }

        const result = await fellowshipImportPromotionUseCase.promote(record);
        if (importRepository?.updateRecord) {
          if (result.type === 'CREATED' || result.type === 'UPDATED') {
            await importRepository.updateRecord(record.id as string, {
              status: ImportRecordStatus.PROMOTED,
              promotedEntityId: result.fellowshipId || result.existingId,
              processingNotes: `Promoted to fellowship definitions workspace with result ${result.type}.`,
            });
          } else {
            await importRepository.updateRecord(record.id as string, {
              status: ImportRecordStatus.FAILED,
              validationErrors: result.type === 'REJECTED' ? [result.reason] : [result.error],
              processingNotes: 'Fellowship promotion failed; record remains reviewable from import logs.',
            });
          }
        }

        return { statusCode: result.type === 'REJECTED' || result.type === 'FAILED' ? 422 : 200, body: result };
      }

      return { statusCode: 422, body: { error: 'Domain promotion is disabled in Phase 06 and must be implemented by the owning domain phase.' } };
    };

    // POST /admin/imports/records/:id/promote
    router.post('/records/:id/promote', asyncHandler(async (req: Request, res: Response) => {
      const recordId = req.params.id;
      if (!importRepository) {
        return res.status(500).json({ error: 'Import repository not available' });
      }
      const record = await importRepository.getRecordById(recordId);
      if (!record) {
        return res.status(404).json({ error: 'Record not found' });
      }

      const result = await promoteRecord(record);
      res.status(result.statusCode).json(result.body);
    }));

    router.post('/batches/:id/promote', asyncHandler(async (req: Request, res: Response) => {
      const batchId = req.params.id;
      if (!importRepository?.getBatchById || !importRepository.listRecords) {
        return res.status(500).json({ error: 'Import repository batch promotion support is not available' });
      }

      const batch = await importRepository.getBatchById(batchId);
      if (!batch) {
        return res.status(404).json({ error: 'Batch not found' });
      }
      let page = 1;
      const pageSize = 100;
      let promoted = 0;
      let failed = 0;
      const results: Array<{ recordId?: string; result: unknown }> = [];

      while (true) {
        const recordsPage = await importRepository.listRecords({ batchId, page, pageSize });
        for (const record of recordsPage.data) {
          if (record.status === ImportRecordStatus.PROMOTED) {
            continue;
          }
          const result = await promoteRecord({ ...record, batch });
          if (result.statusCode >= 200 && result.statusCode < 300) {
            promoted++;
          } else {
            failed++;
          }
          if (results.length < 50) {
            results.push({ recordId: record.id as string | undefined, result: result.body });
          }
        }

        if (page * pageSize >= recordsPage.total) {
          break;
        }
        page++;
      }

      res.status(200).json({
        batchId,
        dataType: batch.dataType,
        promoted,
        failed,
        preview: results,
      });
    }));

    // POST /admin/imports/records/:id/transfer
    router.post('/records/:id/transfer', asyncHandler(async (req: Request, res: Response) => {
      res.status(422).json({ error: 'Domain promotion is disabled in Phase 06 and must be implemented by the owning domain phase.' });
    }));

    // POST /admin/imports/batches/:id/transfer
    router.post('/batches/:id/transfer', asyncHandler(async (req: Request, res: Response) => {
      res.status(422).json({ error: 'Domain promotion is disabled in Phase 06 and must be implemented by the owning domain phase.' });
    }));

    router.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation Error', details: err.issues });
      }
      res.status(400).json({ error: err instanceof Error ? err.message : 'An error occurred' });
    });

    return router;
  }
}
