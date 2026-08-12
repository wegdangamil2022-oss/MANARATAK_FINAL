import { useEffect, useMemo, useState } from 'react';
import { adminApiClient } from '../api/client';
import { Bot, Filter, Loader2, RefreshCw, ShieldAlert, ShieldCheck, Sparkles } from 'lucide-react';
import { useTranslation } from "../i18n/I18nProvider";

type AIExecutionStatus = 'ACCEPTED' | 'BLOCKED' | 'COMPLETED' | 'FAILED';
type AISafetyDecision = 'ALLOWED' | 'BLOCKED' | 'REDACTED';
type AIRequestPurpose = 'TOOL_ASSISTANCE' | 'IMPORT_CLASSIFICATION' | 'CONTENT_DRAFT' | 'RECOMMENDATION' | 'TRANSLATION' | 'SUMMARIZATION';

interface AIExecutionLog {
  id: string;
  publicId: string;
  purpose: AIRequestPurpose;
  promptKey: string;
  providerType: string;
  modelReference: string;
  status: AIExecutionStatus;
  safetyDecision: AISafetyDecision;
  requesterReferenceId?: string | null;
  sourceDomain?: string | null;
  inputPreview: string;
  outputPreview?: string | null;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  errorMessage?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

interface AIExecutionLogResponse {
  data: AIExecutionLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const purposes: AIRequestPurpose[] = ['TOOL_ASSISTANCE', 'IMPORT_CLASSIFICATION', 'CONTENT_DRAFT', 'RECOMMENDATION', 'TRANSLATION', 'SUMMARIZATION'];
const statuses: AIExecutionStatus[] = ['COMPLETED', 'BLOCKED', 'FAILED', 'ACCEPTED'];

export function AIGovernancePage() {
    const { t } = useTranslation();
  const [logs, setLogs] = useState<AIExecutionLogResponse | null>(null);
  const [selectedLog, setSelectedLog] = useState<AIExecutionLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [purposeFilter, setPurposeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: '1', pageSize: '30' });
      if (purposeFilter) params.append('purpose', purposeFilter);
      if (statusFilter) params.append('status', statusFilter);
      const response = await adminApiClient.request<AIExecutionLogResponse>(`/ai/logs?${params.toString()}`);
      setLogs(response);
      if (selectedLog) {
        setSelectedLog(response.data.find((log) => log.publicId === selectedLog.publicId) || null);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load AI execution logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [purposeFilter, statusFilter]);

  const summary = useMemo(() => {
    const data = logs?.data || [];
    return {
      total: logs?.total || 0,
      blocked: data.filter((log) => log.safetyDecision === 'BLOCKED').length,
      redacted: data.filter((log) => log.safetyDecision === 'REDACTED').length,
      tokens: data.reduce((sum, log) => sum + log.estimatedInputTokens + log.estimatedOutputTokens, 0)
    };
  }, [logs]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t('ai_governance')}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('monitor_governed_ai_execution_logs_safety_decision')}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <select value={purposeFilter} onChange={(event) => setPurposeFilter(event.target.value)} className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-black">
              <option value="">{t('all_purposes')}</option>
              {purposes.map((purpose) => <option key={purpose} value={purpose}>{formatLabel(purpose)}</option>)}
            </select>
            <Filter className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-black">
              <option value="">{t('all_statuses')}</option>
              {statuses.map((status) => <option key={status} value={status}>{formatLabel(status)}</option>)}
            </select>
            <Filter className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <button onClick={loadLogs} disabled={loading} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> {t('refresh')}</button>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-xl p-4 text-sm">
        {t('external_ai_providers_remain_disabled_current_exec')}</div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard label={t('total_logs')} value={summary.total.toString()} icon={<Bot className="h-5 w-5" />} />
        <SummaryCard label={t('blocked')} value={summary.blocked.toString()} icon={<ShieldAlert className="h-5 w-5" />} />
        <SummaryCard label={t('redacted')} value={summary.redacted.toString()} icon={<ShieldCheck className="h-5 w-5" />} />
        <SummaryCard label={t('estimated_tokens')} value={summary.tokens.toString()} icon={<Sparkles className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {loading && !logs ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : !logs || logs.data.length === 0 ? (
            <div className="p-12 text-center text-gray-500">{t('no_ai_execution_logs_found')}</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">{t('execution')}</th>
                  <th className="px-6 py-3">{t('purpose')}</th>
                  <th className="px-6 py-3">{t('safety')}</th>
                  <th className="px-6 py-3">{t('provider')}</th>
                  <th className="px-6 py-3">{t('tokens')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.data.map((log) => (
                  <tr key={log.publicId} className={`hover:bg-gray-50 ${selectedLog?.publicId === log.publicId ? 'bg-blue-50/50' : ''}`}>
                    <td className="px-6 py-4">
                      <button onClick={() => setSelectedLog(log)} className="font-semibold text-gray-900 hover:text-blue-700 text-left">{log.publicId}</button>
                      <div className="text-xs text-gray-500">{formatDate(log.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{formatLabel(log.purpose)}</div>
                      <div className="text-xs text-gray-500">{log.promptKey}</div>
                    </td>
                    <td className="px-6 py-4"><SafetyBadge decision={log.safetyDecision} /></td>
                    <td className="px-6 py-4">
                      <div>{formatLabel(log.providerType)}</div>
                      <div className="text-xs text-gray-500">{log.modelReference}</div>
                    </td>
                    <td className="px-6 py-4">{log.estimatedInputTokens + log.estimatedOutputTokens}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <aside className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 h-fit">
          <h3 className="text-lg font-bold mb-4">{t('execution_details')}</h3>
          {!selectedLog ? (
            <p className="text-sm text-gray-500">{t('select_an_execution_log_to_inspect_source_domain_i')}</p>
          ) : (
            <div className="space-y-5 text-sm">
              <dl className="space-y-3">
                <DetailRow label={t('status')} value={formatLabel(selectedLog.status)} />
                <DetailRow label={t('source_domain')} value={selectedLog.sourceDomain || 'Not specified'} />
                <DetailRow label={t('requester')} value={selectedLog.requesterReferenceId || 'Anonymous/unknown'} />
                <DetailRow label={t('input_tokens')} value={selectedLog.estimatedInputTokens.toString()} />
                <DetailRow label={t('output_tokens')} value={selectedLog.estimatedOutputTokens.toString()} />
              </dl>

              <PreviewBlock title={t('input_preview')} value={selectedLog.inputPreview} />
              <PreviewBlock title={t('output_preview')} value={selectedLog.outputPreview || 'No output preview.'} />
              {selectedLog.errorMessage && <PreviewBlock title={t('error_block_reason')} value={selectedLog.errorMessage} tone="danger" />}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex items-center gap-4">
      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">{icon}</div>
      <div>
        <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
    </div>
  );
}

function SafetyBadge({ decision }: { decision: AISafetyDecision }) {
  const className = decision === 'ALLOWED' ? 'bg-green-100 text-green-700' : decision === 'REDACTED' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>{formatLabel(decision)}</span>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900 break-words">{value}</dd>
    </div>
  );
}

function PreviewBlock({ title, value, tone = 'default' }: { title: string; value: string; tone?: 'default' | 'danger' }) {
  return (
    <div>
      <h4 className="font-semibold mb-2">{title}</h4>
      <div className={`rounded-lg border p-3 text-xs whitespace-pre-wrap break-words ${tone === 'danger' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>{value}</div>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function formatLabel(value: string) {
  return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}
