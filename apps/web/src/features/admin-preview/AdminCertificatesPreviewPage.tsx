import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  Ban,
  BarChart3,
  CheckCircle2,
  Clock3,
  Eye,
  FileBadge2,
  FilePlus2,
  LayoutTemplate,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import {
  AdminCertificateDto,
  AdminCertificateTemplateDto,
  ApiClient,
  CertificateAnalyticsDto,
} from '../../api/client';
import { CertificateCanvas } from './certificate-center/CertificateCanvas';

const emptyTemplate = {
  code: 'MNR-PRO',
  name: 'MANARATAK Professional',
  nameAr: 'قالب مناراتك الاحترافي',
  nameEn: 'MANARATAK Professional',
  templateVersion: '1.0.0',
  issuerName: 'MANARATAK',
  language: 'BILINGUAL' as const,
  layout: 'LANDSCAPE' as const,
  accentColor: '#075E45',
  secondaryColor: '#C9A227',
  titleAr: 'شهادة إتمام معتمدة',
  titleEn: 'CERTIFICATE OF COMPLETION',
  bodyAr:
    'تشهد منصة مناراتك بأن المتعلم قد أتم بنجاح جميع متطلبات البرنامج واستحق هذه الشهادة الموثقة.',
  bodyEn:
    'MANARATAK certifies that the learner has successfully completed all program requirements and earned this verified credential.',
  signatoryNameAr: 'إدارة الاعتماد الأكاديمي',
  signatoryNameEn: 'Academic Credentialing Office',
  signatoryTitleAr: 'التوقيع الرقمي المعتمد',
  signatoryTitleEn: 'Authorized Digital Signature',
  issuerReferenceId: null,
  logoAssetId: null,
  sealAssetId: null,
  signatureAssetId: null,
  designAssetId: null,
};
type Tab = 'REGISTRY' | 'TEMPLATES' | 'INSIGHTS';

export function AdminCertificatesPreviewPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('REGISTRY');
  const [certificates, setCertificates] = useState<AdminCertificateDto[]>([]);
  const [templates, setTemplates] = useState<AdminCertificateTemplateDto[]>([]);
  const [analytics, setAnalytics] = useState<CertificateAnalyticsDto>({
    total: 0,
    active: 0,
    revoked: 0,
    archived: 0,
    expiringSoon: 0,
    templates: 0,
    verifications: 0,
  });
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<AdminCertificateTemplateDto | null>(null);
  const [draft, setDraft] = useState(emptyTemplate);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [list, templateList, metrics] = await Promise.all([
        ApiClient.getAdminCertificates({ search: query, status, pageSize: 50 }),
        ApiClient.getAdminCertificateTemplates(),
        ApiClient.getAdminCertificateAnalytics(),
      ]);
      setCertificates(list.data);
      setTemplates(templateList.data);
      setAnalytics(metrics);
    } catch (e: any) {
      setError(e.message || 'تعذر تحميل مركز الشهادات');
    } finally {
      setLoading(false);
    }
  }, [query, status]);
  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);
  const activeTemplate = useMemo(
    () => templates.find((item) => item.status === 'ACTIVE') ?? templates[0],
    [templates],
  );
  const submitTemplate = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const saved = editingId
        ? await ApiClient.updateAdminCertificateTemplate(editingId, draft)
        : await ApiClient.createAdminCertificateTemplate(draft);
      setTemplates((items) =>
        editingId ? items.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...items],
      );
      setModal(false);
      setEditingId(null);
      setPreview(saved);
    } catch (e: any) {
      setError(e.message);
    }
  };
  const transition = async (item: AdminCertificateTemplateDto) => {
    const next: Record<string, string> = {
      DRAFT: 'PENDING_APPROVAL',
      PENDING_APPROVAL: 'APPROVED',
      APPROVED: 'ACTIVE',
      ACTIVE: 'DEPRECATED',
      DEPRECATED: 'ARCHIVED',
    };
    if (!next[item.status]) return;
    try {
      const updated = await ApiClient.transitionAdminCertificateTemplate(
        item.id,
        next[item.status],
      );
      setTemplates((items) => items.map((row) => (row.id === updated.id ? updated : row)));
    } catch (e: any) {
      setError(e.message);
    }
  };
  return (
    <div dir="rtl" className="space-y-6 text-right">
      <header className="overflow-hidden rounded-3xl bg-gradient-to-l from-emerald-950 via-emerald-800 to-teal-700 p-6 text-white shadow-xl">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-emerald-300/30 bg-white/10 p-3">
              <Award className="h-9 w-9 text-amber-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black">مركز الشهادات والاعتمادات</h1>
                <span className="rounded-full bg-amber-300 px-3 py-1 text-[10px] font-black text-emerald-950">
                  PHASE 14
                </span>
              </div>
              <p className="mt-1 max-w-3xl text-sm text-emerald-100">
                إصدار مؤسسي، تحقق فوري، قوالب ثنائية اللغة، سجل غير قابل للحذف، وتوقيع رقمي جاهز
                للربط بمفاتيح KMS.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingId(null);
                setDraft(emptyTemplate);
                setModal(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-amber-300 px-4 py-2.5 text-sm font-bold text-emerald-950 hover:bg-amber-200"
            >
              <FilePlus2 className="h-4 w-4" />
              قالب جديد
            </button>
            <button
              onClick={load}
              aria-label="تحديث"
              className="rounded-xl border border-white/20 bg-white/10 p-2.5 hover:bg-white/20"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/15 pt-5 md:grid-cols-4 lg:grid-cols-7">
          {[
            [analytics.total, 'إجمالي الشهادات', Award],
            [analytics.active, 'نشطة وموثقة', CheckCircle2],
            [analytics.revoked, 'ملغاة', Ban],
            [analytics.archived, 'مؤرشفة', FileBadge2],
            [analytics.expiringSoon, 'تنتهي قريبًا', Clock3],
            [analytics.templates, 'قوالب نشطة', LayoutTemplate],
            [analytics.verifications, 'عمليات تحقق', ShieldCheck],
          ].map(([value, label, Icon]: any) => (
            <div key={label} className="rounded-xl bg-black/10 p-3">
              <Icon className="mb-2 h-4 w-4 text-amber-300" />
              <strong className="block text-xl">{value}</strong>
              <span className="text-[10px] text-emerald-100">{label}</span>
            </div>
          ))}
        </div>
      </header>
      <nav className="flex flex-wrap gap-2 rounded-2xl border bg-white p-2 shadow-sm">
        {(
          [
            ['REGISTRY', 'سجل الشهادات', FileBadge2],
            ['TEMPLATES', 'القوالب والتصميم', LayoutTemplate],
            ['INSIGHTS', 'التحليلات والثقة', BarChart3],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${tab === key ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-emerald-50'}`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>
      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800"
        >
          {error}
          <p className="mt-1 text-xs font-normal">
            تأكد من تشغيل API وتطبيق migration عند بدء البيئة. لا توجد بيانات تجريبية مخفية.
          </p>
        </div>
      ) : null}
      {tab === 'REGISTRY' ? (
        <section className="rounded-2xl border bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b p-4 md:flex-row">
            <label className="relative flex-1">
              <Search className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث بالرقم، رمز التحقق، الطالب أو الدورة"
                className="w-full rounded-xl border py-2.5 pr-10 pl-3 text-sm focus:ring-2 focus:ring-emerald-600"
              />
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border px-4 py-2.5 text-sm"
            >
              <option value="">جميع الحالات</option>
              <option value="ACTIVE">نشطة</option>
              <option value="REVOKED">ملغاة</option>
              <option value="REISSUED">أعيد إصدارها</option>
              <option value="ARCHIVED">مؤرشفة</option>
              <option value="EXPIRED">منتهية</option>
            </select>
          </div>
          {loading ? (
            <div className="grid place-items-center p-16 text-emerald-700">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : certificates.length === 0 ? (
            <Empty text="لا توجد شهادات بعد. ستظهر هنا تلقائيًا بعد وصول إكمال مؤهل من منصة التعلم." />
          ) : (
            <div className="divide-y">
              {certificates.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(`/admin/certificates/${item.id}`)}
                  className="grid w-full gap-3 p-4 text-right hover:bg-emerald-50/60 md:grid-cols-[1.2fr_1.4fr_1fr_auto]"
                >
                  <div>
                    <strong className="block font-mono text-sm text-emerald-900">
                      {item.serialNumber}
                    </strong>
                    <span className="text-[10px] text-slate-500">{item.verificationCode}</span>
                  </div>
                  <div>
                    <strong className="block text-sm text-slate-900">
                      {item.recipientDisplayName || 'مرجع طالب محمي'}
                    </strong>
                    <span className="text-xs text-slate-500">{item.courseDisplayName}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-600">
                      {new Date(item.issuedAt).toLocaleDateString('ar')}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.issuerName}</span>
                  </div>
                  <Status value={item.status} />
                </button>
              ))}
            </div>
          )}
        </section>
      ) : null}
      {tab === 'TEMPLATES' ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
          <section className="space-y-3">
            {templates.length === 0 ? (
              <Empty text="لا توجد قوالب. أنشئ أول قالب، ثم مرره بالمراجعة والاعتماد والنشر." />
            ) : (
              templates.map((item) => (
                <article key={item.id} className="rounded-2xl border bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-slate-900">{item.nameAr}</h3>
                        <Status value={item.status} />
                      </div>
                      <p className="text-xs text-slate-500">
                        {item.nameEn} · v{item.templateVersion} · {item.language}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setPreview(item)}
                        className="rounded-lg border p-2 text-emerald-700"
                        aria-label="معاينة"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {item.status === 'DRAFT' ? (
                        <button
                          onClick={() => {
                            const {
                              id: _id,
                              publicId: _publicId,
                              status: _status,
                              updatedAt: _updatedAt,
                              ...editable
                            } = item;
                            setDraft(editable as typeof emptyTemplate);
                            setEditingId(item.id);
                            setModal(true);
                          }}
                          className="rounded-lg border px-3 py-2 text-xs font-bold text-slate-700"
                        >
                          تعديل
                        </button>
                      ) : null}
                      {!['ARCHIVED', 'RETIRED'].includes(item.status) ? (
                        <button
                          onClick={() => transition(item)}
                          className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white"
                        >
                          المرحلة التالية
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-[10px] text-slate-500">
                    <span
                      className="h-4 w-4 rounded-full border"
                      style={{ background: item.accentColor }}
                    />
                    <span>{item.layout === 'LANDSCAPE' ? 'أفقي' : 'عمودي'}</span>
                    <span>الجهة: {item.issuerName}</span>
                    <span>{item.signatureAssetId ? 'التوقيع مربوط' : 'ينتظر توقيع EAP'}</span>
                  </div>
                </article>
              ))
            )}
          </section>
          <section className="sticky top-4 h-fit">
            {preview || activeTemplate ? (
              <CertificateCanvas template={(preview || activeTemplate)!} />
            ) : (
              <Empty text="اختر قالبًا لمعاينته" />
            )}
          </section>
        </div>
      ) : null}
      {tab === 'INSIGHTS' ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Insight
            icon={ShieldCheck}
            title="سلامة السجل"
            text="كل إصدار أو إلغاء أو إعادة إصدار يكتب Audit وOutbox داخل المعاملة نفسها."
          />
          <Insight
            icon={Sparkles}
            title="تجربة عالمية"
            text="مهارات ومعايير استحقاق وبيانات جهة الإصدار والتحقق الفوري، مستوحاة من منصات الاعتماد الرقمية الرائدة."
          />
          <Insight
            icon={LayoutTemplate}
            title="إدارة الإصدارات"
            text="لا يتغير القالب التاريخي للشهادات الصادرة؛ كل تصميم جديد يحمل نسخة مستقلة."
          />
        </div>
      ) : null}
      {modal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/65 p-4">
          <form
            onSubmit={submitTemplate}
            className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-emerald-950">
                  {editingId ? 'تعديل قالب الشهادة' : 'إنشاء قالب شهادة'}
                </h2>
                <p className="text-xs text-slate-500">
                  يُحفظ كمسودة ولا يستخدم في الإصدار قبل الاعتماد والنشر.
                </p>
              </div>
              <button type="button" onClick={() => setModal(false)}>
                <X />
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['nameAr', 'الاسم العربي'],
                ['nameEn', 'الاسم الإنجليزي'],
                ['code', 'رمز القالب'],
                ['templateVersion', 'الإصدار'],
                ['issuerName', 'الجهة المصدرة'],
                ['titleAr', 'العنوان العربي'],
                ['titleEn', 'العنوان الإنجليزي'],
                ['signatoryNameAr', 'اسم الموقّع'],
              ].map(([key, label]) => (
                <label key={key} className="text-xs font-bold text-slate-700">
                  {label}
                  <input
                    required
                    value={(draft as any)[key] || ''}
                    onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                    className="mt-1 w-full rounded-xl border p-2.5 font-normal"
                  />
                </label>
              ))}
              <label className="text-xs font-bold">
                النص العربي
                <textarea
                  required
                  rows={3}
                  value={draft.bodyAr}
                  onChange={(e) => setDraft({ ...draft, bodyAr: e.target.value })}
                  className="mt-1 w-full rounded-xl border p-2.5 font-normal"
                />
              </label>
              {[
                ['logoAssetId', 'معرّف شعار EAP'],
                ['sealAssetId', 'معرّف الختم EAP'],
                ['signatureAssetId', 'معرّف صورة التوقيع EAP'],
                ['designAssetId', 'معرّف خلفية القالب EAP'],
              ].map(([key, label]) => (
                <label key={key} className="text-xs font-bold text-slate-700">
                  {label}
                  <input
                    value={(draft as any)[key] || ''}
                    onChange={(event) => setDraft({ ...draft, [key]: event.target.value || null })}
                    placeholder="asset-id فقط، لا تستخدم رابطًا مباشرًا"
                    className="mt-1 w-full rounded-xl border p-2.5 font-mono text-xs font-normal"
                  />
                </label>
              ))}
              <label className="text-xs font-bold">
                النص الإنجليزي
                <textarea
                  required
                  rows={3}
                  value={draft.bodyEn}
                  onChange={(e) => setDraft({ ...draft, bodyEn: e.target.value })}
                  className="mt-1 w-full rounded-xl border p-2.5 font-normal"
                />
              </label>
              <label className="text-xs font-bold">
                اللون الرئيسي
                <input
                  type="color"
                  value={draft.accentColor}
                  onChange={(e) => setDraft({ ...draft, accentColor: e.target.value })}
                  className="mt-1 h-11 w-full rounded-xl border p-1"
                />
              </label>
              <label className="text-xs font-bold">
                اللون الثانوي
                <input
                  type="color"
                  value={draft.secondaryColor}
                  onChange={(e) => setDraft({ ...draft, secondaryColor: e.target.value })}
                  className="mt-1 h-11 w-full rounded-xl border p-1"
                />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setModal(false)}
                className="rounded-xl border px-5 py-2.5 text-sm font-bold"
              >
                إلغاء
              </button>
              <button className="rounded-xl bg-emerald-700 px-6 py-2.5 text-sm font-bold text-white">
                {editingId ? 'حفظ التعديلات' : 'حفظ المسودة'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function Status({ value }: { value: string }) {
  const style =
    value === 'ACTIVE'
      ? 'bg-emerald-100 text-emerald-800'
      : value === 'REVOKED'
        ? 'bg-rose-100 text-rose-800'
        : value === 'DRAFT'
          ? 'bg-slate-100 text-slate-700'
          : 'bg-amber-100 text-amber-800';
  return (
    <span className={`h-fit rounded-full px-2.5 py-1 text-[10px] font-black ${style}`}>
      {(
        {
          ACTIVE: 'نشطة',
          REVOKED: 'ملغاة',
          ARCHIVED: 'مؤرشفة',
          REISSUED: 'أعيد إصدارها',
          DRAFT: 'مسودة',
          PENDING_APPROVAL: 'بانتظار الاعتماد',
          APPROVED: 'معتمدة',
          DEPRECATED: 'موقوفة للإصدار',
        } as any
      )[value] || value}
    </span>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed bg-white p-12 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}
function Insight({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
  return (
    <article className="rounded-2xl border bg-white p-5 shadow-sm">
      <Icon className="mb-3 h-7 w-7 text-emerald-700" />
      <h3 className="font-black text-slate-900">{title}</h3>
      <p className="mt-2 text-xs leading-6 text-slate-600">{text}</p>
    </article>
  );
}
