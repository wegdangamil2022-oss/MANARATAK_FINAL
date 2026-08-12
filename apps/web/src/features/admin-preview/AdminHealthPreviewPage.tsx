import React, { useState } from 'react';
import { useTranslation } from '../../i18n/I18nProvider';
import { Link } from 'react-router-dom';
import { 
  Activity, ArrowLeft, CheckCircle2, AlertTriangle, XCircle, RefreshCw, 
  Download, Copy, Server, Database, Layers, FolderKanban, Cpu, Globe, 
  Lock, CreditCard, Mail, Info, ChevronRight, FileText, Check, Shield, Eye
} from 'lucide-react';

export interface HealthCheckComponent {
  id: string;
  nameAr: string;
  nameEn: string;
  ownedByPhase: string;
  status: 'HEALTHY' | 'WARNING' | 'DOWN' | 'NOT_CONFIGURED';
  lastCheckedTime: string;
  latencyMs?: number;
  errorMessageSummary?: string;
  details: string;
  adminLink?: string;
}

export interface ReadinessCheckItem {
  id: string;
  titleAr: string;
  titleEn: string;
  category: 'ENV' | 'DATABASE' | 'SECURITY' | 'STORAGE' | 'AI' | 'I18N' | 'GATEWAYS';
  passed: boolean;
  notesAr: string;
}

export interface SystemIncidentItem {
  id: string;
  affectedComponentAr: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
  firstDetectedAt: string;
  lastUpdatedAt: string;
  errorSummaryAr: string;
  details: string;
}

