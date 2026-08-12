import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, BookOpen, BriefcaseBusiness, GraduationCap, Layers3, Link2, Loader2 } from 'lucide-react';
import { ApiClient, PublicMajorDto } from '../../api/client';
import { Button } from '@manaratak/ui';
import { RelatedPublicLinks } from '../../components/RelatedPublicLinks';
import { Seo } from '../../components/Seo';
import { useTranslation } from '../../i18n/I18nProvider';
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
      title: section.title || section.sectionKey || `قسم ${index + 1}`,
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
  aliasesAr: string[] = []
): MajorContentSectionView | undefined {
  const normalizedKey = templateKey.toLowerCase();
  const normalizedTitleAr = titleAr.trim().toLowerCase();
  const normalizedTitleEn = titleEn.trim().toLowerCase();
  const normalizedAliases = aliasesAr.map(a => a.trim().toLowerCase());

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
      normalizedAliases.some(alias => title === alias || title.includes(alias))
    );
  });
}

function renderStringList(items?: string[], emptyLabel = 'غير متوفر بعد') {
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

function getPhaseLinkLabel(targetType: string): string {
  switch (targetType) {
    case 'ACADEMIC_PROGRAM':
      return 'البرامج الجامعية';
    case 'SCHOLARSHIP':
      return 'المنح المناسبة';
    case 'COURSE':
      return 'الدورات المرتبطة';
    case 'CAREER':
      return 'المسارات المهنية';
    case 'JOB':
      return 'الوظائف المرتبطة';
    case 'TAXONOMY_NODE':
      return 'التصنيف الأكاديمي';
    default:
      return 'رابط مرتبط';
  }
}

function InfoTile({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
      <dt className="text-[12px] font-bold text-slate-400">{label}</dt>
      <dd className="mt-1 break-words text-[13px] font-extrabold leading-6 text-slate-900">{value || 'غير محدد'}</dd>
    </div>
  );
}

export function MajorDetail() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PublicMajorDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMajor = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const result = await ApiClient.getMajorBySlug(slug);
        setData(result);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error fetching major');
      } finally {
        setLoading(false);
      }
    };

    void fetchMajor();
  }, [slug]);

  const pageModel = useMemo(() => {
    if (!data) return null;
    const template = getMajorDegreeTemplate(data.degreeLevel);
    const contentSections = normalizeContentSections(data);
    const matchedSectionKeys = new Set<string>();
    const templateSections = template.sections.map((section) => {
      const matched = findSection(contentSections, section.key, section.titleAr, section.titleEn, section.aliasesAr);
      if (matched) matchedSectionKeys.add(matched.sectionKey);
      return { ...section, matched };
    });
    const extraSections = contentSections.filter((section) => !matchedSectionKeys.has(section.sectionKey));

    return { template, templateSections, extraSections };
  }, [data]);

  if (loading) {
    return (
      <main dir="rtl" className="flex min-h-[60vh] items-center justify-center px-4" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white px-4 py-3 text-[13px] font-bold text-slate-500 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-700" />
          {t('loading_major_details')}
        </div>
      </main>
    );
  }

  if (error || !data || !pageModel) {
    return (
      <main dir="rtl" className="px-4 py-20 text-center" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <h2 className="mb-3 text-[20px] font-black">{t('major_not_found')}</h2>
        <p className="mb-6 text-[14px] leading-7 text-slate-600">{error || "The major you are looking for doesn't exist or is not published."}</p>
        <Button asChild>
          <Link to="/majors">{t('browse_all_majors')}</Link>
        </Button>
      </main>
    );
  }

  const relatedMajors = normalizeRelated(data.relatedMajors);
  const phaseLinks = Array.isArray(data.phaseLinks) ? data.phaseLinks : [];
  const { template, templateSections, extraSections } = pageModel;
  const summaryText = data.studentFriendlySummary || data.description || `${data.displayName} is a ${data.degreeLevel} study pathway.`;

  return (
    <main dir="rtl" className="mx-auto max-w-6xl space-y-5 px-4 py-4 sm:px-6 lg:px-8" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <Seo title={data.displayName} description={summaryText} />

      <Link to="/majors" className="inline-flex min-h-10 items-center gap-2 text-[13px] font-extrabold text-emerald-800 hover:text-emerald-950">
        <ArrowRight className="h-4 w-4" />
        {t('lt_back_to_majors')}
      </Link>

      <header className="rounded-xl bg-[#071322] p-4 text-white shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-md bg-emerald-400/15 px-2.5 py-1 text-[12px] font-bold text-emerald-200">{template.labelAr}</span>
              {data.classificationCode && <span className="rounded-md bg-white/10 px-2.5 py-1 font-mono text-[12px] font-bold">{data.classificationCode}</span>}
              {data.academicFieldOrDiscipline && <span className="rounded-md bg-blue-400/15 px-2.5 py-1 text-[12px] font-bold text-blue-100">{data.academicFieldOrDiscipline}</span>}
            </div>
            <h1 className="text-[24px] font-black leading-9 sm:text-[34px]">{data.displayName}</h1>
            {data.localizedNames?.en && <p dir="ltr" className="mt-2 text-right text-[13px] font-semibold text-slate-300">{data.localizedNames.en}</p>}
            <p className="mt-3 max-w-3xl text-[13px] leading-7 text-slate-300">{template.summaryAr}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-white sm:grid-cols-4 lg:w-[440px]">
            <InfoTile label="الدرجة" value={template.labelAr} />
            <InfoTile label="الأقسام" value={String(templateSections.filter((section) => section.matched).length)} />
            <InfoTile label="أقسام إضافية" value={String(extraSections.length)} />
            <InfoTile label="المصدر" value={data.sourceClassificationSystem} />
          </div>
        </div>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-2 flex items-center gap-2 text-[17px] font-black text-slate-950">
          <BookOpen className="h-5 w-5 text-emerald-700" />
          النبذة
        </h2>
        <p className="whitespace-pre-wrap text-[14px] leading-8 text-slate-700">{summaryText}</p>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <section className="space-y-3">
          {templateSections.map((section) => (
            <article key={section.key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-[16px] font-black leading-7 text-slate-950">{section.titleAr}</h2>
                <span className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-bold ${section.matched ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                  {section.matched ? 'موجود في الملف' : 'ينتظر التفاصيل'}
                </span>
              </div>
              {section.matched ? (
                <p className="mt-2 whitespace-pre-wrap text-[13px] leading-8 text-slate-700">{section.matched.content}</p>
              ) : (
                <p className="mt-2 text-[13px] leading-7 text-slate-500">{section.purposeAr}</p>
              )}
            </article>
          ))}

          {extraSections.length > 0 && (
            <section className="rounded-xl border border-dashed border-slate-300 bg-white p-4">
              <h2 className="mb-3 text-[16px] font-black text-slate-950">أقسام إضافية محفوظة من الملف</h2>
              <div className="grid gap-2">
                {extraSections.map((section) => (
                  <article key={section.sectionKey} className="rounded-lg bg-slate-50 p-3">
                    <h3 className="text-[14px] font-extrabold text-slate-900">{section.title}</h3>
                    <p className="mt-1 text-[13px] leading-7 text-slate-600">{section.content}</p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-[16px] font-black">
              <Layers3 className="h-5 w-5 text-blue-700" />
              ملخص التخصص
            </h2>
            <dl className="grid gap-2">
              <InfoTile label="الدرجة" value={template.labelAr} />
              <InfoTile label="المجال" value={data.academicFieldOrDiscipline} />
              <InfoTile label="الكلية أو السياق" value={data.collegeOrFaculty} />
              <InfoTile label="رمز التصنيف" value={data.classificationCode} />
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
              المهارات والمقررات
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-[13px] font-extrabold text-slate-700">{t('skills_you_may_build')}</h3>
                {renderStringList(data.acquiredSkills)}
              </div>
              <div>
                <h3 className="mb-2 text-[13px] font-extrabold text-slate-700">{t('typical_courses')}</h3>
                {renderStringList(data.typicalCourses)}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-[16px] font-black">
              <BriefcaseBusiness className="h-5 w-5 text-slate-700" />
              {t('career_outcomes')}
            </h2>
            {renderStringList(data.careerOutcomes)}
          </section>

          {phaseLinks.length > 0 && (
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-[16px] font-black">
                <Link2 className="h-5 w-5 text-emerald-700" />
                روابط المراحل المرتبطة
              </h2>
              <div className="grid gap-2">
                {phaseLinks.map((link) => (
                  <Link
                    key={`${link.phase}-${link.targetType}-${link.relationship}`}
                    to={link.href}
                    className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-right transition hover:border-emerald-200 hover:bg-emerald-50"
                  >
                    <span className="block text-[12px] font-black text-emerald-800">{getPhaseLinkLabel(link.targetType)}</span>
                    <span className="mt-1 block text-[12px] leading-6 text-slate-500">المرحلة {link.phase} · {link.relationship}</span>
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
