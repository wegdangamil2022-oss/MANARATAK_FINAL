import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
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
import type {
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
import {
  buildGlobalSearchDocuments,
  rankGlobalSearchDocuments,
  type GlobalResultKind,
  type GlobalSearchTarget,
  type RankedGlobalSearchResult,
} from '../globalSearchIndex';
import { FavoriteButton } from './FavoriteButton';

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
  onOpenScholarship: (item: Scholarship, target?: GlobalSearchTarget) => void;
  onOpenUniversity: (item: University, target?: GlobalSearchTarget) => void;
  onOpenMajor: (item: Major, target?: GlobalSearchTarget) => void;
  onOpenExam: (item: Exam, target?: GlobalSearchTarget) => void;
  onOpenCourse: (item: ImportedCourse, target?: GlobalSearchTarget) => void;
  onOpenArticle: (item: PublicArticle, target?: GlobalSearchTarget) => void;
  onOpenService: (item: Service, target?: GlobalSearchTarget) => void;
  onOpenCountry: (countryId: string, target?: GlobalSearchTarget) => void;
  onNavigateCategory: (category: CategoryType, targetId?: string, target?: GlobalSearchTarget) => void;
  favoriteKeys?: FavoriteKey[];
  onToggleFavorite?: (kind: FavoriteKind, id: string) => void;
}

