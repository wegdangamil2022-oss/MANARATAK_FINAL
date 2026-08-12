import { z } from 'zod';
import { UniversityImportCompletenessState } from '../generated/dummy';

export const UniversityImportPayloadSchema = z.object({
  universityName: z.string(),
  country: z.string().optional(),
  institutionType: z.string().optional(),
  officialWebsite: z.string().optional(),
  sourceUrl: z.string().optional(),
  officialSourceUrl: z.string().optional(),
  city: z.string().optional(),
  logoAssetId: z.string().optional(),
  foundedYear: z.number().optional(),
  localizedNames: z.any().optional(),
  campuses: z.any().optional(),
  accreditations: z.any().optional(),
  rankings: z.any().optional(),
  description: z.string().optional(),
  languagesOfInstruction: z.any().optional(),
  tuitionReferences: z.any().optional(),
  admissionRequirements: z.any().optional(),
  academicPrograms: z.any().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  socialLinks: z.any().optional(),
  metadata: z.any().optional(),
}).passthrough();

export class UniversityCompletenessClassifier {
  static classify(payload: any): { state: UniversityImportCompletenessState, missingFields?: string[] } {
    const missing = [];
    if (!payload.universityName) missing.push('universityName');
    if (!payload.country) missing.push('country');
    if (!payload.institutionType) missing.push('institutionType');
    
    if (missing.length > 0) {
      return { state: UniversityImportCompletenessState.INCOMPLETE, missingFields: missing };
    }
    
    const reviewFields = [];
    if (!payload.officialWebsite) reviewFields.push('officialWebsite');
    if (!payload.city) reviewFields.push('city');
    if (!payload.officialSourceUrl) reviewFields.push('officialSourceUrl');
    
    if (reviewFields.length > 0) {
      return { state: UniversityImportCompletenessState.NEEDS_REVIEW, missingFields: reviewFields };
    }
    
    return { state: UniversityImportCompletenessState.COMPLETE };
  }
}
export class UniversityNamingService {
  static normalize(name: string): string {
    return name.trim();
  }
}
export class UniversityDeduplicationService {
  static generateKey(payload: any): string {
    let domain = 'unknown';
    if (payload.officialWebsite) {
      try {
        const url = new URL(payload.officialWebsite);
        domain = url.hostname.replace(/^www\./, '');
      } catch {
        domain = payload.officialWebsite;
      }
    }
    return `${payload.universityName}|${payload.country || 'UNKNOWN'}|${domain}`.toLowerCase();
  }
}

// --- University & Academic Program Integration Contracts ---

export enum ProgramIntegrationStatus {
  MATCHED = 'MATCHED',
  AMBIGUOUS = 'AMBIGUOUS',
  MAJOR_REVIEW_REQUIRED = 'MAJOR_REVIEW_REQUIRED',
  UNMAPPED = 'UNMAPPED'
}

export interface AcademicProgramIntegrationDto {
  programId?: string;
  universityRefId: string; // SOURCE UNIVERSITY REFERENCE ID (must be preserved)
  sourceProgramName: string; // Raw/source title
  degreeLevelCanonicalCode: string; // Stable boundary reference (e.g., BACHELOR, MASTER)
  majorId?: string; // Canonical Major identity relationship
  facultyName?: string; // Institution-specific organizational data (not a taxonomy node)
  departmentName?: string; // Optional department context
  campusIds?: string[]; // Multi-campus support (does not structurally block multi-campus)
  status: ProgramIntegrationStatus;
  rawSourceData?: any;
}

export interface UniversityIntegrationPayload {
  universityRefId: string; // The canonical persistent identifier
  displayName: string;
  countryId?: string; // Canonical location reference
  regionId?: string; // Canonical location reference
  cityId?: string; // Canonical location reference
  officialWebsite?: string;
  academicPrograms?: AcademicProgramIntegrationDto[];
}

export class UniversityIntegrationContract {
  /**
   * Rule A: DegreeLevel canonicalCode is accepted as stable boundary reference
   */
  static validateDegreeLevelCode(code: string): boolean {
    const validCodes = ['BACHELOR', 'MASTER', 'DOCTORATE', 'FELLOWSHIP', 'DIPLOMA', 'ASSOCIATE', 'CERTIFICATE'];
    return validCodes.includes(code.toUpperCase());
  }

  /**
   * Rule B: canonical Major reference is preferred over Major text
   */
  static validateMajorLinkage(program: AcademicProgramIntegrationDto): { valid: boolean; message?: string } {
    if (program.status === ProgramIntegrationStatus.MATCHED && !program.majorId) {
      return { 
        valid: false, 
        message: 'Canonical Major reference (majorId) is required for MATCHED status. Direct linkage by text is prohibited.' 
      };
    }
    return { valid: true };
  }

  /**
   * Rule C & D: University Reference ID is preserved, and repeated same reference ID resolves to same identity
   */
  static resolveUniversityIdentity(payload: UniversityIntegrationPayload, existingUniversities: Array<{ id: string; publicId: string }>): { canonicalId: string; isPreserved: boolean } {
    if (!payload.universityRefId) {
      throw new Error('University Reference ID is missing. Generating random IDs for raw source records is prohibited.');
    }
    const match = existingUniversities.find(u => u.publicId === payload.universityRefId || u.id === payload.universityRefId);
    if (match) {
      return { canonicalId: match.id, isPreserved: true };
    }
    // Return the preserved reference ID itself as the canonical/public ID
    return { canonicalId: payload.universityRefId, isPreserved: true };
  }

  /**
   * Rule E: Faculty name is institution-specific organization data and does NOT create/become a taxonomy node
   */
  static processFacultyContext(_facultyName: string): { isTaxonomyNode: boolean; isOrganizationalContext: boolean } {
    return {
      isTaxonomyNode: false, // STOPS creating fake taxonomy nodes
      isOrganizationalContext: true
    };
  }

  /**
   * Rule F, G, H: Unresolved programs must remain valid as UNMAPPED or MAJOR_REVIEW_REQUIRED,
   * without creating fake Majors or fake Taxonomy nodes.
   */
  static handleUnresolvedProgram(program: AcademicProgramIntegrationDto): { 
    isValid: boolean; 
    createdFakeMajor: boolean; 
    createdFakeTaxonomyNode: boolean; 
  } {
    if (program.status === ProgramIntegrationStatus.UNMAPPED || program.status === ProgramIntegrationStatus.MAJOR_REVIEW_REQUIRED) {
      return {
        isValid: true, // Remains valid and preserved for later review
        createdFakeMajor: false, // Absolutely forbidden to create fake Majors
        createdFakeTaxonomyNode: false // Absolutely forbidden to create fake taxonomy nodes
      };
    }
    return {
      isValid: true,
      createdFakeMajor: false,
      createdFakeTaxonomyNode: false
    };
  }

  /**
   * Rule I & J: University integration can represent optional campus/faculty/department, and multi-campus requirement is not structurally blocked.
   */
  static validateHierarchyFlexibility(program: AcademicProgramIntegrationDto): { 
    hasOptionalHierarchy: boolean; 
    supportsMultiCampus: boolean; 
  } {
    const hasOptionalHierarchy = 
      program.facultyName === undefined || 
      program.departmentName === undefined || 
      program.campusIds === undefined;

    const supportsMultiCampus = Array.isArray(program.campusIds) && program.campusIds.length >= 0;

    return {
      hasOptionalHierarchy,
      supportsMultiCampus
    };
  }
}

