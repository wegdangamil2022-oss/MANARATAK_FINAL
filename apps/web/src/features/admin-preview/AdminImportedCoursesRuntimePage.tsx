import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  DownloadCloud,
  ExternalLink,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { ApiClient } from '../../api/client';

type Provider = {
  id: string;
  displayName: string;
  status: string;
};

type Overview = {
  total: number;
  review: number;
  incomplete: number;
  broken: number;
  needsVerification: number;
  ready: number;
  published: number;
  archived: number;
};

type ImportedCourse = {
  id: string;
  publicId: string;
  displayName: string;
  originalSourceTitle?: string | null;
  providerName?: string | null;
  externalProviderId?: string | null;
  directCourseUrl: string;
  status: string;
  completenessStatus: string;
  isStudyFree?: boolean | null;
  isFreeCertificate?: boolean | null;
  certificateType?: string | null;
  learningLanguageRaw?: string | null;
  studyLevelRaw?: string | null;
  studyDurationRaw?: string | null;
  linkHealth: string;
  sourceVerified: boolean;
  missingFieldsCount: number;
};

type PageResult = {
  data: ImportedCourse[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  overview: Overview;
};

const EMPTY_OVERVIEW: Overview = {
  total: 0,
  review: 0,
  incomplete: 0,
  broken: 0,
  needsVerification: 0,
  ready: 0,
  published: 0,
  archived: 0,
};

const STATUS_AR: Record<string, string> = {
  IMPORTED: 'مستوردة',
  INCOMPLETE: 'ناقصة',
  READY_TO_REVIEW: 'جاهزة للمراجعة',
  READY_TO_PUBLISH: 'جاهزة للنشر',
  PUBLISHED: 'منشورة',
  REJECTED: 'مرفوضة',
  ARCHIVED: 'مؤرشفة',
};

const LINK_AR: Record<string, string> = {
  VERIFIED_DIRECT: 'الرابط متحقق',
  REDIRECTED_VALID: 'تحويل صالح',
  NEEDS_REVIEW: 'يحتاج مراجعة',
  BROKEN: 'رابط معطل',
  BLOCKED_DOMAIN: 'نطاق محظور',
  NOT_DIRECT_COURSE_PAGE: 'ليس رابط دورة مباشر',
  UNKNOWN: 'غير مفحوص',
};

export function AdminImportedCoursesRuntimePage() {
  const [result, setResult] = useState<PageResult>({
    data: [],
    total: 0,
    page: 1,
    pageSize: 50,
    totalPages: 0,
    overview: EMPTY_OVERVIEW,
  });
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [providerId, setProviderId] = useState('');
  const [status, setStatus] = useState('');
  const [freeMode, setFreeMode] = useState('');
  const [linkHealth, setLinkHealth] = useState('');
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [coursesResponse, providersResponse] = await Promise.all([
        ApiClient.getAdminImportedCourses({
          q: q || undefined,
          providerId: providerId || undefined,
          status: status || undefined,
          freeMode: freeMode || undefined,
          linkHealth: linkHealth || undefined,
          page,
          pageSize: 50,
        }),
        ApiClient.getCourseImportProviders(),
      ]);
      setResult(coursesResponse);
      setProviders(Array.isArray(providersResponse?.data) ? providersResponse.data : []);
    } catch {
      setResult((current) => ({ ...current, data: [], total: 0, totalPages: 0 }));
      setProviders([]);
      setError('تعذر تحميل بيانات الدورات المستوردة من الخادم. لم يتم عرض أي بيانات تجريبية بديلة.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId, status, freeMode, linkHealth, page]);

  const stats = useMemo(() => [
    ['الإجمالي', result.overview.total],
    ['للمراجعة', result.overview.review],
    ['ناقصة', result.overview.incomplete],
    ['روابط معطلة', result.overview.broken],
    ['تحتاج تحققًا', result.overview.needsVerification],
    ['جاهزة للنشر', result.overview.ready],
    ['منشورة', result.overview.published],
    ['مؤرشفة', result.overview.archived],
  ] as const, [result.overview]);

  const runSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    void load();
  };

  return (
    <main dir="rtl" className="min-h-screen bg-[#f8fafc] px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-bold text-slate-500">
            <Link to="/admin/courses" className="hover:text-[#0F4B3A]">إدارة الدورات</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900">الدورات المستوردة</span>
          </div>
          <Link
            to="/admin/imports/courses"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0F4B3A] px-4 text-sm font-black text-white"
          >
            <DownloadCloud className="h-4 w-4" />
            مركز عمليات الاستيراد
          </Link>
        </div>

        <header className="rounded-3xl bg-gradient-to-r from-[#0F4B3A] via-[#155e49] to-[#0a382b] p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold text-emerald-200">
                <ShieldCheck className="h-4 w-4" />
                بيانات تشغيلية من قاعدة البيانات
              </div>
              <h1 className="text-2xl font-black sm:text-4xl">الدورات المستوردة</h1>
              <p className="mt-2 max-w-3xl text-sm font-medium leading-7 text-emerald-100">
                إدارة الدورات الخارجية وربط حالة المصدر والرابط والمراجعة والنشر بالبيانات الفعلية، دون عينات أو fallback.
              </p>
            </div>
            <button
              onClick={() => void load()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-black"
            >
              <RefreshCw className="h-4 w-4" />
              تحديث
            </button>
          </div>
        </header>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-black text-rose-900">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
              <div className="text-xl font-black text-[#0F4B3A]">{value}</div>
              <div className="mt-1 text-[11px] font-bold text-slate-500">{label}</div>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <form onSubmit={runSearch} className="grid gap-3 lg:grid-cols-6">
            <div className="relative lg:col-span-2">
              <Search className="absolute right-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                value={q}
                onChange={(event) => setQ(event.target.value)}
                placeholder="ابحث باسم الدورة أو المنصة..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-3 pr-10 text-sm font-bold outline-none focus:border-[#0F4B3A]"
              />
            </div>
            <select value={providerId} onChange={(event) => { setProviderId(event.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold">
              <option value="">كل المزودين</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>{provider.displayName}</option>
              ))}
            </select>
            <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold">
              <option value="">كل الحالات</option>
              {Object.keys(STATUS_AR).map((key) => <option key={key} value={key}>{STATUS_AR[key]}</option>)}
            </select>
            <select value={freeMode} onChange={(event) => { setFreeMode(event.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold">
              <option value="">كل أنواع المجانية</option>
              <option value="FREE_STUDY">دراسة مجانية</option>
              <option value="FREE_CERTIFICATE">شهادة مجانية</option>
            </select>
            <select value={linkHealth} onChange={(event) => { setLinkHealth(event.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold">
              <option value="">كل حالات الرابط</option>
              {Object.keys(LINK_AR).map((key) => <option key={key} value={key}>{LINK_AR[key]}</option>)}
            </select>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-72 items-center justify-center gap-2 text-sm font-black text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-[#0F4B3A]" />
              تحميل البيانات التشغيلية...
            </div>
          ) : result.data.length === 0 ? (
            <div className="p-12 text-center text-sm font-bold text-slate-500">لا توجد سجلات مطابقة.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {result.data.map((course) => (
                <article key={course.id} className="grid gap-4 p-5 lg:grid-cols-[1.5fr_1fr_1fr_auto] lg:items-center">
                  <div>
                    <Link to={`/admin/courses/imported/${encodeURIComponent(course.id)}`} className="text-base font-black text-slate-950 hover:text-[#0F4B3A]">
                      {course.displayName}
                    </Link>
                    {course.originalSourceTitle && course.originalSourceTitle !== course.displayName && (
                      <p className="mt-1 text-xs font-bold text-slate-500">{course.originalSourceTitle}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">{course.providerName || 'مزود غير محدد'}</span>
                      <span className={`rounded-full px-2.5 py-1 ${course.sourceVerified ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                        {course.sourceVerified ? 'المصدر ضمن سجل المزود' : 'المصدر يحتاج تحققًا'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs font-bold text-slate-600">
                    <div>الحالة: <span className="text-slate-950">{STATUS_AR[course.status] || course.status}</span></div>
                    <div>الرابط: <span className="text-slate-950">{LINK_AR[course.linkHealth] || course.linkHealth}</span></div>
                    <div>الحقول الناقصة: <span className="text-slate-950">{course.missingFieldsCount}</span></div>
                  </div>

                  <div className="space-y-1 text-xs font-bold text-slate-600">
                    <div>الدراسة المجانية: {course.isStudyFree === true ? 'نعم' : course.isStudyFree === false ? 'لا' : 'غير محدد'}</div>
                    <div>الشهادة المجانية: {course.isFreeCertificate === true ? 'نعم' : course.isFreeCertificate === false ? 'لا' : 'غير محدد'}</div>
                    <div>اللغة: {course.learningLanguageRaw || 'غير محددة'}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a href={course.directCourseUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50" title="فتح الرابط الرسمي">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <Link to={`/admin/courses/imported/${encodeURIComponent(course.id)}`} className="inline-flex min-h-10 items-center gap-1 rounded-xl bg-[#0F4B3A] px-3 text-xs font-black text-white">
                      مراجعة
                      <ChevronLeft className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <button
            disabled={page <= 1 || loading}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="inline-flex min-h-10 items-center gap-1 rounded-xl bg-slate-100 px-3 text-xs font-black disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" /> السابق
          </button>
          <div className="text-xs font-black text-slate-600">
            الصفحة {result.page} من {Math.max(1, result.totalPages)} — {result.total} سجل
          </div>
          <button
            disabled={page >= result.totalPages || loading || result.totalPages === 0}
            onClick={() => setPage((value) => value + 1)}
            className="inline-flex min-h-10 items-center gap-1 rounded-xl bg-slate-100 px-3 text-xs font-black disabled:opacity-40"
          >
            التالي <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-xs font-bold text-emerald-950">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-700" />
          العدادات والمزودون والقائمة في هذه الصفحة تأتي من واجهات التشغيل وقاعدة البيانات، وليس من ثوابت React.
        </div>
      </div>
    </main>
  );
}
