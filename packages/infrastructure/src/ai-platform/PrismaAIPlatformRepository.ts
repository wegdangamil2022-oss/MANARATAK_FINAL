import { createHash, randomUUID } from 'node:crypto';
import {
  AIExecutionLogDto, AIExecutionRecord, AIExecutionSpan, AIIncident, AIIndexingRun, AIPlatformOverview,
  AIRegistryResource, AIPromptDefinition, AIPromptVersion, AIWorkflowRun, AIEvaluationRun,
  IAIExecutionRepository, IAIPlatformRepository
} from '@manaratak/domain';

export class PrismaAIPlatformRepository implements IAIPlatformRepository, IAIExecutionRepository {
  constructor(private readonly prisma: any) {}

  async overview(): Promise<AIPlatformOverview> {
    const startToday = new Date(); startToday.setUTCHours(0, 0, 0, 0);
    const startMonth = new Date(Date.UTC(startToday.getUTCFullYear(), startToday.getUTCMonth(), 1));
    const [providers, activeModels, activePrompts, executionsToday, blockedToday, usage, openIncidents] = await Promise.all([
      this.list<any>('providers'),
      this.prisma.aIRegistryRecord.count({ where: { resourceType: 'models', status: 'ACTIVE' } }),
      this.prisma.aIRegistryRecord.count({ where: { resourceType: 'prompts', status: 'ACTIVE' } }),
      this.prisma.aIExecutionRecord.count({ where: { createdAt: { gte: startToday } } }),
      this.prisma.aIExecutionRecord.count({ where: { createdAt: { gte: startToday }, safetyDecision: 'BLOCKED' } }),
      this.prisma.aIUsageRecord.aggregate({ where: { createdAt: { gte: startMonth } }, _sum: { cost: true } }),
      this.prisma.aIRegistryRecord.count({ where: { resourceType: 'incidents', status: { in: ['OPEN', 'INVESTIGATING'] } } })
    ]);
    const counts: AIPlatformOverview['providers'] = { NOT_CONFIGURED: 0, READY: 0, DEGRADED: 0, UNAVAILABLE: 0, DISABLED: 0 };
    providers.forEach((provider: any) => { const status = provider.operationalStatus ?? 'NOT_CONFIGURED'; if (status in counts) counts[status as keyof typeof counts] += 1; });
    return { providers: counts, activeModels, activePrompts, executionsToday, blockedToday, costMonthToDate: Number(usage._sum.cost ?? 0), currency: 'USD', openIncidents };
  }

  async list<T>(resource: AIRegistryResource, filters: Record<string, unknown> = {}): Promise<T[]> {
    const records = await this.prisma.aIRegistryRecord.findMany({ where: { resourceType: resource, ...(filters.status ? { status: filters.status } : {}) }, orderBy: { updatedAt: 'desc' } });
    return records.map((record: any) => ({ ...record.configuration, id: record.id, key: record.key, status: record.status, secretReference: record.secretReference ?? record.configuration?.secretReference ?? null })) as T[];
  }

  async find<T>(resource: AIRegistryResource, key: string): Promise<T | null> {
    const record = await this.prisma.aIRegistryRecord.findUnique({ where: { resourceType_key: { resourceType: resource, key } } });
    return record ? ({ ...record.configuration, id: record.id, key: record.key, status: record.status, secretReference: record.secretReference ?? null } as T) : null;
  }

  async upsert<T>(resource: AIRegistryResource, value: T, actorReferenceId: string): Promise<T> {
    const candidate = value as any;
    if (!candidate.key) throw new Error('AI registry key is required.');
    if (resource === 'providers' && candidate.apiKey) throw new Error('AI provider secrets must be environment references, never persisted values.');
    const configuration = { ...candidate }; delete configuration.id; delete configuration.key; delete configuration.apiKey; delete configuration.secretValue;
    const record = await this.prisma.$transaction(async (tx: any) => {
      const saved = await tx.aIRegistryRecord.upsert({
        where: { resourceType_key: { resourceType: resource, key: candidate.key } },
        create: { resourceType: resource, key: candidate.key, status: candidate.status ?? 'DRAFT', providerKey: candidate.providerKey, capabilityKey: candidate.capabilityKey, consumerKey: candidate.consumerKey, secretReference: candidate.secretReference, configuration, createdBy: actorReferenceId, updatedBy: actorReferenceId },
        update: { status: candidate.status ?? 'DRAFT', providerKey: candidate.providerKey, capabilityKey: candidate.capabilityKey, consumerKey: candidate.consumerKey, secretReference: candidate.secretReference, configuration, updatedBy: actorReferenceId }
      });
      await appendGovernanceEvidence(tx, { action: 'AI_REGISTRY_UPSERTED', actorReferenceId, targetId: saved.id, targetType: resource, aggregateId: candidate.key, payload: { resource, key: candidate.key, status: saved.status } });
      return saved;
    });
    return { ...record.configuration, id: record.id, key: record.key, status: record.status, secretReference: record.secretReference } as T;
  }

