import { AuditRecord } from '../aggregates/AuditRecord';
import { ISpecification } from '@manaratak/core';

export interface IAuditRecordRepository {
  save(record: AuditRecord): Promise<void>;
  findBy(specification: ISpecification<AuditRecord>): Promise<AuditRecord[]>;
}
