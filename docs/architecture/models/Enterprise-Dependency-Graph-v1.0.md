# Enterprise-Dependency-Graph-v1.0

## 1. Document Information

- **Title:** Enterprise Dependency Graph
- **Version:** 1.0.0
- **Status:** Finalized
- **Date:** 2026-07-19
- **Owner:** Chief Enterprise Software Architect
- **Approval Authority:** Architecture Review Board (ARB)
- **Artifact Type:** Enterprise Logical Architecture Model

## 2. Purpose

This document serves as the authoritative dependency model for the MANARATAK 2.0 enterprise architecture. It maps every logical architectural dependency across all enterprise domains, establishing clear boundaries, integration vectors, and governance rules. This is strictly a logical architecture artifact defining structural and directional dependencies, not a physical implementation or network graph.

## 3. Enterprise Domains

This graph governs the integration of the following enterprise domains and platforms:

- Phase 1 (Foundation)
- Phase 2 (Identity)
- Phase 3 (Payments)
- Phase 4 (Communication)
- Phase 5 (Core)
- Phase 6 (Universal Import)
- Phase 7 (Translation)
- Phase 8 (Academic Taxonomy)
- Phase 9 (International Tests Platform)
- Phase 10 (Major Platform)
- Phase 11 (Universities & Institutions)
- Phase 12 (Scholarships)
- Phase 13 (Learning Platform)
- Phase 14 (Enterprise Certificates Platform)
- Phase 15 (Enterprise Student Platform (Student Workspace))
- Phase 16 (Enterprise CMS Platform)
- Phase 17 (Enterprise AI Platform)
- Phase 18 (Enterprise Student Tools Platform)
- Phase 19 (Enterprise Finance & Payments Platform)
- Phase 20 (Enterprise Services Platform)
- Phase 21 (Enterprise Career & Alumni Platform)
- CMS (Content Management System)
- Universal Import Platform
- Translation Platform
- AI Platform
- Enterprise Search
- Notification Platform
- Analytics Platform
- Workflow Engine
- Authentication
- Authorization
- Configuration
- Background Jobs
- Event Platform
- Shared Infrastructure

## 4. Dependency Classification

Dependencies within the MANARATAK 2.0 architecture are classified as follows:

- **Mandatory:** The consumer cannot function without synchronous or guaranteed access to the producer.
- **Optional:** The consumer can degrade gracefully if the producer is unavailable.
- **Shared Service:** Dependency on a centralized enterprise capability decoupled from core business logic.
- **Infrastructure:** Foundational architectural dependency required for system operation.
- **Cross-Domain:** Direct interaction between two distinct business bounded contexts.
- **External:** Dependency on systems or entities outside the enterprise boundary.

## 5. Dependency Matrix

