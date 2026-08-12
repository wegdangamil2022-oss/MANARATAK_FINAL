import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/I18nProvider';
import { BookOpen, DownloadCloud, DollarSign, ArrowRight, ArrowLeft, Layers, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export function AdminCoursesLandingPage() {
  const { t, isRTL } = useTranslation();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const sections = [
    {
      id: 'native',
      titleKey: 'native_manaratak_courses',
      defaultTitle: 'Native MANARATAK Courses',
      descKey: 'native_courses_desc',
      defaultDesc: 'Courses authored directly inside MANARATAK with native curriculum, lessons, assessments, and completion certificates.',
      icon: BookOpen,
      route: '/admin/courses/native',
      badge: isRTL ? 'قسم التأليف المباشر' : 'Native Authoring Workspace',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
      btnText: isRTL ? 'إدارة دورات منارتك' : 'Manage Native Courses',
      highlight: true,
      stats: isRTL ? 'مناهج ودروس وتقييمات منشأة داخلياً' : 'In-house curriculum, modules & assessments'
    },
    {
      id: 'imported',
      titleKey: 'imported_external_courses',
      defaultTitle: 'Imported External Courses',
      descKey: 'imported_courses_desc',
      defaultDesc: 'Course catalogs and learning paths imported from external academic platforms.',
      icon: DownloadCloud,
      route: '/admin/courses/imported',
      badge: isRTL ? 'قسم الدورات المستوردة' : 'Imported Catalog Workspace',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
      btnText: isRTL ? 'إدارة الدورات المستوردة' : 'Manage Imported Courses',
      highlight: false,
      stats: isRTL ? 'تغذية المناهج الخارجية وتجميع الكتالوجات' : 'External feeds & catalog ingestion'
    },
    {
      id: 'paid',
      titleKey: 'paid_courses',
      defaultTitle: 'Paid Courses',
      descKey: 'paid_courses_desc',
      defaultDesc: 'Monetized training programs, premium courses, and paid certifications.',
      icon: DollarSign,
      route: '/admin/courses/paid',
      badge: isRTL ? 'تسعير المرحلة 19' : 'Phase 19 Monetization',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
      btnText: isRTL ? 'استعراض الدورات المدفوعة' : 'View Paid Courses Overview',
      highlight: false,
      stats: isRTL ? 'تكامل بوابة الدفع والاشتراكات' : 'Payment gateway & subscription checkout'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Phase 23 Enterprise Administration
              </span>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Phase 13 Learning Domain
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {t('admin_courses') || 'Courses Administration Workspace'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-3xl text-sm sm:text-base leading-relaxed">
              {isRTL 
                ? 'إدارة المسارات التدريبية والدورات التعليمية. تم تقسيم بيئة العمل إلى 3 أقسام رئيسية للفصل بين الدورات المصممة داخلياً، الكتالوجات المستوردة، والدورات المسعرة.'
                : 'Comprehensive course catalog management. The workspace is structured into three dedicated sections separating native course authoring, imported external feeds, and monetized offerings.'}
            </p>
          </div>
        </div>
      </div>

      {/* Three Main Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div 
              key={section.id} 
              className={`bg-white dark:bg-slate-900 rounded-2xl border p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                section.highlight 
                  ? 'border-emerald-500/50 dark:border-emerald-500/50 ring-1 ring-emerald-500/20' 
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    section.id === 'native' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' :
                    section.id === 'imported' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400' :
                    'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${section.badgeColor}`}>
                    {section.badge}
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {t(section.titleKey) || section.defaultTitle}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed min-h-[4rem]">
                    {t(section.descKey) || section.defaultDesc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{section.stats}</span>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  to={section.route}
                  className={`w-full py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                    section.highlight
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200'
                  }`}
                >
                  <span>{section.btnText}</span>
                  <ArrowIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Architecture Boundaries Guidance Box */}
      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>{isRTL ? 'محددات وقواعد البنية الهندسية (Phase 13 / 05 / 14 / 19 / 23)' : 'Architectural Boundaries & Ownership'}</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="font-semibold text-slate-900 dark:text-white block mb-1">Phase 13 (Learning)</span>
            <span>{isRTL ? 'ملكيات المناهج، الوحدات، الدروس، بنك الأسئلة والتقييمات وتتبع التقدم.' : 'Owns courses, curriculum, modules, lessons, question bank, assessments & progress.'}</span>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="font-semibold text-slate-900 dark:text-white block mb-1">Phase 05 (EAP Assets)</span>
            <span>{isRTL ? 'إدارة مرفقات الفيديو، الصور، ملفات PDF، والمستندات عبر مراجع EAP Asset IDs.' : 'Owns video assets, images, PDFs and documents via EAP Asset Ref IDs.'}</span>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="font-semibold text-slate-900 dark:text-white block mb-1">Phase 14 (Certificates)</span>
            <span>{isRTL ? 'توليد وإصدار الشهادات عند إكمال الطالب للمتطلبات. أدمن Phase 23 يحدد الشروط فقط.' : 'Owns certificate generation & issuance upon completion. Admin sets rules only.'}</span>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="font-semibold text-slate-900 dark:text-white block mb-1">Phase 19 (Payments)</span>
            <span>{isRTL ? 'تنفيذ عمليات الدفع والاشتراكات. لا يتم تنفيذ دفع مباشر داخل محرر المناهج.' : 'Owns payment execution & subscriptions. No checkout inside course authoring.'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
