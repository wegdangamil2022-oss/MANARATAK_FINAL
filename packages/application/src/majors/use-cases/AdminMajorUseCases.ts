import {
  IMajorRepository,
  MajorAliasDto,
  MajorClassificationMappingDto,
  MajorContentSectionDto,
  MajorCompletenessClassifier,
  MajorDto,
  MajorFilters,
  MajorImportCompletenessState,
  MajorLevelProfileDto,
  MajorPublicationReadinessPolicy,
  MajorRelationshipDto,
  MajorSourceDto,
  MajorStatus,
  MajorVersionDto,
  PaginatedMajorResult,
  PublicationReadinessEngine,
  PublicationReadinessResult,
  UpdateMajorDto
} from '@manaratak/domain';

export class AdminMajorUseCases {
  constructor(
    private readonly repository: IMajorRepository,
    private readonly catalogRepository?: { listCatalog: (filters: any) => Promise<any> },
    private readonly publicationReadiness = new PublicationReadinessEngine(),
    private readonly publicationPolicy = new MajorPublicationReadinessPolicy()
  ) {}

  public async listMajors(filters: MajorFilters & { catalog?: string }): Promise<PaginatedMajorResult<any>> {
    if (this.catalogRepository && filters.catalog !== 'false') {
      console.log("CALLING CATALOG REPO"); return this.catalogRepository.listCatalog(filters);
    }
    return this.repository.list(filters);
  }

  public async getMajor(id: string): Promise<MajorDto> {
    const major = await this.repository.findById(id);
    if (!major) {
      throw new Error(`Major with id ${id} not found`);
    }
    return major;
  }

  public async listVersions(id: string): Promise<MajorVersionDto[]> {
    await this.getMajor(id);
    return this.repository.listVersions ? this.repository.listVersions(id) : [];
  }

  public async listLevelProfiles(id: string): Promise<MajorLevelProfileDto[]> {
    await this.getMajor(id);
    return this.repository.listLevelProfiles ? this.repository.listLevelProfiles(id) : [];
  }

  public async listContentSections(id: string): Promise<MajorContentSectionDto[]> {
    await this.getMajor(id);
    return this.repository.listContentSections ? this.repository.listContentSections(id) : [];
  }

  public async listAliases(id: string): Promise<MajorAliasDto[]> {
    await this.getMajor(id);
    return this.repository.listAliases ? this.repository.listAliases(id) : [];
  }

  public async listRelationships(id: string): Promise<MajorRelationshipDto[]> {
    await this.getMajor(id);
    return this.repository.listRelationships ? this.repository.listRelationships(id) : [];
  }

  public async listClassificationMappings(id: string): Promise<MajorClassificationMappingDto[]> {
    await this.getMajor(id);
    return this.repository.listClassificationMappings ? this.repository.listClassificationMappings(id) : [];
  }

  public async listSources(id: string): Promise<MajorSourceDto[]> {
    await this.getMajor(id);
    return this.repository.listSources ? this.repository.listSources(id) : [];
  }

  public async updateMajor(id: string, updates: UpdateMajorDto): Promise<MajorDto> {
    const existing = await this.getMajor(id);

    const payloadForClassification = {
      canonicalMajorName: updates.displayName ?? existing.displayName,
      degreeLevel: updates.degreeLevel ?? existing.degreeLevel,
      degreeLevelId: existing.profiles?.find((profile) => profile.degreeLevelId)?.degreeLevelId ?? undefined,
      sourceClassificationSystem: updates.sourceClassificationSystem ?? existing.sourceClassificationSystem,
      academicFieldOrDiscipline: updates.academicFieldOrDiscipline !== undefined ? updates.academicFieldOrDiscipline || undefined : existing.academicFieldOrDiscipline,
      collegeOrFaculty: updates.collegeOrFaculty !== undefined ? updates.collegeOrFaculty || undefined : existing.collegeOrFaculty,
      sourceUrl: updates.sourceUrl !== undefined ? updates.sourceUrl || undefined : existing.sourceUrl || undefined,
      officialSourceUrl: updates.officialSourceUrl !== undefined ? updates.officialSourceUrl || undefined : existing.officialSourceUrl || undefined,
      academicFieldId: updates.academicFieldId !== undefined ? updates.academicFieldId || undefined : existing.academicFieldId || undefined,
      disciplineId: updates.disciplineId !== undefined ? updates.disciplineId || undefined : existing.disciplineId || undefined,
    };

    const classification = MajorCompletenessClassifier.classify(payloadForClassification);

    return this.repository.update(id, {
      ...updates,
      completenessStatus: classification.state
    });
  }

  public async markReadyToReview(id: string): Promise<void> {
    const existing = await this.getMajor(id);
    if (existing.completenessStatus === MajorImportCompletenessState.INCOMPLETE) {
      throw new Error('Cannot mark INCOMPLETE major as READY_TO_REVIEW');
    }
    if (existing.status !== MajorStatus.READY_TO_REVIEW) {
      await this.repository.updateStatus(id, MajorStatus.READY_TO_REVIEW);
    }
  }

  public async markReadyToPublish(id: string): Promise<void> {
    const existing = await this.getMajor(id);
    this.publicationReadiness.assertReady(
      id,
      { ...existing, status: MajorStatus.READY_TO_PUBLISH },
      this.publicationPolicy
    );
    await this.repository.updateStatus(id, MajorStatus.READY_TO_PUBLISH);
  }

  public async checkPublicationReadiness(id: string): Promise<PublicationReadinessResult> {
    const existing = await this.getMajor(id);
    return this.publicationReadiness.evaluate(id, existing, this.publicationPolicy);
  }

  public async publish(id: string): Promise<void> {
    const existing = await this.getMajor(id);
    this.publicationReadiness.assertReady(id, existing, this.publicationPolicy);
    await this.repository.updateStatus(id, MajorStatus.PUBLISHED);
  }

  public async unpublish(id: string): Promise<void> {
    const existing = await this.getMajor(id);
    if (existing.status !== MajorStatus.PUBLISHED) {
      throw new Error('Cannot unpublish a major that is not PUBLISHED');
    }
    await this.repository.updateStatus(id, MajorStatus.READY_TO_REVIEW);
  }

  public async reject(id: string): Promise<void> {
    const existing = await this.getMajor(id);
    if (existing.status === MajorStatus.PUBLISHED) {
      throw new Error('Cannot reject a PUBLISHED major. Unpublish first.');
    }
    await this.repository.updateStatus(id, MajorStatus.REJECTED);
  }

  public async archive(id: string): Promise<void> {
    await this.repository.updateStatus(id, MajorStatus.ARCHIVED);
  }
}
