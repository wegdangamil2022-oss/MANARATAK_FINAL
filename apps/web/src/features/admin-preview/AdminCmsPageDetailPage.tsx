import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/I18nProvider';
import { 
  Layout, ArrowLeft, ArrowRight, Edit, Save, CheckCircle2, 
  Archive, ExternalLink, Sparkles, Clock, ShieldAlert, Languages, Eye, X, FileText
} from 'lucide-react';

export function AdminCmsPageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isRTL } = useTranslation();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadPageDetail();
  }, [id]);

  const loadPageDetail = async () => {
    setLoading(true);
    try {
      setPage({
        id: id || 'page_301',
        titleAr: 'عن منصة المناراتك للخدمات التعليمية والأكاديمية',
        titleEn: 'About MANARATAK Educational Platform',
        slug: 'about-manaratak-platform',
        pageType: 'ABOUT',
        pageTypeLabelAr: 'عن المنصة (About)',
        language: 'ar',
        richBodyAr: `<h2>رسالتنا في المناراتك</h2><p>منصة المناراتك هي البوابة الرقمية الشاملة لتمكين الطلاب العربي بالوصول إلى أحدث المنح الدراسية، والقبولات الجامعية، والخدمات الإرشادية الأكاديمية بالاعتماد على التكنولوجيا الحديثة.</p>`,
        seoTitleAr: 'عن منصة المناراتك | البوابة الأكاديمية الشاملة',
        seoDescriptionAr: 'تعرف على رؤية ورسالة منصة المناراتك في دعم الطلاب وتسهيل القبولات والمنح الدراسية الدولية.',
        status: 'PUBLISHED',
        updatedAt: '2026-07-28 08:30',
        author: 'فريق التحرير والرؤية'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (label: string, newStatus?: string) => {
    if (newStatus) setPage({ ...page, status: newStatus });
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
            <button onClick={() => navigate('/admin/cms/pages')} className="hover:text-emerald-600">الصفحات الثابتة</button>
            <span>/</span>
            <span className="text-emerald-600 font-medium">{page.id}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Layout className="w-6 h-6 text-indigo-600" />
            <span>تفاصيل الصفحة الثابتة (Static Page Detail)</span>
          </h1>
        </div>

        <button
          onClick={() => navigate('/admin/cms/pages')}
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
        <button onClick={() => handleAction('اعتماد ونشر الصفحة', 'PUBLISHED')} className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-medium shadow-sm">
          اعتماد ونشر
        </button>
        <button onClick={() => handleAction('أرشفة الصفحة', 'ARCHIVED')} className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-medium">
          أرشفة
        </button>
      </div>

      {/* Detail Content */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <div>
          <span className="text-xs text-gray-500 font-medium">عنوان الصفحة بالعربية:</span>
          <p className="text-base font-bold text-gray-900 dark:text-white mt-1">{page.titleAr}</p>
        </div>

        <div>
          <span className="text-xs text-gray-500 font-medium">محتوى الصفحة المنسق (Rich Body Payload):</span>
          <div 
            className="prose dark:prose-invert max-w-none text-xs text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 leading-relaxed mt-1"
            dangerouslySetInnerHTML={{ __html: page.richBodyAr }}
          />
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 pt-3 text-xs space-y-2">
          <div>
            <span className="text-gray-500">عنوان SEO:</span>
            <p className="font-medium text-gray-900 dark:text-white mt-0.5">{page.seoTitleAr}</p>
          </div>
          <div>
            <span className="text-gray-500">الرابط الدائم (Slug):</span>
            <p className="font-mono text-gray-700 dark:text-gray-300 mt-0.5 dir-ltr text-right">{page.slug}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
