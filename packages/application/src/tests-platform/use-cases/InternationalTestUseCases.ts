import {
  IInternationalTestRepository,
  InternationalTestDto,
  InternationalTestFilters,
  InternationalTestStatus,
  PaginatedInternationalTestResult,
  UpsertInternationalTestDto,
  InternationalTestValidationService,
  IInternationalTestValidationService,
  InternationalTestValidationSeverity,
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
  InternationalTestPublicationReadinessPolicy,
  PublicationReadinessEngine,
  PublicationReadinessResult,
  IReferenceResolver,
  IDegreeLevelRepository
} from '@manaratak/domain';

export class InternationalTestAdminUseCases {
  constructor(
    private readonly repository: IInternationalTestRepository,
    private readonly validationService: IInternationalTestValidationService = new InternationalTestValidationService(),
    private readonly publicationReadiness = new PublicationReadinessEngine(),
    private readonly publicationPolicy = new InternationalTestPublicationReadinessPolicy(validationService),
    private readonly referenceResolver?: IReferenceResolver,
    private readonly degreeLevelRepository?: IDegreeLevelRepository
  ) {}

  public async list(filters: InternationalTestFilters): Promise<PaginatedInternationalTestResult<InternationalTestDto>> {
    return this.repository.list(filters);
  }

  public async get(id: string): Promise<InternationalTestDto> {
    const test = await this.repository.findById(id);
    if (!test) throw new Error(`International test with id ${id} not found`);
    return test;
  }

  public async createTest(data: UpsertInternationalTestDto): Promise<InternationalTestDto> {
    await this.validateCanonicalRelationships(data);
    const report = this.validationService.validate(data);
    const hasErrors = report.issues.some(i => i.severity === InternationalTestValidationSeverity.ERROR);
    if (hasErrors) {
      const errorMsg = report.issues.map(i => `${i.field}: ${i.message}`).join('; ');
      throw new Error(`Validation failed for international test creation: ${errorMsg}`);
    }
    return this.repository.create(data);
  }

  public async updateTest(id: string, data: Partial<UpsertInternationalTestDto>): Promise<InternationalTestDto> {
    await this.validateCanonicalRelationships(data);
    const existing = await this.get(id);
    const merged = { ...existing, ...data };
    const report = this.validationService.validate(merged);
    const hasErrors = report.issues.some(i => i.severity === InternationalTestValidationSeverity.ERROR);
    if (hasErrors) {
      const errorMsg = report.issues.map(i => `${i.field}: ${i.message}`).join('; ');
      throw new Error(`Validation failed for international test update: ${errorMsg}`);
    }
    return this.repository.update(id, data);
  }

  public async upsertTest(data: UpsertInternationalTestDto): Promise<InternationalTestDto> {
    await this.validateCanonicalRelationships(data);
    const report = this.validationService.validate(data);
    const hasErrors = report.issues.some(i => i.severity === InternationalTestValidationSeverity.ERROR);
    if (hasErrors) {
      const errorMsg = report.issues.map(i => `${i.field}: ${i.message}`).join('; ');
      throw new Error(`Validation failed for international test upsert: ${errorMsg}`);
    }
    if (this.repository.upsertTest) {
      return this.repository.upsertTest(data);
    }
    const dataWithId = data as UpsertInternationalTestDto & { id?: string };
    if (dataWithId.id) {
      return this.repository.update(dataWithId.id, data);
    }
    return this.repository.create(data);
  }

  public async markReadyToPublish(id: string): Promise<void> {
    const test = await this.get(id);
    this.publicationReadiness.assertReady(
      id,
      { ...test, status: InternationalTestStatus.READY_TO_PUBLISH },
      this.publicationPolicy
    );
    await this.repository.updateStatus(id, InternationalTestStatus.READY_TO_PUBLISH);
  }

  public async checkPublicationReadiness(id: string): Promise<PublicationReadinessResult> {
    const test = await this.get(id);
    return this.publicationReadiness.evaluate(id, test, this.publicationPolicy);
  }

  public async publish(id: string): Promise<void> {
    const test = await this.get(id);
    this.publicationReadiness.assertReady(id, test, this.publicationPolicy);
    await this.repository.updateStatus(id, InternationalTestStatus.PUBLISHED);
  }

  public async archive(id: string): Promise<void> {
    await this.get(id);
    await this.repository.updateStatus(id, InternationalTestStatus.ARCHIVED);
  }

