import { ImportCheckpoint, ImportJobStatus } from '@manaratak/domain';
import {
  IImportQueueGateway,
  EnqueueImportJobCommand,
  ImportJobStatusDto,
  PauseImportJobCommand,
  ResumeImportJobCommand,
  CancelImportJobCommand,
  ReplayImportJobCommand,
  DeadLetterImportRecordDto,
  ClaimImportJobCommand,
  ImportJobLease,
  FailImportJobCommand,
} from '@manaratak/application';

export class InMemoryImportQueueGateway implements IImportQueueGateway {
  public readonly persistenceClassification = 'DEVELOPMENT_ONLY' as const;
  private readonly jobs = new Map<string, ImportJobStatusDto>();
  private readonly deadLetters = new Map<string, DeadLetterImportRecordDto[]>();
  private readonly leases = new Map<string, ImportJobLease>();

  async enqueueImportJob(command: EnqueueImportJobCommand): Promise<string> {
    const now = new Date();
    const existing = this.jobs.get(command.batchId);
    if (existing && existing.status !== ImportJobStatus.CREATED) return command.batchId;

    const jobStatus: ImportJobStatusDto = {
      batchId: command.batchId,
      status: ImportJobStatus.QUEUED,
      progress: 0,
      processedRecords: 0,
      failedRecords: 0,
      totalRecords: existing?.totalRecords,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      checkpoint: undefined,
      attemptCount: existing?.attemptCount ?? 0,
      availableAt: now,
    };

    this.jobs.set(command.batchId, jobStatus);
    return command.batchId;
  }

  async getJobStatus(batchId: string): Promise<ImportJobStatusDto | null> {
    const job = this.jobs.get(batchId);
    if (!job) {
      return null;
    }
    return {
      ...job,
      checkpoint: job.checkpoint ? { ...job.checkpoint } : undefined,
    };
  }

  async pauseJob(command: PauseImportJobCommand): Promise<boolean> {
    const job = this.jobs.get(command.batchId);
    if (!job) {
      return false;
    }

    if (job.status !== ImportJobStatus.QUEUED && job.status !== ImportJobStatus.RUNNING) {
      return false;
    }

    job.status = ImportJobStatus.PAUSED;
    job.updatedAt = new Date();
    if (command.reason) {
      job.lastError = command.reason;
    }

    return true;
  }

  async resumeJob(command: ResumeImportJobCommand): Promise<boolean> {
    const job = this.jobs.get(command.batchId);
    if (!job) {
      return false;
    }

    // Allows transition from PAUSED or RESUMING to QUEUED
    if (job.status !== ImportJobStatus.PAUSED && job.status !== ImportJobStatus.RESUMING) {
      return false;
    }

    job.status = ImportJobStatus.QUEUED;
    job.updatedAt = new Date();

    return true;
  }

  async cancelJob(command: CancelImportJobCommand): Promise<boolean> {
    const job = this.jobs.get(command.batchId);
    if (!job) {
      return false;
    }

    const cancellableStatuses = [
      ImportJobStatus.QUEUED,
      ImportJobStatus.RUNNING,
      ImportJobStatus.PAUSED,
      ImportJobStatus.RESUMING,
      ImportJobStatus.CANCELLING,
    ];

    if (!cancellableStatuses.includes(job.status)) {
      return false;
    }

    job.status = ImportJobStatus.CANCELLED;
    job.updatedAt = new Date();
    if (command.reason) {
      job.lastError = command.reason;
    }

    return true;
  }

  async replayJob(command: ReplayImportJobCommand): Promise<boolean> {
    const job = this.jobs.get(command.batchId);
    if (!job) {
      return false;
    }

    const terminalStatuses = [
      ImportJobStatus.COMPLETED,
      ImportJobStatus.PARTIALLY_COMPLETED,
      ImportJobStatus.FAILED_PERMANENT,
      ImportJobStatus.DLQ,
      ImportJobStatus.CANCELLED,
    ];

    if (!terminalStatuses.includes(job.status)) {
      return false;
    }

    job.status = ImportJobStatus.QUEUED;
    job.updatedAt = new Date();

    if (command.fromCheckpoint) {
      // Retain existing checkpoint & progress counters
    } else {
      job.checkpoint = undefined;
      job.processedRecords = 0;
      job.failedRecords = 0;
      job.progress = 0;
    }

    return true;
  }

  async recordCheckpoint(batchId: string, checkpoint: ImportCheckpoint): Promise<void> {
    const job = this.jobs.get(batchId);
    if (!job) {
      throw new Error(`Import job with batchId '${batchId}' not found`);
    }

    job.checkpoint = checkpoint.toJSON();
    job.processedRecords = checkpoint.processedRecords;
    job.failedRecords = checkpoint.failedRecords;

    if (job.totalRecords && job.totalRecords > 0) {
      const processedTotal = job.processedRecords + job.failedRecords;
      job.progress = Math.min(100, Math.round((processedTotal / job.totalRecords) * 100));
    } else {
      job.progress = 0;
    }

    job.updatedAt = new Date();
  }

  async moveToDeadLetter(dto: DeadLetterImportRecordDto): Promise<void> {
    const records = this.deadLetters.get(dto.batchId) ?? [];
    records.push({ ...dto });
    this.deadLetters.set(dto.batchId, records);

    const job = this.jobs.get(dto.batchId);
    const now = new Date();

    if (job) {
      job.status = ImportJobStatus.DLQ;
      job.lastError = dto.reason;
      job.updatedAt = now;
    } else {
      this.jobs.set(dto.batchId, {
        batchId: dto.batchId,
        status: ImportJobStatus.DLQ,
        progress: 0,
        processedRecords: 0,
        failedRecords: 1,
        createdAt: now,
        updatedAt: now,
        lastError: dto.reason,
      });
    }
  }

