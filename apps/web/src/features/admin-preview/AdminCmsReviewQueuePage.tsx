import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/I18nProvider';
import { 
  CheckSquare, Search, ArrowLeft, ArrowRight, ShieldAlert, Clock, FileText, HelpCircle, Layout
} from 'lucide-react';

export function AdminCmsReviewQueuePage() {
  const navigate = useNavigate();
  const { isRTL } = useTranslation();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const [searchQuery, setSearchQuery] = useState('');

  const [reviewItems, setReviewItems] = useState([
    {
      id: 'rev_701',
      type: 'ARTICLE',
      titleAr: 'كيفية كتابة خطاب الدافع المتميز (Motivation Letter) للجامعات الألمانية',
      submittedBy: 'مستشار التحرير',
      submittedAt: 'منذ ساعتين',
      targetPath: '/admin/cms/articles/art_102'
    },
    {
      id: 'rev_702',
      type: 'FAQ',
      titleAr: 'ما هي الآلية المعتمدة لتصديق الشهادات الأكاديمية قبل رفعها للجامعات؟',
      submittedBy: 'قسم الدعم والتحرير',
      submittedAt: 'منذ 3 ساعات',
      targetPath: '/admin/cms/faqs/faq_202'
    },
    {
      id: 'rev_703',
      type: 'PAGE',
      titleAr: 'صفحة التواصل والمساعدة المباشرة مع فريق الدعم',
      submittedBy: 'محرر الصفحات العامة',
      submittedAt: 'منذ يوم',
      targetPath: '/admin/cms/pages/page_304'
    }
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 dir-rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <button onClick={() => navigate('/admin/cms')} className="hover:text-emerald-600">إدارة المحتوى (CMS)</button>
            <span>/</span>
            <span className="text-emerald-600 font-medium">طابور المراجعة التحريرية</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-rose-600" />
            <span>طابور المراجعة والاعتماد التحريري (CMS Editorial Review Queue)</span>
          </h1>
        </div>
      </div>

      {/* Boundary Reminder Banner */}
      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center gap-3 text-xs text-amber-900 dark:text-amber-300">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <span>طابور المراجعة هنا يغطي العناصر التحريرية فقط. تنفيذ المراجعة والاعتماد المباشر يتم بالانتقال للشاشة التفصيلية الخاصة بالمرجع.</span>
      </div>

      {/* Review List */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {reviewItems.map((item) => (
            <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-gray-400">{item.id}</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                    {item.type}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{item.submittedAt}</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-gray-900 dark:text-white">{item.titleAr}</h3>
                <p className="text-xs text-gray-500">المُقدِم: {item.submittedBy}</p>
              </div>

              <button
                onClick={() => navigate(item.targetPath)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shrink-0"
              >
                <span>مراجعة واعتماد العنصر</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
