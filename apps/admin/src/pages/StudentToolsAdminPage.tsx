import { ChangeEvent, useEffect, useState } from 'react';
import { adminApiClient } from '../api/client';
import { Bot, CheckCircle2, Filter, Loader2, RefreshCw, Save, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from "../i18n/I18nProvider";

type ToolVisibilityStatus = 'ACTIVE' | 'COMING_SOON' | 'UNDER_DEVELOPMENT' | 'HIDDEN_ADMIN_ONLY' | 'DISABLED' | 'RETIRED';
type ToolImplementationPriority = 'P1_CORE_LAUNCH' | 'P2_EXPANSION' | 'P3_LATER';
type ToolExecutionType = 'STATIC_FORM' | 'DETERMINISTIC_CALCULATOR' | 'DOCUMENT_GENERATOR' | 'AI_ASSISTED' | 'EXTERNAL_LINK';
type ToolAiDependencyLevel = 'NONE' | 'OPTIONAL' | 'REQUIRED_LOW_COST' | 'REQUIRED_HIGH_COST';

interface StudentToolRegistryEntry {
  id: string;
  toolKey: string;
  displayName: string;
  description?: string | null;
  category: string;
  executionType: ToolExecutionType;
  visibilityStatus: ToolVisibilityStatus;
  implementationPriority: ToolImplementationPriority;
  aiDependencyLevel: ToolAiDependencyLevel;
  publicEnabled: boolean;
  anonymousEnabled: boolean;
  authenticatedEnabled: boolean;
  adminOnly: boolean;
  launchOrder: number;
  dependencyMetadata?: Record<string, unknown> | null;
  costRiskMetadata?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  updatedAt: string;
}

interface StudentToolsResponse {
  data: StudentToolRegistryEntry[];
}

const visibilityOptions: ToolVisibilityStatus[] = ['ACTIVE', 'COMING_SOON', 'UNDER_DEVELOPMENT', 'HIDDEN_ADMIN_ONLY', 'DISABLED', 'RETIRED'];
const priorityOptions: ToolImplementationPriority[] = ['P1_CORE_LAUNCH', 'P2_EXPANSION', 'P3_LATER'];
const executionOptions: ToolExecutionType[] = ['STATIC_FORM', 'DETERMINISTIC_CALCULATOR', 'DOCUMENT_GENERATOR', 'AI_ASSISTED', 'EXTERNAL_LINK'];
const aiOptions: ToolAiDependencyLevel[] = ['NONE', 'OPTIONAL', 'REQUIRED_LOW_COST', 'REQUIRED_HIGH_COST'];

export function StudentToolsAdminPage() {
    const { t } = useTranslation();
  const [tools, setTools] = useState<StudentToolRegistryEntry[]>([]);
  const [drafts, setDrafts] = useState<Record<string, StudentToolRegistryEntry>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [visibilityFilter, setVisibilityFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadTools = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (visibilityFilter) params.append('visibilityStatus', visibilityFilter);
      if (priorityFilter) params.append('implementationPriority', priorityFilter);
      if (categoryFilter.trim()) params.append('category', categoryFilter.trim());
      const suffix = params.toString() ? `?${params.toString()}` : '';
      const response = await adminApiClient.request<StudentToolsResponse>(`/admin/student-tools${suffix}`);
      setTools(response.data);
      setDrafts(Object.fromEntries(response.data.map((tool) => [tool.toolKey, tool])));
    } catch (err: any) {
      setError(err.message || 'Unable to load student tools.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTools();
  }, [visibilityFilter, priorityFilter]);

  const seedTools = async () => {
    setSavingKey('seed');
    setMessage(null);
    setError(null);
    try {
      const response = await adminApiClient.request<StudentToolsResponse>('/admin/student-tools/seed', { method: 'POST' });
      setMessage(`Official tool registry seeded with ${response.data.length} tools.`);
      await loadTools();
    } catch (err: any) {
      setError(err.message || 'Unable to seed official tools.');
    } finally {
      setSavingKey(null);
    }
  };

  const saveTool = async (toolKey: string) => {
    const draft = drafts[toolKey];
    if (!draft) return;
    setSavingKey(toolKey);
    setMessage(null);
    setError(null);
    try {
      const updated = await adminApiClient.request<StudentToolRegistryEntry>(`/admin/student-tools/${encodeURIComponent(toolKey)}`, {
        method: 'PUT',
        body: JSON.stringify({
          displayName: draft.displayName.trim(),
          description: draft.description?.trim() || null,
          category: draft.category.trim(),
          executionType: draft.executionType,
          visibilityStatus: draft.visibilityStatus,
          implementationPriority: draft.implementationPriority,
          aiDependencyLevel: draft.aiDependencyLevel,
          publicEnabled: draft.publicEnabled,
          anonymousEnabled: draft.anonymousEnabled,
          authenticatedEnabled: draft.authenticatedEnabled,
          adminOnly: draft.adminOnly,
          launchOrder: Number(draft.launchOrder) || 0,
          dependencyMetadata: draft.dependencyMetadata || null,
          costRiskMetadata: draft.costRiskMetadata || null,
          metadata: draft.metadata || null
        })
      });
      setMessage(`Saved tool: ${updated.displayName}`);
      setTools((current) => current.map((tool) => tool.toolKey === toolKey ? updated : tool));
      setDrafts((current) => ({ ...current, [toolKey]: updated }));
    } catch (err: any) {
      setError(err.message || 'Unable to save tool.');
    } finally {
      setSavingKey(null);
    }
  };

  const updateDraft = <K extends keyof StudentToolRegistryEntry>(toolKey: string, key: K, value: StudentToolRegistryEntry[K]) => {
    setDrafts((current) => ({
      ...current,
      [toolKey]: {
        ...current[toolKey],
        [key]: value
      }
    }));
  };

  const handleCategoryFilter = (event: ChangeEvent<HTMLInputElement>) => {
    setCategoryFilter(event.target.value);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t('student_tools')}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('manage_tool_visibility_launch_priority_access_rule')}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <select value={visibilityFilter} onChange={(event) => setVisibilityFilter(event.target.value)} className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-black">
              <option value="">{t('all_statuses')}</option>
              {visibilityOptions.map((status) => <option key={status} value={status}>{formatLabel(status)}</option>)}
            </select>
            <Filter className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-black">
              <option value="">{t('all_priorities')}</option>
              {priorityOptions.map((priority) => <option key={priority} value={priority}>{formatLabel(priority)}</option>)}
            </select>
            <Filter className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <input value={categoryFilter} onChange={handleCategoryFilter} onBlur={loadTools} placeholder={t('category')} className="bg-white border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-black" />

          <button onClick={loadTools} disabled={loading} className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> {t('refresh')}</button>
          <button onClick={seedTools} disabled={savingKey === 'seed'} className="inline-flex items-center gap-2 px-3 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
            {savingKey === 'seed' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} {t('seed_official_tools')}</button>
        </div>
      </div>

      {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{message}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard label={t('total_tools')} value={tools.length.toString()} icon={<SlidersHorizontal className="h-5 w-5" />} />
        <SummaryCard label={t('active_public')} value={tools.filter((tool) => tool.visibilityStatus === 'ACTIVE' && tool.publicEnabled).length.toString()} icon={<ShieldCheck className="h-5 w-5" />} />
        <SummaryCard label={t('ai_assisted')} value={tools.filter((tool) => tool.aiDependencyLevel !== 'NONE').length.toString()} icon={<Bot className="h-5 w-5" />} />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {loading && !tools.length ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3 font-medium min-w-[260px]">{t('tool')}</th>
                  <th className="px-5 py-3 font-medium min-w-[190px]">{t('status')}</th>
                  <th className="px-5 py-3 font-medium min-w-[180px]">{t('priority')}</th>
                  <th className="px-5 py-3 font-medium min-w-[190px]">{t('execution')}</th>
                  <th className="px-5 py-3 font-medium min-w-[190px]">{t('ai_dependency')}</th>
                  <th className="px-5 py-3 font-medium min-w-[190px]">{t('access')}</th>
                  <th className="px-5 py-3 font-medium min-w-[120px]">{t('order')}</th>
                  <th className="px-5 py-3 font-medium text-right">{t('action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {tools.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">{t('no_student_tools_found_seed_the_official_registry_')}</td>
                  </tr>
                ) : tools.map((tool) => {
                  const draft = drafts[tool.toolKey] || tool;
                  return (
                    <tr key={tool.toolKey} className="hover:bg-gray-50 align-top">
                      <td className="px-5 py-4">
                        <input value={draft.displayName} onChange={(event) => updateDraft(tool.toolKey, 'displayName', event.target.value)} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm font-medium" />
                        <div className="text-xs text-gray-500 mt-1">{tool.toolKey}</div>
                        <input value={draft.category} onChange={(event) => updateDraft(tool.toolKey, 'category', event.target.value)} className="mt-2 w-full border border-gray-300 rounded px-3 py-1.5 text-xs" />
                        <textarea value={draft.description || ''} onChange={(event) => updateDraft(tool.toolKey, 'description', event.target.value)} rows={2} className="mt-2 w-full border border-gray-300 rounded px-3 py-1.5 text-xs resize-none" />
                      </td>
                      <td className="px-5 py-4">
                        <select value={draft.visibilityStatus} onChange={(event) => updateDraft(tool.toolKey, 'visibilityStatus', event.target.value as ToolVisibilityStatus)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs">
                          {visibilityOptions.map((status) => <option key={status} value={status}>{formatLabel(status)}</option>)}
                        </select>
                        <StatusBadge status={draft.visibilityStatus} />
                      </td>
                      <td className="px-5 py-4">
                        <select value={draft.implementationPriority} onChange={(event) => updateDraft(tool.toolKey, 'implementationPriority', event.target.value as ToolImplementationPriority)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs">
                          {priorityOptions.map((priority) => <option key={priority} value={priority}>{formatLabel(priority)}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <select value={draft.executionType} onChange={(event) => updateDraft(tool.toolKey, 'executionType', event.target.value as ToolExecutionType)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs">
                          {executionOptions.map((executionType) => <option key={executionType} value={executionType}>{formatLabel(executionType)}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <select value={draft.aiDependencyLevel} onChange={(event) => updateDraft(tool.toolKey, 'aiDependencyLevel', event.target.value as ToolAiDependencyLevel)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs">
                          {aiOptions.map((level) => <option key={level} value={level}>{formatLabel(level)}</option>)}
                        </select>
                        {draft.aiDependencyLevel !== 'NONE' && (
                          <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">{t('phase_17_governed')}</div>
                        )}
                      </td>
                      <td className="px-5 py-4 space-y-2">
                        <Toggle label={t('public')} checked={draft.publicEnabled} onChange={(value) => updateDraft(tool.toolKey, 'publicEnabled', value)} />
                        <Toggle label={t('anonymous')} checked={draft.anonymousEnabled} onChange={(value) => updateDraft(tool.toolKey, 'anonymousEnabled', value)} />
                        <Toggle label={t('signed_in')} checked={draft.authenticatedEnabled} onChange={(value) => updateDraft(tool.toolKey, 'authenticatedEnabled', value)} />
                        <Toggle label={t('admin_only')} checked={draft.adminOnly} onChange={(value) => updateDraft(tool.toolKey, 'adminOnly', value)} />
                      </td>
                      <td className="px-5 py-4">
                        <input type="number" value={draft.launchOrder} onChange={(event) => updateDraft(tool.toolKey, 'launchOrder', Number(event.target.value))} className="w-24 border border-gray-300 rounded px-2 py-1.5 text-sm" />
                        <div className="text-xs text-gray-500 mt-2">{formatDate(tool.updatedAt)}</div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button onClick={() => saveTool(tool.toolKey)} disabled={savingKey === tool.toolKey} className="inline-flex items-center gap-2 px-3 py-2 bg-black text-white rounded-md text-xs font-medium hover:bg-gray-800 disabled:opacity-50">
                          {savingKey === tool.toolKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {t('save')}</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-2xl font-bold mt-1">{value}</div>
      </div>
      <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-700">{icon}</div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 text-xs text-gray-700">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" />
    </label>
  );
}

function StatusBadge({ status }: { status: ToolVisibilityStatus }) {
  const tone = status === 'ACTIVE'
    ? 'bg-green-100 text-green-800'
    : status === 'COMING_SOON'
      ? 'bg-blue-100 text-blue-800'
      : status === 'UNDER_DEVELOPMENT'
        ? 'bg-amber-100 text-amber-800'
        : status === 'HIDDEN_ADMIN_ONLY'
          ? 'bg-purple-100 text-purple-800'
          : 'bg-gray-100 text-gray-800';

  return <span className={`mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tone}`}>{formatLabel(status)}</span>;
}

function formatLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}
