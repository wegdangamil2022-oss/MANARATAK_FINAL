import {
  IUniversityRepository,
  ITransactionalUniversityRepository,
  PaginatedUniversityResult,
  UniversityCompletenessClassifier,
  UniversityDto,
  UniversityFilters,
  UniversityImportCompletenessState,
  UniversityStatus,
  UniversityNormalizedDetailsUpdate,
  UpdateUniversityDto,
  PublicationReadinessEngine,
  PublicationReadinessResult,
  UniversityPublicationReadinessPolicy,
} from '@manaratak/domain';
import {
  AtomicDomainMutationCoordinator,
  AtomicMutationRequestContext,
} from '../../event-foundation/use-cases/AtomicDomainMutationCoordinator';

export class AdminUniversityUseCases {
  constructor(
    private readonly repository: IUniversityRepository,
    private readonly atomicMutations?: AtomicDomainMutationCoordinator,
    private readonly publicationReadiness = new PublicationReadinessEngine(),
    private readonly publicationPolicy = new UniversityPublicationReadinessPolicy(),
  ) {}

  public async listUniversities(
    filters: UniversityFilters,
  ): Promise<PaginatedUniversityResult<UniversityDto>> {
    return this.repository.list(filters);
  }

  public async getUniversity(id: string): Promise<UniversityDto> {
    const university = await this.repository.findById(id);
    if (!university) {
      throw new Error(`University with id ${id} not found`);
    }
    return university;
  }

  public async updateUniversity(
    id: string,
    updates: UpdateUniversityDto,
    context?: AtomicMutationRequestContext,
  ): Promise<UniversityDto> {
    const existing = await this.getUniversity(id);

    const payloadForClassification = {
      universityName: updates.displayName ?? existing.displayName,
      officialWebsite: updates.officialWebsite ?? existing.officialWebsite,
      country: updates.country ?? existing.country,
      city: updates.city ?? existing.city,
      institutionType: updates.institutionType ?? existing.institutionType,
      sourceUrl:
        updates.sourceUrl !== undefined ? updates.sourceUrl || undefined : existing.sourceUrl,
      officialSourceUrl:
        updates.officialSourceUrl !== undefined
          ? updates.officialSourceUrl || undefined
          : existing.officialSourceUrl,
    };

    const classification = UniversityCompletenessClassifier.classify(payloadForClassification);

    return this.mutate('UNIVERSITY_UPDATED', id, context, (repository) =>
      repository.update(id, {
        ...updates,
        completenessStatus: classification.state,
      }),
    );
  }

  public async replaceNormalizedDetails(
    id: string,
    details: UniversityNormalizedDetailsUpdate,
    context?: AtomicMutationRequestContext,
  ): Promise<UniversityDto> {
    await this.getUniversity(id);
    return this.mutate(
      'UNIVERSITY_NORMALIZED_DETAILS_REPLACED',
      id,
      context,
      async (repository) => {
        if (!repository.replaceNormalizedDetails) {
          throw new Error('UNIVERSITY_NORMALIZED_PERSISTENCE_NOT_AVAILABLE');
        }
        return repository.replaceNormalizedDetails(id, details);
      },
    );
  }

  public async markReadyToReview(
    id: string,
    context?: AtomicMutationRequestContext,
  ): Promise<void> {
    const existing = await this.getUniversity(id);
    if (existing.completenessStatus === UniversityImportCompletenessState.INCOMPLETE) {
      throw new Error('Cannot mark INCOMPLETE university as READY_TO_REVIEW');
    }
    if (existing.status !== UniversityStatus.READY_TO_REVIEW) {
      await this.mutate('UNIVERSITY_MARKED_READY_TO_REVIEW', id, context, (repository) =>
        repository.updateStatus(id, UniversityStatus.READY_TO_REVIEW),
      );
    }
  }

  public async markReadyToPublish(
    id: string,
    context?: AtomicMutationRequestContext,
  ): Promise<void> {
    const existing = await this.getUniversity(id);
    if (existing.completenessStatus !== UniversityImportCompletenessState.COMPLETE) {
      throw new Error('Only COMPLETE universities can be marked as READY_TO_PUBLISH');
    }
    this.publicationReadiness.assertReady(
      id,
      { ...existing, status: UniversityStatus.READY_TO_PUBLISH },
      this.publicationPolicy,
    );
    await this.mutate('UNIVERSITY_MARKED_READY_TO_PUBLISH', id, context, (repository) =>
      repository.updateStatus(id, UniversityStatus.READY_TO_PUBLISH),
    );
  }

  public async checkPublicationReadiness(id: string): Promise<PublicationReadinessResult> {
    const existing = await this.getUniversity(id);
    return this.publicationReadiness.evaluate(
      id,
      { ...existing, status: UniversityStatus.READY_TO_PUBLISH },
      this.publicationPolicy,
    );
  }

  public async publish(id: string, context?: AtomicMutationRequestContext): Promise<void> {
    const existing = await this.getUniversity(id);
    if (existing.status !== UniversityStatus.READY_TO_PUBLISH) {
      throw new Error('Only READY_TO_PUBLISH universities can be PUBLISHED');
    }
    this.publicationReadiness.assertReady(id, existing, this.publicationPolicy);
    await this.mutate('UNIVERSITY_PUBLISHED', id, context, (repository) =>
      repository.updateStatus(id, UniversityStatus.PUBLISHED),
    );
  }

  public async unpublish(id: string, context?: AtomicMutationRequestContext): Promise<void> {
    const existing = await this.getUniversity(id);
    if (existing.status !== UniversityStatus.PUBLISHED) {
      throw new Error('Cannot unpublish a university that is not PUBLISHED');
    }
    await this.mutate('UNIVERSITY_UNPUBLISHED', id, context, (repository) =>
      repository.updateStatus(id, UniversityStatus.READY_TO_REVIEW),
    );
  }

  public async reject(id: string, context?: AtomicMutationRequestContext): Promise<void> {
    const existing = await this.getUniversity(id);
    if (existing.status === UniversityStatus.PUBLISHED) {
      throw new Error('Cannot reject a PUBLISHED university. Unpublish first.');
    }
    await this.mutate('UNIVERSITY_REJECTED', id, context, (repository) =>
      repository.updateStatus(id, UniversityStatus.REJECTED),
    );
  }

  public async archive(id: string, context?: AtomicMutationRequestContext): Promise<void> {
    await this.mutate('UNIVERSITY_ARCHIVED', id, context, (repository) =>
      repository.updateStatus(id, UniversityStatus.ARCHIVED),
    );
  }

  private mutate<T>(
    action: string,
    id: string,
    context: AtomicMutationRequestContext | undefined,
    mutation: (repository: IUniversityRepository) => Promise<T>,
  ): Promise<T> {
    if (!this.atomicMutations) return mutation(this.repository);
    const repository = this.repository as Partial<ITransactionalUniversityRepository>;
    if (!repository.withTransaction)
      throw new Error('UNIVERSITY_TRANSACTIONAL_PERSISTENCE_REQUIRED');
    return this.atomicMutations.execute(
      { domain: 'UNIVERSITIES', aggregateType: 'UNIVERSITY', aggregateId: id, action, context },
      (transaction) => mutation(repository.withTransaction!(transaction)),
    );
  }
}
