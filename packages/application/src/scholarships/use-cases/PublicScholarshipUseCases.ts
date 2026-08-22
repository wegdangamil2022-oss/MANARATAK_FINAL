import { 
  IScholarshipRepository, 
  PublicScholarshipFilters, 
  PublicScholarshipDto, 
  PaginatedResult,
  ScholarshipPublicationStatus
} from '@manaratak/domain';

export class PublicScholarshipUseCases {
  constructor(private readonly repository: IScholarshipRepository) {}

  public async listScholarships(filters: PublicScholarshipFilters): Promise<PaginatedResult<PublicScholarshipDto>> {
    const paginated = await this.repository.listPublished(filters);
    
    return {
      ...paginated,
      data: paginated.data.map(this.mapToPublicDto)
    };
  }

  public async getScholarship(slug: string): Promise<PublicScholarshipDto> {
    const scholarship = await this.repository.findBySlug(slug);
    
    if (!scholarship || scholarship.publicationStatus !== ScholarshipPublicationStatus.PUBLISHED) {
      throw new Error('Scholarship not found');
    }
    
    return this.mapToPublicDto(scholarship);
  }

  private mapToPublicDto(scholarship: any): PublicScholarshipDto {
    const {
      id,
      canonicalDedupKey,
      sourceImportRecordId,
      status,
      completenessStatus,
      verificationStatus,
      publicationStatus,
      createdAt,
      optionalFields,
      ...publicData
    } = scholarship;

    return {
      ...publicData,
      ...(optionalFields || {}),
    };
  }
}
