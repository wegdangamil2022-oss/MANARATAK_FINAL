# Phase 11 University Import Safety Gate

Status: `UNIVERSITY BULK IMPORT = BLOCKED`

No University import, promotion, schema mutation, or record creation is authorized until every gate is evidenced.

| Gate | Current status | Required evidence |
|---|---|---|
| University identity contract approved | `READINESS_PREPARED` | ARB approval of immutable `INS-*` association |
| Phase 7 references ready | `SOURCE_IMPLEMENTED_RUNTIME_PENDING` | Country/Region/City resolver integration tests |
| Major/Degree contracts ready | `SOURCE FREEZE PREPARED` | WP9 final freeze and DB linkage evidence |
| Test requirement contract ready | `READINESS_PREPARED` | Phase 9 canonical Test integration tests |
| Import handoff ready | `SOURCE_IMPLEMENTED_RUNTIME_PENDING` | Phase 6 durable runtime evidence |
| Duplicate strategy ready | `READINESS_PREPARED` | Sample ambiguity and reviewed-match evidence |
| Dry Run available | `DESIGNED` | Executable no-write dry run with all dispositions |
| Rollback strategy defined | `PENDING_GOOGLE_STUDIO` | Approved rollback procedure and successful sample rollback |
| Original Development DB backup | `PENDING_GOOGLE_STUDIO` | WP-1 backup/checksum/restore evidence |
| DB recovery gate closed | `PENDING_GOOGLE_STUDIO` | WP-1 database recovery closure |
| Schema/migrations approved | `PENDING_GOOGLE_STUDIO` | Reviewed additive migration and dry-run output |
| Sample import validated | `PENDING_GOOGLE_STUDIO` | Representative sample counters and reviewed results |
| Phase 1 source files compatible | `SOURCE_VALIDATED` | 10,723 rows, zero duplicate/invalid IDs, source fingerprints recorded |
| Before/after counters defined | `DESIGNED` | Universities, aliases, references, hierarchy, programs, requirements, unresolved and duplicate counters |
| Admin authorization and Audit | `PENDING_GOOGLE_STUDIO` | Backend denial and critical mutation audit evidence |
| Final bulk import approval | `BLOCKED` | All gates closed and explicit authorized approval |

## Operational Rules

- A root file is inert until explicitly selected with filename, import type, and target domain.
- There is no folder watcher or automatic import.
- Every source flows through Phase 6 and the University domain Dry Run before any approval.
- Direct Prisma, SQL, spreadsheet-to-record, and ad-hoc database import are prohibited.
- Missing canonical references remain unresolved; fake entities are prohibited.
