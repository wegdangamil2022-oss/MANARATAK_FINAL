import {
  AICapabilityDefinition, AIConsumerPolicy, AIEvaluationDefinition, AIEvaluationRun,
  AIExecutionRecord, AIExecutionSpan, AIGuardrailDefinition, AIIncident, AIKnowledgeIndex,
  AIIndexingRun, AIKnowledgeSource, AIModelDefinition, AIModelPrice, AIPlatformOverview, AIPromptDefinition, AIPromptVersion,
  AIProviderDefinition, AIRoutingPolicy, AIWorkflowDefinition, AIWorkflowRun
} from '../entities';

export type AIRegistryResource =
  | 'providers' | 'models' | 'modelPrices' | 'capabilities' | 'routingPolicies' | 'prompts' | 'guardrails'
  | 'consumers' | 'workflows' | 'evaluations' | 'knowledgeIndexes' | 'knowledgeSources' | 'incidents' | 'platformSettings';

export interface IAIPlatformRepository {
  overview(): Promise<AIPlatformOverview>;
  list<T>(resource: AIRegistryResource, filters?: Record<string, unknown>): Promise<T[]>;
  find<T>(resource: AIRegistryResource, key: string): Promise<T | null>;
  upsert<T>(resource: AIRegistryResource, value: T, actorReferenceId: string): Promise<T>;
  createPromptVersion(value: Omit<AIPromptVersion, 'id' | 'createdAt' | 'checksum'>): Promise<AIPromptVersion>;
  findPromptVersion(promptKey: string, version: number): Promise<AIPromptVersion | null>;
  deployPrompt(promptKey: string, version: number, actorReferenceId: string): Promise<AIPromptDefinition>;
  createExecution(value: Omit<AIExecutionRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<AIExecutionRecord>;
  updateExecution(publicId: string, patch: Partial<AIExecutionRecord>): Promise<AIExecutionRecord>;
  findExecution(publicId: string): Promise<AIExecutionRecord | null>;
  findExecutionByIdempotency(consumerKey: string, idempotencyKey: string): Promise<AIExecutionRecord | null>;
  listExecutions(filters?: Record<string, unknown>): Promise<{ data: AIExecutionRecord[]; total: number; page: number; pageSize: number; totalPages: number }>;
  appendSpan(span: Omit<AIExecutionSpan, 'id'>): Promise<AIExecutionSpan>;
  recordUsage(value: { executionPublicId: string; providerKey: string; modelKey: string; inputTokens: number; outputTokens: number; cost: number; currency: string; metadata?: Record<string, unknown> }): Promise<void>;
  quotaUsage(consumerKey: string, period: 'MINUTE' | 'DAY' | 'MONTH'): Promise<{ requests: number; tokens: number; cost: number }>;
  createWorkflowRun(value: Omit<AIWorkflowRun, 'id' | 'createdAt' | 'updatedAt'>): Promise<AIWorkflowRun>;
  findWorkflowRun(publicId: string): Promise<AIWorkflowRun | null>;
  updateWorkflowRun(publicId: string, patch: Partial<AIWorkflowRun>): Promise<AIWorkflowRun>;
  createEvaluationRun(value: Omit<AIEvaluationRun, 'id' | 'createdAt'>): Promise<AIEvaluationRun>;
  updateEvaluationRun(publicId: string, patch: Partial<AIEvaluationRun>): Promise<AIEvaluationRun>;
  appendIncidentEvent(publicId: string, event: AIIncident['timeline'][number]): Promise<AIIncident>;
  createIndexingRun(value: Omit<AIIndexingRun, 'id' | 'createdAt'>): Promise<AIIndexingRun>;
  updateIndexingRun(publicId: string, patch: Partial<AIIndexingRun>): Promise<AIIndexingRun>;
  replaceEmbeddings(input: { indexKey: string; sourceReferenceId: string; modelKey: string; dimensions: number; chunks: Array<{ chunkKey: string; chunkText: string; embeddingRef: string; checksum: string; metadata?: Record<string, unknown> }> }): Promise<void>;
}

export type AIPlatformResourceValue = AIProviderDefinition | AIModelDefinition | AIModelPrice | AICapabilityDefinition |
  AIRoutingPolicy | AIPromptDefinition | AIGuardrailDefinition | AIConsumerPolicy | AIWorkflowDefinition |
  AIEvaluationDefinition | AIKnowledgeIndex | AIKnowledgeSource | AIIncident;
