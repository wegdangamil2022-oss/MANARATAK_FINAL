import React, { useState } from 'react';
import { useTranslation } from '../../i18n/I18nProvider';
import { Link, Navigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  GraduationCap, 
  School, 
  BookOpen, 
  BookMarked, 
  Globe2, 
  Settings, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  ExternalLink, 
  ShieldCheck, 
  RefreshCw,
  FileSpreadsheet,
  Globe,
  HelpCircle,
  Sparkles,
  UserCheck,
  Tag,
  Layers
} from 'lucide-react';

interface PendingWorkItem {
  id: string;
  titleAr: string;
  titleEn: string;
  domainKey: 'scholarships' | 'universities' | 'majors' | 'courses' | 'tests' | 'services' | 'cms';
  domainNameAr: string;
  domainNameEn: string;
  domainPath: string;
  reasonKey: string;
  reasonAr: string;
  reasonEn: string;
  statusKey: 'needs_translation' | 'missing_required' | 'ready_to_publish' | 'source_verification' | 'imported_unreviewed';
  statusAr: string;
  statusEn: string;
  priority: 'high' | 'medium' | 'low';
  sourceType: 'manual' | 'csv_import' | 'url_import' | 'ai_draft' | 'cms_draft';
  sourceTypeAr: string;
  sourceTypeEn: string;
  age: 'today' | 'this_week' | 'older';
  updatedAtAr: string;
  updatedAtEn: string;
}

