import { AlertCircle, CheckCircle2, Circle } from 'lucide-react';
import { NativeCourseReadinessDto } from '../../../api/client';
import { BuilderSection } from './NativeCourseBuilderNav';

export function NativeCourseReadinessPanel({
  readiness,
  onNavigate,
}: {
  readiness: NativeCourseReadinessDto;
  onNavigate(section: BuilderSection): void;
}) {
  return (
    <aside className="rounded-2xl border bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">جاهزية النشر</h2>
        <strong className="text-emerald-800">{readiness.percentage}%</strong>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full bg-[#235D4E]" style={{ width: `${readiness.percentage}%` }} />
      </div>
      <ul className="mt-4 space-y-2">
        {readiness.checks.map((check) => (
          <li key={check.key}>
            <button
              onClick={() =>
                check.targetSection && onNavigate(check.targetSection as BuilderSection)
              }
              className="flex w-full items-start gap-2 rounded-lg p-2 text-start hover:bg-slate-50"
            >
              {check.state === 'COMPLETE' ? (
                <CheckCircle2 className="mt-0.5 text-emerald-600" size={17} />
              ) : check.state === 'OPTIONAL' ? (
                <Circle className="mt-0.5 text-slate-400" size={17} />
              ) : (
                <AlertCircle className="mt-0.5 text-amber-600" size={17} />
              )}
              <span>
                <span className="block text-sm font-medium">{check.label}</span>
                {check.message && <span className="text-xs text-slate-500">{check.message}</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
