import React, { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Link, Navigate, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AppShell, Container } from '@manaratak/ui';
import { CsrfClientManager, isSupportedLocale } from '@manaratak/shared';
import { Seo, RelatedPublicLinks, Logo } from '../components';
import { useTranslation } from '../i18n/I18nProvider';
import { localizeLocation, localizePathname, resolveLegacyPublicLocale } from '../i18n/localeRouting';
const PageLoadingFallback = () => {
  const { t } = useTranslation();
  return (
    <div className="py-20 text-center text-slate-500 font-medium animate-pulse flex items-center justify-center gap-2">
      <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      <span>{t('loading')}</span>
    </div>
  );
};

// Public pages lazy loading
const ScholarshipList = React.lazy(() => import('../features/scholarships/ScholarshipList').then(m => ({ default: m.ScholarshipList })));
const ScholarshipDetail = React.lazy(() => import('../features/scholarships/ScholarshipDetail').then(m => ({ default: m.ScholarshipDetail })));
const UniversityList = React.lazy(() => import('../features/universities/UniversityList').then(m => ({ default: m.UniversityList })));
const UniversityDetail = React.lazy(() => import('../features/universities/UniversityDetail').then(m => ({ default: m.UniversityDetail })));
const MajorList = React.lazy(() => import('../features/majors/MajorList').then(m => ({ default: m.MajorList })));
const MajorDetail = React.lazy(() => import('../features/majors/MajorDetail').then(m => ({ default: m.MajorDetail })));
const CourseList = React.lazy(() => import('../features/courses/CourseList').then(m => ({ default: m.CourseList })));
const CourseDetail = React.lazy(() => import('../features/courses/CourseDetail').then(m => ({ default: m.CourseDetail })));
const CmsContentList = React.lazy(() => import('../features/cms/CmsContentList').then(m => ({ default: m.CmsContentList })));
const CmsContentDetail = React.lazy(() => import('../features/cms/CmsContentDetail').then(m => ({ default: m.CmsContentDetail })));
const ServiceList = React.lazy(() => import('../features/services/ServiceList').then(m => ({ default: m.ServiceList })));
const ServiceDetail = React.lazy(() => import('../features/services/ServiceDetail').then(m => ({ default: m.ServiceDetail })));
const InternationalTestList = React.lazy(() => import('../features/international-tests/InternationalTestList').then(m => ({ default: m.InternationalTestList })));
const InternationalTestDetail = React.lazy(() => import('../features/international-tests/InternationalTestDetail').then(m => ({ default: m.InternationalTestDetail })));
const StudentWorkspacePage = React.lazy(() => import('../features/students/StudentWorkspacePage').then(m => ({ default: m.StudentWorkspacePage })));
const StudentToolsList = React.lazy(() => import('../features/student-tools/StudentToolsList').then(m => ({ default: m.StudentToolsList })));
const LoginPage = React.lazy(() => import('../features/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const CertificateVerificationPage = React.lazy(() => import('../features/certificates/CertificateVerificationPage').then(m => ({ default: m.CertificateVerificationPage })));
const SearchResultsPage = React.lazy(() => import('../features/discovery/SearchResultsPage').then(m => ({ default: m.SearchResultsPage })));
const ComparePage = React.lazy(() => import('../features/discovery/ComparePage').then(m => ({ default: m.ComparePage })));

// Admin Preview lazy loading
const AdminGenericPreviewPage = React.lazy(() => import('../features/admin-preview/AdminGenericPreviewPage').then(m => ({ default: m.AdminGenericPreviewPage })));
const AdminScholarshipsPreviewPage = React.lazy(() => import('../features/admin-preview/AdminScholarshipsPreviewPage').then(m => ({ default: m.AdminScholarshipsPreviewPage })));
const AdminScholarshipDetailPage = React.lazy(() => import('../features/admin-preview/AdminScholarshipDetailPage').then(m => ({ default: m.AdminScholarshipDetailPage })));
const AdminUniversitiesPreviewPage = React.lazy(() => import('../features/admin-preview/AdminUniversitiesPreviewPage').then(m => ({ default: m.AdminUniversitiesPreviewPage })));
const AdminUniversityDetailPage = React.lazy(() => import('../features/admin-preview/AdminUniversityDetailPage').then(m => ({ default: m.AdminUniversityDetailPage })));
const AdminMajorsPreviewPage = React.lazy(() => import('../features/admin-preview/AdminMajorsPreviewPage').then(m => ({ default: m.AdminMajorsPreviewPage })));
const AdminMajorDetailPage = React.lazy(() => import('../features/admin-preview/AdminMajorDetailPage').then(m => ({ default: m.AdminMajorDetailPage })));
const AdminFacultiesPage = React.lazy(() => import('../features/admin-preview/AdminFacultiesPage').then(m => ({ default: m.AdminFacultiesPage })));
const AdminInternationalTestsPreviewPage = React.lazy(() => import('../features/admin-preview/AdminInternationalTestsPreviewPage').then(m => ({ default: m.AdminInternationalTestsPreviewPage })));
const AdminInternationalTestDetailPage = React.lazy(() => import('../features/admin-preview/AdminInternationalTestDetailPage').then(m => ({ default: m.AdminInternationalTestDetailPage })));
const AdminHealthPreviewPage = React.lazy(() => import('../features/admin-preview/AdminHealthPreviewPage').then(m => ({ default: m.AdminHealthPreviewPage })));
const AdminImportsPreviewPage = React.lazy(() => import('../features/admin-preview/AdminImportsPreviewPage').then(m => ({ default: m.AdminImportsPreviewPage })));
const AdminDomainImportCenterPage = React.lazy(() => import('../features/admin-preview/AdminDomainImportCenterPage').then(m => ({ default: m.AdminDomainImportCenterPage })));
const AdminReviewQueuePreviewPage = React.lazy(() => import('../features/admin-preview/AdminReviewQueuePreviewPage').then(m => ({ default: m.AdminReviewQueuePreviewPage })));
const AdminCoursesLandingPage = React.lazy(() => import('../features/admin-preview/AdminCoursesLandingPage').then(m => ({ default: m.AdminCoursesLandingPage })));
const AdminNativeCoursesPreviewPage = React.lazy(() => import('../features/admin-preview/AdminNativeCoursesPreviewPage').then(m => ({ default: m.AdminNativeCoursesPreviewPage })));
const AdminNativeCourseDetailPage = React.lazy(() => import('../features/admin-preview/AdminNativeCourseDetailPage').then(m => ({ default: m.AdminNativeCourseDetailPage })));
const AdminImportedCoursesPreviewPage = React.lazy(() => import('../features/admin-preview/AdminImportedCoursesPreviewPage').then(m => ({ default: m.AdminImportedCoursesPreviewPage })));
const AdminImportedCourseDetailPage = React.lazy(() => import('../features/admin-preview/AdminImportedCourseDetailPage').then(m => ({ default: m.AdminImportedCourseDetailPage })));
const AdminPaidCoursesPreviewPage = React.lazy(() => import('../features/admin-preview/AdminPaidCoursesPreviewPage').then(m => ({ default: m.AdminPaidCoursesPreviewPage })));
const AdminPaidCourseDetailPage = React.lazy(() => import('../features/admin-preview/AdminPaidCourseDetailPage').then(m => ({ default: m.AdminPaidCourseDetailPage })));
const AdminServicesLandingPage = React.lazy(() => import('../features/admin-preview/AdminServicesLandingPage').then(m => ({ default: m.AdminServicesLandingPage })));
const AdminStudentServicesPreviewPage = React.lazy(() => import('../features/admin-preview/AdminStudentServicesPreviewPage').then(m => ({ default: m.AdminStudentServicesPreviewPage })));
const AdminStudentServiceDetailPage = React.lazy(() => import('../features/admin-preview/AdminStudentServiceDetailPage').then(m => ({ default: m.AdminStudentServiceDetailPage })));
const AdminGeneralServicesPreviewPage = React.lazy(() => import('../features/admin-preview/AdminGeneralServicesPreviewPage').then(m => ({ default: m.AdminGeneralServicesPreviewPage })));
const AdminGeneralServiceDetailPage = React.lazy(() => import('../features/admin-preview/AdminGeneralServiceDetailPage').then(m => ({ default: m.AdminGeneralServiceDetailPage })));
const AdminCmsLandingPage = React.lazy(() => import('../features/admin-preview/AdminCmsLandingPage').then(m => ({ default: m.AdminCmsLandingPage })));
const AdminCmsArticlesPreviewPage = React.lazy(() => import('../features/admin-preview/AdminCmsArticlesPreviewPage').then(m => ({ default: m.AdminCmsArticlesPreviewPage })));
const AdminCmsArticleDetailPage = React.lazy(() => import('../features/admin-preview/AdminCmsArticleDetailPage').then(m => ({ default: m.AdminCmsArticleDetailPage })));
const AdminCmsFaqsPreviewPage = React.lazy(() => import('../features/admin-preview/AdminCmsFaqsPreviewPage').then(m => ({ default: m.AdminCmsFaqsPreviewPage })));
const AdminCmsFaqDetailPage = React.lazy(() => import('../features/admin-preview/AdminCmsFaqDetailPage').then(m => ({ default: m.AdminCmsFaqDetailPage })));
const AdminCmsPagesPreviewPage = React.lazy(() => import('../features/admin-preview/AdminCmsPagesPreviewPage').then(m => ({ default: m.AdminCmsPagesPreviewPage })));
const AdminCmsPageDetailPage = React.lazy(() => import('../features/admin-preview/AdminCmsPageDetailPage').then(m => ({ default: m.AdminCmsPageDetailPage })));
const AdminCmsCategoriesPreviewPage = React.lazy(() => import('../features/admin-preview/AdminCmsCategoriesPreviewPage').then(m => ({ default: m.AdminCmsCategoriesPreviewPage })));
const AdminCmsTranslationsPreviewPage = React.lazy(() => import('../features/admin-preview/AdminCmsTranslationsPreviewPage').then(m => ({ default: m.AdminCmsTranslationsPreviewPage })));
const AdminCmsReviewQueuePage = React.lazy(() => import('../features/admin-preview/AdminCmsReviewQueuePage').then(m => ({ default: m.AdminCmsReviewQueuePage })));
const AdminStudentToolsPreviewPage = React.lazy(() => import('../features/admin-preview/AdminStudentToolsPreviewPage').then(m => ({ default: m.AdminStudentToolsPreviewPage })));
const AdminStudentToolDetailPage = React.lazy(() => import('../features/admin-preview/AdminStudentToolDetailPage').then(m => ({ default: m.AdminStudentToolDetailPage })));
const AdminCertificatesPreviewPage = React.lazy(() => import('../features/admin-preview/AdminCertificatesPreviewPage').then(m => ({ default: m.AdminCertificatesPreviewPage })));
const AdminCertificateDetailPage = React.lazy(() => import('../features/admin-preview/AdminCertificateDetailPage').then(m => ({ default: m.AdminCertificateDetailPage })));
const AdminFinancePreviewPage = React.lazy(() => import('../features/admin-preview/AdminFinancePreviewPage').then(m => ({ default: m.AdminFinancePreviewPage })));
const AdminInvoiceDetailPage = React.lazy(() => import('../features/admin-preview/AdminInvoiceDetailPage').then(m => ({ default: m.AdminInvoiceDetailPage })));
const AdminCareersPreviewPage = React.lazy(() => import('../features/admin-preview/AdminCareersPreviewPage').then(m => ({ default: m.AdminCareersPreviewPage })));
const AdminCareerOpportunityDetailPage = React.lazy(() => import('../features/admin-preview/AdminCareerOpportunityDetailPage').then(m => ({ default: m.AdminCareerOpportunityDetailPage })));
const AdminAiGovernancePreviewPage = React.lazy(() => import('../features/admin-preview/AdminAiGovernancePreviewPage').then(m => ({ default: m.AdminAiGovernancePreviewPage })));
const AdminSettingsPreviewPage = React.lazy(() => import('../features/admin-preview/AdminSettingsPreviewPage').then(m => ({ default: m.AdminSettingsPreviewPage })));
const AdminStudyDestinationsPage = React.lazy(() => import('../features/admin-preview/AdminStudyDestinationsPages').then(m => ({ default: m.AdminStudyDestinationsPage })));
const AdminStudyDestinationDetailPage = React.lazy(() => import('../features/admin-preview/AdminStudyDestinationsPages').then(m => ({ default: m.AdminStudyDestinationDetailPage })));
const AdminAcademicTaxonomyPage = React.lazy(() => import('../features/admin-preview/AdminAcademicTaxonomyPages').then(m => ({ default: m.AdminAcademicTaxonomyPage })));
const AdminAcademicTaxonomyDetailPage = React.lazy(() => import('../features/admin-preview/AdminAcademicTaxonomyPages').then(m => ({ default: m.AdminAcademicTaxonomyDetailPage })));
import { 
  GraduationCap, 
  School, 
  BookOpen, 
  FileText, 
  Layers, 
  Wrench, 
  Search, 
  Sparkles, 
  Globe, 
  TrendingUp, 
  CheckCircle2, 
  ChevronRight, 
  Compass, 
  Menu, 
  X,
  BookMarked,
  Info
} from 'lucide-react';

const RootLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, language, setLanguage } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { locale } = useParams<{ locale?: string }>();
  const routeLocale = isSupportedLocale(locale) ? locale : null;

  useEffect(() => {
    if (routeLocale && routeLocale !== language) setLanguage(routeLocale);
  }, [language, routeLocale, setLanguage]);

  if (!routeLocale) {
    const targetLocale = resolveLegacyPublicLocale(localStorage.getItem('manaratak_lang'));
    return <Navigate replace to={localizeLocation(location, targetLocale)} />;
  }

  const localeRelativePath = location.pathname.replace(/^\/(?:ar|en)(?=\/|$)/, '') || '/';
  const isAdminPath = localeRelativePath.startsWith('/admin') || localeRelativePath.startsWith('/study-destinations');
  const isLocalAdminReadOnly = import.meta.env.VITE_LOCAL_ADMIN_READ_ONLY === 'true';

  const userEmail = localStorage.getItem('manaratak_user_email');
  const token = localStorage.getItem('manaratak_access_token');
  const isLoggedIn = !!userEmail || !!token;

  if (isAdminPath && !isLocalAdminReadOnly) {
    return <CanonicalAdminRedirect legacyPath={location.pathname} />;
  }

  const navItems = [
    { to: localizePathname('/scholarships', language), label: t('nav_scholarships') },
    { to: localizePathname('/universities', language), label: t('nav_universities') },
    { to: localizePathname('/majors', language), label: t('nav_majors') },
    { to: localizePathname('/courses', language), label: t('nav_courses') },
    { to: localizePathname('/international-tests', language), label: t('nav_tests') },
    { to: localizePathname('/services', language), label: t('nav_services') },
    { to: localizePathname('/tools', language), label: t('nav_tools') },
    { to: localizePathname('/articles', language), label: t('nav_guides') },
    { to: localizePathname('/certificates/verify', language), label: t('nav_verify') },
    { to: localizePathname('/student/demo-student', language), label: t('nav_workspace') },
  ];
  const localAdminLinks = [
    ['/admin/dashboard', t('local_admin_nav_dashboard')],
    ['/admin/review-queue', t('local_admin_nav_review')],
    ['/admin/imports', t('local_admin_nav_imports')],
    ['/admin/study-destinations', t('local_admin_nav_countries')],
    ['/admin/academic-taxonomy', t('local_admin_nav_taxonomy')],
    ['/admin/universities', t('local_admin_nav_universities')],
    ['/admin/faculties', t('local_admin_nav_faculties')],
    ['/admin/majors', t('local_admin_nav_majors')],
    ['/admin/international-tests', t('local_admin_nav_tests')],
    ['/admin/scholarships', t('local_admin_nav_scholarships')],
    ['/admin/courses', t('local_admin_nav_courses')],
    ['/admin/services', t('local_admin_nav_services')],
    ['/admin/cms', t('local_admin_nav_cms')],
    ['/admin/student-tools', t('local_admin_nav_tools')],
    ['/admin/certificates', t('local_admin_nav_certificates')],
    ['/admin/finance', t('local_admin_nav_finance')],
    ['/admin/careers', t('local_admin_nav_careers')],
    ['/admin/ai-governance', t('local_admin_nav_ai')],
    ['/admin/health', t('local_admin_nav_health')],
    ['/admin/settings', t('local_admin_nav_settings')],
  ] as const;

  const handleLogout = () => {
    localStorage.removeItem('manaratak_demo_email');
    localStorage.removeItem('manaratak_user_email');
    localStorage.removeItem('manaratak_user_name');
    localStorage.removeItem('manaratak_access_token');
    localStorage.removeItem('manaratak_refresh_token');
    localStorage.removeItem('manaratak_admin_access');
    window.location.href = localizePathname('/', language);
  };

  const getWorkspaceUrl = () => {
    const ref = userEmail?.includes('@') ? userEmail.split('@')[0] : 'demo-student';
    return localizePathname(`/student/${encodeURIComponent(ref)}`, language);
  };

  return (
    <AppShell
      header={
        <>
          {/* 3. أبعاد الهيدر والأزرار (Header Layout & Buttons) - h-24 (96px) on Mobile, h-28 (112px) on Desktop */}
          <div className="bg-white border-b border-slate-100 flex items-center h-24 lg:h-28">
            <div className="mx-auto max-w-7xl w-full px-4 flex items-center justify-between gap-4">
              <Link to={localizePathname('/', language)} className="transition-transform active:scale-95" onClick={() => setMenuOpen(false)}>
                <Logo showText={true} />
              </Link>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Language Switch */}
                <button
                  onClick={() => {
                    const nextLanguage = language === 'en' ? 'ar' : 'en';
                    setLanguage(nextLanguage);
                    navigate(localizeLocation(location, nextLanguage));
                  }}
                  className="text-[#0F4B3A] hover:bg-emerald-50 font-bold border border-[#0F4B3A]/10 text-xs md:text-sm rounded-lg md:rounded-xl px-2.5 py-1.5 md:px-4 md:py-2 flex items-center gap-1.5 transition-all cursor-pointer min-h-[40px]"
                >
                  <Globe className="w-4 h-4 text-emerald-700" />
                  <span className="hidden sm:inline">{language === 'en' ? t('language_switch_to_ar') : t('language_switch_to_en')}</span>
                  <span className="sm:hidden">{language === 'en' ? 'AR' : 'EN'}</span>
                </button>

                {/* Interaction Buttons (الدخول / الحساب / خروج) - styled with spec dimensions */}
                {!isLoggedIn ? (
                  <Link 
                    to={localizePathname('/login', language)}
                    className="bg-[#0F4B3A] text-white hover:bg-[#0c3e30] font-bold text-xs md:text-sm rounded-lg md:rounded-xl px-3 py-1.5 md:px-5 md:py-2.5 flex items-center justify-center transition-all min-h-[40px] shadow-sm"
                  >
                    {t('nav_login')}
                  </Link>
                ) : (
                  <>
                    <Link 
                      to={getWorkspaceUrl()} 
                      className="bg-[#C8A24A] text-white hover:bg-[#b08d3e] font-bold text-xs md:text-sm rounded-lg md:rounded-xl px-3 py-1.5 md:px-5 md:py-2.5 flex items-center justify-center transition-all min-h-[40px] shadow-sm"
                    >
                      {t('nav_account')}
                    </Link>
                    <button 
                      onClick={handleLogout} 
                      className="bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100 font-bold text-xs md:text-sm rounded-lg md:rounded-xl px-2.5 py-1.5 md:px-4 md:py-2 flex items-center justify-center transition-all min-h-[40px] cursor-pointer"
                    >
                      {t('nav_logout')}
                    </button>
                  </>
                )}

                {/* Mobile Menu Toggle (Hamburger) */}
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  className="lg:hidden min-h-[40px] h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
                  aria-expanded={menuOpen}
                  aria-label={t('nav_menu_toggle')}
                >
                  {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* 4. شريط القائمة العائمة (Navigation Bar) - h-14 (56px), bg-gray-50/90 backdrop-blur-md */}
          <div className="sticky top-0 z-50 h-14 bg-gray-50/90 backdrop-blur-md border-b border-slate-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
            <div className="mx-auto max-w-7xl h-full px-4 flex items-center">
              
              {/* Desktop Nav Items */}
              <nav className="hidden lg:flex items-center gap-6 h-full text-sm font-semibold">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
                  return (
                    <Link 
                      key={item.to} 
                      to={item.to} 
                      className={`h-full flex items-center relative text-sm font-semibold transition-all px-1 ${
                        isActive ? 'text-[#0F4B3A]' : 'text-slate-600 hover:text-[#0F4B3A]'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C8A24A]" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Nav: scrollable horizontal row of links, text-xs (12px) */}
              <nav className="lg:hidden flex items-center gap-4 h-full w-full overflow-x-auto scrollbar-none scroll-smooth">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
                  return (
                    <Link 
                      key={item.to} 
                      to={item.to} 
                      className={`h-full flex items-center relative text-[12px] font-semibold whitespace-nowrap px-2 transition-all flex-shrink-0 ${
                        isActive ? 'text-[#0F4B3A]' : 'text-slate-500 hover:text-[#0F4B3A]'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C8A24A]" />
                      )}
                    </Link>
                  );
                })}
              </nav>

            </div>
          </div>

          {/* Mobile Full Dropdown Menu (on hamburger click) */}
          {menuOpen && (
            <div className="lg:hidden border-b border-slate-100 bg-white/95 backdrop-blur-md p-4 animate-in fade-in slide-in-from-top-3 duration-200">
              <nav className="grid grid-cols-2 gap-2 text-xs font-bold">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="min-h-11 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-slate-700 shadow-sm border border-slate-100 active:bg-slate-100 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0F4B3A]" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </>
      }
      footer={
        <footer className="mt-16 border-t border-slate-100 bg-white py-8 px-4 text-center">
          <div className="mx-auto max-w-7xl flex flex-col items-center justify-center gap-4">
            <Logo showText={true} className="opacity-90 grayscale-[20%]" />
            <p className="text-xs text-slate-400 font-medium">
              {t('footer_copy')}
            </p>
          </div>
        </footer>
      }
    >
      <Container className="px-4 py-6 sm:py-10 max-w-7xl mx-auto">
        {isAdminPath && isLocalAdminReadOnly && (
          <>
            <div className="mb-3 border border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm font-bold text-amber-900" role="status">
              {t('local_admin_readonly_notice')}
            </div>
            <nav aria-label={t('local_admin_navigation_aria')} className="mb-5 flex min-h-12 items-center gap-1 overflow-x-auto border-y border-slate-200 bg-white px-2 py-2">
              {localAdminLinks.map(([path, label]) => {
                const localizedPath = localizePathname(path, language);
                return (
                <Link
                  key={path}
                  to={localizedPath}
                  className={`flex min-h-9 shrink-0 items-center px-3 text-xs font-bold transition-colors ${
                    location.pathname === localizedPath || (path !== '/admin/dashboard' && location.pathname.startsWith(`${localizedPath}/`))
                      ? 'bg-[#0F4B3A] text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-[#0F4B3A]'
                  }`}
                >
                  {label}
                </Link>
                );
              })}
            </nav>
          </>
        )}
        <React.Suspense fallback={<PageLoadingFallback />}>
          <Outlet />
        </React.Suspense>
      </Container>
    </AppShell>
  );
};

