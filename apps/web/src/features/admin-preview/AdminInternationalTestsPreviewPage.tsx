import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../i18n/I18nProvider';
import { Link, Navigate } from 'react-router-dom';
import { 
  PlusCircle, UploadCloud, AlertCircle, Loader2, Search, Filter, 
  ShieldCheck, FileCheck2, X, Globe, DollarSign, Clock, Compass
} from 'lucide-react';
import { ApiClient } from '../../api/client';

interface TestItem {
  id: string;
  slug?: string;
  displayName: string;
  canonicalName?: string;
  nameAr?: string;
  nameEn?: string;
  provider?: string;
  providerName?: string;
  testCategory?: string;
  sourceImportRecordId?: string;
  createdAt?: string;
  category?: string;
  minScoreRange?: string;
  validityDuration?: string;
  approxFee?: string;
  centersCount?: number;
  countriesCount?: number;
  status: string;
  completenessStatus?: string;
  verificationStatus?: string;
  updatedAt?: string;
}

interface AdminInternationalTestFilters {
  page: number;
  pageSize: number;
  status?: string;
  testCategory?: string;
}

interface PaginatedAdminInternationalTests {
  data?: TestItem[];
  total?: number;
}

const categoryMap: Record<string, string> = {
  // 1. ENGLISH_LANGUAGE (12)
  'ielts-academic': 'ENGLISH_LANGUAGE',
  'toefl-ibt': 'ENGLISH_LANGUAGE',
  'duolingo-english-test': 'ENGLISH_LANGUAGE',
  'pte-academic': 'ENGLISH_LANGUAGE',
  'cambridge-english-qualifications': 'ENGLISH_LANGUAGE',
  'ote-english': 'ENGLISH_LANGUAGE',
  'met-english': 'ENGLISH_LANGUAGE',
  'linguaskill': 'ENGLISH_LANGUAGE',
  'oet-english': 'ENGLISH_LANGUAGE',
  'itep-academic': 'ENGLISH_LANGUAGE',
  'languagecert-academic': 'ENGLISH_LANGUAGE',
  'toeic-english': 'ENGLISH_LANGUAGE',

  // 2. NON_ENGLISH_LANGUAGE (13)
  'dele-spanish': 'NON_ENGLISH_LANGUAGE',
  'delf-dalf-french': 'NON_ENGLISH_LANGUAGE',
  'testdaf-german': 'NON_ENGLISH_LANGUAGE',
  'hsk-chinese': 'NON_ENGLISH_LANGUAGE',
  'jlpt-japanese': 'NON_ENGLISH_LANGUAGE',
  'topik-korean': 'NON_ENGLISH_LANGUAGE',
  'cils-italian': 'NON_ENGLISH_LANGUAGE',
  'celpe-bras-portuguese': 'NON_ENGLISH_LANGUAGE',
  'torfl-russian': 'NON_ENGLISH_LANGUAGE',
  'tomer-turkish': 'NON_ENGLISH_LANGUAGE',
  'nt2-dutch': 'NON_ENGLISH_LANGUAGE',
  'polish-state-cert': 'NON_ENGLISH_LANGUAGE',
  'ukbi-indonesian': 'NON_ENGLISH_LANGUAGE',

  // 3. GENERAL_UNDERGRADUATE_ADMISSION (4)
  'test-sat-digital': 'GENERAL_UNDERGRADUATE_ADMISSION',
  'test-act-exam': 'GENERAL_UNDERGRADUATE_ADMISSION',
  'test-ap-exams': 'GENERAL_UNDERGRADUATE_ADMISSION',
  'test-clt-exam': 'GENERAL_UNDERGRADUATE_ADMISSION',

  // 4. GRADUATE_ADMISSION (2)
  'test-gre-general': 'GRADUATE_ADMISSION',
  'test-gmat-focus': 'GRADUATE_ADMISSION',

  // 5. NATIONAL_INTERNATIONAL_ADMISSION (11)
  'test-alevel-uk': 'NATIONAL_INTERNATIONAL_ADMISSION',
  'test-abitur-germany': 'NATIONAL_INTERNATIONAL_ADMISSION',
  'test-matura-poland': 'NATIONAL_INTERNATIONAL_ADMISSION',
  'test-gaokao-china': 'NATIONAL_INTERNATIONAL_ADMISSION',
  'test-csca-china': 'NATIONAL_INTERNATIONAL_ADMISSION',
  'test-ib-diploma': 'NATIONAL_INTERNATIONAL_ADMISSION',
  'test-yks-turkey': 'NATIONAL_INTERNATIONAL_ADMISSION',
  'test-yos-turkey': 'NATIONAL_INTERNATIONAL_ADMISSION',
  'test-csat-korea': 'NATIONAL_INTERNATIONAL_ADMISSION',
  'test-eju-japan': 'NATIONAL_INTERNATIONAL_ADMISSION',
  'test-cuet-india': 'NATIONAL_INTERNATIONAL_ADMISSION',

  // 6. SPECIALIZED_ADMISSION (10)
  'test-ucat-med': 'SPECIALIZED_ADMISSION',
  'test-mcat-med': 'SPECIALIZED_ADMISSION',
  'test-gamsat-med': 'SPECIALIZED_ADMISSION',
  'test-imat-italy': 'SPECIALIZED_ADMISSION',
  'test-dat-dental': 'SPECIALIZED_ADMISSION',
  'test-jee-main': 'SPECIALIZED_ADMISSION',
  'test-jee-advanced': 'SPECIALIZED_ADMISSION',
  'test-neet-ug': 'SPECIALIZED_ADMISSION',
  'test-lnat-law': 'SPECIALIZED_ADMISSION',
  'test-lsat-law': 'SPECIALIZED_ADMISSION',

  // 7. PROFESSIONAL_LICENSING_CERTIFICATION (4)
  'test-cpa-us': 'PROFESSIONAL_LICENSING_CERTIFICATION',
  'test-plab-uk': 'PROFESSIONAL_LICENSING_CERTIFICATION',
  'test-pmp-pm': 'PROFESSIONAL_LICENSING_CERTIFICATION',
  'test-usmle-med': 'PROFESSIONAL_LICENSING_CERTIFICATION',

  // Legacy (3)
  'test-bmat-med': 'SPECIALIZED_ADMISSION',
  'test-csca-finance': 'PROFESSIONAL_LICENSING_CERTIFICATION',
  'test-cambridge-intl': 'NATIONAL_INTERNATIONAL_ADMISSION',
};

