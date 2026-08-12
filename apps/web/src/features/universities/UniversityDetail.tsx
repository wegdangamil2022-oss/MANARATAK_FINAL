import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiClient, PublicUniversityDto } from '../../api/client';
import { Button } from '@manaratak/ui';
import { RelatedPublicLinks } from '../../components/RelatedPublicLinks';
import { Seo } from '../../components/Seo';
import { useTranslation } from "../../i18n/I18nProvider";

function renderList(items?: unknown[], emptyLabel = 'Not available') {
  if (!items || items.length === 0) {
    return <p className="text-gray-500">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-2 text-gray-700">
      {items.map((item, index) => (
        <li key={index} className="rounded-xl border bg-gray-50 p-4 leading-7">
          {typeof item === 'string' ? item : JSON.stringify(item)}
        </li>
      ))}
    </ul>
  );
}

export function UniversityDetail() {
    const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PublicUniversityDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUniversity = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const result = await ApiClient.getUniversityBySlug(slug);
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Error fetching university');
      } finally {
        setLoading(false);
      }
    };

    fetchUniversity();
  }, [slug]);

  if (loading) {
    return <div className="py-20 text-center text-gray-500">{t('loading_university_details')}</div>;
  }

  if (error || !data) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">{t('university_not_found')}</h2>
        <p className="text-gray-600 mb-6">{error || "The university you are looking for doesn't exist or is not published."}</p>
        <Button asChild>
          <Link to="/universities">{t('browse_all_universities')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Seo title={data.displayName} description={data.description || `${data.displayName} university profile, programs, campuses, admissions, and official website.`} />
      <Link to="/universities" className="mb-4 inline-block text-sm font-bold text-blue-700 hover:underline">
        {t('lt_back_to_universities')}</Link>

      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
        <div className="border-b bg-gradient-to-br from-sky-50 to-white p-5 sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            {data.logoAssetId && (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border bg-white px-2 text-center text-xs font-bold text-blue-700 shadow-sm">
                {t('eap_asset')}</div>
            )}
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-sky-700">{t('university_details')}</p>
              <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">{data.displayName}</h1>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="rounded-full bg-white px-3 py-2 font-bold shadow-sm">{data.country}</span>
                {data.city && (
                  <span className="rounded-full bg-white px-3 py-2 font-bold shadow-sm">{data.city}</span>
                )}
                <span className="rounded-full bg-sky-600 px-3 py-2 font-bold text-white shadow-sm">{data.institutionType}</span>
                {data.foundedYear && (
                  <span className="rounded-full bg-white px-3 py-2 font-bold shadow-sm">{t('founded')}{data.foundedYear}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-3 lg:p-8">
          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border bg-white p-5">
              <h2 className="text-xl font-bold mb-3">{t('overview')}</h2>
              <p className="whitespace-pre-wrap text-base leading-8 text-gray-700">
                {data.description || `${data.displayName} is listed as a ${data.institutionType} in ${data.country}.`}
              </p>
            </section>

            <section className="rounded-2xl border bg-white p-5">
              <h2 className="text-xl font-bold mb-3">{t('academic_programs')}</h2>
              {renderList(data.academicPrograms, 'Program information is not available yet.')}
            </section>

            <section className="rounded-2xl border bg-white p-5">
              <h2 className="text-xl font-bold mb-3">{t('campuses')}</h2>
              {renderList(data.campuses, 'Campus information is not available yet.')}
            </section>

            <section className="rounded-2xl border bg-white p-5">
              <h2 className="text-xl font-bold mb-3">{t('accreditations')}</h2>
              {renderList(data.accreditations, 'Accreditation information is not available yet.')}
            </section>

            <section className="rounded-2xl border bg-white p-5">
              <h2 className="text-xl font-bold mb-3">{t('admission_requirements')}</h2>
              {renderList(data.admissionRequirements, 'Admission requirement information is not available yet.')}
            </section>
          </div>

          <aside className="order-first space-y-6 lg:order-none">
            <div className="rounded-2xl border bg-gray-50 p-5 lg:p-6">
              <h3 className="font-bold text-lg mb-4">{t('summary')}</h3>

              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">{t('country')}</dt>
                  <dd className="font-medium">{data.country}</dd>
                </div>
                {data.city && (
                  <div>
                    <dt className="text-gray-500">{t('city')}</dt>
                    <dd className="font-medium">{data.city}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-gray-500">{t('institution_type')}</dt>
                  <dd className="font-medium">{data.institutionType}</dd>
                </div>
                {data.languagesOfInstruction && data.languagesOfInstruction.length > 0 && (
                  <div>
                    <dt className="text-gray-500">{t('languages')}</dt>
                    <dd className="font-medium">{data.languagesOfInstruction.join(', ')}</dd>
                  </div>
                )}
                {data.contactEmail && (
                  <div>
                    <dt className="text-gray-500">{t('email')}</dt>
                    <dd className="font-medium">{data.contactEmail}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-6 pt-6 border-t space-y-3">
                <Button asChild className="w-full" size="lg">
                  <a href={data.officialWebsite} target="_blank" rel="noopener noreferrer">
                    {t('visit_official_website')}</a>
                </Button>

                {(data.officialSourceUrl || data.sourceUrl) && (
                  <Button variant="outline" asChild className="w-full">
                    <a href={data.officialSourceUrl || data.sourceUrl || data.officialWebsite} target="_blank" rel="noopener noreferrer">
                      {t('view_official_source')}</a>
                  </Button>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
      <RelatedPublicLinks current="universities" />
    </div>
  );
}

