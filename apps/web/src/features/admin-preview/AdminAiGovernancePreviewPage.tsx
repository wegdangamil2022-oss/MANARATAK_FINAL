import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../i18n/I18nProvider';
import { 
  Cpu, Shield, Layers, Key, CheckCircle2, XCircle, Clock, AlertTriangle, 
  RefreshCw, Eye, Sparkles, Languages, FileText, Award, BarChart2, 
  Settings, Zap, Play, Pause, RotateCcw, Lock, Server, Activity, 
  Sliders, ArrowUpRight, Check, X, Search, Filter, Globe, HelpCircle, FileCheck
} from 'lucide-react';

export interface AdminAiProvider {
  id: string;
  name: string;
  status: 'ACTIVE' | 'DISABLED' | 'DEGRADED' | 'NOT_CONFIGURED';
  priorityOrder: number;
  assignedServices: string[];
  lastHealthCheck: string;
  avgLatencyMs: number;
  failureRatePercentage: number;
  hasApiKeyConfigured: boolean; // NO raw secrets exposed!
}

export interface AdminAiTranslationBatch {
  id: string;
  entityTypeAr: string;
  pendingCount: number;
  completedCount: number;
  failedCount: number;
  lastTranslatedAt: string;
  targetLanguages: string;
  reviewStatusAr: string;
}

export interface AdminAiPromptItem {
  id: string;
  nameAr: string;
  nameEn: string;
  serviceName: string;
  version: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  lastUpdated: string;
  updatedBy: string;
  targetProviderModel: string;
  safetyClassification: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK';
  promptText: string;
  variables: string[];
  outputFormatExpectation: string;
  safetyNotes: string;
}

export interface AdminAiTaskItem {
  id: string;
  taskTypeAr: string;
  relatedDomain: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'BLOCKED' | 'NEEDS_HUMAN_REVIEW';
  providerUsed: string;
  modelUsed: string;
  startedAt: string;
  completedAt?: string;
  runtimeDurationMs?: number;
  tokenUsage?: number;
  retryCount: number;
}

export interface AdminAiLogItem {
  operationId: string;
  toolNameAr: string;
  userType: 'GUEST' | 'STUDENT' | 'ADMIN' | 'SYSTEM';
  provider: string;
  model: string;
  safetyResult: 'PASSED' | 'BANNED_KEYWORD' | 'SENSITIVE_REDACTED' | 'FLAGGED_FOR_REVIEW';
  errorMessage?: string;
  timestamp: string;
}

