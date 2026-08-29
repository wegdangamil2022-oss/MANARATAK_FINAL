import React from 'react';
import { Sparkles, ChevronLeft, Bot, FileText, Award } from 'lucide-react';

interface AIToolItem {
  id: string;
  tab: 'letter' | 'cv' | 'chat' | 'search';
  title: string;
  subtitle: string;
  badge: string;
  imageUrl: string;
  icon: React.ReactNode;
}

interface AIToolsBannerProps {
  onOpenAiTools: (tab?: 'letter' | 'cv' | 'chat' | 'search') => void;
}

const AI_TOOLS: AIToolItem[] = [
  {
    id: 'tool-letter',
    tab: 'letter',
    title: 'صانع خطاب الدافع',
    subtitle: 'صياغة خطاب قبول مخصص',
    badge: 'خطاب الدافع',
    imageUrl:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80',
    icon: <FileText className="w-3.5 h-3.5" />,
  },
  {
    id: 'tool-cv',
    tab: 'cv',
    title: 'فاحص السيرة الذاتية',
    subtitle: 'تدقيق وتنسيق أكاديمي',
    badge: 'فاحص الـ CV',
    imageUrl:
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80',
    icon: <Award className="w-3.5 h-3.5" />,
  },
  {
    id: 'tool-chat',
    tab: 'chat',
    title: 'المستشار الذكي',
    subtitle: 'إجابة فورية وتوجيه شامل',
    badge: 'مستشار فوري',
    imageUrl:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=80',
    icon: <Bot className="w-3.5 h-3.5" />,
  },
];

export const AIToolsBanner: React.FC<AIToolsBannerProps> = ({ onOpenAiTools }) => {
  return (
    <section id="ai-tools-section" className="px-0.5 sm:px-1 py-3 w-full">
      {/* Standard Framed Container with top accent border only */}
      <div className="relative rounded-3xl p-3.5 sm:p-4 bg-gradient-to-b from-[var(--mn-surface)] to-slate-50/80 border border-slate-200/90 shadow-sm border-t-2 border-t-[var(--mn-accent)]/40 overflow-hidden">
        {/* Content Inside the Framed Section */}
        <div className="relative z-10">
          {/* Centered Section Title */}
          <div className="text-center mb-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 inline-flex items-center justify-center gap-1.5 font-['Cairo',sans-serif]">
              <Sparkles className="w-4 h-4 text-[var(--mn-accent-text)]" />
              <span>أدوات الذكاء الاصطناعي</span>
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-600 font-medium mt-1 max-w-xs mx-auto font-['Cairo',sans-serif]">
              مجموعة من الأدوات الذكية لتسهيل كتابة خطابات الدافع وتنسيق السير الذاتية باحترافية.
            </p>
          </div>

          {/* 3 AI Tool Cards in a 3-Column Grid: Edge-to-edge layout with Square Proportions */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
            {AI_TOOLS.map((tool) => (
              <div
                key={tool.id}
                onClick={() => onOpenAiTools(tool.tab)}
                className="group relative flex flex-col rounded-2xl overflow-hidden shadow-xs hover:shadow-md border border-slate-200 bg-slate-900 cursor-pointer transition-all active:scale-97 hover:border-[var(--mn-accent)]"
              >
                {/* Image Container with Square (1:1) Proportions */}
                <div className="relative aspect-square w-full overflow-hidden bg-[var(--mn-primary)]">
                  <img
                    src={tool.imageUrl}
                    alt={tool.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 filter brightness-90"
                    referrerPolicy="no-referrer"
                  />

                  {/* Dark Gradient Overlay for Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-transparent pointer-events-none" />

                  {/* Card Title and Subtitle */}
                  <div className="absolute inset-x-0 bottom-0 p-2 text-center text-white z-10">
                    <h4 className="font-bold text-[11px] sm:text-xs leading-tight text-white line-clamp-2 drop-shadow-xs mb-0.5 font-['Cairo',sans-serif]">
                      {tool.title}
                    </h4>
                    <p className="text-[9px] sm:text-[10px] font-medium text-slate-300 line-clamp-1 font-['Cairo',sans-serif]">
                      {tool.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="mt-3.5 flex justify-center">
            <button
              id="btn-view-all-ai-tools"
              onClick={() => onOpenAiTools('letter')}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-[var(--mn-surface)] hover:bg-[var(--mn-accent)]/10 text-[var(--mn-heading)] border border-[var(--mn-accent)]/50 rounded-full text-xs sm:text-sm font-bold transition-all shadow-[0_0_15px_rgba(200,162,74,0.3)] hover:shadow-[0_0_25px_rgba(200,162,74,0.5)] animate-pulse hover:animate-none active:scale-95 font-['Cairo',sans-serif]"
            >
              <span>تصفح الأدوات</span>
              <ChevronLeft className="w-4 h-4 text-[var(--mn-heading)] transition-transform group-hover:-translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
