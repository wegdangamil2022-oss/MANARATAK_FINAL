import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/I18nProvider';
import { 
  HelpCircle, ArrowLeft, ArrowRight, Edit, Save, CheckCircle2, 
  Archive, ExternalLink, Sparkles, Clock, ShieldAlert, Languages, Eye, X
} from 'lucide-react';

export function AdminCmsFaqDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isRTL } = useTranslation();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const [faq, setFaq] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadFaqDetail();
  }, [id]);

  const loadFaqDetail = async () => {
    setLoading(true);
    try {
      setFaq({
        id: id || 'faq_201',
        questionAr: 'هل يمكن للطلاب المستجدين التقديم على المنح الحكومية بدون شهادة التوفل؟',
        questionEn: 'Can new students apply for government scholarships without TOEFL?',
        answerAr: 'نعم، تشترط معظم برامج المنح الحكومية (مثل المنحة التركية والرومانية) تقديم إثبات الكفاءة اللغوية أو الخضوع لسنة تحضيرية للغة قبل بدء الدراسة الأكاديمية الفعالة، وبالتالي يمكن التقديم بشرط استكمال متطلبات اللغة لاحقاً.',
        answerEn: 'Yes, most government scholarship programs allow students to submit without TOEFL initially provided they undergo a preparatory language year.',
        categoryAr: 'شروط القبول العامة',
        language: 'ar',
        status: 'PUBLISHED',
        updatedAt: '2026-07-28 11:00',
        author: 'قسم الدعم والتحرير',
        translationStatus: 'PUBLISHED'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (label: string, newStatus?: string) => {
    if (newStatus) setFaq({ ...faq, status: newStatus });
    setActionSuccessMsg(`تم تنفيذ إجراء: ${label} بنجاح.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  if (loading) return <div className="p-12 text-center text-gray-500 dir-rtl">جاري التحميل...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 dir-rtl">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <button onClick={() => navigate('/admin/cms')} className="hover:text-emerald-600">إدارة المحتوى (CMS)</button>
            <span>/</span>
            <button onClick={() => navigate('/admin/cms/faqs')} className="hover:text-emerald-600">الأسئلة الشائعة</button>
            <span>/</span>
            <span className="text-emerald-600 font-medium">{faq.id}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-blue-600" />
            <span>تفاصيل السؤال الشائع (FAQ Detail)</span>
          </h1>
        </div>

        <button
          onClick={() => navigate('/admin/cms/faqs')}
          className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium flex items-center gap-2"
        >
          <ArrowIcon className="w-4 h-4" />
          <span>العودة للقائمة</span>
        </button>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-2">
        <button onClick={() => handleAction('حفظ كمسودة', 'DRAFT')} className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200">
          حفظ كمسودة
        </button>
        <button onClick={() => handleAction('إرسال للمراجعة', 'IN_REVIEW')} className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 text-xs font-medium border border-blue-200">
          إرسال للمراجعة
        </button>
        <button onClick={() => handleAction('اعتماد ونشر', 'PUBLISHED')} className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-medium shadow-sm">
          اعتماد ونشر
        </button>
        <button onClick={() => handleAction('أرشفة', 'ARCHIVED')} className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-medium">
          أرشفة
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <div>
          <span className="text-xs text-gray-500 font-medium">السؤال بالعربية:</span>
          <p className="text-base font-bold text-gray-900 dark:text-white mt-1">{faq.questionAr}</p>
        </div>

        <div>
          <span className="text-xs text-gray-500 font-medium">الإجابة المعتمدة بالعربية:</span>
          <p className="text-xs text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 leading-relaxed mt-1">
            {faq.answerAr}
          </p>
        </div>

        {faq.questionEn && (
          <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
            <span className="text-xs text-gray-500 font-medium dir-ltr block text-right">English Question:</span>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1 dir-ltr text-right">{faq.questionEn}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 dir-ltr text-right leading-relaxed">{faq.answerEn}</p>
          </div>
        )}
      </div>
    </div>
  );
}
