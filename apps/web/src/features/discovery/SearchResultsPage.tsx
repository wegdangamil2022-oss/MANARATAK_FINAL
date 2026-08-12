import React, { FormEvent, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ApiClient, PublicSearchResponseDto } from '../../api/client';
import { RelatedPublicLinks } from '../../components/RelatedPublicLinks';
import { Seo } from '../../components/Seo';
import { useTranslation } from "../../i18n/I18nProvider";

const scopes = [
  { value: 'public', label: 'All public content' },
  { value: 'scholarships', label: 'Scholarships' },
  { value: 'universities', label: 'Universities' },
  { value: 'majors', label: 'Majors' },
  { value: 'courses', label: 'Courses' },
  { value: 'international-tests', label: 'International Tests' },
  { value: 'services', label: 'Services' },
];

export function SearchResultsPage() {
    const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [scope, setScope] = useState(searchParams.get('scope') || 'public');
  const [result, setResult] = useState<PublicSearchResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submittedQuery = searchParams.get('q') || '';
  const submittedScope = searchParams.get('scope') || 'public';

  useEffect(() => {
    if (!submittedQuery.trim()) {
      setResult(null);
      return;
    }

    const runSearch = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ApiClient.search({
          scope: submittedScope,
          query: submittedQuery,
          page: 1,
          limit: 10,
        });
        setResult(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    };

    void runSearch();
  }, [submittedQuery, submittedScope]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const nextParams = new URLSearchParams();
    if (query.trim()) nextParams.set('q', query.trim());
    nextParams.set('scope', scope);
    setSearchParams(nextParams);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Seo title={t('search')} description={t('search_manaratak_public_scholarships_universities_')} />
      <section className="rounded-3xl bg-slate-950 p-5 text-white shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-200">{t('discovery')}</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">{t('search_manaratak')}</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-200">
          {t('search_public_opportunities_and_guides_from_one_mo')}</p>
      </section>

      <form onSubmit={submit} className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('search_scholarships_courses_universities')}
            className="w-full rounded-xl border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select value={scope} onChange={(event) => setScope(event.target.value)} className="w-full rounded-xl border bg-white px-4 py-3 text-base">
            {scopes.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="mt-3 min-h-12 w-full rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700">
          {t('search')}</button>
      </form>

      {loading && <div className="rounded-2xl bg-white p-8 text-center text-gray-500">{t('searching')}</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>}
      {!loading && submittedQuery && result && result.matches.length === 0 && (
        <div className="rounded-2xl bg-white p-8 text-center text-gray-500">{t('no_results_found_try_a_broader_word_or_another_sco')}</div>
      )}

      {result && result.matches.length > 0 && (
        <section className="space-y-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold">{t('results')}</h2>
            <p className="text-sm text-gray-500">{result.totalCount} {t('matches_in')}{result.executionTimeMs}{t('ms')}</p>
          </div>
          {result.matches.map((match, index) => (
            <article key={`${match.target.entityNamespace}-${match.target.resourceKey}-${index}`} className="rounded-2xl border bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{formatNamespace(match.target.entityNamespace)}</p>
              <h3 className="mt-1 text-lg font-black">{getPayloadText(match.payload, 'title') || getPayloadText(match.payload, 'displayName') || match.target.resourceKey}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{getPayloadText(match.payload, 'summary') || getPayloadText(match.payload, 'description') || 'Open the related section to view full details.'}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full bg-slate-100 px-3 py-2 font-medium text-slate-700">{t('score')}{Math.round(match.score * 100)}%</span>
                <Link to={suggestRoute(match.target.entityNamespace, match.target.resourceKey)} className="rounded-full bg-slate-950 px-4 py-2 font-bold text-white">
                  {t('open')}</Link>
              </div>
            </article>
          ))}
        </section>
      )}

      <RelatedPublicLinks current="search" />
    </div>
  );
}

function getPayloadText(payload: Record<string, unknown> | undefined, key: string) {
  const value = payload?.[key];
  return typeof value === 'string' ? value : '';
}

function formatNamespace(namespace: string) {
  return namespace.replace(/[-_.]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function suggestRoute(namespace: string, resourceKey: string) {
  const normalized = namespace.toLowerCase();
  if (normalized.includes('scholarship')) return `/scholarships/${resourceKey}`;
  if (normalized.includes('university')) return `/universities/${resourceKey}`;
  if (normalized.includes('major')) return `/majors/${resourceKey}`;
  if (normalized.includes('course')) return `/courses/${resourceKey}`;
  if (normalized.includes('test')) return `/international-tests/${resourceKey}`;
  if (normalized.includes('service')) return `/services/${resourceKey}`;
  return '/';
}
