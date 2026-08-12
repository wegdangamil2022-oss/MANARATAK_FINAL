import { ImportCheckpoint } from '@manaratak/domain';
import {
  EnqueueImportJobCommand,
  ImportJobStatusDto,
  PauseImportJobCommand,
  ResumeImportJobCommand,
  CancelImportJobCommand,
  ReplayImportJobCommand,
  DeadLetterImportRecordDto
} from '../dtos/ImportQueueDtos';

export interface IImportQueueGateway {
  enqueueImportJob(command: EnqueueImportJobCommand): Promise<string>;
  getJobStatus(batchId: string): Promise<ImportJobStatusDto | null>;
  pauseJob(command: PauseImportJobCommand): Promise<boolean>;
  resumeJob(command: ResumeImportJobCommand): Promise<boolean>;
  cancelJob(command: CancelImportJobCommand): Promise<boolean>;
  replayJob(command: ReplayImportJobCommand): Promise<boolean>;
  recordCheckpoint(batchId: string, checkpoint: ImportCheckpoint): Promise<void>;
  moveToDeadLetter(dto: DeadLetterImportRecordDto): Promise<void>;
  markJobRunning(batchId: string): Promise<boolean>;
  markJobCompleted(batchId: string): Promise<boolean>;
  markJobFailed(batchId: string, reason: string): Promise<boolean>;
}
