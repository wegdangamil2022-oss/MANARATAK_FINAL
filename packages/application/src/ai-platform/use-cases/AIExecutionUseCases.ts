import {
  AIExecutionRequestDto,
  AIExecutionResultDto,
  AIExecutionStatus,
  AIProviderType,
  AIRequestPurpose,
  AISafetyDecision,
  AICostGuardService,
  AISafetyPolicyService,
  IAIExecutionRepository,
  IAIProviderGateway,
  PromptRegistryService
} from '@manaratak/domain';

export interface AIExecutionResponseDto {
  executionPublicId: string;
  status: AIExecutionStatus;
  result?: AIExecutionResultDto;
  blockedReason?: string;
}

export class AIExecutionUseCases {
  constructor(
    private readonly repository: IAIExecutionRepository,
    private readonly providerGateway: IAIProviderGateway,
    private readonly safetyPolicy = new AISafetyPolicyService(),
    private readonly costGuard = new AICostGuardService(),
    private readonly promptRegistry = new PromptRegistryService()
  ) {}

  async execute(request: AIExecutionRequestDto): Promise<AIExecutionResponseDto> {
    this.validateRequest(request);
    this.promptRegistry.assertAllowed(request.purpose, request.promptKey);
    this.costGuard.assertWithinLimit(request.input);

    const publicId = `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const safety = this.safetyPolicy.evaluate(request.input);

    if (safety.decision === AISafetyDecision.BLOCKED) {
      await this.repository.createLog({
        publicId,
        purpose: request.purpose,
        promptKey: request.promptKey,
        providerType: AIProviderType.INTERNAL_MOCK,
        modelReference: 'blocked-before-provider',
        status: AIExecutionStatus.BLOCKED,
        safetyDecision: AISafetyDecision.BLOCKED,
        requesterReferenceId: request.requesterReferenceId,
        sourceDomain: request.sourceDomain,
        inputPreview: this.preview(request.input),
        estimatedInputTokens: this.costGuard.estimateTokens(request.input),
        estimatedOutputTokens: 0,
        errorMessage: safety.reasons.join(' '),
        metadata: request.metadata || null
      });

      return {
        executionPublicId: publicId,
        status: AIExecutionStatus.BLOCKED,
        blockedReason: safety.reasons.join(' ')
      };
    }

    const result = await this.providerGateway.execute({
      ...request,
      input: safety.sanitizedInput
    });

    const safetyDecision = safety.decision === AISafetyDecision.REDACTED ? AISafetyDecision.REDACTED : result.safetyDecision;
    await this.repository.createLog({
      publicId,
      purpose: request.purpose,
      promptKey: request.promptKey,
      providerType: result.providerType,
      modelReference: result.modelReference,
      status: AIExecutionStatus.COMPLETED,
      safetyDecision,
      requesterReferenceId: request.requesterReferenceId,
      sourceDomain: request.sourceDomain,
      inputPreview: this.preview(safety.sanitizedInput),
      outputPreview: this.preview(result.output),
      estimatedInputTokens: result.estimatedInputTokens,
      estimatedOutputTokens: result.estimatedOutputTokens,
      metadata: {
        ...(request.metadata || {}),
        safetyReasons: safety.reasons,
        providerMetadata: result.metadata || {}
      }
    });

    return {
      executionPublicId: publicId,
      status: AIExecutionStatus.COMPLETED,
      result: {
        ...result,
        safetyDecision
      }
    };
  }

  async listLogs(filters: Parameters<IAIExecutionRepository['listLogs']>[0]) {
    return this.repository.listLogs(filters);
  }

  private validateRequest(request: AIExecutionRequestDto): void {
    if (!Object.values(AIRequestPurpose).includes(request.purpose)) {
      throw new Error('Invalid AI request purpose.');
    }
    if (!request.promptKey?.trim()) {
      throw new Error('AI promptKey is required.');
    }
    if (!request.input?.trim()) {
      throw new Error('AI input is required.');
    }
  }

  private preview(value: string): string {
    return value.slice(0, 500);
  }
}
