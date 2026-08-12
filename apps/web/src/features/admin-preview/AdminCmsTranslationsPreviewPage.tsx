import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/I18nProvider';
import { 
  Languages, Search, ArrowLeft, ArrowRight, ShieldAlert, Sparkles, Clock, CheckCircle2, AlertCircle
} from 'lucide-react';

export function AdminCmsTranslationsPreviewPage() {
  const navigate = useNavigate();
  const { isRTL } = useTranslation();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [translations, setTranslations] = useState([
    {
      id: 'trans_501',
      sourceTitleAr: 'دليل الشامل للتقديم على المنح الدراسية التركية المباشرة YTB 2026',
      sourceLang: 'AR',
      targetLang: 'EN',
      status: 'NEEDS_REVIEW',
      statusLabelAr: 'يحتاج مراجعة (Needs Review)',
      updatedAt: 'منذ ساعة'
    },
    {
      id: 'trans_502',
      sourceTitleAr: 'كيفية كتابة خطاب الدافع المتميز للجامعات الألمانية',
      sourceLang: 'AR',
      targetLang: 'EN',
      status: 'DRAFT',
      statusLabelAr: 'مسودة ترجمة (Draft)',
      updatedAt: 'منذ ساعتين'
    },
    {
      id: 'trans_503',
      sourceTitleAr: 'تحديثات معايير الكفاءة اللغوية المطلوبة باختبار IELTS لعام 2026',
      sourceLang: 'AR',
      targetLang: 'EN',
      status: 'PUBLISHED',
      statusLabelAr: 'مترجم ومنشور (Published)',
      updatedAt: 'منذ يومين'
    },
    {
      id: 'trans_504',
      sourceTitleAr: 'صفحة التواصل والمساعدة المباشرة مع فريق الدعم',
      sourceLang: 'AR',
      targetLang: 'EN',
      status: 'MISSING',
      statusLabelAr: 'مفقود (Missing)',
      updatedAt: 'منذ 3 أيام'
    }
  ]);

  const filtered = translations.filter(item => {
    const matchesSearch = item.sourceTitleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 dir-rtl">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <button onClick={() => navigate('/admin/cms')} className="hover:text-emerald-600">إدارة المحتوى (CMS)</button>
            <span>/</span>
            <span className="text-emerald-600 font-medium">الترجمات والتوطين (Phase 16 Localization)</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Languages className="w-6 h-6 text-amber-600" />
            <span>إدارة وتوطين المحتوى المتعدد اللغات (Localization Management)</span>
          </h1>
        </div>
      </div>

      {/* Boundary Reminder Banner */}
      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center gap-3 text-xs text-amber-900 dark:text-amber-300">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <span>توطين المحتوى يتم عبر حمولات البيانات المعتمدة في Phase 16 Localization دون التأثير على النظام البرمجي الأساسي.</span>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute right-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالعنوان المصدري..."
            className="w-full pr-9 pl-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <option value="ALL">جميع الحالات</option>
          <option value="MISSING">مفقود (Missing)</option>
          <option value="DRAFT">مسودة (Draft)</option>
          <option value="NEEDS_REVIEW">يحتاج مراجعة (Needs Review)</option>
          <option value="PUBLISHED">منشور (Published)</option>
        </select>
      </div>

      {/* Translations List */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {filtered.map((item) => (
            <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-gray-400">{item.id}</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200">
                    {item.sourceLang} → {item.targetLang}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">{item.sourceTitleAr}</h3>
              </div>

              <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                <div className="text-xs space-y-0.5 text-left md:text-right">
                  <div>
                    {item.status === 'PUBLISHED' && <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">منشور</span>}
                    {item.status === 'NEEDS_REVIEW' && <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">يحتاج مراجعة</span>}
                    {item.status === 'DRAFT' && <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">مسودة</span>}
                    {item.status === 'MISSING' && <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800">مفقود</span>}
                  </div>
                  <div className="text-[11px] text-gray-400">{item.updatedAt}</div>
                </div>

                <button
                  onClick={() => navigate('/admin/cms/articles/art_101')}
                  className="px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-gray-700 dark:text-gray-300 text-xs font-medium flex items-center gap-1.5"
                >
                  <span>فتح محرر الترجمة</span>
                  <ArrowIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
