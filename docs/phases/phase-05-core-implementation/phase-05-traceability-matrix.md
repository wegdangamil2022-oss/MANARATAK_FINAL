# MANARATAK 2.0: Phase 5 Shared Services Traceability Matrix

**Document ID:** PHASE-05-TRACEABILITY-MATRIX  
**Status:** Approved & Baselined  
**Phase:** 05 - Core Implementation / EAP  
**Scope:** Mapping and validating the exact implementation status of all 20 Phase 5 foundations, defining Phase 9 schema normalization blockers, and establishing boundaries between implemented, in-memory, and deferred systems.

> **WP1-B/D/E superseding notice:** Rows below preserve historical inventory. Active composition now uses Prisma implementations where supported and explicit `UNAVAILABLE` fail-closed capabilities otherwise. Critical-route audit policy is implemented in source; database durability and same-transaction guarantees remain `RUNTIME VALIDATION PENDING / REQUIRES_DATABASE_RECOVERY`. `Implemented` is not a current runtime verification claim.

---

## 1. Traceability Matrix

This matrix documents the explicit mapping from domain contract to infrastructure implementation and DI registration for all core foundations of Phase 5. It establishes clear realities for the monorepo setup to replace any overstated legacy documentation.

| System / Shared Service | Contract / Interface | Domain Location | Application Implementation | Infrastructure Implementation | DI / Container Registration | Tests | Current Status | Phase 9 Blocker Level |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Audit** | `IAuditRecordRepository` | `packages/domain/src/audit/repositories/` | `ManageAuditRecordsUseCase` | `PrismaAuditRecordRepository` (using Postgres) & `InMemoryAuditRecordRepository` | `auditRepository` in `container.ts` | `PrismaAuditRecordRepository.spec.ts` | **Implemented** (Real DB + Tests) | **Not blocking** |
| **Identity** | `IIdentityRepository` | `packages/domain/src/identity/repositories/` | Identity Use Cases (Provision, Activate, Suspend, etc.) | `PrismaIdentityRepository` & `InMemoryIdentityRepository` | `identityRepository` in `container.ts` | `PrismaIdentityRepository.spec.ts` | **Implemented** (Real DB + Tests) | **Not blocking** |
| **Authorization** | `IRoleRepository`, `IPolicyRepository`, `IRoleAssignmentRepository` | `packages/domain/src/authorization/repositories/` | `ManageRolesUseCase`, `AssignRoleUseCase`, `EvaluateAccessUseCase` | `PrismaRoleRepository`, `PrismaPolicyRepository`, `PrismaRoleAssignmentRepository` & in-memory equivalents | `roleRepository`, `policyRepository`, `roleAssignmentRepository` in `container.ts` | `PrismaAuthorizationRepository.spec.ts` | **Implemented** (Real DB + Tests) | **Not blocking** |
| **Settings** | `ISettingDefinitionRepository`, `ISettingAssignmentRepository` | `packages/domain/src/settings/repositories/` | `ManageSettingsUseCase` | `PrismaSettingDefinitionRepository`, `PrismaSettingAssignmentRepository` & in-memory equivalents | `settingDefinitionRepository`, `settingAssignmentRepository` in `container.ts` | `PrismaSettingDefinitionRepository.spec.ts`, `PrismaSettingAssignmentRepository.spec.ts` | **Implemented** (Real DB + Tests) | **Not blocking** |
| **Assets (Asset Platform)** | `IAssetRecordRepository` | `packages/domain/src/asset-platform/repositories/` | `IngestAssetUseCase`, `ProcessAssetLifecycleUseCase` | `PrismaAssetRecordRepository`, `LocalAssetStorageGateway`, `NoopAssetMalwareScannerGateway`, `NoopAssetSanitizationGateway`, `InMemoryAssetUsageRegistryGateway` | `assetRecordRepository`, `assetStorageGateway`, `malwareScannerGateway`, `sanitizationGateway`, `assetUsageRegistryGateway` in `container.ts` | Asset Platform Use Cases and Gateway Tests | **Partially implemented** (Metadata durable; file storage local mock; malware & sanitization are No-op adapter) | **Medium** (Requires asset handling boundaries for imported attachments) |
| **Notifications** | `INotificationIntentRepository`, `INotificationTemplateRepository`, `INotificationPreferenceGateway` | `packages/domain/src/generated/dummy.ts` (Dummy generated) | `ManageNotificationIntentsUseCase`, `ManageNotificationTemplatesUseCase` | `InMemoryNotificationIntentRepository`, `InMemoryNotificationTemplateRepository`, `MockNotificationPreferenceGateway` | `notificationIntentRepository`, `notificationTemplateRepository`, `notificationPreferenceGateway` in `container.ts` | In-memory only unit/integration tests | **In-memory only / Dummy contract** (No real mail/SMS channels, no database schema) | **Low** |
| **Background Jobs** | `IBackgroundJobRepository` | `packages/domain/src/background-jobs/repositories/` | `ManageBackgroundJobsUseCase` | `InMemoryBackgroundJobRepository`, `InMemoryBackgroundJobExecutionGateway` | `backgroundJobRepository`, `backgroundJobExecutionGateway` in `container.ts` | In-memory only queue tests | **In-memory only** (BullMQ / Redis-backed durable queue deferred) | **High** (Requires manual-only fallback or local durable tracking for major imports) |
| **Enterprise Events / Outbox** | `IEnterpriseEventRepository` | `packages/domain/src/event-foundation/repositories/` | `ManageEnterpriseEventsUseCase` | `InMemoryEnterpriseEventRepository`, `InMemoryEventPublishingGateway` | `enterpriseEventRepository`, `eventPublishingGateway` in `container.ts` | In-memory event dispatch tests | **In-memory only** (Durable outbox pattern is in-memory, broker integration deferred) | **Medium** (Requires synchronous fallback logic) |
| **Workflow** | `IWorkflowRepository` | `packages/domain/src/generated/dummy.ts` (Dummy generated) | `ManageWorkflowsUseCase` | `InMemoryWorkflowRepository`, `InMemoryWorkflowExecutionGateway` | `workflowRepository`, `workflowExecutionGateway` in `container.ts` | In-memory state machine tests | **In-memory only / Dummy contract** (Full engine deferred) | **Not blocking** |
| **Search** | `ISearchRequestRepository` | `packages/domain/src/generated/dummy.ts` (Dummy generated) | `ManageSearchUseCase` | `InMemorySearchRequestRepository`, `InMemorySearchEngineGateway` | `searchRequestRepository`, `searchEngineGateway` in `container.ts` | In-memory query tests | **In-memory only / Dummy contract** (Elasticsearch/OpenSearch deferred) | **Not blocking** |
| **Cache** | `ICacheEntryRepository` | `packages/domain/src/cache/repositories/` | `ManageCacheUseCase` | `InMemoryCacheEntryRepository`, `InMemoryCacheExecutionGateway` | `cacheEntryRepository`, `cacheExecutionGateway` in `container.ts` | In-memory key-value tests | **In-memory only** (Distributed Redis storage deferred) | **Not blocking** |
| **API Foundation** | `IApiServiceRepository` | `packages/domain/src/api-foundation/` | `ManageApiServicesUseCase` | `InMemoryApiServiceRepository`, `InMemoryApiExposureGateway` | `apiServiceRepository`, `apiExposureGateway` in `container.ts` | In-memory exposure tests | **In-memory only** (Dynamic dynamic API gateway deferred) | **Not blocking** |
| **Security Policy** | `ISecurityPolicyRepository` | `packages/domain/src/generated/dummy.ts` (Dummy generated) | `ManageSecurityPoliciesUseCase` | `InMemorySecurityPolicyRepository`, `InMemorySecurityEnforcementGateway` | `securityPolicyRepository`, `securityEnforcementGateway` in `container.ts` | In-memory evaluation tests | **In-memory only / Dummy contract** (Stateful security rules engine deferred) | **Not blocking** |
| **Configuration** | `IConfigurationRepository` | `packages/domain/src/configuration/repositories/` | `ResolveConfigurationUseCase`, `ManageConfigurationsUseCase` | `InMemoryConfigurationRepository`, `InMemoryConfigurationResolutionGateway` | `configurationRepository`, `configurationResolutionGateway` in `container.ts` | In-memory config tests | **In-memory only** (Distributed dynamic config fallback deferred) | **Not blocking** |
| **Integration** | `IIntegrationRepository` | `packages/domain/src/generated/dummy.ts` (Dummy generated) | `ManageIntegrationsUseCase` | `InMemoryIntegrationRepository`, `InMemoryIntegrationExecutionGateway` | `integrationRepository`, `integrationExecutionGateway` in `container.ts` | In-memory integrations tests | **In-memory only / Dummy contract** (External adapter framework deferred) | **Not blocking** |
| **Localization** | `ILocalizationRepository` | `packages/domain/src/generated/dummy.ts` (Dummy generated) | `ManageLocalizationsUseCase` | `InMemoryLocalizationRepository`, `InMemoryLocalizationExecutionGateway` | `localizationRepository`, `localizationExecutionGateway` in `container.ts` | In-memory localized strings tests | **In-memory only / Dummy contract** (Database-backed localization metadata deferred) | **Not blocking** |
| **Shared Components** | `ISharedComponentRepository` | `packages/domain/src/generated/dummy.ts` (Dummy generated) | `ManageSharedComponentsUseCase` | `InMemorySharedComponentRepository`, `InMemoryComponentRenderingGateway` | `sharedComponentRepository`, `componentRenderingGateway` in `container.ts` | In-memory rendering tests | **In-memory only / Dummy contract** (UI module registry deferred) | **Not blocking** |
| **Organizations / Employers** | `IMembershipRepository`, `IOrganizationRepository` | `packages/domain/src/generated/dummy.ts` (Dummy generated) | None active | None | None | None | **Deferred** (No database schema, no registered container instances) | **Not blocking** |
| **Monitoring** | `IMonitorRepository` | `packages/domain/src/generated/dummy.ts` (Dummy generated) | `ManageMonitorsUseCase` | `InMemoryMonitorRepository`, `InMemoryMonitoringExecutionGateway` | `monitorRepository`, `monitorExecutionGateway` in `container.ts` | In-memory healthcheck tests | **In-memory only / Dummy contract** (Durable metrics and telemetry database deferred) | **Not blocking** |
| **Logging** | `ILogEntryRepository` | `packages/domain/src/generated/dummy.ts` (Dummy generated) | `ManageLogsUseCase` | `InMemoryLogEntryRepository`, `InMemoryLogExecutionGateway` | `logEntryRepository`, `logExecutionGateway` in `container.ts` | In-memory logging tests | **In-memory only / Dummy contract** (Persistent log aggregator database deferred) | **Not blocking** |

