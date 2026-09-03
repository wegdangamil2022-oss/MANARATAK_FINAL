import {
  IOutboxDeliveryGateway,
  ITransactionalOutboxDispatcher,
  ITransactionalOutboxStore,
  OutboxDispatchRequest,
  OutboxDispatchResult,
  SanitizedOutboxFailure,
} from '@manaratak/domain';

export class TransactionalOutboxDispatcher implements ITransactionalOutboxDispatcher {
  public constructor(
    private readonly store: ITransactionalOutboxStore,
    private readonly delivery: IOutboxDeliveryGateway,
    private readonly now: () => Date = () => new Date(),
  ) {}

  public async dispatchBatch(request: OutboxDispatchRequest): Promise<OutboxDispatchResult> {
    this.validate(request);
    const startedAt = this.now();
    const entries = await this.store.claimPendingBatch({
      workerId: request.workerId,
      batchSize: request.batchSize,
      now: startedAt,
      claimUntil: new Date(startedAt.getTime() + request.claimDurationMs),
      domain: request.domain,
      eventTypes: request.eventTypes,
    });
    const result: OutboxDispatchResult = { claimed: entries.length, processed: 0, failed: 0, exhausted: 0 };

    for (const entry of entries) {
      try {
        await this.delivery.deliver(entry, { idempotencyKey: entry.id });
        await this.store.markProcessed(entry.id, this.now());
        result.processed += 1;
      } catch (error) {
        const attempt = entry.attempts + 1;
        const exhausted = attempt >= request.maxAttempts;
        const failedAt = this.now();
        await this.store.markFailed(
          entry.id,
          this.sanitizeFailure(error, failedAt),
          exhausted ? new Date('9999-12-31T23:59:59.999Z') : new Date(failedAt.getTime() + this.backoff(attempt, request)),
        );
        result.failed += 1;
        if (exhausted) result.exhausted += 1;
      }
    }
    return result;
  }

  private backoff(attempt: number, request: OutboxDispatchRequest): number {
    return Math.min(request.baseBackoffMs * 2 ** Math.max(0, attempt - 1), request.maxBackoffMs);
  }

  private sanitizeFailure(error: unknown, failedAt: Date): SanitizedOutboxFailure {
    const raw = error instanceof Error ? error.message : 'Delivery failed';
    return {
      code: 'OUTBOX_DELIVERY_FAILED',
      message: raw.replace(/(password|token|secret|authorization)\s*[=:]\s*\S+/gi, '$1=[REDACTED]').slice(0, 500),
      failedAt,
    };
  }

  private validate(request: OutboxDispatchRequest): void {
    if (!request.workerId.trim()) throw new Error('OUTBOX_WORKER_ID_REQUIRED');
    for (const [name, value] of Object.entries(request).filter(([key]) => !['workerId', 'domain', 'eventTypes'].includes(key))) {
      if (!Number.isInteger(value) || Number(value) <= 0) throw new Error(`OUTBOX_INVALID_${name.toUpperCase()}`);
    }
    if (request.domain !== undefined && !request.domain.trim()) throw new Error('OUTBOX_INVALID_DOMAIN');
    if (request.eventTypes !== undefined && (request.eventTypes.length === 0 || request.eventTypes.some(value => !value.trim()))) {
      throw new Error('OUTBOX_INVALID_EVENT_TYPES');
    }
  }
}
