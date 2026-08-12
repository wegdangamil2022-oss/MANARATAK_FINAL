# WP3 Canonical Reference Data Audit

| Area | Before | After | Remaining limitation |
|---|---|---|---|
| Canonical identity | Country/Currency/Language DTOs exposed codes but hid persisted IDs | Repository responses expose existing stable IDs; resolver returns canonical ID plus standard code | Existing database values require Google Studio validation |
| Resolver boundary | No unified resolver for the five reference types | `IReferenceResolver` and `ReferenceResolverService` cover Country, Region, City, Language, Currency | Higher-domain adoption belongs to WP5/WP6 |
| Country/Region/City hierarchy | City could accept an incompatible region link | New writes verify active country and region-country compatibility | Existing rows and DB constraints require closure gate |
| Standard codes | Often consumed as raw strings | Contract classifies them as canonical external keys or aliases | Existing free-text consumers need domain-owned migration |
| Alias/historic/lifecycle | `isActive` plus metadata; no authoritative alias/successor model | Truth documented as PARTIAL/DEFERRED | Model and migration require DB approval |
| Study Destination ownership | Baseline implied a profile exposed by every country | Phase 07 owns identity only; downstream profile references `countryReferenceId` | Downstream persistence is deferred |
| Reference Admin | Canonical code CRUD; free-text region field | No marketing/workflow ownership found; capability classified honestly | Region, alias, and lifecycle management are partial/deferred |

## Consumer Findings

- Universities: `country` and `city` remain `LEGACY_STRING`; `UniversityIntegrationPayload` already anticipates canonical country/region/city IDs. Adoption and backfill are deferred to the owning package.
- International Tests: availability IDs are canonical-ready, but center `countryIso2Code`/`cityName` and fee `currencyCode` are unresolved external references. Resolver adoption is deferred to the owning package.
- Majors: no direct Country/Region/City/Language/Currency table access was found in the reviewed Phase 10 source.
- No higher domain directly queries Prisma Reference Data tables; persistence access remains inside `PrismaReferenceDataRepository`.

No Reference IDs were regenerated and no database operation was performed.
