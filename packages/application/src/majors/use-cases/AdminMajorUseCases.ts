import {
  IMajorRepository,
  ITransactionalMajorRepository,
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
  PublicationReadinessError,
  TaxonomyMappedMajorDto,
  UpdateMajorDto
} from '@manaratak/domain';
import { AtomicDomainMutationCoordinator, AtomicMutationRequestContext } from '../../event-foundation/use-cases/AtomicDomainMutationCoordinator';
import { CanonicalMajorReferenceService } from '../services/CanonicalMajorReferenceService';

export class AdminMajorUseCases {
  constructor(
    private readonly repository: IMajorRepository,
    private readonly catalogRepository?: { listCatalog: (filters: any) => Promise<any>; getCatalogItem?: (id: string) => any; getCatalogContentSections?: (id: string) => any[]; getCatalogSource?: (id: string) => any[]; listCollegeFacets?: (degreeLevel?: string) => any[] },
    private readonly publicationReadiness = new PublicationReadinessEngine(),
    private readonly publicationPolicy = new MajorPublicationReadinessPolicy(),
    private readonly atomicMutations?: AtomicDomainMutationCoordinator,
    private readonly canonicalReferences?: CanonicalMajorReferenceService,
  ) {}

  public async listMajors(filters: MajorFilters & { catalog?: string }): Promise<PaginatedMajorResult<any>> {
    if (this.catalogRepository && filters.catalog !== 'false') {
      console.log("CALLING CATALOG REPO"); return this.catalogRepository.listCatalog(filters);
    }
    return this.repository.list(filters);
  }

  public async getMajor(id: string): Promise<MajorDto> {
    if (id.startsWith('cat-') && this.catalogRepository?.getCatalogItem) {
      const catalog = this.catalogRepository.getCatalogItem(id);
      if (catalog) return { ...catalog, publicId: catalog.code, canonicalName: catalog.nameEn || catalog.displayName, canonicalDedupKey: catalog.code } as MajorDto;
    }
    const major = await this.repository.findById(id);
    if (!major && this.catalogRepository?.getCatalogItem) {
      const catalog = this.catalogRepository.getCatalogItem(id);
      if (catalog) return { ...catalog, publicId: catalog.code, canonicalName: catalog.nameEn || catalog.displayName, canonicalDedupKey: catalog.code } as MajorDto;
    }
    if (!major) {
      throw new Error(`Major with id ${id} not found`);
    }
    return major;
  }

  public async listVersions(id: string): Promise<MajorVersionDto[]> {
    if (id.startsWith('cat-')) return [];
    await this.getMajor(id);
    return this.repository.listVersions ? this.repository.listVersions(id) : [];
  }

  public async listLevelProfiles(id: string): Promise<MajorLevelProfileDto[]> {
    if (id.startsWith('cat-')) {
      const item = this.catalogRepository?.getCatalogItem?.(id);
      return item ? [{ id: item.id, code: item.code, level: item.catalogKind, displayName: item.displayName, localizedNameAr: item.nameAr, localizedNameEn: item.nameEn, collegeContext: item.collegeOrFaculty || item.collegeOrField }] as MajorLevelProfileDto[] : [];
    }
    await this.getMajor(id);
    return this.repository.listLevelProfiles ? this.repository.listLevelProfiles(id) : [];
  }

  public async listContentSections(id: string): Promise<MajorContentSectionDto[]> {
    if (id.startsWith('cat-') && this.catalogRepository?.getCatalogContentSections) return this.catalogRepository.getCatalogContentSections(id) as MajorContentSectionDto[];
    const major = await this.repository.findById(id);
    if (!major && this.catalogRepository?.getCatalogContentSections) return this.catalogRepository.getCatalogContentSections(id) as MajorContentSectionDto[];
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
    if (id.startsWith('cat-') && this.catalogRepository?.getCatalogSource) return this.catalogRepository.getCatalogSource(id) as MajorSourceDto[];
    const major = await this.repository.findById(id);
    if (!major && this.catalogRepository?.getCatalogSource) return this.catalogRepository.getCatalogSource(id) as MajorSourceDto[];
    await this.getMajor(id);
    return this.repository.listSources ? this.repository.listSources(id) : [];
  }

  public listCollegeFacets(degreeLevel?: string) { return this.catalogRepository?.listCollegeFacets?.(degreeLevel) ?? []; }

  public async listByTaxonomyNode(taxonomyNodeId: string): Promise<TaxonomyMappedMajorDto[]> {
    if (!this.repository.listByTaxonomyNode) {
      throw new Error('MAJOR_TAXONOMY_REVERSE_LOOKUP_UNAVAILABLE');
    }
    return this.repository.listByTaxonomyNode(taxonomyNodeId);
  }

