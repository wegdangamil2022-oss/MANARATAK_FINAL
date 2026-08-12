import {
  IStudentWorkspaceRepository,
  SaveStudentItemDto,
  StudentDashboardSummaryDto,
  StudentSavedItemDto,
  StudentSavedItemType,
  StudentWorkspaceDto,
  UpsertStudentWorkspaceDto
} from '@manaratak/domain';

export class StudentWorkspaceUseCases {
  constructor(private readonly repository: IStudentWorkspaceRepository) {}

  public async upsertWorkspace(data: UpsertStudentWorkspaceDto): Promise<StudentWorkspaceDto> {
    this.ensureStudentReference(data.studentReferenceId);
    if (data.avatarAssetId && /^https?:\/\//i.test(data.avatarAssetId)) {
      throw new Error('avatarAssetId must be a Phase 05 EAP handle, not a raw URL');
    }
    return this.repository.upsertWorkspace(data);
  }

  public async getOrCreateWorkspace(studentReferenceId: string): Promise<StudentWorkspaceDto> {
    this.ensureStudentReference(studentReferenceId);
    const existing = await this.repository.findWorkspace(studentReferenceId);
    if (existing) {
      return existing;
    }
    return this.repository.upsertWorkspace({ studentReferenceId });
  }

  public async getDashboard(studentReferenceId: string): Promise<StudentDashboardSummaryDto> {
    await this.getOrCreateWorkspace(studentReferenceId);
    const summary = await this.repository.getDashboardSummary(studentReferenceId);
    if (!summary) {
      throw new Error('Student dashboard could not be loaded');
    }
    return summary;
  }

  public async saveItem(data: SaveStudentItemDto): Promise<StudentSavedItemDto> {
    this.ensureStudentReference(data.studentReferenceId);
    if (!Object.values(StudentSavedItemType).includes(data.entityType)) {
      throw new Error('Unsupported saved item type');
    }
    return this.repository.saveItem(data);
  }

  public async removeSavedItem(studentReferenceId: string, entityType: StudentSavedItemType, entityId: string): Promise<void> {
    this.ensureStudentReference(studentReferenceId);
    await this.repository.removeSavedItem(studentReferenceId, entityType, entityId);
  }

  public async listSavedItems(studentReferenceId: string): Promise<StudentSavedItemDto[]> {
    this.ensureStudentReference(studentReferenceId);
    return this.repository.listSavedItems(studentReferenceId);
  }

  private ensureStudentReference(studentReferenceId: string): void {
    if (!studentReferenceId.trim()) {
      throw new Error('studentReferenceId is required');
    }
  }
}
