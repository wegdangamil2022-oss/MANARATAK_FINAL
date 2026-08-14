import type { Prisma, PrismaClient } from '@prisma/client';
import {
  AtomicPersistenceContext,
  ITransactionalOutboxStore,
  OutboxClaimRequest,
  OutboxProcessingState,
  SanitizedOutboxFailure,
  TransactionalOutboxEntry,
} from '@manaratak/domain';

type OutboxDelegate = {
  create(args: Record<string, unknown>): Promise<unknown>;
  findMany(args: Record<string, unknown>): Promise<any[]>;
  update(args: Record<string, unknown>): Promise<unknown>;
  updateMany(args: Record<string, unknown>): Promise<{ count: number }>;
};

type OutboxPrismaClient = Prisma.TransactionClient & { transactionalOutboxRecord: OutboxDelegate };

export interface PrismaAtomicPersistenceContext extends AtomicPersistenceContext {
  readonly transactionClient: Prisma.TransactionClient;
}

export class PrismaTransactionalOutboxStore implements ITransactionalOutboxStore {
  public constructor(private readonly prisma: PrismaClient) {}

  public async appendInTransaction(entry: TransactionalOutboxEntry, context: AtomicPersistenceContext): Promise<void> {
    const client = this.transactionClient(context);
    await client.transactionalOutboxRecord.create({ data: this.toCreateData(entry) });
  }

  public async claimPendingBatch(request: OutboxClaimRequest): Promise<TransactionalOutboxEntry[]> {
    return this.prisma.$transaction(async transaction => {
      const client = transaction as OutboxPrismaClient;
      const candidates = await client.transactionalOutboxRecord.findMany({
        where: {
          state: { in: [OutboxProcessingState.PENDING, OutboxProcessingState.FAILED] },
          availableAt: { lte: request.now },
          OR: [{ claimUntil: null }, { claimUntil: { lt: request.now } }],
        },
        orderBy: [{ availableAt: 'asc' }, { createdAt: 'asc' }],
        take: request.batchSize,
        select: { id: true },
      });
      if (candidates.length === 0) return [];
      const ids = candidates.map(record => record.id);
      await client.transactionalOutboxRecord.updateMany({
        where: { id: { in: ids }, OR: [{ claimUntil: null }, { claimUntil: { lt: request.now } }] },
        data: { state: OutboxProcessingState.PROCESSING, claimedBy: request.workerId, claimUntil: request.claimUntil },
      });
      const claimed = await client.transactionalOutboxRecord.findMany({
        where: { id: { in: ids }, state: OutboxProcessingState.PROCESSING, claimedBy: request.workerId },
        orderBy: [{ availableAt: 'asc' }, { createdAt: 'asc' }],
      });
      return claimed.map(record => this.toDomain(record));
    });
  }

  public async markProcessed(id: string, processedAt: Date): Promise<void> {
    await this.delegate().update({
      where: { id },
      data: { state: OutboxProcessingState.PROCESSED, processedAt, claimedBy: null, claimUntil: null },
    });
  }

  public async markFailed(id: string, failure: SanitizedOutboxFailure, nextAvailableAt: Date): Promise<void> {
    await this.delegate().update({
      where: { id },
      data: {
        state: OutboxProcessingState.FAILED,
        attempts: { increment: 1 },
        availableAt: nextAvailableAt,
        claimedBy: null,
        claimUntil: null,
        lastErrorCode: failure.code,
        lastErrorText: failure.message,
        lastFailedAt: failure.failedAt,
      },
    });
  }

  private delegate(client: PrismaClient | Prisma.TransactionClient = this.prisma): OutboxDelegate {
    const delegate = (client as unknown as { transactionalOutboxRecord?: OutboxDelegate }).transactionalOutboxRecord;
    if (!delegate) throw new Error('OUTBOX_PERSISTENCE_NOT_MIGRATED');
    return delegate;
  }

  private transactionClient(context: AtomicPersistenceContext): OutboxPrismaClient {
    const client = (context as Partial<PrismaAtomicPersistenceContext>).transactionClient;
    if (!client || !context.boundaryId) throw new Error('OUTBOX_ATOMIC_TRANSACTION_CONTEXT_REQUIRED');
    this.delegate(client);
    return client as OutboxPrismaClient;
  }

  private toCreateData(entry: TransactionalOutboxEntry): Record<string, unknown> {
    return {
      id: entry.id,
      eventType: entry.eventType,
      domain: entry.domain,
      aggregateType: entry.aggregate?.aggregateType,
      aggregateId: entry.aggregate?.aggregateId,
      payload: entry.payload,
      metadata: entry.metadata,
      correlationId: entry.correlationId,
      causationId: entry.causationId,
      createdAt: entry.createdAt,
      availableAt: entry.availableAt,
      state: entry.state,
      attempts: entry.attempts,
    };
  }

  private toDomain(record: any): TransactionalOutboxEntry {
    return {
      id: record.id,
      eventType: record.eventType,
      domain: record.domain,
      aggregate: record.aggregateType && record.aggregateId ? { domain: record.domain, aggregateType: record.aggregateType, aggregateId: record.aggregateId } : undefined,
      payload: record.payload as Record<string, unknown>,
      metadata: record.metadata as Record<string, unknown>,
      correlationId: record.correlationId ?? undefined,
      causationId: record.causationId ?? undefined,
      createdAt: record.createdAt,
      availableAt: record.availableAt,
      state: record.state as OutboxProcessingState,
      attempts: record.attempts,
      processedAt: record.processedAt ?? undefined,
      lastError: record.lastErrorCode && record.lastFailedAt ? { code: record.lastErrorCode, message: record.lastErrorText ?? '', failedAt: record.lastFailedAt } : undefined,
    };
  }
}
