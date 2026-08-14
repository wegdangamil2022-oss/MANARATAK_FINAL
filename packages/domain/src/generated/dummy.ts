export interface ImportRecordDto {
  id?: string;
  status?: ImportRecordStatus;
  normalizedPayload?: Record<string, unknown> | unknown;
  rawPayload?: Record<string, unknown> | unknown;
  [key: string]: unknown;
}

export enum IntegrationScopeType { DUMMY = 'DUMMY' }
export class IntegrationCategory { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class Integration { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class IntegrationId { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class IntegrationCapabilityDefinition { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class IntegrationVersion { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class IntegrationIntent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export enum LocalizationScopeType { DUMMY = 'DUMMY' }
export class Localization { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LocalizationId { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LocalizationReference { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LocalizationOwnerReference { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LocalizationDefinition { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LocaleDefinition { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LocalizationClassification { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LocalizationVersion { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LocalizationMetadata { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LocalizationIntent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export enum LocalizationLifecycleState { DUMMY = 'DUMMY', ARCHIVED = 'ARCHIVED', DEPRECATED = 'DEPRECATED', ACTIVATED = 'ACTIVATED' }
export interface ILocalizationRepository { [key: string]: any }
export class LocalizationValidationService { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LocalizationCreatedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LocalizationActivatedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LocalizationDeprecatedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LocalizationArchivedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LogSeverity { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LogEntry { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LogEntryId { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LogClassification { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LogVersion { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LoggingIntent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export interface ILogEntryRepository { [key: string]: any }
export class LogReferenceSpecification { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LogValidationService { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LogEntryDeprecatedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class Monitor { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class MonitorId { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class MonitorDefinition { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class MonitorStateDefinition { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class MonitorVersion { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class MonitorMetadata { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class MonitoringIntent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export interface IMonitorRepository { [key: string]: any }
export class MonitorValidationService { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class MonitorCreatedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class MonitorActivatedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class MonitorStateChangedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class MonitorDeprecatedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export interface INotificationIntentRepository { [key: string]: any }
export interface INotificationPreferenceGateway { [key: string]: any }
export class NotificationIntent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class NotificationId { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class NotificationReference { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class TemplateId { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class NotificationRecipientReference { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class TemplateVariable { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class RetryMetadata { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class NotificationChannel { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export interface INotificationTemplateRepository { [key: string]: any }
export class NotificationTemplate { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class NotificationLocaleReference { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export interface IMembershipRepository { [key: string]: any }
export class Membership { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export enum MembershipStatus { DUMMY = 'DUMMY', Active = 'Active' }
export class Position { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class TimeSpan { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class Organization { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class OrganizationTypeDefinition { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export enum OrganizationStatus { DUMMY = 'DUMMY', Active = 'Active' }
export class HierarchyValidationService { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class IOrganizationTypeProvider { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class IMembershipSpecification { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class IOrganizationSpecification { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export interface IScholarshipRepository { [key: string]: any }
export interface ScholarshipDto { [key: string]: any }
export interface UpdateScholarshipDto { [key: string]: any }
export enum ScholarshipStatus { DUMMY = 'DUMMY', IMPORTED = 'IMPORTED', ARCHIVED = 'ARCHIVED', REJECTED = 'REJECTED', PUBLISHED = 'PUBLISHED', READY_TO_PUBLISH = 'READY_TO_PUBLISH', READY_TO_REVIEW = 'READY_TO_REVIEW' }
export interface ScholarshipFilters { [key: string]: any }
export interface PublicScholarshipDto { [key: string]: any }
export class SearchRequest { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export interface SearchResult { [key: string]: any }
export class SearchRequestId { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SearchScope { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SearchCriteria { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SearchFilter { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SearchPagination { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SearchSorting { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class FilterComparison { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LogicalOperator { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SortDirection { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export interface ISearchRequestRepository { [key: string]: any }
export class SearchRequestSpecification { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SecuritySensitivity { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SecurityPolicy { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SecurityPolicyId { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SecurityPolicyReference { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SecurityOwnerReference { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SecurityPolicyDefinition { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SecurityRuleDefinition { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SecurityVersion { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SecurityMetadata { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SecurityIntent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SecurityPolicyReferenceSpecification { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SecurityPolicyValidationService { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SecurityPolicyCreatedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SecurityPolicyActivatedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SecurityPolicyDeprecatedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SecurityPolicyArchivedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export interface CreateServiceCatalogItemDto { [key: string]: any }
export interface PaginatedServiceCatalogResult<T = any, _unused = T> { [key: string]: any }
export interface ServiceCatalogFilters { [key: string]: any }
export interface ServiceCatalogItemDto { [key: string]: any }
export enum ServiceCompletenessStatus { DUMMY = 'DUMMY', INCOMPLETE = 'INCOMPLETE', NEEDS_REVIEW = 'NEEDS_REVIEW', COMPLETE = 'COMPLETE' }
export enum ServiceStatus { DUMMY = 'DUMMY', ARCHIVED = 'ARCHIVED', REJECTED = 'REJECTED', PUBLISHED = 'PUBLISHED', READY_TO_PUBLISH = 'READY_TO_PUBLISH', READY_TO_REVIEW = 'READY_TO_REVIEW' }
export interface UpdateServiceCatalogItemDto { [key: string]: any }
export interface PublicServiceCatalogFilters { [key: string]: any }
export interface PublicServiceCatalogItemDto { [key: string]: any }
export class SharedComponent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SharedComponentId { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SharedComponentReference { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SharedComponentOwnerReference { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SharedComponentDefinition { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class ComponentVersion { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SharedComponentCompatibilityMetadata { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class RenderingIntent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export interface ISharedComponentRepository { [key: string]: any }
export class SharedComponentReferenceSpecification { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SharedComponentCreatedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SharedComponentActivatedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SharedComponentDeprecatedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SharedComponentArchivedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export interface IStudentToolRegistryRepository { [key: string]: any }
export enum StudentToolExecutionType { DUMMY = 'DUMMY', STATIC_FORM = 'STATIC_FORM', DETERMINISTIC_CALCULATOR = 'DETERMINISTIC_CALCULATOR', AI_ASSISTED = 'AI_ASSISTED' }
export enum StudentToolVisibilityStatus { DUMMY = 'DUMMY', UNDER_DEVELOPMENT = 'UNDER_DEVELOPMENT', COMING_SOON = 'COMING_SOON', ACTIVE = 'ACTIVE' }
export interface PublicStudentToolDto { [key: string]: any }
export enum StudentToolAiDependencyLevel { NONE = 'NONE', REQUIRED_LOW_COST = 'REQUIRED_LOW_COST', REQUIRED_HIGH_COST = 'REQUIRED_HIGH_COST' }
export interface StudentToolFilters { [key: string]: any }
export class StudentToolImplementationPriority { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export interface StudentToolRegistryEntryDto { [key: string]: any }
export interface UpsertStudentToolRegistryEntryDto { [key: string]: any }
export interface IStudentWorkspaceRepository { [key: string]: any }
export interface SaveStudentItemDto { [key: string]: any }
export interface StudentDashboardSummaryDto { [key: string]: any }
export interface StudentSavedItemDto { [key: string]: any }
export enum StudentSavedItemType { COURSE = 'COURSE', SCHOLARSHIP = 'SCHOLARSHIP', UNIVERSITY = 'UNIVERSITY', MAJOR = 'MAJOR' }
export interface StudentWorkspaceDto { [key: string]: any }
export interface UpsertStudentWorkspaceDto { [key: string]: any }
export class WorkflowReference { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export interface IWorkflowRepository { [key: string]: any }
export class Workflow { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class WorkflowId { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class WorkflowOwnerReference { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class WorkflowDefinition { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class WorkflowStateDefinition { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class WorkflowTransitionDefinition { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class WorkflowVersion { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class WorkflowMetadata { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class WorkflowExecutionIntent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class WorkflowSpecification { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class WorkflowTransitionValidator { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class WorkflowStateChangedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class WorkflowCompletedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export enum ImportRecordStatus { DUMMY = 'DUMMY', NEEDS_REVIEW = 'NEEDS_REVIEW', VALID = 'VALID', COMPLETE = 'COMPLETE', INCOMPLETE = 'INCOMPLETE', PROMOTED = 'PROMOTED', FAILED = 'FAILED', PENDING = 'PENDING' }
export class IntegrationReference { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class IntegrationOwnerReference { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class IntegrationDefinition { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class IntegrationClassification { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class IntegrationMetadata { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export enum IntegrationLifecycleState { DUMMY = 'DUMMY', ARCHIVED = 'ARCHIVED', DEPRECATED = 'DEPRECATED', ACTIVATED = 'ACTIVATED' }
export interface IIntegrationRepository { [key: string]: any }
export class IntegrationReferenceSpecification { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class IntegrationFoundationValidationService { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class IntegrationFoundationLifecycleService { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class IntegrationCreatedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class IntegrationActivatedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class IntegrationVersionPublishedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class IntegrationDeprecatedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class IntegrationArchivedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class TranslationDefinition { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LocalizationReferenceSpecification { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LocalizationLifecycleService { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LocalizationVersionPublishedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LogReference { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LogOwnerReference { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LogDefinition { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LogMetadata { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export enum LogLifecycleState { DUMMY = 'DUMMY', ARCHIVED = 'ARCHIVED', DEPRECATED = 'DEPRECATED', ACTIVATED = 'ACTIVATED' }
export class LogLifecycleService { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LogEntryCreatedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LogEntryActivatedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LogVersionPublishedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class LogEntryArchivedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class MonitorReference { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class MonitorOwnerReference { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export enum MonitorLifecycleState { DUMMY = 'DUMMY', ARCHIVED = 'ARCHIVED', DEPRECATED = 'DEPRECATED', ACTIVATED = 'ACTIVATED' }
export class MonitorReferenceSpecification { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class MonitorLifecycleService { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class MonitorArchivedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SchedulingMetadata { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class ExpirationMetadata { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export interface IOrganizationRepository { [key: string]: any }
export enum ScholarshipCompletenessState { INCOMPLETE = 'INCOMPLETE', NEEDS_REVIEW = 'NEEDS_REVIEW', COMPLETE = 'COMPLETE' }
export interface PaginatedResult<T = any, _unused = T> { [key: string]: any }
export interface PublicScholarshipFilters { [key: string]: any }
export class SearchReference { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SecurityPolicyClassification { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export enum SecurityLifecycleState { DUMMY = 'DUMMY', ARCHIVED = 'ARCHIVED', DEPRECATED = 'DEPRECATED', ACTIVATED = 'ACTIVATED' }
export interface ISecurityPolicyRepository { [key: string]: any }
export class SecurityLifecycleService { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class SecurityVersionPublishedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export interface IServiceCatalogRepository { [key: string]: any }
export class ComponentMetadata { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export enum ComponentLifecycleState { DUMMY = 'DUMMY', ARCHIVED = 'ARCHIVED', DEPRECATED = 'DEPRECATED', CREATED = 'CREATED', ACTIVATED = 'ACTIVATED' }
export class ComponentLifecycleService { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class ComponentCompatibilityService { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class ComponentVersionPublishedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class WorkflowCreatedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class WorkflowActivatedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class WorkflowArchivedEvent { constructor(..._args: any[]) {} [key: string]: any; static [key: string]: any; }
export class AIExecutionResponseDto { [key: string]: any; static [key: string]: any; }
export class AIExecutionUseCases { [key: string]: any; static [key: string]: any; }

export enum StudentWorkspaceStatus { DUMMY = 'DUMMY' }
export enum ServiceAvailabilityStatus { DUMMY = 'DUMMY', AVAILABLE = 'AVAILABLE' }
export enum ServiceCategory { DUMMY = 'DUMMY', VISA_SERVICES = 'VISA_SERVICES' }
export enum ServiceDeliveryMode { DUMMY = 'DUMMY', ONLINE = 'ONLINE' }
export enum ServiceFulfillmentType { DUMMY = 'DUMMY', CONSULTATION = 'CONSULTATION' }
