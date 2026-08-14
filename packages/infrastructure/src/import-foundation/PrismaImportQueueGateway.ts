import type { PrismaClient } from '@prisma/client';
import { ImportCheckpoint, ImportJobStatus } from '@manaratak/domain';
import type {
  CancelImportJobCommand, DeadLetterImportRecordDto, EnqueueImportJobCommand,
  IImportQueueGateway, ImportJobStatusDto, PauseImportJobCommand, ReplayImportJobCommand,
  ResumeImportJobCommand,
} from '@manaratak/application';

export class PrismaImportQueueGateway implements IImportQueueGateway {
  public readonly persistenceClassification = 'DURABLE' as const;
  public constructor(private readonly prisma: PrismaClient) {
    if (!prisma) throw new Error('IMPORT_QUEUE_DURABLE_PERSISTENCE_REQUIRED');
  }

  async enqueueImportJob(command: EnqueueImportJobCommand): Promise<string> {
    const updated = await this.prisma.importBatch.updateMany({ where: { id: command.batchId }, data: { batchStatus: ImportJobStatus.QUEUED } });
    if (updated.count !== 1) throw new Error(`IMPORT_BATCH_NOT_FOUND:${command.batchId}`);
    return command.batchId;
  }

  async getJobStatus(batchId: string): Promise<ImportJobStatusDto | null> {
    const batch = await this.prisma.importBatch.findUnique({ where: { id: batchId } });
    if (!batch) return null;
    const checkpoint = await this.prisma.importRecord.findFirst({ where: { batchId, status: 'CHECKPOINT' }, orderBy: { createdAt: 'desc' } });
    const deadLetter = await this.prisma.importRecord.findFirst({ where: { batchId, status: 'DLQ' }, orderBy: { createdAt: 'desc' } });
    const completed = batch.processedRecords + batch.failedRecords;
    return {
      batchId, status: batch.batchStatus as ImportJobStatus,
      progress: batch.totalRecords > 0 ? Math.min(100, Math.round((completed / batch.totalRecords) * 100)) : 0,
      processedRecords: batch.processedRecords, failedRecords: batch.failedRecords,
      totalRecords: batch.totalRecords, createdAt: batch.createdAt, updatedAt: batch.updatedAt,
      checkpoint: checkpoint ? this.recordPayload(checkpoint.rawPayload) : undefined,
      lastError: deadLetter?.processingNotes ?? undefined,
    };
  }

  pauseJob(command: PauseImportJobCommand): Promise<boolean> { return this.transition(command.batchId, [ImportJobStatus.QUEUED, ImportJobStatus.RUNNING], ImportJobStatus.PAUSED); }
  resumeJob(command: ResumeImportJobCommand): Promise<boolean> { return this.transition(command.batchId, [ImportJobStatus.PAUSED, ImportJobStatus.RESUMING], ImportJobStatus.QUEUED); }
  cancelJob(command: CancelImportJobCommand): Promise<boolean> { return this.transition(command.batchId, [ImportJobStatus.QUEUED, ImportJobStatus.RUNNING, ImportJobStatus.PAUSED, ImportJobStatus.RESUMING, ImportJobStatus.CANCELLING], ImportJobStatus.CANCELLED); }
  markJobRunning(batchId: string): Promise<boolean> { return this.transition(batchId, [ImportJobStatus.QUEUED, ImportJobStatus.RESUMING], ImportJobStatus.RUNNING); }
  markJobCompleted(batchId: string): Promise<boolean> { return this.transition(batchId, [ImportJobStatus.RUNNING], ImportJobStatus.COMPLETED, { processedRecords: undefined }); }
  markJobFailed(batchId: string, _reason: string): Promise<boolean> { return this.transition(batchId, [ImportJobStatus.RUNNING, ImportJobStatus.FAILED_RETRYABLE], ImportJobStatus.FAILED_PERMANENT); }

  async replayJob(command: ReplayImportJobCommand): Promise<boolean> {
    const data: any = { batchStatus: ImportJobStatus.QUEUED };
    if (!command.fromCheckpoint) Object.assign(data, { processedRecords: 0, failedRecords: 0 });
    const updated = await this.prisma.importBatch.updateMany({
      where: { id: command.batchId, batchStatus: { in: [ImportJobStatus.COMPLETED, ImportJobStatus.PARTIALLY_COMPLETED, ImportJobStatus.FAILED_PERMANENT, ImportJobStatus.DLQ, ImportJobStatus.CANCELLED] } }, data,
    });
    return updated.count === 1;
  }

  async recordCheckpoint(batchId: string, checkpoint: ImportCheckpoint): Promise<void> {
    const value = checkpoint.toJSON();
    await this.prisma.$transaction([
      this.prisma.importRecord.create({ data: { batchId, status: 'CHECKPOINT', rawPayload: value as any, processingNotes: 'Durable import checkpoint' } }),
      this.prisma.importBatch.update({ where: { id: batchId }, data: { processedRecords: checkpoint.processedRecords, failedRecords: checkpoint.failedRecords } }),
    ]);
  }

  async moveToDeadLetter(dto: DeadLetterImportRecordDto): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.importRecord.create({ data: { id: dto.recordId, batchId: dto.batchId, status: 'DLQ', rawPayload: { payload: dto.payload ?? null, failedAt: dto.failedAt.toISOString(), errorCode: dto.errorCode ?? 'IMPORT_FAILED' }, processingNotes: this.sanitize(dto.reason) } }),
      this.prisma.importBatch.update({ where: { id: dto.batchId }, data: { batchStatus: ImportJobStatus.DLQ, failedRecords: { increment: 1 } } }),
    ]);
  }

  private async transition(batchId: string, from: ImportJobStatus[], to: ImportJobStatus, extra: Record<string, unknown> = {}): Promise<boolean> {
    const data = Object.fromEntries(Object.entries({ batchStatus: to, ...extra }).filter(([, value]) => value !== undefined));
    const updated = await this.prisma.importBatch.updateMany({ where: { id: batchId, batchStatus: { in: from } }, data });
    return updated.count === 1;
  }

  private recordPayload(value: unknown): Record<string, unknown> | undefined { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : undefined; }
  private sanitize(value: string): string { return value.replace(/(password|token|secret|authorization)\s*[=:]\s*\S+/gi, '$1=[REDACTED]').slice(0, 1000); }
}
