import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, BookOpen, BriefcaseBusiness, Building2, ChevronLeft, FileText, GraduationCap,
  Landmark, Loader2, Search, Sparkles, Stethoscope, Wrench,
} from 'lucide-react';
import { ApiClient, type PublicGlobalSearchItem, type PublicGlobalSearchKind } from '../../../api/client';
import type {
  CategoryType, Exam, FavoriteKey, FavoriteKind, ImportedCourse, Major, PublicArticle, Scholarship,
  Service, University, CountryDestination, StudentToolPreview, CareerOpportunityPreview,
} from '../types';
import {
  buildGlobalSearchDocuments, rankGlobalSearchDocuments, type GlobalResultKind,
  type GlobalSearchTarget, type RankedGlobalSearchResult,
} from '../globalSearchIndex';
import { FavoriteButton } from './FavoriteButton';

interface GlobalSearchPageProps {
  query: string;
  searchMode: 'api' | 'prototype';
  locale?: 'ar' | 'en';
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
  articles: { label: 'المحتوى', icon: <FileText className="h-4 w-4" /> },
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

const kindToCategory = (kind: GlobalResultKind): CategoryType => kind === 'exams' ? 'exams' : kind === 'jobs' ? 'jobs' : kind as CategoryType;

export const GlobalSearchPage: React.FC<GlobalSearchPageProps> = ({
  query, searchMode, locale = 'ar', scholarships, universities, majors, countries, importedCourses,
  exams, articles, services, tools, careers, onBack, onOpenSmartSearch, onOpenScholarship,
  onOpenUniversity, onOpenMajor, onOpenExam, onOpenCourse, onOpenArticle, onOpenService,
  onOpenCountry, onNavigateCategory, favoriteKeys = [], onToggleFavorite,
}) => {
  const [selectedKind, setSelectedKind] = useState<'all' | GlobalResultKind>('all');
  const [serverItems, setServerItems] = useState<PublicGlobalSearchItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchError, setSearchError] = useState('');

  const documents = useMemo(
    () => buildGlobalSearchDocuments({ scholarships, universities, majors, countries, importedCourses, exams, articles, services, tools, careers }),
    [scholarships, universities, majors, countries, importedCourses, exams, articles, services, tools, careers],
  );
  const prototypeResults = useMemo(() => rankGlobalSearchDocuments(documents, query), [documents, query]);

  const executeServerSearch = async (cursor?: string, append = false) => {
    if (!query.trim() || searchMode !== 'api') return;
    append ? setLoadingMore(true) : setLoading(true);
    setSearchError('');
    try {
      const page = await ApiClient.searchPublicCatalog({
        q: query.trim(), locale, limit: 20, cursor,
        kinds: selectedKind === 'all' ? undefined : [selectedKind as PublicGlobalSearchKind],
      });
      setServerItems((current) => append ? [...current, ...page.items.filter((item) => !current.some((known) => known.kind === item.kind && known.id === item.id))] : page.items);
      setNextCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } catch (error) {
      if (!append) setServerItems([]);
      setSearchError(error instanceof Error ? error.message : 'تعذر تنفيذ البحث العام');
    } finally {
      setLoading(false); setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (searchMode !== 'api') return;
    setServerItems([]); setNextCursor(null); setHasMore(false); setSearchError('');
    if (!query.trim()) return;
    const timer = window.setTimeout(() => { void executeServerSearch(); }, 220);
    return () => window.clearTimeout(timer);
    // query/kind/mode/locale define a new result set; executeServerSearch intentionally not a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selectedKind, searchMode, locale]);

  const counts = useMemo(() => {
    const value = Object.keys(CATEGORY_META).reduce((acc, kind) => { acc[kind as GlobalResultKind] = 0; return acc; }, {} as Record<GlobalResultKind, number>);
    const source = searchMode === 'api' ? serverItems : prototypeResults;
    source.forEach((result: any) => { if (result.kind in value) value[result.kind as GlobalResultKind] += 1; });
    return value;
  }, [prototypeResults, searchMode, serverItems]);

  const openPrototypeResult = (result: RankedGlobalSearchResult) => {
    const target = { anchor: result.anchor, searchTerm: query };
    if (result.kind === 'scholarships') return onOpenScholarship(result.raw as Scholarship, target);
    if (result.kind === 'universities') return onOpenUniversity(result.raw as University, target);
    if (result.kind === 'majors') return onOpenMajor(result.raw as Major, target);
    if (result.kind === 'exams') return onOpenExam(result.raw as Exam, target);
    if (result.kind === 'courses') return onOpenCourse(result.raw as ImportedCourse, target);
    if (result.kind === 'articles') return onOpenArticle(result.raw as PublicArticle, target);
    if (result.kind === 'services') return onOpenService(result.raw as Service, target);
    if (result.kind === 'countries') return onOpenCountry(result.targetId, target);
    return onNavigateCategory(kindToCategory(result.kind), result.targetId, target);
  };

  const visiblePrototype = selectedKind === 'all' ? prototypeResults : prototypeResults.filter((item) => item.kind === selectedKind);
  const totalVisible = searchMode === 'api' ? serverItems.length : visiblePrototype.length;

  return (
    <div className="mn-page-shell pb-24" dir={locale === 'en' ? 'ltr' : 'rtl'}>
      <section className="mn-search-hero text-white mn-inverse">
        <div className="mn-public-container py-5 sm:py-7">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onBack} className="h-10 w-10 shrink-0 rounded-xl border border-white/20 bg-white/10 flex items-center justify-center" aria-label="العودة"><ArrowRight className="h-4 w-4" /></button>
            <div className="min-w-0 flex-1 text-right">
              <div className="text-[11px] font-medium text-white/80 sm:text-xs">بحث موحّد في البيانات العامة المنشورة</div>
              <h1 className="mt-0.5 text-[22px] font-bold leading-tight sm:text-[28px]">نتائج البحث العام</h1>
            </div>
          </div>
          <button type="button" onClick={onOpenSmartSearch} className="mt-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-[var(--mn-accent)]/50 bg-white/10 px-3.5 py-3 text-right transition hover:bg-white/15">
            <div className="min-w-0"><div className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--mn-accent-soft)]"><Sparkles className="h-4 w-4" />جرّب البحث الذكي</div><div className="mt-0.5 text-[10px] text-white/80">للاستكشاف المركب؛ النتائج المباشرة أدناه تأتي من فهرس الخادم.</div></div>
            <ChevronLeft className="h-4 w-4 shrink-0 text-[var(--mn-accent-soft)]" />
          </button>
        </div>
      </section>

