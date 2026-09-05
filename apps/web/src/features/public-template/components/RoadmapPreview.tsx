import React from 'react';
import { BookmarkCheck, Compass, FileCheck2, Search, Sparkles } from 'lucide-react';

type RoadmapTarget = 'smart-search' | 'scholarships' | 'exams' | 'tools' | 'student';

const STEPS: Array<{
  number: number;
  title: string;
  description: string;
  target: RoadmapTarget;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { number: 1, title: 'حدّد هدفك الأكاديمي', description: 'اختر الدرجة والتخصص والدولة المناسبة.', target: 'smart-search', icon: Compass },
  { number: 2, title: 'اكتشف وقارن الفرص', description: 'قارن الجامعات والمنح والدول والتكاليف.', target: 'scholarships', icon: Search },
  { number: 3, title: 'تحقق من الأهلية والمتطلبات', description: 'راجع شروط القبول واللغة والوثائق والمواعيد النهائية.', target: 'exams', icon: FileCheck2 },
  { number: 4, title: 'جهّز طلبك', description: 'استخدم أدوات السيرة الذاتية وخطاب الدافع والتوصيات وقائمة المستندات.', target: 'tools', icon: Sparkles },
  { number: 5, title: 'احفظ وتابع تقدمك', description: 'أضف الفرص إلى المفضلة وتابع الطلب والتنبيهات من مساحة الطالب.', target: 'student', icon: BookmarkCheck },
];

export const RoadmapPreview: React.FC<{
  onOpen?: () => void;
  onNavigate?: (target: RoadmapTarget) => void;
}> = ({ onOpen, onNavigate }) => {
  const activate = (target: RoadmapTarget) => onNavigate ? onNavigate(target) : onOpen?.();

  return (
    <section className="w-full py-3 font-['Cairo',sans-serif]" aria-labelledby="academic-roadmap-title">
      <div className="mn-card p-3.5 sm:p-5">
        <div className="mb-3 flex items-start gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-[var(--mn-border-gold)] bg-[var(--mn-gold-surface)] text-[var(--mn-accent-text)]">
            <Compass className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <h2 id="academic-roadmap-title" className="text-[16px] font-bold leading-6 text-[var(--mn-heading)] sm:text-[18px]">كيف تبدأ رحلتك الأكاديمية؟</h2>
            <p className="mt-0.5 text-[11px] leading-5 text-[var(--mn-text-muted)] sm:text-xs">خمس خطوات عملية داخل منارتك، من تحديد الهدف حتى متابعة طلبك.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const lastOdd = index === STEPS.length - 1;
            return (
              <button
                type="button"
                key={step.number}
                onClick={() => activate(step.target)}
                className={`mn-card-subtle group min-h-[126px] p-3 text-right transition hover:-translate-y-0.5 hover:border-[var(--mn-accent)]/65 hover:shadow-sm ${lastOdd ? 'col-span-2 sm:col-span-1' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--mn-primary)] text-white mn-inverse"><Icon className="h-4 w-4" /></span>
                  <span className="text-[10px] font-semibold text-[var(--mn-accent-text)]">0{step.number}</span>
                </div>
                <h3 className="mt-2 text-[12px] font-semibold leading-5 text-[var(--mn-heading)] sm:text-[13px]">{step.title}</h3>
                <p className="mt-1 text-[10px] leading-4.5 text-[var(--mn-text-muted)] sm:text-[11px]">{step.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
