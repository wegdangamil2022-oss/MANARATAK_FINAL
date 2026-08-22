# PostgreSQL Backup / Restore Runbook — Imported Courses

## Before reviewed migrations or large seed operations
1. Confirm the target environment and database name.
2. Record the deployed application commit SHA and Prisma migration status.
3. Take a PostgreSQL backup with `pg_dump --format=custom --no-owner --no-privileges`.
4. Store the backup in the approved encrypted backup location outside the application container.
5. Rehearse restore into a disposable database before relying on the backup.

## Disposable rehearsal
```bash
export DATABASE_URL='postgresql://.../manaratak_ci'
export WPIC10_ALLOW_DISPOSABLE_DB=1
bash scripts/wp-ic-10-db-backup-restore.sh
```
The script refuses a non-local/non-test-looking database target and compares counts for `_prisma_migrations`, `ExternalCourseProvider`, `Course`, `ImportBatch`, `ImportRecord`, and `CourseSourceIdentity` after restore.

## Production restore procedure
Production restore is an operator-controlled incident action, not an automatic WP-IC-10 script action.
1. Stop application writers or enter the approved maintenance mode.
2. Preserve the damaged database as incident evidence if storage permits.
3. Create a new recovery database rather than overwriting the only copy.
4. Restore the reviewed backup with `pg_restore --no-owner --no-privileges --exit-on-error`.
5. Run `prisma migrate status` against the restored database.
6. Verify liveness/readiness, imported-course counts, provider counts, and import lineage.
7. Switch application traffic only after smoke verification.

Never use `prisma migrate reset` against production.
