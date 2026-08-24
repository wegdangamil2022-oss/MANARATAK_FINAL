import { CmsContentStatus } from '../enums/CmsContentStatus';
import {
  CmsContentDto,
  CmsLocalizedContentDto,
  CmsPublishingReadinessDto,
  CmsSeoMetadata,
} from '../entities/CmsContent';

const RAW_ASSET_PATTERN = /^(?:https?:\/\/|data:|file:|[a-zA-Z]:\\|\/)/i;

export class CmsPublishingPolicy {
  public static assertAssetHandle(assetId?: string | null): void {
    if (assetId && RAW_ASSET_PATTERN.test(assetId)) {
      throw new Error('CMS_ASSET_MUST_USE_EAP_HANDLE');
    }
  }

  public static assertSlug(slug: string): void {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new Error('CMS_SLUG_INVALID');
    }
  }

  public static readiness(
    content: CmsContentDto,
    localized: CmsLocalizedContentDto,
  ): CmsPublishingReadinessDto {
    const missing: string[] = [];
    const warnings: string[] = [];
    const seo = localized.seoMetadata as CmsSeoMetadata | null | undefined;
    if (!localized.title.trim()) missing.push('title');
    if (!localized.summary?.trim()) missing.push('summary');
    if (!localized.body.trim()) missing.push('body');
    if (!content.categoryId && !content.categorySlug) missing.push('category');
    if (!localized.localizedSlug.trim()) missing.push('localizedSlug');
    if (!seo?.title?.trim()) missing.push('seo.title');
    if (!seo?.description?.trim()) missing.push('seo.description');
    if (!content.featuredAssetId && !localized.featuredAssetId) warnings.push('featuredAssetId');
    if ((seo?.title?.length ?? 0) > 65) warnings.push('seo.title.length');
    if ((seo?.description?.length ?? 0) > 170) warnings.push('seo.description.length');
    return { ready: missing.length === 0, missing, warnings };
  }

  public static assertTransition(current: CmsContentStatus, next: CmsContentStatus): void {
    if (current === next) return;
    const allowed: Record<CmsContentStatus, CmsContentStatus[]> = {
      [CmsContentStatus.DRAFT]: [CmsContentStatus.IN_REVIEW],
      [CmsContentStatus.IN_REVIEW]: [CmsContentStatus.DRAFT, CmsContentStatus.READY_TO_PUBLISH],
      [CmsContentStatus.READY_TO_PUBLISH]: [
        CmsContentStatus.DRAFT,
        CmsContentStatus.SCHEDULED,
        CmsContentStatus.PUBLISHED,
      ],
      [CmsContentStatus.SCHEDULED]: [CmsContentStatus.DRAFT, CmsContentStatus.PUBLISHED],
      [CmsContentStatus.PUBLISHED]: [CmsContentStatus.DRAFT, CmsContentStatus.ARCHIVED],
      [CmsContentStatus.ARCHIVED]: [CmsContentStatus.DRAFT],
    };
    if (!allowed[current].includes(next)) throw new Error('CMS_INVALID_LIFECYCLE_TRANSITION');
  }

  public static assertMakerChecker(authorId: string, reviewerId: string): void {
    if (authorId === reviewerId) throw new Error('CMS_MAKER_CHECKER_VIOLATION');
  }
}
