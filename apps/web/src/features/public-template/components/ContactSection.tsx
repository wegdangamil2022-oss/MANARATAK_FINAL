import React from 'react';
import { ArrowUpLeft, Globe2 } from 'lucide-react';

export const ContactSection: React.FC = () => {
  return (
    <section className="px-0.5 sm:px-1 py-3 w-full font-['Cairo',sans-serif]">
      {/* Simple Preview Container */}
      <div className="relative rounded-3xl p-5 sm:p-6 bg-[var(--mn-surface)] border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden border-t-2 border-t-[var(--mn-primary)]/30">
        {/* Subtle Background Elements */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-slate-50 rounded-full blur-[40px] pointer-events-none"></div>

        {/* Right Side: Icon & Text */}
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-4 w-full md:w-auto text-center md:text-start">
          <div className="w-12 h-12 rounded-2xl bg-[var(--mn-primary)]/5 flex items-center justify-center shrink-0 border border-[var(--mn-border-brand)]/10 shadow-sm">
            <Globe2 className="w-6 h-6 text-[var(--mn-heading)]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5">
              نحن دائماً بالقرب منك
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 max-w-sm leading-relaxed">
              شبكة واسعة من الفروع والوكلاء المعتمدين حول العالم لخدمتك، وتقديم الدعم الفني
              والاستشارات الأكاديمية أينما كنت.
            </p>
          </div>
        </div>

        {/* Left Side: Call to Action Button */}
        <div className="relative z-10 shrink-0 w-full md:w-auto flex justify-center">
          <button className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-[var(--mn-surface)] hover:bg-[var(--mn-accent)]/10 text-[var(--mn-heading)] border border-[var(--mn-accent)]/50 rounded-full text-xs sm:text-sm font-bold transition-all shadow-[0_0_15px_rgba(200,162,74,0.3)] hover:shadow-[0_0_25px_rgba(200,162,74,0.5)] animate-pulse hover:animate-none active:scale-95 font-['Cairo',sans-serif]">
            <span>عرض تفاصيل الاتصال والوكلاء</span>
            <ArrowUpLeft className="w-4 h-4 text-[var(--mn-heading)] transition-transform group-hover:-translate-y-1 group-hover:-translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
};
