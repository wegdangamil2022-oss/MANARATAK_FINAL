import { PrismaClient, Prisma } from '@prisma/client';
import { 
  IInternationalTestRepository,
  ITransactionalInternationalTestRepository,
  AtomicPersistenceContext,
  InternationalTestDto, 
  UpsertInternationalTestDto,
  InternationalTestFilters,
  PaginatedInternationalTestResult,
  InternationalTestVariantDto,
  UpsertInternationalTestVariantDto,
  InternationalTestSectionDto,
  UpsertInternationalTestSectionDto,
  InternationalTestScoreScaleDto,
  UpsertInternationalTestScoreScaleDto,
  InternationalTestFeeMetadataDto,
  UpsertInternationalTestFeeMetadataDto,
  InternationalTestOfficialLinkDto,
  UpsertInternationalTestOfficialLinkDto,
  InternationalTestAvailabilityDto,
  UpsertInternationalTestAvailabilityDto,
  InternationalTestPreparationMaterialDto,
  UpsertInternationalTestPreparationMaterialDto,
  InternationalTestEvidenceDto,
  InternationalTestImportDraftRequestDto,
  InternationalTestImportDraftResultDto,
  InternationalTestVersionDto,
  InternationalTestStatus,
  InternationalTestDeliveryMode,
  UpsertInternationalTestAcademicTaxonomyRelationshipDto,
  UpsertInternationalTestDegreeRelationshipReference,
  UpsertInternationalTestReferenceRelationshipDto
} from '@manaratak/domain';

const defaultInclude = {
  variants: true,
  sections: { orderBy: { order: 'asc' as const } },
  scoreScale: true,
  fees: true,
  officialLinks: true,
  availability: true,
  preparationMaterials: true,
  evidence: true,
  countryRelationships: true,
  languageRelationships: true,
  academicTaxonomyRelationships: true,
  degreeRelationships: true
};

type InternationalTestVersionRecord = {
  id: string;
  testId?: string;
  versionNumber: number;
  status: string;
  sourceImportRecordId?: string | null;
  sourceFileName?: string | null;
  sourceLocale?: string | null;
  sourceUri?: string | null;
  sourceHash?: string | null;
  importedAt?: Date | null;
  publishedAt?: Date | null;
  approvedBy?: string | null;
  supersededAt?: Date | null;
  effectiveFrom?: Date | null;
  effectiveTo?: Date | null;
  changeSummary?: unknown;
  rawContentBlocks?: unknown;
  metadata?: unknown;
  contentBlocks?: unknown[];
};

type InternationalTestVersionDelegate = {
  findFirst(args: Record<string, unknown>): Promise<InternationalTestVersionRecord | null>;
  findMany(args: Record<string, unknown>): Promise<InternationalTestVersionRecord[]>;
  create(args: Record<string, unknown>): Promise<InternationalTestVersionRecord>;
};

type PrismaClientWithInternationalTestVersions = PrismaClient & {
  internationalTestVersion: InternationalTestVersionDelegate;
};

type InternationalTestContentBlockCreateInput = {
  blockKey: string;
  blockType: string;
  title?: string;
  locale?: string;
  content: string;
  sourceSectionPath?: string;
  reviewStatus: string;
  metadata?: Record<string, unknown>;
};

interface InternationalTestTransactionContext extends AtomicPersistenceContext {
  readonly transactionClient: Prisma.TransactionClient;
}

export class PrismaInternationalTestRepository implements ITransactionalInternationalTestRepository {
  constructor(private readonly prisma: PrismaClient) {}

  withTransaction(context: AtomicPersistenceContext): IInternationalTestRepository {
    const transactionClient = (context as Partial<InternationalTestTransactionContext>).transactionClient;
    if (!context.boundaryId || !transactionClient) throw new Error('INTERNATIONAL_TEST_ATOMIC_TRANSACTION_CONTEXT_REQUIRED');
    return new PrismaInternationalTestRepository(transactionClient as unknown as PrismaClient);
  }

  // --- Legacy & Core Methods ---

  async findById(id: string): Promise<InternationalTestDto | null> {
    const record = await this.prisma.internationalTest.findUnique({ 
      where: { id },
      include: defaultInclude
    });
    if (!record) return null;

    if (!record.variants && this.prisma.internationalTestVariant) {
      record.variants = await this.prisma.internationalTestVariant.findMany({ where: { testId: id } });
      record.sections = await this.prisma.internationalTestSection.findMany({ where: { testId: id } });
      const scoreScales = await this.prisma.internationalTestScoreScale.findMany({ where: { testId: id } });
      record.scoreScale = scoreScales[0] || null;
      record.fees = await this.prisma.internationalTestFeeMetadata.findMany({ where: { testId: id } });
      record.officialLinks = await this.prisma.internationalTestOfficialLink.findMany({ where: { testId: id } });
      const availabilities = await this.prisma.internationalTestAvailability.findMany({ where: { testId: id } });
      record.availability = availabilities[0] || null;
      record.preparationMaterials = await this.prisma.internationalTestPreparationMaterial.findMany({ where: { testId: id } });
      record.evidence = await this.prisma.internationalTestEvidence.findUnique({ where: { testId: id } });
    }

    return this.mapToDto(record);
  }

