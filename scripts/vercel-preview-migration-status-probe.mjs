import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const marker = 'VERCEL_PREVIEW_MIGRATION_STATUS_PROBE';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schemaPath = path.join(root, 'packages/infrastructure/prisma/schema.prisma');
const migrationsPath = path.join(root, 'packages/infrastructure/prisma/migrations');

if (process.env.VERCEL_ENV !== 'preview') {
  console.log(JSON.stringify({ probe: marker, status: 'SKIPPED_NON_PREVIEW' }));
  process.exit(0);
}

const sourceMigrations = fs.readdirSync(migrationsPath, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(migrationsPath, entry.name, 'migration.sql')))
  .map((entry) => entry.name)
  .sort((left, right) => left.localeCompare(right));

const databaseUrlPresent = Boolean(process.env.DATABASE_URL?.trim());
const directUrlPresent = Boolean(process.env.DIRECT_URL?.trim());

if (!databaseUrlPresent || !directUrlPresent) {
  console.log(JSON.stringify({
    probe: marker,
    status: 'ENVIRONMENT_VARIABLES_MISSING',
    databaseUrlPresent,
    directUrlPresent,
    sourceMigrationCount: sourceMigrations.length,
    sourceMigrations,
    connectionSucceeded: false,
    appliedMigrations: [],
    pendingMigrations: [],
    prismaMigrationStatusExitCode: null,
    error: 'Required Preview database environment variables are unavailable.',
    databaseWrites: 0,
  }, null, 2));
  process.exit(0);
}

const prismaCli = path.join(root, 'node_modules/prisma/build/index.js');
const result = spawnSync(
  process.execPath,
  [prismaCli, 'migrate', 'status', '--schema', schemaPath],
  {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' },
    maxBuffer: 10 * 1024 * 1024,
  },
);

const rawOutput = [result.stdout, result.stderr, result.error?.message].filter(Boolean).join('\n');
const safeOutput = sanitize(rawOutput);
const prismaExitCode = result.status ?? (result.error ? 1 : null);
const connectionSucceeded = detectsSuccessfulConnection(safeOutput);
const pendingMigrations = connectionSucceeded ? findPendingMigrations(safeOutput, sourceMigrations) : [];
const appliedMigrations = connectionSucceeded
  ? sourceMigrations.filter((migration) => !pendingMigrations.includes(migration))
  : [];

console.log(JSON.stringify({
  probe: marker,
  status: connectionSucceeded ? 'CONNECTED_READ_ONLY' : 'CONNECTION_FAILED',
  databaseUrlPresent,
  directUrlPresent,
  sourceMigrationCount: sourceMigrations.length,
  sourceMigrations,
  connectionSucceeded,
  appliedMigrations,
  pendingMigrations,
  prismaMigrationStatusExitCode: prismaExitCode,
  sanitizedPrismaOutput: safeOutput || null,
  databaseWrites: 0,
}, null, 2));

function detectsSuccessfulConnection(output) {
  return /\bmigrations? found in prisma\/migrations\b/i.test(output)
    || /database schema is up to date/i.test(output)
    || /have not yet been applied/i.test(output)
    || /migration history/i.test(output);
}

function findPendingMigrations(output, migrations) {
  const pendingSection = output.match(/following migrations? have not yet been applied:\s*([\s\S]*?)(?:\n\s*(?:to apply|run prisma|your local|$))/i)?.[1] ?? '';
  return migrations.filter((migration) => pendingSection.includes(migration));
}

function sanitize(value) {
  return value
    .replace(/(?:postgres(?:ql)?|prisma\+postgres):\/\/[^\s'"`]+/gi, '[REDACTED_DATABASE_URL]')
    .replace(/\b(?:DATABASE_URL|DIRECT_URL|POSTGRES_URL|POSTGRES_PRISMA_URL|POSTGRES_URL_NON_POOLING)\s*[=:]\s*[^\s,;]+/gi, '$1=[REDACTED]')
    .replace(/\b[^\s:@/]+:[^\s@/]+@[^\s/]+/g, '[REDACTED_DATABASE_CREDENTIALS]')
    .replace(/\bat\s+"[^"]+"/gi, 'at "[REDACTED_DATABASE_ENDPOINT]"')
    .replace(/\bpassword\s*[=:]\s*[^\s,;]+/gi, 'password=[REDACTED]')
    .trim();
}
