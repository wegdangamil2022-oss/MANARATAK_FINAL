import { adminApiClient } from './client';

export type ScholarshipImportOperationalClass =
  | 'REAL'
  | 'TEST'
  | 'DEMO'
  | 'ARCHIVED'
  | 'UNCLASSIFIED';

export type ScholarshipImportDuplicateState =
  | 'NOT_CHECKED'
  | 'NEW'
  | 'DUPLICATE'
  | 'UPDATE'
  | 'COLLISION_REVIEW';

export type ScholarshipImportReviewAction = 'MERGE' | 'KEEP_CURRENT' | 'SPLIT';

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
    state: 'INCOMPLETE' | 'NEEDS_REVIEW' | 'COMPLETE' | 'NOT_AVAILABLE';
    missingFields: string[];
    identityMissingFields: string[];
    coreMissingFields: string[];
    optionalMissingFields: string[];
    identityReady: boolean;
  };
  dedupe: {
    duplicateKey: string | null;
    state: ScholarshipImportDuplicateState;
    matchIds: string[];
    requiresReview: boolean;
  };
  verification: {
    state: 'PENDING' | 'VERIFIED' | 'FAILED';
    sourceTraceable: boolean;
  };
  canonical: {
    state: 'NOT_EXECUTED' | 'CLEAR' | 'REVIEW_REQUIRED';
    unresolvedCount: number;
    ambiguousCount: number;
    reviewRequiredCount: number;
  };
  reviewReasons: string[];
  readyToTransfer: boolean;
  transferred: boolean;
  promotedEntityId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
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

export interface ScholarshipImportCenterSources {
  registryState: 'OBSERVED_FROM_PHASE6_BATCHES';
  sourceRegistryRuntime: 'PENDING_RUNTIME';
  observedBatchLimit: 100;
  completeRegistry: false;
  sources: Array<{
    sourceSystem: string;
    batches: number;
    totalRecords: number;
    lastBatchAt: string | null;
  }>;
}

export interface ScholarshipImportCenterRecordList {
  data: ScholarshipImportCenterRecordView[];
  sourceTotal: number;
  filteredTotal: number;
  page: number;
  pageSize: number;
  countsExact: boolean;
  scanTruncated: boolean;
  scannedRecords: number;
}

export interface ScholarshipImportCenterScanResult {
  data: ScholarshipImportCenterRecordView[];
  countsExact: boolean;
  scanTruncated: boolean;
  scannedRecords: number;
  sourceTotal: number;
}

export interface ScholarshipImportCenterDiff {
  recordId: string;
  duplicateKey: string | null;
  existingScholarshipId: string | null;
  fields: Array<{
    field: string;
    currentValue: unknown;
    incomingValue: unknown;
    state: 'ADDITION' | 'NO_CHANGE' | 'CONFLICT' | 'MISSING_IN_IMPORT';
  }>;
  mutationPerformed: false;
}

export interface ScholarshipImportCenterMergeProposal {
  recordId: string;
  duplicateKey: string | null;
  duplicateState: ScholarshipImportDuplicateState;
  requiresReview: boolean;
  suggestedActions: ScholarshipImportReviewAction[];
  diff: ScholarshipImportCenterDiff;
  automaticMergePerformed: false;
}

function queryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : '';
}

const BASE = '/admin/scholarships/import-center';

export const scholarshipImportCenterApi = {
  overview(operationalClass: ScholarshipImportOperationalClass) {
    return adminApiClient.request<ScholarshipImportCenterOverview>(
      `${BASE}/overview${queryString({ operationalClass })}`,
    );
  },

  sources() {
    return adminApiClient.request<ScholarshipImportCenterSources>(`${BASE}/sources`);
  },

  records(input: {
    operationalClass: ScholarshipImportOperationalClass;
    page?: number;
    pageSize?: number;
    batchId?: string;
    status?: string;
  }) {
    return adminApiClient.request<ScholarshipImportCenterRecordList>(
      `${BASE}/records${queryString(input)}`,
    );
  },

  scan(
    segment:
      | 'screening'
      | 'duplicates'
      | 'missing-data'
      | 'verification'
      | 'review-queue'
      | 'ready-to-transfer'
      | 'history',
    operationalClass: ScholarshipImportOperationalClass,
  ) {
    return adminApiClient.request<ScholarshipImportCenterScanResult>(
      `${BASE}/${segment}${queryString({ operationalClass })}`,
    );
  },

  record(id: string) {
    return adminApiClient.request<ScholarshipImportCenterRecordView>(
      `${BASE}/records/${encodeURIComponent(id)}`,
    );
  },

  diff(id: string) {
    return adminApiClient.request<ScholarshipImportCenterDiff>(
      `${BASE}/records/${encodeURIComponent(id)}/diff`,
    );
  },

  mergeProposal(id: string) {
    return adminApiClient.request<ScholarshipImportCenterMergeProposal>(
      `${BASE}/records/${encodeURIComponent(id)}/merge-proposal`,
    );
  },

  decision(id: string, action: ScholarshipImportReviewAction, reason?: string) {
    return adminApiClient.request<{
      decisionId: string;
      recordId: string;
      action: ScholarshipImportReviewAction;
      recordedAt: string;
    }>(`${BASE}/records/${encodeURIComponent(id)}/decision`, {
      method: 'POST',
      body: JSON.stringify({ action, reason }),
    });
  },

  transfer(id: string) {
    return adminApiClient.request<{
      recordId: string;
      scholarshipId: string;
      transferredAt: string;
      publicationStatus: 'DRAFT';
    }>(`${BASE}/records/${encodeURIComponent(id)}/transfer`, {
      method: 'POST',
    });
  },
};
