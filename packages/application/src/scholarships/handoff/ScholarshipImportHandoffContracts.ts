import type {
  ScholarshipCompletenessState,
  ScholarshipImportPayload,
  UniversalImportHandoff,
} from '@manaratak/domain';
import type { ScholarshipCanonicalResolutionResult } from '../resolution';

export type ScholarshipImportStagingState =
  | 'STAGED_COMPLETE'
  | 'STAGED_NEEDS_REVIEW'
  | 'STAGED_INCOMPLETE';

export interface ScholarshipImportHandoffEvidence {
  handoffId: string;
  artifact: UniversalImportHandoff['artifact'];
  provenance: UniversalImportHandoff['provenance'];
  execution: UniversalImportHandoff['execution'];
  validation: UniversalImportHandoff['validation'];
  correlationId?: string;
  referenceMetadata?: UniversalImportHandoff['referenceMetadata'];
}

export interface ScholarshipImportStagingCandidate {
  stagingKey: string;
  stageState: ScholarshipImportStagingState;
  normalizedPayload: ScholarshipImportPayload;
  completeness: {
    state: ScholarshipCompletenessState;
    missingFields: string[];
  };
  canonicalScreening: ScholarshipCanonicalResolutionResult[];
  evidence: ScholarshipImportHandoffEvidence;
}

/**
 * Read-only semantic screening hook. Implementations may resolve existing
 * canonical references, but must not create or mutate canonical entities.
 */
export interface IScholarshipHandoffCanonicalScreening {
  screen(payload: ScholarshipImportPayload): Promise<ScholarshipCanonicalResolutionResult[]>;
}
