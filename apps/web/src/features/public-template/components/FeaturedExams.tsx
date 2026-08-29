import React from 'react';
import { Exam } from '../types';
import { FileSignature, ChevronLeft } from 'lucide-react';

const EXAMS_LIST = [
  {
    name: 'IELTS',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/IELTS_logo.svg/512px-IELTS_logo.svg.png',
  },
  {
    name: 'TOEFL iBT',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/TOEFL_Logo.svg/512px-TOEFL_Logo.svg.png',
  },
  {
    name: 'SAT',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/SAT_logo_2017.svg/512px-SAT_logo_2017.svg.png',
  },
  {
    name: 'GRE',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/GRE_logo.svg/512px-GRE_logo.svg.png',
  },
  {
    name: 'GMAT',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/GMAT_logo.svg/512px-GMAT_logo.svg.png',
  },
  {
    name: 'PTE',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Pearson_logo.svg/512px-Pearson_logo.svg.png',
  },
  {
    name: 'USMLE',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Star_of_Life.svg/512px-Star_of_Life.svg.png',
  },
  {
    name: 'Duolingo',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Duolingo_App_Icon.svg/512px-Duolingo_App_Icon.svg.png',
  },
  {
    name: 'ACCA',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/ACCA_Logo.svg/512px-ACCA_Logo.svg.png',
  },
  {
    name: 'MCAT',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Caduceus.svg/512px-Caduceus.svg.png',
  },
];

interface FeaturedExamsProps {
  exams: Exam[];
  onSelectExam?: (exam: Exam) => void;
  onViewAllClick: () => void;
}

export const FeaturedExams: React.FC<FeaturedExamsProps> = ({ onViewAllClick }) => {
  return (
    <section
      id="featured-exams-section"
      className="px-0.5 sm:px-1 py-3 w-full font-['Cairo',sans-serif]"
    >
      {/* Standard Framed Container with top accent border only */}
      <div className="relative rounded-3xl p-3.5 sm:p-4 bg-gradient-to-b from-[var(--mn-surface)] to-slate-50/80 border border-slate-200/90 shadow-sm border-t-2 border-t-[var(--mn-accent)]/40 overflow-hidden">
        {/* Content Inside the Framed Section */}
        <div className="relative z-10">
          {/* Centered Section Title */}
          <div className="text-center mb-3">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 inline-flex items-center justify-center gap-1.5">
              <FileSignature className="w-4 h-4 text-[var(--mn-accent-text)]" />
              <span>دليل الاختبارات الدولية</span>
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-600 font-medium mt-0.5">
              تعرف على متطلبات القبول اللغوية والأكاديمية والمهنية
            </p>
          </div>

          {/* Marquee Scrolling Badges Area */}
          <div
            className="relative w-full overflow-hidden flex items-center py-3 mb-4 mask-edges"
            dir="rtl"
          >
            <div className="animate-scroll-rtl gap-2.5 sm:gap-3 cursor-default">
              {/* First Set of Badges */}
              <div className="flex gap-4 sm:gap-6 items-start">
                {EXAMS_LIST.map((exam, idx) => (
                  <div
                    key={`set1-${idx}`}
                    className="flex flex-col items-center gap-2 w-16 sm:w-20 shrink-0 cursor-pointer group"
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[var(--mn-surface)] border border-slate-200 shadow-sm overflow-hidden p-[3px] transition-all group-hover:-translate-y-1 group-hover:border-[var(--mn-accent)] group-hover:shadow-md">
                      <div className="w-full h-full rounded-xl overflow-hidden bg-[var(--mn-surface)] relative flex justify-center items-center p-1.5">
                        <img
                          src={exam.image}
                          alt={exam.name}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-700 text-center uppercase tracking-wider group-hover:text-[var(--mn-heading)] transition-colors line-clamp-1">
                      {exam.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Second Identical Set for Seamless Loop */}
              <div className="flex gap-4 sm:gap-6 items-start">
                {EXAMS_LIST.map((exam, idx) => (
                  <div
                    key={`set2-${idx}`}
                    className="flex flex-col items-center gap-2 w-16 sm:w-20 shrink-0 cursor-pointer group"
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[var(--mn-surface)] border border-slate-200 shadow-sm overflow-hidden p-[3px] transition-all group-hover:-translate-y-1 group-hover:border-[var(--mn-accent)] group-hover:shadow-md">
                      <div className="w-full h-full rounded-xl overflow-hidden bg-[var(--mn-surface)] relative flex justify-center items-center p-1.5">
                        <img
                          src={exam.image}
                          alt={exam.name}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-700 text-center uppercase tracking-wider group-hover:text-[var(--mn-heading)] transition-colors line-clamp-1">
                      {exam.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* View All Button */}
          <div className="mt-2 flex justify-center">
            <button
              id="btn-view-all-exams"
              onClick={onViewAllClick}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-[var(--mn-surface)] hover:bg-[var(--mn-accent)]/10 text-[var(--mn-heading)] border border-[var(--mn-accent)]/50 rounded-full text-xs sm:text-sm font-bold transition-all shadow-[0_0_15px_rgba(200,162,74,0.3)] hover:shadow-[0_0_25px_rgba(200,162,74,0.5)] animate-pulse hover:animate-none active:scale-95 font-['Cairo',sans-serif]"
            >
              <span>تصفح جميع الاختبارات الدولية</span>
              <ChevronLeft className="w-4 h-4 text-[var(--mn-heading)] transition-transform group-hover:-translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
