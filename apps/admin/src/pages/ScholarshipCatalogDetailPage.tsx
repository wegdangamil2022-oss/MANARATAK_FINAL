import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type {
  ScholarshipBenefitDto,
  ScholarshipDegreeTargetDto,
  ScholarshipEligibilityItemDto,
  ScholarshipMajorTargetDto,
  ScholarshipRequiredDocumentDto,
  ScholarshipSourceEvidenceDto,
  ScholarshipUniversityLinkDto,
  ScholarshipDto,
} from '@manaratak/domain';
import {
  ArrowLeft,
  Archive,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  GraduationCap,
  Landmark,
  Languages,
  Loader2,
  Save,
  ShieldCheck,
  WalletCards,
  XCircle,
} from 'lucide-react';
import { adminApiClient } from '../api/client';
import { useTranslation } from '../i18n/I18nProvider';

type EditableLegacyFields = Pick<
  ScholarshipDto,
  | 'displayName'
  | 'fundingCoverage'
  | 'coverageDetails'
  | 'degreeLevel'
  | 'providerName'
  | 'sponsorName'
  | 'studyCountry'
  | 'applicationLink'
  | 'officialSourceUrl'
  | 'applicationDeadline'
  | 'studyLanguage'
  | 'requiredDocuments'
  | 'eligibilityCriteria'
  | 'fundingAmount'
  | 'currency'
  | 'duration'
  | 'eligibleMajorsOrFields'
  | 'targetUniversities'
  | 'targetAcademicPrograms'
>;

type UiText = Record<string, string>;

const text: Record<'ar' | 'en', UiText> = {
  en: {
    back: 'Back to scholarships',
    title: 'Scholarship catalog detail',
    normalized: 'Normalized catalog data',
    legacy: 'Legacy compatibility editor',
    legacyNote: 'Legacy fields remain editable during Expand/Backfill. Normalized collections below are the primary catalog view.',
    status: 'Status', completeness: 'Completeness', sourceLocale: 'Source locale', lastVerified: 'Last verified',
    academicYear: 'Academic year', cycle: 'Cycle', country: 'Country / scope', funding: 'Funding type', deadline: 'Deadline',
    application: 'Application', provider: 'Provider', benefits: 'Benefits & funding', degrees: 'Degree targets', majors: 'Major targets',
    eligibility: 'Eligibility & tests', documents: 'Required documents', evidence: 'Source evidence', universities: 'University / program links',
    empty: 'No normalized records stored.', required: 'Required', optional: 'Optional', resolved: 'Resolution', official: 'Official',
    source: 'Source', test: 'International test', save: 'Save legacy fields', saved: 'Scholarship updated.',
    markReady: 'Mark ready for review', readyToPublish: 'Mark ready to publish', publish: 'Publish manually', unpublish: 'Unpublish',
    archive: 'Archive', reject: 'Reject', publishNote: 'Publication is manual. Viewing this page never publishes or transfers a Scholarship.',
    rawImport: 'Source import record', publicId: 'Public ID', canonicalName: 'Canonical name', dedupKey: 'Dedupe key',
    name: 'Name', sponsor: 'Sponsor', studyCountry: 'Study country', degreeLevel: 'Degree level', studyLanguage: 'Study language',
    coverage: 'Funding coverage', coverageDetails: 'Coverage details', applicationLink: 'Application link', officialUrl: 'Official source URL',
    eligibilityCriteria: 'Legacy eligibility criteria', requiredDocuments: 'Legacy required documents', amount: 'Amount', currency: 'Currency', duration: 'Duration',
    noAutomaticFallback: 'No mock or generated fallback is used when normalized data is absent.',
  },
  ar: {
    back: 'العودة إلى المنح',
    title: 'تفاصيل كتالوج المنحة',
    normalized: 'بيانات الكتالوج المطبّعة',
    legacy: 'محرر التوافق للحقول القديمة',
    legacyNote: 'تبقى الحقول القديمة قابلة للتعديل خلال مرحلة Expand/Backfill، بينما المجموعات المطبّعة أدناه هي عرض الكتالوج الأساسي.',
    status: 'الحالة', completeness: 'الاكتمال', sourceLocale: 'لغة المصدر', lastVerified: 'آخر تحقق',
    academicYear: 'العام الأكاديمي', cycle: 'الدورة', country: 'الدولة / النطاق', funding: 'نوع التمويل', deadline: 'الموعد النهائي',
    application: 'التقديم', provider: 'الجهة المانحة', benefits: 'المزايا والتمويل', degrees: 'الدرجات المستهدفة', majors: 'التخصصات المستهدفة',
    eligibility: 'الأهلية والاختبارات', documents: 'المستندات المطلوبة', evidence: 'أدلة المصادر', universities: 'روابط الجامعات / البرامج',
    empty: 'لا توجد سجلات مطبّعة محفوظة.', required: 'مطلوب', optional: 'اختياري', resolved: 'حالة الربط', official: 'رسمي',
    source: 'المصدر', test: 'اختبار دولي', save: 'حفظ الحقول القديمة', saved: 'تم تحديث المنحة.',
    markReady: 'جاهزة للمراجعة', readyToPublish: 'جاهزة للنشر', publish: 'نشر يدوي', unpublish: 'إلغاء النشر',
    archive: 'أرشفة', reject: 'رفض', publishNote: 'النشر يدوي فقط. فتح هذه الصفحة لا ينشر المنحة ولا ينقل سجل استيراد.',
    rawImport: 'سجل الاستيراد المصدر', publicId: 'المعرف العام', canonicalName: 'الاسم القانوني', dedupKey: 'مفتاح التكرار',
    name: 'الاسم', sponsor: 'الجهة', studyCountry: 'دولة الدراسة', degreeLevel: 'الدرجة', studyLanguage: 'لغة الدراسة',
    coverage: 'تغطية التمويل', coverageDetails: 'تفاصيل التغطية', applicationLink: 'رابط التقديم', officialUrl: 'المصدر الرسمي',
    eligibilityCriteria: 'شروط الأهلية القديمة', requiredDocuments: 'المستندات القديمة', amount: 'المبلغ', currency: 'العملة', duration: 'المدة',
    noAutomaticFallback: 'لا يتم استخدام بيانات وهمية أو مولدة عند غياب البيانات المطبّعة.',
  },
};

