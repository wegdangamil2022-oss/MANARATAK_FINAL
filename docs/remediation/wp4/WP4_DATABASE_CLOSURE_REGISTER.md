# WP4 Database Closure Register

No item authorizes database access or mutation before the Google Studio recovery gate is closed.

| Item | Classification | Source evidence | Required closure | Owner |
|---|---|---|---|---|
| Canonical DegreeLevel rows | GOOGLE STUDIO / DB CLOSURE REQUIRED | Seven codes are fixed in the source contract and seed service | Verify rows, stable IDs, uniqueness, and status without reseeding | Academic Taxonomy + DB Operations |
| Major profile degree references | GOOGLE STUDIO / DB CLOSURE REQUIRED | `degreeLevelId` relation exists; `level` string remains | Audit profiles, resolve valid legacy values, then approve backfill | Majors |
| International Test degree relationships | GOOGLE STUDIO / DB CLOSURE REQUIRED | Prisma relationship targets DegreeLevel | Validate every persisted relationship and unresolved legacy code | International Tests |
| Legacy imported degree labels | GOOGLE STUDIO / DB CLOSURE REQUIRED | Major import maps labels to a local compatibility subset | Produce mapping exceptions and backfill only after backup | Majors |
| Taxonomy edge deletion/runtime behavior | GOOGLE STUDIO / DB CLOSURE REQUIRED | Router now delegates lookup and deletion to Application/Repository | Verify not-found, delete, rollback, and audit persistence | Academic Taxonomy |
| Taxonomy mutation audit persistence | GOOGLE STUDIO / DB CLOSURE REQUIRED | WP1 mutation middleware covers `/admin/academic-taxonomy` | Verify critical audit records in original development DB | Audit + Academic Taxonomy |
| Reverse mapped-majors query | DEFERRED | Endpoint is `NOT_CONFIGURED`; Phase 8 no longer reads Major tables | Add a Phase 10-owned read contract and runtime tests | Majors |
| Existing taxonomy IDs and ISCED-F baseline | VALIDATION REQUIRED | Source baseline unchanged | Compare restored DB to approved baseline; do not regenerate IDs | Academic Taxonomy + DB Operations |
