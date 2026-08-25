#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const checks = [];
const check = (name, ok, detail='') => checks.push({ name, ok: Boolean(ok), detail });

const roadmap = read('docs/governance/roadmap/MANARATAK-2.0-Roadmap-v6.0.md');
check('roadmap_version_6', roadmap.includes('**Version:** 6.0'));
check('roadmap_source_through_phase19', roadmap.includes('Source implementation is present through **Phase 19'));
check('roadmap_runtime_boundary', roadmap.includes('PENDING_GOOGLE_STUDIO'));

const phase2Dir = path.join(root, 'docs/phases/phase-02-solution-architecture');
const phase2Files = fs.readdirSync(phase2Dir).filter((f) => f.endsWith('.md'));
const phase2Text = phase2Files.map((f) => fs.readFileSync(path.join(phase2Dir, f), 'utf8')).join('\n');
check('phase2_no_active_v2_namespace', !phase2Text.includes('/v2'));
const arb = read('docs/phases/phase-02-solution-architecture/phase-2-arb-compliance-report.md');
check('phase2_reference_owner_phase7', arb.includes('Phase 7 — Global Reference Data'));
check('phase2_relational_fk_posture', arb.includes('Canonical relational foreign keys are allowed and preferred'));
const apiDesign = read('docs/phases/phase-02-solution-architecture/phase-02-12-api-architecture-design.md');
check('phase2_modular_monolith_topology', apiDesign.includes('current runtime is a Modular Monolith'));
check('phase2_api_v1', apiDesign.includes('/api/v1'));

const phase3Monorepo = read('docs/phases/phase-03-enterprise-design/phase-03-01-enterprise-monorepo-setup.md');
const phase3Env = read('docs/phases/phase-03-enterprise-design/phase-03-02-development-environment.md');
check('phase3_full_repo_correctness_truth', phase3Monorepo.includes('Authoritative correctness gates'));
check('phase3_quality_gate_documented', phase3Env.includes('npm run quality:source'));
check('phase3_node_pin_documented', phase3Env.includes('Node.js 22.16.0'));
check('quality_gate_script_exists', fs.existsSync(path.join(root, 'scripts/quality/verify-source-quality.mjs')));
check('quality_baseline_exists', fs.existsSync(path.join(root, 'scripts/quality/source-quality-baseline.json')));

const pkg = JSON.parse(read('package.json'));
check('package_node_engine_strict_range', pkg.engines?.node === '>=22.16.0 <23');
check('package_npm_engine_range', pkg.engines?.npm === '>=10.9.0 <11');
check('package_quality_script', pkg.scripts?.['quality:source'] === 'node scripts/quality/verify-source-quality.mjs');
check('package_w0_verify_script', pkg.scripts?.['w0:verify'] === 'node scripts/verify-w0-source.mjs');
check('npm_engine_strict', /engine-strict\s*=\s*true/.test(read('.npmrc')));
check('nvmrc_pinned', read('.nvmrc').trim() === '22.16.0');
const turbo = JSON.parse(read('turbo.json'));
check('turbo_v2_tasks_config', Boolean(turbo.tasks) && !('pipeline' in turbo));

const ci = read('.github/workflows/ci.yml');
check('ci_node_pin', ci.includes('node-version: 22.16.0'));
check('ci_quality_gate', ci.includes('npm run quality:source'));
check('ci_commit_validator', ci.includes('validate-commit-message.mjs'));
check('ci_branch_validator', ci.includes('validate-branch-name.mjs'));
const importedClosureCi = read('.github/workflows/imported-courses-runtime-closure.yml');
check('imported_courses_ci_node_pin', importedClosureCi.includes('node-version: 22.16.0'));
const devcontainer = JSON.parse(read('.devcontainer/devcontainer.json'));
check('devcontainer_node22', String(devcontainer.image).endsWith(':22'));
check('devcontainer_deterministic_install', devcontainer.postCreateCommand === 'npm ci');

const p414 = read('docs/phases/phase-04-architecture-governance/baselines/phase-04-14-report.md');
const p415 = read('docs/phases/phase-04-architecture-governance/baselines/phase-04-15-report.md');
const p417 = read('docs/phases/phase-04-architecture-governance/baselines/phase-04-17-report.md');
const p421 = read('docs/phases/phase-04-architecture-governance/baselines/phase-04-21-report.md');
check('phase4_testing_reconciled', p414.includes('SUPERSEDED_BY_CURRENT_TEST_ARCHITECTURE'));
check('phase4_git_reconciled', p415.includes('ACTIVE_IMPLEMENTED — CI_ENFORCED'));
check('phase4_container_deferred', p417.includes('Phase 4.17\nDEFERRED'));
check('phase4_master_matrix_reconciled', p421.includes('W0 Current Capability Reconciliation'));
check('phase4_no_active_production_ready_checkmarks', !read('docs/phases/phase-04-architecture-governance/baselines/phase-04-12-report.md').includes('Production Readiness: ✓') && !read('docs/phases/phase-04-architecture-governance/baselines/phase-04-13-report.md').includes('Production Readiness: ✓') && !read('docs/phases/phase-04-architecture-governance/baselines/phase-04-16-report.md').includes('Production Readiness: ✓') && !read('docs/phases/phase-04-architecture-governance/baselines/phase-04-18-report.md').includes('Production Readiness: ✓') && !read('docs/phases/phase-04-architecture-governance/baselines/phase-04-19-report.md').includes('Production Readiness: ✓') && !read('docs/phases/phase-04-architecture-governance/baselines/phase-04-20-report.md').includes('Production Readiness: ✓'));
check('w0_execution_report_exists', fs.existsSync(path.join(root, 'docs/governance/audits/remediation/MANARATAK-W0-Authority-Quality-Gate-Execution-Report.md')));

try {
  const quality = execFileSync(process.execPath, [path.join(root, 'scripts/quality/verify-source-quality.mjs')], { encoding: 'utf8' });
  check('quality_gate_executes', quality.includes('SOURCE_QUALITY_GATE=PASS'));
} catch (error) {
  check('quality_gate_executes', false, error.stdout || error.stderr || String(error));
}

for (const item of checks) console.log(`${item.name}=${item.ok ? 'PASS' : 'FAIL'}${item.detail ? ` ${item.detail}` : ''}`);
const failed = checks.filter((item) => !item.ok);
if (failed.length) {
  console.error(`W0_SOURCE_VERIFIER=FAIL (${failed.length}/${checks.length})`);
  process.exit(1);
}
console.log(`W0_SOURCE_VERIFIER=PASS (${checks.length}/${checks.length})`);
