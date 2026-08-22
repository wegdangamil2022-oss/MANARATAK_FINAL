import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildFinalReport,
  normalizeBaseUrl,
  renderFinalMarkdown,
  validateMemoryResult,
} from '../../scripts/wp-ic-10-runtime-lib.mjs';

test('normalizeBaseUrl requires HTTPS for non-local runtime targets', () => {
  assert.equal(normalizeBaseUrl('https://example.org/'), 'https://example.org');
  assert.equal(normalizeBaseUrl('http://localhost:3000/'), 'http://localhost:3000');
  assert.throws(() => normalizeBaseUrl('http://example.org'), /HTTPS_REQUIRED/);
  assert.throws(() => normalizeBaseUrl('https://user:pass@example.org'), /CREDENTIALS_FORBIDDEN/);
});

test('memory validation enforces row/header and memory bounds', () => {
  const base = {
    rowsExpected: 3663,
    rowsObserved: 3663,
    headersExpected: ['a', 'b'],
    headersObserved: ['a', 'b'],
    rssAfterMb: 300,
    rssDeltaMb: 100,
    maxRssMb: 1024,
    maxDeltaMb: 512,
  };
  assert.deepEqual(validateMemoryResult(base), { pass: true, failures: [] });
  const failed = validateMemoryResult({ ...base, rowsObserved: 3662, rssDeltaMb: 600 });
  assert.equal(failed.pass, false);
  assert.deepEqual(failed.failures, ['ROW_COUNT_MISMATCH', 'RSS_DELTA_LIMIT_EXCEEDED']);
});

test('final report blocks when a required closure artifact is missing', () => {
  const pass = { pass: true, detail: 'ok' };
  const report = buildFinalReport({ ciClosure: pass, security: pass, memory: pass, database: pass, backupRestore: pass });
  assert.equal(report.pass, false);
  assert.equal(report.gates.find((item) => item.name === 'browserE2E')?.state, 'NOT_RUN');
});

test('final report closes only after every required gate passes', () => {
  const pass = { pass: true, detail: 'ok' };
  const handoff = buildFinalReport({ ciClosure: pass, security: pass, memory: pass, database: pass, backupRestore: pass, browserE2E: pass });
  assert.equal(handoff.pass, true);
  assert.equal(handoff.runtimeClosureState, 'CLOSED_READY_FOR_GOOGLE_STUDIO_HANDOFF');
  assert.match(renderFinalMarkdown(handoff), /Google Studio may proceed/);

  const deployed = buildFinalReport({ ciClosure: pass, security: pass, memory: pass, database: pass, backupRestore: pass, browserE2E: pass, runtimeSmoke: pass });
  assert.equal(deployed.pass, true);
  assert.equal(deployed.runtimeClosureState, 'DEPLOYED_RUNTIME_VERIFIED');
});
