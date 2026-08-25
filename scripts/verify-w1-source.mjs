import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const checks = [];
const check = (name, condition) => checks.push({ name, ok: Boolean(condition) });

const evaluator = read('packages/infrastructure/src/authorization/DefaultPolicyEvaluator.ts');
const authorizationEvaluator = read('packages/domain/src/authorization/services/AuthorizationEvaluatorService.ts');
check('P5-AUTH-001 evaluator no longer unconditional allow', !/evaluate\([^)]*\)[\s\S]{0,200}return AccessDecision\.granted\('Policy rule satisfied'\)/.test(evaluator));
check('P5-AUTH-001 supports TIME policy', evaluator.includes("case 'TIME':"));
check('P5-AUTH-001 supports IP policy', evaluator.includes("case 'IP':"));
check('P5-AUTH-001 unknown rules fail closed', evaluator.includes('Unsupported policy rule type'));
check('P5-AUTH-001 dangling policy references fail closed', authorizationEvaluator.includes('Referenced policy not found'));

const middleware = read('apps/api/src/presentation/security/SecurityMiddlewareFactory.ts');
check('P5-AUTH-001 request IP enters policy context', middleware.includes("ip: req.ip || req.socket?.remoteAddress || undefined"));

const app = read('apps/api/src/app.ts');
for (const route of ['/authorization', '/settings', '/files', '/notifications', '/cache', '/background-jobs', '/workflows', '/api-services', '/shared-components', '/enterprise-events']) {
  const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  check(`P5-SEC-002 ${route} protected`, new RegExp(`v1Router\\.use\\('${escaped}', \\.\\.\\.protectControlPlane`).test(app));
}
check('P5-SEC-002 control-plane mutation audit enabled', app.includes("new MutationAuditMiddleware(auditRecordRepository, 'CONTROL_PLANE').generate()"));

for (const dir of ['packages/application/src', 'packages/infrastructure/src']) {
  const stack = [path.join(root, dir)];
  let directEnv = false;
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (/\.(ts|tsx|js|mjs)$/.test(entry.name) && /process\.env|import\.meta\.env/.test(fs.readFileSync(full, 'utf8'))) directEnv = true;
    }
  }
  check(`P3-CONFIG-001 no direct env reads under ${dir}`, !directEnv);
}

const settingsService = read('packages/domain/src/settings/services/ConfigurationResolutionService.ts');
const container = read('apps/api/src/infrastructure/di/container.ts');
check('P5-SET-003 settings repositories are required', !settingsService.includes('definitionRepo?:') && !settingsService.includes('assignmentRepo?:'));
check('P5-SET-003 explicit factory wiring', container.includes('new ConfigurationResolutionService(settingDefinitionRepo, settingAssignmentRepo)'));

check('P3-AUTH-001 Application JWT implementation removed', !exists('packages/application/src/auth/JwtTokenProvider.ts'));
check('P3-AUTH-001 Infrastructure JWT implementation exists', exists('packages/infrastructure/src/auth/JwtTokenProvider.ts'));
check('P3-AUTH-001 API imports JWT from Infrastructure', /EnvironmentAIAsyncPayloadProtector, JwtTokenProvider\} from '@manaratak\/infrastructure'/.test(container));

const redisLimiter = read('packages/infrastructure/src/security/RedisRateLimiter.ts');
check('P4-SEC-001 distributed limiter is production capable', redisLimiter.includes('isProductionReady = true') && redisLimiter.includes("kind = 'real'"));
check('P4-SEC-001 Redis atomic script present', redisLimiter.includes("redis.call('INCR'") && redisLimiter.includes("redis.call('PEXPIRE'"));
check('P4-SEC-001 app selects runtime limiter factory', app.includes('createRateLimiterForRuntime(currentEnv, logger)'));

check('P6-DI-001 safe HTTP transport uses explicit factory', container.includes('safeSourceHttpTransport: asFunction(() => new NodeSafeSourceHttpTransport()).singleton()'));
check('P6-DI-001 raw snapshot store uses explicit factory', container.includes("importRawSnapshotStore: asFunction(() => createImportRawSnapshotStoreForRuntime(effectiveEnvironment, readConfig<string>('IMPORT_RAW_SNAPSHOT_DIR'))).singleton()"));
check('P6-DI-001 acquisition limiter uses explicit factory', container.includes('sourceAcquisitionLimiter: asFunction(() => new SourceAcquisitionLimiter()).singleton()'));

const failed = checks.filter((item) => !item.ok);
for (const item of checks) console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.name}`);
console.log(`W1_SOURCE_VERIFIER=${failed.length === 0 ? 'PASS' : 'FAIL'} ${checks.length - failed.length}/${checks.length}`);
if (failed.length) process.exit(1);
