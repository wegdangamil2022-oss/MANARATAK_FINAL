# Enterprise-Event-Catalog-v1.0

## 1. Document Information

- **Title:** Enterprise Event Catalog
- **Version:** 1.0.0
- **Status:** Finalized
- **Date:** 2026-07-19
- **Owner:** Chief Enterprise Software Architect
- **Approval Authority:** Architecture Review Board (ARB)
- **Artifact Type:** Enterprise Architecture Model

## 2. Purpose

This document serves as the official catalog of all enterprise events within the MANARATAK 2.0 architecture. Its purpose is to provide a single source of truth for asynchronous communication, prevent duplicated events, support Event-Driven Architecture (EDA) governance, and strictly enforce Domain-Driven Design (DDD) boundaries across all bounded contexts.

## 3. Event Governance

The following architectural rules govern the enterprise event ecosystem:

- **Naming Standards:** Events must follow the `[Entity][StateChange]` past-tense convention (e.g., `ApplicationSubmitted`, `UniversityOnboarded`).
- **Versioning Rules:** All event schemas are immutable. Changes require a new semantic version (e.g., `v1` to `v2`).
- **Deprecation Rules:** Deprecated events require a minimum 90-day sunset period, with proactive alerts to all registered consumers.
- **Ownership Rules:** An event is exclusively owned by the Bounded Context that maintains the authoritative state (Canonical Data Model) of the mutated entity.
- **Publishing Rules:** Producers must utilize the Outbox Pattern to guarantee atomicity between local database transactions and event publication.
- **Consumption Rules:** Consumers must never assume global ordering and must handle events asynchronously without blocking producer workflows.
- **Idempotency Expectations:** Consumers are strictly responsible for deduplication. All event handlers must be idempotent, utilizing the unique `EventID`.
- **Ordering Expectations:** Causal ordering is guaranteed only at the Aggregate Root level via logical partitioning keys.
- **Replay Policy:** The underlying event platform must retain events sufficiently to allow consumer replay for system recovery or new read-model hydration.
- **Dead Letter Policy:** Unprocessable events must be routed to a logical Dead Letter Queue (DLQ) for monitoring, alerting, and manual triage, preventing consumer blocking.

## 4. Event Lifecycle

1. **Creation:** A business action occurs within a Bounded Context, mutating an aggregate's state and generating a Domain Event.
2. **Publication:** The event is written to the outbox table and asynchronously swept onto the Enterprise Event Bus.
3. **Consumption:** Subscribed bounded contexts receive the event and process it according to their local business logic (e.g., updating a materialized view or triggering a workflow).
4. **Retry:** Transient consumer failures trigger automated exponential backoff retries.
5. **Failure:** Persistent consumption failures route the event to the DLQ.
6. **Archive:** Events aging past the active retention window are moved to cold storage (Data Lake) for compliance and historical analytics.
7. **Retirement:** An event schema is officially sunset after all consumers have migrated to a newer version.

## 5. Event Taxonomy

Events are classified into four architectural groups:

- **Business Domain Events:** Represent core state changes (e.g., `ScholarshipPublished`).
- **Infrastructure Events:** Represent technical state changes (e.g., `CacheInvalidated`, `ConfigurationUpdated`).
- **Cross-Domain Events:** Broadly consumed events requiring enterprise-wide schema governance.
- **Shared Services Events:** Emitted by utility platforms (e.g., `NotificationSent`, `ImportCompleted`).

## 6. Event Categories & Catalog

### 6.1. University Events

- **Event Name:** `UniversityOnboarded`
  - **Description:** Emitted when a new university profile is approved and active.
  - **Category:** University Events
  - **Producer:** Phase 11 (Universities & Institutions)
  - **Consumers:** Enterprise Search, Analytics, Phase 15 (Enterprise Student Platform (Student Workspace))
  - **Trigger:** Admin approval of a university profile.
  - **Business Meaning:** A new institution is ready to receive student applications.
  - **Payload Responsibility:** Logical ID, University Name, Status, Core Metadata.
  - **Criticality:** High
  - **Delivery Type:** Guaranteed (At-least-once)
  - **Event Type:** Domain Event
  - **Version Strategy:** Semantic
  - **Retention Policy:** Permanent (Event Sourcing)
  - **Ownership:** Domain Architect (Univ)

