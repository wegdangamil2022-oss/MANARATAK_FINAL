import {
  IUniversityRepository,
  PaginatedUniversityResult,
  UniversityCompletenessClassifier,
  UniversityDto,
  UniversityFilters,
  UniversityImportCompletenessState,
  UniversityStatus,
  UpdateUniversityDto
} from '@manaratak/domain';

export class AdminUniversityUseCases {
  constructor(private readonly repository: IUniversityRepository) {}

  public async listUniversities(filters: UniversityFilters): Promise<PaginatedUniversityResult<UniversityDto>> {
    return this.repository.list(filters);
  }

  public async getUniversity(id: string): Promise<UniversityDto> {
    const university = await this.repository.findById(id);
    if (!university) {
      throw new Error(`University with id ${id} not found`);
    }
    return university;
  }

  public async updateUniversity(id: string, updates: UpdateUniversityDto): Promise<UniversityDto> {
    const existing = await this.getUniversity(id);

    const payloadForClassification = {
      universityName: updates.displayName ?? existing.displayName,
      officialWebsite: updates.officialWebsite ?? existing.officialWebsite,
      country: updates.country ?? existing.country,
      city: updates.city ?? existing.city,
      institutionType: updates.institutionType ?? existing.institutionType,
      sourceUrl: updates.sourceUrl !== undefined ? updates.sourceUrl || undefined : existing.sourceUrl,
      officialSourceUrl: updates.officialSourceUrl !== undefined ? updates.officialSourceUrl || undefined : existing.officialSourceUrl,
    };

    const classification = UniversityCompletenessClassifier.classify(payloadForClassification);

    return this.repository.update(id, {
      ...updates,
      completenessStatus: classification.state
    });
  }

  public async markReadyToReview(id: string): Promise<void> {
    const existing = await this.getUniversity(id);
    if (existing.completenessStatus === UniversityImportCompletenessState.INCOMPLETE) {
      throw new Error('Cannot mark INCOMPLETE university as READY_TO_REVIEW');
    }
    if (existing.status !== UniversityStatus.READY_TO_REVIEW) {
      await this.repository.updateStatus(id, UniversityStatus.READY_TO_REVIEW);
    }
  }

  public async markReadyToPublish(id: string): Promise<void> {
    const existing = await this.getUniversity(id);
    if (existing.completenessStatus !== UniversityImportCompletenessState.COMPLETE) {
      throw new Error('Only COMPLETE universities can be marked as READY_TO_PUBLISH');
    }
    await this.repository.updateStatus(id, UniversityStatus.READY_TO_PUBLISH);
  }

  public async publish(id: string): Promise<void> {
    const existing = await this.getUniversity(id);
    if (existing.status !== UniversityStatus.READY_TO_PUBLISH) {
      throw new Error('Only READY_TO_PUBLISH universities can be PUBLISHED');
    }
    await this.repository.updateStatus(id, UniversityStatus.PUBLISHED);
  }

  public async unpublish(id: string): Promise<void> {
    const existing = await this.getUniversity(id);
    if (existing.status !== UniversityStatus.PUBLISHED) {
      throw new Error('Cannot unpublish a university that is not PUBLISHED');
    }
    await this.repository.updateStatus(id, UniversityStatus.READY_TO_REVIEW);
  }

  public async reject(id: string): Promise<void> {
    const existing = await this.getUniversity(id);
    if (existing.status === UniversityStatus.PUBLISHED) {
      throw new Error('Cannot reject a PUBLISHED university. Unpublish first.');
    }
    await this.repository.updateStatus(id, UniversityStatus.REJECTED);
  }

  public async archive(id: string): Promise<void> {
    await this.repository.updateStatus(id, UniversityStatus.ARCHIVED);
  }
}
