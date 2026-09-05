import { PrismaClient } from '@prisma/client';
import { ISpecification } from '@manaratak/core';
import {
  ITransactionalAuditRecordRepository,
  AtomicPersistenceContext,
  AuditRecord,
  AuditId,
  AuditReference,
  AuditAction,
  AuditCategory,
  AuditSeverity,
  ActorReference,
  TargetReference,
  SourceReference,
  AuditTimestamp,
  ContextMetadata,
  ComplianceMetadata,
  CorrelationReference,
  TraceReference,
  AuditChainReference,
  AuditRetentionMetadata,
  AuditLifecycleState
} from '@manaratak/domain';
import { AuditSecretSanitizer } from './AuditSecretSanitizer';
import type { PrismaAtomicPersistenceContext } from '../event-foundation/PrismaTransactionalOutboxStore';

export interface AuditRecordRow {
  id: string;
  reference: string;
  action: string;
  category: string;
  severity: string;
  actorId: string;
  actorType: string;
  targetId: string;
  targetType: string;
  source: string;
  timestamp: Date;
  contextMetadata: unknown;
  complianceMetadata: unknown | null;
  correlationReference: string | null;
  traceReference: string | null;
  chainReference: string | null;
  retentionPeriodInDays: number | null;
  retentionExpiresAt: Date | null;
  lifecycleState: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrismaAuditRecordDelegate {
  findUnique(args: { where: { id?: string; reference?: string } }): Promise<AuditRecordRow | null>;
  findMany(args?: { where?: unknown }): Promise<AuditRecordRow[]>;
  upsert(args: {
    where: { id: string };
    update: Omit<AuditRecordRow, 'createdAt' | 'updatedAt'>;
    create: Omit<AuditRecordRow, 'createdAt' | 'updatedAt'>;
  }): Promise<AuditRecordRow>;
}

export interface AuditPrismaClient {
  auditRecord: PrismaAuditRecordDelegate;
}

export class PrismaAuditRecordRepository implements ITransactionalAuditRecordRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private get client(): AuditPrismaClient {
    return this.prisma as unknown as AuditPrismaClient;
  }

  public mapToDomain(row: AuditRecordRow): AuditRecord {
    const id = AuditId.create(row.id);
    const reference = AuditReference.create(row.reference);
    const action = AuditAction.create(row.action);
    const category = AuditCategory.create(row.category);
    const severity = AuditSeverity.create(row.severity);
    const actor = ActorReference.create(row.actorId, row.actorType);
    const target = TargetReference.create(row.targetId, row.targetType);
    const source = SourceReference.create(row.source);
    const timestamp = AuditTimestamp.create(new Date(row.timestamp));

    const rawContext = typeof row.contextMetadata === 'object' && row.contextMetadata !== null
      ? (row.contextMetadata as Record<string, any>)
      : {};
    const sanitizedContext = AuditSecretSanitizer.sanitize(rawContext);
    const contextMetadata = ContextMetadata.create(sanitizedContext);

    const complianceMetadata = Array.isArray(row.complianceMetadata)
      ? ComplianceMetadata.create(row.complianceMetadata as string[])
      : undefined;

    const correlationReference = row.correlationReference
      ? CorrelationReference.create(row.correlationReference)
      : undefined;

    const traceReference = row.traceReference
      ? TraceReference.create(row.traceReference)
      : undefined;

    const chainReference = row.chainReference
      ? AuditChainReference.create(AuditReference.create(row.chainReference))
      : undefined;

    const retentionMetadata = row.retentionPeriodInDays !== null && row.retentionPeriodInDays !== undefined
      ? AuditRetentionMetadata.create(row.retentionPeriodInDays, new Date(row.timestamp))
      : undefined;

    const record = AuditRecord.create(
      id,
      reference,
      action,
      category,
      severity,
      actor,
      target,
      source,
      timestamp,
      contextMetadata,
      complianceMetadata,
      correlationReference,
      traceReference,
      chainReference,
      retentionMetadata
    );

    if (row.lifecycleState === AuditLifecycleState.ARCHIVED) {
      record.archive();
    }

    record.clearEvents();
    return record;
  }

  async save(record: AuditRecord): Promise<void> {
    await this.saveWithClient(record, this.client);
  }

