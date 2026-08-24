import { createHash, randomUUID } from 'node:crypto';
import {
  AIConsumerPolicy, AIEvaluationDefinition,
  AIExecutionRecord, AIExecutionRequestDto, AIExecutionStatus, AIGuardrailDefinition,
  AIKnowledgeIndex, AIKnowledgeSource, AIModelDefinition, AIPlatformResourceValue,
  AIPromptDefinition, AIPromptVersion, AIProviderDefinition, AIProviderInvocationResult,
  AIProviderOperationalStatus, AIRegistryResource, AIRoutingPolicy, AISafetyDecision,
  AIWorkflowDefinition, IAIPlatformRepository, IAIProviderRegistry
} from '@manaratak/domain';

interface AIOrchestrationResponse {
  executionPublicId: string;
  traceId: string;
  status: AIExecutionStatus;
  blockedReason?: string;
  errorCode?: string | null;
  errorMessage?: string | null;
  providerKey?: string | null;
  modelKey?: string | null;
  usage: { inputTokens: number; outputTokens: number; cost?: number | null; currency?: string | null };
  result?: string;
}

export class AIPlatformAdminUseCases {
  constructor(private readonly repository: IAIPlatformRepository, private readonly providers: IAIProviderRegistry) {}

  overview() { return this.repository.overview(); }
  list<T>(resource: AIRegistryResource, filters?: Record<string, unknown>) { return this.repository.list<T>(resource, filters); }
  find<T>(resource: AIRegistryResource, key: string) { return this.repository.find<T>(resource, key); }

  async save<T extends AIPlatformResourceValue>(resource: AIRegistryResource, value: T, actorReferenceId: string) {
    if (!actorReferenceId) throw new Error('Actor reference is required for AI governance changes.');
    if (resource === 'providers') {
      const provider = value as unknown as AIProviderDefinition & { apiKey?: string; secretValue?: string };
      if (provider.apiKey || provider.secretValue) throw new Error('Provider secrets cannot be accepted by the AI Admin API.');
      if (!provider.secretReference?.match(/^[A-Z][A-Z0-9_]+$/)) throw new Error('Provider secretReference must be an environment variable name.');
      provider.operationalStatus = this.providers.get(provider.key)?.status() ?? 'NOT_CONFIGURED';
    }
    return this.repository.upsert(resource, value, actorReferenceId);
  }

  createPromptVersion(value: Omit<AIPromptVersion, 'id' | 'createdAt' | 'checksum'>) {
    if (value.status === 'APPROVED' && !value.approvedBy) throw new Error('approvedBy is required for an approved prompt version.');
    return this.repository.createPromptVersion(value);
  }
  deployPrompt(promptKey: string, version: number, actorReferenceId: string) { return this.repository.deployPrompt(promptKey, version, actorReferenceId); }
  rollbackPrompt(promptKey: string, version: number, actorReferenceId: string) { return this.repository.deployPrompt(promptKey, version, actorReferenceId); }
  executions(filters?: Record<string, unknown>) { return this.repository.listExecutions(filters); }
  execution(publicId: string) { return this.repository.findExecution(publicId); }
  appendIncidentEvent(publicId: string, action: string, actorReferenceId: string, note?: string) { return this.repository.appendIncidentEvent(publicId, { at: new Date(), action, actorReferenceId, note }); }

  providerStatuses(): Array<{ key: string; status: AIProviderOperationalStatus; capabilities: string[] }> {
    return this.providers.list().map((provider) => ({ key: provider.key, status: provider.status(), capabilities: provider.capabilities }));
  }
}

export class AIExecutionOrchestrator {
  private readonly circuitBreaker = new AIProviderCircuitBreaker();
  private readonly guardrails = new EnterpriseAIGuardrailEngine();
  constructor(private readonly repository: IAIPlatformRepository, private readonly providers: IAIProviderRegistry) {}

