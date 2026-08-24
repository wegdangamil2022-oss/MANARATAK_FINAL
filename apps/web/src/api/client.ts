import { CsrfClientManager } from '@manaratak/shared';

export interface ReferenceCountryDto {
  iso2Code: string;
  iso3Code: string;
  name: string;
  officialName?: string | null;
  region?: string | null;
  subregion?: string | null;
  defaultCurrencyCode?: string | null;
  defaultLanguageCode?: string | null;
  callingCode?: string | null;
  flagAssetId?: string | null;
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

export interface AdministrativeRegionDto {
  id: string;
  countryIso2Code: string;
  regionCode: string;
  name: string;
  nameAr?: string | null;
  localName?: string | null;
  regionType?: string | null;
}

export interface ReferenceCityDto {
  id?: string;
  countryIso2Code: string;
  name: string;
  region?: string | null;
  timezone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isActive: boolean;
  metadata?: Record<string, unknown>;
  administrativeRegionId?: string | null;
  administrativeRegion?: AdministrativeRegionDto | null;
}

export interface ReferenceCountryFilters {
  region?: string;
  q?: string;
  activeOnly?: boolean;
}

export type AcademicTaxonomyNodeType =
  | 'ACADEMIC_FIELD'
  | 'DISCIPLINE'
  | 'PROGRAM_AREA'
  | 'SPECIALIZATION_CATEGORY'
  | 'STANDARD_CLASSIFICATION';
export type AcademicTaxonomyStatus = 'DRAFT' | 'READY_TO_REVIEW' | 'ACTIVE' | 'ARCHIVED';
export type AcademicStandardType = 'ISCED' | 'CIP' | 'CUSTOM_NATIONAL';

export interface AcademicTaxonomyNodeDto {
  nodeId: string;
  nodeType: AcademicTaxonomyNodeType;
  canonicalCode: string;
  canonicalName: string;
  description?: string;
  status: AcademicTaxonomyStatus;
  standardType?: AcademicStandardType;
  standardCode?: string;
  localizedNames?: Record<string, string>;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicTaxonomyFilters {
  q?: string;
  nodeType?: AcademicTaxonomyNodeType;
  status?: AcademicTaxonomyStatus;
  standardType?: AcademicStandardType;
}

export interface AcademicTaxonomyAliasDto {
  aliasId: string;
  nodeId: string;
  locale?: string;
  alias: string;
  normalizedAlias: string;
  createdAt: string;
}

export interface AcademicStandardMappingDto {
  mappingId: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceStandard: AcademicStandardType;
  targetStandard: AcademicStandardType;
  strength: string;
  confidence?: number;
  notes?: string;
  createdAt: string;
}

export interface ScholarshipFilters {
  studyCountry?: string;
  degreeLevel?: string;
  fundingCoverage?: string;
  sponsorName?: string;
  applicationDeadlineFrom?: string;
  applicationDeadlineTo?: string;
  page?: number;
  pageSize?: number;
}

export interface UniversityFilters {
  country?: string;
  institutionType?: string;
  city?: string;
  page?: number;
  pageSize?: number;
}

export interface MajorFilters {
  degreeLevel?: string;
  academicFieldOrDiscipline?: string;
  collegeOrFaculty?: string;
  page?: number;
  pageSize?: number;
}

export interface CourseFilters {
  accessType?: string;
  originType?: string;
  platformName?: string;
  category?: string;
  learningLanguage?: string;
  page?: number;
  pageSize?: number;
}

export type NativeCourseStatus =
  'DRAFT' | 'READY_TO_REVIEW' | 'READY_TO_PUBLISH' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';
export interface NativeCourseDto {
  id: string;
  publicId: string;
  slug: string;
  displayName: string;
  canonicalName: string;
  originType: 'NATIVE_MANARATAK_COURSE';
  status: NativeCourseStatus;
  directCourseUrl: string;
  learningLanguage?: string;
  category?: string;
  difficultyLevel?: string;
  studyDuration?: string;
  certificateAvailable?: boolean;
  thumbnailAssetId?: string;
  optionalFields?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
export interface CreateNativeCourseInput {
  titleAr: string;
  titleEn?: string;
  learningLanguage?: string;
  category?: string;
  difficultyLevel?: string;
}
export interface UpdateNativeCourseInput {
  displayName?: string;
  learningLanguage?: string | null;
  category?: string | null;
  difficultyLevel?: string | null;
  studyDuration?: string | null;
  certificateAvailable?: boolean | null;
  thumbnailAssetId?: string | null;
  description?: string;
  courseContent?: string;
  titleEn?: string;
  instructor?: string;
  prerequisites?: string[];
  targetAudience?: string[];
  learningOutcomes?: string[];
  promotionalVideoAssetId?: string;
  completionCriteria?: Record<string, unknown>;
}
export interface CourseModuleDto {
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  position: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}
export interface CourseLessonDto {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  summary?: string | null;
  lessonType: string;
  position: number;
  estimatedDurationMinutes?: number | null;
  contentText?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}
export interface CourseLessonAssetDto {
  id: string;
  lessonId: string;
  assetId: string;
  assetReference?: string | null;
  title?: string | null;
  assetType: string;
  position: number;
  isRequired: boolean;
  metadata?: Record<string, unknown> | null;
}
export interface CourseQuizDto {
  id: string;
  courseId: string;
  moduleId?: string | null;
  lessonId?: string | null;
  title: string;
  instructions?: string | null;
  position: number;
  passingScore?: number | null;
  maxAttempts?: number | null;
  status: string;
}
export interface CourseQuestionBankDto {
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  status: string;
}
export interface CourseQuestionDto {
  id: string;
  courseId: string;
  quizId?: string | null;
  questionBankId?: string | null;
  questionType: string;
  prompt: string;
  choices?: unknown;
  correctAnswer?: unknown;
  explanation?: string | null;
  points: number;
  position: number;
  status: string;
}
export interface CourseCurriculumSnapshotDto {
  modules: CourseModuleDto[];
  lessons: CourseLessonDto[];
  assets: CourseLessonAssetDto[];
  quizzes: CourseQuizDto[];
  questionBanks: CourseQuestionBankDto[];
  questions: CourseQuestionDto[];
}
export interface NativeCourseReadinessDto {
  ready: boolean;
  percentage: number;
  checks: Array<{
    key: string;
    label: string;
    state: 'COMPLETE' | 'INCOMPLETE' | 'OPTIONAL';
    message?: string;
    targetSection?: string;
  }>;
}

export interface CmsFilters {
  contentType?: string;
  categorySlug?: string;
  q?: string;
  locale?: string;
  page?: number;
  pageSize?: number;
}

export interface StudentToolFilters {
  category?: string;
  visibilityStatus?: string;
}

export interface ServiceFilters {
  serviceCategory?: string;
  fulfillmentType?: string;
  serviceAvailabilityStatus?: string;
  deliveryMode?: string;
  page?: number;
  pageSize?: number;
}

export interface InternationalTestFilters {
  testCategory?: string;
  providerName?: string;
  page?: number;
  pageSize?: number;
}

export interface PublicSearchRequest {
  scope: string;
  query: string;
  page?: number;
  limit?: number;
}

export interface PublicSearchMatchDto {
  target: {
    entityNamespace: string;
    resourceKey: string;
  };
  score: number;
  payload?: Record<string, unknown>;
}

export interface PublicSearchResponseDto {
  requestId: string;
  reference: string;
  matches: PublicSearchMatchDto[];
  totalCount: number;
  executionTimeMs: number;
}

export interface PublicScholarshipDto {
  publicId: string;
  slug: string;
  displayName: string;
  canonicalName: string;
  fundingCoverage: string;
  coverageDetails: string;
  eligibleMajorsOrFields: string | string[];
  degreeLevel: string;

