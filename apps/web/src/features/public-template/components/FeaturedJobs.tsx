import React from 'react';
import { Briefcase, ArrowUpLeft, Building2, MapPin, Award } from 'lucide-react';

interface FeaturedJobsProps {
  onViewAllClick: () => void;
}

export const FeaturedJobs: React.FC<FeaturedJobsProps> = ({ onViewAllClick }) => {
  return (
    <section className="px-0.5 sm:px-1 py-3 w-full font-['Cairo',sans-serif]">
      {/* Career Portal Banner - Light/White Theme */}
      <div className="relative rounded-3xl p-4 sm:p-5 bg-gradient-to-b from-[var(--mn-surface)] to-slate-50/80 border border-slate-200/90 shadow-sm overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border-t-2 border-t-[var(--mn-accent)]/40 min-h-[200px]">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--mn-accent)]/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--mn-primary)]/5 rounded-full blur-[50px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-6 w-full">
          {/* Text Content (Right Side) */}
          <div className="w-full md:w-7/12 text-center md:text-start flex flex-col items-center md:items-start">
            <div className="mb-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 inline-flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-[var(--mn-heading)]" />
                <span>بوابة التوظيف والفرص</span>
              </h3>
            </div>

            <p className="text-[10px] sm:text-xs text-slate-600 font-medium mb-5 leading-relaxed max-w-md mx-auto md:mx-0">
              نربطك بأفضل الشركات والمؤسسات لتبدأ مسيرتك المهنية. تصفح آلاف الفرص الوظيفية، برامج
              التدريب المنتهي بالتوظيف، والعمل عن بعد بسهولة.
            </p>

            <div className="flex justify-center md:justify-start w-full">
              {/* Primary CTA: Browse All Jobs */}
              <button
                onClick={onViewAllClick}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-[var(--mn-surface)] hover:bg-[var(--mn-accent)]/10 text-[var(--mn-heading)] border border-[var(--mn-accent)]/50 rounded-full text-xs sm:text-sm font-bold transition-all shadow-[0_0_15px_rgba(200,162,74,0.3)] hover:shadow-[0_0_25px_rgba(200,162,74,0.5)] animate-pulse hover:animate-none active:scale-95 font-['Cairo',sans-serif]"
              >
                <span>تصفح جميع الوظائف</span>
                <ArrowUpLeft className="w-4 h-4 text-[var(--mn-heading)] transition-transform group-hover:-translate-y-1 group-hover:-translate-x-1" />
              </button>
            </div>
          </div>

          {/* Visual Concept (Left Side) - Normal Career Theme */}
          <div className="hidden md:flex w-5/12 justify-center items-center relative">
            <div className="relative w-56 h-40">
              {/* Main Briefcase Card */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[var(--mn-primary)] rounded-2xl shadow-[0_8px_30px_rgba(15,75,58,0.2)] flex items-center justify-center z-20">
                <Briefcase className="w-8 h-8 text-white" />
              </div>

              {/* Floating Elements (Job Types & Icons) */}
              <div className="absolute top-2 right-8 w-10 h-10 bg-[var(--mn-surface)] rounded-xl shadow-md border border-slate-100 flex items-center justify-center z-10 transition-transform hover:-translate-y-1">
                <Building2 className="w-5 h-5 text-[var(--mn-accent-text)]" />
              </div>

              <div className="absolute bottom-4 left-10 w-8 h-8 bg-[var(--mn-surface)] rounded-full shadow-md border border-slate-100 flex items-center justify-center z-10 transition-transform hover:-translate-y-1">
                <MapPin className="w-4 h-4 text-[var(--mn-heading)]" />
              </div>

              <div className="absolute top-6 left-4 px-2.5 py-1 bg-[var(--mn-surface)] rounded-lg shadow-sm border border-slate-100 text-[9px] font-bold text-slate-600 -rotate-6 z-30">
                تدريب صيفي
              </div>

              <div className="absolute bottom-6 right-2 px-2.5 py-1 bg-[var(--mn-surface)] rounded-lg shadow-sm border border-slate-100 text-[9px] font-bold text-slate-600 rotate-6 z-30">
                عمل عن بعد
              </div>

              {/* Decorative background circles */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-slate-100 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 border border-slate-50 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
