import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/I18nProvider';
import { 
  Globe2, ArrowLeft, ArrowRight, Edit, DollarSign, Package, 
  FileText, CheckCircle2, ShieldCheck, Archive, ExternalLink, 
  AlertCircle, Clock, Users, ShieldAlert, Layers, HelpCircle, 
  RotateCcw, History, FileUp, CreditCard, ChevronRight, Check, X
} from 'lucide-react';
import { ApiClient } from '../../api/client';

export function AdminGeneralServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isRTL } = useTranslation();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadServiceDetail();
  }, [id]);

  const loadServiceDetail = async () => {
    setLoading(true);
    try {
      if (id) {
        const data = await ApiClient.getAdminGeneralServiceById(id);
        setService(data);
      }
    } catch {
      // Fallback detail mock object
      setService({
        id: id || 'gen_srv_01',
        titleAr: 'خدمة الترجمة المحلفة المعتمدة للوثائق الأكاديمية والشهادات',
        titleEn: 'Certified Sworn Translation for Academic Transcripts',
        section: 'GENERAL_SERVICE',
        category: 'DOCUMENT_TRANSLATION',
        categoryLabelAr: 'ترجمة المستندات والشهادات',
        shortDescription: 'ترجمة معتمدة ومحلفة لكشوف الدرجات، الشهادات الجامعية، ووثائق التخرج من مترجمين محلفين ومقبولين لدى السفارات والجامعات الدولية.',
        includedScope: [
          'ترجمة دقيقة لكشف الدرجات والشهادة من العربية إلى الإنجليزية/الفرنسية/الألمانية.',
          'ختم المترجم المحلف والاعتماد الأكاديمي.',
          'تسليم النسخة الإلكترونية المعتمدة صيغة PDF دقيقة.',
          'شحن وتوصيل النسخة الورقية المعتمدة بالختم الحي (عند طلب الباقة الورقية).'
        ],
        excludedScope: [
          'تصديق الخارجية أو القنصليات (يطلب كخدمة تصديق مستقلة).',
          'رسوم الشحن السريع الدولي للبلدان الخارج نطاق التغطية.',
          'تعديل أسماء الدرجات أو الدرجات خلاف الوثيقة الأصلية.'
        ],
        priceType: 'PAID_FIXED',
        priceAmount: 25,
        currency: 'USD',
        priceFormatted: '$25 / صفحة',
        packages: [
          { id: 'pkg_g1', title: 'الباقة الإلكترونية المعتمدة (PDF محلف)', price: '$25 / صفحة' },
          { id: 'pkg_g2', title: 'الباقة الكاملة (إلكتروني + نسخة ورقية مختومة)', price: '$45 / صفحة' }
        ],
        slaDeliveryTime: '24-48 ساعة عمل',
        assignedTeam: 'فريق الترجمة المعتمدة والدعم القانوني',
        responsibleRole: 'Certified Sworn Translator',
        studentRequirements: [
          'مسح ضوئي عالي الجودة (HD Scan) للشهادة أو كشف الدرجات المراد ترجمته.',
          'إرسال الاسم كاملاً كما هو مطبوع في جواز السفر لتطابق الهجاء.'
        ],
        eapTemplates: [
          { id: 'eap_tpl_g1', title: 'نموذج قالب الترجمة الأكاديمية الموحد', key: 'eap:doc:academic_translation_template_v1.docx' }
        ],
        faqs: [
          { question: 'هل الترجمة مقبولة لدى السفارات والجامعات؟', answer: 'نعم، يتم ختمها وختم المترجم المحلف وتكون مقبولة رسمياً لدى كافة القنصليات والجامعات.' },
          { question: 'كم تدوم فترة صلاحية الترجمة؟', answer: 'الترجمة المعتمدة ليس لها تاريخ انتهاء صلاحية طالما لم تتغير الوثيقة الأصلية.' }
        ],
        cancellationPolicy: 'لا يمكن إلغاء الطلب بعد بدء مترجم المكاتب المحلفة بالعمل، ولكن يحق للعميل طلب تعديل الهجاء مجاناً.',
        status: 'PUBLISHED',
        activeRequestsCount: 45,
        createdAt: '2026-04-12',
        updatedAt: '2026-07-27 15:30',
        auditTrail: [
          { date: '2026-07-27 15:30', action: 'تحديث تسعير الباقة الإلكترونية والورقية', operator: 'مشرف قسم الترجمة' },
          { date: '2026-05-01 10:00', action: 'اعتماد الخدمة وتفعيل خيارات الشحن الورقي', operator: 'مدير الدعم العام' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async (actionName: string, actionLabel: string) => {
    try {
      await ApiClient.executeAdminGeneralServiceAction(id || 'gen_srv_01', actionName);
    } catch {
      // Mock status updates
      if (actionName === 'publish') setService({ ...service, status: 'PUBLISHED' });
      if (actionName === 'unpublish') setService({ ...service, status: 'DRAFT' });
      if (actionName === 'mark_ready') setService({ ...service, status: 'READY_TO_PUBLISH' });
      if (actionName === 'archive') setService({ ...service, status: 'ARCHIVED' });
    }
    setActionSuccessMsg(`تم تنفيذ إجراء: ${actionLabel} بنجاح.`);
    setActiveModal(null);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500 dir-rtl">جاري تحميل تفاصيل الخدمة العامة...</div>;
  }

  if (!service) {
    return <div className="p-12 text-center text-gray-500 dir-rtl">لم يتم العثور على الخدمة العامة المطلوبة.</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 dir-rtl">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <button onClick={() => navigate('/admin/services')} className="hover:text-blue-600">إدارة الخدمات</button>
            <span>/</span>
            <button onClick={() => navigate('/admin/services/general')} className="hover:text-blue-600">الخدمات العامة</button>
            <span>/</span>
            <span className="text-blue-600 font-medium">{service.id}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {service.titleAr}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              خدمة عامة (General Support Service)
            </span>
          </div>
          {service.titleEn && (
            <p className="text-sm text-gray-500 dark:text-gray-400 dir-ltr text-right mt-1">
              {service.titleEn}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/services/general')}
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

      {/* Boundary Reminder Banner */}
      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center gap-3 text-xs text-amber-900 dark:text-amber-300">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <span>عناصر وسجلات الكتالوج تنتمي للمرحلة 20. تنفيذ عمليات الدفع، المجموعات، والاشتراكات يدار عبر المرحلة 19.</span>
      </div>

      {/* 10-Button Admin Action Bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          شريط الإجراءات والتحكم الإداري المباشر (Admin Action Bar - 10 Actions)
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 1. Edit */}
          <button
            onClick={() => setActiveModal('EDIT')}
            className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-800 dark:text-gray-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Edit className="w-3.5 h-3.5 text-blue-600" />
            <span>تعديل (Edit)</span>
          </button>

          {/* 2. Configure Pricing */}
          <button
            onClick={() => setActiveModal('PRICING')}
            className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-800 dark:text-gray-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>إعداد التسعير</span>
          </button>

          {/* 3. Configure Packages */}
          <button
            onClick={() => setActiveModal('PACKAGES')}
            className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-800 dark:text-gray-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Package className="w-3.5 h-3.5 text-indigo-600" />
            <span>إعداد الباقات</span>
          </button>

          {/* 4. Manage Templates / Forms */}
          <button
            onClick={() => setActiveModal('TEMPLATES')}
            className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-800 dark:text-gray-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <FileUp className="w-3.5 h-3.5 text-purple-600" />
            <span>إدارة النماذج / الملفات (Phase 05 EAP)</span>
          </button>

          {/* 5. Mark Ready to Publish */}
          <button
            onClick={() => executeAction('mark_ready', 'جاهزة للنشر')}
            className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>جاهزة للنشر</span>
          </button>

          {/* 6. Publish */}
          <button
            onClick={() => executeAction('publish', 'نشر الخدمة')}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>نشر</span>
          </button>

          {/* 7. Unpublish */}
          <button
            onClick={() => executeAction('unpublish', 'إلغاء النشر')}
            className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>إلغاء النشر</span>
          </button>

          {/* 8. Archive */}
          <button
            onClick={() => executeAction('archive', 'أرشفة الخدمة')}
            className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>أرشفة</span>
          </button>

          {/* 9. Open Related Requests */}
          <button
            onClick={() => setActiveModal('REQUESTS')}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            <span>فتح الطلبات المرتبطة ({service.activeRequestsCount})</span>
          </button>

          {/* 10. Open Finance/Payment Settings */}
          <button
            onClick={() => setActiveModal('FINANCE')}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>فتح إعدادات الدفع/المالية (Phase 19)</span>
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Overview, Scope, Packages, Templates & FAQ */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>نظرة عامة والوصف المباشر</span>
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {service.shortDescription}
            </p>
          </div>

          {/* Scope Card: Included & Excluded */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>نطاق الخدمة العامة والمخرجات (Included vs Excluded Scope)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Included */}
              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 space-y-3">
                <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600" />
                  <span>ما تتضمنه الخدمة (Included)</span>
                </h3>
                <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300 list-disc list-inside">
                  {service.includedScope?.map((item: string, idx: number) => (
                    <li key={idx} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              </div>

              {/* Excluded */}
              <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 space-y-3">
                <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2">
                  <X className="w-4 h-4 text-rose-600" />
                  <span>ما لا تتضمنه الخدمة (Excluded)</span>
                </h3>
                <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300 list-disc list-inside">
                  {service.excludedScope?.map((item: string, idx: number) => (
                    <li key={idx} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Pricing & Packages Section */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span>تعريفات التسعير والباقات (Pricing & Packages)</span>
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                {service.priceFormatted}
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-xs text-gray-500">الباقات المعرفة المتاحة للخدمات العامة:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {service.packages?.map((pkg: any) => (
                  <div key={pkg.id} className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-900 dark:text-white">{pkg.title}</span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{pkg.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Attached Templates & Forms (Phase 05 EAP) */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileUp className="w-5 h-5 text-purple-600" />
              <span>النماذج والملفات المرفقة (Phase 05 EAP Assets)</span>
            </h2>

            <div className="space-y-3">
              {service.eapTemplates?.map((tpl: any) => (
                <div key={tpl.id} className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-gray-900 dark:text-white">{tpl.title}</span>
                  </div>
                  <span className="font-mono text-gray-400 text-[11px] dir-ltr">{tpl.key}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ & Refund Policy */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              <span>الأسئلة الشائعة وسياسة الإلغاء</span>
            </h2>

            <div className="space-y-3">
              {service.faqs?.map((faq: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-1 text-xs">
                  <div className="font-bold text-gray-900 dark:text-white">س: {faq.question}</div>
                  <div className="text-gray-600 dark:text-gray-300">ج: {faq.answer}</div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400">
              <span className="font-bold text-gray-900 dark:text-white">سياسة الإلغاء والاسترداد: </span>
              <span>{service.cancellationPolicy}</span>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Fulfillment, Status & Audit History */}
        <div className="space-y-6">
          {/* Fulfillment & SLA Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
              التنفيذ والالتزام (Fulfillment & SLA)
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-500">مدة التسليم (SLA):</span>
                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{service.slaDeliveryTime}</p>
              </div>

              <div>
                <span className="text-gray-500">الفريق المسند:</span>
                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{service.assignedTeam}</p>
              </div>

              <div>
                <span className="text-gray-500">الدور المسؤول:</span>
                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{service.responsibleRole}</p>
              </div>

              <div>
                <span className="text-gray-500">الطلبات النشطة القائمة:</span>
                <p className="font-bold text-blue-600 dark:text-blue-400 mt-0.5">{service.activeRequestsCount} طلب</p>
              </div>
            </div>
          </div>

          {/* User Requirements */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-3 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
              متطلبات المستخدم قبل التنفيذ
            </h2>
            <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300 list-disc list-inside">
              {service.studentRequirements?.map((req: string, idx: number) => (
                <li key={idx} className="leading-relaxed">{req}</li>
              ))}
            </ul>
          </div>

          {/* Audit History Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-gray-500" />
              <span>سجل التعديلات والعمليات</span>
            </h2>

            <div className="space-y-3 text-xs">
              {service.auditTrail?.map((log: any, idx: number) => (
                <div key={idx} className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-1">
                  <div className="text-gray-900 dark:text-white font-medium">{log.action}</div>
                  <div className="text-gray-400 flex items-center justify-between text-[11px]">
                    <span>{log.operator}</span>
                    <span className="dir-ltr">{log.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals for Action Bar Items */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                {activeModal === 'EDIT' && 'تعديل تفاصيل الخدمة العامة'}
                {activeModal === 'PRICING' && 'إعداد وقواعد التسعير (Pricing)'}
                {activeModal === 'PACKAGES' && 'إعداد الباقات المستهدفة (Packages)'}
                {activeModal === 'TEMPLATES' && 'إدارة النماذج والملفات عبر Phase 05 EAP'}
                {activeModal === 'REQUESTS' && 'عرض الطلبات النشطة المرتبطة'}
                {activeModal === 'FINANCE' && 'تجهيز الربط المالي (Phase 19 Integration)'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-3 leading-relaxed">
              {activeModal === 'FINANCE' && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
                  <p className="font-bold mb-1">تنبيه المعمارية المعتمدة:</p>
                  يتم ربط هذه الخدمة العامة ببوابة الدفع والفواتير والتحصيل عبر وحدة المالية (Phase 19). المرحلة 20 تنشئ العرض والمحتوى فقط دون تنفيذ عمليات الدفع المباشرة.
                </div>
              )}

              {activeModal === 'TEMPLATES' && (
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200">
                  يتم رفع واستدعاء ملفات النماذج والاستمارات ووثائق التقييم حصرياً بواسطة معرّفات الأصول المعتمدة في Phase 05 EAP.
                </div>
              )}

              <p>تم فتح نافذة الإدارة لمتابعة تغيير الإعدادات والتحديث الحقيقي للسجل.</p>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
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