const testGroups = [
  { key: '', labelAr: 'جميع الاختبارات النشطة (56)', labelEn: 'All Active Tests (56)' },
  { key: 'ENGLISH_LANGUAGE', labelAr: 'اختبارات اللغة الإنجليزية', labelEn: 'English Language Tests' },
  { key: 'NON_ENGLISH_LANGUAGE', labelAr: 'اختبارات اللغات الأخرى', labelEn: 'Non-English Language Tests' },
  { key: 'GENERAL_UNDERGRADUATE_ADMISSION', labelAr: 'اختبارات القبول الجامعي العام', labelEn: 'General Undergraduate Admission Tests' },
  { key: 'GRADUATE_ADMISSION', labelAr: 'اختبارات الدراسات العليا', labelEn: 'Graduate Admission Tests' },
  { key: 'NATIONAL_INTERNATIONAL_ADMISSION', labelAr: 'اختبارات القبول والمؤهلات الوطنية والدولية', labelEn: 'National / International Admission Tests & Qualifications' },
  { key: 'SPECIALIZED_ADMISSION', labelAr: 'اختبارات القبول التخصصي', labelEn: 'Specialized Admission Tests' },
  { key: 'PROFESSIONAL_LICENSING_CERTIFICATION', labelAr: 'اختبارات التراخيص والشهادات المهنية', labelEn: 'Professional Licensing & Certification Tests' },
];

function resolveTestGroup(test: TestItem): string {
  if (test.testCategory && categoryMap[test.testCategory]) {
    return test.testCategory;
  }
  const idMatch = categoryMap[test.id] || (test.slug ? categoryMap[test.slug] : undefined);
  if (idMatch) return idMatch;
  return test.testCategory || 'OTHER';
}

