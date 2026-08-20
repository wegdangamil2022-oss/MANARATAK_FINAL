import { useEffect, useMemo, useState } from 'react';
import { Languages, Loader2, RefreshCw, Save, Search } from 'lucide-react';
import { adminApiClient } from '../api/client';
import { useTranslation } from '../i18n/I18nProvider';

type WorkspaceDomain = 'UNIVERSITY' | 'MAJOR';
type CoverageFilter = 'ALL' | 'MISSING_AR' | 'MISSING_EN' | 'COMPLETE';
type SupportedLocale = 'ar' | 'en';
type UniversityTranslationReviewStatus = 'NEEDS_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'REJECTED';

interface UniversityTranslation {
  id?: string;
  locale: string;
  displayName?: string | null;
  description?: string | null;
  reviewStatus?: UniversityTranslationReviewStatus;
  sourceRecordId?: string | null;
}

interface SourceRecord {
  sourceLocale?: string | null;
}

interface UniversityRecord {
  id: string;
  publicId: string;
  canonicalName: string;
  displayName: string;
  status: string;
  completenessStatus: string;
  translations?: UniversityTranslation[];
  sourceRecords?: SourceRecord[];
}

interface MajorRecord {
  id: string;
  publicId: string;
  canonicalName: string;
  displayName: string;
  localizedNameAr?: string | null;
  localizedNameEn?: string | null;
  status: string;
  completenessStatus: string;
}

interface MajorSource {
  sourceLocale?: string | null;
}

type WorkspaceRecord =
  | { domain: 'UNIVERSITY'; entity: UniversityRecord }
  | { domain: 'MAJOR'; entity: MajorRecord };

interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface TranslationDraft {
  arName: string;
  arDescription: string;
  arStatus: UniversityTranslationReviewStatus;
  enName: string;
  enDescription: string;
  enStatus: UniversityTranslationReviewStatus;
}

const reviewStates: UniversityTranslationReviewStatus[] = [
  'NEEDS_REVIEW',
  'APPROVED',
  'PUBLISHED',
  'REJECTED',
];

function nonEmpty(value?: string | null): boolean {
  return Boolean(value?.trim());
}

function universityLocalePresent(entity: UniversityRecord, locale: SupportedLocale): boolean {
  const translation = entity.translations?.find((item) => item.locale === locale);
  return Boolean(translation && (nonEmpty(translation.displayName) || nonEmpty(translation.description)));
}

function coverage(record: WorkspaceRecord) {
  if (record.domain === 'UNIVERSITY') {
    return {
      ar: universityLocalePresent(record.entity, 'ar'),
      en: universityLocalePresent(record.entity, 'en'),
    };
  }
  return {
    ar: nonEmpty(record.entity.localizedNameAr),
    en: nonEmpty(record.entity.localizedNameEn),
  };
}

function sourceLocaleFrom(values: readonly { sourceLocale?: string | null }[] | undefined): SupportedLocale | null {
  const found = values?.find((value) => value.sourceLocale === 'ar' || value.sourceLocale === 'en')?.sourceLocale;
  return found === 'ar' || found === 'en' ? found : null;
}

function makeDraft(record: WorkspaceRecord): TranslationDraft {
  if (record.domain === 'UNIVERSITY') {
    const ar = record.entity.translations?.find((item) => item.locale === 'ar');
    const en = record.entity.translations?.find((item) => item.locale === 'en');
    return {
      arName: ar?.displayName ?? '',
      arDescription: ar?.description ?? '',
      arStatus: ar?.reviewStatus ?? 'NEEDS_REVIEW',
      enName: en?.displayName ?? '',
      enDescription: en?.description ?? '',
      enStatus: en?.reviewStatus ?? 'NEEDS_REVIEW',
    };
  }
  return {
    arName: record.entity.localizedNameAr ?? '',
    arDescription: '',
    arStatus: 'NEEDS_REVIEW',
    enName: record.entity.localizedNameEn ?? '',
    enDescription: '',
    enStatus: 'NEEDS_REVIEW',
  };
}