      <div className="mn-public-container space-y-4 py-4">
        <div className="mn-card px-3.5 py-3"><div className="flex items-center gap-2"><Search className="h-4 w-4 shrink-0 text-[var(--mn-accent-text)]" /><div className="min-w-0"><div className="mn-meta">بحثك الحالي</div><div className="truncate text-[13px] font-semibold text-[var(--mn-heading)] sm:text-sm">{query || 'اكتب في شريط البحث أعلى الصفحة'}</div></div></div></div>

        {searchMode === 'prototype' && <div className="rounded-xl border border-dashed px-3 py-2 text-[11px] text-[var(--mn-text-muted)]">وضع Prototype صريح: البحث محلي في بيانات النموذج فقط، ولا يُعرض على أنه فهرس إنتاجي.</div>}

        <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
          <button type="button" onClick={() => setSelectedKind('all')} aria-pressed={selectedKind === 'all'} className={`mn-filter-chip whitespace-nowrap ${selectedKind === 'all' ? 'is-selected' : ''}`}>الكل{totalVisible ? ` · ${totalVisible}${hasMore && searchMode === 'api' ? '+' : ''}` : ''}</button>
          {(Object.keys(CATEGORY_META) as GlobalResultKind[]).map((kind) => (
            <button type="button" key={kind} onClick={() => setSelectedKind(kind)} aria-pressed={selectedKind === kind} className={`mn-filter-chip flex items-center gap-1.5 whitespace-nowrap ${selectedKind === kind ? 'is-selected' : ''}`}>
              {CATEGORY_META[kind].icon}{CATEGORY_META[kind].label}{counts[kind] ? ` · ${counts[kind]}${hasMore && selectedKind === kind ? '+' : ''}` : ''}
            </button>
          ))}
        </div>

        {loading ? <div className="mn-card py-12 text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin" /><div className="mt-2 text-xs">جارٍ البحث في الفهرس المنشور…</div></div> : null}
        {!loading && searchError ? <div className="mn-card border-red-200 py-10 text-center"><div className="text-xs font-semibold">تعذر تحميل نتائج البحث.</div><div className="mt-1 text-[10px] text-[var(--mn-text-muted)]">{searchError}</div><button type="button" onClick={() => void executeServerSearch()} className="mt-3 mn-filter-chip is-selected">إعادة المحاولة</button></div> : null}

