import React, { useState, useMemo } from 'react';
import { ChevronLeft, Search, X, PlayCircle, Briefcase, TrendingUp, Sparkles } from 'lucide-react';
import { Course } from '../types';
import { MOCK_COURSES } from '../data/mockData';

interface CoursesSearchPageProps {
  courses?: Course[];
  onBack?: () => void;
  onSelectCourse?: (course: Course) => void;
}

export const CoursesSearchPage: React.FC<CoursesSearchPageProps> = ({
  courses = MOCK_COURSES,
  onBack,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');

  // Derive categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    courses.forEach((course) => {
      if (course.category) cats.add(course.category);
    });
    return ['الكل', ...Array.from(cats)];
  }, [courses]);

  return (
    <div
      className="min-h-screen bg-[var(--mn-page)] text-slate-900 pb-24 font-sans select-none"
      dir="rtl"
    >
      {/* ========================================================================= */}
      {/* HERO SECTION - ELEGANT TRAINING COURSES THEME */}
      {/* ========================================================================= */}
      <div className="relative mn-search-hero text-white px-3 sm:px-4 pt-4 pb-12 sm:pb-14 overflow-hidden shadow-xs border-b border-[var(--mn-accent)]/20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
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

          {/* Glowing Ambient Orbs */}
          <div className="absolute top-0 right-10 w-64 h-64 bg-[var(--mn-accent)] rounded-full mix-blend-screen filter blur-[120px] opacity-10" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[var(--mn-primary)] rounded-full mix-blend-screen filter blur-[100px] opacity-20" />

          {/* Subtle Floating Elements: Training Icons */}
          <style>{`
            @keyframes floatUp {
              0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
              20% { opacity: 0.15; }
              80% { opacity: 0.15; }
              100% { transform: translateY(-100px) rotate(15deg); opacity: 0; }
            }
            .course-float {
              position: absolute;
              animation: floatUp ease-in-out infinite;
              color: var(--mn-accent);
            }
          `}</style>

          <PlayCircle
            className="course-float w-16 h-16 left-[15%] top-[60%]"
            style={{ animationDuration: '10s', animationDelay: '0s' }}
          />
          <TrendingUp
            className="course-float w-12 h-12 left-[80%] top-[40%]"
            style={{ animationDuration: '12s', animationDelay: '-4s' }}
          />
          <Briefcase
            className="course-float w-10 h-10 left-[40%] top-[70%]"
            style={{ animationDuration: '14s', animationDelay: '-2s' }}
          />
          <Sparkles
            className="course-float w-8 h-8 left-[60%] top-[30%]"
            style={{ animationDuration: '9s', animationDelay: '-7s' }}
          />
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
              دليل الدورات{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--mn-accent-soft)] to-[var(--mn-accent-soft)]">
                التدريبية
              </span>
            </h1>
          </div>

          {/* Divider */}
          <div className="flex justify-center items-center gap-2 pt-1 pb-2">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-[var(--mn-accent-soft)]/50" />
            <PlayCircle className="w-4 h-4 text-[var(--mn-accent-text)]" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-[var(--mn-accent-soft)]/50" />
          </div>

          {/* Subtitle / Beautiful Copywriting */}
          <p className="text-[13px] sm:text-sm text-slate-200 font-medium font-['Cairo',sans-serif] leading-relaxed max-w-[90%] mx-auto drop-shadow-md">
            طور مهاراتك، ارتقِ بمسيرتك المهنية، واكتشف برامج تدريبية عالمية تضعك في صدارة المنافسة
            في سوق العمل المتجدد.
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
              placeholder="ابحث عن دورة (مثال: برمجة، إدارة، تصميم)..."
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