export function AdminAiGovernancePreviewPage() {
  const { isRTL } = useTranslation();

  const [activeTab, setActiveTab] = useState<
    'DASHBOARD' | 'PROVIDERS' | 'TRANSLATIONS' | 'PROMPTS' | 'TASKS' | 'QUEUE' | 'LOGS' | 'SETTINGS' | 'ANALYTICS' | 'BOUNDARY'
  >('DASHBOARD');

  const [providers, setProviders] = useState<AdminAiProvider[]>([]);
  const [translations, setTranslations] = useState<AdminAiTranslationBatch[]>([]);
  const [prompts, setPrompts] = useState<AdminAiPromptItem[]>([]);
  const [tasks, setTasks] = useState<AdminAiTaskItem[]>([]);
  const [logs, setLogs] = useState<AdminAiLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Queue State Controls (Simulated Preview)
  const [queueIsPaused, setQueueIsPaused] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<AdminAiPromptItem | null>(null);
  const [selectedTask, setSelectedTask] = useState<AdminAiTaskItem | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadAiCenterData();
  }, []);

  const loadAiCenterData = async () => {
    setLoading(true);
    try {
      setProviders([
        {
          id: 'prov_gemini',
          name: 'Google Gemini AI',
          status: 'ACTIVE',
          priorityOrder: 1,
          assignedServices: ['الترجمات متعددة اللغات', 'ملخصات المقالات', 'مواءمة التخصصات'],
          lastHealthCheck: '2026-07-28 11:45',
          avgLatencyMs: 420,
          failureRatePercentage: 0.1,
          hasApiKeyConfigured: true
        },
        {
          id: 'prov_openai',
          name: 'OpenAI GPT Models',
          status: 'ACTIVE',
          priorityOrder: 2,
          assignedServices: ['إنشاء السير الذاتية (CV Generator)', 'مراجعة السير الذاتية'],
          lastHealthCheck: '2026-07-28 11:44',
          avgLatencyMs: 890,
          failureRatePercentage: 0.3,
          hasApiKeyConfigured: true
        },
        {
          id: 'prov_claude',
          name: 'Anthropic Claude',
          status: 'ACTIVE',
          priorityOrder: 3,
          assignedServices: ['صياغة خطابات الدافع (Motivation Letters)', 'التدقيق الأكاديمي'],
          lastHealthCheck: '2026-07-28 11:42',
          avgLatencyMs: 950,
          failureRatePercentage: 0.2,
          hasApiKeyConfigured: true
        },
        {
          id: 'prov_deepseek',
          name: 'DeepSeek AI Engine',
          status: 'DEGRADED',
          priorityOrder: 4,
          assignedServices: ['الترجمة المجمعة الثانوية'],
          lastHealthCheck: '2026-07-28 11:30',
          avgLatencyMs: 1450,
          failureRatePercentage: 2.8,
          hasApiKeyConfigured: true
        },
        {
          id: 'prov_local',
          name: 'Local / On-Premise LLM Engine',
          status: 'NOT_CONFIGURED',
          priorityOrder: 5,
          assignedServices: ['الطوارئ والمعالجة المحلية (Standby)'],
          lastHealthCheck: 'لم يتم الفحص',
          avgLatencyMs: 0,
          failureRatePercentage: 0,
          hasApiKeyConfigured: false
        }
      ]);

      setTranslations([
        {
          id: 'trans_uni',
          entityTypeAr: 'بيانات الجامعات والكليات',
          pendingCount: 14,
          completedCount: 380,
          failedCount: 1,
          lastTranslatedAt: '2026-07-28 10:15',
          targetLanguages: 'العربية <-> الإنجليزية',
          reviewStatusAr: 'بانتظار تدقيق تحرير CMS (Phase 16)'
        },
        {
          id: 'trans_sch',
          entityTypeAr: 'المنح الدراسية الدولية',
          pendingCount: 8,
          completedCount: 215,
          failedCount: 0,
          lastTranslatedAt: '2026-07-28 09:40',
          targetLanguages: 'العربية <-> الإنجليزية',
          reviewStatusAr: 'مكتمل ومحول للتدقيق'
        },
        {
          id: 'trans_crs',
          entityTypeAr: 'مقررات والدورات الدراسية',
          pendingCount: 32,
          completedCount: 520,
          failedCount: 2,
          lastTranslatedAt: '2026-07-28 11:00',
          targetLanguages: 'العربية <-> الإنجليزية',
          reviewStatusAr: 'جاري الترجمة المجمعة'
        }
      ]);

      setPrompts([
        {
          id: 'prm_01',
          nameAr: 'موجه ترجمة المصطلحات الأكاديمية',
          nameEn: 'Academic Entity Translation Prompt',
          serviceName: 'AI Translation Service',
          version: 'v2.1',
          status: 'ACTIVE',
          lastUpdated: '2026-07-15',
          updatedBy: 'فريق هندسة الذكاء الاصطناعي',
          targetProviderModel: 'Gemini 1.5 Pro',
          safetyClassification: 'LOW_RISK',
          promptText: 'Translate the provided academic university text into formal Arabic/English ensuring exact preservation of official university names, accreditation terms, and program descriptions.',
          variables: ['{{source_text}}', '{{target_language}}', '{{domain_category}}'],
          outputFormatExpectation: 'JSON object containing { translatedText: string, confidenceScore: number, terminologyMap: Array }',
          safetyNotes: 'تأكيد الحفاظ على الأسماء الرسمية وتجنب الترجمة الحرفية للمؤسسات.'
        },
        {
          id: 'prm_02',
          nameAr: 'موجه صياغة خطاب الدافع الشخصي',
          nameEn: 'Motivation Letter Generator Prompt',
          serviceName: 'Motivation Letter Tool (Phase 18)',
          version: 'v3.0',
          status: 'ACTIVE',
          lastUpdated: '2026-07-22',
          updatedBy: 'د. خالد العتيبي',
          targetProviderModel: 'Claude 3.5 Sonnet',
          safetyClassification: 'MEDIUM_RISK',
          promptText: 'Draft a compelling, authentic academic motivation letter tailored to the target university program based strictly on the provided student background and academic goals.',
          variables: ['{{student_background}}', '{{target_university}}', '{{program_name}}', '{{key_achievements}}'],
          outputFormatExpectation: 'Markdown text structured into standard academic statement paragraphs.',
          safetyNotes: 'يُحظر كتابة الادعاءات الوهمية أو تزييف المؤهلات الأكاديمية.'
        },
        {
          id: 'prm_03',
          nameAr: 'موجه مراجعة نقدية وتنسيق السيرة الذاتية',
          nameEn: 'CV Review & Optimization Prompt',
          serviceName: 'CV Reviewer Tool (Phase 18)',
          version: 'v1.5',
          status: 'ACTIVE',
          lastUpdated: '2026-07-10',
          updatedBy: 'أحمد منصور',
          targetProviderModel: 'OpenAI GPT-4o',
          safetyClassification: 'LOW_RISK',
          promptText: 'Analyze the structured CV text against ATS standards and modern industry expectations, highlighting strengths, weaknesses, and key missing action verbs.',
          variables: ['{{cv_json}}', '{{target_industry}}'],
          outputFormatExpectation: 'JSON containing { score: number, strengths: Array, improvements: Array, atsKeywordsMissing: Array }',
          safetyNotes: 'تشفير ومسح أي بيانات اتصال شخصية قبل التمرير للنموذج.'
        }
      ]);

      setTasks([
        {
          id: 'task_8801',
          taskTypeAr: 'إنشاء خطاب دافع لمفاضلة المنح',
          relatedDomain: 'أدوات الطلاب (Phase 18)',
          status: 'COMPLETED',
          providerUsed: 'Anthropic Claude',
          modelUsed: 'claude-3-5-sonnet',
          startedAt: '2026-07-28 11:40:12',
          completedAt: '2026-07-28 11:40:14',
          runtimeDurationMs: 1820,
          tokenUsage: 1240,
          retryCount: 0
        },
        {
          id: 'task_8802',
          taskTypeAr: 'ترجمة مجمعة لمقالات الكليات',
          relatedDomain: 'إدارة المحتوى (Phase 16)',
          status: 'RUNNING',
          providerUsed: 'Google Gemini AI',
          modelUsed: 'gemini-1.5-pro',
          startedAt: '2026-07-28 11:42:00',
          retryCount: 0
        },
        {
          id: 'task_8803',
          taskTypeAr: 'تحليل السيرة الذاتية ومعايير ATS',
          relatedDomain: 'أدوات الطلاب (Phase 18)',
          status: 'NEEDS_HUMAN_REVIEW',
          providerUsed: 'OpenAI GPT Models',
          modelUsed: 'gpt-4o',
          startedAt: '2026-07-28 11:35:10',
          completedAt: '2026-07-28 11:35:12',
          runtimeDurationMs: 2100,
          tokenUsage: 1850,
          retryCount: 1
        }
      ]);

      setLogs([
        {
          operationId: 'op_9901',
          toolNameAr: 'إنشاء خطاب الدافع (Motivation Letter)',
          userType: 'STUDENT',
          provider: 'Anthropic Claude',
          model: 'claude-3-5-sonnet',
          safetyResult: 'PASSED',
          timestamp: '2026-07-28 11:40:14'
        },
        {
          operationId: 'op_9902',
          toolNameAr: 'ترجمة وصف منحة دراسية',
          userType: 'SYSTEM',
          provider: 'Google Gemini AI',
          model: 'gemini-1.5-pro',
          safetyResult: 'PASSED',
          timestamp: '2026-07-28 11:38:22'
        },
        {
          operationId: 'op_9903',
          toolNameAr: 'فحص مواءمة السيرة الذاتية',
          userType: 'STUDENT',
          provider: 'OpenAI GPT Models',
          model: 'gpt-4o',
          safetyResult: 'SENSITIVE_REDACTED',
          timestamp: '2026-07-28 11:35:12'
        }
      ]);
    } catch (err) {
      console.error('Error loading AI Center data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProviderStatus = (id: string) => {
    setProviders(providers.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
        return { ...p, status: nextStatus };
      }
      return p;
    }));
    setActionNotice({ type: 'info', text: 'تم تحديث حالة المزود في معمارية التوجيه المركزية.' });
  };

  const handleTestProviderConnection = (name: string) => {
    setActionNotice({ type: 'success', text: `تم اختبار الاتصال بـ (${name}): زمن الاستجابة 380ms - الاتصال نشط وسليم.` });
  };

  const handlePauseResumeQueue = () => {
    setQueueIsPaused(!queueIsPaused);
    setActionNotice({ 
      type: 'info', 
      text: queueIsPaused ? 'تم إستئناف معالجة طابور الذكاء الاصطناعي (AI Queue Resumed).' : 'تم إيقاف طابور المعالجة مؤقتاً (AI Queue Paused).' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg border border-purple-800/40">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-400/30">
              <Cpu className="w-8 h-8 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">مركز الذكاء الاصطناعي والحوكمة المركزية (AI Center)</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Phase 17 Engine
                </span>
              </div>
              <p className="text-sm text-purple-200 mt-1">
                إدارة مزودي الذكاء الاصطناعي، توجيه النماذج، المستودع المركزي للموجهات (Prompts)، طوابار المعالجة، والحدود الخصوصية.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('BOUNDARY')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              <Shield className="w-4 h-4" />
              ميثاق الخدمات ومعمارية AIService
            </button>
          </div>
        </div>

        {/* Boundary Notice Bar */}
        <div className="mt-4 pt-4 border-t border-purple-800/60 flex flex-wrap items-center justify-between text-xs text-purple-200 gap-2">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>حماية الخصوصية: لا يتم عرض أو تخزين مفاتيح API Secrets أبدًا | البيانات الشخصية للطلاب مشفرة ومحجوبة (Redacted)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-purple-900/80 px-2.5 py-0.5 rounded text-[11px] font-mono border border-purple-700">
              Router: AIService.routeRequest()
            </span>
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
          actionNotice.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
          actionNotice.type === 'error' ? 'bg-rose-50 text-rose-900 border-rose-200' : 'bg-blue-50 text-blue-900 border-blue-200'
        }`}>
          <span>{actionNotice.text}</span>
          <button onClick={() => setActionNotice(null)} className="text-xs font-bold px-2 py-1 hover:underline">
            إغلاق
          </button>
        </div>
      )}

      {/* Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl p-3.5 border shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">طلبات الذكاء اليوم</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-gray-900">14,280</p>
          <span className="text-[10px] text-emerald-600">+12% مقارنة بالأمس</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">عمليات الترجمة</span>
            <Languages className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-blue-700">4,120</p>
          <span className="text-[10px] text-blue-600">جامعات ومنح ومقالات</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">خطابات الدافع (CV/ML)</span>
            <FileText className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl font-bold text-purple-700">5,950</p>
          <span className="text-[10px] text-purple-600">أدوات الطلاب (Phase 18)</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">استهلاك التوكنز</span>
            <BarChart2 className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl font-bold text-indigo-900">42.8M</p>
          <span className="text-[10px] text-gray-500 font-mono">~$38.50 تقديري</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">متوسط زمن الاستجابة</span>
            <Clock className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-xl font-bold text-slate-800 font-mono">840ms</p>
          <span className="text-[10px] text-emerald-600">سرعة ممتازة</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">مستبعدة بحواجز الأمان</span>
            <Shield className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-xl font-bold text-rose-700">42</p>
          <span className="text-[10px] text-rose-600">0.29% معدل المحجوب</span>
        </div>
      </div>

      {/* Navigation Workstation Tabs */}
      <div className="bg-white rounded-xl border p-1.5 flex flex-wrap items-center gap-1 shadow-sm text-xs font-semibold">
        <button
          onClick={() => setActiveTab('DASHBOARD')}
          className={`py-2 px-3 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'DASHBOARD' ? 'bg-purple-800 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          لوحة المراقبة
        </button>

        <button
          onClick={() => setActiveTab('PROVIDERS')}
          className={`py-2 px-3 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'PROVIDERS' ? 'bg-purple-800 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Server className="w-4 h-4" />
          مزودو الخدمة ({providers.filter(p => p.status === 'ACTIVE').length} نشط)
        </button>

        <button
          onClick={() => setActiveTab('TRANSLATIONS')}
          className={`py-2 px-3 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'TRANSLATIONS' ? 'bg-purple-800 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Languages className="w-4 h-4" />
          مركز الترجمة بالذكاء
        </button>

        <button
          onClick={() => setActiveTab('PROMPTS')}
          className={`py-2 px-3 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'PROMPTS' ? 'bg-purple-800 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          مستودع الموجهات (Prompts)
        </button>

        <button
          onClick={() => setActiveTab('TASKS')}
          className={`py-2 px-3 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'TASKS' ? 'bg-purple-800 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          متابعة المهام ({tasks.length})
        </button>

        <button
          onClick={() => setActiveTab('QUEUE')}
          className={`py-2 px-3 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'QUEUE' ? 'bg-purple-800 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          طابور المعالجة (AI Queue)
        </button>

        <button
          onClick={() => setActiveTab('LOGS')}
          className={`py-2 px-3 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'LOGS' ? 'bg-purple-800 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Lock className="w-4 h-4" />
          السجلات والحوادث
        </button>

        <button
          onClick={() => setActiveTab('SETTINGS')}
          className={`py-2 px-3 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'SETTINGS' ? 'bg-purple-800 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          الإعدادات العامة
        </button>

        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`py-2 px-3 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'ANALYTICS' ? 'bg-purple-800 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          التحليلات والاستهلاك
        </button>

        <button
          onClick={() => setActiveTab('BOUNDARY')}
          className={`py-2 px-3 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'BOUNDARY' ? 'bg-purple-800 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Shield className="w-4 h-4" />
          الحدود والمعمارية
        </button>
      </div>

      {/* TAB 1: AI CENTER DASHBOARD */}
      {activeTab === 'DASHBOARD' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
          <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900">حالة وجاهزية محركات الذكاء الاصطناعي (AI Provider Health)</h2>
              <p className="text-xs text-gray-500">نظرة شاملة على استقرار المزودين ومعدلات الاستجابة لحظياً.</p>
            </div>
            <button onClick={loadAiCenterData} className="inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold hover:bg-gray-50">
              <RefreshCw className="w-3.5 h-3.5" />
              تحديث الحالة
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.map((p) => (
              <div key={p.id} className="border rounded-2xl p-4 space-y-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Server className="w-4 h-4 text-purple-600" />
                    {p.name}
                  </div>
                  <ProviderStatusBadge status={p.status} />
                </div>

                <div className="text-xs space-y-1.5 text-gray-700 bg-white p-3 rounded-xl border">
                  <div className="flex justify-between">
                    <span className="text-gray-500">الأولوية التوجيهية:</span>
                    <span className="font-bold font-mono text-purple-900"># {p.priorityOrder}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">زمن الاستجابة (Latency):</span>
                    <span className="font-mono font-bold text-gray-900">{p.avgLatencyMs} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">معدل الفشل (Failure Rate):</span>
                    <span className="font-mono text-emerald-700 font-bold">{p.failureRatePercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">مفتاح API:</span>
                    <span className={`font-mono text-[11px] font-bold ${p.hasApiKeyConfigured ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {p.hasApiKeyConfigured ? 'مُعد وآمن (Configured)' : 'غير مكتمل (Missing)'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-gray-500 font-medium block mb-1">الخدمات المسندة:</span>
                  <div className="flex flex-wrap gap-1">
                    {p.assignedServices.map((srv, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-800 rounded border border-purple-200">
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: AI PROVIDERS */}
      {activeTab === 'PROVIDERS' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-gray-900">إدارة وتوجيه المزودين (AI Providers Management)</h2>
            <p className="text-xs text-gray-500">ضبط أولوية المزودين والخدمات الافتراضية مع إخفاء تام لمفاتيح الـ API.</p>
          </div>

          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 border-b text-gray-600 font-semibold uppercase">
                <tr>
                  <th className="py-3.5 px-4">اسم المزود</th>
                  <th className="py-3.5 px-4">الحالة التشغيلية</th>
                  <th className="py-3.5 px-4">الأولوية</th>
                  <th className="py-3.5 px-4">الخدمات الافتراضية</th>
                  <th className="py-3.5 px-4">حالة الـ API Key</th>
                  <th className="py-3.5 px-4">الزمن ومعدل الخطأ</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات الخاضعة للحوكمة</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-800">
                {providers.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-gray-900">{p.name}</td>
                    <td className="py-3.5 px-4"><ProviderStatusBadge status={p.status} /></td>
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-900">#{p.priorityOrder}</td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="text-[11px] text-gray-700 truncate">{p.assignedServices.join(', ')}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono text-[10px] font-bold">
                        {p.hasApiKeyConfigured ? 'Configured (Masked)' : 'Missing'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-700">
                      {p.avgLatencyMs}ms / {p.failureRatePercentage}%
                    </td>
                    <td className="py-3.5 px-4 text-center space-x-1 space-x-reverse">
                      <button
                        onClick={() => handleToggleProviderStatus(p.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold border ${
                          p.status === 'ACTIVE' ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {p.status === 'ACTIVE' ? 'تعطيل' : 'تفعيل'}
                      </button>
                      <button
                        onClick={() => handleTestProviderConnection(p.name)}
                        className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded text-[11px] font-semibold border border-blue-200 hover:bg-blue-100"
                      >
                        فحص الاتصال
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AI TRANSLATION CENTER */}
      {activeTab === 'TRANSLATIONS' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900">مركز الترجمة بالذكاء الاصطناعي (AI Translation Center)</h2>
              <p className="text-xs text-gray-500">إدارة ترجمة الكيانات الأكاديمية والمحتوى بدون نشر تلقائي.</p>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-amber-950">
              <Shield className="w-4 h-4 text-amber-600" />
              قاعدة الحوكمة الإلزامية للترجمة (Phase 16 Editorial Governance)
            </span>
            <p className="leading-relaxed">
              الترجمات المولدة عبر الذكاء الاصطناعي لا تُنشر تلقائياً أبداً. تتحول جميع الترجمات فور اكتمالها إلى قائمة مراجعة التحرير (CMS Review Queue / Phase 16) قبل الاعتماد النهائي والظهور على المنصة.
            </p>
          </div>

          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 border-b text-gray-600 font-semibold uppercase">
                <tr>
                  <th className="py-3.5 px-4">نوع الكيان المراد ترجمته</th>
                  <th className="py-3.5 px-4">قيد الترجمة</th>
                  <th className="py-3.5 px-4">المكتملة</th>
                  <th className="py-3.5 px-4">اللغات المستهدفة</th>
                  <th className="py-3.5 px-4">حالة المراجعة التحكيمية</th>
                  <th className="py-3.5 px-4 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-800">
                {translations.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-gray-900">{t.entityTypeAr}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-700">{t.pendingCount} كيان</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{t.completedCount} كيان</td>
                    <td className="py-3.5 px-4 font-medium text-gray-700">{t.targetLanguages}</td>
                    <td className="py-3.5 px-4 text-gray-600">{t.reviewStatusAr}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setActionNotice({ type: 'success', text: `تم بدء دفعة الترجمة المجمعة لـ (${t.entityTypeAr}) بنجاح.` })}
                        className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                      >
                        بدء دفعة ترجمة
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PROMPT MANAGEMENT */}
      {activeTab === 'PROMPTS' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <div className="border-b pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">مستودع الموجهات المركزي (Prompt Management)</h2>
              <p className="text-xs text-gray-500">إدارة ونُسخ الموجهات البرمجية خارج الكود المصدري لسهولة الضبط والتطوير.</p>
            </div>
          </div>

          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 border-b text-gray-600 font-semibold uppercase">
                <tr>
                  <th className="py-3.5 px-4">اسم الموجه والخدمة</th>
                  <th className="py-3.5 px-4">النسخة</th>
                  <th className="py-3.5 px-4">الحالة</th>
                  <th className="py-3.5 px-4">النموذج المستهدف</th>
                  <th className="py-3.5 px-4">تصنيف الأمان</th>
                  <th className="py-3.5 px-4">آخر تحديث</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-800">
                {prompts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{p.nameAr}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{p.serviceName}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-900">{p.version}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-gray-800">{p.targetProviderModel}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-[10px]">
                        {p.safetyClassification}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-500">{p.lastUpdated}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedPrompt(p)}
                        className="px-3 py-1.5 bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 rounded-lg text-xs font-semibold transition-colors"
                      >
                        عرض وتعديل الموجه
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: AI TASKS */}
      {activeTab === 'TASKS' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-gray-900">سجل متابعة مهام الذكاء الاصطناعي (AI Task Tracking)</h2>
            <p className="text-xs text-gray-500">تتبع المهام المنفذة عبر الأدوات وتحديد النموذج المستعمل وزمن التشغيل.</p>
          </div>

          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 border-b text-gray-600 font-semibold uppercase">
                <tr>
                  <th className="py-3.5 px-4">معرف المهمة ونوعها</th>
                  <th className="py-3.5 px-4">النطاق والخدمة</th>
                  <th className="py-3.5 px-4">حالة التنفيذ</th>
                  <th className="py-3.5 px-4">المزود والنموذج</th>
                  <th className="py-3.5 px-4">وقت البدء والمدة</th>
                  <th className="py-3.5 px-4">التوكنز المستخدمة</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-800">
                {tasks.map((tsk) => (
                  <tr key={tsk.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{tsk.taskTypeAr}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{tsk.id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-700 font-medium">{tsk.relatedDomain}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-purple-100 text-purple-900 rounded-full font-bold text-[10px]">
                        {tsk.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-gray-900">
                      {tsk.providerUsed} ({tsk.modelUsed})
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-600">
                      <div>{tsk.startedAt}</div>
                      {tsk.runtimeDurationMs && <div className="text-[10px] text-emerald-700">{tsk.runtimeDurationMs} ms</div>}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-900">
                      {tsk.tokenUsage ? `${tsk.tokenUsage} Token` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: AI QUEUE */}
      {activeTab === 'QUEUE' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">طابور معالجة العمليات (AI Workload Queue - BullMQ)</h2>
              <p className="text-xs text-gray-500">التحكم في تدفق العمليات وإعادة تشغيل المهام المتعثرة.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePauseResumeQueue}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-colors ${
                  queueIsPaused ? 'bg-emerald-700 text-white hover:bg-emerald-600' : 'bg-amber-600 text-white hover:bg-amber-500'
                }`}
              >
                {queueIsPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {queueIsPaused ? 'إستئناف الطابور' : 'إيقاف الطابور مؤقتاً'}
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-slate-100 border border-slate-300 rounded-xl text-xs text-slate-800 flex items-center justify-between">
            <span className="font-semibold">[بيئة المعاينة التحكمية] يعبر هذا المشهد عن طابور المعالجة الخلفي المعتمد على BullMQ وRedis في Phase 17.</span>
            <span className="font-mono text-[11px] text-purple-900 font-bold">Queue: ai_orchestration_queue</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
              <span className="text-[11px] text-blue-700 block font-semibold">في الانتظار (Queued)</span>
              <span className="text-lg font-bold font-mono text-blue-900">12 مهمة</span>
            </div>
            <div className="bg-purple-50 p-3 rounded-xl border border-purple-200">
              <span className="text-[11px] text-purple-700 block font-semibold">جاري التشغيل (Active)</span>
              <span className="text-lg font-bold font-mono text-purple-900">4 مهام</span>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
              <span className="text-[11px] text-amber-700 block font-semibold">طابور إعادة المحاولة</span>
              <span className="text-lg font-bold font-mono text-amber-900">2 مهمة</span>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              <span className="text-[11px] text-emerald-700 block font-semibold">متوسط وقت الانتظار</span>
              <span className="text-lg font-bold font-mono text-emerald-900">1.2 ثانية</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: LOGS & INCIDENTS */}
      {activeTab === 'LOGS' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-gray-900">سجلات الحوكمة والأمان (AI Logs & Privacy Protection)</h2>
            <p className="text-xs text-gray-500">سجل متكامل للعمليات مع التشفير والتعتيم التلقائي للبيانات الحساسة للطلاب.</p>
          </div>

          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 border-b text-gray-600 font-semibold uppercase">
                <tr>
                  <th className="py-3.5 px-4">معرف العملية (Op ID)</th>
                  <th className="py-3.5 px-4">الأداة / الخدمة</th>
                  <th className="py-3.5 px-4">نوع المستخدم</th>
                  <th className="py-3.5 px-4">المزود والنموذج</th>
                  <th className="py-3.5 px-4">نتيجة فحص الأمان (Safety Result)</th>
                  <th className="py-3.5 px-4">التاريخ والوقت</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-800">
                {logs.map((lg) => (
                  <tr key={lg.operationId} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-900">{lg.operationId}</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">{lg.toolNameAr}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-700">{lg.userType}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-700">{lg.provider} ({lg.model})</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        lg.safetyResult === 'PASSED' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-900'
                      }`}>
                        {lg.safetyResult}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-500">{lg.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: AI SETTINGS */}
      {activeTab === 'SETTINGS' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-gray-900">إعدادات المنظومة والقيود (AI Platform Parameters)</h2>
            <p className="text-xs text-gray-500">تكوين الحدود الاستهلاكية وحواجز الأمان لمعمارية الذكاء الاصطناعي.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-4 rounded-xl border space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">المزودات الافتراضية والتوجيه</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border">
                  <span>المزود الأساسي الافتراضي:</span>
                  <span className="font-bold text-purple-900">Google Gemini 1.5 Pro</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border">
                  <span>مزود الاحتياط (Fallback Provider):</span>
                  <span className="font-bold text-gray-900">OpenAI GPT-4o-mini</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border">
                  <span>الحد الأقصى لإعادة المحاولة (Max Retries):</span>
                  <span className="font-bold font-mono">3 محاولات</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">حدود الاستهلاك والأمان</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border">
                  <span>الحد اليومي لطلبات الطالب:</span>
                  <span className="font-bold font-mono text-emerald-800">100 طلب / يوم</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border">
                  <span>حاجز الأمان (Safety Filter Level):</span>
                  <span className="font-bold text-purple-900">عالي (Strict Academic)</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border">
                  <span>حد التنبيه للتكلفة اليومية:</span>
                  <span className="font-bold font-mono text-rose-700">$ 50.00 / يوم</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: AI USAGE ANALYTICS */}
      {activeTab === 'ANALYTICS' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-gray-900">تحليلات الاستخدام والاستهلاك المالي</h2>
            <p className="text-xs text-gray-500">توزيع الأدوات الأكثر استخداماً ونسب النجاح والاستهلاك التراكمي.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-4 rounded-xl border space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">توزيع الاستخدام حسب الأدوات</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border">
                  <span>إنشاء ومراجعة السير الذاتية (CV Tools)</span>
                  <span className="font-bold text-purple-900">38%</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border">
                  <span>صياغة خطابات الدافع (Motivation Letters)</span>
                  <span className="font-bold text-purple-900">28%</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border">
                  <span>ترجمة الكيانات والمقالات (AI Translation)</span>
                  <span className="font-bold text-purple-900">22%</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border">
                  <span>توصيات المنح والتخصصات (Matching)</span>
                  <span className="font-bold text-purple-900">12%</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">معدل النجاح والفشل الإجمالي</h3>
              <div className="p-4 bg-white rounded-xl border space-y-3 text-xs">
                <div className="flex justify-between font-bold">
                  <span>معدل العمليات الناجحة:</span>
                  <span className="text-emerald-700 font-mono">99.2%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full w-[99.2%]" />
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  معدل الفشل المنخفض يعكس استقرار شبكة التوجيه والتنقل التلقائي بين المزودين عند انخفاض الجاهزية.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 10: UNIFIED AI SERVICE BOUNDARY PANEL */}
      {activeTab === 'BOUNDARY' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-gray-900">ميثاق الخدمة الموحدة ومعمارية AIService (Phase 17 Standard)</h2>
            <p className="text-xs text-gray-500">ضوابط الربط الهيكلي ومنع الاستدعاء المباشر للمزودين من واجهات القطاعات.</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 p-5 rounded-2xl space-y-3 text-xs text-purple-950">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-700" />
              المبدأ المعماري الحاكم للاستدعاء (Unified Orchestration Boundary)
            </h3>
            <p className="leading-relaxed">
              جميع قطاعات المنصة وأدوات الطلاب والخدمات الإدارية يجب أن تستدعي الخدمة المركزية الموحدة <code className="bg-purple-100 px-1.5 py-0.5 rounded font-mono font-bold text-purple-900">AIService.routeRequest()</code> حصراً. يُحظر تماماً على أي مكون في واجهة المستخدم أو النطاقات الأخرى إجراء استدعاء مباشر لمزودي الذكاء الاصطناعي (مثل OpenAI أو Gemini أو Claude).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="border rounded-xl p-4 bg-slate-50 space-y-2">
              <h4 className="font-bold text-gray-900 text-sm">مسؤولية Phase 17 (AI Platform Center)</h4>
              <ul className="space-y-1.5 text-gray-700 list-disc list-inside">
                <li>إدارة وتوجيه المزودين والنماذج بحسب الجاهزية والتكلفة.</li>
                <li>إدارة الموجهات المركزية (Prompts Repository).</li>
                <li>طوابير المعالجة وتحديد سقف الاستهلاك (Rate Limiting).</li>
                <li>تشفير وتعتيم بيانات الطلاب الحساسة لحماية الخصوصية.</li>
              </ul>
            </div>

            <div className="border rounded-xl p-4 bg-slate-50 space-y-2">
              <h4 className="font-bold text-gray-900 text-sm">مسؤولية النطاقات المستهلكة (Phase 18 / 16 / 15 / 23)</h4>
              <ul className="space-y-1.5 text-gray-700 list-disc list-inside">
                <li>Phase 18 تملك واجهات وتجربة أدوات الطلاب (CV, Motivation Letter).</li>
                <li>Phase 16 تملك التدقيق التحريري ونشر المحتوى المترجم.</li>
                <li>Phase 15 تملك بيانات هوية الشخصية وخصوصية الطالب.</li>
                <li>Phase 23 تملك لوحات التحكم والإدارة دون امتلاك محرك التوجيه.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Detail Modal */}
      {selectedPrompt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border text-right">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-base">{selectedPrompt.nameAr}</h3>
                <span className="text-xs font-mono text-purple-900 font-semibold">{selectedPrompt.serviceName} ({selectedPrompt.version})</span>
              </div>
              <button onClick={() => setSelectedPrompt(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">نص الموجه المركزي (System Prompt Text):</label>
                <textarea
                  readOnly
                  value={selectedPrompt.promptText}
                  className="w-full h-28 p-3 bg-slate-50 border rounded-xl font-mono text-xs text-gray-800 leading-relaxed"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">المتغيرات المحجوزة (Placeholder Variables):</label>
                <div className="flex flex-wrap gap-1">
                  {selectedPrompt.variables.map((v, i) => (
                    <span key={i} className="px-2 py-1 bg-purple-50 text-purple-900 rounded border font-mono text-[11px] font-bold">
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">صيغة المخرج المتوقعة (Output Format):</label>
                <div className="p-2.5 bg-slate-50 border rounded-lg font-mono text-[11px] text-gray-700">
                  {selectedPrompt.outputFormatExpectation}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <button
                onClick={() => {
                  setSelectedPrompt(null);
                  setActionNotice({ type: 'success', text: 'تم اختبار الموجه في بيئة المحاكاة بنجاح.' });
                }}
                className="px-4 py-2 bg-purple-800 text-white hover:bg-purple-700 rounded-xl text-xs font-bold shadow-sm"
              >
                اختبار الموجه الآن
              </button>
              <button onClick={() => setSelectedPrompt(null)} className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-gray-50">
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProviderStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'ACTIVE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          نشط وجاهز
        </span>
      );
    case 'DEGRADED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
          <AlertTriangle className="w-3.5 h-3.5" />
          أداء منخفض
        </span>
      );
    case 'DISABLED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-100 text-rose-800 rounded-full text-xs font-bold">
          <XCircle className="w-3.5 h-3.5" />
          معطل
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
          غير مُعد
        </span>
      );
  }
}
