import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Database,
  Filter,
  GraduationCap,
  Layers3,
  Loader2,
  Search,
  UploadCloud,
} from 'lucide-react';
import { ApiClient } from '../../api/client';
import { getMajorDegreeTemplate } from '../majors/majorDegreeTemplates';

interface MajorListItem {
  id: string;
  displayName: string;
  nameAr?: string;
  nameEn?: string;
  code?: string;
  degreeLevel?: string;
  catalogKind?: string;
  collegeOrField?: string;
  academicFieldOrDiscipline?: string;
  collegeOrFaculty?: string;
  classificationCode?: string;
  status: string;
  completenessStatus?: string;
  sectionCount?: number;
  sourceType?: string;
  sourceFileName?: string;
  updatedAt?: string;
  hasDetails?: boolean;
}

const degreeOptions = [
  { value: '', label: 'كل الدرجات' },
  { value: 'Bachelor', label: 'بكالوريوس' },
  { value: 'Master', label: 'ماجستير' },
  { value: 'Doctorate', label: 'دكتوراه' },
  { value: 'Fellowship', label: 'زمالة' },
];

const statusOptions = [
  { value: '', label: 'كل الحالات' },
  { value: 'READY_TO_REVIEW', label: 'تحتاج مراجعة' },
  { value: 'IMPORTED', label: 'مستوردة' },
  { value: 'READY_TO_PUBLISH', label: 'جاهزة للنشر' },
  { value: 'PUBLISHED', label: 'منشورة' },
  { value: 'ARCHIVED', label: 'مؤرشفة' },
];

const completenessOptions = [
  { value: '', label: 'كل مستويات الاكتمال' },
  { value: 'COMPLETE', label: 'مكتملة' },
  { value: 'NEEDS_REVIEW', label: 'تحتاج مراجعة' },
  { value: 'INCOMPLETE', label: 'ناقصة' },
];

function getObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function getString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function normalizeApiMajor(item: Record<string, unknown>): MajorListItem[] {
  const optionalFields = getObject(item.optionalFields);
  const localizedNames = getObject(optionalFields.localizedNames);
  const metadata = getObject(optionalFields.metadata);
  const profiles = Array.isArray(item.profiles) ? item.profiles : [];

  if (profiles.length > 0) {
    return profiles.map((p: any) => {
      const pMetadata = getObject(p.metadata);
      const isDetailDossier = pMetadata.sourceClassificationSystem === 'MANARATAK_PHASE_10_DETAIL_DOSSIER' || getString(optionalFields.sourceClassificationSystem) === 'MANARATAK_PHASE_10_DETAIL_DOSSIER';
      
      const rawLevel = String(p.level).toUpperCase();
      let degreeLevel = 'Bachelor';
      if (rawLevel === 'MASTER') degreeLevel = 'Master';
      else if (rawLevel === 'DOCTORATE') degreeLevel = 'Doctorate';
      else if (rawLevel === 'FELLOWSHIP') degreeLevel = 'Fellowship';

      const code = p.code || getString(item.classificationCode) || getString(optionalFields.classificationCode);

      return {
        id: p.id || String(item.id ?? item.publicId ?? item.slug ?? ''),
        displayName: p.displayName || p.localizedNameAr || String(item.displayName ?? item.canonicalName ?? localizedNames.ar ?? 'تخصص بدون اسم'),
        nameAr: p.localizedNameAr || getString(localizedNames.ar),
        nameEn: p.localizedNameEn || getString(localizedNames.en),
        code,
        degreeLevel,
        catalogKind: rawLevel,
        collegeOrField: getString(item.academicFieldOrDiscipline) ?? getString(item.collegeOrFaculty) ?? getString(optionalFields.collegeOrFaculty),
        academicFieldOrDiscipline: getString(item.academicFieldOrDiscipline) ?? getString(optionalFields.academicFieldOrDiscipline),
        collegeOrFaculty: getString(item.collegeOrFaculty) ?? getString(optionalFields.collegeOrFaculty),
        classificationCode: code,
        status: p.status || String(item.status ?? 'READY_TO_REVIEW'),
        completenessStatus: p.completenessStatus || getString(item.completenessStatus),
        sectionCount: typeof pMetadata.contentBlockCount === 'number' ? pMetadata.contentBlockCount : (isDetailDossier ? 22 : undefined),
        sourceType: getString(pMetadata.sourceImportMode) || (isDetailDossier ? 'DETAIL_DOSSIER' : undefined),
        sourceFileName: getString(optionalFields.sourceFileName) ?? getString(metadata.sourceFileName),
        updatedAt: getString(item.updatedAt),
      };
    });
  }

  const classificationCode = getString(item.classificationCode) ?? getString(optionalFields.classificationCode);
  const isDetailDossier = getString(optionalFields.sourceClassificationSystem) === 'MANARATAK_PHASE_10_DETAIL_DOSSIER';

  return [{
    id: String(item.id ?? item.publicId ?? item.slug ?? ''),
    displayName: String(item.displayName ?? item.canonicalName ?? localizedNames.ar ?? localizedNames.en ?? 'تخصص بدون اسم'),
    nameAr: getString(localizedNames.ar),
    nameEn: getString(localizedNames.en),
    code: getString(item.classificationCode) ?? getString(optionalFields.classificationCode),
    degreeLevel: getString(item.degreeLevel) ?? getString(optionalFields.degreeLevel),
    catalogKind: getString(metadata.catalogKind),
    collegeOrField: getString(item.academicFieldOrDiscipline) ?? getString(item.collegeOrFaculty) ?? getString(optionalFields.collegeOrFaculty),
    academicFieldOrDiscipline: getString(item.academicFieldOrDiscipline) ?? getString(optionalFields.academicFieldOrDiscipline),
    collegeOrFaculty: getString(item.collegeOrFaculty) ?? getString(optionalFields.collegeOrFaculty),
    classificationCode,
    status: String(item.status ?? 'READY_TO_REVIEW'),
    completenessStatus: getString(item.completenessStatus),
    sectionCount: typeof metadata.contentBlockCount === 'number' ? metadata.contentBlockCount : (isDetailDossier ? 22 : undefined),
    sourceType: getString(metadata.sourceImportMode) || (isDetailDossier ? 'DETAIL_DOSSIER' : undefined),
    sourceFileName: getString(optionalFields.sourceFileName) ?? getString(metadata.sourceFileName),
    updatedAt: getString(item.updatedAt),
  }];
}

function statusLabel(status?: string): string {
  return statusOptions.find((option) => option.value === status)?.label ?? status ?? 'غير محدد';
}

function completenessLabel(status?: string): string {
  return completenessOptions.find((option) => option.value === status)?.label ?? status ?? 'غير محدد';
}

function degreeLabel(level?: string): string {
  return degreeOptions.find((option) => option.value === level)?.label ?? level ?? 'غير محدد';
}

function DetailBadge({ count, sourceType, hasDetails }: { count?: number; sourceType?: string; hasDetails?: boolean }) {
  const isDetailed = hasDetails || (count ?? 0) > 0 || sourceType === 'DETAIL_DOSSIER';
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${isDetailed ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
      {isDetailed ? 'لديه تفاصيل' : 'يحتاج تفاصيل'}
    </span>
  );
}

