import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { type PublicUniversityDto } from '../../api/client';
import { getLocalizedUniversityBySlug } from '../../api/localizedEntities';
import { Button } from '@manaratak/ui';
import { RelatedPublicLinks } from '../../components/RelatedPublicLinks';
import { Seo } from '../../components/Seo';
import { useTranslation } from '../../i18n/I18nProvider';
import { localizePathname } from '../../i18n/localeRouting';

function renderList(items: unknown[] | undefined, emptyLabel: string) {
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
  const { t, language, dir } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PublicUniversityDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const emptyLabel = t('not_available');
  const universitiesHref = localizePathname('/universities', language);

  useEffect(() => {
    const fetchUniversity = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        setData(await getLocalizedUniversityBySlug(slug, language));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : emptyLabel);
      } finally {
        setLoading(false);
      }
    };

    void fetchUniversity();
  }, [emptyLabel, language, slug]);

  if (loading) {
    return (
      <div dir={dir} className="py-20 text-center text-gray-500">
        {t('loading_university_details')}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div dir={dir} className="py-20 text-center">
        <h2 className="mb-4 text-2xl font-bold">{t('university_not_found')}</h2>
        <p className="mb-6 text-gray-600">{error || t('not_available')}</p>
        <Button asChild>
          <Link to={universitiesHref}>{t('browse_all_universities')}</Link>
        </Button>
      </div>
    );
  }

  const description = data.description || emptyLabel;

  return (
    <div dir={dir} className="mx-auto max-w-5xl space-y-6">
      <Seo title={data.displayName} description={data.description || data.displayName} />
      <Link to={universitiesHref} className="mb-4 inline-block text-sm font-bold text-blue-700 hover:underline">
        {t('lt_back_to_universities')}
      </Link>

      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
        <div className="border-b bg-gradient-to-br from-sky-50 to-white p-5 sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            {data.logoAssetId && (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border bg-white px-2 text-center text-xs font-bold text-blue-700 shadow-sm">
                {t('eap_asset')}
              </div>
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
              <h2 className="mb-3 text-xl font-bold">{t('overview')}</h2>
              <p className="whitespace-pre-wrap text-base leading-8 text-gray-700">{description}</p>
            </section>

            <section className="rounded-2xl border bg-white p-5">
              <h2 className="mb-3 text-xl font-bold">{t('academic_programs')}</h2>
              {renderList(data.academicPrograms, emptyLabel)}
            </section>

            <section className="rounded-2xl border bg-white p-5">
              <h2 className="mb-3 text-xl font-bold">{t('campuses')}</h2>
              {renderList(data.campuses, emptyLabel)}
            </section>

            <section className="rounded-2xl border bg-white p-5">
              <h2 className="mb-3 text-xl font-bold">{t('accreditations')}</h2>
              {renderList(data.accreditations, emptyLabel)}
            </section>

            <section className="rounded-2xl border bg-white p-5">
              <h2 className="mb-3 text-xl font-bold">{t('admission_requirements')}</h2>
              {renderList(data.admissionRequirements, emptyLabel)}
            </section>
          </div>

          <aside className="order-first space-y-6 lg:order-none">
            <div className="rounded-2xl border bg-gray-50 p-5 lg:p-6">
              <h3 className="mb-4 text-lg font-bold">{t('summary')}</h3>
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

              <div className="mt-6 space-y-3 border-t pt-6">
                <Button asChild className="w-full" size="lg">
                  <a href={data.officialWebsite} target="_blank" rel="noopener noreferrer">
                    {t('visit_official_website')}
                  </a>
                </Button>

                {(data.officialSourceUrl || data.sourceUrl) && (
                  <Button variant="outline" asChild className="w-full">
                    <a href={data.officialSourceUrl || data.sourceUrl || data.officialWebsite} target="_blank" rel="noopener noreferrer">
                      {t('view_official_source')}
                    </a>
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
