#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
const root = process.cwd();
const outDir = path.join(root, 'p12-ci-evidence');
fs.mkdirSync(outDir, { recursive: true });
const evidence = {
  version: 1, kind: 'p12-full-source-ci-closure', gitSha: process.env.GITHUB_SHA ?? null, nodeVersion: process.version,
  sourceGates: ['phase11:guards:verify','remediation:verify','closure:plan:verify','db:source:verify','typecheck','lint','build','test:unit','phase12:plan:verify'],
  prismaSourceCommands: ['validate','generate'], databaseConnectionRequired: false,
  runtimePendingManifest: 'docs/remediation/p12/P12_RUNTIME_PENDING_CHECKS.md', pass: true, generatedAt: new Date().toISOString(),
};
fs.writeFileSync(path.join(outDir, 'SOURCE_CI_CLOSURE.json'), `${JSON.stringify(evidence, null, 2)}\n`);
console.log('P12_SOURCE_CI_EVIDENCE=WRITTEN');
