# Imported Courses Runtime Runbook — WP-IC-10

## Purpose
This runbook closes the imported-course runtime after WP-IC-09. It does not introduce a second import architecture or bypass Phase 06 staging / WP-IC-05 controlled transfer.

## Pre-deployment gates
1. Clean checkout at the accepted WP-IC-10 baseline or later reviewed commit.
2. `npm ci`.
3. `npx prisma validate --schema=packages/infrastructure/prisma/schema.prisma`.
4. `npm run db:generate`.
5. `npm run typecheck`.
6. `npm run lint`.
7. `npm run build`.
8. `npm run test:unit`.
9. `node --test tests/imported-courses/*.test.mjs`.
10. `node scripts/wp-ic-10-runtime-closure.mjs security --repo-root .`.
11. `node scripts/wp-ic-10-runtime-closure.mjs memory --rows 3663`.
12. Run the disposable PostgreSQL rehearsal and backup/restore rehearsal before any production migration.
13. Run browser E2E.
14. Run runtime smoke against the deployed staging service.

## Runtime invariants
- Imported-course admin APIs remain authenticated and permission-gated.
- Course transfer never auto-publishes.
- URL changes update the same stable Course identity after review; they do not create a new Course merely because a URL changed.
- Provider/domain mismatch and source drift halt staging.
- Automated acquisition uses only registered connectors.
- Link-health jobs remain bounded and rate-safe.
- Provider headquarters country is never inferred as a course study country.

## Staging smoke
```bash
node scripts/wp-ic-10-runtime-closure.mjs smoke \
  --base-url https://staging.example.org \
  --output-dir wp-ic-10-results
```
Provide `WPIC10_AUTHORIZATION` only when an approved admin credential is available; authenticated checks are additive.

## Closure
Before handoff, collect `CI_CLOSURE.json`, `SECURITY_AUDIT.json`, `LARGE_FILE_MEMORY.json`, `DATABASE_REHEARSAL.json`, `BACKUP_RESTORE_REHEARSAL.json`, and `BROWSER_E2E.json`, then run:
```bash
node scripts/wp-ic-10-runtime-closure.mjs finalize --results-dir wp-ic-10-results
```
A `CLOSED_READY_FOR_GOOGLE_STUDIO_HANDOFF` result authorizes Google Studio to configure/start the reviewed runtime. After service startup, add `RUNTIME_SMOKE.json` and finalize again; the final deployed state must become `DEPLOYED_RUNTIME_VERIFIED`.
