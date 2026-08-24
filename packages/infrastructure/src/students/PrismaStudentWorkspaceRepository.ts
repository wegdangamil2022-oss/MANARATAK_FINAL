import { randomUUID } from 'node:crypto';
import { Prisma, PrismaClient } from '@prisma/client';
import {
  IStudentWorkspaceRepository,
  SaveStudentItemDto,
  StudentCollectionType,
  StudentDashboardSummaryDto,
  StudentRecentActivityDto,
  StudentSavedCollectionDto,
  StudentSavedItemDto,
  StudentTimelineEntryDto,
  StudentWorkspaceDto,
  StudentWorkspaceIntegrationEventDto,
  StudentWorkspaceStatus,
  UpsertStudentWorkspaceDto,
} from '@manaratak/domain';

const json = (value: unknown): Prisma.InputJsonValue | undefined =>
  value === undefined ? undefined : (JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue);

const DEFAULT_LAYOUT = {
  desktop: ['LEARNING_PROGRESS', 'QUICK_ACTIONS', 'CERTIFICATES', 'SAVED_ITEMS', 'TIMELINE'],
  mobile: ['QUICK_ACTIONS', 'LEARNING_PROGRESS', 'CERTIFICATES', 'SAVED_ITEMS', 'TIMELINE'],
};
const DEFAULT_NOTIFICATIONS = {
  inApp: true,
  email: true,
  push: false,
  learning: true,
  certificates: true,
  scholarships: true,
  payments: true,
};
const DEFAULT_PRIVACY = {
  retainSearchHistory: false,
  allowPersonalization: false,
  allowProductAnalytics: false,
  publicProfileEnabled: false,
};
const DEFAULT_ACCESSIBILITY = {
  textScale: 'DEFAULT',
  reduceMotion: false,
  highContrast: false,
};

