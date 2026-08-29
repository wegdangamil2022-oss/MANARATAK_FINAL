import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  X,
  ChevronLeft,
  ChevronDown,
  Layers,
  Activity,
  Cpu,
  Zap,
  TrendingUp,
  BookOpen,
  Globe2,
  Briefcase,
  Clock,
  GraduationCap,
  RotateCcw,
  Heart,
  Microscope,
} from 'lucide-react';
import { Major, DegreeLevel } from '../types';
import { MOCK_MAJORS } from '../data/mockData';
import { MajorCard } from './MajorCard';

interface MajorsSearchPageProps {
  favoriteIds?: string[];
  onToggleFavorite?: (id: string) => void;
  majors?: Major[];
  onBack?: () => void;
  onSelectMajor?: (major: Major) => void;
}

export const MajorsSearchPage: React.FC<MajorsSearchPageProps> = ({
  majors = MOCK_MAJORS,
  onBack,
  onSelectMajor,
  favoriteIds = [],
  onToggleFavorite,
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('الكل');
  const [selectedDegree, setSelectedDegree] = useState('الكل');

  const resultsRef = useRef<HTMLDivElement>(null);

  // Extract unique faculties (categories)
  const faculties = useMemo(() => {
    const set = new Set<string>();
    majors.forEach((m) => {
      if (m.category) set.add(m.category);
    });
    return ['الكل', ...Array.from(set)];
  }, [majors]);

  // Degrees filter list
  const degreeLevels = ['الكل', 'بكالوريوس', 'ماجستير', 'دكتوراه', 'زمالة أبحاث', 'دورات تدريبية'];

  // Filter majors
  const filteredMajors = useMemo(() => {
    return majors.filter((m) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        m.name.toLowerCase().includes(q) ||
        (m.nameEn && m.nameEn.toLowerCase().includes(q)) ||
        (m.description && m.description.toLowerCase().includes(q));

      const matchesFaculty = selectedFaculty === 'الكل' || m.category === selectedFaculty;
      const matchesDegree =
        selectedDegree === 'الكل' ||
        (m.degreeLevels && m.degreeLevels.includes(selectedDegree as DegreeLevel));

      return matchesQuery && matchesFaculty && matchesDegree;
    });
  }, [majors, searchQuery, selectedFaculty, selectedDegree]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedFaculty('الكل');
    setSelectedDegree('الكل');
  };

  const activeFiltersCount =
    (selectedFaculty !== 'الكل' ? 1 : 0) +
    (selectedDegree !== 'الكل' ? 1 : 0) +
    (searchQuery.trim() !== '' ? 1 : 0);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-[var(--mn-accent-text)]" />;
      case 'Activity':
        return <Activity className="w-5 h-5 text-red-500" />;
      case 'Microscope':
        return <Microscope className="w-5 h-5 text-[var(--mn-heading)]" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-[var(--mn-accent-text)]" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5 text-[var(--mn-heading)]" />;
      default:
        return <BookOpen className="w-5 h-5 text-[var(--mn-heading)]" />;
    }
  };

  return (
    <div
      className="min-h-screen bg-[var(--mn-page)] text-slate-900 pb-24 font-sans select-none"
      dir="rtl"
    >
      {/* ========================================================================= */}
      {/* HERO EMERALD CURVED BANNER */}
      {/* ========================================================================= */}
      <div className="relative mn-search-hero text-white px-3 sm:px-4 pt-4 pb-12 sm:pb-14 overflow-hidden shadow-sm">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 backdrop-blur-md rounded-full transition-all z-20 cursor-pointer text-white"
            title="العودة"
          >
            <ChevronLeft className="w-5 h-5 rotate-180" />
          </button>
        )}

        {/* Background Decorative Gold Waves & Dot Patterns */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg
            className="w-full h-full"
            viewBox="0 0 400 200"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M-50,50 Q100,-20 250,60 T550,40"
              stroke="var(--mn-accent)"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M-20,120 Q150,40 300,140 T600,100"
              stroke="var(--mn-accent)"
              strokeWidth="1"
              fill="none"
            />
            <circle cx="30" cy="30" r="1" fill="var(--mn-accent)" />
            <circle cx="45" cy="30" r="1" fill="var(--mn-accent)" />
            <circle cx="60" cy="30" r="1" fill="var(--mn-accent)" />
            <circle cx="30" cy="45" r="1" fill="var(--mn-accent)" />
            <circle cx="45" cy="45" r="1" fill="var(--mn-accent)" />
            <circle cx="60" cy="45" r="1" fill="var(--mn-accent)" />
          </svg>
        </div>

        <div className="max-w-xl mx-auto text-center relative z-10 space-y-2.5">
          {/* Little 4-pointed Gold Sparkle Star */}
          <div className="flex justify-center -mb-1">
            <span className="text-[var(--mn-accent-text)] text-sm animate-pulse">✦</span>
          </div>

          {/* Headline with Gold Curve */}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-['Cairo',sans-serif] tracking-tight">
              <span>ابحث عن </span>
              <span className="relative inline-block text-white">
                تخصصك الأكاديمي
                {/* Gold brush accent line underneath */}
                <svg
                  className="absolute -bottom-1.5 inset-x-0 w-full h-2 text-[var(--mn-accent-text)]"
                  viewBox="0 0 100 12"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2,9 Q50,2 98,6"
                    stroke="var(--mn-accent)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-[11px] sm:text-xs text-blue-100/90 font-medium font-['Cairo',sans-serif] mt-1.5 leading-relaxed max-w-xs sm:max-w-sm mx-auto">
              تصفح التخصصات المتاحة وتعرف على الكليات والدرجات العلمية المناسبة لطموحك
            </p>
          </div>

          {/* Integrated Search Bar in Hero */}
          <div className="pt-1 max-w-md mx-auto px-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم التخصص، الكلية، الوظيفة..."
                className="w-full py-2.5 pl-4 pr-10 bg-[#002642]/85 hover:bg-[#002642] focus:bg-[#002642] border border-[var(--mn-accent)]/40 focus:border-[var(--mn-accent)] rounded-full text-xs sm:text-[13px] font-bold text-white placeholder-white focus:outline-none shadow-inner transition-all text-center font-['Cairo',sans-serif]"
              />
              <Search className="w-4 h-4 text-[var(--mn-accent-text)] absolute right-4 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1 text-blue-200 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {activeFiltersCount > 0 && (
          <div className="flex justify-center mt-3">
            <button
              onClick={handleResetFilters}
              className="text-[10px] sm:text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full transition-colors flex items-center gap-1 cursor-pointer font-['Cairo',sans-serif]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إعادة ضبط الفلاتر ({activeFiltersCount})</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* FLOATING FILTER CARD WITH 2 TILES (الكلية • الدرجة)  */}
      {/* ========================================================================= */}
      <div className="max-w-xl mx-auto px-3 sm:px-4 -mt-7 sm:-mt-8 relative z-20 space-y-2.5">
        {/* Outer Framed Box with Gold Border */}
        <div className="bg-[var(--mn-surface)] border border-[var(--mn-accent)]/50 rounded-3xl p-2 sm:p-2.5 shadow-md">
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            {/* Tile 1: الكلية */}
            <div className="relative bg-[var(--mn-surface)] hover:bg-slate-50/80 border border-slate-200/80 rounded-2xl p-2 sm:p-2.5 flex flex-col items-center justify-center text-center shadow-2xs transition-colors">
              <div className="flex items-center gap-1 text-slate-800 font-bold text-[10px] sm:text-[11px] font-['Cairo',sans-serif] leading-tight">
                <Layers className="w-3 h-3 text-[var(--mn-accent-text)]" />
                <span className="truncate">
                  {selectedFaculty === 'الكل' ? 'اختر الكلية' : selectedFaculty}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 mt-1" />
              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                title="اختر الكلية"
              >
                {faculties.map((c) => (
                  <option key={c} value={c}>
                    {c === 'الكل' ? '🏛️ جميع الكليات' : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Tile 2: الدرجة العلمية */}
            <div className="relative bg-[var(--mn-surface)] hover:bg-slate-50/80 border border-slate-200/80 rounded-2xl p-2 sm:p-2.5 flex flex-col items-center justify-center text-center shadow-2xs transition-colors">
              <div className="flex items-center gap-1 text-slate-800 font-bold text-[10px] sm:text-[11px] font-['Cairo',sans-serif] leading-tight">
                <GraduationCap className="w-3 h-3 text-[var(--mn-accent-text)]" />
                <span className="truncate">
                  {selectedDegree === 'الكل' ? 'الدرجة العلمية' : selectedDegree}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 mt-1" />
              <select
                value={selectedDegree}
                onChange={(e) => setSelectedDegree(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                title="اختر الدرجة العلمية"
              >
                {degreeLevels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl === 'الكل' ? '🎓 جميع الدرجات' : lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RESULTS LIST SECTION */}
      {/* ========================================================================= */}
      <div ref={resultsRef} className="w-full max-w-4xl mx-auto px-2 sm:px-3 pt-3 space-y-2.5">
        {/* Section Header: التخصصات المتاحة */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs sm:text-sm font-black text-slate-900 font-['Cairo',sans-serif]">
            التخصصات المتاحة ({filteredMajors.length})
          </span>
          <span className="text-[10px] sm:text-[11px] text-[var(--mn-accent-text)] font-bold font-['Cairo',sans-serif]">
            محدثة باستمرار
          </span>
        </div>

        {/* Cards Stack */}
        <div className="flex flex-col gap-2.5 sm:gap-3 w-full">
          {filteredMajors.length === 0 ? (
            <div className="bg-[var(--mn-surface)] border border-slate-200 rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-2 shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-800 font-['Cairo',sans-serif]">
                لا توجد تخصصات مطابقة للبحث
              </h3>
              <p className="text-xs text-slate-500 max-w-xs font-['Cairo',sans-serif]">
                جرب تغيير خيارات التصفية أو البحث باسم تخصص آخر.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-2 px-4 py-1.5 bg-[var(--mn-primary)] text-white rounded-xl text-xs font-bold cursor-pointer font-['Cairo',sans-serif]"
              >
                إلغاء التصفية وعرض الكل
              </button>
            </div>
          ) : (
            filteredMajors.map((major) => (
              <MajorCard
                key={major.id}
                major={major}
                isFavorited={favoriteIds.includes(major.id)}
                onToggleFavorite={onToggleFavorite}
                onSelectMajor={onSelectMajor}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