### 6.2. Scholarship Events

- **Event Name:** `ScholarshipPublished`
  - **Description:** Emitted when a financial aid opportunity opens for applications.
  - **Category:** Scholarship Events
  - **Producer:** Phase 12 (Scholarships)
  - **Consumers:** Notification Platform, Enterprise Search, Phase 15 (Enterprise Student Platform (Student Workspace))
  - **Trigger:** Scholarship date reaches the opening window.
  - **Business Meaning:** Students can now apply for this specific fund.
  - **Payload Responsibility:** Scholarship ID, Title, Eligibility Criteria Hash.
  - **Criticality:** High
  - **Delivery Type:** Guaranteed
  - **Event Type:** Domain Event
  - **Version Strategy:** Semantic
  - **Retention Policy:** 7 Years (Compliance)
  - **Ownership:** Domain Architect (Schol)

- **Event Name:** `ScholarshipApplicationSubmitted`
  - **Description:** Emitted when a student submits an internal scholarship application.
  - **Category:** Scholarship Events
  - **Producer:** Phase 12 (Scholarships)
  - **Consumers:** Notification Platform, Analytics
  - **Trigger:** Student completes the internal application workflow.
  - **Business Meaning:** Formal commencement of the scholarship evaluation process.
  - **Payload Responsibility:** Application ID, Scholarship Version ID, Student ID.
  - **Criticality:** Critical
  - **Delivery Type:** Guaranteed
  - **Event Type:** Domain Event
  - **Version Strategy:** Semantic
  - **Retention Policy:** Permanent
  - **Ownership:** Domain Architect (Schol)

- **Event Name:** `ScholarshipApplicationApproved`
  - **Description:** Emitted when a scholarship application is approved and awarded.
  - **Category:** Scholarship Events
  - **Producer:** Phase 12 (Scholarships)
  - **Consumers:** Notification Platform, Analytics, Phase 15 (Enterprise Student Platform (Student Workspace))
  - **Trigger:** Reviewer approves the scholarship application.
  - **Business Meaning:** The student has been awarded the scholarship.
  - **Payload Responsibility:** Application ID, Student ID.
  - **Criticality:** Critical
  - **Delivery Type:** Guaranteed
  - **Event Type:** Domain Event
  - **Version Strategy:** Semantic
  - **Retention Policy:** Permanent
  - **Ownership:** Domain Architect (Schol)

### 6.3. Student Events

- **Event Name:** `ApplicationSubmitted`
  - **Description:** Emitted when a student finalizes a university application.
  - **Category:** Student Events
  - **Producer:** Phase 15 (Enterprise Student Platform (Student Workspace))
  - **Consumers:** Workflow Engine, Notification Platform, Analytics
  - **Trigger:** Student clicks 'Submit' on the application wizard.
  - **Business Meaning:** Formal commencement of the admission process.
  - **Payload Responsibility:** Application ID, Student ID, Target ID (Univ).
  - **Criticality:** Critical
  - **Delivery Type:** Guaranteed
  - **Event Type:** Domain Event
  - **Version Strategy:** Semantic
  - **Retention Policy:** Permanent
  - **Ownership:** Domain Architect (Stu)

### 6.4. Academic Taxonomy Events

- **Event Name:** `TaxonomyDisciplineCreated`
  - **Description:** Emitted when a new academic discipline is added to the global hierarchy.
  - **Category:** Academic Taxonomy Events
  - **Producer:** Phase 8 (Academic Taxonomy)
  - **Consumers:** Phase 11 (Universities & Institutions), Phase 12 (Scholarships), Enterprise Search
  - **Trigger:** Content steward adds a new taxonomy node.
  - **Business Meaning:** A new field of study is available for mapping.
  - **Payload Responsibility:** Node ID, Parent ID, Discipline Name.
  - **Criticality:** Medium
  - **Delivery Type:** Guaranteed
  - **Event Type:** Reference Event
  - **Version Strategy:** Semantic
  - **Retention Policy:** Permanent
  - **Ownership:** Domain Architect (Tax)

