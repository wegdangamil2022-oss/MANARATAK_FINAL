import { z } from 'zod';
import { ScholarshipCompletenessState } from '../generated/dummy';

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
}).passthrough();

export class ScholarshipCompletenessClassifier {
  static classify(payload: any): { state: ScholarshipCompletenessState, missingFields?: string[] } {
    const missing = [];
    if (!payload.scholarshipName && !payload.displayName) missing.push('scholarshipName');
    if (missing.length > 0) return { state: ScholarshipCompletenessState.INCOMPLETE, missingFields: missing };
    
    const reviewFields = [];
    const description = payload.description || payload.coverageDetails || payload.eligibilityCriteria;
    if (!description) reviewFields.push('description');
    
    const sourceUrl = payload.officialSourceUrl || payload.officialWebsite || payload.sourceUrl || payload.applicationLink;
    if (!sourceUrl) reviewFields.push('officialSourceUrl');
    
    if (reviewFields.length > 0) {
      return { state: ScholarshipCompletenessState.NEEDS_REVIEW, missingFields: reviewFields };
    }
    return { state: ScholarshipCompletenessState.COMPLETE };
  }
}
export class ScholarshipNamingService {
  static normalize(name: string): string { return name.trim(); }
}
export class ScholarshipDeduplicationService {
  static generateKey(payload: any): string {
    return `${payload.scholarshipName}|${payload.providerName || 'UNKNOWN'}`.toLowerCase();
  }
}