function value(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

function formatDate(valueInput: unknown): string {
  if (!valueInput) return '—';
  const date = new Date(String(valueInput));
  return Number.isNaN(date.getTime()) ? String(valueInput) : date.toLocaleString();
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-base font-bold text-slate-900">{title}</h3>
      {children}
    </section>
  );
}

function Empty({ label }: { label: string }) {
  return <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">{label}</p>;
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 break-words text-sm font-medium text-slate-900">{children}</div>
    </div>
  );
}

export function ScholarshipDetailPage() {
  const { language } = useTranslation();
  const ui = text[language === 'en' ? 'en' : 'ar'];
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ScholarshipDto | null>(null);
  const [formData, setFormData] = useState<Partial<EditableLegacyFields>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await adminApiClient.request<ScholarshipDto>(`/admin/scholarships/${id}`);
      setData(result);
      setFormData({
        displayName: result.displayName,
        fundingCoverage: result.fundingCoverage,
        coverageDetails: result.coverageDetails,
        degreeLevel: result.degreeLevel,
        providerName: result.providerName,
        sponsorName: result.sponsorName,
        studyCountry: result.studyCountry,
        applicationLink: result.applicationLink,
        officialSourceUrl: result.officialSourceUrl,
        applicationDeadline: result.applicationDeadline,
        studyLanguage: result.studyLanguage,
        requiredDocuments: result.requiredDocuments,
        eligibilityCriteria: result.eligibilityCriteria,
        fundingAmount: result.fundingAmount,
        currency: result.currency,
        duration: result.duration,
        eligibleMajorsOrFields: result.eligibleMajorsOrFields,
        targetUniversities: result.targetUniversities,
        targetAcademicPrograms: result.targetAcademicPrograms,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'SCHOLARSHIP_DETAIL_LOAD_FAILED');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [id]);

  const tests = useMemo(
    () => (data?.eligibilityItems ?? []).filter((item) => item.internationalTestId || item.itemTypeCode.toUpperCase().includes('TEST')),
    [data],
  );

  const save = async () => {
    if (!id) return;
    setSaving(true); setError(null); setMessage(null);
    try {
      const result = await adminApiClient.request<ScholarshipDto>(`/admin/scholarships/${id}`, {
        method: 'PATCH', body: JSON.stringify(formData),
      });
      setData(result); setMessage(ui.saved);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'SCHOLARSHIP_DETAIL_SAVE_FAILED');
    } finally { setSaving(false); }
  };

  const command = async (endpoint: string, successLabel: string) => {
    if (!id) return;
    setActionLoading(endpoint); setError(null); setMessage(null);
    try {
      await adminApiClient.request(`/admin/scholarships/${id}/${endpoint}`, { method: 'POST' });
      setMessage(successLabel); await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'SCHOLARSHIP_COMMAND_FAILED');
    } finally { setActionLoading(null); }
  };

  if (loading && !data) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!data) return <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">{error ?? 'Scholarship not found.'}</div>;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <button onClick={() => navigate('/scholarships')} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">
            <ArrowLeft className="h-4 w-4" />{ui.back}
          </button>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{ui.title}</p>
          <h2 className="mt-1 text-3xl font-bold text-slate-950">{data.displayName}</h2>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold">{ui.status}: {data.status}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold">{ui.completeness}: {data.completenessStatus}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">{ui.publicId}: {data.publicId}</span>
          </div>
        </div>
        <div className="flex max-w-xl flex-wrap justify-end gap-2">
          {data.status !== 'READY_TO_REVIEW' && data.status !== 'PUBLISHED' && (
            <button disabled={Boolean(actionLoading)} onClick={() => command('mark-ready', ui.markReady)} className="rounded-lg border px-3 py-2 text-sm font-semibold">{ui.markReady}</button>
          )}
          {data.completenessStatus === 'COMPLETE' && data.status === 'READY_TO_REVIEW' && (
            <button disabled={Boolean(actionLoading)} onClick={() => command('mark-publishable', ui.readyToPublish)} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">{ui.readyToPublish}</button>
          )}
          {data.status === 'READY_TO_PUBLISH' && (
            <button disabled={Boolean(actionLoading)} onClick={() => command('publish', ui.publish)} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white">{ui.publish}</button>
          )}
          {data.status === 'PUBLISHED' && (
            <button disabled={Boolean(actionLoading)} onClick={() => command('unpublish', ui.unpublish)} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">{ui.unpublish}</button>
          )}
          <button disabled={Boolean(actionLoading)} onClick={() => command('archive', ui.archive)} className="rounded-lg border px-3 py-2 text-sm font-semibold"><Archive className="mr-1 inline h-4 w-4" />{ui.archive}</button>
          <button disabled={Boolean(actionLoading)} onClick={() => command('reject', ui.reject)} className="rounded-lg px-3 py-2 text-sm font-semibold text-red-700">{ui.reject}</button>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
        <ShieldCheck className="mr-2 inline h-4 w-4" />{ui.publishNote}
      </div>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><XCircle className="mr-2 inline h-4 w-4" />{error}</div>}
      {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 className="mr-2 inline h-4 w-4" />{message}</div>}

      <Section title={ui.normalized}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Meta label={ui.canonicalName}>{data.canonicalName}</Meta>
          <Meta label={ui.academicYear}>{value(data.academicYear)}</Meta>
          <Meta label={ui.cycle}>{value(data.cycleName)}</Meta>
          <Meta label={ui.country}>{value(data.countrySourceLabel ?? data.countryScope ?? data.studyCountry)}</Meta>
          <Meta label={ui.funding}>{value(data.fundingTypeCode)}</Meta>
          <Meta label={ui.deadline}>{formatDate(data.applicationDeadline)}</Meta>
          <Meta label={ui.application}>{value(data.applicationUrl ?? data.applicationLink)}</Meta>
          <Meta label={ui.provider}>{value(data.providerName ?? data.sponsorName)}</Meta>
          <Meta label={ui.sourceLocale}><Languages className="mr-1 inline h-4 w-4" />{value(data.sourceLocale)}</Meta>
          <Meta label={ui.lastVerified}>{formatDate(data.lastVerifiedAt)}</Meta>
          <Meta label={ui.rawImport}>{value(data.sourceImportRecordId)}</Meta>
          <Meta label={ui.dedupKey}>{data.canonicalDedupKey}</Meta>
        </div>
        <p className="mt-4 text-xs text-slate-500">{ui.noAutomaticFallback}</p>
      </Section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Section title={ui.benefits}><Benefits items={data.benefits ?? []} empty={ui.empty} /></Section>
        <Section title={ui.degrees}><Targets items={data.degreeTargets ?? []} empty={ui.empty} kind="degree" /></Section>
        <Section title={ui.majors}><Targets items={data.majorTargets ?? []} empty={ui.empty} kind="major" /></Section>
        <Section title={ui.documents}><Documents items={data.requiredDocumentItems ?? []} empty={ui.empty} /></Section>
        <Section title={ui.eligibility}><Eligibility items={data.eligibilityItems ?? []} tests={tests} empty={ui.empty} testLabel={ui.test} /></Section>
        <Section title={ui.universities}><UniversityLinks items={data.universityLinks ?? []} empty={ui.empty} /></Section>
      </div>

      <Section title={ui.evidence}><Evidence items={data.sourceEvidence ?? []} empty={ui.empty} /></Section>

      <Section title={ui.legacy}>
        <p className="mb-5 text-sm text-slate-500">{ui.legacyNote}</p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label={ui.name} value={String(formData.displayName ?? '')} onChange={(displayName) => setFormData((x) => ({ ...x, displayName }))} />
          <Field label={ui.sponsor} value={String(formData.sponsorName ?? formData.providerName ?? '')} onChange={(sponsorName) => setFormData((x) => ({ ...x, sponsorName }))} />
          <Field label={ui.studyCountry} value={String(formData.studyCountry ?? '')} onChange={(studyCountry) => setFormData((x) => ({ ...x, studyCountry }))} />
          <Field label={ui.degreeLevel} value={String(formData.degreeLevel ?? '')} onChange={(degreeLevel) => setFormData((x) => ({ ...x, degreeLevel }))} />
          <Field label={ui.studyLanguage} value={String(formData.studyLanguage ?? '')} onChange={(studyLanguage) => setFormData((x) => ({ ...x, studyLanguage }))} />
          <Field label={ui.coverage} value={String(formData.fundingCoverage ?? '')} onChange={(fundingCoverage) => setFormData((x) => ({ ...x, fundingCoverage }))} />
          <Field label={ui.amount} value={String(formData.fundingAmount ?? '')} onChange={(fundingAmount) => setFormData((x) => ({ ...x, fundingAmount }))} />
          <Field label={ui.currency} value={String(formData.currency ?? '')} onChange={(currency) => setFormData((x) => ({ ...x, currency }))} />
          <Field label={ui.duration} value={String(formData.duration ?? '')} onChange={(duration) => setFormData((x) => ({ ...x, duration }))} />
          <Field label={ui.applicationLink} value={String(formData.applicationLink ?? '')} onChange={(applicationLink) => setFormData((x) => ({ ...x, applicationLink }))} />
          <Field label={ui.officialUrl} value={String(formData.officialSourceUrl ?? '')} onChange={(officialSourceUrl) => setFormData((x) => ({ ...x, officialSourceUrl }))} />
          <TextArea label={ui.coverageDetails} value={String(formData.coverageDetails ?? '')} onChange={(coverageDetails) => setFormData((x) => ({ ...x, coverageDetails }))} />
          <TextArea label={ui.eligibilityCriteria} value={String(formData.eligibilityCriteria ?? '')} onChange={(eligibilityCriteria) => setFormData((x) => ({ ...x, eligibilityCriteria }))} />
          <TextArea label={ui.requiredDocuments} value={value(formData.requiredDocuments).replace('—', '')} onChange={(requiredDocuments) => setFormData((x) => ({ ...x, requiredDocuments }))} />
        </div>
        <div className="mt-5 flex justify-end">
          <button disabled={saving} onClick={save} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{ui.save}
          </button>
        </div>
      </Section>
    </div>
  );
}

