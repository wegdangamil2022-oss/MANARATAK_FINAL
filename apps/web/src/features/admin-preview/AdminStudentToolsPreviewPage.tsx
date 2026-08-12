import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/I18nProvider';
import { 
  Wrench, ArrowLeft, ArrowRight, Search, Plus, 
  CheckCircle2, AlertCircle, RefreshCw, Eye, ShieldAlert, 
  Cpu, Clock, Users, Zap, Shield, Sparkles, Layers, AlertTriangle, X
} from 'lucide-react';
import { ApiClient } from '../../api/client';

export interface StudentToolAdminItem {
  id: string;
  toolKey: string;
  titleAr: string;
  titleEn: string;
  toolType: 'NORMAL_TOOL' | 'AI_TOOL' | 'CALCULATOR' | 'ASSISTANT' | 'COMPARISON_TOOL';
  toolTypeLabelAr: string;
  visibility: 'PUBLIC' | 'AUTHENTICATED_STUDENTS' | 'HIDDEN' | 'ADMIN_ONLY';
  visibilityLabelAr: string;
  status: 'ACTIVE' | 'COMING_SOON' | 'UNDER_DEVELOPMENT' | 'DISABLED' | 'RETIRED';
  statusLabelAr: string;
  priority: 'P1' | 'P2' | 'P3';
  aiDependency: 'REQUIRED' | 'OPTIONAL' | 'NONE';
  aiDependencyLabelAr: string;
  costRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  weeklyUsage: number;
  healthStatus: 'HEALTHY' | 'NEEDS_GOVERNANCE_REVIEW' | 'DEPENDENCY_DEGRADED';
  appearsOnUi: string;
  requiresLogin: boolean;
  updatedAt: string;
}

