import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { InternationalTestAdminUseCases } from '@manaratak/application';
import { InternationalTestCategory, InternationalTestCompletenessStatus, InternationalTestStatus } from '@manaratak/domain';

export class InternationalTestAdminRouter {
  public static create(cradle: { internationalTestAdminUseCases: InternationalTestAdminUseCases }): Router {
    const router = Router();
    const { internationalTestAdminUseCases } = cradle;
    const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => Promise.resolve(fn(req, res, next)).catch(next);

    const querySchema = z.object({
      status: z.nativeEnum(InternationalTestStatus).optional(),
      completenessStatus: z.nativeEnum(InternationalTestCompletenessStatus).optional(),
      testCategory: z.nativeEnum(InternationalTestCategory).optional(),
      providerName: z.string().optional(),
      page: z.string().optional().transform((value) => value ? parseInt(value, 10) : 1),
      pageSize: z.string().optional().transform((value) => value ? Math.min(Math.max(parseInt(value, 10), 1), 100) : 20)
    });

    const importDraftSchema = z.object({
      sourceImportRecordId: z.string().optional(),
      sourceFileName: z.string().min(1),
      sourceUri: z.string().optional(),
      sourceHash: z.string().optional(),
      rawContent: z.string().optional(),
      importedBy: z.string().optional(),
      detectedFields: z.record(z.string(), z.unknown()).optional(),
      detectedSections: z.array(z.string()).optional(),
      unmappedSections: z.array(z.object({
        sectionKey: z.string().min(1),
        title: z.string().optional(),
        sourceSectionPath: z.string().optional(),
        content: z.string(),
        locale: z.string().optional(),
        detectedFieldKeys: z.array(z.string()).optional(),
        metadata: z.record(z.string(), z.unknown()).optional()
      })).optional(),
      metadata: z.record(z.string(), z.unknown()).optional()
    });

    router.get('/', asyncHandler(async (req: Request, res: Response) => {
      const parsed = querySchema.parse(req.query);
      const { testCategory, completenessStatus, ...filters } = parsed;
      res.json(await internationalTestAdminUseCases.list({
        ...filters,
        ...(completenessStatus ? { completenessStatus } : {}),
        ...(testCategory ? { category: testCategory } : {}),
      }));
    }));

    router.post('/', asyncHandler(async (req: Request, res: Response) => {
      res.status(201).json(await internationalTestAdminUseCases.createTest(req.body));
    }));

    router.post('/upsert', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.upsertTest(req.body));
    }));

    router.post('/:id/import-draft', asyncHandler(async (req: Request, res: Response) => {
      const parsed = importDraftSchema.parse(req.body);
      res.status(201).json(await internationalTestAdminUseCases.createImportDraftVersion(req.params.id, parsed));
    }));

    router.get('/:id/import-versions', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.listImportVersions(req.params.id));
    }));

    router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.get(req.params.id));
    }));

    router.patch('/:id', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.updateTest(req.params.id, req.body));
    }));

    router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.updateTest(req.params.id, req.body));
    }));

    router.post('/:id/mark-publishable', asyncHandler(async (req: Request, res: Response) => {
      await internationalTestAdminUseCases.markReadyToPublish(req.params.id);
      res.json({ success: true });
    }));

    router.post('/:id/publish', asyncHandler(async (req: Request, res: Response) => {
      await internationalTestAdminUseCases.publish(req.params.id);
      res.json({ success: true });
    }));

    router.post('/:id/archive', asyncHandler(async (req: Request, res: Response) => {
      await internationalTestAdminUseCases.archive(req.params.id);
      res.json({ success: true });
    }));

    // Child profile delegates
    router.get('/:id/variants', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.listVariants(req.params.id));
    }));

    router.post('/:id/variants', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.upsertVariant(req.params.id, req.body));
    }));

    router.put('/:id/variants', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.upsertVariant(req.params.id, req.body));
    }));

    router.get('/:id/sections', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.listSections(req.params.id));
    }));

    router.post('/:id/sections', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.upsertSection(req.params.id, req.body));
    }));

    router.put('/:id/sections', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.upsertSection(req.params.id, req.body));
    }));

    router.post('/:id/score-scale', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.upsertScoreScale(req.params.id, req.body));
    }));

    router.put('/:id/score-scale', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.upsertScoreScale(req.params.id, req.body));
    }));

    router.post('/:id/fees', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.upsertFeeMetadata(req.params.id, req.body));
    }));

    router.put('/:id/fees', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.upsertFeeMetadata(req.params.id, req.body));
    }));

    router.post('/:id/official-links', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.upsertOfficialLink(req.params.id, req.body));
    }));

    router.put('/:id/official-links', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.upsertOfficialLink(req.params.id, req.body));
    }));

    router.get('/:id/availability', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.listAvailability(req.params.id));
    }));

    router.post('/:id/availability', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.upsertAvailability(req.params.id, req.body));
    }));

    router.put('/:id/availability', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.upsertAvailability(req.params.id, req.body));
    }));

    router.get('/:id/preparation-materials', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.listPreparationMaterials(req.params.id));
    }));

    router.post('/:id/preparation-materials', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.upsertPreparationMaterial(req.params.id, req.body));
    }));

    router.put('/:id/preparation-materials', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.upsertPreparationMaterial(req.params.id, req.body));
    }));

    router.get('/:id/evidence', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.listEvidence(req.params.id));
    }));

    router.post('/:id/evidence', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.addEvidence(req.params.id, req.body));
    }));

    router.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
      if (err instanceof z.ZodError) return res.status(400).json({ error: 'Validation Error', details: err.issues });
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('not found')) return res.status(404).json({ error: message });
      res.status(400).json({ error: message || 'An error occurred' });
    });

    return router;
  }
}
