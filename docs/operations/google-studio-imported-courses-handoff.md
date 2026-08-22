# Google Studio Handoff — Imported Courses

Google Studio is the runtime/deployment consumer after WP-IC-10. It should not invent or replace the imported-course architecture.

## Google Studio responsibilities
1. Configure environment variables using the repository `.env.example` and deployment secret manager.
2. Connect PostgreSQL using `DATABASE_URL`.
3. Connect Redis when required by the target environment.
4. Run reviewed Prisma migrations with `prisma migrate deploy`.
5. Start API and web services using the repository commands.
6. Run liveness/readiness and WP-IC-10 runtime smoke.
7. Display/use the existing Course Import Center and provider continuation workflows.

## Required production/staging configuration
At minimum validate real, non-placeholder values for:
- `JWT_SECRET`
- `SESSION_SECRET`
- `CSRF_SECRET`
- `ADMIN_AUTH_MODE=strict`
- `DATABASE_URL`
- `API_BASE_URL`
- `CORS_ORIGIN`
- `LOG_LEVEL`
- `SECURITY_CSP_ENABLED`
- `SECURITY_RATE_LIMIT_MAX`
- `SECURITY_RATE_LIMIT_WINDOW_MS`

Frontend deployment must also provide the reviewed `VITE_*` settings appropriate to the deployment topology.

## Deployment sequence
```text
Configure secrets/env
      ↓
Connect PostgreSQL
      ↓
Restore/rehearse backup where required
      ↓
prisma migrate deploy
      ↓
Start API/web
      ↓
Liveness + readiness
      ↓
WP-IC-10 runtime smoke
      ↓
Open Course Import Center
```

## Explicit non-responsibilities
Google Studio must not:
- create a new Course import schema;
- bypass Asset/Phase 06 staging;
- perform direct canonical Course seed writes;
- replace provider/source identity logic with URL identity;
- auto-publish imported courses;
- add a generic uncontrolled crawler;
- invent new migrations to make an environment-specific failure disappear.

A failed migration, smoke, or runtime-closure gate must return to repository/Codex remediation instead of being patched ad hoc in Google Studio.