  async createPromptVersion(value: Omit<AIPromptVersion, 'id' | 'createdAt' | 'checksum'>): Promise<AIPromptVersion> {
    const checksum = createHash('sha256').update(`${value.promptKey}:${value.version}:${value.template}`).digest('hex');
    return this.prisma.$transaction(async (tx: any) => {
      const record = await tx.aIPromptVersionRecord.create({ data: { ...value, checksum } });
      await appendGovernanceEvidence(tx, { action: 'AI_PROMPT_VERSION_CREATED', actorReferenceId: value.createdBy, targetId: record.id, targetType: 'promptVersion', aggregateId: value.promptKey, payload: { promptKey: value.promptKey, version: value.version, status: value.status, checksum } });
      return record;
    });
  }
  async findPromptVersion(promptKey: string, version: number): Promise<AIPromptVersion | null> { return this.prisma.aIPromptVersionRecord.findUnique({ where: { promptKey_version: { promptKey, version } } }); }

  async deployPrompt(promptKey: string, version: number, actorReferenceId: string): Promise<AIPromptDefinition> {
    return this.prisma.$transaction(async (tx: any) => {
      const versionRecord = await tx.aIPromptVersionRecord.findUnique({ where: { promptKey_version: { promptKey, version } } });
      if (!versionRecord || versionRecord.status !== 'APPROVED') throw new Error('Only an approved immutable prompt version can be deployed.');
      await tx.aIPromptDeploymentRecord.updateMany({ where: { promptKey, environment: 'PRODUCTION', status: 'ACTIVE' }, data: { status: 'RETIRED', retiredAt: new Date() } });
      await tx.aIPromptDeploymentRecord.create({ data: { promptKey, version, environment: 'PRODUCTION', status: 'ACTIVE', deployedBy: actorReferenceId } });
      const record = await tx.aIRegistryRecord.findUnique({ where: { resourceType_key: { resourceType: 'prompts', key: promptKey } } });
      if (!record) throw new Error('Prompt definition not found.');
      const configuration = { ...record.configuration, activeVersion: version };
      const updated = await tx.aIRegistryRecord.update({ where: { id: record.id }, data: { status: 'ACTIVE', configuration, updatedBy: actorReferenceId } });
      await appendGovernanceEvidence(tx, { action: 'AI_PROMPT_DEPLOYED', actorReferenceId, targetId: updated.id, targetType: 'prompts', aggregateId: promptKey, payload: { promptKey, version, environment: 'PRODUCTION' } });
      return { ...updated.configuration, id: updated.id, key: updated.key, status: updated.status };
    });
  }

