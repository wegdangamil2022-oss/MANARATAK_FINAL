import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { ImportAdminRouter } from '../../../../src/presentation/api/router/ImportAdminRouter';
import { ImportTargetDomain } from '@manaratak/domain';

describe('ImportAdminRouter', () => {
  beforeEach(() => {
    process.env.WP1_RECOVERY_GATE = 'CLOSED';
    process.env.ALLOW_DATABASE_MUTATIONS = 'YES';
  });

  afterEach(() => {
    delete process.env.WP1_RECOVERY_GATE;
    delete process.env.ALLOW_DATABASE_MUTATIONS;
  });
  const createMockUseCases = () => ({
    importData: vi.fn(),
    getQueueJobStatus: vi.fn(),
    pauseQueueJob: vi.fn(),
    resumeQueueJob: vi.fn(),
    cancelQueueJob: vi.fn(),
    replayQueueJob: vi.fn(),
    listBatches: vi.fn(),
    listRecords: vi.fn(),
    previewMajorCatalogText: vi.fn(),
    previewMajorDetailDossierText: vi.fn(),
    previewMajorCatalogFiles: vi.fn(),
    previewMajorDetailDossierFiles: vi.fn(),
    importMajorCatalogText: vi.fn(),
    importMajorDetailDossierText: vi.fn(),
    importMajorCatalogFiles: vi.fn(),
    importMajorDetailDossierFiles: vi.fn()
  });
  
  const createMockRepository = () => ({
    getRecordById: vi.fn(),
    getBatchById: vi.fn(),
    listRecords: vi.fn(),
    updateRecord: vi.fn()
  });

  const createMockPromotionUseCase = () => ({
    promote: vi.fn()
  });

  const createApp = (useCases: any, repository?: any, promotionUseCase?: any, majorPromotionUseCase?: any, fellowshipPromotionUseCase?: any) => {
    const app = express();
    app.use(express.json());
    app.use('/admin/imports', ImportAdminRouter.create({
      importAdminUseCases: useCases,
      majorImportStagingUseCase: useCases,
      importRepository: repository,
      internationalTestImportPromotionUseCase: promotionUseCase,
      majorImportPromotionUseCase: majorPromotionUseCase,
      fellowshipImportPromotionUseCase: fellowshipPromotionUseCase
    }));
    return app;
  };

  describe('Phase 10 major import preview endpoints', () => {
    it('POST /admin/imports/major-catalogs/preview returns parsed catalog preview', async () => {
      const useCases = createMockUseCases();
      useCases.previewMajorCatalogText.mockReturnValue({
        summary: { catalogKind: 'BACHELOR', totalRecords: 1 },
        previewRows: [{ code: 'MJR-0100', canonicalMajorName: 'Computer Science' }]
      });
      const app = createApp(useCases);

      const res = await request(app)
        .post('/admin/imports/major-catalogs/preview')
        .send({
          catalogKind: 'BACHELOR',
          sourceFileName: 'sample.md',
          dataText: '| MJR-0100 | علوم الحاسب | Computer Science |'
        });

      expect(res.status).toBe(200);
      expect(res.body.summary.totalRecords).toBe(1);
      expect(useCases.previewMajorCatalogText).toHaveBeenCalledWith(expect.objectContaining({
        catalogKind: 'BACHELOR',
        sourceFileName: 'sample.md',
      }));
    });

    it('POST /admin/imports/major-detail-dossiers/preview returns parsed detail preview', async () => {
      const useCases = createMockUseCases();
      useCases.previewMajorDetailDossierText.mockReturnValue({
        summary: { catalogKind: 'MASTER', totalRecords: 1, totalContentSections: 2 },
        previewRows: [{ code: 'MAS-0001', contentSectionCount: 2 }]
      });
      const app = createApp(useCases);

      const res = await request(app)
        .post('/admin/imports/major-detail-dossiers/preview')
        .send({
          catalogKind: 'MASTER',
          sourceFileName: 'masters.md',
          dataText: '# 1. علوم البيانات — Data Science\nالكود: MAS-0001\n## النبذة\nنص'
        });

      expect(res.status).toBe(200);
      expect(res.body.summary.totalContentSections).toBe(2);
      expect(useCases.previewMajorDetailDossierText).toHaveBeenCalledWith(expect.objectContaining({
        catalogKind: 'MASTER',
        sourceFileName: 'masters.md',
      }));
    });

    it('POST /admin/imports/major-detail-dossiers/bulk/preview previews multiple files', async () => {
      const useCases = createMockUseCases();
      useCases.previewMajorDetailDossierFiles.mockReturnValue({
        summary: { catalogKind: 'BACHELOR', totalFiles: 2, totalRecords: 20, totalContentSections: 280 },
        files: []
      });
      const app = createApp(useCases);

      const res = await request(app)
        .post('/admin/imports/major-detail-dossiers/bulk/preview')
        .send({
          catalogKind: 'BACHELOR',
          files: [
            { sourceFileName: 'medicine-01.md', dataText: '# 1. A â€” A\nMJR-0001' },
            { sourceFileName: 'medicine-02.md', dataText: '# 2. B â€” B\nMJR-0002' },
          ]
        });

      expect(res.status).toBe(200);
      expect(res.body.summary).toMatchObject({ totalFiles: 2, totalRecords: 20 });
      expect(useCases.previewMajorDetailDossierFiles).toHaveBeenCalledWith(expect.objectContaining({
        catalogKind: 'BACHELOR',
        files: expect.arrayContaining([
          expect.objectContaining({ sourceFileName: 'medicine-01.md' }),
          expect.objectContaining({ sourceFileName: 'medicine-02.md' }),
        ]),
      }));
    });

    it('POST /admin/imports/major-detail-dossiers/bulk imports multiple files', async () => {
      const useCases = createMockUseCases();
      useCases.importMajorDetailDossierFiles.mockResolvedValue({
        summary: { catalogKind: 'BACHELOR', totalFiles: 2, totalRecords: 20, stagedRecords: 20 },
        files: [{ batch: { id: 'batch-1' } }, { batch: { id: 'batch-2' } }]
      });
      const app = createApp(useCases);

      const res = await request(app)
        .post('/admin/imports/major-detail-dossiers/bulk')
        .send({
          catalogKind: 'BACHELOR',
          sourceSystem: 'PHASE_10_BULK_DETAILS',
          files: [
            { sourceFileName: 'medicine-01.md', dataText: '# 1. A â€” A\nMJR-0001' },
            { sourceFileName: 'medicine-02.md', dataText: '# 2. B â€” B\nMJR-0002' },
          ]
        });

      expect(res.status).toBe(201);
      expect(res.body.summary).toMatchObject({ totalFiles: 2, stagedRecords: 20 });
      expect(useCases.importMajorDetailDossierFiles).toHaveBeenCalledWith(expect.objectContaining({
        catalogKind: 'BACHELOR',
        sourceSystem: 'PHASE_10_BULK_DETAILS',
      }));
    });
  });

  describe('POST /admin/imports/records/:id/promote', () => {
    it('blocks promotion until the database recovery gate is explicitly closed', async () => {
      delete process.env.WP1_RECOVERY_GATE;
      delete process.env.ALLOW_DATABASE_MUTATIONS;
      const useCases = createMockUseCases();
      const repo = createMockRepository();
      const promoteUseCase = createMockPromotionUseCase();
      repo.getRecordById.mockResolvedValue({ id: 'rec-1', targetDomain: ImportTargetDomain.Tests });
      const app = createApp(useCases, repo, promoteUseCase);

      const res = await request(app).post('/admin/imports/records/rec-1/promote');

      expect(res.status).toBe(423);
      expect(res.body.error).toBe('DATABASE_MUTATION_BLOCKED');
      expect(promoteUseCase.promote).not.toHaveBeenCalled();
    });
    it('returns 422 for unsupported domains safely', async () => {
      const useCases = createMockUseCases();
      const repo = createMockRepository();
      repo.getRecordById.mockResolvedValue({ id: 'rec-1', targetDomain: ImportTargetDomain.Universities });
      
      const app = createApp(useCases, repo);
      const res = await request(app).post('/admin/imports/records/rec-1/promote');
      
      expect(res.status).toBe(422);
      expect(res.body.error).toContain('Domain promotion is disabled in Phase 06');
    });

    it('routes TESTS target to InternationalTestImportPromotionUseCase safely', async () => {
      const useCases = createMockUseCases();
      const repo = createMockRepository();
      const promoteUseCase = createMockPromotionUseCase();
      
      repo.getRecordById.mockResolvedValue({ id: 'rec-1', targetDomain: ImportTargetDomain.Tests });
      promoteUseCase.promote.mockResolvedValue({ type: 'CREATED', testId: 'new-test-id' });
      
      const app = createApp(useCases, repo, promoteUseCase);
      const res = await request(app).post('/admin/imports/records/rec-1/promote');
      
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ type: 'CREATED', testId: 'new-test-id' });
      expect(promoteUseCase.promote).toHaveBeenCalledWith({ id: 'rec-1', targetDomain: ImportTargetDomain.Tests });
    });

    it('returns safe 422 response if use case returns REJECTED', async () => {
      const useCases = createMockUseCases();
      const repo = createMockRepository();
      const promoteUseCase = createMockPromotionUseCase();
      
      repo.getRecordById.mockResolvedValue({ id: 'rec-1', targetDomain: ImportTargetDomain.Tests });
      promoteUseCase.promote.mockResolvedValue({ type: 'REJECTED', reason: 'Invalid payload' });
      
      const app = createApp(useCases, repo, promoteUseCase);
      const res = await request(app).post('/admin/imports/records/rec-1/promote');
      
      expect(res.status).toBe(422);
      expect(res.body).toEqual({ type: 'REJECTED', reason: 'Invalid payload' });
    });

    it('routes MAJORS target to MajorImportPromotionUseCase and marks record promoted', async () => {
      const useCases = createMockUseCases();
      const repo = createMockRepository();
      const majorPromotionUseCase = createMockPromotionUseCase();

      repo.getRecordById.mockResolvedValue({ id: 'rec-major-1', targetDomain: ImportTargetDomain.Majors });
      majorPromotionUseCase.promote.mockResolvedValue({ type: 'CREATED', majorId: 'major-1' });

      const app = createApp(useCases, repo, undefined, majorPromotionUseCase);
      const res = await request(app).post('/admin/imports/records/rec-major-1/promote');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ type: 'CREATED', majorId: 'major-1' });
      expect(majorPromotionUseCase.promote).toHaveBeenCalledWith({ id: 'rec-major-1', targetDomain: ImportTargetDomain.Majors });
      expect(repo.updateRecord).toHaveBeenCalledWith('rec-major-1', expect.objectContaining({
        status: 'PROMOTED',
        promotedEntityId: 'major-1'
      }));
    });
  });

  describe('POST /admin/imports/batches/:id/promote', () => {
    it('promotes MAJORS batch records and returns a summary', async () => {
      const useCases = createMockUseCases();
      const repo = createMockRepository();
      const majorPromotionUseCase = createMockPromotionUseCase();

      repo.getBatchById.mockResolvedValue({ id: 'batch-major-1', dataType: ImportTargetDomain.Majors });
      repo.listRecords.mockResolvedValue({ data: [{ id: 'rec-1', batchId: 'batch-major-1', status: 'NEEDS_REVIEW' }], total: 1, page: 1, pageSize: 100 });
      majorPromotionUseCase.promote.mockResolvedValue({ type: 'VERSION_CREATED', existingId: 'major-1', versionNumber: 2 });

      const app = createApp(useCases, repo, undefined, majorPromotionUseCase);
      const res = await request(app).post('/admin/imports/batches/batch-major-1/promote');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        batchId: 'batch-major-1',
        dataType: ImportTargetDomain.Majors,
        promoted: 1,
        failed: 0
      });
      expect(repo.updateRecord).toHaveBeenCalledWith('rec-1', expect.objectContaining({
        status: 'PROMOTED',
        promotedEntityId: 'major-1'
      }));
    });

    it('promotes FELLOWSHIPS batch records through the dedicated fellowship path', async () => {
      const useCases = createMockUseCases();
      const repo = createMockRepository();
      const fellowshipPromotionUseCase = createMockPromotionUseCase();

      repo.getBatchById.mockResolvedValue({ id: 'batch-fellowship-1', dataType: ImportTargetDomain.Fellowships });
      repo.listRecords.mockResolvedValue({ data: [{ id: 'rec-fel-1', batchId: 'batch-fellowship-1', status: 'NEEDS_REVIEW' }], total: 1, page: 1, pageSize: 100 });
      fellowshipPromotionUseCase.promote.mockResolvedValue({ type: 'CREATED', fellowshipId: 'fellowship-1' });

      const app = createApp(useCases, repo, undefined, createMockPromotionUseCase(), fellowshipPromotionUseCase);
      const res = await request(app).post('/admin/imports/batches/batch-fellowship-1/promote');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        batchId: 'batch-fellowship-1',
        dataType: ImportTargetDomain.Fellowships,
        promoted: 1,
        failed: 0
      });
      expect(fellowshipPromotionUseCase.promote).toHaveBeenCalledWith(expect.objectContaining({
        id: 'rec-fel-1',
        batch: { id: 'batch-fellowship-1', dataType: ImportTargetDomain.Fellowships }
      }));
      expect(repo.updateRecord).toHaveBeenCalledWith('rec-fel-1', expect.objectContaining({
        status: 'PROMOTED',
        promotedEntityId: 'fellowship-1'
      }));
    });
  });
});