  async execute(request: AIExecutionRequestDto): Promise<AIOrchestrationResponse> {
    validateExecutionRequest(request);
    const consumerKey = request.consumerKey ?? request.sourceDomain ?? 'default';
    const capabilityKey = request.capabilityKey ?? request.purpose;
    if (request.idempotencyKey) {
      const previous = await this.repository.findExecutionByIdempotency(consumerKey, request.idempotencyKey);
      if (previous) return toExecutionResponse(previous);
    }

    const [prompt, consumer, routing, models, configuredGuardrails] = await Promise.all([
      this.repository.find<AIPromptDefinition>('prompts', request.promptKey),
      this.repository.find<AIConsumerPolicy>('consumers', consumerKey),
      this.findRoutingPolicy(capabilityKey, consumerKey),
      this.repository.list<AIModelDefinition>('models', { status: 'ACTIVE' }),
      this.repository.list<AIGuardrailDefinition>('guardrails', { status: 'ACTIVE' })
    ]);
    if (!prompt || prompt.status !== 'ACTIVE' || !prompt.activeVersion) throw new Error('AI_PROMPT_NOT_DEPLOYED');
    const promptVersion = await this.repository.findPromptVersion(request.promptKey, prompt.activeVersion);
    if (!promptVersion || promptVersion.status !== 'APPROVED') throw new Error('AI_PROMPT_VERSION_NOT_APPROVED');
    if (!consumer || consumer.status !== 'ACTIVE') throw new Error('AI_CONSUMER_NOT_ACTIVE');
    if (!consumer.allowedCapabilities.includes(capabilityKey)) throw new Error('AI_CAPABILITY_NOT_ALLOWED');
    await this.assertQuota(consumer);

    const publicId = `ai_${randomUUID()}`;
    const traceId = randomUUID();
    const safety = this.guardrails.evaluateInput(request.input, configuredGuardrails);
    let execution = await this.repository.createExecution({
      publicId, traceId, idempotencyKey: request.idempotencyKey, consumerKey, capabilityKey,
      purpose: request.purpose, promptKey: request.promptKey, promptVersion: prompt.activeVersion,
      status: safety.decision === AISafetyDecision.BLOCKED ? AIExecutionStatus.BLOCKED : AIExecutionStatus.RECEIVED,
      safetyDecision: safety.decision, inputPreview: preview(safety.value), outputPreview: null,
      inputTokens: estimateTokens(safety.value), outputTokens: 0, requesterReferenceId: request.requesterReferenceId,
      sourceDomain: request.sourceDomain, metadata: sanitizeMetadata(request.metadata)
    });
    if (safety.decision === AISafetyDecision.BLOCKED) return toExecutionResponse(execution, safety.reasons.join(' '));
    execution = await this.repository.updateExecution(publicId, { status: AIExecutionStatus.RUNNING });

    const candidates = this.route(routing, models, consumer);
    let lastError: Error | null = null;
    for (const candidate of candidates) {
      const adapter = this.providers.get(candidate.providerKey);
      if (!adapter || adapter.status() !== 'READY' || !this.circuitBreaker.canAttempt(candidate.providerKey)) continue;
      const spanStarted = new Date();
      try {
        const result = await adapter.invoke({ model: candidate.providerModelId, systemPrompt: renderPrompt(promptVersion.template, safety.value, request.locale), input: safety.value, maxOutputTokens: request.maxOutputTokens, structuredOutputSchema: request.structuredOutputSchema ?? promptVersion.outputSchema, metadata: request.metadata });
        const outputSafety = this.guardrails.evaluateOutput(result.output, configuredGuardrails);
        if (outputSafety.decision === AISafetyDecision.BLOCKED) throw new Error('AI_OUTPUT_BLOCKED');
        validateStructuredOutput(outputSafety.value, request.structuredOutputSchema ?? promptVersion.outputSchema);
        const cost = estimateCost(candidate, result);
        await this.repository.recordUsage({ executionPublicId: publicId, providerKey: candidate.providerKey, modelKey: candidate.key, inputTokens: result.inputTokens, outputTokens: result.outputTokens, cost, currency: candidate.currency ?? 'USD' });
        await this.repository.appendSpan({ executionPublicId: publicId, traceId, name: `provider:${candidate.providerKey}`, status: 'COMPLETED', startedAt: spanStarted, completedAt: new Date(), durationMs: Date.now() - spanStarted.getTime(), attributes: { modelKey: candidate.key } });
        this.circuitBreaker.success(candidate.providerKey);
        execution = await this.repository.updateExecution(publicId, { providerKey: candidate.providerKey, modelKey: candidate.key, status: AIExecutionStatus.COMPLETED, safetyDecision: mergeSafety(safety.decision, outputSafety.decision), outputPreview: preview(outputSafety.value), inputTokens: result.inputTokens, outputTokens: result.outputTokens, actualCost: cost, currency: candidate.currency ?? 'USD', metadata: { ...(execution.metadata ?? {}), providerRequestId: result.providerRequestId, finishReason: result.finishReason } });
        return { ...toExecutionResponse(execution), result: outputSafety.value };
      } catch (error) {
        lastError = error as Error;
        this.circuitBreaker.failure(candidate.providerKey);
        await this.repository.appendSpan({ executionPublicId: publicId, traceId, name: `provider:${candidate.providerKey}`, status: 'FAILED', startedAt: spanStarted, completedAt: new Date(), durationMs: Date.now() - spanStarted.getTime(), attributes: { error: safeError(lastError), modelKey: candidate.key } });
      }
    }
    execution = await this.repository.updateExecution(publicId, { status: AIExecutionStatus.FAILED, errorCode: lastError?.message.startsWith('AI_') ? lastError.message : 'AI_PROVIDER_UNAVAILABLE', errorMessage: safeError(lastError ?? new Error('No configured provider route is available.')) });
    return toExecutionResponse(execution);
  }

