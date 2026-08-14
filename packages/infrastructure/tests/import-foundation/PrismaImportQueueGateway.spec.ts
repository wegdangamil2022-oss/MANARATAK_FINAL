import { describe, expect, it, vi } from 'vitest';
import { ImportCheckpoint, ImportJobStatus } from '@manaratak/domain';
import { PrismaImportQueueGateway } from '../../src/import-foundation/PrismaImportQueueGateway';

describe('PrismaImportQueueGateway', () => {
  it('uses a conditional persisted transition and returns false on a stale state', async () => {
    const prisma = mockPrisma();
    prisma.importBatch.updateMany.mockResolvedValue({ count: 0 });
    const gateway = new PrismaImportQueueGateway(prisma as any);

    await expect(gateway.markJobRunning('batch-1')).resolves.toBe(false);
    expect(prisma.importBatch.updateMany).toHaveBeenCalledWith({
      where: { id: 'batch-1', batchStatus: { in: [ImportJobStatus.QUEUED, ImportJobStatus.RESUMING] } },
      data: { batchStatus: ImportJobStatus.RUNNING },
    });
  });

  it('persists checkpoint and counters in one Prisma transaction', async () => {
    const prisma = mockPrisma();
    const gateway = new PrismaImportQueueGateway(prisma as any);
    const checkpoint = ImportCheckpoint.create({ batchId: 'batch-1', stage: 'VALIDATE', chunkIndex: 2, recordOffset: 1000, processedRecords: 995, failedRecords: 5, acceptedRecordKeys: ['key-1'], updatedAt: new Date('2026-08-13T00:00:00Z') });

    await gateway.recordCheckpoint('batch-1', checkpoint);
    expect(prisma.importRecord.create).toHaveBeenCalledWith({ data: expect.objectContaining({ batchId: 'batch-1', status: 'CHECKPOINT' }) });
    expect(prisma.importBatch.update).toHaveBeenCalledWith({ where: { id: 'batch-1' }, data: { processedRecords: 995, failedRecords: 5 } });
    expect(prisma.$transaction).toHaveBeenCalledOnce();
  });

  it('persists sanitized dead-letter evidence and DLQ state atomically', async () => {
    const prisma = mockPrisma();
    const gateway = new PrismaImportQueueGateway(prisma as any);

    await gateway.moveToDeadLetter({ batchId: 'batch-1', failedAt: new Date(), reason: 'token=secret-value failed' });
    const record = prisma.importRecord.create.mock.calls[0][0].data;
    expect(record.processingNotes).toContain('token=[REDACTED]');
    expect(record.processingNotes).not.toContain('secret-value');
    expect(prisma.importBatch.update).toHaveBeenCalledWith({ where: { id: 'batch-1' }, data: { batchStatus: ImportJobStatus.DLQ, failedRecords: { increment: 1 } } });
    expect(prisma.$transaction).toHaveBeenCalledOnce();
  });

  it('reports persisted job status with the latest durable checkpoint', async () => {
    const prisma = mockPrisma();
    prisma.importBatch.findUnique.mockResolvedValue({ id: 'batch-1', batchStatus: 'RUNNING', totalRecords: 100, processedRecords: 40, failedRecords: 10, createdAt: new Date(), updatedAt: new Date() });
    prisma.importRecord.findFirst.mockResolvedValueOnce({ rawPayload: { recordOffset: 50 } }).mockResolvedValueOnce(null);
    const report = await new PrismaImportQueueGateway(prisma as any).getJobStatus('batch-1');
    expect(report?.progress).toBe(50);
    expect(report?.checkpoint).toEqual({ recordOffset: 50 });
  });
});

function mockPrisma() {
  const importBatch = { updateMany: vi.fn().mockResolvedValue({ count: 1 }), findUnique: vi.fn(), update: vi.fn().mockReturnValue(Promise.resolve({})) };
  const importRecord = { create: vi.fn().mockReturnValue(Promise.resolve({})), findFirst: vi.fn() };
  return { importBatch, importRecord, $transaction: vi.fn().mockResolvedValue([]) };
}
