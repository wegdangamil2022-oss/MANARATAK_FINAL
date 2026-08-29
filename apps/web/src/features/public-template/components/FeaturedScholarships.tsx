import React from 'react';
import { ChevronLeft, GraduationCap, Heart } from 'lucide-react';
import { Scholarship } from '../types';

interface FeaturedScholarshipsProps {
  scholarships?: Scholarship[];
  onSelectScholarship?: (scholarship: Scholarship) => void;
  onToggleFavorite?: (id: string) => void;
  favoriteIds?: string[];
  onViewAllClick: () => void;
}

export const FeaturedScholarships: React.FC<FeaturedScholarshipsProps> = ({
  scholarships,
  onSelectScholarship,
  onToggleFavorite,
  favoriteIds = [],
  onViewAllClick,
}) => {
  // Featured scholarship cards
  const mockCards = [
    {
      id: 'csc-china',
      title: 'منحة الحكومة الصينية (CSC)',
      country: 'الصين 🇨🇳',
      imageUrl:
        'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'chevening-uk',
      title: 'منحة تشيفنينغ البريطانية',
      country: 'بريطانيا 🇬🇧',
      imageUrl:
        'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const handleCardClick = (cardId: string) => {
    if (onSelectScholarship && scholarships && scholarships.length > 0) {
      const match = scholarships.find(
        (s) =>
          s.id === cardId ||
          (cardId.includes('csc') && s.id.includes('csc')) ||
          (cardId.includes('chevening') && s.id.includes('chevening')),
      );
      if (match) {
        onSelectScholarship(match);
        return;
      }
    }
    onViewAllClick();
  };

  return (
    <section id="featured-scholarships-section" className="px-0.5 sm:px-1 py-3 w-full">
      {/* Standard Framed Container with top accent border only */}
      <div className="relative rounded-3xl p-3.5 sm:p-4 bg-gradient-to-b from-[var(--mn-surface)] to-slate-50/80 border border-slate-200/90 shadow-sm border-t-2 border-t-[var(--mn-accent)]/40 overflow-hidden">
        {/* Content Inside the Framed Section */}
        <div className="relative z-10">
          {/* Centered Section Title */}
          <div className="text-center mb-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 inline-flex items-center justify-center gap-1.5 font-['Cairo',sans-serif]">
              <GraduationCap className="w-4 h-4 text-[var(--mn-heading)]" />
              <span>المنح الدراسية</span>
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-600 font-medium mt-1 max-w-xs mx-auto font-['Cairo',sans-serif]">
              تصفح أبرز المنح الدراسية الممولة واكتشف الفرص التي تساعدك على تحقيق حلمك الأكاديمي.
            </p>
          </div>

          {/* 2 Featured Cards: Edge-to-edge layout with Square Proportions */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full">
            {mockCards.map((scholarship) => {
              const isFav = favoriteIds.includes(scholarship.id);
              return (
                <div
                  key={scholarship.id}
                  onClick={() => handleCardClick(scholarship.id)}
                  className="group relative flex flex-col rounded-2xl overflow-hidden shadow-xs hover:shadow-md border border-slate-200 bg-slate-900 cursor-pointer transition-all active:scale-97 hover:border-[var(--mn-accent)]"
                >
                  {/* Image Container with Square (1:1) Proportions */}
                  <div className="relative aspect-square w-full overflow-hidden bg-[var(--mn-primary)]">
                    <img
                      src={scholarship.imageUrl}
                      alt={scholarship.title}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 filter brightness-95"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=800&q=80';
                      }}
                    />

                    {/* Favorite Heart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleFavorite) onToggleFavorite(scholarship.id);
                      }}
                      className="absolute top-2 left-2 p-1.5 rounded-full bg-black/50 backdrop-blur-xs text-white hover:text-[var(--mn-accent-text)] transition-colors z-10 cursor-pointer"
                      aria-label="إضافة للمفضلة"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${isFav ? 'fill-[var(--mn-accent)] text-[var(--mn-accent-text)]' : 'text-white'}`}
                      />
                    </button>

                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />

                    {/* Card Title and Country */}
                    <div className="absolute inset-x-0 bottom-0 p-2 text-center text-white z-10">
                      <h4 className="font-bold text-[11px] sm:text-xs leading-tight text-white line-clamp-2 drop-shadow-xs mb-0.5 font-['Cairo',sans-serif]">
                        {scholarship.title}
                      </h4>
                      <p className="text-[10px] font-semibold text-slate-300 flex items-center justify-center gap-1 font-['Cairo',sans-serif]">
                        <span>{scholarship.country}</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View All Button with Subtle Circular Glow Pulse */}
          <div className="mt-3.5 flex justify-center">
            <button
              id="btn-view-all-scholarships"
              onClick={onViewAllClick}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-[var(--mn-surface)] hover:bg-[var(--mn-accent)]/10 text-[var(--mn-heading)] border border-[var(--mn-accent)]/50 rounded-full text-xs sm:text-sm font-bold transition-all shadow-[0_0_15px_rgba(200,162,74,0.3)] hover:shadow-[0_0_25px_rgba(200,162,74,0.5)] animate-pulse hover:animate-none active:scale-95 font-['Cairo',sans-serif]"
            >
              <span>تصفح جميع المنح الدراسية</span>
              <ChevronLeft className="w-4 h-4 text-[var(--mn-heading)] transition-transform group-hover:-translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
