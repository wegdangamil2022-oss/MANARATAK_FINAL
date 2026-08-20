import type { AtomicPersistenceContext } from '../event-foundation/outbox/TransactionalOutbox';

export enum ScholarshipCompletenessState {
  INCOMPLETE = 'INCOMPLETE',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
  COMPLETE = 'COMPLETE',
}

export enum ScholarshipStatus {
  IMPORTED = 'IMPORTED',
  ARCHIVED = 'ARCHIVED',
  REJECTED = 'REJECTED',
  PUBLISHED = 'PUBLISHED',
  READY_TO_PUBLISH = 'READY_TO_PUBLISH',
  READY_TO_REVIEW = 'READY_TO_REVIEW',
}

export interface CreateScholarshipDto {
  publicId: string;
  slug: string;
  canonicalName: string;
  canonicalDedupKey: string;
  displayName: string;
  status: ScholarshipStatus;
  completenessStatus: ScholarshipCompletenessState;
  providerName?: string | null;
  amountMinorUnits?: string | null;
  amountCurrencyCode?: string | null;
  isFullyFunded?: boolean;
  applicationDeadline?: Date | null;
  officialWebsite?: string | null;
  sourceUrl?: string | null;
  fundingCoverage?: string;
  coverageDetails?: string;
  eligibleMajorsOrFields?: string | string[];
  degreeLevel?: string;
  studyCountry?: string;
  applicationLink?: string;
  officialSourceUrl?: string;
  sponsorName?: string;
  requiredDocuments?: string | string[];
  eligibilityCriteria?: string;
  studyLanguage?: string;
  targetUniversities?: string[];
  targetAcademicPrograms?: string[];
  fundingAmount?: string | number;
  currency?: string;
  duration?: string;
  localizedNames?: Record<string, string>;
  metadata?: Record<string, unknown>;
  sourceImportRecordId?: string | null;
  optionalFields?: Record<string, unknown>;
}

export interface ScholarshipDto extends CreateScholarshipDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UpdateScholarshipDto = Partial<
  Omit<CreateScholarshipDto, 'publicId' | 'slug' | 'canonicalName' | 'canonicalDedupKey'>
>;

export interface ScholarshipFilters {
  status?: ScholarshipStatus;
  completenessStatus?: ScholarshipCompletenessState;
  country?: string;
  page?: number;
  pageSize?: number;
}

export interface PublicScholarshipFilters {
  country?: string;
  page?: number;
  pageSize?: number;
}

export interface ScholarshipPage<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type PublicScholarshipDto = Omit<
  ScholarshipDto,
  | 'id'
  | 'canonicalDedupKey'
  | 'sourceImportRecordId'
  | 'status'
  | 'completenessStatus'
  | 'createdAt'
  | 'optionalFields'
>;

export interface IScholarshipRepository {
  create(data: CreateScholarshipDto): Promise<ScholarshipDto>;
  update(id: string, updates: UpdateScholarshipDto): Promise<ScholarshipDto>;
  findByDedupKey(key: string): Promise<ScholarshipDto | null>;
  findById(id: string): Promise<ScholarshipDto | null>;
  findBySlug(slug: string): Promise<ScholarshipDto | null>;
  updateStatus(id: string, status: ScholarshipStatus): Promise<void>;
  list(filters: ScholarshipFilters): Promise<ScholarshipPage<ScholarshipDto>>;
  listPublished(filters: PublicScholarshipFilters): Promise<ScholarshipPage<ScholarshipDto>>;
  findByPublicId?(publicId: string): Promise<ScholarshipDto | null>;
  updateImportLink?(id: string, sourceImportRecordId: string): Promise<void>;
  listByStatus?(status: ScholarshipStatus): Promise<ScholarshipDto[]>;
  listPublishable?(): Promise<ScholarshipDto[]>;
}

export interface ITransactionalScholarshipRepository extends IScholarshipRepository {
  withTransaction(context: AtomicPersistenceContext): IScholarshipRepository;
}
