import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CrossDomainGraphReadService, InternationalTestAdminUseCases } from '@manaratak/application';
import {
  InternationalTestCategory,
  InternationalTestCompletenessStatus,
  InternationalTestStatus,
  InternationalTestSourceTrustLevel,
  UpsertInternationalTestDto,
} from '@manaratak/domain';

export class InternationalTestAdminRouter {
  public static create(cradle: { internationalTestAdminUseCases: InternationalTestAdminUseCases; crossDomainGraphReadService: CrossDomainGraphReadService }): Router {
    const router = Router();
    const { internationalTestAdminUseCases, crossDomainGraphReadService } = cradle;
    type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown> | unknown;
    const asyncHandler = (fn: AsyncRouteHandler) => (req: Request, res: Response, next: NextFunction) => Promise.resolve(fn(req, res, next)).catch(next);
    const mutationContext = (req: Request) => {
      if (!req.authUserId) throw new Error('AUTHENTICATED_ADMIN_ACTOR_REQUIRED');
      return {
      actorId: req.authUserId,
      actorType: 'IDENTITY',
      correlationId: (req.headers['x-correlation-id'] as string | undefined) || (req.headers['x-request-id'] as string | undefined),
      source: 'admin-international-tests-api',
      };
    };

    const querySchema = z.object({
      status: z.nativeEnum(InternationalTestStatus).optional(),
      completenessStatus: z.nativeEnum(InternationalTestCompletenessStatus).optional(),
      testCategory: z.nativeEnum(InternationalTestCategory).optional(),
      providerName: z.string().optional(),
      countryIso2Code: z.string().length(2).transform(value => value.toUpperCase()).optional(),
      page: z.string().optional().transform((value) => value ? parseInt(value, 10) : 1),
      pageSize: z.string().optional().transform((value) => value ? Math.min(Math.max(parseInt(value, 10), 1), 100) : 20)
    });

    const referenceRelationshipSchema = z.object({
      canonicalReferenceId: z.string().min(1),
      referenceCode: z.string().min(1).optional(),
      relationshipType: z.string().min(1),
      notes: z.string().optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    }).strict();
    const academicTaxonomyRelationshipSchema = z.object({
      taxonomyNodeId: z.string().min(1),
      relationshipType: z.string().min(1),
      confidence: z.number().min(0).max(1).optional(),
      notes: z.string().optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    }).strict();
    const degreeRelationshipSchema = z.object({
      degreeLevelId: z.string().min(1),
      canonicalCode: z.string().min(1).optional(),
      relationshipType: z.string().min(1),
      notes: z.string().optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    }).strict();
    const scoreScaleSchema = z.object({
      overallMinimum: z.number(),
      overallMaximum: z.number(),
      scoreIncrement: z.number().optional(),
      bandsOrLevels: z.array(z.string()).optional(),
      passFailRules: z.string().optional(),
      cefrEquivalency: z.string().optional(),
      crossTestEquivalency: z.string().optional(),
      resultValidityDurationMonths: z.number().int().nonnegative().optional(),
      resultDeliveryTimeDays: z.number().int().nonnegative().optional(),
      scoreReportingUrl: z.string().url().optional(),
    }).strict();
    const officialLinkSchema = z.object({
      linkType: z.enum(['REGISTRATION', 'INFORMATION', 'PREPARATION', 'SCORE_REPORTING', 'OTHER']),
      url: z.string().url(),
      description: z.string().optional(),
    }).strict();
    const rootCreateSchema = z.object({
      canonicalName: z.string().min(1),
      testCategory: z.nativeEnum(InternationalTestCategory),
      providerName: z.string().min(1),
      localizedNameAr: z.string().optional(),
      localizedNameEn: z.string().optional(),
      abbreviation: z.string().optional(),
      familyId: z.string().optional(),
      providerId: z.string().optional(),
      status: z.nativeEnum(InternationalTestStatus).optional(),
      countryRelationships: z.array(referenceRelationshipSchema).optional(),
      languageRelationships: z.array(referenceRelationshipSchema).optional(),
      academicTaxonomyRelationships: z.array(academicTaxonomyRelationshipSchema).optional(),
      degreeRelationships: z.array(degreeRelationshipSchema).optional(),
      scoreScale: scoreScaleSchema.optional(),
      officialLinks: z.array(officialLinkSchema).optional(),
      optionalFields: z.record(z.string(), z.unknown()).optional(),
    }).passthrough();
    const rootUpdateSchema = z.object({
      testCategory: z.nativeEnum(InternationalTestCategory).optional(),
      providerName: z.string().min(1).optional(),
      abbreviation: z.string().optional(),
      familyId: z.string().optional(),
      providerId: z.string().optional(),
      registrationRequirements: z.string().optional(),
      identificationRequirements: z.string().optional(),
      retakePolicy: z.string().optional(),
      cancellationReschedulingNotes: z.string().optional(),
      accessibilityNotes: z.string().optional(),
      countryRelationships: z.array(referenceRelationshipSchema).optional(),
      languageRelationships: z.array(referenceRelationshipSchema).optional(),
      academicTaxonomyRelationships: z.array(academicTaxonomyRelationshipSchema).optional(),
      degreeRelationships: z.array(degreeRelationshipSchema).optional(),
      scoreScale: scoreScaleSchema.optional(),
      officialLinks: z.array(officialLinkSchema).optional(),
      optionalFields: z.record(z.string(), z.unknown()).optional(),
    }).strict();
    const providerSchema = z.object({
      id: z.string().optional(),
      key: z.string().min(1),
      displayName: z.string().min(1),
      providerType: z.string().optional(),
      officialWebsite: z.string().url().optional(),
      countryIso2Code: z.string().length(2).transform(value => value.toUpperCase()).optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    }).strict();
    const evidenceSchema = z.object({
      originalImportedName: z.string().optional(),
      normalizedCanonicalName: z.string().optional(),
      deterministicKey: z.string().optional(),
      sourceId: z.string().optional(),
      sourceUrl: z.string().url().optional(),
      contentHash: z.string().optional(),
      retrievedAt: z.coerce.date().optional(),
      evidenceSnippet: z.string().optional(),
      duplicateStatus: z.enum(['NEW', 'DUPLICATE_SKIPPED', 'EXISTING_ENRICHED']).optional(),
      conflictingFields: z.array(z.string()).optional(),
      mergeSuggestions: z.record(z.string(), z.unknown()).nullable().optional(),
      sourceTrustLevel: z.nativeEnum(InternationalTestSourceTrustLevel).optional(),
    }).strict();

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

    router.get('/providers', asyncHandler(async (req: Request, res: Response) => {
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      res.json(await internationalTestAdminUseCases.listProviders(search));
    }));

    router.post('/providers', asyncHandler(async (req: Request, res: Response) => {
      const parsed = providerSchema.parse(req.body);
      res.status(201).json(await internationalTestAdminUseCases.upsertProvider(parsed, mutationContext(req)));
    }));

    router.post('/', asyncHandler(async (req: Request, res: Response) => {
      const parsed = rootCreateSchema.parse(req.body);
      res.status(201).json(await internationalTestAdminUseCases.createTest(parsed as unknown as UpsertInternationalTestDto, mutationContext(req)));
    }));

    router.post('/upsert', asyncHandler(async (req: Request, res: Response) => {
      const parsed = rootCreateSchema.parse(req.body);
      res.json(await internationalTestAdminUseCases.upsertTest(parsed as unknown as UpsertInternationalTestDto, mutationContext(req)));
    }));

    router.post('/:id/import-draft', asyncHandler(async (req: Request, res: Response) => {
      const parsed = importDraftSchema.parse(req.body);
      res.status(201).json(await internationalTestAdminUseCases.createImportDraftVersion(req.params.id, parsed, mutationContext(req)));
    }));

    router.get('/:id/import-versions', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.listImportVersions(req.params.id));
    }));

    router.get('/:id/relationships', asyncHandler(async (req: Request, res: Response) => {
      const locale = req.query.locale === 'en' ? 'en' : 'ar';
      res.json(await crossDomainGraphReadService.getInternationalTestGraphById(req.params.id, { locale, page: 1, pageSize: 50 }));
    }));

    router.get('/:id/readiness', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.checkPublicationReadiness(req.params.id));
    }));

    router.post('/:id/verify-source', asyncHandler(async (req: Request, res: Response) => {
      await internationalTestAdminUseCases.verifySource(req.params.id, mutationContext(req));
      res.json({ success: true });
    }));

    router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.get(req.params.id));
    }));

    router.patch('/:id', asyncHandler(async (req: Request, res: Response) => {
      const parsed = rootUpdateSchema.parse(req.body);
      res.json(await internationalTestAdminUseCases.updateTest(req.params.id, parsed as unknown as Partial<UpsertInternationalTestDto>, mutationContext(req)));
    }));

    router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
      const parsed = rootUpdateSchema.parse(req.body);
      res.json(await internationalTestAdminUseCases.updateTest(req.params.id, parsed as unknown as Partial<UpsertInternationalTestDto>, mutationContext(req)));
    }));

    router.post('/:id/mark-publishable', asyncHandler(async (req: Request, res: Response) => {
      await internationalTestAdminUseCases.markReadyToPublish(req.params.id, mutationContext(req));
      res.json({ success: true });
    }));

    router.post('/:id/publish', asyncHandler(async (req: Request, res: Response) => {
      await internationalTestAdminUseCases.publish(req.params.id, mutationContext(req));
      res.json({ success: true });
    }));

    router.post('/:id/archive', asyncHandler(async (req: Request, res: Response) => {
      await internationalTestAdminUseCases.archive(req.params.id, mutationContext(req));
      res.json({ success: true });
    }));

    // Child profile delegates
    router.get('/:id/variants', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.listVariants(req.params.id));
    }));

    router.post('/:id/variants', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.upsertVariant(req.params.id, req.body, mutationContext(req)));
    }));

    router.put('/:id/variants', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.upsertVariant(req.params.id, req.body, mutationContext(req)));
    }));

    router.get('/:id/sections', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.listSections(req.params.id));
    }));

    router.post('/:id/sections', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.upsertSection(req.params.id, req.body, mutationContext(req)));
    }));

    router.put('/:id/sections', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.upsertSection(req.params.id, req.body, mutationContext(req)));
    }));

    router.post('/:id/score-scale', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.upsertScoreScale(req.params.id, req.body, mutationContext(req)));
    }));

    router.put('/:id/score-scale', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.upsertScoreScale(req.params.id, req.body, mutationContext(req)));
    }));

    router.post('/:id/fees', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.upsertFeeMetadata(req.params.id, req.body, mutationContext(req)));
    }));

    router.put('/:id/fees', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.upsertFeeMetadata(req.params.id, req.body, mutationContext(req)));
    }));

    router.post('/:id/official-links', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.upsertOfficialLink(req.params.id, req.body, mutationContext(req)));
    }));

    router.put('/:id/official-links', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.upsertOfficialLink(req.params.id, req.body, mutationContext(req)));
    }));

    router.get('/:id/availability', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.listAvailability(req.params.id));
    }));

    router.post('/:id/availability', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.upsertAvailability(req.params.id, req.body, mutationContext(req)));
    }));

    router.put('/:id/availability', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.upsertAvailability(req.params.id, req.body, mutationContext(req)));
    }));

    router.get('/:id/preparation-materials', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.listPreparationMaterials(req.params.id));
    }));

    router.post('/:id/preparation-materials', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.upsertPreparationMaterial(req.params.id, req.body, mutationContext(req)));
    }));

    router.put('/:id/preparation-materials', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.upsertPreparationMaterial(req.params.id, req.body, mutationContext(req)));
    }));

    router.get('/:id/evidence', asyncHandler(async (req: Request, res: Response) => {
      res.json(await internationalTestAdminUseCases.listEvidence(req.params.id));
    }));

    router.post('/:id/evidence', asyncHandler(async (req: Request, res: Response) => {
      const parsed = evidenceSchema.parse(req.body);
      res.json(await internationalTestAdminUseCases.addEvidence(req.params.id, parsed, mutationContext(req)));
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