---

## 2. Shared Services Classification Details

### A. Implemented Core Foundations
These components represent the highly durable, verified, database-backed pillars of Phase 5. They write to the centralized SQL database via Prisma and are covered by complete integration and unit test suites:
1. **Audit Engine** (`PrismaAuditRecordRepository`): Records secure, immutable, auditable mutation hooks for admin actions and data changes.
2. **Identity Platform** (`PrismaIdentityRepository`): Houses real student/admin users, managing credential sessions, status changes (Active, Suspended, Archived), and contact updates.
3. **Authorization (RBAC)** (`PrismaRoleRepository`, `PrismaPolicyRepository`, `PrismaRoleAssignmentRepository`): Real-time user access control, dynamic runtime policy evaluation, and assignments.
4. **Settings Manager** (`PrismaSettingDefinitionRepository`, `PrismaSettingAssignmentRepository`): System-wide variable registries and student-specific overrides.

### B. Partially Implemented Systems
- **Assets (Asset Platform)**: Relational metadata has a Prisma repository. Malware scanning and sanitization are currently `UNAVAILABLE` and fail closed; they do not report clean or sanitized success.

### C. In-Memory Only / Dummy-Contracted Systems
The remaining shared services are functionally mocks or memory-bound structures. Their domain contracts reside in generated files (like `dummy.ts`), and their container instances reset state whenever the backend process restarts:
- **Background Jobs**: Memory array queues processed inside the Node process. No distributed lock or persistent redis backend is running.
- **Cache**: Local memory map.
- **Enterprise Events**: Synchronous dispatchers operating directly on the current call stack. No transaction outbox table exist in the DB.
- **Notifications, Workflows, Search, Security Policies, Configurations, Dynamic Integrations, DB-driven Localizations, and Shared Components**: Abstracted entirely via in-memory wrappers around dummy contracts to allow compilation without infrastructure overhead.

