import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import net from 'node:net';
import tls from 'node:tls';
import http from 'node:http';
import { syncBuiltinESMExports } from 'node:module';
import { once } from 'node:events';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Do not inherit deployment credentials or load dotenv in this native test.
for (const key of Object.keys(process.env)) {
  if (!['PATH', 'SystemRoot', 'TEMP', 'TMP', 'COMSPEC', 'PATHEXT'].includes(key)) delete process.env[key];
}
Object.assign(process.env, { NODE_ENV: 'development', VERCEL: '1' });
const originalConnect = net.Socket.prototype.connect;
net.Socket.prototype.connect = function (...args) {
  const options = Array.isArray(args[0]) ? args[0][0] : args[0];
  if (typeof options !== 'object' || !options || options.host !== '127.0.0.1') {
    throw new Error('EXTERNAL_NETWORK_FORBIDDEN');
  }
  return originalConnect.apply(this, args);
};
tls.connect = () => { throw new Error('TLS_FORBIDDEN'); };
globalThis.fetch = () => { throw new Error('FETCH_FORBIDDEN'); };
globalThis.setInterval = () => { throw new Error('PERIODIC_WORKER_FORBIDDEN'); };
const originalListen = net.Server.prototype.listen;
net.Server.prototype.listen = () => { throw new Error('IMPORT_MUST_NOT_LISTEN'); };
syncBuiltinESMExports();
const signals = ['SIGINT', 'SIGTERM'].map((signal) => process.listenerCount(signal));
const entry = await import(pathToFileURL(path.join(root, 'apps/api/dist/app.js')).href);
const { bootstrapDiagnostics } = await import(pathToFileURL(path.join(root, 'apps/api/dist/infrastructure/runtime/BootstrapDiagnostics.js')).href);
const privateValue = 'private-test-credential-never-log';
const diagnostic = bootstrapDiagnostics(new Error('Configuration validation failed:\nREDIS_URL: invalid rediss://user:' + privateValue + '@host.invalid\nCSRF_SECRET: invalid ' + privateValue));
assert.deepEqual(diagnostic.configurationFields, ['REDIS_URL', 'CSRF_SECRET']);
assert.equal(diagnostic.category, 'CONFIGURATION_VALIDATION_FAILED');
assert.ok(!JSON.stringify(diagnostic).includes(privateValue));
assert.ok(!JSON.stringify(diagnostic).includes('host.invalid'));
assert.equal(bootstrapDiagnostics(new Error(privateValue)).category, 'API_BOOTSTRAP_FAILED');
assert.equal(typeof entry.default, 'function', 'Vercel requires a callable default export');
assert.deepEqual(['SIGINT', 'SIGTERM'].map((s) => process.listenerCount(s)), signals);
for (const name of ['config', 'core', 'domain', 'shared', 'application', 'infrastructure']) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'packages', name, 'package.json'), 'utf8'));
  assert.equal(manifest.main, 'dist/index.js');
  const artifact = path.join(root, 'packages', name, manifest.main);
  assert.ok(fs.existsSync(artifact));
  await import(pathToFileURL(artifact).href);
}
const { PrismaClient } = await import('@prisma/client');
assert.equal(typeof PrismaClient, 'function'); // No client/query/connect created.
const { OtlpHttpMonitoringProvider } = await import(pathToFileURL(path.join(root, 'packages/infrastructure/dist/index.js')).href);
const telemetry = new OtlpHttpMonitoringProvider({ endpoint: 'https://telemetry.invalid', serviceName: 'test', environment: 'test', periodicExport: false });
await telemetry.shutdown(); // No interval created and no pending telemetry/network.
const { createVercelHttpHandler } = await import(pathToFileURL(path.join(root, 'apps/api/dist/infrastructure/runtime/VercelHttpHandler.js')).href);
const databaseClient = { $queryRaw: async () => { throw new Error('TEST_DATABASE_UNAVAILABLE'); }, $disconnect: async () => {} };
const app = await entry.createApiApp({ env: { NODE_ENV: 'development', VERCEL: '1' }, connectExternalServices: false, databaseClient });
assert.equal(typeof app, 'function');
net.Server.prototype.listen = originalListen;

async function request(handler, url) {
  const server = http.createServer(handler);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    return await new Promise((resolve, reject) => {
      http.get({ host: '127.0.0.1', port: server.address().port, path: url }, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => resolve({ status: res.statusCode, body }));
      }).on('error', reject);
    });
  } finally { await new Promise((resolve) => server.close(resolve)); }
}
assert.equal((await request(entry.default, '/api/v1/monitoring/health/liveness')).status, 200);
assert.equal((await request(entry.default, '/')).status, 404);
let starts = 0;
const shared = createVercelHttpHandler(async () => { starts++; return app; });
await Promise.all([request(shared, '/'), request(shared, '/')]);
assert.equal(starts, 1, 'Concurrent requests must share bootstrap');
// A real factory failure is a handled response, never a function invocation crash.
const blocked = createVercelHttpHandler(() => entry.createApiApp({ env: { NODE_ENV: 'production', VERCEL: '1' }, connectExternalServices: false }));
const result = await request(blocked, '/');
assert.equal(result.status, 503);
assert.ok(!result.body.includes('postgres'));
assert.equal((await request(blocked, '/api/v1/monitoring/health/liveness')).status, 200);
assert.equal((await request(blocked, '/api/v1/monitoring/health/readiness')).status, 503);
await app.locals.runtimeResourceRegistry.closeAll();
console.log('PASS: native entrypoint/export, real Express bootstrap/HTTP, workspace/Prisma loading, fail-closed bootstrap; no SQL or external connections');
