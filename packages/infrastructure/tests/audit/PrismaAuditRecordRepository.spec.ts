import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import {
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
  AuditRecordQuerySpecification
} from '@manaratak/domain';
import { PrismaAuditRecordRepository, AuditRecordRow } from '../../src/audit/PrismaAuditRecordRepository';

describe('PrismaAuditRecordRepository', () => {
  let mockPrisma: any;
  let repository: PrismaAuditRecordRepository;

  beforeEach(() => {
    mockPrisma = {
      auditRecord: {
        upsert: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn()
      }
    };
    repository = new PrismaAuditRecordRepository(mockPrisma as unknown as PrismaClient);
  });

  const createSampleAuditRecord = (passwordValue = 'secret123') => {
    return AuditRecord.create(
      AuditId.create('audit-record-1'),
      AuditReference.create('AUD-2026-0001'),
      AuditAction.create('USER_LOGIN'),
      AuditCategory.create('AUTHENTICATION'),
      AuditSeverity.create('INFO'),
      ActorReference.create('user-100', 'IDENTITY'),
      TargetReference.create('system-portal', 'SYSTEM'),
      SourceReference.create('192.168.1.1'),
      AuditTimestamp.create(new Date('2026-07-29T10:00:00Z')),
      ContextMetadata.create({
        ip: '192.168.1.1',
        password: passwordValue,
        userAgent: 'Mozilla/5.0'
      }),
      ComplianceMetadata.create(['GDPR', 'HIPAA']),
      CorrelationReference.create('corr-888'),
      TraceReference.create('trace-999'),
      AuditChainReference.create(AuditReference.create('AUD-2026-0000')),
      AuditRetentionMetadata.create(90, new Date('2026-07-29T10:00:00Z'))
    );
  };

  it('saves an audit record and sanitizes sensitive metadata before persistence', async () => {
    const record = createSampleAuditRecord('super-secret-password');

    await repository.save(record);

    expect(mockPrisma.auditRecord.upsert).toHaveBeenCalledTimes(1);
    const upsertArgs = mockPrisma.auditRecord.upsert.mock.calls[0][0];

    expect(upsertArgs.where).toEqual({ id: 'audit-record-1' });
    expect(upsertArgs.create.id).toBe('audit-record-1');
    expect(upsertArgs.create.reference).toBe('AUD-2026-0001');
    expect(upsertArgs.create.action).toBe('USER_LOGIN');
    expect(upsertArgs.create.category).toBe('AUTHENTICATION');
    expect(upsertArgs.create.severity).toBe('INFO');
    expect(upsertArgs.create.actorId).toBe('user-100');
    expect(upsertArgs.create.actorType).toBe('IDENTITY');
    expect(upsertArgs.create.targetId).toBe('system-portal');
    expect(upsertArgs.create.targetType).toBe('SYSTEM');
    expect(upsertArgs.create.source).toBe('192.168.1.1');
    expect(upsertArgs.create.complianceMetadata).toEqual(['GDPR', 'HIPAA']);
    expect(upsertArgs.create.correlationReference).toBe('corr-888');
    expect(upsertArgs.create.traceReference).toBe('trace-999');
    expect(upsertArgs.create.chainReference).toBe('AUD-2026-0000');
    expect(upsertArgs.create.retentionPeriodInDays).toBe(90);

    // Verify secret sanitization in persisted payload
    expect(upsertArgs.create.contextMetadata.ip).toBe('192.168.1.1');
    expect(upsertArgs.create.contextMetadata.userAgent).toBe('Mozilla/5.0');
    expect(upsertArgs.create.contextMetadata.password).toBe('[REDACTED]');
  });

  it('queries audit records via specification and maps Prisma rows to domain objects', async () => {
    const sampleRow: AuditRecordRow = {
      id: 'audit-record-1',
      reference: 'AUD-2026-0001',
      action: 'USER_LOGIN',
      category: 'AUTHENTICATION',
      severity: 'INFO',
      actorId: 'user-100',
      actorType: 'IDENTITY',
      targetId: 'system-portal',
      targetType: 'SYSTEM',
      source: '192.168.1.1',
      timestamp: new Date('2026-07-29T10:00:00Z'),
      contextMetadata: {
        ip: '192.168.1.1',
        password: 'rawSecretPassword'
      },
      complianceMetadata: ['GDPR'],
      correlationReference: 'corr-888',
      traceReference: 'trace-999',
      chainReference: 'AUD-2026-0000',
      retentionPeriodInDays: 90,
      retentionExpiresAt: new Date('2026-10-27T10:00:00Z'),
      lifecycleState: 'RECORDED',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockPrisma.auditRecord.findMany.mockResolvedValue([sampleRow]);

    const spec = new AuditRecordQuerySpecification({
      actorId: 'user-100',
      action: 'USER_LOGIN'
    });

    const results = await repository.findBy(spec);

    expect(results).toHaveLength(1);
    const domainRecord = results[0];

    expect(domainRecord.getId().getValue()).toBe('audit-record-1');
    expect(domainRecord.getReference().getValue()).toBe('AUD-2026-0001');
    expect(domainRecord.getAction().getValue()).toBe('USER_LOGIN');
    expect(domainRecord.getActor().getActorId()).toBe('user-100');
    expect(domainRecord.getContextMetadata().getData().password).toBe('[REDACTED]');
    expect(domainRecord.getComplianceMetadata()?.getRegulatoryTags()).toEqual(['GDPR']);
    expect(domainRecord.getCorrelationReference()?.getValue()).toBe('corr-888');
  });
});
