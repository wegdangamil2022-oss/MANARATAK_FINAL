import React from 'react';
import { Compass, ArrowUpLeft, Search, FileEdit, GraduationCap, PlaneTakeoff } from 'lucide-react';

export const RoadmapPreview: React.FC = () => {
  return (
    <section className="px-0.5 sm:px-1 py-3 w-full font-['Cairo',sans-serif]">
      {/* Premium Minimalist Container */}
      <div className="relative rounded-3xl p-4 sm:p-5 bg-[var(--mn-surface)] border border-slate-200/90 shadow-sm overflow-hidden flex flex-col gap-7 sm:gap-8 border-t-2 border-t-[var(--mn-primary)]/40">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

        {/* Top Header: Title */}
        <div className="relative z-10 flex justify-between items-end w-full px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[var(--mn-primary)]/10 to-[var(--mn-secondary)]/5 flex items-center justify-center shrink-0 border border-[var(--mn-border-brand)]/10">
              <Compass className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[var(--mn-heading)]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                كيف تبدأ رحلتك الأكاديمية؟
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 max-w-xs line-clamp-1 sm:line-clamp-none">
                خطوات واضحة تأخذ بيدك من مرحلة البحث وحتى مقعدك الجامعي
              </p>
            </div>
          </div>
        </div>

        {/* Middle: Micro-Steps Preview (Visual) */}
        <div className="relative z-10 w-full flex items-center justify-center px-1 sm:px-8 py-2">
          <div className="flex items-center justify-between w-full relative">
            {/* Connecting Dashed Line */}
            <div
              className="absolute top-1/2 right-0 left-0 h-[2px] border-t-2 border-dashed border-slate-200 -translate-y-1/2 z-0"
              style={{ right: '5%', left: '5%' }}
            ></div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center gap-2.5 group cursor-default">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full p-[2px] bg-gradient-to-br from-slate-200 to-slate-100 group-hover:from-[var(--mn-primary)] group-hover:to-[var(--mn-accent-soft)] transition-all duration-300 group-hover:-translate-y-1 shadow-sm group-hover:shadow-md relative">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-[var(--mn-surface)]">
                  <img
                    src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=150"
                    alt="ابحث"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-600 group-hover:text-[var(--mn-heading)] transition-colors bg-[var(--mn-surface)] px-2 rounded-full relative z-10">
                ابحث
              </span>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center gap-2.5 group cursor-default">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full p-[2px] bg-gradient-to-br from-slate-200 to-slate-100 group-hover:from-[var(--mn-primary)] group-hover:to-[var(--mn-accent-soft)] transition-all duration-300 group-hover:-translate-y-1 shadow-sm group-hover:shadow-md relative">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-[var(--mn-surface)]">
                  <img
                    src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=150"
                    alt="جهّز"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-600 group-hover:text-[var(--mn-heading)] transition-colors bg-[var(--mn-surface)] px-2 rounded-full relative z-10">
                جهّز
              </span>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center gap-2.5 group cursor-default">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full p-[2px] bg-gradient-to-br from-slate-200 to-slate-100 group-hover:from-[var(--mn-primary)] group-hover:to-[var(--mn-accent-soft)] transition-all duration-300 group-hover:-translate-y-1 shadow-sm group-hover:shadow-md relative">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-[var(--mn-surface)]">
                  <img
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=150"
                    alt="قدّم"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-600 group-hover:text-[var(--mn-heading)] transition-colors bg-[var(--mn-surface)] px-2 rounded-full relative z-10">
                قدّم
              </span>
            </div>

            {/* Step 4 */}
            <div className="relative z-10 flex flex-col items-center gap-2.5 group cursor-default">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full p-[2px] bg-gradient-to-br from-[var(--mn-accent)] to-[#b08e40] transition-all duration-300 group-hover:-translate-y-1 shadow-md group-hover:shadow-lg relative">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-[var(--mn-surface)]">
                  <img
                    src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=150"
                    alt="سافر"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-[var(--mn-accent-text)] group-hover:text-[#b08e40] transition-colors bg-[var(--mn-surface)] px-2 rounded-full relative z-10">
                سافر
              </span>
            </div>
          </div>
        </div>

        {/* Bottom: Main CTA - Styled like other sections */}
        <div className="relative z-10 w-full flex justify-center px-1">
          <button className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-[var(--mn-surface)] hover:bg-[var(--mn-accent)]/10 text-[var(--mn-heading)] border border-[var(--mn-accent)]/50 rounded-full text-xs sm:text-sm font-bold transition-all shadow-[0_0_15px_rgba(200,162,74,0.3)] hover:shadow-[0_0_25px_rgba(200,162,74,0.5)] animate-pulse hover:animate-none active:scale-95 font-['Cairo',sans-serif] mx-auto">
            <span>تصفح تفاصيل رحلتك</span>
            <ArrowUpLeft className="w-4 h-4 text-[var(--mn-heading)] transition-transform group-hover:-translate-y-1 group-hover:-translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
};
