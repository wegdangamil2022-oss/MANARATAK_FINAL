import fs from 'node:fs';
import path from 'node:path';

const [mode, planPath] = process.argv.slice(2);
if (!['inspect', 'commit', 'rollback'].includes(mode ?? '') || !planPath) {
  throw new Error('Usage: tsx scripts/university-import-change-set.ts inspect|commit|rollback <change-plan.json>');
}
const resolved = path.resolve(planPath);
const plan = JSON.parse(fs.readFileSync(resolved, 'utf8')) as { changeSetId?: string; databaseWrites?: number; validationIssues?: unknown[]; changes?: unknown[] };
if (!plan.changeSetId || plan.databaseWrites !== 0 || !Array.isArray(plan.validationIssues) || !Array.isArray(plan.changes)) {
  throw new Error('INVALID_UNIVERSITY_CHANGE_PLAN');
}

if (mode === 'inspect') {
  console.log(JSON.stringify({ mode: 'READ_ONLY', changeSetId: plan.changeSetId, changes: plan.changes.length, blockingIssues: plan.validationIssues.length, databaseWrites: 0 }, null, 2));
} else {
  const requiredApproval = mode === 'commit' ? 'APPROVE_COMMIT' : 'APPROVE_ROLLBACK';
  if (process.env.UNIVERSITY_IMPORT_APPROVAL !== requiredApproval) throw new Error(`UNIVERSITY_IMPORT_${mode.toUpperCase()}_APPROVAL_REQUIRED`);
  if (!process.env.DATABASE_RECOVERY_GATE_TOKEN) throw new Error('DATABASE_RECOVERY_GATE_REQUIRED');
  throw new Error(`UNIVERSITY_IMPORT_${mode.toUpperCase()}_RUNTIME_ADAPTER_NOT_CONFIGURED`);
}
