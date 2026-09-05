import React from 'react';
import { HelpCircle, ArrowUpLeft, MessageCircleQuestion } from 'lucide-react';

export const FaqPreview: React.FC<{onOpen: () => void}> = ({onOpen}) => {
  return (
    <section className="px-0 py-3 w-full font-['Cairo',sans-serif]">
      {/* Container */}
      <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[var(--mn-page)] to-[var(--mn-surface)] border border-[var(--mn-border)] shadow-sm overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border-t-2 border-t-[var(--mn-accent)]/20 mn-panel ">
        {/* Decorative Background Glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--mn-accent)]/10 rounded-full blur-[40px] pointer-events-none z-0"></div>
        <div className="absolute bottom-0 left-10 w-32 h-32 bg-[var(--mn-primary)]/5 rounded-full blur-[30px] pointer-events-none z-0"></div>

        {/* Centered Content & CTA */}
        <div className="relative z-10 w-full flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--mn-primary)]/5 flex items-center justify-center mb-4 border border-[var(--mn-border-brand)]/10 shadow-sm">
            <MessageCircleQuestion className="w-6 h-6 text-[var(--mn-heading)]" />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-[var(--mn-heading)] mb-2">لديك استفسارات؟</h3>

          <p className="text-[11px] sm:text-xs text-[var(--mn-text-muted)] mb-6 leading-relaxed max-w-md">
            نحن هنا لمساعدتك! جمعنا إجابات لأكثر الأسئلة شيوعاً حول كيفية التقديم، شروط المنح،
            وتفاصيل السفر لتكون رحلتك واضحة تماماً.
          </p>

          <button onClick={onOpen} className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-[var(--mn-surface)] hover:bg-[var(--mn-accent)]/10 text-[var(--mn-heading)] border border-[var(--mn-accent)]/50 rounded-full text-xs sm:text-sm font-bold transition-all shadow-[0_0_15px_rgba(214,164,59,0.3)] hover:shadow-[0_0_25px_rgba(214,164,59,0.5)] animate-pulse hover:animate-none active:scale-95 font-['Cairo',sans-serif] mn-panel ">
            <span>تصفح الأسئلة الشائعة</span>
            <ArrowUpLeft className="w-4 h-4 text-[var(--mn-heading)] transition-transform group-hover:-translate-y-1 group-hover:-translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
};
