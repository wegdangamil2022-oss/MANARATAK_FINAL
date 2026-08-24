import { FormEvent, useEffect, useState } from 'react';
import { NativeCourseDto, UpdateNativeCourseInput } from '../../../api/client';

export function NativeCourseCompletionEditor({
  course,
  disabled,
  onSave,
}: {
  course: NativeCourseDto;
  disabled: boolean;
  onSave(input: UpdateNativeCourseInput): Promise<void>;
}) {
  const current = course.optionalFields?.completionCriteria as Record<string, unknown> | undefined;
  const currentMinimumProgress = Number(current?.minimumProgress ?? 100);
  const currentAssessmentRequired = Boolean(current?.assessmentRequired);
  const [progress, setProgress] = useState(100);
  const [assessmentRequired, setAssessmentRequired] = useState(false);
  const [eligible, setEligible] = useState(Boolean(course.certificateAvailable));
  useEffect(() => {
    setProgress(currentMinimumProgress);
    setAssessmentRequired(currentAssessmentRequired);
    setEligible(Boolean(course.certificateAvailable));
  }, [course.id, course.updatedAt, course.certificateAvailable, currentMinimumProgress, currentAssessmentRequired]);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    void onSave({
      certificateAvailable: eligible,
      completionCriteria: { minimumProgress: progress, assessmentRequired },
    });
  };
  return (
    <form onSubmit={submit} className="rounded-2xl border bg-white p-5">
      <h2 className="text-lg font-bold">الإكمال والشهادة</h2>
      <p className="mt-1 text-sm text-slate-500">
        حدد شروط الأهلية التي تصدر عنها Phase 13 إشارة الإكمال.
      </p>
      <div className="mt-5 max-w-xl space-y-4">
        <label className="block text-sm font-medium">
          الحد الأدنى للتقدم
          <input
            type="number"
            min="1"
            max="100"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border p-3"
          />
        </label>
        <label className="flex items-center gap-3 rounded-xl border p-4">
          <input
            type="checkbox"
            checked={assessmentRequired}
            onChange={(e) => setAssessmentRequired(e.target.checked)}
          />
          <span>يشترط اجتياز الاختبار</span>
        </label>
        <label className="flex items-center gap-3 rounded-xl border p-4">
          <input
            type="checkbox"
            checked={eligible}
            onChange={(e) => setEligible(e.target.checked)}
          />
          <span>الإكمال مؤهل لمسار شهادة Phase 14</span>
        </label>
      </div>
      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        يتم إصدار الشهادة والتحقق منها في منصة الشهادات — Phase 14. هذه الصفحة تحدد شروط الأهلية
        فقط.
      </div>
      <button
        disabled={disabled}
        className="mt-5 rounded-xl bg-[#044A37] px-5 py-3 font-bold text-white disabled:opacity-50"
      >
        حفظ شروط الإكمال
      </button>
    </form>
  );
}
