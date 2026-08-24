import { createHash, randomUUID } from 'node:crypto';
import {
  AICapabilityDefinition, AIConsumerPolicy, AIDataClassification, AIEvaluationDefinition,
  AIExecutionRecord, AIExecutionRequestDto, AIExecutionStatus, AIGuardrailDefinition,
  AIKnowledgeIndex, AIKnowledgeSource, AIModelDefinition, AIPlatformResourceValue,
  AIModelPrice, AIPromptDefinition, AIPromptVersion, AIProviderDefinition, AIProviderInvocationResult,
  AIProviderOperationalStatus, AIRegistryResource, AIRoutingPolicy, AISafetyDecision,
  AIWorkflowDefinition, IAIAsyncPayloadProtector, IAIPlatformRepository, IAIProviderRegistry
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
    assertNoSecretMaterial(value);
    const governed = value as unknown as Record<string, unknown>;
    if (resource === 'prompts' && (governed.status === 'ACTIVE' || governed.activeVersion != null))
      throw new Error('AI_PROMPT_ACTIVATION_REQUIRES_DEPLOYMENT_ENDPOINT');
    if (resource === 'models' && governed.status === 'ACTIVE' && governed.productionApproved !== true)
      throw new Error('AI_MODEL_PRODUCTION_APPROVAL_REQUIRED');
    if (resource === 'routingPolicies' && governed.status === 'ACTIVE') {
      const targets = Array.isArray(governed.targets) ? governed.targets : [];
      if (!targets.some((target) => target && typeof target === 'object' && (target as Record<string, unknown>).enabled === true))
        throw new Error('AI_ROUTING_ACTIVE_TARGET_REQUIRED');
    }
    if (resource === 'providers') {
      const provider = value as unknown as AIProviderDefinition & { apiKey?: string; secretValue?: string };
      if (provider.apiKey || provider.secretValue) throw new Error('Provider secrets cannot be accepted by the AI Admin API.');
      if (!provider.secretReference?.match(/^[A-Z][A-Z0-9_]+$/)) throw new Error('Provider secretReference must be an environment variable name.');
      provider.operationalStatus = this.providers.get(provider.key)?.status() ?? 'NOT_CONFIGURED';
    }
    return this.repository.upsert(resource, value, actorReferenceId);
  }

  createPromptVersion(value: Omit<AIPromptVersion, 'id' | 'createdAt' | 'checksum'>) {
    if (value.status === 'APPROVED') throw new Error('AI_PROMPT_APPROVAL_REQUIRES_APPROVAL_ENDPOINT');
    return this.repository.createPromptVersion(value);
  }
  approvePromptVersion(promptKey: string, version: number, actorReferenceId: string) { return this.repository.approvePromptVersion(promptKey, version, actorReferenceId); }
  async deployPrompt(promptKey: string, version: number, actorReferenceId: string) {
    const evaluations = await this.repository.list<AIEvaluationDefinition>('evaluations', { status: 'ACTIVE' });
    for (const evaluation of evaluations.filter((item) => item.target.type === 'PROMPT' && item.target.key === promptKey && item.deploymentGate)) {
      const run = await this.repository.findLatestEvaluationRun(evaluation.key, version);
      if (!run || run.score == null || run.score < evaluation.deploymentGate!.minimumScore || run.safetyFailures > evaluation.deploymentGate!.maximumSafetyFailures) throw new Error(`AI_EVALUATION_DEPLOYMENT_GATE_FAILED:${evaluation.key}`);
      if (evaluation.deploymentGate!.requiresHumanApproval && !run.approvedBy) throw new Error(`AI_EVALUATION_HUMAN_APPROVAL_REQUIRED:${evaluation.key}`);
    }
    return this.repository.deployPrompt(promptKey, version, actorReferenceId);
  }
  rollbackPrompt(promptKey: string, version: number, actorReferenceId: string) { return this.deployPrompt(promptKey, version, actorReferenceId); }
  executions(filters?: Record<string, unknown>) { return this.repository.listExecutions(filters); }
  execution(publicId: string) { return this.repository.findExecution(publicId); }
  executionTrace(publicId: string) { return this.repository.listExecutionSpans(publicId); }
  appendIncidentEvent(publicId: string, action: string, actorReferenceId: string, note?: string) { return this.repository.appendIncidentEvent(publicId, { at: new Date(), action, actorReferenceId, note }); }

  providerStatuses(): Array<{ key: string; status: AIProviderOperationalStatus; capabilities: string[] }> {
    return this.providers.list().map((provider) => ({ key: provider.key, status: provider.status(), capabilities: provider.capabilities }));
  }
}