---

## 3. Explicitly Deferred Deliverables
The following complex architectural features are documented as out-of-scope for the foundation layers and are officially deferred to future enterprise scaling phases:
* **Production Distributed Queue** (BullMQ/Redis workers, cron state storage)
* **Cloud Asset Platform Storage** (AWS S3, Google Cloud Storage integrations)
* **Real-time Malware Scanning** (ClamAV, VirusTotal, or equivalent security sidecars)
* **Real-time Document Sanitization** (Sharp, LibreOffice conversion, or PDF security sanitizers)
* **Durable Transactional Outbox Platform** (Debezium, Kafka, RabbitMQ, or outbox tables)
* **Full Production Notification Routing** (Twilio SMS Gateway, AWS SES SMTP integration, Push dispatchers)
* **Durable Workflow & State-Machine Orchestrator** (Temporal, Camunda, or full custom JSON interpreter)
* **Production Search Engine** (Elasticsearch/OpenSearch indices, sync pipelines, fuzzy analyzers)

---

## 4. Minimum Phase 5 Foundation Before Continuing Phase 9 Schema Normalization

Before initiating deep Phase 9 relational schema normalization, we must establish clear operational boundaries for Phase 5 systems to prevent structural gaps:

1. **Durable Job Tracking vs. Manual Import Boundary**:
   - *Requirement:* A clear boundary dividing automated async queue jobs from manual-only imports.
   - *Status Alignment:* Since BullMQ is deferred, all import ingestion processes (e.g., scholarship batches, taxonomy changes) must operate on a robust, synchronous transactional single-batch flow or local database batch tracking using the Prisma-backed `ImportBatch` and `ImportRecord` structures. Memory-based background job failures must fail the active ingestion and request a manual retry.
   
