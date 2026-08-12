import {
  CareerJobFilters,
  CareerJobPostingDto,
  ICareerRepository,
  PaginatedCareerResult
} from '@manaratak/domain';

export class CareerPublicUseCases {
  constructor(private readonly repository: ICareerRepository) {}

  public async listPublishedJobs(filters: Omit<CareerJobFilters, 'status'>): Promise<PaginatedCareerResult<CareerJobPostingDto>> {
    return this.repository.listPublishedJobs({
      ...filters,
      pageSize: Math.min(filters.pageSize || 20, 50)
    });
  }

  public async getPublishedJobBySlug(slug: string): Promise<CareerJobPostingDto> {
    const job = await this.repository.findJobBySlug(slug);
    if (!job || job.status !== 'PUBLISHED') {
      throw new Error('Career opportunity not found');
    }
    return job;
  }
}
