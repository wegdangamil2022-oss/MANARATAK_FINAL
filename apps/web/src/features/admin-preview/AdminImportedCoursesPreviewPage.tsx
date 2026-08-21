import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Award,
  BookOpen,
  DownloadCloud,
  ExternalLink,
  Eye,
  FilterX,
  Globe,
  Layers,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { ApiClient } from '../../api/client';
import {
  COURSE_SPECIALTY_OPTIONS,
  COURSE_TYPE_OPTIONS,
  MASTER_PROVIDER_OPTIONS,
  deriveCourseSpecialty,
  deriveCourseType,
  getArabicCourseTitle,
  getCourseDuration,
  getCourseLanguageRaw,
  getCourseLevelRaw,
  getCourseProvider,
  getCourseStatus,
  getDirectCourseUrl,
  getFreeCertificateState,
  getLinkHealth,
  getLinkHealthArabic,
  getMissingFieldsCount,
  getOriginalCourseTitle,
  getStatusArabic,
  getStatusStyle,
  getStudyFreeState,
  isSourceVerified,
  translateLanguage,
  translateLevel,
  type ImportedCourseRecord,
} from './importedCourseUi';

type QuickFilter = 'ALL' | 'REVIEW' | 'MISSING' | 'BROKEN' | 'VERIFY' | 'READY' | 'PUBLISHED' | 'ARCHIVED';
type FreeMode = 'ALL' | 'FREE_CERTIFICATE' | 'FREE_STUDY';

const STATUS_ORDER = [
  'IMPORTED',
  'READY_TO_REVIEW',
  'AWAITING_REVIEW',
  'UNDER_REVIEW',
  'MISSING_DATA',
  'BROKEN_LINK',
  'READY_TO_PUBLISH',
  'APPROVED',
  'PUBLISHED',
  'REJECTED',
  'ARCHIVED',
];

