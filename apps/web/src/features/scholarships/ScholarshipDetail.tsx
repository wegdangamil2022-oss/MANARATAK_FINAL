import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ApiClient, PublicScholarshipDto } from '../../api/client';
import { Button } from '@manaratak/ui';
import { RelatedPublicLinks } from '../../components/RelatedPublicLinks';
import { Seo } from '../../components/Seo';
import { useTranslation } from "../../i18n/I18nProvider";

export function ScholarshipDetail() {
    const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PublicScholarshipDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScholarship = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const result = await ApiClient.getScholarshipBySlug(slug);
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Error fetching scholarship');
      } finally {
        setLoading(false);
      }
    };
    fetchScholarship();
  }, [slug]);

  if (loading) {
    return <div className="py-20 text-center text-gray-500">{t('loading_scholarship_details')}</div>;
  }

  if (error || !data) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">{t('scholarship_not_found')}</h2>
        <p className="text-gray-600 mb-6">{error || "The scholarship you are looking for doesn't exist or is not published."}</p>
        <Button asChild>
          <Link to="/scholarships">{t('browse_all_scholarships')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Seo title={data.displayName} description={data.coverageDetails || 'Scholarship details, funding coverage, eligibility, and application guidance.'} />
      <Link to="/scholarships" className="mb-4 inline-block text-sm font-bold text-blue-700 hover:underline">
        {t('lt_back_to_scholarships')}</Link>

      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
        <div className="border-b bg-gradient-to-br from-blue-50 to-white p-5 sm:p-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">{t('scholarship_details')}</p>
          <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">{data.displayName}</h1>
          <div className="flex flex-wrap gap-3 text-sm">
            {data.studyCountry && (
              <span className="rounded-full bg-white px-3 py-2 font-bold shadow-sm">{t('country_1')}{data.studyCountry}</span>
            )}
            {data.degreeLevel && (
              <span className="rounded-full bg-white px-3 py-2 font-bold shadow-sm">{t('degree')}{data.degreeLevel}</span>
            )}
            {data.fundingCoverage && (
              <span className="rounded-full bg-blue-600 px-3 py-2 font-bold text-white shadow-sm">{t('funding')}{data.fundingCoverage}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-3 lg:p-8">
          {/* Main Details */}
          <div className="space-y-5 lg:col-span-2">
            {data.coverageDetails && (
              <section className="rounded-2xl border bg-white p-5">
                <h2 className="text-xl font-bold mb-3">{t('coverage_details')}</h2>
                <div className="whitespace-pre-wrap text-base leading-8 text-gray-700">{data.coverageDetails}</div>
              </section>
            )}

            {data.eligibilityCriteria && (
              <section className="rounded-2xl border bg-white p-5">
                <h2 className="text-xl font-bold mb-3">{t('eligibility_criteria')}</h2>
                <div className="whitespace-pre-wrap text-base leading-8 text-gray-700">{data.eligibilityCriteria}</div>
              </section>
            )}
            
            {data.requiredDocuments && (
              <section className="rounded-2xl border bg-white p-5">
                <h2 className="text-xl font-bold mb-3">{t('required_documents')}</h2>
                <div className="whitespace-pre-wrap text-base leading-8 text-gray-700">{data.requiredDocuments}</div>
              </section>
            )}

            {data.eligibleMajorsOrFields && (
              <section className="rounded-2xl border bg-white p-5">
                <h2 className="text-xl font-bold mb-3">{t('eligible_fields_of_study')}</h2>
                <div className="text-base leading-8 text-gray-700">
                  {Array.isArray(data.eligibleMajorsOrFields) 
                    ? data.eligibleMajorsOrFields.join(', ') 
                    : data.eligibleMajorsOrFields}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="order-first space-y-6 lg:order-none">
            <div className="rounded-2xl border bg-gray-50 p-5 lg:p-6">
              <h3 className="font-bold text-lg mb-4">{t('summary')}</h3>
              
              <dl className="space-y-4 text-sm">
                {data.sponsorName && (
                  <div>
                    <dt className="text-gray-500">{t('sponsor')}</dt>
                    <dd className="font-medium">{data.sponsorName}</dd>
                  </div>
                )}
                {data.applicationDeadline && (
                  <div>
                    <dt className="text-gray-500">{t('deadline')}</dt>
                    <dd className="font-medium text-red-600">
                      {new Date(data.applicationDeadline).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                {data.fundingAmount && (
                  <div>
                    <dt className="text-gray-500">{t('funding_amount')}</dt>
                    <dd className="font-medium">{data.fundingAmount} {data.currency}</dd>
                  </div>
                )}
                {data.duration && (
                  <div>
                    <dt className="text-gray-500">{t('duration')}</dt>
                    <dd className="font-medium">{data.duration}</dd>
                  </div>
                )}
                {data.studyLanguage && (
                  <div>
                    <dt className="text-gray-500">{t('study_language')}</dt>
                    <dd className="font-medium">{data.studyLanguage}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-6 pt-6 border-t space-y-3">
                {data.applicationLink ? (
                  <Button asChild className="w-full" size="lg">
                    <a href={data.applicationLink} target="_blank" rel="noopener noreferrer">
                      {t('apply_now')}</a>
                  </Button>
                ) : (
                  <Button disabled className="w-full" size="lg">
                    {t('application_link_not_available')}</Button>
                )}
                
                {data.officialSourceUrl && (
                  <Button variant="outline" asChild className="w-full">
                    <a href={data.officialSourceUrl} target="_blank" rel="noopener noreferrer">
                      {t('view_official_source')}</a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <RelatedPublicLinks current="scholarships" />
    </div>
  );
}
