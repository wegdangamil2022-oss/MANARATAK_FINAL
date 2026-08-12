import type { UniversalImportHandoff } from '../import-foundation/contracts/UniversalImportHandoff';
import type { DegreeLevelReference } from '../degree-level/DegreeLevel';
import type {
  AdministrativeRegionDto,
  ReferenceCityDto,
  ReferenceCountryDto,
} from '../reference-data/dto/ReferenceDataContracts';

export type UniversitySourceReferenceId = `INS-${string}`;
export type UniversityLifecycleStatus = 'DRAFT' | 'REVIEW_REQUIRED' | 'READY_TO_PUBLISH' | 'PUBLISHED' | 'ARCHIVED';
export type InstitutionalOwnership = 'PUBLIC' | 'PRIVATE' | 'NON_PROFIT' | 'PUBLIC_PRIVATE' | 'OTHER';

export interface UniversityCanonicalReferenceContract {
  universityId?: string;
  sourceReferenceId: UniversitySourceReferenceId;
  officialName: string;
  localName?: string;
  countryReferenceId: NonNullable<ReferenceCountryDto['id']>;
  regionReferenceId?: AdministrativeRegionDto['id'];
  cityReferenceId?: ReferenceCityDto['id'];
  institutionType: string;
  institutionalOwnership: InstitutionalOwnership;
  officialIdentifiers?: ReadonlyArray<{ scheme: string; value: string }>;
  aliases?: readonly string[];
  status: UniversityLifecycleStatus;
  provenance: {
    sourceSystem: string;
    sourceArtifactId: string;
    sourceRowNumber?: number;
    acquiredAt: Date;
  };
  compatibility?: {
    countryName?: string;
    regionName?: string;
    cityName?: string;
    countryCode?: string;
  };
}

export interface CampusContract {
  campusId: string;
  universityId: string;
  name: string;
  address?: string;
  countryReferenceId?: NonNullable<ReferenceCountryDto['id']>;
  regionReferenceId?: AdministrativeRegionDto['id'];
  cityReferenceId?: ReferenceCityDto['id'];
  coordinates?: { latitude: number; longitude: number; source: string };
  campusType?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PLANNED';
}

export interface UniversityOrganizationUnitContract {
  organizationUnitId: string;
  universityId: string;
  campusId?: string;
  parentOrganizationUnitId?: string;
  type: 'FACULTY' | 'SCHOOL' | 'COLLEGE' | 'DEPARTMENT';
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  createsAcademicTaxonomyIdentity: false;
}

export type ProgramMajorMappingState = 'CANONICALLY_MAPPED' | 'MAJOR_REVIEW_REQUIRED' | 'UNMAPPED';

export interface AcademicProgramContract {
  academicProgramId?: string;
  universityId: string;
  organizationUnitId?: string;
  sourceProgramName: string;
  majorId?: string;
  degreeLevel: DegreeLevelReference;
  majorMappingState: ProgramMajorMappingState;
  taxonomySource: 'DERIVED_FROM_MAJOR';
}

export interface ProgramAdmissionRequirementContract {
  requirementId?: string;
  academicProgramId: string;
  internationalTestId: string;
  testVariantId?: string;
  testVersionId?: string;
  minimumScore?: number;
  sectionScores?: ReadonlyArray<{ sectionCode: string; minimumScore: number }>;
  validityMetadata?: Readonly<Record<string, unknown>>;
  restrictionMetadata?: Readonly<Record<string, unknown>>;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'REVIEW_REQUIRED';
}

export type UniversityImportSourceSelection =
  | { kind: 'UPLOADED_FILE'; artifactId: string; fileName: string }
  | { kind: 'PROJECT_ROOT_FILE'; artifactId: string; explicitlySelectedFileName: string }
  | { kind: 'API_PROVIDER'; artifactId: string; providerId: string }
  | { kind: 'MANUAL_STRUCTURED_PAYLOAD'; artifactId: string; submissionId: string };

export interface UniversityImportRequestContract {
  importType: 'UNIVERSITY';
  targetDomain: 'PHASE_11_UNIVERSITY';
  source: UniversityImportSourceSelection;
  handoff: UniversalImportHandoff;
  approvalMode: 'DRY_RUN_ONLY' | 'EXPLICIT_COMMIT_APPROVAL_REQUIRED';
}

export type UniversityDryRunDisposition =
  | 'NEW'
  | 'MATCHED'
  | 'UPDATE'
  | 'NO_CHANGE'
  | 'CONFLICT'
  | 'REVIEW_REQUIRED'
  | 'REJECTED';

export interface UniversityReferenceResolutionResult {
  referenceType: 'COUNTRY' | 'REGION' | 'CITY' | 'MAJOR' | 'DEGREE_LEVEL' | 'INTERNATIONAL_TEST';
  sourceValue?: string;
  canonicalId?: string;
  status: 'RESOLVED' | 'UNRESOLVED_REFERENCE' | 'REFERENCE_REVIEW_REQUIRED';
}

export interface UniversityImportDryRunResult {
  disposition: UniversityDryRunDisposition;
  sourceReferenceId: UniversitySourceReferenceId;
  proposedUniversityId?: string;
  referenceResolution: readonly UniversityReferenceResolutionResult[];
  programMappings?: ReadonlyArray<{
    sourceProgramName: string;
    majorId?: string;
    degreeLevelId?: string;
    state: ProgramMajorMappingState;
  }>;
  validationIssues: ReadonlyArray<{ code: string; path?: string; message: string }>;
  provenance: UniversalImportHandoff['provenance'];
  databaseWrites: 0;
}

export class UniversityImportReadinessPolicy {
  static validateRequest(request: UniversityImportRequestContract): readonly string[] {
    const issues: string[] = [];
    if (!request.handoff.execution.dryRun) issues.push('DRY_RUN_REQUIRED');
    if (request.handoff.ownerDomain !== 'PHASE_11_UNIVERSITY') issues.push('INVALID_HANDOFF_OWNER');
    if (request.approvalMode !== 'DRY_RUN_ONLY') issues.push('COMMIT_APPROVAL_NOT_AVAILABLE');
    if (request.source.kind === 'PROJECT_ROOT_FILE' && !request.source.explicitlySelectedFileName) {
      issues.push('EXPLICIT_ROOT_FILE_SELECTION_REQUIRED');
    }
    return issues;
  }

  static validateIdentity(sourceReferenceId: string): sourceReferenceId is UniversitySourceReferenceId {
    return /^INS-[A-Z0-9]+(?:-[A-Z0-9]+)+$/.test(sourceReferenceId);
  }

  static canResolveDuplicateAutomatically(input: { sourceReferenceId?: string; name?: string }): boolean {
    return Boolean(input.sourceReferenceId && this.validateIdentity(input.sourceReferenceId));
  }
}
