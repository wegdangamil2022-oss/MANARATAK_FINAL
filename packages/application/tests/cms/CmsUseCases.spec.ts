import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CmsContentStatus,
  CmsContentType,
  ICmsRepository
} from '@manaratak/domain';
import { AdminCmsUseCases, PublicCmsUseCases } from '../../src/cms/use-cases/CmsUseCases';

describe('CmsUseCases', () => {
  let repository: ICmsRepository;
  let adminUseCases: AdminCmsUseCases;
  let publicUseCases: PublicCmsUseCases;

  beforeEach(() => {
    repository = {
      createContent: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'content-1', ...data, createdAt: new Date(), updatedAt: new Date() })),
      updateContent: vi.fn(),
      findContentById: vi.fn(),
      findContentBySlug: vi.fn(),
      updateStatus: vi.fn().mockImplementation((id, status) => Promise.resolve({ id, status })),
      listContent: vi.fn(),
      listPublished: vi.fn().mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }),
      getPublishedBySlug: vi.fn(),
      upsertLocalizedContent: vi.fn(),
      listLocalizedContent: vi.fn().mockResolvedValue([{ id: 'localized-1', locale: 'en', body: 'Body' }]),
      createCategory: vi.fn(),
      listCategories: vi.fn(),
    };
    adminUseCases = new AdminCmsUseCases(repository);
    publicUseCases = new PublicCmsUseCases(repository);
  });

  it('creates editorial content as draft by default', async () => {
    const content = await adminUseCases.createContent({
      slug: 'study-guide',
      contentType: CmsContentType.STUDY_GUIDE,
      title: 'Study Guide'
    });

    expect(content.status).toBe(CmsContentStatus.DRAFT);
    expect(repository.createContent).toHaveBeenCalledWith(expect.objectContaining({
      publicId: expect.stringContaining('cms-')
    }));
  });

  it('rejects raw asset URLs for featured images', async () => {
    await expect(adminUseCases.createContent({
      slug: 'bad-asset',
      contentType: CmsContentType.ARTICLE,
      title: 'Bad Asset',
      featuredAssetId: 'https://example.com/image.png'
    })).rejects.toThrow('Phase 05 EAP handle');
  });

  it('requires localized payload before publishing', async () => {
    (repository.listLocalizedContent as any).mockResolvedValue([]);

    await expect(adminUseCases.publish('content-1')).rejects.toThrow('localized payload');
  });

  it('public listing is forced to published content', async () => {
    await publicUseCases.listPublished({ contentType: CmsContentType.ARTICLE }, 'en');

    expect(repository.listPublished).toHaveBeenCalledWith(expect.objectContaining({
      status: CmsContentStatus.PUBLISHED
    }), 'en');
  });
});
