import type {
  IScholarshipRepository,
  ScholarshipCompletenessState,
} from '@manaratak/domain';

export type ScholarshipImportOperationalClass =
  | 'REAL'
  | 'TEST'
  | 'DEMO'
  | 'ARCHIVED'
  | 'UNCLASSIFIED';

export type ScholarshipImportVerificationState = 'PENDING' | 'VERIFIED' | 'FAILED';
export type ScholarshipImportCanonicalScreeningState =
  | 'NOT_EXECUTED'
  | 'CLEAR'
  | 'REVIEW_REQUIRED';

export type ScholarshipImportReviewAction = 'MERGE' | 'KEEP_CURRENT' | 'SPLIT';

export interface ScholarshipImportCenterBatchRecord {
  id: string;
  sourceSystem: string;
  dataType: string;
  batchStatus: string;
  totalRecords?: number;
  processedRecords?: number;
  failedRecords?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ScholarshipImportCenterStoredRecord {
  id: string;
  batchId: string;
  status: string;
  rawPayload: unknown;
  validationErrors?: unknown;
  processingNotes?: string | null;
  sourceDedupKey?: string | null;
  promotedEntityId?: string | null;
  sourceRowNumber?: number | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  batch?: ScholarshipImportCenterBatchRecord | null;
}

export interface ScholarshipImportCenterRecordPage {
  data: ScholarshipImportCenterStoredRecord[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Structural read port over the existing Phase 6 ImportBatch/ImportRecord store.
 * PrismaImportRepository already satisfies this shape; Application does not import Prisma.
 */
export interface IScholarshipImportCenterGateway {
  listBatches(filters?: { dataType?: string; limit?: number }): Promise<ScholarshipImportCenterBatchRecord[]>;
  listRecords(filters?: {
    batchId?: string;
    status?: string;
    dataType?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ScholarshipImportCenterRecordPage>;
  getRecordById(id: string): Promise<ScholarshipImportCenterStoredRecord | null>;
  getBatchById(id: string): Promise<ScholarshipImportCenterBatchRecord | null>;
}

export interface ScholarshipImportReviewDecisionRequest {
  recordId: string;
  action: ScholarshipImportReviewAction;
  actorId: string;
  reason?: string;
  correlationId?: string;
}

export interface ScholarshipImportReviewDecisionResult {
  decisionId: string;
  recordId: string;
  action: ScholarshipImportReviewAction;
  recordedAt: string;
}

/**
 * WP12-7 command boundary. No default implementation is supplied because the current
 * schema has no append-only Scholarship import-review decision persistence.
 */
export interface IScholarshipImportReviewDecisionPort {
  recordDecision(input: ScholarshipImportReviewDecisionRequest): Promise<ScholarshipImportReviewDecisionResult>;
}

export interface ScholarshipImportTransferRequest {
  recordId: string;
  actorId: string;
  correlationId?: string;
}

export interface ScholarshipImportTransferResult {
  recordId: string;
  scholarshipId: string;
  transferredAt: string;
  publicationStatus: 'DRAFT';
}

/** WP12-10 will provide the atomic transfer implementation. */
export interface IScholarshipImportTransferPort {
  transfer(input: ScholarshipImportTransferRequest): Promise<ScholarshipImportTransferResult>;
}

export interface ScholarshipImportCenterQuery {
  batchId?: string;
  status?: string;
  operationalClass?: ScholarshipImportOperationalClass;
  page?: number;
  pageSize?: number;
}

export interface ScholarshipImportCenterCanonicalSummary {
  state: ScholarshipImportCanonicalScreeningState;
  unresolvedCount: number;
  ambiguousCount: number;
  reviewRequiredCount: number;
}

export interface ScholarshipImportCenterRecordView {
  id: string;
  batchId: string;
  sourceSystem: string;
  sourceRowNumber: number | null;
  importStatus: string;
  operationalClass: ScholarshipImportOperationalClass;
  rawPayload: unknown;
  parseState: 'VALID' | 'INVALID';
  parseIssues: string[];
  rawSourceTitle: string | null;
  cleanedScholarshipName: string | null;
  sourceAliases: string[];
  completeness: {
    state: ScholarshipCompletenessState | 'NOT_AVAILABLE';
    missingFields: string[];
    identityMissingFields: string[];
    coreMissingFields: string[];
    optionalMissingFields: string[];
    identityReady: boolean;
  };
  dedupe: {
    duplicateKey: string | null;
    state: 'NOT_CHECKED' | 'NEW' | 'DUPLICATE' | 'UPDATE' | 'COLLISION_REVIEW';
    matchIds: string[];
    requiresReview: boolean;
  };
  verification: {
    state: ScholarshipImportVerificationState;
    sourceTraceable: boolean;
  };
  canonical: ScholarshipImportCenterCanonicalSummary;
  reviewReasons: string[];
  readyToTransfer: boolean;
  transferred: boolean;
  promotedEntityId: string | null;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
}

export interface ScholarshipImportCenterScanResult {
  data: ScholarshipImportCenterRecordView[];
  countsExact: boolean;
  scanTruncated: boolean;
  scannedRecords: number;
  sourceTotal: number;
}

export interface ScholarshipImportCenterOverview {
  operationalClass: ScholarshipImportOperationalClass;
  totalIncoming: number;
  newRecords: number;
  duplicateRecords: number;
  updateRecords: number;
  incomplete: number;
  conflicts: number;
  needsReview: number;
  readyToTransfer: number;
  failedProcessing: number;
  transferred: number;
  countsExact: boolean;
  scanTruncated: boolean;
  scannedRecords: number;
  sourceTotal: number;
  capabilities: {
    reviewDecisionPersistence: 'CONFIGURED' | 'NOT_CONFIGURED';
    atomicTransfer: 'CONFIGURED' | 'DEFERRED_TO_WP12_10';
    sourceRegistryRuntime: 'PENDING_RUNTIME';
  };
}

export interface ScholarshipImportCenterDiffField {
  field: string;
  currentValue: unknown;
  incomingValue: unknown;
  state: 'ADDITION' | 'NO_CHANGE' | 'CONFLICT' | 'MISSING_IN_IMPORT';
}

export interface ScholarshipImportCenterDiff {
  recordId: string;
  duplicateKey: string | null;
  existingScholarshipId: string | null;
  fields: ScholarshipImportCenterDiffField[];
  mutationPerformed: false;
}

export type ScholarshipRepositoryForImportCenter = IScholarshipRepository;