export class AIExecutionOrchestrator {
  private readonly circuitBreaker = new AIProviderCircuitBreaker();
  private readonly guardrails = new EnterpriseAIGuardrailEngine();
  constructor(private readonly repository: IAIPlatformRepository, private readonly providers: IAIProviderRegistry, private readonly asyncPayloads?: IAIAsyncPayloadProtector) {}

  async execute(request: AIExecutionRequestDto): Promise<AIOrchestrationResponse> {
    validateExecutionRequest(request);
    const consumerKey = request.consumerKey ?? request.sourceDomain ?? 'default';
    const capabilityKey = request.capabilityKey ?? request.purpose;
    const dataClassification = normalizeDataClassification(
      request.dataClassification ?? request.metadata?.dataClassification,
    );
    const idempotencyKeyHash = request.idempotencyKey
      ? sha256(`${consumerKey}:${request.idempotencyKey}`)
      : null;
    if (idempotencyKeyHash) {
      const previous = await this.repository.findExecutionByIdempotency(consumerKey, idempotencyKeyHash);
      if (previous) return toExecutionResponse(previous);
    }

    const [platformSettings, prompt, consumer, capability, routing, models, providerDefinitions, prices, configuredGuardrails] = await Promise.all([
      this.repository.find<{ key: string; globalEnabled?: boolean }>('platformSettings', 'runtime'),
      this.repository.find<AIPromptDefinition>('prompts', request.promptKey),
      this.repository.find<AIConsumerPolicy>('consumers', consumerKey),
      this.repository.find<AICapabilityDefinition>('capabilities', capabilityKey),
      this.findRoutingPolicy(capabilityKey, consumerKey),
      this.repository.list<AIModelDefinition>('models', { status: 'ACTIVE' }),
      this.repository.list<AIProviderDefinition>('providers', { status: 'ACTIVE' }),
      this.repository.list<AIModelPrice>('modelPrices', { status: 'ACTIVE' }),
      this.repository.list<AIGuardrailDefinition>('guardrails', { status: 'ACTIVE' })
    ]);
    if (platformSettings?.globalEnabled === false) throw new Error('AI_PLATFORM_EMERGENCY_DISABLED');
    if (!prompt || prompt.status !== 'ACTIVE' || !prompt.activeVersion) throw new Error('AI_PROMPT_NOT_DEPLOYED');
    const promptVersion = await this.repository.findPromptVersion(request.promptKey, prompt.activeVersion);
    if (!promptVersion || promptVersion.status !== 'APPROVED') throw new Error('AI_PROMPT_VERSION_NOT_APPROVED');
    if (!consumer || consumer.status !== 'ACTIVE') throw new Error('AI_CONSUMER_NOT_ACTIVE');
    if (!consumer.allowedCapabilities.includes(capabilityKey)) throw new Error('AI_CAPABILITY_NOT_ALLOWED');
    if (!capability || capability.status !== 'ACTIVE') throw new Error('AI_CAPABILITY_DISABLED');
    if (capability.allowedDataClassifications?.length && !capability.allowedDataClassifications.includes(dataClassification)) throw new Error('AI_DATA_CLASSIFICATION_NOT_ALLOWED');
    if (consumer.allowedDataClassifications?.length && !consumer.allowedDataClassifications.includes(dataClassification)) throw new Error('AI_CONSUMER_DATA_CLASSIFICATION_NOT_ALLOWED');
    await this.assertQuota(consumer);

    const publicId = `ai_${randomUUID()}`;
    const traceId = randomUUID();
    const safety = this.guardrails.evaluateInput(request.input, configuredGuardrails);
    let execution = await this.repository.createExecution({
      publicId, traceId, idempotencyKeyHash, consumerKey, capabilityKey,
      purpose: request.purpose, promptKey: request.promptKey, promptVersion: prompt.activeVersion,
      status: safety.decision === AISafetyDecision.BLOCKED ? AIExecutionStatus.BLOCKED : AIExecutionStatus.RECEIVED,
      safetyDecision: safety.decision, dataClassification,
      inputPreview: privacyPreview(safety.value, dataClassification), outputPreview: null,
      inputTokens: estimateTokens(safety.value), outputTokens: 0, requesterReferenceId: request.requesterReferenceId,
      sourceDomain: request.sourceDomain, metadata: sanitizeMetadata({ ...(request.metadata ?? {}), dataClassification })
    });
    await this.repository.appendSpan({ executionPublicId: publicId, traceId, name: 'AUTHORIZATION', status: 'COMPLETED', startedAt: new Date(), completedAt: new Date(), durationMs: 0, attributes: { consumerKey, capabilityKey, dataClassification } });
    await this.repository.appendSpan({ executionPublicId: publicId, traceId, name: 'PRE_SAFETY', status: safety.decision === AISafetyDecision.BLOCKED ? 'FAILED' : 'COMPLETED', startedAt: new Date(), completedAt: new Date(), durationMs: 0, attributes: { decision: safety.decision, reasons: safety.reasons } });
    if (safety.decision === AISafetyDecision.BLOCKED) return toExecutionResponse(execution, safety.reasons.join(' '));
    execution = await this.repository.updateExecution(publicId, { status: AIExecutionStatus.RUNNING });

    const candidates = this.route(routing, models, providerDefinitions, consumer, capability, dataClassification, traceId);
    await this.repository.appendSpan({ executionPublicId: publicId, traceId, name: 'PROMPT_RESOLUTION', status: 'COMPLETED', startedAt: new Date(), completedAt: new Date(), durationMs: 0, attributes: { promptKey: prompt.key, promptVersion: prompt.activeVersion } });
    await this.repository.appendSpan({ executionPublicId: publicId, traceId, name: 'ROUTING', status: candidates.length ? 'COMPLETED' : 'FAILED', startedAt: new Date(), completedAt: new Date(), durationMs: 0, attributes: { candidateCount: candidates.length, policyKey: routing?.key ?? null, explanation: candidates.map((item) => `${item.provider.key}/${item.model.key}`) } });
    let lastError: Error | null = null;
    let totalAttempts = 0;
    const maxAttempts = Math.max(1, Math.min(8, routing?.maxAttempts ?? 1));
    for (const candidate of candidates) {
      const adapter = this.providers.get(candidate.provider.key);
      const breakerKey = `${candidate.provider.key}:${candidate.model.key}`;
      if (!adapter || adapter.status() !== 'READY' || !this.circuitBreaker.canAttempt(breakerKey)) continue;
      const candidateAttempts = Math.max(1, Math.min(candidate.provider.maxRetries + 1, maxAttempts - totalAttempts));
      for (let attempt = 1; attempt <= candidateAttempts && totalAttempts < maxAttempts; attempt += 1) {
        totalAttempts += 1;
        const spanStarted = new Date();
        try {
        const result = await adapter.invoke({ model: candidate.model.providerModelId, systemPrompt: renderPrompt(promptVersion.template, safety.value, request.locale), input: safety.value, maxOutputTokens: request.maxOutputTokens, structuredOutputSchema: request.structuredOutputSchema ?? promptVersion.outputSchema, metadata: sanitizeMetadata(request.metadata), timeoutMs: Math.min(candidate.provider.timeoutMs, candidate.target.maxLatencyMs ?? candidate.provider.timeoutMs) });
        const outputSafety = this.guardrails.evaluateOutput(result.output, configuredGuardrails);
        if (outputSafety.decision === AISafetyDecision.BLOCKED) throw new Error('AI_OUTPUT_BLOCKED');
        validateStructuredOutput(outputSafety.value, request.structuredOutputSchema ?? promptVersion.outputSchema);
        const price = selectPriceSnapshot(prices, candidate.model.key, new Date());
        const cost = estimateCost(candidate.model, result, price);
        const currency = price?.currency ?? candidate.model.currency ?? 'USD';
        await this.repository.recordUsage({ executionPublicId: publicId, providerKey: candidate.provider.key, modelKey: candidate.model.key, inputTokens: result.inputTokens, outputTokens: result.outputTokens, cost, currency, priceSnapshotKey: price?.key ?? null, pricingEffectiveFrom: price?.effectiveFrom ?? null, costKind: price ? 'ACTUAL' : candidate.model.inputPricePerMillion != null || candidate.model.outputPricePerMillion != null ? 'ESTIMATED' : 'UNKNOWN' });
        await this.repository.appendSpan({ executionPublicId: publicId, traceId, name: 'PROVIDER_CALL', status: 'COMPLETED', startedAt: spanStarted, completedAt: new Date(), durationMs: Date.now() - spanStarted.getTime(), attributes: { providerKey: candidate.provider.key, modelKey: candidate.model.key, attempt } });
        await this.repository.appendSpan({ executionPublicId: publicId, traceId, name: 'OUTPUT_VALIDATION', status: 'COMPLETED', startedAt: new Date(), completedAt: new Date(), durationMs: 0, attributes: { structured: Boolean(request.structuredOutputSchema ?? promptVersion.outputSchema) } });
        await this.repository.appendSpan({ executionPublicId: publicId, traceId, name: 'POST_SAFETY', status: 'COMPLETED', startedAt: new Date(), completedAt: new Date(), durationMs: 0, attributes: { decision: outputSafety.decision } });
        this.circuitBreaker.success(breakerKey);
        execution = await this.repository.updateExecution(publicId, { providerKey: candidate.provider.key, modelKey: candidate.model.key, status: AIExecutionStatus.COMPLETED, safetyDecision: mergeSafety(safety.decision, outputSafety.decision), outputPreview: privacyPreview(outputSafety.value, dataClassification), inputTokens: result.inputTokens, outputTokens: result.outputTokens, actualCost: cost, currency, metadata: sanitizeMetadata({ ...(execution.metadata ?? {}), providerRequestId: result.providerRequestId, finishReason: result.finishReason, priceSnapshotKey: price?.key ?? null }) });
        return { ...toExecutionResponse(execution), result: outputSafety.value };
      } catch (error) {
        lastError = error as Error;
        this.circuitBreaker.failure(breakerKey);
        await this.repository.appendSpan({ executionPublicId: publicId, traceId, name: 'PROVIDER_CALL', status: 'FAILED', startedAt: spanStarted, completedAt: new Date(), durationMs: Date.now() - spanStarted.getTime(), attributes: { error: safeError(lastError), providerKey: candidate.provider.key, modelKey: candidate.model.key, attempt } });
        if (!isRetryable(lastError) || attempt >= candidateAttempts) break;
        await boundedBackoff(attempt);
      }
      }
    }
    execution = await this.repository.updateExecution(publicId, { status: AIExecutionStatus.FAILED, errorCode: lastError?.message.startsWith('AI_') ? lastError.message : 'AI_PROVIDER_UNAVAILABLE', errorMessage: safeError(lastError ?? new Error('No configured provider route is available.')) });
    return toExecutionResponse(execution);
  }

