import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ScholarshipStatus, ScholarshipCompletenessState, UpdateScholarshipDto, type IScholarshipRepository } from '@manaratak/domain';
import {
  AdminScholarshipUseCases,
  AtomicDomainMutationCoordinator,
  ImportAdminUseCases,
  ScholarshipImportAtomicTransferUseCase,
  ScholarshipImportCenterUseCases,
  type IScholarshipImportAtomicGateway,
  type IScholarshipImportCenterGateway,
  type ScholarshipImportOperationalClass,
} from '@manaratak/application';

export class ScholarshipAdminRouter {
  public static create(cradle: {
    adminScholarshipUseCases: AdminScholarshipUseCases;
    atomicDomainMutationCoordinator?: AtomicDomainMutationCoordinator;
    importAdminUseCases?: ImportAdminUseCases;
    importRepository?: IScholarshipImportCenterGateway;
    scholarshipRepository?: IScholarshipRepository;
  }): Router {
    const router = Router();
    const {
      adminScholarshipUseCases,
      atomicDomainMutationCoordinator,
      importAdminUseCases,
      importRepository,
      scholarshipRepository,
    } = cradle;
    const atomicImportGateway = importRepository as (IScholarshipImportCenterGateway & Partial<IScholarshipImportAtomicGateway>) | undefined;
    const atomicTransfer = atomicImportGateway && scholarshipRepository && atomicDomainMutationCoordinator && typeof atomicImportGateway.withTransaction === 'function'
      ? new ScholarshipImportAtomicTransferUseCase(
          atomicImportGateway as IScholarshipImportAtomicGateway,
          scholarshipRepository,
          atomicDomainMutationCoordinator,
        )
      : undefined;
    const scholarshipImportCenterUseCases = importRepository && scholarshipRepository
      ? new ScholarshipImportCenterUseCases(
          importRepository,
          scholarshipRepository,
          atomicTransfer,
          atomicTransfer,
        )
      : undefined;

    // Middleware to catch async errors
    const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
    const mutationContext = (req: Request) => ({
      actorId: (req as any).user?.id || (req as any).user?.identityId || 'SYSTEM',
      actorType: (req as any).user?.type || 'IDENTITY',
      correlationId: (req.headers['x-correlation-id'] as string | undefined) || (req.headers['x-request-id'] as string | undefined),
      source: 'admin-scholarship-api',
    });

    const listQuerySchema = z.object({
      status: z.nativeEnum(ScholarshipStatus).optional(),
      completenessStatus: z.nativeEnum(ScholarshipCompletenessState).optional(),
      country: z.string().min(1).optional(),
      page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
      pageSize: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
    });

    const operationalClassSchema = z.enum(['REAL', 'TEST', 'DEMO', 'ARCHIVED', 'UNCLASSIFIED']);
    const importCenterQuerySchema = z.object({
      batchId: z.string().min(1).optional(),
      status: z.string().min(1).optional(),
      operationalClass: operationalClassSchema.optional(),
      page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
      pageSize: z.string().optional().transform(val => val ? parseInt(val, 10) : 50),
    });
    const importCenterDecisionSchema = z.object({
      action: z.enum(['MERGE', 'KEEP_CURRENT', 'SPLIT']),
      reason: z.string().max(2000).optional(),
    });
    const requireImportCenter = () => {
      if (!scholarshipImportCenterUseCases) {
        throw new Error('SCHOLARSHIP_IMPORT_CENTER_NOT_CONFIGURED');
      }
      return scholarshipImportCenterUseCases;
    };

    const updateBodySchema = z.object({
      displayName: z.string().optional(),
      fundingCoverage: z.string().optional(),
      coverageDetails: z.string().optional(),
      eligibleMajorsOrFields: z.union([z.string(), z.array(z.string())]).optional(),
      degreeLevel: z.string().optional(),
      requiredDocuments: z.array(z.string()).optional(),
      eligibilityCriteria: z.string().optional(),
      studyLanguage: z.string().optional(),
      applicationDeadline: z.union([z.string(), z.date()]).optional().transform(val => val ? new Date(val) : null),
      studyCountry: z.string().optional(),
      applicationLink: z.string().optional(),
      officialSourceUrl: z.string().optional(),
      sponsorName: z.string().optional(),
      targetUniversities: z.array(z.string()).optional(),
      targetAcademicPrograms: z.array(z.string()).optional(),
      fundingAmount: z.number().optional(),
      currency: z.string().optional(),
      duration: z.string().optional(),
      localizedNames: z.record(z.string(), z.string()).optional(),
      metadata: z.record(z.string(), z.any()).optional(),
    });

    // GET /admin/scholarships
    router.get('/', asyncHandler(async (req: Request, res: Response) => {
      const filters = listQuerySchema.parse(req.query);
      const result = await adminScholarshipUseCases.listScholarships(filters);
      res.json(result);
    }));

    const createBodySchema = z.object({
      displayName: z.string().optional(),
      scholarshipName: z.string().optional(),
      fundingCoverage: z.string().min(1, 'Funding coverage is required'),
      coverageDetails: z.string().optional(),
      eligibleMajorsOrFields: z.union([z.string(), z.array(z.string())]).optional(),
      degreeLevel: z.string().min(1, 'Degree level is required'),
      requiredDocuments: z.union([z.string(), z.array(z.string())]).optional(),
      eligibilityCriteria: z.string().optional(),
      studyLanguage: z.string().optional(),
      applicationDeadline: z.union([z.string(), z.date()]).optional().transform(val => val ? new Date(val) : null),
      studyCountry: z.string().optional(),
      applicationLink: z.string().optional(),
      officialSourceUrl: z.string().optional(),
      sponsorName: z.string().optional(),
      fundingAmount: z.union([z.string(), z.number()]).optional().transform(val => val ? String(val) : undefined),
      currency: z.string().optional(),
      duration: z.string().optional(),
    }).refine(data => !!(data.displayName || data.scholarshipName), {
      message: 'Scholarship name is required',
      path: ['displayName'],
    }).refine(data => !!(data.applicationLink?.trim() || data.officialSourceUrl?.trim()), {
      message: 'Either application link or official source URL is required',
      path: ['applicationLink'],
    });

    // POST /admin/scholarships
    router.post('/', asyncHandler(async (req: Request, res: Response) => {
      const payload = createBodySchema.parse(req.body);
      const scholarshipName = payload.displayName || payload.scholarshipName || '';
      
      const scholarship = await adminScholarshipUseCases.createScholarship({
        displayName: scholarshipName,
        fundingCoverage: payload.fundingCoverage,
        coverageDetails: payload.coverageDetails,
        eligibleMajorsOrFields: payload.eligibleMajorsOrFields,
        degreeLevel: payload.degreeLevel,
        studyCountry: payload.studyCountry,
        applicationDeadline: payload.applicationDeadline,
        sponsorName: payload.sponsorName,
        applicationLink: payload.applicationLink,
        officialSourceUrl: payload.officialSourceUrl,
        eligibilityCriteria: payload.eligibilityCriteria,
        requiredDocuments: payload.requiredDocuments,
        studyLanguage: payload.studyLanguage,
        fundingAmount: payload.fundingAmount,
        currency: payload.currency,
        duration: payload.duration,
      }, mutationContext(req));

      res.status(201).json(scholarship);
    }));

    // Import Endpoints
    router.post('/import', asyncHandler(async (req: Request, res: Response) => {
      if (!importAdminUseCases) throw new Error('Import use cases not configured');
      const { dataText, sourceSystem } = req.body;
      const result = await importAdminUseCases.importData({ dataText, sourceSystem, dataType: 'SCHOLARSHIPS' });
      res.status(201).json(result);
    }));

    // WP12-7 Scholarship Import Center Backend (API -> Application -> existing Phase 6 store)
    router.get('/import-center/overview', asyncHandler(async (req: Request, res: Response) => {
      const operationalClass = operationalClassSchema.optional().parse(req.query.operationalClass) as ScholarshipImportOperationalClass | undefined;
      res.json(await requireImportCenter().getOverview(operationalClass ?? 'REAL'));
    }));

    router.get('/import-center/sources', asyncHandler(async (_req: Request, res: Response) => {
      res.json(await requireImportCenter().listSources());
    }));

    router.get('/import-center/records', asyncHandler(async (req: Request, res: Response) => {
      const query = importCenterQuerySchema.parse(req.query);
      res.json(await requireImportCenter().listRecords(query));
    }));

    router.get('/import-center/records/:id/diff', asyncHandler(async (req: Request, res: Response) => {
      res.json(await requireImportCenter().getDiff(req.params.id));
    }));

    router.get('/import-center/records/:id/merge-proposal', asyncHandler(async (req: Request, res: Response) => {
      res.json(await requireImportCenter().getMergeProposal(req.params.id));
    }));

    router.get('/import-center/records/:id', asyncHandler(async (req: Request, res: Response) => {
      res.json(await requireImportCenter().getRecord(req.params.id));
    }));

    router.get('/import-center/screening', asyncHandler(async (req: Request, res: Response) => {
      const query = importCenterQuerySchema.parse(req.query);
      res.json(await requireImportCenter().listScreening(query));
    }));

    router.get('/import-center/duplicates', asyncHandler(async (req: Request, res: Response) => {
      const query = importCenterQuerySchema.parse(req.query);
      res.json(await requireImportCenter().listDuplicatesAndUpdates(query));
    }));

    router.get('/import-center/missing-data', asyncHandler(async (req: Request, res: Response) => {
      const query = importCenterQuerySchema.parse(req.query);
      res.json(await requireImportCenter().listMissingData(query));
    }));

    router.get('/import-center/verification', asyncHandler(async (req: Request, res: Response) => {
      const query = importCenterQuerySchema.parse(req.query);
      res.json(await requireImportCenter().listVerification(query));
    }));

    router.get('/import-center/review-queue', asyncHandler(async (req: Request, res: Response) => {
      const query = importCenterQuerySchema.parse(req.query);
      res.json(await requireImportCenter().listReviewQueue(query));
    }));

    router.get('/import-center/ready-to-transfer', asyncHandler(async (req: Request, res: Response) => {
      const query = importCenterQuerySchema.parse(req.query);
      res.json(await requireImportCenter().listReadyToTransfer(query));
    }));

    router.get('/import-center/history', asyncHandler(async (req: Request, res: Response) => {
      const query = importCenterQuerySchema.parse(req.query);
      res.json(await requireImportCenter().listHistory(query));
    }));

    router.post('/import-center/records/:id/decision', asyncHandler(async (req: Request, res: Response) => {
      const payload = importCenterDecisionSchema.parse(req.body);
      const context = mutationContext(req);
      try {
        const result = await requireImportCenter().recordDecision({
          recordId: req.params.id,
          action: payload.action,
          actorId: context.actorId,
          reason: payload.reason,
          correlationId: context.correlationId,
        });
        res.status(201).json(result);
      } catch (error) {
        if (error instanceof Error && error.message === 'SCHOLARSHIP_IMPORT_REVIEW_DECISION_PORT_NOT_CONFIGURED') {
          res.status(501).json({ error: error.message });
          return;
        }
        throw error;
      }
    }));

    router.post('/import-center/records/:id/transfer', asyncHandler(async (req: Request, res: Response) => {
      const context = mutationContext(req);
      const result = await requireImportCenter().transfer({
        recordId: req.params.id,
        actorId: context.actorId,
        correlationId: context.correlationId,
      });
      res.status(201).json(result);
    }));

    router.get('/imported-records', asyncHandler(async (req: Request, res: Response) => {
      if (!importAdminUseCases) throw new Error('Import use cases not configured');
      const batchId = req.query.batchId as string;
      const status = req.query.status as string;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 50;

      const records = await importAdminUseCases.listRecords({ batchId, status, page, pageSize });
      res.json(records);
    }));

    router.post('/imported-records/:id/promote', asyncHandler(async (req: Request, res: Response) => {
      const context = mutationContext(req);
      const result = await requireImportCenter().transfer({
        recordId: req.params.id,
        actorId: context.actorId,
        correlationId: context.correlationId,
      });
      res.status(201).json(result);
    }));

    // GET /admin/scholarships/:id
    router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
      const scholarship = await adminScholarshipUseCases.getScholarship(req.params.id);
      res.json(scholarship);
    }));

    // PATCH /admin/scholarships/:id
    router.patch('/:id', asyncHandler(async (req: Request, res: Response) => {
      const updates = updateBodySchema.parse(req.body);
      
      const optionalFields: Record<string, any> = {};
      if (updates.requiredDocuments !== undefined) optionalFields.requiredDocuments = updates.requiredDocuments;
      if (updates.eligibilityCriteria !== undefined) optionalFields.eligibilityCriteria = updates.eligibilityCriteria;
      if (updates.studyLanguage !== undefined) optionalFields.studyLanguage = updates.studyLanguage;
      if (updates.targetUniversities !== undefined) optionalFields.targetUniversities = updates.targetUniversities;
      if (updates.targetAcademicPrograms !== undefined) optionalFields.targetAcademicPrograms = updates.targetAcademicPrograms;
      if (updates.fundingAmount !== undefined) optionalFields.fundingAmount = updates.fundingAmount;
      if (updates.currency !== undefined) optionalFields.currency = updates.currency;
      if (updates.duration !== undefined) optionalFields.duration = updates.duration;
      if (updates.localizedNames !== undefined) optionalFields.localizedNames = updates.localizedNames;
      if (updates.metadata !== undefined) optionalFields.metadata = updates.metadata;

      const dataToUpdate: UpdateScholarshipDto = {
        displayName: updates.displayName,
        fundingCoverage: updates.fundingCoverage,
        coverageDetails: updates.coverageDetails,
        eligibleMajorsOrFields: updates.eligibleMajorsOrFields,
        degreeLevel: updates.degreeLevel,
        applicationLink: updates.applicationLink,
        officialSourceUrl: updates.officialSourceUrl,
        sponsorName: updates.sponsorName,
        studyCountry: updates.studyCountry,
        applicationDeadline: updates.applicationDeadline,
      };

      if (Object.keys(optionalFields).length > 0) {
        dataToUpdate.optionalFields = optionalFields;
      }

      const scholarship = await adminScholarshipUseCases.updateScholarship(req.params.id, dataToUpdate, mutationContext(req));
      res.json(scholarship);
    }));

    // Commands
    router.post('/:id/mark-ready', asyncHandler(async (req: Request, res: Response) => {
      await adminScholarshipUseCases.markReadyToReview(req.params.id, mutationContext(req));
      res.status(200).json({ success: true });
    }));

    router.post('/:id/mark-publishable', asyncHandler(async (req: Request, res: Response) => {
      await adminScholarshipUseCases.markReadyToPublish(req.params.id, mutationContext(req));
      res.status(200).json({ success: true });
    }));

    router.post('/:id/publish', asyncHandler(async (req: Request, res: Response) => {
      await adminScholarshipUseCases.publish(req.params.id, mutationContext(req));
      res.status(200).json({ success: true });
    }));

    router.post('/:id/unpublish', asyncHandler(async (req: Request, res: Response) => {
      await adminScholarshipUseCases.unpublish(req.params.id, mutationContext(req));
      res.status(200).json({ success: true });
    }));

    router.post('/:id/reject', asyncHandler(async (req: Request, res: Response) => {
      await adminScholarshipUseCases.reject(req.params.id, mutationContext(req));
      res.status(200).json({ success: true });
    }));

    router.post('/:id/archive', asyncHandler(async (req: Request, res: Response) => {
      await adminScholarshipUseCases.archive(req.params.id, mutationContext(req));
      res.status(200).json({ success: true });
    }));

    // Simple error handler for Zod errors and Use Case errors
    router.use((err: any, req: Request, res: Response, next: NextFunction) => {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation Error', details: err.issues });
      }
      res.status(400).json({ error: err.message || 'An error occurred' });
    });

    return router;
  }
}
