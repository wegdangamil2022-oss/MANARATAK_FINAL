import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AlertCircle, BookOpen, Loader2, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ApiClient, CreateNativeCourseInput, NativeCourseDto } from '../../api/client';
import { useTranslation } from '../../i18n/I18nProvider';

const statusLabel: Record<string, string> = {
  DRAFT: 'مسودة',
  READY_TO_REVIEW: 'جاهزة للمراجعة',
  READY_TO_PUBLISH: 'جاهزة للنشر',
  PUBLISHED: 'منشورة',
  REJECTED: 'مرفوضة',
  ARCHIVED: 'مؤرشفة',
};

export function AdminNativeCoursesPreviewPage() {
  const { isRTL } = useTranslation();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<NativeCourseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateNativeCourseInput>({
    titleAr: '',
    titleEn: '',
    learningLanguage: 'العربية',
    category: '',
    difficultyLevel: 'BEGINNER',
  });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setCourses((await ApiClient.getAdminNativeCourses({ pageSize: 100 })).data);
    } catch (cause) {
      setCourses([]);
      setError(cause instanceof Error ? cause.message : 'تعذر تحميل الدورات');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized
      ? courses.filter((course) =>
          `${course.displayName} ${String(course.optionalFields?.titleEn ?? '')}`
            .toLowerCase()
            .includes(normalized),
        )
      : courses;
  }, [courses, query]);

  const create = async (event: FormEvent) => {
    event.preventDefault();
    setCreating(true);
    setError('');
    try {
      const created = await ApiClient.createAdminNativeCourse(form);
      setShowCreate(false);
      navigate(`/admin/courses/native/${created.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر إنشاء الدورة');
    } finally {
      setCreating(false);
    }
  };

  const drafts = courses.filter((item) => item.status === 'DRAFT').length;
  const published = courses.filter((item) => item.status === 'PUBLISHED').length;
  const ready = courses.filter((item) => item.status === 'READY_TO_PUBLISH').length;

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'} className="space-y-6">
      <header className="rounded-3xl bg-[#044A37] px-6 py-7 text-white shadow-lg">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-emerald-100">منصة التأليف التعليمية</p>
            <h1 className="mt-1 flex items-center gap-3 text-2xl font-bold">
              <BookOpen /> دورات منارتك
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-emerald-50">
              أنشئ الدورة أولًا كمسودة محفوظة، ثم أضف المنهج والدروس والاختبارات داخل المحرر.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#E3B04B] px-5 py-3 font-bold text-[#12382e] focus:outline-none focus:ring-2 focus:ring-white"
          >
            <Plus size={19} /> إنشاء دورة
          </button>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ['جميع الدورات', courses.length],
          ['المسودات', drafts],
          ['جاهزة للنشر', ready],
          ['منشورة', published],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border bg-white p-4">
            <span className="text-sm text-slate-500">{label}</span>
            <strong className="mt-1 block text-2xl text-slate-900">{value}</strong>
          </div>
        ))}
      </section>

      <div className="relative">
        <Search className="absolute right-3 top-3 text-slate-400" size={19} />
        <input
          aria-label="بحث عن دورة"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ابحث باسم الدورة"
          className="w-full rounded-xl border bg-white py-3 pe-4 ps-11 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </div>
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
        >
          <span className="flex items-center gap-2">
            <AlertCircle size={19} />
            {error}
          </span>
          <button
            onClick={() => void load()}
            className="rounded-lg border border-red-300 px-3 py-2"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-16 text-emerald-700">
          <Loader2 className="animate-spin" />
        </div>
      ) : filtered.length === 0 && !error ? (
        <section className="rounded-2xl border border-dashed bg-white p-12 text-center">
          <BookOpen className="mx-auto text-slate-400" size={38} />
          <h2 className="mt-4 text-lg font-bold">لا توجد دورات منارتك</h2>
          <p className="mt-2 text-sm text-slate-500">ابدأ بمسودة حقيقية محفوظة في النظام.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-5 rounded-xl bg-[#044A37] px-5 py-3 text-white"
          >
            إنشاء أول دورة
          </button>
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border bg-white">
          <div className="divide-y">
            {filtered.map((course) => (
              <article
                key={course.id}
                className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-slate-900">{course.displayName}</h2>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800">
                      {statusLabel[course.status] ?? course.status}
                    </span>
                  </div>
                  {Boolean(course.optionalFields?.titleEn) && (
                    <p dir="ltr" className="mt-1 text-sm text-slate-500">
                      {String(course.optionalFields?.titleEn)}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-slate-500">
                    {course.learningLanguage || 'اللغة غير محددة'} ·{' '}
                    {course.difficultyLevel || 'المستوى غير محدد'} · آخر تحديث{' '}
                    {new Date(course.updatedAt).toLocaleDateString('ar')}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/admin/courses/native/${course.id}`)}
                  className="rounded-xl bg-[#044A37] px-4 py-2.5 text-sm font-bold text-white"
                >
                  فتح المحرر
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      {showCreate && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-title"
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4"
        >
          <form onSubmit={create} className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <h2 id="create-title" className="text-xl font-bold">
              إنشاء مسودة دورة
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              أدخل البيانات الأساسية فقط، وستكمل التأليف داخل المحرر.
            </p>
            <div className="mt-5 grid gap-4">
              <label className="text-sm font-medium">
                العنوان العربي *
                <input
                  required
                  minLength={2}
                  value={form.titleAr}
                  onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                  className="mt-1 w-full rounded-xl border p-3"
                />
              </label>
              <label className="text-sm font-medium">
                العنوان الإنجليزي
                <input
                  dir="ltr"
                  value={form.titleEn}
                  onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                  className="mt-1 w-full rounded-xl border p-3"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="text-sm">
                  اللغة
                  <input
                    value={form.learningLanguage}
                    onChange={(e) => setForm({ ...form, learningLanguage: e.target.value })}
                    className="mt-1 w-full rounded-xl border p-3"
                  />
                </label>
                <label className="text-sm">
                  المجال
                  <input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="mt-1 w-full rounded-xl border p-3"
                  />
                </label>
                <label className="text-sm">
                  المستوى
                  <select
                    value={form.difficultyLevel}
                    onChange={(e) => setForm({ ...form, difficultyLevel: e.target.value })}
                    className="mt-1 w-full rounded-xl border p-3"
                  >
                    <option value="BEGINNER">مبتدئ</option>
                    <option value="INTERMEDIATE">متوسط</option>
                    <option value="ADVANCED">متقدم</option>
                  </select>
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-xl border px-4 py-2.5"
              >
                إلغاء
              </button>
              <button
                disabled={creating}
                className="rounded-xl bg-[#044A37] px-5 py-2.5 font-bold text-white disabled:opacity-50"
              >
                {creating ? 'جاري الإنشاء...' : 'إنشاء وبدء التأليف'}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
