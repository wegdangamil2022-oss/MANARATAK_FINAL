import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/I18nProvider';
import { 
  ArrowLeft, ArrowRight, Search, Filter, Plus, DollarSign, 
  CheckCircle2, AlertCircle, RefreshCw, Eye, ShieldCheck, 
  CreditCard, ShieldAlert, Award, FileText, Layers, AlertTriangle, 
  ChevronRight, X, Building2, Lock, ArrowUpRight
} from 'lucide-react';
import { ApiClient } from '../../api/client';

export function AdminPaidCoursesPreviewPage() {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.getAdminPaidCourses();
      setCourses(data);
    } catch {
      // Fallback sample dataset for Paid Courses
      setCourses([
        {
          id: 'paid_crs_01',
          titleAr: 'دورة التأهيل الاحترافي لشهادة PMP وإدارة المشاريع',
          titleEn: 'PMP Certification & Professional Project Management Prep',
          origin: 'NATIVE_MANARATAK',
          priceAmount: 499,
          currency: 'USD',
          formattedPrice: '$499 USD',
          paymentStatus: 'CONFIGURED',
          accessType: 'LIFETIME',
          status: 'PUBLISHED',
          certificateEnabled: true,
          enrollmentsCount: 1240,
          needsFinanceReview: false,
          missingFieldsCount: 0,
          updatedAt: '2026-07-26 14:10'
        },
        {
          id: 'paid_crs_02',
          titleAr: 'المعسكر التدريبي المتقدم لبناء نماذج الذكاء الاصطناعي',
          titleEn: 'Advanced AI & Machine Learning Engineering Bootcamp',
          origin: 'NATIVE_MANARATAK',
          priceAmount: 899,
          currency: 'USD',
          formattedPrice: '$899 USD',
          paymentStatus: 'CONFIGURED',
          accessType: 'TIME_LIMITED_1YR',
          status: 'READY_TO_SELL',
          certificateEnabled: true,
          enrollmentsCount: 320,
          needsFinanceReview: true,
          missingFieldsCount: 0,
          updatedAt: '2026-07-25 18:20'
        },
        {
          id: 'paid_crs_03',
          titleAr: 'برنامج التحضير المتقدم لاختبار IELTS و TOEFL',
          titleEn: 'Mastering IELTS & TOEFL iBT Prep Course',
          origin: 'PARTNER_APPROVED',
          priceAmount: 199,
          currency: 'USD',
          formattedPrice: '$199 USD',
          paymentStatus: 'PRICING_INCOMPLETE',
          accessType: 'LIFETIME',
          status: 'DRAFT_PRICING',
          certificateEnabled: true,
          enrollmentsCount: 0,
          needsFinanceReview: true,
          missingFieldsCount: 1,
          updatedAt: '2026-07-24 10:00'
        },
        {
          id: 'paid_crs_04',
          titleAr: 'تطبيق الحوسبة السحابية وحماية الشبكات في المؤسسات',
          titleEn: 'Enterprise Cloud Security & Infrastructure Masterclass',
          origin: 'EXTERNAL_APPROVED',
          priceAmount: 299,
          currency: 'USD',
          formattedPrice: '$299 USD',
          paymentStatus: 'PAYMENT_NOT_CONFIGURED',
          accessType: 'SUBSCRIPTION',
          status: 'AWAITING_FINANCE_REVIEW',
          certificateEnabled: false,
          enrollmentsCount: 0,
          needsFinanceReview: true,
          missingFieldsCount: 2,
          updatedAt: '2026-07-23 11:45'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 7 Top Statistics Counters
  const totalCount = courses.length;
  const pricingIncompleteCount = courses.filter(c => c.paymentStatus === 'PRICING_INCOMPLETE' || c.status === 'DRAFT_PRICING').length;
  const paymentNotConfiguredCount = courses.filter(c => c.paymentStatus === 'PAYMENT_NOT_CONFIGURED').length;
  const readyToSellCount = courses.filter(c => c.status === 'READY_TO_SELL').length;
  const publishedCount = courses.filter(c => c.status === 'PUBLISHED').length;
  const archivedCount = courses.filter(c => c.status === 'ARCHIVED').length;
  const needsFinanceReviewCount = courses.filter(c => c.needsFinanceReview || c.status === 'AWAITING_FINANCE_REVIEW').length;

  // Filter Logic
  const filteredCourses = courses.filter(course => {
    const matchesSearch = searchQuery === '' || 
      course.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.titleEn && course.titleEn.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesOrigin = selectedOrigin === 'ALL' || course.origin === selectedOrigin;
    const matchesStatus = selectedStatus === 'ALL' || course.status === selectedStatus;

    return matchesSearch && matchesOrigin && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link to="/admin/courses" className="hover:text-emerald-600 dark:hover:text-emerald-400">
          {t('admin_courses') || 'Courses Administration'}
        </Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-white font-medium">
          {isRTL ? 'الدورات المدفوعة' : 'Paid Courses'}
        </span>
      </div>

      {/* Mandatory Architecture Boundary Notice Card (Rule 9 & 10) */}
      <div className="bg-purple-50/80 dark:bg-purple-950/40 rounded-2xl p-5 border border-purple-200 dark:border-purple-800 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold text-sm">
          <CreditCard className="w-5 h-5 text-purple-600 shrink-0" />
          <span>{isRTL ? 'حدود بنية الدورات المدفوعة (Phase 13 / Phase 19 / Phase 20 Boundary)' : 'Paid Courses Architecture Boundary Notice'}</span>
        </div>
        <p className="text-xs text-purple-800 dark:text-purple-300 leading-relaxed">
          {isRTL 
            ? 'الدورات المدفوعة تبقى عروضًا تعليمية ضمن المرحلة 13. تنفيذ الدفع والاشتراكات يتم عبر المرحلة 19 (Phase 19 Payments). الخدمات المدفوعة غير التعليمية تتبع المرحلة 20 (Phase 20 Services). لا يتم تكرار برمجيات بوابة الدفع أو الفواتير المباشرة داخل إدارة الكتالوج.'
            : 'Paid courses remain Phase 13 learning offerings. Payment execution is handled by Phase 19. Non-course paid services belong to Phase 20.'}
        </p>
      </div>

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              {isRTL ? 'عروض المناهج المسعرة' : 'Monetized Course Offerings'}
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Phase 13 / Phase 19
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {isRTL ? 'إدارة الدورات والبرامج المدفوعة' : 'Monetized & Paid Courses Management'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {isRTL 
              ? 'إدارة المسارات التدريبية المسعرة، إعدادات التسعير، وسياسات الوصول. يتم توجيه الدفع والتسوية المالية تلقائياً إلى Phase 19.'
              : 'Governance for paid training offerings, pricing configurations, and access models. Checkout and financial execution seamlessly hand off to Phase 19.'}
          </p>
        </div>
      </div>

      {/* 7 Top Statistics Counters per Rule 11 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* 1. All Paid */}
        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
            {isRTL ? 'كل الدورات المدفوعة' : 'All Paid Courses'}
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-white">{totalCount}</span>
        </div>

        {/* 2. Pricing Incomplete */}
        <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/60 space-y-1">
          <span className="text-[11px] text-amber-800 dark:text-amber-300 block truncate">
            {isRTL ? 'التسعير ناقص' : 'Pricing Incomplete'}
          </span>
          <span className="text-lg font-bold text-amber-900 dark:text-amber-200">{pricingIncompleteCount}</span>
        </div>

        {/* 3. Payment Not Configured */}
        <div className="p-3 bg-rose-50/60 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800/60 space-y-1">
          <span className="text-[11px] text-rose-800 dark:text-rose-300 block truncate">
            {isRTL ? 'الدفع غير مهيأ' : 'Payment Not Configured'}
          </span>
          <span className="text-lg font-bold text-rose-900 dark:text-rose-200">{paymentNotConfiguredCount}</span>
        </div>

        {/* 4. Ready to Sell */}
        <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800/60 space-y-1">
          <span className="text-[11px] text-blue-800 dark:text-blue-300 block truncate">
            {isRTL ? 'جاهزة للبيع' : 'Ready to Sell'}
          </span>
          <span className="text-lg font-bold text-blue-900 dark:text-blue-200">{readyToSellCount}</span>
        </div>

        {/* 5. Published */}
        <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-1">
          <span className="text-[11px] text-emerald-800 dark:text-emerald-300 block truncate">
            {isRTL ? 'منشورة للبيع' : 'Published'}
          </span>
          <span className="text-lg font-bold text-emerald-900 dark:text-emerald-200">{publishedCount}</span>
        </div>

        {/* 6. Needs Finance Review */}
        <div className="p-3 bg-purple-50/60 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800/60 space-y-1">
          <span className="text-[11px] text-purple-800 dark:text-purple-300 block truncate">
            {isRTL ? 'تحتاج مراجعة مالية' : 'Needs Finance Review'}
          </span>
          <span className="text-lg font-bold text-purple-900 dark:text-purple-200">{needsFinanceReviewCount}</span>
        </div>

        {/* 7. Archived */}
        <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
          <span className="text-[11px] text-slate-600 dark:text-slate-400 block truncate">
            {isRTL ? 'مؤرشفة' : 'Archived'}
          </span>
          <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{archivedCount}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute top-3 ltr:left-3 rtl:right-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRTL ? 'البحث بالاسم والبرنامج المسعر...' : 'Search title or monetized program...'}
            className="w-full py-2 ltr:pl-9 ltr:pr-3 rtl:pr-9 rtl:pl-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Origin Filter */}
          <select
            value={selectedOrigin}
            onChange={(e) => setSelectedOrigin(e.target.value)}
            className="py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
          >
            <option value="ALL">{isRTL ? 'كل مصادر الدورات' : 'All Origins'}</option>
            <option value="NATIVE_MANARATAK">{isRTL ? 'منشأة داخل منارتك (Native)' : 'Native MANARATAK'}</option>
            <option value="PARTNER_APPROVED">{isRTL ? 'شريك معتمد' : 'Partner Approved'}</option>
            <option value="EXTERNAL_APPROVED">{isRTL ? 'خارجية مسعرة' : 'External Approved'}</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
          >
            <option value="ALL">{isRTL ? 'كل الحالات' : 'All Statuses'}</option>
            <option value="PUBLISHED">{isRTL ? 'منشورة' : 'Published'}</option>
            <option value="READY_TO_SELL">{isRTL ? 'جاهزة للبيع' : 'Ready to Sell'}</option>
            <option value="DRAFT_PRICING">{isRTL ? 'تسعير مسودة' : 'Draft Pricing'}</option>
            <option value="AWAITING_FINANCE_REVIEW">{isRTL ? 'بانتظار مراجعة مالية' : 'Awaiting Finance Review'}</option>
            <option value="ARCHIVED">{isRTL ? 'مؤرشفة' : 'Archived'}</option>
          </select>
        </div>
      </div>

      {/* Lightweight Vertical List Table per Rule 2 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-600 dark:text-slate-300 ltr:text-left rtl:text-right">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">{isRTL ? 'عنوان الدورة المسعرة' : 'Paid Course Title'}</th>
                <th className="py-3 px-4">{isRTL ? 'مصدر الدورة' : 'Origin'}</th>
                <th className="py-3 px-4">{isRTL ? 'السعر والعملة' : 'Price & Currency'}</th>
                <th className="py-3 px-4">{isRTL ? 'تهيئة Phase 19' : 'Phase 19 Integration'}</th>
                <th className="py-3 px-4">{isRTL ? 'نوع الوصول' : 'Access Model'}</th>
                <th className="py-3 px-4">{isRTL ? 'الحالة' : 'Status'}</th>
                <th className="py-3 px-4 ltr:text-right rtl:text-left">{isRTL ? 'الإجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    {isRTL ? 'لا توجد دورات مدفوعة مطابقة للفلاتر.' : 'No paid courses matching filters.'}
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Title */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white max-w-xs">
                      <div className="truncate">{isRTL ? course.titleAr : (course.titleEn || course.titleAr)}</div>
                      <div className="text-[11px] text-slate-400 font-normal truncate mt-0.5">
                        {isRTL ? `المسجلين: ${course.enrollmentsCount}` : `Enrollments: ${course.enrollmentsCount}`}
                      </div>
                    </td>

                    {/* Origin */}
                    <td className="py-3.5 px-4 font-semibold">
                      <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        {course.origin === 'NATIVE_MANARATAK' ? (isRTL ? 'منارتك' : 'Native') : course.origin}
                      </span>
                    </td>

                    {/* Price & Currency */}
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white text-sm">
                      {course.formattedPrice}
                    </td>

                    {/* Phase 19 Integration Status */}
                    <td className="py-3.5 px-4">
                      {course.paymentStatus === 'CONFIGURED' ? (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isRTL ? 'مُهيأ لـ Phase 19' : 'Configured'}</span>
                        </span>
                      ) : course.paymentStatus === 'PRICING_INCOMPLETE' ? (
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{isRTL ? 'التسعير غير مكتمل' : 'Pricing Incomplete'}</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>{isRTL ? 'غير مهيأ' : 'Not Configured'}</span>
                        </span>
                      )}
                    </td>

                    {/* Access Model */}
                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {course.accessType}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border ${
                        course.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800' :
                        course.status === 'READY_TO_SELL' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800' :
                        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                      }`}>
                        {course.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 ltr:text-right rtl:text-left">
                      <Link
                        to={`/admin/courses/paid/${course.id}`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isRTL ? 'عرض التفاصيل' : 'View Details'}</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
