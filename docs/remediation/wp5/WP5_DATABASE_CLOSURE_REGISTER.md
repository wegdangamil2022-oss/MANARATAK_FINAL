# WP5 Database Closure Register

No item authorizes database access or mutation before the Google Studio recovery gate is closed.

| Item | Current status | Required migration/backfill | Expected invariant | Rollback requirement |
|---|---|---|---|---|
| Country references | Source validation implemented; DB stores ISO relationships and JSON IDs | Resolve semantic country links to stable Phase 7 IDs | Every semantic country link resolves to one active canonical Country | Restore relationship snapshot and rejected-row report |
| Language references | Source contract requires canonical IDs; DB stores language codes | Add/persist canonical Phase 7 Language IDs | Code is compatibility metadata; ID is authoritative | Restore prior relationships and codes |
| Currency references | Application resolves code/optional ID; DB stores code only | Add canonical Currency ID and backfill validated codes | Every fee has one active Currency ID; no silent default | Restore fee snapshot and old code values |
| DegreeLevel references | Source contract uses `degreeLevelId`; schema has nullable ID plus code | Reconcile IDs, classify legacy code as compatibility, backfill missing IDs | Every semantic degree relationship resolves to active Phase 8 DegreeLevel | Restore relationship snapshot and exception list |
| Availability SSoT | Contract selects canonical ID arrays; relation representation also exists | Reconcile relation rows into authoritative IDs, then demote/remove duplicate representation by approved migration | One authoritative availability set per test with no contradictory country set | Preserve both pre-migration representations and reversible transform |
| City availability | JSON supports canonical City IDs; centers retain display `cityName` | Backfill only proven semantic City links | Canonical availability uses City IDs; center address labels remain display metadata | Restore JSON and unresolved-label report |
| Provider country | Provider stores ISO2 code | Resolve to canonical Country ID if provider nationality is semantically required | One canonical provider-country link or explicitly display-only metadata | Restore provider snapshot |
| Version/Cycle | Version has integer sequence and dates but no cycle key | Add `cycleKey`, `versionKey`, and `displayLabel` persistence | `2026`, `2027`, and `2026-2027` remain distinct without coercion | Restore version snapshot and down migration |
| Referential validation | Source checks new active admin/import writes | Validate all existing references in original DB | Invalid/unresolved rows are reported, never silently accepted | Read-only first; rollback any approved correction batch |
| Baseline reconciliation | Source proves 56 active + 3 archived keys | Compare DB identities, IDs, slugs, statuses, and relationships | 59 identities; duplicate IDs/slugs zero; 56 active and 3 archived | Backup plus before/after counters |
