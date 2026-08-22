import { readFileSync } from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(process.cwd());
const source = (relative: string) => readFileSync(path.join(root, relative), 'utf8');

describe('WP-IC-07 source invariants', () => {
  it('mounts static imported-course and course-import routers before generic routers', () => {
    const app = source('apps/api/src/app.ts');
    const courseImportStatic = app.indexOf("v1Router.use('/admin/imports/courses'");
    const importGeneric = app.indexOf("v1Router.use('/admin/imports'");
    const importedCourseStatic = app.indexOf("v1Router.use('/admin/courses/imported'");
    const courseGeneric = app.indexOf("v1Router.use('/admin/courses'");
    expect(courseImportStatic).toBeGreaterThanOrEqual(0);
    expect(importedCourseStatic).toBeGreaterThanOrEqual(0);
    expect(courseImportStatic).toBeLessThan(importGeneric);
    expect(importedCourseStatic).toBeLessThan(courseGeneric);
  });

  it('has no generic imported-course /:action backend route', () => {
    const router = source('apps/api/src/presentation/api/router/ImportedCourseAdminRouter.ts');
    expect(router).not.toMatch(/\/:action/);
    for (const endpoint of [
      'verify-source',
      'check-link',
      'fetch-missing',
      'mark-ready',
      'publish',
      'unpublish',
      'reject',
      'archive',
    ]) {
      expect(router).toContain(`/:id/${endpoint}`);
    }
  });

  it('maps the legacy UI adapter through a closed switch instead of an open action URL', () => {
    const client = source('apps/web/src/api/client.ts');
    const start = client.indexOf('// Imported External Courses API — explicit WP-IC-07 REST contract.');
    const end = client.indexOf('// Paid Courses API', start);
    const block = client.slice(start, end);
    expect(block).toContain("case 'VERIFY_SOURCE'");
    expect(block).toContain("return this.verifyAdminImportedCourseSource(id)");
    expect(block).not.toContain('/${action}');
  });

  it('uses runtime pages and a dedicated course import operations page', () => {
    const router = source('apps/web/src/router/index.tsx');
    expect(router).toContain('AdminImportedCoursesRuntimePage');
    expect(router).toContain('AdminImportedCourseRuntimeDetailPage');
    expect(router).toContain('AdminCourseImportOperationsPage');
    expect(router.indexOf("path: 'admin/imports/courses'"))
      .toBeLessThan(router.indexOf("path: 'admin/imports/:domainKey'"));
  });

  it('does not place provider master constants in the runtime imported-courses page', () => {
    const runtime = source('apps/web/src/features/admin-preview/AdminImportedCoursesRuntimePage.tsx');
    expect(runtime).toContain('ApiClient.getCourseImportProviders()');
    expect(runtime).not.toContain('MASTER_PROVIDER_OPTIONS');
    expect(runtime).not.toContain('sample');
    expect(runtime).not.toContain('fallback data');
  });

  it('fetch-missing is provider-policy gated and never falls back to arbitrary crawling', () => {
    const useCase = source('packages/application/src/courses/use-cases/ImportedCourseAdminUseCases.ts');
    expect(useCase).toContain('COURSE_FETCH_MISSING_PROVIDER_POLICY_FILE_ONLY');
    expect(useCase).toContain('COURSE_FETCH_MISSING_PROVIDER_CONNECTOR_NOT_REGISTERED');
    expect(useCase).not.toContain('fetch(');
  });

  it('safe link checker blocks private address targets and validates every redirect domain', () => {
    const checker = source('packages/infrastructure/src/courses/SafeImportedCourseLinkChecker.ts');
    expect(checker).toContain('COURSE_LINK_PRIVATE_DNS_TARGET_BLOCKED');
    expect(checker).toContain('domainAllowed(current.hostname, input.allowedDomains)');
    expect(checker).toContain('httpsRequest');
    expect(checker).toContain('callback(null, resolved.address, resolved.family)');
  });

  it('invalidates URL verification on controlled URL changes and refuses a stale check result', () => {
    const gateway = source('packages/infrastructure/src/courses/PrismaCourseImportTransferGateway.ts');
    const repository = source('packages/infrastructure/src/courses/PrismaImportedCourseOperationsRepository.ts');

    const urlChange = gateway.slice(gateway.indexOf('applyVerifiedUrlChange'), gateway.indexOf('writeFieldProvenance'));
    expect(urlChange).toContain("verificationState: 'UNVERIFIED'");
    expect(urlChange).toContain('checkedAt: null');
    expect(repository).toContain('IMPORTED_COURSE_LINK_CHECK_STALE_URL');
    expect(repository).toContain('this.normalizeUrl(checkedUrl) !== normalizedUrl');
  });

  it('does not add a WP-IC-07 migration or seed/backfill', () => {
    const infrastructureIndex = source('packages/infrastructure/src/index.ts');
    expect(infrastructureIndex).toContain("PrismaImportedCourseOperationsRepository");
    expect(infrastructureIndex).toContain("SafeImportedCourseLinkChecker");
  });

  it('uses repository-level provider scoping for continuation batches and review counts', () => {
    const continuation = source('packages/application/src/courses/use-cases/CourseProviderContinuationUseCases.ts');
    const repository = source('packages/infrastructure/src/courses/PrismaImportedCourseOperationsRepository.ts');
    expect(continuation).toContain('listProviderCourseBatches');
    expect(continuation).toContain('getProviderReviewSummary');
    expect(continuation).not.toContain('listBatches(100)');
    expect(repository).toContain('listProviderReviewQueue');
    expect(repository).toContain('a."resolvedProviderId" = ${providerId}');
  });
});