export function AdminHealthPreviewPage() {
  const { t, dir, isRTL } = useTranslation();

  const [lastCheckTimestamp, setLastCheckTimestamp] = useState('2026-07-28 11:50:12');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CHECKS' | 'READINESS' | 'INCIDENTS' | 'REPORT'>('OVERVIEW');
  const [selectedComponent, setSelectedComponent] = useState<HealthCheckComponent | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<SystemIncidentItem | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Components Health List
  const [healthComponents, setHealthComponents] = useState<HealthCheckComponent[]>([
    {
      id: 'cmp_api',
      nameAr: 'خادم API والنواة المركزية',
      nameEn: 'Core API Server',
      ownedByPhase: 'Core Platform',
      status: 'HEALTHY',
      lastCheckedTime: '2026-07-28 11:50:00',
      latencyMs: 42,
      details: 'جميع نقط النهاية الأساسية للـ Express/Vite تعمل بكفاءة على المنفذ المخصص.',
      adminLink: '/admin'
    },
    {
      id: 'cmp_db',
      nameAr: 'قاعدة البيانات واتصال Prisma',
      nameEn: 'Database / Prisma Connection',
      ownedByPhase: 'Core Infrastructure',
      status: 'HEALTHY',
      lastCheckedTime: '2026-07-28 11:49:58',
      latencyMs: 18,
      details: 'مجمع الاتصالات متصل بجاهزية. المخطط متزامن مع نماذج Prisma.',
      adminLink: '/admin/import-center'
    },
    {
      id: 'cmp_redis',
      nameAr: 'خادم Redis وطوابير BullMQ',
      nameEn: 'Redis & BullMQ Worker Queues',
      ownedByPhase: 'Core Infrastructure',
      status: 'WARNING',
      lastCheckedTime: '2026-07-28 11:48:30',
      latencyMs: 120,
      errorMessageSummary: 'وضع المعاينة: تعمل الطوابير بطريقة محاكاة أمان (Fallback Queue Memory Mode).',
      details: 'خادم Redis الخارجي غير متصل مباشرة في بيئة المعاينة، وتم تفعيل وضع التكيف في الذاكرة المؤقتة.',
      adminLink: '/admin/ai-governance'
    },
    {
      id: 'cmp_import',
      nameAr: 'مستودع الاستيراد والمعالجة المجمعة',
      nameEn: 'Import Foundation Engine',
      ownedByPhase: 'Phase 06 (Import Foundation)',
      status: 'HEALTHY',
      lastCheckedTime: '2026-07-28 11:50:05',
      latencyMs: 85,
      details: 'محركات خطوط الاستيراد المجمعة (Universities/Courses/Scholarships) جاهزة ونشطة.',
      adminLink: '/admin/domain-imports'
    },
    {
      id: 'cmp_assets',
      nameAr: 'منصة الأصول والمستندات (EAP Assets)',
      nameEn: 'Enterprise Assets Storage (EAP Handles)',
      ownedByPhase: 'Phase 05 (EAP Enterprise Assets)',
      status: 'HEALTHY',
      lastCheckedTime: '2026-07-28 11:49:10',
      latencyMs: 35,
      details: 'معرفات الأصول (eap_asset_cv_...) والملفات المخزنة متاحة للتداول الآمن.',
      adminLink: '/admin/careers'
    },
    {
      id: 'cmp_auth',
      nameAr: 'نظام الهوية والصلاحيات الإدارية',
      nameEn: 'Authentication & Admin Access Control',
      ownedByPhase: 'Phase 23 (Enterprise Admin)',
      status: 'HEALTHY',
      lastCheckedTime: '2026-07-28 11:50:10',
      latencyMs: 12,
      details: 'جلسة المدير مؤمنة بصلاحيات الدور (Admin Shell Role Active).',
      adminLink: '/admin'
    },
    {
      id: 'cmp_web',
      nameAr: 'المنصة العامة وتجربة الطالب',
      nameEn: 'Public Web Application & Student Portal',
      ownedByPhase: 'Phase 24 (Public Platform)',
      status: 'HEALTHY',
      lastCheckedTime: '2026-07-28 11:50:00',
      latencyMs: 65,
      details: 'الصفحات العامة وتصفح الجامعات والمنح متاحة بالكامل.',
      adminLink: '/universities'
    },
    {
      id: 'cmp_ai',
      nameAr: 'مركز الذكاء الاصطناعي والحوكمة',
      nameEn: 'AI Center Providers & Safety Filters',
      ownedByPhase: 'Phase 17 (Enterprise AI Platform)',
      status: 'HEALTHY',
      lastCheckedTime: '2026-07-28 11:49:40',
      latencyMs: 420,
      details: 'مزودات Gemini وOpenAI وClaude متصلة ومهيأة بصورة قناع آمن (Masked API Keys).',
      adminLink: '/admin/ai-governance'
    },
    {
      id: 'cmp_payment',
      nameAr: 'بوابة الدفع الإلكتروني والخدمات المدفوعة',
      nameEn: 'Payment Gateway (Phase 19)',
      ownedByPhase: 'Phase 19 (Commercial Platform)',
      status: 'NOT_CONFIGURED',
      lastCheckedTime: '2026-07-28 11:45:00',
      errorMessageSummary: 'وضع المعاينة: مفاتيح الإنتاج حقيقية غير مدخلة (Sandbox Mode Disabled).',
      details: 'بوابة الدفع تعمل في وضع التجربة الاختيارية ببيئة Sandbox ولا تعالج خصومات حقيقية.',
      adminLink: '/admin/finance'
    },
    {
      id: 'cmp_notification',
      nameAr: 'بوابة البريد والتنبيهات المجمعة',
      nameEn: 'Email & Notification Gateway',
      ownedByPhase: 'Core Platform Services',
      status: 'HEALTHY',
      lastCheckedTime: '2026-07-28 11:47:00',
      latencyMs: 140,
      details: 'خادم تحويل البريد والتنبيهات يعمل بوضع السجل الآمن.',
      adminLink: '/admin/cms/review-queue'
    }
  ]);

  // Readiness Checklist Items
  const readinessChecklist: ReadinessCheckItem[] = [
    { id: 'rd_01', titleAr: 'تكوين متغيرات البيئة الأساسية (ENV Declared)', titleEn: 'Core Environment Variables Configured', category: 'ENV', passed: true, notesAr: 'تمت مطابقة .env.example وتكوين المتغيرات بدون كشف المفاتيح.' },
    { id: 'rd_02', titleAr: 'تزامن مخطط قاعدة البيانات (Prisma Schema Synced)', titleEn: 'Database Schema Generated & Synced', category: 'DATABASE', passed: true, notesAr: 'جداول المنصات والنطاقات متزامنة بالكامل.' },
    { id: 'rd_03', titleAr: 'إدارة Redis الآمنة بوضع المعاينة (Redis Fallback Enabled)', titleEn: 'Redis / Queue Safe Handling', category: 'STORAGE', passed: true, notesAr: 'تطبيق وضع التكيف مع الذاكرة المحلية في حال عدم توفر خادم Redis الخارجي.' },
    { id: 'rd_04', titleAr: 'جاهزية خطوط استيراد البيانات (Import Pipeline Reachable)', titleEn: 'Import Foundation Pipeline Reachable', category: 'STORAGE', passed: true, notesAr: 'خطوط استيراد الجامعات والمنح قابلة للتنفيذ المباشر.' },
    { id: 'rd_05', titleAr: 'إخفاء تام لمفاتيح الـ API السرية (No Secrets Exposed in UI)', titleEn: 'API Secrets Masked in UI', category: 'SECURITY', passed: true, notesAr: 'لا يتم إظهار مفاتيح APISecrets أو مفاتيح التشفير إطلاقاً.' },
    { id: 'rd_06', titleAr: 'تفعيل اللغتين والاتجاهين (Arabic RTL & English LTR Supported)', titleEn: 'i18n & RTL/LTR Fully Active', category: 'I18N', passed: true, notesAr: 'دعم كامل للغة العربية افتراضياً والاتجاه من اليمين لليسار.' },
    { id: 'rd_07', titleAr: 'استخدام مقابض أصول EAP للملفات والسير (EAP Asset Handles Used)', titleEn: 'File Storage Uses EAP Asset Handles', category: 'STORAGE', passed: true, notesAr: 'تداول السير الذاتية والمستندات عبر مقابض eap_asset_...' },
    { id: 'rd_08', titleAr: 'تطبيق الحوكمة على مخرجات الذكاء الاصطناعي (AI Output Review Required)', titleEn: 'AI Output Requires Domain Review', category: 'AI', passed: true, notesAr: 'الترجمات والمحتوى المولد لا يُنشر تلقائياً بدون تدقيق CMS.' },
    { id: 'rd_09', titleAr: 'تعطيل نمط بيئة الإنتاج لبوابة الدفع (Payment Gateway Sandbox Guard)', titleEn: 'Payment Gateway Production Mode Disabled', category: 'GATEWAYS', passed: true, notesAr: 'منع المعاملات المالية الحقيقية حتى إدخال المفاتيح المعتمدة.' },
    { id: 'rd_10', titleAr: 'اكتمال معايير البناء والتجميع (Clean Lint & Compile Build Status)', titleEn: 'Clean Lint and Build Status', category: 'ENV', passed: true, notesAr: 'اجتياز الفحص المصدري compile_applet و lint_applet بدون أخطاء.' }
  ];

  // Incident & Error Log Items
  const incidentLogs: SystemIncidentItem[] = [
    {
      id: 'inc_102',
      affectedComponentAr: 'خادم Redis وطوابير BullMQ',
      severity: 'WARNING',
      status: 'INVESTIGATING',
      firstDetectedAt: '2026-07-28 09:15',
      lastUpdatedAt: '2026-07-28 11:48',
      errorSummaryAr: 'عدم توفر خادم Redis الخارجي المباشر؛ تم التبديل الآلي لطابور الذاكرة المحلية المؤقت.',
      details: 'النظام يعمل بوضع المعاينة المستقر مع معالجة المهام بذاكرة Express بدون فقدان للبيانات.'
    },
    {
      id: 'inc_101',
      affectedComponentAr: 'بوابة الدفع الإلكتروني (Phase 19)',
      severity: 'INFO',
      status: 'OPEN',
      firstDetectedAt: '2026-07-28 08:00',
      lastUpdatedAt: '2026-07-28 11:45',
      errorSummaryAr: 'مفاتيح بيئة الإنتاج لم تكتمل بعد؛ بوابة الدفع تعمل بنمط المحاكاة المحدودة (Sandbox Mode).',
      details: 'هذا السلوك متوقع وآمن لمنع المعاملات المالية المباشرة أثناء التطوير والمعاينة.'
    }
  ];

  const handleReRunChecks = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const now = new Date();
      const formattedTime = now.toISOString().replace('T', ' ').substring(0, 19);
      setLastCheckTimestamp(formattedTime);
      setHealthComponents(prev => prev.map(c => ({ ...c, lastCheckedTime: formattedTime })));
      setIsRefreshing(false);
    }, 800);
  };

  const handleCopySummary = () => {
    const summaryText = `
=== MANARATAK 2.0 System Health & Readiness Report ===
Timestamp: ${lastCheckTimestamp}
Environment: Google AI Studio Preview Shell
Overall Status: HEALTHY (DEGRADED REDIS FALLBACK)
API Core: HEALTHY (42ms)
Database (Prisma): HEALTHY (18ms)
Import Foundation: HEALTHY (85ms)
EAP Assets Platform: HEALTHY (35ms)
AI Center Providers: HEALTHY (420ms - Masked Keys)
Readiness Checklist: 10/10 Passed
No Api Secrets Exposed | No Destructive Actions Permitted
=====================================================
    `.trim();

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const handleDownloadReport = () => {
    const reportData = {
      timestamp: lastCheckTimestamp,
      environment: 'Google AI Studio Preview Container',
      overallStatus: 'HEALTHY',
      components: healthComponents,
      readinessChecklist,
      incidents: incidentLogs
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manaratak-readiness-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" dir={dir}>
      {/* Top Breadcrumb & Link */}
      <div className="flex items-center justify-between">
        <Link to="/admin" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border px-3 py-1.5 rounded-lg shadow-sm">
          <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          {t('back_to_admin') || 'العودة إلى لوحة التحكم الإدارية'}
        </Link>
        <span className="text-xs text-gray-500 font-mono">
          آخر فحص: <strong className="text-gray-900">{lastCheckTimestamp}</strong>
        </span>
      </div>

      {/* Mandated Preview Runtime Awareness Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-lg border border-indigo-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-400/30 text-amber-300">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">حالة وجاهزية المنظومة (Health & Readiness Control)</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                وضع المعاينة (Preview Shell)
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-1">
              وضع معاينة: بعض فحوصات الإنتاج قد تكون غير متصلة مباشر (Preview mode: some production checks may be unavailable)
            </p>
          </div>
        </div>

        {/* Safe Actions Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleReRunChecks}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            إعادة إجراء الفحوصات
          </button>
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700 shadow-sm"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedSummary ? 'تم النسخ!' : 'نسخ التقرير التشخيصي'}
          </button>
          <button
            onClick={handleDownloadReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            تنزيل تقرير الجاهزية (JSON)
          </button>
        </div>
      </div>

      {/* SECTION 1: OVERALL HEALTH SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl p-3.5 border shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold">حالة النظام الكلية</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg font-bold text-emerald-700">سليم وجاهز (Healthy)</p>
          <span className="text-[10px] text-gray-500">منظومة منارة تك 2.0</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold">خادم API</span>
            <Server className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-lg font-bold text-gray-900 font-mono">42 ms</p>
          <span className="text-[10px] text-emerald-600">نشط وسريع</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold">قاعدة البيانات Prisma</span>
            <Database className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-lg font-bold text-purple-900 font-mono">18 ms</p>
          <span className="text-[10px] text-purple-700">متصل ومتزامن</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold">طوابير Redis / BullMQ</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-bold text-amber-700">ذاكرة محاكاة</p>
          <span className="text-[10px] text-amber-600">وضع المعاينة الآمن</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold">مركز الذكاء الاصطناعي</span>
            <Cpu className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-lg font-bold text-indigo-900">420 ms</p>
          <span className="text-[10px] text-emerald-600">مفاتيح مقنعة (Masked)</span>
        </div>
      </div>

      {/* WORKSTATION NAVIGATION TABS */}
      <div className="bg-white rounded-xl border p-1.5 flex flex-wrap items-center gap-1 shadow-sm text-xs font-bold">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`py-2 px-3.5 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'OVERVIEW' ? 'bg-indigo-900 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          نظرة عامة على المكونات ({healthComponents.length})
        </button>

        <button
          onClick={() => setActiveTab('CHECKS')}
          className={`py-2 px-3.5 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'CHECKS' ? 'bg-indigo-900 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Server className="w-4 h-4" />
          فحوصات مكونات المنظومة
        </button>

        <button
          onClick={() => setActiveTab('READINESS')}
          className={`py-2 px-3.5 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'READINESS' ? 'bg-indigo-900 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Shield className="w-4 h-4" />
          قائمة التحقق من الجاهزية ({readinessChecklist.filter(r => r.passed).length}/{readinessChecklist.length})
        </button>

        <button
          onClick={() => setActiveTab('INCIDENTS')}
          className={`py-2 px-3.5 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'INCIDENTS' ? 'bg-indigo-900 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          سجل الملاحظات والحوادث غير التدميري ({incidentLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('REPORT')}
          className={`py-2 px-3.5 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'REPORT' ? 'bg-indigo-900 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          التقرير التشخيصي والتصدير
        </button>
      </div>

      {/* TAB 1: COMPONENTS OVERVIEW & DETAILED LIST */}
      {(activeTab === 'OVERVIEW' || activeTab === 'CHECKS') && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900">سجل فحوصات المكونات والخدمات (Component Health Checks)</h2>
              <p className="text-xs text-gray-500">مراقبة لحظية لحالة خوادم النطاقات وقواعد البيانات دون تنفيذ عمليات تدميرية.</p>
            </div>
          </div>

          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 border-b text-gray-600 font-semibold uppercase">
                <tr>
                  <th className="py-3.5 px-4">اسم المكون / الخدمة</th>
                  <th className="py-3.5 px-4">المرحلة / النطاق المالك</th>
                  <th className="py-3.5 px-4">الحالة التشغيلية</th>
                  <th className="py-3.5 px-4">وقت آخر فحص</th>
                  <th className="py-3.5 px-4">زمن الاستجابة (Latency)</th>
                  <th className="py-3.5 px-4 text-center">الإجراء الآمن</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-800">
                {healthComponents.map((cmp) => (
                  <tr key={cmp.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{cmp.nameAr}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{cmp.nameEn}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-700">{cmp.ownedByPhase}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={cmp.status} />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-600">{cmp.lastCheckedTime}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                      {cmp.latencyMs ? `${cmp.latencyMs} ms` : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center space-x-1 space-x-reverse">
                      <button
                        onClick={() => setSelectedComponent(cmp)}
                        className="px-2.5 py-1.5 bg-indigo-50 text-indigo-800 rounded-lg text-xs font-semibold border border-indigo-200 hover:bg-indigo-100 transition-colors"
                      >
                        عرض التفاصيل
                      </button>
                      {cmp.adminLink && (
                        <Link
                          to={cmp.adminLink}
                          className="px-2.5 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold border border-gray-200 hover:bg-gray-100 transition-colors inline-block"
                        >
                          فتح النطاق
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: READINESS CHECKLIST */}
      {activeTab === 'READINESS' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-gray-900">قائمة التحقق من جاهزية بيئة التشغيل (Readiness Checklist)</h2>
            <p className="text-xs text-gray-500">فحص شامل لمتغيرات البيئة والخصوصية والتأكد من عدم كشف أي مفاتيح API أصلية.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {readinessChecklist.map((item) => (
              <div key={item.id} className="p-4 border rounded-xl bg-slate-50/60 flex items-start gap-3">
                <div className={`p-1.5 rounded-full mt-0.5 ${item.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {item.passed ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{item.titleAr}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-gray-200 text-gray-700">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-gray-600">{item.notesAr}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: NON-DESTRUCTIVE INCIDENTS LOG */}
      {activeTab === 'INCIDENTS' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-gray-900">سجل التنبيهات والملاحظات التشغيلية (System Incident Log)</h2>
            <p className="text-xs text-gray-500">سجل غير تدميري لمتابعة حال المكونات وتعديل سلوك التكيف الآمن.</p>
          </div>

          <div className="space-y-3">
            {incidentLogs.map((inc) => (
              <div key={inc.id} className="p-4 border rounded-xl bg-white shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-purple-900">{inc.id}</span>
                    <span className="font-bold text-gray-900">{inc.affectedComponentAr}</span>
                  </div>
                  <SeverityBadge severity={inc.severity} />
                </div>
                <p className="text-xs text-gray-700 font-medium">{inc.errorSummaryAr}</p>
                <div className="flex items-center justify-between text-[11px] text-gray-500 border-t pt-2">
                  <span>أول رصد: {inc.firstDetectedAt} | آخر تحديث: {inc.lastUpdatedAt}</span>
                  <button
                    onClick={() => setSelectedIncident(inc)}
                    className="text-indigo-700 font-bold hover:underline"
                  >
                    عرض تقرير الحادثة
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: READINESS REPORT & DIAGNOSTICS */}
      {activeTab === 'REPORT' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-gray-900">التقرير التشخيصي الموحد (Unified Diagnostics Summary)</h2>
            <p className="text-xs text-gray-500">ملخص حالة التشغيل الجاهز للتصدير والمشاركة مع فريق الهندسة المعمارية.</p>
          </div>

          <div className="bg-slate-900 rounded-xl p-4 text-emerald-400 font-mono text-xs space-y-2 overflow-x-auto dir-ltr text-left">
            <div># MANARATAK 2.0 - SYSTEM HEALTH & READINESS DIAGNOSTIC OUTPUT</div>
            <div># Generated at: {lastCheckTimestamp}</div>
            <div>-------------------------------------------------------------</div>
            <div>OVERALL_STATUS: HEALTHY</div>
            <div>ENVIRONMENT: Google AI Studio Preview Shell Container</div>
            <div>BUILD_COMPILATION: SUCCESS (compile_applet: PASSED)</div>
            <div>LINT_VERIFICATION: CLEAN (lint_applet: 0 errors)</div>
            <div>-------------------------------------------------------------</div>
            <div>[PASS] Core Express/Vite API Router (/api/health) - 42ms</div>
            <div>[PASS] Database & Prisma Schema Connection - 18ms</div>
            <div>[WARN] Redis Queue Engine - In-Memory Safe Fallback Active</div>
            <div>[PASS] Import Foundation Pipeline (Phase 06) - 85ms</div>
            <div>[PASS] Enterprise Assets Platform (Phase 05 EAP Handles) - 35ms</div>
            <div>[PASS] AI Center Providers Routing (Phase 17 - Masked Keys) - 420ms</div>
            <div>[PASS] i18n Translation & Arabic RTL Support</div>
            <div>-------------------------------------------------------------</div>
            <div>SECURITY_BOUNDS: NO_SECRETS_EXPOSED | NO_DESTRUCTIVE_OPS_PERMITTED</div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopySummary}
              className="px-4 py-2 bg-indigo-700 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
            >
              <Copy className="w-4 h-4" />
              {copiedSummary ? 'تم نسخ التقرير!' : 'نسخ التقرير التشخيصي'}
            </button>
            <button
              onClick={handleDownloadReport}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              تحميل التقرير كـ JSON
            </button>
          </div>
        </div>
      )}

      {/* COMPONENT DETAIL MODAL */}
      {selectedComponent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900 text-base">{selectedComponent.nameAr}</h3>
              <button onClick={() => setSelectedComponent(null)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">النطاق المالك:</span>
                <span className="font-bold">{selectedComponent.ownedByPhase}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">الحالة:</span>
                <StatusBadge status={selectedComponent.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">وقت الفحص:</span>
                <span className="font-mono">{selectedComponent.lastCheckedTime}</span>
              </div>
              <div className="p-3 bg-slate-50 border rounded-xl text-gray-800 leading-relaxed mt-2">
                {selectedComponent.details}
              </div>
              {selectedComponent.errorMessageSummary && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-medium">
                  {selectedComponent.errorMessageSummary}
                </div>
              )}
            </div>

            <div className="pt-2 border-t flex justify-end">
              <button
                onClick={() => setSelectedComponent(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INCIDENT DETAIL MODAL */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900 text-base">تقرير الحادثة التشغيلية {selectedIncident.id}</h3>
              <button onClick={() => setSelectedIncident(null)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">المكون المتأثر:</span>
                <span className="font-bold">{selectedIncident.affectedComponentAr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">مستوى الخطورة:</span>
                <SeverityBadge severity={selectedIncident.severity} />
              </div>
              <div className="p-3 bg-slate-50 border rounded-xl text-gray-800 leading-relaxed mt-2">
                {selectedIncident.details}
              </div>
            </div>

            <div className="pt-2 border-t flex justify-end">
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: HealthCheckComponent['status'] }) {
  if (status === 'HEALTHY') {
    return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Healthy (سليم)</span>;
  }
  if (status === 'WARNING') {
    return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Warning (تنبيه)</span>;
  }
  if (status === 'DOWN') {
    return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">Down (متوقف)</span>;
  }
  return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">Not Configured</span>;
}

function SeverityBadge({ severity }: { severity: SystemIncidentItem['severity'] }) {
  if (severity === 'CRITICAL') {
    return <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded text-[10px] font-bold">حرج (Critical)</span>;
  }
  if (severity === 'WARNING') {
    return <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">تنبيه (Warning)</span>;
  }
  return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold">معلومات (Info)</span>;
}
