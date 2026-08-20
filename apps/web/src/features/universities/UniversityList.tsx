import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { type PaginatedResult, type PublicUniversityDto } from '../../api/client';
import { getLocalizedUniversities } from '../../api/localizedEntities';
import { Button } from '@manaratak/ui';
import { useTranslation } from '../../i18n/I18nProvider';
import { localizePathname } from '../../i18n/localeRouting';

export function UniversityList() {
  const { t, language } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<PaginatedResult<PublicUniversityDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const notAvailable = t('not_available');

  const [country, setCountry] = useState(searchParams.get('country') || '');
  const [institutionType, setInstitutionType] = useState(searchParams.get('institutionType') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');

  const page = parseInt(searchParams.get('page') || '1', 10);

  const fetchUniversities = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getLocalizedUniversities(
        {
          country: searchParams.get('country') || undefined,
          institutionType: searchParams.get('institutionType') || undefined,
          city: searchParams.get('city') || undefined,
          page,
          pageSize: 10,
        },
        language,
      );
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : notAvailable);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUniversities();
  }, [language, notAvailable, searchParams]);

  const handleApplyFilters = () => {
    const newParams = new URLSearchParams(searchParams);

    if (country) newParams.set('country', country);
    else newParams.delete('country');

    if (institutionType) newParams.set('institutionType', institutionType);
    else newParams.delete('institutionType');

    if (city) newParams.set('city', city);
    else newParams.delete('city');

    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <aside className="w-full flex-shrink-0 space-y-6 md:w-64">
        <div>
          <h2 className="mb-4 text-lg font-semibold">{t('filters')}</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('country')}</label>
              <input
                type="text"
                placeholder={t('e_g_qatar_turkey')}
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">{t('institution_type')}</label>
              <input
                type="text"
                placeholder={t('e_g_public_university')}
                value={institutionType}
                onChange={(event) => setInstitutionType(event.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">{t('city')}</label>
              <input
                type="text"
                placeholder={t('e_g_doha')}
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button onClick={handleApplyFilters} className="w-full">
              {t('apply_filters')}
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1">
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold">{t('universities')}</h1>
          <p className="text-gray-600">{t('explore_published_universities_and_institutions_pr')}</p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">{t('loading_universities')}</div>
        ) : error ? (
          <div className="rounded-lg bg-red-50 py-12 text-center text-red-500">{error}</div>
        ) : !data || data.data.length === 0 ? (
          <div className="rounded-lg bg-gray-50 py-12 text-center text-gray-500">
            {t('no_universities_found_matching_your_criteria')}
          </div>
        ) : (
          <div className="space-y-4">
            {data.data.map((university) => {
              const detailHref = localizePathname(`/universities/${university.slug}`, language);
              return (
                <article key={university.publicId} className="rounded-xl border bg-white p-6 transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="mb-2 text-xl font-bold">
                        <Link to={detailHref} className="transition-colors hover:text-blue-600">
                          {university.displayName}
                        </Link>
                      </h3>
                      <p className="mb-4 line-clamp-2 text-gray-600">
                        {university.description || notAvailable}
                      </p>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                        <span className="rounded-md bg-gray-100 px-2 py-1">{university.country}</span>
                        {university.city && (
                          <span className="rounded-md bg-gray-100 px-2 py-1">{university.city}</span>
                        )}
                        <span className="rounded-md bg-blue-50 px-2 py-1 text-blue-700">{university.institutionType}</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            {data.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2 border-t pt-4">
                <Button variant="outline" disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>
                  {t('previous')}
                </Button>
                <div className="flex items-center px-4">
                  {t('page')}{page} {t('of')}{data.totalPages}
                </div>
                <Button
                  variant="outline"
                  disabled={page >= data.totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  {t('next')}
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
