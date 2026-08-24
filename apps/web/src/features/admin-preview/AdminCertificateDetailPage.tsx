import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Archive,
  ArrowRight,
  Ban,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileDown,
  History,
  Loader2,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { AdminCertificateDto, AdminCertificateTemplateDto, ApiClient } from '../../api/client';
import { CertificateCanvas } from './certificate-center/CertificateCanvas';

export function AdminCertificateDetailPage() {
  const { id = '' } = useParams();
  const [certificate, setCertificate] = useState<AdminCertificateDto | null>(null);
  const [template, setTemplate] = useState<AdminCertificateTemplateDto | null>(null);
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [action, setAction] = useState<'revoke' | 'reissue' | 'archive' | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [item, templates, events] = await Promise.all([
        ApiClient.getAdminCertificate(id),
        ApiClient.getAdminCertificateTemplates(),
        ApiClient.getAdminCertificateLedger(id),
      ]);
      setCertificate(item);
      setTemplate(
        templates.data.find((row) => row.id === item.templateId) ?? templates.data[0] ?? null,
      );
      setLedger(events.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    load();
  }, [load]);
  const execute = async () => {
    if (!action || reason.trim().length < 3) return;
    setBusy(true);
    try {
      await ApiClient.certificateAction(id, action, { reason });
      setAction(null);
      setReason('');
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  if (loading)
    return (
      <div className="grid min-h-[50vh] place-items-center text-emerald-700">
        <Loader2 className="h-9 w-9 animate-spin" />
      </div>
    );
  if (!certificate)
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
        {error || 'لم يتم العثور على الشهادة'}
      </div>
    );
  const valid = certificate.status === 'ACTIVE' && certificate.integrityVerified;
  return (
    <div dir="rtl" className="space-y-6 text-right">
      <header className="rounded-3xl bg-gradient-to-l from-emerald-950 via-emerald-800 to-teal-700 p-6 text-white shadow-xl">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <Link
              to="/admin/certificates"
              className="mb-3 inline-flex items-center gap-1 text-xs text-emerald-100"
            >
              <ArrowRight className="h-4 w-4" />
              العودة إلى سجل الشهادات
            </Link>
            <h1 className="text-2xl font-black">{certificate.courseDisplayName}</h1>
            <p className="mt-1 font-mono text-xs text-emerald-100">{certificate.serialNumber}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(certificate.verificationCode)}
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold"
            >
              <Copy className="h-4 w-4" />
              نسخ رمز التحقق
            </button>
            <Link
              target="_blank"
              to={`/verify-certificate?code=${encodeURIComponent(certificate.verificationCode)}`}
              className="flex items-center gap-2 rounded-xl bg-amber-300 px-3 py-2 text-xs font-black text-emerald-950"
            >
              <ExternalLink className="h-4 w-4" />
              التحقق العام
            </Link>
            <button
              onClick={load}
              aria-label="تحديث"
              className="rounded-xl border border-white/20 p-2"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>
      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}
      <section className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <div>
          {template ? (
            <CertificateCanvas template={template} certificate={certificate} />
          ) : (
            <div className="rounded-xl border p-8">القالب التاريخي غير متاح</div>
          )}
        </div>
        <aside className="space-y-4">
          <article
            className={`rounded-2xl border p-5 ${valid ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className={`h-6 w-6 ${valid ? 'text-emerald-700' : 'text-rose-700'}`} />
              <div>
                <strong className="block">
                  {valid ? 'شهادة سليمة وقابلة للتحقق' : 'الشهادة غير صالحة حاليًا'}
                </strong>
                <span className="text-xs">
                  الحالة: {certificate.status} · سلامة الختم:{' '}
                  {certificate.integrityVerified ? 'مؤكدة' : 'غير مؤكدة'}
                </span>
              </div>
            </div>
          </article>
          <article className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-black text-slate-900">بيانات الاعتماد</h2>
            <Info label="المستفيد" value={certificate.recipientDisplayName || 'مرجع محمي'} />
            <Info label="الجهة المصدرة" value={certificate.issuerName || 'MANARATAK'} />
            <Info
              label="تاريخ الإصدار"
              value={new Date(certificate.issuedAt).toLocaleString('ar')}
            />
            <Info label="الإكمال المصدر" value={certificate.courseCompletionId} />
            <Info
              label="القالب"
              value={`${certificate.templateId || '—'} · v${certificate.templateVersion || '—'}`}
            />
            <Info
              label="مرجع مفتاح التوقيع"
              value={certificate.signingKeyReference || 'ينتظر إعداد KMS'}
            />
            <Info
              label="ملف PDF عبر EAP"
              value={certificate.certificatePdfAssetId || 'ينتظر عامل التوليد في بيئة التشغيل'}
            />
          </article>
          <article className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-black">المهارات ومعايير الإنجاز</h2>
            <div className="flex flex-wrap gap-2">
              {certificate.skills.length ? (
                certificate.skills.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">لا توجد مهارات مسجلة</span>
              )}
            </div>
            {certificate.grade ? (
              <p className="mt-3 text-sm">
                التقدير: <strong>{certificate.grade}</strong>
                {certificate.score != null ? ` · ${certificate.score}%` : ''}
              </p>
            ) : null}
          </article>
        </aside>
      </section>
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <History className="h-5 w-5 text-emerald-700" />
          <h2 className="font-black">دفتر التدقيق غير القابل للحذف</h2>
        </div>
        {ledger.length ? (
          <div className="space-y-2">
            {ledger.map((row) => (
              <div
                key={row.id}
                className="grid gap-2 rounded-xl bg-slate-50 p-3 text-xs md:grid-cols-[140px_140px_1fr]"
              >
                <strong className="text-emerald-800">{row.action}</strong>
                <span>{row.actorId}</span>
                <span>{row.reason || new Date(row.occurredAt).toLocaleString('ar')}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">لا توجد أحداث مسجلة.</p>
        )}
      </section>
      <section className="flex flex-wrap gap-2 rounded-2xl border bg-white p-4 shadow-sm">
        <button
          disabled={certificate.status === 'REVOKED' || certificate.status === 'REISSUED'}
          onClick={() => setAction('revoke')}
          className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40"
        >
          <Ban className="h-4 w-4" />
          إلغاء رسمي
        </button>
        <button
          disabled={certificate.status !== 'REVOKED'}
          onClick={() => setAction('reissue')}
          className="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40"
        >
          <RotateCcw className="h-4 w-4" />
          إعادة إصدار مصححة
        </button>
        <button
          disabled={certificate.status === 'ARCHIVED'}
          onClick={() => setAction('archive')}
          className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold text-slate-700 disabled:opacity-40"
        >
          <Archive className="h-4 w-4" />
          أرشفة
        </button>
        <button
          disabled={!certificate.certificatePdfAssetId}
          className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold text-slate-700 disabled:opacity-40"
        >
          <FileDown className="h-4 w-4" />
          تنزيل PDF
        </button>
        <p className="w-full text-[10px] text-amber-700">
          الحذف النهائي غير موجود تصميميًا. التصحيح يتم بالإلغاء ثم إعادة الإصدار مع بقاء التاريخ
          كاملًا.
        </p>
      </section>
      {action ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h2 className="font-black">
              تأكيد{' '}
              {action === 'revoke'
                ? 'إلغاء الشهادة'
                : action === 'reissue'
                  ? 'إعادة الإصدار'
                  : 'الأرشفة'}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              سيُسجل القرار والسبب وهوية المنفذ في دفتر التدقيق.
            </p>
            <textarea
              autoFocus
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="اكتب السبب الرسمي بالتفصيل"
              className="mt-4 w-full rounded-xl border p-3 text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setAction(null)}
                className="rounded-xl border px-4 py-2 text-sm font-bold"
              >
                تراجع
              </button>
              <button
                disabled={busy || reason.trim().length < 3}
                onClick={execute}
                className="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                تأكيد
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b py-2 last:border-0">
      <span className="block text-[10px] text-slate-500">{label}</span>
      <strong className="break-all text-xs text-slate-800">{value}</strong>
    </div>
  );
}
