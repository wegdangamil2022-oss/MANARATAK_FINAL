# WP2 Import Durability and DB Tooling

Status date: 2026-08-13

## Import Durability

- Active Prisma composition now uses `PrismaImportQueueGateway`.
- The in-memory queue remains explicitly `DEVELOPMENT_ONLY` and is selected only by non-Prisma composition.
- Job transitions use conditional `updateMany` predicates, so stale/concurrent state changes do not return success.
- Checkpoints are durable `ImportRecord` rows with status `CHECKPOINT`; counters update in the same Prisma transaction.
- Dead-letter evidence is a durable `ImportRecord` row with status `DLQ`; batch state and failed counters update in the same transaction.
- Error notes are sanitized before persistence.
- Missing batches, persistence failures, and stale transitions are visible; there is no Prisma-to-memory fallback.

## Governed Database Tool

Entry point: `scripts/db-remediation-gate.ts`.

| Command | Behavior | Database writes |
|---|---|---:|
| `npm run db:remediation:plan` | Migration and checksum inventory | 0 |
| `npm run db:remediation:status` | Prisma migration status against configured DB | 0 |
| `npm run db:remediation:baseline` | Read-only migration and domain counters | 0 |
| `npm run db:remediation:dry-run` | Source migration/rollback inventory and execution sequence | 0 |
| `npm run db:remediation:rollback-plan` | Lists rollback artifacts; never executes rollback | 0 |
| `npm run db:remediation:deploy` | Prisma deploy, blocked unless both mutation gates are explicit | Potential write |

Deployment requires both:

```text
WP1_RECOVERY_GATE=CLOSED
ALLOW_DATABASE_MUTATIONS=YES
```

Without both values the command exits before invoking Prisma. Rollback remains manual, reviewed, and stage-specific; the tool does not execute rollback SQL automatically.

## Verification

| Check | Result |
|---|---|
| TypeScript | PASS |
| Import durability tests | 33/33 PASS |
| Plan/dry-run/rollback-plan | PASS, no DB connection |
| Deploy without gate | BLOCKED before Prisma invocation |
| Schema change in this task | NO |
| Migration applied | NO |
| Database connection | NONE |
| Database writes | 0 |

Runtime closure still requires persisted checkpoint recovery, concurrent worker transitions, process restart, and DLQ replay evidence against the approved Development DB.
