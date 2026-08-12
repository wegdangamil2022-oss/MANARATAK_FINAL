import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/I18nProvider';
import { 
  Layout, Search, Plus, Filter, ArrowLeft, ArrowRight, 
  ExternalLink, CheckCircle2, Clock, ShieldAlert
} from 'lucide-react';

export function AdminCmsPagesPreviewPage() {
  const navigate = useNavigate();
  const { isRTL } = useTranslation();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [pages, setPages] = useState([
    {
      id: 'page_301',
      titleAr: 'عن منصة المناراتك للخدمات التعليمية والأكاديمية',
      titleEn: 'About MANARATAK Educational Platform',
      pageType: 'ABOUT',
      pageTypeLabelAr: 'عن المنصة (About)',
      language: 'ar',
      status: 'PUBLISHED',
      updatedAt: '2026-07-28 08:30'
    },
    {
      id: 'page_302',
      titleAr: 'سياسة الخصوصية وحماية البيانات الشخصية للطلاب',
      titleEn: 'Privacy Policy & Data Protection',
      pageType: 'PRIVACY',
      pageTypeLabelAr: 'سياسة الخصوصية (Privacy)',
      language: 'ar',
      status: 'PUBLISHED',
      updatedAt: '2026-07-20 10:15'
    },
    {
      id: 'page_303',
      titleAr: 'شروط وأحكام الاستخدام والتعاقد في الخدمات الأكاديمية',
      titleEn: 'Terms & Conditions of Service',
      pageType: 'TERMS',
      pageTypeLabelAr: 'الشروط والأحكام (Terms)',
      language: 'ar',
      status: 'PUBLISHED',
      updatedAt: '2026-07-18 11:00'
    },
    {
      id: 'page_304',
      titleAr: 'صفحة التواصل والمساعدة المباشرة مع فريق الدعم',
      titleEn: 'Contact Us & Student Support',
      pageType: 'CONTACT',
      pageTypeLabelAr: 'اتصل بنا (Contact)',
      language: 'ar',
      status: 'IN_REVIEW',
      updatedAt: '2026-07-27 15:20'
    }
  ]);

  const filteredPages = pages.filter(pg => {
    const matchesSearch = pg.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pg.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || pg.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 dir-rtl">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <button onClick={() => navigate('/admin/cms')} className="hover:text-emerald-600">إدارة المحتوى (CMS)</button>
            <span>/</span>
            <span className="text-emerald-600 font-medium">الصفحات الثابتة (Static Pages)</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Layout className="w-6 h-6 text-indigo-600" />
            <span>إدارة الصفحات الثابتة العامة (Static Pages Management)</span>
          </h1>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة صفحة ثابتة جديدة (Add Page)</span>
        </button>
      </div>

      {/* Boundary Reminder Banner */}
      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center gap-3 text-xs text-amber-900 dark:text-amber-300">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <span>تختص هذه الشاشة بصياغة النصوص التعريفية والقانونية فقط. لا يمكن استخدام هذه الصفحات كبديل لبناء واجهات التطبيق الرئسية.</span>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute right-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في عنوان الصفحة..."
            className="w-full pr-9 pl-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            <option value="ALL">جميع الحالات</option>
            <option value="DRAFT">مسودة (Draft)</option>
            <option value="IN_REVIEW">قيد المراجعة (In Review)</option>
            <option value="PUBLISHED">منشور (Published)</option>
          </select>
        </div>
      </div>

      {/* Lightweight List */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {filteredPages.map((pg) => (
            <div 
              key={pg.id}
              className="p-4 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] text-gray-400">{pg.id}</span>
                  <span className="px-2 py-0.5 rounded text-[11px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold">
                    {pg.pageTypeLabelAr}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    اللغة: {pg.language.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                  {pg.titleAr}
                </h3>

                <p className="text-xs text-gray-500 dir-ltr text-right">
                  {pg.titleEn}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                <div className="text-xs space-y-1 text-left md:text-right">
                  <div>
                    {pg.status === 'PUBLISHED' && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        منشور (Published)
                      </span>
                    )}
                    {pg.status === 'IN_REVIEW' && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        قيد المراجعة (In Review)
                      </span>
                    )}
                    {pg.status === 'DRAFT' && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        مسودة (Draft)
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{pg.updatedAt}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/admin/cms/pages/${pg.id}`)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-gray-700 dark:text-gray-300 hover:text-indigo-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <span>عرض التفاصيل</span>
                  <ArrowIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Adding Page */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-gray-900 dark:text-white text-base border-b border-gray-100 dark:border-gray-800 pb-3">
              إضافة صفحة ثابتة جديدة (Create Page Draft)
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-500 mb-1 font-medium">عنوان الصفحة بالعربية:</label>
                <input 
                  type="text" 
                  placeholder="مثال: الشروط والأحكام الخاصة بالخدمات..." 
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1 font-medium">نوع الصفحة:</label>
                <select className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option value="ABOUT">عن المنصة (About)</option>
                  <option value="PRIVACY">سياسة الخصوصية (Privacy)</option>
                  <option value="TERMS">الشروط والأحكام (Terms)</option>
                  <option value="CONTACT">اتصل بنا (Contact)</option>
                  <option value="CUSTOM">صفحة مخصصة (Custom)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 text-xs font-medium"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  navigate('/admin/cms/pages/page_new');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
              >
                إنشاء والذهاب للتفاصيل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
