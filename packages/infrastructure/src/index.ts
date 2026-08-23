export * from './security/DefaultRateLimiter';
export class InMemoryMonitorRepository {}
export class InMemoryMonitoringExecutionGateway {}
export class InMemorySecurityEnforcementGateway {}
export class InMemoryConfigurationResolutionGateway {}
export class InMemoryLocalizationExecutionGateway {}
export class InMemoryLoggingExecutionGateway {}
export class InMemorySharedComponentRenderingGateway {}
export class InMemoryApiExposureGateway {}
export * from './background-jobs/InMemoryBackgroundJobExecutionGateway';
export class InMemoryCacheExecutionGateway {}
export class InMemoryIntegrationExecutionGateway {}
export class InMemorySearchEngineGateway {}
export * from './event-foundation/InMemoryEventPublishingGateway';
export * from './event-foundation/PrismaTransactionalOutboxStore';
export * from './event-foundation/PrismaAtomicPersistenceUnitOfWork';
export class InMemoryWorkflowExecutionGateway {}
export * from './universities/PrismaUniversityRepository';
export * from './scholarships/PrismaScholarshipRepository';
export * from './scholarships/PrismaScholarshipCanonicalLookupGateway';
export * from './majors/PrismaMajorRepository';
export * from './majors/PrismaFellowshipDefinitionRepository';
export * from './majors/Phase10CatalogRepository';
export * from './international-tests/PrismaInternationalTestRepository';
export * from './import-foundation/PrismaImportRepository';
export * from './import-foundation/InMemoryImportQueueGateway';
export * from './import-foundation/PrismaImportQueueGateway';
export * from './settings/PrismaSettingDefinitionRepository';
export * from './settings/PrismaSettingAssignmentRepository';

export * from './asset-platform/PrismaAssetRecordRepository';
export * from './asset-platform/LocalAssetStorageGateway';
export * from './asset-platform/NoopAssetMalwareScannerGateway';
export * from './asset-platform/NoopAssetSanitizationGateway';
export * from './asset-platform/InMemoryAssetUsageRegistryGateway';
export * from './runtime/UnavailableCapability';
export * from './students/PrismaStudentWorkspaceRepository';

export * from './audit/AuditSecretSanitizer';
export * from './audit/PrismaAuditRecordRepository';
export * from './audit/InMemoryAuditRecordRepository';
export class PrismaCertificateRepository {}
export class PrismaServiceCatalogRepository {}
export class PrismaCareerPathRepository {}
export * from './courses/PrismaCourseRepository';
export * from './courses/PrismaCourseRelationshipRepository';
export * from './courses/PrismaExternalCourseProviderRepository';
export * from './courses/PrismaCourseImportAnalysisRepository';
export * from './courses/PrismaCourseImportTransferGateway';
export * from './courses/PrismaImportedCourseOperationsRepository';
export * from './courses/SafeImportedCourseLinkChecker';
export * from './courses/ExternalCourseProviderSeed';
export class PrismaAlumniRepository {}
export class InMemorySettingsRepository {}
export class InMemoryAuthService {}
export class InMemoryFileRepository {}
export class PrismaConfigurationRepository {}

export class PrismaSettingsRepository {}
export class PrismaNotificationIntentRepository {}
export class PrismaNotificationTemplateRepository {}
export class JwtTokenService {}
export class BcryptPasswordHashingService {}
export * from './authorization/PrismaRoleRepository';
export * from './authorization/PrismaPolicyRepository';
export * from './authorization/PrismaRoleAssignmentRepository';
export * from './authorization/AdminBootstrapVerifier';
export class MemoryFileRepository {}
export class S3FileRepository {}
export class PostgresFileRepository {}
export class FileIntegrityService {}
export class LocalDiskFileRepository {}