function groupLabel(groupKey: string): string {
  const found = testGroups.find((g) => g.key === groupKey);
  if (found) return found.labelAr;
  if (groupKey === 'ENGLISH_LANGUAGE') return 'اختبارات اللغة الإنجليزية';
  if (groupKey === 'NON_ENGLISH_LANGUAGE') return 'اختبارات اللغات الأخرى';
  if (groupKey === 'GENERAL_UNDERGRADUATE_ADMISSION') return 'اختبارات القبول الجامعي العام';
  if (groupKey === 'GRADUATE_ADMISSION') return 'اختبارات الدراسات العليا';
  if (groupKey === 'NATIONAL_INTERNATIONAL_ADMISSION') return 'اختبارات القبول والمؤهلات الوطنية والدولية';
  if (groupKey === 'SPECIALIZED_ADMISSION') return 'اختبارات القبول التخصصي';
  if (groupKey === 'PROFESSIONAL_LICENSING_CERTIFICATION') return 'اختبارات التراخيص والشهادات المهنية';
  return 'أخرى';
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    IMPORTED: 'مستورد',
    READY_TO_REVIEW: 'بانتظار المراجعة',
    READY_TO_PUBLISH: 'جاهز للنشر',
    PUBLISHED: 'منشور',
    ARCHIVED: 'مؤرشف'
  };
  return labels[status] ?? status;
}

