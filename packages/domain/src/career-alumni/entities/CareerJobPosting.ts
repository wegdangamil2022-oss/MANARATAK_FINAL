import { CareerJobStatus, CareerOpportunityType, EmploymentType } from '../enums';
import { CareerEmployerDto } from './CareerEmployer';

export interface CareerJobPostingDto {
  id: string;
  publicId: string;
  slug: string;
  canonicalTitle: string;
  canonicalDedupKey: string;
  title: string;
  opportunityType: CareerOpportunityType;
  employmentType: EmploymentType;
  jobCategory: string;
  description: string;
  country: string;
  city?: string | null;
  status: CareerJobStatus;
  employerId: string;
  employer?: CareerEmployerDto;
  recruiterContactId?: string | null;
  applicationDeadline?: Date | string | null;
  externalPostingUrl?: string | null;
  salaryRange?: Record<string, unknown> | null;
  requiredSkills?: string[] | null;
  educationRequirement?: string | null;
  languageRequirements?: string[] | null;
  remoteOption: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateCareerJobPostingDto extends Omit<CareerJobPostingDto, 'id' | 'createdAt' | 'updatedAt' | 'employer'> {}

export interface UpdateCareerJobPostingDto {
  title?: string;
  opportunityType?: CareerOpportunityType;
  employmentType?: EmploymentType;
  jobCategory?: string;
  description?: string;
  country?: string;
  city?: string | null;
  status?: CareerJobStatus;
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

export interface CareerJobFilters {
  status?: CareerJobStatus;
  opportunityType?: CareerOpportunityType;
  employmentType?: EmploymentType;
  jobCategory?: string;
  country?: string;
  city?: string;
  employerId?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedCareerResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
