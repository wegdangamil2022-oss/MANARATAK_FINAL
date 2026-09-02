import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FormEvent, useEffect, useState } from 'react';
import { adminApiClient } from './api/client';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ScholarshipListPage } from './pages/ScholarshipListPage';
import { ScholarshipDetailPage } from './pages/ScholarshipCatalogDetailPage';
import { CourseListPage } from './pages/CourseListPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { CertificateAdminPage } from './pages/CertificateAdminPage';
import { CmsAdminPage } from './pages/CmsAdminPage';
import { StudentToolsAdminPage } from './pages/StudentToolsAdminPage';
import { ServicesAdminPage } from './pages/ServicesAdminPage';
import { FinanceAdminPage } from './pages/FinanceAdminPage';
import { CareerAdminPage } from './pages/CareerAdminPage';
import { InternationalTestsAdminPage } from './pages/InternationalTestsAdminPage';
import { InternationalTestDetailPage } from './pages/InternationalTestDetailPage';
import { AIGovernancePage } from './pages/AIGovernancePage';
import { AdminReviewQueuePage } from './pages/AdminReviewQueuePage';
import { AdminHealthReadinessPage } from './pages/AdminHealthReadinessPage';
import { ImportAdminPage } from './pages/ImportAdminPage';
import { ScholarshipImportCenterPage } from './pages/ScholarshipImportCenterPage';
import { UniversityAdminPage } from './pages/UniversityAdminPage';
import { MajorAdminPage } from './pages/MajorAdminPage';
import { MajorDetailPage } from './pages/MajorDetailPage';
import { SettingsAdminPage } from './pages/SettingsAdminPage';
import { StudyDestinationsAdminPage } from './pages/StudyDestinationsAdminPage';
import { StudyDestinationDetailPage } from './pages/StudyDestinationDetailPage';
import { ReferenceDataAdminPage } from './pages/ReferenceDataAdminPage';
import { AcademicTaxonomyAdminPage } from './pages/AcademicTaxonomyAdminPage';
import { AcademicTaxonomyDetailPage } from './pages/AcademicTaxonomyDetailPage';
import { AdminTranslationWorkspacePage } from './pages/AdminTranslationWorkspacePage';
import { I18nProvider, useTranslation } from './i18n/I18nProvider';

