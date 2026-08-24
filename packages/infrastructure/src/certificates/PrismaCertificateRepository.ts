import { randomUUID } from 'crypto';
import { Prisma, PrismaClient } from '@prisma/client';
import {
  CertificateAnalyticsDto,
  CertificateDto,
  CertificateLedgerEntryDto,
  CertificateListQuery,
  CertificateListResult,
  CertificateStatus,
  CertificateTemplateDto,
  CertificateTemplateStatus,
  CreateCertificateTemplateDto,
  ICertificateRepository,
  IssueCertificateDto,
  ReissueCertificateDto,
  RevokeCertificateDto,
  UpdateCertificateTemplateDto,
} from '@manaratak/domain';

const json = (value: unknown): Prisma.InputJsonValue | undefined =>
  value === undefined ? undefined : (JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue);

export class PrismaCertificateRepository implements ICertificateRepository {
  public constructor(private readonly prisma: PrismaClient) {}
  private get db(): any {
    return this.prisma as any;
  }

  public async createTemplate(data: CreateCertificateTemplateDto): Promise<CertificateTemplateDto> {
    return this.template(
      await this.db.certificateTemplate.create({
        data: { ...data, metadata: json(data.metadata) },
      }),
    );
  }

  public async updateTemplate(
    id: string,
    data: UpdateCertificateTemplateDto,
  ): Promise<CertificateTemplateDto> {
    const current = await this.db.certificateTemplate.findUnique({ where: { id } });
    if (!current) throw new Error('CERTIFICATE_TEMPLATE_NOT_FOUND');
    const changesContent = Object.keys(data).some((key) => key !== 'status');
    if (changesContent && current.status !== CertificateTemplateStatus.DRAFT)
      throw new Error('CERTIFICATE_TEMPLATE_IMMUTABLE');
    return this.template(
      await this.db.certificateTemplate.update({
        where: { id },
        data: { ...data, metadata: json(data.metadata) },
      }),
    );
  }

  public async findTemplateById(id: string): Promise<CertificateTemplateDto | null> {
    const row = await this.db.certificateTemplate.findUnique({ where: { id } });
    return row ? this.template(row) : null;
  }

  public async findActiveTemplateByName(name: string): Promise<CertificateTemplateDto | null> {
    const row = await this.db.certificateTemplate.findFirst({
      where: { name, status: CertificateTemplateStatus.ACTIVE },
      orderBy: { updatedAt: 'desc' },
    });
    return row ? this.template(row) : null;
  }

  public async listTemplates(): Promise<CertificateTemplateDto[]> {
    return (
      await this.db.certificateTemplate.findMany({
        orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
      })
    ).map((row: any) => this.template(row));
  }

  public async issue(data: IssueCertificateDto): Promise<CertificateDto> {
    return this.db.$transaction(async (tx: any) => {
      const existing = await tx.certificate.findUnique({
        where: { courseCompletionId: data.courseCompletionId },
      });
      if (existing) return this.certificate(existing);
      const certificate = await tx.certificate.create({ data: this.issueData(data) });
      await this.appendMutation(
        tx,
        certificate.id,
        'ISSUED',
        data.actorId ?? 'phase14-system',
        null,
        data.correlationId,
        { serialNumber: certificate.serialNumber },
        'CertificateIssued',
      );
      return this.certificate(certificate);
    });
  }

  public async findById(id: string): Promise<CertificateDto | null> {
    const row = await this.db.certificate.findUnique({ where: { id } });
    return row ? this.certificate(row) : null;
  }
  public async findByCourseCompletionId(
    courseCompletionId: string,
  ): Promise<CertificateDto | null> {
    const row = await this.db.certificate.findUnique({ where: { courseCompletionId } });
    return row ? this.certificate(row) : null;
  }
  public async findByVerificationCode(verificationCode: string): Promise<CertificateDto | null> {
    const row = await this.db.certificate.findUnique({ where: { verificationCode } });
    return row ? this.certificate(row) : null;
  }
  public async findBySerialNumber(serialNumber: string): Promise<CertificateDto | null> {
    const row = await this.db.certificate.findUnique({ where: { serialNumber } });
    return row ? this.certificate(row) : null;
  }
  public async listByStudent(studentReferenceId: string): Promise<CertificateDto[]> {
    return (
      await this.db.certificate.findMany({
        where: { studentReferenceId },
        orderBy: { issuedAt: 'desc' },
      })
    ).map((row: any) => this.certificate(row));
  }

