# API Runtime Resource Lifecycle

**Authority:** active W1/W2 runtime lifecycle contract after `MNT-AUD-0040` remediation.

## Ownership

Each API process owns exactly one `RuntimeResourceRegistry`. The registry is the only active API source allowed to construct:

- the canonical Prisma client/pool used by repositories, database health and migration-history probes;
- the canonical general-purpose Redis command client used by distributed rate limiting, Redis health, Student Workspace delivery cache and CMS delivery cache.

A feature module must not construct a Prisma or Redis client directly. A future transport that technically requires a dedicated connection (for example a blocking BullMQ worker connection) must be explicitly registered in this lifecycle and documented as a justified separate resource.

## Startup

1. Normalize and validate `AppConfig`.
2. Construct logging.
3. Construct the process `RuntimeResourceRegistry`.
4. Resolve shared Redis for production distributed security controls.
5. Register DI repositories/caches against the same registry.
6. Connect/check the registry-owned Prisma client and Redis client.
7. Publish readiness only after required indicators are healthy.

## Shutdown

`SIGTERM` and `SIGINT` use one idempotent shutdown promise:

1. `runtimeResources.beginShutdown()` immediately makes the non-optional `runtime-lifecycle` readiness indicator report DOWN.
2. Stop recurring certificate worker scheduling.
3. Stop accepting new HTTP work (`closeIdleConnections()` + `server.close()`) while active requests drain.
4. Await any in-flight certificate completion worker iteration inside the same bounded drain window.
5. After the bounded drain, close Redis with `quit()` and Prisma with `$disconnect()` through `runtimeResources.closeAll()`.
6. A 15-second terminal timeout force-closes remaining HTTP connections and proceeds to resource cleanup instead of leaving shutdown blocked indefinitely.

Repeated signals/callbacks do not close shared infrastructure more than once.