function AdminLayout() {
  const localReadOnly = import.meta.env.VITE_LOCAL_ADMIN_READ_ONLY === 'true';
  const [adminAccess, setAdminAccess] = useState<'loading' | 'authorized' | 'unauthorized'>(
    localReadOnly ? 'authorized' : 'loading',
  );
  const { t, language, setLanguage } = useTranslation();

  useEffect(() => {
    if (localReadOnly) return;
    let active = true;
    verifyAdminSession().then((authorized) => {
      if (active) setAdminAccess(authorized ? 'authorized' : 'unauthorized');
    });
    return () => {
      active = false;
    };
  }, [localReadOnly]);

  const lockAdmin = async () => {
    try {
      await adminApiClient.request('/auth/logout', { method: 'POST' });
    } finally {
      adminApiClient.clearSecuritySession();
      clearAdminSession();
      setAdminAccess('unauthorized');
    }
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <h1 className="text-xl font-bold tracking-tight">{t('admin_title')}</h1>
          {adminAccess === 'authorized' && (
            <nav className="flex flex-wrap gap-4">
              <a href="/dashboard" className="text-sm font-medium hover:text-black">{t('admin_nav_dashboard')}</a>
              <a href="/review-queue" className="text-sm font-medium hover:text-black">{t('admin_nav_review')}</a>
              <a href="/imports" className="text-sm font-medium hover:text-black">{t('admin_nav_imports')}</a>
              <a href="/imports/scholarships" className="text-sm font-medium hover:text-black">{t('admin_nav_imports')} · {t('admin_nav_scholarships')}</a>
              <a href="/health-readiness" className="text-sm font-medium hover:text-black">{t('admin_nav_health')}</a>
              <a href="/scholarships" className="text-sm font-medium hover:text-black">{t('admin_nav_scholarships')}</a>
              <a href="/universities" className="text-sm font-medium hover:text-black">{t('admin_nav_universities')}</a>
              <a href="/majors" className="text-sm font-medium hover:text-black">{t('admin_nav_majors')}</a>
              <a href="/translations" className="text-sm font-medium hover:text-black">{t('localized_payload')}</a>
              <a href="/courses" className="text-sm font-medium hover:text-black">{t('admin_nav_courses')}</a>
              <a href="/certificates" className="text-sm font-medium hover:text-black">{t('admin_nav_certificates')}</a>
              <a href="/cms" className="text-sm font-medium hover:text-black">{t('admin_nav_cms')}</a>
              <a href="/services" className="text-sm font-medium hover:text-black">{t('admin_nav_services')}</a>
              <a href="/finance" className="text-sm font-medium hover:text-black">{t('admin_nav_finance')}</a>
              <a href="/careers" className="text-sm font-medium hover:text-black">{t('admin_nav_careers')}</a>
              <a href="/international-tests" className="text-sm font-medium hover:text-black">{t('admin_nav_tests')}</a>
              <a href="/ai" className="text-sm font-medium hover:text-black">{t('admin_nav_ai')}</a>
              <a href="/student-tools" className="text-sm font-medium hover:text-black">{t('admin_nav_tools')}</a>
              <a href="/study-destinations" className="text-sm font-medium hover:text-black">{t('admin_nav_study_destinations')}</a>
              <a href="/settings" className="text-sm font-medium hover:text-black">{t('admin_nav_settings')}</a>
              <a href="/academic-taxonomy" className="text-sm font-medium hover:text-black">{t('admin_nav_academic_taxonomy')}</a>
              <button onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')} className="text-sm font-medium text-blue-600 hover:text-blue-800">{t('admin_lang_switch')}</button>
              <button onClick={() => void lockAdmin()} className="text-sm font-medium text-red-600 hover:text-red-800">{t('lock')}</button>
            </nav>
          )}
        </header>
        {localReadOnly && (
          <div className="border-b border-amber-300 bg-amber-50 px-6 py-3 text-center text-sm font-semibold text-amber-900">
            {t('admin_local_readonly_notice')}
          </div>
        )}
        <main className="flex-1 p-6">
          {adminAccess === 'loading' ? (
            <div className="mx-auto mt-16 max-w-xl text-center text-sm text-gray-600">{t('loading')}</div>
          ) : adminAccess === 'unauthorized' ? (
            <AdminAccessGate onUnlock={() => setAdminAccess('authorized')} />
          ) : (
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<AdminDashboardPage />} />
              <Route path="/review-queue" element={<AdminReviewQueuePage />} />
              <Route path="/imports" element={<ImportAdminPage />} />
              <Route path="/imports/scholarships" element={<ScholarshipImportCenterPage />} />
              <Route path="/health-readiness" element={<AdminHealthReadinessPage />} />
              <Route path="/scholarships" element={<ScholarshipListPage />} />
              <Route path="/scholarships/:id" element={<ScholarshipDetailPage />} />
              <Route path="/admin/scholarships" element={<ScholarshipListPage />} />
              <Route path="/admin/scholarships/:id" element={<ScholarshipDetailPage />} />
              <Route path="/universities" element={<UniversityAdminPage />} />
              <Route path="/majors" element={<MajorAdminPage />} />
              <Route path="/majors/:id" element={<MajorDetailPage />} />
              <Route path="/translations" element={<AdminTranslationWorkspacePage />} />
              <Route path="/courses" element={<CourseListPage />} />
              <Route path="/courses/:id" element={<CourseDetailPage />} />
              <Route path="/certificates" element={<CertificateAdminPage />} />
              <Route path="/cms" element={<CmsAdminPage />} />
              <Route path="/services" element={<ServicesAdminPage />} />
              <Route path="/finance" element={<FinanceAdminPage />} />
              <Route path="/careers" element={<CareerAdminPage />} />
              <Route path="/international-tests" element={<InternationalTestsAdminPage />} />
              <Route path="/international-tests/:id" element={<InternationalTestDetailPage />} />
              <Route path="/admin/international-tests" element={<InternationalTestsAdminPage />} />
              <Route path="/admin/international-tests/:id" element={<InternationalTestDetailPage />} />
              <Route path="/ai" element={<AIGovernancePage />} />
              <Route path="/ai/:section" element={<AIGovernancePage />} />
              <Route path="/ai-governance" element={<Navigate to="/ai" replace />} />
              <Route path="/student-tools" element={<StudentToolsAdminPage />} />
              <Route path="/student-tools/:toolKey" element={<StudentToolsAdminPage />} />
              <Route path="/study-destinations" element={<StudyDestinationsAdminPage />} />
              <Route path="/study-destinations/:countryIso2Code" element={<StudyDestinationDetailPage />} />
              <Route path="/settings" element={<SettingsAdminPage />} />
              <Route path="/settings/reference-data" element={<ReferenceDataAdminPage />} />
              <Route path="/academic-taxonomy" element={<AcademicTaxonomyAdminPage />} />
              <Route path="/academic-taxonomy/:nodeId" element={<AcademicTaxonomyDetailPage />} />
            </Routes>
          )}
        </main>
      </div>
    </BrowserRouter>
  );
}