  async findBySlug(slug: string): Promise<InternationalTestDto | null> {
    const record = await this.prisma.internationalTest.findUnique({ 
      where: { slug },
      include: defaultInclude
    });
    if (!record) return null;

    if (!record.variants && typeof this.prisma.internationalTestVariant?.findMany === 'function') {
      record.variants = await this.prisma.internationalTestVariant.findMany({ where: { testId: record.id } });
      record.sections = typeof this.prisma.internationalTestSection?.findMany === 'function' ? await this.prisma.internationalTestSection.findMany({ where: { testId: record.id } }) : [];
      const scoreScales = typeof this.prisma.internationalTestScoreScale?.findMany === 'function' ? await this.prisma.internationalTestScoreScale.findMany({ where: { testId: record.id } }) : [];
      record.scoreScale = scoreScales[0] || null;
      record.fees = typeof this.prisma.internationalTestFeeMetadata?.findMany === 'function' ? await this.prisma.internationalTestFeeMetadata.findMany({ where: { testId: record.id } }) : [];
      record.officialLinks = typeof this.prisma.internationalTestOfficialLink?.findMany === 'function' ? await this.prisma.internationalTestOfficialLink.findMany({ where: { testId: record.id } }) : [];
      const availabilities = typeof this.prisma.internationalTestAvailability?.findMany === 'function' ? await this.prisma.internationalTestAvailability.findMany({ where: { testId: record.id } }) : [];
      record.availability = availabilities[0] || null;
      record.preparationMaterials = typeof this.prisma.internationalTestPreparationMaterial?.findMany === 'function' ? await this.prisma.internationalTestPreparationMaterial.findMany({ where: { testId: record.id } }) : [];
      record.evidence = typeof this.prisma.internationalTestEvidence?.findUnique === 'function' ? await this.prisma.internationalTestEvidence.findUnique({ where: { testId: record.id } }) : null;
    }

    return this.mapToDto(record);
  }

  async findByDedupKey(key: string): Promise<InternationalTestDto | null> {
    const record = await this.prisma.internationalTest.findUnique({ 
      where: { canonicalDedupKey: key },
      include: defaultInclude
    });
    return record ? this.mapToDto(record) : null;
  }

  async create(data: any): Promise<InternationalTestDto> {
    const {
      publicId, slug, canonicalName, canonicalDedupKey, displayName, status, 
      completenessStatus, testCategory, providerName, familyId, providerId,
      currentPublishedVersionId, sourceImportRecordId, optionalFields,
      localizedNameAr, localizedNameEn, abbreviation, isPubliclyVisible, isSourceVerified,
      registrationRequirements, identificationRequirements, retakePolicy,
      cancellationReschedulingNotes, accessibilityNotes,
      ...rest
    } = data;
    
    const safeOptionalFields = {
      ...(optionalFields || {}),
      ...rest
    };

    const record = await this.prisma.internationalTest.create({
      data: {
        publicId, slug, canonicalName, canonicalDedupKey, displayName, status, 
        completenessStatus, testCategory, providerName, familyId, providerId,
        currentPublishedVersionId, sourceImportRecordId,
        localizedNameAr, localizedNameEn, abbreviation, 
        isPubliclyVisible: isPubliclyVisible ?? false, 
        isSourceVerified: isSourceVerified ?? false,
        registrationRequirements, identificationRequirements, retakePolicy,
        cancellationReschedulingNotes, accessibilityNotes,
        optionalFields: safeOptionalFields
      },
      include: defaultInclude
    });
    return this.mapToDto(record);
  }

  async update(id: string, updates: any): Promise<InternationalTestDto> {
    const {
      id: _id, createdAt, updatedAt, publicId, slug, canonicalName, canonicalDedupKey,
      displayName, status, completenessStatus, testCategory, providerName,
      familyId, providerId, currentPublishedVersionId, sourceImportRecordId, optionalFields,
      localizedNameAr, localizedNameEn, abbreviation, isPubliclyVisible, isSourceVerified,
      registrationRequirements, identificationRequirements, retakePolicy,
      cancellationReschedulingNotes, accessibilityNotes,
      ...rest
    } = updates;
    
    const existing = await this.prisma.internationalTest.findUnique({ where: { id }});
    const existingOptional = (existing?.optionalFields as any) || {};

    const safeOptionalFields = {
      ...existingOptional,
      ...(optionalFields || {}),
      ...rest
    };

    const record = await this.prisma.internationalTest.update({
      where: { id },
      data: {
        displayName: displayName !== undefined ? displayName : undefined,
        status: status !== undefined ? status : undefined,
        completenessStatus: completenessStatus !== undefined ? completenessStatus : undefined,
        testCategory: testCategory !== undefined ? testCategory : undefined,
          providerName: providerName !== undefined ? providerName : undefined,
          familyId: familyId !== undefined ? familyId : undefined,
          providerId: providerId !== undefined ? providerId : undefined,
          currentPublishedVersionId: currentPublishedVersionId !== undefined ? currentPublishedVersionId : undefined,
        sourceImportRecordId: sourceImportRecordId !== undefined ? sourceImportRecordId : undefined,
        localizedNameAr: localizedNameAr !== undefined ? localizedNameAr : undefined,
        localizedNameEn: localizedNameEn !== undefined ? localizedNameEn : undefined,
        abbreviation: abbreviation !== undefined ? abbreviation : undefined,
        isPubliclyVisible: isPubliclyVisible !== undefined ? isPubliclyVisible : undefined,
        isSourceVerified: isSourceVerified !== undefined ? isSourceVerified : undefined,
        registrationRequirements: registrationRequirements !== undefined ? registrationRequirements : undefined,
        identificationRequirements: identificationRequirements !== undefined ? identificationRequirements : undefined,
        retakePolicy: retakePolicy !== undefined ? retakePolicy : undefined,
        cancellationReschedulingNotes: cancellationReschedulingNotes !== undefined ? cancellationReschedulingNotes : undefined,
        accessibilityNotes: accessibilityNotes !== undefined ? accessibilityNotes : undefined,
        optionalFields: safeOptionalFields
      },
      include: defaultInclude
    });
    return this.mapToDto(record);
  }

