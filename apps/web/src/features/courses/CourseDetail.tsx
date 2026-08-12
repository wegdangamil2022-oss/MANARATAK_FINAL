import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiClient, PublicCourseDto } from '../../api/client';
import { Button } from '@manaratak/ui';
import { RelatedPublicLinks } from '../../components/RelatedPublicLinks';
import { Seo } from '../../components/Seo';
import { useTranslation } from "../../i18n/I18nProvider";

function getAccessTypeLabel(accessType?: string | null, t?: (key: string) => string) {
  if (!accessType) return t ? t('not_available') : 'Not available';
  switch (accessType) {
    case 'FREE_STUDY':
      return t ? t('free_study') : 'Free Study';
    case 'FREE_CERTIFICATE':
      return t ? t('free_certificate') : 'Free Certificate';
    case 'FREE_STUDY_AND_CERTIFICATE':
      return t ? t('free_study_and_certificate') : 'Free Study & Certificate';
    case 'PAID':
    case 'PAID_COURSE':
      return t ? t('paid_course') : 'Paid Course';
    default:
      return accessType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}

function getOriginTypeLabel(originType?: string | null, t?: (key: string) => string) {
  if (!originType) return t ? t('not_available') : 'Not available';
  switch (originType) {
    case 'EXTERNAL_LINKED_COURSE':
      return t ? t('global_course') : 'Global Course';
    case 'NATIVE_MANARATAK_COURSE':
      return t ? t('manaratak_course') : 'Manaratak Course';
    case 'PAID_COURSE':
      return t ? t('paid_courses') : 'Paid Courses';
    default:
      return originType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}

function renderStringList(items?: string[], emptyLabel?: string) {
  if (!items || items.length === 0) {
    return <p className="text-gray-500">{emptyLabel || 'Not available'}</p>;
  }

  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {items.map((item, index) => (
        <li key={index} className="rounded-xl border bg-gray-50 p-4 leading-7 text-gray-700">
          {item}
        </li>
      ))}
    </ul>
  );
}

function normalizeRelated(value?: string | string[]) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function CourseDetail() {
    const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PublicCourseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const result = await ApiClient.getCourseBySlug(slug);
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Error fetching course');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [slug]);

  if (loading) {
    return <div className="py-20 text-center text-gray-500">{t('loading_course_details')}</div>;
  }

  if (error || !data) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">{t('course_not_found')}</h2>
        <p className="text-gray-600 mb-6">{error || t('course_not_found_desc')}</p>
        <Button asChild>
          <Link to="/courses">{t('browse_all_courses')}</Link>
        </Button>
      </div>
    );
  }

  const relatedMajors = normalizeRelated(data.relatedMajorsOrFields);
  const isExternal = data.originType === 'EXTERNAL_LINKED_COURSE';

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Seo title={data.displayName} description={data.courseContent || `${data.displayName} ${t('course_seo_description_fallback')}`} />
      <Link to="/courses" className="mb-4 inline-block text-sm font-bold text-blue-700 hover:underline">
        {t('lt_back_to_courses')}</Link>

      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
        <div className="border-b bg-gradient-to-br from-emerald-50 to-white p-5 sm:p-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-700">{t('course_details')}</p>
          <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">{data.displayName}</h1>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-emerald-600 px-3 py-2 font-bold text-white shadow-sm">{getAccessTypeLabel(data.accessType, t)}</span>
            <span className="rounded-full bg-white px-3 py-2 font-bold shadow-sm">{getOriginTypeLabel(data.originType, t)}</span>
            {data.platformName && (
              <span className="rounded-full bg-white px-3 py-2 font-bold shadow-sm">{data.platformName}</span>
            )}
            {data.learningLanguage && (
              <span className="rounded-full bg-white px-3 py-2 font-bold shadow-sm">{data.learningLanguage}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-3 lg:p-8">
          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border bg-white p-5">
              <h2 className="text-xl font-bold mb-3">{t('course_overview')}</h2>
              <p className="whitespace-pre-wrap text-base leading-8 text-gray-700">
                {data.courseContent || `${data.displayName} - ${getAccessTypeLabel(data.accessType, t)} - ${data.platformName || data.providerName || t('learning_provider_fallback')}.`}
              </p>
            </section>

            <section className="rounded-2xl border bg-white p-5">
              <h2 className="text-xl font-bold mb-3">{t('skills_you_may_build')}</h2>
              {renderStringList(data.acquiredSkills, t('skill_info_not_available'))}
            </section>

            {relatedMajors.length > 0 && (
              <section className="rounded-2xl border bg-white p-5">
                <h2 className="text-xl font-bold mb-3">{t('related_majors_or_fields')}</h2>
                <div className="flex flex-wrap gap-2">
                  {relatedMajors.map((item, index) => (
                    <span key={index} className="rounded-full bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700">
                      {item}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {isExternal && (
              <section className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <h2 className="text-lg font-bold mb-2 text-blue-900">{t('external_course_notice')}</h2>
                <p className="text-blue-800 text-sm">
                  {t('this_course_is_opened_on_the_original_learning_pro')}</p>
              </section>
            )}
          </div>

          <aside className="order-first space-y-6 lg:order-none">
            <div className="rounded-2xl border bg-gray-50 p-5 lg:p-6">
              <h3 className="font-bold text-lg mb-4">{t('summary')}</h3>

              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">{t('access')}</dt>
                  <dd className="font-medium">{getAccessTypeLabel(data.accessType, t)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">{t('course_type')}</dt>
                  <dd className="font-medium">{getOriginTypeLabel(data.originType, t)}</dd>
                </div>
                {data.platformName && (
                  <div>
                    <dt className="text-gray-500">{t('platform')}</dt>
                    <dd className="font-medium">{data.platformName}</dd>
                  </div>
                )}
                {data.providerName && (
                  <div>
                    <dt className="text-gray-500">{t('provider')}</dt>
                    <dd className="font-medium">{data.providerName}</dd>
                  </div>
                )}
                {data.studyDuration && (
                  <div>
                    <dt className="text-gray-500">{t('duration')}</dt>
                    <dd className="font-medium">{data.studyDuration}</dd>
                  </div>
                )}
                {data.certificateAvailable !== undefined && data.certificateAvailable !== null && (
                  <div>
                    <dt className="text-gray-500">{t('certificate')}</dt>
                    <dd className="font-medium">{data.certificateAvailable ? t('available') : t('not_available')}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-6 pt-6 border-t space-y-3">
                <Button asChild className="w-full" size="lg">
                  <a href={data.directCourseUrl} target="_blank" rel="noopener noreferrer">
                    {t('go_to_course')}</a>
                </Button>

                {(data.officialSourceUrl || data.sourceUrl) && (
                  <Button variant="outline" asChild className="w-full">
                    <a href={data.officialSourceUrl || data.sourceUrl || data.directCourseUrl} target="_blank" rel="noopener noreferrer">
                      {t('view_source')}</a>
                  </Button>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
      <RelatedPublicLinks current="courses" />
    </div>
  );
}