  async submitAsync(request: AIExecutionRequestDto) {
    validateExecutionRequest(request);
    const consumerKey = request.consumerKey ?? request.sourceDomain ?? 'default';
    const existing = request.idempotencyKey ? await this.repository.findExecutionByIdempotency(consumerKey, request.idempotencyKey) : null;
    if (existing) return toExecutionResponse(existing);
    const record = await this.repository.createExecution({ publicId: `ai_${randomUUID()}`, traceId: randomUUID(), idempotencyKey: request.idempotencyKey, consumerKey, capabilityKey: request.capabilityKey ?? request.purpose, purpose: request.purpose, promptKey: request.promptKey, status: AIExecutionStatus.QUEUED, safetyDecision: AISafetyDecision.ALLOWED, inputPreview: preview(request.input), outputPreview: null, inputTokens: estimateTokens(request.input), outputTokens: 0, requesterReferenceId: request.requesterReferenceId, sourceDomain: request.sourceDomain, metadata: { ...sanitizeMetadata(request.metadata), queuedPayload: { ...request, input: request.input } } });
    return toExecutionResponse(record);
  }
  find(publicId: string) { return this.repository.findExecution(publicId); }
  list(filters?: Record<string, unknown>) { return this.repository.listExecutions(filters); }
  listLogs(filters?: Record<string, unknown>) { return this.repository.listExecutions(filters); }
  async cancel(publicId: string) { const value = await this.repository.findExecution(publicId); if (!value) throw new Error('AI_EXECUTION_NOT_FOUND'); if (![AIExecutionStatus.RECEIVED, AIExecutionStatus.QUEUED, AIExecutionStatus.RUNNING, AIExecutionStatus.RETRYING].includes(value.status)) throw new Error('AI_EXECUTION_NOT_CANCELLABLE'); return this.repository.updateExecution(publicId, { status: AIExecutionStatus.CANCELLED }); }

