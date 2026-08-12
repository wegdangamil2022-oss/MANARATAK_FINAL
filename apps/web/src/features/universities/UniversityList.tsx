import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ApiClient, PaginatedResult, PublicUniversityDto } from '../../api/client';
import { Button } from '@manaratak/ui';
import { useTranslation } from "../../i18n/I18nProvider";

export function UniversityList() {
    const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<PaginatedResult<PublicUniversityDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [country, setCountry] = useState(searchParams.get('country') || '');
  const [institutionType, setInstitutionType] = useState(searchParams.get('institutionType') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');

  const page = parseInt(searchParams.get('page') || '1', 10);

  const fetchUniversities = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await ApiClient.getUniversities({
        country: searchParams.get('country') || undefined,
        institutionType: searchParams.get('institutionType') || undefined,
        city: searchParams.get('city') || undefined,
        page,
        pageSize: 10,
      });
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Error fetching universities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, [searchParams]);

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
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="w-full md:w-64 space-y-6 flex-shrink-0">
        <div>
          <h2 className="text-lg font-semibold mb-4">{t('filters')}</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('country')}</label>
              <input
                type="text"
                placeholder={t('e_g_qatar_turkey')}
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('institution_type')}</label>
              <input
                type="text"
                placeholder={t('e_g_public_university')}
                value={institutionType}
                onChange={(event) => setInstitutionType(event.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('city')}</label>
              <input
                type="text"
                placeholder={t('e_g_doha')}
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button onClick={handleApplyFilters} className="w-full">
              {t('apply_filters')}</Button>
          </div>
        </div>
      </aside>

      <main className="flex-1">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{t('universities')}</h1>
          <p className="text-gray-600">{t('explore_published_universities_and_institutions_pr')}</p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">{t('loading_universities')}</div>
        ) : error ? (
          <div className="py-12 text-center text-red-500 bg-red-50 rounded-lg">{error}</div>
        ) : !data || data.data.length === 0 ? (
          <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg">
            {t('no_universities_found_matching_your_criteria')}</div>
        ) : (
          <div className="space-y-4">
            {data.data.map((university) => (
              <article key={university.publicId} className="border rounded-xl p-6 hover:shadow-md transition-shadow bg-white">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      <Link to={`/universities/${university.slug}`} className="hover:text-blue-600 transition-colors">
                        {university.displayName}
                      </Link>
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {university.description || `${university.institutionType} in ${university.country}.`}
                    </p>

                    <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded-md">{university.country}</span>
                      {university.city && (
                        <span className="bg-gray-100 px-2 py-1 rounded-md">{university.city}</span>
                      )}
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md">{university.institutionType}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            {data.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8 pt-4 border-t">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  {t('previous')}</Button>
                <div className="flex items-center px-4">
                  {t('page')}{page} {t('of')}{data.totalPages}
                </div>
                <Button
                  variant="outline"
                  disabled={page >= data.totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  {t('next')}</Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
