# Cross-Phase Relationship Closure Matrix

**Status:** ACTIVE — P4 Source Closure checklist  
**Version:** 1.2.0  
**Status date:** 2026-09-03  
**Architecture authority:** Roadmap v6.0 + P1-closed Enterprise architecture models  
**Source baseline:** original source commit `e8af4f0e36fabbaf9f7cf38b5d1f4d0a88829012`, carried forward through the P3-closed full-project package (`SHA-256 dca26ee8f0a294a59a39e8d5939c9239493d19776ba1ab98a432c1562f8be790`)  
**Scope:** source-level cross-phase relationships P7–P24; no live DB mutation or runtime certification.

## 1. Authority and use

This is the **single active Cross-Phase Relationship Closure Matrix** for the current Source Closure plan. It replaces historical integration matrices as an execution checklist; historical files such as `docs/remediation/wp8/WP8_INTEGRATION_MATRIX.md` remain evidence only and are **not** current closure authority. P13 may label/archive those historical reports after final source verification.

Rules applied while building this matrix:

1. Roadmap v6.0 and the P1-closed architecture ownership artifacts control ownership.
2. A relationship is not `Source Closed` merely because a Prisma field/table exists. Domain contract → application/query → repository → API/read model → relevant consumer surface must be traceable.
3. Canonical ID is the final relationship identity whenever one exists. Text/source labels may remain provenance or review input, not final production identity.
4. `Runtime Pending` is used only where the source path is closed enough that the remaining proof requires the real DB/environment.
5. `Partial` means at least one required source edge is missing, legacy/text/synthetic behavior remains, or a consumer/delivery adapter is not wired.
6. `Missing` means an important required cross-phase relation has no usable source contract/path yet.
7. P23 is a control-plane consumer and P24 is a public-composition consumer; neither becomes owner of domain truth.
8. P22 owns product-experience principles only; no business-data repository is invented for it.

## 2. Status vocabulary

| Status | Meaning |
| --- | --- |
| **Missing** | Required relationship/source edge is absent. |
| **Partial** | Some source layers exist, but at least one contract/wiring/identity/consumer edge is incomplete or unsafe. |
| **Source Closed** | All source obligations for this relationship are closed and source-proven; no DB/runtime proof is required for the stated relation. |
| **Runtime Pending** | Source relationship is closed; remaining verification requires the real DB/environment/E2E runtime. |

### Explicit non-ownership boundaries

- **P6 is not a canonical business-data owner:** its generic import mechanics are outside this P7–P24 relationship matrix; canonicalization/publish relationships are recorded under the owning domain.
- **Broad university/scholarship application processing remains unassigned:** Roadmap v6.0/P1 authority does not assign that broad workflow to P12 or P15, so this matrix does not invent an owner or API/event edge for it.
- **P23/P24 are consumers/composers:** Admin and Public appear as consumers of owner contracts; they are not used as business-truth owners.

## 3. Source evidence index

The table uses these compact evidence keys. Each key points to current repository source, not a historical report.

- `REF-D`: `packages/domain/src/reference-data/`; `REF-A`: `packages/application/src/reference-data/`; `REF-R`: `packages/infrastructure/src/reference-data/PrismaReferenceDataRepository.ts`; `REF-T`: reference-data domain/application/infrastructure tests.
- `TAX-D`: `packages/domain/src/academic-taxonomy/`; `TAX-R`: `packages/infrastructure/src/academic-taxonomy/PrismaAcademicTaxonomyRepository.ts`; `TAX-T`: academic-taxonomy tests.
- `DEG-D`: `packages/domain/src/degree-level/`; `DEG-R`: `packages/infrastructure/src/degree-level/DegreeLevelRepository.ts`; `DEG-T`: DegreeLevel tests including `packages/domain/tests/degree-level/CrossPhaseDegreeLevelContract.spec.ts`.
- `TEST-D`: `packages/domain/src/tests-platform/`; `TEST-A`: `packages/application/src/tests-platform/`; `TEST-R`: `packages/infrastructure/src/international-tests/PrismaInternationalTestRepository.ts`; `TEST-T`: International Test tests.
- `MAJ-D`: `packages/domain/src/majors/`; `MAJ-A`: `packages/application/src/majors/`; `MAJ-R`: `packages/infrastructure/src/majors/PrismaMajorRepository.ts`; `MAJ-T`: Major tests.
- `UNI-D`: `packages/domain/src/universities/`; `UNI-A`: `packages/application/src/universities/`; `UNI-R`: `packages/infrastructure/src/universities/PrismaUniversityRepository.ts` + `UniversityCanonicalRelationshipValidator.ts`; `UNI-T`: University tests.
- `SCH-D`: `packages/domain/src/scholarships/`; `SCH-A`: `packages/application/src/scholarships/`; `SCH-R`: `packages/infrastructure/src/scholarships/PrismaScholarshipRepository.ts`; `SCH-T`: Scholarship tests including `NormalizedScholarshipSchema.spec.ts`.
- `COURSE-D`: `packages/domain/src/courses/`; `COURSE-A`: `packages/application/src/courses/`; `COURSE-R`: `packages/infrastructure/src/courses/`; `COURSE-T`: Course/import/relationship tests.
- `CERT-D`: `packages/domain/src/certificates/`; `CERT-A`: `packages/application/src/certificates/`; `CERT-R`: `packages/infrastructure/src/certificates/PrismaCertificateRepository.ts`.
- `STU-D`: `packages/domain/src/students/`; `STU-R`: `packages/infrastructure/src/students/PrismaStudentWorkspaceRepository.ts`.
- `CMS-D`: `packages/domain/src/cms/`; `CMS-A`: `packages/application/src/cms/`; `CMS-R`: `packages/infrastructure/src/cms/PrismaCmsRepository.ts`.
- `AI-D`: `packages/domain/src/ai-platform/`; `AI-A`: `packages/application/src/ai-platform/`; `AI-R`: `packages/infrastructure/src/ai-platform/`.
- `TOOLS-D`: `packages/domain/src/student-tools/`; `TOOLS-A`: `packages/application/src/student-tools/`; gateways/repository: `packages/infrastructure/src/student-tools/`.
- `FIN-D`: `packages/domain/src/finance-platform/`; `FIN-A`: `packages/application/src/finance-platform/`; `FIN-R`: `packages/infrastructure/src/finance-platform/`.
- `SVC-D`: current service contract is in `packages/domain/src/generated/dummy.ts`; `SVC-A`: `packages/application/src/services-platform/`; DI persistence is explicitly unavailable in `apps/api/src/infrastructure/di/container.ts`.
- `CAREER-D`: `packages/domain/src/career-alumni/`; `CAREER-A`: `packages/application/src/career-alumni/`; DI persistence is explicitly unavailable in `apps/api/src/infrastructure/di/container.ts`.

