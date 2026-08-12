# MANARATAK 2.0

MANARATAK is an npm-workspaces monorepo containing the public web application, API, Admin application, domain packages, import foundation, source datasets, and architecture/remediation evidence.

## Current Status

- Source remediation through WP10 is prepared.
- Phase 10 source freeze is prepared; final freeze is pending Google Studio.
- Phase 11 University contracts are prepared; University bulk import is blocked.
- University Stage 1 source Dry Run covers 10,723 rows; imported records remain 0.
- Original Development DB recovery, migrations, build, tests, and runtime validation remain pending Google Studio.
- This repository is not declared Production Ready.

See `docs/remediation/wp8/WP8_GOOGLE_STUDIO_CLOSURE_MASTER_REGISTER.md` for the authoritative external closure register.

## Repository Layout

- `apps/api`: Express API and composition root.
- `apps/web`: Public web application and same-origin readiness previews.
- `apps/admin`: Dedicated Admin application.
- `packages/domain`: Domain contracts, policies, and invariants.
- `packages/application`: Application use cases and domain adapters.
- `packages/infrastructure`: Prisma and external infrastructure adapters.
- `packages/core`, `packages/shared`, `packages/config`, `packages/types`, `packages/ui`, `packages/utils`: shared foundations.
- `scripts`: operational, import, database, and source-verification scripts. Historical one-off scripts are under `scripts/archive` and are not operational entry points.
- `workspace`: source datasets, import artifacts, catalog indexes, reconciliation evidence, and generated reports. It is not application source.
- `docs`: architecture, phase specifications, operations, implementation history, and remediation evidence.
- `tests`: repository-level test entry points.

## Package Manager

The canonical package manager is **npm**.

- Lockfile: `package-lock.json`
- Workspaces: `apps/*`, `packages/*`
- Runtime requirement: Node.js 20+ and npm 10+

The historical `bun.lock` is archived under `workspace/reports/remediation-history/lockfiles` and is not an active lockfile.

## Commands

```bash
npm ci
npm run db:generate
npm run typecheck
npm run lint
npm run build
npm run test
npm run e2e
```

Development entry points:

```bash
npm run dev
npm run dev:admin
npm run start
```

Dependencies are not included in the handoff. Build and test results must be established in the approved Google Studio environment.

## Database Safety

The Prisma schema is `packages/infrastructure/prisma/schema.prisma`. Commands that mutate schema or data must not be run until the original Development DB recovery gate, backup, restore verification, migration review, and owner-specific closure conditions are complete.

Do not use Production for remediation. Do not run database reset, unapproved migrations, backfills, canonical ID regeneration, or bulk University import.

## Import Platform

Generic imports flow through Phase 6 `UniversalImportHandoff`; each owning domain decides matching, duplicate resolution, validation, promotion, and persistence.

Source datasets live under `workspace`. A file is inert until explicitly selected with its import type and target domain. Direct spreadsheet-to-Prisma/SQL imports and automatic root-folder imports are prohibited.

University Stage 1 evidence is documented in `docs/remediation/wp10/PHASE_1_UNIVERSITY_SOURCE_DRY_RUN_REPORT.md`.

## Environment

Use `.env.example` as the variable-name template. It contains no usable credentials. Keep real secrets outside source control and use strict authentication in deployed environments.

## Git Handoff Note

The bundled `.git` metadata is incomplete and must not be repaired from an older MANARATAK copy. Exclude `.git` from the final handoff ZIP and initialize or attach version control independently after validating the source handoff.
