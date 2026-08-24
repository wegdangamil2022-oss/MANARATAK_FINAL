import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ApiClient, PaginatedResult, PublicCmsContentDto } from '../../api/client';
import { Button } from '@manaratak/ui';
import { Seo } from '../../components/Seo';
import { useTranslation } from '../../i18n/I18nProvider';

export function CmsContentList() {
  const { t, language } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<PaginatedResult<PublicCmsContentDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contentType, setContentType] = useState(searchParams.get('contentType') || '');
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const page = parseInt(searchParams.get('page') || '1', 10);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await ApiClient.getCmsContent({
        contentType: searchParams.get('contentType') || undefined,
        q: searchParams.get('q') || undefined,
        locale: language,
        page,
        pageSize: 9,
      });
      setData(result);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Error fetching CMS content');
    } finally {
      setLoading(false);
    }
  }, [language, page, searchParams]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);
    if (contentType) params.set('contentType', contentType);
    else params.delete('contentType');
    if (query) params.set('q', query);
    else params.delete('q');
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  return (
    <div className="space-y-8">
      <Seo
        title={t('guides_and_articles')}
        description={t('read_manaratak_editorial_guides_articles_faqs_chec')}
      />
      <section className="border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white rounded-3xl p-5 sm:p-8">
        <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-2">
          {t('guides_articles')}
        </p>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl mb-3">
          {t('learn_with_manaratak')}
        </h1>
        <p className="text-base leading-7 text-gray-700 max-w-3xl">
          {t('read_editorial_guides_checklists_faqs_and_updates_')}
        </p>
      </section>

      <div className="flex flex-col gap-3 bg-white border rounded-2xl p-4 shadow-sm md:flex-row">
        <select
          value={contentType}
          onChange={(event) => setContentType(event.target.value)}
          className="min-h-12 border rounded-xl px-3 py-3"
        >
          <option value="">{t('all_types')}</option>
          <option value="ARTICLE">{t('articles')}</option>
          <option value="STUDY_GUIDE">{t('study_guides')}</option>
          <option value="NEWS">{t('news')}</option>
          <option value="FAQ">{t('faqs')}</option>
          <option value="CHECKLIST">{t('checklists')}</option>
        </select>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('search_editorial_content')}
          className="min-h-12 flex-1 border rounded-xl px-3 py-3"
        />
        <Button onClick={applyFilters}>{t('apply')}</Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error}</div>
      )}

      {loading && !data ? (
        <div className="py-20 text-center text-gray-500">{t('loading_content')}</div>
      ) : data?.data.length ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.data.map((item) => (
              <article
                key={item.publicId}
                className="bg-white border rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col"
              >
                <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3">
                  {formatLabel(item.contentType)}
                </div>
                <h2 className="text-xl font-black leading-snug mb-3">
                  <Link
                    to={`/articles/${item.slug}?locale=${item.locale}`}
                    className="hover:text-emerald-700"
                  >
                    {item.title}
                  </Link>
                </h2>
                {item.summary && (
                  <p className="text-base leading-7 text-gray-600 flex-1">{item.summary}</p>
                )}
                {item.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag.normalizedValue}
                        className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800"
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-5 flex items-center justify-between text-sm text-gray-500">
                  <span>{item.publishedAt ? formatDate(item.publishedAt) : 'Published'}</span>
                  <Link
                    to={`/articles/${item.slug}?locale=${item.locale}`}
                    className="text-emerald-700 hover:underline"
                  >
                    {t('read')}
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="flex flex-col justify-center items-center gap-3 pt-4 sm:flex-row">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
            >
              {t('previous')}
            </Button>
            <span className="text-sm text-gray-600">
              {t('page')}
              {data.page} {t('of')}
              {data.totalPages || 1}
            </span>
            <Button
              variant="outline"
              disabled={page >= data.totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              {t('next')}
            </Button>
          </div>
        </>
      ) : (
        <div className="bg-white border border-dashed rounded-2xl p-10 text-center text-gray-500">
          {t('no_published_editorial_content_found')}
        </div>
      )}
    </div>
  );
}

function formatLabel(value: string): string {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(document.documentElement.lang || 'ar', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(value));
}
