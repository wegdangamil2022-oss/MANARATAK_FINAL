import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  X,
  Heart,
  Calendar,
  ChevronLeft,
  ChevronDown,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Menu,
  User,
  Globe,
  GraduationCap,
  Coins,
  Globe2,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { Scholarship, DegreeLevel } from '../types';
import { INITIAL_SCHOLARSHIPS } from '../data/mockData';

interface ScholarshipsSearchPageProps {
  scholarships?: Scholarship[];
  onBack?: () => void;
  onSelectScholarship?: (scholarship: Scholarship) => void;
  favoriteIds?: string[];
  onToggleFavorite?: (id: string) => void;
}

// Crisp Vector SVG Flag renderer matching Countries page style
const ScholarshipCountryFlag: React.FC<{
  country: string;
  countryFlag?: string;
  scholarshipId?: string;
}> = ({ country, countryFlag, scholarshipId }) => {
  const normCountry = (country || '').toLowerCase();

  if (
    normCountry.includes('صين') ||
    normCountry.includes('china') ||
    scholarshipId?.includes('china') ||
    scholarshipId?.includes('csc')
  ) {
    return (
      <svg viewBox="0 0 64 64" className="w-full h-full rounded-full object-cover">
        <circle cx="32" cy="32" r="32" fill="#DE2910" />
        <polygon points="16,14 18.5,21.5 12,16.8 20,16.8 13.5,21.5" fill="#FFDE00" />
        <polygon points="26,10 27,13 24.5,11.2 27.5,11.2 25,13" fill="#FFDE00" />
        <polygon points="29,16 30,19 27.5,17.2 30.5,17.2 28,19" fill="#FFDE00" />
        <polygon points="29,23 30,26 27.5,24.2 30.5,24.2 28,26" fill="#FFDE00" />
        <polygon points="25,28 26,31 23.5,29.2 26.5,29.2 24,31" fill="#FFDE00" />
      </svg>
    );
  }

  if (normCountry.includes('ترك') || normCountry.includes('turk')) {
    return (
      <svg viewBox="0 0 64 64" className="w-full h-full rounded-full object-cover">
        <circle cx="32" cy="32" r="32" fill="#E30A17" />
        <circle cx="28" cy="32" r="14" fill="#FFFFFF" />
        <circle cx="31" cy="32" r="11" fill="#E30A17" />
        <polygon
          points="40,32 42.5,33.5 41.5,30.5 44,28.5 41,28.5 40,25.5 39,28.5 36,28.5 38.5,30.5 37.5,33.5"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  if (
    normCountry.includes('بريطانيا') ||
    normCountry.includes('المملكة المتحدة') ||
    normCountry.includes('uk') ||
    normCountry.includes('britain')
  ) {
    return (
      <svg viewBox="0 0 64 64" className="w-full h-full rounded-full object-cover">
        <clipPath id="circleClipUkSch">
          <circle cx="32" cy="32" r="32" />
        </clipPath>
        <g clipPath="url(#circleClipUkSch)">
          <rect width="64" height="64" fill="#012169" />
          <path d="M0,0 L64,64 M64,0 L0,64" stroke="#FFFFFF" strokeWidth="8" />
          <path d="M0,0 L64,64 M64,0 L0,64" stroke="#C8102E" strokeWidth="4" />
          <path d="M32,0 V64 M0,32 H64" stroke="#FFFFFF" strokeWidth="12" />
          <path d="M32,0 V64 M0,32 H64" stroke="#C8102E" strokeWidth="7" />
        </g>
      </svg>
    );
  }

  if (
    normCountry.includes('ألمانيا') ||
    normCountry.includes('المانيا') ||
    normCountry.includes('germany') ||
    normCountry.includes('daad')
  ) {
    return (
      <svg viewBox="0 0 64 64" className="w-full h-full rounded-full object-cover">
        <clipPath id="circleClipDeSch">
          <circle cx="32" cy="32" r="32" />
        </clipPath>
        <g clipPath="url(#circleClipDeSch)">
          <rect x="0" y="0" width="64" height="21.3" fill="#000000" />
          <rect x="0" y="21.3" width="64" height="21.3" fill="#DD0000" />
          <rect x="0" y="42.6" width="64" height="21.4" fill="#FFCE00" />
        </g>
      </svg>
    );
  }

  if (normCountry.includes('ماليزيا') || normCountry.includes('malaysia')) {
    return (
      <svg viewBox="0 0 64 64" className="w-full h-full rounded-full object-cover">
        <clipPath id="circleClipMySch">
          <circle cx="32" cy="32" r="32" />
        </clipPath>
        <g clipPath="url(#circleClipMySch)">
          <rect x="0" y="0" width="64" height="64" fill="#FFFFFF" />
          <rect x="0" y="0" width="64" height="4.5" fill="#CC0000" />
          <rect x="0" y="9" width="64" height="4.5" fill="#CC0000" />
          <rect x="0" y="18" width="64" height="4.5" fill="#CC0000" />
          <rect x="0" y="27" width="64" height="4.5" fill="#CC0000" />
          <rect x="0" y="36" width="64" height="4.5" fill="#CC0000" />
          <rect x="0" y="45" width="64" height="4.5" fill="#CC0000" />
          <rect x="0" y="54" width="64" height="4.5" fill="#CC0000" />
          <rect x="0" y="0" width="34" height="34" fill="#000066" />
          <circle cx="15" cy="17" r="10" fill="#FFCC00" />
          <circle cx="18" cy="17" r="8" fill="#000066" />
          <polygon
            points="25,17 26.5,19 24.5,20.5 27,20.5 28,23 29,20.5 31.5,20.5 29.5,19 31,17 28.5,18 28,15.5 27.5,18"
            fill="#FFCC00"
          />
        </g>
      </svg>
    );
  }

  if (normCountry.includes('سعود') || normCountry.includes('saudi')) {
    return (
      <svg viewBox="0 0 64 64" className="w-full h-full rounded-full object-cover">
        <circle cx="32" cy="32" r="32" fill="#006C35" />
        <path d="M16,30 Q32,24 48,30" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
        <rect x="18" y="38" width="28" height="3" fill="#FFFFFF" />
        <polygon points="18,39.5 22,36 22,43" fill="#FFFFFF" />
      </svg>
    );
  }

  if (countryFlag) {
    return <span className="text-xl sm:text-2xl">{countryFlag}</span>;
  }

  return <Globe2 className="w-5 h-5 text-[var(--mn-heading)]" />;
};

export const ScholarshipsSearchPage: React.FC<ScholarshipsSearchPageProps> = ({
  scholarships = INITIAL_SCHOLARSHIPS,
  onBack,
  onSelectScholarship,
  favoriteIds = [],
  onToggleFavorite,
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('الكل');
  const [selectedDegree, setSelectedDegree] = useState('الكل');
  const [selectedFunding, setSelectedFunding] = useState('الكل');
  const [onlyWithoutIelts, setOnlyWithoutIelts] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'deadline' | 'match'>('featured');

  const resultsRef = useRef<HTMLDivElement>(null);

  // Extract unique countries
  const countries = useMemo(() => {
    const set = new Set<string>();
    scholarships.forEach((s) => {
      if (s.country) set.add(s.country);
    });
    return ['الكل', ...Array.from(set)];
  }, [scholarships]);

  // Filter scholarships
  const filteredScholarships = useMemo(() => {
    return scholarships
      .filter((s) => {
        const q = searchQuery.trim().toLowerCase();
        const matchesQuery =
          !q ||
          s.title.toLowerCase().includes(q) ||
          (s.titleEn && s.titleEn.toLowerCase().includes(q)) ||
          s.country.toLowerCase().includes(q) ||
          (s.countryEn && s.countryEn.toLowerCase().includes(q)) ||
          s.university.toLowerCase().includes(q) ||
          (s.field && s.field.toLowerCase().includes(q)) ||
          (s.description && s.description.toLowerCase().includes(q));

        const matchesCountry = selectedCountry === 'الكل' || s.country === selectedCountry;
        const matchesDegree =
          selectedDegree === 'الكل' || s.degreeLevel.includes(selectedDegree as DegreeLevel);
        const matchesFunding = selectedFunding === 'الكل' || s.fundingType === selectedFunding;
        const matchesIelts = !onlyWithoutIelts || s.withoutIelts;

        return matchesQuery && matchesCountry && matchesDegree && matchesFunding && matchesIelts;
      })
      .sort((a, b) => {
        if (sortBy === 'deadline') {
          return (a.daysLeft || 999) - (b.daysLeft || 999);
        }
        if (sortBy === 'match') {
          return (b.matchScore || 0) - (a.matchScore || 0);
        }
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
  }, [
    scholarships,
    searchQuery,
    selectedCountry,
    selectedDegree,
    selectedFunding,
    onlyWithoutIelts,
    sortBy,
  ]);

  const handleFavoriteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(id);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCountry('الكل');
    setSelectedDegree('الكل');
    setSelectedFunding('الكل');
    setOnlyWithoutIelts(false);
    setSortBy('featured');
  };

  const activeFiltersCount =
    (selectedCountry !== 'الكل' ? 1 : 0) +
    (selectedDegree !== 'الكل' ? 1 : 0) +
    (selectedFunding !== 'الكل' ? 1 : 0) +
    (onlyWithoutIelts ? 1 : 0) +
    (searchQuery.trim() !== '' ? 1 : 0);

  return (
    <div
      className="min-h-screen bg-[var(--mn-page)] text-slate-900 pb-24 font-sans select-none"
      dir="rtl"
    >
      {/* ========================================================================= */}
      {/* HERO EMERALD BANNER - COMPACT LUXURY ARABIC DESIGN WITH GOLD ACCENTS       */}
      {/* ========================================================================= */}
      <div className="relative mn-search-hero text-white px-3 sm:px-4 pt-4 pb-12 sm:pb-14 overflow-hidden shadow-xs">
        {/* Top-Right Circular Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 bg-black/25 hover:bg-black/40 border border-white/15 backdrop-blur-md rounded-full flex items-center justify-center transition-all z-30 cursor-pointer text-white shadow-md active:scale-95"
            title="العودة"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 rotate-180 text-white" />
          </button>
        )}

        {/* Background Decorative Mosque Silhouettes, Dot Grid & Gold Arcs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Top-left dot grid */}
          <div className="absolute top-3 left-5 grid grid-cols-5 gap-1.5 opacity-20">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-[var(--mn-accent)]" />
            ))}
          </div>

          {/* Thin gold curved orbital line on left */}
          <div className="absolute -top-12 -left-12 w-56 h-56 rounded-full border border-[var(--mn-accent)]/25 pointer-events-none" />
          <div className="absolute -top-6 -left-6 w-72 h-72 rounded-full border border-[var(--mn-accent)]/15 pointer-events-none" />

          {/* Mosque / Architectural silhouette on right in dark shade */}
          <svg
            className="absolute -right-4 bottom-0 h-40 w-40 text-[#001C33]/40 pointer-events-none"
            viewBox="0 0 200 200"
            fill="currentColor"
          >
            {/* Minaret 1 */}
            <rect x="140" y="50" width="16" height="150" />
            <polygon points="148,25 138,50 158,50" />
            <circle cx="148" cy="20" r="3" />
            {/* Dome */}
            <path d="M 80,130 Q 115,70 150,130 Z" />
            <circle cx="115" cy="65" r="4" />
            {/* Minaret 2 */}
            <rect x="70" y="80" width="12" height="120" />
            <polygon points="76,60 68,80 84,80" />
          </svg>

          {/* Lower Curved Gold Swirl */}
          <svg
            className="absolute bottom-0 inset-x-0 w-full h-12 opacity-30"
            viewBox="0 0 500 80"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M-20,70 Q250,-20 520,70"
              stroke="var(--mn-accent)"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>

        <div className="max-w-md sm:max-w-xl mx-auto text-center relative z-10 space-y-2 pt-1">
          {/* Top 4-pointed Gold Sparkle Star */}
          <div className="flex justify-center">
            <span className="text-[var(--mn-accent-text)] text-lg sm:text-xl drop-shadow-[0_0_8px_rgba(200,162,74,0.8)] animate-pulse">
              ✦
            </span>
          </div>

          {/* Main Title */}
          <div className="space-y-0.5">
            <h1 className="text-xl sm:text-2xl font-black text-white font-['Cairo',sans-serif] tracking-tight leading-tight">
              ابحث عن <span className="text-[var(--mn-accent-text)]">منحتك الدراسية</span>
            </h1>

            {/* Small Gold Horizontal Divider */}
            <div className="flex justify-center pt-1 pb-0.5">
              <div className="w-10 h-0.5 bg-[var(--mn-accent)] rounded-full" />
            </div>

            {/* Subtitle */}
            <p className="text-[11px] sm:text-xs text-white/90 font-medium font-['Cairo',sans-serif] leading-relaxed max-w-xs sm:max-w-sm mx-auto">
              اكتشف أفضل المنح الدراسية حول العالم وابنِ مستقبلك بثقة.
            </p>
          </div>

          {/* Integrated Clean White Search Bar in Hero */}
          <div className="pt-1 max-w-sm sm:max-w-md mx-auto px-1">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="اكتب اسم المنحة، التخصص، أو الدولة..."
                className="w-full py-2.5 pl-4 pr-10 bg-[var(--mn-surface)] text-slate-800 rounded-full text-xs font-semibold placeholder:text-slate-400 focus:outline-none shadow-md border border-slate-100 focus:border-[var(--mn-accent)] transition-all text-center font-['Cairo',sans-serif]"
              />
              <Search className="w-4 h-4 text-[var(--mn-accent-text)] absolute right-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {activeFiltersCount > 0 && (
          <div className="flex justify-center mt-2 relative z-10">
            <button
              onClick={handleResetFilters}
              className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-[var(--mn-surface-elevated)]/95 px-2.5 py-0.5 rounded-full shadow-xs transition-colors flex items-center gap-1 cursor-pointer font-['Cairo',sans-serif]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إعادة ضبط الفلاتر ({activeFiltersCount})</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3 SEPARATE FLOATING FILTER TILES */}
      {/* ========================================================================= */}
      <div className="max-w-lg mx-auto px-4 -mt-7 sm:-mt-8 relative z-20 pb-4">
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
          {/* Tile 1: الدولة */}
          <div className="relative bg-[var(--mn-surface)] hover:bg-amber-50/40 border-1.5 border-[var(--mn-accent)]/70 hover:border-[var(--mn-accent)] rounded-xl sm:rounded-2xl p-2 sm:p-2.5 flex flex-col items-center justify-center text-center shadow-[0_4px_14px_rgba(0,0,0,0.06)] transition-all h-[58px] sm:h-[64px] cursor-pointer">
            <div className="flex items-center justify-center gap-1 text-slate-900 font-extrabold text-[11px] sm:text-xs font-['Cairo',sans-serif] w-full">
              <span className="truncate">
                {selectedCountry === 'الكل' ? 'الدولة' : selectedCountry}
              </span>
              <Globe2 className="w-3.5 h-3.5 text-[var(--mn-accent-text)] shrink-0" />
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              title="اختر الدولة"
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c === 'الكل' ? '🌍 جميع الدول' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Tile 2: نوع التمويل */}
          <div className="relative bg-[var(--mn-surface)] hover:bg-amber-50/40 border-1.5 border-[var(--mn-accent)]/70 hover:border-[var(--mn-accent)] rounded-xl sm:rounded-2xl p-2 sm:p-2.5 flex flex-col items-center justify-center text-center shadow-[0_4px_14px_rgba(0,0,0,0.06)] transition-all h-[58px] sm:h-[64px] cursor-pointer">
            <div className="flex items-center justify-center gap-1 text-slate-900 font-extrabold text-[11px] sm:text-xs font-['Cairo',sans-serif] w-full">
              <span className="truncate">
                {selectedFunding === 'الكل' ? 'التمويل' : selectedFunding}
              </span>
              <Coins className="w-3.5 h-3.5 text-[var(--mn-accent-text)] shrink-0" />
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
            <select
              value={selectedFunding}
              onChange={(e) => setSelectedFunding(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              title="اختر نوع التمويل"
            >
              <option value="الكل">💰 التمويل</option>
              <option value="ممولة بالكامل">ممولة بالكامل</option>
              <option value="ممولة جزئياً">ممولة جزئياً</option>
              <option value="إعفاء من الرسوم">إعفاء من الرسوم</option>
              <option value="نفقة خاصة">نفقة خاصة</option>
            </select>
          </div>

          {/* Tile 3: الدرجة العلمية */}
          <div className="relative bg-[var(--mn-surface)] hover:bg-amber-50/40 border-1.5 border-[var(--mn-accent)]/70 hover:border-[var(--mn-accent)] rounded-xl sm:rounded-2xl p-2 sm:p-2.5 flex flex-col items-center justify-center text-center shadow-[0_4px_14px_rgba(0,0,0,0.06)] transition-all h-[58px] sm:h-[64px] cursor-pointer">
            <div className="flex items-center justify-center gap-1 text-slate-900 font-extrabold text-[11px] sm:text-xs font-['Cairo',sans-serif] w-full">
              <span className="truncate">
                {selectedDegree === 'الكل' ? 'الدرجة' : selectedDegree}
              </span>
              <GraduationCap className="w-3.5 h-3.5 text-[var(--mn-accent-text)] shrink-0" />
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
            <select
              value={selectedDegree}
              onChange={(e) => setSelectedDegree(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              title="اختر الدرجة العلمية"
            >
              <option value="الكل">🎓 الدرجات</option>
              <option value="بكالوريوس">بكالوريوس</option>
              <option value="ماجستير">ماجستير</option>
              <option value="دكتوراه">دكتوراه</option>
            </select>
          </div>
        </div>
      </div>

      {/* Gold Divider Ribbon Line */}
      <div className="w-full h-0.5 bg-gradient-to-r from-[var(--mn-accent-text)] via-[var(--mn-accent-soft)] to-[var(--mn-accent-text)] shadow-xs mb-3" />

      {/* ========================================================================= */}
      {/* 4. SCHOLARSHIP CARDS LIST                                                 */}
      {/* ========================================================================= */}
      <div ref={resultsRef} className="w-full max-w-2xl mx-auto px-1 sm:px-2 pt-1 space-y-3">
        {/* Section Header: المنح المتاحة (N) • محدثة باستمرار */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-slate-900 font-extrabold text-xs sm:text-sm font-['Cairo',sans-serif]">
            <GraduationCap className="w-3.5 h-3.5 text-[var(--mn-accent-text)]" />
            <span>المنح المتاحة ({filteredScholarships.length})</span>
          </div>

          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[var(--mn-accent-text)] bg-[var(--mn-accent)]/10 px-2 py-0.5 rounded-full border border-[var(--mn-accent)]/30 font-['Cairo',sans-serif]">
            <RotateCcw className="w-2.5 h-2.5 text-[var(--mn-accent-text)]" />
            <span>محدثة باستمرار</span>
          </div>
        </div>

        {/* Cards Stack */}
        <div className="flex flex-col gap-2.5 sm:gap-3 w-full">
          {filteredScholarships.length === 0 ? (
            <div className="bg-[var(--mn-surface)] border border-slate-200 rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-2 shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-800 font-['Cairo',sans-serif]">
                لا توجد منح مطابقة للبحث
              </h3>
              <p className="text-xs text-slate-500 max-w-xs font-['Cairo',sans-serif]">
                جرب تغيير خيارات التصفية أو البحث باسم دولة أو تخصص آخر.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-2 px-4 py-1.5 bg-[var(--mn-primary)] text-white rounded-xl text-xs font-bold cursor-pointer font-['Cairo',sans-serif]"
              >
                إلغاء التصفية وعرض الكل
              </button>
            </div>
          ) : (
            filteredScholarships.map((scholarship) => {
              const isFav = favoriteIds.includes(scholarship.id);
              return (
                <div
                  key={scholarship.id}
                  onClick={() => onSelectScholarship && onSelectScholarship(scholarship)}
                  className="bg-[var(--mn-surface)] rounded-xl sm:rounded-2xl border-2 border-[var(--mn-border-brand)]/40 hover:border-[var(--mn-border-brand)] shadow-sm hover:shadow-md transition-all duration-150 active:scale-[0.985] p-2.5 sm:p-3 relative overflow-hidden group cursor-pointer flex flex-col gap-2 sm:gap-2.5 select-none"
                >
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-[var(--mn-accent)] to-amber-200 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  {/* Top Row: Right Info & Circular Flag Badge | Left Favorite Button */}
                  <div className="flex items-center justify-between gap-2">
                    {/* Visual Right (RTL): Circular Flag + Scholarship Names */}
                    <div className="flex items-center gap-2 sm:gap-2.5 text-right min-w-0 flex-1">
                      {/* Circular Flag Badge */}
                      <div className="w-9.5 h-9.5 sm:w-10.5 sm:h-10.5 rounded-full p-0.5 bg-gradient-to-tr from-[var(--mn-primary)] via-blue-400 to-[var(--mn-accent-soft)] shadow-xs shrink-0 flex items-center justify-center">
                        <div className="w-full h-full rounded-full overflow-hidden bg-[var(--mn-surface)] border border-white flex items-center justify-center text-lg sm:text-xl shadow-inner">
                          <ScholarshipCountryFlag
                            country={scholarship.country}
                            countryFlag={scholarship.countryFlag}
                            scholarshipId={scholarship.id}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col items-start text-right min-w-0 flex-1">
                        <h3 className="text-[13px] sm:text-[14px] font-bold text-slate-900 font-['Cairo',sans-serif] leading-tight truncate w-full">
                          {scholarship.title}
                        </h3>
                        <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 font-['Cairo',sans-serif] truncate w-full">
                          {scholarship.titleEn || scholarship.university}
                        </span>
                      </div>
                    </div>

                    {/* Visual Left (RTL): Favorite Button */}
                    <button
                      onClick={(e) => handleFavoriteClick(e, scholarship.id)}
                      className="w-8 h-8 rounded-full bg-slate-50 hover:bg-blue-50 border border-slate-200/80 flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-2xs shrink-0"
                      title="أضف إلى المفضلة"
                    >
                      <Heart
                        className={`w-4 h-4 ${isFav ? 'fill-[var(--mn-accent)] text-[var(--mn-accent-text)]' : 'text-slate-400'}`}
                      />
                    </button>
                  </div>

                  {/* Bottom Row: 4 Pill Badges (3 info badges + View Details CTA Button) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-0.5">
                    {/* 1. التمويل */}
                    <div className="bg-[var(--mn-page)] border border-slate-200/80 rounded-lg px-2 py-1 flex items-center justify-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-700 font-['Cairo',sans-serif]">
                      <Coins className="w-3 h-3 text-[var(--mn-accent-text)] shrink-0" />
                      <span className="truncate">{scholarship.fundingType}</span>
                    </div>

                    {/* 2. الدرجة العلمية */}
                    <div className="bg-[var(--mn-page)] border border-slate-200/80 rounded-lg px-2 py-1 flex items-center justify-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-700 font-['Cairo',sans-serif]">
                      <GraduationCap className="w-3 h-3 text-[var(--mn-heading)] shrink-0" />
                      <span className="truncate">{scholarship.degreeLevel.join(' • ')}</span>
                    </div>

                    {/* 3. الموعد النهائي */}
                    <div className="bg-[var(--mn-page)] border border-slate-200/80 rounded-lg px-2 py-1 flex items-center justify-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-700 font-['Cairo',sans-serif]">
                      <Calendar className="w-3 h-3 text-blue-600 shrink-0" />
                      <span className="truncate">ينتهي {scholarship.deadline}</span>
                    </div>

                    {/* 4. زر عرض التفاصيل مكان الآيلتس */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectScholarship) onSelectScholarship(scholarship);
                      }}
                      className="bg-[#002E52] hover:bg-[var(--mn-primary)] text-white rounded-lg px-2 py-1 flex items-center justify-center gap-1 text-[10px] sm:text-[11px] font-bold transition-all active:scale-95 cursor-pointer font-['Cairo',sans-serif] shadow-2xs"
                    >
                      <span>عرض التفاصيل</span>
                      <ChevronLeft className="w-3 h-3 rotate-180" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
