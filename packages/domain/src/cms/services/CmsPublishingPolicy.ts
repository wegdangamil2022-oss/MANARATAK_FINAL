import { CmsContentStatus } from '../enums/CmsContentStatus';
import {
  CmsContentDto,
  CmsLocalizedContentDto,
  CmsPublishingReadinessDto,
  CmsSeoMetadata,
} from '../entities/CmsContent';

const RAW_ASSET_PATTERN = /^(?:https?:\/\/|data:|file:|[a-zA-Z]:\\|\/)/i;
const UNSAFE_MARKUP_PATTERN = /<\/?(?:script|style|iframe|object|embed|form|input|button|link|meta)\b|\son\w+\s*=|(?:javascript|data|vbscript):/i;

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

  public static assertSafeRichText(body: string): void {
    if (UNSAFE_MARKUP_PATTERN.test(body)) throw new Error('CMS_UNSAFE_RICH_TEXT');
  }

  public static assertSafeNavigationTarget(targetType: string, targetValue: string): void {
    if (targetType === 'EXTERNAL_URL') {
      let url: URL;
      try { url = new URL(targetValue); } catch { throw new Error('CMS_NAVIGATION_URL_INVALID'); }
      if (!['https:', 'http:'].includes(url.protocol)) throw new Error('CMS_NAVIGATION_URL_UNSAFE');
      return;
    }
    if (targetValue.startsWith('//') || /^(?:javascript|data|file):/i.test(targetValue)) {
      throw new Error('CMS_NAVIGATION_TARGET_UNSAFE');
    }
  }

  public static assertAcyclicNavigation(nodes: Array<{ id?: string; parentNodeId?: string | null }>): void {
    const parents = new Map(nodes.filter((node) => node.id).map((node) => [node.id!, node.parentNodeId ?? null]));
    for (const id of parents.keys()) {
      const visited = new Set<string>(); let cursor: string | null | undefined = id;
      while (cursor) {
        if (visited.has(cursor)) throw new Error('CMS_NAVIGATION_CYCLE');
        visited.add(cursor); cursor = parents.get(cursor);
      }
    }
  }

  public static assertRedirect(sourcePath: string, destinationPath: string): void {
    if (!sourcePath.startsWith('/') || !destinationPath.startsWith('/')) throw new Error('CMS_REDIRECT_PATH_INVALID');
    if (sourcePath === destinationPath) throw new Error('CMS_REDIRECT_LOOP');
    if (sourcePath.startsWith('//') || destinationPath.startsWith('//')) throw new Error('CMS_REDIRECT_OPEN_TARGET');
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
