import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApiClient } from '../api/client';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { useTranslation } from "../i18n/I18nProvider";

interface ReviewItem {
  id: string;
  title: string;
  domain: string;
  href: string;
  status?: string | null;
  completenessStatus?: string | null;
  reason: string;
  updatedAt?: string | null;
}

const sources = [
  { domain: 'Scholarships', endpoint: '/admin/scholarships?page=1&pageSize=20', href: (item: any) => `/scholarships/${item.id}` },
  { domain: 'Courses', endpoint: '/admin/courses?page=1&pageSize=20', href: (item: any) => `/courses/${item.id}` },
  { domain: 'Services', endpoint: '/admin/services?page=1&pageSize=20', href: () => '/services' },
  { domain: 'Careers', endpoint: '/admin/careers/jobs?page=1&pageSize=20', href: () => '/careers' },
  { domain: 'International Tests', endpoint: '/admin/international-tests?page=1&pageSize=20', href: () => '/international-tests' },
  { domain: 'AI Governance', endpoint: '/ai/logs?page=1&pageSize=20', href: () => '/ai-governance' }
];

export function AdminReviewQueuePage() {
    const { t } = useTranslation();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.all(sources.map(async (source) => {
        try {
          const response = await adminApiClient.request<{ data: any[] }>(source.endpoint);
          return (response.data || [])
            .map((record) => toReviewItem(source.domain, source.href(record), record))
            .filter((item): item is ReviewItem => Boolean(item));
        } catch {
          return [];
        }
      }));
      setItems(results.flat().sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''))));
    } catch (err: any) {
      setError(err.message || 'Unable to load review queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t('unified_review_queue')}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('one_place_for_incomplete_imports_publish_ready_ite')}</p>
        </div>
        <button onClick={loadQueue} disabled={loading} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> {t('refresh')}</button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-gray-500">{t('no_review_items_found_in_the_current_first_page_sn')}</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">{t('item')}</th>
                <th className="px-6 py-3">{t('domain')}</th>
                <th className="px-6 py-3">{t('signal')}</th>
                <th className="px-6 py-3">{t('status')}</th>
                <th className="px-6 py-3">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={`${item.domain}-${item.id}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{item.title}</div>
                    <div className="text-xs text-gray-500">{item.updatedAt ? formatDate(item.updatedAt) : 'No update timestamp'}</div>
                  </td>
                  <td className="px-6 py-4">{item.domain}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-full text-xs font-medium">
                      <AlertTriangle className="h-3 w-3" /> {item.reason}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{[item.status, item.completenessStatus].filter(Boolean).join(' / ') || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <Link to={item.href} className="text-blue-600 hover:underline">{t('open')}</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function toReviewItem(domain: string, href: string, record: any): ReviewItem | null {
  const status = String(record.status || record.visibilityStatus || '').toUpperCase();
  const completenessStatus = String(record.completenessStatus || '').toUpperCase();
  const safetyDecision = String(record.safetyDecision || '').toUpperCase();
  let reason = '';

  if (completenessStatus === 'INCOMPLETE' || completenessStatus === 'NEEDS_REVIEW') reason = formatLabel(completenessStatus);
  else if (status.includes('READY_TO_PUBLISH')) reason = 'Ready To Publish';
  else if (status.includes('REVIEW')) reason = formatLabel(status);
  else if (status.includes('FAILED')) reason = 'Failed';
  else if (safetyDecision === 'BLOCKED' || safetyDecision === 'REDACTED') reason = `AI ${formatLabel(safetyDecision)}`;

  if (!reason) return null;

  return {
    id: record.id || record.publicId || record.toolKey,
    title: record.displayName || record.title || record.publicId || record.toolKey || 'Review item',
    domain,
    href,
    status: record.status || record.visibilityStatus || null,
    completenessStatus: record.completenessStatus || null,
    reason,
    updatedAt: record.updatedAt || record.createdAt || null
  };
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function formatLabel(value: string) {
  return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}
