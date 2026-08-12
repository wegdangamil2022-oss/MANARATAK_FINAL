# Final Handoff Manifest

Status: `CLEAN SOURCE HANDOFF PREPARED / DB AND RUNTIME PENDING GOOGLE STUDIO`

## Canonical Root

`C:\Users\HP\Documents\Codex\2026-08-12\new-chat\MANARATAK_CURRENT_2026-08-12`

## Source Tree

- Applications: `apps/api`, `apps/web`, `apps/admin`.
- Architecture packages: `packages/domain`, `packages/application`, `packages/infrastructure` plus shared foundation/UI/config packages.
- Operational and verification tooling: `scripts`; archived one-offs are under `scripts/archive`.
- Data/import sources: `workspace`; these are not runtime TypeScript source.
- Architecture, operations, phase history, and remediation evidence: `docs`.

## Runtime Prerequisites

- Node.js 20+ and npm 10+.
- Dependencies restored from `package-lock.json` using `npm ci` in the approved environment.
- PostgreSQL Development DB/proxy configuration supplied securely in Google Studio.
- Redis when required by the selected runtime composition.
- Environment values based on `.env.example`; no real credentials are included.

## Current Gates

- Authoritative register: [WP8 Google Studio Closure Master Register](../wp8/WP8_GOOGLE_STUDIO_CLOSURE_MASTER_REGISTER.md).
- Tracked Google Studio closure groups: 96.
- Original Development DB: external Google Studio dependency.
- Build/tests: pending Google Studio; no local dependency installation was performed.
- Phase 10: source freeze prepared, final freeze pending DB/runtime.
- Phase 11: contracts prepared, bulk import blocked.

## University Stage 1

- Canonical source location: `workspace/import-sources/universities/stage-1`.
- Workbooks: 6; rows: 10,723.
- Duplicate/invalid `INS-*`: 0; IDs changed: 0.
- Imported Universities: 0; database writes: 0.
- Evidence: [Phase 1 source Dry Run](../wp10/PHASE_1_UNIVERSITY_SOURCE_DRY_RUN_REPORT.md).

## Handoff Exclusions

Exclude from the final ZIP:

- `.git` because its object database/refs are invalid and it is not required to run the source.
- `node_modules`, `dist`, `build`, `coverage`, `.cache`, `.turbo`, `.vite`, Playwright/test reports, logs, PID files, temp directories, and local `.env*` except `.env.example`.
- Conversation `work/` and `outputs/` directories outside the canonical project root.

Retain `workspace/reports/remediation-history` as historical evidence; it is not runtime input unless an explicit document says otherwise.

## Critical SHA-256

| Artifact | SHA-256 |
|---|---|
| Original recovery ZIP `manaratak (3).zip` | `C44D19D0C35C9A7D3A3C10AD3502339D30C2C283827F58FBE99CDBCD94EF3B39` |
| `package-lock.json` | `C20DA6FE1C965FB43C2B8EC4D29CC3F9D98FB655E989A420C94C4087863E50D5` |
| `package.json` | `203D1C376EF1F60CE1AAE679C34BE0BA34848ADA6C2210D7C45E165F6D187CFB` |
| `README.md` | `BFB94260161E71D6C12B69027D7C7B067ACF184B833675EAF2BB53E735EDA9F8` |
| Prisma schema | `33FFC508687FA39BDC471E038930EC7B4AB13229D1C5E73171081AEF3D895AEF` |
| Google Studio master register | `7918C7014044B0487D45756670E5CF473A713ADE28AC4BC73D0C390C19CB6DDB` |
| University Stage 1 Dry Run report | `3CCBF9125C565A39A49D681C1DFADEA154B9D6470B3205EF9DCC062134DEA923` |

University workbook fingerprints are recorded in the Dry Run report and were verified against the unchanged Downloads originals after copying.

## Handoff Rule

Do not start schema/data mutations merely because the source handoff is organized. Resume at the WP-1 Database Recovery Gate in Google Studio and close each owner WP gate with backup, before/after counters, referential checks, rollback evidence, and executable build/test output.