export function AdminTranslationWorkspacePage() {
  const { t } = useTranslation();
  const [domain, setDomain] = useState<WorkspaceDomain>('UNIVERSITY');
  const [coverageFilter, setCoverageFilter] = useState<CoverageFilter>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Paginated<UniversityRecord | MajorRecord> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<WorkspaceRecord | null>(null);
  const [majorSources, setMajorSources] = useState<MajorSource[]>([]);
  const [draft, setDraft] = useState<TranslationDraft | null>(null);
  const [saving, setSaving] = useState<SupportedLocale | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' });
      if (search.trim()) params.set('search', search.trim());
      if (domain === 'MAJOR') params.set('catalog', 'false');
      const endpoint = domain === 'UNIVERSITY' ? '/admin/universities' : '/admin/majors';
      const response = await adminApiClient.request<Paginated<UniversityRecord | MajorRecord>>(
        `${endpoint}?${params.toString()}`,
      );
      setResult(response);
      setSelected(null);
      setDraft(null);
      setMajorSources([]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('loading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [domain, page, search]);

  const records = useMemo<WorkspaceRecord[]>(() => {
    const data = result?.data ?? [];
    return data.map((entity) =>
      domain === 'UNIVERSITY'
        ? { domain: 'UNIVERSITY' as const, entity: entity as UniversityRecord }
        : { domain: 'MAJOR' as const, entity: entity as MajorRecord },
    );
  }, [domain, result?.data]);

  const stats = useMemo(() => {
    const states = records.map(coverage);
    return {
      loaded: records.length,
      missingAr: states.filter((item) => !item.ar).length,
      missingEn: states.filter((item) => !item.en).length,
      complete: states.filter((item) => item.ar && item.en).length,
    };
  }, [records]);

  const visible = useMemo(() => records.filter((record) => {
    const state = coverage(record);
    if (coverageFilter === 'MISSING_AR') return !state.ar;
    if (coverageFilter === 'MISSING_EN') return !state.en;
    if (coverageFilter === 'COMPLETE') return state.ar && state.en;
    return true;
  }), [coverageFilter, records]);

  const selectRecord = async (record: WorkspaceRecord) => {
    setSelected(record);
    setDraft(makeDraft(record));
    setMajorSources([]);
    if (record.domain === 'MAJOR') {
      try {
        const response = await adminApiClient.request<{ data: MajorSource[] }>(
          `/admin/majors/${encodeURIComponent(record.entity.id)}/sources`,
        );
        setMajorSources(response.data ?? []);
      } catch {
        setMajorSources([]);
      }
    }
  };

  const sourceLocale = selected?.domain === 'UNIVERSITY'
    ? sourceLocaleFrom(selected.entity.sourceRecords)
    : selected?.domain === 'MAJOR'
      ? sourceLocaleFrom(majorSources)
      : null;

  const saveLocale = async (locale: SupportedLocale) => {
    if (!selected || !draft) return;
    setSaving(locale);
    setError(null);
    try {
      if (selected.domain === 'UNIVERSITY') {
        const translation = await adminApiClient.request<UniversityTranslation>(
          `/admin/universities/${encodeURIComponent(selected.entity.id)}/translations/${locale}`,
          {
            method: 'PUT',
            body: JSON.stringify({
              displayName: (locale === 'ar' ? draft.arName : draft.enName).trim() || null,
              description: (locale === 'ar' ? draft.arDescription : draft.enDescription).trim() || null,
              reviewStatus: locale === 'ar' ? draft.arStatus : draft.enStatus,
            }),
          },
        );
        const nextEntity: UniversityRecord = {
          ...selected.entity,
          translations: [
            ...(selected.entity.translations ?? []).filter((item) => item.locale !== locale),
            translation,
          ],
        };
        setSelected({ domain: 'UNIVERSITY', entity: nextEntity });
        setResult((current) => current ? {
          ...current,
          data: current.data.map((item) => item.id === nextEntity.id ? nextEntity : item),
        } : current);
      } else {
        const patch = locale === 'ar'
          ? { localizedNameAr: draft.arName.trim() || null }
          : { localizedNameEn: draft.enName.trim() || null };
        const updated = await adminApiClient.request<MajorRecord>(
          `/admin/majors/${encodeURIComponent(selected.entity.id)}`,
          { method: 'PATCH', body: JSON.stringify(patch) },
        );
        setSelected({ domain: 'MAJOR', entity: updated });
        setResult((current) => current ? {
          ...current,
          data: current.data.map((item) => item.id === updated.id ? updated : item),
        } : current);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('status'));
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <Languages className="h-4 w-4" /> TR-WP09
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">{t('localized_payload')}</h2>
          </div>
          <button onClick={() => void load()} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold">
            <RefreshCw className="h-4 w-4" /> {t('refresh')}
          </button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-4">
        <CoverageCard label={t('total')} value={stats.loaded} />
        <CoverageCard label="AR = 0" value={stats.missingAr} />
        <CoverageCard label="EN = 0" value={stats.missingEn} />
        <CoverageCard label="AR + EN" value={stats.complete} />
      </section>

      <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        <select value={domain} onChange={(event) => { setDomain(event.target.value as WorkspaceDomain); setPage(1); }} className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm">
          <option value="UNIVERSITY">{t('admin_universities')}</option>
          <option value="MAJOR">{t('admin_majors')}</option>
        </select>
        <select value={coverageFilter} onChange={(event) => setCoverageFilter(event.target.value as CoverageFilter)} className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm">
          <option value="ALL">{t('all_statuses')}</option>
          <option value="MISSING_AR">AR = 0</option>
          <option value="MISSING_EN">EN = 0</option>
          <option value="COMPLETE">AR + EN</option>
        </select>
        <label className="relative md:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} aria-label={t('search_by_student_reference_id')} className="min-h-11 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm" />
        </label>
      </section>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.9fr)]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex h-64 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-slate-400" /></div>
          ) : visible.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">{domain === 'UNIVERSITY' ? t('no_universities_found') : t('no_majors_found')}</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {visible.map((record) => {
                const state = coverage(record);
                return (
                  <button key={`${record.domain}:${record.entity.id}`} onClick={() => void selectRecord(record)} className="block w-full p-4 text-start hover:bg-slate-50">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="font-black text-slate-950">{record.entity.displayName}</div>
                        <div className="mt-1 font-mono text-xs text-slate-500">{record.entity.publicId}</div>
                      </div>
                      <div className="flex gap-2 text-[11px] font-bold">
                        <LocaleBadge locale="AR" present={state.ar} />
                        <LocaleBadge locale="EN" present={state.en} />
                      </div>
                    </div>
                    <div className="mt-2 flex gap-3 text-xs text-slate-500">
                      <span>{t('status')}: {record.entity.status}</span>
                      <span>{t('completeness')}: {record.entity.completenessStatus}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          {result && result.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 p-3 text-sm">
              <span>{t('page')} {result.page} {t('of')} {result.totalPages}</span>
              <div className="flex gap-2">
                <button disabled={result.page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded border bg-white px-3 py-1.5 disabled:opacity-40">{t('previous')}</button>
                <button disabled={result.page >= result.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded border bg-white px-3 py-1.5 disabled:opacity-40">{t('next')}</button>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          {!selected || !draft ? (
            <div className="flex min-h-64 items-center justify-center text-center text-sm text-slate-500">{t('select')}</div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase text-slate-500">{t('public_id')}</div>
                <div className="mt-1 font-mono text-sm font-black text-slate-950">{selected.entity.publicId}</div>
                <div className="mt-2 text-sm text-slate-700">{selected.entity.canonicalName}</div>
                <div className="mt-2 text-xs text-slate-500">{t('source')} · {t('locale')}: <strong>{sourceLocale?.toUpperCase() ?? 'UNKNOWN'}</strong></div>
                <div className="mt-1 text-xs text-slate-500">{t('status')}: <strong>{selected.entity.status}</strong></div>
              </div>

              <LocaleEditor
                locale="ar"
                sourceLocale={sourceLocale}
                name={draft.arName}
                description={draft.arDescription}
                reviewStatus={selected.domain === 'UNIVERSITY' ? draft.arStatus : selected.entity.status}
                showDescription={selected.domain === 'UNIVERSITY'}
                showReviewSelector={selected.domain === 'UNIVERSITY'}
                saving={saving === 'ar'}
                onName={(value) => setDraft((current) => current ? { ...current, arName: value } : current)}
                onDescription={(value) => setDraft((current) => current ? { ...current, arDescription: value } : current)}
                onStatus={(value) => setDraft((current) => current ? { ...current, arStatus: value } : current)}
                onSave={() => void saveLocale('ar')}
              />
              <LocaleEditor
                locale="en"
                sourceLocale={sourceLocale}
                name={draft.enName}
                description={draft.enDescription}
                reviewStatus={selected.domain === 'UNIVERSITY' ? draft.enStatus : selected.entity.status}
                showDescription={selected.domain === 'UNIVERSITY'}
                showReviewSelector={selected.domain === 'UNIVERSITY'}
                saving={saving === 'en'}
                onName={(value) => setDraft((current) => current ? { ...current, enName: value } : current)}
                onDescription={(value) => setDraft((current) => current ? { ...current, enDescription: value } : current)}
                onStatus={(value) => setDraft((current) => current ? { ...current, enStatus: value } : current)}
                onSave={() => void saveLocale('en')}
              />

            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function CoverageCard({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="text-xs font-bold text-slate-500">{label}</div><div className="mt-1 text-2xl font-black">{value}</div></div>;
}

function LocaleBadge({ locale, present }: { locale: string; present: boolean }) {
  return <span className={`rounded-full border px-2 py-1 ${present ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>{locale}: {present ? '✓' : '—'}</span>;
}

function LocaleEditor(props: {
  locale: SupportedLocale;
  sourceLocale: SupportedLocale | null;
  name: string;
  description: string;
  reviewStatus: string;
  showDescription: boolean;
  showReviewSelector: boolean;
  saving: boolean;
  onName: (value: string) => void;
  onDescription: (value: string) => void;
  onStatus: (value: UniversityTranslationReviewStatus) => void;
  onSave: () => void;
}) {
  const { t } = useTranslation();
  const isSource = props.sourceLocale === props.locale;
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="font-black">{props.locale.toUpperCase()}</div>
        <div className="flex gap-2 text-[11px] font-bold">
          {isSource && <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">SOURCE</span>}
          <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">{props.reviewStatus}</span>
        </div>
      </div>
      <label className="block text-xs font-bold text-slate-600">{t('display_name')}</label>
      <input dir={props.locale === 'ar' ? 'rtl' : 'ltr'} value={props.name} onChange={(event) => props.onName(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-slate-200 px-3 text-sm" />
      {props.showDescription && (
        <>
          <label className="mt-3 block text-xs font-bold text-slate-600">{t('description')}</label>
          <textarea dir={props.locale === 'ar' ? 'rtl' : 'ltr'} value={props.description} onChange={(event) => props.onDescription(event.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm" />
        </>
      )}
      {props.showReviewSelector && (
        <select value={props.reviewStatus} onChange={(event) => props.onStatus(event.target.value as UniversityTranslationReviewStatus)} className="mt-3 min-h-10 w-full rounded-lg border border-slate-200 px-3 text-sm">
          {reviewStates.map((state) => <option key={state} value={state}>{state}</option>)}
        </select>
      )}
      <button disabled={props.saving} onClick={props.onSave} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white disabled:opacity-50">
        {props.saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {t('save_localized_content')} · {props.locale.toUpperCase()}
      </button>
    </div>
  );
}
