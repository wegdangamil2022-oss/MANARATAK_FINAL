import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/I18nProvider';
import { 
  GraduationCap, Briefcase, ArrowLeft, ArrowRight, ShieldAlert, 
  CheckCircle2, Clock, AlertTriangle, Layers, FileText, ArrowUpRight,
  UserCheck, Globe2
} from 'lucide-react';

export function AdminServicesLandingPage() {
  const navigate = useNavigate();
  const { isRTL } = useTranslation();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 dir-rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <span>لوحة التحكم الإدارية</span>
            <span>/</span>
            <span className="text-emerald-600 font-medium">إدارة الخدمات</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-emerald-600" />
            مساحة إدارة الخدمات والمساندة (Phase 20)
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            إدارة عروض الخدمات والكتالوجات الطلابية والدعم العام، إعداد الباقات والاشتراطات، وجهوزية النشر والتكامل المالي.
          </p>
        </div>
      </div>

      {/* Mandatory Boundary Notice Banner */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900 dark:text-amber-200 space-y-1">
          <p className="font-semibold">
            حدود البنية والمعمارية البرمجية (Architecture Boundaries Notice):
          </p>
          <p className="text-amber-800 dark:text-amber-300">
            الخدمات هنا عروض غير تعليمية ضمن المرحلة 20. الدورات المدفوعة تبقى ضمن المرحلة 13. تنفيذ الدفع يتم عبر المرحلة 19.
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400 dir-ltr">
            Services are non-course offerings under Phase 20. Paid courses remain Phase 13 learning offerings. Payment execution is handled by Phase 19.
          </p>
        </div>
      </div>

      {/* Two Large Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Card 1: Student Services */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Phase 20 - Student Services
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">الخدمات الطلابية</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Student Services</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">
                تأهيل واستشارات القبول الجامعي، مراجعة ملف التقديم، إعداد خطاب الغرض من الدراسة، خطاب الدافع، مراجعة السيرة الذاتية، دعم طلبات المنح، واستشارات اختيار الجامعة.
              </p>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <div className="text-xs text-gray-500 dark:text-gray-400">إجمالي الخدمات الطلابية</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">18</div>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                <div className="text-xs text-emerald-600 dark:text-emerald-400">الخدمات المنشورة</div>
                <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">12</div>
              </div>
              <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                <div className="text-xs text-amber-600 dark:text-amber-400">مسودة / قيد المراجعة</div>
                <div className="text-xl font-bold text-amber-700 dark:text-amber-300 mt-1">4</div>
              </div>
              <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                <div className="text-xs text-blue-600 dark:text-blue-400">طلبات الطلاب النشطة</div>
                <div className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-1">142</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => navigate('/admin/services/student')}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center justify-center gap-2 transition-colors text-sm shadow-sm"
            >
              <span>فتح قسم الخدمات الطلابية</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card 2: General Services */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Globe2 className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Phase 20 - General Services
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">الخدمات العامة والدعم</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">General Support Services</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">
                ترجمة المستندات والوثائق المعتمدة، تنسيق تصديق الأوراق والشهادات، تجهيز النماذج واستمارات التقديم، مساندة طلبات التأشيرات والسفر، والدعم التشغيلي العام.
              </p>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <div className="text-xs text-gray-500 dark:text-gray-400">إجمالي الخدمات العامة</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">12</div>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                <div className="text-xs text-emerald-600 dark:text-emerald-400">الخدمات المنشورة</div>
                <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">8</div>
              </div>
              <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                <div className="text-xs text-amber-600 dark:text-amber-400">مسودة / قيد المراجعة</div>
                <div className="text-xl font-bold text-amber-700 dark:text-amber-300 mt-1">3</div>
              </div>
              <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                <div className="text-xs text-blue-600 dark:text-blue-400">الطلبات النشطة</div>
                <div className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-1">89</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => navigate('/admin/services/general')}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center gap-2 transition-colors text-sm shadow-sm"
            >
              <span>فتح قسم الخدمات العامة</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