export function AdminInternationalTestsPreviewPage() {
  const { t } = useTranslation();
  const adminSessionPresent = Boolean(localStorage.getItem('manaratak_access_token')) || import.meta.env.VITE_LOCAL_ADMIN_READ_ONLY === 'true';

  const [tests, setTests] = useState<TestItem[]>([]);
  const [allTests, setAllTests] = useState<TestItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  // Status Counters based on database state
  const [counts, setCounts] = useState({
    all: 0,
    activeCatalog: 0,
    published: 0,
    readyToPublish: 0,
    readyToReview: 0,
    archived: 0,
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: AdminInternationalTestFilters = { page: 1, pageSize: 200 };
      let res: PaginatedAdminInternationalTests = { data: [] };
      
      try {
        res = await ApiClient.getAdminInternationalTests(filters);
      } catch (fErr) {
        console.warn('Backend tests API unavailable:', fErr);
      }

      const rawItems: TestItem[] = res?.data || [];
      setAllTests(rawItems);

      // Database stats across all 59 records
      const totalDb = rawItems.length;
      const activeTarget = rawItems.filter(i => i.status !== 'ARCHIVED');
      const archivedLegacy = rawItems.filter(i => i.status === 'ARCHIVED');

      setCounts({
        all: totalDb,
        activeCatalog: activeTarget.length,
        published: rawItems.filter(i => i.status === 'PUBLISHED').length,
        readyToPublish: rawItems.filter(i => i.status === 'READY_TO_PUBLISH').length,
        readyToReview: rawItems.filter(i => i.status === 'READY_TO_REVIEW' || i.status === 'IMPORTED').length,
        archived: archivedLegacy.length,
      });

      // Filter dataset by status
      let baseItems = rawItems;
      if (!statusFilter) {
        baseItems = activeTarget;
      } else if (statusFilter === 'ARCHIVED') {
        baseItems = archivedLegacy;
      } else if (statusFilter !== 'ALL') {
        baseItems = rawItems.filter(i => i.status === statusFilter);
      }

      // Filter dataset by category
      if (categoryFilter) {
        baseItems = baseItems.filter(i => resolveTestGroup(i) === categoryFilter);
      }

      // Filter dataset by search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        baseItems = baseItems.filter(item => 
          (item.displayName && item.displayName.toLowerCase().includes(q)) ||
          (item.provider && item.provider.toLowerCase().includes(q)) ||
          (item.providerName && item.providerName.toLowerCase().includes(q)) ||
          (item.category && item.category.toLowerCase().includes(q)) ||
          (item.id && item.id.toLowerCase().includes(q)) ||
          (item.slug && item.slug.toLowerCase().includes(q))
        );
      }

      setTests(baseItems);
      setTotal(baseItems.length);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load international tests';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!adminSessionPresent) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, categoryFilter, searchQuery, adminSessionPresent]);

  if (!adminSessionPresent) {
    return <Navigate to="/login" replace />;
  }

  const activeTests = allTests.filter(t => t.status !== 'ARCHIVED');
  const groupSummary = testGroups.map((group) => ({
    ...group,
    count: group.key 
      ? activeTests.filter((test) => resolveTestGroup(test) === group.key).length 
      : activeTests.length
  }));

  return (
    <main dir="rtl" className="min-h-screen bg-[#f8fafc] px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* TOP HEADER BANNER */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between rounded-3xl bg-gradient-to-r from-[#0F4B3A] via-[#155e49] to-[#0a382b] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 text-emerald-300 text-xs sm:text-sm font-bold mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>بوابة منارَتك</span>
              <span className="opacity-40">•</span>
              <span>الاختبارات الدولية المعيارية</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              الاختبارات الدولية والمعيارية
            </h1>
            <p className="mt-2 text-sm text-emerald-100/90 max-w-2xl leading-relaxed font-medium">
              دليل مرجعي وإداري متكامل للاختبارات المعيارية واللغوية للقبول الجامعي، التخصصي، والترخيص المهني.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 text-center min-w-[120px]">
              <span className="block text-2xl sm:text-3xl font-black text-amber-300">{activeTests.length}</span>
              <span className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider">
                اختبار معتمد
              </span>
            </div>

            <Link
              to="/admin/imports/international-tests"
              className="min-h-12 px-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <UploadCloud className="w-4 h-4 text-emerald-200" />
              <span>فتح مركز استيراد الاختبارات</span>
            </Link>

            <button
              className="min-h-12 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة اختبار</span>
            </button>
          </div>
        </div>

        {/* ERROR ALERT */}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs sm:text-sm font-bold text-rose-800 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-rose-700 hover:text-rose-900 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* TOP STATISTICS (REAL DB COUNTERS) */}
        <section className="space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'إجمالي السجلات بالنظام', count: counts.all, filter: 'ALL' },
              { label: 'الكتالوج النشط المعتمد', count: counts.activeCatalog, filter: '' },
              { label: 'منشور', count: counts.published, filter: 'PUBLISHED' },
              { label: 'جاهز للنشر', count: counts.readyToPublish, filter: 'READY_TO_PUBLISH' },
              { label: 'بانتظار المراجعة', count: counts.readyToReview, filter: 'READY_TO_REVIEW' },
              { label: 'الأرشيف القديم', count: counts.archived, filter: 'ARCHIVED' },
            ].map((stat, idx) => {
              const isSelected = statusFilter === stat.filter;
              return (
                <button
                  key={idx}
                  onClick={() => setStatusFilter(stat.filter)}
                  className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#0F4B3A] text-white border-[#0F4B3A] shadow-md shadow-emerald-900/10 ring-2 ring-[#0F4B3A]'
                      : 'bg-white text-slate-900 border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/20 shadow-xs'
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wider block truncate ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                    {stat.label}
                  </span>
                  <span className={`text-2xl font-black mt-2 block ${isSelected ? 'text-amber-300' : 'text-slate-900'}`}>
                    {stat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* CATEGORY FILTER BUTTONS BAR (7 CANONICAL CATEGORIES) */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-700">
              <Compass className="w-4.5 h-4.5 text-emerald-700" />
              <span>التصنيف حسب نوع الاختبار (7 تصنيفات معتمدة)</span>
            </div>
            <span className="text-xs font-bold text-slate-400">
              يعرض {tests.length} من {total} اختبار
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {groupSummary.map((group) => {
              const active = categoryFilter === group.key;
              return (
                <button
                  key={group.key || 'all'}
                  onClick={() => setCategoryFilter(group.key)}
                  className={`min-h-11 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2.5 whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-[#0F4B3A] text-white shadow-md shadow-emerald-900/10'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                  }`}
                >
                  <Globe className={`w-4 h-4 ${active ? 'text-emerald-300' : 'text-emerald-700'}`} />
                  <span>{group.labelAr}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      active ? 'bg-amber-400 text-slate-950' : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {group.count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* SEARCH AND FILTERS */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="ابحث باسم الاختبار أو الجهة المنظمة أو رمز الاختبار..."
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 pr-10 pl-4 text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all"
              dir="rtl"
            />
          </div>

          <button
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('');
              setStatusFilter('');
            }}
            className="min-h-11 px-4 rounded-xl border border-slate-200/80 text-xs font-bold text-slate-700 hover:bg-slate-50 inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Filter className="w-4 h-4 text-slate-400" />
            <span>مسح التصفية</span>
          </button>
        </section>

        {/* DATA TABLE SECTION */}
        <section className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[#0F4B3A]" />
              <p className="text-xs font-bold">جاري التحميل...</p>
            </div>
          ) : tests.length === 0 ? (
            <div className="p-16 text-center text-slate-500 space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-[#0F4B3A] rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                <FileCheck2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">لم يتم العثور على اختبارات دولية</h3>
                <p className="text-xs text-slate-500 mt-1">يمكنك إضافة سجل جديد أو استيراد دفعة اختبارات معتمدة.</p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button className="px-4 py-2 bg-[#0F4B3A] hover:bg-[#0b382b] text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer">
                  إضافة اختبار
                </button>
                <Link
                  to="/admin/imports/international-tests"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition-all"
                >
                  فتح مركز استيراد الاختبارات
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200/80 text-slate-600 font-extrabold text-xs tracking-wider uppercase">
                    <th className="p-4.5 text-right">اسم الاختبار</th>
                    <th className="p-4.5 text-right">الجهة المنظمة / المالكة</th>
                    <th className="p-4.5 text-right">نوع التصنيف</th>
                    <th className="p-4.5 text-right">مدة صلاحية النتيجة</th>
                    <th className="p-4.5 text-right">الرسوم التقريبية والعملة</th>
                    <th className="p-4.5 text-right">حالة السجل</th>
                    <th className="p-4.5 text-left">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/90">
                  {tests.map((test) => (
                    <tr key={test.id} className="hover:bg-emerald-50/20 transition-all">
                      {/* Name */}
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900 text-sm">{test.displayName}</div>
                        {test.canonicalName && test.canonicalName !== test.displayName && (
                          <div className="text-xs text-slate-500 font-medium mt-0.5">{test.canonicalName}</div>
                        )}
                        {test.sourceImportRecordId && (
                          <div className="mt-1">
                            <span className="inline-block px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200/50 rounded-md text-[10px] font-mono font-bold">
                              سجل استيراد: {test.sourceImportRecordId}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Official Provider */}
                      <td className="p-4">
                        <div className="font-bold text-slate-800 text-xs">{test.providerName || test.provider || '-'}</div>
                        {test.createdAt && (
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            تاريخ الإنشاء: {new Date(test.createdAt).toLocaleDateString('ar-EG')}
                          </div>
                        )}
                      </td>

                      {/* Type / Group */}
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 text-[11px] font-bold">
                          <Globe className="w-3.5 h-3.5 text-[#0F4B3A]" />
                          <span>{groupLabel(resolveTestGroup(test))}</span>
                        </span>
                      </td>

                      {/* Validity Duration */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{test.validityDuration || 'غير محدد'}</span>
                        </div>
                      </td>

                      {/* Approx Fee */}
                      <td className="p-4">
                        <span className="text-slate-700 font-bold text-xs inline-flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          {test.approxFee || 'غير متوفر'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                          test.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                          test.status === 'READY_TO_PUBLISH' ? 'bg-teal-50 text-teal-800 border border-teal-200' :
                          test.status === 'IMPORTED' ? 'bg-purple-50 text-purple-800 border border-purple-200' :
                          test.status === 'READY_TO_REVIEW' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                          test.status === 'ARCHIVED' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                          'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {statusLabel(test.status)}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="p-4 text-left">
                        <Link
                          to={`/admin/international-tests/${test.id}`}
                          className="px-3.5 py-2 text-emerald-800 bg-emerald-50/80 hover:bg-[#0F4B3A] hover:text-white border border-emerald-200/60 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
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

      </div>
    </main>
  );
}
