import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/I18nProvider';
import { 
  FileText, ArrowLeft, ArrowRight, Edit, Save, CheckCircle2, 
  Archive, ExternalLink, Sparkles, AlertCircle, Clock, ShieldAlert, 
  Languages, Search, Eye, History, FileUp, Globe2, Tag, Layers, X
} from 'lucide-react';

export function AdminCmsArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isRTL } = useTranslation();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [aiSuggestionMsg, setAiSuggestionMsg] = useState<string | null>(null);

  useEffect(() => {
    loadArticleDetail();
  }, [id]);

  const loadArticleDetail = async () => {
    setLoading(true);
    try {
      // Mock Article Object matching Phase 16 CMS Specs
      setArticle({
        id: id || 'art_101',
        titleAr: 'دليل الشامل للتقديم على المنح الدراسية التركية المباشرة YTB 2026',
        titleEn: 'Comprehensive Guide to YTB Turkish Scholarships 2026',
        slug: 'ytb-turkish-scholarships-guide-2026',
        contentType: 'STUDY_GUIDE',
        contentTypeLabelAr: 'دليل دراسي (Study Guide)',
        categoryAr: 'منح وقبولات',
        tags: ['المنح_التركية', 'YTB_2026', 'الدراسة_في_تركيا', 'خطاب_الدافع'],
        language: 'ar',
        excerptAr: 'دليل تفصيلي شامل يتناول شروط التقديم على المنحة التركية الممولة بالكامل لعام 2026، الآلية المعتمدة لرفع المستندات، وكيفية إعداد المقابلات الشفهية بنجاح.',
        excerptEn: 'A comprehensive step-by-step guide covering eligibility, document submission, and interview tips for the YTB Turkish Government Scholarship 2026.',
        richBodyAr: `<h2>مقدمة عن منحة الحكومة التركية YTB 2026</h2><p>تعتبر منحة YTB من أشهر وأشمل البرامج الممولة بالكامل للطلاب الدوليين الراغبين بالدراسة في تركيا. تغطي المنحة الرسوم الدراسية، السكن، التأمين الصحي، راتباً شهرياً، وتذاكر الطيران.</p><h3>شروط القبول الأساسية:</h3><ul><li>ألا يزيد عمر المتقدم للبكالوريوس عن 21 عاماً.</li><li>أن لا يقل معدل الثانوية العامة عن 70% للتخصصات العامة و90% للطب والطب البشري.</li></ul>`,
        seoTitleAr: 'دليل المنحة التركية YTB 2026 | المناراتك',
        seoDescriptionAr: 'تعرف على كافة شروط وخطوات التقديم المباشر على منحة الحكومة التركية الممولة بالكامل YTB لعام 2026 بأسلوب تبسيطي معتمد.',
        seoKeywordsAr: ['المنحة التركية', 'YTB 2026', 'التقديم على المنح', 'دراسة في تركيا'],
        featuredImageAssetKey: 'eap:img:ytb_scholarship_banner_2026.png',
        author: 'فريق التحرير الأكاديمي',
        reviewer: 'د. أحمد المحمود (محرر معتمد)',
        translationStatus: 'NEEDS_TRANSLATION',
        linkedPublicContext: '/scholarships/guides/ytb-turkish-scholarships-guide-2026',
        linkedDomainEntities: [
          { type: 'SCHOLARSHIP', name: 'منحة الحكومة التركية YTB', refId: 'sch_ytb_2026' },
          { type: 'UNIVERSITY', name: 'جامعة إسطنبول الحكومية', refId: 'uni_istanbul_01' },
          { type: 'COUNTRY', name: 'الجمهورية التركية', refId: 'country_turkey' }
        ],
        status: 'PUBLISHED',
        updatedAt: '2026-07-28 09:15',
        revisionHistory: [
          { version: 'v1.2', date: '2026-07-28 09:15', editor: 'فريق التحرير الأكاديمي', notes: 'تحديث شروط معدل الطب البشري لعام 2026' },
          { version: 'v1.1', date: '2026-07-20 14:30', editor: 'د. أحمد المحمود', notes: 'اعتماد المراجعة التحريرية والتوافق مع SEO' },
          { version: 'v1.0', date: '2026-07-15 10:00', editor: 'فريق التحرير الأكاديمي', notes: 'إنشاء المسودة الأولى للمقال' }
        ],
        auditTrail: [
          { date: '2026-07-28 09:15', action: 'تحديث وتدقيق كلمات SEO والترجمة', operator: 'محرر CMS' },
          { date: '2026-07-20 14:30', action: 'اعتماد ونشر المقال رسمياً على المنصة', operator: 'مدير المحتوى' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const executeAction = (actionName: string, actionLabel: string) => {
    if (actionName === 'publish') setArticle({ ...article, status: 'PUBLISHED' });
    if (actionName === 'unpublish') setArticle({ ...article, status: 'DRAFT' });
    if (actionName === 'approve') setArticle({ ...article, status: 'READY_TO_PUBLISH' });
    if (actionName === 'archive') setArticle({ ...article, status: 'ARCHIVED' });

    setActionSuccessMsg(`تم تنفيذ إجراء: ${actionLabel} بنجاح.`);
    setActiveModal(null);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const triggerAiDraftHelper = (helperType: string) => {
    if (helperType === 'SUGGEST_TITLE') {
      setAiSuggestionMsg('اقتراح الذكاء الاصطناعي للعنوان: "الدليل الذهبي الشامل لمنحة الحكومة التركية YTB 2026: الشروط والمستندات الخطوة بخطوة"');
    } else if (helperType === 'SUGGEST_SEO') {
      setAiSuggestionMsg('اقتراح الذكاء الاصطناعي لـ SEO: "دليل التقديم على المنحة التركية YTB 2026 | كشف المستندات ونسب القبول المعتمدة"');
    } else if (helperType === 'SUGGEST_TRANSLATION') {
      setAiSuggestionMsg('تم توليد مسودة الترجمة الإنجليزية الذكية عبر Phase 17 AI Engine وتخزينها كمسودة مراجعة.');
    } else {
      setAiSuggestionMsg('معاينة الذكاء الاصطناعي (Phase 17 AI Engine): يلزم تفعيل ربط AI لاستخراج التلخيص التلقائي.');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500 dir-rtl">جاري تحميل تفاصيل المقال التحريري...</div>;
  }

  if (!article) {
    return <div className="p-12 text-center text-gray-500 dir-rtl">لم يتم العثور على المقال المطلوب.</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 dir-rtl">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <button onClick={() => navigate('/admin/cms')} className="hover:text-emerald-600">إدارة المحتوى (CMS)</button>
            <span>/</span>
            <button onClick={() => navigate('/admin/cms/articles')} className="hover:text-emerald-600">المقالات والأدلة</button>
            <span>/</span>
            <span className="text-emerald-600 font-medium">{article.id}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {article.titleAr}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {article.contentTypeLabelAr}
            </span>
          </div>
          {article.titleEn && (
            <p className="text-sm text-gray-500 dark:text-gray-400 dir-ltr text-right mt-1">
              {article.titleEn}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/cms/articles')}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 text-gray-700 dark:text-gray-300 text-xs font-medium flex items-center gap-2"
          >
            <ArrowIcon className="w-4 h-4" />
            <span>العودة للقائمة</span>
          </button>
        </div>
      </div>

      {/* Action Notification Message */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* AI Helper Notification Message */}
      {aiSuggestionMsg && (
        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 flex items-center justify-between text-purple-900 dark:text-purple-200 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
            <span>{aiSuggestionMsg}</span>
          </div>
          <button onClick={() => setAiSuggestionMsg(null)} className="text-purple-500 hover:text-purple-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Boundary Reminder Banner */}
      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center gap-3 text-xs text-amber-900 dark:text-amber-300">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <span>المحتوى التحريري وSEO ينتمي لمرحلة Phase 16. الربط مع كيانات المنح والجامعات المرفقة هو مرجع تحريري فقط ولا يعدل البيانات الأصلية.</span>
      </div>

      {/* 11-Button CMS Action Bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          شريط التحكم والإجراءات التحريرية الشامل (CMS Editorial Action Bar - 11 Actions)
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Edit */}
          <button
            onClick={() => setActiveModal('EDIT')}
            className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-800 dark:text-gray-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Edit className="w-3.5 h-3.5 text-blue-600" />
            <span>تعديل (Edit)</span>
          </button>

          {/* 2. Save Draft */}
          <button
            onClick={() => executeAction('save_draft', 'حفظ كمسودة')}
            className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>حفظ كمسودة</span>
          </button>

          {/* 3. Send to Review */}
          <button
            onClick={() => executeAction('send_review', 'إرسال للمراجعة التحريرية')}
            className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>إرسال للمراجعة</span>
          </button>

          {/* 4. Approve */}
          <button
            onClick={() => executeAction('approve', 'اعتماد المقال')}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>اعتماد</span>
          </button>

          {/* 5. Publish */}
          <button
            onClick={() => executeAction('publish', 'نشر المقال')}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>نشر</span>
          </button>

          {/* 6. Unpublish */}
          <button
            onClick={() => executeAction('unpublish', 'إلغاء النشر')}
            className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>إلغاء النشر</span>
          </button>

          {/* 7. Archive */}
          <button
            onClick={() => executeAction('archive', 'أرشفة المقال')}
            className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>أرشفة</span>
          </button>

          {/* 8. Create Translation */}
          <button
            onClick={() => setActiveModal('TRANSLATE')}
            className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>إنشاء ترجمة</span>
          </button>

          {/* 9. Preview Public Page */}
          <button
            onClick={() => setActiveModal('PREVIEW')}
            className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-800 dark:text-gray-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>معاينة العامة</span>
          </button>

          {/* 10. Suggest SEO Metadata (AI) */}
          <button
            onClick={() => triggerAiDraftHelper('SUGGEST_SEO')}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>اقتراح بيانات SEO</span>
          </button>

          {/* 11. Suggest Translation Draft (AI) */}
          <button
            onClick={() => triggerAiDraftHelper('SUGGEST_TRANSLATION')}
            className="px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-900/40 hover:bg-purple-200 text-purple-900 dark:text-purple-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>اقتراح مسودة ترجمة</span>
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Rich Text Content, Excerpt, SEO & Linked Domain References */}
        <div className="lg:col-span-2 space-y-6">
          {/* Excerpt / Summary Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-3 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>الموجز والملخص التحريري (Excerpt / Summary)</span>
            </h2>
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800">
              {article.excerptAr}
            </p>
          </div>

          {/* Rich Text Body Editor Placeholder */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>محرر النص الغني المنسق (Rich Text Editor Payload)</span>
              </h2>
              <span className="text-xs text-gray-400 font-mono">HTML / RichText Payload</span>
            </div>

            <div 
              className="prose dark:prose-invert max-w-none text-xs text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-200 dark:border-gray-700 min-h-[160px] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.richBodyAr }}
            />
          </div>

          {/* SEO Metadata Section */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-600" />
              <span>بيانات تحسين محركات البحث (SEO Metadata - Phase 16)</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-500 font-medium">عنوان SEO (SEO Title):</span>
                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{article.seoTitleAr}</p>
              </div>

              <div>
                <span className="text-gray-500 font-medium">وصف SEO (SEO Meta Description):</span>
                <p className="text-gray-700 dark:text-gray-300 mt-0.5 leading-relaxed">{article.seoDescriptionAr}</p>
              </div>

              <div>
                <span className="text-gray-500 font-medium">الكلمات المفتاحية (SEO Keywords):</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {article.seoKeywordsAr?.map((kw: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-[11px] font-medium">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Linked Domain Entities (Read-Only References) */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <span>الكيانات المرجعية المرتبطة (Linked Domain References)</span>
            </h2>

            <p className="text-xs text-gray-500 leading-relaxed">
              تظهر هذه العناصر كروابط مرجعية إرشادية داخل المقال. نظام CMS لا يملك صلاحية تعديل بيانات هذه الكيانات في نطاقها المستقل.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {article.linkedDomainEntities?.map((entity: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{entity.type}</span>
                  <p className="font-bold text-gray-900 dark:text-white truncate">{entity.name}</p>
                  <p className="font-mono text-[10px] text-gray-400">{entity.refId}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Metadata, Asset, Revision & Audit Trail */}
        <div className="space-y-6">
          {/* Article Info & EAP Asset */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
              بيانات المقال وأصول EAP
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-500">الرابط الدائم (Slug):</span>
                <p className="font-mono text-gray-800 dark:text-gray-200 mt-0.5 dir-ltr text-right">{article.slug}</p>
              </div>

              <div>
                <span className="text-gray-500">صورة العرض البارزة (EAP Asset Key):</span>
                <p className="font-mono text-purple-600 dark:text-purple-400 mt-0.5 dir-ltr text-right">{article.featuredImageAssetKey}</p>
              </div>

              <div>
                <span className="text-gray-500">المؤلف والكاتب:</span>
                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{article.author}</p>
              </div>

              <div>
                <span className="text-gray-500">المراجع التحريري:</span>
                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{article.reviewer}</p>
              </div>

              <div>
                <span className="text-gray-500">حالة الترجمة الإنجليزية:</span>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  {article.translationStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Revision History */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-3 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-gray-500" />
              <span>سجل الإصدارات والتعديلات</span>
            </h2>

            <div className="space-y-2 text-xs">
              {article.revisionHistory?.map((rev: any, idx: number) => (
                <div key={idx} className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-1">
                  <div className="flex items-center justify-between font-bold text-gray-900 dark:text-white">
                    <span>{rev.version}</span>
                    <span className="text-[11px] text-gray-400 dir-ltr">{rev.date}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-[11px]">{rev.notes}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Trail */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-3 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
              سجل التدقيق الإداري (Audit Log)
            </h2>

            <div className="space-y-2 text-xs">
              {article.auditTrail?.map((log: any, idx: number) => (
                <div key={idx} className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-1 text-[11px]">
                  <div className="text-gray-900 dark:text-white font-medium">{log.action}</div>
                  <div className="text-gray-400 flex items-center justify-between">
                    <span>{log.operator}</span>
                    <span className="dir-ltr">{log.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                {activeModal === 'EDIT' && 'تعديل بيانات المقال التحريري'}
                {activeModal === 'TRANSLATE' && 'إنشاء ترجمة للغة ثانية'}
                {activeModal === 'PREVIEW' && 'معاينة العرض العام المباشر'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-3 leading-relaxed">
              {activeModal === 'PREVIEW' && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200">
                  <p className="font-bold mb-1">تنبيه المعاينة العامة:</p>
                  المعاينة العامة تتيح رؤية نمط الإخراج قبل الاعتماد، ولكنها لا تعني النشر المباشر. النشر يتطلب موافقة يدوية صريحة.
                </div>
              )}

              {activeModal === 'TRANSLATE' && (
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200">
                  تفعيل مسودة الترجمة يتم عبر ربط حمولة اللغة المعتمدة في Phase 16 Localization.
                </div>
              )}

              <p>تم فتح نافذة التحكم الإدارية لاستكمال التحديث المباشر للوثيقة.</p>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
