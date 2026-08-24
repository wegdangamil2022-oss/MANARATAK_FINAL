import {
  IStudentWorkspaceRepository,
  SaveStudentItemDto,
  StudentCollectionType,
  StudentDashboardSummaryDto,
  StudentRecentActivityDto,
  StudentSavedCollectionDto,
  StudentSavedItemDto,
  StudentSavedItemType,
  StudentTimelineEntryDto,
  StudentWorkspaceDto,
  StudentWorkspaceIntegrationEventDto,
  StudentWorkspaceStatus,
  UpsertStudentWorkspaceDto,
} from '@manaratak/domain';

export class StudentWorkspaceUseCases {
  constructor(private readonly repository: IStudentWorkspaceRepository) {}

  public async upsertWorkspace(data: UpsertStudentWorkspaceDto): Promise<StudentWorkspaceDto> {
    this.ensureStudentReference(data.studentReferenceId);
    if (data.avatarAssetId && /^https?:\/\//i.test(data.avatarAssetId)) {
      throw new Error('avatarAssetId must be a Phase 05 EAP handle, not a raw URL');
    }
    const current = await this.repository.findWorkspace(data.studentReferenceId);
    if (current && data.status && !this.canTransition(current.status, data.status)) {
      throw new Error('INVALID_STUDENT_WORKSPACE_TRANSITION');
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
    if (!data.entityId.trim()) throw new Error('entityId is required');
    return this.repository.saveItem(data);
  }

  public async removeSavedItem(
    studentReferenceId: string,
    entityType: StudentSavedItemType,
    entityId: string,
  ): Promise<void> {
    this.ensureStudentReference(studentReferenceId);
    await this.repository.removeSavedItem(studentReferenceId, entityType, entityId);
  }

  public async listSavedItems(studentReferenceId: string): Promise<StudentSavedItemDto[]> {
    this.ensureStudentReference(studentReferenceId);
    return this.repository.listSavedItems(studentReferenceId);
  }

  public async createCollection(data: {
    studentReferenceId: string;
    name: string;
    description?: string | null;
    type?: StudentCollectionType;
    color?: string | null;
    icon?: string | null;
  }): Promise<StudentSavedCollectionDto> {
    this.ensureStudentReference(data.studentReferenceId);
    if (!data.name.trim()) throw new Error('Collection name is required');
    return this.repository.createCollection({ ...data, name: data.name.trim() });
  }

  public async listCollections(studentReferenceId: string): Promise<StudentSavedCollectionDto[]> {
    this.ensureStudentReference(studentReferenceId);
    return this.repository.listCollections(studentReferenceId);
  }

  public async recordActivity(
    data: Omit<StudentRecentActivityDto, 'id' | 'occurredAt'>,
  ): Promise<StudentRecentActivityDto> {
    this.ensureStudentReference(data.studentReferenceId);
    if (!data.title.trim()) throw new Error('Activity title is required');
    return this.repository.appendActivity(data);
  }

  public async appendTimeline(
    data: Omit<StudentTimelineEntryDto, 'id' | 'occurredAt'>,
  ): Promise<StudentTimelineEntryDto> {
    this.ensureStudentReference(data.studentReferenceId);
    return this.repository.appendTimeline(data);
  }

  public async recordSearch(studentReferenceId: string, query: string): Promise<void> {
    this.ensureStudentReference(studentReferenceId);
    const normalized = query.trim().slice(0, 160);
    if (!normalized) return;
    await this.repository.recordSearch(studentReferenceId, normalized);
  }

  public async clearSearchHistory(studentReferenceId: string): Promise<void> {
    this.ensureStudentReference(studentReferenceId);
    await this.repository.clearSearchHistory(studentReferenceId);
  }

  public async createSnapshot(
    studentReferenceId: string,
    label?: string | null,
  ): Promise<{ id: string; createdAt: Date }> {
    this.ensureStudentReference(studentReferenceId);
    return this.repository.createSnapshot(studentReferenceId, label?.trim().slice(0, 80));
  }

  public async consumeIntegrationEvent(
    event: StudentWorkspaceIntegrationEventDto,
  ): Promise<boolean> {
    this.ensureStudentReference(event.studentReferenceId);
    if (!event.eventId.trim()) throw new Error('eventId is required');
    if (!event.sourceDomain.trim()) throw new Error('sourceDomain is required');
    return this.repository.ingestIntegrationEvent(event);
  }

  private ensureStudentReference(studentReferenceId: string): void {
    if (!studentReferenceId.trim()) {
      throw new Error('studentReferenceId is required');
    }
  }

  private canTransition(current: StudentWorkspaceStatus, next: StudentWorkspaceStatus): boolean {
    if (current === next) return true;
    const allowed: Record<StudentWorkspaceStatus, StudentWorkspaceStatus[]> = {
      [StudentWorkspaceStatus.INITIALIZING]: [StudentWorkspaceStatus.ACTIVE],
      [StudentWorkspaceStatus.ACTIVE]: [
        StudentWorkspaceStatus.SUSPENDED,
        StudentWorkspaceStatus.ARCHIVED,
      ],
      [StudentWorkspaceStatus.SUSPENDED]: [
        StudentWorkspaceStatus.ACTIVE,
        StudentWorkspaceStatus.ARCHIVED,
      ],
      [StudentWorkspaceStatus.ARCHIVED]: [],
    };
    return allowed[current].includes(next);
  }
}
