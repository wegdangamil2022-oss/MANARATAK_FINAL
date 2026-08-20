import { z } from 'zod';
import { ScholarshipCompletenessState } from './contracts';

export * from './contracts';

export const ScholarshipImportPayloadSchema = z.object({
  scholarshipName: z.string(),
  providerName: z.string().optional(),
  amountMinorUnits: z.string().optional(),
  amountCurrencyCode: z.string().optional(),
  targetCountries: z.any().optional(),
  studyLevels: z.any().optional(),
  applicationDeadline: z.string().optional(),
  isFullyFunded: z.boolean().optional(),
  officialWebsite: z.string().optional(),
  sourceUrl: z.string().optional(),
  description: z.string().optional(),
  fundingCoverage: z.string().optional(),
  coverageDetails: z.string().optional(),
  eligibleMajorsOrFields: z.union([z.string(), z.array(z.string())]).optional(),
  degreeLevel: z.string().optional(),
  applicationLink: z.string().optional(),
  officialSourceUrl: z.string().optional(),
  sponsorName: z.string().optional(),
  studyCountry: z.string().optional(),
  requiredDocuments: z.union([z.string(), z.array(z.string())]).optional(),
  eligibilityCriteria: z.string().optional(),
  studyLanguage: z.string().optional(),
  targetUniversities: z.array(z.string()).optional(),
  targetAcademicPrograms: z.array(z.string()).optional(),
  fundingAmount: z.union([z.string(), z.number()]).optional(),
  currency: z.string().optional(),
  duration: z.string().optional(),
  localizedNames: z.record(z.string(), z.string()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).passthrough();

export type ScholarshipImportPayload = z.infer<typeof ScholarshipImportPayloadSchema>;
type ScholarshipCompletenessPayload = Partial<ScholarshipImportPayload> & {
  displayName?: string;
};

export class ScholarshipCompletenessClassifier {
  static classify(payload: ScholarshipCompletenessPayload): {
    state: ScholarshipCompletenessState;
    missingFields?: string[];
  } {
    const missing: string[] = [];
    if (!payload.scholarshipName && !payload.displayName) missing.push('scholarshipName');
    if (missing.length > 0) {
      return { state: ScholarshipCompletenessState.INCOMPLETE, missingFields: missing };
    }

    const reviewFields: string[] = [];
    const description = payload.description || payload.coverageDetails || payload.eligibilityCriteria;
    if (!description) reviewFields.push('description');

    const sourceUrl =
      payload.officialSourceUrl ||
      payload.officialWebsite ||
      payload.sourceUrl ||
      payload.applicationLink;
    if (!sourceUrl) reviewFields.push('officialSourceUrl');

    if (reviewFields.length > 0) {
      return {
        state: ScholarshipCompletenessState.NEEDS_REVIEW,
        missingFields: reviewFields,
      };
    }
    return { state: ScholarshipCompletenessState.COMPLETE };
  }
}

export class ScholarshipNamingService {
  static normalize(name: string): string {
    return name.trim();
  }
}

export class ScholarshipDeduplicationService {
  static generateKey(payload: Pick<ScholarshipImportPayload, 'scholarshipName' | 'providerName'>): string {
    return `${payload.scholarshipName}|${payload.providerName || 'UNKNOWN'}`.toLowerCase();
  }
}