function Benefits({ items, empty }: { items: ScholarshipBenefitDto[]; empty: string }) {
  if (!items.length) return <Empty label={empty} />;
  return <div className="space-y-3">{items.map((item) => <div key={item.benefitKey} className="rounded-xl border p-4"><div className="font-semibold"><WalletCards className="mr-2 inline h-4 w-4" />{item.benefitTypeCode}</div><div className="mt-2 text-sm text-slate-600">{[item.coverageTypeCode, item.amount, item.currencyReferenceId, item.valueText, item.durationText, item.frequencyCode].filter(Boolean).map(String).join(' · ') || '—'}</div></div>)}</div>;
}

function Targets({ items, empty, kind }: { items: Array<ScholarshipDegreeTargetDto | ScholarshipMajorTargetDto>; empty: string; kind: 'degree' | 'major' }) {
  if (!items.length) return <Empty label={empty} />;
  return <div className="space-y-3">{items.map((item) => <div key={item.targetKey} className="rounded-xl border p-4"><GraduationCap className="mr-2 inline h-4 w-4" /><span className="font-semibold">{item.sourceLabel ?? item.targetKey}</span><div className="mt-2 text-xs text-slate-500">{kind === 'degree' ? value((item as ScholarshipDegreeTargetDto).degreeLevelId) : value((item as ScholarshipMajorTargetDto).majorId)} · {value(item.resolutionStatus)}</div></div>)}</div>;
}

