export enum OutboxProcessingState {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED'
}

export interface OutboxAggregateIdentity {
  domain: string;
  aggregateType: string;
  aggregateId: string;
}

export interface SanitizedOutboxFailure {
  code: string;
  message: string;
  failedAt: Date;
}

export interface TransactionalOutboxEntry {
  id: string;
  eventType: string;
  domain: string;
  aggregate?: OutboxAggregateIdentity;
  payload: Readonly<Record<string, unknown>>;
  metadata: Readonly<Record<string, unknown>>;
  correlationId?: string;
  causationId?: string;
  createdAt: Date;
  availableAt: Date;
  state: OutboxProcessingState;
  attempts: number;
  processedAt?: Date;
  lastError?: SanitizedOutboxFailure;
}

/** Opaque handle supplied by a future persistence unit of work. */
export interface AtomicPersistenceContext {
  readonly boundaryId: string;
}

export interface OutboxClaimRequest {
  workerId: string;
  batchSize: number;
  claimUntil: Date;
  now: Date;
}

export interface ITransactionalOutboxStore {
  appendInTransaction(
    entry: TransactionalOutboxEntry,
    transaction: AtomicPersistenceContext
  ): Promise<void>;
  claimPendingBatch(request: OutboxClaimRequest): Promise<TransactionalOutboxEntry[]>;
  markProcessed(id: string, processedAt: Date): Promise<void>;
  markFailed(
    id: string,
    failure: SanitizedOutboxFailure,
    nextAvailableAt: Date
  ): Promise<void>;
}

export interface OutboxDeliveryContext {
  /** Consumers must use this stable value as their idempotency key. */
  idempotencyKey: string;
}

export interface IOutboxDeliveryGateway {
  deliver(
    entry: TransactionalOutboxEntry,
    context: OutboxDeliveryContext
  ): Promise<void>;
}

export interface OutboxDispatchRequest {
  workerId: string;
  batchSize: number;
  claimDurationMs: number;
  maxAttempts: number;
  baseBackoffMs: number;
  maxBackoffMs: number;
}

export interface OutboxDispatchResult {
  claimed: number;
  processed: number;
  failed: number;
  exhausted: number;
}

export interface ITransactionalOutboxDispatcher {
  dispatchBatch(request: OutboxDispatchRequest): Promise<OutboxDispatchResult>;
}
