/* eslint-disable @typescript-eslint/no-explicit-any -- Prisma transaction delegates are generated from the source-only Phase 18 migration. */
import { randomUUID } from 'node:crypto';
import { Prisma, PrismaClient } from '@prisma/client';
import {
  IStudentToolRegistryRepository,
  StudentToolDefinition,
  StudentToolExecutionRecord,
  StudentToolExecutionStatus,
  StudentToolFilters,
  StudentToolTelemetry,
} from '@manaratak/domain';
const json = (value: unknown): Prisma.InputJsonValue =>
  JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
type Db = Record<string, any>;

export class PrismaStudentToolRegistryRepository implements IStudentToolRegistryRepository {
  constructor(private readonly prisma: PrismaClient) {}
  private get db(): any {
    return this.prisma as any;
  }
  async list(filters: StudentToolFilters = {}) {
    const search = filters.search?.trim();
    const rows = await this.db.studentToolDefinitionRecord.findMany({
      where: {
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.visibility ? { visibility: filters.visibility } : {}),
        ...(filters.implementationStatus
          ? { implementationStatus: filters.implementationStatus }
          : {}),
        ...(filters.lifecycle ? { lifecycle: filters.lifecycle } : {}),
        ...(filters.executionType ? { executionType: filters.executionType } : {}),
        ...(search
          ? {
              OR: [
                { nameAr: { contains: search, mode: 'insensitive' } },
                { nameEn: { contains: search, mode: 'insensitive' } },
                { toolKey: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: { versions: { orderBy: { releaseDate: 'desc' } }, dependencies: true },
      orderBy: [{ launchOrder: 'asc' }, { nameAr: 'asc' }],
    });
    return rows.map(mapDefinition);
  }
  async listPublic(filters: StudentToolFilters = {}) {
    const rows = await this.db.studentToolDefinitionRecord.findMany({
      where: {
        availability: { path: ['publicEnabled'], equals: true },
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.visibility ? { visibility: filters.visibility } : {}),
      },
      include: { versions: { orderBy: { releaseDate: 'desc' } }, dependencies: true },
      orderBy: [{ launchOrder: 'asc' }],
    });
    return rows.map(mapDefinition);
  }
  async findByKey(toolKey: string) {
    const row = await this.db.studentToolDefinitionRecord.findUnique({
      where: { toolKey },
      include: { versions: { orderBy: { releaseDate: 'desc' } }, dependencies: true },
    });
    return row ? mapDefinition(row) : null;
  }
  async upsertDefinition(
    definition: StudentToolDefinition,
    actorReferenceId: string,
  ): Promise<StudentToolDefinition> {
    return this.db.$transaction(async (tx: Db) => {
      const data = definitionData(definition);
      const row = await tx.studentToolDefinitionRecord.upsert({
        where: { toolKey: definition.toolKey },
        create: {
          ...data,
          versions: { create: versionData(definition) },
          dependencies: { create: definition.dependencies },
        },
        update: data,
      });
      await tx.studentToolVersionRecord.upsert({
        where: {
          definitionId_semanticVersion: {
            definitionId: row.id,
            semanticVersion: definition.currentVersion.semanticVersion,
          },
        },
        create: { definitionId: row.id, ...versionData(definition) },
        update: versionData(definition),
      });
      await tx.studentToolDependencyRecord.deleteMany({ where: { definitionId: row.id } });
      if (definition.dependencies.length)
        await tx.studentToolDependencyRecord.createMany({
          data: definition.dependencies.map((item) => ({ definitionId: row.id, ...item })),
        });
      await appendMutation(
        tx,
        definition.toolKey,
        actorReferenceId,
        'STUDENT_TOOL_DEFINITION_UPSERTED',
        { semanticVersion: definition.currentVersion.semanticVersion },
      );
      const saved = await tx.studentToolDefinitionRecord.findUnique({
        where: { id: row.id },
        include: { versions: { orderBy: { releaseDate: 'desc' } }, dependencies: true },
      });
      return mapDefinition(saved);
    });
  }
  async updateDefinition(
    toolKey: string,
    patch: Partial<StudentToolDefinition>,
    actorReferenceId: string,
    action: string,
  ): Promise<StudentToolDefinition> {
    return this.db.$transaction(async (tx: Db) => {
      const current = await tx.studentToolDefinitionRecord.findUnique({ where: { toolKey } });
      if (!current) throw new Error('TOOL_NOT_FOUND');
      const allowed: Record<string, unknown> = {};
      for (const key of [
        'nameAr',
        'nameEn',
        'descriptionAr',
        'descriptionEn',
        'category',
        'visibility',
        'implementationStatus',
        'lifecycle',
        'availability',
        'featureFlags',
        'aiCapabilityKey',
        'estimatedMinutes',
        'tags',
        'iconAssetId',
        'launchOrder',
        'inputSchema',
        'outputSchema',
      ] as const)
        if (patch[key] !== undefined)
          allowed[key] = [
            'availability',
            'featureFlags',
            'tags',
            'inputSchema',
            'outputSchema',
          ].includes(key)
            ? json(patch[key])
            : patch[key];
      await tx.studentToolDefinitionRecord.update({ where: { toolKey }, data: allowed });
      await appendMutation(tx, toolKey, actorReferenceId, action, {
        changedFields: Object.keys(allowed),
      });
      const saved = await tx.studentToolDefinitionRecord.findUnique({
        where: { toolKey },
        include: { versions: { orderBy: { releaseDate: 'desc' } }, dependencies: true },
      });
      return mapDefinition(saved);
    });
  }
  async recordExecution(record: StudentToolExecutionRecord) {
    const definition = await this.db.studentToolDefinitionRecord.findUnique({
      where: { toolKey: record.toolKey },
      select: { id: true },
    });
    if (!definition) throw new Error('TOOL_NOT_FOUND');
    const row = await this.db.studentToolExecutionRecord.create({
      data: { ...executionData(record), definitionId: definition.id } as any,
    });
    return mapExecution(row, record.toolKey);
  }
  async completeExecution(executionId: string, patch: Partial<StudentToolExecutionRecord>) {
    const row = await this.db.studentToolExecutionRecord.update({
      where: { executionId },
      data: executionData(patch),
    });
    const definition = await this.db.studentToolDefinitionRecord.findUnique({
      where: { id: row.definitionId },
      select: { toolKey: true },
    });
    if (!definition) throw new Error('TOOL_NOT_FOUND');
    return mapExecution(row, definition.toolKey);
  }
  async findExecution(executionId: string) {
    const row = await this.db.studentToolExecutionRecord.findUnique({
      where: { executionId },
      include: { definition: { select: { toolKey: true } } },
    });
    return row ? mapExecution(row, row.definition.toolKey) : null;
  }
  async findExecutionByIdempotency(toolKey: string, idempotencyKeyHash: string) {
    const row = await this.db.studentToolExecutionRecord.findFirst({
      where: { idempotencyKeyHash, definition: { toolKey } },
      include: { definition: { select: { toolKey: true } } },
    });
    return row ? mapExecution(row, row.definition.toolKey) : null;
  }
  async listExecutions(toolKey: string, page = 1, pageSize = 25) {
    const safePage = Math.max(1, page);
    const take = Math.min(100, Math.max(1, pageSize));
    const where = { definition: { toolKey } };
    const [rows, total] = await Promise.all([
      this.db.studentToolExecutionRecord.findMany({
        where,
        include: { definition: { select: { toolKey: true } } },
        orderBy: { startedAt: 'desc' },
        skip: (safePage - 1) * take,
        take,
      }),
      this.db.studentToolExecutionRecord.count({ where }),
    ]);
    return { data: rows.map((row: any) => mapExecution(row, row.definition.toolKey)), total };
  }
  async telemetry(toolKey?: string): Promise<StudentToolTelemetry> {
    const since30 = new Date(Date.now() - 30 * 86400000);
    const where = { startedAt: { gte: since30 }, ...(toolKey ? { definition: { toolKey } } : {}) };
    const rows = await this.db.studentToolExecutionRecord.findMany({
      where,
      select: { status: true, durationMs: true, startedAt: true, errorCode: true },
    });
    const now = Date.now();
    const complete = rows.filter(
      (row: any) => row.status === StudentToolExecutionStatus.COMPLETED,
    ).length;
    const failed = rows.filter(
      (row: any) => row.status === StudentToolExecutionStatus.FAILED,
    ).length;
    const durations = rows
      .map((row: any) => row.durationMs)
      .filter((value: unknown): value is number => typeof value === 'number')
      .sort((a: number, b: number) => a - b);
    return {
      executions24h: rows.filter((row: any) => now - new Date(row.startedAt).getTime() <= 86400000)
        .length,
      executions7d: rows.filter(
        (row: any) => now - new Date(row.startedAt).getTime() <= 7 * 86400000,
      ).length,
      executions30d: rows.length,
      successRate: rows.length ? complete / rows.length : null,
      failureRate: rows.length ? failed / rows.length : null,
      p95LatencyMs: durations.length
        ? durations[Math.min(durations.length - 1, Math.ceil(durations.length * 0.95) - 1)]
        : null,
      blocked: rows.filter((row: any) => row.status === StudentToolExecutionStatus.BLOCKED).length,
      dependencyFailures: rows.filter((row: any) =>
        String(row.errorCode ?? '').includes('DEPENDENCY'),
      ).length,
    };
  }
  async audit(toolKey: string) {
    const rows = await this.db.auditRecord.findMany({
      where: { targetId: toolKey, targetType: 'STUDENT_TOOL' },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
    return rows.map((row: any) => ({
      timestamp: row.timestamp,
      actor: row.actorId,
      action: row.action,
      summary: String((row.contextMetadata as Record<string, unknown>)?.summary ?? row.action),
      correlationId: row.correlationReference,
    }));
  }
}

function definitionData(value: StudentToolDefinition) {
  return {
    toolKey: value.toolKey,
    nameAr: value.nameAr,
    nameEn: value.nameEn,
    descriptionAr: value.descriptionAr,
    descriptionEn: value.descriptionEn,
    category: value.category,
    executionType: value.executionType,
    implementationPriority: value.implementationPriority,
    desiredLaunchVisibility: value.desiredLaunchVisibility,
    visibility: value.visibility,
    implementationStatus: value.implementationStatus,
    lifecycle: value.lifecycle,
    availability: json(value.availability),
    featureFlags: json(value.featureFlags),
    aiCapabilityKey: value.aiCapabilityKey,
    outputType: value.outputType,
    supportedLocales: json(value.supportedLocales),
    estimatedMinutes: value.estimatedMinutes,
    tags: json(value.tags),
    iconAssetId: value.iconAssetId,
    owner: value.owner,
    launchOrder: value.launchOrder,
    inputSchema: json(value.inputSchema),
    outputSchema: json(value.outputSchema),
  };
}
function versionData(value: StudentToolDefinition) {
  return {
    semanticVersion: value.currentVersion.semanticVersion,
    inputSchemaVersion: value.currentVersion.inputSchemaVersion,
    outputSchemaVersion: value.currentVersion.outputSchemaVersion,
    releaseDate: new Date(value.currentVersion.releaseDate),
    changeNote: value.currentVersion.changeNote,
    status: value.currentVersion.status,
  };
}
function mapDefinition(row: any): StudentToolDefinition {
  const currentVersion =
    row.versions.find((item: any) => item.status === 'ACTIVE') ?? row.versions[0];
  return {
    ...row,
    availability: row.availability,
    featureFlags: row.featureFlags,
    supportedLocales: row.supportedLocales,
    tags: row.tags,
    inputSchema: row.inputSchema,
    outputSchema: row.outputSchema,
    currentVersion,
    dependencies: row.dependencies.map(
      ({ id: _id, definitionId: _definitionId, ...item }: any) => item,
    ),
  };
}
function executionData(value: Partial<StudentToolExecutionRecord>) {
  const data: Record<string, unknown> = {};
  for (const key of [
    'executionId',
    'toolVersion',
    'status',
    'consumerType',
    'studentReferenceHash',
    'anonymousSessionHash',
    'idempotencyKeyHash',
    'correlationId',
    'traceId',
    'aiExecutionReference',
    'durationMs',
    'errorCode',
    'isTest',
    'startedAt',
    'completedAt',
  ] as const)
    if (value[key] !== undefined) data[key] = value[key];
  if (value.dependencyStatus !== undefined)
    data.dependencyStatus =
      value.dependencyStatus == null ? Prisma.JsonNull : json(value.dependencyStatus);
  if (value.safeUsageMetadata !== undefined)
    data.safeUsageMetadata =
      value.safeUsageMetadata == null ? Prisma.JsonNull : json(value.safeUsageMetadata);
  return data;
}
function mapExecution(row: any, toolKey: string): StudentToolExecutionRecord {
  return {
    ...row,
    toolKey,
    dependencyStatus: row.dependencyStatus,
    safeUsageMetadata: row.safeUsageMetadata,
  };
}
async function appendMutation(
  tx: Db,
  toolKey: string,
  actorId: string,
  action: string,
  details: Record<string, unknown>,
) {
  const id = randomUUID();
  const now = new Date();
  await tx.auditRecord.create({
    data: {
      id,
      reference: `audit_${id}`,
      action,
      category: 'STUDENT_TOOLS',
      severity: 'INFO',
      actorId,
      actorType: 'IDENTITY',
      targetId: toolKey,
      targetType: 'STUDENT_TOOL',
      source: 'Phase18StudentTools',
      timestamp: now,
      contextMetadata: json({ summary: action, ...details }),
      correlationReference: id,
    },
  });
  await tx.transactionalOutboxRecord.create({
    data: {
      id: randomUUID(),
      eventType: action,
      domain: 'STUDENT_TOOLS',
      aggregateType: 'STUDENT_TOOL',
      aggregateId: toolKey,
      payload: json({ toolKey, ...details }),
      metadata: json({ actorReferenceId: actorId }),
      correlationId: id,
    },
  });
}