export class PrismaStudentWorkspaceRepository implements IStudentWorkspaceRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  private get db(): any {
    return this.prisma as any;
  }

  public async findWorkspace(studentReferenceId: string): Promise<StudentWorkspaceDto | null> {
    const row = await this.db.studentWorkspace.findUnique({ where: { studentReferenceId } });
    return row ? this.workspace(row) : null;
  }

  public async upsertWorkspace(data: UpsertStudentWorkspaceDto): Promise<StudentWorkspaceDto> {
    return this.db.$transaction(async (tx: any) => {
      const current = await tx.studentWorkspace.findUnique({
        where: { studentReferenceId: data.studentReferenceId },
      });
      if (!current) {
        const created = await tx.studentWorkspace.create({
          data: {
            studentReferenceId: data.studentReferenceId,
            status: data.status ?? StudentWorkspaceStatus.ACTIVE,
            displayName: data.displayName,
            preferredLanguage: data.preferredLanguage ?? 'ar',
            timezone: data.timezone ?? 'Asia/Aden',
            theme: data.theme ?? 'SYSTEM',
            avatarAssetId: data.avatarAssetId,
            layoutPreferences: json(data.layoutPreferences ?? DEFAULT_LAYOUT),
            notificationMatrix: json(data.notificationMatrix ?? DEFAULT_NOTIFICATIONS),
            privacyPreferences: json(data.privacyPreferences ?? DEFAULT_PRIVACY),
            accessibilityPreferences: json(data.accessibilityPreferences ?? DEFAULT_ACCESSIBILITY),
            metadata: json(data.metadata),
            lastActiveAt: new Date(),
          },
        });
        await tx.studentSavedCollection.create({
          data: {
            id: randomUUID(),
            studentReferenceId: data.studentReferenceId,
            name: 'المفضلة',
            description: 'العناصر التي تريد الرجوع إليها بسرعة',
            type: StudentCollectionType.FAVORITES,
            color: '#087A55',
            icon: 'bookmark',
          },
        });
        await this.appendOutbox(tx, created.id, 'StudentWorkspaceCreated', {
          studentReferenceId: data.studentReferenceId,
          status: created.status,
        });
        return this.workspace(created);
      }

      if (current.status === StudentWorkspaceStatus.ARCHIVED)
        throw new Error('STUDENT_WORKSPACE_ARCHIVED');
      if (data.expectedVersion !== undefined && current.version !== data.expectedVersion)
        throw new Error('STUDENT_WORKSPACE_VERSION_CONFLICT');

      const { studentReferenceId: _reference, expectedVersion: _version, ...values } = data;
      const status = values.status ?? current.status;
      const row = await tx.studentWorkspace.update({
        where: { id: current.id },
        data: {
          ...values,
          layoutPreferences: json(values.layoutPreferences),
          notificationMatrix: json(values.notificationMatrix),
          privacyPreferences: json(values.privacyPreferences),
          accessibilityPreferences: json(values.accessibilityPreferences),
          metadata: json(values.metadata),
          version: { increment: 1 },
          lastActiveAt: new Date(),
          suspendedAt:
            status === StudentWorkspaceStatus.SUSPENDED
              ? (current.suspendedAt ?? new Date())
              : null,
          archivedAt:
            status === StudentWorkspaceStatus.ARCHIVED ? (current.archivedAt ?? new Date()) : null,
        },
      });
      await this.appendOutbox(tx, row.id, 'StudentWorkspaceUpdated', {
        studentReferenceId: row.studentReferenceId,
        version: row.version,
        status: row.status,
      });
      return this.workspace(row);
    });
  }

  public async getDashboardSummary(
    studentReferenceId: string,
  ): Promise<StudentDashboardSummaryDto | null> {
    const workspace = await this.db.studentWorkspace.findUnique({ where: { studentReferenceId } });
    if (!workspace) return null;
    const queries = await Promise.allSettled([
      this.db.studentSavedItem.findMany({
        where: { studentReferenceId },
        orderBy: { savedAt: 'desc' },
        take: 12,
      }),
      this.db.studentSavedCollection.findMany({
        where: { studentReferenceId },
        include: { _count: { select: { items: true } } },
        orderBy: { updatedAt: 'desc' },
      }),
      this.db.studentTimelineEntry.findMany({
        where: { studentReferenceId },
        orderBy: { occurredAt: 'desc' },
        take: 20,
      }),
      this.db.studentRecentActivity.findMany({
        where: { studentReferenceId },
        orderBy: { occurredAt: 'desc' },
        take: 12,
      }),
      this.db.courseEnrollment.findMany({
        where: { studentReferenceId },
        include: { course: { select: { id: true, slug: true, displayName: true } } },
        orderBy: [{ lastAccessedAt: 'desc' }, { enrolledAt: 'desc' }],
        take: 20,
      }),
      this.db.certificate.findMany({
        where: { studentReferenceId },
        select: {
          id: true,
          publicId: true,
          serialNumber: true,
          verificationCode: true,
          status: true,
          courseDisplayName: true,
          issuedAt: true,
          expiresAt: true,
          certificatePdfAssetId: true,
          previewImageAssetId: true,
        },
        orderBy: { issuedAt: 'desc' },
        take: 12,
      }),
      this.db.studentNotificationProjection.findMany({
        where: { studentReferenceId },
        orderBy: { occurredAt: 'desc' },
        take: 20,
      }),
      Promise.all([
        this.db.studentSavedItem.count({ where: { studentReferenceId } }),
        this.db.courseEnrollment.count({
          where: { studentReferenceId, status: { in: ['ACTIVE', 'IN_PROGRESS'] } },
        }),
        this.db.courseEnrollment.count({
          where: { studentReferenceId, status: 'COMPLETED' },
        }),
        this.db.courseEnrollment.aggregate({
          where: { studentReferenceId },
          _avg: { progressPercentage: true },
        }),
        this.db.certificate.count({ where: { studentReferenceId } }),
        this.db.studentNotificationProjection.count({
          where: { studentReferenceId, readAt: null },
        }),
      ]),
    ]);

    const failures: string[] = [];
    const value = <T>(index: number, capability: string): T[] => {
      const result = queries[index];
      if (result.status === 'fulfilled') return result.value as T[];
      failures.push(capability);
      return [];
    };
    const savedItems = value<any>(0, 'savedItems');
    const collections = value<any>(1, 'collections');
    const timeline = value<any>(2, 'timeline');
    const recentActivity = value<any>(3, 'recentActivity');
    const enrollments = value<any>(4, 'courseEnrollments');
    const certificates = value<any>(5, 'certificates');
    const notifications = value<any>(6, 'notifications');
    const totals = value<any>(7, 'personalStatistics');
    const activeCourses = enrollments.filter((entry) =>
      ['ACTIVE', 'IN_PROGRESS'].includes(entry.status),
    );
    const completedCourses = enrollments.filter((entry) => entry.status === 'COMPLETED');
    const averageProgress = totals.length
      ? Math.round(totals[3]._avg.progressPercentage ?? 0)
      : enrollments.length
        ? Math.round(
            enrollments.reduce((total, entry) => total + entry.progressPercentage, 0) /
              enrollments.length,
          )
        : 0;
    const savedItemCount = totals[0] ?? savedItems.length;
    const activeCourseCount = totals[1] ?? activeCourses.length;
    const completedCourseCount = totals[2] ?? completedCourses.length;
    const certificateCount = totals[4] ?? certificates.length;
    const unreadNotificationCount =
      totals[5] ?? notifications.filter((entry) => !entry.readAt).length;

    return {
      workspace: this.workspace(workspace),
      savedItems: savedItems.map((row) => this.savedItem(row)),
      collections: collections.map((row) => this.collection(row)),
      timeline,
      recentActivity,
      courseEnrollments: enrollments.map((row) => ({
        enrollmentId: row.id,
        courseId: row.courseId,
        courseSlug: row.course.slug,
        courseName: row.course.displayName,
        status: row.status,
        progressPercentage: row.progressPercentage,
        enrolledAt: row.enrolledAt,
        lastAccessedAt: row.lastAccessedAt,
        completedAt: row.completedAt,
      })),
      certificates,
      notifications,
      quickActions: this.quickActions(activeCourses, certificates, savedItemCount),
      statistics: {
        savedItems: savedItemCount,
        activeCourses: activeCourseCount,
        completedCourses: completedCourseCount,
        averageCourseProgress: averageProgress,
        certificates: certificateCount,
        unreadNotifications: unreadNotificationCount,
      },
      certificateCount,
      activeCourseEnrollmentCount: activeCourseCount,
      completedCourseEnrollmentCount: completedCourseCount,
      capabilityStatus: {
        workspace: 'AVAILABLE',
        savedItems: failures.includes('savedItems') ? 'DEGRADED' : 'AVAILABLE',
        collections: failures.includes('collections') ? 'DEGRADED' : 'AVAILABLE',
        timeline: failures.includes('timeline') ? 'DEGRADED' : 'AVAILABLE',
        recentActivity: failures.includes('recentActivity') ? 'DEGRADED' : 'AVAILABLE',
        courseEnrollments: failures.includes('courseEnrollments') ? 'DEGRADED' : 'AVAILABLE',
        certificates: failures.includes('certificates') ? 'DEGRADED' : 'AVAILABLE',
        notifications: failures.includes('notifications') ? 'DEGRADED' : 'AVAILABLE',
        personalStatistics: failures.includes('personalStatistics') ? 'DEGRADED' : 'AVAILABLE',
        recommendations: 'NOT_CONFIGURED',
      },
      partialFailures: failures,
    };
  }

  public async saveItem(data: SaveStudentItemDto): Promise<StudentSavedItemDto> {
    return this.db.$transaction(async (tx: any) => {
      const workspace = await this.requireWritable(tx, data.studentReferenceId);
      if (data.collectionId) {
        const collection = await tx.studentSavedCollection.findFirst({
          where: { id: data.collectionId, studentReferenceId: data.studentReferenceId },
        });
        if (!collection) throw new Error('STUDENT_COLLECTION_NOT_FOUND');
      }
      const row = await tx.studentSavedItem.upsert({
        where: {
          studentReferenceId_entityType_entityId: {
            studentReferenceId: data.studentReferenceId,
            entityType: data.entityType,
            entityId: data.entityId,
          },
        },
        create: { id: randomUUID(), ...data, metadata: json(data.metadata) },
        update: {
          collectionId: data.collectionId,
          entitySlug: data.entitySlug,
          displayName: data.displayName,
          notes: data.notes,
          metadata: json(data.metadata),
        },
      });
      await this.appendOutbox(tx, workspace.id, 'StudentSavedItemUpserted', {
        studentReferenceId: data.studentReferenceId,
        entityType: data.entityType,
        entityId: data.entityId,
      });
      return this.savedItem(row);
    });
  }

  public async removeSavedItem(
    studentReferenceId: string,
    entityType: any,
    entityId: string,
  ): Promise<void> {
    await this.db.$transaction(async (tx: any) => {
      const workspace = await this.requireWritable(tx, studentReferenceId);
      await tx.studentSavedItem.deleteMany({ where: { studentReferenceId, entityType, entityId } });
      await this.appendOutbox(tx, workspace.id, 'StudentSavedItemRemoved', {
        studentReferenceId,
        entityType,
        entityId,
      });
    });
  }

  public async listSavedItems(studentReferenceId: string): Promise<StudentSavedItemDto[]> {
    return (
      await this.db.studentSavedItem.findMany({
        where: { studentReferenceId },
        orderBy: { savedAt: 'desc' },
      })
    ).map((row: any) => this.savedItem(row));
  }

  public async createCollection(data: {
    studentReferenceId: string;
    name: string;
    description?: string | null;
    type?: StudentCollectionType;
    color?: string | null;
    icon?: string | null;
  }): Promise<StudentSavedCollectionDto> {
    return this.db.$transaction(async (tx: any) => {
      const workspace = await this.requireWritable(tx, data.studentReferenceId);
      const row = await tx.studentSavedCollection.create({
        data: { id: randomUUID(), type: StudentCollectionType.PERSONAL, ...data },
        include: { _count: { select: { items: true } } },
      });
      await this.appendOutbox(tx, workspace.id, 'StudentSavedCollectionCreated', {
        studentReferenceId: data.studentReferenceId,
        collectionId: row.id,
      });
      return this.collection(row);
    });
  }

  public async listCollections(studentReferenceId: string): Promise<StudentSavedCollectionDto[]> {
    return (
      await this.db.studentSavedCollection.findMany({
        where: { studentReferenceId },
        include: { _count: { select: { items: true } } },
        orderBy: { updatedAt: 'desc' },
      })
    ).map((row: any) => this.collection(row));
  }

  public async appendActivity(
    data: Omit<StudentRecentActivityDto, 'id' | 'occurredAt'>,
  ): Promise<StudentRecentActivityDto> {
    return this.db.$transaction(async (tx: any) => {
      await this.requireWritable(tx, data.studentReferenceId);
      const row = await tx.studentRecentActivity.create({
        data: { id: randomUUID(), ...data, metadata: json(data.metadata) },
      });
      const overflow = await tx.studentRecentActivity.findMany({
        where: { studentReferenceId: data.studentReferenceId },
        orderBy: { occurredAt: 'desc' },
        skip: 50,
        select: { id: true },
      });
      if (overflow.length) {
        await tx.studentRecentActivity.deleteMany({
          where: { id: { in: overflow.map((entry: any) => entry.id) } },
        });
      }
      return row;
    });
  }

  public async appendTimeline(
    data: Omit<StudentTimelineEntryDto, 'id' | 'occurredAt'>,
  ): Promise<StudentTimelineEntryDto> {
    const workspace = await this.findWorkspace(data.studentReferenceId);
    if (!workspace) throw new Error('STUDENT_WORKSPACE_NOT_FOUND');
    return this.db.studentTimelineEntry.create({
      data: { id: randomUUID(), ...data, metadata: json(data.metadata) },
    });
  }

  public async recordSearch(studentReferenceId: string, query: string): Promise<void> {
    await this.db.$transaction(async (tx: any) => {
      const workspace = await this.requireWritable(tx, studentReferenceId);
      const privacy = (workspace.privacyPreferences ?? DEFAULT_PRIVACY) as typeof DEFAULT_PRIVACY;
      if (!privacy.retainSearchHistory) return;
      await tx.studentSearchHistory.create({
        data: {
          id: randomUUID(),
          studentReferenceId,
          query,
          normalizedQuery: query.trim().toLocaleLowerCase('ar'),
        },
      });
      const overflow = await tx.studentSearchHistory.findMany({
        where: { studentReferenceId },
        orderBy: { searchedAt: 'desc' },
        skip: 25,
        select: { id: true },
      });
      if (overflow.length) {
        await tx.studentSearchHistory.deleteMany({
          where: { id: { in: overflow.map((entry: any) => entry.id) } },
        });
      }
    });
  }

  public async clearSearchHistory(studentReferenceId: string): Promise<void> {
    await this.db.studentSearchHistory.deleteMany({ where: { studentReferenceId } });
  }

  public async createSnapshot(
    studentReferenceId: string,
    label?: string | null,
  ): Promise<{ id: string; createdAt: Date }> {
    const workspace = await this.findWorkspace(studentReferenceId);
    if (!workspace) throw new Error('STUDENT_WORKSPACE_NOT_FOUND');
    const row = await this.db.studentWorkspaceSnapshot.create({
      data: {
        id: randomUUID(),
        studentReferenceId,
        label,
        workspaceVersion: workspace.version,
        configuration: json({
          layoutPreferences: workspace.layoutPreferences,
          notificationMatrix: workspace.notificationMatrix,
          privacyPreferences: workspace.privacyPreferences,
          accessibilityPreferences: workspace.accessibilityPreferences,
          theme: workspace.theme,
          preferredLanguage: workspace.preferredLanguage,
          timezone: workspace.timezone,
        })!,
      },
    });
    return { id: row.id, createdAt: row.createdAt };
  }

  public async ingestIntegrationEvent(
    event: StudentWorkspaceIntegrationEventDto,
  ): Promise<boolean> {
    return this.db.$transaction(async (tx: any) => {
      const duplicate = await tx.studentWorkspaceEventInbox.findUnique({
        where: { eventId: event.eventId },
      });
      if (duplicate) return false;
      const workspace = await tx.studentWorkspace.findUnique({
        where: { studentReferenceId: event.studentReferenceId },
      });
      if (!workspace) throw new Error('STUDENT_WORKSPACE_NOT_FOUND');
      const inboxId = randomUUID();
      await tx.studentWorkspaceEventInbox.create({
        data: {
          id: inboxId,
          eventId: event.eventId,
          studentReferenceId: event.studentReferenceId,
          sourceDomain: event.sourceDomain,
          eventType: event.eventType,
          payload: json(event),
        },
      });
      await tx.studentTimelineEntry.create({
        data: {
          id: randomUUID(),
          studentReferenceId: event.studentReferenceId,
          eventType: event.eventType,
          title: event.title,
          description: event.description,
          sourceDomain: event.sourceDomain,
          sourceReferenceId: event.sourceReferenceId,
          metadata: json({ ...event.metadata, sourceEventId: event.eventId }),
          occurredAt: event.occurredAt,
        },
      });
      if (event.notification) {
        await tx.studentNotificationProjection.create({
          data: {
            id: randomUUID(),
            studentReferenceId: event.studentReferenceId,
            category: event.notification.category,
            title: event.notification.title,
            message: event.notification.message,
            actionUrl: event.notification.actionUrl,
            sourceEventId: event.eventId,
            occurredAt: event.occurredAt,
          },
        });
      }
      await tx.studentWorkspaceEventInbox.update({
        where: { id: inboxId },
        data: { processedAt: new Date() },
      });
      return true;
    });
  }

  private async requireWritable(tx: any, studentReferenceId: string): Promise<any> {
    const workspace = await tx.studentWorkspace.findUnique({ where: { studentReferenceId } });
    if (!workspace) throw new Error('STUDENT_WORKSPACE_NOT_FOUND');
    if (workspace.status === StudentWorkspaceStatus.SUSPENDED)
      throw new Error('STUDENT_WORKSPACE_SUSPENDED');
    if (workspace.status === StudentWorkspaceStatus.ARCHIVED)
      throw new Error('STUDENT_WORKSPACE_ARCHIVED');
    return workspace;
  }

  private async appendOutbox(
    tx: any,
    workspaceId: string,
    eventType: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await tx.transactionalOutboxRecord.create({
      data: {
        id: randomUUID(),
        eventType,
        domain: 'STUDENT_WORKSPACE',
        aggregateType: 'StudentWorkspace',
        aggregateId: workspaceId,
        payload: json(payload),
        metadata: json({ sourcePhase: 'Phase15', schemaVersion: '1.0' }),
      },
    });
  }

  private quickActions(enrollments: any[], certificates: any[], savedItemCount: number): any[] {
    const actions: any[] = [];
    const nextCourse = enrollments[0];
    if (nextCourse) {
      actions.push({
        id: `continue-${nextCourse.id}`,
        label: 'متابعة التعلم',
        description: `أكمل ${nextCourse.course.displayName}`,
        href: `/courses/${nextCourse.course.slug}`,
        priority: 100,
        kind: 'LEARNING',
      });
    }
    if (certificates.length) {
      actions.push({
        id: 'view-certificates',
        label: 'عرض شهاداتي',
        description: `لديك ${certificates.length} شهادة في خزنتك`,
        href: '/certificates',
        priority: 80,
        kind: 'CERTIFICATE',
      });
    }
    actions.push({
      id: 'discover-scholarships',
      label: 'استكشف المنح',
      description: savedItemCount ? 'أضف فرصًا جديدة إلى محفوظاتك' : 'ابدأ ببناء قائمة فرصك',
      href: '/scholarships',
      priority: 60,
      kind: 'DISCOVERY',
    });
    return actions;
  }

  private workspace(row: any): StudentWorkspaceDto {
    return {
      ...row,
      status: row.status as StudentWorkspaceStatus,
      layoutPreferences: row.layoutPreferences as Record<string, unknown> | null,
      notificationMatrix: row.notificationMatrix,
      privacyPreferences: row.privacyPreferences,
      accessibilityPreferences: row.accessibilityPreferences,
      metadata: row.metadata as Record<string, unknown> | null,
    };
  }

  private savedItem(row: any): StudentSavedItemDto {
    return { ...row, metadata: row.metadata as Record<string, unknown> | null };
  }

  private collection(row: any): StudentSavedCollectionDto {
    const { _count, ...collection } = row;
    return { ...collection, itemCount: _count?.items ?? 0 };
  }
}
