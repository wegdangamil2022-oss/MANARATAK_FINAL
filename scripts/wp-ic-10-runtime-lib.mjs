import fs from 'node:fs';
import path from 'node:path';

export const WPIC10_BASE_SHA = '1d2d51c31caad30b25db51e977747fe172c8d175';
export const WPIC10_EXPECTED_ROWS = 3663;
export const WPIC10_HEADERS = Object.freeze([
  'No.',
  'Platform / University',
  'Course Name',
  'Direct Course URL',
  'Study Free',
  'Free Certificate',
  'Certificate Type',
  'Language',
  'Study Level',
  'Course Duration',
  'Short Course Topics (4)',
]);

export function normalizeBaseUrl(value) {
  const parsed = new URL(String(value ?? '').trim());
  const local = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '::1';
  if (parsed.username || parsed.password) throw new Error('WPIC10_BASE_URL_CREDENTIALS_FORBIDDEN');
  if (parsed.protocol !== 'https:' && !(local && parsed.protocol === 'http:')) {
    throw new Error('WPIC10_BASE_URL_HTTPS_REQUIRED');
  }
  parsed.hash = '';
  return parsed.toString().replace(/\/$/, '');
}

export function gate(name, pass, detail, extra = {}) {
  return { name, pass: Boolean(pass), detail: String(detail ?? ''), ...extra };
}

export function validateMemoryResult(input) {
  const failures = [];
  if (Number(input.rowsObserved) !== Number(input.rowsExpected)) failures.push('ROW_COUNT_MISMATCH');
  if (JSON.stringify(input.headersObserved) !== JSON.stringify(input.headersExpected)) failures.push('HEADER_MISMATCH');
  if (Number(input.rssAfterMb) > Number(input.maxRssMb)) failures.push('RSS_LIMIT_EXCEEDED');
  if (Number(input.rssDeltaMb) > Number(input.maxDeltaMb)) failures.push('RSS_DELTA_LIMIT_EXCEEDED');
  return { pass: failures.length === 0, failures };
}