const HomePage = () => {
  const { t, language } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `${localizePathname('/search', language)}?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const heroTitle = <>{t('home_premium_hero_prefix')} <span className="text-amber-400 font-black relative inline-block">{t('home_premium_hero_emphasis')}<span className="absolute bottom-1 left-0 w-full h-[6px] bg-amber-500/30 rounded-full"></span></span></>;
  const heroDesc = t('home_premium_hero_description');

  const quickTags = [
    { label: t('home_quick_fully_funded'), link: localizePathname('/scholarships', language) },
    { label: t('home_quick_elite_universities'), link: localizePathname('/universities', language) },
    { label: t('home_quick_free_language_courses'), link: localizePathname('/courses', language) },
    { label: t('home_quick_practice_tests'), link: localizePathname('/international-tests', language) },
  ];

  const domains = [
    { 
      to: "/scholarships", 
      title: t('card_scholarships_title'), 
      description: t('card_scholarships_desc'),
      icon: GraduationCap,
      color: "from-emerald-500 to-teal-600",
      badge: t('home_domain_badge_funded')
    },
    { 
      to: "/universities", 
      title: t('card_universities_title'), 
      description: t('card_universities_desc'),
      icon: School,
      color: "from-blue-500 to-indigo-600",
      badge: t('home_domain_badge_accredited')
    },
    { 
      to: "/majors", 
      title: t('card_majors_title'), 
      description: t('card_majors_desc'),
      icon: Compass,
      color: "from-amber-500 to-orange-600",
      badge: t('home_domain_badge_future')
    },
    { 
      to: "/courses", 
      title: t('card_courses_title'), 
      description: t('card_courses_desc'),
      icon: BookOpen,
      color: "from-rose-500 to-pink-600",
      badge: t('home_domain_badge_skills')
    },
    { 
      to: "/international-tests", 
      title: t('card_tests_title'), 
      description: t('card_tests_desc'),
      icon: FileText,
      color: "from-violet-500 to-purple-600",
      badge: t('home_domain_badge_admission')
    },
    { 
      to: "/tools", 
      title: t('card_tools_title'), 
      description: t('card_tools_desc'),
      icon: Wrench,
      color: "from-cyan-500 to-blue-600",
      badge: t('home_domain_badge_free_tools')
    },
    { 
      to: "/search", 
      title: t('card_search_title'), 
      description: t('card_search_desc'),
      icon: Search,
      color: "from-teal-500 to-emerald-600",
      badge: t('home_domain_badge_smart_search')
    },
    { 
      to: "/compare", 
      title: t('card_compare_title'), 
      description: t('card_compare_desc'),
      icon: TrendingUp,
      color: "from-fuchsia-500 to-pink-600",
      badge: t('home_domain_badge_compare')
    }
  ];

  return (
    <div className="space-y-12 py-2 sm:py-6 animate-in fade-in duration-300">
      <Seo title={t('study_opportunities_and_student_tools')} description={heroDesc} />
      
      {/* Premium Hero Section with Grid Background */}
      <section 
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#022c22] via-[#044e3f] to-[#01251c] px-6 py-12 text-white shadow-2xl sm:px-12 sm:py-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 10% 20%, rgba(245, 158, 11, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.08) 0%, transparent 40%),
            linear-gradient(135deg, #022c22 0%, #064e3b 50%, #022c22 100%)
          `
        }}
      >
        {/* Subtle decorative grid lines overlay */}
        <div 
          className="absolute inset-0 opacity-10 mix-blend-overlay"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Accent Badge */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-900/50 border border-emerald-700/50 text-amber-300 text-xs font-bold tracking-wide shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('home_academic_portal_badge')}</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-3xl font-black leading-tight sm:text-5xl md:text-6xl tracking-tight text-white">
            {heroTitle}
          </h1>

          {/* Core Subtitle / Description */}
          <p className="max-w-2xl mx-auto text-sm leading-relaxed text-emerald-100 sm:text-lg sm:leading-relaxed font-medium">
            {heroDesc}
          </p>

          {/* Functional, Gorgeous Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto mt-8">
            <div className="relative flex items-center p-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner group focus-within:border-amber-400/50 transition-all">
              <Search className="w-5 h-5 text-emerald-200 mx-3" />
              <input 
                type="text" 
                placeholder={t('home_search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-white border-none outline-none placeholder-emerald-200/60 text-sm py-2 px-1 focus:ring-0 min-h-[44px]"
              />
              <button 
                type="submit" 
                className="bg-amber-500 hover:bg-amber-400 text-[#022c22] font-black text-xs px-5 py-3 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>{t('home_search_button')}</span>
              </button>
            </div>
          </form>

          {/* Quick Shortcuts */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {quickTags.map((tag, idx) => (
              <Link 
                key={idx} 
                to={tag.link} 
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-emerald-200 hover:bg-white/10 hover:text-white transition-all"
              >
                {tag.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories / Domain Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-extrabold sm:text-3xl text-slate-900 tracking-tight">
            {t('home_domain_section_title')}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-500 font-medium">
            {t('home_domain_section_desc')}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {domains.map((dom) => (
            <HomeCard 
              key={dom.to} 
              to={dom.to} 
              title={dom.title} 
              description={dom.description} 
              icon={dom.icon}
              badge={dom.badge}
              color={dom.color}
            />
          ))}
        </div>
      </section>

      {/* Trust & Stats Section */}
      <section className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]">
        <div className="grid gap-6 md:grid-cols-3 text-center divide-y md:divide-y-0 md:divide-x md:divide-slate-100">
          <div className="py-4 md:py-0 px-4">
            <h4 className="text-3xl font-black text-[#064E3B]">{t('home_stat_students_value')}</h4>
            <p className="mt-1 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('home_stat_students_label')}</p>
          </div>
          <div className="py-4 md:py-0 px-4">
            <h4 className="text-3xl font-black text-[#D97706]">{t('home_stat_scholarships_value')}</h4>
            <p className="mt-1 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('home_stat_scholarships_label')}</p>
          </div>
          <div className="py-4 md:py-0 px-4">
            <h4 className="text-3xl font-black text-[#064E3B]">{t('home_stat_verified_links_value')}</h4>
            <p className="mt-1 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('home_stat_verified_links_label')}</p>
          </div>
        </div>
      </section>

      <RelatedPublicLinks current="home" />
    </div>
  );
};

// Route Groups Definition
const router = createBrowserRouter([
  {
    path: '/:locale?',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'search',
        element: <SearchResultsPage />
      },
      {
        path: 'compare',
        element: <ComparePage />
      },
      {
        path: 'scholarships',
        element: <ScholarshipList />
      },
      {
        path: 'scholarships/:slug',
        element: <ScholarshipDetail />
      },
      {
        path: 'universities',
        element: <UniversityList />
      },
      {
        path: 'universities/:slug',
        element: <UniversityDetail />
      },
      {
        path: 'majors',
        element: <MajorList />
      },
      {
        path: 'majors/:slug',
        element: <MajorDetail />
      },
      {
        path: 'courses',
        element: <CourseList />
      },
      {
        path: 'courses/:slug',
        element: <CourseDetail />
      },
      {
        path: 'articles',
        element: <CmsContentList />
      },
      {
        path: 'articles/:slug',
        element: <CmsContentDetail />
      },
      {
        path: 'services',
        element: <ServiceList />
      },
      {
        path: 'services/:slug',
        element: <ServiceDetail />
      },
      {
        path: 'international-tests',
        element: <InternationalTestList />
      },
      {
        path: 'international-tests/:slug',
        element: <InternationalTestDetail />
      },
      {
        path: 'tools',
        element: <StudentToolsList />
      },
      {
        path: 'certificates/verify',
        element: <CertificateVerificationPage />
      },
      {
        path: 'student',
        element: <StudentWorkspacePage />
      },
      {
        path: 'student/:studentReferenceId',
        element: <StudentWorkspacePage />
      },
      {
        path: 'admin',
        element: <AdminAccessBridgePage />
      },
      {
        path: 'admin/dashboard',
        element: <AdminGenericPreviewPage titleKey="admin_dashboard" defaultTitle="Dashboard" descKey="admin_dashboard_desc" defaultDesc="Overview of platform operations, metrics, and quick admin actions." statusKey="admin_status_active" defaultStatus="Active" />
      },
      {
        path: 'admin/review-queue',
        element: <AdminReviewQueuePreviewPage />
      },
      {
        path: 'admin/imports',
        element: <AdminImportsPreviewPage />
      },
      {
        path: 'admin/imports/:domainKey',
        element: <AdminDomainImportCenterPage />
      },
      {
        path: 'study-destinations',
        element: <AdminStudyDestinationsPage />
      },
      {
        path: 'study-destinations/:countryIso2Code',
        element: <AdminStudyDestinationDetailPage />
      },
      {
        path: 'admin/study-destinations',
        element: <AdminStudyDestinationsPage />
      },
      {
        path: 'admin/study-destinations/:countryIso2Code',
        element: <AdminStudyDestinationDetailPage />
      },
      {
        path: 'admin/scholarships',
        element: <AdminScholarshipsPreviewPage />
      },
      {
        path: 'admin/scholarships/:id',
        element: <AdminScholarshipDetailPage />
      },
      {
        path: 'admin/universities',
        element: <AdminUniversitiesPreviewPage />
      },
      {
        path: 'admin/universities/:id',
        element: <AdminUniversityDetailPage />
      },
      {
        path: 'admin/academic-taxonomy',
        element: <AdminAcademicTaxonomyPage />
      },
      {
        path: 'admin/academic-taxonomy/:nodeId',
        element: <AdminAcademicTaxonomyDetailPage />
      },
      {
        path: 'academic-taxonomy',
        element: <AdminAcademicTaxonomyPage />
      },
      {
        path: 'academic-taxonomy/:nodeId',
        element: <AdminAcademicTaxonomyDetailPage />
      },
      {
        path: 'admin/majors',
        element: <AdminMajorsPreviewPage />
      },
      {
        path: 'admin/majors/:id',
        element: <AdminMajorDetailPage />
      },
      {
        path: 'admin/faculties',
        element: <AdminFacultiesPage />
      },
      {
        path: 'admin/international-tests',
        element: <AdminInternationalTestsPreviewPage />
      },
      {
        path: 'admin/international-tests/:id',
        element: <AdminInternationalTestDetailPage />
      },
      {
        path: 'admin/courses',
        element: <AdminCoursesLandingPage />
      },
      {
        path: 'admin/courses/native',
        element: <AdminNativeCoursesPreviewPage />
      },
      {
        path: 'admin/courses/native/:id',
        element: <AdminNativeCourseDetailPage />
      },
      {
        path: 'admin/courses/imported',
        element: <AdminImportedCoursesPreviewPage />
      },
      {
        path: 'admin/courses/imported/:id',
        element: <AdminImportedCourseDetailPage />
      },
      {
        path: 'admin/courses/paid',
        element: <AdminPaidCoursesPreviewPage />
      },
      {
        path: 'admin/courses/paid/:id',
        element: <AdminPaidCourseDetailPage />
      },
      {
        path: 'admin/services',
        element: <AdminServicesLandingPage />
      },
      {
        path: 'admin/services/student',
        element: <AdminStudentServicesPreviewPage />
      },
      {
        path: 'admin/services/student/:id',
        element: <AdminStudentServiceDetailPage />
      },
      {
        path: 'admin/services/general',
        element: <AdminGeneralServicesPreviewPage />
      },
      {
        path: 'admin/services/general/:id',
        element: <AdminGeneralServiceDetailPage />
      },
      {
        path: 'admin/cms',
        element: <AdminCmsLandingPage />
      },
      {
        path: 'admin/cms/articles',
        element: <AdminCmsArticlesPreviewPage />
      },
      {
        path: 'admin/cms/articles/:id',
        element: <AdminCmsArticleDetailPage />
      },
      {
        path: 'admin/cms/faqs',
        element: <AdminCmsFaqsPreviewPage />
      },
      {
        path: 'admin/cms/faqs/:id',
        element: <AdminCmsFaqDetailPage />
      },
      {
        path: 'admin/cms/pages',
        element: <AdminCmsPagesPreviewPage />
      },
      {
        path: 'admin/cms/pages/:id',
        element: <AdminCmsPageDetailPage />
      },
      {
        path: 'admin/cms/categories',
        element: <AdminCmsCategoriesPreviewPage />
      },
      {
        path: 'admin/cms/translations',
        element: <AdminCmsTranslationsPreviewPage />
      },
      {
        path: 'admin/cms/review',
        element: <AdminCmsReviewQueuePage />
      },
      {
        path: 'admin/student-tools',
        element: <AdminStudentToolsPreviewPage />
      },
      {
        path: 'admin/student-tools/:id',
        element: <AdminStudentToolDetailPage />
      },
      {
        path: 'admin/certificates',
        element: <AdminCertificatesPreviewPage />
      },
      {
        path: 'admin/certificates/:id',
        element: <AdminCertificateDetailPage />
      },
      {
        path: 'admin/finance',
        element: <AdminFinancePreviewPage />
      },
      {
        path: 'admin/finance/invoices/:id',
        element: <AdminInvoiceDetailPage />
      },
      {
        path: 'admin/careers',
        element: <AdminCareersPreviewPage />
      },
      {
        path: 'admin/careers/opportunities/:id',
        element: <AdminCareerOpportunityDetailPage />
      },
      {
        path: 'admin/ai-governance',
        element: <AdminAiGovernancePreviewPage />
      },
      {
        path: 'admin/health',
        element: <AdminHealthPreviewPage />
      },
      {
        path: 'admin/settings',
        element: <AdminSettingsPreviewPage />
      }
    ]
  }
]);