  private async findRoutingPolicy(capabilityKey: string, consumerKey: string) { const values = await this.repository.list<AIRoutingPolicy>('routingPolicies', { status: 'ACTIVE' }); return values.find((item) => item.capabilityKey === capabilityKey && item.consumerKey === consumerKey) ?? values.find((item) => item.capabilityKey === capabilityKey && !item.consumerKey) ?? null; }
  private route(policy: AIRoutingPolicy | null, models: AIModelDefinition[], consumer: AIConsumerPolicy) { if (!policy) return []; return policy.targets.filter((target) => target.enabled).sort((a, b) => a.priority - b.priority).slice(0, policy.maxAttempts).map((target) => models.find((model) => model.key === target.modelKey)).filter((model): model is AIModelDefinition => !!model && (!consumer.allowedModels?.length || consumer.allowedModels.includes(model.key))); }
  private async assertQuota(policy: AIConsumerPolicy) { const [minute, day, month] = await Promise.all([this.repository.quotaUsage(policy.consumerKey, 'MINUTE'), this.repository.quotaUsage(policy.consumerKey, 'DAY'), this.repository.quotaUsage(policy.consumerKey, 'MONTH')]); if (minute.requests >= policy.requestsPerMinute) throw new Error('AI_RATE_LIMIT_EXCEEDED'); if (day.requests >= policy.dailyRequestLimit) throw new Error('AI_DAILY_QUOTA_EXCEEDED'); if (month.tokens >= policy.monthlyTokenLimit) throw new Error('AI_MONTHLY_TOKEN_BUDGET_EXCEEDED'); if (policy.monthlyCostLimit != null && month.cost >= policy.monthlyCostLimit) throw new Error('AI_MONTHLY_COST_BUDGET_EXCEEDED'); }
}

export class AIWorkflowUseCases {
  constructor(private readonly repository: IAIPlatformRepository, private readonly execution: AIExecutionOrchestrator) {}
  async start(workflowKey: string, input: Record<string, unknown>) { const workflow = await this.repository.find<AIWorkflowDefinition>('workflows', workflowKey); if (!workflow || workflow.status !== 'ACTIVE' || !workflow.activeVersion) throw new Error('AI_WORKFLOW_NOT_ACTIVE'); return this.repository.createWorkflowRun({ publicId: `aiw_${randomUUID()}`, workflowKey, workflowVersion: workflow.activeVersion, status: 'QUEUED', traceId: randomUUID(), input, output: null }); }
  async run(publicId: string) { const run = await this.repository.findWorkflowRun(publicId); if (!run) throw new Error('AI_WORKFLOW_RUN_NOT_FOUND'); const workflow = await this.repository.find<AIWorkflowDefinition>('workflows', run.workflowKey); if (!workflow) throw new Error('AI_WORKFLOW_NOT_FOUND'); await this.repository.updateWorkflowRun(publicId, { status: 'RUNNING' }); const outputs: Record<string, unknown> = {}; for (const step of workflow.definition.steps) { const response = await this.execution.execute({ purpose: 'TOOL_ASSISTANCE' as any, promptKey: step.promptKey, capabilityKey: step.capabilityKey, consumerKey: 'workflow', input: JSON.stringify({ workflowInput: run.input, previousOutputs: outputs }), idempotencyKey: `${publicId}:${step.key}` }); if (response.status !== AIExecutionStatus.COMPLETED) return this.repository.updateWorkflowRun(publicId, { status: 'FAILED', currentStep: step.key, errorMessage: response.errorMessage ?? 'Workflow step failed.' }); outputs[step.key] = response.result; await this.repository.updateWorkflowRun(publicId, { currentStep: step.key }); } return this.repository.updateWorkflowRun(publicId, { status: 'COMPLETED', output: outputs }); }
}

