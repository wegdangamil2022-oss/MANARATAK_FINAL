import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ApiClient, PublicScholarshipDto } from '../../api/client';
import { Button } from '@manaratak/ui';
import { RelatedPublicLinks } from '../../components/RelatedPublicLinks';
import { Seo } from '../../components/Seo';
import { useTranslation } from "../../i18n/I18nProvider";
import { localizePathname } from '../../i18n/localeRouting';
import { CalendarDays, Coins, ExternalLink, FileCheck2, GraduationCap, MapPin, ShieldCheck } from 'lucide-react';

export function ScholarshipDetail() {
  const { t, language } = useTranslation();
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
          <Link to={localizePathname('/scholarships', language)}>{t('browse_all_scholarships')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="-mx-4 -my-6 min-h-screen bg-[#f7f9fc] pb-16 sm:-my-10">
      <Seo title={data.displayName} description={data.coverageDetails || 'Scholarship details, funding coverage, eligibility, and application guidance.'} />
      <div className="relative overflow-hidden bg-gradient-to-b from-[#071d3a] via-[#0b3763] to-[#0b2a50] px-4 pb-14 pt-8 text-white">
        <div className="absolute -left-24 -top-32 h-80 w-80 rounded-full border border-[#d6ae57]/20" />
        <div className="relative mx-auto max-w-5xl">
          <Link to={localizePathname('/scholarships', language)} className="mb-6 inline-flex text-sm font-bold text-blue-100 hover:text-[#e3bd67]">{t('lt_back_to_scholarships')}</Link>
          <div className="mb-3 flex items-center gap-2 text-sm font-black text-[#e3bd67]"><ShieldCheck className="h-5 w-5" />{t('scholarship_details')}</div>
          <h1 className="max-w-4xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">{data.displayName}</h1>
          <div className="flex flex-wrap gap-3 text-sm">
            {data.studyCountry && (
              <span className="mt-5 flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 font-bold"><MapPin className="h-4 w-4 text-[#e3bd67]" />{data.studyCountry}</span>
            )}
            {data.degreeLevel && (
              <span className="mt-5 flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 font-bold"><GraduationCap className="h-4 w-4 text-[#e3bd67]" />{data.degreeLevel}</span>
            )}
            {data.fundingCoverage && (
              <span className="mt-5 flex items-center gap-2 rounded-full bg-[#d6ae57] px-3 py-2 font-black text-[#071d3a]"><Coins className="h-4 w-4" />{data.fundingCoverage}</span>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 pt-8 lg:grid-cols-3">
          {/* Main Details */}
          <div className="space-y-5 lg:col-span-2">
            {data.coverageDetails && (
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-bold mb-3">{t('coverage_details')}</h2>
                <div className="whitespace-pre-wrap text-base leading-8 text-gray-700">{data.coverageDetails}</div>
              </section>
            )}

            {data.eligibilityCriteria && (
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-3 flex items-center gap-2 text-xl font-black text-[#0b2a50]"><FileCheck2 className="h-5 w-5 text-[#b68b34]" />{t('eligibility_criteria')}</h2>
                <div className="whitespace-pre-wrap text-base leading-8 text-gray-700">{data.eligibilityCriteria}</div>
              </section>
            )}
            
            {data.requiredDocuments && (
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-bold mb-3">{t('required_documents')}</h2>
                <div className="whitespace-pre-wrap text-base leading-8 text-gray-700">{data.requiredDocuments}</div>
              </section>
            )}

            {data.eligibleMajorsOrFields && (
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
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
            <div className="rounded-3xl border border-[#d6ae57]/40 bg-white p-5 shadow-xl lg:p-6">
              <h3 className="mb-4 text-lg font-black text-[#0b2a50]">{t('summary')}</h3>
              
              <dl className="space-y-4 text-sm">
                {data.sponsorName && (
                  <div>
                    <dt className="text-gray-500">{t('sponsor')}</dt>
                    <dd className="font-medium">{data.sponsorName}</dd>
                  </div>
                )}
                {data.applicationDeadline && (
                  <div>
                    <dt className="flex items-center gap-2 text-gray-500"><CalendarDays className="h-4 w-4 text-[#b68b34]" />{t('deadline')}</dt>
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
                  <Button asChild className="w-full bg-[#d6ae57] font-black text-[#071d3a] hover:bg-[#e8c979]" size="lg">
                    <a href={data.applicationLink} target="_blank" rel="noopener noreferrer">
                      {t('apply_now')} <ExternalLink className="ms-2 inline h-4 w-4" /></a>
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
      <div className="mx-auto mt-8 max-w-5xl px-4"><RelatedPublicLinks current="scholarships" /></div>
    </div>
  );
}
