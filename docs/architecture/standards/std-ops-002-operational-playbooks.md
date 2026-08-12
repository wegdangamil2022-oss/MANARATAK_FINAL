# Standard: Operational Playbooks (STD-OPS-002)

## 1. Overview

Baseline SRE runbooks for MANARATAK 2.0 infrastructure deployment and operations.

## 2. API Startup/Shutdown

- Graceful shutdown intercepts SIGTERM and flushes BullMQ queues before terminating Express servers.
- Health checks must pass before traffic is routed to the new instance.

## 3. Database Availability Modes

- PostgreSQL runs in primary/replica configuration.
- Read-heavy queries are directed to read replicas.

## 4. Background Jobs

- BullMQ workers operate independently.
- Dead-letter queues must be monitored via automated alerting.

## 5. Monitoring & Health Checks

- `/health` endpoint exposes readiness and liveness probes.
- OpenTelemetry traces correlate API requests to background job execution.

## 6. Incident Response & Rollback

- Immutable container deployments allow instant rollback to previous SHAs.
- Database migrations use forward-only scripts; rollback requires a compensating migration.

## 7. Local Development vs Production Behavior

- Local development leverages Docker Compose for Postgres and Redis.
- Production utilizes managed cloud services (e.g., Cloud SQL, Cloud Memorystore).

## 8. Status

Approved.
