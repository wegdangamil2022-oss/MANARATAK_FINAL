import {
  IScholarshipRepository,
  PublicScholarshipFilters,
  PublicScholarshipDto,
  PaginatedResult,
} from '@manaratak/domain';

export class PublicScholarshipUseCases {
  constructor(private readonly repository: IScholarshipRepository) {}

  public async listScholarships(filters: PublicScholarshipFilters): Promise<PaginatedResult<PublicScholarshipDto>> {
    const paginated = await this.repository.listPublished(filters);
    return { ...paginated, data: paginated.data.map(this.mapToPublicDto) };
  }

  public async getScholarship(slug: string): Promise<PublicScholarshipDto> {
    const scholarship = await this.repository.findPublishedBySlug(slug);
    if (!scholarship) throw new Error('Scholarship not found');
    return this.mapToPublicDto(scholarship);
  }

  private mapToPublicDto(scholarship: any): PublicScholarshipDto {
    const {
      id, canonicalDedupKey, sourceImportRecordId, status, completenessStatus,
      verificationStatus, publicationStatus, createdAt, optionalFields,
      versions, sponsorContext, applicationCycles,
      ...publicData
    } = scholarship;
    // W8: canonical fields always win. Legacy optionalFields are never spread into public output.
    return publicData as PublicScholarshipDto;
  }
}
