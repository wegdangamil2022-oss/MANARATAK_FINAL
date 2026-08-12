# WP1 Database Closure Register

All entries are blocked by the external Google Studio database recovery gate. No credentials or secret connection material belong in this register.

| DB-dependent item | Status | Current evidence | DB mutation | Rollback requirement | Conceptual closure step | Owner |
|---|---|---|---|---|---|---|
| Original development database backup | BLOCKED | Database unavailable locally | NO | Prove backup readability and non-destructive restore | Produce timestamped backup and restore evidence in external runtime | Database Operations |
| Schema snapshot | BLOCKED | Local Prisma schema is source evidence only | NO | Preserve pre-change snapshot | Export authoritative schema after backup | Database Operations |
| Applied/pending migration status | BLOCKED | No permitted DB connection | NO | Record current migration baseline | Query authoritative migration history read-only | Database Operations |
| Session durability verification | BLOCKED | Source implementation reviewed; DB behavior unverified | NO | Preserve session rows during verification | Verify create/revoke/expiry behavior against original development DB | Identity/Security |
| Credential persistence verification | BLOCKED | Source-only evidence | NO | No credential data alteration during inspection | Verify persisted credential invariants using sanitized evidence | Identity/Security |
| Admin bootstrap and RBAC verification | BLOCKED | Source roles and guards exist; persisted bootstrap unknown | NO | Snapshot assignments before any approved repair | Verify bootstrap identity, roles, and effective permissions | Identity/Security |
| Audit persistence verification | BLOCKED | Prisma repository is composed; runtime persistence unverified | NO | Preserve audit rows | Exercise non-destructive audit writes in development runtime | Audit/Foundation |
| Critical audit transaction guarantee | BLOCKED | Separate calls are not proven atomic | YES | Transaction rollback must remove both business and audit writes | Introduce and test a shared unit of work after gate approval | Audit + owning domain |
| Outbox model | BLOCKED | No model in current Prisma schema | YES | Approved down migration or equivalent restoration plan | Design fields/indexes against authoritative schema | Event Foundation + Database Operations |
| Outbox migration | BLOCKED | No migration exists | YES | Rehearse migration rollback against restored copy | Generate, review, and apply only after backup gate | Event Foundation + Database Operations |
| Same-transaction business and Outbox write | BLOCKED | Current event path publishes and saves separately | YES | Roll back both records on either failure | Add shared unit of work to each approved adoption | Event Foundation + owning domain |
| Dispatcher database integration | BLOCKED | Source contracts only; no adapter | YES | Disable worker and preserve pending rows | Implement safe claims and state transitions against approved model | Event Foundation |
| Outbox runtime tests | BLOCKED | Dependencies and database unavailable | TEST DATA ONLY | Restore fixture/database state after tests | Test rollback, concurrency, retry, idempotency, and recovery | QA + Event Foundation |

No row above authorizes a database operation. Approval remains conditional on closing `WP-1 DATABASE RECOVERY GATE`.
