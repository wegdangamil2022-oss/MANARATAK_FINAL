import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@manaratak/ui';
import { ApiClient, PublicStudentToolDto } from '../../api/client';
import { Seo } from '../../components/Seo';
import { useTranslation } from "../../i18n/I18nProvider";

const PUBLIC_VISIBILITY_OPTIONS = [
  { value: '', label: 'All launch states' },
  { value: 'ACTIVE', label: 'Available now' },
  { value: 'COMING_SOON', label: 'Coming soon' },
  { value: 'UNDER_DEVELOPMENT', label: 'Under development' }
];

export function StudentToolsList() {
    const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tools, setTools] = useState<PublicStudentToolDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [visibilityStatus, setVisibilityStatus] = useState(searchParams.get('visibilityStatus') || '');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    ApiClient.getStudentTools({
      category: searchParams.get('category') || undefined,
      visibilityStatus: searchParams.get('visibilityStatus') || undefined
    })
      .then((result) => {
        if (active) setTools(result);
      })
      .catch((requestError: Error) => {
        if (active) setError(requestError.message || 'Failed to load student tools');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [searchParams]);

  const categories = useMemo(
    () => Array.from(new Set(tools.map((tool) => tool.category))).sort(),
    [tools]
  );

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (visibilityStatus) params.set('visibilityStatus', visibilityStatus);
    setSearchParams(params);
  };

  return (
    <div className="space-y-8">
      <Seo title={t('student_tools')} description={t('explore_manaratak_student_tools_checklists_assista')} />
      <section className="bg-gradient-to-br from-indigo-50 via-white to-emerald-50 border rounded-3xl p-5 sm:p-8 md:p-10">
        <p className="text-sm font-semibold text-indigo-700 uppercase tracking-wide mb-2">{t('student_tools')}</p>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl mb-3">{t('practical_tools_for_every_study_step')}</h1>
        <p className="text-base leading-7 text-gray-700 max-w-3xl">
          {t('explore_checklists_matching_assistants_document_bu')}</p>
      </section>

      <section className="flex flex-col gap-3 bg-white border rounded-2xl p-4 shadow-sm md:flex-row" aria-label="Student tool filters">
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="min-h-12 border rounded-xl px-3 py-3"
        >
          <option value="">{t('all_categories_1')}</option>
          {categories.map((item) => <option key={item} value={item}>{formatLabel(item)}</option>)}
        </select>
        <select
          value={visibilityStatus}
          onChange={(event) => setVisibilityStatus(event.target.value)}
          className="min-h-12 border rounded-xl px-3 py-3"
        >
          {PUBLIC_VISIBILITY_OPTIONS.map((option) => (
            <option key={option.value || 'all'} value={option.value}>{option.label}</option>
          ))}
        </select>
        <Button onClick={applyFilters}>{t('apply_filters_1')}</Button>
      </section>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error}</div>}

      {loading ? (
        <div className="py-20 text-center text-gray-500">{t('loading_student_tools')}</div>
      ) : tools.length === 0 ? (
        <div className="bg-white border border-dashed rounded-2xl p-10 text-center text-gray-500">
          {t('no_public_tools_match_these_filters_yet')}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => <StudentToolCard key={tool.toolKey} tool={tool} />)}
        </div>
      )}

      <section className="bg-slate-50 border rounded-2xl p-6 text-sm text-slate-700">
        <h2 className="font-semibold text-base mb-2">{t('trust_and_ai_use')}</h2>
        <p>
          {t('ai_assisted_tools_will_run_through_the_governed_ma')}</p>
      </section>
    </div>
  );
}

function StudentToolCard({ tool }: { tool: PublicStudentToolDto }) {
    const { t } = useTranslation();
  const isActive = tool.visibilityStatus === 'ACTIVE';
  const usesAi = tool.aiDependencyLevel !== 'NONE';
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canExecute = isActive && usesAi && tool.executionType === 'AI_ASSISTED';

  const executeTool = async () => {
    if (!canExecute || !input.trim()) return;
    setExecuting(true);
    setOutput(null);
    setError(null);
    try {
      const result = await ApiClient.executeStudentTool(tool.toolKey, input);
      setOutput(result.output || result.blockedReason || 'No output returned.');
    } catch (requestError: any) {
      setError(requestError.message || 'Unable to execute tool.');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <article className="bg-white border rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col min-h-72">
      <div className="flex items-start justify-between gap-3 mb-4">
        <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
          {formatLabel(tool.category)}
        </span>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
          {isActive ? 'Available' : formatLabel(tool.visibilityStatus)}
        </span>
      </div>

      <h2 className="text-xl font-black leading-snug mb-3">{tool.displayName}</h2>
      <p className="text-base leading-7 text-gray-600 flex-1">{tool.description || 'A guided MANARATAK student utility.'}</p>

      <div className="flex flex-wrap gap-2 mt-5 mb-5 text-xs">
        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md">{formatLabel(tool.executionType)}</span>
        {usesAi && <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md">{t('ai_assisted_1')}</span>}
        {tool.anonymousEnabled && <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md">{t('guest_access')}</span>}
        {!tool.anonymousEnabled && tool.authenticatedEnabled && <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md">{t('sign_in_required')}</span>}
      </div>

      {canExecute ? (
        <div className="space-y-3">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t('describe_what_you_need_help_with')}
            className="w-full border rounded-xl px-3 py-3 text-base min-h-28"
          />
          <Button onClick={executeTool} disabled={executing || !input.trim()}>
            {executing ? 'Running...' : 'Run AI tool'}
          </Button>
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div>}
          {output && <div className="text-sm text-gray-700 bg-gray-50 border rounded-lg p-3 whitespace-pre-wrap">{output}</div>}
        </div>
      ) : (
        <Button disabled title={isActive ? 'This tool will be connected to its execution engine when enabled.' : 'This tool is not available yet.'}>
          {isActive ? 'Open tool (execution pending)' : 'Coming soon'}
        </Button>
      )}
    </article>
  );
}

function formatLabel(value: string): string {
  return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}
