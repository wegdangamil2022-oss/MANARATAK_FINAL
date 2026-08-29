import React, { useState, useMemo } from 'react';
import { ChevronLeft, Award, Search, X } from 'lucide-react';
import { Exam } from '../types';
import { MOCK_EXAMS } from '../data/mockData';

interface ExamsSearchPageProps {
  exams?: Exam[];
  onBack?: () => void;
  onSelectExam?: (exam: Exam) => void;
}

export const ExamsSearchPage: React.FC<ExamsSearchPageProps> = ({
  exams = MOCK_EXAMS,
  onBack,
  onSelectExam,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');

  // Derive categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    exams.forEach((exam) => cats.add(exam.category));
    return ['الكل', ...Array.from(cats)];
  }, [exams]);

  return (
    <div
      className="min-h-screen bg-[var(--mn-page)] text-slate-900 pb-24 font-sans select-none"
      dir="rtl"
    >
      {/* ========================================================================= */}
      {/* HERO SECTION - ELEGANT INTERNATIONAL EXAMS THEME */}
      {/* ========================================================================= */}
      <div className="relative mn-search-hero text-white px-3 sm:px-4 pt-4 pb-12 sm:pb-14 overflow-hidden shadow-xs border-b border-[var(--mn-accent)]/20">
        {/* Animated Background Elements - Creative Concept: Floating Navigation & Academic Symbols */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Background Decorative Gold Waves & Dot Patterns from Majors Page */}
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

          {/* Subtle Floating Elements: Falling Exam Names */}
          <style>{`
            @keyframes fallText {
              0% { top: -20%; transform: rotate(-5deg) scale(0.8); opacity: 0; }
              10% { opacity: 0.12; }
              90% { opacity: 0.12; }
              100% { top: 110%; transform: rotate(5deg) scale(1.1); opacity: 0; }
            }
            .falling-text {
              position: absolute;
              top: -20%;
              opacity: 0;
              color: var(--mn-accent);
              font-weight: 900;
              font-family: 'Arial', sans-serif;
              animation: fallText linear infinite;
              pointer-events: none;
              z-index: 0;
            }
          `}</style>

          <div
            className="falling-text text-3xl left-[10%]"
            style={{ animationDuration: '10s', animationDelay: '-2s' }}
          >
            IELTS
          </div>
          <div
            className="falling-text text-5xl left-[25%]"
            style={{ animationDuration: '15s', animationDelay: '-7s' }}
          >
            TOEFL
          </div>
          <div
            className="falling-text text-2xl left-[45%]"
            style={{ animationDuration: '12s', animationDelay: '-4s' }}
          >
            SAT
          </div>
          <div
            className="falling-text text-4xl left-[65%]"
            style={{ animationDuration: '14s', animationDelay: '-9s' }}
          >
            GRE
          </div>
          <div
            className="falling-text text-3xl left-[85%]"
            style={{ animationDuration: '11s', animationDelay: '-1s' }}
          >
            GMAT
          </div>
          <div
            className="falling-text text-2xl left-[15%]"
            style={{ animationDuration: '13s', animationDelay: '-11s' }}
          >
            PTE
          </div>
          <div
            className="falling-text text-4xl left-[75%]"
            style={{ animationDuration: '16s', animationDelay: '-5s' }}
          >
            STEP
          </div>
        </div>

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

        {/* Content */}
        <div className="max-w-md sm:max-w-xl mx-auto text-center relative z-10 space-y-3 pt-6">
          {/* Main Title Container */}
          <div className="relative inline-block mb-2">
            <div className="absolute -inset-x-6 -inset-y-3 bg-[var(--mn-accent)]/10 blur-xl rounded-full" />
            <h1 className="relative text-2xl sm:text-3xl font-black text-white font-['Cairo',sans-serif] tracking-tight leading-tight">
              دليل الاختبارات{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--mn-accent-soft)] to-[var(--mn-accent-soft)]">
                الدولية
              </span>
            </h1>
          </div>

          {/* Divider */}
          <div className="flex justify-center items-center gap-2 pt-1 pb-2">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-[var(--mn-accent-soft)]/50" />
            <Award className="w-4 h-4 text-[var(--mn-accent-text)]" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-[var(--mn-accent-soft)]/50" />
          </div>

          {/* Subtitle / Beautiful Copywriting */}
          <p className="text-[13px] sm:text-sm text-slate-200 font-medium font-['Cairo',sans-serif] leading-relaxed max-w-[90%] mx-auto drop-shadow-md">
            بوابتك الموثوقة للقبول العالمي. استعد لاختبارات اللغة والقدرات العالمية، واكتشف المعايير
            التي تفتح لك أبواب أرقى الجامعات في العالم.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEARCH & FILTERS SECTION (Overlapping the hero slightly)                  */}
      {/* ========================================================================= */}
      <div className="max-w-3xl mx-auto px-4 -mt-6 relative z-20">
        {/* Search Bar Container */}
        <div className="bg-[var(--mn-surface)] rounded-2xl shadow-lg border border-slate-200/60 p-2 sm:p-3 flex flex-col gap-3">
          {/* Search Input */}
          <div className="relative flex items-center w-full bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-[var(--mn-accent)] focus-within:ring-1 focus-within:ring-[var(--mn-focus)] transition-all">
            <div className="pl-3 pr-3 text-slate-400">
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <input
              type="text"
              placeholder="ابحث عن اختبار (مثال: IELTS, TOEFL, SAT)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent py-2.5 sm:py-3 text-[13px] sm:text-sm text-slate-900 outline-none placeholder:text-slate-400 font-medium w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="pl-3 pr-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-[#002642] text-[var(--mn-accent-text)] shadow-md border border-[#002642]'
                    : 'bg-[var(--mn-surface)] border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
