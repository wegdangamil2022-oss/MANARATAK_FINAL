import { lookup } from 'node:dns/promises';
import net from 'node:net';

const marker = 'VERCEL_PREVIEW_DB_NETWORK_PROBE';
const tcpPorts = [6543, 5432];

if (process.env.VERCEL_ENV !== 'preview') {
  console.log(JSON.stringify({ probe: marker, status: 'SKIPPED_NON_PREVIEW' }));
  process.exit(0);
}

const results = await Promise.all([
  inspectTarget(process.env.DATABASE_URL),
  inspectTarget(process.env.DIRECT_URL),
]);

console.log(JSON.stringify({
  probe: marker,
  status: 'READ_ONLY_NETWORK_DIAGNOSTIC_COMPLETE',
  databaseUrlPresent: Boolean(process.env.DATABASE_URL?.trim()),
  directUrlPresent: Boolean(process.env.DIRECT_URL?.trim()),
  databaseUrl: results[0],
  directUrl: results[1],
  prismaInvoked: false,
  sqlExecuted: false,
  databaseWrites: 0,
}, null, 2));

async function inspectTarget(value) {
  if (!value?.trim()) return unavailable('ENVIRONMENT_VARIABLE_MISSING');

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return unavailable('INVALID_DATABASE_URL');
  }

  if (!parsed.hostname) return unavailable('DATABASE_HOST_MISSING');

  const dnsStartedAt = performance.now();
  let hostResolved = false;
  let dnsError = null;
  try {
    const addresses = await lookup(parsed.hostname, { all: true, verbatim: true });
    hostResolved = addresses.length > 0;
  } catch (error) {
    dnsError = safeErrorCode(error);
  }
  const dnsLookupTimeMs = elapsed(dnsStartedAt);

  const tcp = {};
  if (hostResolved) {
    const checks = await Promise.all(tcpPorts.map((port) => testTcp(parsed.hostname, port)));
    for (const check of checks) tcp[String(check.port)] = check;
  } else {
    for (const port of tcpPorts) {
      tcp[String(port)] = { port, reachable: false, connectionTimeMs: null, error: 'DNS_UNRESOLVED' };
    }
  }

  return {
    hostResolved,
    dnsLookupTimeMs,
    dnsError,
    configuredPort: parsed.port ? Number(parsed.port) : 5432,
    tcp,
  };
}

function unavailable(error) {
  return {
    hostResolved: false,
    dnsLookupTimeMs: null,
    dnsError: error,
    configuredPort: null,
    tcp: Object.fromEntries(tcpPorts.map((port) => [String(port), {
      port,
      reachable: false,
      connectionTimeMs: null,
      error: 'TARGET_UNAVAILABLE',
    }])),
  };
}

function testTcp(host, port) {
  return new Promise((resolve) => {
    const startedAt = performance.now();
    const socket = net.createConnection({ host, port });
    let settled = false;

    const finish = (reachable, error) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({ port, reachable, connectionTimeMs: elapsed(startedAt), error });
    };

    socket.setTimeout(5000);
    socket.once('connect', () => finish(true, null));
    socket.once('timeout', () => finish(false, 'TIMEOUT'));
    socket.once('error', (error) => finish(false, safeErrorCode(error)));
  });
}

function safeErrorCode(error) {
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'NETWORK_ERROR';
  return /^[A-Z][A-Z0-9_]*$/.test(code) ? code : 'NETWORK_ERROR';
}

function elapsed(startedAt) {
  return Math.round((performance.now() - startedAt) * 100) / 100;
}
