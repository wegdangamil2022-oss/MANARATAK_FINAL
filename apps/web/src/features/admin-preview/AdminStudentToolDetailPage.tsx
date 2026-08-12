import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/I18nProvider';
import { 
  Wrench, ArrowLeft, ArrowRight, ShieldAlert, Cpu, 
  CheckCircle2, AlertCircle, Clock, Users, Zap, Shield, 
  Sparkles, Layers, AlertTriangle, Play, Edit, ExternalLink, 
  Activity, Key, Lock, Check, X, RefreshCw, BarChart2
} from 'lucide-react';
import { ApiClient } from '../../api/client';

export function AdminStudentToolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isRTL } = useTranslation();

  const [tool, setTool] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals & Panels state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<{ action: string; message: string; requiresGovernanceWarning?: boolean } | null>(null);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  // Edit Form state
  const [editForm, setEditForm] = useState({
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    toolType: 'ASSISTANT',
    priority: 'P1',
    visibility: 'PUBLIC',
    status: 'ACTIVE',
    requiresLogin: false,
    costRisk: 'MEDIUM',
    appearsOnUi: ''
  });

  // Audit Trail History
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; timestamp: string; operator: string; action: string; details: string }>>([]);

  useEffect(() => {
    loadToolDetail();
  }, [id]);

  const loadToolDetail = async () => {
    setLoading(true);
    try {
      // Look up tool or seed detailed item
      const mockData: Record<string, any> = {
        'std_tool_01': {
          id: 'std_tool_01',
          toolKey: 'major-selection-assistant',
          titleAr: 'مساعد اختيار التخصص الأكاديمي',
          titleEn: 'Major Selection Assistant',
          descriptionAr: 'أداة ذكية تحلل ميول الطالب والدرجات المدرسية ومجالات الاهتمام لتقديم توصيات مخصصة بالتخصصات الجامعية الأكثر ملاءمة.',
          toolType: 'ASSISTANT',
          toolTypeLabelAr: 'مساعد ذكاء اصطناعي (AI Assistant)',
          visibility: 'PUBLIC',
          visibilityLabelAr: 'عامة (متاحة لجميع الزوار)',
          status: 'ACTIVE',
          statusLabelAr: 'نشطة (Active)',
          priority: 'P1',
          priorityLabelAr: 'P1 - إطلاق أساسي',
          aiDependency: 'REQUIRED',
          costRisk: 'MEDIUM',
          weeklyUsage: 1420,
          monthlyUsage: 5800,
          requiresLogin: false,
          appearsOnUi: 'كتالوج أدوات الطلاب العامة (/tools) وصفحة التخصصات (/majors)',
          updatedAt: '2026-07-28 09:30',
          aiGovernance: {
            proxyRoute: '/api/v1/ai/tools/major-selection',
            modelAlias: 'Gemini 1.5 Flash (via Phase 17 Proxy)',
            rateLimit: '50 طلب / دقيقة / طالب',
            tokenQuotaPerRun: '1,200 Token',
            safetyPolicy: 'حساسية عالية للمحتوى الأكاديمي والمهني (Academic Safety Enforced)',
            lastHealthCheck: '2026-07-28 10:15 - ناجح (200 OK)',
            isGovernanceApproved: true
          }
        },
        'std_tool_02': {
          id: 'std_tool_02',
          toolKey: 'scholarship-finder-assistant',
          titleAr: 'مساعد البحث الذكي عن المنح الدراسية',
          titleEn: 'Scholarship Finder Assistant',
          descriptionAr: 'مساعد تفاعلي يستند لمطابقة مؤهلات الطالب مع قاعدة بيانات المنح الدراسية الممولة بالكامل والجزئية.',
          toolType: 'ASSISTANT',
          toolTypeLabelAr: 'مساعد ذكاء اصطناعي (AI Assistant)',
          visibility: 'PUBLIC',
          visibilityLabelAr: 'عامة (متاحة للجميع)',
          status: 'ACTIVE',
          statusLabelAr: 'نشطة (Active)',
          priority: 'P1',
          priorityLabelAr: 'P1 - إطلاق أساسي',
          aiDependency: 'REQUIRED',
          costRisk: 'HIGH',
          weeklyUsage: 3150,
          monthlyUsage: 12400,
          requiresLogin: false,
          appearsOnUi: 'كتالوج الأدوات (/tools) والمنح الدراسية (/scholarships)',
          updatedAt: '2026-07-28 09:15',
          aiGovernance: {
            proxyRoute: '/api/v1/ai/tools/scholarship-finder',
            modelAlias: 'Gemini 1.5 Pro (via Phase 17 Engine)',
            rateLimit: '30 طلب / دقيقة / طالب',
            tokenQuotaPerRun: '2,500 Token',
            safetyPolicy: 'فلترة وتدقيق روابط المنح المعتمدة فقط',
            lastHealthCheck: '2026-07-28 09:00 - ناجح (200 OK)',
            isGovernanceApproved: true
          }
        },
        'std_tool_04': {
          id: 'std_tool_04',
          toolKey: 'motivation-letter-generator',
          titleAr: 'مولد ومراجع خطاب الدافع',
          titleEn: 'Motivation Letter Generator',
          descriptionAr: 'أداة تدقيق وتوليد هيكلية لخطابات الدافع والغرض من الدراسة مع التوافق الأكاديمي.',
          toolType: 'ASSISTANT',
          toolTypeLabelAr: 'مساعد ذكاء اصطناعي',
          visibility: 'AUTHENTICATED_STUDENTS',
          visibilityLabelAr: 'الطلاب المسجلين فقط',
          status: 'ACTIVE',
          statusLabelAr: 'نشطة (Active)',
          priority: 'P1',
          priorityLabelAr: 'P1 - إطلاق أساسي',
          aiDependency: 'REQUIRED',
          costRisk: 'HIGH',
          weeklyUsage: 1980,
          monthlyUsage: 7900,
          requiresLogin: true,
          appearsOnUi: 'مساحة عمل الطالب (/student/:ref/tools)',
          updatedAt: '2026-07-27 15:40',
          aiGovernance: {
            proxyRoute: '/api/v1/ai/tools/motivation-letter',
            modelAlias: 'Gemini 1.5 Flash (via Phase 17 Engine)',
            rateLimit: '15 طلب / دقيقة / طالب',
            tokenQuotaPerRun: '3,000 Token',
            safetyPolicy: 'منع الانتحال والسرقة الأدبية وتطبيق المحاذاة الأكاديمية',
            lastHealthCheck: '2026-07-27 14:00 - يتطلب تحديث الحدود',
            isGovernanceApproved: false
          }
        }
      };

      const found = mockData[id || ''] || {
        id: id || 'std_tool_generic',
        toolKey: id?.replace(/std_tool_/, 'tool-') || 'generic-student-tool',
        titleAr: 'أداة طلابية تفاعلية',
        titleEn: 'Interactive Student Tool',
        descriptionAr: 'أداة طلابية ضمن سجل أدوات منصة منارتك لإدارة التحصيل والخيارات الأكاديمية.',
        toolType: 'CALCULATOR',
        toolTypeLabelAr: 'حاسبة / أداة تفاعلية',
        visibility: 'PUBLIC',
        visibilityLabelAr: 'عامة (متاحة للجميع)',
        status: 'ACTIVE',
        statusLabelAr: 'نشطة (Active)',
        priority: 'P1',
        priorityLabelAr: 'P1 - إطلاق أساسي',
        aiDependency: 'NONE',
        costRisk: 'LOW',
        weeklyUsage: 850,
        monthlyUsage: 3400,
        requiresLogin: false,
        appearsOnUi: 'كتالوج أدوات الطلاب العامة (/tools)',
        updatedAt: '2026-07-28 10:00',
        aiGovernance: null
      };

      setTool(found);
      setEditForm({
        titleAr: found.titleAr,
        titleEn: found.titleEn,
        descriptionAr: found.descriptionAr,
        toolType: found.toolType,
        priority: found.priority,
        visibility: found.visibility,
        status: found.status,
        requiresLogin: found.requiresLogin,
        costRisk: found.costRisk,
        appearsOnUi: found.appearsOnUi
      });

      // Sample audit log history
      setAuditLogs([
        { id: 'log_1', timestamp: '2026-07-28 09:30', operator: 'مسؤول الحوكمة (Admin)', action: 'فحص جاهزية AI', details: 'تم التحقق من ربط المسار التبادلي عبر Phase 17' },
        { id: 'log_2', timestamp: '2026-07-27 14:15', operator: 'مطور النظام (DevOps)', action: 'تغيير الأولوية', details: 'تم رفع أولوية الإطلاق إلى P1' },
        { id: 'log_3', timestamp: '2026-07-25 11:00', operator: 'مشرف الأدوات', action: 'إنشاء الأداة', details: 'تسجيل الأداة في السجل المركزي Phase 18' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const addAuditLog = (action: string, details: string) => {
    const newLog = {
      id: `log_${Date.now()}`,
      timestamp: 'الآن',
      operator: 'مسؤول النظام (Current Admin)',
      action,
      details
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const handleUpdateStatus = (newStatus: string) => {
    setTool((prev: any) => ({ ...prev, status: newStatus }));
    addAuditLog('تغيير حالة دورة الحياة', `تم تعديل الحالة إلى ${newStatus}`);
    setShowConfirmModal(null);
  };

  const handleUpdateVisibility = (newVis: string, requiresWarning?: boolean) => {
    if (requiresWarning && tool.aiDependency !== 'NONE' && tool.costRisk === 'HIGH') {
      setShowConfirmModal({
        action: 'PUBLIC_HIGH_COST',
        message: 'تحذير الحوكمة (Governance Alert): هذه الأداة تعتمد على الذكاء الاصطناعي وعالية التكلفة (High Cost Risk). يرجى التأكد من ضبط حدود التوكنات ومعدل الطلبات في Phase 17 قبل إتاحتها للجمهور العام.',
        requiresGovernanceWarning: true
      });
      return;
    }
    setTool((prev: any) => ({ ...prev, visibility: newVis }));
    addAuditLog('تعديل الرؤية', `تم تعديل نطاق الرؤية إلى ${newVis}`);
    setShowConfirmModal(null);
  };

  const handleToggleLogin = () => {
    const nextLogin = !tool.requiresLogin;
    setTool((prev: any) => ({ ...prev, requiresLogin: nextLogin }));
    addAuditLog('تغيير اشتراط تسجيل الدخول', nextLogin ? 'يتطلب الآن تسجيل دخول الطالب' : 'متاحة للزوار بدون تسجيل');
  };

  const handleChangePriority = (p: string) => {
    setTool((prev: any) => ({ ...prev, priority: p }));
    addAuditLog('تحديث أولوية الإطلاق', `تم تعديل الأولوية إلى ${p}`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setTool((prev: any) => ({
      ...prev,
      titleAr: editForm.titleAr,
      titleEn: editForm.titleEn,
      descriptionAr: editForm.descriptionAr,
      toolType: editForm.toolType,
      priority: editForm.priority,
      visibility: editForm.visibility,
      status: editForm.status,
      requiresLogin: editForm.requiresLogin,
      costRisk: editForm.costRisk,
      appearsOnUi: editForm.appearsOnUi
    }));
    addAuditLog('تعديل البيانات الأساسية', 'تم تحديث اسم الأداة والوصف وتخصيصات الواجهة');
    setShowEditModal(false);
  };

  const handleRunTest = () => {
    setTesting(true);
    setTestOutput(null);
    setTimeout(() => {
      setTesting(false);
      if (tool.aiDependency !== 'NONE') {
        setTestOutput(`[محاكاة Phase 17 AI Execution - Proxy Mode]
تم الاستجابة بنجاح لمُدخل التجربة: "${testInput || 'توصية اختيار التخصص'}"
الموديل المستجيب: ${tool.aiGovernance?.modelAlias || 'Gemini 1.5 Flash via Phase 17'}
التوكنات المستهلكة: 412 Tokens (ضمن الحصة 1,200)
الوقت المستغرق: 640ms
الحالة الأمنية: محتوا متوافق 100% مع معايير الأمان الأكاديمي`);
      } else {
        setTestOutput(`[محاكاة Phase 18 Local Tool Calculator]
تم تنفيذ الأداة الحسابية بنجاح لمُدخل: "${testInput || 'حساب معدل GPA'}"
المخرجات: نتيجة المحاكاة جاهزة وسليمة 100%.`);
      }
      addAuditLog('اختبار الأداة', 'تم تشغيل تجربة أداء ومطابقة المخرجات');
    }, 900);
  };

  if (loading || !tool) {
    return <div className="p-12 text-center text-gray-500 dir-rtl">جاري تحميل تفاصيل أداة الطالب...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 dir-rtl">
      {/* Top Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <button onClick={() => navigate('/admin/student-tools')} className="hover:text-emerald-600">سجل أدوات الطلاب</button>
            <span>/</span>
            <span className="text-emerald-600 font-medium">{tool.titleAr}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
              <Wrench className="w-7 h-7 text-emerald-600" />
              <span>{tool.titleAr}</span>
            </h1>
            <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 dir-ltr">
              {tool.toolKey}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 dir-ltr text-right">
            {tool.titleEn}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/student-tools')}
            className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للكتالوج</span>
          </button>
        </div>
      </div>

      {/* Boundary Reminder Notice */}
      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center gap-3 text-xs text-amber-900 dark:text-amber-300">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <span>إدارة سجل الأداة ورؤيتها تتم هنا ضمن Phase 23/18. تنفيذ وحوكمة ومفاتيح الذكاء الاصطناعي تدار حصرياً عبر Phase 17 دون عرض مفاتيح أو برومبت مباشر.</span>
      </div>

      {/* Action Bar with 11 Operational Action Buttons */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-600" />
          <span>شريط الإجراءات والتحكم الإداري (11 Action Controls Bar):</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* 1. Edit Metadata */}
          <button
            onClick={() => setShowEditModal(true)}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>تعديل البيانات</span>
          </button>

          {/* 2. Activate */}
          {tool.status !== 'ACTIVE' && (
            <button
              onClick={() => setShowConfirmModal({
                action: 'ACTIVATE',
                message: 'هل أنت تأكد من تفعيل الأداة وإتاحتها للاستخدام وفق نطاق الرؤية المحدد؟'
              })}
              className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>تفعيل الأداة</span>
            </button>
          )}

          {/* 3. Disable */}
          {tool.status !== 'DISABLED' && (
            <button
              onClick={() => setShowConfirmModal({
                action: 'DISABLE',
                message: 'هل أنت تأكد من تعطيل هذه الأداة وإيقاف استجابتها فورياً؟'
              })}
              className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>تعطيل الأداة</span>
            </button>
          )}

          {/* 4. Mark Coming Soon */}
          {tool.status !== 'COMING_SOON' && (
            <button
              onClick={() => handleUpdateStatus('COMING_SOON')}
              className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>وضع قادم قريبًا</span>
            </button>
          )}

          {/* 5. Hide / Admin Only */}
          {tool.visibility !== 'ADMIN_ONLY' && (
            <button
              onClick={() => handleUpdateVisibility('ADMIN_ONLY')}
              className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>إخفاء / للإدارة فقط</span>
            </button>
          )}

          {/* 6. Show Publicly (With Governance Warning if High Cost AI) */}
          {tool.visibility !== 'PUBLIC' && (
            <button
              onClick={() => handleUpdateVisibility('PUBLIC', true)}
              className="px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>إظهار للعامة</span>
            </button>
          )}

          {/* 7. Toggle Require Login */}
          <button
            onClick={handleToggleLogin}
            className={`px-3 py-2 rounded-xl border font-medium flex items-center gap-1.5 cursor-pointer ${
              tool.requiresLogin 
                ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{tool.requiresLogin ? 'يتطلب تسجيل دخول الطالب' : 'متاح للزوار (بدون تسجيل)'}</span>
          </button>

          {/* 8. Change Priority Selector */}
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
            <span className="text-[11px] text-gray-500 px-1">الأولوية:</span>
            {(['P1', 'P2', 'P3'] as const).map(p => (
              <button
                key={p}
                onClick={() => handleChangePriority(p)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                  tool.priority === p 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* 9. Test Tool */}
          <button
            onClick={() => setShowTestPanel(!showTestPanel)}
            className="px-3 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300 font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>اختبار الأداة</span>
          </button>

          {/* 10. Open AI Governance */}
          <button
            onClick={() => navigate('/admin/health')}
            className="px-3 py-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-300 font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>فتح حوكمة AI (Phase 17)</span>
          </button>

          {/* 11. Open Dependency Health */}
          <button
            onClick={() => navigate('/admin/health')}
            className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>فتح صحة الاعتمادات</span>
          </button>
        </div>
      </div>

      {/* Test Panel Simulator Modal / Drawer */}
      {showTestPanel && (
        <div className="bg-white dark:bg-gray-900 border border-purple-200 dark:border-purple-800 rounded-2xl p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-900/50 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-purple-900 dark:text-purple-300">
              <Play className="w-4 h-4 text-purple-600" />
              <span>محاكي اختبار أداء الأداة (Tool Test Simulator - Proxy Mode):</span>
            </div>
            <button onClick={() => setShowTestPanel(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                مُدخل التجربة (Test Prompt Input / Parameter Payload):
              </label>
              <input
                type="text"
                value={testInput}
                onChange={e => setTestInput(e.target.value)}
                placeholder="أدخل نص التجرية، التخصص المستهدف، أو القيم الحسابية..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleRunTest}
                disabled={testing}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>{testing ? 'جاري التشغيل عبر البروكسي...' : 'تشغيل الاختبار'}</span>
              </button>
            </div>

            {testOutput && (
              <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed whitespace-pre-wrap dir-ltr text-left">
                {testOutput}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Grid Detail Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2-Columns: Tool Specifications & Dependency Matrix */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Tool Metadata & Description */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
              <Layers className="w-5 h-5 text-emerald-600" />
              <span>مواصفات الأداة وبطاقة التعريف (Tool Registry Specs)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-1">
                <span className="text-gray-500 dark:text-gray-400 block">اسم الأداة بالعربية:</span>
                <span className="font-bold text-gray-900 dark:text-white text-sm">{tool.titleAr}</span>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-1">
                <span className="text-gray-500 dark:text-gray-400 block">اسم الأداة بالإنجليزية:</span>
                <span className="font-bold text-gray-900 dark:text-white text-sm dir-ltr text-right block">{tool.titleEn}</span>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-1 md:col-span-2">
                <span className="text-gray-500 dark:text-gray-400 block">وصف الأداة ومخرجاتها:</span>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{tool.descriptionAr}</p>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-1">
                <span className="text-gray-500 dark:text-gray-400 block">نوع الأداة (Category / Type):</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">{tool.toolTypeLabelAr}</span>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-1">
                <span className="text-gray-500 dark:text-gray-400 block">مكان الظهور في واجهات المنصة:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{tool.appearsOnUi}</span>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-1">
                <span className="text-gray-500 dark:text-gray-400 block">حالة دورة الحياة (Lifecycle):</span>
                <span className="font-bold text-emerald-600">{tool.statusLabelAr}</span>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-1">
                <span className="text-gray-500 dark:text-gray-400 block">نطاق الرؤية (Visibility):</span>
                <span className="font-bold text-blue-600">{tool.visibilityLabelAr}</span>
              </div>
            </div>
          </div>

          {/* Card 2: AI Governance Linkage Panel (if AI Backed) */}
          <div className="bg-white dark:bg-gray-900 border border-purple-200 dark:border-purple-800/60 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-900/40 pb-3">
              <h2 className="text-base font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-600" />
                <span>لوحة ربط حوكمة الذكاء الاصطناعي (Phase 17 AI Linkage Panel)</span>
              </h2>

              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                tool.aiDependency !== 'NONE' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' : 'bg-gray-100 text-gray-600'
              }`}>
                {tool.aiDependency !== 'NONE' ? 'مرتبطة بالذكاء الاصطناعي' : 'لا تتطلب AI'}
              </span>
            </div>

            {tool.aiDependency !== 'NONE' ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
                    <span className="text-gray-500 dark:text-gray-400 block mb-0.5">مسار البروكسي (Proxy Route):</span>
                    <span className="font-mono text-purple-700 dark:text-purple-300 font-bold dir-ltr block text-right">{tool.aiGovernance?.proxyRoute || '/api/v1/ai/tools/proxy'}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
                    <span className="text-gray-500 dark:text-gray-400 block mb-0.5">اسم النماذج المشغلة:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{tool.aiGovernance?.modelAlias || 'Gemini 1.5 Flash via Phase 17'}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
                    <span className="text-gray-500 dark:text-gray-400 block mb-0.5">حد السعة (Rate Limit):</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{tool.aiGovernance?.rateLimit || '50 طلب / دقيقة'}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
                    <span className="text-gray-500 dark:text-gray-400 block mb-0.5">حصة التوكنات للتطبيق الواحدة:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{tool.aiGovernance?.tokenQuotaPerRun || '1,200 Token'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white block">سياسات الأمان والسلامة الأكاديمية (Safety Guardrails):</span>
                    <span className="text-gray-600 dark:text-gray-300">{tool.aiGovernance?.safetyPolicy || 'تطبيق سياسات المحاذاة الأكاديمية وعدم توليد إجابات جاهزة للغش.'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-purple-100 dark:border-purple-900/30">
                  <span className="text-gray-500 text-[11px]">آخر فحص صحة AI: {tool.aiGovernance?.lastHealthCheck || '2026-07-28 - 200 OK'}</span>
                  <button
                    onClick={() => navigate('/admin/health')}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    فتح لوحة حوكمة Phase 17
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                هذه الأداة لا تعتمد على نماذج الذكاء الاصطناعي (Normal Tool / Calculator). تعمل مباشرة في متصفح الطالب أو منطق Phase 18 المحلي.
              </p>
            )}
          </div>

          {/* Card 3: Dependency Health Summary Panel */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>مصفوفة صحة الاعتمادات والجاهزية (Dependency Health Matrix)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300 font-medium">منصة AI (Phase 17)</span>
                {tool.aiDependency !== 'NONE' ? (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">متصل وجاهز</span>
                ) : (
                  <span className="text-gray-400">غير مستخدم</span>
                )}
              </div>

              <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300 font-medium">بيانات المنح (Phase 12)</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">متصل</span>
              </div>

              <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300 font-medium">بيانات الجامعات (Phase 11)</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">متصل</span>
              </div>

              <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300 font-medium">بيانات التخصصات (Phase 10)</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">متصل</span>
              </div>

              <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300 font-medium">مساحة عمل الطالب (Phase 15)</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">جاهز</span>
              </div>

              <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300 font-medium">خدمات المدفوعات (Phase 19)</span>
                <span className="text-gray-400">غير مطلوب (أداة مجانية)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
              <span className="font-bold block mb-1">رسالة التدهور السلس في حال تعثر الاعتماد (Graceful Degradation Notice):</span>
              "في حال توقف خدمة AI، تعرض الواجهة للطلاب: (عذراً، خدمة التوصية الذكية غير متاحة مؤقتاً بسبب صيانة المحرك. يمكنك تصفح التخصصات يدوياً عبر الكتالوج العامة)."
            </div>
          </div>
        </div>

        {/* Right 1-Column: Usage Stats, Risk Level & Audit Log */}
        <div className="space-y-6">
          
          {/* Usage & Risk Stats Box */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
              <span>الإحصائيات وتقييم المخاطر</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <span className="text-gray-600 dark:text-gray-400">الاستخدام الأسبوعي:</span>
                <span className="font-bold text-gray-900 dark:text-white text-sm">{tool.weeklyUsage?.toLocaleString()} مرة</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <span className="text-gray-600 dark:text-gray-400">الاستخدام الشهري:</span>
                <span className="font-bold text-gray-900 dark:text-white text-sm">{tool.monthlyUsage?.toLocaleString()} مرة</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <span className="text-gray-600 dark:text-gray-400">مستوى مخاطر التكلفة:</span>
                <span className={`font-bold px-2.5 py-0.5 rounded-full ${
                  tool.costRisk === 'HIGH' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                  tool.costRisk === 'MEDIUM' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                  'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  {tool.costRisk === 'HIGH' ? 'عالية (High Risk)' : tool.costRisk === 'MEDIUM' ? 'متوسطة' : 'منخفضة (Low)'}
                </span>
              </div>
            </div>
          </div>

          {/* Audit History Log */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
              <Clock className="w-5 h-5 text-gray-600" />
              <span>سجل النشاطات والتعديلات (Audit Log)</span>
            </h2>

            <div className="space-y-3 text-xs divide-y divide-gray-100 dark:divide-gray-800">
              {auditLogs.map((log) => (
                <div key={log.id} className="pt-3 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-[11px]">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{log.operator}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <div className="font-bold text-emerald-700 dark:text-emerald-400">{log.action}</div>
                  <p className="text-gray-600 dark:text-gray-300">{log.details}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">تعديل بيانات الأداة الرسمية</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">اسم الأداة بالعربية:</label>
                <input
                  type="text"
                  required
                  value={editForm.titleAr}
                  onChange={e => setEditForm({...editForm, titleAr: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">اسم الأداة بالإنجليزية:</label>
                <input
                  type="text"
                  value={editForm.titleEn}
                  onChange={e => setEditForm({...editForm, titleEn: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none dir-ltr"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">الوصف والمخرجات:</label>
                <textarea
                  rows={3}
                  value={editForm.descriptionAr}
                  onChange={e => setEditForm({...editForm, descriptionAr: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">مستوى التكلفة:</label>
                  <select
                    value={editForm.costRisk}
                    onChange={e => setEditForm({...editForm, costRisk: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none"
                  >
                    <option value="LOW">منخفضة (Low)</option>
                    <option value="MEDIUM">متوسطة (Medium)</option>
                    <option value="HIGH">عالية (High)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">مكان الظهور:</label>
                  <input
                    type="text"
                    value={editForm.appearsOnUi}
                    onChange={e => setEditForm({...editForm, appearsOnUi: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors cursor-pointer"
                >
                  حفظ التغييرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation & Governance Warning Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">تأكيد الإجراء الحساس</h3>
            </div>

            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
              {showConfirmModal.message}
            </p>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowConfirmModal(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  if (showConfirmModal.action === 'ACTIVATE') handleUpdateStatus('ACTIVE');
                  else if (showConfirmModal.action === 'DISABLE') handleUpdateStatus('DISABLED');
                  else if (showConfirmModal.action === 'PUBLIC_HIGH_COST') {
                    setTool((prev: any) => ({ ...prev, visibility: 'PUBLIC' }));
                    addAuditLog('إتاحة للعامة مع تحذير الحوكمة', 'تم نشر أداة عالية التكلفة مع تسليم إشعار ضبط الحصة لـ Phase 17');
                    setShowConfirmModal(null);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer"
              >
                موافق وتأكيد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