  /** Capability-only entry point for downstream phases. Prompt/provider selection remains owned by Phase 17. */
  async executeCapability(request: { consumerKey: string; capabilityKey: string; input: string; locale?: string | null; requesterReferenceId?: string | null; sourceDomain: string; metadata?: Record<string, unknown> | null; idempotencyKey?: string | null; structuredOutputSchema?: Record<string, unknown> | null; dataClassification?: AIDataClassification | null }): Promise<AIOrchestrationResponse> {
    const prompts = await this.repository.list<AIPromptDefinition>('prompts', { status: 'ACTIVE' });
    const prompt = prompts.find((item) => item.capabilityKey === request.capabilityKey && item.activeVersion != null);
    if (!prompt) throw new Error('AI_CAPABILITY_NOT_CONFIGURED');
    return this.execute({ ...request, promptKey: prompt.key, purpose: prompt.purpose });
  }

  async submitAsync(request: AIExecutionRequestDto) {
    validateExecutionRequest(request);
    if (!request.requesterReferenceId) throw new Error('AI_AUTHENTICATED_REQUESTER_REQUIRED');
    if (!this.asyncPayloads || this.asyncPayloads.status() !== 'READY') throw new Error('AI_ASYNC_QUEUE_NOT_CONFIGURED');
    const consumerKey = request.consumerKey ?? request.sourceDomain ?? 'default';
    const capabilityKey = request.capabilityKey ?? request.purpose;
    const [consumer, capability] = await Promise.all([
      this.repository.find<AIConsumerPolicy>('consumers', consumerKey),
      this.repository.find<AICapabilityDefinition>('capabilities', capabilityKey),
    ]);
    if (!consumer || consumer.status !== 'ACTIVE' || consumer.allowAsyncJobs !== true) throw new Error('AI_ASYNC_NOT_ALLOWED');
    if (!consumer.allowedCapabilities.includes(capabilityKey) || !capability || capability.status !== 'ACTIVE') throw new Error('AI_CAPABILITY_NOT_ALLOWED');
    assertNoSecretMaterial(request.metadata ?? {});
    const protectedPayload = this.asyncPayloads.protect(request);
    return this.repository.createAsyncJob({
      publicId: `aij_${randomUUID()}`, requesterReferenceId: request.requesterReferenceId,
      consumerKey, capabilityKey, status: 'QUEUED', payloadCiphertext: protectedPayload.ciphertext,
      payloadIv: protectedPayload.iv, payloadAuthTag: protectedPayload.authTag,
      payloadKeyVersion: protectedPayload.keyVersion, attempts: 0, maxAttempts: 3,
      nextAttemptAt: null, lockedAt: null, lockedBy: null, executionPublicId: null,
      errorCode: null, completedAt: null,
    });
  }
  async submitAsyncCapability(request: { consumerKey: string; capabilityKey: string; input: string; locale?: string | null; requesterReferenceId: string; sourceDomain: string; metadata?: Record<string, unknown> | null; idempotencyKey?: string | null; structuredOutputSchema?: Record<string, unknown> | null; dataClassification?: AIDataClassification | null }) {
    const prompts = await this.repository.list<AIPromptDefinition>('prompts', { status: 'ACTIVE' });
    const prompt = prompts.find((item) => item.capabilityKey === request.capabilityKey && item.activeVersion != null);
    if (!prompt) throw new Error('AI_CAPABILITY_NOT_CONFIGURED');
    return this.submitAsync({ ...request, promptKey: prompt.key, purpose: prompt.purpose });
  }
  async processAsync(publicId: string, workerId: string) {
    if (!workerId) throw new Error('AI_ASYNC_WORKER_ID_REQUIRED');
    if (!this.asyncPayloads || this.asyncPayloads.status() !== 'READY') throw new Error('AI_ASYNC_QUEUE_NOT_CONFIGURED');
    const job = await this.repository.claimAsyncJob(publicId, workerId);
    if (!job) throw new Error('AI_ASYNC_JOB_NOT_CLAIMABLE');
    try {
      const request = this.asyncPayloads.unprotect({ ciphertext: job.payloadCiphertext, iv: job.payloadIv, authTag: job.payloadAuthTag, keyVersion: job.payloadKeyVersion }) as AIExecutionRequestDto;
      validateExecutionRequest(request);
      if (request.requesterReferenceId !== job.requesterReferenceId || (request.consumerKey ?? request.sourceDomain ?? 'default') !== job.consumerKey || (request.capabilityKey ?? request.purpose) !== job.capabilityKey) throw new Error('AI_ASYNC_PAYLOAD_IDENTITY_MISMATCH');
      const response = await this.execute(request);
      if (response.status !== AIExecutionStatus.COMPLETED && response.status !== AIExecutionStatus.BLOCKED) throw new Error(response.errorCode ?? 'AI_ASYNC_EXECUTION_FAILED');
      return this.repository.updateAsyncJob(publicId, { status: 'COMPLETED', executionPublicId: response.executionPublicId, completedAt: new Date(), lockedAt: null, lockedBy: null, errorCode: null });
    } catch (error) {
      const retry = job.attempts < job.maxAttempts;
      return this.repository.updateAsyncJob(publicId, { status: retry ? 'RETRYING' : 'DEAD_LETTER', nextAttemptAt: retry ? new Date(Date.now() + Math.min(60_000, 1_000 * 2 ** job.attempts)) : null, lockedAt: null, lockedBy: null, errorCode: safeError(error as Error), completedAt: retry ? null : new Date() });
    }
  }
  queueStatus() { return this.repository.asyncQueueStatus(); }
  async listAsyncJobs(filters?: { status?: string; page?: number; pageSize?: number }) { const page = await this.repository.listAsyncJobs(filters); return { ...page, data: page.data.map(redactAsyncJob) }; }
  async operateAsyncJob(publicId: string, action: 'RETRY' | 'CANCEL', actorReferenceId: string) { return redactAsyncJob(await this.repository.operateAsyncJob(publicId, action, actorReferenceId)); }
  async findAsyncForRequester(publicId: string, requesterReferenceId: string) { const value = await this.repository.findAsyncJob(publicId); return value?.requesterReferenceId === requesterReferenceId ? redactAsyncJob(value) : null; }
  async cancelAsync(publicId: string, requesterReferenceId: string) { const value = await this.repository.findAsyncJob(publicId); if (!value || value.requesterReferenceId !== requesterReferenceId) throw new Error('AI_ASYNC_JOB_NOT_FOUND'); if (!['QUEUED', 'RETRYING'].includes(value.status)) throw new Error('AI_ASYNC_JOB_NOT_CANCELLABLE'); return redactAsyncJob(await this.repository.updateAsyncJob(publicId, { status: 'CANCELLED', completedAt: new Date() })); }
  find(publicId: string) { return this.repository.findExecution(publicId); }
  async findForRequester(publicId: string, requesterReferenceId: string) { const value = await this.repository.findExecution(publicId); return value?.requesterReferenceId === requesterReferenceId ? value : null; }
  list(filters?: Record<string, unknown>) { return this.repository.listExecutions(filters); }
  listLogs(filters?: Record<string, unknown>) { return this.repository.listExecutions(filters); }
  async cancel(publicId: string) { const value = await this.repository.findExecution(publicId); if (!value) throw new Error('AI_EXECUTION_NOT_FOUND'); if (![AIExecutionStatus.RECEIVED, AIExecutionStatus.QUEUED, AIExecutionStatus.RUNNING, AIExecutionStatus.RETRYING].includes(value.status)) throw new Error('AI_EXECUTION_NOT_CANCELLABLE'); return this.repository.updateExecution(publicId, { status: AIExecutionStatus.CANCELLED }); }

