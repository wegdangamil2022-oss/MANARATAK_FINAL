import {
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
      data: paginated.data.map(this.mapToPublicDto)
    };
  }

  public async getCourse(slug: string): Promise<PublicCourseDto> {
    const course = await this.repository.findBySlug(slug);

    if (!course || course.status !== CourseStatus.PUBLISHED) {
      throw new Error('Course not found');
    }

    return this.mapToPublicDto(course);
  }

  private mapToPublicDto(course: any): PublicCourseDto {
    const {
      id,
      canonicalDedupKey,
      sourceImportRecordId,
      status,
      completenessStatus,
      createdAt,
      optionalFields,
      ...publicData
    } = course;

    return {
      ...publicData,
      ...(optionalFields || {}),
    };
  }
}
