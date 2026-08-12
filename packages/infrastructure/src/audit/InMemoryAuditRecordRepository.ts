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

  async findBy(specification: ISpecification<AuditRecord>): Promise<AuditRecord[]> {
    const allRecords = Array.from(this.records.values());
    return allRecords.filter(record => specification.isSatisfiedBy(record));
  }
}