  requiredDocuments?: string;
  eligibilityCriteria?: string;
  studyLanguage?: string;
  applicationDeadline?: string | null;
  studyCountry?: string;
  applicationLink?: string;
  officialSourceUrl?: string;
  sponsorName?: string;
  targetUniversities?: string | string[];
  targetAcademicPrograms?: string | string[];
  fundingAmount?: string;
  currency?: string;
  duration?: string;
  localizedNames?: any;

  updatedAt: string;
}

export interface PublicUniversityDto {
  publicId: string;
  slug: string;
  displayName: string;
  canonicalName: string;
  officialWebsite: string;
  country: string;
  institutionType: string;

  sourceUrl?: string | null;
  officialSourceUrl?: string | null;
  city?: string | null;
  logoAssetId?: string | null;
  foundedYear?: number | null;

  localizedNames?: Record<string, string>;
  campuses?: Record<string, unknown>[];
  accreditations?: Record<string, unknown>[];
  rankings?: Record<string, unknown>[];
  description?: string;
  languagesOfInstruction?: string[];
  tuitionReferences?: Record<string, unknown>[];
  admissionRequirements?: Record<string, unknown>[];
  academicPrograms?: Record<string, unknown>[];
  contactEmail?: string;
  contactPhone?: string;
  socialLinks?: Record<string, string>;
  metadata?: Record<string, unknown>;

  updatedAt: string;
}

export interface PublicMajorDto {
  publicId: string;
  slug: string;
  displayName: string;
  canonicalName: string;
  degreeLevel: string;
  sourceClassificationSystem: string;

  academicFieldOrDiscipline?: string | null;
  collegeOrFaculty?: string | null;
  classificationCode?: string | null;
  sourceUrl?: string | null;
  officialSourceUrl?: string | null;

  localizedNames?: Record<string, string>;
  aliases?: string | string[];
  synonyms?: string | string[];
  equivalencyMappings?: Record<string, unknown>[];
  degreeLevelMappings?: Record<string, unknown>[];
  relatedMajors?: string | string[];
  description?: string;
  studentFriendlySummary?: string;
  acquiredSkills?: string[];
  careerOutcomes?: string[];
  typicalCourses?: string[];
  contentSections?: Array<{
    sectionKey?: string;
    title?: string;
    content?: string;
    reviewStatus?: string;
    metadata?: Record<string, unknown>;
  }>;
  phaseLinks?: Array<{
    targetType: 'ACADEMIC_PROGRAM' | 'SCHOLARSHIP' | 'COURSE' | 'CAREER' | 'JOB' | 'TAXONOMY_NODE';
    label: string;
    href: string;
    query: Record<string, string>;
    phase: number;
    relationship: string;
    source: 'MAJOR_IDENTITY' | 'MAJOR_LEVEL_PROFILE' | 'TEXT_MATCH' | 'TAXONOMY_MAPPING';
    metadata?: Record<string, unknown>;
  }>;
  relationships?: Array<{
    targetMajorId?: string;
    relationshipType?: string;
    notes?: string;
    metadata?: Record<string, unknown>;
  }>;
  metadata?: Record<string, unknown>;

  updatedAt: string;
}

export interface PublicCourseDto {
  publicId: string;
  slug: string;
  displayName: string;
  canonicalName: string;
  accessType: string;
  originType: string;
  directCourseUrl: string;

  platformName?: string | null;
  providerName?: string | null;
  learningLanguage?: string | null;
  studyDuration?: string | null;
  certificateAvailable?: boolean | null;
  category?: string | null;
  difficultyLevel?: string | null;
  sourceUrl?: string | null;
  officialSourceUrl?: string | null;
  thumbnailAssetId?: string | null;

  courseContent?: string;
  relatedMajorsOrFields?: string | string[];
  acquiredSkills?: string[];
  localizedNames?: Record<string, string>;
  metadata?: Record<string, unknown>;

  updatedAt: string;
}

export interface CertificateVerificationDto {
  publicId: string;
  serialNumber: string;
  verificationCode: string;
  status: string;
  studentReferenceId: string;
  recipientDisplayName?: string | null;
  courseId: string;
  courseDisplayName: string;
  courseCompletedAt: string;
  issuedAt: string;
  revokedAt?: string | null;
  revocationReason?: string | null;
  isValid: boolean;
}

export interface StudentWorkspaceDto {
  id: string;
  studentReferenceId: string;
  displayName?: string | null;
  preferredLanguage?: string | null;
  avatarAssetId?: string | null;
  status: string;
  layoutPreferences?: Record<string, unknown> | null;
  notificationMatrix?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentSavedItemDto {
  id: string;
  studentReferenceId: string;
  entityType: string;
  entityId: string;
  entitySlug?: string | null;
  displayName?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  savedAt: string;
  updatedAt: string;
}

export interface StudentDashboardSummaryDto {
  workspace: StudentWorkspaceDto;
  savedItems: StudentSavedItemDto[];
  certificateCount: number;
  activeCourseEnrollmentCount: number;
  completedCourseEnrollmentCount: number;
}

export interface MoneyAmountDto {
  amountMinorUnits: string;
  currencyCode: string;
  scale: number;
}

export interface StudentFinanceInvoiceDto {
  id: string;
  publicId: string;
  invoiceNumber: string;
  originDomain: string;
  originReferenceId: string;
  studentReferenceId?: string | null;
  payerReferenceId?: string | null;
  status: string;
  totalAmount: MoneyAmountDto;
  amountDue: MoneyAmountDto;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: MoneyAmountDto;
    totalPrice: MoneyAmountDto;
  }>;
  dueDate?: string | null;
  issuedAt?: string | null;
  paidAt?: string | null;
  updatedAt: string;
}

export interface StudentFinancePaymentDto {
  id: string;
  publicId: string;
  invoiceId: string;
  amount: MoneyAmountDto;
  status: string;
  paymentMethod: string;
  gatewayProvider?: string | null;
  gatewayReference?: string | null;
  capturedAt?: string | null;
  createdAt: string;
}

export interface CmsLocalizedPayloadDto {
  id: string;
  contentId: string;
  locale: string;
  title: string;
  summary?: string | null;
  body: string;
  readingTimeMinutes?: number | null;
  seoMetadata?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicCmsContentDto {
  publicId: string;
  slug: string;
  contentType: string;
  title: string;
  summary?: string | null;
  categorySlug?: string | null;
  featuredAssetId?: string | null;
  publishedAt?: string | null;
  localizedPayload?: CmsLocalizedPayloadDto | null;
  seoMetadata?: Record<string, unknown> | null;
}

export interface PublicStudentToolDto {
  toolKey: string;
  displayName: string;
  description?: string | null;
  category: string;
  executionType: string;
  visibilityStatus: string;
  aiDependencyLevel: string;
  anonymousEnabled: boolean;
  authenticatedEnabled: boolean;
  launchOrder: number;
}

export interface StudentToolExecutionResponseDto {
  toolKey: string;
  executionPublicId: string;
  status: string;
  output?: string;
  blockedReason?: string;
}

export interface PublicServiceCatalogItemDto {
  publicId: string;
  slug: string;
  displayName: string;
  serviceCategory: string;
  fulfillmentType: string;
  serviceDescription: string;
  serviceAvailabilityStatus: string;
  requiredInputsOrDocuments: string[];
  deliveryMode: string;
  responsibleServiceOwnerType: string;
  providerName?: string | null;
  estimatedDeliveryTime?: string | null;
  appointmentRequired?: boolean | null;
  supportedCountries?: string[] | null;
  supportedLanguages?: string[] | null;
  servicePrerequisites?: string[] | null;
  deliveryArtifactTypes?: string[] | null;
  pricingReferenceId?: string | null;
  thumbnailAssetId?: string | null;
  publicDisplayMetadata?: Record<string, unknown> | null;
}

export interface PublicInternationalTestVariantDto {
  id: string;
  variantName: string;
  deliveryMode: string;
  isActive: boolean;
  specificOfficialUrl?: string;
  administrativeNotes?: string;
}

export interface PublicInternationalTestSectionDto {
  id: string;
  sectionName: string;
  sectionType: string;
  durationMinutes?: number;
  order: number;
  questionTypes?: string[];
  scoreMinimum?: number;
  scoreMaximum?: number;
}

export interface PublicInternationalTestScoreScaleDto {
  id: string;
  overallMinimum: number;
  overallMaximum: number;
  scoreIncrement?: number;
  bandsOrLevels?: string[];
  passFailRules?: string;
  cefrEquivalency?: string;
  crossTestEquivalency?: string;
  resultValidityDurationMonths?: number;
  resultDeliveryTimeDays?: number;
  scoreReportingUrl?: string;
}

export interface PublicInternationalTestFeeMetadataDto {
  id: string;
  feeType: string;
  amount: number;
  currencyCode: string;
  hasRegionalVariation: boolean;
  validityWindowNotes?: string;
}

export interface PublicInternationalTestOfficialLinkDto {
  id: string;
  linkType: string;
  url: string;
  description?: string;
}

export interface PublicInternationalTestAvailabilityDto {
  id: string;
  availableCountryIds: string[];
  availableCityIds?: string[];
  onlineAvailabilityRegions?: string[];
  testingWindowsNotes?: string;
}

export interface PublicInternationalTestPreparationMaterialDto {
  id: string;
  materialType: string;
  url?: string;
  assetId?: string;
  title: string;
  description?: string;
}

export interface PublicInternationalTestDto {
  id: string;
  publicId?: string;
  slug: string;
  canonicalName: string;
  displayName: string;
  localizedNameAr?: string;
  localizedNameEn?: string;
  abbreviation?: string;
  testCode?: string;
  testCategory: string;
  providerName: string;