  private async findRoutingPolicy(capabilityKey: string, consumerKey: string) { const values = await this.repository.list<AIRoutingPolicy>('routingPolicies', { status: 'ACTIVE' }); return values.find((item) => item.capabilityKey === capabilityKey && item.consumerKey === consumerKey) ?? values.find((item) => item.capabilityKey === capabilityKey && !item.consumerKey) ?? null; }
  private route(policy: AIRoutingPolicy | null, models: AIModelDefinition[], providers: AIProviderDefinition[], consumer: AIConsumerPolicy, capability: AICapabilityDefinition, classification: AIDataClassification, routingSeed: string) {
    if (!policy) return [];
    return policy.targets.filter((target) => target.enabled && !target.shadow && deterministicPercentage(`${routingSeed}:${target.modelKey}:canary`) < (target.canaryPercentage ?? 100)).sort((a, b) => a.priority - b.priority || weightedRank(routingSeed, a.modelKey, a.weight) - weightedRank(routingSeed, b.modelKey, b.weight)).map((target) => {
      const model = models.find((item) => item.key === target.modelKey);
      const provider = model ? providers.find((item) => item.key === model.providerKey) : null;
      return model && provider ? { model, provider, target } : null;
    }).filter((candidate): candidate is { model: AIModelDefinition; provider: AIProviderDefinition; target: AIRoutingPolicy['targets'][number] } => Boolean(candidate)
      && candidate!.model.productionApproved === true
      && candidate!.provider.productionApproved === true
      && candidate!.model.capabilities.includes(capability.kind)
      && classificationAllowed(classification, candidate!.model.maxDataClassification)
      && classificationAllowed(classification, candidate!.provider.maxDataClassification)
      && (!consumer.allowedModels?.length || consumer.allowedModels.includes(candidate!.model.key)));
  }
  private async assertQuota(policy: AIConsumerPolicy) { const [minute, day, month] = await Promise.all([this.repository.quotaUsage(policy.consumerKey, 'MINUTE'), this.repository.quotaUsage(policy.consumerKey, 'DAY'), this.repository.quotaUsage(policy.consumerKey, 'MONTH')]); if (minute.requests >= policy.requestsPerMinute) throw new Error('AI_RATE_LIMIT_EXCEEDED'); if (day.requests >= policy.dailyRequestLimit) throw new Error('AI_DAILY_QUOTA_EXCEEDED'); if (month.tokens >= policy.monthlyTokenLimit) throw new Error('AI_MONTHLY_TOKEN_BUDGET_EXCEEDED'); if (policy.monthlyCostLimit != null && month.cost >= policy.monthlyCostLimit) throw new Error('AI_MONTHLY_COST_BUDGET_EXCEEDED'); }
}

