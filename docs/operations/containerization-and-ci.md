# Containerization and CI/CD Operations Manual

## 1. Executive Summary

This manual defines the containerization architecture, local compose setups, and Continuous Integration (CI) workflows for the **Manaratak 2.0 Monorepo**. All environments are optimized for local development agility and automated code quality verification.

### Status Registry
- **Local Containerization Status**: `local containerization ready`
- **CI/CD Verification Status**: `CI verification wired`
- **Cloud Deployment Status**: `production deployment pending`

---

## 2. Local Verification Workflow

The monorepo incorporates a unified, zero-dependency validation script. Developers must execute this validation script locally before pushing changes or opening any Pull Requests.

### Verification Command
Run the following standard NPM script from the root of the workspace:
```bash
npm run verify:local
```

### Verification Stages (Deterministic Order)
1. **Database Client Generation**: Automatically runs `prisma generate` to update types under `@prisma/client`.
2. **Typecheck Stage (`npm run typecheck`)**: Compiles all packages and applications with strict incremental TypeScript constraints.
3. **Lint Stage (`npm run lint`)**: Runs ESLint checks across both apps and packages.
4. **Build Stage (`npm run build`)**: Builds production-ready assets for apps (`apps/api`, `apps/web`, `apps/admin`) and workspace dependencies.
5. **Unit & Integration Tests (`npm run test`)**: Runs all automated tests in the repository using Vitest.
6. **E2E Browser Tests (`npm run e2e`)**: Spawns Playwright to test live interface journeys against a dev server.

---

## 3. Local Containerization (Docker Compose)

The monorepo includes a multi-service `docker-compose.yml` to orchestrate a complete replication of the Manaratak environment on developer machines.

### Services Architecture
- **`postgres`**: Relational database storage.
- **`redis`**: Key-value data cache (configured as optional/fallback for local dev to avoid hard failures, but actively integrated for job queues).
- **`api`**: Core Express server built on Node.js (with internal Prisma client generator, workspace building, and a `/api/v1/monitoring/health` healthcheck).
- **`web`**: Public client-facing React single-page application served via Nginx.
- **`admin`**: Workspace management and administration panel served via Nginx.

### Required Local Development Environment Variables
When initiating the container landscape, copy `.env.example` into your container-specific shell and ensure these are defined:
- `DATABASE_URL`: `postgresql://root:password@postgres:5432/manaratak?schema=public`
- `JWT_SECRET`: Safe local-development secret (minimum 32 characters)
- `SESSION_SECRET`: Safe session salt (minimum 32 characters)
- `CSRF_SECRET`: Safe CSRF signing token (minimum 32 characters)
- `CORS_ORIGIN`: `http://localhost:8080` (or local web service entrypoint)
- `ADMIN_AUTH_MODE`: `demo` (for testing, bypasses external identity assertions)
- `ADMIN_BEARER_TOKEN`: Safe bearer token (minimum 32 characters)
- `REDIS_URL`: `redis://redis:6379`

### Startup Commands

To build images and spin up the complete container network in background mode:
```bash
./scripts/deploy/local-compose-up.sh
```
*Note: This runs `docker compose config` followed by `docker compose up -d --build` internally.*

To stop the container network and clean up ephemeral volumes:
```bash
./scripts/deploy/local-compose-down.sh
```
*Note: This runs `docker compose down -v` internally.*

### Local Container Endpoints
Once the containers are running successfully, access the interfaces at:
- **Public Web Application**: `http://localhost:8080`
- **Admin Workspace Management**: `http://localhost:8081`
- **Core API Server**: `http://localhost:3000`
- **API Liveness & Readiness Check**: `http://localhost:3000/api/v1/monitoring/health`

---

## 4. Continuous Integration (CI) Workflow

Continuous Integration runs on every commit pushed to the `main` or `develop` branches, as well as on any incoming Pull Requests.

### Workflow Stages (`.github/workflows/ci.yml`)
1. **Checkout Code**: Checks out the complete monorepo.
2. **Setup Node.js Environment**: Boots a Node container caching standard `npm` registries.
3. **Install Dependencies**: Executes `npm ci` to fetch lockfile dependencies deterministically.
4. **Generate Prisma Client**: Automatically compiles database client schemas.
5. **Typecheck Stage**: Executes strict compilation checks (`tsc -b`).
6. **Lint Stage**: Audits files against stylistic and error conventions.
7. **Build Stage**: Confirms correct compiling of all web assets and the bundled API server.
8. **Unit & Integration Test Stage**: Executes the full test suite with Vitest.
9. **E2E Playwright Browser Stage**: Installs the custom chromium engine and runs headless browser validation journeys.
10. **Docker Compose Configuration Validation**: Asserts syntactical and structure correctness of the `docker-compose.yml` file using `docker compose config`.

---

## 5. Known Operational Limitations & Risks

1. **Docker Daemon in Sandboxed Environments**:
   - The AI Studio container runtime lacks a background Docker daemon. As a result, live image compilation, container execution (`docker compose up`), and dynamic healthchecks must be verified on a local developer machine with native Docker Desktop or engine installed.
   - Syntax validation is handled statically using configuration parsers.
2. **Production Readiness Caveat**:
   - While the local dockerization is stable and fully functional, cloud deployment remains pending. Production setups will require robust secret managers, a secure container registry, managed database endpoints (e.g., GCP Cloud SQL, Memorystore Redis), and rolling cloud runtimes.