  // Child profile delegates
  public async listVariants(testId: string): Promise<InternationalTestVariantDto[]> {
    await this.get(testId);
    if (!this.repository.listVariants) return [];
    return this.repository.listVariants(testId);
  }

  public async upsertVariant(testId: string, data: UpsertInternationalTestVariantDto & { id?: string }): Promise<InternationalTestVariantDto> {
    await this.get(testId);
    if (!this.repository.upsertVariant) throw new Error('Repository method upsertVariant not implemented');
    return this.repository.upsertVariant(testId, data);
  }

  public async listSections(testId: string): Promise<InternationalTestSectionDto[]> {
    await this.get(testId);
    if (!this.repository.listSections) return [];
    return this.repository.listSections(testId);
  }

  public async upsertSection(testId: string, data: UpsertInternationalTestSectionDto & { id?: string }): Promise<InternationalTestSectionDto> {
    await this.get(testId);
    if (!this.repository.upsertSection) throw new Error('Repository method upsertSection not implemented');
    return this.repository.upsertSection(testId, data);
  }

  public async upsertScoreScale(testId: string, data: UpsertInternationalTestScoreScaleDto): Promise<InternationalTestScoreScaleDto> {
    await this.get(testId);
    if (data.overallMinimum > data.overallMaximum) {
      throw new Error('Invalid score scale: overallMinimum cannot be greater than overallMaximum');
    }
    if (!this.repository.upsertScoreScale) throw new Error('Repository method upsertScoreScale not implemented');
    return this.repository.upsertScoreScale(testId, data);
  }

  public async upsertFeeMetadata(testId: string, data: UpsertInternationalTestFeeMetadataDto & { id?: string }): Promise<InternationalTestFeeMetadataDto> {
    await this.get(testId);
    if (data.amount < 0) {
      throw new Error('Fee amount cannot be negative');
    }
    if (!data.currencyCode || data.currencyCode.trim() === '') {
      throw new Error('Currency code is required for fee metadata');
    }
    if (!this.referenceResolver) throw new Error('Canonical Reference resolver is not configured');
    const currency = await this.referenceResolver.resolveCurrency({
      id: data.currencyReferenceId,
      standardCode: data.currencyCode
    });
    if (!currency?.active) throw new Error(`Active canonical Currency not found: ${data.currencyCode}`);
    const rawData = data as unknown as Record<string, unknown>;
    if (rawData.paymentGatewayId || rawData.chargeToken || rawData.paymentStatus || rawData.executePayment) {
      throw new Error('Payment execution fields are not supported in fee metadata');
    }
    if (!this.repository.upsertFeeMetadata) throw new Error('Repository method upsertFeeMetadata not implemented');
    return this.repository.upsertFeeMetadata(testId, data);
  }

  public async upsertOfficialLink(testId: string, data: UpsertInternationalTestOfficialLinkDto & { id?: string }): Promise<InternationalTestOfficialLinkDto> {
    await this.get(testId);
    if (!data.url || data.url.trim() === '') {
      throw new Error('URL is required for official link');
    }
    if (!this.repository.upsertOfficialLink) throw new Error('Repository method upsertOfficialLink not implemented');
    return this.repository.upsertOfficialLink(testId, data);
  }

  public async listAvailability(testId: string): Promise<InternationalTestAvailabilityDto | null> {
    await this.get(testId);
    if (!this.repository.listAvailability) return null;
    return this.repository.listAvailability(testId);
  }

  public async upsertAvailability(testId: string, data: UpsertInternationalTestAvailabilityDto): Promise<InternationalTestAvailabilityDto> {
    await this.get(testId);
    if (!this.referenceResolver) throw new Error('Canonical Reference resolver is not configured');
    for (const countryId of data.availableCountryIds) {
      const country = await this.referenceResolver.resolveCountry({ id: countryId });
      if (!country?.active) throw new Error(`Active canonical Country not found: ${countryId}`);
    }
    for (const cityId of data.availableCityIds || []) {
      const city = await this.referenceResolver.resolveCity({ id: cityId });
      if (!city?.active) throw new Error(`Active canonical City not found: ${cityId}`);
    }
    if (!this.repository.upsertAvailability) throw new Error('Repository method upsertAvailability not implemented');
    return this.repository.upsertAvailability(testId, data);
  }

  public async listPreparationMaterials(testId: string): Promise<InternationalTestPreparationMaterialDto[]> {
    await this.get(testId);
    if (!this.repository.listPreparationMaterials) return [];
    return this.repository.listPreparationMaterials(testId);
  }

