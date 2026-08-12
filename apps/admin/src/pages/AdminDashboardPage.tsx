import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApiClient } from '../api/client';
import { AlertTriangle, Bot, BriefcaseBusiness, Globe, GraduationCap, Loader2, Newspaper, Settings2, Sparkles, TestTube2, WalletCards, Network } from 'lucide-react';
import { useTranslation } from "../i18n/I18nProvider";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

import { ar } from '../i18n/ar';

type AdminTranslationKey = keyof typeof ar;

interface AdminSummary {
  key: string;
  labelKey: AdminTranslationKey;
  href: string;
  total: number;
  reviewCount: number;
  status: 'ready' | 'attention' | 'unavailable';
  icon: React.ReactNode;
}

const summarySources: Array<{
  key: string;
  labelKey: AdminTranslationKey;
  href: string;
  endpoint: string;
  icon: React.ReactNode;
}> = [
  { key: 'study-destinations', labelKey: 'admin_nav_study_destinations', href: '/study-destinations', endpoint: '/reference-data/countries', icon: <Globe className="h-5 w-5" /> },
  { key: 'academic-taxonomy', labelKey: 'admin_nav_academic_taxonomy', href: '/academic-taxonomy', endpoint: '/academic-taxonomy/nodes', icon: <Network className="h-5 w-5" /> },
  { key: 'scholarships', labelKey: 'admin_nav_scholarships', href: '/scholarships', endpoint: '/admin/scholarships?page=1&pageSize=10', icon: <GraduationCap className="h-5 w-5" /> },
  { key: 'courses', labelKey: 'admin_nav_courses', href: '/courses', endpoint: '/admin/courses?page=1&pageSize=10', icon: <Sparkles className="h-5 w-5" /> },
  { key: 'services', labelKey: 'admin_nav_services', href: '/services', endpoint: '/admin/services?page=1&pageSize=10', icon: <Settings2 className="h-5 w-5" /> },
  { key: 'finance', labelKey: 'admin_nav_finance', href: '/finance', endpoint: '/admin/finance/invoices?page=1&pageSize=10', icon: <WalletCards className="h-5 w-5" /> },
  { key: 'careers', labelKey: 'admin_nav_careers', href: '/careers', endpoint: '/admin/careers/jobs?page=1&pageSize=10', icon: <BriefcaseBusiness className="h-5 w-5" /> },
  { key: 'tests', labelKey: 'admin_nav_tests', href: '/international-tests', endpoint: '/admin/international-tests?page=1&pageSize=10', icon: <TestTube2 className="h-5 w-5" /> },
  { key: 'cms', labelKey: 'admin_nav_cms', href: '/cms', endpoint: '/admin/cms/content?page=1&pageSize=10', icon: <Newspaper className="h-5 w-5" /> },
  { key: 'ai', labelKey: 'admin_nav_ai', href: '/ai-governance', endpoint: '/ai/logs?page=1&pageSize=10', icon: <Bot className="h-5 w-5" /> }
];

export function AdminDashboardPage() {
    const { t } = useTranslation();
  const [summaries, setSummaries] = useState<AdminSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all(summarySources.map(async (source) => {
      try {
        const response = await adminApiClient.request<PaginatedResponse<any>>(source.endpoint);
        const reviewCount = countReviewItems(response.data || []);
        return {
          key: source.key,
          labelKey: source.labelKey,
          href: source.href,
          total: response.total ?? response.data?.length ?? 0,
          reviewCount,
          status: reviewCount > 0 ? 'attention' : 'ready',
          icon: source.icon
        } satisfies AdminSummary;
      } catch {
        return {
          key: source.key,
          labelKey: source.labelKey,
          href: source.href,
          total: 0,
          reviewCount: 0,
          status: 'unavailable',
          icon: source.icon
        } satisfies AdminSummary;
      }
    })).then((result) => {
      if (active) setSummaries(result);
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const attentionTotal = useMemo(() => summaries.reduce((sum, item) => sum + item.reviewCount, 0), [summaries]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white rounded-3xl p-8 md:p-10 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-indigo-200 mb-2">{t('enterprise_administration_portal')}</p>
            <h2 className="text-3xl font-bold mb-3">{t('manaratak_control_center')}</h2>
            <p className="text-slate-200 max-w-3xl">
              {t('review_operational_queues_publishing_readiness_dom')}</p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-2xl p-5 min-w-56">
            <div className="text-sm text-indigo-100">{t('items_needing_attention')}</div>
            <div className="text-4xl font-bold mt-2">{attentionTotal}</div>
          </div>
        </div>
      </section>

      <section className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-5 flex gap-3">
        <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <div className="font-semibold mb-1">{t('admin_access_reminder')}</div>
          <p>{t('public_login_and_protected_admin_access_are_not_co')}</p>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {summaries.map((summary) => (
            <Link key={summary.key} to={summary.href} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-5">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">{summary.icon}</div>
                <StatusPill status={summary.status} />
              </div>
              <h3 className="font-bold text-lg mb-1">{t(summary.labelKey)}</h3>
              <div className="text-sm text-gray-500 mb-4">{t('total_records')}{summary.total}</div>
              <div className="text-sm">
                <span className={summary.reviewCount > 0 ? 'text-amber-700 font-semibold' : 'text-emerald-700 font-semibold'}>
                  {summary.reviewCount} {t('review_signals')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <QuickLink title={t('content_catalog')} links={[
          [t('admin_nav_study_destinations'), '/study-destinations'],
          [t('admin_nav_academic_taxonomy'), '/academic-taxonomy'],
          [t('admin_nav_scholarships'), '/scholarships'],
          [t('admin_nav_courses'), '/courses'],
          [t('admin_nav_cms'), '/cms'],
          [t('admin_nav_tests'), '/international-tests']
        ]} />
        <QuickLink title={t('operations')} links={[
          [t('admin_nav_services'), '/services'],
          [t('admin_nav_finance'), '/finance'],
          [t('admin_nav_careers'), '/careers'],
          [t('admin_nav_certificates'), '/certificates']
        ]} />
        <QuickLink title={t('governance')} links={[
          [t('admin_nav_tools'), '/student-tools'],
          [t('admin_nav_ai'), '/ai-governance']
        ]} />
      </section>
    </div>
  );
}

function StatusPill({ status }: { status: AdminSummary['status'] }) {
  const { t } = useTranslation();
  const label = status === 'attention' ? (t('needs_review') || 'Needs Review') : status === 'ready' ? (t('ready') || 'Ready') : (t('unavailable') || 'Unavailable');
  const className = status === 'attention' ? 'bg-amber-100 text-amber-700' : status === 'ready' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500';
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${className}`}>{label}</span>;
}

function QuickLink({ title, links }: { title: string; links: Array<[string, string]> }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <h3 className="font-bold mb-4">{title}</h3>
      <div className="grid grid-cols-1 gap-2">
        {links.map(([label, href]) => (
          <Link key={href} to={href} className="text-sm border rounded-lg px-3 py-2 hover:bg-gray-50">{label}</Link>
        ))}
      </div>
    </div>
  );
}

function countReviewItems(records: any[]) {
  return records.filter((record) => {
    const status = String(record.status || record.visibilityStatus || '').toUpperCase();
    const completeness = String(record.completenessStatus || '').toUpperCase();
    const safety = String(record.safetyDecision || '').toUpperCase();
    return status.includes('REVIEW') || status.includes('READY_TO_PUBLISH') || status.includes('FAILED') || completeness.includes('INCOMPLETE') || completeness.includes('NEEDS_REVIEW') || safety === 'BLOCKED' || safety === 'REDACTED';
  }).length;
}
