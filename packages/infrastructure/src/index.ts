export * from './security/DefaultRateLimiter';
export * from './security/RedisRateLimiter';
export * from './background-jobs/InMemoryBackgroundJobExecutionGateway';
export * from './event-foundation/InMemoryEventPublishingGateway';
export * from './event-foundation/PrismaEnterpriseEventRepository';
export * from './event-foundation/PrismaEventPublishingGateway';
export * from './event-foundation/PrismaTransactionalOutboxStore';
export * from './event-foundation/PrismaAtomicPersistenceUnitOfWork';
export * from './universities/PrismaUniversityRepository';
export * from './scholarships/PrismaScholarshipRepository';
export * from './scholarships/PrismaScholarshipImportDecisionPorts';
export * from './scholarships/InMemoryScholarshipImportDecisionPorts';
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
export * from './certificates/PrismaCertificateRepository';
export * from './courses/PrismaCourseRepository';
export * from './courses/PrismaCourseRelationshipRepository';
export * from './courses/PrismaExternalCourseProviderRepository';
export * from './courses/PrismaCourseImportAnalysisRepository';
export * from './courses/PrismaCourseImportTransferGateway';
export * from './courses/PrismaImportedCourseOperationsRepository';
export * from './courses/SafeImportedCourseLinkChecker';
export * from './courses/ExternalCourseProviderSeed';

export * from './authorization/PrismaRoleRepository';
export * from './authorization/PrismaPolicyRepository';
export * from './authorization/PrismaRoleAssignmentRepository';
export * from './authorization/AdminBootstrapVerifier';

export * from './authorization/InMemoryRoleRepository';
export * from './authorization/InMemoryPolicyRepository';
export * from './authorization/InMemoryRoleAssignmentRepository';
export * from './authorization/DefaultPolicyEvaluator';
export * from './background-jobs/InMemoryBackgroundJobRepository';
export * from './event-foundation/InMemoryEnterpriseEventRepository';
export * from './courses/PrismaCourseCurriculumRepository';
export * from './courses/PrismaCourseProgressRepository';
export * from './cms/PrismaCmsRepository';
export * from './student-tools/PrismaStudentToolRegistryRepository';
export * from './student-tools/StudentToolGateways';
export * from './reference-data/PrismaReferenceDataRepository';
export * from './academic-taxonomy/PrismaAcademicTaxonomyRepository';
export * from './finance-platform/PrismaFinanceRepository';
export * from './finance-platform/ProviderNeutralFinanceGateways';
export * from './finance-platform/FinanceSafetyGateways';
export { PrismaAIPlatformRepository, PrismaAIPlatformRepository as PrismaAIExecutionRepository } from './ai-platform/PrismaAIPlatformRepository';
export * from './ai-platform/ProviderAdapters';
export * from './ai-platform/EnvironmentAIAsyncPayloadProtector';
export class PrismaConnection {
  private static instance: any = null;
  constructor(..._args: any[]) {}
  static async connect(config?: any, logger?: any) {
    if (!this.instance) {
      try {
        const { PrismaClient } = await import('@prisma/client');
        const dbUrl = config?.getOptional ? config.getOptional('DATABASE_URL') : undefined;
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
export * from './monitoring/MonitoringService';
export * from './monitoring/DatabaseHealthChecker';
export * from './monitoring/RedisHealthChecker';
export * from './security/SecurityService';
export * from './redis/RedisClientFactory';
export * from './students/RedisStudentWorkspaceDeliveryCache';
export * from './cms/RedisCmsDeliveryCache';
export * from './identity/InMemoryIdentityRepository';
export * from './identity/PrismaIdentityRepository';
export * from './identity/IdentityMapper';
export * from './auth/PrismaSessionManager';
export * from './auth/PasswordHasher';
export * from './auth/JwtTokenProvider';
export * from './auth/PrismaCredentialVerifier';
export * from './import-foundation/InMemorySourceRegistryGateway';
export * from './import-foundation/PrismaSourceRegistryGateway';
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
export * from './network/PublicNetworkAddressPolicy';
export * from './import-foundation/network/NodeSafeSourceHttpTransport';
export * from './import-foundation/InMemoryImportRawSnapshotStore';
export * from './import-foundation/LocalImportRawSnapshotStore';
export * from './import-foundation/SourceAcquisitionLimiter';
export * from './degree-level';
export * from './universities/PrismaUniversityImportChangeExecutorGateway';

export * from './translation-import';
