import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  ChevronLeft,
  FileText,
  GraduationCap,
  Landmark,
  Search,
  Sparkles,
  Stethoscope,
  Wrench,
} from 'lucide-react';
import {
  CategoryType,
  Exam,
  FavoriteKey,
  FavoriteKind,
  ImportedCourse,
  Major,
  PublicArticle,
  Scholarship,
  Service,
  University,
  CountryDestination,
  StudentToolPreview,
  CareerOpportunityPreview,
} from '../types';
import { FavoriteButton } from './FavoriteButton';

type GlobalResultKind =
  | 'scholarships'
  | 'universities'
  | 'majors'
  | 'countries'
  | 'courses'
  | 'exams'
  | 'articles'
  | 'services'
  | 'tools'
  | 'jobs';

interface GlobalSearchPageProps {
  query: string;
  scholarships: Scholarship[];
  universities: University[];
  majors: Major[];
  countries: CountryDestination[];
  importedCourses: ImportedCourse[];
  exams: Exam[];
  articles: PublicArticle[];
  services: Service[];
  tools: StudentToolPreview[];
  careers: CareerOpportunityPreview[];
  onBack: () => void;
  onOpenSmartSearch: () => void;
  onOpenScholarship: (item: Scholarship) => void;
  onOpenUniversity: (item: University) => void;
  onOpenMajor: (item: Major) => void;
  onOpenExam: (item: Exam) => void;
  onOpenCourse: (item: ImportedCourse) => void;
  onOpenArticle: (item: PublicArticle) => void;
  onOpenService: (item: Service) => void;
  onOpenCountry: (countryId: string) => void;
  onNavigateCategory: (category: CategoryType) => void;
  favoriteKeys?: FavoriteKey[];
  onToggleFavorite?: (kind: FavoriteKind, id: string) => void;
}

interface GlobalSearchResult {
  key: string;
  kind: GlobalResultKind;
  title: string;
  subtitle: string;
  meta?: string;
  raw: any;
}

const CATEGORY_META: Record<GlobalResultKind, { label: string; icon: React.ReactNode }> = {
  scholarships: { label: 'المنح', icon: <GraduationCap className="w-4 h-4" /> },
  universities: { label: 'الجامعات', icon: <Building2 className="w-4 h-4" /> },
  majors: { label: 'التخصصات', icon: <BookOpen className="w-4 h-4" /> },
  countries: { label: 'الدول', icon: <Landmark className="w-4 h-4" /> },
  courses: { label: 'الدورات', icon: <BookOpen className="w-4 h-4" /> },
  exams: { label: 'الاختبارات', icon: <FileText className="w-4 h-4" /> },
  articles: { label: 'المقالات', icon: <FileText className="w-4 h-4" /> },
  services: { label: 'الخدمات', icon: <Stethoscope className="w-4 h-4" /> },
  tools: { label: 'الأدوات', icon: <Wrench className="w-4 h-4" /> },
  jobs: { label: 'الوظائف والتدريب', icon: <BriefcaseBusiness className="w-4 h-4" /> },
};


const favoriteKindForResult = (kind: GlobalResultKind): FavoriteKind => {
  if (kind === 'scholarships') return 'scholarship';
  if (kind === 'universities') return 'university';
  if (kind === 'majors') return 'major';
  if (kind === 'countries') return 'country';
  if (kind === 'courses') return 'course';
  if (kind === 'exams') return 'exam';
  if (kind === 'articles') return 'article';
  if (kind === 'services') return 'service';
  if (kind === 'tools') return 'tool';
  return 'career';
};

const favoriteIdForResult = (result: GlobalSearchResult): string => String(result.raw?.id ?? '');

const normalize = (value: unknown) => String(value ?? '').toLocaleLowerCase('ar').trim();
const searchable = (value: unknown) => normalize(JSON.stringify(value));