export class AIEvaluationUseCases {
  constructor(private readonly repository: IAIPlatformRepository, private readonly execution: AIExecutionOrchestrator) {}
  async start(evaluationKey: string, options: { promptVersion?: number; modelKey?: string } = {}) { const definition = await this.repository.find<AIEvaluationDefinition>('evaluations', evaluationKey); if (!definition || definition.status !== 'ACTIVE') throw new Error('AI_EVALUATION_NOT_ACTIVE'); return this.repository.createEvaluationRun({ publicId: `aiev_${randomUUID()}`, evaluationKey, status: 'QUEUED', promptVersion: options.promptVersion, modelKey: options.modelKey, passed: 0, failed: 0, score: null, results: null }); }
  async run(publicId: string, definition: AIEvaluationDefinition, promptKey: string) { await this.repository.updateEvaluationRun(publicId, { status: 'RUNNING' }); const results: Record<string, unknown>[] = []; let passed = 0; for (const item of definition.dataset) { const response = await this.execution.execute({ purpose: 'TOOL_ASSISTANCE' as any, promptKey, capabilityKey: definition.capabilityKey, consumerKey: 'evaluation', input: item.input, idempotencyKey: `${publicId}:${item.key}` }); const ok = response.status === AIExecutionStatus.COMPLETED && definition.evaluators.every((evaluator) => evaluator.type !== 'EXACT_MATCH' || response.result === item.expected); results.push({ key: item.key, passed: ok, executionPublicId: response.executionPublicId }); if (ok) passed += 1; } return this.repository.updateEvaluationRun(publicId, { status: 'COMPLETED', passed, failed: definition.dataset.length - passed, score: definition.dataset.length ? passed / definition.dataset.length : 0, results, completedAt: new Date() }); }
}

export class AIKnowledgeUseCases {
  constructor(private readonly repository: IAIPlatformRepository, private readonly providers: IAIProviderRegistry) {}
  async index(input: { indexKey: string; sourceType: string; sourceReferenceId: string; sourceVersion?: string; locale?: string; content: string; actorReferenceId: string }) {
    const index = await this.repository.find<AIKnowledgeIndex>('knowledgeIndexes', input.indexKey);
    if (!index || index.status !== 'ACTIVE') throw new Error('AI_KNOWLEDGE_INDEX_NOT_ACTIVE');
    const model = await this.repository.find<AIModelDefinition>('models', index.embeddingModelKey);
    if (!model || model.status !== 'ACTIVE') throw new Error('AI_EMBEDDING_MODEL_NOT_ACTIVE');
    const adapter = this.providers.get(model.providerKey);
    if (!adapter || adapter.status() !== 'READY' || !adapter.embed) throw new Error('AI_EMBEDDING_PROVIDER_NOT_CONFIGURED');
    const sourceChecksum = sha256(input.content);
    const source: AIKnowledgeSource = { id: '', indexKey: input.indexKey, sourceType: input.sourceType, sourceReferenceId: input.sourceReferenceId, sourceVersion: input.sourceVersion, checksum: sourceChecksum, locale: input.locale, status: 'PENDING', metadata: { canonicalSourceOnly: true } };
    await this.repository.upsert('knowledgeSources', { ...source, key: `${input.indexKey}:${input.sourceType}:${input.sourceReferenceId}` } as any, input.actorReferenceId);
    const chunks = chunkText(input.content, Number(index.chunkingStrategy.maxCharacters ?? 1600), Number(index.chunkingStrategy.overlapCharacters ?? 160));
    const run = await this.repository.createIndexingRun({ publicId: `aiidx_${randomUUID()}`, indexKey: input.indexKey, sourceReferenceId: input.sourceReferenceId, status: 'RUNNING', chunks: chunks.length, embeddedChunks: 0 });
    try {
      const result = await adapter.embed({ model: model.providerModelId, inputs: chunks, dimensions: index.dimensions });
      if (result.embeddings.length !== chunks.length) throw new Error('AI_EMBEDDING_COUNT_MISMATCH');
      await this.repository.replaceEmbeddings({ indexKey: input.indexKey, sourceReferenceId: input.sourceReferenceId, modelKey: model.key, dimensions: index.dimensions, chunks: chunks.map((text, position) => ({ chunkKey: `${position + 1}`, chunkText: text, embeddingRef: sha256(JSON.stringify(result.embeddings[position])), checksum: sha256(text), metadata: { position, vector: result.embeddings[position], sourceChecksum } })) });
      await this.repository.upsert('knowledgeSources', { ...source, key: `${input.indexKey}:${input.sourceType}:${input.sourceReferenceId}`, status: 'INDEXED', metadata: { canonicalSourceOnly: true, chunks: chunks.length, modelKey: model.key } } as any, input.actorReferenceId);
      return this.repository.updateIndexingRun(run.publicId, { status: 'COMPLETED', embeddedChunks: chunks.length, completedAt: new Date() });
    } catch (error) {
      await this.repository.updateIndexingRun(run.publicId, { status: 'FAILED', errorMessage: safeError(error as Error), completedAt: new Date() });
      throw error;
    }
  }
}