### 6.5. Universal Import Events

- **Event Name:** `ImportJobCompleted`
  - **Description:** Emitted when an external data ETL job finishes processing.
  - **Category:** Import Events
  - **Producer:** Universal Import Platform
  - **Consumers:** Academic Taxonomy, Phase 11 (Universities & Institutions), Notification Platform
  - **Trigger:** ETL pipeline success execution.
  - **Business Meaning:** Fresh canonical data is available for integration.
  - **Payload Responsibility:** Job ID, Source System, Record Count, Status.
  - **Criticality:** Medium
  - **Delivery Type:** Guaranteed
  - **Event Type:** System Event
  - **Version Strategy:** Semantic
  - **Retention Policy:** 30 Days
  - **Ownership:** Platform Architect (UIP)

### 6.6. Workflow Events

- **Event Name:** `SagaCompensated`
  - **Description:** Emitted when a distributed transaction fails and rolls back successfully.
  - **Category:** Workflow Events
  - **Producer:** Workflow Engine
  - **Consumers:** Core Domains (Univ, Schol, Stu), Analytics
  - **Trigger:** Saga failure leading to successful compensation logic.
  - **Business Meaning:** A business process was safely aborted and state reverted.
  - **Payload Responsibility:** Saga ID, Reason, Compensated Steps.
  - **Criticality:** High
  - **Delivery Type:** Guaranteed
  - **Event Type:** Orchestration Event
  - **Version Strategy:** Semantic
  - **Retention Policy:** 1 Year
  - **Ownership:** Platform Architect (WF)

### 6.7. Authentication Events

- **Event Name:** `UserRegistered`
  - **Description:** Emitted when a new identity is created in the IAM system.
  - **Category:** Authentication Events
  - **Producer:** Authentication (IAM)
  - **Consumers:** Phase 15 (Enterprise Student Platform (Student Workspace)), Notification Platform
  - **Trigger:** Successful identity verification.
  - **Business Meaning:** A new user has joined the MANARATAK 2.0 ecosystem.
  - **Payload Responsibility:** Global User ID, Auth Provider.
  - **Criticality:** Critical
  - **Delivery Type:** Guaranteed
  - **Event Type:** Security Event
  - **Version Strategy:** Semantic
  - **Retention Policy:** Permanent
  - **Ownership:** Security Architect

## 7. Event Dependencies

| Producer                                                       | Consumer                                                   | Event                  | Interaction Pattern           | Criticality |
| :------------------------------------------------------------- | :--------------------------------------------------------- | :--------------------- | :---------------------------- | :---------- |
| **Phase 15 (Enterprise Student Platform (Student Workspace))** | Workflow Engine                                            | `ApplicationSubmitted` | Choreography to Orchestration | Critical    |
| **Phase 13 (Learning Platform)**                               | Phase 14 (Enterprise Certificates Platform)                | `CourseCompleted`      | Trigger Credential Issuance   | Critical    |
| **Phase 14 (Enterprise Certificates Platform)**                | Phase 15 (Enterprise Student Platform (Student Workspace)) | `CertificateIssued`    | Update Student Portfolio      | Critical    |

| **Phase 11 (Universities & Institutions)** | Enterprise Search | `UniversityOnboarded` | State Projection (CQRS) | High |
| **Phase 12 (Scholarships)**| Notification Platform | `ScholarshipPublished` | Event Notification | Medium |
| **Academic Taxonomy** | Phase 11 (Universities & Institutions) | `TaxonomyDisciplineCreated`| Read-Model Hydration | High |
| **Authentication** | Phase 15 (Enterprise Student Platform (Student Workspace)) | `UserRegistered` | Cross-Domain Sync | Critical |
| **Universal Import** | Academic Taxonomy | `ImportJobCompleted` | ETL Trigger | Medium |
| **All Domains** | Analytics Platform | `*` (All Domain Events) | Telemetry Ingestion | Low |

