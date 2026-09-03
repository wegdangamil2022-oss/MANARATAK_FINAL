import {
  CareerEmployerDto,
  CareerEmployerFilters,
  CareerJobFilters,
  CareerJobPostingDto,
  CreateCareerEmployerDto,
  CreateCareerJobPostingDto,
  PaginatedCareerResult,
  UpdateCareerEmployerDto,
  CareerJobRepositoryUpdateDto
} from '../entities';
import { CareerJobStatus } from '../enums';

export interface ICareerRepository {
  createEmployer(data: CreateCareerEmployerDto): Promise<CareerEmployerDto>;
  updateEmployer(id: string, data: UpdateCareerEmployerDto): Promise<CareerEmployerDto>;
  findEmployerById(id: string): Promise<CareerEmployerDto | null>;
  findEmployerBySlug(slug: string): Promise<CareerEmployerDto | null>;
  findEmployerByDedupKey(dedupKey: string): Promise<CareerEmployerDto | null>;
  listEmployers(filters: CareerEmployerFilters): Promise<PaginatedCareerResult<CareerEmployerDto>>;

  createJob(data: CreateCareerJobPostingDto): Promise<CareerJobPostingDto>;
  updateJob(id: string, data: CareerJobRepositoryUpdateDto): Promise<CareerJobPostingDto>;
  findJobById(id: string): Promise<CareerJobPostingDto | null>;
  findJobBySlug(slug: string): Promise<CareerJobPostingDto | null>;
  findJobByDedupKey(dedupKey: string): Promise<CareerJobPostingDto | null>;
  updateJobStatus(id: string, status: CareerJobStatus): Promise<void>;
  listJobs(filters: CareerJobFilters): Promise<PaginatedCareerResult<CareerJobPostingDto>>;
  listPublishedJobs(filters: Omit<CareerJobFilters, 'status'>): Promise<PaginatedCareerResult<CareerJobPostingDto>>;
}

export interface ICareerReferenceGateway {
  resolveCountryReference(input: string): Promise<{ id: string; label?: string }>;
  resolveCityReference(input: string, expectedCountryReferenceId?: string): Promise<{ id: string; label?: string }>;
}
