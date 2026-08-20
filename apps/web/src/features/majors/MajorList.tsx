import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { type PaginatedResult, type PublicMajorDto } from '../../api/client';
import { getLocalizedMajors } from '../../api/localizedEntities';
import { Button } from '@manaratak/ui';
import { Seo } from '../../components/Seo';
import { useTranslation } from '../../i18n/I18nProvider';
import { localizePathname } from '../../i18n/localeRouting';

function renderShortList(items?: string[], limit = 3) {
  if (!items || items.length === 0) return null;
  return items.slice(0, limit).join(', ');
}

export function MajorList() {
  const { t, language } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<PaginatedResult<PublicMajorDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const notAvailable = t('not_available');

  const [degreeLevel, setDegreeLevel] = useState(searchParams.get('degreeLevel') || '');
  const [academicFieldOrDiscipline, setAcademicFieldOrDiscipline] = useState(searchParams.get('academicFieldOrDiscipline') || '');
  const [collegeOrFaculty, setCollegeOrFaculty] = useState(searchParams.get('collegeOrFaculty') || '');

  const page = parseInt(searchParams.get('page') || '1', 10);

  const fetchMajors = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getLocalizedMajors(
        {
          degreeLevel: searchParams.get('degreeLevel') || undefined,
          academicFieldOrDiscipline: searchParams.get('academicFieldOrDiscipline') || undefined,
          collegeOrFaculty: searchParams.get('collegeOrFaculty') || undefined,
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
    void fetchMajors();
  }, [language, notAvailable, searchParams]);

  const handleApplyFilters = () => {
    const newParams = new URLSearchParams(searchParams);

    if (degreeLevel) newParams.set('degreeLevel', degreeLevel);
    else newParams.delete('degreeLevel');

    if (academicFieldOrDiscipline) newParams.set('academicFieldOrDiscipline', academicFieldOrDiscipline);
    else newParams.delete('academicFieldOrDiscipline');

    if (collegeOrFaculty) newParams.set('collegeOrFaculty', collegeOrFaculty);
    else newParams.delete('collegeOrFaculty');

    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:gap-8">
      <Seo title={t('majors')} description={t('explore_majors_by_degree_level_academic_field_facu')} />
      <aside className="w-full flex-shrink-0 lg:w-72">
        <div className="rounded-2xl border bg-white p-4 shadow-sm lg:sticky lg:top-4">
          <h2 className="mb-1 text-lg font-bold">{t('find_majors')}</h2>
          <p className="mb-4 text-sm text-gray-500">{t('filter_by_degree_field_or_faculty')}</p>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('degree_level')}</label>
              <input
                type="text"
                placeholder={t('e_g_bachelor_master')}
                value={degreeLevel}
                onChange={(event) => setDegreeLevel(event.target.value)}
                className="w-full rounded-xl border px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('field_discipline')}</label>
              <input
                type="text"
                placeholder={t('e_g_computing_business')}
                value={academicFieldOrDiscipline}
                onChange={(event) => setAcademicFieldOrDiscipline(event.target.value)}
                className="w-full rounded-xl border px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('college_faculty')}</label>
              <input
                type="text"
                placeholder={t('e_g_engineering')}
                value={collegeOrFaculty}
                onChange={(event) => setCollegeOrFaculty(event.target.value)}
                className="w-full rounded-xl border px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button onClick={handleApplyFilters} className="w-full">{t('apply_filters')}</Button>
          </div>
        </div>
      </aside>

      <main className="flex-1">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">{t('study_pathways')}</p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{t('majors')}</h1>
          <p className="mt-2 text-base leading-7 text-gray-600">{t('explore_study_majors_by_degree_level_field_skills_')}</p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">{t('loading_majors')}</div>
        ) : error ? (
          <div className="rounded-lg bg-red-50 py-12 text-center text-red-500">{error}</div>
        ) : !data || data.data.length === 0 ? (
          <div className="rounded-lg bg-gray-50 py-12 text-center text-gray-500">
            {t('no_majors_found_matching_your_criteria')}
          </div>
        ) : (
          <div className="space-y-4">
            {data.data.map((major) => {
              const detailHref = localizePathname(`/majors/${major.slug}`, language);
              return (
                <article key={major.publicId} className="rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
                  <h3 className="mb-2 text-xl font-black leading-snug sm:text-2xl">
                    <Link to={detailHref} className="transition-colors hover:text-blue-600">
                      {major.displayName}
                    </Link>
                  </h3>
                  <p className="mb-4 line-clamp-3 text-base leading-7 text-gray-600">
                    {major.studentFriendlySummary || major.description || notAvailable}
                  </p>
                  <div className="mb-3 flex flex-wrap gap-2 text-sm font-medium text-gray-600">
                    <span className="rounded-full bg-blue-50 px-3 py-2 text-blue-700">{major.degreeLevel}</span>
                    {major.academicFieldOrDiscipline && (
                      <span className="rounded-full bg-gray-100 px-3 py-2">{major.academicFieldOrDiscipline}</span>
                    )}
                    {major.collegeOrFaculty && (
                      <span className="rounded-full bg-gray-100 px-3 py-2">{major.collegeOrFaculty}</span>
                    )}
                  </div>
                  {major.acquiredSkills && major.acquiredSkills.length > 0 && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{t('skills')}</span> {renderShortList(major.acquiredSkills)}
                    </p>
                  )}
                  <Link to={detailHref} className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white">
                    {t('view_major')}
                  </Link>
                </article>
              );
            })}

            {data.totalPages > 1 && (
              <div className="mt-8 flex flex-col justify-center gap-2 border-t pt-4 sm:flex-row">
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