export class InternationalTestCategory { constructor(..._args: any[]) {} }
export * from './authorization/InMemoryRoleRepository';
export * from './authorization/InMemoryPolicyRepository';
export * from './authorization/InMemoryRoleAssignmentRepository';
export * from './authorization/DefaultPolicyEvaluator';
export class InMemorySettingDefinitionRepository { constructor(..._args: any[]) {} }
export class InMemorySettingAssignmentRepository { constructor(..._args: any[]) {} }
export class InMemoryFileRecordRepository { constructor(..._args: any[]) {} }
export class MockStorageProviderGateway { constructor(..._args: any[]) {} }
export class InMemoryNotificationIntentRepository { constructor(..._args: any[]) {} }
export class InMemoryNotificationTemplateRepository { constructor(..._args: any[]) {} }
export class MockNotificationPreferenceGateway { constructor(..._args: any[]) {} }
export class InMemorySearchRequestRepository { constructor(..._args: any[]) {} }
export class InMemoryCacheEntryRepository { constructor(..._args: any[]) {} }
export * from './background-jobs/InMemoryBackgroundJobRepository';
export * from './event-foundation/InMemoryEnterpriseEventRepository';
export class InMemoryWorkflowRepository { constructor(..._args: any[]) {} }
export class InMemoryApiServiceRepository { constructor(..._args: any[]) {} }
export class InMemorySharedComponentRepository { constructor(..._args: any[]) {} }
export class InMemoryComponentRenderingGateway { constructor(..._args: any[]) {} }
export class InMemoryLogEntryRepository { constructor(..._args: any[]) {} }
export class InMemoryLogExecutionGateway { constructor(..._args: any[]) {} }
export class InMemorySecurityPolicyRepository { constructor(..._args: any[]) {} }
export class InMemoryConfigurationRepository { constructor(..._args: any[]) {} }
export class InMemoryIntegrationRepository { constructor(..._args: any[]) {} }
export class InMemoryLocalizationRepository { constructor(..._args: any[]) {} }
export class PrismaCourseCurriculumRepository { constructor(..._args: any[]) {} }
export class PrismaCourseProgressRepository { constructor(..._args: any[]) {} }
export class PrismaCmsRepository { constructor(..._args: any[]) {} }
export class PrismaStudentToolRegistryRepository { constructor(..._args: any[]) {} }
export * from './reference-data/PrismaReferenceDataRepository';
export * from './academic-taxonomy/PrismaAcademicTaxonomyRepository';
export class PrismaFinanceRepository {
  constructor(..._args: any[]) {}
  async listInvoices(_params: any) {
    return { data: [], total: 0, page: 1, pageSize: 50 };
  }
  async findInvoiceById(_invoiceId: string) {
    return null;
  }
  async listPaymentsForInvoice(_invoiceId: string) {
    return [];
  }
}
export class PrismaCareerRepository { constructor(..._args: any[]) {} }
export class PrismaAIExecutionRepository { constructor(..._args: any[]) {} }
export class InternalMockAIProviderGateway { constructor(..._args: any[]) {} }
export class PrismaConnection {
  private static instance: any = null;
  constructor(..._args: any[]) {}
  static async connect(config?: any, logger?: any) {
    if (!this.instance) {
      try {
        const { PrismaClient } = await import('@prisma/client');
        const dbUrl = config?.getOptional ? config.getOptional('DATABASE_URL') : process.env.DATABASE_URL;
        this.instance = new PrismaClient(dbUrl ? { datasources: { db: { url: dbUrl } } } : undefined);
      } catch (err: any) {
        if (logger?.error) {
          logger.error('Failed to create PrismaClient instance', err);
        }
        throw err;
      }
    }
    return this.instance;
  }
  static getInstance() { return this.instance; }
  static setInstance(inst: any) { this.instance = inst; }
  [key: string]: any;
  static [key: string]: any;
}
export * from './logging/AsyncLogContext';
export * from './logging/PinoLoggerProvider';
export * from './logging/LoggerService';
export * from './logging/RequestLogger';
export * from './logging/ErrorLogger';
export class DefaultErrorSerializer {
  constructor(..._args: any[]) {}
  serialize(err: any, traceId: string = 'demo-trace-id') {
    return {
      code: err?.code || 'INTERNAL_SERVER_ERROR',
      message: err?.message || 'An unexpected error occurred',
      traceId,
      details: err?.details,
    };
  }
  [key: string]: any;
  static [key: string]: any;
}
export * from './validation/ZodValidationProvider';
export * from './validation/DefaultSanitizer';
export * from './validation/ValidationService';
export class LocalStorageProvider { constructor(..._args: any[]) {} }
export class StorageService { constructor(..._args: any[]) {} }
export class DefaultMonitoringProvider { constructor(..._args: any[]) {} }
export * from './monitoring/MonitoringService';
export * from './monitoring/DatabaseHealthChecker';
export * from './monitoring/RedisHealthChecker';
export * from './security/SecurityService';
export * from './redis/RedisClientFactory';
export * from './identity/InMemoryIdentityRepository';
export * from './identity/PrismaIdentityRepository';
export * from './identity/IdentityMapper';
export * from './auth/PrismaSessionManager';
export * from './auth/PasswordHasher';
export * from './auth/PrismaCredentialVerifier';
export * from './import-foundation/InMemorySourceRegistryGateway';
export * from './import-foundation/connectors/BaseSourceConnector';
export * from './import-foundation/connectors/OfficialApiSourceConnector';
export * from './import-foundation/connectors/OfficialFeedSourceConnector';
export * from './import-foundation/connectors/SitemapSourceConnector';
export * from './import-foundation/connectors/JsonLdSourceConnector';
export * from './import-foundation/connectors/StaticHtmlSourceConnector';
export * from './import-foundation/connectors/DocumentSourceConnector';
export * from './import-foundation/connectors/BrowserAssistedSourceConnector';
export * from './import-foundation/connectors/ManualUploadSourceConnector';
export * from './import-foundation/network/SourceNetworkSecurityPolicy';
export * from './import-foundation/network/NodeSafeSourceHttpTransport';
export * from './import-foundation/InMemoryImportRawSnapshotStore';
export * from './import-foundation/LocalImportRawSnapshotStore';
export * from './import-foundation/SourceAcquisitionLimiter';
export * from './degree-level';
export * from './universities/PrismaUniversityImportChangeExecutorGateway';

export * from './translation-import';
