import React, { useState } from 'react';
import { useTranslation } from '../../i18n/I18nProvider';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, ShieldCheck, Users, ShieldAlert, Key, Clock, Lock, 
  Activity, CheckCircle2, AlertTriangle, XCircle, Search, Filter, 
  Eye, Edit3, UserPlus, UserX, RefreshCw, Layers, Sliders, ToggleLeft, 
  ToggleRight, Server, Database, Cpu, CreditCard, Shield, FileText, Check, Copy, ChevronRight
} from 'lucide-react';

export interface AdminUserItem {
  id: string;
  nameAr: string;
  nameEn: string;
  email: string;
  roleId: string;
  roleNameAr: string;
  permissionLevel: 'SUPER_ADMIN' | 'DOMAIN_ADMIN' | 'OPERATIONS' | 'AUDITOR';
  status: 'ACTIVE' | 'SUSPENDED' | 'INVITED';
  mfaStatus: 'ENABLED' | 'REQUIRED' | 'DISABLED';
  lastLogin: string;
  ipDeviceSummary: string;
  isRootSuperAdmin?: boolean;
}

export interface RolePermissionItem {
  id: string;
  roleNameAr: string;
  roleNameEn: string;
  descriptionAr: string;
  userCount: number;
  permissionScope: string;
  lastUpdated: string;
  permissionsByModule: Record<string, string[]>;
}

export interface SecurityPolicySetting {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  valueDisplay: string;
  status: 'ENABLED' | 'STRICT' | 'SIMULATED' | 'DISABLED';
}

export interface FeatureFlagItem {
  id: string;
  moduleNameAr: string;
  moduleNameEn: string;
  category: 'STUDENT_TOOLS' | 'ADMIN_MODULES' | 'FINANCE' | 'AI_FEATURES';
  visibilityState: 'ACTIVE' | 'COMING_SOON' | 'HIDDEN_ADMIN_ONLY' | 'DISABLED' | 'RETIRED';
  lastModifiedBy: string;
}

export interface SystemAuditLogItem {
  id: string;
  adminUser: string;
  actionAr: string;
  moduleAffected: string;
  targetRecord: string;
  timestamp: string;
  ipDeviceSummary: string;
  result: 'SUCCESS' | 'FAILED' | 'BLOCKED';
  details: string;
}

