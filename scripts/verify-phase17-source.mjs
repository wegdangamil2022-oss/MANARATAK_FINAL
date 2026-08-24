import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const required = [
  'packages/domain/src/ai-platform/entities/AIPlatform.ts',
  'packages/domain/src/ai-platform/contracts/IAIPlatformRepository.ts',
  'packages/application/src/ai-platform/use-cases/AIPlatformUseCases.ts',
  'packages/infrastructure/src/ai-platform/ProviderAdapters.ts',
  'packages/infrastructure/src/ai-platform/PrismaAIPlatformRepository.ts',
  'apps/api/src/presentation/api/router/AIAdminRouter.ts',
  'apps/admin/src/pages/AIGovernancePage.tsx',
  'packages/infrastructure/prisma/migrations/20260824170000_phase17_enterprise_ai_platform/migration.sql',
];
const failures = [];
for (const file of required) if (!existsSync(file)) failures.push(`missing:${file}`);

const schema = readFileSync('packages/infrastructure/prisma/schema.prisma', 'utf8');
for (const model of ['AIRegistryRecord', 'AIPromptVersionRecord', 'AIExecutionRecord', 'AIExecutionSpanRecord', 'AIUsageRecord', 'AIWorkflowRunRecord', 'AIEvaluationRunRecord', 'AIKnowledgeSourceRecord', 'AIEmbeddingRecord', 'AIIndexingRunRecord', 'AIIncidentEventRecord']) {
  if (!schema.includes(`model ${model}`)) failures.push(`schema:${model}`);
}
if (/apiKey\s+String|secretValue\s+String|accessToken\s+String/i.test(schema.match(/\/\/ --- Phase 17[\s\S]*/)?.[0] ?? '')) failures.push('provider-secret-persisted');

const tracked = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8' }).trim().split(/\r?\n/).filter((file) => /\.(?:ts|tsx|js|mjs|cjs)$/.test(file) && !/^(?:work|wp-ic-10-results|wp12-11-evidence)\//.test(file.replaceAll('\\', '/')));
const approved = ['packages/infrastructure/src/ai-platform/'];
const directImport = /(?:from\s+['"](?:openai|@anthropic-ai\/sdk|@google\/genai)['"]|require\(['"](?:openai|@anthropic-ai\/sdk|@google\/genai)['"]\))/;
for (const file of tracked) if (!approved.some((prefix) => file.replaceAll('\\', '/').startsWith(prefix)) && directImport.test(readFileSync(file, 'utf8'))) failures.push(`direct-provider-import:${file}`);

const ui = readFileSync('apps/admin/src/pages/AIGovernancePage.tsx', 'utf8');
if (/mock provider|fake success|demo execution/i.test(ui)) failures.push('fake-admin-data');
if (!ui.includes('NOT_CONFIGURED') || !ui.includes('/admin/ai/')) failures.push('admin-not-runtime-bound');

if (failures.length) {
  console.error(`PHASE17_SOURCE_READY=NO\n${failures.join('\n')}`);
  process.exit(1);
}
console.log('PHASE17_SOURCE_READY=YES');
console.log('LIVE_AI_PROVIDER_CALLS=0');
console.log('LIVE_PAID_INFERENCE=0');
console.log('PROVIDER_SECRETS_CONFIGURED=NO');
console.log('PHASE17_RUNTIME_PROOF=PENDING_GOOGLE_STUDIO');
