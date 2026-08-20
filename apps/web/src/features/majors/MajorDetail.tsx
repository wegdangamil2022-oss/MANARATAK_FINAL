import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, BookOpen, BriefcaseBusiness, GraduationCap, Layers3, Link2, Loader2 } from 'lucide-react';
import { type PublicMajorDto } from '../../api/client';
import { getLocalizedMajorBySlug } from '../../api/localizedEntities';
import { Button } from '@manaratak/ui';
import { RelatedPublicLinks } from '../../components/RelatedPublicLinks';
import { Seo } from '../../components/Seo';
import { useTranslation } from '../../i18n/I18nProvider';
import { localizePathname } from '../../i18n/localeRouting';
import { getMajorDegreeTemplate } from './majorDegreeTemplates';

interface MajorContentSectionView {
  sectionKey: string;
  title: string;
  content: string;
  reviewStatus?: string;
}

function normalizeRelated(value?: string | string[]): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeContentSections(data: PublicMajorDto): MajorContentSectionView[] {
  const rawSections = Array.isArray(data.contentSections) ? data.contentSections : [];
  return rawSections
    .map((section, index) => ({
      sectionKey: section.sectionKey || `section-${index + 1}`,
      title: section.title || section.sectionKey || String(index + 1),
      content: section.content || '',
      reviewStatus: section.reviewStatus,
    }))
    .filter((section) => section.content.trim().length > 0);
}

function findSection(
  sections: MajorContentSectionView[],
  templateKey: string,
  titleAr: string,
  titleEn: string,
  aliasesAr: string[] = [],
): MajorContentSectionView | undefined {
  const normalizedKey = templateKey.toLowerCase();
  const normalizedTitleAr = titleAr.trim().toLowerCase();
  const normalizedTitleEn = titleEn.trim().toLowerCase();
  const normalizedAliases = aliasesAr.map((alias) => alias.trim().toLowerCase());

  return sections.find((section) => {
    const key = section.sectionKey.toLowerCase();
    const title = section.title.trim().toLowerCase();
    return (
      key === normalizedKey ||
      key.includes(normalizedKey) ||
      title === normalizedTitleAr ||
      title === normalizedTitleEn ||
      title.includes(normalizedTitleAr) ||
      title.includes(normalizedTitleEn) ||
      normalizedAliases.some((alias) => title === alias || title.includes(alias))
    );
  });
}

function renderStringList(items: string[] | undefined, emptyLabel: string) {
  if (!items || items.length === 0) {
    return <p className="text-[13px] leading-7 text-slate-500">{emptyLabel}</p>;
  }

  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {items.map((item, index) => (
        <li key={index} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-[13px] leading-7 text-slate-700">
          {item}
        </li>
      ))}
    </ul>
  );
}

function InfoTile({
  label,
  value,
  emptyLabel,
}: {
  label: string;
  value?: string | null;
  emptyLabel: string;
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
      <dt className="text-[12px] font-bold text-slate-400">{label}</dt>
      <dd className="mt-1 break-words text-[13px] font-extrabold leading-6 text-slate-900">
        {value || emptyLabel}
      </dd>
    </div>
  );
}

