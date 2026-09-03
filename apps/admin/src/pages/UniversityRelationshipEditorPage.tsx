import { FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { adminApiClient } from '../api/client';
import { canonicalPickerApi } from '../api/canonicalPickers';
import { CanonicalPicker } from '../components/CanonicalPicker';

interface CampusRow { id: string; sourceReferenceId?: string | null; name: string; }
interface OrganizationRow { id: string; sourceReferenceId?: string | null; name: string; }
interface RequirementRow {
  id?: string;
  internationalTestId: string;
  testVariantId?: string | null;
  testVersionId?: string | null;
  minimumScore?: number | null;
  status: string;
}
interface ProgramRow {
  id?: string;
  organizationUnitId?: string | null;
  sourceReferenceId?: string | null;
  sourceProgramName: string;
  degreeLevelId?: string | null;
  majorId?: string | null;
  majorMappingState: string;
  status: string;
  campusIds: string[];
  admissionRequirements: RequirementRow[];
  metadata?: Record<string, unknown> | null;
}
interface UniversityDetail {
  id: string;
  displayName: string;
  countryReferenceId?: string | null;
  regionReferenceId?: string | null;
  cityReferenceId?: string | null;
  status: string;
  campuses?: CampusRow[];
  organizationUnits?: OrganizationRow[];
  academicPrograms?: ProgramRow[];
}

const blankProgram = (): ProgramRow => ({
  sourceReferenceId: `admin-program-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  sourceProgramName: '',
  degreeLevelId: null,
  majorId: null,
  majorMappingState: 'UNMAPPED',
  status: 'DRAFT',
  campusIds: [],
  admissionRequirements: [],
});

export function UniversityRelationshipEditorPage() {
  const { id = '' } = useParams();
  const [university, setUniversity] = useState<UniversityDetail | null>(null);
  const [countryReferenceId, setCountryReferenceId] = useState<string | null>(null);
  const [regionReferenceId, setRegionReferenceId] = useState<string | null>(null);
  const [cityReferenceId, setCityReferenceId] = useState<string | null>(null);
  const [countryIso2, setCountryIso2] = useState('');
  const [programs, setPrograms] = useState<ProgramRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    const detail = await adminApiClient.request<UniversityDetail>(`/admin/universities/${encodeURIComponent(id)}`);
    setUniversity(detail);
    setCountryReferenceId(detail.countryReferenceId ?? null);
    setRegionReferenceId(detail.regionReferenceId ?? null);
    setCityReferenceId(detail.cityReferenceId ?? null);
    setPrograms((detail.academicPrograms ?? []).filter((program) => program.status !== 'ARCHIVED').map((program) => ({ ...program, campusIds: program.campusIds ?? [], admissionRequirements: program.admissionRequirements ?? [] })));
    if (detail.countryReferenceId) {
      const countries = await canonicalPickerApi.countries();
      setCountryIso2(countries.find((item) => item.id === detail.countryReferenceId)?.code ?? '');
    }
  };

  useEffect(() => { load().catch((err) => setError(err instanceof Error ? err.message : 'Unable to load university.')); }, [id]);


  const saveLocation = async (event: FormEvent) => {
    event.preventDefault();
    if (!countryReferenceId) return setError('Country canonical relationship is required.');
    setSaving(true); setError(''); setMessage('');
    try {
      const saved = await adminApiClient.request<UniversityDetail>(`/admin/universities/${encodeURIComponent(id)}`, {
        method: 'PATCH', body: JSON.stringify({ countryReferenceId, regionReferenceId, cityReferenceId }),
      });
      setUniversity(saved); setMessage('Canonical university location saved through the University owner API.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save location.'); }
    finally { setSaving(false); }
  };

  const saveProgram = async (index: number) => {
    const program = programs[index];
    if (!program || !program.sourceProgramName.trim() || !program.degreeLevelId) {
      setError('Every academic program needs a name and canonical Degree Level before saving.');
      return;
    }
    if (program.admissionRequirements.some((requirement) => !requirement.internationalTestId)) {
      setError('Every admission test requirement needs a canonical International Test.');
      return;
    }
    setSaving(true); setError(''); setMessage('');
    try {
      const payload = {
        sourceReferenceId: program.sourceReferenceId || null,
        organizationUnitId: program.organizationUnitId || null,
        sourceProgramName: program.sourceProgramName.trim(),
        degreeLevelId: program.degreeLevelId,
        majorId: program.majorId || null,
        majorMappingState: program.majorId ? 'CANONICALLY_MAPPED' : 'UNMAPPED',
        status: program.status || 'DRAFT',
        campusIds: program.campusIds,
        metadata: program.metadata || null,
        admissionRequirements: program.admissionRequirements.map((requirement) => ({
          internationalTestId: requirement.internationalTestId,
          testVariantId: requirement.testVariantId || null,
          testVersionId: requirement.testVersionId || null,
          minimumScore: requirement.minimumScore ?? null,
          status: requirement.status || 'REVIEW_REQUIRED',
        })),
      };
      const endpoint = program.id
        ? `/admin/universities/${encodeURIComponent(id)}/academic-programs/${encodeURIComponent(program.id)}`
        : `/admin/universities/${encodeURIComponent(id)}/academic-programs`;
      const saved = await adminApiClient.request<UniversityDetail>(endpoint, {
        method: program.id ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      setUniversity(saved);
      setPrograms((saved.academicPrograms ?? []).filter((item) => item.status !== 'ARCHIVED').map((item) => ({ ...item, campusIds: item.campusIds ?? [], admissionRequirements: item.admissionRequirements ?? [] })));
      setMessage(program.id ? 'Academic program relationships updated without changing the canonical Program ID.' : 'Academic program created through the University owner API.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save academic program.'); }
    finally { setSaving(false); }
  };

  const archiveProgram = async (index: number) => {
    const program = programs[index];
    if (!program) return;
    if (!program.id) {
      setPrograms((current) => current.filter((_, idx) => idx !== index));
      return;
    }
    setSaving(true); setError(''); setMessage('');
    try {
      const saved = await adminApiClient.request<UniversityDetail>(
        `/admin/universities/${encodeURIComponent(id)}/academic-programs/${encodeURIComponent(program.id)}`,
        { method: 'DELETE' },
      );
      setUniversity(saved);
      setPrograms((saved.academicPrograms ?? []).filter((item) => item.status !== 'ARCHIVED').map((item) => ({ ...item, campusIds: item.campusIds ?? [], admissionRequirements: item.admissionRequirements ?? [] })));
      setMessage('Academic program archived; its canonical ID was preserved for existing relationships.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to archive academic program.'); }
    finally { setSaving(false); }
  };

  const updateProgram = (index: number, patch: Partial<ProgramRow>) => setPrograms((current) => current.map((program, idx) => idx === index ? { ...program, ...patch } : program));

  if (!university) return <div className="p-6 text-sm text-slate-600">{error || 'Loading university relationships…'}</div>;
  const immutable = university.status === 'PUBLISHED';

  return <div className="mx-auto max-w-6xl space-y-6">
    <div className="flex items-center justify-between gap-3">
      <div><Link to="/universities" className="inline-flex items-center gap-1 text-sm text-emerald-700"><ArrowLeft className="h-4 w-4" /> Universities</Link><h2 className="mt-2 text-2xl font-bold">{university.displayName}</h2><p className="text-sm text-slate-500">Canonical relationship authoring · owner APIs only</p></div>
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{university.status}</span>
    </div>
    {immutable ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Published university structure is immutable. Unpublish before changing canonical relationships.</div> : null}
    {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
    {message ? <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div> : null}

    <form onSubmit={saveLocation} className="grid gap-4 rounded-2xl border bg-white p-5 md:grid-cols-3">
      <CanonicalPicker label="Country" value={countryReferenceId} onChange={(next, option) => { setCountryReferenceId(next); setCountryIso2(option?.code ?? ''); setRegionReferenceId(null); setCityReferenceId(null); }} load={() => canonicalPickerApi.countries()} reloadKey="university-country" />
      <CanonicalPicker label="Region" value={regionReferenceId} onChange={(next) => { setRegionReferenceId(next); setCityReferenceId(null); }} load={() => canonicalPickerApi.regions(countryIso2 || undefined)} reloadKey={`university-regions:${countryIso2}`} optional disabled={!countryReferenceId} />
      <CanonicalPicker label="City" value={cityReferenceId} onChange={(next) => setCityReferenceId(next)} load={() => canonicalPickerApi.cities(countryIso2 || undefined)} reloadKey={`university-cities:${countryIso2}`} optional disabled={!countryReferenceId} />
      <div className="md:col-span-3"><button disabled={saving || immutable || !countryReferenceId} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Save className="h-4 w-4" /> Save canonical location</button></div>
    </form>

    <section className="space-y-4 rounded-2xl border bg-white p-5">
      <div className="flex items-center justify-between"><div><h3 className="font-bold">Academic programs</h3><p className="text-xs text-slate-500">Program → Degree Level / Major / International Test. Each program is saved independently to preserve its canonical Program ID; remove archives the program instead of hard-deleting it.</p></div><button type="button" disabled={immutable} onClick={() => setPrograms((current) => [...current, blankProgram()])} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm"><Plus className="h-4 w-4" /> Program</button></div>
      {programs.map((program, index) => <div key={program.id ?? program.sourceReferenceId ?? index} className="space-y-4 rounded-xl border border-slate-200 p-4">
        <div className="flex gap-3"><label className="flex-1 text-xs font-medium">Program name<input value={program.sourceProgramName} onChange={(event) => updateProgram(index, { sourceProgramName: event.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" /></label><button type="button" title="Save program" disabled={saving || immutable} onClick={() => saveProgram(index)} className="self-end rounded-lg border border-emerald-200 p-2 text-emerald-700 disabled:opacity-50"><Save className="h-4 w-4" /></button><button type="button" title={program.id ? 'Archive program' : 'Remove unsaved program'} disabled={saving || immutable} onClick={() => archiveProgram(index)} className="self-end rounded-lg border border-red-200 p-2 text-red-600 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button></div>
        <div className="grid gap-3 md:grid-cols-2"><CanonicalPicker label="Degree Level" value={program.degreeLevelId} onChange={(next) => updateProgram(index, { degreeLevelId: next })} load={() => canonicalPickerApi.degreeLevels()} reloadKey="university-degree-levels" /><CanonicalPicker label="Major" value={program.majorId} onChange={(next) => updateProgram(index, { majorId: next, majorMappingState: next ? 'CANONICALLY_MAPPED' : 'UNMAPPED' })} load={() => canonicalPickerApi.majors()} reloadKey="university-majors" optional /></div>
        {(university.campuses ?? []).length ? <fieldset className="rounded-lg border p-3"><legend className="px-1 text-xs font-semibold">Campuses</legend><div className="flex flex-wrap gap-3">{(university.campuses ?? []).map((campus) => <label key={campus.id} className="text-xs"><input type="checkbox" className="mr-1" checked={program.campusIds.includes(campus.id)} onChange={(event) => updateProgram(index, { campusIds: event.target.checked ? [...program.campusIds, campus.id] : program.campusIds.filter((value) => value !== campus.id) })} />{campus.name}</label>)}</div></fieldset> : null}
        <div className="space-y-3"><div className="flex items-center justify-between"><h4 className="text-sm font-semibold">Admission test requirements</h4><button type="button" onClick={() => updateProgram(index, { admissionRequirements: [...program.admissionRequirements, { internationalTestId: '', minimumScore: null, status: 'REVIEW_REQUIRED' }] })} className="text-xs text-emerald-700">+ Test requirement</button></div>{program.admissionRequirements.map((requirement, requirementIndex) => <div key={requirement.id ?? requirementIndex} className="grid items-end gap-3 rounded-lg bg-slate-50 p-3 md:grid-cols-[1fr_160px_auto]"><CanonicalPicker label="International Test" value={requirement.internationalTestId} onChange={(next) => updateProgram(index, { admissionRequirements: program.admissionRequirements.map((item, idx) => idx === requirementIndex ? { ...item, internationalTestId: next ?? '' } : item) })} load={() => canonicalPickerApi.tests()} reloadKey="university-tests" /><label className="text-xs font-medium">Minimum score<input type="number" step="0.01" value={requirement.minimumScore ?? ''} onChange={(event) => updateProgram(index, { admissionRequirements: program.admissionRequirements.map((item, idx) => idx === requirementIndex ? { ...item, minimumScore: event.target.value === '' ? null : Number(event.target.value) } : item) })} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" /></label><button type="button" onClick={() => updateProgram(index, { admissionRequirements: program.admissionRequirements.filter((_, idx) => idx !== requirementIndex) })} className="rounded-lg border border-red-200 p-2 text-red-600"><Trash2 className="h-4 w-4" /></button></div>)}</div>
      </div>)}
    </section>
  </div>;
}