  async updateStatus(id: string, status: InternationalTestStatus | string): Promise<InternationalTestDto> {
    const record = await this.prisma.internationalTest.update({
      where: { id },
      data: { status: status as any },
      include: defaultInclude
    });
    return this.mapToDto(record);
  }

  async list(filters: InternationalTestFilters): Promise<PaginatedInternationalTestResult<InternationalTestDto>> {
    const page = Number(filters?.page) || 1;
    const pageSize = Number(filters?.pageSize || filters?.limit) || 20;
    
    const where: any = {};
    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        where.status = { in: filters.status };
      } else {
        where.status = filters.status;
      }
    }

    const categories = filters?.category || filters?.testCategory;
    if (categories) {
      if (Array.isArray(categories)) {
        where.testCategory = { in: categories };
      } else {
        where.testCategory = categories;
      }
    }

    if (filters?.providerName) {
      where.providerName = filters.providerName;
    }

    if (filters?.countryIso2Code) {
      where.countryRelationships = {
        some: { countryIso2Code: filters.countryIso2Code.toUpperCase() }
      };
    }

    if (filters?.completenessStatus) {
      if (Array.isArray(filters.completenessStatus)) {
        where.completenessStatus = { in: filters.completenessStatus };
      } else {
        where.completenessStatus = filters.completenessStatus;
      }
    }

    if (filters?.isPubliclyVisible !== undefined) {
      where.isPubliclyVisible = filters.isPubliclyVisible;
    }

    const search = filters?.searchQuery || filters?.q;
    if (search && typeof search === 'string' && search.trim() !== '') {
      const query = search.trim();
      where.OR = [
        { canonicalName: { contains: query, mode: 'insensitive' } },
        { providerName: { contains: query, mode: 'insensitive' } },
        { displayName: { contains: query, mode: 'insensitive' } },
        { slug: { contains: query, mode: 'insensitive' } }
      ];
    }
    
    const [data, total] = await Promise.all([
      this.prisma.internationalTest.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: defaultInclude
      }),
      this.prisma.internationalTest.count({ where })
    ]);
    
    return {
      data: data.map((d: any) => this.mapToDto(d)),
      total,
      page,
      limit: pageSize
    };
  }

  async listPublished(filters?: Omit<InternationalTestFilters, 'status'>): Promise<PaginatedInternationalTestResult<InternationalTestDto>> {
    return this.list({ ...filters, status: [InternationalTestStatus.PUBLISHED] });
  }

  // --- Normalized Profile & Discovery Methods ---

  async listTests(filters: InternationalTestFilters): Promise<PaginatedInternationalTestResult<InternationalTestDto>> {
    return this.list(filters);
  }

  async getTest(id: string): Promise<InternationalTestDto | null> {
    return this.findById(id);
  }

  async getTestBySlug(slug: string): Promise<InternationalTestDto | null> {
    return this.findBySlug(slug);
  }

  async getTestByDeterministicKey(key: string): Promise<InternationalTestDto | null> {
    return this.findByDedupKey(key);
  }

  async upsertTest(data: UpsertInternationalTestDto | any): Promise<InternationalTestDto> {
    if (data.id) {
      const existing = await this.findById(data.id);
      if (existing) {
        return this.update(data.id, data);
      }
    }
    
    if (data.slug) {
      const existing = await this.findBySlug(data.slug);
      if (existing) {
        return this.update(existing.id, data);
      }
    }

    const dedupKey = data.canonicalDedupKey || data.deterministicKey;
    if (dedupKey) {
      const existing = await this.findByDedupKey(dedupKey);
      if (existing) {
        return this.update(existing.id, data);
      }
    }

    return this.create(data);
  }

  // --- Normalized Child Domain Methods ---

  async listVariants(testId: string): Promise<InternationalTestVariantDto[]> {
    const records = await this.prisma.internationalTestVariant.findMany({ where: { testId } });
    return records.map((r: any) => this.mapVariantToDto(r));
  }

  async upsertVariant(testId: string, data: UpsertInternationalTestVariantDto & { id?: string }): Promise<InternationalTestVariantDto> {
    let record: any;
    if (data.id) {
      record = await this.prisma.internationalTestVariant.update({
        where: { id: data.id },
        data: {
          variantName: data.variantName,
          deliveryMode: data.deliveryMode,
          isActive: data.isActive ?? true,
          specificOfficialUrl: data.specificOfficialUrl,
          administrativeNotes: data.administrativeNotes
        }
      });
    } else {
      record = await this.prisma.internationalTestVariant.create({
        data: {
          testId,
          variantName: data.variantName,
          deliveryMode: data.deliveryMode,
          isActive: data.isActive ?? true,
          specificOfficialUrl: data.specificOfficialUrl,
          administrativeNotes: data.administrativeNotes
        }
      });
    }
    return this.mapVariantToDto(record);
  }

  async listSections(testId: string): Promise<InternationalTestSectionDto[]> {
    const records = await this.prisma.internationalTestSection.findMany({ 
      where: { testId },
      orderBy: { order: 'asc' }
    });
    return records.map((r: any) => this.mapSectionToDto(r));
  }

  async upsertSection(testId: string, data: UpsertInternationalTestSectionDto & { id?: string }): Promise<InternationalTestSectionDto> {
    let record: any;
    const questionTypesJson = data.questionTypes ? (data.questionTypes as any) : ((Prisma as any).JsonNull ?? null);
    if (data.id) {
      record = await this.prisma.internationalTestSection.update({
        where: { id: data.id },
        data: {
          sectionName: data.sectionName,
          sectionType: data.sectionType,
          durationMinutes: data.durationMinutes,
          order: data.order,
          questionTypes: questionTypesJson,
          scoreMinimum: data.scoreMinimum,
          scoreMaximum: data.scoreMaximum
        }
      });
    } else {
      record = await this.prisma.internationalTestSection.create({
        data: {
          testId,
          sectionName: data.sectionName,
          sectionType: data.sectionType,
          durationMinutes: data.durationMinutes,
          order: data.order,
          questionTypes: questionTypesJson,
          scoreMinimum: data.scoreMinimum,
          scoreMaximum: data.scoreMaximum
        }
      });
    }
    return this.mapSectionToDto(record);
  }

  async upsertScoreScale(testId: string, data: UpsertInternationalTestScoreScaleDto): Promise<InternationalTestScoreScaleDto> {
    const bandsOrLevelsJson = data.bandsOrLevels ? (data.bandsOrLevels as any) : ((Prisma as any).JsonNull ?? null);
    const payload = {
      overallMinimum: data.overallMinimum,
      overallMaximum: data.overallMaximum,
      scoreIncrement: data.scoreIncrement,
      bandsOrLevels: bandsOrLevelsJson,
      passFailRules: data.passFailRules,
      cefrEquivalency: data.cefrEquivalency,
      crossTestEquivalency: data.crossTestEquivalency,
      resultValidityDurationMonths: data.resultValidityDurationMonths,
      resultDeliveryTimeDays: data.resultDeliveryTimeDays,
      scoreReportingUrl: data.scoreReportingUrl
    };

    const record = await this.prisma.internationalTestScoreScale.upsert({
      where: { testId },
      create: { testId, ...payload },
      update: payload
    });
    return this.mapScoreScaleToDto(record);
  }

  async upsertFeeMetadata(testId: string, data: UpsertInternationalTestFeeMetadataDto & { id?: string }): Promise<InternationalTestFeeMetadataDto> {
    let record: any;
    if (data.id) {
      record = await this.prisma.internationalTestFeeMetadata.update({
        where: { id: data.id },
        data: {
          feeType: data.feeType,
          amount: data.amount,
          currencyCode: data.currencyCode,
          hasRegionalVariation: data.hasRegionalVariation ?? false,
          validityWindowNotes: data.validityWindowNotes
        }
      });
    } else {
      record = await this.prisma.internationalTestFeeMetadata.create({
        data: {
          testId,
          feeType: data.feeType,
          amount: data.amount,
          currencyCode: data.currencyCode,
          hasRegionalVariation: data.hasRegionalVariation ?? false,
          validityWindowNotes: data.validityWindowNotes
        }
      });
    }
    return this.mapFeeMetadataToDto(record);
  }

  async upsertOfficialLink(testId: string, data: UpsertInternationalTestOfficialLinkDto & { id?: string }): Promise<InternationalTestOfficialLinkDto> {
    let record: any;
    if (data.id) {
      record = await this.prisma.internationalTestOfficialLink.update({
        where: { id: data.id },
        data: {
          linkType: data.linkType,
          url: data.url,
          description: data.description
        }
      });
    } else {
      record = await this.prisma.internationalTestOfficialLink.create({
        data: {
          testId,
          linkType: data.linkType,
          url: data.url,
          description: data.description
        }
      });
    }
    return this.mapOfficialLinkToDto(record);
  }

  async listAvailability(testId: string): Promise<InternationalTestAvailabilityDto | null> {
    const record = await this.prisma.internationalTestAvailability.findUnique({ where: { testId } });
    return record ? this.mapAvailabilityToDto(record) : null;
  }

  async upsertAvailability(testId: string, data: UpsertInternationalTestAvailabilityDto): Promise<InternationalTestAvailabilityDto> {
    const countryIdsJson = (data.availableCountryIds || []) as any;
    const cityIdsJson = data.availableCityIds ? (data.availableCityIds as any) : ((Prisma as any).JsonNull ?? null);
    const regionsJson = data.onlineAvailabilityRegions ? (data.onlineAvailabilityRegions as any) : ((Prisma as any).JsonNull ?? null);

    const payload = {
      availableCountryIds: countryIdsJson,
      availableCityIds: cityIdsJson,
      onlineAvailabilityRegions: regionsJson,
      testingWindowsNotes: data.testingWindowsNotes
    };

    const record = await this.prisma.internationalTestAvailability.upsert({
      where: { testId },
      create: { testId, ...payload },
      update: payload
    });
    return this.mapAvailabilityToDto(record);
  }

  async listPreparationMaterials(testId: string): Promise<InternationalTestPreparationMaterialDto[]> {
    const records = await this.prisma.internationalTestPreparationMaterial.findMany({ where: { testId } });
    return records.map((r: any) => this.mapPreparationMaterialToDto(r));
  }

  async upsertPreparationMaterial(testId: string, data: UpsertInternationalTestPreparationMaterialDto & { id?: string }): Promise<InternationalTestPreparationMaterialDto> {
    let record: any;
    if (data.id) {
      record = await this.prisma.internationalTestPreparationMaterial.update({
        where: { id: data.id },
        data: {
          materialType: data.materialType,
          url: data.url,
          assetId: data.assetId,
          title: data.title,
          description: data.description
        }
      });
    } else {
      record = await this.prisma.internationalTestPreparationMaterial.create({
        data: {
          testId,
          materialType: data.materialType,
          url: data.url,
          assetId: data.assetId,
          title: data.title,
          description: data.description
        }
      });
    }
    return this.mapPreparationMaterialToDto(record);
  }

  async listEvidence(testId: string): Promise<InternationalTestEvidenceDto[]> {
    const record = await this.prisma.internationalTestEvidence.findUnique({ where: { testId } });
    return record ? [this.mapEvidenceToDto(record)] : [];
  }

  async addEvidence(testId: string, data: InternationalTestEvidenceDto): Promise<InternationalTestEvidenceDto> {
    const conflictingFieldsJson = data.conflictingFields ? (data.conflictingFields as any) : ((Prisma as any).JsonNull ?? null);
    const mergeSuggestionsJson = data.mergeSuggestions ? (data.mergeSuggestions as any) : ((Prisma as any).JsonNull ?? null);

    const payload = {
      originalImportedName: data.originalImportedName,
      normalizedCanonicalName: data.normalizedCanonicalName,
      deterministicKey: data.deterministicKey,
      sourceId: data.sourceId,
      sourceUrl: data.sourceUrl,
      contentHash: data.contentHash,
      retrievedAt: data.retrievedAt,
      evidenceSnippet: data.evidenceSnippet,
      duplicateStatus: data.duplicateStatus,
      conflictingFields: conflictingFieldsJson,
      mergeSuggestions: mergeSuggestionsJson,
      sourceTrustLevel: data.sourceTrustLevel
    };

    const record = await this.prisma.internationalTestEvidence.upsert({
      where: { testId },
      create: { testId, ...payload },
      update: payload
    });
    return this.mapEvidenceToDto(record);
  }

  async createImportDraftVersion(
    testId: string,
    data: InternationalTestImportDraftRequestDto
  ): Promise<InternationalTestImportDraftResultDto> {
    const existingTest = await this.prisma.internationalTest.findUnique({ where: { id: testId } });
    if (!existingTest) {
      throw new Error(`International test with id ${testId} not found`);
    }

    const prismaWithVersions = this.prisma as PrismaClientWithInternationalTestVersions;
    const latestVersion = await prismaWithVersions.internationalTestVersion.findFirst({
      where: { testId },
      orderBy: { versionNumber: 'desc' },
      select: { versionNumber: true, metadata: true }
    });
    const versionNumber = (latestVersion?.versionNumber ?? 0) + 1;
    const hasRawContent = typeof data.rawContent === 'string' && data.rawContent.trim().length > 0;
    const unmappedSections = data.unmappedSections ?? [];
    const reviewBlocks: InternationalTestContentBlockCreateInput[] = [];

    if (hasRawContent && data.rawContent) {
      reviewBlocks.push({
        blockKey: 'source.raw',
        blockType: 'RAW_SOURCE',
        title: data.sourceFileName,
        content: data.rawContent,
        sourceSectionPath: '/',
        reviewStatus: 'NEEDS_REVIEW',
        metadata: {
          preservedOriginalSource: true,
          ...(data.sourceHash ? { sourceHash: data.sourceHash } : {}),
          ...(data.sourceUri ? { sourceUri: data.sourceUri } : {})
        }
      });
    }

    for (const [index, section] of unmappedSections.entries()) {
      if (!section.content || section.content.trim() === '') continue;
      reviewBlocks.push({
        blockKey: `unmapped.${index + 1}.${this.normalizeBlockKey(section.sectionKey)}`,
        blockType: 'UNMAPPED_SOURCE_SECTION',
        title: section.title ?? section.sectionKey,
        locale: section.locale,
        content: section.content,
        sourceSectionPath: section.sourceSectionPath,
        reviewStatus: 'NEEDS_REVIEW',
        metadata: {
          requiresMapping: true,
          detectedFieldKeys: section.detectedFieldKeys ?? [],
          ...(section.metadata ?? {})
        }
      });
    }

    const changeSummary = {
      ...this.buildImportChangeSummary(latestVersion?.metadata, data.detectedFields),
      unmappedSectionCount: reviewBlocks.filter((block) => block.blockType === 'UNMAPPED_SOURCE_SECTION').length,
      unmappedSectionsRequireReview: reviewBlocks.some((block) => block.blockType === 'UNMAPPED_SOURCE_SECTION')
    };
    const rawContentBlocks = reviewBlocks.map((block) => ({
      blockKey: block.blockKey,
      blockType: block.blockType,
      ...(block.title ? { title: block.title } : {}),
      ...(block.sourceSectionPath ? { sourceSectionPath: block.sourceSectionPath } : {}),
      contentLength: block.content.length,
      reviewStatus: block.reviewStatus
    }));

    const version = await prismaWithVersions.internationalTestVersion.create({
      data: {
        testId,
        versionNumber,
        status: 'DRAFT',
        sourceImportRecordId: data.sourceImportRecordId,
        sourceFileName: data.sourceFileName,
        sourceLocale: data.sourceLocale,
        sourceUri: data.sourceUri,
        sourceHash: data.sourceHash,
        importedAt: new Date(),
        changeSummary,
        rawContentBlocks,
        metadata: {
          ...(data.importedBy ? { importedBy: data.importedBy } : {}),
          detectedFields: data.detectedFields ?? {},
          detectedSections: data.detectedSections ?? [],
          unmappedSections: unmappedSections.map((section) => section.sectionKey),
          ...(data.metadata ?? {})
        },
        contentBlocks: reviewBlocks.length > 0
          ? {
              create: reviewBlocks
            }
          : undefined
      },
      include: { contentBlocks: true }
    });

    return {
      testId,
      versionId: version.id,
      versionNumber: version.versionNumber,
      status: version.status as InternationalTestImportDraftResultDto['status'],
      sourceFileName: version.sourceFileName ?? data.sourceFileName,
      sourceLocale: version.sourceLocale ?? data.sourceLocale,
      sourceHash: version.sourceHash ?? undefined,
      preservedRawContent: hasRawContent,
      reviewStatus: 'NEEDS_REVIEW',
      createdContentBlockCount: Array.isArray(version.contentBlocks) ? version.contentBlocks.length : 0,
      needsReviewSectionCount: reviewBlocks.filter((block) => block.blockType === 'UNMAPPED_SOURCE_SECTION').length
    };
  }

  async listImportVersions(testId: string): Promise<InternationalTestVersionDto[]> {
    const existingTest = await this.prisma.internationalTest.findUnique({ where: { id: testId } });
    if (!existingTest) {
      throw new Error(`International test with id ${testId} not found`);
    }

    const prismaWithVersions = this.prisma as PrismaClientWithInternationalTestVersions;
    const records = await prismaWithVersions.internationalTestVersion.findMany({
      where: { testId },
      orderBy: [{ versionNumber: 'desc' }],
      include: { contentBlocks: true }
    });

    return records.map((record) => this.mapVersionToDto(record, testId));
  }

  async upsertCountryRelationship(testId: string, data: UpsertInternationalTestReferenceRelationshipDto): Promise<void> {
    const countryIso2Code = data.referenceCode || data.canonicalReferenceId;
    await this.prisma.internationalTestCountryRelationship.upsert({
      where: {
        testId_countryIso2Code_relationshipType: {
          testId,
          countryIso2Code,
          relationshipType: data.relationshipType,
        },
      },
      create: {
        testId,
        countryIso2Code,
        relationshipType: data.relationshipType,
        notes: data.notes,
        metadata: data.metadata as Prisma.InputJsonObject | undefined,
      },
      update: {
        notes: data.notes,
        metadata: data.metadata as Prisma.InputJsonObject | undefined,
      },
    });
  }

  async upsertLanguageRelationship(testId: string, data: UpsertInternationalTestReferenceRelationshipDto): Promise<void> {
    const languageIsoCode = data.referenceCode || data.canonicalReferenceId;
    await this.prisma.internationalTestLanguageRelationship.upsert({
      where: {
        testId_languageIsoCode_relationshipType: {
          testId,
          languageIsoCode,
          relationshipType: data.relationshipType,
        },
      },
      create: {
        testId,
        languageIsoCode,
        relationshipType: data.relationshipType,
        notes: data.notes,
        metadata: data.metadata as Prisma.InputJsonObject | undefined,
      },
      update: {
        notes: data.notes,
        metadata: data.metadata as Prisma.InputJsonObject | undefined,
      },
    });
  }

  async upsertAcademicTaxonomyRelationship(testId: string, data: UpsertInternationalTestAcademicTaxonomyRelationshipDto): Promise<void> {
    await this.prisma.internationalTestAcademicTaxonomyRelationship.upsert({
      where: {
        testId_taxonomyNodeId_relationshipType: {
          testId,
          taxonomyNodeId: data.taxonomyNodeId,
          relationshipType: data.relationshipType,
        },
      },
      create: {
        testId,
        taxonomyNodeId: data.taxonomyNodeId,
        relationshipType: data.relationshipType,
        confidence: data.confidence,
        notes: data.notes,
        metadata: data.metadata as Prisma.InputJsonObject | undefined,
      },
      update: {
        confidence: data.confidence,
        notes: data.notes,
        metadata: data.metadata as Prisma.InputJsonObject | undefined,
      },
    });
  }

  async upsertDegreeRelationship(testId: string, data: UpsertInternationalTestDegreeRelationshipReference): Promise<void> {
    const degreeLevelCode = data.canonicalCode || data.degreeLevelId;
    await this.prisma.internationalTestDegreeRelationship.upsert({
      where: {
        testId_degreeLevelCode_relationshipType: {
          testId,
          degreeLevelCode,
          relationshipType: data.relationshipType,
        },
      },
      create: {
        testId,
        degreeLevelCode,
        degreeLevelId: data.degreeLevelId,
        relationshipType: data.relationshipType,
        notes: data.notes,
        metadata: data.metadata as Prisma.InputJsonObject | undefined,
      },
      update: {
        degreeLevelId: data.degreeLevelId,
        notes: data.notes,
        metadata: data.metadata as Prisma.InputJsonObject | undefined,
      },
    });
  }

  // --- Private Mapping Helpers ---

  private normalizeBlockKey(value: string): string {
    const normalized = value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return normalized || 'section';
  }

  private buildImportChangeSummary(
    previousMetadata: unknown,
    detectedFields: Record<string, unknown> | undefined
  ): Record<string, unknown> {
    if (!detectedFields) {
      return {
        comparisonStatus: 'PENDING_FIELD_MAPPING',
        createdFromExistingTest: true,
        addedFields: [],
        removedFields: [],
        changedFields: []
      };
    }

    const previousFields = this.extractDetectedFields(previousMetadata);
    const previousKeys = Object.keys(previousFields);
    const currentKeys = Object.keys(detectedFields);
    const addedFields = currentKeys.filter((key) => !previousKeys.includes(key));
    const removedFields = previousKeys.filter((key) => !currentKeys.includes(key));
    const changedFields = currentKeys.filter((key) => {
      if (!previousKeys.includes(key)) return false;
      return JSON.stringify(previousFields[key]) !== JSON.stringify(detectedFields[key]);
    });

    return {
      comparisonStatus: previousKeys.length > 0 ? 'COMPLETED' : 'BASELINE_VERSION',
      createdFromExistingTest: true,
      addedFields,
      removedFields,
      changedFields,
      newFieldsRequireReview: addedFields.length > 0,
      deletedSourceFieldsRequireReview: removedFields.length > 0
    };
  }

  private extractDetectedFields(metadata: unknown): Record<string, unknown> {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return {};
    const detectedFields = (metadata as Record<string, unknown>).detectedFields;
    if (!detectedFields || typeof detectedFields !== 'object' || Array.isArray(detectedFields)) return {};
    return detectedFields as Record<string, unknown>;
  }

  private asRecord(value: unknown): Record<string, unknown> | undefined {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
    return value as Record<string, unknown>;
  }

  private asRecordArray(value: unknown): Record<string, unknown>[] | undefined {
    if (!Array.isArray(value)) return undefined;
    return value.filter((item): item is Record<string, unknown> => {
      return !!item && typeof item === 'object' && !Array.isArray(item);
    });
  }

  private mapVersionToDto(record: InternationalTestVersionRecord, fallbackTestId: string): InternationalTestVersionDto {
    return {
      id: record.id,
      testId: record.testId ?? fallbackTestId,
      versionNumber: record.versionNumber,
      status: record.status as InternationalTestVersionDto['status'],
      sourceImportRecordId: record.sourceImportRecordId ?? undefined,
      sourceFileName: record.sourceFileName ?? undefined,
      sourceLocale: record.sourceLocale ?? undefined,
      sourceUri: record.sourceUri ?? undefined,
      sourceHash: record.sourceHash ?? undefined,
      importedAt: record.importedAt ?? undefined,
      publishedAt: record.publishedAt ?? undefined,
      approvedBy: record.approvedBy ?? undefined,
      supersededAt: record.supersededAt ?? undefined,
      effectiveFrom: record.effectiveFrom ?? undefined,
      effectiveTo: record.effectiveTo ?? undefined,
      changeSummary: this.asRecord(record.changeSummary),
      rawContentBlocks: this.asRecordArray(record.rawContentBlocks),
      contentBlocks: this.asRecordArray(record.contentBlocks) as InternationalTestVersionDto['contentBlocks'],
      metadata: this.asRecord(record.metadata)
    };
  }

  private mapToDto(record: any): InternationalTestDto {
    if (!record) return null as any;
    const { 
      optionalFields, 
      variants, 
      sections, 
      scoreScale, 
      fees, 
      officialLinks, 
      availability, 
      preparationMaterials, 
      evidence,
      ...rest 
    } = record;

    const base: InternationalTestDto = {
      ...rest,
      isPubliclyVisible: rest.isPubliclyVisible ?? false,
      isSourceVerified: rest.isSourceVerified ?? false,
      ...(typeof optionalFields === 'object' && optionalFields ? optionalFields : {})
    };

    if (variants && Array.isArray(variants)) {
      base.variants = variants.map(v => this.mapVariantToDto(v));
    }
    if (sections && Array.isArray(sections)) {
      base.sections = sections.map(s => this.mapSectionToDto(s));
    }
    if (scoreScale) {
      base.scoreScale = this.mapScoreScaleToDto(scoreScale);
    }
    if (fees && Array.isArray(fees)) {
      base.fees = fees.map(f => this.mapFeeMetadataToDto(f));
    }
    if (officialLinks && Array.isArray(officialLinks)) {
      base.officialLinks = officialLinks.map(l => this.mapOfficialLinkToDto(l));
    }
    if (availability) {
      base.availability = this.mapAvailabilityToDto(availability);
    }
    if (preparationMaterials && Array.isArray(preparationMaterials)) {
      base.preparationMaterials = preparationMaterials.map(m => this.mapPreparationMaterialToDto(m));
    }
    if (evidence) {
      base.importEvidence = this.mapEvidenceToDto(evidence);
    }

    return base;
  }

  private mapVariantToDto(v: any): InternationalTestVariantDto {
    return {
      id: v.id,
      variantName: v.variantName,
      deliveryMode: v.deliveryMode as InternationalTestDeliveryMode,
      isActive: v.isActive ?? true,
      specificOfficialUrl: v.specificOfficialUrl || undefined,
      administrativeNotes: v.administrativeNotes || undefined
    };
  }

  private mapSectionToDto(s: any): InternationalTestSectionDto {
    return {
      id: s.id,
      sectionName: s.sectionName,
      sectionType: s.sectionType,
      durationMinutes: s.durationMinutes ?? undefined,
      order: s.order,
      questionTypes: Array.isArray(s.questionTypes) ? s.questionTypes : undefined,
      scoreMinimum: s.scoreMinimum ?? undefined,
      scoreMaximum: s.scoreMaximum ?? undefined
    };
  }

  private mapScoreScaleToDto(sc: any): InternationalTestScoreScaleDto {
    return {
      id: sc.id,
      overallMinimum: sc.overallMinimum,
      overallMaximum: sc.overallMaximum,
      scoreIncrement: sc.scoreIncrement ?? undefined,
      bandsOrLevels: Array.isArray(sc.bandsOrLevels) ? sc.bandsOrLevels : undefined,
      passFailRules: sc.passFailRules || undefined,
      cefrEquivalency: sc.cefrEquivalency || undefined,
      crossTestEquivalency: sc.crossTestEquivalency || undefined,
      resultValidityDurationMonths: sc.resultValidityDurationMonths ?? undefined,
      resultDeliveryTimeDays: sc.resultDeliveryTimeDays ?? undefined,
      scoreReportingUrl: sc.scoreReportingUrl || undefined
    };
  }

  private mapFeeMetadataToDto(f: any): InternationalTestFeeMetadataDto {
    return {
      id: f.id,
      feeType: f.feeType,
      amount: f.amount,
      currencyCode: f.currencyCode,
      hasRegionalVariation: f.hasRegionalVariation ?? false,
      validityWindowNotes: f.validityWindowNotes || undefined
    };
  }

  private mapOfficialLinkToDto(l: any): InternationalTestOfficialLinkDto {
    return {
      id: l.id,
      linkType: l.linkType,
      url: l.url,
      description: l.description || undefined
    };
  }

  private mapAvailabilityToDto(a: any): InternationalTestAvailabilityDto {
    return {
      id: a.id,
      availableCountryIds: Array.isArray(a.availableCountryIds) ? a.availableCountryIds : [],
      availableCityIds: Array.isArray(a.availableCityIds) ? a.availableCityIds : undefined,
      onlineAvailabilityRegions: Array.isArray(a.onlineAvailabilityRegions) ? a.onlineAvailabilityRegions : undefined,
      testingWindowsNotes: a.testingWindowsNotes || undefined
    };
  }

  private mapPreparationMaterialToDto(m: any): InternationalTestPreparationMaterialDto {
    return {
      id: m.id,
      materialType: m.materialType,
      url: m.url || undefined,
      assetId: m.assetId || undefined,
      title: m.title,
      description: m.description || undefined
    };
  }

  private mapEvidenceToDto(e: any): InternationalTestEvidenceDto {
    return {
      originalImportedName: e.originalImportedName || undefined,
      normalizedCanonicalName: e.normalizedCanonicalName || undefined,
      deterministicKey: e.deterministicKey || undefined,
      sourceId: e.sourceId || undefined,
      sourceUrl: e.sourceUrl || undefined,
      contentHash: e.contentHash || undefined,
      retrievedAt: e.retrievedAt ? new Date(e.retrievedAt) : undefined,
      evidenceSnippet: e.evidenceSnippet || undefined,
      duplicateStatus: e.duplicateStatus || undefined,
      conflictingFields: Array.isArray(e.conflictingFields) ? e.conflictingFields : undefined,
      mergeSuggestions: e.mergeSuggestions || undefined,
      sourceTrustLevel: e.sourceTrustLevel || undefined
    };
  }
}