export class EnterpriseAIGuardrailEngine {
  evaluateInput(value: string, guardrails: AIGuardrailDefinition[]) { return this.evaluate(value, guardrails.filter((item) => item.stage !== 'OUTPUT')); }
  evaluateOutput(value: string, guardrails: AIGuardrailDefinition[]) { return this.evaluate(value, guardrails.filter((item) => item.stage !== 'INPUT')); }
  private evaluate(input: string, guardrails: AIGuardrailDefinition[]) {
    let value = input; const reasons: string[] = []; let decision = AISafetyDecision.ALLOWED;
    const pii = [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, /\+?\d[\d\s()-]{7,}\d/g, /\b(?:\d[ -]*?){13,19}\b/g];
    for (const pattern of pii) if (pattern.test(value)) { value = value.replace(pattern, '[REDACTED]'); decision = AISafetyDecision.REDACTED; reasons.push('PII_REDACTED'); }
    const injection = /(ignore|disregard).{0,30}(instructions|system prompt)|reveal.{0,20}(prompt|secret)|developer message/iu;
    if (injection.test(value)) { decision = AISafetyDecision.BLOCKED; reasons.push('PROMPT_INJECTION'); }
    for (const guardrail of guardrails) { const patterns = Array.isArray(guardrail.rules.patterns) ? guardrail.rules.patterns as string[] : []; if (patterns.some((pattern) => new RegExp(pattern, 'iu').test(value))) { reasons.push(guardrail.key); if (guardrail.action === 'BLOCK' || guardrail.action === 'REQUIRE_REVIEW') decision = AISafetyDecision.BLOCKED; if (guardrail.action === 'REDACT' && decision !== AISafetyDecision.BLOCKED) decision = AISafetyDecision.REDACTED; } }
    return { decision, value, reasons };
  }
}

export class AIProviderCircuitBreaker {
  private readonly states = new Map<string, { failures: number; openedAt?: number }>();
  constructor(private readonly threshold = 3, private readonly resetAfterMs = 30_000) {}
  canAttempt(key: string) { const state = this.states.get(key); if (!state?.openedAt) return true; if (Date.now() - state.openedAt >= this.resetAfterMs) { this.states.set(key, { failures: 0 }); return true; } return false; }
  success(key: string) { this.states.set(key, { failures: 0 }); }
  failure(key: string) { const previous = this.states.get(key) ?? { failures: 0 }; const failures = previous.failures + 1; this.states.set(key, { failures, openedAt: failures >= this.threshold ? Date.now() : previous.openedAt }); }
}

