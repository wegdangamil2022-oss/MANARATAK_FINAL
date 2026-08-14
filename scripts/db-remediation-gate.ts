import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';

const mode = process.argv[2] ?? 'plan';
const root = process.cwd();
const schemaPath = path.join(root, 'packages/infrastructure/prisma/schema.prisma');
const migrationsPath = path.join(root, 'packages/infrastructure/prisma/migrations');

const migrationInventory = () => fs.readdirSync(migrationsPath, { withFileTypes: true })
  .filter(entry => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name)).map(entry => {
    const directory = path.join(migrationsPath, entry.name);
    const migration = path.join(directory, 'migration.sql');
    const rollback = path.join(directory, 'rollback.sql');
    return {
      id: entry.name,
      migrationSha256: fs.existsSync(migration) ? sha256(migration) : null,
      rollback: fs.existsSync(rollback) ? { path: path.relative(root, rollback), sha256: sha256(rollback) } : null,
    };
  });

if (mode === 'plan' || mode === 'migration-dry-run' || mode === 'rollback-plan') {
  const migrations = migrationInventory();
  const output: Record<string, unknown> = {
    mode: mode.toUpperCase().replaceAll('-', '_'), schemaSha256: sha256(schemaPath), migrations,
    databaseConnectionAttempted: false, databaseWrites: 0,
  };
  if (mode === 'migration-dry-run') {
    output.status = 'SOURCE_VALIDATED_DATABASE_DIFF_PENDING';
    output.commandAfterRecoveryGate = 'npm run db:remediation:status, then npm run db:remediation:deploy';
  }
  if (mode === 'rollback-plan') {
    output.status = migrations.every(item => item.rollback || !item.id.includes('transactional_outbox')) ? 'REVIEW_REQUIRED' : 'ROLLBACK_ARTIFACT_MISSING';
    output.automaticRollbackExecuted = false;
  }
  console.log(JSON.stringify(output, null, 2));
  process.exit(0);
}

if (mode === 'status') {
  requireDatabaseUrl();
  runPrisma(['migrate', 'status', '--schema', schemaPath]);
  process.exit(0);
}

if (mode === 'baseline') {
  requireDatabaseUrl();
  const prisma = new PrismaClient();
  try {
    const [migrations, counts] = await Promise.all([
      prisma.$queryRawUnsafe<Array<{ migration_name: string; finished_at: Date | null; rolled_back_at: Date | null }>>(
        'SELECT migration_name, finished_at, rolled_back_at FROM "_prisma_migrations" ORDER BY started_at'
      ).catch(() => []),
      Promise.all([
        count(prisma, 'ReferenceCountry', () => prisma.referenceCountry.count()),
        count(prisma, 'AdministrativeRegion', () => prisma.administrativeRegion.count()),
        count(prisma, 'ReferenceCity', () => prisma.referenceCity.count()),
        count(prisma, 'InternationalTest', () => prisma.internationalTest.count()),
        count(prisma, 'Major', () => prisma.major.count()),
        count(prisma, 'University', () => prisma.university.count()),
        count(prisma, 'Scholarship', () => prisma.scholarship.count()),
        count(prisma, 'ImportBatch', () => prisma.importBatch.count()),
        count(prisma, 'ImportRecord', () => prisma.importRecord.count()),
        count(prisma, 'AuditRecord', () => prisma.auditRecord.count()),
      ]),
    ]);
    console.log(JSON.stringify({ mode: 'READ_ONLY_BASELINE', migrations: migrations.map(item => ({ name: item.migration_name, applied: Boolean(item.finished_at), rolledBack: Boolean(item.rolled_back_at) })), counts: Object.fromEntries(counts), databaseWrites: 0 }, null, 2));
  } catch {
    console.error(JSON.stringify({ mode: 'READ_ONLY_BASELINE', status: 'UNAVAILABLE', databaseWrites: 0 }));
    process.exitCode = 1;
  } finally { await prisma.$disconnect(); }
  process.exit();
}

if (mode === 'deploy') {
  requireDatabaseUrl();
  if (process.env.WP1_RECOVERY_GATE !== 'CLOSED' || process.env.ALLOW_DATABASE_MUTATIONS !== 'YES') {
    throw new Error('DATABASE_MUTATION_BLOCKED: WP1_RECOVERY_GATE=CLOSED and ALLOW_DATABASE_MUTATIONS=YES are required');
  }
  runPrisma(['migrate', 'deploy', '--schema', schemaPath]);
  process.exit(0);
}

throw new Error(`Unsupported mode: ${mode}`);

function sha256(filePath: string): string { return createHash('sha256').update(fs.readFileSync(filePath)).digest('hex'); }
function requireDatabaseUrl(): void { if (!process.env.DATABASE_URL || /USER:PASSWORD|localhost:5432\/database/i.test(process.env.DATABASE_URL)) throw new Error('DATABASE_URL_NOT_CONFIGURED'); }
function runPrisma(args: string[]): void {
  const cli = path.join(root, 'node_modules/prisma/build/index.js');
  const result = spawnSync(process.execPath, [cli, ...args], { cwd: root, stdio: 'inherit', env: process.env });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
async function count(prisma: PrismaClient, name: string, operation: () => Promise<number>): Promise<[string, number | 'UNAVAILABLE']> {
  try { return [name, await operation()]; } catch { return [name, 'UNAVAILABLE']; }
}