function Documents({ items, empty }: { items: ScholarshipRequiredDocumentDto[]; empty: string }) {
  if (!items.length) return <Empty label={empty} />;
  return <div className="space-y-3">{items.map((item) => <div key={item.documentKey} className="rounded-xl border p-4"><FileCheck2 className="mr-2 inline h-4 w-4" /><span className="font-semibold">{item.displayName}</span><div className="mt-1 text-sm text-slate-600">{item.description ?? '—'}</div><div className="mt-2 text-xs text-slate-500">{item.documentTypeCode ?? '—'} · {item.isRequired === false ? 'OPTIONAL' : 'REQUIRED'}</div></div>)}</div>;
}

function Eligibility({ items, tests, empty, testLabel }: { items: ScholarshipEligibilityItemDto[]; tests: ScholarshipEligibilityItemDto[]; empty: string; testLabel: string }) {
  if (!items.length) return <Empty label={empty} />;
  return <div className="space-y-3">{items.map((item) => <div key={item.itemKey} className="rounded-xl border p-4"><div className="font-semibold">{item.internationalTestId ? `${testLabel}: ` : ''}{item.itemTypeCode}</div><div className="mt-1 text-sm text-slate-600">{[item.operatorCode, item.valueText, item.minimumValue, item.maximumValue].filter((x) => x !== null && x !== undefined && x !== '').map(String).join(' · ') || '—'}</div><div className="mt-2 text-xs text-slate-500">{value(item.internationalTestId ?? item.countryReferenceId ?? item.degreeLevelId ?? item.majorId)} · {value(item.resolutionStatus)}</div></div>)}{tests.length > 0 && <div className="text-xs text-slate-500">{testLabel}: {tests.length}</div>}</div>;
}

