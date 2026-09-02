import React, { useState, useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Link,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { AppShell, Container } from '@manaratak/ui';
import { CsrfClientManager, isSupportedLocale } from '@manaratak/shared';
import { Logo } from '../components';
import { useTranslation } from '../i18n/I18nProvider';
import {
  localizeLocation,
  localizePathname,
  resolveLegacyPublicLocale,
} from '../i18n/localeRouting';
import PublicTemplateApp from '../features/public-template/PublicTemplateApp';
const PageLoadingFallback = () => {
  const { t } = useTranslation();
  return (
    <div className="py-20 text-center text-slate-500 font-medium animate-pulse flex items-center justify-center gap-2">
      <div className="w-5 h-5 border-2 border-[#173f68] border-t-transparent rounded-full animate-spin" />
      <span>{t('loading')}</span>
    </div>
  );
};

// Admin Preview lazy loading
const AdminGenericPreviewPage = React.lazy(() =>
  import('../features/admin-preview/AdminGenericPreviewPage').then((m) => ({
    default: m.AdminGenericPreviewPage,
  })),
);
const AdminScholarshipsPreviewPage = React.lazy(() =>
  import('../features/admin-preview/AdminScholarshipsPreviewPage').then((m) => ({
    default: m.AdminScholarshipsPreviewPage,
  })),
);
const AdminScholarshipDetailPage = React.lazy(() =>
  import('../features/admin-preview/AdminScholarshipDetailPage').then((m) => ({
    default: m.AdminScholarshipDetailPage,
  })),
);
const AdminUniversitiesPreviewPage = React.lazy(() =>
  import('../features/admin-preview/AdminUniversitiesPreviewPage').then((m) => ({
    default: m.AdminUniversitiesPreviewPage,
  })),
);
const AdminUniversityDetailPage = React.lazy(() =>
  import('../features/admin-preview/AdminUniversityDetailPage').then((m) => ({
    default: m.AdminUniversityDetailPage,
  })),
);
const AdminMajorsPreviewPage = React.lazy(() =>
  import('../features/admin-preview/AdminMajorsPreviewPage').then((m) => ({
    default: m.AdminMajorsPreviewPage,
  })),
);
const AdminMajorDetailPage = React.lazy(() =>
  import('../features/admin-preview/AdminMajorDetailPage').then((m) => ({
    default: m.AdminMajorDetailPage,
  })),
);
const AdminFacultiesPage = React.lazy(() =>
  import('../features/admin-preview/AdminFacultiesPage').then((m) => ({
    default: m.AdminFacultiesPage,
  })),
);
const AdminInternationalTestsPreviewPage = React.lazy(() =>
  import('../features/admin-preview/AdminInternationalTestsPreviewPage').then((m) => ({
    default: m.AdminInternationalTestsPreviewPage,
  })),
);
const AdminInternationalTestDetailPage = React.lazy(() =>
  import('../features/admin-preview/AdminInternationalTestDetailPage').then((m) => ({
    default: m.AdminInternationalTestDetailPage,
  })),
);
const AdminHealthPreviewPage = React.lazy(() =>
  import('../features/admin-preview/AdminHealthPreviewPage').then((m) => ({
    default: m.AdminHealthPreviewPage,
  })),
);
const AdminImportsPreviewPage = React.lazy(() =>
  import('../features/admin-preview/AdminImportsPreviewPage').then((m) => ({
    default: m.AdminImportsPreviewPage,
  })),
);
const AdminCourseImportOperationsPage = React.lazy(() =>
  import('../features/admin-preview/AdminCourseImportOperationsPage').then((m) => ({
    default: m.AdminCourseImportOperationsPage,
  })),
);
const AdminCourseImportProviderPage = React.lazy(() =>
  import('../features/admin-preview/AdminCourseImportProviderPage').then((m) => ({
    default: m.AdminCourseImportProviderPage,
  })),
);
const AdminDomainImportCenterPage = React.lazy(() =>
  import('../features/admin-preview/AdminDomainImportCenterPage').then((m) => ({
    default: m.AdminDomainImportCenterPage,
  })),
);
const AdminReviewQueuePreviewPage = React.lazy(() =>
  import('../features/admin-preview/AdminReviewQueuePreviewPage').then((m) => ({
    default: m.AdminReviewQueuePreviewPage,
  })),
);
const AdminCoursesLandingPage = React.lazy(() =>
  import('../features/admin-preview/AdminCoursesLandingPage').then((m) => ({
    default: m.AdminCoursesLandingPage,
  })),
);
const AdminNativeCoursesPreviewPage = React.lazy(() =>
  import('../features/admin-preview/AdminNativeCoursesPreviewPage').then((m) => ({
    default: m.AdminNativeCoursesPreviewPage,
  })),
);
const AdminNativeCourseDetailPage = React.lazy(() =>
  import('../features/admin-preview/AdminNativeCourseDetailPage').then((m) => ({
    default: m.AdminNativeCourseDetailPage,
  })),
);
const AdminImportedCoursesPreviewPage = React.lazy(() =>
  import('../features/admin-preview/AdminImportedCoursesRuntimePage').then((m) => ({
    default: m.AdminImportedCoursesRuntimePage,
  })),
);
const AdminImportedCourseDetailPage = React.lazy(() =>
  import('../features/admin-preview/AdminImportedCourseRuntimeDetailPage').then((m) => ({
    default: m.AdminImportedCourseRuntimeDetailPage,
  })),
);
const AdminPaidCoursesPreviewPage = React.lazy(() =>
  import('../features/admin-preview/AdminPaidCoursesPreviewPage').then((m) => ({
    default: m.AdminPaidCoursesPreviewPage,
  })),
);
const AdminPaidCourseDetailPage = React.lazy(() =>
  import('../features/admin-preview/AdminPaidCourseDetailPage').then((m) => ({
    default: m.AdminPaidCourseDetailPage,
  })),
);
const AdminServicesLandingPage = React.lazy(() =>
  import('../features/admin-preview/AdminServicesLandingPage').then((m) => ({
    default: m.AdminServicesLandingPage,
  })),
);
const AdminStudentServicesPreviewPage = React.lazy(() =>
  import('../features/admin-preview/AdminStudentServicesPreviewPage').then((m) => ({
    default: m.AdminStudentServicesPreviewPage,
  })),
);
const AdminStudentServiceDetailPage = React.lazy(() =>
  import('../features/admin-preview/AdminStudentServiceDetailPage').then((m) => ({
    default: m.AdminStudentServiceDetailPage,
  })),
);
const AdminGeneralServicesPreviewPage = React.lazy(() =>
  import('../features/admin-preview/AdminGeneralServicesPreviewPage').then((m) => ({
    default: m.AdminGeneralServicesPreviewPage,
  })),
);
const AdminGeneralServiceDetailPage = React.lazy(() =>
  import('../features/admin-preview/AdminGeneralServiceDetailPage').then((m) => ({
    default: m.AdminGeneralServiceDetailPage,
  })),
);
const AdminCmsLandingPage = React.lazy(() =>
  import('../features/admin-preview/AdminCmsLandingPage').then((m) => ({
    default: m.AdminCmsLandingPage,
  })),
);
const AdminCmsArticlesPreviewPage = React.lazy(() =>
  import('../features/admin-preview/AdminCmsArticlesPreviewPage').then((m) => ({
    default: m.AdminCmsArticlesPreviewPage,
  })),
);
const AdminCmsArticleDetailPage = React.lazy(() =>
  import('../features/admin-preview/AdminCmsArticleDetailPage').then((m) => ({
    default: m.AdminCmsArticleDetailPage,
  })),
);
const AdminCmsFaqsPreviewPage = React.lazy(() =>
  import('../features/admin-preview/AdminCmsFaqsPreviewPage').then((m) => ({
    default: m.AdminCmsFaqsPreviewPage,
  })),
);
const AdminCmsFaqDetailPage = React.lazy(() =>
  import('../features/admin-preview/AdminCmsFaqDetailPage').then((m) => ({
    default: m.AdminCmsFaqDetailPage,
  })),
);
const AdminCmsPagesPreviewPage = React.lazy(() =>
  import('../features/admin-preview/AdminCmsPagesPreviewPage').then((m) => ({
    default: m.AdminCmsPagesPreviewPage,
  })),
);
const AdminCmsPageDetailPage = React.lazy(() =>
  import('../features/admin-preview/AdminCmsPageDetailPage').then((m) => ({
    default: m.AdminCmsPageDetailPage,
  })),
);
const AdminCmsCategoriesPreviewPage = React.lazy(() =>
  import('../features/admin-preview/AdminCmsCategoriesPreviewPage').then((m) => ({
    default: m.AdminCmsCategoriesPreviewPage,
  })),
);
const AdminCmsTranslationsPreviewPage = React.lazy(() =>
  import('../features/admin-preview/AdminCmsTranslationsPreviewPage').then((m) => ({
    default: m.AdminCmsTranslationsPreviewPage,
  })),
);
const AdminCmsReviewQueuePage = React.lazy(() =>
  import('../features/admin-preview/AdminCmsReviewQueuePage').then((m) => ({
    default: m.AdminCmsReviewQueuePage,
  })),
);
const AdminCertificatesPreviewPage = React.lazy(() =>
  import('../features/admin-preview/AdminCertificatesPreviewPage').then((m) => ({
    default: m.AdminCertificatesPreviewPage,
  })),
);
const AdminCertificateDetailPage = React.lazy(() =>
  import('../features/admin-preview/AdminCertificateDetailPage').then((m) => ({
    default: m.AdminCertificateDetailPage,
  })),
);
const AdminFinancePreviewPage = React.lazy(() =>
  import('../features/admin-preview/AdminFinancePreviewPage').then((m) => ({
    default: m.AdminFinancePreviewPage,
  })),
);
const AdminInvoiceDetailPage = React.lazy(() =>
  import('../features/admin-preview/AdminInvoiceDetailPage').then((m) => ({
    default: m.AdminInvoiceDetailPage,
  })),
);
const AdminCareersPreviewPage = React.lazy(() =>
  import('../features/admin-preview/AdminCareersPreviewPage').then((m) => ({
    default: m.AdminCareersPreviewPage,
  })),
);
const AdminCareerOpportunityDetailPage = React.lazy(() =>
  import('../features/admin-preview/AdminCareerOpportunityDetailPage').then((m) => ({
    default: m.AdminCareerOpportunityDetailPage,
  })),
);
const AdminAiGovernancePreviewPage = React.lazy(() =>
  import('../features/admin-preview/AdminAiGovernancePreviewPage').then((m) => ({
    default: m.AdminAiGovernancePreviewPage,
  })),
);
const AdminSettingsPreviewPage = React.lazy(() =>
  import('../features/admin-preview/AdminSettingsPreviewPage').then((m) => ({
    default: m.AdminSettingsPreviewPage,
  })),
);
const AdminStudyDestinationsPage = React.lazy(() =>
  import('../features/admin-preview/AdminStudyDestinationsPages').then((m) => ({
    default: m.AdminStudyDestinationsPage,
  })),
);
const AdminStudyDestinationDetailPage = React.lazy(() =>
  import('../features/admin-preview/AdminStudyDestinationsPages').then((m) => ({
    default: m.AdminStudyDestinationDetailPage,
  })),
);
const AdminAcademicTaxonomyPage = React.lazy(() =>
  import('../features/admin-preview/AdminAcademicTaxonomyPages').then((m) => ({
    default: m.AdminAcademicTaxonomyPage,
  })),
);
const AdminAcademicTaxonomyDetailPage = React.lazy(() =>
  import('../features/admin-preview/AdminAcademicTaxonomyPages').then((m) => ({
    default: m.AdminAcademicTaxonomyDetailPage,
  })),
);
import { Globe, Menu, X } from 'lucide-react';

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
  const isAdminPath =
    localeRelativePath.startsWith('/admin') || localeRelativePath.startsWith('/study-destinations');
  const isHomePath = localeRelativePath === '/';
  const isLocalAdminReadOnly = import.meta.env.VITE_LOCAL_ADMIN_READ_ONLY === 'true';

  // The public/student experience is now the supplied standalone template.
  // Admin routes retain the existing application shell and backend contracts.
  if (!isAdminPath) {
    return <PublicTemplateApp />;
  }

  const userEmail = localStorage.getItem('manaratak_user_email');
  const isLoggedIn = !!userEmail;

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
    { to: localizePathname('/student', language), label: t('nav_workspace') },
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
    ['/admin/ai', t('local_admin_nav_ai')],
    ['/admin/health', t('local_admin_nav_health')],
    ['/admin/settings', t('local_admin_nav_settings')],
  ] as const;

  const handleLogout = async () => {
    const csrfClient = CsrfClientManager.getInstance();
    try {
      await csrfClient.fetchWithCsrf('/api/v1/auth/logout', { method: 'POST' });
    } finally {
      csrfClient.clearToken();
      localStorage.removeItem('manaratak_demo_email');
      localStorage.removeItem('manaratak_user_email');
      localStorage.removeItem('manaratak_user_name');
      localStorage.removeItem('manaratak_admin_access');
      window.location.href = localizePathname('/', language);
    }
  };

  const getWorkspaceUrl = () => {
    return localizePathname('/student', language);
  };

  return (
    <AppShell
      header={
        <>
          {/* 3. أبعاد الهيدر والأزرار (Header Layout & Buttons) - h-24 (96px) on Mobile, h-28 (112px) on Desktop */}
          <div className="bg-white border-b border-slate-100 flex items-center h-24 lg:h-28">
            <div className="mx-auto max-w-7xl w-full px-4 flex items-center justify-between gap-4">
              <Link
                to={localizePathname('/', language)}
                className="transition-transform active:scale-95"
                onClick={() => setMenuOpen(false)}
              >
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
                  className="text-[#173f68] hover:bg-blue-50 font-bold border border-[#173f68]/10 text-xs md:text-sm rounded-lg md:rounded-xl px-2.5 py-1.5 md:px-4 md:py-2 flex items-center gap-1.5 transition-all cursor-pointer min-h-[40px]"
                >
                  <Globe className="w-4 h-4 text-[#173f68]" />
                  <span className="hidden sm:inline">
                    {language === 'en' ? t('language_switch_to_ar') : t('language_switch_to_en')}
                  </span>
                  <span className="sm:hidden">{language === 'en' ? 'AR' : 'EN'}</span>
                </button>

                {/* Interaction Buttons (الدخول / الحساب / خروج) - styled with spec dimensions */}
                {!isLoggedIn ? (
                  <Link
                    to={localizePathname('/login', language)}
                    className="bg-[#173f68] text-white hover:bg-[#0b2a50] font-bold text-xs md:text-sm rounded-lg md:rounded-xl px-3 py-1.5 md:px-5 md:py-2.5 flex items-center justify-center transition-all min-h-[40px] shadow-sm"
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
                      onClick={() => void handleLogout()}
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
                  const isActive =
                    location.pathname === item.to ||
                    (item.to !== '/' && location.pathname.startsWith(item.to));
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`h-full flex items-center relative text-sm font-semibold transition-all px-1 ${
                        isActive ? 'text-[#173f68]' : 'text-slate-600 hover:text-[#173f68]'
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
                  const isActive =
                    location.pathname === item.to ||
                    (item.to !== '/' && location.pathname.startsWith(item.to));
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`h-full flex items-center relative text-[12px] font-semibold whitespace-nowrap px-2 transition-all flex-shrink-0 ${
                        isActive ? 'text-[#173f68]' : 'text-slate-500 hover:text-[#173f68]'
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
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d6ae57]" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </>
      }
      footer={
        <footer className="border-t border-white/10 bg-[#071d3a] py-10 px-4 text-center text-white">
          <div className="mx-auto max-w-7xl flex flex-col items-center justify-center gap-4">
            <Logo showText={true} className="rounded-xl bg-white px-3 py-2" />
            <p className="text-xs text-blue-100/70 font-medium">{t('footer_copy')}</p>
          </div>
        </footer>
      }
    >
      <Container className={isHomePath ? 'max-w-none p-0' : 'px-4 py-6 sm:py-10 max-w-7xl mx-auto'}>
        {isAdminPath && isLocalAdminReadOnly && (
          <>
            <div
              className="mb-3 border border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm font-bold text-amber-900"
              role="status"
            >
              {t('local_admin_readonly_notice')}
            </div>
            <nav
              aria-label={t('local_admin_navigation_aria')}
              className="mb-5 flex min-h-12 items-center gap-1 overflow-x-auto border-y border-slate-200 bg-white px-2 py-2"
            >
              {localAdminLinks.map(([path, label]) => {
                const localizedPath = localizePathname(path, language);
                return (
                  <Link
                    key={path}
                    to={localizedPath}
                    className={`flex min-h-9 shrink-0 items-center px-3 text-xs font-bold transition-colors ${
                      location.pathname === localizedPath ||
                      (path !== '/admin/dashboard' &&
                        location.pathname.startsWith(`${localizedPath}/`))
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

// Route Groups Definition
const router = createBrowserRouter([
  {
    path: '/:locale?',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <PublicTemplateApp />,
      },
      {
        path: 'login',
        element: <PublicTemplateApp />,
      },
      {
        path: 'search',
        element: <PublicTemplateApp />,
      },
      {
        path: 'compare',
        element: <PublicTemplateApp />,
      },
      {
        path: 'scholarships',
        element: <PublicTemplateApp />,
      },
      {
        path: 'scholarships/:slug',
        element: <PublicTemplateApp />,
      },
      {
        path: 'universities',
        element: <PublicTemplateApp />,
      },
      {
        path: 'universities/:slug',
        element: <PublicTemplateApp />,
      },
      {
        path: 'majors',
        element: <PublicTemplateApp />,
      },
      {
        path: 'majors/:slug',
        element: <PublicTemplateApp />,
      },
      {
        path: 'courses',
        element: <PublicTemplateApp />,
      },
      {
        path: 'courses/:slug',
        element: <PublicTemplateApp />,
      },
      {
        path: 'articles',
        element: <PublicTemplateApp />,
      },
      {
        path: 'articles/:slug',
        element: <PublicTemplateApp />,
      },
      {
        path: 'services',
        element: <PublicTemplateApp />,
      },
      {
        path: 'services/:slug',
        element: <PublicTemplateApp />,
      },
      {
        path: 'international-tests',
        element: <PublicTemplateApp />,
      },
      {
        path: 'international-tests/:slug',
        element: <PublicTemplateApp />,
      },
      {
        path: 'tools',
        element: <PublicTemplateApp />,
      },
      {
        path: 'tools/:toolKey',
        element: <PublicTemplateApp />,
      },
      {
        path: 'certificates/verify',
        element: <PublicTemplateApp />,
      },
      {
        path: 'student',
        element: <PublicTemplateApp />,
      },
      {
        path: 'admin',
        element: <AdminAccessBridgePage />,
      },
      {
        path: 'admin/dashboard',
        element: (
          <AdminGenericPreviewPage
            titleKey="admin_dashboard"
            defaultTitle="Dashboard"
            descKey="admin_dashboard_desc"
            defaultDesc="Overview of platform operations, metrics, and quick admin actions."
            statusKey="admin_status_active"
            defaultStatus="Active"
          />
        ),
      },
      {
        path: 'admin/review-queue',
        element: <AdminReviewQueuePreviewPage />,
      },
      {
        path: 'admin/imports',
        element: <AdminImportsPreviewPage />,
      },
      {
        path: 'admin/imports/courses',
        element: <AdminCourseImportOperationsPage />,
      },
      {
        path: 'admin/imports/courses/providers/:id',
        element: <AdminCourseImportProviderPage />,
      },
      {
        path: 'admin/imports/:domainKey',
        element: <AdminDomainImportCenterPage />,
      },
      {
        path: 'study-destinations',
        element: <AdminStudyDestinationsPage />,
      },
      {
        path: 'study-destinations/:countryIso2Code',
        element: <AdminStudyDestinationDetailPage />,
      },
      {
        path: 'admin/study-destinations',
        element: <AdminStudyDestinationsPage />,
      },
      {
        path: 'admin/study-destinations/:countryIso2Code',
        element: <AdminStudyDestinationDetailPage />,
      },
      {
        path: 'admin/scholarships',
        element: <AdminScholarshipsPreviewPage />,
      },
      {
        path: 'admin/scholarships/:id',
        element: <AdminScholarshipDetailPage />,
      },
      {
        path: 'admin/universities',
        element: <AdminUniversitiesPreviewPage />,
      },
      {
        path: 'admin/universities/:id',
        element: <AdminUniversityDetailPage />,
      },
      {
        path: 'admin/academic-taxonomy',
        element: <AdminAcademicTaxonomyPage />,
      },
      {
        path: 'admin/academic-taxonomy/:nodeId',
        element: <AdminAcademicTaxonomyDetailPage />,
      },
      {
        path: 'academic-taxonomy',
        element: <AdminAcademicTaxonomyPage />,
      },
      {
        path: 'academic-taxonomy/:nodeId',
        element: <AdminAcademicTaxonomyDetailPage />,
      },
      {
        path: 'admin/majors',
        element: <AdminMajorsPreviewPage />,
      },
      {
        path: 'admin/majors/:id',
        element: <AdminMajorDetailPage />,
      },
      {
        path: 'admin/faculties',
        element: <AdminFacultiesPage />,
      },
      {
        path: 'admin/international-tests',
        element: <AdminInternationalTestsPreviewPage />,
      },
      {
        path: 'admin/international-tests/:id',
        element: <AdminInternationalTestDetailPage />,
      },
      {
        path: 'admin/courses',
        element: <AdminCoursesLandingPage />,
      },
      {
        path: 'admin/courses/native',
        element: <AdminNativeCoursesPreviewPage />,
      },
      {
        path: 'admin/courses/native/:id',
        element: <AdminNativeCourseDetailPage />,
      },
      {
        path: 'admin/courses/imported',
        element: <AdminImportedCoursesPreviewPage />,
      },
      {
        path: 'admin/courses/imported/:id',
        element: <AdminImportedCourseDetailPage />,
      },
      {
        path: 'admin/courses/paid',
        element: <AdminPaidCoursesPreviewPage />,
      },
      {
        path: 'admin/courses/paid/:id',
        element: <AdminPaidCourseDetailPage />,
      },
      {
        path: 'admin/services',
        element: <AdminServicesLandingPage />,
      },
      {
        path: 'admin/services/student',
        element: <AdminStudentServicesPreviewPage />,
      },
      {
        path: 'admin/services/student/:id',
        element: <AdminStudentServiceDetailPage />,
      },
      {
        path: 'admin/services/general',
        element: <AdminGeneralServicesPreviewPage />,
      },
      {
        path: 'admin/services/general/:id',
        element: <AdminGeneralServiceDetailPage />,
      },
      {
        path: 'admin/cms',
        element: <AdminCmsLandingPage />,
      },
      {
        path: 'admin/cms/articles',
        element: <AdminCmsArticlesPreviewPage />,
      },
      {
        path: 'admin/cms/articles/:id',
        element: <AdminCmsArticleDetailPage />,
      },
      {
        path: 'admin/cms/faqs',
        element: <AdminCmsFaqsPreviewPage />,
      },
      {
        path: 'admin/cms/faqs/:id',
        element: <AdminCmsFaqDetailPage />,
      },
      {
        path: 'admin/cms/pages',
        element: <AdminCmsPagesPreviewPage />,
      },
      {
        path: 'admin/cms/pages/:id',
        element: <AdminCmsPageDetailPage />,
      },
      {
        path: 'admin/cms/categories',
        element: <AdminCmsCategoriesPreviewPage />,
      },
      {
        path: 'admin/cms/translations',
        element: <AdminCmsTranslationsPreviewPage />,
      },
      {
        path: 'admin/cms/review',
        element: <AdminCmsReviewQueuePage />,
      },
      {
        path: 'admin/student-tools',
        element: <Navigate to="/admin" replace />,
      },
      {
        path: 'admin/student-tools/:id',
        element: <Navigate to="/admin" replace />,
      },
      {
        path: 'admin/certificates',
        element: <AdminCertificatesPreviewPage />,
      },
      {
        path: 'admin/certificates/:id',
        element: <AdminCertificateDetailPage />,
      },
      {
        path: 'admin/finance',
        element: <AdminFinancePreviewPage />,
      },
      {
        path: 'admin/finance/invoices/:id',
        element: <AdminInvoiceDetailPage />,
      },
      {
        path: 'admin/careers',
        element: <AdminCareersPreviewPage />,
      },
      {
        path: 'admin/careers/opportunities/:id',
        element: <AdminCareerOpportunityDetailPage />,
      },
      {
        path: 'admin/ai',
        element: <AdminAiGovernancePreviewPage />,
      },
      {
        path: 'admin/ai-governance',
        element: <Navigate to="/admin/ai" replace />,
      },
      {
        path: 'admin/health',
        element: <AdminHealthPreviewPage />,
      },
      {
        path: 'admin/settings',
        element: <AdminSettingsPreviewPage />,
      },
    ],
  },
]);

function AdminAccessBridgePage() {
  const { t } = useTranslation();
  const isLocalAdminReadOnly = import.meta.env.VITE_LOCAL_ADMIN_READ_ONLY === 'true';
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let active = true;
    async function checkAdminAuth() {
      try {
        const res = await CsrfClientManager.getInstance().fetchWithCsrf('/api/v1/auth/me', {
          credentials: 'include',
        });
        if (res.ok) {
          const result = await res.json();
          const perms: string[] = result.data?.effectivePermissions || [];
          const hasAdminAuthority = perms.some(
            (p) => p === '*' || p === 'admin:*' || p.startsWith('admin:'),
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
    return () => {
      active = false;
    };
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
          <p className="text-gray-600">{t('admin_access_denied_desc')}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              to="/login"
              className="px-6 py-3 bg-[#0F4B3A] text-white rounded-xl font-bold hover:bg-[#0c3e30]"
            >
              {t('admin_go_to_login')}
            </Link>
            <Link
              to="/student"
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
            >
              {t('admin_student_workspace')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const rawAdminUrl = import.meta.env.VITE_ADMIN_URL;
  const hasExternalAdminUrl =
    rawAdminUrl && rawAdminUrl !== '/admin' && rawAdminUrl.startsWith('http');

  const openAdminPortal = () => {
    if (hasExternalAdminUrl) {
      window.location.href = rawAdminUrl;
    }
  };

  if (!hasExternalAdminUrl) return <CanonicalAdminUnavailable />;

  return (
    <div className="max-w-2xl mx-auto py-12 text-center">
      <div className="bg-white border rounded-3xl p-10 shadow-sm">
        <h1 className="text-2xl font-bold mb-4">
          {t('admin_portal_access') || 'Admin Portal Access'}
        </h1>

        <div className="bg-green-50 text-green-800 p-4 rounded-xl text-sm font-medium mb-6">
          ✓ {t('demo_admin_unlocked') || 'Admin authority verified successfully via backend.'}
        </div>

        <div className="space-y-6">
          <p className="text-gray-600">
            {t('admin_portal_external') ||
              'The Admin Portal is hosted externally. Click below to proceed.'}
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
  const adminBase =
    rawAdminUrl && rawAdminUrl !== '/admin' && rawAdminUrl.startsWith('http')
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