  public async upsertPreparationMaterial(testId: string, data: UpsertInternationalTestPreparationMaterialDto & { id?: string }): Promise<InternationalTestPreparationMaterialDto> {
    await this.get(testId);
    if (data.url && (data.url.startsWith('file://') || data.url.startsWith('/local/') || data.url.startsWith('C:\\'))) {
      throw new Error('Raw local file paths are not allowed as persisted material URLs');
    }
    if (data.assetId && (data.assetId.startsWith('file://') || data.assetId.startsWith('/local/'))) {
      throw new Error('Raw local file paths are not allowed as asset IDs');
    }
    if (!this.repository.upsertPreparationMaterial) throw new Error('Repository method upsertPreparationMaterial not implemented');
    return this.repository.upsertPreparationMaterial(testId, data);
  }

  public async listEvidence(testId: string): Promise<InternationalTestEvidenceDto[]> {
    await this.get(testId);
    if (!this.repository.listEvidence) return [];
    return this.repository.listEvidence(testId);
  }

  public async addEvidence(testId: string, data: InternationalTestEvidenceDto): Promise<InternationalTestEvidenceDto> {
    await this.get(testId);
    if (!this.repository.addEvidence) throw new Error('Repository method addEvidence not implemented');
    return this.repository.addEvidence(testId, data);
  }

  public async createImportDraftVersion(
    testId: string,
    data: InternationalTestImportDraftRequestDto
  ): Promise<InternationalTestImportDraftResultDto> {
    await this.get(testId);
    if (!data.sourceFileName || data.sourceFileName.trim() === '') {
      throw new Error('Source file name is required to create an import draft version');
    }
    if (!this.repository.createImportDraftVersion) {
      throw new Error('Repository method createImportDraftVersion not implemented');
    }
    return this.repository.createImportDraftVersion(testId, {
      ...data,
      sourceFileName: data.sourceFileName.trim()
    });
  }

  public async listImportVersions(testId: string): Promise<InternationalTestVersionDto[]> {
    await this.get(testId);
    if (!this.repository.listImportVersions) return [];
    return this.repository.listImportVersions(testId);
  }

  private async validateCanonicalRelationships(data: Partial<UpsertInternationalTestDto>): Promise<void> {
    const referenceLinks = [
      ...(data.countryRelationships || []).map((link) => ({ type: 'COUNTRY' as const, link })),
      ...(data.languageRelationships || []).map((link) => ({ type: 'LANGUAGE' as const, link }))
    ];
    if (referenceLinks.length > 0 && !this.referenceResolver) {
      throw new Error('Canonical Reference resolver is not configured');
    }
    for (const { type, link } of referenceLinks) {
      const resolved = type === 'COUNTRY'
        ? await this.referenceResolver!.resolveCountry({ id: link.canonicalReferenceId })
        : await this.referenceResolver!.resolveLanguage({ id: link.canonicalReferenceId });
      if (!resolved?.active) throw new Error(`Active canonical ${type} not found: ${link.canonicalReferenceId}`);
    }
    if ((data.degreeRelationships || []).length > 0 && !this.degreeLevelRepository) {
      throw new Error('Canonical DegreeLevel repository is not configured');
    }
    for (const relationship of data.degreeRelationships || []) {
      const degree = await this.degreeLevelRepository!.getDegreeLevelById(relationship.degreeLevelId);
      if (!degree || degree.status !== 'ACTIVE') {
        throw new Error(`Active canonical DegreeLevel not found: ${relationship.degreeLevelId}`);
      }
    }
  }
}

export class InternationalTestPublicUseCases {
  constructor(private readonly repository: IInternationalTestRepository) {}

  public async listPublished(filters: Omit<InternationalTestFilters, 'status'> = {}): Promise<PaginatedInternationalTestResult<InternationalTestDto>> {
    const safeFilters = filters || {};
    const requestedPageSize = typeof safeFilters.pageSize === 'number' ? safeFilters.pageSize : 20;
    return this.repository.listPublished({
      ...safeFilters,
      pageSize: Math.min(requestedPageSize, 50)
    });
  }

  public async getPublishedBySlug(slug: string): Promise<InternationalTestDto> {
    const test = await this.repository.findBySlug(slug);
    if (!test || test.status !== InternationalTestStatus.PUBLISHED) {
      throw new Error('International test not found');
    }
    return test;
  }
}
