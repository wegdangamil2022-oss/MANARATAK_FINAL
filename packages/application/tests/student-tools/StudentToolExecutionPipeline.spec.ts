import { createHash } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import { StudentToolExecutionStatus } from '@manaratak/domain';
import { OFFICIAL_STUDENT_TOOLS } from '../../src/student-tools/OfficialStudentToolRegistry';
import { StudentToolExecutionUseCases } from '../../src/student-tools/use-cases/StudentToolExecutionUseCases';

const gpa = OFFICIAL_STUDENT_TOOLS.find((tool) => tool.toolKey === 'gpa-calculator')!;
const university = OFFICIAL_STUDENT_TOOLS.find((tool) => tool.toolKey === 'university-comparison')!;
const hash = (value: string) => createHash('sha256').update(`phase18:${value}`).digest('hex');

function harness(tool = gpa) {
  const repository = {
    findByKey: vi.fn().mockResolvedValue(tool), findExecutionByIdempotency: vi.fn().mockResolvedValue(null),
    recordExecution: vi.fn().mockImplementation((value) => Promise.resolve(value)),
    completeExecution: vi.fn().mockImplementation((_id, value) => Promise.resolve(value)), findExecution: vi.fn(),
  };
  const handler = {
    validate: vi.fn().mockImplementation((value) => value),
    execute: vi.fn().mockResolvedValue({ semesterGpa: 4, totalSemesterCredits: 3, qualityPoints: 12, scale: 4, courses: [] }),
    validateOutput: vi.fn().mockImplementation((value) => value),
  };
  const handlers = { has: vi.fn().mockReturnValue(true), get: vi.fn().mockReturnValue(handler) };
  const rateLimit = { consume: vi.fn().mockResolvedValue({ allowed: true, remaining: 1, resetAt: Date.now() }) };
  const dependencyHealth = { status: vi.fn().mockResolvedValue('READY') };
  const saveGateway = { savePrivateResult: vi.fn().mockResolvedValue({ savedReference: 'saved-1' }) };
  const useCases = new StudentToolExecutionUseCases(repository as any, handlers as any, rateLimit, dependencyHealth as any, saveGateway);
  return { repository, handler, dependencyHealth, saveGateway, useCases };
}

describe('Phase 18 governed execution pipeline', () => {
  it('blocks a required unavailable dependency before executing the handler', async () => {
    const { useCases, dependencyHealth, handler, repository } = harness(university);
    dependencyHealth.status.mockResolvedValue('NOT_CONFIGURED');
    await expect(useCases.execute(university.toolKey, { input: { universityIds: ['u1', 'u2'] }, consumerType: 'ANONYMOUS', anonymousSessionReference: 's1' })).rejects.toThrow('TOOL_DEPENDENCY_UNAVAILABLE');
    expect(handler.execute).not.toHaveBeenCalled();
    expect(repository.recordExecution).not.toHaveBeenCalled();
  });

  it('validates handler output before recording success', async () => {
    const { useCases, handler, repository } = harness();
    handler.validateOutput.mockImplementation(() => { throw new Error('TOOL_OUTPUT_INVALID'); });
    await expect(useCases.execute(gpa.toolKey, { input: { scale: 4, courses: [] }, consumerType: 'ANONYMOUS', anonymousSessionReference: 's1' })).rejects.toThrow('TOOL_OUTPUT_INVALID');
    expect(repository.completeExecution).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ status: StudentToolExecutionStatus.FAILED, errorCode: 'TOOL_OUTPUT_INVALID' }));
  });

  it('returns a receipt only to the requester that created it', async () => {
    const { useCases, repository } = harness();
    repository.findExecution.mockResolvedValue({ executionId: 'stx_private', consumerType: 'AUTHENTICATED_STUDENT', studentReferenceHash: hash('student-owner'), anonymousSessionHash: null });
    await expect(useCases.findExecutionForRequester('stx_private', { consumerType: 'AUTHENTICATED_STUDENT', authenticatedStudentReference: 'student-attacker' })).resolves.toBeNull();
    await expect(useCases.findExecutionForRequester('stx_private', { consumerType: 'AUTHENTICATED_STUDENT', authenticatedStudentReference: 'student-owner' })).resolves.toEqual(expect.objectContaining({ executionId: 'stx_private' }));
  });

  it('saves only an authenticated owner reference through Phase 15', async () => {
    const { useCases, repository, saveGateway } = harness();
    repository.findExecution.mockResolvedValue({ executionId: 'stx_private', toolKey: 'gpa-calculator', status: StudentToolExecutionStatus.COMPLETED, consumerType: 'AUTHENTICATED_STUDENT', studentReferenceHash: hash('student-owner') });
    const result = { semesterGpa: 4 };
    await expect(useCases.saveExecutionForStudent('stx_private', 'student-attacker', result)).rejects.toThrow('TOOL_EXECUTION_NOT_FOUND');
    await expect(useCases.saveExecutionForStudent('stx_private', 'student-owner', result)).resolves.toEqual({ savedReference: 'saved-1' });
    expect(saveGateway.savePrivateResult).toHaveBeenCalledWith({ studentReference: 'student-owner', toolKey: 'gpa-calculator', executionId: 'stx_private', resultReference: 'stx_private', result });
  });
});
