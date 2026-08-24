import React, { useState } from 'react';
import { useTranslation } from '../../i18n/I18nProvider';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { 
  LayoutDashboard, 
  Clock,
  FileSpreadsheet,
  GraduationCap, 
  School, 
  Building2,
  BookOpen, 
  Globe2, 
  Globe,
  BookMarked, 
  Settings, 
  FileText, 
  Wrench, 
  Award,
  CreditCard,
  Briefcase,
  Cpu,
  Activity,
  ShieldCheck,
  Network,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Bell,
  Search,
  LogOut,
  Globe as LangIcon
} from 'lucide-react';

export function AdminPreviewLayout() {
  const { t, dir, language, setLanguage } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userEmail = localStorage.getItem('manaratak_user_email') || '';
  const userNameInitials = (userEmail || 'AD').substring(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('manaratak_access_token');
    localStorage.removeItem('manaratak_refresh_token');
    localStorage.removeItem('manaratak_admin_access');
    localStorage.removeItem('manaratak_demo_email');
    localStorage.removeItem('manaratak_user_email');
    localStorage.removeItem('manaratak_user_name');
    window.location.href = '/login';
  };

  // Structured sidebar navigation groups for elegant hierarchy
  const navigationGroups = [
    {
      titleAr: 'الرئيسية والتدقيق',
      titleEn: 'Core & Review',
      items: [
        { name: t('admin_dashboard') || 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { name: t('admin_review_queue') || 'Review Queue', path: '/admin/review-queue', icon: <Clock className="w-4 h-4" /> },
        { name: t('admin_imports') || 'Import Center', path: '/admin/imports', icon: <FileSpreadsheet className="w-4 h-4" /> },
        { name: t('admin_health') || 'System Health', path: '/admin/health', icon: <Activity className="w-4 h-4" /> },
      ]
    },
    {
      titleAr: 'البيانات الأكاديمية',
      titleEn: 'Academic Entities',
      items: [
        { name: t('admin_scholarships') || 'Scholarships', path: '/admin/scholarships', icon: <GraduationCap className="w-4 h-4" /> },
        { name: t('admin_universities') || 'Universities', path: '/admin/universities', icon: <School className="w-4 h-4" /> },
        { name: t('admin_faculties') || 'الكليات والعمادات', path: '/admin/faculties', icon: <Building2 className="w-4 h-4" /> },
        { name: t('admin_majors') || 'Majors', path: '/admin/majors', icon: <BookOpen className="w-4 h-4" /> },
        { name: t('admin_nav_study_destinations') || 'Study Destinations', path: '/admin/study-destinations', icon: <Globe className="w-4 h-4" /> },
        { name: t('admin_nav_academic_taxonomy') || 'Academic Taxonomy', path: '/admin/academic-taxonomy', icon: <Network className="w-4 h-4" /> },
      ]
    },
    {
      titleAr: 'التعليم والتدريب',
      titleEn: 'Learning & Content',
      items: [
        { name: t('admin_courses') || 'Courses', path: '/admin/courses', icon: <BookMarked className="w-4 h-4" /> },
        { name: t('admin_tests') || 'International Tests', path: '/admin/international-tests', icon: <Globe2 className="w-4 h-4" /> },
        { name: t('admin_cms') || 'CMS Platform', path: '/admin/cms', icon: <FileText className="w-4 h-4" /> },
        { name: t('admin_tools') || 'Student Tools', path: '/admin/student-tools', icon: <Wrench className="w-4 h-4" /> },
      ]
    },
    {
      titleAr: 'الإدارة والعمليات',
      titleEn: 'Operations & Management',
      items: [
        { name: t('admin_services') || 'Services', path: '/admin/services', icon: <Settings className="w-4 h-4" /> },
        { name: t('admin_certificates') || 'Certificates', path: '/admin/certificates', icon: <Award className="w-4 h-4" /> },
        { name: t('admin_finance') || 'Finance & Pay', path: '/admin/finance', icon: <CreditCard className="w-4 h-4" /> },
        { name: t('admin_careers') || 'Careers & Alumni', path: '/admin/careers', icon: <Briefcase className="w-4 h-4" /> },
        { name: t('admin_ai_governance') || 'AI Governance', path: '/admin/ai', icon: <Cpu className="w-4 h-4" /> },
        { name: t('admin_settings') || 'Access & Settings', path: '/admin/settings', icon: <ShieldCheck className="w-4 h-4" /> },
      ]
    }
  ];

  // Derive breadcrumbs dynamically from current pathname
  const getBreadcrumbs = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    const crumbs = [];

    crumbs.push({
      label: language === 'ar' ? 'بوابة منارتك' : 'Manaratak Portal',
      path: '/admin/dashboard'
    });

    let currentPath = '';
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentPath += `/${part}`;

      if (part === 'admin') continue;

      let label = part;
      if (part === 'dashboard') label = language === 'ar' ? 'لوحة التحكم' : 'Dashboard';
      else if (part === 'review-queue') label = language === 'ar' ? 'طابور المراجعة' : 'Review Queue';
      else if (part === 'imports') label = language === 'ar' ? 'إدارة الاستيراد' : 'Import Center';
      else if (part === 'scholarships') label = language === 'ar' ? 'المنح الدراسية' : 'Scholarships';
      else if (part === 'universities') label = language === 'ar' ? 'الجامعات' : 'Universities';
      else if (part === 'academic-taxonomy') label = language === 'ar' ? 'التصنيف الأكاديمي' : 'Academic Taxonomy';
      else if (part === 'majors') label = language === 'ar' ? 'التخصصات' : 'Majors';
      else if (part === 'international-tests') label = language === 'ar' ? 'الاختبارات الدولية' : 'International Tests';
      else if (part === 'courses') label = language === 'ar' ? 'الدورات التدريبية' : 'Courses';
      else if (part === 'services') label = language === 'ar' ? 'الخدمات الاستشارية' : 'Services';
      else if (part === 'cms') label = language === 'ar' ? 'إدارة المحتوى' : 'CMS';
      else if (part === 'student-tools') label = language === 'ar' ? 'أدوات الطلاب' : 'Student Tools';
      else if (part === 'certificates') label = language === 'ar' ? 'الشهادات الرقمية' : 'Certificates';
      else if (part === 'finance') label = language === 'ar' ? 'المالية والفواتير' : 'Finance & Payments';
      else if (part === 'careers') label = language === 'ar' ? 'التوظيف والخريجين' : 'Careers & Alumni';
      else if (part === 'ai-governance') label = language === 'ar' ? 'حوكمة الذكاء الاصطناعي' : 'AI Governance';
      else if (part === 'health') label = language === 'ar' ? 'جاهزية النظام' : 'System Health';
      else if (part === 'settings') label = language === 'ar' ? 'الإعدادات والوصول' : 'Settings';
      else if (part === 'study-destinations') label = language === 'ar' ? 'دول الدراسة' : 'Study Destinations';

      crumbs.push({
        label,
        path: currentPath
      });
    }

    return crumbs;
  };

  const crumbs = getBreadcrumbs();

  const renderNavigationItem = (item: any) => {
    const isCurrentActive = 
      location.pathname === item.path || 
      (item.path !== '/admin' && location.pathname.startsWith(item.path)) ||
      (item.path === '/admin/study-destinations' && location.pathname.startsWith('/study-destinations'));

    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => setMobileMenuOpen(false)}
        className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium rounded-xl transition-all ${
          isCurrentActive
            ? 'bg-emerald-50/80 text-[#0F4B3A] font-bold shadow-[0_1px_2px_rgba(16,185,129,0.05)] border border-emerald-100/30'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
        }`}
      >
        <span className={`transition-colors ${isCurrentActive ? 'text-emerald-700' : 'text-slate-400'}`}>
          {item.icon}
        </span>
        <span className="truncate">{item.name}</span>
      </Link>
    );
  };

  const isRtl = dir === 'rtl';

  return (
    <div 
      className="min-h-screen bg-[#FAF9F6] text-slate-800 flex flex-col md:flex-row" 
      dir={dir}
    >
      {/* 2. Right Sidebar Component (Desktop) */}
      <aside 
        className={`hidden md:flex flex-col w-64 bg-white border-slate-100 flex-shrink-0 h-screen sticky top-0 z-30 ${
          isRtl ? 'border-l' : 'border-r'
        }`}
      >
        {/* Sidebar Header with Brand Logo */}
        <div className="p-4 border-b border-slate-50 flex items-center justify-center overflow-hidden h-20">
          <Logo showText={true} className="scale-75 -my-2" />
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-none">
          {navigationGroups.map((group, idx) => (
            <div key={idx} className="space-y-1.5">
              <span className="block px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {isRtl ? group.titleAr : group.titleEn}
              </span>
              <div className="space-y-0.5">
                {group.items.map(renderNavigationItem)}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer with Logout & Access Info */}
        <div className="p-4 border-t border-slate-50 space-y-3">
          <div className="flex items-center gap-2.5 px-2 py-1.5 bg-slate-50 rounded-xl border border-slate-100/50">
            <div className="w-7 h-7 rounded-full bg-[#0F4B3A] text-white flex items-center justify-center text-xs font-black">
              {userNameInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-slate-700 truncate leading-tight">{userEmail}</p>
              <p className="text-[9px] font-medium text-slate-400 truncate leading-none mt-0.5">
                {isRtl ? 'مدير النظام' : 'Platform Administrator'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100/70 border border-rose-100/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isRtl ? 'تسجيل الخروج' : 'Log Out'}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header / Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-white px-4 h-16 border-b border-slate-100 sticky top-0 z-40">
        <Logo showText={true} className="scale-75 -mx-4" />
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-50 border border-slate-100/50 cursor-pointer active:scale-95 transition-all"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-white z-30 flex flex-col animate-in fade-in slide-in-from-top-4 duration-200 overflow-y-auto">
          <div className="flex-1 p-4 space-y-6">
            {navigationGroups.map((group, idx) => (
              <div key={idx} className="space-y-1.5">
                <span className="block px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {isRtl ? group.titleAr : group.titleEn}
                </span>
                <div className="space-y-0.5">
                  {group.items.map(renderNavigationItem)}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50">
            <div className="flex items-center gap-2.5 px-3 py-2 bg-white rounded-xl border border-slate-200/50">
              <div className="w-8 h-8 rounded-full bg-[#0F4B3A] text-white flex items-center justify-center text-xs font-black">
                {userNameInitials}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">{userEmail}</p>
                <p className="text-[10px] font-medium text-slate-400">{isRtl ? 'مدير النظام' : 'Platform Administrator'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{isRtl ? 'تسجيل الخروج' : 'Log Out'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Panel Surface Container */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* 3. Top Header Component (Desktop Only) */}
        <header className="hidden md:flex h-20 bg-white border-b border-slate-100 px-6 items-center justify-between sticky top-0 z-20">
          {/* Dashboard Meta/Search */}
          <div className="flex items-center gap-4">
            <div className="relative max-w-xs w-64">
              <span className={`absolute inset-y-0 flex items-center text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`}>
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                readOnly
                placeholder={isRtl ? 'البحث عن خدمات ومقاييس...' : 'Search records & utilities...'}
                className={`w-full bg-slate-50 border border-slate-100 hover:border-slate-200 text-xs rounded-xl py-2 px-10 focus:outline-none cursor-not-allowed`}
              />
            </div>
          </div>

          {/* User Account & Actions area */}
          <div className="flex items-center gap-3">
            {/* Language Switch */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="text-[#0F4B3A] hover:bg-emerald-50 font-bold border border-[#0F4B3A]/10 text-xs rounded-xl px-3 py-2 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LangIcon className="w-3.5 h-3.5 text-emerald-700" />
              <span>{language === 'en' ? 'عربي' : 'English'}</span>
            </button>

            {/* Quick System Bell */}
            <div className="relative p-2 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors text-slate-500">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            </div>

            <div className="h-6 w-px bg-slate-100"></div>

            {/* Account Pill */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">{isRtl ? 'أهلاً، وجدان' : 'Welcome, Wegdan'}</span>
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xs font-bold text-[#0F4B3A]">
                {userNameInitials}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area Page Container */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* 4. Breadcrumb Navigation Area */}
          <nav className="flex items-center flex-wrap gap-1.5 text-xs text-slate-400 font-medium">
            {crumbs.map((crumb, idx) => {
              const isLast = idx === crumbs.length - 1;
              return (
                <React.Fragment key={idx}>
                  {idx > 0 && (
                    <span className="text-slate-300">
                      {isRtl ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </span>
                  )}
                  {isLast ? (
                    <span className="text-slate-800 font-semibold">{crumb.label}</span>
                  ) : (
                    <Link 
                      to={crumb.path} 
                      className="hover:text-slate-700 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>

          {/* Actual Child Page Outlet Wrapper */}
          <div className="transition-all duration-300 animate-in fade-in duration-300">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
