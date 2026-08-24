import { BookOpen, CheckCircle2, ClipboardCheck, FileText, Settings } from 'lucide-react';

export type BuilderSection = 'basics' | 'curriculum' | 'assessments' | 'completion' | 'settings';
const items = [
  ['basics', 'البيانات الأساسية', FileText],
  ['curriculum', 'المنهج والدروس', BookOpen],
  ['assessments', 'الاختبارات', ClipboardCheck],
  ['completion', 'الإكمال والشهادة', CheckCircle2],
  ['settings', 'الإعدادات والنشر', Settings],
] as const;
export function NativeCourseBuilderNav({
  active,
  onChange,
  issues,
}: {
  active: BuilderSection;
  onChange(section: BuilderSection): void;
  issues: Record<string, number>;
}) {
  return (
    <nav
      aria-label="أقسام منشئ الدورة"
      className="flex gap-2 overflow-x-auto rounded-2xl border bg-white p-2 lg:block lg:space-y-1"
    >
      {items.map(([key, label, Icon]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex min-w-max items-center gap-3 rounded-xl px-3 py-3 text-sm lg:w-full ${active === key ? 'bg-emerald-50 font-bold text-emerald-900' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Icon size={18} />
          <span>{label}</span>
          {issues[key] > 0 && (
            <span className="ms-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
              {issues[key]}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}