  async createExecution(value: Omit<AIExecutionRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<AIExecutionRecord> {
    const record = await this.prisma.$transaction(async (tx: any) => {
      const created = await tx.aIExecutionRecord.create({ data: value });
      await tx.transactionalOutboxRecord.create({ data: { id: randomUUID(), eventType: 'AI_EXECUTION_RECEIVED', domain: 'AI_PLATFORM', aggregateType: 'AIExecution', aggregateId: value.publicId, payload: { publicId: value.publicId, consumerKey: value.consumerKey, capabilityKey: value.capabilityKey, status: value.status }, metadata: { traceId: value.traceId }, correlationId: value.traceId } });
      return created;
    });
    return normalizeExecution(record);
  }
  async updateExecution(publicId: string, patch: Partial<AIExecutionRecord>): Promise<AIExecutionRecord> { const data = { ...patch } as any; delete data.id; delete data.publicId; delete data.createdAt; delete data.updatedAt; return normalizeExecution(await this.prisma.aIExecutionRecord.update({ where: { publicId }, data })); }
  async findExecution(publicId: string): Promise<AIExecutionRecord | null> { const value = await this.prisma.aIExecutionRecord.findUnique({ where: { publicId } }); return value ? normalizeExecution(value) : null; }
  async findExecutionByIdempotency(consumerKey: string, idempotencyKey: string): Promise<AIExecutionRecord | null> { const value = await this.prisma.aIExecutionRecord.findUnique({ where: { consumerKey_idempotencyKey: { consumerKey, idempotencyKey } } }); return value ? normalizeExecution(value) : null; }
  async listExecutions(filters: Record<string, any> = {}) {
    const page = Math.max(1, Number(filters.page ?? 1)); const pageSize = Math.min(100, Math.max(1, Number(filters.pageSize ?? 20)));
    const where = { ...(filters.status ? { status: filters.status } : {}), ...(filters.consumerKey ? { consumerKey: filters.consumerKey } : {}), ...(filters.providerKey ? { providerKey: filters.providerKey } : {}), ...(filters.purpose ? { purpose: filters.purpose } : {}) };
    const [data, total] = await Promise.all([this.prisma.aIExecutionRecord.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }), this.prisma.aIExecutionRecord.count({ where })]);
    return { data: data.map(normalizeExecution), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }
  async appendSpan(span: Omit<AIExecutionSpan, 'id'>): Promise<AIExecutionSpan> { return this.prisma.aIExecutionSpanRecord.create({ data: span }); }
  async recordUsage(value: { executionPublicId: string; providerKey: string; modelKey: string; inputTokens: number; outputTokens: number; cost: number; currency: string; metadata?: Record<string, unknown> }) {
    const execution = await this.prisma.aIExecutionRecord.findUnique({ where: { publicId: value.executionPublicId }, select: { consumerKey: true } });
    if (!execution) throw new Error('AI execution not found for usage record.');
    await this.prisma.aIUsageRecord.upsert({ where: { executionPublicId_providerKey_modelKey: { executionPublicId: value.executionPublicId, providerKey: value.providerKey, modelKey: value.modelKey } }, create: { ...value, consumerKey: execution.consumerKey }, update: { inputTokens: value.inputTokens, outputTokens: value.outputTokens, cost: value.cost, currency: value.currency, metadata: value.metadata } });
  }
  async quotaUsage(consumerKey: string, period: 'MINUTE' | 'DAY' | 'MONTH') { const since = periodStart(period); const [requests, usage] = await Promise.all([this.prisma.aIExecutionRecord.count({ where: { consumerKey, createdAt: { gte: since } } }), this.prisma.aIUsageRecord.aggregate({ where: { consumerKey, createdAt: { gte: since } }, _sum: { inputTokens: true, outputTokens: true, cost: true } })]); return { requests, tokens: Number(usage._sum.inputTokens ?? 0) + Number(usage._sum.outputTokens ?? 0), cost: Number(usage._sum.cost ?? 0) }; }
  async createWorkflowRun(value: Omit<AIWorkflowRun, 'id' | 'createdAt' | 'updatedAt'>): Promise<AIWorkflowRun> { return this.prisma.aIWorkflowRunRecord.create({ data: value }); }
  async findWorkflowRun(publicId: string): Promise<AIWorkflowRun | null> { return this.prisma.aIWorkflowRunRecord.findUnique({ where: { publicId } }); }
  async updateWorkflowRun(publicId: string, patch: Partial<AIWorkflowRun>): Promise<AIWorkflowRun> { const data = { ...patch } as any; delete data.id; delete data.publicId; delete data.createdAt; delete data.updatedAt; return this.prisma.aIWorkflowRunRecord.update({ where: { publicId }, data }); }
  async createEvaluationRun(value: Omit<AIEvaluationRun, 'id' | 'createdAt'>): Promise<AIEvaluationRun> { return this.prisma.aIEvaluationRunRecord.create({ data: value }); }
  async updateEvaluationRun(publicId: string, patch: Partial<AIEvaluationRun>): Promise<AIEvaluationRun> { const data = { ...patch } as any; delete data.id; delete data.publicId; delete data.createdAt; return this.prisma.aIEvaluationRunRecord.update({ where: { publicId }, data }); }
  async appendIncidentEvent(publicId: string, event: AIIncident['timeline'][number]): Promise<AIIncident> { await this.prisma.aIIncidentEventRecord.create({ data: { incidentPublicId: publicId, action: event.action, actorReferenceId: event.actorReferenceId, note: event.note, createdAt: event.at } }); const incident = await this.find<AIIncident>('incidents', publicId); if (!incident) throw new Error('AI incident not found.'); const events = await this.prisma.aIIncidentEventRecord.findMany({ where: { incidentPublicId: publicId }, orderBy: { createdAt: 'asc' } }); return { ...incident, timeline: events.map((item: any) => ({ at: item.createdAt, action: item.action, actorReferenceId: item.actorReferenceId, note: item.note })) }; }
  async createIndexingRun(value: Omit<AIIndexingRun, 'id' | 'createdAt'>): Promise<AIIndexingRun> { return this.prisma.aIIndexingRunRecord.create({ data: value }); }
  async updateIndexingRun(publicId: string, patch: Partial<AIIndexingRun>): Promise<AIIndexingRun> { const data = { ...patch } as any; delete data.id; delete data.publicId; delete data.createdAt; return this.prisma.aIIndexingRunRecord.update({ where: { publicId }, data }); }
  async replaceEmbeddings(input: { indexKey: string; sourceReferenceId: string; modelKey: string; dimensions: number; chunks: Array<{ chunkKey: string; chunkText: string; embeddingRef: string; checksum: string; metadata?: Record<string, unknown> }> }) { await this.prisma.$transaction(async (tx: any) => { await tx.aIEmbeddingRecord.deleteMany({ where: { indexKey: input.indexKey, sourceReferenceId: input.sourceReferenceId } }); if (input.chunks.length) await tx.aIEmbeddingRecord.createMany({ data: input.chunks.map((chunk) => ({ ...chunk, indexKey: input.indexKey, sourceReferenceId: input.sourceReferenceId, modelKey: input.modelKey, dimensions: input.dimensions })) }); }); }