function Evidence({ items, empty }: { items: ScholarshipSourceEvidenceDto[]; empty: string }) {
  if (!items.length) return <Empty label={empty} />;
  return <div className="grid gap-3 md:grid-cols-2">{items.map((item) => <div key={item.evidenceKey} className="rounded-xl border p-4"><div className="flex items-center justify-between gap-3"><span className="font-semibold">{item.sourceName ?? item.sourceTypeCode}</span>{item.isOfficial && <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800">OFFICIAL</span>}</div><a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 block break-all text-sm text-blue-700 hover:underline">{item.sourceUrl}<ExternalLink className="ml-1 inline h-3 w-3" /></a><div className="mt-2 text-xs text-slate-500">{value(item.trustLevel)} · verified {formatDate(item.verifiedAt)}</div></div>)}</div>;
}

function UniversityLinks({ items, empty }: { items: ScholarshipUniversityLinkDto[]; empty: string }) {
  if (!items.length) return <Empty label={empty} />;
  return <div className="space-y-3">{items.map((item) => <div key={item.linkKey} className="rounded-xl border p-4"><Landmark className="mr-2 inline h-4 w-4" /><span className="font-semibold">{item.sourceLabel ?? item.linkKey}</span><div className="mt-2 text-xs text-slate-500">University: {value(item.universityId)} · Program: {value(item.academicProgramId)} · {value(item.resolutionStatus)}</div></div>)}</div>;
}

function Field({ label, value: current, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block text-xs font-semibold text-slate-700">{label}<input value={current} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal" /></label>;
}

function TextArea({ label, value: current, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block text-xs font-semibold text-slate-700">{label}<textarea rows={3} value={current} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal" /></label>;
}
