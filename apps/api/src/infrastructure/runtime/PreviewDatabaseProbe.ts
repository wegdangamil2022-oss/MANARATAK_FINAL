import { PrismaClient } from '@prisma/client';

type Environment = Readonly<Record<string, string | undefined>>;

export function isPreviewDatabaseProbeEnabled(env: Environment): boolean {
  return env.VERCEL === '1' && env.VERCEL_ENV === 'preview'
    && env.MANARATAK_PREVIEW_DATABASE_PROBE === 'true';
}

function classify(error: unknown): string {
  const code = typeof error === 'object' && error !== null
    ? ('code' in error ? error.code : 'errorCode' in error ? error.errorCode : undefined)
    : undefined;
  switch (code) {
    case 'P1000': return 'DATABASE_AUTHENTICATION_FAILED';
    case 'P1001': return 'DATABASE_UNREACHABLE';
    case 'P1002': case 'P1008': case 'P2024': return 'DATABASE_TIMEOUT';
    case 'P1011': return 'DATABASE_TLS_ERROR';
    case 'P1013': return 'DATABASE_URL_INVALID';
    case 'P1017': return 'DATABASE_CONNECTION_CLOSED';
    default: return 'DATABASE_CONNECTION_OR_READ_FAILED';
  }
}

/** Independent of application DI. This probe's only SQL is the literal SELECT 1. */
export async function probePreviewDatabase(env: Environment = process.env) {
  if (!isPreviewDatabaseProbeEnabled(env)) {
    return { status: 'DOWN' as const, error: 'PREVIEW_DATABASE_PROBE_DISABLED' };
  }
  if (!env.DATABASE_URL?.trim()) return { status: 'DOWN' as const, error: 'DATABASE_URL_MISSING' };
  let url: URL;
  try {
    url = new URL(env.DATABASE_URL);
    if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error();
  } catch {
    return { status: 'DOWN' as const, error: 'DATABASE_URL_INVALID' };
  }
  // Bound this isolated probe's connection/query wait without changing stored secrets.
  url.searchParams.set('connect_timeout', '5');
  url.searchParams.set('socket_timeout', '5');
  url.searchParams.set('pool_timeout', '5');
  url.searchParams.set('connection_limit', '1');
  const started = Date.now();
  let client: PrismaClient | undefined;
  try {
    client = new PrismaClient({ datasources: { db: { url: url.toString() } } });
    await client.$connect();
    await client.$queryRaw`SELECT 1`;
    return { status: 'UP' as const, latencyMs: Date.now() - started };
  } catch (error: unknown) {
    return { status: 'DOWN' as const, error: classify(error), latencyMs: Date.now() - started };
  } finally {
    try { await client?.$disconnect(); } catch { /* Never expose connection details. */ }
  }
}