## 8. Visual Model

```mermaid
graph TD
    %% Event Producers
    subgraph Producers [Event Producers]
        ST[Phase 15 (Enterprise Student Platform (Student Workspace))]
        UP[Phase 11 (Universities & Institutions)]
        SP[Phase 12 (Scholarships)]
        AT[Academic Taxonomy]
        IAM[IAM / Auth]
    end

    %% Enterprise Event Bus
    EB((Enterprise Event Bus))

    %% Event Consumers
    subgraph Consumers [Event Consumers]
        WF[Workflow Engine]
        ES[Enterprise Search]
        NOTIF[Notification Platform]
        AN[Analytics Platform]
    end

    %% Publishing Events
    ST -- ApplicationSubmitted --> EB
    UP -- UniversityOnboarded --> EB
    SP -- ScholarshipPublished --> EB
    AT -- TaxonomyDisciplineCreated --> EB
    IAM -- UserRegistered --> EB

    %% Consuming Events
    EB -- Saga Trigger --> WF
    EB -- Index Hydration --> ES
    EB -- Alert Trigger --> NOTIF
    EB -- Data Warehouse Sync --> AN

    %% Cross-Domain Consumption (Peer-to-Peer via Bus)
    EB -- Read-Model Update --> UP
    EB -- Read-Model Update --> SP
    EB -- Profile Init --> ST
```

## 9. Validation

The ARB has validated this catalog against the following criteria:

- **No duplicated events:** Every state mutation is emitted uniquely by its authoritative domain.
- **Clear ownership:** Every event is mapped to a specific architectural owner.
- **DDD alignment:** Event names accurately reflect the ubiquitous language of their bounded contexts.
- **Bounded Context isolation:** Payloads contain logical identifiers, preventing structural database coupling.
- **Event consistency:** All definitions align with the canonical data model.

## 10. Risks

### Event Duplication Risks

- **Description:** Producers emitting the same logical event under different names.
- **Impact:** Medium.
- **Likelihood:** Low.
- **Mitigation:** Centralized Schema Registry enforcing strict event taxonomy.

### Ordering Risks

- **Description:** Consumers processing events out of causal sequence (e.g., `ProfileUpdated` before `ProfileCreated`).
- **Impact:** High.
- **Likelihood:** Medium.
- **Mitigation:** Enforced use of Aggregate IDs as partition keys to guarantee strict ordering per entity.

### Replay Risks

- **Description:** Consumers lacking idempotency, causing data corruption during event replays.
- **Impact:** Critical.
- **Likelihood:** Medium.
- **Mitigation:** Mandatory idempotency keys (Event ID) and UPSERT operations on all consumer databases.

### Consumer Risks

- **Description:** Downstream consumers building tight coupling to excessive payload data (Fat Events).
- **Impact:** Medium.
- **Likelihood:** High.
- **Mitigation:** Favor "Event Notification" patterns (thin payloads) over "Event-Carried State Transfer" (fat payloads) where appropriate, forcing consumers to query APIs for full state.

### Governance Risks

- **Description:** Breaking changes introduced into event payloads.
- **Impact:** Critical.
- **Likelihood:** Low.
- **Mitigation:** Automated CI/CD schema validation; breaking changes strictly require a new topic/version.

## 11. Recommendations

1. **Priority 1:** Deploy the Enterprise Schema Registry and seed it with the payloads defined in this catalog.
2. **Priority 2:** Implement the automated CI/CD pipeline checks to prevent unversioned breaking changes to event schemas.
3. **Priority 3:** Establish the standard library (SDK) for the Outbox Pattern to guarantee reliable publishing across all backend teams.

## 12. Approval

- **Architecture Review Board:** Approved
- **Chief Enterprise Software Architect:** Approved
- **Approval Status:** Formal Baseline Approved

## 13. Revision History

- **Initial Version (1.0.0):** Official Enterprise Event Catalog established for MANARATAK 2.0.
