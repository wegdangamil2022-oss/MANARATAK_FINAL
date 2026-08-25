import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const checks = [];
const check = (name, condition) => checks.push({ name, ok: Boolean(condition) });

const prismaQueue = read('packages/infrastructure/src/import-foundation/PrismaImportQueueGateway.ts');
const memoryQueue = read('packages/infrastructure/src/import-foundation/InMemoryImportQueueGateway.ts');
const adminImport = read('packages/application/src/import-foundation/use-cases/ImportAdminUseCases.ts');
const worker = read('packages/application/src/import-foundation/use-cases/ImportWorkerProtocol.ts');
const networkPolicy = read('packages/infrastructure/src/import-foundation/network/SourceNetworkSecurityPolicy.ts');
const transport = read('packages/infrastructure/src/import-foundation/network/NodeSafeSourceHttpTransport.ts');
const rawStore = read('packages/infrastructure/src/import-foundation/LocalImportRawSnapshotStore.ts');
const runtimePolicy = read('apps/api/src/infrastructure/di/RuntimeDependencyPolicy.ts');
const container = read('apps/api/src/infrastructure/di/container.ts');
const infraIndex = read('packages/infrastructure/src/index.ts');
const eventRepo = read('packages/infrastructure/src/event-foundation/PrismaEnterpriseEventRepository.ts');
const eventPublisher = read('packages/infrastructure/src/event-foundation/PrismaEventPublishingGateway.ts');
const schema = read('packages/infrastructure/prisma/schema.prisma');
const migration = read('packages/infrastructure/prisma/migrations/20260825180000_w2_enterprise_event_durability/migration.sql');
const phase4Storage = read('docs/phases/phase-04-architecture-governance/baselines/phase-04-12-report.md');

check('P6-SEC-005 path prefixes are segment bounded',
  networkPolicy.includes("pathname === prefix || pathname.startsWith(`${prefix}/`)") &&
  !networkPolicy.includes('url.pathname.startsWith(prefix)'));

check('P6-RES-006 response size has a hard cap',
  transport.includes('hardMaxResponseBytes') && transport.includes('Math.min(value, hardMax)'));
check('P6-RES-006 timeout has a hard cap',
  transport.includes('hardMaxTimeoutMs') && transport.includes('SOURCE_TIMEOUT_INVALID'));
check('P6-RES-006 redirects remain hard bounded',
  transport.includes('hardMaxRedirects: 5'));

check('P6-QUEUE-002 Prisma queue reclaims expired RUNNING jobs',
  prismaQueue.includes('batchStatus: ImportJobStatus.RUNNING') &&
  prismaQueue.includes('claimUntil: { lt: now }') &&
  prismaQueue.includes('Worker-crash recovery'));
check('P6-QUEUE-002 in-memory queue mirrors expired RUNNING recovery',
  memoryQueue.includes('abandonedRunning') && memoryQueue.includes('this.leases.delete(candidate.batchId)'));
check('P6-QUEUE-002 completion rejects expired leases',
  /completeClaimedJob[\s\S]*?claimUntil:\s*\{\s*gte:\s*now\s*\}/.test(prismaQueue));
check('P6-QUEUE-002 failure rejects expired leases',
  /failClaimedJob[\s\S]*?claimUntil:\s*\{\s*gte:\s*now\s*\}/.test(prismaQueue));

check('P6-REPLAY-007 fresh replay clears durable checkpoints',
  prismaQueue.includes("status: 'CHECKPOINT'") && prismaQueue.includes('deleteMany'));
check('P6-REPLAY-007 fresh replay clears lease/error/attempt state',
  prismaQueue.includes('claimedBy: null') && prismaQueue.includes('claimUntil: null') &&
  prismaQueue.includes('lastError: null') && prismaQueue.includes('attemptCount: 0'));

check('P6-QUEUE-003 live staging persists CREATED before queue ownership',
  adminImport.includes('batchStatus: durableWorkerPath ? ImportJobStatus.CREATED') &&
  adminImport.includes('_phase6HandoffEnvelope'));
check('P6-QUEUE-003 live staging enqueues before worker processing',
  adminImport.indexOf('enqueueImportJob({') > 0 &&
  adminImport.indexOf('enqueueImportJob({') < adminImport.indexOf('importWorkerProtocol!.runOne'));
check('P6-QUEUE-003 worker supports targeted claims',
  worker.includes('batchId?: string') && worker.includes('batchId,'));