  public async list(query: CertificateListQuery): Promise<CertificateListResult> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 25));
    const search = query.search?.trim();
    const where: any = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.templateId ? { templateId: query.templateId } : {}),
      ...(search
        ? {
            OR: [
              { serialNumber: { contains: search, mode: 'insensitive' } },
              { verificationCode: { contains: search, mode: 'insensitive' } },
              { recipientDisplayName: { contains: search, mode: 'insensitive' } },
              { studentReferenceId: { contains: search, mode: 'insensitive' } },
              { courseDisplayName: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [rows, total] = await Promise.all([
      this.db.certificate.findMany({
        where,
        orderBy: { issuedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.db.certificate.count({ where }),
    ]);
    return { data: rows.map((row: any) => this.certificate(row)), total, page, pageSize };
  }

  public async analytics(): Promise<CertificateAnalyticsDto> {
    const soon = new Date(Date.now() + 30 * 86400000);
    const [total, active, revoked, archived, expiringSoon, templates, verifications] =
      await Promise.all([
        this.db.certificate.count(),
        this.db.certificate.count({ where: { status: CertificateStatus.ACTIVE } }),
        this.db.certificate.count({ where: { status: CertificateStatus.REVOKED } }),
        this.db.certificate.count({ where: { status: CertificateStatus.ARCHIVED } }),
        this.db.certificate.count({
          where: { status: CertificateStatus.ACTIVE, expiresAt: { lte: soon, gte: new Date() } },
        }),
        this.db.certificateTemplate.count({ where: { status: CertificateTemplateStatus.ACTIVE } }),
        this.db.certificateVerificationLog.count(),
      ]);
    return { total, active, revoked, archived, expiringSoon, templates, verifications };
  }

  public async revoke(data: RevokeCertificateDto): Promise<CertificateDto> {
    return this.db.$transaction(async (tx: any) => {
      const current = await tx.certificate.findUnique({ where: { id: data.certificateId } });
      if (!current) throw new Error('CERTIFICATE_NOT_FOUND');
      if (current.status === CertificateStatus.REVOKED) return this.certificate(current);
      if (current.status === CertificateStatus.ARCHIVED) throw new Error('CERTIFICATE_ARCHIVED');
      const row = await tx.certificate.update({
        where: { id: data.certificateId },
        data: {
          status: CertificateStatus.REVOKED,
          revokedAt: new Date(),
          revocationReason: data.reason,
          revokedBy: data.actorId,
        },
      });
      await this.appendMutation(
        tx,
        row.id,
        'REVOKED',
        data.actorId,
        data.reason,
        data.correlationId,
        {},
        'CertificateRevoked',
      );
      return this.certificate(row);
    });
  }

  public async reissue(
    data: ReissueCertificateDto & { replacement: IssueCertificateDto },
  ): Promise<CertificateDto> {
    return this.db.$transaction(async (tx: any) => {
      const original = await tx.certificate.findUnique({ where: { id: data.certificateId } });
      if (!original) throw new Error('CERTIFICATE_NOT_FOUND');
      if (original.replacedByCertificateId)
        return this.certificate(
          await tx.certificate.findUnique({ where: { id: original.replacedByCertificateId } }),
        );
      if (original.status !== CertificateStatus.REVOKED)
        throw new Error('CERTIFICATE_MUST_BE_REVOKED_BEFORE_REISSUE');
      const replacement = await tx.certificate.create({
        data: { ...this.issueData(data.replacement), replacesCertificateId: original.id },
      });
      await tx.certificate.update({
        where: { id: original.id },
        data: { status: CertificateStatus.REISSUED, replacedByCertificateId: replacement.id },
      });
      await this.appendMutation(
        tx,
        replacement.id,
        'REISSUED',
        data.actorId,
        data.reason,
        data.correlationId,
        { replacesCertificateId: original.id },
        'CertificateReissued',
      );
      return this.certificate(replacement);
    });
  }

  public async archive(
    certificateId: string,
    actorId: string,
    reason: string,
  ): Promise<CertificateDto> {
    return this.db.$transaction(async (tx: any) => {
      const current = await tx.certificate.findUnique({ where: { id: certificateId } });
      if (!current) throw new Error('CERTIFICATE_NOT_FOUND');
      const row = await tx.certificate.update({
        where: { id: certificateId },
        data: { status: CertificateStatus.ARCHIVED, archivedAt: new Date() },
      });
      await this.appendMutation(
        tx,
        row.id,
        'ARCHIVED',
        actorId,
        reason,
        null,
        {},
        'CertificateArchived',
      );
      return this.certificate(row);
    });
  }

  public async recordVerification(
    certificateId: string,
    result: string,
    channel: string,
  ): Promise<void> {
    await this.db.$transaction(async (tx: any) => {
      await tx.certificateVerificationLog.create({ data: { certificateId, result, channel } });
      await tx.transactionalOutboxRecord.create({
        data: this.outbox(
          certificateId,
          'CertificateVerified',
          { certificateId, result, channel },
          null,
        ),
      });
    });
  }

  public async listLedger(certificateId: string): Promise<CertificateLedgerEntryDto[]> {
    return (
      await this.db.certificateLedgerEntry.findMany({
        where: { certificateId },
        orderBy: { occurredAt: 'desc' },
      })
    ).map((row: any) => ({ ...row, payload: row.payload as Record<string, unknown> | null }));
  }

  private issueData(data: IssueCertificateDto): any {
    const {
      correlationId: _correlationId,
      actorId: _actorId,
      skills,
      competencies,
      metadata,
      validityPolicy,
      ...rest
    } = data;
    return {
      ...rest,
      issuedAt: data.issuedAt ?? new Date(),
      validityPolicy: validityPolicy ?? 'PERMANENT',
      skills: json(skills ?? []),
      competencies: json(competencies ?? []),
      metadata: json(metadata),
    };
  }

  private async appendMutation(
    tx: any,
    certificateId: string,
    action: string,
    actorId: string,
    reason: string | null,
    correlationId: string | null | undefined,
    payload: Record<string, unknown>,
    eventType: string,
  ): Promise<void> {
    const now = new Date();
    const auditId = randomUUID();
    await tx.certificateLedgerEntry.create({
      data: { certificateId, action, actorId, reason, payload: json(payload), occurredAt: now },
    });
    await tx.auditRecord.create({
      data: {
        id: auditId,
        reference: `cert-audit-${auditId}`,
        action,
        category: 'CERTIFICATES',
        severity: action === 'REVOKED' ? 'HIGH' : 'INFO',
        actorId,
        actorType: actorId === 'phase14-system' ? 'SYSTEM' : 'USER',
        targetId: certificateId,
        targetType: 'Certificate',
        source: 'Phase14',
        timestamp: now,
        contextMetadata: json({ reason, ...payload })!,
        correlationReference: correlationId ?? null,
      },
    });
    await tx.transactionalOutboxRecord.create({
      data: this.outbox(
        certificateId,
        eventType,
        { certificateId, action, reason, ...payload },
        correlationId,
      ),
    });
  }

  private outbox(
    certificateId: string,
    eventType: string,
    payload: Record<string, unknown>,
    correlationId: string | null | undefined,
  ): any {
    const id = randomUUID();
    return {
      id,
      eventType,
      domain: 'CERTIFICATES',
      aggregateType: 'Certificate',
      aggregateId: certificateId,
      payload: json(payload),
      metadata: json({ sourcePhase: 'Phase14', schemaVersion: '1.0' }),
      correlationId: correlationId ?? null,
    };
  }
  private template(row: any): CertificateTemplateDto {
    return {
      ...row,
      status: row.status as CertificateTemplateStatus,
      metadata: row.metadata as Record<string, unknown> | null,
    };
  }
  private certificate(row: any): CertificateDto {
    return {
      ...row,
      status: row.status as CertificateStatus,
      skills: Array.isArray(row.skills) ? row.skills : [],
      competencies: Array.isArray(row.competencies) ? row.competencies : [],
      metadata: row.metadata as Record<string, unknown> | null,
    };
  }
}