function AdminAccessGate({ onUnlock }: { onUnlock: () => void }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError(t('admin_login_missing_credentials'));
      return;
    }

    setLoading(true);
    try {
      const response = await adminApiClient.request<{
        data?: { authenticated?: boolean };
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!response.data?.authenticated) throw new Error('Authentication did not establish a session.');

      if (!(await verifyAdminSession())) {
        clearAdminSession();
        setError(t('admin_login_no_permission'));
        return;
      }
      onUnlock();
    } catch {
      clearAdminSession();
      setError(t('admin_login_verification_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-16 bg-white border rounded-3xl shadow-sm overflow-hidden">
      <div className="bg-slate-900 text-white p-8">
        <p className="text-sm uppercase tracking-wide text-indigo-200 mb-2">{t('admin_login_access_label')}</p>
        <h2 className="text-3xl font-bold mb-3">{t('admin_login_portal_title')}</h2>
        <p className="text-slate-200">{t('admin_login_portal_desc')}</p>
      </div>
      <form onSubmit={submit} className="p-8 space-y-4">
        <label className="block text-sm font-medium" htmlFor="admin-email">{t('admin_login_email')}</label>
        <input
          id="admin-email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          autoComplete="username"
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
        />
        <label className="block text-sm font-medium" htmlFor="admin-password">{t('admin_login_password')}</label>
        <input
          id="admin-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          autoComplete="current-password"
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
        />
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}
        <button disabled={loading} type="submit" className="w-full bg-black text-white rounded-lg px-4 py-2 font-medium hover:bg-gray-800 disabled:opacity-60">
          {loading ? t('admin_login_verifying') : t('admin_login_submit')}
        </button>
      </form>
    </div>
  );
}

function clearAdminSession() {
  localStorage.removeItem('manaratak_admin_access');
  localStorage.removeItem('manaratak_admin_bearer');
  localStorage.removeItem('manaratak_admin_bearer_token');
}

async function verifyAdminSession(): Promise<boolean> {
  try {
    const response = await adminApiClient.request<{
      data?: { effectivePermissions?: string[] };
    }>('/auth/me');
    return (response.data?.effectivePermissions || []).some(
      (permission) =>
        permission === '*' ||
        permission === 'admin:*' ||
        permission.startsWith('admin:'),
    );
  } catch {
    clearAdminSession();
    return false;
  }
}

export default function App() {
  return (
    <I18nProvider>
      <AdminLayout />
    </I18nProvider>
  );
}
