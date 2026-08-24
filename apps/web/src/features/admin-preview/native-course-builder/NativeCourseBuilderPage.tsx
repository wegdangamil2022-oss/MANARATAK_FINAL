import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import {
  ApiClient,
  CourseCurriculumSnapshotDto,
  NativeCourseDto,
  NativeCourseReadinessDto,
  UpdateNativeCourseInput,
} from '../../../api/client';
import { useTranslation } from '../../../i18n/I18nProvider';
import { NativeCourseAssessmentEditor } from './NativeCourseAssessmentEditor';
import { NativeCourseBasicsEditor } from './NativeCourseBasicsEditor';
import { BuilderSection, NativeCourseBuilderNav } from './NativeCourseBuilderNav';
import { NativeCourseCompletionEditor } from './NativeCourseCompletionEditor';
import { NativeCourseCurriculumEditor } from './NativeCourseCurriculumEditor';
import { NativeCourseHeader } from './NativeCourseHeader';
import { NativeCourseReadinessPanel } from './NativeCourseReadinessPanel';
import { NativeCourseStudentPreview } from './NativeCourseStudentPreview';

const emptyCurriculum: CourseCurriculumSnapshotDto = {
  modules: [],
  lessons: [],
  assets: [],
  quizzes: [],
  questionBanks: [],
  questions: [],
};
const emptyReadiness: NativeCourseReadinessDto = { ready: false, percentage: 0, checks: [] };

export function NativeCourseBuilderPage() {
  const { id = '' } = useParams();
  const { isRTL } = useTranslation();
  const [course, setCourse] = useState<NativeCourseDto | null>(null);
  const [curriculum, setCurriculum] = useState(emptyCurriculum);
  const [readiness, setReadiness] = useState(emptyReadiness);
  const [section, setSection] = useState<BuilderSection>('basics');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState<'idle' | 'saving' | 'error'>('idle');
  const [preview, setPreview] = useState(false);
  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const [nextCourse, nextCurriculum, nextReadiness] = await Promise.all([
        ApiClient.getAdminNativeCourseById(id),
        ApiClient.getAdminNativeCourseCurriculum(id),
        ApiClient.getNativeCourseReadiness(id),
      ]);
      setCourse(nextCourse);
      setCurriculum(nextCurriculum);
      setReadiness(nextReadiness);
    } catch (cause) {
      setCourse(null);
      setError(cause instanceof Error ? cause.message : 'تعذر تحميل الدورة');
    } finally {
      setLoading(false);
    }
  }, [id]);
  const refreshBuilder = async () => {
    if (!id) return;
    const [nextCurriculum, nextReadiness] = await Promise.all([
      ApiClient.getAdminNativeCourseCurriculum(id),
      ApiClient.getNativeCourseReadiness(id),
    ]);
    setCurriculum(nextCurriculum);
    setReadiness(nextReadiness);
  };
  useEffect(() => {
    void load();
  }, [load]);
  const save = async (input: UpdateNativeCourseInput) => {
    if (!course) return;
    setSaving('saving');
    setError('');
    try {
      setCourse(await ApiClient.updateAdminNativeCourse(course.id, input));
      setReadiness(await ApiClient.getNativeCourseReadiness(course.id));
      setSaving('idle');
    } catch (cause) {
      setSaving('error');
      setError(cause instanceof Error ? cause.message : 'تعذر الحفظ');
      throw cause;
    }
  };
  const lifecycle = async (
    action: 'mark-ready' | 'mark-publishable' | 'publish' | 'unpublish' | 'archive',
  ) => {
    if (!course) return;
    if (action === 'archive' && !confirm('هل تريد أرشفة الدورة؟')) return;
    setBusy(true);
    setError('');
    try {
      await ApiClient.executeAdminNativeCourseAction(course.id, action);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر تنفيذ الإجراء');
    } finally {
      setBusy(false);
    }
  };
  const issues = useMemo(
    () =>
      readiness.checks.reduce<Record<string, number>>((result, check) => {
        if (check.state === 'INCOMPLETE' && check.targetSection)
          result[check.targetSection] = (result[check.targetSection] ?? 0) + 1;
        return result;
      }, {}),
    [readiness],
  );
  if (loading)
    return (
      <div className="grid min-h-96 place-items-center text-emerald-700">
        <Loader2 className="animate-spin" size={30} />
      </div>
    );
  if (!course)
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-800">
        <AlertCircle className="mx-auto" />
        <h1 className="mt-3 font-bold">تعذر فتح الدورة</h1>
        <p className="mt-2 text-sm">{error}</p>
        <button
          onClick={() => void load()}
          className="mt-4 rounded-xl border border-red-300 px-4 py-2"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  const locked = course.status === 'PUBLISHED' || course.status === 'ARCHIVED';
  return (
    <main dir={isRTL ? 'rtl' : 'ltr'} className="space-y-5">
      <NativeCourseHeader
        course={course}
        readiness={readiness}
        saving={saving}
        busy={busy}
        onPreview={() => setPreview(true)}
        onLifecycle={(action) => void lifecycle(action)}
      />
      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
        >
          <AlertCircle size={18} />
          {error}
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_280px]">
        <NativeCourseBuilderNav active={section} onChange={setSection} issues={issues} />
        <section className="min-w-0">
          {section === 'basics' && (
            <NativeCourseBasicsEditor course={course} disabled={busy || locked} onSave={save} />
          )}
          {section === 'curriculum' && (
            <NativeCourseCurriculumEditor
              courseId={course.id}
              snapshot={curriculum}
              locked={locked}
              onRefresh={refreshBuilder}
              onError={setError}
            />
          )}
          {section === 'assessments' && (
            <NativeCourseAssessmentEditor
              courseId={course.id}
              snapshot={curriculum}
              locked={locked}
              onRefresh={refreshBuilder}
              onError={setError}
            />
          )}
          {section === 'completion' && (
            <NativeCourseCompletionEditor course={course} disabled={busy || locked} onSave={save} />
          )}
          {section === 'settings' && (
            <SettingsPanel
              course={course}
              locked={locked}
              onLifecycle={(action) => void lifecycle(action)}
            />
          )}
        </section>
        <NativeCourseReadinessPanel readiness={readiness} onNavigate={setSection} />
      </div>
      {preview && (
        <NativeCourseStudentPreview
          course={course}
          snapshot={curriculum}
          onClose={() => setPreview(false)}
        />
      )}
    </main>
  );
}

