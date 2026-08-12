import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ApiClient, PublicScholarshipDto, PaginatedResult } from '../../api/client';
import { Button } from '@manaratak/ui';
import { Seo } from '../../components/Seo';
import { useTranslation } from "../../i18n/I18nProvider";

export function ScholarshipList() {
    const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<PaginatedResult<PublicScholarshipDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [country, setCountry] = useState(searchParams.get('studyCountry') || '');
  const [degree, setDegree] = useState(searchParams.get('degreeLevel') || '');
  const [funding, setFunding] = useState(searchParams.get('fundingCoverage') || '');
  
  const page = parseInt(searchParams.get('page') || '1', 10);

  const fetchScholarships = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {
        studyCountry: searchParams.get('studyCountry') || undefined,
        degreeLevel: searchParams.get('degreeLevel') || undefined,
        fundingCoverage: searchParams.get('fundingCoverage') || undefined,
        page: page,
        pageSize: 10,
      };
      const result = await ApiClient.getScholarships(filters);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Error fetching scholarships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, [searchParams]);

  const handleApplyFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    if (country) newParams.set('studyCountry', country);
    else newParams.delete('studyCountry');
    
    if (degree && degree !== 'all') newParams.set('degreeLevel', degree);
    else newParams.delete('degreeLevel');

    if (funding && funding !== 'all') newParams.set('fundingCoverage', funding);
    else newParams.delete('fundingCoverage');

    newParams.set('page', '1'); // Reset to page 1 on filter
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:gap-8">
      <Seo title={t('scholarships')} description={t('browse_published_scholarships_with_funding_eligibi')} />
      {/* Sidebar Filters */}
      <div className="w-full flex-shrink-0 lg:w-72">
        <div className="rounded-2xl border bg-white p-4 shadow-sm lg:sticky lg:top-4">
          <h2 className="text-lg font-bold mb-1">{t('find_scholarships')}</h2>
          <p className="mb-4 text-sm text-gray-500">{t('use_quick_filters_then_open_the_card_for_details')}</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('study_country')}</label>
              <input 
                type="text"
                placeholder={t('e_g_usa_uk')} 
                value={country} 
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-xl border px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('degree_level')}</label>
              <select 
                value={degree} 
                onChange={(e) => setDegree(e.target.value)}
                className="w-full rounded-xl border bg-white px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('any_level')}</option>
                <option value="BACHELORS">{t('bachelors')}</option>
                <option value="MASTERS">{t('masters')}</option>
                <option value="PHD">{t('phd')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('funding_coverage')}</label>
              <select 
                value={funding} 
                onChange={(e) => setFunding(e.target.value)}
                className="w-full rounded-xl border bg-white px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('any_funding')}</option>
                <option value="FULLY_FUNDED">{t('fully_funded')}</option>
                <option value="PARTIAL">{t('partial')}</option>
                <option value="TUITION_ONLY">{t('tuition_only')}</option>
              </select>
            </div>

            <Button onClick={handleApplyFilters} className="w-full">
              {t('apply_filters')}</Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">{t('funding_opportunities')}</p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{t('scholarships')}</h1>
          <p className="mt-2 text-base leading-7 text-gray-600">{t('clear_cards_with_funding_degree_level_country_and_')}</p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">{t('loading_scholarships')}</div>
        ) : error ? (
          <div className="py-12 text-center text-red-500 bg-red-50 rounded-lg">{error}</div>
        ) : !data || data.data.length === 0 ? (
          <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg">
            {t('no_scholarships_found_matching_your_criteria')}</div>
        ) : (
          <div className="space-y-4">
            {data.data.map((scholarship) => (
              <div key={scholarship.publicId} className="rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-xl font-black leading-snug mb-2 sm:text-2xl">
                      <Link to={`/scholarships/${scholarship.slug}`} className="hover:text-blue-600 transition-colors">
                        {scholarship.displayName}
                      </Link>
                    </h3>
                    <p className="text-base leading-7 text-gray-600 mb-4 line-clamp-3">{scholarship.coverageDetails}</p>
                    
                    <div className="flex flex-wrap gap-2 text-sm font-medium text-gray-600">
                      {scholarship.studyCountry && (
                        <span className="rounded-full bg-gray-100 px-3 py-2">{t('country_1')}{scholarship.studyCountry}</span>
                      )}
                      {scholarship.degreeLevel && (
                        <span className="rounded-full bg-gray-100 px-3 py-2">{t('degree')}{scholarship.degreeLevel}</span>
                      )}
                      {scholarship.fundingCoverage && (
                        <span className="rounded-full bg-blue-50 px-3 py-2 text-blue-700">{t('funding')}{scholarship.fundingCoverage}</span>
                      )}
                    </div>
                  </div>
                  <Link to={`/scholarships/${scholarship.slug}`} className="min-h-12 rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-bold text-white sm:self-start">
                    {t('view_scholarship')}</Link>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex flex-col justify-center gap-2 mt-8 pt-4 border-t sm:flex-row">
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
      </div>
    </div>
  );
}