export class AIWorkflowUseCases {
  constructor(private readonly repository: IAIPlatformRepository, private readonly execution: AIExecutionOrchestrator) {}
  async start(workflowKey: string, input: Record<string, unknown>) { const workflow = await this.repository.find<AIWorkflowDefinition>('workflows', workflowKey); if (!workflow || workflow.status !== 'ACTIVE' || !workflow.activeVersion) throw new Error('AI_WORKFLOW_NOT_ACTIVE'); return this.repository.createWorkflowRun({ publicId: `aiw_${randomUUID()}`, workflowKey, workflowVersion: workflow.activeVersion, status: 'QUEUED', traceId: randomUUID(), inputReferenceHash: sha256(JSON.stringify(input)), outputReferenceHash: null }); }
  async run(publicId: string, input: Record<string, unknown>) { const run = await this.repository.findWorkflowRun(publicId); if (!run) throw new Error('AI_WORKFLOW_RUN_NOT_FOUND'); if (run.inputReferenceHash !== sha256(JSON.stringify(input))) throw new Error('AI_WORKFLOW_INPUT_REFERENCE_MISMATCH'); const workflow = await this.repository.find<AIWorkflowDefinition>('workflows', run.workflowKey); if (!workflow) throw new Error('AI_WORKFLOW_NOT_FOUND'); await this.repository.updateWorkflowRun(publicId, { status: 'RUNNING' }); const outputs: Record<string, unknown> = {}; for (const step of workflow.definition.steps) { const response = await this.execution.execute({ purpose: 'TOOL_ASSISTANCE' as any, promptKey: step.promptKey, capabilityKey: step.capabilityKey, consumerKey: 'workflow', input: JSON.stringify({ workflowInput: input, previousOutputs: outputs }), idempotencyKey: `${publicId}:${step.key}`, dataClassification: 'INTERNAL' }); if (response.status !== AIExecutionStatus.COMPLETED) return this.repository.updateWorkflowRun(publicId, { status: 'FAILED', currentStep: step.key, errorMessage: response.errorMessage ?? 'Workflow step failed.' }); outputs[step.key] = response.result; await this.repository.updateWorkflowRun(publicId, { currentStep: step.key }); } return this.repository.updateWorkflowRun(publicId, { status: 'COMPLETED', outputReferenceHash: sha256(JSON.stringify(outputs)) }); }
}