  async createLog(data: any): Promise<AIExecutionLogDto> {
    const record = await this.createExecution({ publicId: data.publicId, traceId: data.metadata?.traceId ?? randomUUID(), consumerKey: data.metadata?.consumerKey ?? data.sourceDomain ?? 'legacy', capabilityKey: data.metadata?.capabilityKey ?? data.purpose, purpose: data.purpose, promptKey: data.promptKey, providerKey: String(data.providerType), modelKey: data.modelReference, status: data.status, safetyDecision: data.safetyDecision, inputPreview: data.inputPreview, outputPreview: data.outputPreview, inputTokens: data.estimatedInputTokens, outputTokens: data.estimatedOutputTokens, errorMessage: data.errorMessage, requesterReferenceId: data.requesterReferenceId, sourceDomain: data.sourceDomain, metadata: data.metadata });
    return legacyLog(record);
  }
  async findLogByPublicId(publicId: string) { const value = await this.findExecution(publicId); return value ? legacyLog(value) : null; }
  async listLogs(filters: any) { const page = await this.listExecutions(filters); return { ...page, data: page.data.map(legacyLog) }; }
}

function normalizeExecution(value: any): AIExecutionRecord { return { ...value, estimatedCost: value.estimatedCost == null ? null : Number(value.estimatedCost), actualCost: value.actualCost == null ? null : Number(value.actualCost) }; }
function legacyLog(value: AIExecutionRecord): AIExecutionLogDto { return { id: value.id, publicId: value.publicId, purpose: value.purpose, promptKey: value.promptKey, providerType: (value.providerKey ?? 'EXTERNAL_LLM') as any, modelReference: value.modelKey ?? 'unassigned', status: value.status, safetyDecision: value.safetyDecision, requesterReferenceId: value.requesterReferenceId, sourceDomain: value.sourceDomain, inputPreview: value.inputPreview, outputPreview: value.outputPreview, estimatedInputTokens: value.inputTokens, estimatedOutputTokens: value.outputTokens, errorMessage: value.errorMessage, metadata: value.metadata, createdAt: value.createdAt, updatedAt: value.updatedAt }; }
function periodStart(period: 'MINUTE' | 'DAY' | 'MONTH') { const value = new Date(); if (period === 'MINUTE') value.setUTCSeconds(0, 0); else if (period === 'DAY') value.setUTCHours(0, 0, 0, 0); else value.setUTCDate(1), value.setUTCHours(0, 0, 0, 0); return value; }
async function appendGovernanceEvidence(tx: any, input: { action: string; actorReferenceId: string; targetId: string; targetType: string; aggregateId: string; payload: Record<string, unknown> }) {
  const now = new Date(); const correlationId = randomUUID();
  await tx.auditRecord.create({ data: { id: randomUUID(), reference: `audit_ai_${randomUUID()}`, action: input.action, category: 'AI_GOVERNANCE', severity: 'INFO', actorId: input.actorReferenceId, actorType: 'IDENTITY', targetId: input.targetId, targetType: input.targetType, source: 'AI_ADMIN_API', timestamp: now, contextMetadata: input.payload, correlationReference: correlationId } });
  await tx.transactionalOutboxRecord.create({ data: { id: randomUUID(), eventType: input.action, domain: 'AI_PLATFORM', aggregateType: input.targetType, aggregateId: input.aggregateId, payload: input.payload, metadata: { actorReferenceId: input.actorReferenceId }, correlationId } });
}
