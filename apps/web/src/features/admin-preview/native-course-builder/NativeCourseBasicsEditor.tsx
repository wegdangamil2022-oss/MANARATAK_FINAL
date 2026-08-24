import { FormEvent, useEffect, useState } from 'react';
import { NativeCourseDto, UpdateNativeCourseInput } from '../../../api/client';

const text = (value: unknown) => (typeof value === 'string' ? value : '');
const lines = (value: unknown) => (Array.isArray(value) ? value.join('\n') : '');

export function NativeCourseBasicsEditor({
  course,
  disabled,
  onSave,
}: {
  course: NativeCourseDto;
  disabled: boolean;
  onSave(input: UpdateNativeCourseInput): Promise<void>;
}) {
  const [form, setForm] = useState({
    displayName: '',
    titleEn: '',
    description: '',
    courseContent: '',
    category: '',
    difficultyLevel: '',
    learningLanguage: '',
    studyDuration: '',
    instructor: '',
    learningOutcomes: '',
    prerequisites: '',
    targetAudience: '',
    thumbnailAssetId: '',
    promotionalVideoAssetId: '',
  });
  useEffect(
    () =>
      setForm({
        displayName: course.displayName,
        titleEn: text(course.optionalFields?.titleEn),
        description: text(course.optionalFields?.description),
        courseContent: text(course.optionalFields?.courseContent),
        category: course.category ?? '',
        difficultyLevel: course.difficultyLevel ?? '',
        learningLanguage: course.learningLanguage ?? '',
        studyDuration: course.studyDuration ?? '',
        instructor: text(course.optionalFields?.instructor),
        learningOutcomes: lines(course.optionalFields?.learningOutcomes),
        prerequisites: lines(course.optionalFields?.prerequisites),
        targetAudience: lines(course.optionalFields?.targetAudience),
        thumbnailAssetId: course.thumbnailAssetId ?? '',
        promotionalVideoAssetId: text(course.optionalFields?.promotionalVideoAssetId),
      }),
    [course],
  );
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await onSave({
      ...form,
      learningOutcomes: form.learningOutcomes
        .split('\n')
        .map((v) => v.trim())
        .filter(Boolean),
      prerequisites: form.prerequisites
        .split('\n')
        .map((v) => v.trim())
        .filter(Boolean),
      targetAudience: form.targetAudience
        .split('\n')
        .map((v) => v.trim())
        .filter(Boolean),
      thumbnailAssetId: form.thumbnailAssetId || null,
    });
  };
  const field = (key: keyof typeof form, label: string, helper?: string) => (
    <label className="text-sm font-medium">
      {label}
      <input
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="mt-1 w-full rounded-xl border p-3 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
      />
      {helper && <small className="mt-1 block text-slate-500">{helper}</small>}
    </label>
  );
  return (
    <form onSubmit={submit} className="rounded-2xl border bg-white p-5">
      <div className="mb-5">
        <h2 className="text-lg font-bold">البيانات الأساسية</h2>
        <p className="text-sm text-slate-500">
          بيانات العرض والتعريف بالدورة. الرابط العام ثابت بعد الإنشاء.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {field('displayName', 'العنوان العربي *')}
        {field('titleEn', 'العنوان الإنجليزي')}
        {field('category', 'المجال الأكاديمي')}
        {field('difficultyLevel', 'المستوى')}
        {field('learningLanguage', 'لغة التدريس')}
        {field('studyDuration', 'المدة التقديرية')}
        {field('instructor', 'المدرب / المؤلف')}
        {field(
          'thumbnailAssetId',
          'معرّف أصل الغلاف EAP',
          'يجب أن يكون معرّف أصل من Phase 05، وليس رابط ملف.',
        )}
        {field('promotionalVideoAssetId', 'معرّف الفيديو الترويجي EAP')}
        <label className="text-sm font-medium md:col-span-2">
          الوصف المختصر
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="mt-1 w-full rounded-xl border p-3"
          />
        </label>
        <label className="text-sm font-medium md:col-span-2">
          الوصف الكامل / محتوى الدورة
          <textarea
            value={form.courseContent}
            onChange={(e) => setForm({ ...form, courseContent: e.target.value })}
            rows={7}
            className="mt-1 w-full rounded-xl border p-3"
          />
        </label>
        {[
          ['learningOutcomes', 'مخرجات التعلم'],
          ['prerequisites', 'المتطلبات السابقة'],
          ['targetAudience', 'الفئة المستهدفة'],
        ].map(([key, label]) => (
          <label key={key} className="text-sm font-medium">
            {label}
            <textarea
              value={form[key as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              rows={4}
              placeholder="عنصر في كل سطر"
              className="mt-1 w-full rounded-xl border p-3"
            />
          </label>
        ))}
        <label className="text-sm font-medium md:col-span-2">
          الرابط الداخلي
          <input
            readOnly
            dir="ltr"
            value={course.directCourseUrl}
            className="mt-1 w-full rounded-xl border bg-slate-50 p-3 text-slate-500"
          />
        </label>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          disabled={disabled}
          className="rounded-xl bg-[#044A37] px-5 py-3 font-bold text-white disabled:opacity-50"
        >
          حفظ البيانات
        </button>
      </div>
    </form>
  );
}
