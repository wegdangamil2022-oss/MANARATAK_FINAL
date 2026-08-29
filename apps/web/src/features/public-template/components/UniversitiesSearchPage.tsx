import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  X,
  ChevronLeft,
  ChevronDown,
  Globe2,
  MapPin,
  Building2,
  RotateCcw,
  Landmark,
  Heart,
  History,
  Briefcase,
} from 'lucide-react';
import { University } from '../types';
import { MOCK_UNIVERSITIES } from '../data/mockData';

interface UniversitiesSearchPageProps {
  universities?: University[];
  onBack?: () => void;
  onSelectUniversity?: (university: University) => void;
}

export const UniversitiesSearchPage: React.FC<UniversitiesSearchPageProps> = ({
  universities = MOCK_UNIVERSITIES,
  onBack,
  onSelectUniversity,
}) => {
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('الكل');
  const [selectedCountry, setSelectedCountry] = useState('الكل');
  const [selectedCity, setSelectedCity] = useState('الكل');

  const resultsRef = useRef<HTMLDivElement>(null);
  const [savedUniversities, setSavedUniversities] = useState<string[]>([]);

  const toggleSave = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSavedUniversities((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id],
    );
  };

  // Continents list
  const continents = [
    'الكل',
    'آسيا',
    'أوروبا',
    'أمريكا الشمالية',
    'أمريكا الجنوبية',
    'أفريقيا',
    'أوقيانوسيا',
  ];

  // Countries list derived from data or common options
  const countries = useMemo(() => {
    const set = new Set<string>();
    universities.forEach((u) => {
      if (u.country) set.add(u.country);
    });
    // Add popular countries if list is small
    const popular = [
      'بريطانيا',
      'أمريكا',
      'تركيا',
      'ألمانيا',
      'كندا',
      'أستراليا',
      'اليابان',
      'السعودية',
      'الإمارات',
      'مصر',
    ];
    popular.forEach((c) => set.add(c));
    return ['الكل', ...Array.from(set)];
  }, [universities]);

  // Cities list derived from popular destinations
  const cities = [
    'الكل',
    'لندن',
    'أكسفورد',
    'كامبريدج',
    'بوسطن',
    'نيويورك',
    'إسطنبول',
    'أنقرة',
    'برلين',
    'ميونخ',
    'تورونتو',
    'سيدني',
    'طوكيو',
    'الرياض',
    'دبي',
    'القاهرة',
  ];

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedContinent('الكل');
    setSelectedCountry('الكل');
    setSelectedCity('الكل');
  };

  const filteredUniversities = useMemo(() => {
    return universities.filter((u) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !u.name.toLowerCase().includes(query) &&
          !u.nameEn.toLowerCase().includes(query) &&
          !u.country.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      if (selectedCountry !== 'الكل' && u.country !== selectedCountry) {
        return false;
      }
      if (selectedCity !== 'الكل' && u.city !== selectedCity) {
        return false;
      }
      return true;
    });
  }, [universities, searchQuery, selectedCountry, selectedCity]);

  const activeFiltersCount =
    (selectedContinent !== 'الكل' ? 1 : 0) +
    (selectedCountry !== 'الكل' ? 1 : 0) +
    (selectedCity !== 'الكل' ? 1 : 0) +
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
              خطوتك الأولى نحو{' '}
              <span className="text-[var(--mn-accent-text)]">الجامعة المناسبة</span>
            </h1>

            {/* Small Gold Horizontal Divider */}
            <div className="flex justify-center pt-1 pb-0.5">
              <div className="w-10 h-0.5 bg-[var(--mn-accent)] rounded-full" />
            </div>

            {/* Subtitle */}
            <p className="text-[11px] sm:text-xs text-white/90 font-medium font-['Cairo',sans-serif] leading-relaxed max-w-xs sm:max-w-sm mx-auto">
              اكتشف أفضل الجامعات حول العالم بشروط قبول واضحة وفرص متنوعة.
            </p>
          </div>

          {/* Integrated Clean White Search Bar in Hero */}
          <div className="pt-1 max-w-sm sm:max-w-md mx-auto px-1">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم الجامعة، الدولة، أو التخصص..."
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
      {/* 3 SEPARATE FLOATING FILTER TILES (القارة • الدولة • المدينة) */}
      {/* ========================================================================= */}
      <div className="max-w-lg mx-auto px-4 -mt-7 sm:-mt-8 relative z-20">
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
          {/* Tile 1: القارة */}
          <div className="relative bg-[var(--mn-surface)] hover:bg-amber-50/40 border-1.5 border-[var(--mn-accent)]/70 hover:border-[var(--mn-accent)] rounded-xl sm:rounded-2xl p-2 sm:p-2.5 flex flex-col items-center justify-center text-center shadow-[0_4px_14px_rgba(0,0,0,0.06)] transition-all h-[58px] sm:h-[64px] cursor-pointer">
            <div className="flex items-center justify-center gap-1 text-slate-900 font-extrabold text-[11px] sm:text-xs font-['Cairo',sans-serif] w-full">
              <span className="truncate">
                {selectedContinent === 'الكل' ? 'القارة' : selectedContinent}
              </span>
              <Globe2 className="w-3.5 h-3.5 text-[var(--mn-accent-text)] shrink-0" />
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
            <select
              value={selectedContinent}
              onChange={(e) => setSelectedContinent(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              title="اختر القارة"
            >
              {continents.map((c) => (
                <option key={c} value={c}>
                  {c === 'الكل' ? '🌍 جميع القارات' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Tile 2: الدولة */}
          <div className="relative bg-[var(--mn-surface)] hover:bg-amber-50/40 border-1.5 border-[var(--mn-accent)]/70 hover:border-[var(--mn-accent)] rounded-xl sm:rounded-2xl p-2 sm:p-2.5 flex flex-col items-center justify-center text-center shadow-[0_4px_14px_rgba(0,0,0,0.06)] transition-all h-[58px] sm:h-[64px] cursor-pointer">
            <div className="flex items-center justify-center gap-1 text-slate-900 font-extrabold text-[11px] sm:text-xs font-['Cairo',sans-serif] w-full">
              <span className="truncate">
                {selectedCountry === 'الكل' ? 'الدولة' : selectedCountry}
              </span>
              <MapPin className="w-3.5 h-3.5 text-[var(--mn-accent-text)] shrink-0" />
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              title="اختر الدولة"
            >
              {countries.map((cnt) => (
                <option key={cnt} value={cnt}>
                  {cnt === 'الكل' ? '🏳️ جميع الدول' : cnt}
                </option>
              ))}
            </select>
          </div>

          {/* Tile 3: المدينة */}
          <div className="relative bg-[var(--mn-surface)] hover:bg-amber-50/40 border-1.5 border-[var(--mn-accent)]/70 hover:border-[var(--mn-accent)] rounded-xl sm:rounded-2xl p-2 sm:p-2.5 flex flex-col items-center justify-center text-center shadow-[0_4px_14px_rgba(0,0,0,0.06)] transition-all h-[58px] sm:h-[64px] cursor-pointer">
            <div className="flex items-center justify-center gap-1 text-slate-900 font-extrabold text-[11px] sm:text-xs font-['Cairo',sans-serif] w-full">
              <span className="truncate">{selectedCity === 'الكل' ? 'المدينة' : selectedCity}</span>
              <Building2 className="w-3.5 h-3.5 text-[var(--mn-accent-text)] shrink-0" />
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              title="اختر المدينة"
            >
              {cities.map((cty) => (
                <option key={cty} value={cty}>
                  {cty === 'الكل' ? '🏙️ جميع المدن' : cty}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RESULTS LIST SECTION (ترك البطاقات فارغة وفق طلب المستخدم) */}
      {/* ========================================================================= */}
      <div ref={resultsRef} className="w-full max-w-4xl mx-auto px-1 sm:px-2 pt-4 space-y-2.5">
        {/* Section Header */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs sm:text-sm font-black text-slate-900 font-['Cairo',sans-serif] flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-[var(--mn-heading)]" />
            <span>دليل الجامعات العالمية</span>
          </span>
          <span className="text-[10px] sm:text-[11px] text-[var(--mn-accent-text)] font-bold font-['Cairo',sans-serif]">
            محدثة باستمرار
          </span>
        </div>

        {/* Cards Container */}
        <div className="flex flex-col gap-2.5 sm:gap-3 w-full pb-10">
          {filteredUniversities.length === 0 ? (
            <div className="bg-[var(--mn-surface)] border border-slate-200 rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-2 shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-800 font-['Cairo',sans-serif]">
                لا توجد جامعات مطابقة للبحث
              </h3>
              <p className="text-xs text-slate-500 max-w-xs font-['Cairo',sans-serif]">
                جرب تغيير خيارات التصفية أو البحث باسم جامعة أخرى.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-2 text-xs font-bold text-[var(--mn-heading)] bg-[var(--mn-primary)]/10 px-4 py-2 rounded-xl hover:bg-[var(--mn-primary)]/20 transition-colors font-['Cairo',sans-serif]"
              >
                مسح جميع الفلاتر
              </button>
            </div>
          ) : (
            filteredUniversities.map((univ) => {
              const isSaved = savedUniversities.includes(univ.id);
              return (
                <div
                  key={univ.id}
                  onClick={() => onSelectUniversity?.(univ)}
                  className="bg-[var(--mn-surface)] rounded-xl sm:rounded-2xl border-2 border-[var(--mn-border-brand)]/40 hover:border-[var(--mn-border-brand)] shadow-sm hover:shadow-md transition-all p-2.5 sm:p-3 relative overflow-hidden group cursor-pointer flex flex-col gap-2 sm:gap-2.5"
                >
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-[var(--mn-accent)] to-amber-200 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  {/* Top Row: Logo & Names + Actions */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      {/* University Logo / Image */}
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full p-0.5 bg-gradient-to-tr from-[var(--mn-accent)] via-amber-300 to-[var(--mn-secondary)] shadow-xs shrink-0 flex items-center justify-center">
                        <div className="w-full h-full rounded-full overflow-hidden bg-slate-50 border border-white flex items-center justify-center text-lg sm:text-xl shadow-inner">
                          {univ.countryFlag}
                        </div>
                      </div>

                      {/* Names */}
                      <div className="flex flex-col items-start text-right">
                        <h3 className="text-[13px] sm:text-[14px] font-black text-slate-900 font-['Cairo',sans-serif] leading-tight group-hover:text-[var(--mn-heading)] transition-colors line-clamp-1">
                          {univ.name}{' '}
                          <span className="text-slate-600 font-bold text-[10px] sm:text-[11px] mr-1">
                            ({univ.nameEn.replace('University of ', '').replace(' University', '')})
                          </span>
                        </h3>
                      </div>
                    </div>

                    {/* Save to Favorites Button */}
                    <button
                      onClick={(e) => toggleSave(e, univ.id)}
                      className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-all shrink-0 border border-slate-200/80 shadow-xs z-10 active:scale-90"
                      title="حفظ في المفضلة"
                    >
                      <Heart
                        className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-colors ${isSaved ? 'fill-red-500 text-red-500' : 'text-slate-400 hover:text-red-400'}`}
                      />
                    </button>
                  </div>

                  {/* Bottom Row: 4 Pill Badges (3 Info Badges + View Details CTA Button) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-0.5">
                    {/* 1. Ownership / Type */}
                    <div className="bg-[var(--mn-page)] border border-slate-200/80 rounded-lg px-2 py-1 flex items-center justify-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-700 font-['Cairo',sans-serif]">
                      <Briefcase className="w-3 h-3 text-[var(--mn-accent-text)] shrink-0" />
                      <span className="truncate">{univ.ownership || univ.type || 'حكومية'}</span>
                    </div>

                    {/* 2. Location */}
                    <div className="bg-[var(--mn-page)] border border-slate-200/80 rounded-lg px-2 py-1 flex items-center justify-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-700 font-['Cairo',sans-serif]">
                      <MapPin className="w-3 h-3 text-[var(--mn-heading)] shrink-0" />
                      <span className="truncate">
                        {univ.country}
                        {univ.city ? `، ${univ.city}` : ''}
                      </span>
                    </div>

                    {/* 3. Foundation Year */}
                    <div className="bg-[var(--mn-page)] border border-slate-200/80 rounded-lg px-2 py-1 flex items-center justify-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-700 font-['Cairo',sans-serif]">
                      <History className="w-3 h-3 text-blue-600 shrink-0" />
                      <span className="truncate">
                        {univ.foundationYear ? `تأسست ${univ.foundationYear}` : 'جامعة معتمدة'}
                      </span>
                    </div>

                    {/* 4. View Details Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectUniversity?.(univ);
                      }}
                      className="bg-[#002E52] hover:bg-[var(--mn-primary)] text-white rounded-lg px-2 py-1 flex items-center justify-center gap-1 text-[10px] sm:text-[10.5px] font-bold transition-all active:scale-95 cursor-pointer font-['Cairo',sans-serif] shadow-2xs"
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