function validateExecutionRequest(request: AIExecutionRequestDto) { if (!request.promptKey?.trim()) throw new Error('AI promptKey is required.'); if (!request.input?.trim()) throw new Error('AI input is required.'); if (request.input.length > 100_000) throw new Error('AI input exceeds the source safety limit.'); }
function validateStructuredOutput(value: string, schema?: Record<string, unknown> | null) {
  if (!schema) return;
  let parsed: unknown;
  try { parsed = JSON.parse(value); } catch { throw new Error('AI_STRUCTURED_OUTPUT_INVALID_JSON'); }
  if (schema.type === 'object') {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('AI_STRUCTURED_OUTPUT_SCHEMA_MISMATCH');
    const record = parsed as Record<string, unknown>;
    const required = Array.isArray(schema.required) ? schema.required.filter((item): item is string => typeof item === 'string') : [];
    if (required.some((key) => !(key in record))) throw new Error('AI_STRUCTURED_OUTPUT_SCHEMA_MISMATCH');
    const properties = schema.properties && typeof schema.properties === 'object' ? schema.properties as Record<string, { type?: string }> : {};
    for (const [key, definition] of Object.entries(properties)) if (key in record && definition.type && !matchesJsonType(record[key], definition.type)) throw new Error('AI_STRUCTURED_OUTPUT_SCHEMA_MISMATCH');
  }
}
function matchesJsonType(value: unknown, type: string) { if (type === 'array') return Array.isArray(value); if (type === 'integer') return Number.isInteger(value); if (type === 'null') return value === null; if (type === 'object') return !!value && typeof value === 'object' && !Array.isArray(value); return typeof value === type; }
function estimateTokens(value: string) { return Math.max(1, Math.ceil(value.length / 4)); }
function estimateCost(model: AIModelDefinition, result: AIProviderInvocationResult) { return (result.inputTokens * Number(model.inputPricePerMillion ?? 0) + result.outputTokens * Number(model.outputPricePerMillion ?? 0)) / 1_000_000; }
function preview(value: string) { return value.slice(0, 500); }
function sanitizeMetadata(value?: Record<string, unknown> | null) { if (!value) return null; const output = { ...value }; for (const key of Object.keys(output)) if (/secret|token|api.?key|password|authorization/i.test(key)) output[key] = '[REDACTED]'; return output; }
function safeError(error: Error) { return error.message.replace(/(sk-[A-Za-z0-9_-]+|Bearer\s+\S+)/g, '[REDACTED]'); }
function mergeSafety(a: AISafetyDecision, b: AISafetyDecision) { return a === AISafetyDecision.BLOCKED || b === AISafetyDecision.BLOCKED ? AISafetyDecision.BLOCKED : a === AISafetyDecision.REDACTED || b === AISafetyDecision.REDACTED ? AISafetyDecision.REDACTED : AISafetyDecision.ALLOWED; }
function toExecutionResponse(value: AIExecutionRecord, blockedReason?: string) { return { executionPublicId: value.publicId, traceId: value.traceId, status: value.status, blockedReason, errorCode: value.errorCode, errorMessage: value.errorMessage, providerKey: value.providerKey, modelKey: value.modelKey, usage: { inputTokens: value.inputTokens, outputTokens: value.outputTokens, cost: value.actualCost, currency: value.currency } }; }
function sha256(value: string) { return createHash('sha256').update(value).digest('hex'); }
function chunkText(value: string, maxCharacters: number, overlapCharacters: number) { const max = Math.max(200, Math.min(8000, maxCharacters)); const overlap = Math.max(0, Math.min(max - 1, overlapCharacters)); const chunks: string[] = []; for (let start = 0; start < value.length; start += max - overlap) { const chunk = value.slice(start, start + max).trim(); if (chunk) chunks.push(chunk); if (start + max >= value.length) break; } return chunks; }
function renderPrompt(template: string, input: string, locale?: string | null) { return template.replaceAll('{{input}}', input).replaceAll('{{locale}}', locale ?? 'ar'); }
