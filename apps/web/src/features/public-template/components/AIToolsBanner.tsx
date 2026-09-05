import React from 'react';
import { ChevronLeft, Database, Sparkles } from 'lucide-react';

interface AIToolsBannerProps {
  onOpenAiTools: (toolKey?: string) => void;
}

const PREVIEW_TOOLS = [
  {
    id: 'university-comparison',
    title: 'مقارنة الجامعات',
    subtitle: 'قارن بيانات الجامعات قبل اتخاذ القرار',
    icon: <Database className="w-5 h-5" />,
  },
  {
    id: 'motivation-letter-generator',
    title: 'مولّد خطاب الدافع',
    subtitle: 'أنشئ مسودة منظمة قابلة للمراجعة',
    icon: <Sparkles className="w-5 h-5" />,
  },
];

export const AIToolsBanner: React.FC<AIToolsBannerProps> = ({ onOpenAiTools }) => {
  return (
    <section id="ai-tools-section" className="px-0 py-3 w-full">
      <div className="relative rounded-3xl p-3.5 sm:p-4 bg-gradient-to-b from-[var(--mn-surface)] to-[var(--mn-page)]/80 border border-[var(--mn-border)] shadow-sm border-t-2 border-t-[var(--mn-accent)]/40 overflow-hidden mn-panel ">
        <div className="relative z-10">
          <div className="text-center mb-3.5">
            <h3 className="text-sm sm:text-base font-bold text-[var(--mn-heading)] inline-flex items-center justify-center gap-1.5 font-['Cairo',sans-serif]">
              <Sparkles className="w-4 h-4 text-[var(--mn-accent-text)]" />
              <span>أدوات منارتك</span>
            </h3>
            <p className="text-[10px] sm:text-xs text-[var(--mn-text-muted)] font-medium mt-1 max-w-xs mx-auto font-['Cairo',sans-serif]">
              أدوات ذكية وحاسبات للمقارنة والتخطيط والتقديم واتخاذ القرار.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full">
            {PREVIEW_TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onOpenAiTools(tool.id)}
                className="group text-right rounded-2xl border border-[var(--mn-border)] hover:border-[var(--mn-accent)]/60 bg-[var(--mn-surface)] p-3 shadow-2xs hover:shadow-sm transition-all active:scale-[0.98] cursor-pointer min-w-0 mn-panel "
              >
                <div className="w-9 h-9 rounded-xl bg-[var(--mn-primary)] text-white flex items-center justify-center border border-[var(--mn-accent)]/20 shadow-xs mn-inverse ">
                  {tool.icon}
                </div>
                <h4 className="mt-2 text-[11px] sm:text-xs font-bold text-[var(--mn-heading)] leading-snug font-['Cairo',sans-serif]">
                  {tool.title}
                </h4>
                <p className="mt-1 text-[9px] sm:text-[10px] text-[var(--mn-text-muted)] leading-5 font-medium font-['Cairo',sans-serif] line-clamp-2">
                  {tool.subtitle}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-3.5 flex justify-center">
            <button
              id="btn-view-all-ai-tools"
              onClick={() => onOpenAiTools()}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 bg-[var(--mn-surface)] hover:bg-[var(--mn-accent)]/10 text-[var(--mn-heading)] border border-[var(--mn-accent)]/50 rounded-full text-xs sm:text-sm font-bold transition-all shadow-xs active:scale-95 font-['Cairo',sans-serif] mn-panel "
            >
              <span>تصفح الأدوات</span>
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
