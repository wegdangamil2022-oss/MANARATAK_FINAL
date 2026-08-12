import { v4 as uuidv4 } from 'uuid';
import {
  IInternationalTestRepository,
  ImportRecordDto,
  ImportRecordStatus,
  InternationalTestCategory,
  InternationalTestCompletenessClassifier,
  InternationalTestCompletenessStatus,
  InternationalTestDeduplicationService,
  InternationalTestDeliveryMode,
  InternationalTestImportPayloadSchema,
  InternationalTestNamingService,
  InternationalTestSourceTrustLevel,
  InternationalTestStatus,
  InternationalTestValidationService,
  IInternationalTestValidationService,
  InternationalTestValidationSeverity,
  UpsertInternationalTestScoreScaleDto,
  IReferenceResolver
} from '@manaratak/domain';

export type InternationalTestPromotionResult =
  | { type: 'CREATED'; testId: string }
  | { type: 'DUPLICATE'; existingId: string }
  | { type: 'REJECTED'; reason: string }
  | { type: 'FAILED'; error: string };

export class InternationalTestImportPromotionUseCase {
  constructor(
    private readonly repository: IInternationalTestRepository,
    private readonly validationService: IInternationalTestValidationService = new InternationalTestValidationService(),
    private readonly referenceResolver?: IReferenceResolver
  ) {}