  status: string;
  isPubliclyVisible?: boolean;
  completenessStatus?: string;

  variants?: PublicInternationalTestVariantDto[];
  scoreScale?: PublicInternationalTestScoreScaleDto;
  sections?: PublicInternationalTestSectionDto[];
  fees?: PublicInternationalTestFeeMetadataDto[];

  registrationRequirements?: string;
  identificationRequirements?: string;
  retakePolicy?: string;
  cancellationReschedulingNotes?: string;
  accessibilityNotes?: string;

  availability?: PublicInternationalTestAvailabilityDto;
  officialLinks?: PublicInternationalTestOfficialLinkDto[];
  preparationMaterials?: PublicInternationalTestPreparationMaterialDto[];

  [key: string]: unknown;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const csrfManager = CsrfClientManager.getInstance(API_BASE_URL);

export async function apiFetch(
  input: string | URL | Request,
  init?: RequestInit,
): Promise<Response> {
  return csrfManager.fetchWithCsrf(input, init);
}

function getAdminHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const token = localStorage.getItem('manaratak_access_token');
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

async function adminCourseRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(`${API_BASE_URL}/admin/courses${path}`, {
    ...init,
    headers: getAdminHeaders({
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers as Record<string, string> | undefined),
    }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      (typeof body.error === 'string' ? body.error : body.error?.message) ||
        `Course request failed (${response.status})`,
    );
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

async function parseErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const errorData = await res.json();
    if (typeof errorData === 'string') return errorData;
    if (errorData?.error) {
      if (typeof errorData.error === 'string') return errorData.error;
      if (typeof errorData.error.message === 'string') return errorData.error.message;
      if (typeof errorData.error.code === 'string') return errorData.error.code;
    }
    if (typeof errorData?.message === 'string') return errorData.message;
  } catch {
    // Ignore parse errors
  }
  return fallback;
}

export class ApiClient {
  static async getReferenceCountries(
    filters: ReferenceCountryFilters = {},
  ): Promise<ReferenceCountryDto[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const res = await apiFetch(`${API_BASE_URL}/reference-data/countries?${params.toString()}`);
    if (!res.ok) {
      const msg = await parseErrorMessage(res, 'Failed to fetch countries');
      throw new Error(msg);
    }
    const payload = await res.json();
    return payload.data || [];
  }

  static async getReferenceCountry(iso2Code: string): Promise<ReferenceCountryDto> {
    const res = await apiFetch(
      `${API_BASE_URL}/reference-data/countries/${encodeURIComponent(iso2Code)}`,
    );
    if (!res.ok) {
      if (res.status === 404) throw new Error('Country not found');
      const msg = await parseErrorMessage(res, 'Failed to fetch country');
      throw new Error(msg);
    }
    return res.json();
  }

  static async getAdminReferenceCountries(
    filters: ReferenceCountryFilters = {},
  ): Promise<ReferenceCountryDto[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') params.append(key, String(value));
    });
    const res = await apiFetch(
      `${API_BASE_URL}/admin/reference-data/countries?${params.toString()}`,
      {
        headers: getAdminHeaders(),
      },
    );
    if (!res.ok) {
      const msg = await parseErrorMessage(res, 'Failed to fetch admin countries');
      throw new Error(msg);
    }
    const payload = await res.json();
    return payload.data || [];
  }

  static async getAdminReferenceCountry(iso2Code: string): Promise<ReferenceCountryDto> {
    const res = await apiFetch(
      `${API_BASE_URL}/admin/reference-data/countries/${encodeURIComponent(iso2Code)}`,
      {
        headers: getAdminHeaders(),
      },
    );
    if (!res.ok) {
      if (res.status === 404) throw new Error('Country not found');
      const msg = await parseErrorMessage(res, 'Failed to fetch admin country');
      throw new Error(msg);
    }
    return res.json();
  }

  static async listReferenceCities(
    filters: { countryIso2Code?: string; q?: string; region?: string } = {},
  ): Promise<ReferenceCityDto[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') params.append(key, String(value));
    });
    const res = await apiFetch(`${API_BASE_URL}/reference-data/cities?${params.toString()}`);
    if (!res.ok) {
      const msg = await parseErrorMessage(res, 'Failed to fetch cities');
      throw new Error(msg);
    }
    const payload = await res.json();
    return payload.data || [];
  }

  static async getAdminAcademicTaxonomyNodes(
    filters: AcademicTaxonomyFilters = {},
  ): Promise<AcademicTaxonomyNodeDto[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const res = await apiFetch(
      `${API_BASE_URL}/admin/academic-taxonomy/nodes?${params.toString()}`,
      {
        headers: getAdminHeaders(),
      },
    );
    if (!res.ok) {
      const msg = await parseErrorMessage(res, 'Failed to fetch academic taxonomy nodes');
      throw new Error(msg);
    }
    const payload = await res.json();
    return payload.data || [];
  }

  static async getAdminAcademicTaxonomyNode(nodeId: string): Promise<AcademicTaxonomyNodeDto> {
    const res = await apiFetch(
      `${API_BASE_URL}/admin/academic-taxonomy/nodes/${encodeURIComponent(nodeId)}`,
      {
        headers: getAdminHeaders(),
      },
    );
    if (!res.ok) {
      const msg = await parseErrorMessage(res, 'Academic taxonomy node not found');
      throw new Error(msg);
    }
    return res.json();
  }

  static async getAdminAcademicTaxonomyChildren(
    nodeId: string,
  ): Promise<AcademicTaxonomyNodeDto[]> {
    const res = await apiFetch(
      `${API_BASE_URL}/admin/academic-taxonomy/nodes/${encodeURIComponent(nodeId)}/children`,
      {
        headers: getAdminHeaders(),
      },
    );
    if (!res.ok) {
      const msg = await parseErrorMessage(res, 'Failed to fetch taxonomy children');
      throw new Error(msg);
    }
    const payload = await res.json();
    return payload.data || [];
  }