const CATEGORY_META: Record<GlobalResultKind, { label: string; icon: React.ReactNode }> = {
  scholarships: { label: 'المنح', icon: <GraduationCap className="h-4 w-4" /> },
  universities: { label: 'الجامعات', icon: <Building2 className="h-4 w-4" /> },
  majors: { label: 'التخصصات', icon: <BookOpen className="h-4 w-4" /> },
  countries: { label: 'الدول', icon: <Landmark className="h-4 w-4" /> },
  courses: { label: 'الدورات', icon: <BookOpen className="h-4 w-4" /> },
  exams: { label: 'الاختبارات', icon: <FileText className="h-4 w-4" /> },
  articles: { label: 'المقالات', icon: <FileText className="h-4 w-4" /> },
  services: { label: 'الخدمات', icon: <Stethoscope className="h-4 w-4" /> },
  tools: { label: 'الأدوات', icon: <Wrench className="h-4 w-4" /> },
  jobs: { label: 'الوظائف والتدريب', icon: <BriefcaseBusiness className="h-4 w-4" /> },
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
  const documents = useMemo(
    () => buildGlobalSearchDocuments({ scholarships, universities, majors, countries, importedCourses, exams, articles, services, tools, careers }),
    [scholarships, universities, majors, countries, importedCourses, exams, articles, services, tools, careers],
  );
  const rankedResults = useMemo(() => rankGlobalSearchDocuments(documents, query), [documents, query]);

  const counts = useMemo(() => {
    const value = Object.keys(CATEGORY_META).reduce((acc, kind) => {
      acc[kind as GlobalResultKind] = 0;
      return acc;
    }, {} as Record<GlobalResultKind, number>);
    rankedResults.forEach((result) => { value[result.kind] += 1; });
    return value;
  }, [rankedResults]);

  useEffect(() => {
    if (selectedKind !== 'all' && counts[selectedKind] === 0) setSelectedKind('all');
  }, [counts, selectedKind]);

  const filteredResults = selectedKind === 'all' ? rankedResults : rankedResults.filter((item) => item.kind === selectedKind);

  const openResult = (result: RankedGlobalSearchResult) => {
    const target = { anchor: result.anchor, searchTerm: query };
    if (result.kind === 'scholarships') return onOpenScholarship(result.raw as Scholarship, target);
    if (result.kind === 'universities') return onOpenUniversity(result.raw as University, target);
    if (result.kind === 'majors') return onOpenMajor(result.raw as Major, target);
    if (result.kind === 'exams') return onOpenExam(result.raw as Exam, target);
    if (result.kind === 'courses') return onOpenCourse(result.raw as ImportedCourse, target);
    if (result.kind === 'articles') return onOpenArticle(result.raw as PublicArticle, target);
    if (result.kind === 'services') return onOpenService(result.raw as Service, target);
    if (result.kind === 'countries') return onOpenCountry(result.targetId, target);
    if (result.kind === 'tools') return onNavigateCategory('tools', result.targetId, target);
    return onNavigateCategory('jobs', result.targetId, target);
  };

  return (
    <div className="mn-page-shell pb-24" dir="rtl">
      <section className="mn-search-hero text-white mn-inverse">
        <div className="mn-public-container py-5 sm:py-7">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onBack} className="h-10 w-10 shrink-0 rounded-xl border border-white/20 bg-white/10 flex items-center justify-center" aria-label="العودة">
              <ArrowRight className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1 text-right">
              <div className="text-[11px] font-medium text-white/80 sm:text-xs">بحث موحّد في بيانات منارتك المخصصة للمستخدم</div>
              <h1 className="mt-0.5 text-[22px] font-bold leading-tight sm:text-[28px]">نتائج البحث العام</h1>
            </div>
          </div>
          <button type="button" onClick={onOpenSmartSearch} className="mt-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-[var(--mn-accent)]/50 bg-white/10 px-3.5 py-3 text-right transition hover:bg-white/15">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--mn-accent-soft)]"><Sparkles className="h-4 w-4" />جرّب البحث الذكي</div>
              <div className="mt-0.5 text-[10px] text-white/80">استخدمه عندما تحتاج استكشافًا عبر أكثر من مجال، وليس بدل النتائج المباشرة.</div>
            </div>
            <ChevronLeft className="h-4 w-4 shrink-0 text-[var(--mn-accent-soft)]" />
          </button>
        </div>
      </section>

      <div className="mn-public-container space-y-4 py-4">
        <div className="mn-card px-3.5 py-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 shrink-0 text-[var(--mn-accent-text)]" />
            <div className="min-w-0">
              <div className="mn-meta">بحثك الحالي</div>
              <div className="truncate text-[13px] font-semibold text-[var(--mn-heading)] sm:text-sm">{query || 'اكتب في شريط البحث أعلى الصفحة'}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
          <button type="button" onClick={() => setSelectedKind('all')} aria-pressed={selectedKind === 'all'} className={`mn-filter-chip whitespace-nowrap ${selectedKind === 'all' ? 'is-selected' : ''}`}>الكل · {rankedResults.length}</button>
          {(Object.keys(CATEGORY_META) as GlobalResultKind[])
            .filter((kind) => !query.trim() || counts[kind] > 0)
            .map((kind) => (
              <button type="button" key={kind} onClick={() => setSelectedKind(kind)} aria-pressed={selectedKind === kind} className={`mn-filter-chip flex items-center gap-1.5 whitespace-nowrap ${selectedKind === kind ? 'is-selected' : ''}`}>
                {CATEGORY_META[kind].icon}{CATEGORY_META[kind].label} · {counts[kind]}
              </button>
            ))}
        </div>

        {query.trim() && filteredResults.length > 0 ? (
          <div className="space-y-2.5">
            {filteredResults.slice(0, 40).map((result) => {
              const favoriteKind = favoriteKindForResult(result.kind);
              const favoriteId = result.targetId;
              const favoriteKey = `${favoriteKind}:${favoriteId}` as FavoriteKey;
              return (
                <article
                  key={`${result.key}:${result.anchor || 'top'}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`فتح ${result.title}${result.matchedSection ? `، القسم: ${result.matchedSection}` : ''}`}
                  onClick={() => openResult(result)}
                  onKeyDown={(event) => {
                    if (event.currentTarget !== event.target) return;
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      openResult(result);
                    }
                  }}
                  className="mn-card w-full cursor-pointer p-3.5 text-right transition hover:-translate-y-0.5 hover:border-[var(--mn-accent)]/60 hover:shadow-md active:translate-y-0"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--mn-primary)] text-white mn-inverse">{CATEGORY_META[result.kind].icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                        <span className="text-[10px] font-semibold text-[var(--mn-accent-text)]">{result.category}</span>
                        {result.meta && <span className="max-w-[55%] truncate text-[10px] font-medium text-[var(--mn-text-muted)]">{result.meta}</span>}
                      </div>
                      <h2 className="mt-0.5 text-[14px] font-semibold leading-snug text-[var(--mn-heading)] sm:text-[15px]">{result.title}</h2>
                      {result.matchedSection && (
                        <div className="mt-1 inline-flex rounded-full border border-[var(--mn-border-gold)] bg-[var(--mn-gold-surface)] px-2 py-0.5 text-[10px] font-semibold text-[var(--mn-accent-text)]">المطابقة في: {result.matchedSection}</div>
                      )}
                      <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-[var(--mn-text-muted)] sm:text-xs">{result.excerpt || result.subtitle}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-center gap-1.5">
                      {favoriteId && onToggleFavorite && <FavoriteButton active={favoriteKeys.includes(favoriteKey)} onToggle={(event) => { event.stopPropagation(); onToggleFavorite(favoriteKind, favoriteId); }} />}
                      <ChevronLeft className="mn-card-arrow h-4 w-4" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : query.trim() ? (
          <div className="mn-card py-14 text-center border-dashed">
            <Search className="mx-auto h-9 w-9 text-[var(--mn-text-muted)]" />
            <div className="mt-2 text-xs font-semibold text-[var(--mn-heading)]">لا توجد نتيجة مخصصة للمستخدم بهذه العبارة.</div>
            <button type="button" onClick={onOpenSmartSearch} className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[var(--mn-primary)] px-4 py-2 text-[11px] font-semibold text-white mn-inverse"><Sparkles className="h-3.5 w-3.5 text-[var(--mn-accent-soft)]" />جرّب البحث الذكي</button>
          </div>
        ) : (
          <div className="mn-card py-14 text-center border-dashed">
            <Search className="mx-auto h-9 w-9 text-[var(--mn-text-muted)]" />
            <div className="mt-2 text-xs font-semibold text-[var(--mn-heading)]">ابدأ باسم منحة، جامعة، تخصص، دورة، اختبار أو فرصة.</div>
            <div className="mt-1 text-[11px] text-[var(--mn-text-muted)]">الفهرس يبحث فقط في الحقول العامة المخصصة للمستخدم.</div>
          </div>
        )}
      </div>
    </div>
  );
};