export function MajorDetail() {
  const { t, language, dir } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PublicMajorDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const majorsHref = localizePathname('/majors', language);
  const emptyLabel = t('not_available');

  useEffect(() => {
    const fetchMajor = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        setData(await getLocalizedMajorBySlug(slug, language));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : emptyLabel);
      } finally {
        setLoading(false);
      }
    };

    void fetchMajor();
  }, [emptyLabel, language, slug]);

  const pageModel = useMemo(() => {
    if (!data) return null;
    const template = getMajorDegreeTemplate(data.degreeLevel);
    const contentSections = normalizeContentSections(data);
    const matchedSectionKeys = new Set<string>();
    const templateSections = template.sections.map((section) => {
      const matched = findSection(
        contentSections,
        section.key,
        section.titleAr,
        section.titleEn,
        section.aliasesAr,
      );
      if (matched) matchedSectionKeys.add(matched.sectionKey);
      return { ...section, matched };
    });
    const extraSections = contentSections.filter(
      (section) => !matchedSectionKeys.has(section.sectionKey),
    );
    return { template, templateSections, extraSections };
  }, [data]);

  if (loading) {
    return (
      <main dir={dir} className="flex min-h-[60vh] items-center justify-center px-4" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white px-4 py-3 text-[13px] font-bold text-slate-500 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-700" />
          {t('loading_major_details')}
        </div>
      </main>
    );
  }

  if (error || !data || !pageModel) {
    return (
      <main dir={dir} className="px-4 py-20 text-center" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <h2 className="mb-3 text-[20px] font-black">{t('major_not_found')}</h2>
        <p className="mb-6 text-[14px] leading-7 text-slate-600">{error || emptyLabel}</p>
        <Button asChild>
          <Link to={majorsHref}>{t('browse_all_majors')}</Link>
        </Button>
      </main>
    );
  }

  const relatedMajors = normalizeRelated(data.relatedMajors);
  const phaseLinks = Array.isArray(data.phaseLinks) ? data.phaseLinks : [];
  const { template, templateSections, extraSections } = pageModel;
  const degreeLabel = language === 'ar' ? template.labelAr : template.labelEn;
  const summaryText = data.studentFriendlySummary || data.description || emptyLabel;

  return (
    <main dir={dir} className="mx-auto max-w-6xl space-y-5 px-4 py-4 sm:px-6 lg:px-8" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <Seo title={data.displayName} description={data.studentFriendlySummary || data.description || data.displayName} />

      <Link to={majorsHref} className="inline-flex min-h-10 items-center gap-2 text-[13px] font-extrabold text-emerald-800 hover:text-emerald-950">
        <ArrowRight className={`h-4 w-4 ${dir === 'rtl' ? '' : 'rotate-180'}`} />
        {t('lt_back_to_majors')}
      </Link>

      <header className="rounded-xl bg-[#071322] p-4 text-white shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-md bg-emerald-400/15 px-2.5 py-1 text-[12px] font-bold text-emerald-200">{degreeLabel}</span>
              {data.classificationCode && (
                <span className="rounded-md bg-white/10 px-2.5 py-1 font-mono text-[12px] font-bold">{data.classificationCode}</span>
              )}
              {data.academicFieldOrDiscipline && (
                <span className="rounded-md bg-blue-400/15 px-2.5 py-1 text-[12px] font-bold text-blue-100">{data.academicFieldOrDiscipline}</span>
              )}
            </div>
            <h1 className="text-[24px] font-black leading-9 sm:text-[34px]">{data.displayName}</h1>
            <p className="mt-3 max-w-3xl text-[13px] leading-7 text-slate-300">{summaryText}</p>
          </div>

          <dl className="grid grid-cols-1 gap-2 text-white sm:grid-cols-3 lg:w-[440px]">
            <InfoTile label={t('degree_level')} value={degreeLabel} emptyLabel={emptyLabel} />
            <InfoTile label={t('field_discipline')} value={data.academicFieldOrDiscipline} emptyLabel={emptyLabel} />
            <InfoTile label={t('college_faculty')} value={data.collegeOrFaculty} emptyLabel={emptyLabel} />
          </dl>
        </div>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-2 flex items-center gap-2 text-[17px] font-black text-slate-950">
          <BookOpen className="h-5 w-5 text-emerald-700" />
          {t('overview')}
        </h2>
        <p className="whitespace-pre-wrap text-[14px] leading-8 text-slate-700">{summaryText}</p>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <section className="space-y-3">
          {templateSections.map((section) => {
            const heading = section.matched?.title || (language === 'ar' ? section.titleAr : section.titleEn);
            return (
              <article key={section.key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-[16px] font-black leading-7 text-slate-950">{heading}</h2>
                <p className="mt-2 whitespace-pre-wrap text-[13px] leading-8 text-slate-700">
                  {section.matched?.content || emptyLabel}
                </p>
              </article>
            );
          })}

          {extraSections.map((section) => (
            <article key={section.sectionKey} className="rounded-xl border border-dashed border-slate-300 bg-white p-4">
              <h2 className="text-[16px] font-black leading-7 text-slate-950">{section.title}</h2>
              <p className="mt-2 whitespace-pre-wrap text-[13px] leading-8 text-slate-700">{section.content}</p>
            </article>
          ))}
        </section>

        <aside className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-[16px] font-black">
              <Layers3 className="h-5 w-5 text-blue-700" />
              {t('summary')}
            </h2>
            <dl className="grid gap-2">
              <InfoTile label={t('degree_level')} value={degreeLabel} emptyLabel={emptyLabel} />
              <InfoTile label={t('field_discipline')} value={data.academicFieldOrDiscipline} emptyLabel={emptyLabel} />
              <InfoTile label={t('college_faculty')} value={data.collegeOrFaculty} emptyLabel={emptyLabel} />
            </dl>
            {(data.officialSourceUrl || data.sourceUrl) && (
              <Button variant="outline" asChild className="mt-4 min-h-11 w-full text-[13px]">
                <a href={data.officialSourceUrl || data.sourceUrl || '#'} target="_blank" rel="noopener noreferrer">
                  {t('view_source')}
                </a>
              </Button>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-[16px] font-black">
              <GraduationCap className="h-5 w-5 text-emerald-700" />
              {t('skills')}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-[13px] font-extrabold text-slate-700">{t('skills_you_may_build')}</h3>
                {renderStringList(data.acquiredSkills, emptyLabel)}
              </div>
              <div>
                <h3 className="mb-2 text-[13px] font-extrabold text-slate-700">{t('typical_courses')}</h3>
                {renderStringList(data.typicalCourses, emptyLabel)}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-[16px] font-black">
              <BriefcaseBusiness className="h-5 w-5 text-slate-700" />
              {t('career_outcomes')}
            </h2>
            {renderStringList(data.careerOutcomes, emptyLabel)}
          </section>

          {phaseLinks.length > 0 && (
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="grid gap-2">
                {phaseLinks.map((link) => (
                  <Link
                    key={`${link.phase}-${link.targetType}-${link.relationship}`}
                    to={localizePathname(link.href, language)}
                    className="rounded-lg border border-slate-100 bg-slate-50 p-3 transition hover:border-emerald-200 hover:bg-emerald-50"
                  >
                    <span className="block text-[12px] font-black text-emerald-800">{link.label || link.targetType}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {relatedMajors.length > 0 && (
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-[16px] font-black">
                <Link2 className="h-5 w-5 text-emerald-700" />
                {t('related_majors')}
              </h2>
              <div className="flex flex-wrap gap-2">
                {relatedMajors.map((major, index) => (
                  <span key={index} className="rounded-full bg-slate-100 px-3 py-2 text-[12px] font-bold text-slate-700">
                    {major}
                  </span>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>

      <RelatedPublicLinks current="majors" />
    </main>
  );
}
