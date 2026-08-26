import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../i18n/I18nProvider';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, PlusCircle, UploadCloud, FileSpreadsheet, AlertCircle, CheckCircle2, 
  ArchiveX, Loader2, Search, Filter, Edit3, Check, X, ShieldCheck, RefreshCw, ExternalLink,
  GraduationCap, Building2, Globe, Calendar, Layers
} from 'lucide-react';
import { ApiClient } from '../../api/client';
import { localScholarshipPreviewEnabled, previewScholarshipFixture } from './previewScholarshipFixture';

interface ScholarshipItem {
  id: string;
  publicId?: string;
  displayName: string;
  originalName?: string;
  status: string;
  completenessStatus: string;
  sponsorName?: string;
  degreeLevel?: string;
  fundingCoverage?: string;
  coverageDetails?: string;
  studyCountry?: string;
  applicationDeadline?: string;
  applicationLink?: string;
  officialSourceUrl?: string;
  eligibleMajorsOrFields?: string | string[];
  eligibilityCriteria?: string;
  requiredDocuments?: string;
  studyLanguage?: string;
  fundingAmount?: string;
  currency?: string;
  duration?: string;
  verificationStatus?: string;
  translationStatus?: string;
  sourceType?: string;
  updatedAt: string;
}

export function AdminScholarshipsPreviewPage() {
  const { t, dir } = useTranslation();
  const navigate = useNavigate();
  const adminSessionPresent = Boolean(localStorage.getItem('manaratak_access_token')) || import.meta.env.VITE_LOCAL_ADMIN_READ_ONLY === 'true';
  const isArabic = dir === 'rtl';
  const ui = (key: string, arabic: string, english: string) => {
    const translated = t(key as any);
    return translated && translated !== key ? translated : (isArabic ? arabic : english);
  };

  const [scholarships, setScholarships] = useState<ScholarshipItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters (10 filter fields requested)
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [completenessFilter, setCompletenessFilter] = useState<string>('');
  const [countryFilter, setCountryFilter] = useState<string>('');
  const [degreeFilter, setDegreeFilter] = useState<string>('');
  const [fundingFilter, setFundingFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [verificationFilter, setVerificationFilter] = useState<string>('');
  const [translationFilter, setTranslationFilter] = useState<string>('');
  const [deadlineFilter, setDeadlineFilter] = useState<string>('');
  const [originFilter, setOriginFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Status counts (8 dashboard counters)
  const [counts, setCounts] = useState({
    all: 0,
    imported: 0,
    missingFields: 0,
    needsVerification: 0,
    needsTranslation: 0,
    readyToPublish: 0,
    published: 0,
    archived: 0,
  });

  // Modal State for Add Scholarship
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    displayName: '',
    sponsorName: '',
    degreeLevel: 'Bachelor',
    fundingCoverage: 'Fully Funded',
    coverageDetails: '',
    studyCountry: '',
    applicationDeadline: '',
    applicationLink: '',
    officialSourceUrl: '',
    eligibleMajorsOrFields: '',
    eligibilityCriteria: '',
    requiredDocuments: '',
    studyLanguage: 'English',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: Parameters<typeof ApiClient.getAdminScholarships>[0] = { page, pageSize: 20 };
      if (statusFilter) filters.status = statusFilter;
      if (completenessFilter) filters.completenessStatus = completenessFilter.toUpperCase();
      if (countryFilter) filters.country = countryFilter;
      if (degreeFilter) filters.degreeLevel = degreeFilter;
      if (fundingFilter) filters.fundingCoverage = fundingFilter;
      if (sourceFilter) filters.sponsorName = sourceFilter;
      if (verificationFilter) filters.verificationStatus = verificationFilter;
      if (translationFilter) filters.translationState = translationFilter as 'NEEDS_TRANSLATION' | 'TRANSLATED';
      if (deadlineFilter) filters.deadlineTo = new Date(`${deadlineFilter}T23:59:59.999Z`).toISOString();
      if (originFilter) filters.sourceType = originFilter;
      if (searchQuery.trim()) filters.query = searchQuery.trim();

      const res = await ApiClient.getAdminScholarships(filters);
      let items: ScholarshipItem[] = res.data || [];
      if (localScholarshipPreviewEnabled() && !items.some(item => item.id === previewScholarshipFixture.id)) {
        items = [previewScholarshipFixture, ...items];
      }

      setScholarships(items);
      setTotal(res.total);
      setTotalPages(res.totalPages || 1);

      fetchCounts();
    } catch (err: any) {
      if (localScholarshipPreviewEnabled()) {
        setScholarships([previewScholarshipFixture]);
        setTotal(1);
        setTotalPages(1);
        setCounts({ all: 1, imported: 1, missingFields: 0, needsVerification: 0, needsTranslation: 0, readyToPublish: 0, published: 0, archived: 0 });
        return;
      }
      setError(isArabic
        ? 'تعذر تحميل بيانات المنح حاليًا. ستظهر السجلات بعد اتصال لوحة الإدارة بقاعدة البيانات.'
        : (err.message || 'Failed to load scholarships'));
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      setCounts(await ApiClient.getAdminScholarshipSummary());
    } catch (e) {
      if (localScholarshipPreviewEnabled()) {
        setCounts({ all: 1, imported: 1, missingFields: 0, needsVerification: 0, needsTranslation: 0, readyToPublish: 0, published: 0, archived: 0 });
      }
    }
  };

  useEffect(() => {
    if (!adminSessionPresent) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, completenessFilter, countryFilter, degreeFilter, fundingFilter, sourceFilter, verificationFilter, translationFilter, deadlineFilter, originFilter, searchQuery, adminSessionPresent]);

  if (!adminSessionPresent) {
    return <Navigate to="/login" replace />;
  }

  const handleCreateScholarship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName.trim() || !formData.sponsorName.trim()) {
      setFormError('Scholarship title and sponsor name are required.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await ApiClient.createAdminScholarship({
        ...formData,
        status: 'READY_TO_REVIEW',
        completenessStatus: 'complete'
      });
      setSuccessMsg(isArabic ? 'تمت إضافة المنحة إلى مساحة المراجعة بنجاح.' : 'Scholarship successfully created and added to review workspace.');
      setShowAddModal(false);
      setFormData({
        displayName: '',
        sponsorName: '',
        degreeLevel: 'Bachelor',
        fundingCoverage: 'Fully Funded',
        coverageDetails: '',
        studyCountry: '',
        applicationDeadline: '',
        applicationLink: '',
        officialSourceUrl: '',
        eligibleMajorsOrFields: '',
        eligibilityCriteria: '',
        requiredDocuments: '',
        studyLanguage: 'English',
      });
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create scholarship');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main dir={dir} className="min-h-screen bg-[#f8fafc] px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
      {/* Header & Primary Actions */}
      <header className="flex flex-col gap-5 rounded-3xl bg-gradient-to-r from-[#0F4B3A] via-[#155e49] to-[#0a382b] p-6 text-white shadow-xl sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex w-fit items-center gap-2 text-xs font-bold text-emerald-300 sm:text-sm">
            <ShieldCheck className="h-4 w-4" />
            <span>{ui('phase_23_admin_workspace', 'مساحة إدارة المنح الدراسية', 'Scholarship administration workspace')}</span>
          </div>
          <h1 className="text-2xl font-black sm:text-4xl">{ui('scholarships_admin_title', 'إدارة المنح الدراسية', 'Scholarship Management')}</h1>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-emerald-100/90">
            {ui('scholarships_admin_desc', 'إدارة بيانات المنح ومراجعة الاكتمال والتحقق ودورة النشر.', 'Manage scholarship data, completeness, verification, and publication lifecycle.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[120px] rounded-2xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur-md">
            <span className="block text-2xl font-black text-amber-300 sm:text-3xl">{total}</span>
            <span className="text-[11px] font-bold text-emerald-100">{ui('all_scholarships', 'إجمالي المنح', 'All Scholarships')}</span>
          </div>
          {/* Rule 4: Import button routes to /admin/imports/scholarships */}
          <Link
            to="/admin/imports/scholarships"
            className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 text-xs font-bold text-white transition-all hover:bg-white/20"
          >
            <UploadCloud className="h-4 w-4" />
            <span>{ui('scholarship_import_center', 'مركز استيراد المنح', 'Scholarship Import Center')}</span>
          </Link>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-white px-4 text-xs font-bold text-[#0F4B3A] shadow-sm transition-all hover:bg-emerald-50"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{ui('add_scholarship', 'إضافة منحة', 'Add Scholarship')}</span>
          </button>
        </div>
      </header>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900"><X className="w-4 h-4" /></button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-700 hover:text-rose-900"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* TOP STATISTICS (8 COUNTERS) */}
      <section className="grid grid-cols-2 gap-3 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm md:grid-cols-4">
        {[
          { label: ui('all_scholarships', 'جميع المنح', 'All Scholarships'), count: counts.all, filter: '', color: 'border-emerald-800 bg-white text-slate-900 shadow-sm' },
          { label: ui('imported_awaiting_review', 'بانتظار المراجعة', 'Imported / Review'), count: counts.imported, filter: 'IMPORTED', color: 'border-blue-200 bg-blue-50/30 text-blue-900 shadow-sm' },
          { label: ui('missing_required_fields', 'حقول مطلوبة ناقصة', 'Missing Fields'), count: counts.missingFields, filter: 'INCOMPLETE', color: 'border-amber-200 bg-amber-50/30 text-amber-900 shadow-sm' },
          { label: ui('needs_source_verification', 'تحتاج تحققًا من المصدر', 'Needs Verification'), count: counts.needsVerification, filter: '', color: 'border-indigo-200 bg-indigo-50/30 text-indigo-900 shadow-sm' },
          { label: ui('needs_translation', 'تحتاج ترجمة', 'Needs Translation'), count: counts.needsTranslation, filter: '', color: 'border-violet-200 bg-violet-50/30 text-violet-900 shadow-sm' },
          { label: ui('ready_to_publish', 'جاهزة للنشر', 'Ready to Publish'), count: counts.readyToPublish, filter: 'READY_TO_PUBLISH', color: 'border-cyan-200 bg-cyan-50/30 text-cyan-900 shadow-sm' },
          { label: ui('published', 'منشورة', 'Published'), count: counts.published, filter: 'PUBLISHED', color: 'border-emerald-200 bg-emerald-50/30 text-emerald-900 shadow-sm' },
          { label: ui('archived', 'مؤرشفة', 'Archived'), count: counts.archived, filter: 'ARCHIVED', color: 'border-slate-200 bg-slate-50 text-slate-700 shadow-sm' },
        ].map((stat, idx) => (
          <button
            type="button"
            key={idx} 
            onClick={() => setStatusFilter(stat.filter)}
            className={`flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border p-3 text-center transition-all hover:shadow-sm ${stat.color} ${statusFilter === stat.filter ? 'ring-2 ring-[#0F4B3A] ring-offset-1' : ''}`}
          >
            <span className="block text-xs font-bold leading-5 opacity-80">{stat.label}</span>
            <span className="mt-1 block text-2xl font-black">{stat.count}</span>
          </button>
        ))}
      </section>

      {/* FILTER BAR (10 FILTER TYPES) */}
      <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-700">
            <Filter className="w-4 h-4 text-emerald-700" />
            <span>{ui('advanced_filters', 'تصفية المنح الدراسية', 'Scholarship Filters')}</span>
          </div>
          {(statusFilter || completenessFilter || countryFilter || degreeFilter || fundingFilter || sourceFilter || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('');
                setCompletenessFilter('');
                setCountryFilter('');
                setDegreeFilter('');
                setFundingFilter('');
                setSourceFilter('');
                setSearchQuery('');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline"
            >
              {ui('clear_all_filters', 'مسح جميع الفلاتر', 'Clear all filters')}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder={ui('search_scholarships_placeholder', 'ابحث باسم المنحة أو الجهة الراعية أو الدولة', 'Search name, sponsor, or country')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 outline-none transition-colors hover:bg-white focus:border-[#0F4B3A] focus:ring-2 focus:ring-emerald-100 rtl:pl-3 rtl:pr-9"
            />
          </div>

          {/* Lifecycle Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-slate-700 outline-none transition-colors hover:bg-white focus:border-[#0F4B3A] focus:ring-2 focus:ring-emerald-100"
          >
            <option value="">جميع حالات دورة النشر</option>
            <option value="IMPORTED">مستوردة</option>
            <option value="READY_TO_REVIEW">جاهزة للمراجعة</option>
            <option value="READY_TO_PUBLISH">جاهزة للنشر</option>
            <option value="PUBLISHED">منشورة</option>
            <option value="ARCHIVED">مؤرشفة</option>
          </select>

          {/* Completeness Status Filter */}
          <select
            value={completenessFilter}
            onChange={(e) => setCompletenessFilter(e.target.value)}
            className="min-h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-slate-700 outline-none transition-colors hover:bg-white focus:border-[#0F4B3A] focus:ring-2 focus:ring-emerald-100"
          >
            <option value="">جميع حالات الاكتمال</option>
            <option value="complete">مكتملة</option>
            <option value="incomplete">غير مكتملة أو بها حقول ناقصة</option>
          </select>

          {/* Academic Degree Filter */}
          <select
            value={degreeFilter}
            onChange={(e) => setDegreeFilter(e.target.value)}
            className="min-h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-slate-700 outline-none transition-colors hover:bg-white focus:border-[#0F4B3A] focus:ring-2 focus:ring-emerald-100"
          >
            <option value="">جميع الدرجات العلمية</option>
            <option value="Bachelor">البكالوريوس</option>
            <option value="Master">الماجستير</option>
            <option value="PhD">الدكتوراه</option>
            <option value="Diploma">الدبلوم</option>
          </select>

          {/* Funding Coverage Filter */}
          <select
            value={fundingFilter}
            onChange={(e) => setFundingFilter(e.target.value)}
            className="min-h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-slate-700 outline-none transition-colors hover:bg-white focus:border-[#0F4B3A] focus:ring-2 focus:ring-emerald-100"
          >
            <option value="">جميع أنواع التمويل</option>
            <option value="Fully Funded">تمويل كامل</option>
            <option value="Partial Coverage">تمويل جزئي</option>
            <option value="Tuition Waiver">إعفاء من الرسوم</option>
          </select>
        </div>
      </div>

      {/* SCHOLARSHIPS VERTICAL LIST / TABLE LAYOUT (Rule 1) */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {loading ? (
          <div className="p-16 text-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
            <p className="text-sm font-medium">جاري تحميل بيانات المنح...</p>
          </div>
        ) : scholarships.length === 0 ? (
          /* Rule 10: Scholarship list empty state */
          <div className="p-16 text-center text-slate-500 space-y-4">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">لا توجد منح دراسية</h3>
              <p className="mt-1 text-sm text-slate-500">يمكن إضافة منحة جديدة أو استيراد مجموعة من مصدر موثوق.</p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                إضافة منحة
              </button>
              <Link
                to="/admin/imports/scholarships"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition-all"
              >
                فتح مركز استيراد المنح
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-right text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-sm font-bold text-slate-600">
                  <th className="p-4">اسم المنحة والجهة الراعية</th>
                  <th className="p-4">الدرجة والتمويل</th>
                  <th className="p-4">الدولة والموعد النهائي</th>
                  <th className="p-4">حالة الاكتمال</th>
                  <th className="p-4">حالة النشر</th>
                  <th className="p-4 text-left">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scholarships.map((sch) => (
                  <tr key={sch.id} className="hover:bg-emerald-50/10 transition-colors">
                    {/* Cleaned Name & Sponsor */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 text-sm">{sch.displayName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{sch.sponsorName || 'جهة راعية غير محددة'}</span>
                      </div>
                    </td>

                    {/* Degree & Funding */}
                    <td className="p-3.5">
                      <div className="font-medium text-slate-800">{sch.degreeLevel || 'Bachelor'}</div>
                      <span className="inline-block mt-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        {sch.fundingCoverage || 'Fully Funded'}
                      </span>
                    </td>

                    {/* Country & Deadline */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1 text-slate-800 font-medium">
                        <Globe className="w-3 h-3 text-slate-400" />
                        <span>{sch.studyCountry || 'Global'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{sch.applicationDeadline || 'Rolling'}</span>
                      </div>
                    </td>

                    {/* Completeness Status */}
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sch.completenessStatus === 'complete' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {sch.completenessStatus === 'complete' ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        <span>{sch.completenessStatus === 'complete' ? 'مكتملة' : 'تحتاج مراجعة'}</span>
                      </span>
                    </td>

                    {/* Lifecycle Status */}
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${
                        sch.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        sch.status === 'READY_TO_PUBLISH' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        sch.status === 'ARCHIVED' ? 'bg-slate-200 text-slate-700' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {sch.status}
                      </span>
                    </td>

                    {/* Quick Action: View Details (Rule 5 & 6) */}
                    <td className="p-3.5 text-right">
                      <Link
                        to={`/admin/scholarships/${sch.id}`}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all inline-flex items-center gap-1"
                      >
                        <span>عرض التفاصيل</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ADD SCHOLARSHIP MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span>إضافة منحة دراسية جديدة</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateScholarship} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">اسم المنحة *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Qatar University Scholarship 2027"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الجهة الراعية أو المانحة *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Qatar University"
                    value={formData.sponsorName}
                    onChange={(e) => setFormData({ ...formData, sponsorName: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">الدرجة العلمية</label>
                  <select
                    value={formData.degreeLevel}
                    onChange={(e) => setFormData({ ...formData, degreeLevel: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Bachelor">البكالوريوس</option>
                    <option value="Master">الماجستير</option>
                    <option value="PhD">الدكتوراه</option>
                    <option value="Diploma">الدبلوم</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">نوع التمويل</label>
                  <select
                    value={formData.fundingCoverage}
                    onChange={(e) => setFormData({ ...formData, fundingCoverage: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Fully Funded">تمويل كامل</option>
                    <option value="Partial Coverage">تمويل جزئي</option>
                    <option value="Tuition Waiver">إعفاء من الرسوم</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">دولة الدراسة</label>
                  <input
                    type="text"
                    placeholder="e.g. Qatar, Saudi Arabia"
                    value={formData.studyCountry}
                    onChange={(e) => setFormData({ ...formData, studyCountry: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">آخر موعد للتقديم</label>
                  <input
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رابط التقديم</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.applicationLink}
                    onChange={(e) => setFormData({ ...formData, applicationLink: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">التخصصات والمجالات المؤهلة</label>
                <input
                  type="text"
                  placeholder="Engineering, Computer Science, Business"
                  value={formData.eligibleMajorsOrFields}
                  onChange={(e) => setFormData({ ...formData, eligibleMajorsOrFields: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">مزايا المنحة وتفاصيل التغطية</label>
                <textarea
                  rows={3}
                  placeholder="Full tuition waiver, monthly allowance, housing..."
                  value={formData.coverageDetails}
                  onChange={(e) => setFormData({ ...formData, coverageDetails: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all inline-flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>حفظ المنحة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </main>
  );
}
