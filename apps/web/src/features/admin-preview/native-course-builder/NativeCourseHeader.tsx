import { ArrowRight, Eye, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NativeCourseDto, NativeCourseReadinessDto } from '../../../api/client';

interface Props {
  course: NativeCourseDto;
  readiness: NativeCourseReadinessDto;
  saving: 'idle' | 'saving' | 'error';
  busy: boolean;
  onPreview(): void;
  onLifecycle(
    action: 'mark-ready' | 'mark-publishable' | 'publish' | 'unpublish' | 'archive',
  ): void;
}
const labels: Record<string, string> = {
  DRAFT: 'مسودة',
  READY_TO_REVIEW: 'جاهزة للمراجعة',
  READY_TO_PUBLISH: 'جاهزة للنشر',
  PUBLISHED: 'منشورة',
  REJECTED: 'مرفوضة',
  ARCHIVED: 'مؤرشفة',
};

export function NativeCourseHeader({
  course,
  readiness,
  saving,
  busy,
  onPreview,
  onLifecycle,
}: Props) {
  const primary =
    course.status === 'DRAFT'
      ? ['mark-ready', 'إرسال للمراجعة']
      : course.status === 'READY_TO_REVIEW'
        ? ['mark-publishable', 'اعتماد للنشر']
        : course.status === 'READY_TO_PUBLISH'
          ? ['publish', 'نشر الدورة']
          : null;
  return (
    <header className="rounded-3xl bg-[#044A37] px-5 py-6 text-white shadow-lg">
      <Link
        to="/admin/courses/native"
        className="inline-flex items-center gap-2 text-sm text-emerald-100 hover:text-white"
      >
        <ArrowRight size={17} /> العودة إلى الدورات
      </Link>
      <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs">دورة منارتك</span>
            <span className="rounded-full bg-[#E3B04B] px-3 py-1 text-xs font-bold text-[#173c31]">
              {labels[course.status] ?? course.status}
            </span>
          </div>
          <h1 className="mt-3 text-2xl font-bold">{course.displayName}</h1>
          {Boolean(course.optionalFields?.titleEn) && (
            <p dir="ltr" className="mt-1 text-sm text-emerald-100">
              {String(course.optionalFields?.titleEn)}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-emerald-100">
            <span>
              {saving === 'saving'
                ? 'جاري الحفظ...'
                : saving === 'error'
                  ? 'تعذر الحفظ'
                  : 'تم الحفظ'}
            </span>
            <span>جاهزية النشر {readiness.percentage}%</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onPreview}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5"
          >
            <Eye size={18} /> معاينة كطالب
          </button>
          {primary && (
            <button
              disabled={busy || !readiness.ready}
              onClick={() =>
                onLifecycle(primary[0] as 'mark-ready' | 'mark-publishable' | 'publish')
              }
              className="min-h-11 rounded-xl bg-[#E3B04B] px-5 py-2.5 font-bold text-[#173c31] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {primary[1]}
            </button>
          )}
          <details className="relative">
            <summary
              aria-label="إجراءات إضافية"
              className="grid min-h-11 cursor-pointer list-none place-items-center rounded-xl border border-white/30 px-3"
            >
              <MoreVertical size={19} />
            </summary>
            <div className="absolute end-0 z-20 mt-2 w-40 rounded-xl bg-white p-2 text-sm text-slate-800 shadow-xl">
              {course.status === 'PUBLISHED' && (
                <button
                  onClick={() => onLifecycle('unpublish')}
                  className="w-full rounded-lg px-3 py-2 text-start hover:bg-slate-100"
                >
                  إلغاء النشر
                </button>
              )}
              <button
                onClick={() => onLifecycle('archive')}
                className="w-full rounded-lg px-3 py-2 text-start text-red-700 hover:bg-red-50"
              >
                أرشفة
              </button>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
