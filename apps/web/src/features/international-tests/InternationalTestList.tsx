import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ApiClient, PaginatedResult, PublicInternationalTestDto, PublicInternationalTestFeeMetadataDto, PublicInternationalTestOfficialLinkDto } from '../../api/client';
import { Button } from '@manaratak/ui';
import { Seo } from '../../components/Seo';
import { useTranslation } from "../../i18n/I18nProvider";

const testCategories = ['LANGUAGE_PROFICIENCY', 'UNDERGRAD_ADMISSION', 'GRAD_ADMISSION', 'PROFESSIONAL_LICENSING', 'ACADEMIC_PLACEMENT', 'OTHER'];

export function InternationalTestList() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<PaginatedResult<PublicInternationalTestDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [testCategory, setTestCategory] = useState(searchParams.get('testCategory') || '');
  const [providerName, setProviderName] = useState(searchParams.get('providerName') || '');
  const page = parseInt(searchParams.get('page') || '1', 10);

  const fetchTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await ApiClient.getInternationalTests({
        testCategory: searchParams.get('testCategory') || undefined,
        providerName: searchParams.get('providerName') || undefined,
        page,
        pageSize: 10
      });
      setData(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error fetching international tests';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [searchParams]);

  const applyFilters = () => {
    const nextParams = new URLSearchParams(searchParams);
    if (testCategory) nextParams.set('testCategory', testCategory);
    else nextParams.delete('testCategory');
    if (providerName) nextParams.set('providerName', providerName);
    else nextParams.delete('providerName');
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const changePage = (nextPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', nextPage.toString());
    setSearchParams(nextParams);
  };

  const processedTests = data?.data || [];

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:gap-8">
      <Seo title={t('international_tests')} description={t('browse_international_language_admission_graduate_a')} />
      <aside className="w-full flex-shrink-0 lg:w-72">
        <div className="rounded-2xl border bg-white p-4 shadow-sm lg:sticky lg:top-4">
          <h2 className="text-lg font-bold mb-1">{t('find_a_test')}</h2>
          <p className="mb-4 text-sm text-gray-500">{t('filter_by_test_type_or_provider')}</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('test_category')}</label>
              <select value={testCategory} onChange={(event) => setTestCategory(event.target.value)} className="w-full rounded-xl border px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">{t('all')}</option>
                {testCategories.map((category) => <option key={category} value={category}>{formatLabel(category)}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('provider')}</label>
              <input value={providerName} onChange={(event) => setProviderName(event.target.value)} placeholder={t('provider_examples') || 'ETS, College Board, Cambridge...'} className="w-full rounded-xl border px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <Button onClick={applyFilters} className="w-full">{t('apply_filters')}</Button>
          </div>
        </div>
      </aside>

      <main className="flex-1">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">{t('official_test_guidance')}</p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{t('international_tests')}</h1>
          <p className="mt-2 text-base leading-7 text-gray-600">{t('browse_language_admission_graduate_and_professiona')}</p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">{t('loading_international_tests')}</div>
        ) : error ? (
          <div className="py-12 text-center text-red-500 bg-red-50 rounded-lg">{error}</div>
        ) : processedTests.length === 0 ? (
          <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg">{t('no_international_tests_found_matching_your_criteri')}</div>
        ) : (
          <div className="space-y-4">
            {processedTests.map((test) => {
              return (
                <article key={test.id || test.slug} className="rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="text-xl font-black leading-snug mb-2 sm:text-2xl">
                      <Link to={`/international-tests/${test.slug}`} className="hover:text-blue-600 transition-colors">
                        {test.displayName}
                      </Link>
                    </h3>
                    <p className="text-base leading-7 text-gray-600 mb-3">{test.providerName} {test.testCode ? `- ${test.testCode}` : ''}</p>
                    <div className="flex flex-wrap gap-2 text-sm font-medium text-gray-600">
                      <span className="rounded-full bg-blue-50 px-3 py-2 text-blue-700">{formatLabel(test.testCategory)}</span>
                      {test.scoreScale?.overallMaximum !== undefined && (
                        <span className="rounded-full bg-gray-100 px-3 py-2">
                          {t('score')}: {test.scoreScale.overallMinimum} - {test.scoreScale.overallMaximum}
                        </span>
                      )}
                      {test.scoreScale?.resultValidityDurationMonths && (
                        <span className="rounded-full bg-gray-100 px-3 py-2">
                          {t('valid')}: {test.scoreScale.resultValidityDurationMonths} {t('months')}
                        </span>
                      )}
                      {test.fees && test.fees.length > 0 && (
                        <span className="rounded-full bg-green-50 px-3 py-2 text-green-700">
                          {formatFee(test.fees)}
                        </span>
                      )}
                    </div>
                  </div>
                  {getRegistrationLink(test.officialLinks) && (
                    <a href={getRegistrationLink(test.officialLinks)} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-black px-4 py-3 text-sm font-bold text-white hover:bg-gray-800 lg:min-w-44">
                      {t('official_registration')}
                    </a>
                  )}
                </div>
              </article>
              );
            })}

            {data && data.totalPages > 1 && (
              <div className="flex flex-col justify-center gap-2 mt-8 pt-4 border-t sm:flex-row">
                <Button variant="outline" disabled={page <= 1} onClick={() => changePage(page - 1)}>{t('previous')}</Button>
                <div className="flex items-center px-4">{t('page')}{page} {t('of')}{data.totalPages}</div>
                <Button variant="outline" disabled={page >= data.totalPages} onClick={() => changePage(page + 1)}>{t('next')}</Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function formatFee(fees?: PublicInternationalTestFeeMetadataDto[]) {
  if (!fees || fees.length === 0) return 'Fee not specified';
  const regFee = fees.find(f => f.feeType === 'REGISTRATION') || fees[0];
  return `${regFee.amount} ${regFee.currencyCode}`;
}

function getRegistrationLink(links?: PublicInternationalTestOfficialLinkDto[]) {
  if (!links || links.length === 0) return undefined;
  const regLink = links.find(l => l.linkType === 'REGISTRATION');
  return regLink ? regLink.url : undefined;
}

function formatLabel(value: string) {
  if (!value) return '';
  const translations: Record<string, string> = {
    'LANGUAGE': 'اختبار لغة',
    'ACADEMIC_ADMISSION': 'قبول جامعي',
    'GRADUATE_ADMISSION': 'قبول دراسات عليا',
    'PROFESSIONAL': 'ترخيص مهني',
    'LANGUAGE_PROFICIENCY': 'اختبار لغة',
    'UNDERGRAD_ADMISSION': 'قبول جامعي',
    'GRAD_ADMISSION': 'قبول دراسات عليا',
    'PROFESSIONAL_LICENSING': 'ترخيص مهني',
    'ACADEMIC_PLACEMENT': 'تحديد مستوى أكاديمي',
    'ONLINE': 'عبر الإنترنت',
    'IN_PERSON': 'حضوري',
    'HYBRID': 'هجين',
  };
  if (translations[value]) return translations[value];
  return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}
