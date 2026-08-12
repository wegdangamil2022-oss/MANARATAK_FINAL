import React, { FormEvent, useState } from 'react';
import { ApiClient, PublicCourseDto, PublicInternationalTestDto, PublicScholarshipDto } from '../../api/client';
import { RelatedPublicLinks } from '../../components/RelatedPublicLinks';
import { Seo } from '../../components/Seo';
import { useTranslation } from "../../i18n/I18nProvider";

type CompareType = 'scholarship' | 'course' | 'international-test';
type CompareItem = PublicScholarshipDto | PublicCourseDto | PublicInternationalTestDto;

export function ComparePage() {
    const { t } = useTranslation();
  const [type, setType] = useState<CompareType>('scholarship');
  const [leftSlug, setLeftSlug] = useState('');
  const [rightSlug, setRightSlug] = useState('');
  const [items, setItems] = useState<[CompareItem | null, CompareItem | null]>([null, null]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const [left, right] = await Promise.all([
        fetchByType(type, leftSlug.trim()),
        fetchByType(type, rightSlug.trim()),
      ]);
      setItems([left, right]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Comparison failed');
      setItems([null, null]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Seo title={t('compare_opportunities')} description={t('compare_published_scholarships_courses_and_interna')} />
      <section className="rounded-3xl bg-gradient-to-br from-blue-900 to-slate-950 p-5 text-white shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-200">{t('compare')}</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">{t('compare_opportunities')}</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-200">
          {t('start_with_two_published_slugs_this_first_version_')}</p>
      </section>

      <form onSubmit={submit} className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          <select value={type} onChange={(event) => setType(event.target.value as CompareType)} className="w-full rounded-xl border bg-white px-4 py-3">
            <option value="scholarship">{t('scholarships')}</option>
            <option value="course">{t('courses')}</option>
            <option value="international-test">{t('international_tests')}</option>
          </select>
          <input value={leftSlug} onChange={(event) => setLeftSlug(event.target.value)} placeholder={t('first_slug')} className="w-full rounded-xl border px-4 py-3" />
          <input value={rightSlug} onChange={(event) => setRightSlug(event.target.value)} placeholder={t('second_slug')} className="w-full rounded-xl border px-4 py-3" />
        </div>
        <button type="submit" disabled={!leftSlug.trim() || !rightSlug.trim() || loading} className="mt-3 min-h-12 w-full rounded-xl bg-slate-950 px-5 py-3 font-bold text-white disabled:opacity-50">
          {loading ? 'Comparing...' : 'Compare'}
        </button>
      </form>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>}

      {(items[0] || items[1]) && (
        <section className="grid gap-4 md:grid-cols-2">
          {items.map((item, index) => item && (
            <article key={`${getDisplayName(item)}-${index}`} className="rounded-2xl border bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{type.replace(/-/g, ' ')}</p>
              <h2 className="mt-1 text-2xl font-black">{getDisplayName(item)}</h2>
              <dl className="mt-5 space-y-3 text-sm">
                {getComparisonRows(type, item).map((row) => (
                  <div key={row.label} className="rounded-xl bg-slate-50 p-3">
                    <dt className="font-bold text-slate-700">{row.label}</dt>
                    <dd className="mt-1 leading-6 text-slate-600">{row.value || 'Not specified'}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </section>
      )}

      <RelatedPublicLinks current="compare" />
    </div>
  );
}

async function fetchByType(type: CompareType, slug: string): Promise<CompareItem> {
  if (!slug) throw new Error('Both slugs are required');
  if (type === 'scholarship') return ApiClient.getScholarshipBySlug(slug);
  if (type === 'course') return ApiClient.getCourseBySlug(slug);
  return ApiClient.getInternationalTestBySlug(slug);
}

function getDisplayName(item: CompareItem) {
  const obj = item as Record<string, unknown>;
  const name = obj.displayName || obj.publicId || obj.title || obj.name || obj.slug;
  return typeof name === 'string' ? name : '';
}

function getComparisonRows(type: CompareType, item: CompareItem) {
  if (type === 'scholarship') {
    const scholarship = item as PublicScholarshipDto;
    return [
      { label: 'Funding', value: scholarship.fundingCoverage },
      { label: 'Degree', value: scholarship.degreeLevel },
      { label: 'Country', value: scholarship.studyCountry || '' },
      { label: 'Deadline', value: scholarship.applicationDeadline || '' },
      { label: 'Coverage', value: scholarship.coverageDetails },
    ];
  }
  if (type === 'course') {
    const course = item as PublicCourseDto;
    return [
      { label: 'Access', value: course.accessType },
      { label: 'Type', value: course.originType },
      { label: 'Platform', value: course.platformName || course.providerName || '' },
      { label: 'Language', value: course.learningLanguage || '' },
      { label: 'Duration', value: course.studyDuration || '' },
    ];
  }
  const test = item as PublicInternationalTestDto;
  const scoreScaleDisplay = test.scoreScale
    ? typeof test.scoreScale === 'string'
      ? test.scoreScale
      : `${test.scoreScale.overallMinimum ?? 0} - ${test.scoreScale.overallMaximum ?? 100}`
    : '';
  return [
    { label: 'Provider', value: test.providerName },
    { label: 'Category', value: test.testCategory },
    { label: 'Score Scale', value: scoreScaleDisplay },
    { label: 'Validity', value: test.validityPeriodMonths ? `${test.validityPeriodMonths} months` : '' },
    { label: 'Accepted For', value: Array.isArray(test.acceptedFor) ? (test.acceptedFor as string[]).join(', ') : '' },
  ];
}