export const GlobalSearchPage: React.FC<GlobalSearchPageProps> = ({
  query,
  scholarships,
  universities,
  majors,
  countries,
  importedCourses,
  exams,
  articles,
  services,
  tools,
  careers,
  onBack,
  onOpenSmartSearch,
  onOpenScholarship,
  onOpenUniversity,
  onOpenMajor,
  onOpenExam,
  onOpenCourse,
  onOpenArticle,
  onOpenService,
  onOpenCountry,
  onNavigateCategory,
  favoriteKeys = [],
  onToggleFavorite,
}) => {
  const [selectedKind, setSelectedKind] = useState<'all' | GlobalResultKind>('all');

  const allResults = useMemo<GlobalSearchResult[]>(() => {
    const results: GlobalSearchResult[] = [];

    scholarships.forEach((item) =>
      results.push({
        key: `scholarship-${item.id}`,
        kind: 'scholarships',
        title: item.title,
        subtitle: `${item.countryFlag} ${item.country} · ${item.university}`,
        meta: item.fundingType,
        raw: item,
      }),
    );

    universities.forEach((item: any) =>
      results.push({
        key: `university-${item.id}`,
        kind: 'universities',
        title: item.name,
        subtitle: [item.city, item.country].filter(Boolean).join(' · '),
        meta: item.type || 'جامعة',
        raw: item,
      }),
    );

    majors.forEach((item: any) =>
      results.push({
        key: `major-${item.id}`,
        kind: 'majors',
        title: item.name,
        subtitle: item.nameEn || item.faculty || 'تخصص أكاديمي',
        meta: Array.isArray(item.degreeLevels) ? item.degreeLevels.slice(0, 2).join(' · ') : undefined,
        raw: item,
      }),
    );

    countries.forEach((item: any) =>
      results.push({
        key: `country-${item.id}`,
        kind: 'countries',
        title: `${item.flagEmoji || item.flag || ''} ${item.name}`.trim(),
        subtitle: item.continent || 'وجهة دراسية',
        meta: item.languageOfStudy?.slice?.(0, 2)?.join?.(' · '),
        raw: item,
      }),
    );

    importedCourses.forEach((item: any) =>
      results.push({
        key: `course-${item.id}`,
        kind: 'courses',
        title: item.courseName || item.title,
        subtitle: item.platform || item.provider || 'دورة تدريبية',
        meta: item.language,
        raw: item,
      }),
    );

    exams.forEach((item: any) =>
      results.push({
        key: `exam-${item.id}`,
        kind: 'exams',
        title: item.name,
        subtitle: item.nameEn || item.category || 'اختبار دولي',
        meta: item.category,
        raw: item,
      }),
    );

    articles.forEach((item: any) =>
      results.push({
        key: `article-${item.id}`,
        kind: 'articles',
        title: item.titleAr,
        subtitle: item.excerptAr || item.summary || 'مقال ودليل دراسي',
        meta: item.contentTypeLabelAr || item.contentType,
        raw: item,
      }),
    );

    services.forEach((item: any) =>
      results.push({
        key: `service-${item.id}`,
        kind: 'services',
        title: item.name || item.title,
        subtitle: item.shortDescription || item.description,
        meta: item.category,
        raw: item,
      }),
    );

    tools.forEach((item: any) =>
      results.push({
        key: `tool-${item.id}`,
        kind: 'tools',
        title: item.title,
        subtitle: item.shortDescription,
        meta: `${item.category} · ${item.availability}`,
        raw: item,
      }),
    );

    careers.forEach((item: any) =>
      results.push({
        key: `career-${item.id}`,
        kind: 'jobs',
        title: item.title,
        subtitle: `${item.countryFlag || ''} ${item.country} · ${item.employerName}`.trim(),
        meta: `${item.kind} · ${item.workMode}`,
        raw: item,
      }),
    );

    return results;
  }, [scholarships, universities, majors, countries, importedCourses, exams, articles, services, tools, careers]);

  const baseMatchedResults = useMemo(() => {
    const q = normalize(query);
    const tokens = q.split(/\s+/).filter((token) => token.length > 1);

    return allResults
      .map((item) => {
        if (!q) return { item, score: 1 };
        const haystack = searchable(item.raw) + ' ' + normalize(item.title) + ' ' + normalize(item.subtitle);
        const score = tokens.reduce((total, token) => total + (haystack.includes(token) ? 1 : 0), 0);
        const exactBoost = haystack.includes(q) ? 4 : 0;
        return { item, score: score + exactBoost };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);
  }, [allResults, query]);

  const filteredResults = useMemo(
    () => (selectedKind === 'all' ? baseMatchedResults : baseMatchedResults.filter((item) => item.kind === selectedKind)),
    [baseMatchedResults, selectedKind],
  );

  const counts = useMemo(() => {
    const base = Object.keys(CATEGORY_META).reduce((acc, kind) => {
      acc[kind as GlobalResultKind] = 0;
      return acc;
    }, {} as Record<GlobalResultKind, number>);

    const q = normalize(query);
    const tokens = q.split(/\s+/).filter((token) => token.length > 1);
    allResults.forEach((item) => {
      if (!q || tokens.some((token) => searchable(item.raw).includes(token))) base[item.kind] += 1;
    });
    return base;
  }, [allResults, query]);

  const openResult = (result: GlobalSearchResult) => {
    if (result.kind === 'scholarships') return onOpenScholarship(result.raw as Scholarship);
    if (result.kind === 'universities') return onOpenUniversity(result.raw as University);
    if (result.kind === 'majors') return onOpenMajor(result.raw as Major);
    if (result.kind === 'exams') return onOpenExam(result.raw as Exam);
    if (result.kind === 'courses') return onOpenCourse(result.raw as ImportedCourse);
    if (result.kind === 'articles') return onOpenArticle(result.raw as PublicArticle);
    if (result.kind === 'services') return onOpenService(result.raw as Service);
    if (result.kind === 'countries') return onOpenCountry(result.raw.id);
    if (result.kind === 'tools') return onNavigateCategory('tools');
    return onNavigateCategory('jobs');
  };

  return (
    <div className="min-h-screen bg-[var(--mn-page)] pb-24 mn-panel " dir="rtl">
      <section className="mn-search-hero text-white mn-inverse ">
        <div className="max-w-5xl mx-auto px-4 py-5 sm:py-7">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-xl border border-white/20 bg-white/10 flex items-center justify-center active:scale-95 cursor-pointer"
              aria-label="رجوع"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="text-right flex-1">
              <div className="text-[10px] sm:text-xs text-white font-bold">بحث موحّد في جميع أقسام منارتك</div>
              <h1 className="mt-0.5 text-xl sm:text-2xl font-black font-['Cairo',sans-serif]">نتائج البحث العام</h1>
            </div>
          </div>

          <button
            onClick={onOpenSmartSearch}
            className="mt-4 w-full rounded-2xl border border-[var(--mn-accent)]/50 bg-white/10 px-3.5 py-3 flex items-center justify-between gap-3 text-right active:scale-[0.99] transition-transform cursor-pointer"
          >
            <div>
              <div className="flex items-center gap-1.5 text-[12px] font-black text-[var(--mn-accent)]">
                <Sparkles className="w-4 h-4" />
                جرّب البحث الذكي
              </div>
              <div className="mt-0.5 text-[9px] sm:text-[10px] text-white">حوّل نفس عبارتك إلى طلب مفهوم عبر أكثر من قسم.</div>
            </div>
            <ChevronLeft className="w-4 h-4 text-[var(--mn-accent)] shrink-0" />
          </button>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-3.5 sm:px-5 py-4 space-y-4">
        <div className="rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] px-3.5 py-3 shadow-2xs mn-panel ">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[var(--mn-accent-text)] shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-[var(--mn-text-muted)] font-bold">بحثك الحالي</div>
              <div className="text-xs sm:text-sm font-black text-[var(--mn-heading)] truncate">{query || 'اكتب في شريط البحث أعلى الصفحة'}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedKind('all')}
            className={`px-3 py-2 rounded-xl whitespace-nowrap text-[10px] sm:text-[11px] font-black border cursor-pointer ${
              selectedKind === 'all'
                ? 'bg-[var(--mn-primary)] text-white border-[var(--mn-primary)] mn-inverse '
                : 'bg-[var(--mn-surface)] text-[var(--mn-text-muted)] border-[var(--mn-border)] mn-panel '
            }`}
          >
            الكل · {baseMatchedResults.length}
          </button>
          {(Object.keys(CATEGORY_META) as GlobalResultKind[]).map((kind) => (
            <button
              key={kind}
              onClick={() => setSelectedKind(kind)}
              className={`px-3 py-2 rounded-xl whitespace-nowrap text-[10px] sm:text-[11px] font-black border flex items-center gap-1.5 cursor-pointer ${
                selectedKind === kind
                  ? 'bg-[var(--mn-primary)] text-white border-[var(--mn-primary)] mn-inverse '
                  : 'bg-[var(--mn-surface)] text-[var(--mn-text-muted)] border-[var(--mn-border)] mn-panel '
              }`}
            >
              {CATEGORY_META[kind].icon}
              {CATEGORY_META[kind].label} · {counts[kind]}
            </button>
          ))}
        </div>

        {query.trim() && filteredResults.length > 0 ? (
          <div className="space-y-2.5">
            {filteredResults.slice(0, 30).map((result) => {
              const favoriteKind = favoriteKindForResult(result.kind);
              const favoriteId = favoriteIdForResult(result);
              const favoriteKey = `${favoriteKind}:${favoriteId}` as FavoriteKey;
              const isFavorite = favoriteKeys.includes(favoriteKey);

              return (
                <article
                  key={result.key}
                  onClick={() => openResult(result)}
                  className="w-full rounded-3xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-3.5 text-right shadow-2xs hover:border-[var(--mn-accent)]/60 hover:shadow-sm transition-all active:scale-[0.99] cursor-pointer mn-panel "
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[var(--mn-primary)] text-white flex items-center justify-center shrink-0 mn-inverse ">
                      {CATEGORY_META[result.kind].icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-black text-[var(--mn-accent-text)]">{CATEGORY_META[result.kind].label}</span>
                        {result.meta && <span className="text-[9px] text-[var(--mn-text-muted)] font-bold truncate max-w-[45%]">{result.meta}</span>}
                      </div>
                      <h2 className="mt-0.5 text-[13px] sm:text-sm leading-snug font-black text-[var(--mn-heading)]">{result.title}</h2>
                      <p className="mt-1 text-[10px] sm:text-[11px] leading-5 text-[var(--mn-text-muted)] line-clamp-2">{result.subtitle}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      {favoriteId && onToggleFavorite && (
                        <FavoriteButton
                          active={isFavorite}
                          onToggle={(event) => {
                            event.stopPropagation();
                            onToggleFavorite(favoriteKind, favoriteId);
                          }}
                        />
                      )}
                      <ChevronLeft className="w-4 h-4 text-[var(--mn-accent-text)]" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : query.trim() ? (
          <div className="py-14 text-center rounded-3xl border border-dashed border-[var(--mn-border)] bg-[var(--mn-surface)] mn-panel ">
            <Search className="w-9 h-9 mx-auto text-[var(--mn-text-muted)]" />
            <div className="mt-2 text-xs font-black text-[var(--mn-heading)]">لا توجد نتائج مباشرة بهذه العبارة.</div>
            <button onClick={onOpenSmartSearch} className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--mn-primary)] text-white text-[10px] font-black cursor-pointer mn-inverse ">
              <Sparkles className="w-3.5 h-3.5 text-[var(--mn-accent)]" />
              جرّب البحث الذكي
            </button>
          </div>
        ) : (
          <div className="py-14 text-center rounded-3xl border border-dashed border-[var(--mn-border)] bg-[var(--mn-surface)] mn-panel ">
            <Search className="w-9 h-9 mx-auto text-[var(--mn-text-muted)]" />
            <div className="mt-2 text-xs font-black text-[var(--mn-heading)]">ابدأ بكتابة اسم منحة، جامعة، تخصص، دورة أو فرصة في الأعلى.</div>
            <div className="mt-1 text-[10px] text-[var(--mn-text-muted)]">البحث العام لا يستخدم الذكاء الاصطناعي؛ يعرض نتائج مباشرة من فهرس المنصة.</div>
          </div>
        )}
      </div>
    </div>
  );
};

