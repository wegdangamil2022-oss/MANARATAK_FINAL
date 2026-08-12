import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ApiClient, PaginatedResult, PublicCourseDto } from '../../api/client';
import { Button } from '@manaratak/ui';
import { useTranslation } from "../../i18n/I18nProvider";

function getAccessTypeLabel(accessType: string, t: (key: string) => string) {
  switch (accessType) {
    case 'FREE_STUDY':
      return t('free_study');
    case 'FREE_CERTIFICATE':
      return t('free_certificate');
    case 'FREE_STUDY_AND_CERTIFICATE':
      return t('free_study_and_certificate');
    case 'PAID':
    case 'PAID_COURSE':
      return t('paid_course');
    default:
      return accessType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}

function renderShortList(items?: string[], limit = 3) {
  if (!items || items.length === 0) return null;
  return items.slice(0, limit).join(', ');
}

export function CourseList() {
    const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<PaginatedResult<PublicCourseDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [accessType, setAccessType] = useState(searchParams.get('accessType') || '');
  const [originType, setOriginType] = useState(searchParams.get('originType') || '');
  const [platformName, setPlatformName] = useState(searchParams.get('platformName') || '');
  const [learningLanguage, setLearningLanguage] = useState(searchParams.get('learningLanguage') || '');

  const page = parseInt(searchParams.get('page') || '1', 10);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await ApiClient.getCourses({
        accessType: searchParams.get('accessType') || undefined,
        originType: searchParams.get('originType') || undefined,
        platformName: searchParams.get('platformName') || undefined,
        learningLanguage: searchParams.get('learningLanguage') || undefined,
        page,
        pageSize: 10,
      });
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Error fetching courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [searchParams]);

  const handleApplyFilters = () => {
    const newParams = new URLSearchParams(searchParams);

    if (accessType) newParams.set('accessType', accessType);
    else newParams.delete('accessType');

    if (originType) newParams.set('originType', originType);
    else newParams.delete('originType');

    if (platformName) newParams.set('platformName', platformName);
    else newParams.delete('platformName');

    if (learningLanguage) newParams.set('learningLanguage', learningLanguage);
    else newParams.delete('learningLanguage');

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
      <aside className="w-full md:w-72 space-y-6 flex-shrink-0">
        <div>
          <h2 className="text-lg font-semibold mb-4">{t('filters')}</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('access_type')}</label>
              <select
                value={accessType}
                onChange={(event) => setAccessType(event.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('all')}</option>
                <option value="FREE_STUDY">{t('free_study')}</option>
                <option value="FREE_CERTIFICATE">{t('free_certificate')}</option>
                <option value="FREE_STUDY_AND_CERTIFICATE">{t('free_study_and_certificate')}</option>
                <option value="PAID">{t('paid_course')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('course_type')}</label>
              <select
                value={originType}
                onChange={(event) => setOriginType(event.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('all')}</option>
                <option value="EXTERNAL_LINKED_COURSE">{t('global_courses')}</option>
                <option value="NATIVE_MANARATAK_COURSE">{t('manaratak_courses')}</option>
                <option value="PAID_COURSE">{t('paid_courses')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('platform')}</label>
              <input
                type="text"
                placeholder={t('e_g_coursera_edx')}
                value={platformName}
                onChange={(event) => setPlatformName(event.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('language')}</label>
              <input
                type="text"
                placeholder={t('e_g_english')}
                value={learningLanguage}
                onChange={(event) => setLearningLanguage(event.target.value)}
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
          <h1 className="text-3xl font-bold mb-2">{t('courses')}</h1>
          <p className="text-gray-600">{t('explore_manaratak_courses_global_free_courses_and_')}</p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">{t('loading_courses')}</div>
        ) : error ? (
          <div className="py-12 text-center text-red-500 bg-red-50 rounded-lg">{error}</div>
        ) : !data || data.data.length === 0 ? (
          <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg">
            {t('no_courses_found_matching_your_criteria')}</div>
        ) : (
          <div className="space-y-4">
            {data.data.map((course) => (
              <article key={course.publicId} className="border rounded-xl p-6 hover:shadow-md transition-shadow bg-white">
                <div className="flex justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      <Link to={`/courses/${course.slug}`} className="hover:text-blue-600 transition-colors">
                        {course.displayName}
                      </Link>
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {course.courseContent || `${course.displayName} - ${course.platformName || course.providerName || t('learning_provider_fallback')}.`}
                    </p>

                    <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-3">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md">{getAccessTypeLabel(course.accessType, t)}</span>
                      {course.originType === 'EXTERNAL_LINKED_COURSE' && (
                        <span className="bg-gray-100 px-2 py-1 rounded-md">{t('global_course')}</span>
                      )}
                      {course.originType === 'NATIVE_MANARATAK_COURSE' && (
                        <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md">{t('manaratak_course')}</span>
                      )}
                      {course.platformName && (
                        <span className="bg-gray-100 px-2 py-1 rounded-md">{course.platformName}</span>
                      )}
                      {course.learningLanguage && (
                        <span className="bg-gray-100 px-2 py-1 rounded-md">{course.learningLanguage}</span>
                      )}
                    </div>

                    {course.acquiredSkills && course.acquiredSkills.length > 0 && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{t('skills')}</span> {renderShortList(course.acquiredSkills)}
                      </p>
                    )}
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
