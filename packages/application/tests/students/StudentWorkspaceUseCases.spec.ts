import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  IStudentWorkspaceRepository,
  StudentSavedItemType,
  StudentWorkspaceStatus
} from '@manaratak/domain';
import { StudentWorkspaceUseCases } from '../../src/students/use-cases/StudentWorkspaceUseCases';

describe('StudentWorkspaceUseCases', () => {
  let repository: IStudentWorkspaceRepository;
  let useCases: StudentWorkspaceUseCases;

  beforeEach(() => {
    repository = {
      upsertWorkspace: vi.fn().mockResolvedValue({
        id: 'workspace-1',
        studentReferenceId: 'student-1',
        status: StudentWorkspaceStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date()
      }),
      findWorkspace: vi.fn().mockResolvedValue(null),
      saveItem: vi.fn().mockImplementation((data) => Promise.resolve({
        id: 'saved-1',
        ...data,
        savedAt: new Date(),
        updatedAt: new Date()
      })),
      removeSavedItem: vi.fn(),
      listSavedItems: vi.fn().mockResolvedValue([]),
      getDashboardSummary: vi.fn().mockResolvedValue({
        workspace: {
          id: 'workspace-1',
          studentReferenceId: 'student-1',
          status: StudentWorkspaceStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        savedItems: [],
        certificateCount: 1,
        activeCourseEnrollmentCount: 2,
        completedCourseEnrollmentCount: 1
      })
    };
    useCases = new StudentWorkspaceUseCases(repository);
  });

  it('creates a workspace when missing', async () => {
    const workspace = await useCases.getOrCreateWorkspace('student-1');

    expect(workspace.studentReferenceId).toBe('student-1');
    expect(repository.upsertWorkspace).toHaveBeenCalledWith({ studentReferenceId: 'student-1' });
  });

  it('rejects raw avatar URLs to preserve EAP boundary', async () => {
    await expect(useCases.upsertWorkspace({
      studentReferenceId: 'student-1',
      avatarAssetId: 'https://example.com/avatar.png'
    })).rejects.toThrow('Phase 05 EAP handle');
  });

  it('saves personal workspace references only', async () => {
    const saved = await useCases.saveItem({
      studentReferenceId: 'student-1',
      entityType: StudentSavedItemType.COURSE,
      entityId: 'course-1',
      displayName: 'Native Course'
    });

    expect(saved.entityType).toBe(StudentSavedItemType.COURSE);
    expect(repository.saveItem).toHaveBeenCalled();
  });
});
