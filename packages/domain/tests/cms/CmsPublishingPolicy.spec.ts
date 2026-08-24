import { describe, expect, it } from 'vitest';
import { CmsContentStatus, CmsPublishingPolicy } from '../../src';

describe('Phase 16 CMS publishing policy', () => {
  it('enforces maker-checker separation', () => {
    expect(() => CmsPublishingPolicy.assertMakerChecker('editor-1', 'editor-1')).toThrow(
      'CMS_MAKER_CHECKER_VIOLATION',
    );
    expect(() => CmsPublishingPolicy.assertMakerChecker('editor-1', 'publisher-2')).not.toThrow();
  });

  it('does not allow draft content to skip review', () => {
    expect(() =>
      CmsPublishingPolicy.assertTransition(CmsContentStatus.DRAFT, CmsContentStatus.PUBLISHED),
    ).toThrow('CMS_INVALID_LIFECYCLE_TRANSITION');
  });

  it('allows approved content to be scheduled or explicitly published', () => {
    expect(() =>
      CmsPublishingPolicy.assertTransition(
        CmsContentStatus.READY_TO_PUBLISH,
        CmsContentStatus.SCHEDULED,
      ),
    ).not.toThrow();
    expect(() =>
      CmsPublishingPolicy.assertTransition(
        CmsContentStatus.READY_TO_PUBLISH,
        CmsContentStatus.PUBLISHED,
      ),
    ).not.toThrow();
  });

  it('rejects a raw asset source while accepting an EAP identity', () => {
    expect(() => CmsPublishingPolicy.assertAssetHandle('data:image/png;base64,abc')).toThrow(
      'CMS_ASSET_MUST_USE_EAP_HANDLE',
    );
    expect(() => CmsPublishingPolicy.assertAssetHandle('asset_01J8Q4K3EAP')).not.toThrow();
  });
});
