export enum StudentWorkspaceStatus {
  INITIALIZING = 'INITIALIZING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
}

export enum StudentSavedItemType {
  COURSE = 'COURSE',
  SCHOLARSHIP = 'SCHOLARSHIP',
  UNIVERSITY = 'UNIVERSITY',
  MAJOR = 'MAJOR',
  CERTIFICATE = 'CERTIFICATE',
  STUDENT_TOOL = 'STUDENT_TOOL',
}

export enum StudentCollectionType {
  PERSONAL = 'PERSONAL',
  SMART = 'SMART',
  FAVORITES = 'FAVORITES',
}

export type StudentWorkspaceDevice = 'DESKTOP' | 'TABLET' | 'MOBILE';

export interface StudentPrivacyPreferences {
  retainSearchHistory: boolean;
  allowPersonalization: boolean;
  allowProductAnalytics: boolean;
  publicProfileEnabled: boolean;
}

export interface StudentAccessibilityPreferences {
  textScale: 'SMALL' | 'DEFAULT' | 'LARGE';
  reduceMotion: boolean;
  highContrast: boolean;
}

export interface StudentNotificationPreferences {
  inApp: boolean;
  email: boolean;
  push: boolean;
  learning: boolean;
  certificates: boolean;
  scholarships: boolean;
  payments: boolean;
}

