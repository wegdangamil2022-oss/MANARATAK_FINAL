import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/I18nProvider';
import { 
  FileText, HelpCircle, Layout, Tag, Languages, CheckSquare, 
  ArrowLeft, ArrowRight, ShieldAlert, Sparkles, AlertCircle, Clock, CheckCircle2, FileEdit
} from 'lucide-react';

export function AdminCmsLandingPage() {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const sections = [
    {
      id: 'articles',
      titleAr: 'المقالات والأدلة',
      titleEn: 'Articles & Guides',
      descAr: 'إدارة المقالات الأكاديمية، الأدلة الدراسية، والأخبار التحريرية.',
      descEn: 'Manage academic articles, study guides, and editorial news.',
      icon: FileText,
      path: '/admin/cms/articles',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      stats: {
        total: 124,
        drafts: 18,
        underReview: 12,
        published: 84,
        needsTranslation: 10,
        lastUpdated: 'منذ 25 دقيقة'
      }
    },
    {
      id: 'faqs',
      titleAr: 'الأسئلة الشائعة',
      titleEn: 'FAQs',
      descAr: 'إدارة وتصنيف بنك الأسئلة الإرشادية والأجوبة المعتمدة.',
      descEn: 'Manage and categorize guided questions and approved answers.',
      icon: HelpCircle,
      path: '/admin/cms/faqs',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
      stats: {
        total: 86,
        drafts: 6,
        underReview: 4,
        published: 72,
        needsTranslation: 4,
        lastUpdated: 'منذ ساعتين'
      }
    },
    {
      id: 'pages',
      titleAr: 'الصفحات الثابتة',
      titleEn: 'Static Pages',
      descAr: 'إدارة محتوى صفحات عن المنصة، الخصوصية، الشروط، واتصل بنا.',
      descEn: 'Manage content for About, Privacy, Terms, and Contact pages.',
      icon: Layout,
      path: '/admin/cms/pages',
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
      stats: {
        total: 14,
        drafts: 2,
        underReview: 1,
        published: 11,
        needsTranslation: 2,
        lastUpdated: 'منذ يومين'
      }
    },
    {
      id: 'categories',
      titleAr: 'التصنيفات والوسوم',
      titleEn: 'Categories & Tags',
      descAr: 'تصنيف المحتوى التحريري وتحديد وسوم البحث والوسوم التحريرية.',
      descEn: 'Categorize editorial content and define search/editorial tags.',
      icon: Tag,
      path: '/admin/cms/categories',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
      stats: {
        total: 32,
        drafts: 3,
        underReview: 0,
        published: 29,
        needsTranslation: 5,
        lastUpdated: 'منذ 3 أيام'
      }
    },
    {
      id: 'translations',
      titleAr: 'الترجمات',
      titleEn: 'Translations',
      descAr: 'إدارة وتوطين حمولات المحتوى المتعدد اللغات (Phase 16 Localization).',
      descEn: 'Manage and localize multi-lingual content payloads (Phase 16).',
      icon: Languages,
      path: '/admin/cms/translations',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      stats: {
        total: 210,
        drafts: 24,
        underReview: 15,
        published: 156,
        needsTranslation: 15,
        lastUpdated: 'منذ ساعة'
      }
    },
    {
      id: 'review',
      titleAr: 'مراجعة المحتوى',
      titleEn: 'Content Review Queue',
      descAr: 'طابور التدقيق التحريري والاعتماد قبل النشر النهائي.',
      descEn: 'Editorial review and approval queue prior to final publication.',
      icon: CheckSquare,
      path: '/admin/cms/review',
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
      stats: {
        total: 27,
        drafts: 0,
        underReview: 27,
        published: 0,
        needsTranslation: 6,
        lastUpdated: 'منذ 10 دقائق'
      }
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 dir-rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <span>لوحة التحكم الإدارية</span>
            <span>/</span>
            <span className="text-emerald-600 font-medium">إدارة المحتوى التحريري (CMS)</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            مساحة عمل إدارة المحتوى التحريري والتسويقي (Phase 16 CMS Admin Workspace)
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            إدارة المقالات، الأدلة، الأسئلة الشائعة، الصفحات الثابتة، الترجمات، وسياسات محركات البحث SEO.
          </p>
        </div>
      </div>

      {/* Boundary Reminder Banner */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">تنبيه الحدود المعمارية والسيادة التحريرية (Architecture Boundary):</p>
          <p className="leading-relaxed">
            نظام إدارة المحتوى (CMS - Phase 16) يختص حصرياً بالمحتوى التحريري والتسويقي (المقالات، الأدلة، الأسئلة الشائعة، الصفحات الثابتة، والترجمات). لا يمكن استخدام CMS لتعديل سجلات الكيانات الأساسية (المنح، الجامعات، التخصصات، الدورات، أو الخدمات). الربط مع الكيانات يتم كمرجع تحريري فقط دون تعديل سجل البيانات الأصلية.
          </p>
        </div>
      </div>

      {/* Grid of CMS Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div 
              key={section.id} 
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-emerald-600 dark:text-emerald-400">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${section.badgeColor}`}>
                    {section.stats.total} عنصر
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {section.titleAr}
                  </h3>
                  <p className="text-xs text-gray-400 dir-ltr text-right">
                    {section.titleEn}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                    {section.descAr}
                  </p>
                </div>

                {/* Stat Badges Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-[11px]">
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                    <span className="text-gray-500">مسودات:</span>
                    <span className="font-bold text-amber-600">{section.stats.drafts}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                    <span className="text-gray-500">قيد المراجعة:</span>
                    <span className="font-bold text-blue-600">{section.stats.underReview}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                    <span className="text-gray-500">منشورة:</span>
                    <span className="font-bold text-emerald-600">{section.stats.published}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                    <span className="text-gray-500">تطلب ترجمة:</span>
                    <span className="font-bold text-rose-600">{section.stats.needsTranslation}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{section.stats.lastUpdated}</span>
                </span>

                <button
                  onClick={() => navigate(section.path)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <span>فتح القسم</span>
                  <ArrowIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