  async saveInTransaction(record: AuditRecord, context: AtomicPersistenceContext): Promise<void> {
    const transactionClient = (context as Partial<PrismaAtomicPersistenceContext>).transactionClient;
    const client = (transactionClient as unknown as Partial<AuditPrismaClient> | undefined)?.auditRecord;
    if (!context.boundaryId || !client) throw new Error('AUDIT_ATOMIC_TRANSACTION_CONTEXT_REQUIRED');
    await this.saveWithClient(record, { auditRecord: client });
  }

  private async saveWithClient(record: AuditRecord, client: AuditPrismaClient): Promise<void> {
    const sanitizedContext = AuditSecretSanitizer.sanitize(record.getContextMetadata().getData());

    const data = {
      id: record.getId().getValue(),
      reference: record.getReference().getValue(),
      action: record.getAction().getValue(),
      category: record.getCategory().getValue(),
      severity: record.getSeverity().getValue(),
      actorId: record.getActor().getActorId(),
      actorType: record.getActor().getActorType(),
      targetId: record.getTarget().getTargetId(),
      targetType: record.getTarget().getTargetType(),
      source: record.getSource().getValue(),
      timestamp: record.getTimestamp().getValue(),
      contextMetadata: sanitizedContext,
      complianceMetadata: record.getComplianceMetadata()?.getRegulatoryTags() || null,
      correlationReference: record.getCorrelationReference()?.getValue() || null,
      traceReference: record.getTraceReference()?.getValue() || null,
      chainReference: record.getChainReference()?.getPreviousReference().getValue() || null,
      retentionPeriodInDays: record.getRetentionMetadata()?.getRetentionPeriodInDays() ?? null,
      retentionExpiresAt: record.getRetentionMetadata()?.getExpiresAt() ?? null,
      lifecycleState: record.getLifecycleState(),
    };

    await client.auditRecord.upsert({
      where: { id: data.id },
      update: data,
      create: data,
    });
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
    const rows = await (this.prisma as any).auditRecord.findMany({
      where: {
        category: 'CRITICAL_MUTATION',
        action: 'MUTATION_OUTCOME_RECORDED',
      },
      orderBy: { timestamp: 'desc' },
      take: Math.max(50, safeLimit * 10),
    });

    return rows
      .map((row: any) => {
        const context = row?.contextMetadata && typeof row.contextMetadata === 'object' ? row.contextMetadata : {};
        const requestedPath = String(context.requestedPath ?? context.path ?? '');
        const httpStatus = Number(context.httpStatus ?? context.statusCode ?? 0);
        return { row, context, requestedPath, httpStatus };
      })
      .filter(({ requestedPath }: any) => requestedPath.includes('/admin/imports'))
      .slice(0, safeLimit)
      .map(({ row, context, requestedPath, httpStatus }: any) => ({
        id: String(row.id),
        actorId: String(row.actorId ?? 'SYSTEM'),
        action: String(context.operation ?? context.action ?? row.action ?? 'IMPORT_OPERATION'),
        severity: String(row.severity ?? 'INFO'),
        targetId: String(row.targetId ?? ''),
        timestamp: new Date(row.timestamp),
        method: context.requestedMethod ? String(context.requestedMethod) : undefined,
        path: requestedPath || undefined,
        httpStatus: Number.isFinite(httpStatus) && httpStatus > 0 ? httpStatus : undefined,
        result: Number.isFinite(httpStatus) && httpStatus >= 400 ? 'FAILURE' : 'SUCCESS',
      }));
  }

  async findBy(specification: ISpecification<AuditRecord>): Promise<AuditRecord[]> {
    const criteria = (specification as any)?.criteria;
    const where: any = {};

    if (criteria) {
      if (criteria.actorId) where.actorId = criteria.actorId;
      if (criteria.targetId) where.targetId = criteria.targetId;
      if (criteria.action) where.action = criteria.action;
      if (criteria.category) where.category = criteria.category;
      if (criteria.severity) where.severity = criteria.severity;
      if (criteria.correlationId) where.correlationReference = criteria.correlationId;
    }

    const rows = await this.client.auditRecord.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
    });

    const domainRecords = rows.map(row => this.mapToDomain(row));
    return domainRecords.filter(record => specification.isSatisfiedBy(record));
  }
}
