import {
  CourseAccessType,
  CourseImportCompletenessState,
  CourseOriginType,
  CourseStatus,
  ICourseRepository,
  PaginatedCourseResult,
  PublicCourseDto,
  PublicCourseFilters
} from '@manaratak/domain';

export class PublicCourseUseCases {
  constructor(private readonly repository: ICourseRepository) {}

  public async listCourses(filters: PublicCourseFilters): Promise<PaginatedCourseResult<PublicCourseDto>> {
    const paginated = await this.repository.listPublished(filters);

    return {
      ...paginated,
      data: paginated.data.map((course) => this.mapToPublicDto(course))
    };
  }

  public async getCourse(slug: string): Promise<PublicCourseDto> {
    const course = await this.repository.findBySlug(slug);

    if (!course || course.status !== CourseStatus.PUBLISHED || course.completenessStatus !== CourseImportCompletenessState.COMPLETE || !this.publicEligible(course)) {
      throw new Error('Course not found');
    }

    return this.mapToPublicDto(course);
  }

  private mapToPublicDto(course: any): PublicCourseDto {
    const optional = course.optionalFields && typeof course.optionalFields === 'object' && !Array.isArray(course.optionalFields)
      ? course.optionalFields as Record<string, unknown>
      : {};
    const optionalPublic = this.pickOptionalPublicFields(optional);
    return {
      ownerId: course.id,
      publicId: course.publicId,
      slug: course.slug,
      displayName: course.displayName,
      canonicalName: course.canonicalName,
      accessType: course.accessType,
      originType: course.originType,
      directCourseUrl: course.directCourseUrl,
      externalProviderId: course.externalProviderId ?? null,
      isStudyFree: course.isStudyFree ?? null,
      isFreeCertificate: course.isFreeCertificate ?? null,
      certificateType: course.certificateType ?? null,
      learningLanguageReferenceId: course.learningLanguageReferenceId ?? null,
      platformName: course.platformName ?? null,
      providerName: course.providerName ?? null,
      learningLanguage: course.learningLanguage ?? null,
      studyDuration: course.studyDuration ?? null,
      certificateAvailable: course.certificateAvailable ?? null,
      category: course.category ?? null,
      difficultyLevel: course.difficultyLevel ?? null,
      sourceUrl: course.sourceUrl ?? null,
      officialSourceUrl: course.officialSourceUrl ?? null,
      thumbnailAssetId: course.thumbnailAssetId ?? null,
      ...optionalPublic,
      updatedAt: course.updatedAt,
    };
  }

  private pickOptionalPublicFields(optional: Record<string, unknown>): Partial<PublicCourseDto> {
    const allowed = [
      'courseContent', 'relatedMajorsOrFields', 'acquiredSkills', 'localizedNames', 'metadata',
    ] as const;
    const result: Record<string, unknown> = {};
    for (const key of allowed) if (optional[key] !== undefined) result[key] = optional[key];
    return result as Partial<PublicCourseDto>;
  }

  private publicEligible(course: any): boolean {
    if (course.originType !== CourseOriginType.EXTERNAL_LINKED_COURSE) return true;
    return course.accessType !== CourseAccessType.PAID && (course.isStudyFree === true || course.isFreeCertificate === true);
  }
}