  async markJobRunning(batchId: string): Promise<boolean> {
    const job = this.jobs.get(batchId);
    if (!job) {
      return false;
    }

    if (job.status !== ImportJobStatus.QUEUED && job.status !== ImportJobStatus.RESUMING) {
      return false;
    }

    job.status = ImportJobStatus.RUNNING;
    job.updatedAt = new Date();
    return true;
  }

  async markJobCompleted(batchId: string): Promise<boolean> {
    const job = this.jobs.get(batchId);
    if (!job) {
      return false;
    }

    if (job.status !== ImportJobStatus.RUNNING) {
      return false;
    }

    job.status = ImportJobStatus.COMPLETED;
    job.progress = 100;
    job.updatedAt = new Date();
    return true;
  }

  async markJobFailed(batchId: string, reason: string): Promise<boolean> {
    const job = this.jobs.get(batchId);
    if (!job) {
      return false;
    }

    if (job.status !== ImportJobStatus.RUNNING && job.status !== ImportJobStatus.FAILED_RETRYABLE) {
      return false;
    }

    job.status = ImportJobStatus.FAILED_PERMANENT;
    job.lastError = reason;
    job.updatedAt = new Date();
    return true;
  }

  async claimNextJob(command: ClaimImportJobCommand): Promise<ImportJobLease | null> {
    const now = command.now ?? new Date();
    const candidate = [...this.jobs.values()].find(
      (job) =>
        (job.status === ImportJobStatus.QUEUED ||
          job.status === ImportJobStatus.FAILED_RETRYABLE) &&
        (!job.availableAt || job.availableAt <= now) &&
        (!job.claimUntil || job.claimUntil < now),
    );
    if (!candidate) return null;
    const lease: ImportJobLease = {
      batchId: candidate.batchId,
      workerId: command.workerId,
      attempt: (candidate.attemptCount ?? 0) + 1,
      claimUntil: new Date(now.getTime() + command.leaseDurationMs),
    };
    candidate.status = ImportJobStatus.RUNNING;
    candidate.attemptCount = lease.attempt;
    candidate.claimedBy = lease.workerId;
    candidate.claimUntil = lease.claimUntil;
    candidate.updatedAt = now;
    this.leases.set(candidate.batchId, lease);
    return { ...lease };
  }

  async heartbeat(
    lease: ImportJobLease,
    leaseDurationMs: number,
    now = new Date(),
  ): Promise<ImportJobLease | null> {
    const current = this.leases.get(lease.batchId);
    if (!current || current.workerId !== lease.workerId || current.claimUntil < now) return null;
    const renewed = { ...current, claimUntil: new Date(now.getTime() + leaseDurationMs) };
    this.leases.set(lease.batchId, renewed);
    const job = this.jobs.get(lease.batchId);
    if (job) job.claimUntil = renewed.claimUntil;
    return { ...renewed };
  }

  async completeClaimedJob(lease: ImportJobLease): Promise<boolean> {
    const current = this.leases.get(lease.batchId);
    const job = this.jobs.get(lease.batchId);
    if (!current || !job || current.workerId !== lease.workerId) return false;
    job.status = ImportJobStatus.COMPLETED;
    job.progress = 100;
    job.claimedBy = undefined;
    job.claimUntil = undefined;
    job.updatedAt = new Date();
    this.leases.delete(lease.batchId);
    return true;
  }

  async failClaimedJob(
    command: FailImportJobCommand,
  ): Promise<'RETRY_SCHEDULED' | 'DLQ' | 'LEASE_LOST'> {
    const current = this.leases.get(command.lease.batchId);
    const job = this.jobs.get(command.lease.batchId);
    if (!current || !job || current.workerId !== command.lease.workerId) return 'LEASE_LOST';
    const policy = command.retryPolicy;
    const retryable = !command.errorCode || policy.retryableErrorCodes.includes(command.errorCode);
    const exhausted =
      command.lease.attempt >= Math.min(policy.maxAttempts, policy.dlqAfterAttempts);
    const now = command.now ?? new Date();
    job.lastError = command.reason;
    job.claimedBy = undefined;
    job.claimUntil = undefined;
    job.updatedAt = now;
    this.leases.delete(command.lease.batchId);
    if (!retryable || exhausted) {
      job.status = ImportJobStatus.DLQ;
      return 'DLQ';
    }
    const exponent =
      policy.backoffStrategy === 'exponential' ? Math.max(0, command.lease.attempt - 1) : 0;
    job.availableAt = new Date(
      now.getTime() + Math.min(policy.maxDelayMs, policy.initialDelayMs * Math.pow(2, exponent)),
    );
    job.status = ImportJobStatus.FAILED_RETRYABLE;
    return 'RETRY_SCHEDULED';
  }

  // Testing & inspection helper methods
  getDeadLetters(batchId: string): DeadLetterImportRecordDto[] {
    return [...(this.deadLetters.get(batchId) ?? [])];
  }

  setTotalRecords(batchId: string, totalRecords: number): void {
    const job = this.jobs.get(batchId);
    if (job) {
      job.totalRecords = totalRecords;
    }
  }

  setStatusForTesting(batchId: string, status: ImportJobStatus): void {
    const job = this.jobs.get(batchId);
    if (job) {
      job.status = status;
    }
  }

  clear(): void {
    this.jobs.clear();
    this.deadLetters.clear();
    this.leases.clear();
  }
}
