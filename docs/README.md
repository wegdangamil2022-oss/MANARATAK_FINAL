# MANARATAK 2.0: Official Documentation Repository

Welcome to the official documentation repository for **MANARATAK 2.0**, the definitive, comprehensive digital compass for Arab students, intelligently connecting them with global educational opportunities.

The `/docs` directory is the central documentation repository for MANARATAK 2.0, structured into distinct logical documentation domains to promote long-term discoverability, maintainability, and clean separation of architectural concerns.

## Repository Governance Philosophy

This repository operates under strict Documentation Governance. It is designed to be the single source of truth for the enterprise architecture, maintaining chronological traceability, structural clarity, and zero ambiguity. All technical specifications, business domains, and architectural baselines are version-controlled, uniquely identified, and carefully organized.

## Project Constitution

The highest-level and most critical document in this repository is the **Master Blueprint**. It serves as the official Project Constitution and must always be read first before consulting any other documentation.

- [MANARATAK-2.0-Master-Blueprint.md](./governance/blueprint/MANARATAK-2.0-Master-Blueprint.md)

## Documentation Repository Structure

The documentation repository is organized into four main pillars to separate enterprise governance, global architecture designs, phase progression, and obsolete references:

```text
docs/
├── governance/
│   ├── blueprint/
│   ├── roadmap/
│   └── audits/
├── architecture/
│   ├── adr/
│   ├── standards/
│   └── Enterprise-Architecture-Governance-Index.md
├── phases/
└── legacy/
```

- **`governance/`**: Centralized repository for all enterprise governance, roadmaps, master blueprints, and program-level consistency audits.
- **`architecture/`**: Shared enterprise-wide guidelines, standards, Architecture Decision Records (ADRs), models, and compliance reviews.
- **`phases/`**: Detailed chronological progression of individual phase specifications, domain models, contracts, and implementation guides.
- **`legacy/`**: Preserved historical artifacts and superseded documents.

## Documentation Navigation

| Directory                          | Purpose                                                                   | Primary Focus Areas                                                              |
| :--------------------------------- | :------------------------------------------------------------------------ | :------------------------------------------------------------------------------- |
| **[governance](./governance)**     | Enterprise governance, program-level roadmaps, and program consistency.   | Master Blueprints, Roadmaps, Impact Analyses, and Continuity Audits.             |
| **[architecture](./architecture)** | Shared architectural rules, global standards, decision logs, and metrics. | Architecture Decision Records (ADRs), Global Data Standards, and indexes.        |
| **[phases](./phases)**             | Phase implementation specifications and domain specifications.            | Bounded Contexts, Domain Contracts (Part B), and Implementation Guides (Part C). |
| **[legacy](./legacy)**             | Historical and archived reference materials.                              | Obsolete, superseded, or deprecated guidelines kept solely for audit history.    |

## Recommended Reading Order

For new developers, architects, reviewers, and contributors, the documentation should be read in the following sequence to establish a comprehensive top-down understanding of the platform:

1. **Project Constitution** (`MANARATAK-2.0-Master-Blueprint.md` inside `governance/blueprint/`)
   - _Why:_ Establishes the ultimate architectural standards, core domains, and non-negotiable software philosophy of MANARATAK 2.0.
2. **Enterprise Roadmap** (`MANARATAK-2.0-Roadmap-v6.0.md` inside `governance/roadmap/`)
   - _Why:_ Outlines active phase definitions, sequence parameters, cross-phase dependencies, and release targets.
3. **Architecture Constitution / Guidelines** (inside `architecture/`)
   - _Why:_ Explains cross-cutting standards, security layers, logging guidelines, caching setups, and infrastructure requirements.
4. **Enterprise Architecture Governance Index** (`Enterprise-Architecture-Governance-Index.md` inside `architecture/`)
   - _Why:_ Explains documentation authority levels and routes queries to correct authoritative files.
5. **Architecture Decision Records (ADRs)** (inside `architecture/adr/`)
   - _Why:_ Explains the rationale, alternatives, benefits, and consequences for key architectural decisions.
6. **Chronological Phase Specifications** (inside `phases/`)
   - _Why:_ Step-by-step implementation baselines, domain contracts (Part B), and active execution details (Part C) for each phase of the project:
     - **Phase 02** (Solution Architecture)
     - **Phase 03** (Enterprise Design)
     - **Phase 04** (Architecture Governance)
     - **Phase 05** (Core Implementation)
     - **Phase 06** (Import Foundation)
     - **Phase 07** (Domain Contracts & Specifications)
     - **Phase 08** (Enterprise Architecture Specification)
     - **Phase 09** (Implementation Guide)
     - _(and succeeding active phases)_

## Repository Governance

To ensure the repository remains clean, accurate, and structured:

- **Explicit Ownership:** Every document belongs to a specific domain context or phase lifecycle.
- **Single Source of Truth (SSOT):** Every architectural policy, database schema pattern, or integration contract has exactly one authoritative location.
- **Cross-Referencing:** To avoid drifting rules and outdated duplication, documents must link or cross-reference other sources rather than copying them.
- **Precedence Rule:** All changes must respect the **Enterprise Architecture Governance Index** priority rules, ensuring that highest-level constitution agreements are always prioritized.

## Contribution Guidelines

When introducing new architecture or updating existing documentation, contributors must strictly follow these directives:

- **Place Documents in Correct Folders:** Ensure governance-level files reside under `/docs/governance/` and enterprise technical files are saved in `/docs/architecture/`.
- **Follow Documentation Naming Standards:** Use lowercase hyphenated naming prefixes corresponding to your specific document category (e.g., standards start with `std-` or `doc-gov-`, ADRs use `ADR-XXX`).
- **Avoid Duplication:** If an existing document covers a topic, reference it instead of drafting new rules or replicating paragraphs.
- **Update Cross-References and Indexes:** When files are moved, renamed, or added, perform a repository search to update all parent READMEs, the Enterprise Architecture Governance Index, and any relevant cross-phase reference links.

## Documentation Lifecycle

MANARATAK 2.0 documentation is living code that moves through a formalized evolution model:

```text
   Blueprint (Project Constitution)
               ↓
    Roadmap (Release Milestones)
               ↓
Architecture (Standards & Decision Records)
               ↓
 Implementation Phases (Domain Contracts & Code)
               ↓
      Architecture Reviews (Compliance)
               ↓
         Audit (Consistency Verification)
               ↓
      Remediation (Resolution Updates)
```

Documentation evolves seamlessly alongside code execution, ensuring that our technical specifications remain a perfect and undeniable reflection of the enterprise's functional state.

## Related Documentation

- **[Enterprise Governance](./governance)**
- **[Enterprise Architecture Guidelines](./architecture)**
- **[Phase Implementations](./phases)**
- **[Legacy Archive](./legacy)**

---

## Directory Structure

- **`docs/`**: The root directory containing all system and project documentation.
- **`architecture/`**: Contains ONLY shared enterprise documentation (e.g., Architecture Decision Records (ADRs), global standards, audits, reports, and the Enterprise Architecture Governance Index). Phase-specific documents are not permitted here.
- **`governance/`**: Centralized repository for all enterprise governance, roadmaps, master blueprints, and program-level consistency audits.
- **`phases/`**: The chronological progression of the project. Contains the detailed architectural baselines, domain models, and implementation guidelines for each phase (Phase 02 through Phase 09).
- **`legacy/`**: Contains historical, superseded, or obsolete documents. These artifacts are preserved for historical reference only and **should not** be used as active implementation references.
