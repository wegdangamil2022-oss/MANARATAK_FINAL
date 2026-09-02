import React from 'react';
import { useTranslation } from '../../i18n/I18nProvider';
import { 
  LayoutDashboard, 
  Clock,
  FileSpreadsheet,
  GraduationCap, 
  School, 
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
  Network
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminPreviewShell() {
  const { t, dir } = useTranslation();
  
  const adminCards = [
    { name: t('admin_dashboard') || 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-6 h-6" />, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: t('admin_review_queue') || 'Review Queue', path: '/admin/review-queue', icon: <Clock className="w-6 h-6" />, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: t('admin_imports') || 'Import Management', path: '/admin/imports', icon: <FileSpreadsheet className="w-6 h-6" />, color: 'text-teal-600', bg: 'bg-teal-100' },
    { name: t('admin_nav_study_destinations') || (dir === 'rtl' ? 'دول الدراسة' : 'Study Destinations'), path: '/study-destinations', icon: <Globe className="w-6 h-6" />, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: t('admin_scholarships') || 'Scholarships', path: '/admin/scholarships', icon: <GraduationCap className="w-6 h-6" />, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: t('admin_universities') || 'Universities', path: '/admin/universities', icon: <School className="w-6 h-6" />, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: t('admin_nav_academic_taxonomy') || (dir === 'rtl' ? 'التصنيف الأكاديمي' : 'Academic Taxonomy'), path: '/admin/academic-taxonomy', icon: <Network className="w-6 h-6" />, color: 'text-sky-600', bg: 'bg-sky-100' },
    { name: t('admin_majors') || 'Majors', path: '/admin/majors', icon: <BookOpen className="w-6 h-6" />, color: 'text-amber-700', bg: 'bg-amber-50' },
    { name: t('admin_tests') || 'International Tests', path: '/admin/international-tests', icon: <Globe2 className="w-6 h-6" />, color: 'text-rose-600', bg: 'bg-rose-100' },
    { name: t('admin_courses') || 'Courses', path: '/admin/courses', icon: <BookMarked className="w-6 h-6" />, color: 'text-cyan-600', bg: 'bg-cyan-100' },
    { name: t('admin_services') || 'Services', path: '/admin/services', icon: <Settings className="w-6 h-6" />, color: 'text-slate-600', bg: 'bg-slate-100' },
    { name: t('admin_cms') || 'CMS', path: '/admin/cms', icon: <FileText className="w-6 h-6" />, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: t('admin_tools') || 'Student Tools', path: '/admin/student-tools', icon: <Wrench className="w-6 h-6" />, color: 'text-orange-600', bg: 'bg-orange-100' },
    { name: t('admin_certificates') || 'Certificates', path: '/admin/certificates', icon: <Award className="w-6 h-6" />, color: 'text-violet-600', bg: 'bg-violet-100' },
    { name: t('admin_finance') || 'Finance & Payments', path: '/admin/finance', icon: <CreditCard className="w-6 h-6" />, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { name: t('admin_careers') || 'Careers & Alumni', path: '/admin/careers', icon: <Briefcase className="w-6 h-6" />, color: 'text-blue-700', bg: 'bg-blue-50' },
    { name: t('admin_ai_governance') || 'AI Governance', path: '/admin/ai', icon: <Cpu className="w-6 h-6" />, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: t('admin_health') || 'Health / Readiness', path: '/admin/health', icon: <Activity className="w-6 h-6" />, color: 'text-green-600', bg: 'bg-green-100' },
    { name: t('admin_settings') || 'Settings & Access Control', path: '/admin/settings', icon: <ShieldCheck className="w-6 h-6" />, color: 'text-gray-700', bg: 'bg-gray-100' },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4" dir={dir}>
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm mb-8">
        <h2 className="font-bold flex items-center gap-2 mb-1">
          <Activity className="w-4 h-4" /> 
          Google Studio Admin Preview
        </h2>
        <p>
          This is a same-origin development preview shell. In the local development environment, the full Admin Portal runs on port 3001 as a separate React application (<code>@manaratak/admin</code>). Since Google Studio exposes a single port, this shell provides preview access to the admin interface structure.
        </p>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{t('nav_admin') || 'Admin Portal'}</h1>
        <p className="text-slate-600">{t('admin_manage_platform') || 'Manage platform resources and content.'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {adminCards.map((card, idx) => (
          <Link 
            key={idx} 
            to={card.path}
            className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center gap-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={card.name}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${card.bg} ${card.color}`}>
              {card.icon}
            </div>
            <span className="font-semibold text-slate-800">{card.name}</span>
          </Link>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <button 
          onClick={() => {
            localStorage.removeItem('manaratak_admin_access');
            localStorage.removeItem('manaratak_demo_email');
            window.location.href = '/login';
          }}
          className="text-sm font-medium text-slate-500 hover:text-slate-900 underline underline-offset-4"
        >
          {t('admin_logout') || 'Logout from Demo Admin'}
        </button>
      </div>
    </div>
  );
}
