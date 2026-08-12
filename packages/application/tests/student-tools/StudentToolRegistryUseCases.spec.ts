import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  IStudentToolRegistryRepository,
  StudentToolAiDependencyLevel,
  StudentToolExecutionType,
  StudentToolImplementationPriority,
  StudentToolVisibilityStatus
} from '@manaratak/domain';
import { StudentToolRegistryUseCases } from '../../src/student-tools/use-cases/StudentToolRegistryUseCases';

describe('StudentToolRegistryUseCases', () => {
  let repository: IStudentToolRegistryRepository;
  let useCases: StudentToolRegistryUseCases;

  beforeEach(() => {
    repository = {
      upsertTool: vi.fn().mockImplementation((data) => Promise.resolve({
        id: 'tool-1',
        ...data,
        publicEnabled: data.publicEnabled ?? false,
        anonymousEnabled: data.anonymousEnabled ?? false,
        authenticatedEnabled: data.authenticatedEnabled ?? true,
        adminOnly: data.adminOnly ?? false,
        launchOrder: data.launchOrder ?? 100,
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      findByKey: vi.fn(),
      listTools: vi.fn(),
      listPublicTools: vi.fn(),
      updateVisibility: vi.fn(),
    };
    useCases = new StudentToolRegistryUseCases(repository);
  });

  it('seeds the official student tool backlog', async () => {
    const result = await useCases.seedOfficialTools();

    expect(result.length).toBeGreaterThanOrEqual(5);
    expect(repository.upsertTool).toHaveBeenCalledWith(expect.objectContaining({
      toolKey: 'scholarship-matcher'
    }));
  });

  it('rejects AI dependency without AI execution type', async () => {
    await expect(useCases.upsertTool({
      toolKey: 'bad-tool',
      displayName: 'Bad Tool',
      category: 'Planning',
      executionType: StudentToolExecutionType.STATIC_FORM,
      visibilityStatus: StudentToolVisibilityStatus.ACTIVE,
      implementationPriority: StudentToolImplementationPriority.P1_CORE_LAUNCH,
      aiDependencyLevel: StudentToolAiDependencyLevel.REQUIRED_LOW_COST
    })).rejects.toThrow('AI-dependent tools');
  });
});
