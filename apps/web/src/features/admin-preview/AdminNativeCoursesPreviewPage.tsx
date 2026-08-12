import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/I18nProvider';
import { 
  BookOpen, Plus, Search, Filter, Award, CheckCircle2, Clock, AlertTriangle, 
  FileCheck2, Archive, ArrowRight, ArrowLeft, Layers, Video, FileText, 
  HelpCircle, ChevronRight, ChevronLeft, X, Sparkles, AlertCircle, Edit3, Eye, DollarSign
} from 'lucide-react';
import { ApiClient } from '../../api/client';

export function AdminNativeCoursesPreviewPage() {
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [priceTypeFilter, setPriceTypeFilter] = useState('ALL');

  // Create Native Course Wizard Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Wizard Form State
  const [wizardForm, setWizardForm] = useState({
    titleAr: '',
    titleEn: '',
    description: '',
    category: 'Computer Science & AI',
    level: 'Beginner',
    language: 'Arabic',
    instructor: 'د. أحمد السعيد',
    coverImageAssetRef: 'eap_asset_course_cover_default',
    priceType: 'Free',
    approxPrice: '$0',
    modules: [
      {
        id: 'mod_1',
        title: 'الوحدة الأولى: المدخل والأساسيات',
        order: 1,
        lessons: [
          { id: 'les_1', title: 'مقدمة في المفاهيم الأساسية', durationMins: 15, type: 'video', eapRef: 'eap_asset_vid_01' },
          { id: 'les_2', title: 'دليل النظريات والتطبيقات', durationMins: 25, type: 'text', eapRef: '' }
        ]
      }
    ],
    mediaAssets: [
      { id: 'media_1', name: 'Introductory Lecture Video', type: 'video/mp4', eapAssetId: 'eap_asset_vid_01', size: '120 MB' },
      { id: 'media_2', name: 'Course Handbook PDF', type: 'application/pdf', eapAssetId: 'eap_asset_doc_01', size: '4.2 MB' }
    ],
    assessments: {
      hasModuleQuizzes: true,
      hasFinalExam: true,
      passingScorePercent: 70,
      attemptLimit: 3,
      questionBank: [
        { id: 'q_1', question: 'ما هو الهدف الرئيسي من الوحدة الأولى؟', type: 'mcq', choices: ['فهم الأساسيات', 'التطبيقي المتقدم', 'إعداد التقرير'], correctAnswer: 'فهم الأساسيات' },
        { id: 'q_2', question: 'تعتبر المفاهيم الأساسية متطلباً سابقاً للدروس التفاعلية.', type: 'true_false', choices: ['صح', 'خطأ'], correctAnswer: 'صح' }
      ]
    },
    certificateConfig: {
      certificateEnabled: true,
      templateRef: 'cert_tpl_manaratak_standard_v1',
      passingRequirements: 'Complete all modules and achieve >= 70% in final exam'
    },
    status: 'DRAFT'
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getAdminNativeCourses({});
      if (res && res.data && res.data.length > 0) {
        setCourses(res.data);
      } else {
        setCourses(getSampleNativeCourses());
      }
    } catch {
      setCourses(getSampleNativeCourses());
    } finally {
      setLoading(false);
    }
  };

  const getSampleNativeCourses = () => [
    {
      id: 'crs_native_101',
      titleAr: 'أساسيات الذكاء الاصطناعي وهندسة الأوامر',
      titleEn: 'AI Fundamentals & Prompt Engineering',
      category: 'Computer Science & AI',
      level: 'Beginner',
      language: 'Arabic',
      priceType: 'Free',
      approxPrice: 'Free',
      instructor: 'د. خالد العمري',
      status: 'PUBLISHED',
      certificateEnabled: true,
      missingContent: false,
      modulesCount: 4,
      lessonsCount: 16,
      updatedAt: '2026-07-20'
    },
    {
      id: 'crs_native_102',
      titleAr: 'القيادة الاستراتيجية وإدارة المؤسسات الأكاديمية',
      titleEn: 'Strategic Leadership & Academic Administration',
      category: 'Business & Leadership',
      level: 'Advanced',
      language: 'Bilingual',
      priceType: 'Paid',
      approxPrice: '$150 USD',
      instructor: 'أ.د. نورة الشمري',
      status: 'READY_TO_PUBLISH',
      certificateEnabled: true,
      missingContent: false,
      modulesCount: 6,
      lessonsCount: 24,
      updatedAt: '2026-07-22'
    },
    {
      id: 'crs_native_103',
      titleAr: 'منهجية البحث العلمي والأمانة الأكاديمية',
      titleEn: 'Scientific Research Methodology & Academic Integrity',
      category: 'Research & Science',
      level: 'Intermediate',
      language: 'Arabic',
      priceType: 'Free',
      approxPrice: 'Free',
      instructor: 'د. يوسف التميمي',
      status: 'UNDER_REVIEW',
      certificateEnabled: true,
      missingContent: false,
      modulesCount: 5,
      lessonsCount: 18,
      updatedAt: '2026-07-25'
    },
    {
      id: 'crs_native_104',
      titleAr: 'المهارات الناعمة والتواصل الأكاديمي المتقدم',
      titleEn: 'Soft Skills & Advanced Academic Communication',
      category: 'Soft Skills',
      level: 'Beginner',
      language: 'Arabic',
      priceType: 'Draft Pricing',
      approxPrice: 'Pending Pricing',
      instructor: 'م. سارة الغامدي',
      status: 'DRAFT',
      certificateEnabled: false,
      missingContent: true,
      modulesCount: 2,
      lessonsCount: 5,
      updatedAt: '2026-07-27'
    }
  ];

  // Calculate 8 Dashboard Counters
  const totalCount = courses.length;
  const draftCount = courses.filter(c => c.status === 'DRAFT').length;
  const underReviewCount = courses.filter(c => c.status === 'UNDER_REVIEW').length;
  const readyToPublishCount = courses.filter(c => c.status === 'READY_TO_PUBLISH').length;
  const publishedCount = courses.filter(c => c.status === 'PUBLISHED').length;
  const archivedCount = courses.filter(c => c.status === 'ARCHIVED').length;
  const certEnabledCount = courses.filter(c => c.certificateEnabled).length;
  const missingContentCount = courses.filter(c => c.missingContent).length;

  // Filter Courses
  const filteredCourses = courses.filter(c => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      !query ||
      c.titleAr?.toLowerCase().includes(query) ||
      c.titleEn?.toLowerCase().includes(query) ||
      c.instructor?.toLowerCase().includes(query) ||
      c.category?.toLowerCase().includes(query);

    const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesLevel = levelFilter === 'ALL' || c.level === levelFilter;
    const matchesPrice = priceTypeFilter === 'ALL' || c.priceType === priceTypeFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesLevel && matchesPrice;
  });

  const handleCreateCourseSubmit = () => {
    const newCourse = {
      id: `crs_native_${Date.now().toString().slice(-4)}`,
      titleAr: wizardForm.titleAr || (isRTL ? 'دورة منارتك جديدة' : 'New Native Course'),
      titleEn: wizardForm.titleEn || 'New Native Course',
      category: wizardForm.category,
      level: wizardForm.level,
      language: wizardForm.language,
      priceType: wizardForm.priceType,
      approxPrice: wizardForm.priceType === 'Free' ? 'Free' : wizardForm.approxPrice,
      instructor: wizardForm.instructor,
      status: wizardForm.status || 'DRAFT',
      certificateEnabled: wizardForm.certificateConfig.certificateEnabled,
      missingContent: wizardForm.modules.length === 0,
      modulesCount: wizardForm.modules.length,
      lessonsCount: wizardForm.modules.reduce((acc, m) => acc + m.lessons.length, 0),
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setCourses([newCourse, ...courses]);
    setShowCreateModal(false);
    setWizardStep(1);
    navigate(`/admin/courses/native/${newCourse.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link to="/admin/courses" className="hover:text-emerald-600 dark:hover:text-emerald-400">
          {t('admin_courses') || 'Courses'}
        </Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-white font-medium">
          {t('native_manaratak_courses') || 'Native MANARATAK Courses'}
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Native Authoring Engine
            </span>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Phase 13 Domain
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>{t('native_manaratak_courses') || 'Native MANARATAK Courses'}</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-2xl">
            {isRTL
              ? 'إدارة وتأليف المناهج والدروس والتقييمات والشهادات المنشأة مباشرة داخل منارتك.'
              : 'Author and manage native courses, module structures, lesson content, question banks, and certificates built inside MANARATAK.'}
          </p>
        </div>

        <button
          onClick={() => {
            setWizardStep(1);
            setShowCreateModal(true);
          }}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('create_native_course') || 'Create Native Course'}</span>
        </button>
      </div>

      {/* 8 Top Statistics Dashboard Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">{t('all_native_courses') || 'All Native Courses'}</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">{totalCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">{t('admin_status_draft') || 'Draft'}</span>
          <span className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">{draftCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">{t('under_review') || 'Under Review'}</span>
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1 block">{underReviewCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">{t('admin_status_ready_to_publish') || 'Ready to Publish'}</span>
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">{readyToPublishCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">{t('admin_status_published') || 'Published'}</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">{publishedCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">{t('admin_status_archived') || 'Archived'}</span>
          <span className="text-xl font-bold text-slate-500 dark:text-slate-400 mt-1 block">{archivedCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">{t('certificate_enabled') || 'Certificate Enabled'}</span>
          <span className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-1 block">{certEnabledCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">{t('missing_content') || 'Missing Content'}</span>
          <span className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1 block">{missingContentCount}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute top-3 left-3 text-slate-400 rtl:right-3 rtl:left-auto" />
            <input
              type="text"
              placeholder={isRTL ? 'بحث بالاسم، المدرب، المجال...' : 'Search title, instructor, category...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 rtl:pr-9 rtl:pl-4"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">{isRTL ? 'كل المجالات' : 'All Categories'}</option>
            <option value="Computer Science & AI">{isRTL ? 'الذكاء الاصطناعي والحاسب' : 'Computer Science & AI'}</option>
            <option value="Business & Leadership">{isRTL ? 'الإدارة والقيادة' : 'Business & Leadership'}</option>
            <option value="Research & Science">{isRTL ? 'البحث العلمي' : 'Research & Science'}</option>
            <option value="Soft Skills">{isRTL ? 'المهارات الناعمة' : 'Soft Skills'}</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">{isRTL ? 'كل الحالات' : 'All Statuses'}</option>
            <option value="DRAFT">{isRTL ? 'مسودة' : 'Draft'}</option>
            <option value="UNDER_REVIEW">{isRTL ? 'قيد المراجعة' : 'Under Review'}</option>
            <option value="READY_TO_PUBLISH">{isRTL ? 'جاهزة للنشر' : 'Ready to Publish'}</option>
            <option value="PUBLISHED">{isRTL ? 'منشورة' : 'Published'}</option>
            <option value="ARCHIVED">{isRTL ? 'مؤرشفة' : 'Archived'}</option>
          </select>

          {/* Price Type Filter */}
          <select
            value={priceTypeFilter}
            onChange={e => setPriceTypeFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">{isRTL ? 'كل أنواع التسعير' : 'All Price Types'}</option>
            <option value="Free">{isRTL ? 'مجانية' : 'Free'}</option>
            <option value="Paid">{isRTL ? 'مدفوعة' : 'Paid'}</option>
            <option value="Draft Pricing">{isRTL ? 'تسعير مسودة' : 'Draft Pricing'}</option>
          </select>
        </div>
      </div>

      {/* Lightweight Vertical List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredCourses.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl mx-auto flex items-center justify-center">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('no_native_courses_found') || 'No native MANARATAK courses found'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
              {t('no_native_courses_desc') || 'Get started by authoring your first native MANARATAK course curriculum.'}
            </p>
            <button
              onClick={() => {
                setWizardStep(1);
                setShowCreateModal(true);
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t('create_native_course') || 'Create Native Course'}</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredCourses.map((course) => (
              <div 
                key={course.id}
                className="p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Course Main Details */}
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {course.category}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {course.level}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {course.language}
                    </span>
                    {course.certificateEnabled && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        <span>{isRTL ? 'الشهادة مفعلة' : 'Cert Enabled'}</span>
                      </span>
                    )}
                    {course.missingContent && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{isRTL ? 'محتوى ناقص' : 'Missing Content'}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {isRTL ? course.titleAr : (course.titleEn || course.titleAr)}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span>{isRTL ? `المدرب: ${course.instructor}` : `Instructor: ${course.instructor}`}</span>
                    <span>•</span>
                    <span>{isRTL ? `${course.modulesCount} وحدات (${course.lessonsCount} دروس)` : `${course.modulesCount} Modules (${course.lessonsCount} Lessons)`}</span>
                    <span>•</span>
                    <span>{isRTL ? `التسعير: ${course.priceType} (${course.approxPrice})` : `Pricing: ${course.priceType} (${course.approxPrice})`}</span>
                  </div>
                </div>

                {/* Status & View Details Action */}
                <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                    course.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800' :
                    course.status === 'READY_TO_PUBLISH' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800' :
                    course.status === 'UNDER_REVIEW' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800' :
                    course.status === 'ARCHIVED' ? 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' :
                    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                  }`}>
                    {course.status}
                  </span>

                  <Link
                    to={`/admin/courses/native/${course.id}`}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <span>{t('admin_view_details') || 'View Details'}</span>
                    <ArrowIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* "Create Native Course" 6-Step Wizard Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                  Phase 13 Native Course Authoring Wizard
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t('create_native_course') || 'Create Native Course'}
                </h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Indicators */}
            <div className="px-6 py-3 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs overflow-x-auto">
              {[
                { num: 1, label: isRTL ? 'الأساسيات' : '1. Basics' },
                { num: 2, label: isRTL ? 'المنهج والدروس' : '2. Curriculum' },
                { num: 3, label: isRTL ? 'الوسائط EAP' : '3. Media EAP' },
                { num: 4, label: isRTL ? 'التقييمات' : '4. Assessments' },
                { num: 5, label: isRTL ? 'الشهادة' : '5. Certificate' },
                { num: 6, label: isRTL ? 'المراجعة والنشر' : '6. Review & Publish' }
              ].map(s => (
                <button
                  key={s.num}
                  onClick={() => setWizardStep(s.num)}
                  className={`px-2.5 py-1 rounded-md font-medium shrink-0 transition-colors ${
                    wizardStep === s.num
                      ? 'bg-emerald-600 text-white'
                      : wizardStep > s.num
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* STEP 1: Course Basics */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b pb-2">
                    {isRTL ? 'الخطوة 1: البيانات الأساسية للدورة' : 'Step 1: Course Basics'}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                        {isRTL ? 'عنوان الدورة (بالعربية)' : 'Course Title (Arabic)'}
                      </label>
                      <input
                        type="text"
                        value={wizardForm.titleAr}
                        onChange={e => setWizardForm({ ...wizardForm, titleAr: e.target.value })}
                        placeholder="مثال: أساسيات الذكاء الاصطناعي"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                        {isRTL ? 'عنوان الدورة (بالإنجليزية)' : 'Course Title (English)'}
                      </label>
                      <input
                        type="text"
                        value={wizardForm.titleEn}
                        onChange={e => setWizardForm({ ...wizardForm, titleEn: e.target.value })}
                        placeholder="e.g. AI Fundamentals"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      {isRTL ? 'وصف مختصر للدورة' : 'Short Course Description'}
                    </label>
                    <textarea
                      rows={3}
                      value={wizardForm.description}
                      onChange={e => setWizardForm({ ...wizardForm, description: e.target.value })}
                      placeholder={isRTL ? 'مقدمة شاملة عن أهداف ومخرجات الدورة التعليمية...' : 'Comprehensive overview of course goals and learning outcomes...'}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                        {isRTL ? 'المجال / التصنيف' : 'Category / Field'}
                      </label>
                      <select
                        value={wizardForm.category}
                        onChange={e => setWizardForm({ ...wizardForm, category: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white"
                      >
                        <option value="Computer Science & AI">Computer Science & AI</option>
                        <option value="Business & Leadership">Business & Leadership</option>
                        <option value="Research & Science">Research & Science</option>
                        <option value="Soft Skills">Soft Skills</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                        {isRTL ? 'المستوى' : 'Level'}
                      </label>
                      <select
                        value={wizardForm.level}
                        onChange={e => setWizardForm({ ...wizardForm, level: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white"
                      >
                        <option value="Beginner">Beginner / مبتدئ</option>
                        <option value="Intermediate">Intermediate / متوسط</option>
                        <option value="Advanced">Advanced / متقدم</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                        {isRTL ? 'لغة التدريس' : 'Language'}
                      </label>
                      <select
                        value={wizardForm.language}
                        onChange={e => setWizardForm({ ...wizardForm, language: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white"
                      >
                        <option value="Arabic">العربية</option>
                        <option value="English">English</option>
                        <option value="Bilingual">مزدوج (Bilingual)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                        {isRTL ? 'المدرب / المحاضر' : 'Instructor Name'}
                      </label>
                      <input
                        type="text"
                        value={wizardForm.instructor}
                        onChange={e => setWizardForm({ ...wizardForm, instructor: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                        {isRTL ? 'مرجع صورة الغلاف (Phase 05 EAP Asset ID)' : 'Cover Image EAP Asset ID'}
                      </label>
                      <input
                        type="text"
                        value={wizardForm.coverImageAssetRef}
                        onChange={e => setWizardForm({ ...wizardForm, coverImageAssetRef: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Curriculum Builder */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {isRTL ? 'الخطوة 2: منشئ المنهج والوحدات والدروس' : 'Step 2: Curriculum Builder'}
                    </h3>
                    <button
                      onClick={() => {
                        const newMod = {
                          id: `mod_${wizardForm.modules.length + 1}`,
                          title: `الوحدة ${wizardForm.modules.length + 1}`,
                          order: wizardForm.modules.length + 1,
                          lessons: []
                        };
                        setWizardForm({ ...wizardForm, modules: [...wizardForm.modules, newMod] });
                      }}
                      className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg text-xs font-medium flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isRTL ? 'إضافة وحدة جديدة' : 'Add Module'}</span>
                    </button>
                  </div>

                  {wizardForm.modules.map((mod, mIdx) => (
                    <div key={mod.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={mod.title}
                          onChange={e => {
                            const updatedMods = [...wizardForm.modules];
                            updatedMods[mIdx].title = e.target.value;
                            setWizardForm({ ...wizardForm, modules: updatedMods });
                          }}
                          className="font-bold text-sm bg-white dark:bg-slate-800 px-3 py-1.5 border rounded-md text-slate-900 dark:text-white w-2/3"
                        />
                        <button
                          onClick={() => {
                            const newLes = {
                              id: `les_${Date.now()}`,
                              title: 'درس جديد',
                              durationMins: 20,
                              type: 'video',
                              eapRef: ''
                            };
                            const updatedMods = [...wizardForm.modules];
                            updatedMods[mIdx].lessons.push(newLes);
                            setWizardForm({ ...wizardForm, modules: updatedMods });
                          }}
                          className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md text-xs font-medium flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{isRTL ? 'إضافة درس' : 'Add Lesson'}</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {mod.lessons.map((les, lIdx) => (
                          <div key={les.id} className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 text-xs">
                            <span className="font-medium text-slate-900 dark:text-white">
                              {lIdx + 1}. {les.title}
                            </span>
                            <div className="flex items-center gap-2 text-slate-500">
                              <span>{les.durationMins}m</span>
                              <span className="uppercase px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">{les.type}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 3: Media & Attachments */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b pb-2">
                    {isRTL ? 'الخطوة 3: مرفقات الوسائط عبر EAP Assets (Phase 05)' : 'Step 3: Media Assets via Phase 05 EAP'}
                  </h3>

                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300">
                    {isRTL 
                      ? 'ملاحظة معمارية: يتم تخزين كافة ملفات الفيديو، مستندات PDF، والمستندات عبر معرفات أصول Phase 05 EAP (Asset Ref IDs) دون تخزين مسارات ملفات خام.'
                      : 'Architectural Note: All video files, PDFs, and document assets are managed strictly via Phase 05 EAP Asset Reference IDs without storing raw file paths.'}
                  </div>

                  <div className="space-y-2">
                    {wizardForm.mediaAssets.map((media) => (
                      <div key={media.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{media.name}</span>
                          <span className="text-slate-500 font-mono">EAP ID: {media.eapAssetId} ({media.size})</span>
                        </div>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded font-semibold">
                          EAP Attached
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: Assessments */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b pb-2">
                    {isRTL ? 'الخطوة 4: التقييمات وبنك الأسئلة (Phase 13 Domain)' : 'Step 4: Assessments & Question Bank'}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                        {isRTL ? 'درجة النجاح المطلوبة (%)' : 'Passing Score Percentage (%)'}
                      </label>
                      <input
                        type="number"
                        value={wizardForm.assessments.passingScorePercent}
                        onChange={e => setWizardForm({
                          ...wizardForm,
                          assessments: { ...wizardForm.assessments, passingScorePercent: Number(e.target.value) }
                        })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                        {isRTL ? 'حد المحاولات المسموحة' : 'Attempt Limit'}
                      </label>
                      <input
                        type="number"
                        value={wizardForm.assessments.attemptLimit}
                        onChange={e => setWizardForm({
                          ...wizardForm,
                          assessments: { ...wizardForm.assessments, attemptLimit: Number(e.target.value) }
                        })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {isRTL ? 'مسودة بنك الأسئلة (Question Bank Draft)' : 'Question Bank Draft'}
                    </span>
                    {wizardForm.assessments.questionBank.map((q, idx) => (
                      <div key={q.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                        <span className="font-bold text-slate-900 dark:text-white">س{idx + 1}: {q.question}</span>
                        <div className="text-slate-500">{isRTL ? `الخيارات: ${q.choices.join(', ')} | الإجابة الصحيحة: ${q.correctAnswer}` : `Choices: ${q.choices.join(', ')} | Correct: ${q.correctAnswer}`}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 5: Certificate Settings */}
              {wizardStep === 5 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b pb-2">
                    {isRTL ? 'الخطوة 5: إعدادات الشهادة (Phase 14 Boundary)' : 'Step 5: Certificate Settings'}
                  </h3>

                  <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-300">
                    {isRTL
                      ? 'حدود المسئولية المعمارية: Phase 14 يمتلك محرك توليد وإصدار الشهادات عند إكمال الطالب للمتطلبات. يحدد مسؤول النظام هنا فقط شروط الأهلية ومرجع القالب.'
                      : 'Architectural Boundary Notice: Phase 14 owns certificate generation & issuance upon student completion. Admin configures course completion eligibility rules here.'}
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="certToggle"
                      checked={wizardForm.certificateConfig.certificateEnabled}
                      onChange={e => setWizardForm({
                        ...wizardForm,
                        certificateConfig: { ...wizardForm.certificateConfig, certificateEnabled: e.target.checked }
                      })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <label htmlFor="certToggle" className="text-xs font-bold text-slate-900 dark:text-white">
                      {isRTL ? 'تفعيل إصدار شهادة عند إكمال الدورة' : 'Enable Completion Certificate'}
                    </label>
                  </div>

                  <div className="text-xs">
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      {isRTL ? 'معرف قالب الشهادة (Phase 14 Template ID)' : 'Phase 14 Template Reference ID'}
                    </label>
                    <input
                      type="text"
                      value={wizardForm.certificateConfig.templateRef}
                      onChange={e => setWizardForm({
                        ...wizardForm,
                        certificateConfig: { ...wizardForm.certificateConfig, templateRef: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              )}

              {/* STEP 6: Review & Publish Readiness */}
              {wizardStep === 6 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b pb-2">
                    {isRTL ? 'الخطوة 6: المراجعة الجاهزية للنشر' : 'Step 6: Review & Publish Readiness'}
                  </h3>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <span className="font-bold text-slate-900 dark:text-white block">{isRTL ? 'قائمة التحقق من الجاهزية:' : 'Completeness Checklist:'}</span>
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isRTL ? 'البيانات الأساسية مكتملة' : 'Course Basics complete'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isRTL ? `تم بناء ${wizardForm.modules.length} وحدات منهج` : `${wizardForm.modules.length} modules configured`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isRTL ? 'تم إرفاق وسائط التعليم عبر EAP Assets' : 'Media assets attached via Phase 05 EAP'}</span>
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      {isRTL ? 'حالة الدورة الابتدائية' : 'Initial Course Status'}
                    </label>
                    <select
                      value={wizardForm.status}
                      onChange={e => setWizardForm({ ...wizardForm, status: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white"
                    >
                      <option value="DRAFT">DRAFT / مسودة</option>
                      <option value="UNDER_REVIEW">UNDER_REVIEW / قيد المراجعة</option>
                      <option value="READY_TO_PUBLISH">READY_TO_PUBLISH / جاهزة للنشر</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
              <button
                disabled={wizardStep === 1}
                onClick={() => setWizardStep(prev => prev - 1)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-medium disabled:opacity-50"
              >
                {isRTL ? 'السابق' : 'Previous'}
              </button>

              {wizardStep < 6 ? (
                <button
                  onClick={() => setWizardStep(prev => prev + 1)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium flex items-center gap-1"
                >
                  <span>{isRTL ? 'التالي' : 'Next'}</span>
                  <ArrowIcon className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleCreateCourseSubmit}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {isRTL ? 'حفظ وإنشاء الدورة' : 'Save & Create Course'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