export function AdminStudentToolsPreviewPage() {
  const navigate = useNavigate();
  const { isRTL } = useTranslation();

  const [tools, setTools] = useState<StudentToolAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedVisibility, setSelectedVisibility] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedAiFilter, setSelectedAiFilter] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State for Creating New Tool Registry Item
  const [newTool, setNewTool] = useState({
    toolKey: '',
    titleAr: '',
    titleEn: '',
    toolType: 'ASSISTANT' as const,
    visibility: 'PUBLIC' as const,
    status: 'COMING_SOON' as const,
    priority: 'P2' as const,
    aiDependency: 'REQUIRED' as const,
    costRisk: 'MEDIUM' as const,
    requiresLogin: false,
    appearsOnUi: 'كتالوج أدوات الطلاب العامة (/tools)'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const publicTools = await ApiClient.getStudentTools();
      if (publicTools && publicTools.length > 0) {
        // Map public tool DTO to admin registry schema
        const mapped = publicTools.map((t, idx) => ({
          id: `std_tool_${idx + 1}`,
          toolKey: t.toolKey,
          titleAr: t.displayName,
          titleEn: t.toolKey.replace(/-/g, ' ').toUpperCase(),
          toolType: t.aiDependencyLevel !== 'NONE' ? ('AI_TOOL' as const) : ('NORMAL_TOOL' as const),
          toolTypeLabelAr: t.aiDependencyLevel !== 'NONE' ? 'مساعد ذكاء اصطناعي' : 'أداة طلابية عادية',
          visibility: t.visibilityStatus === 'ACTIVE' ? ('PUBLIC' as const) : ('HIDDEN' as const),
          visibilityLabelAr: t.visibilityStatus === 'ACTIVE' ? 'عامة (متاحة للجميع)' : 'مخفية',
          status: t.visibilityStatus === 'ACTIVE' ? ('ACTIVE' as const) : ('COMING_SOON' as const),
          statusLabelAr: t.visibilityStatus === 'ACTIVE' ? 'نشطة (Active)' : 'قادمة قريبًا',
          priority: 'P1' as const,
          aiDependency: t.aiDependencyLevel !== 'NONE' ? ('REQUIRED' as const) : ('NONE' as const),
          aiDependencyLabelAr: t.aiDependencyLevel !== 'NONE' ? 'ذكاء اصطناعي (AI)' : 'بدون ذكاء اصطناعي',
          costRisk: t.aiDependencyLevel !== 'NONE' ? ('MEDIUM' as const) : ('LOW' as const),
          weeklyUsage: 1200 + idx * 150,
          healthStatus: 'HEALTHY' as const,
          appearsOnUi: 'كتالوج أدوات الطلاب العامة (/tools)',
          requiresLogin: !t.anonymousEnabled,
          updatedAt: '2026-07-28 10:00'
        }));
        setTools(mapped);
        return;
      }
      throw new Error('Fallback required');
    } catch {
      // Seed 12 comprehensive sample tools aligned with specification
      setTools([
        {
          id: 'std_tool_01',
          toolKey: 'major-selection-assistant',
          titleAr: 'مساعد اختيار التخصص الأكاديمي',
          titleEn: 'Major Selection Assistant',
          toolType: 'ASSISTANT',
          toolTypeLabelAr: 'مساعد ذكاء اصطناعي',
          visibility: 'PUBLIC',
          visibilityLabelAr: 'عامة (متاحة للجميع)',
          status: 'ACTIVE',
          statusLabelAr: 'نشطة (Active)',
          priority: 'P1',
          aiDependency: 'REQUIRED',
          aiDependencyLabelAr: 'ذكاء اصطناعي (AI)',
          costRisk: 'MEDIUM',
          weeklyUsage: 1420,
          healthStatus: 'HEALTHY',
          appearsOnUi: 'كتالوج أدوات الطلاب العامة (/tools)',
          requiresLogin: false,
          updatedAt: '2026-07-28 09:30'
        },
        {
          id: 'std_tool_02',
          toolKey: 'scholarship-finder-assistant',
          titleAr: 'مساعد البحث الذكي عن المنح الدراسية',
          titleEn: 'Scholarship Finder Assistant',
          toolType: 'ASSISTANT',
          toolTypeLabelAr: 'مساعد ذكاء اصطناعي',
          visibility: 'PUBLIC',
          visibilityLabelAr: 'عامة (متاحة للجميع)',
          status: 'ACTIVE',
          statusLabelAr: 'نشطة (Active)',
          priority: 'P1',
          aiDependency: 'REQUIRED',
          aiDependencyLabelAr: 'ذكاء اصطناعي (AI)',
          costRisk: 'HIGH',
          weeklyUsage: 3150,
          healthStatus: 'HEALTHY',
          appearsOnUi: 'كتالوج أدوات الطلاب العامة (/tools)',
          requiresLogin: false,
          updatedAt: '2026-07-28 09:15'
        },
        {
          id: 'std_tool_03',
          toolKey: 'scholarship-eligibility-checker',
          titleAr: 'مدقق أهلية وشروط المنح الدراسية',
          titleEn: 'Scholarship Eligibility Checker',
          toolType: 'ASSISTANT',
          toolTypeLabelAr: 'مساعد ذكاء اصطناعي',
          visibility: 'PUBLIC',
          visibilityLabelAr: 'عامة (متاحة للجميع)',
          status: 'ACTIVE',
          statusLabelAr: 'نشطة (Active)',
          priority: 'P1',
          aiDependency: 'REQUIRED',
          aiDependencyLabelAr: 'ذكاء اصطناعي (AI)',
          costRisk: 'MEDIUM',
          weeklyUsage: 2890,
          healthStatus: 'HEALTHY',
          appearsOnUi: 'كتالوج أدوات الطلاب والمنح (/scholarships)',
          requiresLogin: false,
          updatedAt: '2026-07-27 18:00'
        },
        {
          id: 'std_tool_04',
          toolKey: 'motivation-letter-generator',
          titleAr: 'مولد ومراجع خطاب الدافع',
          titleEn: 'Motivation Letter Generator',
          toolType: 'ASSISTANT',
          toolTypeLabelAr: 'مساعد ذكاء اصطناعي',
          visibility: 'AUTHENTICATED_STUDENTS',
          visibilityLabelAr: 'الطلاب المسجلين',
          status: 'ACTIVE',
          statusLabelAr: 'نشطة (Active)',
          priority: 'P1',
          aiDependency: 'REQUIRED',
          aiDependencyLabelAr: 'ذكاء اصطناعي (AI)',
          costRisk: 'HIGH',
          weeklyUsage: 1980,
          healthStatus: 'NEEDS_GOVERNANCE_REVIEW',
          appearsOnUi: 'مساحة عمل الطالب (/student/:id)',
          requiresLogin: true,
          updatedAt: '2026-07-27 15:40'
        },
        {
          id: 'std_tool_05',
          toolKey: 'cv-resume-builder',
          titleAr: 'منشئ السيرة الذاتية الأكاديمية',
          titleEn: 'Academic CV & Resume Builder',
          toolType: 'NORMAL_TOOL',
          toolTypeLabelAr: 'أداة عادية',
          visibility: 'AUTHENTICATED_STUDENTS',
          visibilityLabelAr: 'الطلاب المسجلين',
          status: 'ACTIVE',
          statusLabelAr: 'نشطة (Active)',
          priority: 'P1',
          aiDependency: 'NONE',
          aiDependencyLabelAr: 'بدون ذكاء اصطناعي',
          costRisk: 'LOW',
          weeklyUsage: 2410,
          healthStatus: 'HEALTHY',
          appearsOnUi: 'مساحة عمل الطالب (/student/:id)',
          requiresLogin: true,
          updatedAt: '2026-07-27 12:10'
        },
        {
          id: 'std_tool_06',
          toolKey: 'study-cost-calculator',
          titleAr: 'حاسبة تكلفة المعيشة والدراسة',
          titleEn: 'Study & Living Cost Calculator',
          toolType: 'CALCULATOR',
          toolTypeLabelAr: 'حاسبة تفاعلية',
          visibility: 'PUBLIC',
          visibilityLabelAr: 'عامة (متاحة للجميع)',
          status: 'ACTIVE',
          statusLabelAr: 'نشطة (Active)',
          priority: 'P2',
          aiDependency: 'NONE',
          aiDependencyLabelAr: 'بدون ذكاء اصطناعي',
          costRisk: 'LOW',
          weeklyUsage: 1120,
          healthStatus: 'HEALTHY',
          appearsOnUi: 'كتالوج أدوات الطلاب العامة (/tools)',
          requiresLogin: false,
          updatedAt: '2026-07-26 14:20'
        },
        {
          id: 'std_tool_07',
          toolKey: 'gpa-calculator',
          titleAr: 'حاسبة المعدل التراكمي الجامعي (GPA)',
          titleEn: 'GPA & Credit Calculator',
          toolType: 'CALCULATOR',
          toolTypeLabelAr: 'حاسبة تفاعلية',
          visibility: 'PUBLIC',
          visibilityLabelAr: 'عامة (متاحة للجميع)',
          status: 'ACTIVE',
          statusLabelAr: 'نشطة (Active)',
          priority: 'P1',
          aiDependency: 'NONE',
          aiDependencyLabelAr: 'بدون ذكاء اصطناعي',
          costRisk: 'LOW',
          weeklyUsage: 4200,
          healthStatus: 'HEALTHY',
          appearsOnUi: 'كتالوج أدوات الطلاب العامة (/tools)',
          requiresLogin: false,
          updatedAt: '2026-07-26 11:00'
        },
        {
          id: 'std_tool_08',
          toolKey: 'university-comparison-tool',
          titleAr: 'أداة المقارنة المباشرة بين الجامعات',
          titleEn: 'University Comparison Tool',
          toolType: 'COMPARISON_TOOL',
          toolTypeLabelAr: 'أداة مقارنة',
          visibility: 'PUBLIC',
          visibilityLabelAr: 'عامة (متاحة للجميع)',
          status: 'ACTIVE',
          statusLabelAr: 'نشطة (Active)',
          priority: 'P1',
          aiDependency: 'OPTIONAL',
          aiDependencyLabelAr: 'ذكاء اصطناعي اختياري',
          costRisk: 'LOW',
          weeklyUsage: 1850,
          healthStatus: 'HEALTHY',
          appearsOnUi: 'صفحة المقارنة المباشرة (/compare)',
          requiresLogin: false,
          updatedAt: '2026-07-25 16:30'
        },
        {
          id: 'std_tool_09',
          toolKey: 'scholarship-comparison-tool',
          titleAr: 'أداة المقارنة بين برامج المنح الدراسية',
          titleEn: 'Scholarship Comparison Tool',
          toolType: 'COMPARISON_TOOL',
          toolTypeLabelAr: 'أداة مقارنة',
          visibility: 'PUBLIC',
          visibilityLabelAr: 'عامة (متاحة للجميع)',
          status: 'ACTIVE',
          statusLabelAr: 'نشطة (Active)',
          priority: 'P1',
          aiDependency: 'OPTIONAL',
          aiDependencyLabelAr: 'ذكاء اصطناعي اختياري',
          costRisk: 'LOW',
          weeklyUsage: 1640,
          healthStatus: 'HEALTHY',
          appearsOnUi: 'صفحة المقارنة المباشرة (/compare)',
          requiresLogin: false,
          updatedAt: '2026-07-25 13:15'
        },
        {
          id: 'std_tool_10',
          toolKey: 'document-checklist-assistant',
          titleAr: 'مساعد قائمة المستندات المتكاملة',
          titleEn: 'Document Checklist Assistant',
          toolType: 'NORMAL_TOOL',
          toolTypeLabelAr: 'أداة عادية',
          visibility: 'PUBLIC',
          visibilityLabelAr: 'عامة (متاحة للجميع)',
          status: 'COMING_SOON',
          statusLabelAr: 'قادمة قريبًا',
          priority: 'P2',
          aiDependency: 'NONE',
          aiDependencyLabelAr: 'بدون ذكاء اصطناعي',
          costRisk: 'LOW',
          weeklyUsage: 0,
          healthStatus: 'HEALTHY',
          appearsOnUi: 'كتالوج أدوات الطلاب العامة (/tools)',
          requiresLogin: false,
          updatedAt: '2026-07-24 10:00'
        },
        {
          id: 'std_tool_11',
          toolKey: 'study-plan-builder',
          titleAr: 'مخطط جدول الدراسة والخطة الفصلية',
          titleEn: 'Study Plan & Semester Builder',
          toolType: 'ASSISTANT',
          toolTypeLabelAr: 'مساعد ذكاء اصطناعي',
          visibility: 'AUTHENTICATED_STUDENTS',
          visibilityLabelAr: 'الطلاب المسجلين',
          status: 'UNDER_DEVELOPMENT',
          statusLabelAr: 'قيد التطوير',
          priority: 'P2',
          aiDependency: 'REQUIRED',
          aiDependencyLabelAr: 'ذكاء اصطناعي (AI)',
          costRisk: 'HIGH',
          weeklyUsage: 0,
          healthStatus: 'NEEDS_GOVERNANCE_REVIEW',
          appearsOnUi: 'مساحة عمل الطالب (/student/:id)',
          requiresLogin: true,
          updatedAt: '2026-07-23 17:00'
        },
        {
          id: 'std_tool_12',
          toolKey: 'application-timeline-planner',
          titleAr: 'مخطط مواعيد وزمن التقديم',
          titleEn: 'Application Timeline Planner',
          toolType: 'NORMAL_TOOL',
          toolTypeLabelAr: 'أداة عادية',
          visibility: 'PUBLIC',
          visibilityLabelAr: 'عامة (متاحة للجميع)',
          status: 'COMING_SOON',
          statusLabelAr: 'قادمة قريبًا',
          priority: 'P3',
          aiDependency: 'NONE',
          aiDependencyLabelAr: 'بدون ذكاء اصطناعي',
          costRisk: 'LOW',
          weeklyUsage: 0,
          healthStatus: 'HEALTHY',
          appearsOnUi: 'كتالوج أدوات الطلاب العامة (/tools)',
          requiresLogin: false,
          updatedAt: '2026-07-22 08:30'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTools = tools.filter(tool => {
    const matchesSearch = searchQuery === '' || 
      tool.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.toolKey.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'ALL' || tool.toolType === selectedType;
    const matchesVisibility = selectedVisibility === 'ALL' || tool.visibility === selectedVisibility;
    const matchesStatus = selectedStatus === 'ALL' || tool.status === selectedStatus;
    const matchesAi = selectedAiFilter === 'ALL' || 
      (selectedAiFilter === 'AI_ONLY' && tool.aiDependency !== 'NONE') ||
      (selectedAiFilter === 'NO_AI' && tool.aiDependency === 'NONE');

    return matchesSearch && matchesType && matchesVisibility && matchesStatus && matchesAi;
  });

  // Calculate 8 top counters as requested
  const totalCount = tools.length;
  const activeCount = tools.filter(t => t.status === 'ACTIVE').length;
  const aiToolsCount = tools.filter(t => t.aiDependency !== 'NONE').length;
  const comingSoonCount = tools.filter(t => t.status === 'COMING_SOON').length;
  const hiddenCount = tools.filter(t => t.visibility === 'HIDDEN' || t.visibility === 'ADMIN_ONLY').length;
  const disabledCount = tools.filter(t => t.status === 'DISABLED').length;
  const needsGovernanceReviewCount = tools.filter(t => t.healthStatus === 'NEEDS_GOVERNANCE_REVIEW' || (t.aiDependency !== 'NONE' && t.costRisk === 'HIGH')).length;
  const highCostRiskCount = tools.filter(t => t.costRisk === 'HIGH').length;

  const handleCreateTool = (e: React.FormEvent) => {
    e.preventDefault();
    const created: StudentToolAdminItem = {
      id: `std_tool_${Date.now()}`,
      toolKey: newTool.toolKey || `custom-tool-${Date.now()}`,
      titleAr: newTool.titleAr || 'أداة جديدة',
      titleEn: newTool.titleEn || 'New Student Tool',
      toolType: newTool.toolType,
      toolTypeLabelAr: (newTool.toolType as string) === 'AI_TOOL' || (newTool.toolType as string) === 'ASSISTANT' ? 'مساعد ذكاء اصطناعي' : 'أداة عادية',
      visibility: newTool.visibility,
      visibilityLabelAr: (newTool.visibility as string) === 'PUBLIC' ? 'عامة (متاحة للجميع)' : 'الطلاب المسجلين',
      status: newTool.status,
      statusLabelAr: (newTool.status as string) === 'ACTIVE' ? 'نشطة' : 'قادمة قريبًا',
      priority: newTool.priority,
      aiDependency: newTool.aiDependency,
      aiDependencyLabelAr: (newTool.aiDependency as string) !== 'NONE' ? 'ذكاء اصطناعي (AI)' : 'بدون ذكاء اصطناعي',
      costRisk: newTool.costRisk,
      weeklyUsage: 0,
      healthStatus: (newTool.aiDependency as string) !== 'NONE' && (newTool.costRisk as string) === 'HIGH' ? 'NEEDS_GOVERNANCE_REVIEW' : 'HEALTHY',
      appearsOnUi: newTool.appearsOnUi,
      requiresLogin: newTool.requiresLogin,
      updatedAt: 'الآن'
    };
    setTools([created, ...tools]);
    setShowCreateModal(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 dir-rtl">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <button onClick={() => navigate('/admin')} className="hover:text-emerald-600">لوحة التحكم</button>
            <span>/</span>
            <span className="text-emerald-600 font-medium">سجل أدوات الطلاب</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Wrench className="w-7 h-7 text-emerald-600" />
            سجل حوكمة وتنظيم أدوات الطلاب (Student Tools Registry)
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            إدارة الكتالوج، أولوية الإطلاق، حالات الرؤية ودورة الحياة، وربط حوكمة الاعتماد على الذكاء الاصطناعي.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-2 text-sm transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل أداة جديدة</span>
          </button>
        </div>
      </div>

      {/* Boundary Reminder Notice */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3 text-xs leading-relaxed text-amber-900 dark:text-amber-300">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">حدود البناء المعماري والمسؤوليات (Architectural Boundary Rules):</span>
          أدوات الطلاب تدار عبر <strong>Phase 18</strong> (السجل، التهيئة، وتجربة الطالب). محرك ونماذج وحوكمة الذكاء الاصطناعي تتبع حصرياً لـ <strong>Phase 17</strong>. الواجهة الإدارية <strong>Phase 23</strong> تضبط الرؤية ودورة الحياة والحالة التشغيلية فقط دون تخزين مفاتيح أو صياغات البرومبت.
        </div>
      </div>

      {/* Top 8 Statistics Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">كل الأدوات</div>
          <div className="text-xl font-black text-gray-900 dark:text-white mt-1">{totalCount}</div>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>الأدوات النشطة</span>
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{activeCount}</div>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            <Cpu className="w-3 h-3" />
            <span>أدوات الذكاء</span>
          </div>
          <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{aiToolsCount}</div>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-[11px] font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>قادمة قريبًا</span>
          </div>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">{comingSoonCount}</div>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>مخفية / للإدارة</span>
          </div>
          <div className="text-xl font-black text-slate-700 dark:text-slate-300 mt-1">{hiddenCount}</div>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>معطلة</span>
          </div>
          <div className="text-xl font-black text-gray-600 dark:text-gray-400 mt-1">{disabledCount}</div>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>مراجعة حوكمة AI</span>
          </div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{needsGovernanceReviewCount}</div>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-[11px] font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>عالية التكلفة</span>
          </div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">{highCostRiskCount}</div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الأداة أو المفتاح..."
              className="w-full pr-9 pl-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Tool Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none"
            >
              <option value="ALL">جميع أنواع الأدوات</option>
              <option value="ASSISTANT">مساعد (Assistant)</option>
              <option value="AI_TOOL">أداة ذكاء اصطناعي</option>
              <option value="CALCULATOR">حاسبة تفاعلية</option>
              <option value="COMPARISON_TOOL">أداة مقارنة</option>
              <option value="NORMAL_TOOL">أداة عادية</option>
            </select>

            {/* Visibility Filter */}
            <select
              value={selectedVisibility}
              onChange={(e) => setSelectedVisibility(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none"
            >
              <option value="ALL">جميع مستويات الرؤية</option>
              <option value="PUBLIC">عامة (Public)</option>
              <option value="AUTHENTICATED_STUDENTS">الطلاب المسجلين فقط</option>
              <option value="HIDDEN">مخفية (Hidden)</option>
              <option value="ADMIN_ONLY">للإدارة فقط</option>
            </select>

            {/* Lifecycle Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none"
            >
              <option value="ALL">جميع حالات دورة الحياة</option>
              <option value="ACTIVE">نشطة (Active)</option>
              <option value="COMING_SOON">قادمة قريبًا</option>
              <option value="UNDER_DEVELOPMENT">قيد التطوير</option>
              <option value="DISABLED">معطلة</option>
              <option value="RETIRED">متقاعدة</option>
            </select>

            {/* AI Dependency Filter */}
            <select
              value={selectedAiFilter}
              onChange={(e) => setSelectedAiFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none"
            >
              <option value="ALL">جميع الاعتمادات</option>
              <option value="AI_ONLY">تعتمد على AI</option>
              <option value="NO_AI">بدون AI</option>
            </select>

            <button
              onClick={loadData}
              className="p-2 text-gray-500 hover:text-emerald-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              title="تحديث السجل"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Lightweight Vertical Row Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-gray-500">جاري تحميل سجل أدوات الطلاب...</div>
        ) : filteredTools.length === 0 ? (
          <div className="p-12 text-center text-gray-500">لا توجد أدوات طلابية مطابقة لفلاتر البحث.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredTools.map((tool) => (
              <div key={tool.id} className="p-4 hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Tool Information */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-gray-900 dark:text-white text-base">
                      {tool.titleAr}
                    </span>

                    {/* AI Badge */}
                    {tool.aiDependency !== 'NONE' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        <span>ذكاء اصطناعي (AI)</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                        بدون AI
                      </span>
                    )}

                    {/* Priority Badge */}
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      tool.priority === 'P1' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                      tool.priority === 'P2' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {tool.priority} - {tool.priority === 'P1' ? 'إطلاق أساسي' : tool.priority === 'P2' ? 'توسع' : 'لاحقاً'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                    <span className="dir-ltr font-mono text-gray-400">{tool.toolKey}</span>
                    <span>•</span>
                    <span>النوع: {tool.toolTypeLabelAr}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      الرؤية: {tool.visibilityLabelAr}
                    </span>
                    <span>•</span>
                    <span>الاستخدام الأسبوعي: {tool.weeklyUsage > 0 ? `${tool.weeklyUsage.toLocaleString()} مرة` : 'غير نشط'}</span>
                  </div>
                </div>

                {/* Status Badges & Action */}
                <div className="flex items-center gap-3 shrink-0">
                  {/* Lifecycle Badge */}
                  {tool.status === 'ACTIVE' && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                      نشطة
                    </span>
                  )}
                  {tool.status === 'COMING_SOON' && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                      قادمة قريبًا
                    </span>
                  )}
                  {tool.status === 'UNDER_DEVELOPMENT' && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                      قيد التطوير
                    </span>
                  )}
                  {tool.status === 'DISABLED' && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300">
                      معطلة
                    </span>
                  )}

                  {/* Health Warning if Governance Needed */}
                  {tool.healthStatus === 'NEEDS_GOVERNANCE_REVIEW' && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>مراجعة الحوكمة</span>
                    </span>
                  )}

                  <button
                    onClick={() => navigate(`/admin/student-tools/${tool.id}`)}
                    className="px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>عرض التفاصيل</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Student Tool Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                تسجيل أداة طلابية جديدة (Register Tool)
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTool} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  المفتاح البرمجي للأداة (Tool Key) *
                </label>
                <input
                  type="text"
                  required
                  value={newTool.toolKey}
                  onChange={e => setNewTool({...newTool, toolKey: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                  placeholder="e.g. gpa-calculator-v2"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none dir-ltr font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  اسم الأداة بالعربية *
                </label>
                <input
                  type="text"
                  required
                  value={newTool.titleAr}
                  onChange={e => setNewTool({...newTool, titleAr: e.target.value})}
                  placeholder="مثال: حاسبة معدل الساعات المتراكمة"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  اسم الأداة بالإنجليزية (English Title)
                </label>
                <input
                  type="text"
                  value={newTool.titleEn}
                  onChange={e => setNewTool({...newTool, titleEn: e.target.value})}
                  placeholder="e.g. Cumulative Credit Calculator"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none dir-ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    تصنيف / نوع الأداة *
                  </label>
                  <select
                    value={newTool.toolType}
                    onChange={e => setNewTool({...newTool, toolType: e.target.value as any})}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none"
                  >
                    <option value="ASSISTANT">مساعد (Assistant)</option>
                    <option value="AI_TOOL">أداة ذكاء اصطناعي</option>
                    <option value="CALCULATOR">حاسبة تفاعلية</option>
                    <option value="COMPARISON_TOOL">أداة مقارنة</option>
                    <option value="NORMAL_TOOL">أداة عادية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    أولوية الإطلاق *
                  </label>
                  <select
                    value={newTool.priority}
                    onChange={e => setNewTool({...newTool, priority: e.target.value as any})}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none"
                  >
                    <option value="P1">P1 - إطلاق أساسي</option>
                    <option value="P2">P2 - توسع</option>
                    <option value="P3">P3 - لاحقاً</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    الاعتماد على الذكاء الاصطناعي
                  </label>
                  <select
                    value={newTool.aiDependency}
                    onChange={e => setNewTool({...newTool, aiDependency: e.target.value as any})}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none"
                  >
                    <option value="REQUIRED">يتطلب AI (Phase 17)</option>
                    <option value="OPTIONAL">اختياري AI</option>
                    <option value="NONE">بدون AI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    مستوى مخاطر التكلفة
                  </label>
                  <select
                    value={newTool.costRisk}
                    onChange={e => setNewTool({...newTool, costRisk: e.target.value as any})}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none"
                  >
                    <option value="LOW">منخفضة (Low)</option>
                    <option value="MEDIUM">متوسطة (Medium)</option>
                    <option value="HIGH">عالية (High Risk)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  مكان الظهور في الواجهة
                </label>
                <input
                  type="text"
                  value={newTool.appearsOnUi}
                  onChange={e => setNewTool({...newTool, appearsOnUi: e.target.value})}
                  placeholder="مثال: كتالوج أدوات الطلاب العامة (/tools)"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none text-xs"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  تسجيل الأداة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
