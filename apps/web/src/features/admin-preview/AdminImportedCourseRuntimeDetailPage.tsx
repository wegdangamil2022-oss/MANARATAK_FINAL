import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  Archive,
  CheckCircle2,
  ExternalLink,
  FileSearch,
  Link2,
  Loader2,
  RefreshCw,
  Save,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { ApiClient } from '../../api/client';

export function AdminImportedCourseRuntimeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [edit, setEdit] = useState({ displayName: '', directCourseUrl: '' });

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await ApiClient.getAdminImportedCourseById(id);
      setCourse(data);
      setEdit({
        displayName: data.displayName || '',
        directCourseUrl: data.directCourseUrl || '',
      });
    } catch {
      setCourse(null);
      setError('تعذر تحميل سجل الدورة من الخادم.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const run = async (name: string, fn: () => Promise<any>, message: string) => {
    setAction(name);
    setError(null);
    setSuccess(null);
    try {
      await fn();
      setSuccess(message);
      await load();
    } catch (err: any) {
      setError(err?.message || 'تعذر تنفيذ الإجراء.');
    } finally {
      setAction(null);
    }
  };

  if (loading) {
    return (
      <main dir="rtl" className="min-h-screen bg-[#f8fafc] p-8">
        <div className="mx-auto flex min-h-[50vh] max-w-5xl items-center justify-center gap-2 rounded-3xl border bg-white text-sm font-black text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-[#0F4B3A]" /> تحميل الدورة...
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main dir="rtl" className="min-h-screen bg-[#f8fafc] p-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-rose-200 bg-white p-10 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
          <h1 className="mt-3 text-xl font-black">تعذر عرض الدورة</h1>
          <p className="mt-2 text-sm font-bold text-slate-500">{error}</p>
          <Link to="/admin/courses/imported" className="mt-5 inline-flex rounded-xl bg-[#0F4B3A] px-4 py-3 text-sm font-black text-white">العودة</Link>
        </div>
      </main>
    );
  }

  const busy = Boolean(action);

  return (
    <main dir="rtl" className="min-h-screen bg-[#f8fafc] px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="text-sm font-bold text-slate-500">
          <Link to="/admin/courses/imported" className="hover:text-[#0F4B3A]">الدورات المستوردة</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">تفاصيل الدورة</span>
        </div>

        <header className="rounded-3xl bg-[#0F4B3A] p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-xs font-black text-emerald-200">{course.providerName || 'مزود غير محدد'}</div>
              <h1 className="mt-2 text-2xl font-black sm:text-3xl">{course.displayName}</h1>
              <p className="mt-2 text-sm font-bold text-emerald-100">{course.originalSourceTitle || course.canonicalName}</p>
            </div>
            <a href={course.directCourseUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-black text-[#0F4B3A]">
              <ExternalLink className="h-4 w-4" /> الرابط الرسمي
            </a>
          </div>
        </header>

        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-black text-rose-900">{error}</div>}
        {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-black text-emerald-900">{success}</div>}

        <section className="grid gap-4 md:grid-cols-4">
          {[
            ['الحالة', course.status],
            ['اكتمال البيانات', course.completenessStatus],
            ['حالة الرابط', course.linkHealth],
            ['الحقول الناقصة', String(course.missingFieldsCount ?? 0)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-[11px] font-black text-slate-400">{label}</div>
              <div className="mt-1 break-words text-sm font-black text-slate-900">{value || 'غير متوفر'}</div>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black">إجراءات التحقق والنشر</h2>
          <p className="mt-1 text-xs font-bold leading-6 text-slate-500">
            كل زر يستدعي endpoint صريحًا؛ لا يوجد مسار backend عام من نوع <code>/:action</code>.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button disabled={busy} onClick={() => run('verify-source', () => ApiClient.verifyAdminImportedCourseSource(course.id), 'تم التحقق من أن المزود والنطاق مسجلان ومعتمدان.')} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-slate-100 px-3 text-xs font-black">
              <ShieldCheck className="h-4 w-4" /> تحقق المصدر
            </button>
            <button disabled={busy} onClick={() => run('check-link', () => ApiClient.checkAdminImportedCourseLink(course.id), 'تم فحص الرابط وتحديث حالته.')} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-slate-100 px-3 text-xs font-black">
              <Link2 className="h-4 w-4" /> فحص الرابط
            </button>
            <button disabled={busy} onClick={() => run('fetch-missing', () => ApiClient.fetchAdminImportedCourseMissing(course.id), 'اكتمل جلب الحقول المتاحة حسب سياسة المزود.')} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-slate-100 px-3 text-xs font-black">
              <FileSearch className="h-4 w-4" /> استكمال الناقص
            </button>
            <button disabled={busy} onClick={() => run('mark-ready', () => ApiClient.markAdminImportedCourseReady(course.id), 'تم وضع الدورة في حالة جاهزة للنشر.')} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-50 px-3 text-xs font-black text-blue-800">
              <CheckCircle2 className="h-4 w-4" /> جاهزة للنشر
            </button>
            {course.status === 'PUBLISHED' ? (
              <button disabled={busy} onClick={() => run('unpublish', () => ApiClient.unpublishAdminImportedCourse(course.id), 'تم إلغاء النشر.')} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-amber-50 px-3 text-xs font-black text-amber-800">
                <RefreshCw className="h-4 w-4" /> إلغاء النشر
              </button>
            ) : (
              <button disabled={busy} onClick={() => run('publish', () => ApiClient.publishAdminImportedCourse(course.id), 'تم نشر الدورة.')} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-black text-white">
                <CheckCircle2 className="h-4 w-4" /> نشر
              </button>
            )}
            <button disabled={busy} onClick={() => run('reject', () => ApiClient.rejectAdminImportedCourse(course.id), 'تم رفض الدورة.')} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-rose-50 px-3 text-xs font-black text-rose-800">
              <XCircle className="h-4 w-4" /> رفض
            </button>
            <button disabled={busy} onClick={() => run('archive', () => ApiClient.archiveAdminImportedCourse(course.id), 'تمت أرشفة الدورة.')} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-slate-800 px-3 text-xs font-black text-white">
              <Archive className="h-4 w-4" /> أرشفة
            </button>
          </div>
          {action && <div className="mt-3 flex items-center gap-2 text-xs font-black text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> تنفيذ {action}...</div>}
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black">تحرير البيانات الأساسية</h2>
            <div className="mt-4 space-y-3">
              <label className="block text-xs font-black text-slate-500">اسم العرض</label>
              <input value={edit.displayName} onChange={(event) => setEdit((value) => ({ ...value, displayName: event.target.value }))} className="w-full rounded-xl border border-slate-200 p-3 text-sm font-bold" />
              <label className="block text-xs font-black text-slate-500">الرابط المباشر</label>
              <input value={edit.directCourseUrl} onChange={(event) => setEdit((value) => ({ ...value, directCourseUrl: event.target.value }))} className="w-full rounded-xl border border-slate-200 p-3 text-left text-sm font-bold" dir="ltr" />
              <button disabled={busy} onClick={() => run('save', () => ApiClient.updateAdminImportedCourse(course.id, edit), 'تم حفظ التعديلات.')} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#0F4B3A] px-4 text-xs font-black text-white">
                <Save className="h-4 w-4" /> حفظ
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black">بيانات المصدر</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div><dt className="text-xs font-black text-slate-400">المزود</dt><dd className="font-black">{course.providerName || 'غير متوفر'}</dd></div>
              <div><dt className="text-xs font-black text-slate-400">دراسة مجانية</dt><dd className="font-black">{course.isStudyFree === true ? 'نعم' : course.isStudyFree === false ? 'لا' : 'غير محدد'}</dd></div>
              <div><dt className="text-xs font-black text-slate-400">شهادة مجانية</dt><dd className="font-black">{course.isFreeCertificate === true ? 'نعم' : course.isFreeCertificate === false ? 'لا' : 'غير محدد'}</dd></div>
              <div><dt className="text-xs font-black text-slate-400">نوع الشهادة</dt><dd className="font-black">{course.certificateType || 'غير متوفر'}</dd></div>
              <div><dt className="text-xs font-black text-slate-400">اللغة</dt><dd className="font-black">{course.learningLanguageRaw || 'غير متوفر'}</dd></div>
              <div><dt className="text-xs font-black text-slate-400">المستوى</dt><dd className="font-black">{course.studyLevelRaw || 'غير متوفر'}</dd></div>
              <div><dt className="text-xs font-black text-slate-400">المدة</dt><dd className="font-black">{course.studyDurationRaw || 'غير متوفر'}</dd></div>
            </dl>
          </div>
        </section>

        {Array.isArray(course.provenance) && course.provenance.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black">أثر المصدر والمراجعة</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[700px] text-right text-xs">
                <thead className="bg-slate-50 text-slate-500">
                  <tr><th className="p-3">الحقل</th><th className="p-3">سجل الاستيراد</th><th className="p-3">حالة المراجعة</th><th className="p-3">المراجع</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {course.provenance.map((item: any, index: number) => (
                    <tr key={`${item.fieldKey}-${index}`}>
                      <td className="p-3 font-black">{item.fieldKey}</td>
                      <td className="p-3">{item.importRecordId}</td>
                      <td className="p-3">{item.reviewStatus}</td>
                      <td className="p-3">{item.reviewedBy || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
