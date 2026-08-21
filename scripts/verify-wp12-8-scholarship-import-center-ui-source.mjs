import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const page = readFileSync(resolve(root, 'apps/admin/src/pages/ScholarshipImportCenterPage.tsx'), 'utf8');
const api = readFileSync(resolve(root, 'apps/admin/src/api/scholarshipImportCenter.ts'), 'utf8');
const app = readFileSync(resolve(root, 'apps/admin/src/App.tsx'), 'utf8');
const combined = `${page}\n${api}\n${app}`;

function assert(condition, message) {
  if (!condition) throw new Error(`WP12_8_SOURCE_VERIFY_FAILED:${message}`);
}

for (const token of [
  '/overview', '/sources', '/records', 'screening', 'duplicates', 'missing-data',
  'verification', 'review-queue', 'ready-to-transfer', 'history', '/diff',
  '/merge-proposal', '/decision', '/transfer',
]) {
  assert(api.includes(token), `missing API surface ${token}`);
}

assert(app.includes('path="/imports/scholarships"'), 'missing canonical admin route');
assert(app.includes('href="/imports/scholarships"'), 'missing admin navigation entry');
assert(page.includes("reviewDecisionPersistence === 'CONFIGURED'"), 'review decision capability gate missing');
assert(page.includes("atomicTransfer === 'CONFIGURED'"), 'atomic transfer capability gate missing');
assert(page.includes('countsExact'), 'exact/partial count signal not rendered');
assert(page.includes('scanTruncated'), 'scan truncation signal not rendered');
assert(page.includes('sourceRegistryRuntime'), 'source registry runtime state not rendered');
assert(!page.includes('automaticMergePerformed = true'), 'UI must not synthesize automatic merge');

for (const token of [
  '@prisma/client', 'PrismaClient', 'prisma.', 'mockScholarship', 'mockRecords',
  'fakeRecords', 'sampleRecords', 'Math.random()',
]) {
  assert(!combined.includes(token), `forbidden UI/source token ${token}`);
}

assert(!page.includes('fetch('), 'page must use typed API adapter, not direct fetch');
assert(api.includes("const BASE = '/admin/scholarships/import-center'"), 'API adapter must target WP12-7 backend');
assert(page.includes('scholarshipImportCenterApi.overview'), 'overview must be API-backed');
assert(page.includes('scholarshipImportCenterApi.sources'), 'sources must be API-backed');
assert(page.includes('scholarshipImportCenterApi.records'), 'incoming records must be API-backed');
assert(page.includes('scholarshipImportCenterApi.scan'), 'segmented queues must be API-backed');

console.log('WP12_8_IMPORT_CENTER_UI_SOURCE = PASS');
console.log('DIRECT_PRISMA_REFERENCES = 0');
console.log('DIRECT_FETCH_IN_PAGE = 0');
console.log('LOCAL_RECORD_FIXTURES = 0');
console.log('ATOMIC_TRANSFER_BYPASS = 0');