check('P6-QUEUE-003 composition wires worker protocol into ImportAdminUseCases',
  container.includes('importWorkerProtocol: asFunction') &&
  container.includes('new ImportAdminUseCases(importRepository, importQueueGateway, importHandoffDispatcher, importWorkerProtocol)'));

check('P6-DUR-004 local raw snapshot storage is development-only',
  rawStore.includes("persistenceClassification = 'DEVELOPMENT_ONLY'"));
check('P6-DUR-004 production raw snapshots fail closed without durable provider',
  runtimePolicy.includes("createUnavailableCapability('durableImportRawSnapshotStore')") &&
  container.includes('createImportRawSnapshotStoreForRuntime'));
check('P6-DUR-004 active composition no longer constructs LocalImportRawSnapshotStore directly',
  !container.includes('new LocalImportRawSnapshotStore('));

check('P5-EVT-004 enterprise events have durable Prisma repository',
  eventRepo.includes("persistenceClassification = 'DURABLE'") && schema.includes('model EnterpriseEventRecord'));
check('P5-EVT-004 publishing atomically updates event and appends outbox',
  eventPublisher.includes('this.prisma.$transaction') &&
  eventPublisher.includes('enterpriseEventRecord') &&
  eventPublisher.includes('transactionalOutboxRecord') &&
  eventPublisher.includes('OutboxProcessingState.PENDING'));
check('P5-EVT-004 production composition does not use process-local event adapters',
  container.includes('new PrismaEnterpriseEventRepository(prisma)') &&
  container.includes('new PrismaEventPublishingGateway(prisma)') &&
  container.includes("createUnavailableCapability('enterpriseEventPersistence')"));
check('P5-EVT-004 migration source exists for durable event record',
  migration.includes('CREATE TABLE "EnterpriseEventRecord"') && migration.includes('reference_key'));

const misleadingNoopNames = [
  'InMemoryMonitorRepository','InMemoryMonitoringExecutionGateway','InMemorySecurityEnforcementGateway',
  'InMemoryConfigurationResolutionGateway','InMemoryLocalizationExecutionGateway','InMemoryLoggingExecutionGateway',
  'InMemorySharedComponentRenderingGateway','InMemoryApiExposureGateway','InMemoryCacheExecutionGateway',
  'InMemoryIntegrationExecutionGateway','InMemorySearchEngineGateway','InMemoryWorkflowExecutionGateway',
  'PrismaServiceCatalogRepository','PrismaCareerPathRepository','PrismaAlumniRepository','InMemorySettingsRepository',
  'InMemoryAuthService','InMemoryFileRepository','PrismaConfigurationRepository','PrismaSettingsRepository',
  'PrismaNotificationIntentRepository','PrismaNotificationTemplateRepository','JwtTokenService','BcryptPasswordHashingService',
  'MemoryFileRepository','S3FileRepository','PostgresFileRepository','FileIntegrityService','LocalDiskFileRepository',
  'InMemorySettingDefinitionRepository','InMemorySettingAssignmentRepository','InMemoryFileRecordRepository',
  'MockStorageProviderGateway','InMemoryNotificationIntentRepository','InMemoryNotificationTemplateRepository',
  'MockNotificationPreferenceGateway','InMemorySearchRequestRepository','InMemoryCacheEntryRepository',
  'InMemoryWorkflowRepository','InMemoryApiServiceRepository','InMemorySharedComponentRepository',
  'InMemoryComponentRenderingGateway','InMemoryLogEntryRepository','InMemoryLogExecutionGateway',
  'InMemorySecurityPolicyRepository','InMemoryConfigurationRepository','InMemoryIntegrationRepository',
  'InMemoryLocalizationRepository','PrismaCareerRepository','LocalStorageProvider','StorageService','DefaultMonitoringProvider',
];
check('P3-INFRA-001 misleading empty implementation exports removed',
  misleadingNoopNames.every((name) => !new RegExp(`export class ${name}\\b`).test(infraIndex)));
check('P4-STORAGE-001 storage baseline explicitly records W2 compatibility cleanup',
  phase4Storage.includes('W2 compatibility cleanup') && phase4Storage.includes('DEVELOPMENT_ONLY'));

const passed = checks.filter((c) => c.ok).length;
for (const item of checks) console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.name}`);
console.log(`W2_SOURCE_VERIFIER = ${passed === checks.length ? 'PASS' : 'FAIL'} ${passed}/${checks.length}`);
if (passed !== checks.length) process.exit(1);