## 4. Active relationship closure matrix


| ID | Owner | Consumer | Relationship / owner truth | Canonical identity | Domain contract | Application / query contract | Repository mapping | API / read-model DTO | Admin editor | Public navigation | Student hydration | Event / projection | Source tests | Status | Closure step |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R-001 | P7 | P9 | International Test geography/language references | Reference IDs/codes; persisted IDs are authoritative | `REF-D`; `TEST-D` | `REF-A`; `TEST-A` canonical resolver | `REF-R`; `TEST-R` | `ReferenceDataPublicRouter`; `InternationalTest*Router` | See R-042/R-044 | See R-056/R-058 | N/A | N/A | `REF-T`; `TEST-T` | Runtime Pending | P3 CLOSED |
| R-002 | P8 | P9 | International Test taxonomy + DegreeLevel references | `taxonomyNodeId`; `degreeLevelId` | `TAX-D`; `DEG-D`; `TEST-D` | `InternationalTestCanonicalRelationshipService` | `TAX-R`; `DEG-R`; `TEST-R` | `AcademicTaxonomy*Router`; `InternationalTest*Router` | See R-043/R-044 | See R-057/R-058 | N/A | N/A | `TAX-T`; `DEG-T`; `TEST-T` | Runtime Pending | P3 CLOSED |
| R-003 | P8 | P10 | Major taxonomy + DegreeLevel mapping | Canonical taxonomy node IDs; `degreeLevelId` | `TAX-D`; `DEG-D`; `MAJ-D` | `CanonicalMajorReferenceService` | `TAX-R`; `DEG-R`; `MAJ-R` | `AcademicTaxonomy*Router`; `Major*Router` | See R-043/R-045 | See R-057/R-059 | See R-024 | N/A | `MAJ-T`; `DEG-T` | Runtime Pending | P3 CLOSED |
| R-004 | P7 | P11 | University geography + currency references | `countryReferenceId`; `regionReferenceId`; `cityReferenceId`; currency reference IDs | `REF-D`; `UNI-D` | University use cases + `UniversityCanonicalRelationshipValidator` | `REF-R`; `UNI-R` | `ReferenceData*Router`; `University*Router` | See R-042/R-046 | See R-056/R-060 | See R-025 | N/A | `UNI-T`; `REF-T` | Runtime Pending | P3 CLOSED |
| R-005 | P8 | P11 | AcademicProgram DegreeLevel | `degreeLevelId` | `DEG-D`; `UNI-D` | University import/change-plan validation | `DEG-R`; `UNI-R` | `University*Router` | See R-046 | See R-060 | See R-025 | N/A | `UNI-T`; `DEG-T` | Runtime Pending | P3 CLOSED |
| R-006 | P10 | P11 | AcademicProgram Major mapping | `majorId`; `majorMappingState` | `MAJ-D`; `UNI-D` | University import/change-plan validation | `MAJ-R`; `UNI-R` | `Major*Router`; `University*Router` | See R-045/R-046 | See R-059/R-060 | See R-024/R-025 | N/A | `UNI-T`; `MAJ-T` | Runtime Pending | P3 CLOSED |
| R-007 | P9 | P11 | Program admission test requirements | `internationalTestId`; `academicProgramId` | `TEST-D`; `UNI-D` | University requirement validation | `TEST-R`; `UNI-R` | `InternationalTest*Router`; `University*Router` | See R-044/R-046 | See R-058/R-060 | See R-025 | N/A | `UNI-T`; `TEST-T` | Runtime Pending | P3 CLOSED |
| R-008 | P7 | P12 | Scholarship country/language/currency references | Canonical reference IDs; source labels provenance-only | `REF-D`; `SCH-D` | Scholarship canonical resolution/import transfer | `REF-R`; `SCH-R` | `Scholarship*Router` filters by canonical country/language/currency IDs; legacy text remains provenance/draft compatibility only | See R-042/R-047 | See R-056/R-061 | See R-026 | N/A | `SCH-T`; `REF-T`; P3 verifier | Runtime Pending | P3 CLOSED |
| R-009 | P8 | P12 | Scholarship DegreeLevel targets/eligibility | `degreeLevelId` | `DEG-D`; `SCH-D` | Scholarship canonical resolution/import transfer | `DEG-R`; `SCH-R` final relation filtering uses `degreeLevelId` | `Scholarship*Router` accepts canonical `degreeLevelId`; text degree input is not a final relation filter | See R-047 | See R-061 | See R-026 | N/A | `SCH-T`; `DEG-T`; P3 verifier | Runtime Pending | P3 CLOSED |
| R-010 | P10 | P12 | Scholarship Major targets/eligibility | `majorId` | `MAJ-D`; `SCH-D` | Scholarship canonical resolution/import transfer | `MAJ-R`; `SCH-R` filters canonical major targets | Public owner API exposes canonical `majorId` filter | See R-045/R-047 | See R-061 | See R-024/R-026 | N/A | `SCH-T`; `MAJ-T`; P3 verifier | Runtime Pending | P3 CLOSED |
| R-011 | P9 | P12 | Scholarship InternationalTest requirements | `internationalTestId` | `TEST-D`; `SCH-D` | Scholarship canonical resolution/import transfer | `TEST-R`; `SCH-R` filters eligibility/doc requirements by canonical Test ID | Public owner API exposes canonical `internationalTestId` filter and DTO retains the canonical requirement ID | See R-044/R-047 | See R-061 | See R-026 | N/A | `SCH-T`; `TEST-T`; P3 verifier | Runtime Pending | P3 CLOSED |
| R-012 | P11 | P12 | Scholarship target University links | `universityId` | `UNI-D`; `SCH-D` | Scholarship canonical resolver + transfer | `UNI-R`; `SCH-R` persists/filters canonical University links | Scholarship DTO/read model retains `universityId`; public owner API exposes canonical `universityId` filter | See R-046/R-047 | See R-060/R-061 | See R-025/R-026 | N/A | `SCH-T`; `UNI-T`; P3 verifier | Runtime Pending | P3 CLOSED |
| R-013 | P11 | P12 | Scholarship target AcademicProgram links | `academicProgramId` | `UNI-D`; `SCH-D` | Resolver requires explicit canonical AcademicProgram ID; atomic transfer persists the resolved ID | `UNI-R`; `SCH-R` persists/filters `academicProgramId` | Public owner API exposes `academicProgramId`; Admin Import Center exposes AcademicProgram resolution decisions | See R-046/R-047 | See R-060/R-061 | See R-025/R-026 | N/A | `SCH-T`; `UNI-T`; P3 verifier | Runtime Pending | P3 CLOSED |
| R-014 | P11 | P10 | Major → Universities reverse read model | Canonical `majorId`; University `ownerId/publicId/slug` | `UNI-D` owns AcademicProgram relation | `IUniversityRepository.listPublished({ majorId })`; `CrossDomainGraphReadService` | `UNI-R` filters `academicPrograms.some.majorId` with `CANONICALLY_MAPPED` | `GET /public/universities?majorId=...`; `GET /public/graph/majors/:slug` | N/A | P24-ready graph projection; no P10-owned collection | N/A | Query projection only; no duplicate persistence | P4 graph/unit/source tests + `UNI-T` | Runtime Pending | P4 CLOSED |
| R-015 | P12 | P10 | Major → Scholarships reverse read model | Canonical `majorId`; Scholarship `ownerId/publicId/slug` | `SCH-D` owns major targets + eligibility | `IScholarshipRepository.listPublished({ majorId })`; `CrossDomainGraphReadService` | `SCH-R` filters both `majorTargets` and canonical `eligibilityItems` | `GET /public/scholarships?majorId=...`; `GET /public/graph/majors/:slug` | N/A | P24-ready graph projection | N/A | Query projection only | P4 graph/unit/source tests + `SCH-T` | Runtime Pending | P4 CLOSED |
| R-016 | P13 | P10 | Major → Courses reverse read model | Canonical `majorId`; Course `ownerId/publicId/slug` | `COURSE-D` `CourseMajorProjection` | `CourseRelationshipQueryService.listPublishedCoursesForMajor`; `CrossDomainGraphReadService` | `COURSE-R` requires `projectionState=APPROVED` and `Course.status=PUBLISHED` | `GET /public/courses?majorId=...`; `GET /public/graph/majors/:slug` | N/A | P24-ready graph projection | N/A | Existing P13 projection; no P10 copy | P4 graph/source tests + `COURSE-T` | Runtime Pending | P4 CLOSED |
| R-017 | P11 | P7 | Country → Universities reverse read model | Canonical country ID resolved from ISO2; University `ownerId/publicId/slug` | `REF-D`; `UNI-D` | `CrossDomainGraphReadService` composes owner query | `REF-R` resolves ISO2→ID; `UNI-R` filters `countryReferenceId` | Existing country-university endpoint + `GET /public/graph/countries/:iso2Code` | N/A | P24-ready country graph; not stored in P7 | N/A | Query aggregation only | P4 graph/source tests + `ReferenceDataPublicRouter.spec.ts` | Runtime Pending | P4 CLOSED |
| R-018 | P12 | P7 | Country → Scholarships reverse read model | Canonical `countryReferenceId`; Scholarship `ownerId/publicId/slug` | `REF-D`; `SCH-D` | `CrossDomainGraphReadService` + P12 owner query | `SCH-R` public path filters canonical `countryReferenceId` | `GET /public/scholarships?countryReferenceId=...`; `GET /public/graph/countries/:iso2Code` | N/A | P24-ready country graph; not stored in P7 | N/A | Query aggregation only | P4 graph/source tests + `SCH-T` | Runtime Pending | P4 CLOSED |
| R-019 | P12 | P11 | University → Scholarships reverse read model | Canonical `universityId`; Scholarship `ownerId/publicId/slug` | `SCH-D` owns university links | `IScholarshipRepository.listPublished({ universityId })`; `CrossDomainGraphReadService` | `SCH-R` filters canonical `universityLinks.some.universityId` | `GET /public/scholarships?universityId=...`; `GET /public/graph/universities/:slug` | N/A | P24-ready connected graph | N/A | Query projection only | P4 graph/unit/source tests + `SCH-T` | Runtime Pending | P4 CLOSED |
| R-020 | P7 | P13 | Course language/provider geography references | Canonical `learningLanguageReferenceId`; provider HQ `countryReferenceId`; provider HQ is not study-country | `REF-D`; `COURSE-D` relationships | `CourseRelationshipResolutionService` + owner review model | `REF-R`; `COURSE-R` validates active ReferenceLanguage and approved provider HQ references | Course public filters use canonical language/provider-HQ IDs; Course admin owner API exposes analyze/review/read-model endpoints | See R-048 | See R-062 | See R-027 | Relationship review projection only | P5 verifier + Course relationship tests | Runtime Pending | P5 CLOSED |
| R-021 | P8 | P13 | Course taxonomy links | Canonical `taxonomyNodeId`; raw topics remain provenance/input only | `TAX-D`; `COURSE-D` relationships | `CourseRelationshipResolutionService` exact-candidate proposal + explicit review | `TAX-R`; `COURSE-R` persists review state and invalidates stale source-term links | Course public filter reads APPROVED taxonomy links only; Course admin owner API exposes scoped approve/reject | See R-048 | See R-062 | See R-027 | P13-owned relationship projection | P5 verifier + relationship tests | Runtime Pending | P5 CLOSED |
| R-022 | P10 | P13 | Course Major projection | Canonical P10 `majorId`; projection lineage retains taxonomy/mapping IDs | `MAJ-D`; `COURSE-D` | `CourseRelationshipResolutionService.projectMajors` + scoped review | `MAJ-R`; `COURSE-R` persists `CourseMajorProjection` and public reads require `APPROVED` | Course public `majorId` filter + Course admin owner projection/review API | See R-045/R-048 | See R-059/R-062 | See R-024/R-027 | P13-owned `CourseMajorProjection`; no P10 reverse collection | P5 verifier + relationship tests | Runtime Pending | P5 CLOSED |
| R-023 | P13 | P14 | Learning completion → certificate issuance | Durable outbox `eventId`; canonical Course/LearningPath ID; `studentReferenceId` | `CourseCompletedEvent`; `LearningPathCompletedEvent`; P14 trust/lifecycle contracts | P13 transactional completion emission → filtered `CertificateCompletionOutboxWorker` → `CertificateCompletionOutboxDeliveryGateway` → `CertificateCompletionEventConsumer` → `CertificateUseCases` | Filtered transactional outbox + P14 `CertificateIssuanceInbox` idempotency receipt + `PrismaCertificateRepository` | Explicit opt-in worker bootstrap exists; no synchronous issue HTTP route | See R-049 | P14 `CertificateReadModelService.verifyPublic` | See R-028 | Stable outbox ID is the delivery idempotency key; P14 emits its own certificate lifecycle events | P13 atomic-outbox tests + P14 delivery/idempotency/verification/revocation/read-model tests + P6 verifier | Runtime Pending | P6 CLOSED |
| R-024 | P10 | P15 | Saved Major reference + hydration | `StudentSavedItem.entityId` must be canonical Major ID; optional slug | `MAJ-D`; `STU-D` saved-item contract | `StudentWorkspaceUseCases.saveItem` stores reference only | `STU-R`; owner hydration adapter absent | Student workspace API stores/retrieves generic saved item | N/A | N/A | No owner read-model hydration found | Workspace outbox only | `StudentWorkspace*` tests; `MAJ-T` | Partial | P7 |
| R-025 | P11 | P15 | Saved University reference + hydration | Canonical University ID; optional `entitySlug` | `UNI-D`; `STU-D` | Student workspace generic reference contract | `STU-R`; owner hydration adapter absent | Student workspace API | N/A | N/A | No University owner hydration found | Workspace outbox only | Student workspace + University tests | Partial | P7 |
| R-026 | P12 | P15 | Saved Scholarship reference + hydration | Canonical Scholarship ID; optional slug | `SCH-D`; `STU-D` | Student workspace generic reference contract | `STU-R`; owner hydration adapter absent | Student workspace API | N/A | N/A | No Scholarship owner hydration found | Workspace outbox only | Student workspace + Scholarship tests | Partial | P7 |
| R-027 | P13 | P15 | Learning progress/completion projection | Course ID; `studentReferenceId`; source event ID | `COURSE-D`; `STU-D` projection DTOs | `StudentWorkspaceUseCases.consumeIntegrationEvent` | `STU-R.ingestIntegrationEvent` projects Course events | No delivery endpoint/worker found invoking consumer | N/A | N/A | Dashboard reads projection | Course events supported but inbound delivery wiring absent | StudentWorkspace use-case/repository tests | Partial | P7 |
| R-028 | P14 | P15 | Certificate read projection | Certificate ID/verification code; `studentReferenceId`; source event ID | P14 `StudentCertificateReadModelDto`; `STU-D` certificate projection | P14 `CertificateReadModelService.listForStudent`; `StudentWorkspaceUseCases.consumeIntegrationEvent` | P14 `CERT-R.listByStudent`; `STU-R.ingestIntegrationEvent` supports issue/revoke/reissue | P14 private read boundary exists; P14→P15 certificate-event delivery caller remains absent | N/A | N/A | Dashboard reads P15 certificate projection | P14 certificate event/read contracts exist; P15 delivery wiring intentionally remains for P7 | P14 read-model tests + Certificate/StudentWorkspace tests | Partial | P7 |
| R-029 | P16 | P15 | Saved CMS content reference + hydration | Canonical CMS content ID/slug | `CMS-D`; `STU-D` includes `CMS_CONTENT` saved-item type | Generic saved-item contract only | `STU-R`; owner hydration absent | Student workspace API | N/A | N/A | No CMS owner hydration adapter found | Workspace outbox only | CMS + StudentWorkspace tests | Partial | P7 |
| R-030 | P18 | P15 | Save Student Tool execution result privately | Execution ID; `studentReferenceId`; Student Tool identity | `TOOLS-D`; `STU-D` | `Phase15StudentToolSaveGateway` + Student Tool execution use cases | `STU-R`; tool registry repo | StudentTools public execution/save API path is source-wired | N/A | Tool live page calls explicit save | Private workspace result save gateway implemented | Explicit save action, no ownership transfer | Student Tool pipeline + StudentWorkspace tests | Runtime Pending | P8 |
| R-031 | P20 | P15 | Services private view/request/fulfillment state | Service public ID plus service-request identity required | `STU-D` has `SERVICE` saved type; P20 service domain contract is not real | No service-request/fulfillment application contract found | P20 persistence unavailable; no request repository | Catalog API shell only | N/A | N/A | Generic saved reference only; no owner hydration/request state | No fulfillment projection | Service + StudentWorkspace tests do not close request path | Missing | P8 |
| R-032 | P19 | P15 | Student finance invoices/payments read model | `studentReferenceId`; invoice/payment public IDs | `FIN-D`; `STU-D` consumer surface | `FinanceStudentUseCases` | `FIN-R` | Authenticated `StudentWorkspaceRouter` finance routes | N/A | N/A | Finance owner read model returned through student API | Read-only composition; finance remains owner | FinanceStudentUseCases + StudentWorkspaceRouter tests | Runtime Pending | P8 |
| R-033 | P15 | P24 | Authenticated Student Workspace surface | Session identity + canonical saved entity references | `STU-D` | `StudentWorkspaceUseCases` | `STU-R` | Backend routes exist and are auth-protected | N/A | `PublicTemplateApp` embeds Student workspace flow | UI still contains preview/local storage paths; API hydration incomplete | Workspace events internal | StudentWorkspaceRouter tests; public-template tests | Partial | P7 |
| R-034 | P7 | P19 | Canonical finance currency projection | ISO 4217 code resolved to canonical active P7 currency | `REF-D`; `FIN-D` `IFinanceCurrencyReferenceGateway` | Finance requires canonical currency before operations | `PrismaFinanceCurrencyReferenceGateway` + `FIN-R` | Finance Admin/API uses application contract | See R-053 | No public finance surface | See R-032 | N/A | Finance core/provider tests + reference tests | Runtime Pending | P8 |
| R-035 | P7 | P20 | Service supported countries/languages | Canonical P7 IDs should be final identity | `SVC-D` is generated/dummy; fields are loose arrays | `SVC-A` | P20 persistence is unavailable | Service routers accept loose service DTOs | See R-054 | See R-066 | See R-031 | N/A | Service tests only cover use-case shell | Partial | P8 |
| R-036 | P7 | P21 | Career geography | Canonical Country/City IDs should replace final text identity | `CAREER-D` currently stores `country`/`city` text | `CAREER-A` | Career persistence unavailable | Career routers expose text filters | See R-055 | See R-067 | N/A | N/A | Career application/router tests | Partial | P8 |
| R-037 | P11 | P18 | University comparison tool | University `publicId` inputs | `UNI-D`; `TOOLS-D` gateway contract | `CanonicalUniversityComparisonGateway` | `UNI-R`; tool registry repo | Student Tools API executes tool handler | N/A | Live `/tools` feature exists | Optional private save via R-030 | Synchronous owner read gateway | Phase18 StudentTools tests + University tests | Runtime Pending | P8 |
| R-038 | P12 | P18 | Scholarship recommendation tool | Should use canonical country/degree/major/language refs | `SCH-D`; `TOOLS-D` gateway contract | `CanonicalScholarshipRecommendationGateway` | `SCH-R` query currently uses textual/source-label filters | Student Tools API executes handler | N/A | Live `/tools` feature exists | Optional private save via R-030 | AI may enrich result via P17 | Phase18 tests + Scholarship tests | Partial | P8 |
| R-039 | P15 | P18 | Student context for tools | `studentReferenceId` + private workspace projection IDs | `TOOLS-D` declares `IStudentContextGateway`; `STU-D` owns context | No implementation/consumer wiring found for `IStudentContextGateway` | No adapter found | No resolved API composition for this gateway | N/A | Tools can run, but not with closed P15 context gateway | Context hydration missing | N/A | No test proves P15 context adapter | Partial | P8 |
| R-040 | P17 | P18 | AI execution for Student Tools | Tool execution ID/correlation + P17 model/provider identity | `AI-D`; `TOOLS-D` `IEnterpriseAIConsumerGateway` | `Phase17StudentToolsAIConsumerGateway` | `AI-R`; tool registry repo | AIGateway + StudentTools routers | See R-051/R-052 | Tool execution surface | Optional private save via R-030 | P17 is sole AI execution gateway | AI + Phase18 tests | Runtime Pending | P8 |
| R-041 | P20 | P19 | Service request/fulfillment → payment/invoice handoff | Service request ID must become finance `originReferenceId/businessReferenceId` | P20 request/fulfillment domain absent; `FIN-D` ready for origin refs | No P20→P19 handoff use case found | P20 persistence unavailable; `FIN-R` exists | No service payment handoff API | N/A | N/A | No private service payment composition | No event/projection | No contract test for service-finance handoff | Missing | P8 |
| R-042 | P7 | P23 | Admin reference-data management/selectors | Canonical reference IDs/codes | `REF-D` | `REF-A` | `REF-R` | `ReferenceDataAdminRouter` | Admin control plane consumes owner API | N/A | N/A | N/A | ReferenceData admin/API tests | Runtime Pending | P9 |
| R-043 | P8 | P23 | Admin taxonomy/DegreeLevel management/selectors | Taxonomy node ID; DegreeLevel ID/code | `TAX-D`; `DEG-D` | Taxonomy/Degree application services | `TAX-R`; `DEG-R` | `AcademicTaxonomyAdminRouter` | Admin taxonomy surfaces exist | N/A | N/A | N/A | AcademicTaxonomy admin tests | Runtime Pending | P9 |
| R-044 | P9 | P23 | Admin International Test management/selectors | Stable Test ID/slug + canonical refs | `TEST-D` | `TEST-A` | `TEST-R` | `InternationalTestAdminRouter` | Admin test surfaces exist | N/A | N/A | N/A | InternationalTest admin/API tests | Runtime Pending | P9 |
| R-045 | P10 | P23 | Admin Major management/selectors | Canonical Major ID/public identity + taxonomy refs | `MAJ-D` | `MAJ-A` | `MAJ-R` | `MajorAdminRouter` | Admin Major surfaces exist | N/A | N/A | N/A | Major admin/API tests | Runtime Pending | P9 |
| R-046 | P11 | P23 | Admin University + AcademicProgram relationship authoring | Canonical country/region/city/degree/major/test IDs | `UNI-D` | `UNI-A` | `UNI-R` | `UniversityAdminRouter` | UI displays normalized relations, but complete canonical selector/editor flow is not closed | N/A | N/A | N/A | University admin/API + validator tests | Partial | P9 |
| R-047 | P12 | P23 | Admin Scholarship relational authoring | Canonical country/university/program/major/degree/language/test IDs | `SCH-D` | `SCH-A` | `SCH-R` | `ScholarshipAdminRouter` + catalog detail router | Current detail page exposes several canonical IDs read-only; complete selector/editor flow missing | N/A | N/A | N/A | Scholarship admin/API + normalized schema tests | Partial | P9 |
| R-048 | P13 | P23 | Admin Course relationships/publishing | Course ID + canonical taxonomy/major/reference IDs | `COURSE-D` | `COURSE-A` | `COURSE-R` | `CourseAdminRouter` | Course admin exists but relation authoring still contains text-oriented fields and relationship services are not fully exposed | N/A | N/A | N/A | Course admin + relationship tests | Partial | P9 |
| R-049 | P14 | P23 | Admin certificate lifecycle | Certificate ID/public ID/verification code | `CERT-D` | `CERT-A` | `CERT-R` | `CertificateAdminRouter` | Certificate admin UI/API exists | N/A | See R-028 | Certificate ledger/lifecycle is P14-owned | Certificate admin/use-case/repository tests | Runtime Pending | P9 |
| R-050 | P16 | P23 | CMS authoring/publishing | CMS content/category IDs and slug/version | `CMS-D` | `CMS-A` | `CMS-R` | `CmsAdminRouter` | CMS admin page/API exists | See R-064 | See R-029 | CMS publication lifecycle owned by P16 | CMS use-case/API tests | Runtime Pending | P9 |
| R-051 | P17 | P23 | AI governance/admin control | P17 provider/model/prompt/execution IDs | `AI-D` | `AI-A` | `AI-R` | `AIAdminRouter`/AIGateway | AI governance page/API exists | No direct public business truth | N/A | P17 execution/audit records | AI governance/repository/API tests | Runtime Pending | P9 |
| R-052 | P18 | P23 | Student Tool registry/admin | Tool key/registry version | `TOOLS-D` | `TOOLS-A` | Tool registry repo | `StudentToolsAdminRouter` | Student Tools admin page/API exists | See R-065 | See R-030 | Registry/health contracts | Phase18 admin/public tests | Runtime Pending | P9 |
| R-053 | P19 | P23 | Finance admin control | Finance public IDs; canonical currency code; immutable ledger references | `FIN-D` | `FIN-A` | `FIN-R` | `FinanceAdminRouter` | Finance admin page/API exists | N/A | See R-032 | Finance events/audit remain P19 | Finance admin/core/router tests | Runtime Pending | P9 |
| R-054 | P20 | P23 | Services admin catalog/relationship authoring | Service public ID/slug; canonical refs not yet real domain contract | `SVC-D` generated/dummy | `SVC-A` | DI binds `serviceCatalogPersistence` unavailable | `ServiceAdminRouter` | Admin Services page exists over API shell | See R-066 | See R-031 | No durable service events | Service use-case/router tests | Partial | P9 |
| R-055 | P21 | P23 | Career/Alumni admin | Career employer/job IDs/public IDs/slugs | `CAREER-D` | `CAREER-A` | DI binds `careerPersistence` unavailable | Career admin router | Admin Career page exists over unavailable persistence | See R-067 | N/A | No durable career event path proved | Career admin/application tests | Partial | P9 |
| R-056 | P7 | P24 | Public countries/reference composition | Canonical ref ID/code + stable slug/code | `REF-D` | Localized reference queries | `REF-R` | Reference public API exists | N/A | `PublicTemplateApp` still imports `MOCK_COUNTRIES` | N/A | N/A | Reference public tests + `publicUx.spec.ts` | Partial | P10 |
| R-057 | P8 | P24 | Public taxonomy/DegreeLevel composition | Canonical taxonomy node/DegreeLevel identity | `TAX-D`; `DEG-D` | Localized/public taxonomy queries | `TAX-R`; `DEG-R` | Taxonomy public API exists | N/A | Public live composition still derives important flows from prototype data | N/A | N/A | AcademicTaxonomy public tests | Partial | P10 |
| R-058 | P9 | P24 | Public International Tests | Test public ID/slug + canonical refs | `TEST-D` | Localized International Test queries | `TEST-R` | `InternationalTestPublicRouter` | N/A | `PublicTemplateApp` still imports `MOCK_EXAMS` | N/A | N/A | InternationalTest public tests | Partial | P10 |
| R-059 | P10 | P24 | Public Majors | Major public ID/slug + canonical owner ID | `MAJ-D` | Localized/public Major queries | `MAJ-R` | `MajorPublicRouter` | N/A | `PublicTemplateApp` still imports `MOCK_MAJORS` and uses local navigation | See R-024 | N/A | Major public tests + public UX tests | Partial | P10 |
| R-060 | P11 | P24 | Public Universities/AcademicPrograms | University/program public identity + canonical linked IDs | `UNI-D` | Localized/public University queries | `UNI-R` | `UniversityPublicRouter` | N/A | `PublicTemplateApp` still imports `MOCK_UNIVERSITIES` | See R-025 | N/A | University public tests | Partial | P10 |
| R-061 | P12 | P24 | Public Scholarships and connected identities | Scholarship `publicId/slug`; canonical University/Program/Major/Country IDs | `SCH-D` | `PublicScholarshipUseCases` | `SCH-R` | `ScholarshipPublicRouter` | N/A | `publicScholarshipDataSource` creates synthetic participating-university IDs from text labels | See R-026 | N/A | `publicScholarshipDataSource.spec.ts`; Scholarship public tests | Partial | P10 |
| R-062 | P13 | P24 | Public Courses / Imported Courses | Course public ID/slug + canonical relationships | `COURSE-D` | Public Course use cases + relationship query service | `COURSE-R` | `CoursePublicRouter` | N/A | `PublicTemplateApp` still imports `MOCK_COURSES` and `GOLDEN_IMPORTED_COURSES` | See R-027 | N/A | Course public/imported closure tests | Partial | P10 |
| R-063 | P14 | P24 | Public certificate verification | Verification code/public credential identity | `CERT-D` + P14 verification read contract | `CertificateReadModelService.verifyPublic` → `CertificateUseCases.verifyByCode` | `CERT-R` | `CertificatePublicRouter` delegates to P14 read model | N/A | `CertificateVerificationPage` calls live `ApiClient.verifyCertificate` | See R-028 | Verification truth/integrity remains P14-owned; P24 only composes the result | Certificate public/read-model/use-case/repository tests | Runtime Pending | P10 |
| R-064 | P16 | P24 | Public CMS content | CMS content slug/public identity + locale/version | `CMS-D` | CMS public use cases | `CMS-R` | `CmsPublicRouter` | N/A | Separate live CMS pages use API, but `PublicTemplateApp` still imports `GOLDEN_ARTICLES` | See R-029 | CMS publication state | CMS public/use-case tests | Partial | P10 |
| R-065 | P18 | P24 | Public Student Tools catalog/execution | Tool key/public registry identity | `TOOLS-D` | Student Tool registry/execution use cases | Tool registry repo + gateways | `StudentToolsPublicRouter` | N/A | Separate `/tools` feature uses API; PublicTemplate AI-tools preview remains static data | See R-030 | Execution IDs/events internal | StudentTools public/pipeline tests | Partial | P10 |
| R-066 | P20 | P24 | Public Services | Service `publicId/slug` intended; canonical linked refs incomplete | `SVC-D` generated/dummy | `PublicServiceCatalogUseCases` | Service persistence unavailable | `ServicePublicRouter` | N/A | Separate ServiceList uses API but PublicTemplate uses static `PUBLIC_SERVICES`; backend persistence unavailable | See R-031 | No durable service projection | Service public/use-case tests | Partial | P10 |
| R-067 | P21 | P24 | Public Career opportunities | Job/employer public IDs/slugs; geography still text | `CAREER-D` | `CareerPublicUseCases` | Career persistence unavailable | `CareerPublicRouter` | N/A | Public template career surface cannot be owner-backed while persistence is unavailable | N/A | No durable career projection | Career public/application tests | Partial | P10 |
| R-068 | P22 | P24 | Product-experience navigation/UX contract; no business-data ownership | N/A by design; P22 owns experience principles, not domain identity | No P22 business domain package by design | Presentation-level navigation contract | N/A | N/A | N/A | `usePublicNavigation`; `PublicTemplateApp` composition | N/A | N/A | `publicUx.spec.ts` | Source Closed | P10/P13 review only |