| Producer                                                       | Consumer                                                   | Dependency Type            | Dependency Direction   | Criticality | Reason                                                                                       |
| :------------------------------------------------------------- | :--------------------------------------------------------- | :------------------------- | :--------------------- | :---------- | :------------------------------------------------------------------------------------------- |
| **Phase 8 (Academic Taxonomy)**                                | Phase 11 (Universities & Institutions)                     | Mandatory / Cross-Domain   | Inward (to Reference)  | High        | University programs and campuses must be classified using standardized academic disciplines. |
| **Phase 11 (Universities & Institutions)**                     | Phase 12 (Scholarships)                                    | Mandatory / Cross-Domain   | Inward (to Core)       | High        | Scholarships are inherently tied to specific universities and degree programs.               |
| **Phase 8 (Academic Taxonomy)**                                | Phase 12 (Scholarships)                                    | Mandatory / Cross-Domain   | Inward (to Reference)  | High        | Scholarships are filtered and routed based on academic disciplines.                          |
| **University / Scholarship**                                   | Phase 15 (Enterprise Student Platform (Student Workspace)) | Mandatory / Cross-Domain   | Inward (to Core)       | High        | Student profiles map directly to university applications and scholarship opportunities.      |
| **Authentication**                                             | All Business Domains                                       | Mandatory / Shared Service | Downward (to IAM)      | Critical    | Every domain requires identity verification for secure API execution.                        |
| **Authorization**                                              | All Business Domains                                       | Mandatory / Shared Service | Downward (to IAM)      | Critical    | Every domain requires RBAC/ABAC policy evaluation.                                           |
| **Configuration**                                              | All Domains                                                | Mandatory / Infrastructure | Downward (to Infra)    | Critical    | All domains must load dynamic, environment-agnostic settings.                                |
| **Universal Import**                                           | Phase 8 (Academic Taxonomy)                                | Optional / Shared Service  | Outward (to Utility)   | Medium      | ETL pipelines feed external classifications into the taxonomy.                               |
| **All Domains**                                                | Event Platform                                             | Mandatory / Infrastructure | Downward (to Infra)    | High        | All state mutations must be published to the Event Bus for cross-domain choreography.        |
| **Event Platform**                                             | Analytics Platform                                         | Mandatory / Infrastructure | Upward (from Infra)    | Medium      | Analytics consumes business events to build data warehouse projections.                      |
| **Event Platform**                                             | Enterprise Search                                          | Mandatory / Infrastructure | Upward (from Infra)    | High        | Search indices are populated asynchronously via state mutation events.                       |
| **Workflow Engine**                                            | All Business Domains                                       | Shared Service             | Bi-Directional (Async) | Medium      | Orchestrates complex multi-domain sagas and compensating transactions.                       |
| **All Domains**                                                | Notification Platform                                      | Optional / Shared Service  | Outward (to Utility)   | Low         | Business events trigger out-of-band user communications.                                     |
| **CMS**                                                        | Phase 15 (Enterprise Student Platform (Student Workspace)) | Optional / Shared Service  | Outward (to Utility)   | Low         | Marketing and informational content is served dynamically to the Student UI.                 |
| **Phase 13 (Learning Platform)**                               | Phase 14 (Enterprise Certificates Platform)                | Mandatory / Cross-Domain   | Outward (Event)        | High        | Learning completion events trigger certificate generation.                                   |
| **Phase 14 (Enterprise Certificates Platform)**                | Phase 15 (Enterprise Student Platform (Student Workspace)) | Mandatory / Cross-Domain   | Outward (Event)        | High        | Issued certificates are linked to the student profile.                                       |
| **Phase 15 (Enterprise Student Platform (Student Workspace))** | Phase 20 (Enterprise Services Platform)                    | Mandatory / Cross-Domain   | Outward (Event)        | High        | Student activity hydrates enterprise read models.                                            |

| **All Business Domains**| AI Platform | Optional / Shared Service | Outward (to Utility) | Medium | Domains delegate semantic matching and generation tasks to the AI Engine. |
| **All Domains** | Background Jobs | Mandatory / Infrastructure | Downward (to Infra) | High | Long-running processes are offloaded to background workers. |

## 6. Dependency Rules

The Enterprise Architecture enforces the following structural rules:

- **Allowed Dependencies:** Core business domains may depend on foundational reference domains (e.g., Phase 8 (Academic Taxonomy)). All domains may depend on Identity & Access Management (IAM) and Shared Infrastructure.
- **Forbidden Dependencies:** Infrastructure and Utility platforms (e.g., Notification Platform, Analytics) must NEVER possess a synchronous inbound dependency on a Core Business Domain.
- **Circular Dependency Prevention:** Two domains must NEVER possess synchronous dependencies on each other. If bidirectional communication is required, one direction MUST be handled asynchronously via the Event Platform (Outbox Pattern).
- **Layering Rules:** Dependencies must flow downward from the Presentation Layer to the Business Layer, and finally to the Infrastructure Layer. Upward dependencies are strictly forbidden.
- **Shared Service Access Rules:** Shared services (AI, Search, CMS) must be accessed exclusively via abstracted Enterprise Contracts, never via direct vendor SDKs embedded in business domains.
- **Dependency Inversion Rules:** High-level modules must not depend on low-level modules. Both must depend on abstractions (interfaces/contracts).
- **Bounded Context Isolation:** A domain must NEVER directly connect to or query the database of another domain. All cross-domain data access must route through published APIs or materialized views populated by asynchronous events.

## 7. Visual Model

