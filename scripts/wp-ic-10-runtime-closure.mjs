#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import * as XLSX from 'xlsx';
import {
  WPIC10_EXPECTED_ROWS,
  WPIC10_HEADERS,
  buildFinalReport,
  normalizeBaseUrl,
  readJsonIfExists,
  renderFinalMarkdown,
  securityAudit,
  validateMemoryResult,
} from './wp-ic-10-runtime-lib.mjs';

const { command, args } = parse(process.argv.slice(2));
const repoRoot = path.resolve(String(args['repo-root'] ?? process.cwd()));
const outputDir = path.resolve(String(args['output-dir'] ?? 'wp-ic-10-results'));
fs.mkdirSync(outputDir, { recursive: true });

if (command === 'security') {
  const audit = securityAudit(repoRoot);
  const result = { version: 1, kind: 'security', generatedAt: new Date().toISOString(), ...audit };
  write('SECURITY_AUDIT.json', result);
  console.log(JSON.stringify(result, null, 2));
  process.exit(audit.pass ? 0 : 2);
}

if (command === 'memory') {
  const rowsExpected = positiveInt(args.rows, WPIC10_EXPECTED_ROWS);
  const maxRssMb = positiveNumber(args['max-rss-mb'], 1024);
  const maxDeltaMb = positiveNumber(args['max-delta-mb'], 512);
  const before = process.memoryUsage();
  const workbookPath = args.workbook ? path.resolve(String(args.workbook)) : null;
  let bytes;
  let source;
  if (workbookPath) {
    if (!fs.existsSync(workbookPath)) fatal(`Workbook not found: ${workbookPath}`);
    bytes = fs.readFileSync(workbookPath);
    source = `workbook:${path.basename(workbookPath)}`;
  } else {
    const matrix = [WPIC10_HEADERS, ...Array.from({ length: rowsExpected }, (_, index) => [
      index + 1,
      'WP-IC-10 Synthetic Provider',
      `Synthetic Course ${index + 1}`,
      `https://example.org/courses/${index + 1}`,
      'Yes',
      index % 2 === 0 ? 'Yes' : 'No',
      index % 2 === 0 ? 'Certificate' : 'None',
      'English',
      'Not officially specified',
      '1 hour',
      'Runtime; Memory; Import; Verification',
    ])];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(matrix), 'Courses');
    bytes = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx', compression: true });
    source = 'synthetic-3663-shape';
  }

  const parsed = XLSX.read(bytes, { type: 'buffer', dense: true });
  const sheet = parsed.Sheets.Courses;
  if (!sheet) fatal('Courses sheet missing in memory test workbook.');
  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false, blankrows: false });
  const headersObserved = (matrix[0] ?? []).map((value) => String(value));
  const rowsObserved = matrix.slice(1).filter((row) => row.some((value) => String(value ?? '').trim() !== '')).length;
  const after = process.memoryUsage();
  const toMb = (value) => Math.round((value / 1024 / 1024) * 100) / 100;
  const memory = {
    version: 1,
    kind: 'large-file-memory',
    generatedAt: new Date().toISOString(),
    source,
    rowsExpected,
    rowsObserved,
    headersExpected: WPIC10_HEADERS,
    headersObserved,
    bytes: bytes.length,
    rssBeforeMb: toMb(before.rss),
    rssAfterMb: toMb(after.rss),
    rssDeltaMb: toMb(Math.max(0, after.rss - before.rss)),
    heapUsedBeforeMb: toMb(before.heapUsed),
    heapUsedAfterMb: toMb(after.heapUsed),
    maxRssMb,
    maxDeltaMb,
  };
  Object.assign(memory, validateMemoryResult(memory));
  write('LARGE_FILE_MEMORY.json', memory);
  console.log(JSON.stringify(memory, null, 2));
  process.exit(memory.pass ? 0 : 2);
}

