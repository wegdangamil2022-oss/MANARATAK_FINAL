import {
  CareerEmployerDto,
  CareerEmployerFilters,
  CareerEmployerStatus,
  CareerJobFilters,
  CareerJobPostingDto,
  CareerJobStatus,
  CareerOpportunityType,
  CreateCareerEmployerDto,
  CreateCareerJobPostingDto,
  EmploymentType,
  ICareerRepository,
  PaginatedCareerResult,
  UpdateCareerJobPostingDto
} from '@manaratak/domain';

export interface CreateEmployerInput {
  displayName: string;
  employerType: string;
  industry?: string | null;
  country?: string | null;
  city?: string | null;
  websiteUrl?: string | null;
  logoAssetId?: string | null;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface CreateJobInput {
  title: string;
  opportunityType: CareerOpportunityType;
  employmentType: EmploymentType;
  jobCategory: string;
  description: string;
  country: string;
  city?: string | null;
  employerId: string;
  recruiterContactId?: string | null;
  applicationDeadline?: Date | string | null;
  externalPostingUrl?: string | null;
  salaryRange?: Record<string, unknown> | null;
  requiredSkills?: string[] | null;
  educationRequirement?: string | null;
  languageRequirements?: string[] | null;
  remoteOption?: boolean;
  metadata?: Record<string, unknown> | null;
}

export class CareerAdminUseCases {
  constructor(private readonly repository: ICareerRepository) {}

  public async createEmployer(input: CreateEmployerInput): Promise<CareerEmployerDto> {
    const canonicalName = normalizeText(input.displayName);
    if (!canonicalName) {
      throw new Error('Employer displayName is required');
    }
    if (input.logoAssetId && /^https?:\/\//i.test(input.logoAssetId)) {
      throw new Error('logoAssetId must be a Phase 05 EAP handle, not a raw URL');
    }
    const canonicalDedupKey = [canonicalName, input.country || 'GLOBAL', input.employerType].join('|');
    const existing = await this.repository.findEmployerByDedupKey(canonicalDedupKey);
    if (existing) {
      throw new Error('A matching recruitment employer already exists');
    }

    const data: CreateCareerEmployerDto = {
      ...input,
      publicId: `career_emp_${Date.now().toString(36)}`,
      slug: slugify(input.displayName),
      canonicalName,
      canonicalDedupKey,
      verificationStatus: CareerEmployerStatus.UNVERIFIED
    };

    return this.repository.createEmployer(data);
  }

  public async createJob(input: CreateJobInput): Promise<CareerJobPostingDto> {
    this.ensureJobRequired(input);
    const employer = await this.repository.findEmployerById(input.employerId);
    if (!employer) {
      throw new Error('Recruitment employer not found');
    }
    const canonicalTitle = normalizeText(input.title);
    const canonicalDedupKey = [
      canonicalTitle,
      input.employerId,
      input.country,
      input.city || 'REMOTE_OR_GLOBAL',
      input.employmentType
    ].join('|');

    const existing = await this.repository.findJobByDedupKey(canonicalDedupKey);
    if (existing) {
      throw new Error('A matching job posting already exists');
    }

    const data: CreateCareerJobPostingDto = {
      ...input,
      publicId: `career_job_${Date.now().toString(36)}`,
      slug: slugify(`${input.title}-${employer.displayName}`),
      canonicalTitle,
      canonicalDedupKey,
      status: CareerJobStatus.READY_TO_REVIEW,
      remoteOption: Boolean(input.remoteOption)
    };

    return this.repository.createJob(data);
  }

  public async listEmployers(filters: CareerEmployerFilters): Promise<PaginatedCareerResult<CareerEmployerDto>> {
    return this.repository.listEmployers({
      ...filters,
      pageSize: Math.min(filters.pageSize || 50, 50)
    });
  }

  public async updateJob(id: string, updates: UpdateCareerJobPostingDto): Promise<CareerJobPostingDto> {
    await this.getJob(id);
    return this.repository.updateJob(id, updates);
  }

  public async listJobs(filters: CareerJobFilters): Promise<PaginatedCareerResult<CareerJobPostingDto>> {
    return this.repository.listJobs(filters);
  }

  public async getJob(id: string): Promise<CareerJobPostingDto> {
    const job = await this.repository.findJobById(id);
    if (!job) {
      throw new Error(`Career job with id ${id} not found`);
    }
    return job;
  }

  public async markReadyToPublish(id: string): Promise<void> {
    const job = await this.getJob(id);
    if (job.status !== CareerJobStatus.READY_TO_REVIEW) {
      throw new Error('Only READY_TO_REVIEW jobs can be marked READY_TO_PUBLISH');
    }
    await this.repository.updateJobStatus(id, CareerJobStatus.READY_TO_PUBLISH);
  }

  public async publish(id: string): Promise<void> {
    const job = await this.getJob(id);
    if (job.status !== CareerJobStatus.READY_TO_PUBLISH) {
      throw new Error('Only READY_TO_PUBLISH jobs can be PUBLISHED');
    }
    await this.repository.updateJobStatus(id, CareerJobStatus.PUBLISHED);
  }

  public async archive(id: string): Promise<void> {
    await this.getJob(id);
    await this.repository.updateJobStatus(id, CareerJobStatus.ARCHIVED);
  }

  private ensureJobRequired(input: CreateJobInput): void {
    const required = [input.title, input.jobCategory, input.description, input.country, input.employerId];
    if (required.some((value) => !value?.trim())) {
      throw new Error('title, jobCategory, description, country, and employerId are required');
    }
  }
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/\b(urgent|hiring|best|opportunity|2024|2025|2026|2027)\b/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(value: string): string {
  const slug = normalizeText(value).replace(/\s+/g, '-');
  return slug || `career-${Date.now().toString(36)}`;
}
