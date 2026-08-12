import { PrismaClient } from '@prisma/client';
import { ISpecification } from '@manaratak/core';
import {
  IAuditRecordRepository,
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

export class PrismaAuditRecordRepository implements IAuditRecordRepository {
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

    await this.client.auditRecord.upsert({
      where: { id: data.id },
      update: data,
      create: data,
    });
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