2. **Durable Event / Outbox Fallback**:
   - *Requirement:* Guarantees for domain event processing without Redis/Kafka brokers.
   - *Status Alignment:* Event dispatching must execute synchronously inside the database transaction context. If any listener fails, the parent database transaction must abort, guaranteeing consistency over event delivery durability.
   
3. **Asset Handling Boundaries for Imported Attachments**:
   - *Requirement:* Security and persistence guarantees for asset processing.
   - *Status Alignment:* While cloud storage and ClamAV scanning are deferred, file ingestion must restrict allowed mime-types strictly in-memory (inside `IngestAssetUseCase`), save uploads to verified relative paths on local storage, and log precise asset records to Postgres via `PrismaAssetRecordRepository`.

---

## 5. Summary of Downgraded Status Claims

To ensure alignment across the repository, we explicitly invalidate the following previous claims:
- **CLAIM:** *"Complete production infrastructure is fully operational for all Phase 5 systems."*  
  **REALITY:** Only Identity, Authorization, Settings, and Audit contain durable production-ready relational schemas and database persistence.
- **CLAIM:** *"Durable distributed background queues are complete."*  
  **REALITY:** Job dispatching is entirely in-memory within the Express process. State resets on process boot.
- **CLAIM:** *"Cloud asset platform is fully implemented with automated malware scanning and sanitization."*  
  **REALITY:** Malware scanning and document sanitization are no-op placeholders; file bytes are saved locally, not on a distributed cloud object store.
- **CLAIM:** *"All shared services are production ready."*  
  **REALITY:** Shared services such as Search, Notifications, Cache, dynamic API Gateways, and Workflows are mock/in-memory adapters designed for compilation and prototype validation.
