import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AIExecutionStatus,
  IStudentToolRegistryRepository,
  StudentToolAiDependencyLevel,
  StudentToolExecutionType,
  StudentToolImplementationPriority,
  StudentToolVisibilityStatus
} from '@manaratak/domain';
import { StudentToolExecutionUseCases } from '../../src/student-tools';

describe('StudentToolExecutionUseCases', () => {
  let repository: IStudentToolRegistryRepository;
  let aiExecutionUseCases: { execute: ReturnType<typeof vi.fn> };
  let useCases: StudentToolExecutionUseCases;

  const activeAiTool = {
    id: 'tool-1',
    toolKey: 'major-fit-helper',
    displayName: 'Major Fit Helper',
    description: 'Helps students choose a major.',
    category: 'Majors',
    executionType: StudentToolExecutionType.AI_ASSISTED,
    visibilityStatus: StudentToolVisibilityStatus.ACTIVE,
    implementationPriority: StudentToolImplementationPriority.P1_CORE_LAUNCH,
    aiDependencyLevel: StudentToolAiDependencyLevel.REQUIRED_LOW_COST,
    publicEnabled: true,
    anonymousEnabled: true,
    authenticatedEnabled: true,
    adminOnly: false,
    launchOrder: 20,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    repository = {
      upsertTool: vi.fn(),
      findByKey: vi.fn().mockResolvedValue(activeAiTool),
      listTools: vi.fn(),
      listPublicTools: vi.fn(),
      updateVisibility: vi.fn()
    };
    aiExecutionUseCases = {
      execute: vi.fn().mockResolvedValue({
        executionPublicId: 'ai-1',
        status: AIExecutionStatus.COMPLETED,
        result: { output: 'Try Computer Science and Data Science.' }
      })
    };
    useCases = new StudentToolExecutionUseCases(repository, aiExecutionUseCases as any);
  });

  it('routes active AI-assisted tools through the AI Gateway', async () => {
    const result = await useCases.execute('major-fit-helper', { input: 'I like math and problem solving.' });

    expect(result.output).toBe('Try Computer Science and Data Science.');
    expect(aiExecutionUseCases.execute).toHaveBeenCalledWith(expect.objectContaining({
      promptKey: 'student-tool.guidance',
      sourceDomain: 'Phase18StudentTools'
    }));
  });

  it('rejects tools that are not active', async () => {
    vi.mocked(repository.findByKey).mockResolvedValue({
      ...activeAiTool,
      visibilityStatus: StudentToolVisibilityStatus.COMING_SOON
    });

    await expect(useCases.execute('major-fit-helper', { input: 'Help me.' })).rejects.toThrow('not active');
    expect(aiExecutionUseCases.execute).not.toHaveBeenCalled();
  });
});