  static async getAdminAcademicTaxonomyParents(nodeId: string): Promise<AcademicTaxonomyNodeDto[]> {
    const res = await apiFetch(
      `${API_BASE_URL}/admin/academic-taxonomy/nodes/${encodeURIComponent(nodeId)}/parents`,
      {
        headers: getAdminHeaders(),
      },
    );
    if (!res.ok) {
      const msg = await parseErrorMessage(res, 'Failed to fetch taxonomy parents');
      throw new Error(msg);
    }
    const payload = await res.json();
    return payload.data || [];
  }

  static async getAdminAcademicTaxonomyAliases(
    nodeId: string,
  ): Promise<AcademicTaxonomyAliasDto[]> {
    const res = await apiFetch(
      `${API_BASE_URL}/admin/academic-taxonomy/nodes/${encodeURIComponent(nodeId)}/aliases`,
      {
        headers: getAdminHeaders(),
      },
    );
    if (!res.ok) {
      const msg = await parseErrorMessage(res, 'Failed to fetch taxonomy aliases');
      throw new Error(msg);
    }
    const payload = await res.json();
    return payload.data || [];
  }

  static async getAdminAcademicTaxonomyMappings(
    nodeId: string,
  ): Promise<AcademicStandardMappingDto[]> {
    const res = await apiFetch(
      `${API_BASE_URL}/admin/academic-taxonomy/nodes/${encodeURIComponent(nodeId)}/mappings`,
      {
        headers: getAdminHeaders(),
      },
    );
    if (!res.ok) {
      const msg = await parseErrorMessage(res, 'Failed to fetch taxonomy mappings');
      throw new Error(msg);
    }
    const payload = await res.json();
    return payload.data || [];
  }