export class AIEvaluationUseCases {
  constructor(private readonly repository: IAIPlatformRepository, private readonly execution: AIExecutionOrchestrator) {}
  async start(evaluationKey: string, options: { promptVersion?: number; modelKey?: string } = {}) { const definition = await this.repository.find<AIEvaluationDefinition>('evaluations', evaluationKey); if (!definition || definition.status !== 'ACTIVE') throw new Error('AI_EVALUATION_NOT_ACTIVE'); return this.repository.createEvaluationRun({ publicId: `aiev_${randomUUID()}`, evaluationKey, status: 'QUEUED', promptVersion: options.promptVersion, modelKey: options.modelKey, passed: 0, failed: 0, safetyFailures: 0, score: null, results: null, approvedBy: null, approvedAt: null }); }
  async run(publicId: string) { const run = await this.repository.findEvaluationRun(publicId); if (!run) throw new Error('AI_EVALUATION_RUN_NOT_FOUND'); const definition = await this.repository.find<AIEvaluationDefinition>('evaluations', run.evaluationKey); if (!definition || definition.status !== 'ACTIVE') throw new Error('AI_EVALUATION_NOT_ACTIVE'); await this.repository.updateEvaluationRun(publicId, { status: 'RUNNING' }); const results: Record<string, unknown>[] = []; let passed = 0; let safetyFailures = 0; for (const item of definition.dataset) { const response = definition.target.type === 'PROMPT' ? await this.execution.execute({ purpose: 'TOOL_ASSISTANCE' as any, promptKey: definition.target.key, capabilityKey: definition.capabilityKey, consumerKey: 'evaluation', input: item.input, idempotencyKey: `${publicId}:${item.key}`, dataClassification: 'INTERNAL' }) : await this.execution.executeCapability({ consumerKey: 'evaluation', capabilityKey: definition.capabilityKey, sourceDomain: 'AIEvaluation', input: item.input, idempotencyKey: `${publicId}:${item.key}`, dataClassification: 'INTERNAL' }); if (response.status === AIExecutionStatus.BLOCKED) safetyFailures += 1; const ok = response.status === AIExecutionStatus.COMPLETED && definition.evaluators.every((evaluator) => evaluator.type !== 'EXACT_MATCH' || response.result === item.expected); results.push({ key: item.key, passed: ok, safetyFailure: response.status === AIExecutionStatus.BLOCKED, executionPublicId: response.executionPublicId }); if (ok) passed += 1; } const score = definition.dataset.length ? passed / definition.dataset.length : 0; return this.repository.updateEvaluationRun(publicId, { status: 'COMPLETED', passed, failed: definition.dataset.length - passed, safetyFailures, score, results, completedAt: new Date() }); }
  approve(publicId: string, actorReferenceId: string) { return this.repository.approveEvaluationRun(publicId, actorReferenceId); }
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
  private readonly states = new Map<string, { failures: number; openedAt?: number; halfOpen?: boolean }>();
  constructor(private readonly threshold = 3, private readonly resetAfterMs = 30_000) {}
  state(key: string): 'CLOSED' | 'OPEN' | 'HALF_OPEN' { const value = this.states.get(key); if (!value?.openedAt) return value?.halfOpen ? 'HALF_OPEN' : 'CLOSED'; return Date.now() - value.openedAt >= this.resetAfterMs ? 'HALF_OPEN' : 'OPEN'; }
  canAttempt(key: string) { const state = this.states.get(key); if (!state?.openedAt) return !state?.halfOpen; if (Date.now() - state.openedAt >= this.resetAfterMs) { this.states.set(key, { failures: state.failures, halfOpen: true }); return true; } return false; }
  success(key: string) { this.states.set(key, { failures: 0 }); }
  failure(key: string) { const previous = this.states.get(key) ?? { failures: 0 }; const failures = previous.failures + 1; this.states.set(key, { failures, openedAt: previous.halfOpen || failures >= this.threshold ? Date.now() : previous.openedAt, halfOpen: false }); }
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
function estimateCost(model: AIModelDefinition, result: AIProviderInvocationResult, price?: AIModelPrice | null) { return (result.inputTokens * Number(price?.inputPricePerMillion ?? model.inputPricePerMillion ?? 0) + result.outputTokens * Number(price?.outputPricePerMillion ?? model.outputPricePerMillion ?? 0)) / 1_000_000; }
function privacyPreview(value: string, classification: AIDataClassification) { return classification === 'STUDENT_PRIVATE' || classification === 'HIGHLY_SENSITIVE' ? null : value.slice(0, 500); }
function sanitizeMetadata(value?: Record<string, unknown> | null): Record<string, unknown> | null { if (!value) return null; const output: Record<string, unknown> = {}; for (const [key, item] of Object.entries(value)) { if (/secret|token|api.?key|password|authorization/i.test(key)) output[key] = '[REDACTED]'; else if (item && typeof item === 'object' && !Array.isArray(item)) output[key] = sanitizeMetadata(item as Record<string, unknown>); else if (Array.isArray(item)) output[key] = item.slice(0, 50).map((entry) => entry && typeof entry === 'object' ? '[OBJECT_REDACTED]' : entry); else output[key] = item; } return output; }
function assertNoSecretMaterial(value: unknown, path = 'root'): void { if (!value || typeof value !== 'object') return; for (const [key, nested] of Object.entries(value)) { const current = `${path}.${key}`; if (/api.?key|secretValue|accessToken|authorization|password|credential/i.test(key)) throw new Error(`AI_SECRET_MATERIAL_FORBIDDEN:${current}`); if (nested && typeof nested === 'object') assertNoSecretMaterial(nested, current); } }
function safeError(error: Error) { const value = error.message.replace(/(sk-[A-Za-z0-9_-]+|Bearer\s+\S+)/g, '[REDACTED]'); return value.startsWith('AI_') ? value.slice(0, 240) : 'AI_PROVIDER_ERROR'; }
function redactAsyncJob<T extends { payloadCiphertext: string; payloadIv: string; payloadAuthTag: string }>(job: T) { const { payloadCiphertext: _ciphertext, payloadIv: _iv, payloadAuthTag: _tag, ...safe } = job; return safe; }
function mergeSafety(a: AISafetyDecision, b: AISafetyDecision) { return a === AISafetyDecision.BLOCKED || b === AISafetyDecision.BLOCKED ? AISafetyDecision.BLOCKED : a === AISafetyDecision.REDACTED || b === AISafetyDecision.REDACTED ? AISafetyDecision.REDACTED : AISafetyDecision.ALLOWED; }
function toExecutionResponse(value: AIExecutionRecord, blockedReason?: string) { return { executionPublicId: value.publicId, traceId: value.traceId, status: value.status, blockedReason, errorCode: value.errorCode, errorMessage: value.errorMessage, providerKey: value.providerKey, modelKey: value.modelKey, usage: { inputTokens: value.inputTokens, outputTokens: value.outputTokens, cost: value.actualCost, currency: value.currency } }; }
function sha256(value: string) { return createHash('sha256').update(value).digest('hex'); }
const classificationRank: Record<AIDataClassification, number> = { PUBLIC: 0, INTERNAL: 1, CONFIDENTIAL: 2, STUDENT_PRIVATE: 3, HIGHLY_SENSITIVE: 4 };
function normalizeDataClassification(value: unknown): AIDataClassification { return typeof value === 'string' && value in classificationRank ? value as AIDataClassification : 'INTERNAL'; }
function classificationAllowed(value: AIDataClassification, maximum?: AIDataClassification) { return maximum != null && classificationRank[value] <= classificationRank[maximum]; }
function selectPriceSnapshot(prices: AIModelPrice[], modelKey: string, at: Date) { return prices.filter((price) => price.modelKey === modelKey && new Date(price.effectiveFrom) <= at && (!price.effectiveTo || new Date(price.effectiveTo) > at)).sort((a, b) => new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime())[0] ?? null; }
function isRetryable(error: Error & { retryable?: boolean }) { return error.retryable === true || /TIMEOUT|RATE_LIMIT|UNAVAILABLE|429|5\d\d/.test(error.message); }
function boundedBackoff(attempt: number) { return new Promise<void>((resolve) => setTimeout(resolve, Math.min(750, 50 * 2 ** (attempt - 1)))); }
function deterministicPercentage(value: string) { return Number.parseInt(sha256(value).slice(0, 8), 16) % 100; }
function weightedRank(seed: string, key: string, weight: number) { return deterministicPercentage(`${seed}:${key}:weight`) / Math.max(1, weight); }
function chunkText(value: string, maxCharacters: number, overlapCharacters: number) { const max = Math.max(200, Math.min(8000, maxCharacters)); const overlap = Math.max(0, Math.min(max - 1, overlapCharacters)); const chunks: string[] = []; for (let start = 0; start < value.length; start += max - overlap) { const chunk = value.slice(start, start + max).trim(); if (chunk) chunks.push(chunk); if (start + max >= value.length) break; } return chunks; }
function renderPrompt(template: string, _input: string, locale?: string | null) { if (template.includes('{{input}}')) throw new Error('AI_PROMPT_UNSAFE_INPUT_INTERPOLATION'); return template.replaceAll('{{locale}}', locale ?? 'ar'); }