function SettingsPanel({
  course,
  locked,
  onLifecycle,
}: {
  course: NativeCourseDto;
  locked: boolean;
  onLifecycle(action: 'unpublish' | 'archive'): void;
}) {
  return (
    <section className="rounded-2xl border bg-white p-5">
      <h2 className="text-lg font-bold">الإعدادات والنشر</h2>
      <p className="mt-1 text-sm text-slate-500">
        الهوية العامة والرابط لا يتغيران عند تعديل العنوان.
      </p>
      <dl className="mt-5 grid gap-4 text-sm">
        <div>
          <dt className="text-slate-500">Public ID</dt>
          <dd dir="ltr" className="mt-1 rounded-lg bg-slate-50 p-3 font-mono">
            {course.publicId}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Slug</dt>
          <dd dir="ltr" className="mt-1 rounded-lg bg-slate-50 p-3 font-mono">
            {course.slug}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">الحالة</dt>
          <dd className="mt-1 font-bold">{course.status}</dd>
        </div>
      </dl>
      <div className="mt-6 border-t pt-5">
        <h3 className="font-bold text-red-800">إجراءات دورة الحياة</h3>
        <div className="mt-3 flex gap-2">
          {course.status === 'PUBLISHED' && (
            <button
              onClick={() => onLifecycle('unpublish')}
              className="rounded-xl border px-4 py-2.5"
            >
              إلغاء النشر أولًا
            </button>
          )}
          <button
            disabled={locked && course.status === 'ARCHIVED'}
            onClick={() => onLifecycle('archive')}
            className="rounded-xl border border-red-300 px-4 py-2.5 text-red-700 disabled:opacity-50"
          >
            أرشفة الدورة
          </button>
        </div>
      </div>
    </section>
  );
}