        {!loading && !searchError && query.trim() && searchMode === 'api' && serverItems.length > 0 ? (
          <div className="space-y-2.5">
            {serverItems.map((result) => {
              const kind = result.kind as GlobalResultKind;
              const favoriteKind = favoriteKindForResult(kind);
              const favoriteKey = `${favoriteKind}:${result.id}` as FavoriteKey;
              return <article key={`${result.kind}:${result.id}`} role="link" tabIndex={0} aria-label={`فتح ${result.title}`} onClick={() => window.location.assign(result.url)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); window.location.assign(result.url); } }} className="mn-card w-full cursor-pointer p-3.5 text-right transition hover:-translate-y-0.5 hover:border-[var(--mn-accent)]/60 hover:shadow-md">
                <div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--mn-primary)] text-white mn-inverse">{CATEGORY_META[kind].icon}</div><div className="min-w-0 flex-1"><div className="text-[10px] font-semibold text-[var(--mn-accent-text)]">{CATEGORY_META[kind].label}</div><h2 className="mt-0.5 text-[14px] font-semibold leading-snug text-[var(--mn-heading)] sm:text-[15px]">{result.title}</h2>{result.subtitle && <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-[var(--mn-text-muted)] sm:text-xs">{result.subtitle}</p>}</div><div className="flex shrink-0 flex-col items-center gap-1.5">{onToggleFavorite && <FavoriteButton active={favoriteKeys.includes(favoriteKey)} onToggle={(event) => { event.stopPropagation(); onToggleFavorite(favoriteKind, result.id); }} />}<ChevronLeft className="mn-card-arrow h-4 w-4" /></div></div>
              </article>;
            })}
            {hasMore && nextCursor && <button type="button" disabled={loadingMore} onClick={() => void executeServerSearch(nextCursor, true)} className="mn-card w-full py-3 text-center text-xs font-semibold disabled:opacity-60">{loadingMore ? 'جارٍ تحميل المزيد…' : 'تحميل المزيد'}</button>}
          </div>
        ) : null}

        {!loading && !searchError && query.trim() && searchMode === 'prototype' && visiblePrototype.length > 0 ? (
          <div className="space-y-2.5">
            {visiblePrototype.map((result) => {
              const favoriteKind = favoriteKindForResult(result.kind); const favoriteKey = `${favoriteKind}:${result.targetId}` as FavoriteKey;
              return <article key={`${result.key}:${result.anchor || 'top'}`} role="button" tabIndex={0} onClick={() => openPrototypeResult(result)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openPrototypeResult(result); } }} className="mn-card w-full cursor-pointer p-3.5 text-right"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--mn-primary)] text-white mn-inverse">{CATEGORY_META[result.kind].icon}</div><div className="min-w-0 flex-1"><div className="text-[10px] font-semibold text-[var(--mn-accent-text)]">{result.category}</div><h2 className="mt-0.5 text-[14px] font-semibold text-[var(--mn-heading)]">{result.title}</h2><p className="mt-1 line-clamp-2 text-[11px] text-[var(--mn-text-muted)]">{result.excerpt || result.subtitle}</p></div>{onToggleFavorite && <FavoriteButton active={favoriteKeys.includes(favoriteKey)} onToggle={(event) => { event.stopPropagation(); onToggleFavorite(favoriteKind, result.targetId); }} />}</div></article>;
            })}
          </div>
        ) : null}

        {!loading && !searchError && query.trim() && ((searchMode === 'api' && serverItems.length === 0) || (searchMode === 'prototype' && visiblePrototype.length === 0)) ? <div className="mn-card py-14 text-center border-dashed"><Search className="mx-auto h-9 w-9 text-[var(--mn-text-muted)]" /><div className="mt-2 text-xs font-semibold text-[var(--mn-heading)]">لا توجد نتائج منشورة بهذه العبارة.</div><button type="button" onClick={onOpenSmartSearch} className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[var(--mn-primary)] px-4 py-2 text-[11px] font-semibold text-white mn-inverse"><Sparkles className="h-3.5 w-3.5 text-[var(--mn-accent-soft)]" />جرّب البحث الذكي</button></div> : null}
        {!query.trim() ? <div className="mn-card py-14 text-center border-dashed"><Search className="mx-auto h-9 w-9 text-[var(--mn-text-muted)]" /><div className="mt-2 text-xs font-semibold text-[var(--mn-heading)]">ابدأ باسم منحة، جامعة، تخصص، دورة، اختبار أو فرصة.</div><div className="mt-1 text-[11px] text-[var(--mn-text-muted)]">يبحث الفهرس في الحقول العامة المنشورة فقط.</div></div> : null}
      </div>
    </div>
  );
};