  public async promote(record: ImportRecordDto): Promise<InternationalTestPromotionResult> {
    try {
      if (
        record.status !== ImportRecordStatus.VALID && 
        record.status !== ImportRecordStatus.COMPLETE && 
        record.status !== ImportRecordStatus.NEEDS_REVIEW
      ) {
        return { type: 'REJECTED', reason: `ImportRecord status is ${record.status}, not VALID or NEEDS_REVIEW` };
      }

      const rawPayload = record.normalizedPayload || record.rawPayload;
      const validation = InternationalTestImportPayloadSchema.safeParse(rawPayload);
      if (!validation.success) {
        return { type: 'REJECTED', reason: 'Payload fails schema validation' };
      }

      const payload = validation.data;
      const referenceIssue = await this.validateReferenceInputs(payload);
      if (referenceIssue) return { type: 'REJECTED', reason: referenceIssue };
      const domainReport = this.validationService.validate(payload);
      const hasErrors = domainReport.issues.some(i => i.severity === InternationalTestValidationSeverity.ERROR);
      if (hasErrors) {
        return { type: 'REJECTED', reason: `Domain validation failed: ${domainReport.issues.map(i => i.message).join(', ')}` };
      }

      const completenessStatus = InternationalTestCompletenessClassifier.classify(payload);
      if (completenessStatus.state === InternationalTestCompletenessStatus.INCOMPLETE) {
        return { type: 'REJECTED', reason: 'Record classified as INCOMPLETE' };
      }

      const displayName = payload.displayName || payload.testName || payload.canonicalName || 'International Test';
      const canonicalName = InternationalTestNamingService.normalize(displayName);
      const dedupKey = InternationalTestDeduplicationService.generateKey(payload);
      const existing = await this.repository.findByDedupKey(dedupKey);
      if (existing) {
        return { type: 'DUPLICATE', existingId: existing.id };
      }

      const publicId = `test-${uuidv4().substring(0, 8)}`;
      const slugBase = canonicalName.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const primaryRegUrl = payload.officialRegistrationUrl || 
        payload.officialLinks?.find(l => l.linkType === 'REGISTRATION')?.url || 
        payload.officialLinks?.[0]?.url || null;

      const created = await this.repository.create({
        publicId,
        slug: `${slugBase || 'international-test'}-${publicId.substring(0, 4)}`,
        canonicalName,
        canonicalDedupKey: dedupKey,
        displayName,
        testCode: payload.testCode || payload.abbreviation,
        testCategory: (payload.testCategory as InternationalTestCategory) || InternationalTestCategory.LANGUAGE_PROFICIENCY,
        providerName: payload.providerName || 'UNKNOWN',
        officialRegistrationUrl: primaryRegUrl,
        officialSourceUrl: payload.officialSourceUrl || payload.importEvidence?.sourceUrl || null,
        acceptedFor: payload.acceptedFor || payload.useCases,
        scoreScale: typeof payload.scoreScale === 'object' && payload.scoreScale !== null ? (payload.scoreScale as UpsertInternationalTestScoreScaleDto) : undefined,
        validityPeriodMonths: payload.validityPeriodMonths || (typeof payload.scoreScale === 'object' && payload.scoreScale !== null ? payload.scoreScale.resultValidityDurationMonths : undefined),
        currencyCode: payload.currencyCode || payload.fees?.[0]?.currencyCode,
        feeAmountMinorUnits: payload.feeAmountMinorUnits || (payload.fees?.[0]?.amount !== undefined ? Math.round(payload.fees[0].amount * 100).toString() : undefined),
        feeScale: payload.feeScale || 2,
        availableCountries: payload.availableCountries || payload.availability?.availableCountryIds,
        testCenters: payload.testCenters || payload.availability?.testCenters,
        sampleMaterialAssetIds: payload.sampleMaterialAssetIds || payload.preparationMaterials?.map(m => m.assetId).filter((a): a is string => Boolean(a)),
        preparationResourceRefs: payload.preparationResourceRefs || payload.preparationMaterials,
        registrationRequirements: payload.registrationRequirements,
        status: completenessStatus.state === InternationalTestCompletenessStatus.COMPLETE ? InternationalTestStatus.IMPORTED : InternationalTestStatus.READY_TO_REVIEW,
        completenessStatus: completenessStatus.state,
        sourceImportRecordId: record.id,
        optionalFields: {
          ...((payload as { optionalFields?: Record<string, unknown> }).optionalFields || {}),
          abbreviation: payload.abbreviation,
          localizedNameAr: payload.localizedNameAr,
          localizedNameEn: payload.localizedNameEn,
          description: payload.description,
          overview: payload.overview,
          useCases: payload.useCases,
          targetAudience: payload.targetAudience,
          commonlyUsedCountriesOrRegions: payload.commonlyUsedCountriesOrRegions,
          relatedLanguages: payload.relatedLanguages,
          identificationRequirements: payload.identificationRequirements,
          ageRules: payload.ageRules,
          retakePolicy: payload.retakePolicy,
          cancellationReschedulingNotes: payload.cancellationReschedulingNotes,
          accessibilityNotes: payload.accessibilityNotes,
          testDayRequirements: payload.testDayRequirements,
          missingFields: payload.missingFields || domainReport.issues.filter(i => i.severity === InternationalTestValidationSeverity.WARNING).map(i => i.field),
          readinessWarnings: payload.readinessWarnings || domainReport.issues.filter(i => i.severity === InternationalTestValidationSeverity.WARNING).map(i => i.message),
          crossPhaseReferences: payload.crossPhaseReferences,
          variants: payload.variants,
          sections: payload.sections,
          fees: payload.fees,
          officialLinks: payload.officialLinks,
          availability: payload.availability,
          preparationMaterials: payload.preparationMaterials,
          importEvidence: payload.importEvidence,
        },
        metadata: {
          ...((payload as { metadata?: Record<string, unknown> }).metadata || {}),
          warnings: domainReport.issues.filter(i => i.severity === InternationalTestValidationSeverity.WARNING).map(i => i.message)
        }
      });

      // Child sub-entities propagation if repository methods are available
      if (Array.isArray(payload.variants) && typeof this.repository.upsertVariant === 'function') {
        for (const v of payload.variants) {
          if (v.variantName) {
            await this.repository.upsertVariant(created.id, {
              variantName: v.variantName,
              deliveryMode: (v.deliveryMode as InternationalTestDeliveryMode) || InternationalTestDeliveryMode.IN_PERSON,
              isActive: v.isActive !== false,
              specificOfficialUrl: v.specificOfficialUrl,
              administrativeNotes: v.administrativeNotes || v.description,
            });
          }
        }
      }

      if (Array.isArray(payload.sections) && typeof this.repository.upsertSection === 'function') {
        for (let idx = 0; idx < payload.sections.length; idx++) {
          const s = payload.sections[idx];
          if (s.sectionName) {
            await this.repository.upsertSection(created.id, {
              sectionName: s.sectionName,
              sectionType: s.sectionType || 'GENERAL',
              durationMinutes: s.durationMinutes,
              order: s.order ?? (idx + 1),
              questionTypes: s.questionTypes,
              scoreMinimum: s.scoreMinimum,
              scoreMaximum: s.scoreMaximum,
            });
          }
        }
      }

      if (payload.scoreScale && typeof payload.scoreScale === 'object' && typeof this.repository.upsertScoreScale === 'function') {
        await this.repository.upsertScoreScale(created.id, {
          overallMinimum: payload.scoreScale.overallMinimum ?? 0,
          overallMaximum: payload.scoreScale.overallMaximum ?? 100,
          scoreIncrement: payload.scoreScale.scoreIncrement,
          bandsOrLevels: payload.scoreScale.bandsOrLevels,
          passFailRules: payload.scoreScale.passFailRules,
          cefrEquivalency: payload.scoreScale.cefrEquivalency,
          resultValidityDurationMonths: payload.scoreScale.resultValidityDurationMonths,
          resultDeliveryTimeDays: payload.scoreScale.resultDeliveryTimeDays,
          scoreReportingUrl: payload.scoreScale.scoreReportingUrl,
        });
      }

      if (Array.isArray(payload.fees) && typeof this.repository.upsertFeeMetadata === 'function') {
        for (const f of payload.fees) {
          await this.repository.upsertFeeMetadata(created.id, {
            feeType: (f.feeType as 'REGISTRATION' | 'LATE_REGISTRATION' | 'RESCHEDULING' | 'CANCELLATION' | 'OTHER') || 'REGISTRATION',
            amount: f.amount ?? 0,
            currencyCode: f.currencyCode!,
            hasRegionalVariation: Boolean(f.hasRegionalVariation),
            validityWindowNotes: f.validityWindowNotes,
          });
        }
      }

      if (Array.isArray(payload.officialLinks) && typeof this.repository.upsertOfficialLink === 'function') {
        for (const l of payload.officialLinks) {
          if (l.url) {
            await this.repository.upsertOfficialLink(created.id, {
              linkType: (l.linkType as 'REGISTRATION' | 'INFORMATION' | 'PREPARATION' | 'SCORE_REPORTING' | 'OTHER') || 'INFORMATION',
              url: l.url,
              description: l.description,
            });
          }
        }
      }

      if (payload.availability && typeof this.repository.upsertAvailability === 'function') {
        await this.repository.upsertAvailability(created.id, {
          availableCountryIds: (payload.availability.availableCountryIds || []) as string[],
          availableCityIds: payload.availability.availableCityIds as string[],
          onlineAvailabilityRegions: payload.availability.onlineAvailabilityRegions,
          testingWindowsNotes: payload.availability.testingWindowsNotes,
        });
      }

      if (Array.isArray(payload.preparationMaterials) && typeof this.repository.upsertPreparationMaterial === 'function') {
        for (const m of payload.preparationMaterials) {
          if (m.title) {
            await this.repository.upsertPreparationMaterial(created.id, {
              materialType: (m.materialType as 'SAMPLE_QUESTIONS' | 'PRACTICE_TEST' | 'BROCHURE' | 'AUDIO_SAMPLE' | 'GUIDE') || 'GUIDE',
              title: m.title,
              url: m.url,
              assetId: m.assetId,
              description: m.description,
            });
          }
        }
      }

      if (payload.importEvidence && typeof this.repository.addEvidence === 'function') {
        await this.repository.addEvidence(created.id, {
          originalImportedName: payload.importEvidence.originalImportedName || displayName,
          normalizedCanonicalName: payload.importEvidence.normalizedCanonicalName || canonicalName,
          deterministicKey: payload.importEvidence.deterministicKey || dedupKey,
          sourceId: payload.importEvidence.sourceId || record.id,
          sourceUrl: payload.importEvidence.sourceUrl,
          contentHash: payload.importEvidence.contentHash,
          retrievedAt: payload.importEvidence.retrievedAt ? new Date(payload.importEvidence.retrievedAt) : new Date(),
          evidenceSnippet: payload.importEvidence.evidenceSnippet,
          sourceTrustLevel: (payload.importEvidence.sourceTrustLevel as InternationalTestSourceTrustLevel) || InternationalTestSourceTrustLevel.AUTHORITATIVE,
          duplicateStatus: (payload.importEvidence.duplicateStatus as 'NEW' | 'DUPLICATE_SKIPPED' | 'EXISTING_ENRICHED') || 'NEW',
          conflictingFields: Array.isArray(payload.importEvidence.conflictingFields) ? payload.importEvidence.conflictingFields : undefined,
          mergeSuggestions: payload.importEvidence.mergeSuggestions as Record<string, unknown> | undefined,
        });
      }

      return { type: 'CREATED', testId: created.id };
    } catch (error) {
      return { type: 'FAILED', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async validateReferenceInputs(payload: {
    fees?: Array<{ currencyCode?: string }>;
    availability?: { availableCountryIds?: string[]; availableCityIds?: string[] };
  }): Promise<string | null> {
    const hasReferences = Boolean(payload.fees?.length || payload.availability?.availableCountryIds?.length || payload.availability?.availableCityIds?.length);
    if (hasReferences && !this.referenceResolver) return 'Canonical Reference resolver is not configured';

    for (const fee of payload.fees || []) {
      if (!fee.currencyCode) return 'Fee currencyCode is required and cannot default silently';
      const currency = await this.referenceResolver!.resolveCurrency({ standardCode: fee.currencyCode });
      if (!currency?.active) return `Active canonical Currency not found: ${fee.currencyCode}`;
    }
    for (const countryId of payload.availability?.availableCountryIds || []) {
      const country = await this.referenceResolver!.resolveCountry({ id: countryId });
      if (!country?.active) return `Active canonical Country not found: ${countryId}`;
    }
    for (const cityId of payload.availability?.availableCityIds || []) {
      const city = await this.referenceResolver!.resolveCity({ id: cityId });
      if (!city?.active) return `Active canonical City not found: ${cityId}`;
    }
    return null;
  }
}