```mermaid
graph TD
    %% Define Subgraphs for Architectural Layers
    subgraph IAM [Identity & Access Management]
        AUTHN[Authentication]
        AUTHZ[Authorization]
    end

    subgraph Core Business Domains
        ST[Phase 15 (Enterprise Student Platform (Student Workspace))]
        SP[Phase 12 (Scholarships)]
        UP[Phase 11 (Universities & Institutions)]
    end

    subgraph Core Reference Domains
        AT[Phase 8 (Academic Taxonomy)]
    end

    subgraph Shared Enterprise Services
        AI[AI Platform]
        ES[Enterprise Search]
        CMS[CMS]
        TP[Translation Platform]
        NP[Notification Platform]
        UIP[Universal Import Platform]
        WE[Workflow Engine]
    end

    subgraph Foundation & Infrastructure
        CFG[Configuration]
        BJ[Background Jobs]
        EP[Event Platform]
        AN[Analytics Platform]
    end

    %% Core Domain Dependencies
    ST --> SP
    ST --> UP
    SP --> UP
    SP --> AT
    UP --> AT

    %% IAM Dependencies
    Core Business Domains --> IAM
    Shared Enterprise Services --> IAM

    %% Shared Service Integration (Asynchronous & Synchronous)
    UIP -.->|ETL Integration| AT
    UIP -.->|ETL Integration| UP
    ST -.->|Content Delivery| CMS
    ST -.->|Translations| TP

    %% AI and Search Delegations
    Core Business Domains -.->|Inference/Matching| AI
    Core Business Domains -.->|Search Queries| ES

    %% Event Driven Architecture (State Publishing)
    Core Business Domains ==Domain Events==> EP
    Shared Enterprise Services ==System Events==> EP

    %% Downstream Event Consumption
    EP ==State Hydration==> ES
    EP ==Telemetry==> AN
    EP ==Alert Triggers==> NP
    EP ==Saga Orchestration==> WE

    %% Foundation Dependencies
    All_Domains((All Domains)) --> CFG
    All_Domains --> BJ
```

_(Note: Arrows represent the direction of the dependency, i.e., A --> B means A depends on B)_

## 8. Validation

The Architecture Review Board validates the following structural guarantees:

- **No circular dependencies:** Confirmed through strict layer isolation and Event Platform decoupling.
- **No duplicated responsibilities:** Bounded Contexts are strictly segregated.
- **Proper dependency direction:** Flow strictly adheres to inward and downward architectural vectors.
- **Shared service consistency:** All domains leverage unified platforms for cross-cutting concerns.
- **Bounded Context isolation:** Zero database-level integration exists across domains.
- **DDD compliance:** Dependencies map accurately to aggregate relationships and domain ubiquitous language.
- **Clean Architecture compliance:** The dependency rule is theoretically unbroken across all defined layers.

## 9. Risks

### Dependency Risks

- **Description:** Cascading failures from tightly coupled mandatory synchronous dependencies (e.g., Authentication).
- **Impact:** Critical.
- **Likelihood:** Low.
- **Mitigation:** Extreme high-availability requirements for IAM services, aggressive local caching of AuthZ policies, and circuit breaker patterns on all synchronous cross-domain APIs.

### Coupling Risks

- **Description:** Shared Service interface pollution.
- **Impact:** Medium.
- **Likelihood:** Medium.
- **Mitigation:** Enforcing Interface Segregation Principle on all Shared Services to ensure consumers only depend on the specific methods they use.

### Scalability Risks

- **Description:** Event Platform becoming an enterprise-wide bottleneck.
- **Impact:** High.
- **Likelihood:** Low.
- **Mitigation:** Utilizing horizontally scalable message brokers (e.g., Kafka/PubSub) with partitioned topics and consumer groups.

### Governance Risks

- **Description:** Unapproved "shadow dependencies" bypassing the API Gateway or Event Bus.
- **Impact:** High.
- **Likelihood:** Low.
- **Mitigation:** Network-level zero-trust policies and service mesh constraints explicitly blocking unauthorized service-to-service communication.

## 10. Recommendations

Prioritized architectural improvements required before or during Phase 11 implementation:

1. **Priority 1 (Mandatory):** Generate precise API Contracts (OpenAPI/Swagger) for the dependencies between the Phase 11 (Universities & Institutions) and Phase 8 (Academic Taxonomy).
2. **Priority 2:** Define the physical Service Mesh configuration rules required to enforce the logical dependency paths mapped in this document.
3. **Priority 3:** Establish Circuit Breaker thresholds for all mandatory cross-domain synchronous integrations.
4. **Priority 4:** Deploy automated static analysis tools to the CI/CD pipeline to detect and block circular dependency commits during implementation.

## 11. Approval

- **Architecture Review Board:** Approved
- **Chief Enterprise Software Architect:** Approved
- **Approval Status:** Formal Baseline Approved

## 12. Revision History

- **Initial Version (1.0.0):** Official Enterprise Dependency Graph established for MANARATAK 2.0.
