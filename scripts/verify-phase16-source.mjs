import { readFileSync } from 'node:fs';

const checks = [
  [
    'Phase 15 closed baseline',
    'docs/implementation-status/MANARATAK-Phase15-Student-Platform-Source-Closure-and-Google-Studio-Runbook.md',
    'SOURCE_COMPLETE_RUNTIME_PENDING',
  ],
  ['CMS lifecycle', 'packages/domain/src/cms/enums/CmsContentStatus.ts', 'READY_TO_PUBLISH'],
  [
    'publishing readiness',
    'packages/domain/src/cms/services/CmsPublishingPolicy.ts',
    'seo.description',
  ],
  [
    'maker-checker',
    'packages/domain/src/cms/services/CmsPublishingPolicy.ts',
    'CMS_MAKER_CHECKER_VIOLATION',
  ],
  [
    'CMS database source',
    'packages/infrastructure/prisma/schema.prisma',
    'model CmsPublishedContent',
  ],
  [
    'immutable revisions',
    'packages/infrastructure/prisma/schema.prisma',
    'model CmsContentRevision',
  ],
  [
    'asset platform boundary',
    'packages/application/src/cms/use-cases/CmsUseCases.ts',
    'assertAssetHandle',
  ],
  [
    'atomic audit and outbox',
    'packages/infrastructure/src/cms/PrismaCmsRepository.ts',
    'transactionalOutboxRecord.create',
  ],
  [
    'published delivery projection',
    'packages/infrastructure/src/cms/PrismaCmsRepository.ts',
    'cmsPublishedContent.upsert',
  ],
  [
    'authenticated admin workflow',
    'apps/api/src/presentation/api/router/CmsAdminRouter.ts',
    'req.authUserId',
  ],
  ['Arabic enterprise admin', 'apps/admin/src/pages/CmsAdminPage.tsx', 'إدارة المحتوى والنشر'],
  ['public canonical rendering', 'apps/web/src/features/cms/CmsContentDetail.tsx', 'canonicalUrl'],
  [
    'runtime runbook',
    'docs/implementation-status/MANARATAK-Phase16-CMS-Source-Closure-and-Google-Studio-Runbook.md',
    'SOURCE_COMPLETE_RUNTIME_PENDING',
  ],
];

let failed = false;
for (const [name, path, token] of checks) {
  const passed = readFileSync(path, 'utf8').includes(token);
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
  failed ||= !passed;
}
if (failed) process.exit(1);
console.log(`Phase 16 source verification passed (${checks.length}/${checks.length}).`);
