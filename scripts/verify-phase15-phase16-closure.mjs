import { readFileSync } from 'node:fs';

const required = [
  ['15 identity-derived BFF', 'apps/api/src/presentation/api/router/StudentWorkspaceRouter.ts', "router.get('/dashboard'"],
  ['15 projections', 'packages/infrastructure/prisma/schema.prisma', 'model StudentLearningProjection'],
  ['15 cache isolation', 'packages/infrastructure/src/students/RedisStudentWorkspaceDeliveryCache.ts', 'encodeURIComponent(studentReferenceId)'],
  ['15 UI snapshot restore', 'apps/web/src/features/students/StudentWorkspacePage.tsx', 'onRestoreSnapshot'],
  ['16 explicit slug mutation', 'packages/infrastructure/src/cms/PrismaCmsRepository.ts', 'changeLocalizedSlug'],
  ['16 scheduling cancellation', 'apps/api/src/presentation/api/router/CmsAdminRouter.ts', 'cancel-schedule'],
  ['16 navigation', 'packages/infrastructure/prisma/schema.prisma', 'model CmsNavigationMenu'],
  ['16 blocks', 'packages/infrastructure/prisma/schema.prisma', 'model CmsContentBlock'],
  ['16 announcements', 'packages/infrastructure/prisma/schema.prisma', 'model CmsAnnouncement'],
  ['16 delivery ETag', 'apps/api/src/presentation/api/router/CmsPublicRouter.ts', "req.headers['if-none-match']"],
  ['16 authenticated preview', 'apps/api/src/presentation/api/router/CmsAdminRouter.ts', "'/content/:id/preview'"],
  ['source-only migration', 'packages/infrastructure/prisma/migrations/20260825010000_phase15_phase16_mandatory_closure/migration.sql', 'Google Studio runtime window'],
];

let failures = 0;
for (const [label, path, token] of required) {
  const passed = readFileSync(path, 'utf8').includes(token);
  console.log(`${passed ? 'PASS' : 'FAIL'} ${label}`);
  if (!passed) failures += 1;
}
if (failures) process.exit(1);
console.log(`Phase 15/16 mandatory closure verification passed (${required.length}/${required.length}).`);