if (command === 'smoke') {
  const baseUrl = normalizeBaseUrl(args['base-url'] ?? process.env.WPIC10_BASE_URL ?? '');
  const authorization = String(args.authorization ?? process.env.WPIC10_AUTHORIZATION ?? '').trim();
  const checks = [];
  checks.push(await requestCheck('liveness', `${baseUrl}/api/v1/monitoring/health/liveness`, [200], (body) => body?.status === 'UP'));
  checks.push(await requestCheck('readiness', `${baseUrl}/api/v1/monitoring/health/readiness`, [200, 503], (body) => ['UP', 'DEGRADED', 'DOWN'].includes(body?.status)));
  checks.push(await requestCheck('csrf-read', `${baseUrl}/api/v1/auth/csrf-token`, [200], (body) => body && typeof body === 'object'));
  checks.push(await requestCheck('admin-import-auth-boundary', `${baseUrl}/api/v1/admin/imports/courses/overview`, [401], () => true));
  checks.push(await requestCheck('continuation-mutation-auth-boundary', `${baseUrl}/api/v1/admin/imports/courses/providers/wp-ic-10-smoke/connector/run`, [401, 403, 423], () => true, { method: 'POST', body: '{}' }));
  if (authorization) {
    checks.push(await requestCheck('authenticated-import-overview', `${baseUrl}/api/v1/admin/imports/courses/overview`, [200], (body) => body && typeof body === 'object', { headers: { Authorization: authorization } }));
    checks.push(await requestCheck('authenticated-provider-registry', `${baseUrl}/api/v1/admin/imports/courses/providers`, [200], (body) => Array.isArray(body?.data), { headers: { Authorization: authorization } }));
  }
  const failed = checks.filter((item) => !item.pass);
  const result = {
    version: 1,
    kind: 'runtime-smoke',
    generatedAt: new Date().toISOString(),
    baseUrl,
    authenticatedChecksEnabled: Boolean(authorization),
    pass: failed.length === 0,
    checks,
    failed: failed.map((item) => item.name),
  };
  write('RUNTIME_SMOKE.json', result);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.pass ? 0 : 2);
}

if (command === 'finalize') {
  const resultsDir = path.resolve(String(args['results-dir'] ?? outputDir));
  const gateResults = {
    ciClosure: readJsonIfExists(path.join(resultsDir, 'CI_CLOSURE.json')),
    security: readJsonIfExists(path.join(resultsDir, 'SECURITY_AUDIT.json')),
    memory: readJsonIfExists(path.join(resultsDir, 'LARGE_FILE_MEMORY.json')),
    database: readJsonIfExists(path.join(resultsDir, 'DATABASE_REHEARSAL.json')),
    backupRestore: readJsonIfExists(path.join(resultsDir, 'BACKUP_RESTORE_REHEARSAL.json')),
    browserE2E: readJsonIfExists(path.join(resultsDir, 'BROWSER_E2E.json')),
    runtimeSmoke: readJsonIfExists(path.join(resultsDir, 'RUNTIME_SMOKE.json')),
  };
  const report = buildFinalReport(gateResults, { requireAll: args['allow-missing'] !== true });
  fs.writeFileSync(path.join(resultsDir, 'FINAL_IMPLEMENTATION_STATUS.json'), `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(path.join(resultsDir, 'FINAL_IMPLEMENTATION_STATUS.md'), renderFinalMarkdown(report));
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.pass ? 0 : 2);
}

fatal('Usage: wp-ic-10-runtime-closure.mjs <security|memory|smoke|finalize> [options]');

async function requestCheck(name, url, allowedStatuses, bodyPredicate, options = {}) {
  try {
    const response = await fetch(url, {
      method: options.method ?? 'GET',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(options.headers ?? {}) },
      ...(options.body ? { body: options.body } : {}),
      redirect: 'error',
    });
    const text = await response.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = text; }
    const pass = allowedStatuses.includes(response.status) && bodyPredicate(body);
    return { name, pass, status: response.status, detail: pass ? 'PASS' : `unexpected status/body`, body: pass ? undefined : body };
  } catch (error) {
    return { name, pass: false, status: null, detail: error instanceof Error ? error.message : String(error) };
  }
}

function write(name, value) {
  fs.writeFileSync(path.join(outputDir, name), `${JSON.stringify(value, null, 2)}\n`);
}

function parse(values) {
  const command = values[0] ?? '';
  const args = {};
  for (let index = 1; index < values.length; index++) {
    const token = values[index];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = values[index + 1];
    if (!next || next.startsWith('--')) args[key] = true;
    else { args[key] = next; index += 1; }
  }
  return { command, args };
}
function positiveInt(value, fallback) { const n = Number.parseInt(String(value ?? ''), 10); return Number.isInteger(n) && n > 0 ? n : fallback; }
function positiveNumber(value, fallback) { const n = Number(value); return Number.isFinite(n) && n > 0 ? n : fallback; }
function fatal(message) { console.error(message); process.exit(1); }