  static async search(request: PublicSearchRequest): Promise<PublicSearchResponseDto> {
    const res = await apiFetch(`${API_BASE_URL}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scope: request.scope,
        criteria: {
          query: request.query,
          filters: [],
          logicalOperator: 'AND',
        },
        pagination: {
          page: request.page ?? 1,
          limit: request.limit ?? 10,
        },
      }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to execute search',
      );
    }
    return res.json();
  }

  static async getScholarships(
    filters: ScholarshipFilters,
  ): Promise<PaginatedResult<PublicScholarshipDto>> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const res = await apiFetch(`${API_BASE_URL}/public/scholarships?${params.toString()}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch scholarships',
      );
    }
    return res.json();
  }

  static async getScholarshipBySlug(slug: string): Promise<PublicScholarshipDto> {
    const res = await apiFetch(`${API_BASE_URL}/public/scholarships/${slug}`);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Scholarship not found');
      }
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch scholarship',
      );
    }
    return res.json();
  }

  static async getUniversities(
    filters: UniversityFilters,
  ): Promise<PaginatedResult<PublicUniversityDto>> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const res = await apiFetch(`${API_BASE_URL}/public/universities?${params.toString()}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch universities',
      );
    }
    return res.json();
  }

  static async getUniversityBySlug(slug: string): Promise<PublicUniversityDto> {
    const res = await apiFetch(`${API_BASE_URL}/public/universities/${slug}`);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('University not found');
      }
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch university',
      );
    }
    return res.json();
  }

  static async getMajors(filters: MajorFilters): Promise<PaginatedResult<PublicMajorDto>> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const res = await apiFetch(`${API_BASE_URL}/public/majors?${params.toString()}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch majors',
      );
    }
    return res.json();
  }

  static async getMajorBySlug(slug: string): Promise<PublicMajorDto> {
    const res = await apiFetch(`${API_BASE_URL}/public/majors/${slug}`);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Major not found');
      }
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch major',
      );
    }
    return res.json();
  }

  static async getCourses(filters: CourseFilters): Promise<PaginatedResult<PublicCourseDto>> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const res = await apiFetch(`${API_BASE_URL}/public/courses?${params.toString()}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch courses',
      );
    }
    return res.json();
  }

  static async getCourseBySlug(slug: string): Promise<PublicCourseDto> {
    const res = await apiFetch(`${API_BASE_URL}/public/courses/${slug}`);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Course not found');
      }
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch course',
      );
    }
    return res.json();
  }

  static async verifyCertificate(verificationCode: string): Promise<CertificateVerificationDto> {
    const encodedCode = encodeURIComponent(verificationCode.trim());
    const res = await apiFetch(`${API_BASE_URL}/public/certificates/verify/${encodedCode}`);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Certificate not found');
      }
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to verify certificate',
      );
    }
    return res.json();
  }

  static async getStudentDashboard(
    studentReferenceId: string,
  ): Promise<StudentDashboardSummaryDto> {
    const res = await apiFetch(
      `${API_BASE_URL}/student/${encodeURIComponent(studentReferenceId)}/dashboard`,
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch student dashboard',
      );
    }
    return res.json();
  }

  static async getStudentInvoices(
    studentReferenceId: string,
  ): Promise<PaginatedResult<StudentFinanceInvoiceDto>> {
    const res = await apiFetch(
      `${API_BASE_URL}/student/${encodeURIComponent(studentReferenceId)}/finance/invoices`,
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch student invoices',
      );
    }
    return res.json();
  }

  static async getStudentInvoicePayments(
    studentReferenceId: string,
    invoiceId: string,
  ): Promise<StudentFinancePaymentDto[]> {
    const res = await apiFetch(
      `${API_BASE_URL}/student/${encodeURIComponent(studentReferenceId)}/finance/invoices/${encodeURIComponent(invoiceId)}/payments`,
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch student invoice payments',
      );
    }
    const payload = await res.json();
    return payload.data;
  }

  static async getCmsContent(filters: CmsFilters): Promise<PaginatedResult<PublicCmsContentDto>> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const res = await apiFetch(`${API_BASE_URL}/public/cms/content?${params.toString()}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch CMS content',
      );
    }
    return res.json();
  }

  static async getCmsContentBySlug(slug: string, locale = 'en'): Promise<PublicCmsContentDto> {
    const res = await apiFetch(
      `${API_BASE_URL}/public/cms/content/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`,
    );
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('CMS content not found');
      }
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch CMS content',
      );
    }
    return res.json();
  }

  static async getStudentTools(filters: StudentToolFilters = {}): Promise<PublicStudentToolDto[]> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const res = await apiFetch(`${API_BASE_URL}/public/student-tools?${params.toString()}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch student tools',
      );
    }

    const payload = await res.json();
    return payload.data;
  }

  static async executeStudentTool(
    toolKey: string,
    input: string,
  ): Promise<StudentToolExecutionResponseDto> {
    const res = await apiFetch(
      `${API_BASE_URL}/public/student-tools/${encodeURIComponent(toolKey)}/execute`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      },
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to execute student tool',
      );
    }
    return res.json();
  }

  static async getServices(
    filters: ServiceFilters,
  ): Promise<PaginatedResult<PublicServiceCatalogItemDto>> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const res = await apiFetch(`${API_BASE_URL}/public/services?${params.toString()}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch services',
      );
    }
    return res.json();
  }

  static async getServiceBySlug(slug: string): Promise<PublicServiceCatalogItemDto> {
    const res = await apiFetch(`${API_BASE_URL}/public/services/${encodeURIComponent(slug)}`);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Service not found');
      }
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch service',
      );
    }
    return res.json();
  }

  static async getInternationalTests(
    filters: InternationalTestFilters,
  ): Promise<PaginatedResult<PublicInternationalTestDto>> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const res = await apiFetch(`${API_BASE_URL}/public/international-tests?${params.toString()}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch international tests',
      );
    }
    return res.json();
  }

  static async getInternationalTestBySlug(slug: string): Promise<PublicInternationalTestDto> {
    const res = await apiFetch(
      `${API_BASE_URL}/public/international-tests/${encodeURIComponent(slug)}`,
    );
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('International test not found');
      }
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch international test',
      );
    }
    return res.json();
  }

  static async getStudentWorkspace(studentReferenceId: string): Promise<StudentWorkspaceDto> {
    const res = await apiFetch(
      `${API_BASE_URL}/student/${encodeURIComponent(studentReferenceId)}/workspace`,
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch student workspace',
      );
    }
    return res.json();
  }

  static async saveStudentItem(
    studentReferenceId: string,
    item: {
      entityType: string;
      entityId: string;
      entitySlug?: string | null;
      displayName?: string | null;
      notes?: string | null;
    },
  ): Promise<StudentSavedItemDto> {
    const res = await apiFetch(
      `${API_BASE_URL}/student/${encodeURIComponent(studentReferenceId)}/saved-items`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      },
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to save item',
      );
    }
    return res.json();
  }

  static async getAdminUniversities(
    filters: any,
    signal?: AbortSignal,
  ): Promise<PaginatedResult<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value as string);
      }
    });
    const res = await apiFetch(`${API_BASE_URL}/admin/universities?${params.toString()}`, {
      headers: getAdminHeaders(),
      signal,
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch admin universities',
      );
    }
    return res.json();
  }

  static async getAdminUniversityById(id: string): Promise<any> {
    const res = await apiFetch(`${API_BASE_URL}/admin/universities/${encodeURIComponent(id)}`, {
      headers: getAdminHeaders(),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch university',
      );
    }
    return res.json();
  }

  static async executeAdminUniversityAction(id: string, action: string): Promise<void> {
    const res = await apiFetch(
      `${API_BASE_URL}/admin/universities/${encodeURIComponent(id)}/${action}`,
      {
        method: 'POST',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      },
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          `Failed to execute ${action}`,
      );
    }
  }

  static async getAdminMajors(filters: any, signal?: AbortSignal): Promise<PaginatedResult<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value as string);
      }
    });
    const res = await apiFetch(`${API_BASE_URL}/admin/majors?${params.toString()}`, {
      headers: getAdminHeaders(),
      signal,
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch admin majors',
      );
    }
    return res.json();
  }

  static async getAdminMajorById(id: string): Promise<any> {
    const res = await apiFetch(`${API_BASE_URL}/admin/majors/${encodeURIComponent(id)}`, {
      headers: getAdminHeaders(),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch major',
      );
    }
    return res.json();
  }

  static async getAdminMajorCollegeFacets(
    degreeLevel?: string,
  ): Promise<{ data: Array<{ name: string; supportedDegrees: string[]; majorCount: number }> }> {
    const params = new URLSearchParams();
    if (degreeLevel) params.set('degreeLevel', degreeLevel);
    const res = await apiFetch(
      `${API_BASE_URL}/admin/majors/facets/colleges?${params.toString()}`,
      { headers: getAdminHeaders() },
    );
    if (!res.ok) throw new Error('Failed to fetch documented college contexts');
    return res.json();
  }

  static async getAdminMajorProfiles(id: string): Promise<{ data: any[] }> {
    const res = await apiFetch(`${API_BASE_URL}/admin/majors/${encodeURIComponent(id)}/profiles`, {
      headers: getAdminHeaders(),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch major profiles',
      );
    }
    return res.json();
  }

  static async getAdminMajorContentSections(id: string): Promise<{ data: any[] }> {
    const res = await apiFetch(
      `${API_BASE_URL}/admin/majors/${encodeURIComponent(id)}/content-sections`,
      {
        headers: getAdminHeaders(),
      },
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch major content sections',
      );
    }
    return res.json();
  }

  static async getAdminMajorAliases(id: string): Promise<{ data: any[] }> {
    const res = await apiFetch(`${API_BASE_URL}/admin/majors/${encodeURIComponent(id)}/aliases`, {
      headers: getAdminHeaders(),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch major aliases',
      );
    }
    return res.json();
  }

  static async getAdminMajorRelationships(id: string): Promise<{ data: any[] }> {
    const res = await apiFetch(
      `${API_BASE_URL}/admin/majors/${encodeURIComponent(id)}/relationships`,
      {
        headers: getAdminHeaders(),
      },
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch major relationships',
      );
    }
    return res.json();
  }

  static async getAdminMajorClassificationMappings(id: string): Promise<{ data: any[] }> {
    const res = await apiFetch(
      `${API_BASE_URL}/admin/majors/${encodeURIComponent(id)}/classification-mappings`,
      {
        headers: getAdminHeaders(),
      },
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch major classification mappings',
      );
    }
    return res.json();
  }

  static async getAdminMajorVersions(id: string): Promise<{ data: any[] }> {
    const res = await apiFetch(`${API_BASE_URL}/admin/majors/${encodeURIComponent(id)}/versions`, {
      headers: getAdminHeaders(),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch major versions',
      );
    }
    return res.json();
  }

  static async getAdminMajorSources(id: string): Promise<{ data: any[] }> {
    const res = await apiFetch(`${API_BASE_URL}/admin/majors/${encodeURIComponent(id)}/sources`, {
      headers: getAdminHeaders(),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch major sources',
      );
    }
    return res.json();
  }

  static async importMajorCatalogFromWorkspace(catalogKind: string): Promise<any> {
    const res = await apiFetch(
      `${API_BASE_URL}/admin/imports/major-catalogs/workspace/${encodeURIComponent(catalogKind)}`,
      {
        method: 'POST',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      },
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to import major catalog',
      );
    }
    return res.json();
  }

  static async previewMajorCatalogFromWorkspace(catalogKind: string): Promise<any> {
    const res = await apiFetch(
      `${API_BASE_URL}/admin/imports/major-catalogs/workspace/${encodeURIComponent(catalogKind)}/preview`,
      {
        headers: getAdminHeaders(),
      },
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to preview major catalog',
      );
    }
    return res.json();
  }

  static async previewMajorCatalogText(payload: {
    catalogKind: string;
    dataText: string;
    sourceFileName?: string;
    sourceSystem?: string;
  }): Promise<any> {
    const res = await apiFetch(`${API_BASE_URL}/admin/imports/major-catalogs/preview`, {
      method: 'POST',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to preview major catalog',
      );
    }
    return res.json();
  }

  static async importMajorCatalogFiles(payload: {
    catalogKind: string;
    sourceSystem?: string;
    files: Array<{ dataText: string; sourceFileName?: string; sourceSystem?: string }>;
  }): Promise<any> {
    const res = await apiFetch(`${API_BASE_URL}/admin/imports/major-catalogs/bulk`, {
      method: 'POST',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to import major catalog files',
      );
    }
    return res.json();
  }

  static async previewMajorCatalogFiles(payload: {
    catalogKind: string;
    sourceSystem?: string;
    files: Array<{ dataText: string; sourceFileName?: string; sourceSystem?: string }>;
  }): Promise<any> {
    const res = await apiFetch(`${API_BASE_URL}/admin/imports/major-catalogs/bulk/preview`, {
      method: 'POST',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to preview major catalog files',
      );
    }
    return res.json();
  }

  static async importMajorDetailDossierFromWorkspace(catalogKind: string): Promise<any> {
    const res = await apiFetch(
      `${API_BASE_URL}/admin/imports/major-detail-dossiers/workspace/${encodeURIComponent(catalogKind)}`,
      {
        method: 'POST',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      },
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to import major detail dossier',
      );
    }
    return res.json();
  }

  static async previewMajorDetailDossierFromWorkspace(catalogKind: string): Promise<any> {
    const res = await apiFetch(
      `${API_BASE_URL}/admin/imports/major-detail-dossiers/workspace/${encodeURIComponent(catalogKind)}/preview`,
      {
        headers: getAdminHeaders(),
      },
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to preview major detail dossier',
      );
    }
    return res.json();
  }

  static async previewMajorDetailDossierText(payload: {
    catalogKind: string;
    dataText: string;
    sourceFileName?: string;
    sourceSystem?: string;
  }): Promise<any> {
    const res = await apiFetch(`${API_BASE_URL}/admin/imports/major-detail-dossiers/preview`, {
      method: 'POST',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to preview major detail dossier',
      );
    }
    return res.json();
  }

  static async importMajorDetailDossierFiles(payload: {
    catalogKind: string;
    sourceSystem?: string;
    files: Array<{ dataText: string; sourceFileName?: string; sourceSystem?: string }>;
  }): Promise<any> {
    const res = await apiFetch(`${API_BASE_URL}/admin/imports/major-detail-dossiers/bulk`, {
      method: 'POST',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to import major detail dossier files',
      );
    }
    return res.json();
  }

  static async previewMajorDetailDossierFiles(payload: {
    catalogKind: string;
    sourceSystem?: string;
    files: Array<{ dataText: string; sourceFileName?: string; sourceSystem?: string }>;
  }): Promise<any> {
    const res = await apiFetch(`${API_BASE_URL}/admin/imports/major-detail-dossiers/bulk/preview`, {
      method: 'POST',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to preview major detail dossier files',
      );
    }
    return res.json();
  }

  static async executeAdminMajorAction(id: string, action: string): Promise<void> {
    const res = await apiFetch(`${API_BASE_URL}/admin/majors/${encodeURIComponent(id)}/${action}`, {
      method: 'POST',
      headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          `Failed to execute ${action}`,
      );
    }
  }

  static async getAdminInternationalTests(filters: any): Promise<PaginatedResult<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value as string);
      }
    });
    const res = await apiFetch(`${API_BASE_URL}/admin/international-tests?${params.toString()}`, {
      headers: getAdminHeaders(),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch admin international tests',
      );
    }
    return res.json();
  }

  static async getAdminInternationalTestById(id: string): Promise<any> {
    const res = await apiFetch(
      `${API_BASE_URL}/admin/international-tests/${encodeURIComponent(id)}`,
      {
        headers: getAdminHeaders(),
      },
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch international test',
      );
    }
    return res.json();
  }

  static async getAdminInternationalTestVersions(id: string): Promise<unknown[]> {
    const res = await apiFetch(
      `${API_BASE_URL}/admin/international-tests/${encodeURIComponent(id)}/import-versions`,
      {
        headers: getAdminHeaders(),
      },
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch international test versions',
      );
    }
    const data: unknown = await res.json();
    return Array.isArray(data) ? data : [];
  }

  static async executeAdminInternationalTestAction(id: string, action: string): Promise<void> {
    const res = await apiFetch(
      `${API_BASE_URL}/admin/international-tests/${encodeURIComponent(id)}/${action}`,
      {
        method: 'POST',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
      },
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          `Failed to execute ${action}`,
      );
    }
  }

  static async getAdminNativeCourses(
    filters: Partial<CourseFilters> & { status?: NativeCourseStatus } = {},
  ): Promise<PaginatedResult<NativeCourseDto>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value as string);
      }
    });
    params.set('originType', 'NATIVE_MANARATAK_COURSE');
    return adminCourseRequest<PaginatedResult<NativeCourseDto>>(`?${params.toString()}`);
  }

  static getAdminNativeCourseById(id: string): Promise<NativeCourseDto> {
    return adminCourseRequest<NativeCourseDto>(`/${encodeURIComponent(id)}`);
  }

  static createAdminNativeCourse(input: CreateNativeCourseInput): Promise<NativeCourseDto> {
    return adminCourseRequest<NativeCourseDto>('', { method: 'POST', body: JSON.stringify(input) });
  }

  static updateAdminNativeCourse(
    id: string,
    input: UpdateNativeCourseInput,
  ): Promise<NativeCourseDto> {
    return adminCourseRequest<NativeCourseDto>(`/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  static getAdminNativeCourseCurriculum(id: string): Promise<CourseCurriculumSnapshotDto> {
    return adminCourseRequest<CourseCurriculumSnapshotDto>(`/${encodeURIComponent(id)}/curriculum`);
  }

  static getNativeCourseReadiness(id: string): Promise<NativeCourseReadinessDto> {
    return adminCourseRequest<NativeCourseReadinessDto>(`/${encodeURIComponent(id)}/readiness`);
  }

  static createCourseModule(
    courseId: string,
    input: { title: string; description?: string; position: number },
  ): Promise<CourseModuleDto> {
    return adminCourseRequest<CourseModuleDto>(`/${encodeURIComponent(courseId)}/modules`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  static updateCourseModule(
    courseId: string,
    moduleId: string,
    input: Partial<{ title: string; description: string | null; position: number; status: string }>,
  ): Promise<CourseModuleDto> {
    return adminCourseRequest<CourseModuleDto>(
      `/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}`,
      { method: 'PATCH', body: JSON.stringify(input) },
    );
  }

  static deleteCourseModule(courseId: string, moduleId: string): Promise<void> {
    return adminCourseRequest<void>(
      `/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}`,
      { method: 'DELETE' },
    );
  }

  static reorderCourseModules(
    courseId: string,
    positions: Array<{ id: string; position: number }>,
  ): Promise<void> {
    return adminCourseRequest<void>(`/${encodeURIComponent(courseId)}/modules/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ positions }),
    });
  }

  static createCourseLesson(
    courseId: string,
    moduleId: string,
    input: {
      title: string;
      summary?: string;
      lessonType: string;
      position: number;
      estimatedDurationMinutes?: number;
      contentText?: string;
    },
  ): Promise<CourseLessonDto> {
    return adminCourseRequest<CourseLessonDto>(
      `/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}/lessons`,
      { method: 'POST', body: JSON.stringify(input) },
    );
  }

  static updateCourseLesson(
    courseId: string,
    lessonId: string,
    input: Partial<{
      title: string;
      summary: string | null;
      lessonType: string;
      position: number;
      estimatedDurationMinutes: number | null;
      contentText: string | null;
      status: string;
    }>,
  ): Promise<CourseLessonDto> {
    return adminCourseRequest<CourseLessonDto>(
      `/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}`,
      { method: 'PATCH', body: JSON.stringify(input) },
    );
  }

  static deleteCourseLesson(courseId: string, lessonId: string): Promise<void> {
    return adminCourseRequest<void>(
      `/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}`,
      { method: 'DELETE' },
    );
  }

  static reorderCourseLessons(
    courseId: string,
    moduleId: string,
    positions: Array<{ id: string; position: number }>,
  ): Promise<void> {
    return adminCourseRequest<void>(
      `/${encodeURIComponent(courseId)}/modules/${encodeURIComponent(moduleId)}/lessons/reorder`,
      { method: 'PUT', body: JSON.stringify({ positions }) },
    );
  }

  static attachCourseLessonAsset(
    courseId: string,
    lessonId: string,
    input: {
      assetId: string;
      assetReference?: string;
      title?: string;
      assetType: string;
      position: number;
      isRequired?: boolean;
    },
  ): Promise<CourseLessonAssetDto> {
    return adminCourseRequest<CourseLessonAssetDto>(
      `/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}/assets`,
      { method: 'POST', body: JSON.stringify(input) },
    );
  }

  static detachCourseLessonAsset(
    courseId: string,
    lessonId: string,
    assetId: string,
  ): Promise<void> {
    return adminCourseRequest<void>(
      `/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}/assets/${encodeURIComponent(assetId)}`,
      { method: 'DELETE' },
    );
  }

  static createCourseQuiz(
    courseId: string,
    input: {
      title: string;
      moduleId?: string;
      lessonId?: string;
      position: number;
      passingScore?: number;
      maxAttempts?: number;
    },
  ): Promise<CourseQuizDto> {
    return adminCourseRequest<CourseQuizDto>(`/${encodeURIComponent(courseId)}/quizzes`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  static createCourseQuestionBank(
    courseId: string,
    input: { title: string; description?: string },
  ): Promise<CourseQuestionBankDto> {
    return adminCourseRequest<CourseQuestionBankDto>(
      `/${encodeURIComponent(courseId)}/question-banks`,
      { method: 'POST', body: JSON.stringify(input) },
    );
  }

  static createCourseQuestion(
    courseId: string,
    input: {
      quizId?: string;
      questionBankId?: string;
      questionType: string;
      prompt: string;
      choices?: unknown;
      correctAnswer?: unknown;
      explanation?: string;
      points?: number;
      position: number;
    },
  ): Promise<CourseQuestionDto> {
    return adminCourseRequest<CourseQuestionDto>(`/${encodeURIComponent(courseId)}/questions`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  static executeAdminNativeCourseAction(
    id: string,
    action: 'mark-ready' | 'mark-publishable' | 'publish' | 'unpublish' | 'archive',
  ): Promise<void> {
    return adminCourseRequest<void>(`/${encodeURIComponent(id)}/${action}`, { method: 'POST' });
  }

  static async getAdminScholarships(
    filters: ScholarshipFilters & { status?: string; completenessStatus?: string },
  ): Promise<PaginatedResult<any>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const res = await apiFetch(`${API_BASE_URL}/admin/scholarships?${params.toString()}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch admin scholarships',
      );
    }
    return res.json();
  }

  static async getAdminScholarshipById(id: string): Promise<any> {
    const res = await apiFetch(`${API_BASE_URL}/admin/scholarships/${encodeURIComponent(id)}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch scholarship',
      );
    }
    return res.json();
  }

  static async createAdminScholarship(payload: any): Promise<any> {
    const res = await apiFetch(`${API_BASE_URL}/admin/scholarships`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      if (errorData.details && Array.isArray(errorData.details)) {
        const issues = errorData.details.map((d: any) => d.message).join(' | ');
        throw new Error(issues || errorData.error || 'Failed to create scholarship');
      }
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to create scholarship',
      );
    }
    return res.json();
  }

  static async updateAdminScholarship(id: string, payload: any): Promise<any> {
    const res = await apiFetch(`${API_BASE_URL}/admin/scholarships/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to update scholarship',
      );
    }
    return res.json();
  }

  static async executeAdminScholarshipAction(id: string, action: string): Promise<void> {
    const res = await apiFetch(
      `${API_BASE_URL}/admin/scholarships/${encodeURIComponent(id)}/${action}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          `Failed to execute ${action}`,
      );
    }
  }

  static async importScholarships(
    dataText: string,
    sourceSystem = 'ADMIN_CONSOLE',
  ): Promise<{ batch: any; records: any[] }> {
    const res = await apiFetch(`${API_BASE_URL}/admin/scholarships/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataText, sourceSystem }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to process import',
      );
    }
    return res.json();
  }

  static async createImportBatch(payload: {
    dataType?: string;
    sourceSystem?: string;
    payloadText?: string;
    dataText?: string;
  }): Promise<{ batch: Record<string, unknown>; records: Record<string, unknown>[] }> {
    let normalizedDataType = payload.dataType || 'SCHOLARSHIPS';
    if (normalizedDataType === 'international-tests' || normalizedDataType === 'tests') {
      normalizedDataType = 'TESTS';
    }

    const dataText =
      payload.dataText ||
      payload.payloadText ||
      JSON.stringify({
        provider: payload.sourceSystem || 'Manual Import Channel',
        importedAt: new Date().toISOString(),
      });

    const requestBody = {
      dataType: normalizedDataType,
      sourceSystem: payload.sourceSystem || 'Manual Import Channel',
      dataText,
    };

    const res = await apiFetch(`${API_BASE_URL}/admin/imports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to create import batch',
      );
    }
    return res.json();
  }

  static async getImportBatches(dataType = 'SCHOLARSHIPS'): Promise<any[]> {
    const res = await apiFetch(
      `${API_BASE_URL}/admin/imports/batches?dataType=${encodeURIComponent(dataType)}`,
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch import batches',
      );
    }
    return res.json();
  }

  static async getImportedRecords(params?: {
    batchId?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: any[]; total: number; page: number; pageSize: number }> {
    const searchParams = new URLSearchParams();
    if (params?.batchId) searchParams.append('batchId', params.batchId);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

    const res = await apiFetch(
      `${API_BASE_URL}/admin/scholarships/imported-records?${searchParams.toString()}`,
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch imported records',
      );
    }
    return res.json();
  }

  static async getImportRecords(params?: {
    batchId?: string;
    status?: string;
    dataType?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: any[]; total: number; page: number; pageSize: number }> {
    const searchParams = new URLSearchParams();
    if (params?.batchId) searchParams.append('batchId', params.batchId);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.dataType) searchParams.append('dataType', params.dataType);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

    const res = await apiFetch(`${API_BASE_URL}/admin/imports/records?${searchParams.toString()}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to fetch import records',
      );
    }
    return res.json();
  }

  static async promoteImportedRecord(recordId: string): Promise<any> {
    const res = await apiFetch(
      `${API_BASE_URL}/admin/scholarships/imported-records/${encodeURIComponent(recordId)}/promote`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to promote imported record',
      );
    }
    return res.json();
  }

  static async promoteImportRecord(recordId: string): Promise<any> {
    const res = await apiFetch(
      `${API_BASE_URL}/admin/imports/records/${encodeURIComponent(recordId)}/promote`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to promote import record',
      );
    }
    return res.json();
  }

  static async promoteImportBatch(batchId: string): Promise<any> {
    const res = await apiFetch(
      `${API_BASE_URL}/admin/imports/batches/${encodeURIComponent(batchId)}/promote`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        (typeof errorData.error === 'string' ? errorData.error : errorData.error?.message) ||
          'Failed to promote import batch',
      );
    }
    return res.json();
  }

  // Imported External Courses API — explicit WP-IC-07 REST contract.
  static async getAdminImportedCourses(params?: Record<string, unknown>): Promise<any> {
    const search = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') search.append(key, String(value));
    });
    const suffix = search.toString() ? `?${search.toString()}` : '';
    const res = await apiFetch(`${API_BASE_URL}/admin/courses/imported${suffix}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch imported courses');
    }
    return res.json();
  }

  static async getAdminImportedCourseById(id: string): Promise<any> {
    const res = await apiFetch(`${API_BASE_URL}/admin/courses/imported/${encodeURIComponent(id)}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch imported course');
    }
    return res.json();
  }

  static async updateAdminImportedCourse(
    id: string,
    payload: Record<string, unknown>,
  ): Promise<any> {
    const res = await apiFetch(`${API_BASE_URL}/admin/courses/imported/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update imported course');
    }
    return res.json();
  }

  private static async postImportedCourseAction(id: string, endpoint: string): Promise<any> {
    const res = await apiFetch(
      `${API_BASE_URL}/admin/courses/imported/${encodeURIComponent(id)}/${endpoint}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      },
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed imported-course operation: ${endpoint}`);
    }
    if (res.status === 204) return null;
    return res.json();
  }

  static verifyAdminImportedCourseSource(id: string) {
    return this.postImportedCourseAction(id, 'verify-source');
  }

  static checkAdminImportedCourseLink(id: string) {
    return this.postImportedCourseAction(id, 'check-link');
  }

  static fetchAdminImportedCourseMissing(id: string) {
    return this.postImportedCourseAction(id, 'fetch-missing');
  }

  static markAdminImportedCourseReady(id: string) {
    return this.postImportedCourseAction(id, 'mark-ready');
  }

  static publishAdminImportedCourse(id: string) {
    return this.postImportedCourseAction(id, 'publish');
  }

  static unpublishAdminImportedCourse(id: string) {
    return this.postImportedCourseAction(id, 'unpublish');
  }

  static rejectAdminImportedCourse(id: string) {
    return this.postImportedCourseAction(id, 'reject');
  }

  static archiveAdminImportedCourse(id: string) {
    return this.postImportedCourseAction(id, 'archive');
  }

  // Backward-compatible UI adapter. It maps a closed action enum to explicit
  // REST endpoints; it never constructs an open-ended /:action URL.
  static async executeAdminImportedCourseAction(
    id: string,
    action: string,
    payload?: any,
  ): Promise<any> {
    switch (action) {
      case 'VERIFY_SOURCE':
        return this.verifyAdminImportedCourseSource(id);
      case 'CHECK_LINK':
        return this.checkAdminImportedCourseLink(id);
      case 'FETCH_MISSING_FIELDS':
        return this.fetchAdminImportedCourseMissing(id);
      case 'MARK_READY_TO_PUBLISH':
        return this.markAdminImportedCourseReady(id);
      case 'PUBLISH':
        return this.publishAdminImportedCourse(id);
      case 'UNPUBLISH':
        return this.unpublishAdminImportedCourse(id);
      case 'REJECT':
        return this.rejectAdminImportedCourse(id);
      case 'ARCHIVE':
        return this.archiveAdminImportedCourse(id);
      case 'EDIT':
        return this.updateAdminImportedCourse(id, {
          displayName: payload?.displayName ?? payload?.titleAr,
          directCourseUrl: payload?.directCourseUrl ?? payload?.directUrl,
          providerName: payload?.provider,
          isStudyFree:
            payload?.studyFree === 'Yes' ? true : payload?.studyFree === 'No' ? false : undefined,
          isFreeCertificate:
            payload?.freeCertificate === 'Yes'
              ? true
              : payload?.freeCertificate === 'No'
                ? false
                : undefined,
          certificateType: payload?.certificateType,
          learningLanguageRaw: payload?.language,
          studyLevelRaw: payload?.level,
          studyDurationRaw: payload?.duration,
          category: payload?.category,
          shortCourseTopicsRaw: payload?.shortCourseTopics,
        });
      default:
        throw new Error(`Unsupported imported course action: ${action}`);
    }
  }

  static async getCourseImportOverview(): Promise<any> {
    const res = await apiFetch(`${API_BASE_URL}/admin/imports/courses/overview`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch course import overview');
    }
    return res.json();
  }

  static async getCourseImportProviders(): Promise<any> {
    const res = await apiFetch(`${API_BASE_URL}/admin/imports/courses/providers`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch course providers');
    }
    return res.json();
  }

  static async getCourseImportProvider(id: string): Promise<any> {
    const res = await apiFetch(
      `${API_BASE_URL}/admin/imports/courses/providers/${encodeURIComponent(id)}`,
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch course provider');
    }
    return res.json();
  }

  static async preflightCourseImport(payload: Record<string, unknown>): Promise<any> {
    const res = await apiFetch(`${API_BASE_URL}/admin/imports/courses/preflight`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Course import preflight failed');
    }
    return res.json();
  }

  static async createCourseImportBatch(payload: Record<string, unknown>): Promise<any> {
    const res = await apiFetch(`${API_BASE_URL}/admin/imports/courses/batches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create course import batch');
    }
    return res.json();
  }

  static async getCourseImportBatches(limit = 50): Promise<any[]> {
    const res = await apiFetch(
      `${API_BASE_URL}/admin/imports/courses/batches?limit=${encodeURIComponent(String(limit))}`,
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch course import batches');
    }
    const result = await res.json();
    return Array.isArray(result?.data) ? result.data : [];
  }

  static async getCourseImportBatch(id: string): Promise<any> {
    const res = await apiFetch(
      `${API_BASE_URL}/admin/imports/courses/batches/${encodeURIComponent(id)}`,
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch course import batch');
    }
    return res.json();
  }

  static async getCourseImportBatchRecords(
    id: string,
    params?: Record<string, unknown>,
  ): Promise<any> {
    const search = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') search.append(key, String(value));
    });
    const suffix = search.toString() ? `?${search.toString()}` : '';
    const res = await apiFetch(
      `${API_BASE_URL}/admin/imports/courses/batches/${encodeURIComponent(id)}/records${suffix}`,
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch course import records');
    }
    return res.json();
  }

  static async getCourseImportReviewQueue(params?: Record<string, unknown>): Promise<any> {
    const search = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') search.append(key, String(value));
    });
    const suffix = search.toString() ? `?${search.toString()}` : '';
    const res = await apiFetch(`${API_BASE_URL}/admin/imports/courses/review${suffix}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch course import review queue');
    }
    return res.json();
  }

  static async transferCourseImportBatch(
    id: string,
    payload: Record<string, unknown>,
  ): Promise<any> {
    const res = await apiFetch(
      `${API_BASE_URL}/admin/imports/courses/batches/${encodeURIComponent(id)}/transfer`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to transfer course import batch');
    }
    return res.json();
  }

  // Paid Courses API
  static async getAdminPaidCourses(params?: any): Promise<any[]> {
    const res = await apiFetch(`${API_BASE_URL}/admin/courses/paid`);
    if (!res.ok) throw new Error('Failed to fetch paid courses');
    return res.json();
  }

  static async getAdminPaidCourseById(id: string): Promise<any> {
    const res = await apiFetch(`${API_BASE_URL}/admin/courses/paid/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Failed to fetch paid course');
    return res.json();
  }

  static async executeAdminPaidCourseAction(
    id: string,
    action: string,
    payload?: any,
  ): Promise<any> {
    const res = await apiFetch(
      `${API_BASE_URL}/admin/courses/paid/${encodeURIComponent(id)}/${action}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload || {}),
      },
    );
    if (!res.ok) throw new Error(`Failed to execute paid course action ${action}`);
    return res.json();
  }

  // Student Services API (Phase 20)
  static async getAdminStudentServices(params?: any): Promise<any[]> {
    const res = await apiFetch(`${API_BASE_URL}/admin/services/student`);
    if (!res.ok) throw new Error('Failed to fetch student services');
    return res.json();
  }

  static async getAdminStudentServiceById(id: string): Promise<any> {
    const res = await apiFetch(`${API_BASE_URL}/admin/services/student/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Failed to fetch student service');
    return res.json();
  }

  static async createAdminStudentService(payload: any): Promise<any> {
    const res = await apiFetch(`${API_BASE_URL}/admin/services/student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create student service');
    return res.json();
  }

  static async executeAdminStudentServiceAction(
    id: string,
    action: string,
    payload?: any,
  ): Promise<any> {
    const res = await apiFetch(
      `${API_BASE_URL}/admin/services/student/${encodeURIComponent(id)}/${action}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload || {}),
      },
    );
    if (!res.ok) throw new Error(`Failed to execute student service action ${action}`);
    return res.json();
  }

  // General Services API (Phase 20)
  static async getAdminGeneralServices(params?: any): Promise<any[]> {
    const res = await apiFetch(`${API_BASE_URL}/admin/services/general`);
    if (!res.ok) throw new Error('Failed to fetch general services');
    return res.json();
  }

  static async getAdminGeneralServiceById(id: string): Promise<any> {
    const res = await apiFetch(`${API_BASE_URL}/admin/services/general/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Failed to fetch general service');
    return res.json();
  }

  static async createAdminGeneralService(payload: any): Promise<any> {
    const res = await apiFetch(`${API_BASE_URL}/admin/services/general`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create general service');
    return res.json();
  }

  static async executeAdminGeneralServiceAction(
    id: string,
    action: string,
    payload?: any,
  ): Promise<any> {
    const res = await apiFetch(
      `${API_BASE_URL}/admin/services/general/${encodeURIComponent(id)}/${action}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload || {}),
      },
    );
    if (!res.ok) throw new Error(`Failed to execute general service action ${action}`);
    return res.json();
  }
}