export function securityAudit(repoRoot) {
  const required = {
    app: 'apps/api/src/app.ts',
    linkChecker: 'packages/infrastructure/src/courses/SafeImportedCourseLinkChecker.ts',
    coordinator: 'packages/application/src/courses/use-cases/CourseImportCoordinator.ts',
    seedPilot: 'scripts/wp-ic-08-course-seed-pilot.mjs',
    continuation: 'packages/application/src/courses/use-cases/CourseProviderContinuationUseCases.ts',
    packageJson: 'package.json',
  };
  const text = {};
  const checks = [];
  for (const [key, relative] of Object.entries(required)) {
    const full = path.join(repoRoot, relative);
    const exists = fs.existsSync(full);
    checks.push(gate(`file:${relative}`, exists, exists ? 'present' : 'missing'));
    text[key] = exists ? fs.readFileSync(full, 'utf8') : '';
  }
  if (checks.some((item) => !item.pass)) return finishSecurity(checks);

  checks.push(gate(
    'admin-import-route-protected',
    /v1Router\.use\('\/admin\/imports\/courses',[\s\S]*requireAdminPermission\('admin:imports:manage'\)/.test(text.app),
    'course import operations remain behind admin authentication/RBAC',
  ));
  checks.push(gate(
    'link-checker-https-only',
    /COURSE_LINK_HTTPS_REQUIRED/.test(text.linkChecker),
    'direct-course verifier rejects non-HTTPS targets',
  ));
  checks.push(gate(
    'link-checker-domain-allowlist',
    /domainAllowed\(/.test(text.linkChecker) && /COURSE_LINK_DOMAIN_NOT_APPROVED/.test(text.linkChecker),
    'link checks are constrained to provider-approved domains',
  ));
  checks.push(gate(
    'link-checker-private-network-block',
    /COURSE_LINK_PRIVATE_(?:ADDRESS|DNS_TARGET)_BLOCKED/.test(text.linkChecker),
    'private and unsafe network targets remain blocked',
  ));
  checks.push(gate(
    'transfer-auto-publish-forbidden',
    /COURSE_IMPORT_TRANSFER_AUTO_PUBLISH_FORBIDDEN/.test(text.coordinator) && /COURSE_IMPORT_TARGET_PUBLICATION_LOCKED/.test(text.coordinator),
    'controlled transfer cannot publish or mutate a published target',
  ));
  checks.push(gate(
    'seed-explicit-confirmation',
    /WPIC08_CONFIRM_CONTROLLED_TRANSFER/.test(text.seedPilot) && /I_UNDERSTAND_THIS_MUTATES_CANONICAL_COURSES/.test(text.seedPilot),
    '3,663-course transfer still requires explicit destructive confirmation',
  ));
  checks.push(gate(
    'registered-connectors-only',
    /defaultCourseProviderConnectorRegistry/.test(text.continuation) && /COURSE_PROVIDER_CONNECTOR_(?:IMPLEMENTATION_)?NOT_REGISTERED/.test(text.continuation),
    'continuation sync uses the registered connector registry instead of arbitrary URLs',
  ));
  checks.push(gate(
    'provider-drift-halts-staging',
    /CourseProviderDriftError/.test(text.continuation) && /COURSE_PROVIDER_SOURCE_DRIFT_BLOCKED/.test(text.continuation),
    'source drift remains a blocking condition',
  ));
  checks.push(gate(
    'rate-safe-link-health',
    /MAX_LINK_HEALTH_JOB_SIZE\s*=\s*10/.test(text.continuation) && /MIN_LINK_HEALTH_DELAY_MS\s*=\s*750/.test(text.continuation),
    'bulk link verification remains bounded and rate-safe',
  ));

  let pkg = {};
  try { pkg = JSON.parse(text.packageJson); } catch {}
  const scripts = pkg.scripts ?? {};
  checks.push(gate('node-engine', String(pkg.engines?.node ?? '').includes('>=20'), 'Node 20+ is declared'));
  for (const name of ['typecheck', 'lint', 'build', 'test:unit', 'test:database', 'e2e']) {
    checks.push(gate(`script:${name}`, typeof scripts[name] === 'string' && scripts[name].length > 0, `repository script ${name}`));
  }

  return finishSecurity(checks);
}

function finishSecurity(checks) {
  const failed = checks.filter((item) => !item.pass);
  return { pass: failed.length === 0, checks, failed: failed.map((item) => item.name) };
}

export function buildFinalReport(gateResults, { requireAll = true } = {}) {
  const requiredNames = ['ciClosure', 'security', 'memory', 'database', 'backupRestore', 'browserE2E'];
  const gates = requiredNames.map((name) => {
    const value = gateResults[name];
    if (!value) return { name, pass: !requireAll, state: 'NOT_RUN', detail: 'result artifact missing' };
    return {
      name,
      pass: value.pass === true,
      state: value.pass === true ? 'PASS' : 'FAIL',
      detail: value.detail ?? value.result ?? '',
      source: value.source ?? null,
    };
  });
  const requiredPass = gates.every((item) => item.pass);
  const smokeValue = gateResults.runtimeSmoke;
  const runtimeSmoke = !smokeValue
    ? { name: 'runtimeSmoke', pass: null, state: 'NOT_RUN', detail: 'deployment smoke runs after Google Studio starts the services' }
    : { name: 'runtimeSmoke', pass: smokeValue.pass === true, state: smokeValue.pass === true ? 'PASS' : 'FAIL', detail: smokeValue.detail ?? smokeValue.result ?? '' };
  gates.push(runtimeSmoke);

  const pass = requiredPass && runtimeSmoke.pass !== false;
  const runtimeClosureState = !requiredPass
    ? 'BLOCKED'
    : runtimeSmoke.pass === true
      ? 'DEPLOYED_RUNTIME_VERIFIED'
      : runtimeSmoke.pass === false
        ? 'BLOCKED_DEPLOYMENT_SMOKE'
        : 'CLOSED_READY_FOR_GOOGLE_STUDIO_HANDOFF';
  return {
    version: 1,
    wp: 'WP-IC-10',
    baseSha: WPIC10_BASE_SHA,
    generatedAt: new Date().toISOString(),
    pass,
    runtimeClosureState,
    gates,
  };
}

export function renderFinalMarkdown(report) {
  const lines = [
    '# WP-IC-10 Final Implementation Status',
    '',
    `- Base: \`${report.baseSha}\``,
    `- Generated: ${report.generatedAt}`,
    `- Result: **${report.runtimeClosureState}**`,
    '',
    '| Gate | State | Detail |',
    '|---|---|---|',
  ];
  for (const item of report.gates) {
    lines.push(`| ${item.name} | ${item.state} | ${String(item.detail ?? '').replace(/\|/g, '\\|')} |`);
  }
  lines.push('', report.runtimeClosureState === 'CLOSED_READY_FOR_GOOGLE_STUDIO_HANDOFF'
    ? 'Google Studio may proceed with environment configuration, PostgreSQL connection, reviewed migrations, service startup, and deployment smoke verification only.'
    : report.runtimeClosureState === 'DEPLOYED_RUNTIME_VERIFIED'
      ? 'Deployment smoke passed. Imported-course runtime closure is verified.'
      : 'Do not treat imported courses as runtime-closed until every required gate passes.');
  return `${lines.join('\n')}\n`;
}

export function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
