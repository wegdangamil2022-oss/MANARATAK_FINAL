import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/I18nProvider';
import { 
  GraduationCap, ArrowLeft, ArrowRight, Search, Filter, Plus, 
  CheckCircle2, AlertCircle, RefreshCw, Eye, ShieldAlert, 
  FileText, Layers, AlertTriangle, X, Clock, Users, DollarSign,
  Briefcase
} from 'lucide-react';
import { ApiClient } from '../../api/client';

export function AdminStudentServicesPreviewPage() {
  const navigate = useNavigate();
  const { isRTL } = useTranslation();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State for Create Service
  const [newService, setNewService] = useState({
    titleAr: '',
    titleEn: '',
    category: 'STUDY_CONSULTATION',
    description: '',
    includedScope: '',
    excludedScope: '',
    userRequirements: '',
    slaDeliveryTime: '3 Business Days',
    priceType: 'PAID_FIXED',
    priceAmount: 99,
    status: 'DRAFT'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.getAdminStudentServices();
      setServices(data);
    } catch {
      // Fallback sample dataset for Student Services
      setServices([
        {
          id: 'std_srv_01',
          titleAr: 'خدمة استشارة اختيار الجامعة والتخصص المناسب',
          titleEn: 'University & Major Selection Advisory Session',
          category: 'UNIVERSITY_SELECTION',
          categoryLabelAr: 'اختيار الجامعة والتخصص',
          priceType: 'PAID_FIXED',
          priceFormatted: '$49 / جلسة',
          slaDeliveryTime: '24-48 ساعة',
          status: 'PUBLISHED',
          assignedTeam: 'فريق الاستشارات الأكاديمية',
          activeRequestsCount: 38,
          hasTemplates: true,
          updatedAt: '2026-07-27 11:20'
        },
        {
          id: 'std_srv_02',
          titleAr: 'مراجعة وتدقيق خطاب الغرض من الدراسة (SOP)',
          titleEn: 'Statement of Purpose (SOP) Editorial Review',
          category: 'STATEMENT_OF_PURPOSE',
          categoryLabelAr: 'خطاب الغرض من الدراسة',
          priceType: 'TIERED_PACKAGE',
          priceFormatted: 'يبدأ من $79 (3 باقات)',
          slaDeliveryTime: '3 أيام عمل',
          status: 'PUBLISHED',
          assignedTeam: 'فريق التحرير والأدبيات',
          activeRequestsCount: 52,
          hasTemplates: true,
          updatedAt: '2026-07-26 16:45'
        },
        {
          id: 'std_srv_03',
          titleAr: 'إعداد وتجهيز ملف طلب القبول الجامعي المباشر',
          titleEn: 'Direct University Admission Application Prep',
          category: 'ADMISSION_PREP',
          categoryLabelAr: 'تجهيز طلب القبول الجامعي',
          priceType: 'TIERED_PACKAGE',
          priceFormatted: 'يبدأ من $199',
          slaDeliveryTime: '5 أيام عمل',
          status: 'READY_TO_PUBLISH',
          assignedTeam: 'فريق معالجة القبولات',
          activeRequestsCount: 19,
          hasTemplates: true,
          updatedAt: '2026-07-25 09:30'
        },
        {
          id: 'std_srv_04',
          titleAr: 'مراجعة وصياغة خطاب الدافع للقبول والمنح (Motivation Letter)',
          titleEn: 'Motivation Letter Review & Formatting',
          category: 'MOTIVATION_LETTER',
          categoryLabelAr: 'خطاب الدافع',
          priceType: 'PAID_FIXED',
          priceFormatted: '$59',
          slaDeliveryTime: '2 أيام عمل',
          status: 'UNDER_REVIEW',
          assignedTeam: 'فريق التدقيق الأكاديمي',
          activeRequestsCount: 14,
          hasTemplates: false,
          updatedAt: '2026-07-24 14:15'
        },
        {
          id: 'std_srv_05',
          titleAr: 'جلسة تدقيق ودعم تقديم طلبات المنح الدراسية الممولة',
          titleEn: 'Fully Funded Scholarship Application Guidance',
          category: 'SCHOLARSHIP_SUPPORT',
          categoryLabelAr: 'دعم التقديم على المنح',
          priceType: 'MISSING_PRICE',
          priceFormatted: 'لم يتم تحديد الباقة',
          slaDeliveryTime: '4 أيام عمل',
          status: 'DRAFT',
          assignedTeam: 'وحدة المنح والجوائز',
          activeRequestsCount: 0,
          hasTemplates: false,
          updatedAt: '2026-07-23 10:00'
        },
        {
          id: 'std_srv_06',
          titleAr: 'مراجعة وتنسيق السيرة الذاتية الأكاديمية (Academic CV)',
          titleEn: 'Academic CV & Resume Optimization',
          category: 'CV_REVIEW',
          categoryLabelAr: 'السيرة الذاتية الأكاديمية',
          priceType: 'FREE',
          priceFormatted: 'خدمة مجانية',
          slaDeliveryTime: '48 ساعة',
          status: 'PUBLISHED',
          assignedTeam: 'فريق تطوير المهارات',
          activeRequestsCount: 84,
          hasTemplates: true,
          updatedAt: '2026-07-22 18:00'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(srv => {
    const matchesSearch = searchQuery === '' || 
      srv.titleAr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.titleEn?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'ALL' || srv.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || srv.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate top counters
  const totalCount = services.length;
  const publishedCount = services.filter(s => s.status === 'PUBLISHED').length;
  const draftOrReviewCount = services.filter(s => s.status === 'DRAFT' || s.status === 'UNDER_REVIEW').length;
  const missingPriceCount = services.filter(s => s.priceType === 'MISSING_PRICE').length;
  const missingTemplatesCount = services.filter(s => !s.hasTemplates).length;
  const totalActiveRequests = services.reduce((acc, curr) => acc + (curr.activeRequestsCount || 0), 0);
  const needsReviewCount = services.filter(s => s.status === 'UNDER_REVIEW' || !s.hasTemplates || s.priceType === 'MISSING_PRICE').length;

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.createAdminStudentService(newService);
    } catch {
      // Add locally for prototype preview
      const created = {
        id: `std_srv_${Date.now()}`,
        titleAr: newService.titleAr || 'خدمة طلابية جديدة',
        titleEn: newService.titleEn || 'New Student Service',
        category: newService.category,
        categoryLabelAr: 'خدمة طلابية',
        priceType: newService.priceType,
        priceFormatted: newService.priceType === 'FREE' ? 'خدمة مجانية' : `$${newService.priceAmount}`,
        slaDeliveryTime: newService.slaDeliveryTime,
        status: newService.status,
        assignedTeam: 'فريق الخدمات الطلابية',
        activeRequestsCount: 0,
        hasTemplates: true,
        updatedAt: 'الآن'
      };
      setServices([created, ...services]);
    }
    setShowCreateModal(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 dir-rtl">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <button onClick={() => navigate('/admin/services')} className="hover:text-emerald-600">إدارة الخدمات</button>
            <span>/</span>
            <span className="text-emerald-600 font-medium">الخدمات الطلابية</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <GraduationCap className="w-7 h-7 text-emerald-600" />
            إدارة الخدمات الطلابية (Student Services)
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            إدارة استشارات التقديم، مراجعة الوثائق الأكاديمية، خطاب الغرض وخطاب الدافع، والمنح الدراسية.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-2 text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة خدمة طلابية</span>
          </button>
        </div>
      </div>

      {/* Boundary Reminder Notice */}
      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center gap-3 text-xs text-amber-900 dark:text-amber-300">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <span>الخدمات الطلابية هي عروض غير تعليمية ضمن Phase 20. الدورات والمساقات تبقى حصرياً ضمن Phase 13، والدفع يدار عبر Phase 19.</span>
      </div>

      {/* Top Statistics Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-xs text-gray-500 dark:text-gray-400">إجمالي الخدمات</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">{totalCount}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>منشورة</span>
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{publishedCount}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>مسودة/قيد المراجعة</span>
          </div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{draftOrReviewCount}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>تنقصها باقة/تسعير</span>
          </div>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">{missingPriceCount}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            <span>تنقصها نماذج</span>
          </div>
          <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{missingTemplatesCount}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>طلبات نشطة</span>
          </div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">{totalActiveRequests}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>تحتاج مراجعة</span>
          </div>
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">{needsReviewCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث باسم الخدمة أو الوصف..."
              className="w-full pr-9 pl-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none"
            >
              <option value="ALL">جميع أنواع الخدمات الطلابية</option>
              <option value="UNIVERSITY_SELECTION">اختيار الجامعة والتخصص</option>
              <option value="STATEMENT_OF_PURPOSE">خطاب الغرض (SOP)</option>
              <option value="ADMISSION_PREP">تجهيز طلب القبول</option>
              <option value="MOTIVATION_LETTER">خطاب الدافع</option>
              <option value="SCHOLARSHIP_SUPPORT">دعم المنح الدراسية</option>
              <option value="CV_REVIEW">السيرة الذاتية الأكاديمية</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none"
            >
              <option value="ALL">جميع الحالات</option>
              <option value="PUBLISHED">منشورة (Published)</option>
              <option value="READY_TO_PUBLISH">جاهزة للنشر</option>
              <option value="UNDER_REVIEW">قيد المراجعة</option>
              <option value="DRAFT">مسودة (Draft)</option>
            </select>

            <button
              onClick={loadData}
              className="p-2 text-gray-500 hover:text-emerald-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              title="تحديث القائمة"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Lightweight Vertical Row Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-gray-500">جاري تحميل الخدمات الطلابية...</div>
        ) : filteredServices.length === 0 ? (
          <div className="p-12 text-center text-gray-500">لا توجد خدمات طلابية مطابقة للبحث أو الفلاتر.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredServices.map((srv) => (
              <div key={srv.id} className="p-4 hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 dark:text-white text-base">
                      {srv.titleAr}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {srv.categoryLabelAr}
                    </span>
                  </div>
                  {srv.titleEn && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 dir-ltr text-right">
                      {srv.titleEn}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap pt-1">
                    <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                      <DollarSign className="w-3.5 h-3.5" />
                      {srv.priceFormatted}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      مدة التسليم (SLA): {srv.slaDeliveryTime}
                    </span>
                    <span>•</span>
                    <span>الفريق المسند: {srv.assignedTeam}</span>
                    <span>•</span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      الطلبات النشطة: {srv.activeRequestsCount}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Status Badge */}
                  {srv.status === 'PUBLISHED' && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                      منشورة
                    </span>
                  )}
                  {srv.status === 'READY_TO_PUBLISH' && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                      جاهزة للنشر
                    </span>
                  )}
                  {srv.status === 'UNDER_REVIEW' && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                      قيد المراجعة
                    </span>
                  )}
                  {srv.status === 'DRAFT' && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      مسودة
                    </span>
                  )}

                  <button
                    onClick={() => navigate(`/admin/services/student/${srv.id}`)}
                    className="px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>عرض التفاصيل</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Student Service Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                إضافة خدمة طلابية جديدة (Student Service)
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  اسم الخدمة بالعربية *
                </label>
                <input
                  type="text"
                  required
                  value={newService.titleAr}
                  onChange={e => setNewService({...newService, titleAr: e.target.value})}
                  placeholder="مثال: خدمة مراجعة وتدقيق خطاب الغرض من الدراسة"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  اسم الخدمة بالإنجليزية (English Title)
                </label>
                <input
                  type="text"
                  value={newService.titleEn}
                  onChange={e => setNewService({...newService, titleEn: e.target.value})}
                  placeholder="e.g. Statement of Purpose (SOP) Review"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none dir-ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    تصنيف الخدمة الطلابية *
                  </label>
                  <select
                    value={newService.category}
                    onChange={e => setNewService({...newService, category: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none"
                  >
                    <option value="STUDY_CONSULTATION">استشارة دراسية أكاديمية</option>
                    <option value="UNIVERSITY_SELECTION">اختيار الجامعة والتخصص</option>
                    <option value="STATEMENT_OF_PURPOSE">خطاب الغرض (SOP)</option>
                    <option value="ADMISSION_PREP">تجهيز طلب القبول</option>
                    <option value="MOTIVATION_LETTER">خطاب الدافع</option>
                    <option value="SCHOLARSHIP_SUPPORT">دعم التقديم على المنح</option>
                    <option value="CV_REVIEW">السيرة الذاتية الأكاديمية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    مدة التسليم (SLA)
                  </label>
                  <input
                    type="text"
                    value={newService.slaDeliveryTime}
                    onChange={e => setNewService({...newService, slaDeliveryTime: e.target.value})}
                    placeholder="مثال: 3 أيام عمل"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الوصف المباشر للخدمة
                </label>
                <textarea
                  rows={2}
                  value={newService.description}
                  onChange={e => setNewService({...newService, description: e.target.value})}
                  placeholder="وصف مختصر لمخرجات الخدمة والهدف منها..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ما تتضمنه الخدمة (Included)
                  </label>
                  <textarea
                    rows={2}
                    value={newService.includedScope}
                    onChange={e => setNewService({...newService, includedScope: e.target.value})}
                    placeholder="تدقيق إملائي، تصحيح الأسلوب، التنسيق..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ما لا تتضمنه الخدمة (Excluded)
                  </label>
                  <textarea
                    rows={2}
                    value={newService.excludedScope}
                    onChange={e => setNewService({...newService, excludedScope: e.target.value})}
                    placeholder="كتابة النص بالكامل من الصفر، رسوم التقديم الجامعي..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  اشتراطات ومتطلبات الطالب (Requirements)
                </label>
                <input
                  type="text"
                  value={newService.userRequirements}
                  onChange={e => setNewService({...newService, userRequirements: e.target.value})}
                  placeholder="تزويدنا بالمسودة الحالية، قائمة بالجامعات المستهدفة..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors"
                >
                  حفظ وإنشاء الخدمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