function AdminAccessBridgePage() {
  const { t } = useTranslation();
  const isLocalAdminReadOnly = import.meta.env.VITE_LOCAL_ADMIN_READ_ONLY === 'true';
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let active = true;
    async function checkAdminAuth() {
      const token = localStorage.getItem('manaratak_access_token');
      if (!token) {
        if (active) {
          setIsAuthorized(false);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await CsrfClientManager.getInstance().fetchWithCsrf('/api/v1/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const result = await res.json();
          const perms: string[] = result.data?.effectivePermissions || [];
          const hasAdminAuthority = perms.some(
            p => p === '*' || p === 'admin:*' || p.startsWith('admin:')
          );

          if (active) {
            setIsAuthorized(hasAdminAuthority);
            setLoading(false);
          }
          return;
        }
      } catch (e) {
        // Fallback
      }

      if (active) {
        setIsAuthorized(false);
        setLoading(false);
      }
    }

    checkAdminAuth();
    return () => { active = false; };
  }, []);

  if (isLocalAdminReadOnly) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (loading) {
    return <PageLoadingFallback />;
  }

  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="bg-white border rounded-3xl p-10 shadow-sm space-y-4">
          <h1 className="text-2xl font-bold text-red-600">{t('admin_access_denied_title')}</h1>
          <p className="text-gray-600">
            {t('admin_access_denied_desc')}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link to="/login" className="px-6 py-3 bg-[#0F4B3A] text-white rounded-xl font-bold hover:bg-[#0c3e30]">
              {t('admin_go_to_login')}
            </Link>
            <Link to="/student/demo-student" className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200">
              {t('admin_student_workspace')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const rawAdminUrl = import.meta.env.VITE_ADMIN_URL;
  const hasExternalAdminUrl = rawAdminUrl && rawAdminUrl !== '/admin' && rawAdminUrl.startsWith('http');

  const openAdminPortal = () => {
    if (hasExternalAdminUrl) {
      window.location.href = rawAdminUrl;
    }
  };

  if (!hasExternalAdminUrl) return <CanonicalAdminUnavailable />;

  return (
    <div className="max-w-2xl mx-auto py-12 text-center">
      <div className="bg-white border rounded-3xl p-10 shadow-sm">
        <h1 className="text-2xl font-bold mb-4">{t('admin_portal_access') || 'Admin Portal Access'}</h1>
        
        <div className="bg-green-50 text-green-800 p-4 rounded-xl text-sm font-medium mb-6">
          ✓ {t('demo_admin_unlocked') || 'Admin authority verified successfully via backend.'}
        </div>

        <div className="space-y-6">
          <p className="text-gray-600">
            {t('admin_portal_external') || 'The Admin Portal is hosted externally. Click below to proceed.'}
          </p>
          <button
            onClick={openAdminPortal}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
          >
            {t('open_admin_portal') || 'Open Admin Portal'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CanonicalAdminRedirect({ legacyPath }: { legacyPath: string }) {
  const rawAdminUrl = import.meta.env.VITE_ADMIN_URL;
  const adminBase = rawAdminUrl && rawAdminUrl !== '/admin' && rawAdminUrl.startsWith('http')
    ? rawAdminUrl.replace(/\/$/, '')
    : null;
  const targetPath = legacyPath.replace(/^\/admin/, '') || '/dashboard';

  useEffect(() => {
    if (adminBase) window.location.replace(`${adminBase}${targetPath}`);
  }, [adminBase, targetPath]);

  return adminBase ? <PageLoadingFallback /> : <CanonicalAdminUnavailable />;
}

function CanonicalAdminUnavailable() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-2xl py-12 text-center">
      <div className="rounded-lg border bg-white p-8">
        <h1 className="text-xl font-bold">{t('admin_unavailable_title')}</h1>
        <p className="mt-3 text-sm text-gray-600">{t('admin_unavailable_desc')}</p>
      </div>
    </div>
  );
}

export function AppRouter() {
  return <RouterProvider router={router} />;
}

function HomeCard({ 
  to, 
  title, 
  description, 
  icon: IconComponent,
  badge,
  color = "from-emerald-500 to-teal-600"
}: { 
  to: string; 
  title: string; 
  description: string;
  icon?: React.ComponentType<any>;
  badge?: string;
  color?: string;
}) {
  const { t, language } = useTranslation();
  return (
    <Link 
      to={to} 
      className="group relative flex flex-col justify-between min-h-48 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-100 hover:shadow-lg overflow-hidden active:scale-[0.98]"
    >
      {/* Decorative colored ambient light inside card */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-5 rounded-full blur-xl group-hover:opacity-10 transition-all duration-300 pointer-events-none" />

      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          {/* Rounded Icon Badge */}
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 group-hover:bg-[#064E3B] group-hover:text-white transition-all duration-300 shadow-sm">
            {IconComponent ? (
              <IconComponent className="w-5 h-5" />
            ) : (
              <GraduationCap className="w-5 h-5" />
            )}
          </div>

          {/* Elegant Badge Pill */}
          {badge && (
            <span className="text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-100 group-hover:bg-amber-100 group-hover:text-amber-800 group-hover:border-amber-200 transition-colors">
              {badge}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-extrabold text-slate-800 group-hover:text-[#064E3B] transition-colors line-clamp-1">
          {title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-xs leading-relaxed text-slate-500 line-clamp-2">
          {description}
        </p>
      </div>

      {/* Button link inside card */}
      <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-700 group-hover:text-amber-600 transition-colors">
        <span>{t('card_open')}</span>
        <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
