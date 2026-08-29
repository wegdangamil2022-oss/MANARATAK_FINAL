import React from 'react';
import { University } from '../types';
import { Landmark, ChevronLeft, Trophy, GraduationCap, MapPin } from 'lucide-react';

interface FeaturedUniversitiesProps {
  universities: University[];
  onSelectUniversity: (university: University) => void;
  onViewAllClick: () => void;
}

export const FeaturedUniversities: React.FC<FeaturedUniversitiesProps> = ({
  universities,
  onSelectUniversity,
  onViewAllClick,
}) => {
  // Top 3 prestigious universities for the leaderboard ranking
  const topRanked = universities.slice(0, 3);

  // Badge styling based on rank
  const getRankBadge = (rankIndex: number) => {
    if (rankIndex === 0) {
      return {
        bg: 'bg-gradient-to-br from-[#E6CA65] via-[var(--mn-accent-soft)] to-[#997728] text-slate-950 font-black',
        label: '#1',
      };
    }
    if (rankIndex === 1) {
      return {
        bg: 'bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 text-slate-900 font-bold',
        label: '#2',
      };
    }
    return {
      bg: 'bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-amber-50 font-bold',
      label: '#3',
    };
  };

  return (
    <section id="featured-universities-section" className="px-0.5 sm:px-1 py-3 w-full">
      {/* Standard Framed Container with top accent border only */}
      <div className="relative rounded-3xl p-3.5 sm:p-4 bg-gradient-to-b from-[var(--mn-surface)] to-slate-50/80 border border-slate-200/90 shadow-sm border-t-2 border-t-[var(--mn-accent)]/40 overflow-hidden">
        {/* Content Inside the Framed Section */}
        <div className="relative z-10">
          {/* Centered Section Title */}
          <div className="text-center mb-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 inline-flex items-center justify-center gap-1.5 font-['Cairo',sans-serif]">
              <Landmark className="w-4 h-4 text-[var(--mn-accent-text)]" />
              <span>ابحث عن أي جامعة في العالم</span>
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-600 font-medium mt-1 max-w-xs mx-auto font-['Cairo',sans-serif]">
              استكشف آلاف الجامعات حول العالم وتعرف على التخصصات، المنح، وتفاصيل القبول المتاحة.
            </p>
          </div>

          {/* Leaderboard Ranking Cards List */}
          <div className="space-y-2 w-full font-['Cairo',sans-serif]">
            {topRanked.map((uni, idx) => {
              const rank = getRankBadge(idx);

              return (
                <div
                  key={uni.id}
                  onClick={() => onSelectUniversity(uni)}
                  className="group relative flex items-center justify-between p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-[var(--mn-surface)] border border-slate-200 hover:border-[var(--mn-accent)] shadow-xs hover:shadow-sm transition-all duration-300 cursor-pointer active:scale-[0.99]"
                >
                  {/* Right Side: Rank Medal + University Crest/Image + Names */}
                  <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                    {/* Ranking Medal Circle */}
                    <div
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl flex items-center justify-center text-[10px] sm:text-xs shadow-xs shrink-0 ${rank.bg}`}
                    >
                      <span>{rank.label}</span>
                    </div>

                    {/* University Campus Thumbnail */}
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl overflow-hidden shrink-0 border border-slate-100 bg-[var(--mn-primary)]">
                      <img
                        src={uni.imageUrl}
                        alt={uni.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    </div>

                    {/* Name & Location Info */}
                    <div className="min-w-0 flex-1 text-right rtl:text-right">
                      <h4 className="font-bold text-[11.5px] sm:text-xs text-slate-900 group-hover:text-[var(--mn-heading)] transition-colors truncate">
                        {uni.name}{' '}
                        <span className="text-slate-500 font-semibold text-[9px] sm:text-[10px] mr-1">
                          ({uni.nameEn.replace('University of ', '').replace(' University', '')})
                        </span>
                      </h4>

                      <div className="flex items-center gap-1.5 text-[9.5px] sm:text-[10px] text-slate-500 flex-wrap mt-0.5">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                          <span>{uni.countryFlag}</span>
                          <span>{uni.country}</span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="inline-flex items-center gap-1 text-[var(--mn-heading)] font-bold">
                          <GraduationCap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[var(--mn-accent-text)]" />
                          <span>{uni.scholarshipCount} منحة</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Left Side: QS Global Badge & Navigation Arrow */}
                  <div className="flex flex-col items-end justify-center shrink-0 pl-1">
                    <span className="px-1.5 py-0.5 rounded-md bg-[var(--mn-accent)]/15 text-[var(--mn-accent-text)] font-black text-[9.5px] sm:text-[10px] border border-[var(--mn-accent)]/30 mb-0.5">
                      QS #{uni.globalRank}
                    </span>
                    <span className="text-[9px] sm:text-[9.5px] font-bold text-[var(--mn-heading)] group-hover:text-[var(--mn-accent-text)] flex items-center gap-0.5 transition-colors">
                      <span>تفاصيل</span>
                      <ChevronLeft className="w-2.5 h-2.5 sm:w-3 sm:h-3 transform group-hover:-translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View All Universities Button Placed Below */}
          <div className="mt-3.5 flex justify-center">
            <button
              id="btn-view-all-universities"
              onClick={onViewAllClick}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-[var(--mn-surface)] hover:bg-[var(--mn-accent)]/10 text-[var(--mn-heading)] border border-[var(--mn-accent)]/50 rounded-full text-xs sm:text-sm font-bold transition-all shadow-[0_0_15px_rgba(200,162,74,0.3)] hover:shadow-[0_0_25px_rgba(200,162,74,0.5)] animate-pulse hover:animate-none active:scale-95 font-['Cairo',sans-serif]"
            >
              <span>عرض قائمة الجامعات الكاملة ({universities.length})</span>
              <ChevronLeft className="w-4 h-4 text-[var(--mn-heading)] transition-transform group-hover:-translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