export function AdminImportedCoursesPreviewPage() {
  const [courses, setCourses] = useState<ImportedCourseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedFreeMode, setSelectedFreeMode] = useState<FreeMode>('ALL');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedCourseType, setSelectedCourseType] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('ALL');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiClient.getAdminImportedCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setCourses([]);
      setError(err?.message ? 'تعذر تحميل الدورات المستوردة من الخادم حاليًا.' : 'تعذر تحميل الدورات المستوردة حاليًا.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const counts = useMemo(() => ({
    all: courses.length,
    review: courses.filter(course => ['IMPORTED', 'READY_TO_REVIEW', 'AWAITING_REVIEW', 'UNDER_REVIEW'].includes(getCourseStatus(course))).length,
    missing: courses.filter(course => ['MISSING_DATA', 'INCOMPLETE'].includes(getCourseStatus(course)) || getMissingFieldsCount(course) > 0).length,
    broken: courses.filter(course => getCourseStatus(course) === 'BROKEN_LINK' || getLinkHealth(course) === 'BROKEN').length,
    verify: courses.filter(course => !isSourceVerified(course) || getLinkHealth(course) === 'NEEDS_VERIFICATION').length,
    ready: courses.filter(course => ['READY_TO_PUBLISH', 'APPROVED'].includes(getCourseStatus(course))).length,
    published: courses.filter(course => getCourseStatus(course) === 'PUBLISHED').length,
    archived: courses.filter(course => getCourseStatus(course) === 'ARCHIVED').length,
  }), [courses]);

  const providerOptions = useMemo(() => {
    const dynamic = courses.map(getCourseProvider).filter(provider => provider && provider !== 'مزود غير محدد');
    return Array.from(new Set<string>([...MASTER_PROVIDER_OPTIONS, ...dynamic])).sort((a, b) => a.localeCompare(b));
  }, [courses]);

  const statusOptions = useMemo(() => {
    const dynamic = courses.map(getCourseStatus).filter(Boolean);
    return Array.from(new Set([...STATUS_ORDER, ...dynamic]));
  }, [courses]);

  const specialtyOptions = useMemo(() => {
    const dynamic = courses.map(deriveCourseSpecialty);
    const all = Array.from(new Set<string>([...COURSE_SPECIALTY_OPTIONS, ...dynamic]));
    return all.filter(Boolean);
  }, [courses]);

  const languageOptions = useMemo(() => Array.from(new Set(courses.map(getCourseLanguageRaw).filter(Boolean))).sort(), [courses]);
  const levelOptions = useMemo(() => Array.from(new Set(courses.map(getCourseLevelRaw).filter(Boolean))).sort(), [courses]);

  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return courses.filter(course => {
      const status = getCourseStatus(course);
      const provider = getCourseProvider(course);
      const specialty = deriveCourseSpecialty(course);
      const courseType = deriveCourseType(course);
      const language = getCourseLanguageRaw(course);
      const level = getCourseLevelRaw(course);
      const freeStudy = getStudyFreeState(course);
      const freeCertificate = getFreeCertificateState(course);

      if (q) {
        const searchable = [
          getArabicCourseTitle(course),
          getOriginalCourseTitle(course),
          provider,
          specialty,
          courseType,
          course.category,
        ].filter(Boolean).join(' ').toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      if (selectedProvider && provider !== selectedProvider) return false;
      if (selectedStatus && status !== selectedStatus) return false;
      if (selectedSpecialty && specialty !== selectedSpecialty) return false;
      if (selectedCourseType && courseType !== selectedCourseType) return false;
      if (selectedLanguage && language !== selectedLanguage) return false;
      if (selectedLevel && level !== selectedLevel) return false;
      if (selectedFreeMode === 'FREE_CERTIFICATE' && freeCertificate !== true) return false;
      if (selectedFreeMode === 'FREE_STUDY' && freeStudy !== true) return false;

      if (quickFilter === 'REVIEW' && !['IMPORTED', 'READY_TO_REVIEW', 'AWAITING_REVIEW', 'UNDER_REVIEW'].includes(status)) return false;
      if (quickFilter === 'MISSING' && !(['MISSING_DATA', 'INCOMPLETE'].includes(status) || getMissingFieldsCount(course) > 0)) return false;
      if (quickFilter === 'BROKEN' && !(status === 'BROKEN_LINK' || getLinkHealth(course) === 'BROKEN')) return false;
      if (quickFilter === 'VERIFY' && !(!isSourceVerified(course) || getLinkHealth(course) === 'NEEDS_VERIFICATION')) return false;
      if (quickFilter === 'READY' && !['READY_TO_PUBLISH', 'APPROVED'].includes(status)) return false;
      if (quickFilter === 'PUBLISHED' && status !== 'PUBLISHED') return false;
      if (quickFilter === 'ARCHIVED' && status !== 'ARCHIVED') return false;

      return true;
    });
  }, [courses, searchQuery, selectedProvider, selectedStatus, selectedFreeMode, selectedSpecialty, selectedCourseType, selectedLanguage, selectedLevel, quickFilter]);

  const hasActiveFilters = Boolean(
    searchQuery || selectedProvider || selectedStatus || selectedSpecialty || selectedCourseType || selectedLanguage || selectedLevel || selectedFreeMode !== 'ALL' || quickFilter !== 'ALL'
  );

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedProvider('');
    setSelectedStatus('');
    setSelectedFreeMode('ALL');
    setSelectedSpecialty('');
    setSelectedCourseType('');
    setSelectedLanguage('');
    setSelectedLevel('');
    setQuickFilter('ALL');
  };

  const stats: Array<{ key: QuickFilter; label: string; count: number }> = [
    { key: 'ALL', label: 'كل الدورات المستوردة', count: counts.all },
    { key: 'REVIEW', label: 'بانتظار المراجعة', count: counts.review },
    { key: 'MISSING', label: 'ناقصة البيانات', count: counts.missing },
    { key: 'BROKEN', label: 'روابط معطلة', count: counts.broken },
    { key: 'VERIFY', label: 'تحتاج تحققًا', count: counts.verify },
    { key: 'READY', label: 'جاهزة للنشر', count: counts.ready },
    { key: 'PUBLISHED', label: 'منشورة', count: counts.published },
    { key: 'ARCHIVED', label: 'مؤرشفة', count: counts.archived },
  ];

  return (
    <main dir="rtl" className="min-h-screen bg-[#f8fafc] px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
          <Link to="/admin/courses" className="hover:text-[#0F4B3A]">إدارة الدورات</Link>
          <span>/</span>
          <span className="text-slate-900">الدورات المستوردة</span>
        </div>

        <header className="flex flex-col gap-5 rounded-3xl bg-gradient-to-r from-[#0F4B3A] via-[#155e49] to-[#0a382b] p-6 text-white shadow-xl sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex w-fit items-center gap-2 text-xs font-bold text-emerald-300 sm:text-sm">
              <DownloadCloud className="h-4 w-4" />
              <span>كتالوج الدورات الخارجية</span>
            </div>
            <h1 className="text-2xl font-black sm:text-4xl">الدورات المستوردة</h1>
            <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-emerald-100/90">
              مراجعة الدورات المستوردة من المنصات والجامعات، والتحقق من مجانية الدراسة والشهادة والرابط المباشر والمصدر قبل النشر.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[120px] rounded-2xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur-md">
              <span className="block text-2xl font-black text-amber-300 sm:text-3xl">{counts.all}</span>
              <span className="text-[11px] font-bold text-emerald-100">إجمالي الدورات</span>
            </div>
            <button
              onClick={() => void loadData()}
              title="تحديث القائمة"
              className="flex min-h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 p-3 text-white transition-all hover:bg-white/20"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <Link
              to="/admin/imports/courses"
              className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-white px-4 text-sm font-black text-[#0F4B3A] shadow-sm transition-all hover:bg-emerald-50"
            >
              <DownloadCloud className="h-4 w-4" />
              <span>فتح مركز استيراد الدورات</span>
            </Link>
          </div>
        </header>

        {error && (
          <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-900">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-600" />
              <span>{error}</span>
            </div>
            <button onClick={() => void loadData()} className="rounded-lg bg-white px-3 py-2 text-xs font-black text-rose-800 shadow-sm">إعادة المحاولة</button>
          </div>
        )}

        <section className="grid grid-cols-2 gap-3 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm md:grid-cols-4 lg:grid-cols-8">
          {stats.map(stat => {
            const active = quickFilter === stat.key;
            return (
              <button
                key={stat.key}
                onClick={() => setQuickFilter(stat.key)}
                className={`flex min-h-20 flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                  active ? 'border-[#0F4B3A] bg-[#0F4B3A] text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <span className={`mb-1 text-lg font-black ${active ? 'text-white' : 'text-slate-950'}`}>{stat.count}</span>
                <span className="text-[11px] font-bold leading-tight">{stat.label}</span>
              </button>
            );
          })}
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                placeholder="ابحث باسم الدورة أو المنصة أو التخصص..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-3 pr-10 text-sm font-medium outline-none transition-colors hover:bg-white focus:border-[#0F4B3A] focus:ring-1 focus:ring-[#0F4B3A]"
              />
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 text-sm font-black text-slate-700 transition-colors hover:bg-slate-200"
              >
                <FilterX className="h-4 w-4" />
                <span>مسح التصفية</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <select value={selectedProvider} onChange={event => setSelectedProvider(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-700 outline-none focus:border-[#0F4B3A] focus:ring-1 focus:ring-[#0F4B3A]">
              <option value="">كل المزودين والمنصات</option>
              {providerOptions.map(provider => <option key={provider} value={provider}>{provider}</option>)}
            </select>

            <select value={selectedStatus} onChange={event => setSelectedStatus(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-700 outline-none focus:border-[#0F4B3A] focus:ring-1 focus:ring-[#0F4B3A]">
              <option value="">كل الحالات</option>
              {statusOptions.map(status => <option key={status} value={status}>{getStatusArabic(status)}</option>)}
            </select>

            <select value={selectedFreeMode} onChange={event => setSelectedFreeMode(event.target.value as FreeMode)} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-700 outline-none focus:border-[#0F4B3A] focus:ring-1 focus:ring-[#0F4B3A]">
              <option value="ALL">كل الدورات</option>
              <option value="FREE_CERTIFICATE">الدورات ذات الشهادات المجانية</option>
              <option value="FREE_STUDY">الدورات ذات الدراسة المجانية</option>
            </select>

            <select value={selectedSpecialty} onChange={event => setSelectedSpecialty(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-700 outline-none focus:border-[#0F4B3A] focus:ring-1 focus:ring-[#0F4B3A]">
              <option value="">كل التخصصات والمجالات</option>
              {specialtyOptions.map(specialty => <option key={specialty} value={specialty}>{specialty}</option>)}
            </select>

            <select value={selectedCourseType} onChange={event => setSelectedCourseType(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-700 outline-none focus:border-[#0F4B3A] focus:ring-1 focus:ring-[#0F4B3A]">
              <option value="">كل أنواع الدورات</option>
              {COURSE_TYPE_OPTIONS.map(type => <option key={type} value={type}>{type}</option>)}
            </select>

            <select value={selectedLanguage} onChange={event => setSelectedLanguage(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-700 outline-none focus:border-[#0F4B3A] focus:ring-1 focus:ring-[#0F4B3A]">
              <option value="">كل اللغات</option>
              {languageOptions.map(language => <option key={language} value={language}>{translateLanguage(language)}</option>)}
            </select>

            <select value={selectedLevel} onChange={event => setSelectedLevel(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-700 outline-none focus:border-[#0F4B3A] focus:ring-1 focus:ring-[#0F4B3A]">
              <option value="">كل المستويات</option>
              {levelOptions.map(level => <option key={level} value={level}>{translateLevel(level)}</option>)}
            </select>

            <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm font-bold text-emerald-950">
              <span>النتائج المطابقة</span>
              <span className="text-lg font-black text-[#0F4B3A]">{filteredCourses.length}</span>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white text-slate-500 shadow-sm">
              <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#0F4B3A]" />
              <span className="text-sm font-bold">جاري تحميل الدورات المستوردة...</span>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <BookOpen className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <h2 className="text-lg font-black text-slate-900">لا توجد دورات مطابقة</h2>
              <p className="mt-2 text-sm font-medium text-slate-500">جرّب تعديل الفلاتر أو استيراد دفعة جديدة من مركز استيراد الدورات.</p>
            </div>
          ) : (
            filteredCourses.map(course => {
              const id = String(course.id || course.publicId || course.courseId || '');
              const status = getCourseStatus(course);
              const freeStudy = getStudyFreeState(course);
              const freeCertificate = getFreeCertificateState(course);
              const directUrl = getDirectCourseUrl(course);

              return (
                <article key={id || `${getCourseProvider(course)}-${getOriginalCourseTitle(course)}`} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-3 py-1 text-[11px] font-black ${getStatusStyle(status)}`}>{getStatusArabic(status)}</span>
                        <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-800">{deriveCourseSpecialty(course)}</span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-black text-slate-700">{deriveCourseType(course)}</span>
                      </div>

                      <h2 className="text-lg font-black leading-8 text-slate-950 sm:text-xl">{getArabicCourseTitle(course)}</h2>

                      <div className="mt-4 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-slate-700">
                          <Globe className="h-4 w-4 shrink-0 text-[#0F4B3A]" />
                          <div><span className="block text-[10px] font-bold text-slate-400">المزود</span><span className="font-black">{getCourseProvider(course)}</span></div>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-slate-700">
                          <Layers className="h-4 w-4 shrink-0 text-[#0F4B3A]" />
                          <div><span className="block text-[10px] font-bold text-slate-400">المستوى</span><span className="font-black">{translateLevel(getCourseLevelRaw(course))}</span></div>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-slate-700">
                          <BookOpen className="h-4 w-4 shrink-0 text-[#0F4B3A]" />
                          <div><span className="block text-[10px] font-bold text-slate-400">اللغة</span><span className="font-black">{translateLanguage(getCourseLanguageRaw(course))}</span></div>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-slate-700">
                          <Award className="h-4 w-4 shrink-0 text-[#0F4B3A]" />
                          <div><span className="block text-[10px] font-bold text-slate-400">المدة</span><span className="font-black">{getCourseDuration(course)}</span></div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-black">
                        <span className={`rounded-lg border px-3 py-1.5 ${freeStudy === true ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                          {freeStudy === true ? 'الدراسة مجانية' : freeStudy === false ? 'الدراسة غير مجانية' : 'مجانية الدراسة غير محددة'}
                        </span>
                        <span className={`rounded-lg border px-3 py-1.5 ${freeCertificate === true ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                          {freeCertificate === true ? 'شهادة مجانية' : freeCertificate === false ? 'لا توجد شهادة مجانية' : 'الشهادة المجانية غير محددة'}
                        </span>
                        <span className={`rounded-lg border px-3 py-1.5 ${isSourceVerified(course) ? 'border-indigo-200 bg-indigo-50 text-indigo-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                          {isSourceVerified(course) ? 'المصدر متحقق منه' : 'المصدر يحتاج تحققًا'}
                        </span>
                        <span className={`rounded-lg border px-3 py-1.5 ${getLinkHealth(course) === 'HEALTHY' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                          {getLinkHealthArabic(course)}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-row gap-2 xl:w-[170px] xl:flex-col">
                      {id && (
                        <Link to={`/admin/courses/imported/${encodeURIComponent(id)}`} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0F4B3A] px-4 text-xs font-black text-white transition-colors hover:bg-[#0a382b]">
                          <Eye className="h-4 w-4" />
                          <span>عرض التفاصيل</span>
                        </Link>
                      )}
                      {directUrl && (
                        <a href={directUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 transition-colors hover:bg-slate-50">
                          <ExternalLink className="h-4 w-4" />
                          <span>فتح الدورة</span>
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>

        <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 text-xs font-bold leading-7 text-emerald-950">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />
            <p>
              التخصصات المعروضة في الفلاتر تصنيف مساعد للواجهة مشتق من اسم الدورة وموضوعاتها وبياناتها المتاحة، ولا يغيّر السجل الأصلي أو يستبدل التصنيف الأكاديمي المعتمد. كما أن فلاتر مجانية الدراسة والشهادة تعتمد على حقول المجانية الصريحة ولا تعتبر مجرد توفر شهادة دليلًا على أنها مجانية.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