export function AdminMajorsPreviewPage() {
  const [searchParams] = useSearchParams();
  const adminSessionPresent = Boolean(localStorage.getItem('manaratak_access_token')) || import.meta.env.VITE_LOCAL_ADMIN_READ_ONLY === 'true';
  const [majors, setMajors] = useState<MajorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [degree, setDegree] = useState('');
  const [status, setStatus] = useState('');
  const [completeness, setCompleteness] = useState('');
  const [fieldFilter, setFieldFilter] = useState('');
  const [hasDetailsOnly, setHasDetailsOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMajors, setTotalMajors] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 50;

  useEffect(() => {
    setFieldFilter(searchParams.get('field') ?? '');
    const requestedDegree = searchParams.get('degree') ?? '';
    if (degreeOptions.some(option => option.value === requestedDegree)) setDegree(requestedDegree);
  }, [searchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, degree, status, completeness, fieldFilter, hasDetailsOnly]);

  useEffect(() => {
    if (!adminSessionPresent) return;

    let cancelled = false;
    async function loadMajors() {
      setLoading(true);
      setError(null);
      try {
        const response = await ApiClient.getAdminMajors({
          page: currentPage,
          pageSize: ITEMS_PER_PAGE,
          catalog: 'true',
          search: search.trim() || undefined,
          degreeLevel: degree || undefined,
          status: status || undefined,
          completenessStatus: completeness || undefined,
          academicFieldOrDiscipline: fieldFilter.trim() || undefined,
        });
        const rawItems = Array.isArray(response.data) ? response.data : [];

        const mergedList: MajorListItem[] = rawItems.map((item: any) => {
          const sectionCount = item.sectionCount ?? 0;
          const sourceType = item.sourceType ?? 'CATALOG_IDENTITY_ONLY';
          const hasDetails = Boolean(item.hasDbDetails) || sectionCount > 0 || sourceType === 'DETAIL_DOSSIER';
          const k = String(item.catalogKind || item.degreeLevel || '').toUpperCase();
          let normDegreeLevel = 'Bachelor';
          let normCatalogKind = 'BACHELOR';
          if (k === 'MASTER') { normDegreeLevel = 'Master'; normCatalogKind = 'MASTER'; }
          else if (k === 'DOCTORATE') { normDegreeLevel = 'Doctorate'; normCatalogKind = 'DOCTORATE'; }
          else if (k === 'FELLOWSHIP') { normDegreeLevel = 'Fellowship'; normCatalogKind = 'FELLOWSHIP'; }

          return {
            ...item,
            degreeLevel: normDegreeLevel,
            catalogKind: normCatalogKind,
            collegeOrField: item.collegeOrField || item.collegeOrFaculty || item.academicFieldOrDiscipline || '',
            classificationCode: item.code,
            sectionCount,
            sourceType,
            hasDetails,
          };
        });

        if (!cancelled) {
          setMajors(mergedList);
          setTotalMajors(response.total || 0);
          setTotalPages(Math.max(1, response.totalPages || 1));
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'تعذر الاتصال ببيانات التخصصات.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const timer = window.setTimeout(() => void loadMajors(), 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [adminSessionPresent, completeness, currentPage, degree, fieldFilter, search, status]);

  const filteredMajors = useMemo(() => {
    return hasDetailsOnly
      ? majors.filter((major) => major.hasDetails || (major.sectionCount ?? 0) > 0 || major.sourceType === 'DETAIL_DOSSIER')
      : majors;
  }, [hasDetailsOnly, majors]);

  const paginatedMajors = filteredMajors;

  const counts = useMemo(() => ({
    total: totalMajors,
    bachelor: majors.filter((m) => m.degreeLevel === 'Bachelor' || m.catalogKind === 'BACHELOR').length,
    master: majors.filter((m) => m.degreeLevel === 'Master' || m.catalogKind === 'MASTER').length,
    doctorate: majors.filter((m) => m.degreeLevel === 'Doctorate' || m.catalogKind === 'DOCTORATE').length,
    fellowship: majors.filter((m) => m.degreeLevel === 'Fellowship' || m.catalogKind === 'FELLOWSHIP').length,
    withDetails: majors.filter((m) => m.hasDetails || (m.sectionCount ?? 0) > 0 || m.sourceType === 'DETAIL_DOSSIER').length,
    incomplete: majors.filter((m) => m.completenessStatus === 'INCOMPLETE' || m.completenessStatus === 'NEEDS_REVIEW').length,
  }), [majors, totalMajors]);

  if (!adminSessionPresent) return <Navigate to="/login" replace />;

  return (
    <main dir="rtl" className="min-h-screen bg-[#f7f8fa] px-4 py-5 text-slate-900 sm:px-6 lg:px-10" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[12px] font-bold text-emerald-800">
              <CheckCircle2 className="h-4 w-4" />
              المرحلة 10: مساحة عمل التخصصات
            </p>
            <h1 className="mt-3 text-[26px] font-black leading-9 sm:text-[34px]">التخصصات الأكاديمية</h1>
            <p className="mt-1 max-w-3xl text-[13px] leading-7 text-slate-500">
              إدارة التخصصات حسب الدرجة، المجال، الكلية، المصدر، حالة النشر، واكتمال تفاصيل الملف.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link to="/admin/imports/majors" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-extrabold text-slate-800 shadow-sm hover:bg-slate-50">
              <UploadCloud className="h-4 w-4 text-blue-600" />
              مركز الاستيراد
            </Link>
            <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0f5d48] px-4 text-[13px] font-extrabold text-white shadow-sm hover:bg-[#0b4c3b]">
              <GraduationCap className="h-4 w-4" />
              إضافة تخصص
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-slate-200 bg-white p-3 text-[12px] text-slate-500">
            ملاحظة الاتصال: {error}
          </div>
        )}

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {[
            ['كل التخصصات', counts.total, 'all'],
            ['بكالوريوس', counts.bachelor, 'Bachelor'],
            ['ماجستير', counts.master, 'Master'],
            ['دكتوراه', counts.doctorate, 'Doctorate'],
            ['زمالة', counts.fellowship, 'Fellowship'],
            ['لديها تفاصيل', counts.withDetails, 'details'],
            ['تحتاج مراجعة', counts.incomplete, 'review'],
          ].map(([label, count, filter]) => {
            const isActive =
              (filter === 'details' && hasDetailsOnly) ||
              (filter === 'review' && completeness === 'NEEDS_REVIEW' && !hasDetailsOnly) ||
              (filter === 'all' && !degree && !hasDetailsOnly && !completeness) ||
              (degree === filter && !hasDetailsOnly);

            return (
              <button
                key={label}
                onClick={() => {
                  if (filter === 'details') {
                    setHasDetailsOnly(!hasDetailsOnly);
                    return;
                  }
                  setHasDetailsOnly(false);
                  if (filter === 'all') {
                    setDegree('');
                    setCompleteness('');
                    return;
                  }
                  if (filter === 'review') {
                    setDegree('');
                    setCompleteness('NEEDS_REVIEW');
                    return;
                  }
                  setDegree(typeof filter === 'string' ? filter : '');
                }}
                className={`min-h-20 rounded-2xl border p-3 text-right shadow-sm transition-all cursor-pointer ${
                  isActive
                    ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-emerald-300'
                }`}
              >
                <span className="block text-[12px] font-bold text-slate-500">{label}</span>
                <span className="mt-1 block text-2xl font-black text-slate-950">{count}</span>
              </button>
            );
          })}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-[13px] font-extrabold text-slate-700">
            <Filter className="h-4 w-4 text-emerald-700" />
            البحث والتصفية
          </div>
          <div className="grid gap-3 md:grid-cols-[1.3fr_1fr_170px_170px_190px]">
            <label className="relative block">
              <Search className="absolute right-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pr-10 pl-3 text-[13px] outline-none focus:border-emerald-500 focus:bg-white"
                placeholder="ابحث بالاسم، الرمز، الكلية أو الملف..."
              />
            </label>
            <input
              value={fieldFilter}
              onChange={(event) => setFieldFilter(event.target.value)}
              className="min-h-12 rounded-xl border border-slate-200 bg-slate-50 px-3 text-[13px] outline-none focus:border-emerald-500 focus:bg-white"
              placeholder="فلترة المجال أو الكلية"
            />
            <select value={degree} onChange={(event) => setDegree(event.target.value)} className="min-h-12 rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-bold">
              {degreeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="min-h-12 rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-bold">
              {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <select value={completeness} onChange={(event) => setCompleteness(event.target.value)} className="min-h-12 rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-bold">
              {completenessOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-60 flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="h-7 w-7 animate-spin text-emerald-700" />
              <span className="text-[13px] font-bold">جاري تحميل التخصصات...</span>
            </div>
          ) : filteredMajors.length === 0 ? (
            <div className="flex min-h-60 flex-col items-center justify-center gap-3 p-6 text-center">
              <BookOpen className="h-10 w-10 text-slate-300" />
              <p className="text-[14px] font-extrabold">لا توجد نتائج حسب الفلاتر الحالية.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-slate-100 p-4 text-[13px] font-bold text-slate-600">
                <span>عرض {((currentPage - 1) * ITEMS_PER_PAGE) + 1} إلى {Math.min(currentPage * ITEMS_PER_PAGE, filteredMajors.length)} من أصل {filteredMajors.length} تخصص</span>
                <span>الصفحة {currentPage} من {totalPages || 1}</span>
              </div>

              <div className="grid gap-3 p-3 lg:grid-cols-2">
                {paginatedMajors.map((major) => {
                  const template = getMajorDegreeTemplate(major.degreeLevel);
                  const detailsCount = major.sectionCount ?? 0;
                  return (
                    <article key={major.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-[11px] font-bold text-slate-700">{major.code ?? major.classificationCode ?? 'NO-CODE'}</span>
                            <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-extrabold text-emerald-800">{template.labelAr}</span>
                            <span className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-extrabold text-blue-800">{statusLabel(major.status)}</span>
                            <DetailBadge count={detailsCount} sourceType={major.sourceType} />
                          </div>
                          <h2 className="mt-3 text-[16px] font-black leading-7 text-slate-950">{major.displayName}</h2>
                          {major.nameEn && <p dir="ltr" className="mt-1 text-right text-[12px] font-semibold text-slate-500">{major.nameEn}</p>}
                        </div>
                        <Layers3 className="h-5 w-5 shrink-0 text-slate-300" />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-[12px]">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <span className="block font-bold text-slate-400">المجال/الكلية</span>
                          <span className="mt-1 block font-extrabold text-slate-800">{major.collegeOrField || major.collegeOrFaculty || major.academicFieldOrDiscipline || 'غير موثق في المصدر'}</span>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                          <span className="block font-bold text-slate-400">اكتمال البيانات</span>
                          <span className="mt-1 block font-extrabold text-slate-800">{completenessLabel(major.completenessStatus)}</span>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                          <span className="block font-bold text-slate-400">أقسام التفاصيل</span>
                          <span className="mt-1 block font-extrabold text-slate-800">{detailsCount > 0 ? `${detailsCount} قسم` : 'لا توجد تفاصيل'}</span>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                          <span className="block font-bold text-slate-400">قالب العرض</span>
                          <span className="mt-1 block font-extrabold text-slate-800">{degreeLabel(major.degreeLevel)}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 text-[12px] text-slate-500">
                        <Database className="h-4 w-4 text-slate-400" />
                        <span>آخر مصدر: <strong className="text-slate-700">{major.sourceFileName ?? major.sourceType ?? 'قاعدة البيانات'}</strong></span>
                      </div>

                      <Link to={`/admin/majors/${major.id}`} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0f172a] px-4 text-[13px] font-extrabold text-white hover:bg-[#111827]">
                        فتح التفاصيل
                        <ChevronLeft className="h-4 w-4" />
                      </Link>
                    </article>
                  );
                })}
              </div>

              {/* Pagination bar */}
              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-4">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage((prev) => Math.max(1, prev - 1));
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-extrabold text-slate-800 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    الصفحة السابقة
                  </button>

                  <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => {
                          setCurrentPage(pageNum);
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className={`h-9 w-9 rounded-xl text-[12px] font-extrabold cursor-pointer transition-colors ${
                          currentPage === pageNum
                            ? 'bg-emerald-800 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="inline-flex min-h-10 items-center justify-center rounded-xl bg-emerald-800 px-4 text-[13px] font-extrabold text-white hover:bg-emerald-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    الصفحة التالية
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
