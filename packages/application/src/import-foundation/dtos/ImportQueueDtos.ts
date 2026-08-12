import { ImportJobStatus, ImportTargetDomain } from '@manaratak/domain';

export interface EnqueueImportJobCommand {
  batchId: string;
  targetDomain: ImportTargetDomain;
  sourceSystem: string;
  priority?: number;
  metadata?: Record<string, unknown>;
}

export interface ImportJobStatusDto {
  batchId: string;
  status: ImportJobStatus;
  progress: number;
  processedRecords: number;
  failedRecords: number;
  totalRecords?: number;
  createdAt: Date;
  updatedAt: Date;
  lastError?: string;
  checkpoint?: Record<string, unknown>;
}

export interface PauseImportJobCommand {
  batchId: string;
  reason?: string;
}

export interface ResumeImportJobCommand {
  batchId: string;
}

export interface CancelImportJobCommand {
  batchId: string;
  reason?: string;
}

export interface ReplayImportJobCommand {
  batchId: string;
  fromCheckpoint?: boolean;
}

export interface DeadLetterImportRecordDto {
  recordId?: string;
  batchId: string;
  failedAt: Date;
  reason: string;
  errorCode?: string;
  payload?: unknown;
}
