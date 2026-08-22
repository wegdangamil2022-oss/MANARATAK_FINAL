import type { PaginatedCourseResult } from './contracts/ICourseRepository';
import type { PublicCourseFilters } from './contracts/PublicCourseFilters';

export type CourseTaxonomyResolutionStatus =
  | 'UNRESOLVED'
  | 'AMBIGUOUS'
  | 'PROPOSED'
  | 'APPROVED'
  | 'REJECTED';

export type CourseTaxonomyMatchMethod =
  | 'EXACT_CANONICAL_NAME'
  | 'EXACT_CANONICAL_CODE'
  | 'EXACT_ALIAS'
  | 'ADMIN_REVIEW';

export type CourseAcademicTaxonomyRelationshipType =
  | 'PRIMARY'
  | 'SECONDARY'
  | 'RELATED';

export type CourseMajorProjectionState =
  | 'PROPOSED'
  | 'APPROVED'
  | 'REJECTED';

export type CourseMajorProjectionSource =
  | 'TAXONOMY_MAPPING'
  | 'DIRECT_REVIEWED';

export type CourseLanguageResolutionState =
  | 'UNRESOLVED'
  | 'RESOLVED'
  | 'AMBIGUOUS'
  | 'REVIEW_REQUIRED';

export type CourseLanguageResolutionMethod =
  | 'EXACT_ISO_CODE'
  | 'EXACT_NAME'
  | 'EXACT_NATIVE_NAME'
  | 'EXACT_ARABIC_NAME'
  | 'ADMIN_REVIEW';

export interface CourseRelationshipSourceDto {
  courseId: string;
  status: string;
  sourceImportRecordId?: string | null;
  shortCourseTopicsRaw?: string | null;
  learningLanguageRaw?: string | null;
  learningLanguageReferenceId?: string | null;
  learningLanguageResolutionState: CourseLanguageResolutionState;
  learningLanguageResolutionMethod?: CourseLanguageResolutionMethod | null;
  learningLanguageReviewedBy?: string | null;
  externalProviderId?: string | null;
  provider?: {
    id: string;
    publicId: string;
    canonicalName: string;
    headquartersCountryReferenceId?: string | null;
    headquartersCountry?: {
      id: string;
      iso2Code: string;
      iso3Code: string;
      name: string;
    } | null;
  } | null;
}

export interface CourseTaxonomyCandidateDto {
  nodeId: string;
  nodeType: string;
  canonicalCode: string;
  canonicalName: string;
  standardType: string;
  standardCode?: string | null;
  matchMethod: Exclude<CourseTaxonomyMatchMethod, 'ADMIN_REVIEW'>;
}

