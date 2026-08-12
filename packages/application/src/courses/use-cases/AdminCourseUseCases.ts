import {
  CourseAccessType,
  CourseCompletenessClassifier,
  CourseDto,
  CourseFilters,
  CourseImportCompletenessState,
  CourseOriginType,
  CourseStatus,
  ICourseRepository,
  PaginatedCourseResult,
  UpdateCourseDto
} from '@manaratak/domain';

export class AdminCourseUseCases {
  constructor(private readonly repository: ICourseRepository) {}

  public async listCourses(filters: CourseFilters): Promise<PaginatedCourseResult<CourseDto>> {
    return this.repository.list(filters);
  }

  public async getCourse(id: string): Promise<CourseDto> {
    const course = await this.repository.findById(id);
    if (!course) {
      throw new Error(`Course with id ${id} not found`);
    }
    return course;
  }

  public async updateCourse(id: string, updates: UpdateCourseDto): Promise<CourseDto> {
    const existing = await this.getCourse(id);
    const accessType = updates.accessType ?? existing.accessType;
    const originType = updates.originType ?? existing.originType;
    const displayName = updates.displayName ?? existing.displayName;
    const directCourseUrl = updates.directCourseUrl ?? existing.directCourseUrl;

    if (accessType === CourseAccessType.PAID || originType === CourseOriginType.PAID_COURSE) {
      const completenessStatus = displayName && directCourseUrl
        ? CourseImportCompletenessState.COMPLETE
        : CourseImportCompletenessState.INCOMPLETE;

      return this.repository.update(id, {
        ...updates,
        completenessStatus
      });
    }

    const payloadForClassification = {
      courseName: displayName,
      accessType,
      originType,
      directCourseUrl,
      platformName: updates.platformName !== undefined ? updates.platformName || undefined : existing.platformName,
      providerName: updates.providerName !== undefined ? updates.providerName || undefined : existing.providerName,
      sourceUrl: updates.sourceUrl !== undefined ? updates.sourceUrl || undefined : existing.sourceUrl,
      officialSourceUrl: updates.officialSourceUrl !== undefined ? updates.officialSourceUrl || undefined : existing.officialSourceUrl,
    };

    const classification = CourseCompletenessClassifier.classify(payloadForClassification);

    return this.repository.update(id, {
      ...updates,
      completenessStatus: classification.state
    });
  }

  public async markReadyToReview(id: string): Promise<void> {
    const existing = await this.getCourse(id);
    if (existing.completenessStatus === CourseImportCompletenessState.INCOMPLETE) {
      throw new Error('Cannot mark INCOMPLETE course as READY_TO_REVIEW');
    }
    if (existing.status !== CourseStatus.READY_TO_REVIEW) {
      await this.repository.updateStatus(id, CourseStatus.READY_TO_REVIEW);
    }
  }

  public async markReadyToPublish(id: string): Promise<void> {
    const existing = await this.getCourse(id);
    if (existing.completenessStatus !== CourseImportCompletenessState.COMPLETE) {
      throw new Error('Only COMPLETE courses can be marked as READY_TO_PUBLISH');
    }
    await this.repository.updateStatus(id, CourseStatus.READY_TO_PUBLISH);
  }

  public async publish(id: string): Promise<void> {
    const existing = await this.getCourse(id);
    if (existing.status !== CourseStatus.READY_TO_PUBLISH) {
      throw new Error('Only READY_TO_PUBLISH courses can be PUBLISHED');
    }
    await this.repository.updateStatus(id, CourseStatus.PUBLISHED);
  }

  public async unpublish(id: string): Promise<void> {
    const existing = await this.getCourse(id);
    if (existing.status !== CourseStatus.PUBLISHED) {
      throw new Error('Cannot unpublish a course that is not PUBLISHED');
    }
    await this.repository.updateStatus(id, CourseStatus.READY_TO_REVIEW);
  }

  public async reject(id: string): Promise<void> {
    const existing = await this.getCourse(id);
    if (existing.status === CourseStatus.PUBLISHED) {
      throw new Error('Cannot reject a PUBLISHED course. Unpublish first.');
    }
    await this.repository.updateStatus(id, CourseStatus.REJECTED);
  }

  public async archive(id: string): Promise<void> {
    await this.repository.updateStatus(id, CourseStatus.ARCHIVED);
  }
}
