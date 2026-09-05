import { ISpecification } from '@manaratak/core';
import { IAuditRecordRepository, AuditRecord, ContextMetadata } from '@manaratak/domain';
import { AuditSecretSanitizer } from './AuditSecretSanitizer';

export class InMemoryAuditRecordRepository implements IAuditRecordRepository {
  private readonly records: Map<string, AuditRecord> = new Map();

  async save(record: AuditRecord): Promise<void> {
    const sanitizedData = AuditSecretSanitizer.sanitize(record.getContextMetadata().getData());
    const sanitizedContext = ContextMetadata.create(sanitizedData);

    const sanitizedRecord = AuditRecord.create(
      record.getId(),
      record.getReference(),
      record.getAction(),
      record.getCategory(),
      record.getSeverity(),
      record.getActor(),
      record.getTarget(),
      record.getSource(),
      record.getTimestamp(),
      sanitizedContext,
      record.getComplianceMetadata(),
      record.getCorrelationReference(),
      record.getTraceReference(),
      record.getChainReference(),
      record.getRetentionMetadata()
    );

    if (record.getLifecycleState() === 'ARCHIVED') {
      sanitizedRecord.archive();
    }
    sanitizedRecord.clearEvents();

    this.records.set(record.getId().getValue(), sanitizedRecord);
  }

  async listRecentImportOperations(limit = 20): Promise<Array<{
    id: string;
    actorId: string;
    action: string;
    severity: string;
    targetId: string;
    timestamp: Date;
    method?: string;
    path?: string;
    httpStatus?: number;
    result: 'SUCCESS' | 'FAILURE';
  }>> {
    const safeLimit = Math.min(50, Math.max(1, Math.trunc(limit || 20)));
    return Array.from(this.records.values())
      .map((record) => {
        const context = record.getContextMetadata().getData() as Record<string, unknown>;
        const requestedPath = String(context.requestedPath ?? context.path ?? '');
        const httpStatus = Number(context.httpStatus ?? context.statusCode ?? 0);
        return { record, context, requestedPath, httpStatus };
      })
      .filter(({ record, requestedPath }) =>
        record.getCategory().getValue() === 'CRITICAL_MUTATION' &&
        record.getAction().getValue() === 'MUTATION_OUTCOME_RECORDED' &&
        requestedPath.includes('/admin/imports'))
      .sort((a, b) => b.record.getTimestamp().getValue().getTime() - a.record.getTimestamp().getValue().getTime())
      .slice(0, safeLimit)
      .map(({ record, context, requestedPath, httpStatus }) => ({
        id: record.getId().getValue(),
        actorId: record.getActor().getActorId(),
        action: String(context.operation ?? context.action ?? record.getAction().getValue()),
        severity: record.getSeverity().getValue(),
        targetId: record.getTarget().getTargetId(),
        timestamp: record.getTimestamp().getValue(),
        method: context.requestedMethod ? String(context.requestedMethod) : undefined,
        path: requestedPath || undefined,
        httpStatus: Number.isFinite(httpStatus) && httpStatus > 0 ? httpStatus : undefined,
        result: Number.isFinite(httpStatus) && httpStatus >= 400 ? 'FAILURE' : 'SUCCESS',
      }));
  }

  async findBy(specification: ISpecification<AuditRecord>): Promise<AuditRecord[]> {
    const allRecords = Array.from(this.records.values());
    return allRecords.filter(record => specification.isSatisfiedBy(record));
  }
}