export interface CourseTaxonomyResolutionDto {
  id: string;
  courseId: string;
  sourceTerm: string;
  normalizedTerm: string;
  status: CourseTaxonomyResolutionStatus;
  candidateTaxonomyNodeIds: string[];
  chosenTaxonomyNodeId?: string | null;
  matchMethod?: CourseTaxonomyMatchMethod | null;
  confidence?: number | null;
  sourceImportRecordId?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseAcademicTaxonomyLinkDto {
  id: string;
  courseId: string;
  taxonomyNodeId: string;
  sourceResolutionId?: string | null;
  relationshipType: CourseAcademicTaxonomyRelationshipType;
  reviewState: 'PROPOSED' | 'APPROVED' | 'REJECTED';
  matchMethod: CourseTaxonomyMatchMethod;
  sourceTerm: string;
  confidence?: number | null;
  sourceImportRecordId?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseMajorMappingCandidateDto {
  mappingId: string;
  taxonomyNodeId: string;
  majorId: string;
  profileId?: string | null;
  relationshipType: 'PRIMARY' | 'SECONDARY' | 'RELATED';
  confidence?: number | null;
}

export interface CourseMajorProjectionDto {
  id: string;
  projectionKey: string;
  courseId: string;
  majorId: string;
  profileId?: string | null;
  taxonomyNodeId?: string | null;
  sourceCourseTaxonomyLinkId?: string | null;
  sourceMajorClassificationMappingId?: string | null;
  sourceType: CourseMajorProjectionSource;
  relationshipType: 'PRIMARY' | 'SECONDARY' | 'RELATED';
  projectionState: CourseMajorProjectionState;
  confidence?: number | null;
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseLanguageCandidateDto {
  id: string;
  isoCode: string;
  name: string;
  nameAr?: string | null;
  nativeName?: string | null;
  matchMethod: Exclude<CourseLanguageResolutionMethod, 'ADMIN_REVIEW'>;
}

export interface CourseGeographySemanticsDto {
  courseId: string;
  providerId?: string | null;
  providerName?: string | null;
  providerHeadquartersCountryReferenceId?: string | null;
  providerHeadquartersCountry?: {
    id: string;
    iso2Code: string;
    iso3Code: string;
    name: string;
  } | null;
  studyCountryReferenceIds: string[];
  semantics: 'PROVIDER_HEADQUARTERS_ONLY' | 'NO_GEOGRAPHY';
}

export interface CourseRelationshipPublicCourseDto {
  publicId: string;
  slug: string;
  displayName: string;
  accessType: string;
  originType: string;
  directCourseUrl: string;
  externalProviderId?: string | null;
  providerName?: string | null;
  learningLanguageRaw?: string | null;
  learningLanguageReferenceId?: string | null;
  isStudyFree?: boolean | null;
  isFreeCertificate?: boolean | null;
  certificateType?: string | null;
  category?: string | null;
}

export interface CourseRelationshipPublicFilters extends PublicCourseFilters {
  majorId?: string;
  taxonomyNodeId?: string;
  learningLanguageReferenceId?: string;
  providerHeadquartersCountryReferenceId?: string;
}

export interface CourseRelationshipAnalysisResult {
  courseId: string;
  taxonomy: {
    sourceTerms: string[];
    proposed: number;
    ambiguous: number;
    unresolved: number;
  };
  language: {
    raw?: string | null;
    state: CourseLanguageResolutionState;
    referenceId?: string | null;
    method?: CourseLanguageResolutionMethod | null;
  };
  geography: CourseGeographySemanticsDto;
}

export interface ICourseRelationshipRepository {
  getRelationshipSource(courseId: string): Promise<CourseRelationshipSourceDto | null>;

  resolveTaxonomyCandidates(normalizedTerm: string): Promise<CourseTaxonomyCandidateDto[]>;
  upsertTaxonomyResolution(input: {
    courseId: string;
    sourceTerm: string;
    normalizedTerm: string;
    status: CourseTaxonomyResolutionStatus;
    candidateTaxonomyNodeIds: string[];
    chosenTaxonomyNodeId?: string | null;
    matchMethod?: CourseTaxonomyMatchMethod | null;
    confidence?: number | null;
    sourceImportRecordId?: string | null;
  }): Promise<CourseTaxonomyResolutionDto>;
  upsertTaxonomyLink(input: {
    courseId: string;
    taxonomyNodeId: string;
    sourceResolutionId?: string | null;
    relationshipType: CourseAcademicTaxonomyRelationshipType;
    reviewState: 'PROPOSED' | 'APPROVED' | 'REJECTED';
    matchMethod: CourseTaxonomyMatchMethod;
    sourceTerm: string;
    confidence?: number | null;
    sourceImportRecordId?: string | null;
  }): Promise<CourseAcademicTaxonomyLinkDto>;
  listTaxonomyLinks(courseId: string, reviewState?: 'PROPOSED' | 'APPROVED' | 'REJECTED'): Promise<CourseAcademicTaxonomyLinkDto[]>;
  reviewTaxonomyLink(input: {
    linkId: string;
    decision: 'APPROVED' | 'REJECTED';
    actorId: string;
  }): Promise<CourseAcademicTaxonomyLinkDto>;

  resolveLanguageCandidates(raw: string): Promise<CourseLanguageCandidateDto[]>;
  setLanguageResolution(input: {
    courseId: string;
    languageReferenceId?: string | null;
    state: CourseLanguageResolutionState;
    method?: CourseLanguageResolutionMethod | null;
  }): Promise<void>;
  reviewLanguageResolution(input: {
    courseId: string;
    languageReferenceId: string;
    actorId: string;
  }): Promise<void>;

  listMajorMappingsForTaxonomyNode(taxonomyNodeId: string): Promise<CourseMajorMappingCandidateDto[]>;
  upsertMajorProjection(input: {
    projectionKey: string;
    courseId: string;
    majorId: string;
    profileId?: string | null;
    taxonomyNodeId?: string | null;
    sourceCourseTaxonomyLinkId?: string | null;
    sourceMajorClassificationMappingId?: string | null;
    sourceType: CourseMajorProjectionSource;
    relationshipType: 'PRIMARY' | 'SECONDARY' | 'RELATED';
    projectionState: CourseMajorProjectionState;
    confidence?: number | null;
  }): Promise<CourseMajorProjectionDto>;
  listMajorProjections(courseId: string, state?: CourseMajorProjectionState): Promise<CourseMajorProjectionDto[]>;
  reviewMajorProjection(input: {
    projectionId: string;
    decision: 'APPROVED' | 'REJECTED';
    actorId: string;
  }): Promise<CourseMajorProjectionDto>;

  listPublishedRelatedCourses(
    filters: CourseRelationshipPublicFilters,
  ): Promise<PaginatedCourseResult<CourseRelationshipPublicCourseDto>>;
  listPublishedCoursesForMajor(
    majorId: string,
    filters?: PublicCourseFilters,
  ): Promise<PaginatedCourseResult<CourseRelationshipPublicCourseDto>>;

  getGeographySemantics(courseId: string): Promise<CourseGeographySemanticsDto | null>;
}