## 5. Measurement snapshots

### P2 creation snapshot (historical)

- Total tracked important cross-phase relationships: **68**.
- `Source Closed`: **1**.
- `Runtime Pending`: **23**.
- `Partial`: **39**.
- `Missing`: **5**.

### Current snapshot after P3 source closure

- Total tracked important cross-phase relationships: **68**.
- `Source Closed`: **1**.
- `Runtime Pending`: **29**.
- `Partial`: **33**.
- `Missing`: **5**.
- P3 rows R-001→R-013: **13/13 source-closed; runtime DB proof remains pending where applicable**.
- Phase coverage P7–P24: **COMPLETE**.

### Current snapshot after P4 source closure

- Total tracked important cross-phase relationships: **68**.
- `Source Closed`: **1**.
- `Runtime Pending`: **34**.
- `Partial`: **31**.
- `Missing`: **2**.
- P3 rows R-001→R-013: **13/13 source-closed**.
- P4 rows R-014→R-019: **6/6 source-closed; runtime DB/E2E proof remains pending**.
- Phase coverage P7–P24: **COMPLETE**.

### Current snapshot after P5 source closure

- Total tracked important cross-phase relationships: **68**.
- `Source Closed`: **1**.
- `Runtime Pending`: **37**.
- `Partial`: **28**.
- `Missing`: **2**.
- P5 rows R-020→R-022: **3/3 source-closed; runtime DB/E2E proof remains pending**.

