# WP5 International Tests Reference Audit

| Area | Before | After | Remaining limitation |
|---|---|---|---|
| Country | ISO codes, relationship rows, and JSON IDs could all appear authoritative | Semantic writes resolve Phase 7 IDs; standard codes are compatibility/provenance | DB schema/backfill pending |
| Language | Relationship uses language code | Source relationship contract uses canonical ID | DB schema/backfill pending |
| Currency | Fee code accepted and import silently defaulted to USD | Application resolves active Phase 7 Currency; silent default removed | Currency ID persistence pending |
| DegreeLevel | Nullable ID and required code coexist | Source relationship uses canonical `degreeLevelId`; code is compatibility only | Existing rows require reconciliation |
| Availability | JSON IDs and country relationship table overlap | `CANONICAL_REFERENCE_IDS` selected as authoritative; other representation is `LEGACY_TO_BACKFILL` | Migration required to remove duplicate truth |
| Version/Cycle | Integer `versionNumber` and dates only | Source contract adds `cycleKey`, `versionKey`, and `displayLabel` | Persistence migration pending |
| Centers | Country ISO and city text | Country is a standard-key compatibility field; `cityName` is display/address metadata | Proven semantic locations may later gain City IDs |
| University acceptance | `crossPhaseReferences.universityIds` could imply ownership | Explicitly deprecated as navigation compatibility; acceptance belongs to University/AcademicProgram | Owning domain contract is future work |

## Classification

- Availability `availableCountryIds` and `availableCityIds`: `CANONICAL_REFERENCE`, `AUTHORITATIVE`.
- Country/language relationship codes and fee currency code: `STANDARD_CODE_ONLY`, retained as compatibility/provenance pending migration.
- Relationship tables overlapping availability: `DUPLICATE_SSoT`, `LEGACY_TO_BACKFILL`.
- Center `cityName`: `DISPLAY_ONLY_STRING` unless a future use case proves semantic City linkage.
- Center/provider `countryIso2Code`: standard external key; semantic relationships must resolve through Phase 7.
- Degree `degreeLevelId`: `CANONICAL_REFERENCE`; `degreeLevelCode`: compatibility metadata.
- Integer `versionNumber`: technical sequence, not an academic/calendar cycle.

## Ownership

Phase 9 owns test definitions, variants, scoring, versions/cycles, providers, evidence, and test-level availability. University and AcademicProgram domains own acceptance, program requirements, and program-specific minimum scores.

Routers already use Application use cases and contain no direct Prisma access. No content module, test identity, slug, or relationship data was modified.
# Country Detail Runtime Wiring (2026-08-13)

- The Country detail screen queries International Tests by canonical ISO2 through `InternationalTestCountryRelationship`.
- The API and Prisma repository now accept `countryIso2Code`; matching is performed by the normalized relationship table, not by test/provider names.
- Returned records expose their relationship type so the Admin screen does not collapse distinct semantics into a generic association.
- Provider country is deliberately not treated as test availability or acceptance evidence.
- The 56 Markdown source documents contain no structured country-relationship fields. Relationship population therefore remains a governed runtime/import task and no relationships were inferred from prose or filenames.
- Database writes in this preparation: `0`.
## Atomic Admin Mutation Adoption (2026-08-13)

- Create, upsert, update, readiness transition, publish, archive, variants, sections, score scale, fees, official links, availability, preparation materials, evidence, and import-draft creation use one business/audit/Outbox transaction boundary.
- `PrismaInternationalTestRepository.withTransaction` rejects missing Prisma transaction context.
- Canonical country, city, language, currency, and DegreeLevel validation still runs before persistence; no IDs, slugs, or the 56 active + 3 archived source records were changed.
- Runtime rollback proof remains pending the approved Development database recovery gate.

## Stage 3 Source Closure (2026-08-13)

- The repeatable source verifier confirms `56 active + 3 archived` identities with no duplicate IDs or slugs.
- API promotion and the legacy direct import script are blocked until `WP1_RECOVERY_GATE=CLOSED` and `ALLOW_DATABASE_MUTATIONS=YES`.
- No test content, identity, slug, relationship, or database row was changed.
- Promotion, persistence counters, relationship integrity, and rollback evidence remain runtime-only closure items.
