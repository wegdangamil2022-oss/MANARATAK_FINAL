import { readFileSync } from 'node:fs';

const checks = [
  ['domain lifecycle', 'packages/domain/src/students/index.ts', 'StudentWorkspaceStatus'],
  ['privacy contract', 'packages/domain/src/students/index.ts', 'StudentPrivacyPreferences'],
  ['database inbox', 'packages/infrastructure/prisma/schema.prisma', 'model StudentWorkspaceEventInbox'],
  ['database timeline', 'packages/infrastructure/prisma/schema.prisma', 'model StudentTimelineEntry'],
  ['database snapshots', 'packages/infrastructure/prisma/schema.prisma', 'model StudentWorkspaceSnapshot'],
  ['atomic outbox', 'packages/infrastructure/src/students/PrismaStudentWorkspaceRepository.ts', 'StudentWorkspaceUpdated'],
  ['deduplicated inbox', 'packages/infrastructure/src/students/PrismaStudentWorkspaceRepository.ts', 'ingestIntegrationEvent'],
  ['tenant isolation', 'apps/api/src/presentation/api/router/StudentWorkspaceRouter.ts', 'STUDENT_WORKSPACE_ACCESS_DENIED'],
  ['optimistic concurrency', 'packages/infrastructure/src/students/PrismaStudentWorkspaceRepository.ts', 'STUDENT_WORKSPACE_VERSION_CONFLICT'],
  ['learning composition', 'packages/infrastructure/src/students/PrismaStudentWorkspaceRepository.ts', 'courseEnrollment.findMany'],
  ['certificate composition', 'packages/infrastructure/src/students/PrismaStudentWorkspaceRepository.ts', 'certificate.findMany'],
  ['Arabic student experience', 'apps/web/src/features/students/StudentWorkspacePage.tsx', 'التحكم والخصوصية'],
  ['runtime runbook', 'docs/implementation-status/MANARATAK-Phase15-Student-Platform-Source-Closure-and-Google-Studio-Runbook.md', 'SOURCE_COMPLETE_RUNTIME_PENDING'],
];

let failed = false;
for (const [name, path, token] of checks) {
  const source = readFileSync(path, 'utf8');
  const passed = source.includes(token);
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
  failed ||= !passed;
}

if (failed) process.exit(1);
console.log(`Phase 15 source verification passed (${checks.length}/${checks.length}).`);