  public async updateMajor(id: string, updates: UpdateMajorDto, context?: AtomicMutationRequestContext): Promise<MajorDto> {
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
      sourceImportRecordId: existing.sourceImportRecordId,
      sources: existing.sources,
      academicFieldId: updates.academicFieldId !== undefined ? updates.academicFieldId || undefined : existing.academicFieldId || undefined,
      disciplineId: updates.disciplineId !== undefined ? updates.disciplineId || undefined : existing.disciplineId || undefined,
    };

    const classification = MajorCompletenessClassifier.classify(payloadForClassification);

    return this.mutate('MAJOR_UPDATED', id, context, repository => repository.update(id, {
      ...updates,
      completenessStatus: classification.state
    }));
  }

  public async markReadyToReview(id: string, context?: AtomicMutationRequestContext): Promise<void> {
    const existing = await this.getMajor(id);
    if (existing.completenessStatus === MajorImportCompletenessState.INCOMPLETE) {
      throw new Error('Cannot mark INCOMPLETE major as READY_TO_REVIEW');
    }
    if (existing.status !== MajorStatus.READY_TO_REVIEW) {
      await this.mutate('MAJOR_MARKED_READY_TO_REVIEW', id, context, repository => repository.updateStatus(id, MajorStatus.READY_TO_REVIEW));
    }
  }

  public async markReadyToPublish(id: string, context?: AtomicMutationRequestContext): Promise<void> {
    const existing = await this.getMajor(id);
    await this.assertPublicationReady(id, { ...existing, status: MajorStatus.READY_TO_PUBLISH });
    await this.mutate('MAJOR_MARKED_READY_TO_PUBLISH', id, context, repository => repository.updateStatus(id, MajorStatus.READY_TO_PUBLISH));
  }

  public async checkPublicationReadiness(id: string): Promise<PublicationReadinessResult> {
    const existing = await this.getMajor(id);
    return this.evaluatePublicationReadiness(id, existing);
  }

  public async publish(id: string, context?: AtomicMutationRequestContext): Promise<void> {
    const existing = await this.getMajor(id);
    await this.assertPublicationReady(id, existing);
    await this.mutate('MAJOR_PUBLISHED', id, context, repository => repository.updateStatus(id, MajorStatus.PUBLISHED));
  }

  public async unpublish(id: string, context?: AtomicMutationRequestContext): Promise<void> {
    const existing = await this.getMajor(id);
    if (existing.status !== MajorStatus.PUBLISHED) {
      throw new Error('Cannot unpublish a major that is not PUBLISHED');
    }
    await this.mutate('MAJOR_UNPUBLISHED', id, context, repository => repository.updateStatus(id, MajorStatus.READY_TO_REVIEW));
  }

  public async reject(id: string, context?: AtomicMutationRequestContext): Promise<void> {
    const existing = await this.getMajor(id);
    if (existing.status === MajorStatus.PUBLISHED) {
      throw new Error('Cannot reject a PUBLISHED major. Unpublish first.');
    }
    await this.mutate('MAJOR_REJECTED', id, context, repository => repository.updateStatus(id, MajorStatus.REJECTED));
  }

  public async archive(id: string, context?: AtomicMutationRequestContext): Promise<void> {
    await this.mutate('MAJOR_ARCHIVED', id, context, repository => repository.updateStatus(id, MajorStatus.ARCHIVED));
  }

  private mutate<T>(action: string, id: string, context: AtomicMutationRequestContext | undefined, mutation: (repository: IMajorRepository) => Promise<T>): Promise<T> {
    if (!this.atomicMutations) return mutation(this.repository);
    const repository = this.repository as Partial<ITransactionalMajorRepository>;
    if (!repository.withTransaction) throw new Error('MAJOR_TRANSACTIONAL_PERSISTENCE_REQUIRED');
    return this.atomicMutations.execute({ domain: 'MAJORS', aggregateType: 'MAJOR', aggregateId: id, action, context },
      transaction => mutation(repository.withTransaction!(transaction)));
  }

  private async evaluatePublicationReadiness(id: string, major: MajorDto): Promise<PublicationReadinessResult> {
    const result = this.publicationReadiness.evaluate(id, major, this.publicationPolicy);
    if (!this.canonicalReferences) return result;
    const canonicalIssues = await this.canonicalReferences.publicationIssues(major);
    return {
      ...result,
      ready: result.ready && canonicalIssues.length === 0,
      blockingIssues: [...result.blockingIssues, ...canonicalIssues],
    };
  }

  private async assertPublicationReady(id: string, major: MajorDto): Promise<void> {
    const result = await this.evaluatePublicationReadiness(id, major);
    if (!result.ready) throw new PublicationReadinessError(result);
  }
}