export interface StudentWorkspaceDto {
  id: string;
  studentReferenceId: string;
  status: StudentWorkspaceStatus;
  version: number;
  displayName?: string | null;
  preferredLanguage?: string | null;
  timezone?: string | null;
  theme?: string | null;
  avatarAssetId?: string | null;
  layoutPreferences?: Record<string, unknown> | null;
  notificationMatrix?: StudentNotificationPreferences | null;
  privacyPreferences?: StudentPrivacyPreferences | null;
  accessibilityPreferences?: StudentAccessibilityPreferences | null;
  metadata?: Record<string, unknown> | null;
  lastActiveAt?: Date | null;
  suspendedAt?: Date | null;
  archivedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertStudentWorkspaceDto {
  studentReferenceId: string;
  expectedVersion?: number;
  status?: StudentWorkspaceStatus;
  displayName?: string | null;
  preferredLanguage?: string | null;
  timezone?: string | null;
  theme?: string | null;
  avatarAssetId?: string | null;
  layoutPreferences?: Record<string, unknown> | null;
  notificationMatrix?: StudentNotificationPreferences | null;
  privacyPreferences?: StudentPrivacyPreferences | null;
  accessibilityPreferences?: StudentAccessibilityPreferences | null;
  metadata?: Record<string, unknown> | null;
}

export interface StudentSavedItemDto {
  id: string;
  studentReferenceId: string;
  collectionId?: string | null;
  entityType: StudentSavedItemType;
  entityId: string;
  entitySlug?: string | null;
  displayName?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  savedAt: Date;
  updatedAt: Date;
}

export interface SaveStudentItemDto {
  studentReferenceId: string;
  collectionId?: string | null;
  entityType: StudentSavedItemType;
  entityId: string;
  entitySlug?: string | null;
  displayName?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface StudentSavedCollectionDto {
  id: string;
  studentReferenceId: string;
  name: string;
  description?: string | null;
  type: StudentCollectionType;
  color?: string | null;
  icon?: string | null;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentTimelineEntryDto {
  id: string;
  studentReferenceId: string;
  eventType: string;
  title: string;
  description?: string | null;
  sourceDomain: string;
  sourceReferenceId?: string | null;
  metadata?: Record<string, unknown> | null;
  occurredAt: Date;
}

export interface StudentRecentActivityDto {
  id: string;
  studentReferenceId: string;
  activityType: string;
  title: string;
  entityType?: string | null;
  entityId?: string | null;
  entitySlug?: string | null;
  metadata?: Record<string, unknown> | null;
  occurredAt: Date;
}

export interface StudentCourseProgressDto {
  enrollmentId: string;
  courseId: string;
  courseSlug: string;
  courseName: string;
  status: string;
  progressPercentage: number;
  enrolledAt: Date;
  lastAccessedAt?: Date | null;
  completedAt?: Date | null;
}

export interface StudentCertificateProjectionDto {
  id: string;
  publicId: string;
  serialNumber: string;
  verificationCode: string;
  status: string;
  courseDisplayName: string;
  issuedAt: Date;
  expiresAt?: Date | null;
  certificatePdfAssetId?: string | null;
  previewImageAssetId?: string | null;
}

export interface StudentNotificationProjectionDto {
  id: string;
  category: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  readAt?: Date | null;
  occurredAt: Date;
}

export interface StudentWorkspaceIntegrationEventDto {
  eventId: string;
  studentReferenceId: string;
  eventType: string;
  sourceDomain: string;
  sourceReferenceId?: string | null;
  title: string;
  description?: string | null;
  occurredAt: Date;
  metadata?: Record<string, unknown> | null;
  notification?: {
    category: string;
    title: string;
    message: string;
    actionUrl?: string | null;
  } | null;
}

export interface StudentQuickActionDto {
  id: string;
  label: string;
  description: string;
  href: string;
  priority: number;
  kind: 'LEARNING' | 'CERTIFICATE' | 'DISCOVERY' | 'PAYMENT' | 'PROFILE';
}

export interface StudentPersonalStatisticsDto {
  savedItems: number;
  activeCourses: number;
  completedCourses: number;
  averageCourseProgress: number;
  certificates: number;
  unreadNotifications: number;
}

export type StudentCapabilityState = 'AVAILABLE' | 'DEGRADED' | 'NOT_CONFIGURED';

export interface StudentDashboardSummaryDto {
  workspace: StudentWorkspaceDto;
  savedItems: StudentSavedItemDto[];
  collections: StudentSavedCollectionDto[];
  timeline: StudentTimelineEntryDto[];
  recentActivity: StudentRecentActivityDto[];
  courseEnrollments: StudentCourseProgressDto[];
  certificates: StudentCertificateProjectionDto[];
  notifications: StudentNotificationProjectionDto[];
  quickActions: StudentQuickActionDto[];
  statistics: StudentPersonalStatisticsDto;
  certificateCount: number;
  activeCourseEnrollmentCount: number;
  completedCourseEnrollmentCount: number;
  capabilityStatus: Record<string, StudentCapabilityState>;
  partialFailures: string[];
}

export interface IStudentWorkspaceRepository {
  findWorkspace(studentReferenceId: string): Promise<StudentWorkspaceDto | null>;
  upsertWorkspace(data: UpsertStudentWorkspaceDto): Promise<StudentWorkspaceDto>;
  getDashboardSummary(studentReferenceId: string): Promise<StudentDashboardSummaryDto | null>;
  saveItem(data: SaveStudentItemDto): Promise<StudentSavedItemDto>;
  removeSavedItem(
    studentReferenceId: string,
    entityType: StudentSavedItemType,
    entityId: string,
  ): Promise<void>;
  listSavedItems(studentReferenceId: string): Promise<StudentSavedItemDto[]>;
  createCollection(data: {
    studentReferenceId: string;
    name: string;
    description?: string | null;
    type?: StudentCollectionType;
    color?: string | null;
    icon?: string | null;
  }): Promise<StudentSavedCollectionDto>;
  listCollections(studentReferenceId: string): Promise<StudentSavedCollectionDto[]>;
  appendActivity(
    data: Omit<StudentRecentActivityDto, 'id' | 'occurredAt'>,
  ): Promise<StudentRecentActivityDto>;
  appendTimeline(
    data: Omit<StudentTimelineEntryDto, 'id' | 'occurredAt'>,
  ): Promise<StudentTimelineEntryDto>;
  recordSearch(studentReferenceId: string, query: string): Promise<void>;
  clearSearchHistory(studentReferenceId: string): Promise<void>;
  createSnapshot(
    studentReferenceId: string,
    label?: string | null,
  ): Promise<{ id: string; createdAt: Date }>;
  ingestIntegrationEvent(event: StudentWorkspaceIntegrationEventDto): Promise<boolean>;
}
