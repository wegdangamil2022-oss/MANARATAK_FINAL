import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AIExecutionStatus,
  AIProviderType,
  AIRequestPurpose,
  AISafetyDecision,
  IAIExecutionRepository,
  IAIProviderGateway
} from '@manaratak/domain';
import { AIExecutionUseCases } from '../../src/ai-platform';

describe('AIExecutionUseCases', () => {
  let repository: IAIExecutionRepository;
  let providerGateway: IAIProviderGateway;
  let useCases: AIExecutionUseCases;

  beforeEach(() => {
    repository = {
      createLog: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'log-1', createdAt: new Date(), updatedAt: new Date(), ...data })),
      findLogByPublicId: vi.fn(),
      listLogs: vi.fn()
    };
    providerGateway = {
      execute: vi.fn().mockResolvedValue({
        output: 'Mock advisory output',
        safetyDecision: AISafetyDecision.ALLOWED,
        providerType: AIProviderType.INTERNAL_MOCK,
        modelReference: 'internal-mock-v1',
        estimatedInputTokens: 5,
        estimatedOutputTokens: 6
      })
    };
    useCases = new AIExecutionUseCases(repository, providerGateway);
  });

  it('executes through the governed provider and logs the result', async () => {
    const result = await useCases.execute({
      purpose: AIRequestPurpose.SUMMARIZATION,
      promptKey: 'summary.generic',
      input: 'Summarize this student guide.',
      sourceDomain: 'CMS'
    });

    expect(result.status).toBe(AIExecutionStatus.COMPLETED);
    expect(providerGateway.execute).toHaveBeenCalled();
    expect(repository.createLog).toHaveBeenCalledWith(expect.objectContaining({
      status: AIExecutionStatus.COMPLETED,
      providerType: AIProviderType.INTERNAL_MOCK,
      sourceDomain: 'CMS'
    }));
  });

  it('blocks unsafe credential input before provider execution', async () => {
    const result = await useCases.execute({
      purpose: AIRequestPurpose.TOOL_ASSISTANCE,
      promptKey: 'student-tool.guidance',
      input: 'password: do-not-send'
    });

    expect(result.status).toBe(AIExecutionStatus.BLOCKED);
    expect(providerGateway.execute).not.toHaveBeenCalled();
    expect(repository.createLog).toHaveBeenCalledWith(expect.objectContaining({
      status: AIExecutionStatus.BLOCKED,
      safetyDecision: AISafetyDecision.BLOCKED
    }));
  });
});