### Current snapshot after P6 source closure

- Total tracked important cross-phase relationships: **68**.
- `Source Closed`: **1**.
- `Runtime Pending`: **38**.
- `Partial`: **27**.
- `Missing`: **2**.
- R-023 P13→P14 completion/certificate authority edge: **source-closed; runtime worker/DB/KMS proof remains pending**.
- R-028 remains `Partial | P7`; P6 does not start Student Workspace delivery wiring.

The status count remains deliberately conservative. A row stays `Partial` when a later consumer/API/read-model edge outside the active closure step is incomplete; `Runtime Pending` means the source relationship is closed and only live DB/environment proof remains.

## 6. Execution checklist mapping

- **P3:** close R-001→R-013 canonical backbone gaps without rebuilding the normalized University/Scholarship schemas.
- **P4:** close R-014→R-019 reverse read models/aggregations.
- **P5:** **CLOSED** — R-020→R-022 are source-closed as `Runtime Pending`; imported-course provider/source-identity/direct-URL security gates retained.
- **P6:** **CLOSED** — R-023 completion-event delivery into P14 and the certificate authority edge are source-closed as `Runtime Pending`; P7 has not started.
- **P7:** close P15 hydration/live-session edges R-024→R-029 and R-033; P8 owns the later-domain edges R-030→R-041 where noted.
- **P8:** close late-domain source integrations R-030→R-041.
- **P9:** close P23 owner-API relational authoring R-042→R-055.
- **P10:** close P24 live composition R-056→R-068; remove live mocks/synthetic identities without moving ownership to P24.
- **P11:** add automated guards/contracts against regression for every relation closed above.
- **P12:** run full source CI and classify only genuine DB/E2E checks as runtime pending.
- **P13:** re-audit this matrix against final source; every row must end as `Source Closed` or `Runtime Pending`, and historical matrices/reports must be explicitly marked historical/superseded where appropriate.

## 7. P2 closure gate

P2 is closed only when all of the following remain true:

- this file is the only active Cross-Phase Relationship Closure Matrix;
- every important P7–P24 cross-phase relation above has one owner and one consumer direction;
- every row records canonical identity, contract, repository, API/read-model, Admin/Public/Student/Event applicability, source tests, status and closure step;
- no row is marked closed solely because a Prisma relation exists;
- known source gaps (unwired P13→P14 consumer, incomplete P15 hydration, P20/P21 unavailable persistence, public mocks/synthetic identity, incomplete Admin relational editors) remain visible as `Partial`/`Missing` rather than being hidden;
- no DB migration is applied and no runtime evidence is fabricated during P2.

**P2 result at creation:** relationship inventory/checklist is source-traceable and ready to drive P3→P13. No P3 relationship implementation is performed in this stage.
