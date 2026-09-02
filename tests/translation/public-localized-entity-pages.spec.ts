import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));

function source(relativePath: string): string {
  return readFileSync(`${repoRoot}${relativePath}`, 'utf8');
}

describe('TR-WP11 public localized entity pages source contract', () => {
  it('passes an explicit supported locale to public university and major API requests', () => {
    const adapter = source('apps/web/src/api/localizedEntities.ts');
    expect(adapter).toContain("params.set('locale', locale)");
    expect(adapter).toContain("'/public/universities'");
    expect(adapter).toContain("'/public/majors'");
  });

  it('refetches list and detail data when the route language changes', () => {
    const universityList = source('apps/web/src/features/universities/UniversityList.tsx');
    const universityDetail = source('apps/web/src/features/universities/UniversityDetail.tsx');
    const majorList = source('apps/web/src/features/majors/MajorList.tsx');
    const majorDetail = source('apps/web/src/features/majors/MajorDetail.tsx');

    expect(universityList).toContain('getLocalizedUniversities(');
    expect(universityList).toContain('[language, page, params, t]');
    expect(universityDetail).toContain('getLocalizedUniversityBySlug(slug, language)');
    expect(universityDetail).toContain('[emptyLabel, language, slug]');
    expect(majorList).toContain('getLocalizedMajors(');
    expect(majorList).toContain('[language, page, params, t]');
    expect(majorDetail).toContain('getLocalizedMajorBySlug(slug, language)');
    expect(majorDetail).toContain('[emptyLabel, language, slug]');
  });

  it('keeps the canonical slug while localizing public links', () => {
    const universityList = source('apps/web/src/features/universities/UniversityList.tsx');
    const universityDetail = source('apps/web/src/features/universities/UniversityDetail.tsx');
    const majorList = source('apps/web/src/features/majors/MajorList.tsx');
    const majorDetail = source('apps/web/src/features/majors/MajorDetail.tsx');

    expect(universityList).toContain("localizePathname(`/universities/${item.slug}`, language)");
    expect(universityDetail).toContain("localizePathname('/universities', language)");
    expect(majorList).toContain("localizePathname(`/majors/${item.slug}`, language)");
    expect(majorDetail).toContain("localizePathname('/majors', language)");
  });

  it('removes the hard-coded RTL and unconditional English-name leakage from MajorDetail', () => {
    const majorDetail = source('apps/web/src/features/majors/MajorDetail.tsx');
    expect(majorDetail).not.toContain('dir="rtl"');
    expect(majorDetail).toContain('dir={dir}');
    expect(majorDetail).not.toContain('data.localizedNames?.en');
    expect(majorDetail).toContain("language === 'ar' ? section.titleAr : section.titleEn");
  });
});
