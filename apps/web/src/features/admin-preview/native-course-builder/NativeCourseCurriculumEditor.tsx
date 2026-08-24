import { FormEvent, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, FilePlus2, Plus, Trash2 } from 'lucide-react';
import { ApiClient, CourseCurriculumSnapshotDto, CourseLessonDto } from '../../../api/client';

interface Props {
  courseId: string;
  snapshot: CourseCurriculumSnapshotDto;
  locked: boolean;
  onRefresh(): Promise<void>;
  onError(message: string): void;
}
export function NativeCourseCurriculumEditor({
  courseId,
  snapshot,
  locked,
  onRefresh,
  onError,
}: Props) {
  const [moduleTitle, setModuleTitle] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [targetModule, setTargetModule] = useState('');
  const [selectedId, setSelectedId] = useState(snapshot.lessons[0]?.id ?? '');
  const [busy, setBusy] = useState(false);
  const selected = snapshot.lessons.find((item) => item.id === selectedId);
  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await action();
      await onRefresh();
    } catch (cause) {
      onError(cause instanceof Error ? cause.message : 'تعذر حفظ المنهج');
    } finally {
      setBusy(false);
    }
  };
  const addModule = (event: FormEvent) => {
    event.preventDefault();
    if (!moduleTitle.trim()) return;
    void run(async () => {
      await ApiClient.createCourseModule(courseId, {
        title: moduleTitle.trim(),
        position: snapshot.modules.length + 1,
      });
      setModuleTitle('');
    });
  };
  const addLesson = (event: FormEvent) => {
    event.preventDefault();
    if (!lessonTitle.trim() || !targetModule) return;
    const position = snapshot.lessons.filter((item) => item.moduleId === targetModule).length + 1;
    void run(async () => {
      const lesson = await ApiClient.createCourseLesson(courseId, targetModule, {
        title: lessonTitle.trim(),
        lessonType: 'MIXED',
        position,
      });
      setSelectedId(lesson.id);
      setLessonTitle('');
    });
  };
  const moveModule = (index: number, delta: number) => {
    const next = [...snapshot.modules];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    void run(() =>
      ApiClient.reorderCourseModules(
        courseId,
        next.map((item, i) => ({ id: item.id, position: i + 1 })),
      ),
    );
  };
  const moveLesson = (moduleId: string, index: number, delta: number) => {
    const next = [...(lessonsByModule.get(moduleId) ?? [])];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    void run(() =>
      ApiClient.reorderCourseLessons(
        courseId,
        moduleId,
        next.map((item, itemIndex) => ({ id: item.id, position: itemIndex + 1 })),
      ),
    );
  };
  const lessonsByModule = useMemo(
    () =>
      new Map(
        snapshot.modules.map((module) => [
          module.id,
          snapshot.lessons.filter((lesson) => lesson.moduleId === module.id),
        ]),
      ),
    [snapshot],
  );
  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.4fr)]">
      <div className="rounded-2xl border bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">مخطط المنهج</h2>
          <span className="text-xs text-slate-500">
            {snapshot.modules.length} وحدات · {snapshot.lessons.length} دروس
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {snapshot.modules.map((module, index) => (
            <div key={module.id} className="rounded-xl border">
              <div className="flex items-center gap-2 bg-slate-50 p-3">
                <strong className="flex-1 text-sm">{module.title}</strong>
                <button
                  disabled={locked || index === 0}
                  onClick={() => moveModule(index, -1)}
                  aria-label="تحريك الوحدة لأعلى"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  disabled={locked || index === snapshot.modules.length - 1}
                  onClick={() => moveModule(index, 1)}
                  aria-label="تحريك الوحدة لأسفل"
                >
                  <ChevronDown size={16} />
                </button>
                <button
                  disabled={locked}
                  onClick={() =>
                    confirm('حذف الوحدة ودروسها؟') &&
                    void run(() => ApiClient.deleteCourseModule(courseId, module.id))
                  }
                  aria-label="حذف الوحدة"
                  className="text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="space-y-1 p-2">
                {(lessonsByModule.get(module.id) ?? []).map((lesson, lessonIndex, lessons) => (
                  <div
                    key={lesson.id}
                    className={`flex items-center rounded-lg ${selectedId === lesson.id ? 'bg-emerald-50 text-emerald-900' : 'hover:bg-slate-50'}`}
                  >
                    <button
                      onClick={() => setSelectedId(lesson.id)}
                      className="min-w-0 flex-1 px-3 py-2 text-start text-sm"
                    >
                      <span className="block truncate">
                        {lesson.position}. {lesson.title}
                      </span>
                      <span className="text-xs text-slate-400">{lesson.lessonType}</span>
                    </button>
                    <button
                      disabled={locked || lessonIndex === 0}
                      onClick={() => moveLesson(module.id, lessonIndex, -1)}
                      aria-label="تحريك الدرس لأعلى"
                      className="p-1"
                    >
                      <ChevronUp size={15} />
                    </button>
                    <button
                      disabled={locked || lessonIndex === lessons.length - 1}
                      onClick={() => moveLesson(module.id, lessonIndex, 1)}
                      aria-label="تحريك الدرس لأسفل"
                      className="p-1"
                    >
                      <ChevronDown size={15} />
                    </button>
                  </div>
                ))}
                <button
                  disabled={locked}
                  onClick={() => setTargetModule(module.id)}
                  className="w-full rounded-lg px-3 py-2 text-start text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  <Plus className="inline" size={15} /> إضافة درس
                </button>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={addModule} className="mt-4 flex gap-2">
          <input
            disabled={locked}
            value={moduleTitle}
            onChange={(e) => setModuleTitle(e.target.value)}
            placeholder="عنوان وحدة جديدة"
            className="min-w-0 flex-1 rounded-xl border p-2.5 text-sm"
          />
          <button disabled={locked || busy} className="rounded-xl bg-[#044A37] px-3 text-white">
            <Plus />
          </button>
        </form>
        {targetModule && (
          <form onSubmit={addLesson} className="mt-3 rounded-xl bg-emerald-50 p-3">
            <label className="text-sm font-medium">
              درس جديد
              <input
                autoFocus
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border p-2.5"
              />
            </label>
            <div className="mt-2 flex gap-2">
              <button className="rounded-lg bg-emerald-800 px-3 py-2 text-sm text-white">
                إضافة
              </button>
              <button
                type="button"
                onClick={() => setTargetModule('')}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>
      <div>
        {selected ? (
          <LessonEditor
            key={selected.id}
            courseId={courseId}
            lesson={selected}
            snapshot={snapshot}
            locked={locked}
            run={run}
          />
        ) : (
          <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed bg-white p-8 text-center text-slate-500">
            اختر درسًا من المخطط أو أضف درسًا جديدًا.
          </div>
        )}
      </div>
    </section>
  );
}

function LessonEditor({
  courseId,
  lesson,
  snapshot,
  locked,
  run,
}: {
  courseId: string;
  lesson: CourseLessonDto;
  snapshot: CourseCurriculumSnapshotDto;
  locked: boolean;
  run(action: () => Promise<unknown>): Promise<void>;
}) {
  const [draft, setDraft] = useState(lesson);
  const [asset, setAsset] = useState({ assetId: '', title: '', assetType: 'VIDEO' });
  const assets = snapshot.assets.filter((item) => item.lessonId === lesson.id);
  const insertText = (template: string) =>
    setDraft({
      ...draft,
      contentText: `${draft.contentText ?? ''}${draft.contentText ? '\n' : ''}${template}`,
    });
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">محرر الدرس</h2>
          <p className="text-sm text-slate-500">
            اكتب الشرح وأرفق فيديو أو ملفات EAP في المكان نفسه.
          </p>
        </div>
        <button
          disabled={locked}
          onClick={() =>
            confirm('حذف هذا الدرس؟') &&
            void run(() => ApiClient.deleteCourseLesson(courseId, lesson.id))
          }
          className="rounded-lg border border-red-200 p-2 text-red-700"
        >
          <Trash2 size={18} />
        </button>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium">
          عنوان الدرس
          <input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            className="mt-1 w-full rounded-xl border p-3"
          />
        </label>
        <label className="text-sm font-medium">
          نوع الدرس
          <select
            value={draft.lessonType}
            onChange={(e) => setDraft({ ...draft, lessonType: e.target.value })}
            className="mt-1 w-full rounded-xl border p-3"
          >
            <option value="VIDEO">فيديو</option>
            <option value="ARTICLE">شرح مكتوب</option>
            <option value="FILE">ملف</option>
            <option value="QUIZ">اختبار</option>
            <option value="MIXED">محتوى متنوع</option>
          </select>
        </label>
        <label className="text-sm font-medium">
          المدة بالدقائق
          <input
            type="number"
            min="1"
            value={draft.estimatedDurationMinutes ?? ''}
            onChange={(e) =>
              setDraft({
                ...draft,
                estimatedDurationMinutes: e.target.value ? Number(e.target.value) : null,
              })
            }
            className="mt-1 w-full rounded-xl border p-3"
          />
        </label>
        <label className="text-sm font-medium">
          ملخص الدرس
          <input
            value={draft.summary ?? ''}
            onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
            className="mt-1 w-full rounded-xl border p-3"
          />
        </label>
        <label className="text-sm font-medium md:col-span-2">
          الشرح المكتوب
          <span className="mt-2 flex flex-wrap gap-1" role="toolbar" aria-label="تنسيق شرح الدرس">
            {[
              ['عنوان', '## عنوان'],
              ['عريض', '**نص عريض**'],
              ['مائل', '*نص مائل*'],
              ['قائمة', '- عنصر'],
              ['مرقمة', '1. عنصر'],
              ['اقتباس', '> اقتباس'],
              ['رابط', '[عنوان الرابط](https://)'],
            ].map(([label, value]) => (
              <button
                key={label}
                type="button"
                onClick={() => insertText(value)}
                className="rounded-lg border px-2.5 py-1.5 text-xs font-normal hover:bg-slate-50"
              >
                {label}
              </button>
            ))}
          </span>
          <textarea
            value={draft.contentText ?? ''}
            onChange={(e) => setDraft({ ...draft, contentText: e.target.value })}
            rows={10}
            className="mt-1 w-full rounded-xl border p-3"
          />
          <span className="mt-1 block text-xs text-slate-500">
            يدعم تنسيق Markdown الآمن دون إضافة محرر خارجي ثقيل.
          </span>
        </label>
      </div>
      <button
        disabled={locked}
        onClick={() =>
          void run(() =>
            ApiClient.updateCourseLesson(courseId, lesson.id, {
              title: draft.title,
              lessonType: draft.lessonType,
              summary: draft.summary,
              estimatedDurationMinutes: draft.estimatedDurationMinutes,
              contentText: draft.contentText,
            }),
          )
        }
        className="mt-4 rounded-xl bg-[#044A37] px-5 py-2.5 font-bold text-white disabled:opacity-50"
      >
        حفظ الدرس
      </button>
      <div className="mt-7 border-t pt-5">
        <h3 className="font-bold">الفيديو والملفات</h3>
        <p className="mt-1 text-sm text-slate-500">
          رفع الملفات غير مهيأ في بيئة التشغيل الحالية. اختر أصلًا موجودًا ومتحققًا في منصة الأصول
          Phase 05.
        </p>
        <div className="mt-3 space-y-2">
          {assets.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <FilePlus2 className="text-emerald-700" />
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-sm">{item.title || item.assetId}</strong>
                <span dir="ltr" className="block truncate text-xs text-slate-500">
                  {item.assetType} · {item.assetId}
                </span>
              </div>
              <button
                disabled={locked}
                onClick={() =>
                  void run(() => ApiClient.detachCourseLessonAsset(courseId, lesson.id, item.id))
                }
                className="text-red-600"
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_140px_auto]">
          <input
            disabled={locked}
            dir="ltr"
            value={asset.assetId}
            onChange={(e) => setAsset({ ...asset, assetId: e.target.value })}
            placeholder="EAP asset handle"
            className="rounded-xl border p-3"
          />
          <input
            disabled={locked}
            value={asset.title}
            onChange={(e) => setAsset({ ...asset, title: e.target.value })}
            placeholder="عنوان الملف أو الفيديو"
            className="rounded-xl border p-3"
          />
          <select
            disabled={locked}
            value={asset.assetType}
            onChange={(e) => setAsset({ ...asset, assetType: e.target.value })}
            className="rounded-xl border p-3"
          >
            <option>VIDEO</option>
            <option>AUDIO</option>
            <option>IMAGE</option>
            <option>PDF</option>
            <option>DOCUMENT</option>
            <option>SUBTITLE</option>
            <option>OTHER</option>
          </select>
          <button
            disabled={locked || !asset.assetId.trim()}
            onClick={() =>
              void run(async () => {
                await ApiClient.attachCourseLessonAsset(courseId, lesson.id, {
                  ...asset,
                  position: assets.length + 1,
                });
                setAsset({ assetId: '', title: '', assetType: 'VIDEO' });
              })
            }
            className="rounded-xl bg-emerald-700 px-4 text-white"
          >
            إرفاق
          </button>
        </div>
        <button
          disabled
          title="خدمة رفع الملفات غير مهيأة في بيئة التشغيل الحالية"
          className="mt-3 rounded-xl border px-4 py-2.5 text-sm text-slate-400"
        >
          رفع ملفات متعددة — غير مهيأ
        </button>
      </div>
    </div>
  );
}