export function AdminSettingsPreviewPage() {
  const { t, dir, isRTL } = useTranslation();

  const [activeTab, setActiveTab] = useState<'USERS' | 'ROLES' | 'POLICIES' | 'FLAGS' | 'ENV_STATUS' | 'AUDIT'>('USERS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [selectedRole, setSelectedRole] = useState<RolePermissionItem | null>(null);
  const [selectedAuditLog, setSelectedAuditLog] = useState<SystemAuditLogItem | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Summary Metrics
  const metrics = {
    activeAdminUsers: 8,
    highPrivilegeUsers: 2,
    activeRoles: 5,
    pendingInvitations: 1,
    activeSessions: 12,
    securityCompliancePct: 100,
    recentAccessEvents: 142,
    failedLoginAttempts24h: 0
  };

  // Modules List for Permissions Matrix
  const modulesList = [
    'Scholarships', 'Universities', 'Majors', 'Courses', 'International Tests',
    'Services', 'CMS', 'Student Tools', 'Certificates', 'Finance', 'Careers',
    'Import Management', 'AI Governance', 'Health/Readiness', 'Settings'
  ];

  // Admin Users State
  const [adminUsers, setAdminUsers] = useState<AdminUserItem[]>([
    {
      id: 'usr_root_01',
      nameAr: 'م. وجدان جميل (المدير الرئيسي)',
      nameEn: 'Eng. Wegdan Gamil (Root Admin)',
      email: 'wegdangamil2022@gmail.com',
      roleId: 'role_super',
      roleNameAr: 'مدير النظام الأعلى (Root Admin)',
      permissionLevel: 'SUPER_ADMIN',
      status: 'ACTIVE',
      mfaStatus: 'ENABLED',
      lastLogin: '2026-07-28 11:58:10',
      ipDeviceSummary: '192.168.1.1 (Chrome / Linux)',
      isRootSuperAdmin: true
    },
    {
      id: 'usr_admin_02',
      nameAr: 'د. أحمد المحمود',
      nameEn: 'Dr. Ahmed Al-Mahmoud',
      email: 'ahmed.mahmoud@manaratak.edu',
      roleId: 'role_domain_content',
      roleNameAr: 'مدير المحتوى والجامعات',
      permissionLevel: 'DOMAIN_ADMIN',
      status: 'ACTIVE',
      mfaStatus: 'ENABLED',
      lastLogin: '2026-07-28 10:15:22',
      ipDeviceSummary: '185.220.101.5 (Firefox / MacOS)'
    },
    {
      id: 'usr_admin_03',
      nameAr: 'أ. سارة الخالد',
      nameEn: 'Sara Al-Khaled',
      email: 'sara.khaled@manaratak.edu',
      roleId: 'role_operations',
      roleNameAr: 'مسؤولة العمليات والاستيراد',
      permissionLevel: 'OPERATIONS',
      status: 'ACTIVE',
      mfaStatus: 'ENABLED',
      lastLogin: '2026-07-28 09:40:00',
      ipDeviceSummary: '82.165.12.90 (Safari / iOS)'
    },
    {
      id: 'usr_admin_04',
      nameAr: 'م. خالد العتيبي',
      nameEn: 'Khaled Al-Otaibi',
      email: 'khaled.otaibi@manaratak.edu',
      roleId: 'role_auditor',
      roleNameAr: 'مدقق مالي وخدمات مدفوعة',
      permissionLevel: 'AUDITOR',
      status: 'ACTIVE',
      mfaStatus: 'REQUIRED',
      lastLogin: '2026-07-27 16:30:15',
      ipDeviceSummary: '109.70.100.12 (Edge / Windows)'
    },
    {
      id: 'usr_admin_05',
      nameAr: 'أ. فاطمة الزهراني',
      nameEn: 'Fatima Al-Zahrani',
      email: 'fatima.zahrani@manaratak.edu',
      roleId: 'role_domain_content',
      roleNameAr: 'مراجعة المطبوعات والـ CMS',
      permissionLevel: 'DOMAIN_ADMIN',
      status: 'SUSPENDED',
      mfaStatus: 'ENABLED',
      lastLogin: '2026-07-20 14:10:00',
      ipDeviceSummary: '94.23.110.4 (Chrome / Windows)'
    },
    {
      id: 'usr_admin_06',
      nameAr: 'د. يوسف الشمري',
      nameEn: 'Dr. Youssef Al-Shammari',
      email: 'youssef.shammari@manaratak.edu',
      roleId: 'role_operations',
      roleNameAr: 'دعوة معلقة - مسؤول أدوات الطلاب',
      permissionLevel: 'OPERATIONS',
      status: 'INVITED',
      mfaStatus: 'REQUIRED',
      lastLogin: 'لم يدخل بعد',
      ipDeviceSummary: 'دعوة مرسلة عبر البريد'
    }
  ]);

  // Roles & Permissions Data
  const rolesList: RolePermissionItem[] = [
    {
      id: 'role_super',
      roleNameAr: 'مدير النظام الأعلى (Root Admin)',
      roleNameEn: 'Super Administrator',
      descriptionAr: 'صلاحيات كاملة وغير محدودة لجميع النطاقات والإعدادات وإدارة المدراء.',
      userCount: 2,
      permissionScope: 'FULL_ENTERPRISE_CONTROL',
      lastUpdated: '2026-07-28 08:00',
      permissionsByModule: {
        Scholarships: ['View', 'Create', 'Edit', 'Review', 'Publish', 'Archive', 'Import', 'Export', 'Manage Settings'],
        Universities: ['View', 'Create', 'Edit', 'Review', 'Publish', 'Archive', 'Import', 'Export', 'Manage Settings'],
        Majors: ['View', 'Create', 'Edit', 'Review', 'Publish', 'Archive', 'Import', 'Export', 'Manage Settings'],
        Courses: ['View', 'Create', 'Edit', 'Review', 'Publish', 'Archive', 'Import', 'Export', 'Manage Settings'],
        'International Tests': ['View', 'Create', 'Edit', 'Review', 'Publish', 'Archive', 'Import', 'Export', 'Manage Settings'],
        Services: ['View', 'Create', 'Edit', 'Review', 'Publish', 'Archive', 'Import', 'Export', 'Manage Settings'],
        CMS: ['View', 'Create', 'Edit', 'Review', 'Publish', 'Archive', 'Import', 'Export', 'Manage Settings'],
        'Student Tools': ['View', 'Create', 'Edit', 'Review', 'Publish', 'Archive', 'Import', 'Export', 'Manage Settings'],
        Certificates: ['View', 'Create', 'Edit', 'Review', 'Publish', 'Archive', 'Import', 'Export', 'Manage Settings'],
        Finance: ['View', 'Create', 'Edit', 'Review', 'Publish', 'Archive', 'Import', 'Export', 'Manage Settings'],
        Careers: ['View', 'Create', 'Edit', 'Review', 'Publish', 'Archive', 'Import', 'Export', 'Manage Settings'],
        'Import Management': ['View', 'Create', 'Edit', 'Review', 'Publish', 'Archive', 'Import', 'Export', 'Manage Settings'],
        'AI Governance': ['View', 'Create', 'Edit', 'Review', 'Publish', 'Archive', 'Import', 'Export', 'Manage Settings'],
        'Health/Readiness': ['View', 'Create', 'Edit', 'Review', 'Publish', 'Archive', 'Import', 'Export', 'Manage Settings'],
        Settings: ['View', 'Create', 'Edit', 'Review', 'Publish', 'Archive', 'Import', 'Export', 'Manage Settings']
      }
    },
    {
      id: 'role_domain_content',
      roleNameAr: 'مدير المحتوى والنطاقات الأكاديمية',
      roleNameEn: 'Domain Content Manager',
      descriptionAr: 'إدارة وتدقيق الجامعات والمنح والتخصصات والـ CMS والمقالات الأكاديمية.',
      userCount: 3,
      permissionScope: 'ACADEMIC_DOMAIN_CONTENT',
      lastUpdated: '2026-07-25 14:30',
      permissionsByModule: {
        Scholarships: ['View', 'Create', 'Edit', 'Review', 'Publish', 'Export'],
        Universities: ['View', 'Create', 'Edit', 'Review', 'Publish', 'Export'],
        Majors: ['View', 'Create', 'Edit', 'Review', 'Publish', 'Export'],
        Courses: ['View', 'Create', 'Edit', 'Review', 'Publish', 'Export'],
        'International Tests': ['View', 'Create', 'Edit', 'Review', 'Publish', 'Export'],
        CMS: ['View', 'Create', 'Edit', 'Review', 'Publish', 'Export'],
        Services: ['View', 'Review'],
        'Student Tools': ['View', 'Review'],
        Certificates: ['View'],
        Finance: ['View'],
        Careers: ['View', 'Create', 'Edit'],
        'Import Management': ['View'],
        'AI Governance': ['View'],
        'Health/Readiness': ['View'],
        Settings: ['View']
      }
    },
    {
      id: 'role_operations',
      roleNameAr: 'مسؤول العمليات والاستيراد المجمع',
      roleNameEn: 'Operations & Import Manager',
      descriptionAr: 'إدارة خطوط استيراد البيانات والمراجعة المجمعة وحالة طوابير المعالجة.',
      userCount: 2,
      permissionScope: 'OPERATIONS_AND_IMPORTS',
      lastUpdated: '2026-07-26 10:15',
      permissionsByModule: {
        'Import Management': ['View', 'Create', 'Edit', 'Review', 'Publish', 'Archive', 'Import', 'Export'],
        Scholarships: ['View', 'Import', 'Export'],
        Universities: ['View', 'Import', 'Export'],
        Majors: ['View', 'Import', 'Export'],
        Courses: ['View', 'Import', 'Export'],
        'International Tests': ['View', 'Import', 'Export'],
        Services: ['View', 'Import'],
        CMS: ['View'],
        'Student Tools': ['View'],
        Certificates: ['View'],
        Finance: ['View'],
        Careers: ['View'],
        'AI Governance': ['View'],
        'Health/Readiness': ['View', 'Export'],
        Settings: ['View']
      }
    },
    {
      id: 'role_auditor',
      roleNameAr: 'مدقق مالي وسجلات الوصول',
      roleNameEn: 'Financial & Access Auditor',
      descriptionAr: 'قراءة وفحص الفواتير والمعاملات المالية وتدقيق سجلات وصول المدراء.',
      userCount: 1,
      permissionScope: 'AUDIT_AND_FINANCE_READONLY',
      lastUpdated: '2026-07-20 11:00',
      permissionsByModule: {
        Finance: ['View', 'Review', 'Export'],
        Certificates: ['View', 'Export'],
        Services: ['View', 'Export'],
        Scholarships: ['View'],
        Universities: ['View'],
        Majors: ['View'],
        Courses: ['View'],
        'International Tests': ['View'],
        CMS: ['View'],
        'Student Tools': ['View'],
        Careers: ['View'],
        'Import Management': ['View'],
        'AI Governance': ['View'],
        'Health/Readiness': ['View', 'Export'],
        Settings: ['View']
      }
    }
  ];

  // Access & Security Policies
  const securityPolicies: SecurityPolicySetting[] = [
    {
      id: 'sec_mfa',
      titleAr: 'التحقق ثنائي العوامل الإجباري (MFA)',
      titleEn: 'Strict Mandatory MFA for Admins',
      descriptionAr: 'فرض المصادقة الثنائية لجميع مدراء النظام لحماية الحسابات الإدارية.',
      valueDisplay: 'مفعل ومفروض (Strict Active)',
      status: 'STRICT'
    },
    {
      id: 'sec_session_timeout',
      titleAr: 'مهلة انتهاء الجلسة الإدارية (Session Timeout)',
      titleEn: 'Admin Session Inactivity Timeout',
      descriptionAr: 'إنهاء جلسة المدير تلقائياً بعد فترة من عدم النشاط لحماية الشاشة.',
      valueDisplay: '30 دقيقة خمول',
      status: 'ENABLED'
    },
    {
      id: 'sec_password_policy',
      titleAr: 'سياسة تعقيد كلمات المرور الإدارية',
      titleEn: 'Admin Password Complexity Policy',
      descriptionAr: 'شراط 12 رمزاً على الأقل تتضمن أحرفاً كبيرة وصغيرة وأرقاماً ورموزاً خاصة.',
      valueDisplay: '12+ حرف + رموز مجمعة',
      status: 'STRICT'
    },
    {
      id: 'sec_lockout',
      titleAr: 'حظر الحساب عند محاولات الدخول الخاطئة',
      titleEn: 'Failed Login Attempt Lockout',
      descriptionAr: 'قفل الحساب مؤقتاً لمدة 15 دقيقة عند ادخال كلمة مرور خاطئة 5 مرات متتالية.',
      valueDisplay: '5 محاولات -> حظر 15 دقيقة',
      status: 'ENABLED'
    },
    {
      id: 'sec_token_mode',
      titleAr: 'نمط رمزي التشفير وتمرير الهوية (Bearer JWT)',
      titleEn: 'Strict HttpOnly Cookie & Bearer JWT Token Mode',
      descriptionAr: 'تشفير الجلسات عبر JWT مقترنة بصلاحيات محددة في النطاق الآمن.',
      valueDisplay: 'رمز مقنع مؤمن (Masked Bearer Token)',
      status: 'STRICT'
    },
    {
      id: 'sec_preview_mode',
      titleAr: 'سلوك نمط المعاينة المحاكي (Studio Preview Shell)',
      titleEn: 'Allowed Preview Mode Behavior',
      descriptionAr: 'تقييد العمليات التدميرية ومنع تعديل بيانات الإنتاج الحقيقية داخل المعاينة.',
      valueDisplay: 'محاكاة آمنة (Read-Only Safety Guard)',
      status: 'SIMULATED'
    }
  ];

  // Feature Flags & Module Visibility
  const [featureFlags, setFeatureFlags] = useState<FeatureFlagItem[]>([
    {
      id: 'ff_cv_gen',
      moduleNameAr: 'مُنشئ السيرة الذاتية التفاعلي (CV Generator)',
      moduleNameEn: 'Interactive CV Generator',
      category: 'STUDENT_TOOLS',
      visibilityState: 'ACTIVE',
      lastModifiedBy: 'eng.wegdan'
    },
    {
      id: 'ff_mot_letter',
      moduleNameAr: 'مُولد خطابات الدافع (Motivation Letter Generator)',
      moduleNameEn: 'Motivation Letter Generator',
      category: 'STUDENT_TOOLS',
      visibilityState: 'ACTIVE',
      lastModifiedBy: 'eng.wegdan'
    },
    {
      id: 'ff_cv_rev',
      moduleNameAr: 'مُراجع السيرة الذاتية بالذكاء الاصطناعي (CV Reviewer)',
      moduleNameEn: 'AI CV Reviewer & Scoring',
      category: 'STUDENT_TOOLS',
      visibilityState: 'ACTIVE',
      lastModifiedBy: 'eng.wegdan'
    },
    {
      id: 'ff_service_catalog',
      moduleNameAr: 'دليل الخدمات الطلابية العامة (Services Catalog)',
      moduleNameEn: 'Student Services Directory',
      category: 'STUDENT_TOOLS',
      visibilityState: 'ACTIVE',
      lastModifiedBy: 'dr.ahmed'
    },
    {
      id: 'ff_scholarship_ai',
      moduleNameAr: 'محرك توصيات المنح بالذكاء الاصطناعي',
      moduleNameEn: 'Scholarship Recommendation Engine',
      category: 'AI_FEATURES',
      visibilityState: 'COMING_SOON',
      lastModifiedBy: 'eng.wegdan'
    },
    {
      id: 'ff_direct_payment',
      moduleNameAr: 'بوابة معالجة المدفوعات المباشرة',
      moduleNameEn: 'Direct Payment Processing Gateway',
      category: 'FINANCE',
      visibilityState: 'HIDDEN_ADMIN_ONLY',
      lastModifiedBy: 'khaled.otaibi'
    },
    {
      id: 'ff_auto_promotion',
      moduleNameAr: 'الترقية التلقائية لبيانات الاستيراد المجمع',
      moduleNameEn: 'Bulk Import Auto-Promotion Engine',
      category: 'ADMIN_MODULES',
      visibilityState: 'DISABLED',
      lastModifiedBy: 'sara.khaled'
    }
  ]);

  // Read-Only Environment & Integration Status
  const envIntegrationStatus = [
    { nameAr: 'قاعدة البيانات واتصال Prisma', nameEn: 'PostgreSQL / Prisma Connection', statusAr: 'متصل ومطابق للمخطط', isOk: true, detail: 'PostgreSQL / Prisma Schema Synced' },
    { nameAr: 'خادم Redis وطوابير BullMQ', nameEn: 'Redis & BullMQ Queue Engine', statusAr: 'نشط بوضع الذاكرة المحاكاة', isOk: true, detail: 'In-Memory Safe Fallback Active in Studio' },
    { nameAr: 'رمز دخول المدير الإداري (Bearer Token)', nameEn: 'Admin Bearer Auth Token Mode', statusAr: 'مؤمن ومقنع (Masked JWT)', isOk: true, detail: 'Bearer JWT Auth Active' },
    { nameAr: 'مفاتيح مزودي الذكاء الاصطناعي (AI Keys)', nameEn: 'AI Provider Keys (Gemini/OpenAI/Claude)', statusAr: 'موجودة بمظهر مقنع (Masked Status)', isOk: true, detail: 'Configured & Masked (Gemini/OpenAI/Claude)' },
    { nameAr: 'بوابة الدفع الإلكتروني (Payment Gateway)', nameEn: 'Payment Gateway Connection', statusAr: 'نمط التجربة المحاكية (Sandbox Configured)', isOk: true, detail: 'Sandbox Mode Active' },
    { nameAr: 'منصة الأصول والمستندات (EAP Storage)', nameEn: 'Enterprise Assets Handles (EAP)', statusAr: 'نشط بمقابض eap_asset_...', isOk: true, detail: 'EAP Asset Handles Operational' }
  ];

  // Audit Logs State
  const auditLogs: SystemAuditLogItem[] = [
    {
      id: 'evt_901',
      adminUser: 'wegdangamil2022@gmail.com',
      actionAr: 'تحديث سياسة أمان الجلسات وتأكيد المقنعات',
      moduleAffected: 'Settings & Security',
      targetRecord: 'sec_mfa / sec_session_timeout',
      timestamp: '2026-07-28 11:58',
      ipDeviceSummary: '192.168.1.1 (Chrome / Linux)',
      result: 'SUCCESS',
      details: 'تم تأكيد تفعيل سياسة التحقق الثنائي وإخفاء التوكينات الإدارية.'
    },
    {
      id: 'evt_902',
      adminUser: 'ahmed.mahmoud@manaratak.edu',
      actionAr: 'تعديل حالة رؤية الميزة: محرك التوصيات',
      moduleAffected: 'Feature Flags',
      targetRecord: 'ff_scholarship_ai',
      timestamp: '2026-07-28 10:14',
      ipDeviceSummary: '185.220.101.5 (Firefox)',
      result: 'SUCCESS',
      details: 'تعديل حالة الميزة إلى Coming Soon بانتظار اكتمال نماذج التوصية.'
    },
    {
      id: 'evt_903',
      adminUser: 'guest_unauthorized_try',
      actionAr: 'محاولة تعديل صلاحيات المدير الرئيسي (Root Admin)',
      moduleAffected: 'Admin Access Control',
      targetRecord: 'usr_root_01',
      timestamp: '2026-07-27 19:40',
      ipDeviceSummary: '45.154.255.8 (Unknown)',
      result: 'BLOCKED',
      details: 'تم اعتراض العملية تلقائياً بواسطة درع حماية ROOT_SUPER_ADMIN_GUARD.'
    }
  ];

  // Helper Actions
  const handleToggleAdminStatus = (userId: string) => {
    setAdminUsers(prev => prev.map(u => {
      if (u.id === userId) {
        if (u.isRootSuperAdmin) {
          setActionNotice('حظر أمني: لا يمكن تعطيل أو حظر حساب مدير النظام الأعلى (Root Admin).');
          setTimeout(() => setActionNotice(null), 3000);
          return u;
        }
        const newStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        setActionNotice(`تم تعديل حالة حساب المدير ${u.nameAr} إلى ${newStatus === 'ACTIVE' ? 'نشط' : 'معلق'}.`);
        setTimeout(() => setActionNotice(null), 3000);
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  const handleToggleFlagState = (flagId: string) => {
    setFeatureFlags(prev => prev.map(f => {
      if (f.id === flagId) {
        const nextState = f.visibilityState === 'ACTIVE' ? 'HIDDEN_ADMIN_ONLY' : 'ACTIVE';
        setActionNotice(`تم تغيير حالة ظهور ${f.moduleNameAr} إلى ${nextState}.`);
        setTimeout(() => setActionNotice(null), 3000);
        return { ...f, visibilityState: nextState };
      }
      return f;
    }));
  };

  const filteredUsers = adminUsers.filter(u => 
    u.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.roleNameAr.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" dir={dir}>
      {/* Top Breadcrumb Nav */}
      <div className="flex items-center justify-between">
        <Link to="/admin" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border px-3 py-1.5 rounded-lg shadow-sm">
          <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          {t('back_to_admin') || 'العودة إلى لوحة التحكم الإدارية'}
        </Link>
        <span className="text-xs text-gray-500 font-mono">
          إدارة الصلاحيات والأمان: <strong className="text-gray-900">Phase 23 EAP Settings</strong>
        </span>
      </div>

      {/* Security & Preview Awareness Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-400/30 text-indigo-300">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">إعدادات النظام والتحكم بالصلاحيات (Settings & Access Control)</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                مؤمن بالكامل (Masked Secrets)
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              إدارة مستخدمي لوحة التحكم، مصفوفة الصلاحيات حسب النطاق، سياسات الأمان، ورايات إتاحة الميزات (Feature Flags).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">المفاتيح والتوكينات مقنعة أمنياً (No Secrets Exposed)</span>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionNotice && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-xs font-bold flex items-center justify-between animate-fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-indigo-400 hover:text-indigo-600">✕</button>
        </div>
      )}

      {/* SECTION 1: SUMMARY METRICS (8 CARDS) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <div className="bg-white rounded-xl p-3 border shadow-sm text-center">
          <span className="text-[10px] text-gray-500 font-semibold block">مدراء نشطون</span>
          <p className="text-lg font-bold text-gray-900 font-mono mt-0.5">{metrics.activeAdminUsers}</p>
          <span className="text-[9px] text-emerald-600">نشط في النظام</span>
        </div>

        <div className="bg-white rounded-xl p-3 border shadow-sm text-center">
          <span className="text-[10px] text-gray-500 font-semibold block">صلاحيات عليا</span>
          <p className="text-lg font-bold text-indigo-900 font-mono mt-0.5">{metrics.highPrivilegeUsers}</p>
          <span className="text-[9px] text-indigo-600">Super Admin</span>
        </div>

        <div className="bg-white rounded-xl p-3 border shadow-sm text-center">
          <span className="text-[10px] text-gray-500 font-semibold block">الأدوار المحددة</span>
          <p className="text-lg font-bold text-gray-900 font-mono mt-0.5">{metrics.activeRoles}</p>
          <span className="text-[9px] text-gray-600">أدوار إدارية</span>
        </div>

        <div className="bg-white rounded-xl p-3 border shadow-sm text-center">
          <span className="text-[10px] text-gray-500 font-semibold block">دعوات معلقة</span>
          <p className="text-lg font-bold text-amber-700 font-mono mt-0.5">{metrics.pendingInvitations}</p>
          <span className="text-[9px] text-amber-600">بانتظار القبول</span>
        </div>

        <div className="bg-white rounded-xl p-3 border shadow-sm text-center">
          <span className="text-[10px] text-gray-500 font-semibold block">جلسات نشطة</span>
          <p className="text-lg font-bold text-blue-900 font-mono mt-0.5">{metrics.activeSessions}</p>
          <span className="text-[9px] text-blue-600">متصل الآن</span>
        </div>

        <div className="bg-white rounded-xl p-3 border shadow-sm text-center">
          <span className="text-[10px] text-gray-500 font-semibold block">امتثال الأمان</span>
          <p className="text-lg font-bold text-emerald-700 font-mono mt-0.5">{metrics.securityCompliancePct}%</p>
          <span className="text-[9px] text-emerald-600">سياسة ملتزمة</span>
        </div>

        <div className="bg-white rounded-xl p-3 border shadow-sm text-center">
          <span className="text-[10px] text-gray-500 font-semibold block">أحداث الوصول</span>
          <p className="text-lg font-bold text-gray-900 font-mono mt-0.5">{metrics.recentAccessEvents}</p>
          <span className="text-[9px] text-gray-500">حدث اليوم</span>
        </div>

        <div className="bg-white rounded-xl p-3 border shadow-sm text-center">
          <span className="text-[10px] text-gray-500 font-semibold block">محاولات فاشلة</span>
          <p className="text-lg font-bold text-emerald-700 font-mono mt-0.5">{metrics.failedLoginAttempts24h}</p>
          <span className="text-[9px] text-emerald-600">آخر 24 ساعة</span>
        </div>
      </div>

      {/* WORKSTATION TABS */}
      <div className="bg-white rounded-xl border p-1.5 flex flex-wrap items-center gap-1 shadow-sm text-xs font-bold">
        <button
          onClick={() => setActiveTab('USERS')}
          className={`py-2 px-3.5 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'USERS' ? 'bg-slate-900 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Users className="w-4 h-4" />
          إدارة المدراء والمستخدمين ({adminUsers.length})
        </button>

        <button
          onClick={() => setActiveTab('ROLES')}
          className={`py-2 px-3.5 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'ROLES' ? 'bg-slate-900 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Shield className="w-4 h-4" />
          الأدوار ومصفوفة الصلاحيات ({rolesList.length})
        </button>

        <button
          onClick={() => setActiveTab('POLICIES')}
          className={`py-2 px-3.5 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'POLICIES' ? 'bg-slate-900 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Lock className="w-4 h-4" />
          سياسات الوصول والأمان
        </button>

        <button
          onClick={() => setActiveTab('FLAGS')}
          className={`py-2 px-3.5 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'FLAGS' ? 'bg-slate-900 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          رايات الميزات والرؤية (Flags) ({featureFlags.length})
        </button>

        <button
          onClick={() => setActiveTab('ENV_STATUS')}
          className={`py-2 px-3.5 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'ENV_STATUS' ? 'bg-slate-900 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Server className="w-4 h-4" />
          حالة ربط البيئة والتكامل
        </button>

        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`py-2 px-3.5 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'AUDIT' ? 'bg-slate-900 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          سجل التدقيق الأمني ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: ADMIN USERS MANAGEMENT */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">جدول مدراء النظام والحسابات الإدارية (Admin Users Directory)</h2>
              <p className="text-xs text-gray-500">إدارة حسابات المسؤولين، التحكم بحالات التفعيل، والتحقق ثنائي العوامل.</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="بحث باسم أو بريد المدير..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-9 pl-3 py-2 border rounded-xl text-xs w-64 focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
              </div>

              <button
                onClick={() => {
                  setActionNotice('دعوة مدير جديد: تم ارسال رابط الدعوة والربط ثنائي العوامل عبر البريد الآمن.');
                  setTimeout(() => setActionNotice(null), 3000);
                }}
                className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all"
              >
                <UserPlus className="w-4 h-4" />
                دعوة مدير جديد
              </button>
            </div>
          </div>

          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 border-b text-gray-600 font-semibold uppercase">
                <tr>
                  <th className="py-3.5 px-4">اسم المدير والبريد</th>
                  <th className="py-3.5 px-4">الدور والمستوى</th>
                  <th className="py-3.5 px-4">الحالة</th>
                  <th className="py-3.5 px-4">MFA ثنائي العوامل</th>
                  <th className="py-3.5 px-4">آخر تسجيل دخول</th>
                  <th className="py-3.5 px-4">الجهاز / IP</th>
                  <th className="py-3.5 px-4 text-center">الإجراء الآمن</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-800">
                {filteredUsers.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900 flex items-center gap-1.5">
                        {usr.nameAr}
                        {usr.isRootSuperAdmin && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            ROOT ADMIN
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500 font-mono">{usr.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-gray-800">{usr.roleNameAr}</div>
                      <span className="text-[10px] text-gray-500 font-mono">{usr.permissionLevel}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {usr.status === 'ACTIVE' && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">نشط (Active)</span>}
                      {usr.status === 'SUSPENDED' && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">معلق (Suspended)</span>}
                      {usr.status === 'INVITED' && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">دعوة معلقة</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      {usr.mfaStatus === 'ENABLED' ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> مفعّل
                        </span>
                      ) : (
                        <span className="text-amber-700 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> إجباري
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-600">{usr.lastLogin}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-gray-500">{usr.ipDeviceSummary}</td>
                    <td className="py-3.5 px-4 text-center space-x-1 space-x-reverse">
                      <button
                        onClick={() => setSelectedUser(usr)}
                        className="px-2.5 py-1.5 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
                      >
                        التفاصيل
                      </button>
                      <button
                        onClick={() => handleToggleAdminStatus(usr.id)}
                        disabled={usr.isRootSuperAdmin}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          usr.isRootSuperAdmin 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : usr.status === 'ACTIVE' 
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200' 
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {usr.status === 'ACTIVE' ? 'تعليق' : 'تنشيط'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ROLES & PERMISSIONS MATRIX */}
      {activeTab === 'ROLES' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-gray-900">جدول الأدوار ومصفوفة الصلاحيات حسب النطاق (Role & Module Permissions Matrix)</h2>
            <p className="text-xs text-gray-500">استعراض الصلاحيات الدقيقة لكل دور إداري موزعة على جميع نطاقات MANARATAK 2.0 الـ 15 المعتمدة.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rolesList.map((role) => (
              <div key={role.id} className="border rounded-2xl p-4 bg-slate-50/50 space-y-3 hover:border-slate-400 transition-all">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4 text-indigo-700" />
                      {role.roleNameAr}
                    </h3>
                    <p className="text-[11px] text-gray-500 font-mono">{role.roleNameEn}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-100 text-indigo-900 rounded-full text-xs font-bold">
                    {role.userCount} مدراء
                  </span>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed">{role.descriptionAr}</p>

                <div className="text-[11px] text-gray-500 flex justify-between pt-1">
                  <span>نطاق الصلاحيات: <strong className="text-gray-900">{role.permissionScope}</strong></span>
                  <span>آخر تحديث: <span className="font-mono">{role.lastUpdated}</span></span>
                </div>

                <div className="pt-2 border-t flex justify-end">
                  <button
                    onClick={() => setSelectedRole(role)}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors inline-flex items-center gap-1"
                  >
                    عرض مصفوفة النطاقات الـ 15
                    <ChevronRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ACCESS & SECURITY POLICIES */}
      {activeTab === 'POLICIES' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-gray-900">سياسات الوصول والتحكم الأمني (Access & Security Policies)</h2>
            <p className="text-xs text-gray-500">إعدادات أمان لوحة التحكم وقواعد الجلسات ومحاكاة المعاينة الآمنة.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {securityPolicies.map((pol) => (
              <div key={pol.id} className="p-4 border rounded-xl bg-slate-50/60 flex items-start gap-3 justify-between">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{pol.titleAr}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800">
                      {pol.status}
                    </span>
                  </div>
                  <p className="text-gray-600">{pol.descriptionAr}</p>
                  <div className="text-[11px] font-mono text-slate-800 pt-1">
                    القيمة الحالية: <strong>{pol.valueDisplay}</strong>
                  </div>
                </div>

                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold whitespace-nowrap">
                  نشط ومؤمن
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: FEATURE FLAGS / MODULE VISIBILITY */}
      {activeTab === 'FLAGS' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-gray-900">رايات الميزات والتحكم برؤية النطاقات (Feature Flags Registry)</h2>
            <p className="text-xs text-gray-500">التحكم بحالة إتاحة أدوات الطلاب والخدمات والنطاقات الإدارية للمستخدمين.</p>
          </div>

          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 border-b text-gray-600 font-semibold uppercase">
                <tr>
                  <th className="py-3.5 px-4">الميزة / النطاق</th>
                  <th className="py-3.5 px-4">الفئة</th>
                  <th className="py-3.5 px-4">حالة الظهور (Visibility)</th>
                  <th className="py-3.5 px-4">آخر تعديل بواسطة</th>
                  <th className="py-3.5 px-4 text-center">التعديل الآمن</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-800">
                {featureFlags.map((flag) => (
                  <tr key={flag.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{flag.moduleNameAr}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{flag.moduleNameEn}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-gray-700">{flag.category}</td>
                    <td className="py-3.5 px-4">
                      {flag.visibilityState === 'ACTIVE' && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">نشط ومرئي (Active)</span>}
                      {flag.visibilityState === 'COMING_SOON' && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">قريباً (Coming Soon)</span>}
                      {flag.visibilityState === 'HIDDEN_ADMIN_ONLY' && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">للمدراء فقط (Admin Only)</span>}
                      {flag.visibilityState === 'DISABLED' && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">معطل (Disabled)</span>}
                      {flag.visibilityState === 'RETIRED' && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-700">متقاعد (Retired)</span>}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-600">{flag.lastModifiedBy}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleFlagState(flag.id)}
                        className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors"
                      >
                        تبديل الحالة
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ENVIRONMENT & INTEGRATION READ-ONLY STATUS */}
      {activeTab === 'ENV_STATUS' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-gray-900">حالة تكامل وتكوين بيئة التشغيل (Environment & Integration Status)</h2>
            <p className="text-xs text-gray-500">فحص وقراءة حالة ربط قواعد البيانات والمفاتيح المقنعة دون إظهار القيم السرية.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {envIntegrationStatus.map((env, idx) => (
              <div key={idx} className="p-4 border rounded-xl bg-slate-50/60 flex items-start justify-between">
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-gray-900">{env.nameAr}</div>
                  <div className="text-[11px] text-gray-500 font-mono">{env.nameEn}</div>
                  <div className="text-emerald-700 font-semibold pt-1">{env.statusAr}</div>
                  <p className="text-[10px] text-gray-500 font-mono">{env.detail}</p>
                </div>
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">
                  مؤمن وصحيح
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOG */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-gray-900">سجل عمليات وتدقيق أمان المدراء (Admin Access Audit Log)</h2>
            <p className="text-xs text-gray-500">تتبع غير قابل للتعديل لجميع أنشطة المدراء والتعديلات الإدارية.</p>
          </div>

          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 border-b text-gray-600 font-semibold uppercase">
                <tr>
                  <th className="py-3.5 px-4">رقم الحدث</th>
                  <th className="py-3.5 px-4">المدير المنفذ</th>
                  <th className="py-3.5 px-4">الإجراء والوصف</th>
                  <th className="py-3.5 px-4">النطاق المتأثر</th>
                  <th className="py-3.5 px-4">التوقيت</th>
                  <th className="py-3.5 px-4">النتيجة</th>
                  <th className="py-3.5 px-4 text-center">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-800">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-900">{log.id}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-800">{log.adminUser}</td>
                    <td className="py-3.5 px-4 font-medium text-gray-900">{log.actionAr}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-600">{log.moduleAffected}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-500">{log.timestamp}</td>
                    <td className="py-3.5 px-4">
                      {log.result === 'SUCCESS' && <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">ناجح (Success)</span>}
                      {log.result === 'BLOCKED' && <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">محظور (Blocked)</span>}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedAuditLog(log)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
                      >
                        عرض
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADMIN USER DETAIL MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900 text-base">{selectedUser.nameAr}</h3>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">البريد الإلكتروني:</span>
                <span className="font-mono font-bold text-gray-900">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">الدور الإداري:</span>
                <span className="font-bold text-indigo-900">{selectedUser.roleNameAr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">مستوى الصلاحيات:</span>
                <span className="font-mono font-bold">{selectedUser.permissionLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">حالة الحساب:</span>
                <span className="font-bold">{selectedUser.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">آخر تسجيل دخول:</span>
                <span className="font-mono">{selectedUser.lastLogin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">الجهاز و الـ IP:</span>
                <span className="font-mono text-[11px]">{selectedUser.ipDeviceSummary}</span>
              </div>

              {selectedUser.isRootSuperAdmin && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold">
                  حساب مدير النظام الأعلى (Root Admin). محمّي أمنياً ضد التعليق أو الحذف التدميري.
                </div>
              )}
            </div>

            <div className="pt-2 border-t flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROLE DETAILS MODAL */}
      {selectedRole && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl border max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-base">{selectedRole.roleNameAr}</h3>
                <p className="text-xs text-gray-500 font-mono">{selectedRole.roleNameEn}</p>
              </div>
              <button onClick={() => setSelectedRole(null)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed">{selectedRole.descriptionAr}</p>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-900 border-b pb-1">مصفوفة الصلاحيات الممنوحة حسب النطاقات الـ 15:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {modulesList.map((m) => {
                  const perms = selectedRole.permissionsByModule[m] || ['View'];
                  return (
                    <div key={m} className="p-2.5 border rounded-lg bg-slate-50 flex flex-col gap-1">
                      <span className="font-bold text-gray-900">{m}</span>
                      <div className="flex flex-wrap gap-1">
                        {perms.map((p) => (
                          <span key={p} className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[10px] font-mono">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t flex justify-end">
              <button
                onClick={() => setSelectedRole(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT LOG MODAL */}
      {selectedAuditLog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900 text-base">تفاصيل حدث التدقيق {selectedAuditLog.id}</h3>
              <button onClick={() => setSelectedAuditLog(null)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">المدير:</span>
                <span className="font-mono font-bold">{selectedAuditLog.adminUser}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">الإجراء:</span>
                <span className="font-bold">{selectedAuditLog.actionAr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">النطاق المتأثر:</span>
                <span className="font-mono">{selectedAuditLog.moduleAffected}</span>
              </div>
              <div className="p-3 bg-slate-50 border rounded-xl text-gray-800 leading-relaxed mt-2">
                {selectedAuditLog.details}
              </div>
            </div>

            <div className="pt-2 border-t flex justify-end">
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
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
