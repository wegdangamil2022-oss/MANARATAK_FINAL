import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ApiClient, PublicCmsContentDto } from '../../api/client';
import { Button } from '@manaratak/ui';
import { RelatedPublicLinks } from '../../components/RelatedPublicLinks';
import { Seo } from '../../components/Seo';
import { useTranslation } from '../../i18n/I18nProvider';

export function CmsContentDetail() {
  const { t, language } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const locale = searchParams.get('locale') || language;
  const [data, setData] = useState<PublicCmsContentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const result = await ApiClient.getCmsContentBySlug(slug, locale);
        setData(result);
      } catch (reason: unknown) {
        setError(reason instanceof Error ? reason.message : 'Error fetching CMS content');
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [slug, locale]);

  if (loading) {
    return <div className="py-20 text-center text-gray-500">{t('loading_article')}</div>;
  }

  if (error || !data) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">{t('content_not_found')}</h2>
        <p className="text-gray-600 mb-6">
          {error || 'This article is unavailable or unpublished.'}
        </p>
        <Button asChild>
          <Link to="/articles">{t('browse_articles')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto space-y-6">
      <Seo
        title={data.seoMetadata.title || data.title}
        description={data.seoMetadata.description}
        canonicalUrl={data.seoMetadata.canonicalUrl || data.canonicalUrl}
        noIndex={data.seoMetadata.noIndex}
        noFollow={data.seoMetadata.noFollow}
      />
      <Link
        to="/articles"
        className="mb-4 inline-block text-sm font-bold text-blue-700 hover:underline"
      >
        {t('lt_back_to_articles')}
      </Link>

      <header className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#071d3a] via-[#0b3763] to-[#123f6b] p-5 text-white shadow-xl sm:p-8">
        <div className="flex flex-wrap gap-3 text-sm mb-5">
          <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium">
            {formatLabel(data.contentType)}
          </span>
          {data.categorySlug && (
            <span className="bg-gray-100 px-3 py-1.5 rounded-full font-medium">
              {data.categorySlug}
            </span>
          )}
          {data.localizedPayload?.readingTimeMinutes && (
            <span className="bg-gray-100 px-3 py-1.5 rounded-full font-medium">
              {data.localizedPayload.readingTimeMinutes} {t('min_read')}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl mb-4">
          {data.title}
        </h1>
        {data.summary && (
          <p className="text-base leading-8 text-gray-700 sm:text-lg">{data.summary}</p>
        )}
        <div className="mt-6 flex flex-col gap-3 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            {data.publishedAt ? `Published ${formatDate(data.publishedAt)}` : 'Published'}
          </span>
          <select
            aria-label={t('language')}
            value={locale}
            onChange={(event) => {
              const alternate = data.availableLocales.find(
                (entry) => entry.locale === event.target.value,
              );
              if (alternate && alternate.slug !== slug)
                window.location.assign(`/articles/${alternate.slug}?locale=${alternate.locale}`);
              else setSearchParams({ locale: event.target.value });
            }}
            className="min-h-11 border rounded-xl px-3 py-2"
          >
            <option value="en">{t('english')}</option>
            <option value="ar">{t('arabic')}</option>
          </select>
        </div>
      </header>

      <div className="bg-white border rounded-2xl shadow-sm p-5 sm:p-8">
        {data.body ? (
          <div className="prose max-w-none text-gray-800 whitespace-pre-wrap leading-8">
            {data.body}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4">
            {t('this_content_exists_but_the_selected_language_payl')}
          </div>
        )}
      </div>

      {data.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.tags.map((tag) => (
            <span
              key={tag.normalizedValue}
              className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800"
            >
              {tag.label}
            </span>
          ))}
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6 text-sm text-blue-900">
        <h2 className="font-bold mb-2">{t('editorial_boundary')}</h2>
        <p>{t('this_page_renders_cms_approved_editorial_content_b')}</p>
      </div>
      <RelatedPublicLinks current="articles" />
    </article>
  );
}

function formatLabel(value: string): string {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' }).format(
    new Date(value),
  );
}