export function AdminReviewQueuePreviewPage() {
  const { t, dir, language } = useTranslation();
  const adminSessionPresent = Boolean(localStorage.getItem('manaratak_access_token'));

  // Filters state
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedReason, setSelectedReason] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedAge, setSelectedAge] = useState<string>('all');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  if (!adminSessionPresent) {
    return <Navigate to="/login" replace />;
  }

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  // 7 Domain cards
  const domainCards = [
    {
      id: 'scholarships',
      nameAr: 'المنح الدراسية',
      nameEn: 'Scholarships',
      path: '/admin/scholarships',
      icon: <GraduationCap className="w-6 h-6 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-100',
      totalPending: 16,
      needsTranslation: 5,
      missingRequired: 4,
      readyToPublish: 4,
      highPriority: 3,
      updatedAtAr: 'قبل ١٠ دقائق',
      updatedAtEn: '10 mins ago',
    },
    {
      id: 'universities',
      nameAr: 'الجامعات',
      nameEn: 'Universities',
      path: '/admin/universities',
      icon: <School className="w-6 h-6 text-purple-600" />,
      bg: 'bg-purple-50 border-purple-100',
      totalPending: 10,
      needsTranslation: 3,
      missingRequired: 2,
      readyToPublish: 3,
      highPriority: 2,
      updatedAtAr: 'قبل ٢٥ دقيقة',
      updatedAtEn: '25 mins ago',
    },
    {
      id: 'majors',
      nameAr: 'التخصصات',
      nameEn: 'Majors',
      path: '/admin/majors',
      icon: <BookOpen className="w-6 h-6 text-amber-600" />,
      bg: 'bg-amber-50 border-amber-100',
      totalPending: 7,
      needsTranslation: 2,
      missingRequired: 2,
      readyToPublish: 2,
      highPriority: 1,
      updatedAtAr: 'قبل ساعة',
      updatedAtEn: '1 hour ago',
    },
    {
      id: 'courses',
      nameAr: 'الدورات التدريبية',
      nameEn: 'Courses',
      path: '/admin/courses',
      icon: <BookMarked className="w-6 h-6 text-cyan-600" />,
      bg: 'bg-cyan-50 border-cyan-100',
      totalPending: 9,
      needsTranslation: 3,
      missingRequired: 3,
      readyToPublish: 1,
      highPriority: 2,
      updatedAtAr: 'قبل ساعتين',
      updatedAtEn: '2 hours ago',
    },
    {
      id: 'tests',
      nameAr: 'الاختبارات الدولية',
      nameEn: 'International Tests',
      path: '/admin/international-tests',
      icon: <Globe2 className="w-6 h-6 text-rose-600" />,
      bg: 'bg-rose-50 border-rose-100',
      totalPending: 5,
      needsTranslation: 2,
      missingRequired: 1,
      readyToPublish: 1,
      highPriority: 1,
      updatedAtAr: 'قبل ٣ ساعات',
      updatedAtEn: '3 hours ago',
    },
    {
      id: 'services',
      nameAr: 'الخدمات',
      nameEn: 'Services',
      path: '/admin/services',
      icon: <Settings className="w-6 h-6 text-slate-600" />,
      bg: 'bg-slate-50 border-slate-200',
      totalPending: 4,
      needsTranslation: 1,
      missingRequired: 1,
      readyToPublish: 1,
      highPriority: 0,
      updatedAtAr: 'قبل ٥ ساعات',
      updatedAtEn: '5 hours ago',
    },
    {
      id: 'cms',
      nameAr: 'المقالات والمحتوى (CMS)',
      nameEn: 'CMS / Articles',
      path: '/admin/cms',
      icon: <FileText className="w-6 h-6 text-indigo-600" />,
      bg: 'bg-indigo-50 border-indigo-100',
      totalPending: 7,
      needsTranslation: 2,
      missingRequired: 1,
      readyToPublish: 0,
      highPriority: 2,
      updatedAtAr: 'قبل ٣٠ دقيقة',
      updatedAtEn: '30 mins ago',
    },
  ];

  // Cross-domain top metrics
  const topMetrics = [
    {
      label: t('total_pending_review') || (language === 'ar' ? 'إجمالي بانتظار المراجعة' : 'Total Pending Review'),
      value: '58',
      color: 'border-amber-500 text-amber-700 bg-amber-50/50',
      icon: <Clock className="w-5 h-5 text-amber-600" />
    },
    {
      label: t('needs_translation') || (language === 'ar' ? 'يحتاج ترجمة' : 'Needs Translation'),
      value: '18',
      color: 'border-blue-500 text-blue-700 bg-blue-50/50',
      icon: <Globe className="w-5 h-5 text-blue-600" />
    },
    {
      label: t('missing_required_fields') || (language === 'ar' ? 'حقول مطلوبة ناقصة' : 'Missing Required Fields'),
      value: '14',
      color: 'border-rose-500 text-rose-700 bg-rose-50/50',
      icon: <AlertTriangle className="w-5 h-5 text-rose-600" />
    },
    {
      label: t('ready_to_publish') || (language === 'ar' ? 'جاهز للنشر' : 'Ready to Publish'),
      value: '12',
      color: 'border-emerald-500 text-emerald-700 bg-emerald-50/50',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />
    },
    {
      label: t('source_verification_required') || (language === 'ar' ? 'يحتاج تحقق من المصدر' : 'Source Verification Required'),
      value: '9',
      color: 'border-purple-500 text-purple-700 bg-purple-50/50',
      icon: <ShieldCheck className="w-5 h-5 text-purple-600" />
    },
    {
      label: t('recently_imported_not_reviewed') || (language === 'ar' ? 'مستورد حديثاً لم يراجع' : 'Recently Imported (Unreviewed)'),
      value: '15',
      color: 'border-teal-500 text-teal-700 bg-teal-50/50',
      icon: <FileSpreadsheet className="w-5 h-5 text-teal-600" />
    },
  ];

  // Review reasons breakdown
  const reviewReasons = [
    {
      id: 'missing_ar_translation',
      titleAr: 'غياب الترجمة العربية',
      titleEn: 'Missing Arabic translation',
      count: 11,
      color: 'bg-blue-50 text-blue-800 border-blue-200'
    },
    {
      id: 'missing_en_translation',
      titleAr: 'غياب الترجمة الإنجليزية',
      titleEn: 'Missing English translation',
      count: 7,
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200'
    },
    {
      id: 'missing_source_url',
      titleAr: 'غياب رابط المصدر الرسمي',
      titleEn: 'Missing official source URL',
      count: 9,
      color: 'bg-purple-50 text-purple-800 border-purple-200'
    },
    {
      id: 'missing_eap_asset',
      titleAr: 'غياب الصورة/الأصل المرئي',
      titleEn: 'Missing EAP asset/image',
      count: 6,
      color: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    {
      id: 'incomplete_required_fields',
      titleAr: 'حقول مطلوبة ناقصة',
      titleEn: 'Incomplete required fields',
      count: 14,
      color: 'bg-rose-50 text-rose-800 border-rose-200'
    },
    {
      id: 'needs_admin_verification',
      titleAr: 'يحتاج تحقق المسؤول',
      titleEn: 'Needs admin verification',
      count: 5,
      color: 'bg-cyan-50 text-cyan-800 border-cyan-200'
    },
    {
      id: 'ai_draft_awaiting_human',
      titleAr: 'مسودة ذكاء اصطناعي بانتظار المراجعة',
      titleEn: 'AI draft awaiting human review',
      count: 8,
      color: 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200'
    },
    {
      id: 'imported_data_awaiting_domain',
      titleAr: 'بيانات مستوردة بانتظار مراجعة النطاق',
      titleEn: 'Imported data awaiting domain review',
      count: 15,
      color: 'bg-teal-50 text-teal-800 border-teal-200'
    },
  ];

  // Sample Read-Only Pending Work Queue items
  const pendingWorkItems: PendingWorkItem[] = [
    {
      id: 'item-1',
      titleAr: 'منحة التميز الأكاديمي بجامعة أكسفورد ٢٠٢٦',
      titleEn: 'Oxford Academic Excellence Scholarship 2026',
      domainKey: 'scholarships',
      domainNameAr: 'المنح الدراسية',
      domainNameEn: 'Scholarships',
      domainPath: '/admin/scholarships',
      reasonKey: 'missing_ar_translation',
      reasonAr: 'غياب الترجمة العربية',
      reasonEn: 'Missing Arabic translation',
      statusKey: 'needs_translation',
      statusAr: 'يحتاج ترجمة',
      statusEn: 'Needs Translation',
      priority: 'high',
      sourceType: 'csv_import',
      sourceTypeAr: 'استيراد CSV/JSON',
      sourceTypeEn: 'CSV/JSON Import',
      age: 'today',
      updatedAtAr: 'قبل ١٥ دقيقة',
      updatedAtEn: '15 mins ago',
    },
    {
      id: 'item-2',
      titleAr: 'ملف جامعة الملك فهد للبترول والمعادن (تحديث الكليات)',
      titleEn: 'King Fahd University Profile Update (Faculty Data)',
      domainKey: 'universities',
      domainNameAr: 'الجامعات',
      domainNameEn: 'Universities',
      domainPath: '/admin/universities',
      reasonKey: 'missing_source_url',
      reasonAr: 'غياب رابط المصدر الرسمي',
      reasonEn: 'Missing official source URL',
      statusKey: 'source_verification',
      statusAr: 'يحتاج تحقق من المصدر',
      statusEn: 'Source Verification Required',
      priority: 'high',
      sourceType: 'manual',
      sourceTypeAr: 'إدخال يدوي',
      sourceTypeEn: 'Manual Entry',
      age: 'today',
      updatedAtAr: 'قبل ٣٠ دقيقة',
      updatedAtEn: '30 mins ago',
    },
    {
      id: 'item-3',
      titleAr: 'تخصص الذكاء الاصطناعي وعلوم البيانات الهندسية',
      titleEn: 'BSc Artificial Intelligence & Data Science',
      domainKey: 'majors',
      domainNameAr: 'التخصصات',
      domainNameEn: 'Majors',
      domainPath: '/admin/majors',
      reasonKey: 'incomplete_required_fields',
      reasonAr: 'حقول مطلوبة ناقصة',
      reasonEn: 'Incomplete required fields',
      statusKey: 'missing_required',
      statusAr: 'حقول مطلوبة ناقصة',
      statusEn: 'Missing Required Fields',
      priority: 'medium',
      sourceType: 'ai_draft',
      sourceTypeAr: 'مسودة ذكاء اصطناعي',
      sourceTypeEn: 'AI Draft',
      age: 'today',
      updatedAtAr: 'قبل ساعة',
      updatedAtEn: '1 hour ago',
    },
    {
      id: 'item-4',
      titleAr: 'دورة التحضير الشامل لاختبار IELTS 2026',
      titleEn: 'Comprehensive IELTS Prep Masterclass 2026',
      domainKey: 'courses',
      domainNameAr: 'الدورات التدريبية',
      domainNameEn: 'Courses',
      domainPath: '/admin/courses',
      reasonKey: 'ready_to_publish',
      reasonAr: 'مكتملة التدقيق وجاهزة للنشر',
      reasonEn: 'Validation complete - ready to publish',
      statusKey: 'ready_to_publish',
      statusAr: 'جاهز للنشر',
      statusEn: 'Ready to Publish',
      priority: 'high',
      sourceType: 'manual',
      sourceTypeAr: 'إدخال يدوي',
      sourceTypeEn: 'Manual Entry',
      age: 'this_week',
      updatedAtAr: 'قبل ساعتين',
      updatedAtEn: '2 hours ago',
    },
    {
      id: 'item-5',
      titleAr: 'دليل التسجيل لرسوم اختبار TOEFL iBT بالدولار',
      titleEn: 'TOEFL iBT Global Registration Fee & Venues',
      domainKey: 'tests',
      domainNameAr: 'الاختبارات الدولية',
      domainNameEn: 'International Tests',
      domainPath: '/admin/international-tests',
      reasonKey: 'needs_admin_verification',
      reasonAr: 'يحتاج تحقق المسؤول',
      reasonEn: 'Needs admin verification',
      statusKey: 'source_verification',
      statusAr: 'يحتاج تحقق من المصدر',
      statusEn: 'Source Verification Required',
      priority: 'medium',
      sourceType: 'url_import',
      sourceTypeAr: 'استيراد رابط',
      sourceTypeEn: 'URL Import',
      age: 'this_week',
      updatedAtAr: 'قبل ٣ ساعات',
      updatedAtEn: '3 hours ago',
    },
    {
      id: 'item-6',
      titleAr: 'خدمة مراجعة السيرة الذاتية ورسائل الدافع للطلاب',
      titleEn: 'Student SOP & CV Review Enterprise Service',
      domainKey: 'services',
      domainNameAr: 'الخدمات',
      domainNameEn: 'Services',
      domainPath: '/admin/services',
      reasonKey: 'missing_en_translation',
      reasonAr: 'غياب الترجمة الإنجليزية',
      reasonEn: 'Missing English translation',
      statusKey: 'needs_translation',
      statusAr: 'يحتاج ترجمة',
      statusEn: 'Needs Translation',
      priority: 'low',
      sourceType: 'manual',
      sourceTypeAr: 'إدخال يدوي',
      sourceTypeEn: 'Manual Entry',
      age: 'this_week',
      updatedAtAr: 'قبل ٥ ساعات',
      updatedAtEn: '5 hours ago',
    },
    {
      id: 'item-7',
      titleAr: 'دليل الدراسة والابتعاث في ألمانيا لعام ٢٠٢٦',
      titleEn: 'Complete Guide to Higher Education in Germany 2026',
      domainKey: 'cms',
      domainNameAr: 'المقالات والمحتوى (CMS)',
      domainNameEn: 'CMS / Articles',
      domainPath: '/admin/cms',
      reasonKey: 'missing_eap_asset',
      reasonAr: 'غياب الصورة/الأصل المرئي',
      reasonEn: 'Missing EAP asset/image',
      statusKey: 'missing_required',
      statusAr: 'حقول مطلوبة ناقصة',
      statusEn: 'Missing Required Fields',
      priority: 'high',
      sourceType: 'cms_draft',
      sourceTypeAr: 'مسودة CMS',
      sourceTypeEn: 'CMS Draft',
      age: 'older',
      updatedAtAr: 'قبل يومين',
      updatedAtEn: '2 days ago',
    },
    {
      id: 'item-8',
      titleAr: 'منحة الحكومة التركية للبكالوريوس والدراسات العليا',
      titleEn: 'Türkiye Burslari Government Scholarship',
      domainKey: 'scholarships',
      domainNameAr: 'المنح الدراسية',
      domainNameEn: 'Scholarships',
      domainPath: '/admin/scholarships',
      reasonKey: 'imported_data_awaiting_domain',
      reasonAr: 'بيانات مستوردة بانتظار مراجعة النطاق',
      reasonEn: 'Imported data awaiting domain review',
      statusKey: 'imported_unreviewed',
      statusAr: 'مستورد حديثاً لم يراجع',
      statusEn: 'Recently Imported (Unreviewed)',
      priority: 'high',
      sourceType: 'csv_import',
      sourceTypeAr: 'استيراد CSV/JSON',
      sourceTypeEn: 'CSV/JSON Import',
      age: 'older',
      updatedAtAr: 'قبل ٣ أيام',
      updatedAtEn: '3 days ago',
    }
  ];

  // Filtering logic
  const filteredItems = pendingWorkItems.filter((item) => {
    if (selectedDomain !== 'all' && item.domainKey !== selectedDomain) return false;
    if (selectedReason !== 'all' && item.reasonKey !== selectedReason) return false;
    if (selectedPriority !== 'all' && item.priority !== selectedPriority) return false;
    if (selectedSource !== 'all' && item.sourceType !== selectedSource) return false;
    if (selectedAge !== 'all' && item.age !== selectedAge) return false;
    return true;
  });

  const getPriorityBadge = (p: 'high' | 'medium' | 'low') => {
    switch (p) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            {t('priority_high') || (language === 'ar' ? 'عالية' : 'High')}
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            {t('priority_medium') || (language === 'ar' ? 'متوسطة' : 'Medium')}
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {t('priority_low') || (language === 'ar' ? 'منخفضة' : 'Low')}
          </span>
        );
    }
  };

  const getStatusBadge = (s: PendingWorkItem['statusKey'], arText: string, enText: string) => {
    const text = language === 'ar' ? arText : enText;
    switch (s) {
      case 'needs_translation':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">{text}</span>;
      case 'missing_required':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">{text}</span>;
      case 'ready_to_publish':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">{text}</span>;
      case 'source_verification':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">{text}</span>;
      case 'imported_unreviewed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">{text}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6" dir={dir}>
      {/* Back Link */}
      <Link 
        to="/admin" 
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
        {t('back_to_admin') || (language === 'ar' ? 'العودة إلى لوحة التحكم' : 'Back to Admin Portal')}
      </Link>

      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl shadow-sm">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {t('review_queue_overview') || (language === 'ar' ? 'نظرة عامة على قائمة المراجعة' : 'Review Queue Overview')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                {t('review_queue_overview_desc') || (language === 'ar' ? 'لوحة تحكم موحدة واستعراض تجميعي للأعمال المعلقة عبر كل مجالات المنصة.' : 'Central control-plane overview of pending work across platform domain modules.')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            {t('control_plane_active') || (language === 'ar' ? 'لوحة التحكم نشطة' : 'Control Plane Active')}
          </span>
          <button 
            onClick={handleRefresh} 
            className="p-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all cursor-pointer"
            title={t('refresh') || 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Read-Only Architectural Boundary Banner */}
      <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 sm:p-5 mb-8 text-amber-900 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed font-medium">
            <span className="font-bold text-amber-950 block mb-1">
              {t('architectural_boundary_note') || (language === 'ar' ? 'فرض الحدود المعمارية:' : 'Architecture Boundary Enforcement:')}
            </span>
            {t('read_only_overview_banner') || (language === 'ar' 
              ? 'تنويه: قائمة المراجعة هي لوحة تجميعية للقراءة فقط. تُنفذ جميع عمليات التعديل والاعتماد والنشر والاستيراد والحذف داخل لوحة الإدارة الخاصة بكل مجال.' 
              : 'Notice: The Review Queue is a read-only aggregate control plane. Content editing, approval, publishing, import, and deletion operations must be performed inside their respective domain admin workspaces.')}
          </div>
        </div>
      </div>

      {/* Top 6 Cross-Domain Metrics */}
      <div className="mb-8">
        <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          {t('total_pending_review') || (language === 'ar' ? 'إجمالي بانتظار المراجعة' : 'Total Pending Review')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {topMetrics.map((m, idx) => (
            <div 
              key={idx} 
              className={`border rounded-2xl p-4 transition-all shadow-sm flex flex-col justify-between ${m.color}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] sm:text-xs font-bold leading-tight line-clamp-2">
                  {m.label}
                </span>
                {m.icon}
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {m.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7 Aggregate Domain Workspaces Cards */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-600" />
            {t('aggregate_domain_cards') || (language === 'ar' ? 'حالة المراجعة المجمعة حسب المجال' : 'Aggregate Review Status by Domain')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {domainCards.map((card) => {
            const cardName = language === 'ar' ? card.nameAr : card.nameEn;
            const cardUpdatedAt = language === 'ar' ? card.updatedAtAr : card.updatedAtEn;
            
            return (
              <div 
                key={card.id}
                className={`border rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group ${card.bg}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-xs">
                        {card.icon}
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-base group-hover:text-[#0F4B3A] transition-colors">
                        {cardName}
                      </h3>
                    </div>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      {card.totalPending} {language === 'ar' ? 'معلق' : 'pending'}
                    </span>
                  </div>

                  {/* Breakdown stats list inside card */}
                  <div className="space-y-1.5 text-xs text-slate-600 my-4 bg-white/70 backdrop-blur-xs p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">{t('needs_translation') || (language === 'ar' ? 'يحتاج ترجمة:' : 'Needs Translation:')}</span>
                      <span className="font-bold text-blue-700">{card.needsTranslation}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">{t('missing_required_fields') || (language === 'ar' ? 'حقول مطلوبة ناقصة:' : 'Missing Fields:')}</span>
                      <span className="font-bold text-rose-700">{card.missingRequired}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">{t('ready_to_publish') || (language === 'ar' ? 'جاهز للنشر:' : 'Ready to Publish:')}</span>
                      <span className="font-bold text-emerald-700">{card.readyToPublish}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-100 pt-1 mt-1">
                      <span className="text-slate-500">{language === 'ar' ? 'أولوية عالية:' : 'High Priority:'}</span>
                      <span className="font-extrabold text-rose-800">{card.highPriority}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400 mb-3 flex items-center justify-between">
                    <span>{language === 'ar' ? 'آخر تحديث:' : 'Last updated:'}</span>
                    <span className="font-semibold text-slate-600">{cardUpdatedAt}</span>
                  </div>

                  {/* CTA Button linking to domain admin workspace */}
                  <Link
                    to={card.path}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0F4B3A] text-white hover:bg-[#0c3e30] font-bold text-xs rounded-xl shadow-sm transition-all active:scale-[0.98]"
                  >
                    <span>
                      {t('open_in_workspace') || (language === 'ar' ? 'فتح في لوحة المجال' : 'Open in Workspace')}
                    </span>
                    <ExternalLink className={`w-3.5 h-3.5 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Reasons Breakdown Section */}
      <div className="mb-10">
        <h2 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-600" />
          {t('review_reasons_breakdown') || (language === 'ar' ? 'تحليل أسباب المراجعة' : 'Review Reasons Breakdown')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {reviewReasons.map((reason) => {
            const title = language === 'ar' ? reason.titleAr : reason.titleEn;
            return (
              <div 
                key={reason.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 shadow-xs ${reason.color}`}
              >
                <span className="text-xs font-bold leading-snug">{title}</span>
                <span className="px-2.5 py-0.5 bg-white/90 rounded-full text-xs font-black shadow-xs">
                  {reason.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safe Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 mb-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4 text-sm font-extrabold text-slate-800">
          <Filter className="w-4 h-4 text-[#0F4B3A]" />
          <span>{language === 'ar' ? 'تصفية الأعمال المعلقة (قراءة فقط)' : 'Filter Pending Work (Read-Only View)'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Domain Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              {t('filter_by_domain') || (language === 'ar' ? 'التصفية حسب المجال' : 'Domain')}
            </label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">{t('all_domains') || (language === 'ar' ? 'جميع المجالات' : 'All Domains')}</option>
              <option value="scholarships">{language === 'ar' ? 'المنح الدراسية' : 'Scholarships'}</option>
              <option value="universities">{language === 'ar' ? 'الجامعات' : 'Universities'}</option>
              <option value="majors">{language === 'ar' ? 'التخصصات' : 'Majors'}</option>
              <option value="courses">{language === 'ar' ? 'الدورات التدريبية' : 'Courses'}</option>
              <option value="tests">{language === 'ar' ? 'الاختبارات الدولية' : 'International Tests'}</option>
              <option value="services">{language === 'ar' ? 'الخدمات' : 'Services'}</option>
              <option value="cms">{language === 'ar' ? 'المقالات والمحتوى (CMS)' : 'CMS / Articles'}</option>
            </select>
          </div>

          {/* Reason Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              {t('filter_by_reason') || (language === 'ar' ? 'التصفية حسب السبب' : 'Reason')}
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">{t('all_reasons') || (language === 'ar' ? 'جميع الأسباب' : 'All Reasons')}</option>
              <option value="missing_ar_translation">{language === 'ar' ? 'غياب الترجمة العربية' : 'Missing Arabic translation'}</option>
              <option value="missing_en_translation">{language === 'ar' ? 'غياب الترجمة الإنجليزية' : 'Missing English translation'}</option>
              <option value="missing_source_url">{language === 'ar' ? 'غياب رابط المصدر الرسمي' : 'Missing official source URL'}</option>
              <option value="missing_eap_asset">{language === 'ar' ? 'غياب الصورة/الأصل المرئي' : 'Missing EAP asset/image'}</option>
              <option value="incomplete_required_fields">{language === 'ar' ? 'حقول مطلوبة ناقصة' : 'Incomplete required fields'}</option>
              <option value="needs_admin_verification">{language === 'ar' ? 'يحتاج تحقق المسؤول' : 'Needs admin verification'}</option>
              <option value="ai_draft_awaiting_human">{language === 'ar' ? 'مسودة ذكاء اصطناعي' : 'AI draft awaiting human review'}</option>
              <option value="imported_data_awaiting_domain">{language === 'ar' ? 'بيانات مستوردة' : 'Imported data awaiting review'}</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              {t('filter_by_priority') || (language === 'ar' ? 'التصفية حسب الأولوية' : 'Priority')}
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">{t('all_priorities') || (language === 'ar' ? 'جميع الأولويات' : 'All Priorities')}</option>
              <option value="high">{t('priority_high') || (language === 'ar' ? 'عالية' : 'High')}</option>
              <option value="medium">{t('priority_medium') || (language === 'ar' ? 'متوسطة' : 'Medium')}</option>
              <option value="low">{t('priority_low') || (language === 'ar' ? 'منخفضة' : 'Low')}</option>
            </select>
          </div>

          {/* Source Type Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              {t('filter_by_source') || (language === 'ar' ? 'التصفية حسب المصدر' : 'Source Type')}
            </label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">{t('all_sources') || (language === 'ar' ? 'جميع المصادر' : 'All Sources')}</option>
              <option value="manual">{language === 'ar' ? 'إدخال يدوي' : 'Manual Entry'}</option>
              <option value="csv_import">{language === 'ar' ? 'استيراد CSV/JSON' : 'CSV/JSON Import'}</option>
              <option value="url_import">{language === 'ar' ? 'استيراد رابط' : 'URL Import'}</option>
              <option value="ai_draft">{language === 'ar' ? 'مسودة ذكاء اصطناعي' : 'AI Draft'}</option>
              <option value="cms_draft">{language === 'ar' ? 'مسودة CMS' : 'CMS Draft'}</option>
            </select>
          </div>

          {/* Age Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              {t('filter_by_age') || (language === 'ar' ? 'التصفية حسب التاريخ' : 'Age')}
            </label>
            <select
              value={selectedAge}
              onChange={(e) => setSelectedAge(e.target.value)}
              className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">{t('all_ages') || (language === 'ar' ? 'جميع التواريخ' : 'All Ages')}</option>
              <option value="today">{language === 'ar' ? 'اليوم' : 'Today'}</option>
              <option value="this_week">{language === 'ar' ? 'هذا الأسبوع' : 'This Week'}</option>
              <option value="older">{language === 'ar' ? 'أقدم' : 'Older'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Read-Only Recent Pending Work List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            {t('recent_pending_work_list') || (language === 'ar' ? 'قائمة الأعمال المعلقة الحديثة (سجلات للقراءة فقط)' : 'Recent Pending Work Queue (Read-Only)')}
          </h2>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {filteredItems.length} {language === 'ar' ? 'عنصر معروض' : 'items shown'}
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm font-medium">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            {t('no_pending_work_matching_filters') || (language === 'ar' ? 'لم يتم العثور على أعمال معلقة تطابق معايير التصفية المختارة.' : 'No pending items found matching the selected filter criteria.')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs text-slate-700" dir={dir}>
              <thead className="bg-slate-50 border-b border-slate-200 font-extrabold text-slate-800 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-4 py-3.5 text-start">{language === 'ar' ? 'عنوان العنصر' : 'Item Title'}</th>
                  <th scope="col" className="px-4 py-3.5 text-start">{language === 'ar' ? 'المجال / النطاق' : 'Domain'}</th>
                  <th scope="col" className="px-4 py-3.5 text-start">{language === 'ar' ? 'سبب المراجعة' : 'Reason'}</th>
                  <th scope="col" className="px-4 py-3.5 text-start">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th scope="col" className="px-4 py-3.5 text-start">{language === 'ar' ? 'الأولوية' : 'Priority'}</th>
                  <th scope="col" className="px-4 py-3.5 text-start">{language === 'ar' ? 'آخر تحديث' : 'Last Updated'}</th>
                  <th scope="col" className="px-4 py-3.5 text-center">{language === 'ar' ? 'الإجراء الوحيد الآمن' : 'Safe Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredItems.map((item) => {
                  const title = language === 'ar' ? item.titleAr : item.titleEn;
                  const domainName = language === 'ar' ? item.domainNameAr : item.domainNameEn;
                  const reason = language === 'ar' ? item.reasonAr : item.reasonEn;
                  const updatedAt = language === 'ar' ? item.updatedAtAr : item.updatedAtEn;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Item title */}
                      <td className="px-4 py-4 text-start font-bold text-slate-900 max-w-xs">
                        <div className="line-clamp-2 leading-relaxed">{title}</div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                          {language === 'ar' ? `المصدر: ${item.sourceTypeAr}` : `Source: ${item.sourceTypeEn}`}
                        </div>
                      </td>

                      {/* Domain */}
                      <td className="px-4 py-4 text-start font-semibold whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold">
                          {domainName}
                        </span>
                      </td>

                      {/* Reason */}
                      <td className="px-4 py-4 text-start font-medium max-w-xs text-slate-600">
                        <div className="line-clamp-2">{reason}</div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 text-start whitespace-nowrap">
                        {getStatusBadge(item.statusKey, item.statusAr, item.statusEn)}
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-4 text-start whitespace-nowrap">
                        {getPriorityBadge(item.priority)}
                      </td>

                      {/* Last updated */}
                      <td className="px-4 py-4 text-start text-slate-500 font-medium whitespace-nowrap">
                        {updatedAt}
                      </td>

                      {/* Action CTA ONLY -> Open in Domain Workspace */}
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <Link
                          to={item.domainPath}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F4B3A] text-white hover:bg-[#0c3e30] font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
                          title={language === 'ar' ? `الانتقال لمراجعة السجل في ${domainName}` : `Open record in ${domainName}`}
                        >
                          <span>{t('open_in_workspace') || (language === 'ar' ? 'فتح في لوحة المجال' : 'Open in Workspace')}</span>
                          <ExternalLink className={`w-3.5 h-3.5 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminReviewQueuePreviewPage;
