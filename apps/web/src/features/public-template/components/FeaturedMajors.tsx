import React from 'react';
import { Major } from '../types';
import { Sparkles, ChevronLeft, GraduationCap } from 'lucide-react';

interface FeaturedMajorsProps {
  majors: Major[];
  onSelectMajor: (major: Major) => void;
  onViewAllClick: () => void;
}

interface DegreeCategory {
  id: string;
  title: string;
  count: number;
  imageUrl: string;
}

export const FeaturedMajors: React.FC<FeaturedMajorsProps> = ({ onViewAllClick }) => {
  const DEGREE_CATEGORIES: DegreeCategory[] = [
    {
      id: 'bachelors',
      title: 'البكالوريوس',
      count: 840,
      imageUrl:
        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'masters',
      title: 'الماجستير',
      count: 1114,
      imageUrl:
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'phd',
      title: 'الدكتوراه',
      count: 1116,
      imageUrl:
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'fellowships',
      title: 'الزمالات',
      count: 360,
      imageUrl:
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <section
      id="featured-majors-section"
      className="px-0.5 sm:px-1 py-3 w-full font-['Cairo',sans-serif]"
    >
      {/* Standard Framed Container with Top Border */}
      <div className="relative rounded-3xl p-3.5 sm:p-4 bg-gradient-to-b from-[var(--mn-surface)] to-slate-50/80 border border-slate-200/90 shadow-sm border-t-2 border-t-[var(--mn-primary)]/40 overflow-hidden">
        {/* Content Inside the Framed Section */}
        <div className="relative z-10">
          {/* Centered Section Title */}
          <div className="text-center mb-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 inline-flex items-center justify-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-[var(--mn-accent-text)]" />
              <span>ابحث عن تخصصك</span>
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-600 font-medium mt-1 max-w-xs mx-auto font-['Cairo',sans-serif]">
              اختر الدرجة العلمية التي تطمح للوصول إليها وتعرف على التخصصات المتاحة لها.
            </p>
          </div>

          {/* 2x2 Grid for Degree Categories with Images */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full">
            {DEGREE_CATEGORIES.map((category) => (
              <div
                key={category.id}
                onClick={onViewAllClick}
                className="group relative flex flex-col rounded-2xl overflow-hidden shadow-xs hover:shadow-md border border-slate-200 bg-slate-900 cursor-pointer transition-all active:scale-97 hover:border-[var(--mn-accent)]"
              >
                {/* Compact Image Container with 16:9 ratio */}
                <div className="relative aspect-[4/3] sm:aspect-video w-full overflow-hidden bg-[var(--mn-primary)]">
                  <img
                    src={category.imageUrl}
                    alt={category.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 filter brightness-90"
                    referrerPolicy="no-referrer"
                  />

                  {/* Dark Gradient Overlay for Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent pointer-events-none" />

                  {/* Card Title and Subtitle */}
                  <div className="absolute inset-x-0 bottom-0 p-2 text-center text-white z-10">
                    <h4 className="font-bold text-[11px] sm:text-xs leading-tight text-white line-clamp-2 drop-shadow-xs mb-0.5 font-['Cairo',sans-serif]">
                      {category.title}
                    </h4>
                    <p className="text-[9px] sm:text-[10px] font-bold text-[var(--mn-accent-text)] line-clamp-1 font-['Cairo',sans-serif]">
                      {category.count} تخصص
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button with Subtle Circular Glow Pulse */}
          <div className="mt-4 flex justify-center">
            <button
              id="btn-view-all-majors"
              onClick={onViewAllClick}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-[var(--mn-surface)] hover:bg-[var(--mn-accent)]/10 text-[var(--mn-heading)] border border-[var(--mn-accent)]/50 rounded-full text-xs sm:text-sm font-bold transition-all shadow-[0_0_15px_rgba(200,162,74,0.3)] hover:shadow-[0_0_25px_rgba(200,162,74,0.5)] animate-pulse hover:animate-none active:scale-95 font-['Cairo',sans-serif]"
            >
              <span>تصفح جميع التخصصات</span>
              <ChevronLeft className="w-4 h-4 text-[var(--mn-heading)] transition-transform group-hover:-translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
