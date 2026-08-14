import { AuditRecord } from '../aggregates/AuditRecord';
import { ISpecification } from '@manaratak/core';
import { AtomicPersistenceContext } from '../../event-foundation/outbox/TransactionalOutbox';

export interface IAuditRecordRepository {
  save(record: AuditRecord): Promise<void>;
  findBy(specification: ISpecification<AuditRecord>): Promise<AuditRecord[]>;
}

export interface ITransactionalAuditRecordRepository extends IAuditRecordRepository {
  saveInTransaction(record: AuditRecord, context: AtomicPersistenceContext): Promise<void>;
}
