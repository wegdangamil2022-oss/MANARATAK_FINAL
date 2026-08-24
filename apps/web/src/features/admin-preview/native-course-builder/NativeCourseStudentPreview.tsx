import { X } from 'lucide-react';
import { CourseCurriculumSnapshotDto, NativeCourseDto } from '../../../api/client';
export function NativeCourseStudentPreview({
  course,
  snapshot,
  onClose,
}: {
  course: NativeCourseDto;
  snapshot: CourseCurriculumSnapshotDto;
  onClose(): void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 p-4"
    >
      <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="bg-[#044A37] p-6 text-white">
          <div className="flex justify-between">
            <span className="rounded-full bg-[#E3B04B] px-3 py-1 text-xs font-bold text-[#173c31]">
              معاينة — غير منشورة للطلاب
            </span>
            <button onClick={onClose} aria-label="إغلاق المعاينة">
              <X />
            </button>
          </div>
          <h2 id="preview-title" className="mt-5 text-3xl font-bold">
            {course.displayName}
          </h2>
          <p className="mt-3 max-w-2xl text-emerald-50">
            {String(
              course.optionalFields?.description ?? course.optionalFields?.courseContent ?? '',
            )}
          </p>
        </header>
        <div className="p-6">
          <h3 className="text-xl font-bold">محتوى الدورة</h3>
          <div className="mt-4 space-y-4">
            {snapshot.modules.map((module) => (
              <section key={module.id} className="rounded-2xl border p-4">
                <h4 className="font-bold">
                  {module.position}. {module.title}
                </h4>
                <div className="mt-3 divide-y">
                  {snapshot.lessons
                    .filter((lesson) => lesson.moduleId === module.id)
                    .map((lesson) => (
                      <article key={lesson.id} className="py-3">
                        <div className="flex justify-between">
                          <strong className="text-sm">{lesson.title}</strong>
                          <span className="text-xs text-slate-500">{lesson.lessonType}</span>
                        </div>
                        {lesson.contentText && (
                          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                            {lesson.contentText}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {snapshot.assets
                            .filter((asset) => asset.lessonId === lesson.id)
                            .map((asset) => (
                              <span
                                key={asset.id}
                                className="rounded-lg bg-slate-100 px-2 py-1 text-xs"
                              >
                                {asset.assetType}: {asset.title || asset.assetId}
                              </span>
                            ))}
                        </div>
                      </article>
                    ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
