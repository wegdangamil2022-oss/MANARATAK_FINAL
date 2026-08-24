import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  BadgeDollarSign,
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Landmark,
  Loader2,
  RefreshCw,
  RotateCcw,
  Scale,
  Settings,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import { adminApiClient } from '../api/client';

type Tab =
  | 'overview'
  | 'invoices'
  | 'payments'
  | 'wallets'
  | 'transfers'
  | 'rates'
  | 'approvals'
  | 'refunds'
  | 'commissions'
  | 'estimates'
  | 'reconciliation'
  | 'reports'
  | 'settings';
type Money = { amountMinorUnits: string; currencyCode: string; scale: number };
type Overview = {
  collectedToday?: Money;
  outstanding?: Money;
  pendingPayments: number | null;
  pendingTransfers: number | null;
  walletLiability?: Money;
  refunds?: Money;
  pendingApprovals: number | null;
  reconciliationHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'UNKNOWN';
  attention: Array<{ code: string; severity: string; referenceId: string; details: string }>;
};
type Invoice = {
  id: string;
  invoiceNumber: string;
  status: string;
  totalAmount: Money;
  amountDue: Money;
  originDomain: string;
  originReferenceId: string;
};

const tabs: Array<{ id: Tab; label: string; icon: typeof Banknote }> = [
  { id: 'overview', label: 'نظرة عامة', icon: CircleDollarSign },
  { id: 'invoices', label: 'الفواتير', icon: FileText },
  { id: 'payments', label: 'المدفوعات', icon: Banknote },
  { id: 'wallets', label: 'المحافظ والحسابات', icon: WalletCards },
  { id: 'transfers', label: 'التحويلات', icon: ArrowLeftRight },
  { id: 'rates', label: 'أسعار الصرف', icon: BadgeDollarSign },
  { id: 'approvals', label: 'الموافقات', icon: ShieldCheck },
  { id: 'refunds', label: 'الاستردادات', icon: RotateCcw },
  { id: 'commissions', label: 'العمولات', icon: Landmark },
  { id: 'estimates', label: 'التقديرات المالية', icon: Scale },
  { id: 'reconciliation', label: 'المطابقة والتسوية', icon: CheckCircle2 },
  { id: 'reports', label: 'التقارير', icon: FileText },
  { id: 'settings', label: 'الإعدادات', icon: Settings },
];

export function FinanceAdminPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [overview, setOverview] = useState<Overview | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sectionData, setSectionData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'overview')
        setOverview(await adminApiClient.request<Overview>('/admin/finance/overview'));
      else if (tab === 'invoices') {
        const result = await adminApiClient.request<{ data: Invoice[] }>(
          '/admin/finance/invoices?pageSize=50',
        );
        setInvoices(result.data);
      } else if (
        ['transfers', 'rates', 'approvals', 'refunds', 'commissions', 'reports'].includes(tab)
      ) {
        const endpoint = tab === 'rates' ? 'exchange-rates' : tab;
        setSectionData(await adminApiClient.request<unknown>(`/admin/finance/${endpoint}`));
      } else setSectionData(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر تحميل البيانات المالية');
    } finally {
      setLoading(false);
    }
  }, [tab]);
  useEffect(() => {
    void load();
  }, [load]);
  return (
    <main dir="rtl" className="min-h-screen bg-[#FBFCFB] font-['Cairo'] text-slate-800">
      <header className="bg-[#044A37] px-6 py-7 text-white shadow-lg">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-sm text-[#E3B04B]">MANARATAK Enterprise</p>
            <h1 className="text-2xl font-bold">مركز المالية والمدفوعات</h1>
            <p className="mt-1 text-sm text-emerald-100">
              دفتر مالي موحّد، فوترة، مدفوعات، تحويلات ومطابقة
            </p>
          </div>
          <button
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/40 bg-[#235D4E] px-4 py-2 text-sm hover:bg-emerald-700"
          >
            <RefreshCw size={16} /> تحديث
          </button>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1600px] gap-5 px-4 py-5 lg:grid-cols-[260px_1fr]">
        <nav
          aria-label="أقسام مركز المالية"
          className="h-fit rounded-2xl border border-emerald-100 bg-white p-2 shadow-sm"
        >
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              aria-current={tab === id ? 'page' : undefined}
              className={`mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-right text-sm transition ${tab === id ? 'bg-[#044A37] font-semibold text-white' : 'text-slate-600 hover:bg-emerald-50 hover:text-[#044A37]'}`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
        <section className="min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#044A37]">
              {tabs.find((item) => item.id === tab)?.label}
            </h2>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
              بيانات مالية فعلية فقط
            </span>
          </div>
          {loading && (
            <State icon={<Loader2 className="animate-spin" />} text="جارٍ تحميل الحالة المالية…" />
          )}
          {!loading && error && (
            <State icon={<AlertTriangle className="text-red-600" />} text={error} danger />
          )}
          {!loading && !error && tab === 'overview' && <OverviewPanel data={overview} />}
          {!loading && !error && tab === 'invoices' && (
            <InvoicesPanel invoices={invoices} reload={load} />
          )}
          {!loading && !error && !['overview', 'invoices'].includes(tab) && (
            <GenericSection tab={tab} data={sectionData} />
          )}
        </section>
      </div>
    </main>
  );
}

function OverviewPanel({ data }: { data: Overview | null }) {
  if (!data) return <State text="لا توجد بيانات متاحة" />;
  const metrics = [
    ['المحصّل اليوم', data.collectedToday ? formatMoney(data.collectedToday) : 'UNKNOWN'],
    ['المبالغ المستحقة', data.outstanding ? formatMoney(data.outstanding) : 'UNKNOWN'],
    ['مدفوعات معلقة', value(data.pendingPayments)],
    ['تحويلات معلقة', value(data.pendingTransfers)],
    ['التزام المحافظ', data.walletLiability ? formatMoney(data.walletLiability) : 'UNKNOWN'],
    ['الاستردادات', data.refunds ? formatMoney(data.refunds) : 'UNKNOWN'],
    ['موافقات معلقة', value(data.pendingApprovals)],
    ['صحة المطابقة', data.reconciliationHealth],
  ];
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, metric]) => (
          <article
            key={label}
            className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-xl font-bold text-[#044A37]">{metric}</p>
          </article>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 font-bold text-[#044A37]">
          <AlertTriangle className="text-[#E3B04B]" size={20} /> يتطلب انتباهك
        </h3>
        {data.attention.length ? (
          <div className="space-y-2">
            {data.attention.map((item) => (
              <div
                key={`${item.code}-${item.referenceId}`}
                className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm"
              >
                <strong>{item.code}</strong> — {item.referenceId}
                <p className="text-slate-600">{item.details}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">لا توجد حوادث مالية مفتوحة.</p>
        )}
      </div>
    </>
  );
}

function InvoicesPanel({ invoices, reload }: { invoices: Invoice[]; reload: () => Promise<void> }) {
  const issue = async (id: string) => {
    if (!window.confirm('هل تريد إصدار هذه الفاتورة؟ تصبح حقائقها التاريخية غير قابلة للتعديل.'))
      return;
    await adminApiClient.request(`/admin/finance/invoices/${id}/issue`, {
      method: 'POST',
      headers: commandHeaders(),
      body: '{}',
    });
    await reload();
  };
  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
      {invoices.length === 0 ? (
        <State text="لا توجد فواتير" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-emerald-50 text-[#044A37]">
              <tr>
                <th className="p-4 text-right">رقم الفاتورة</th>
                <th className="p-4 text-right">المصدر</th>
                <th className="p-4 text-right">الإجمالي</th>
                <th className="p-4 text-right">المتبقي</th>
                <th className="p-4 text-right">الحالة</th>
                <th className="p-4">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-t border-slate-100">
                  <td className="p-4 font-semibold">{invoice.invoiceNumber}</td>
                  <td className="p-4">
                    {invoice.originDomain} / {invoice.originReferenceId}
                  </td>
                  <td className="p-4">{formatMoney(invoice.totalAmount)}</td>
                  <td className="p-4">{formatMoney(invoice.amountDue)}</td>
                  <td className="p-4">
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs text-[#044A37]">
                      {invoice.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {invoice.status === 'DRAFT' && (
                      <button
                        onClick={() => void issue(invoice.id)}
                        className="rounded-lg bg-[#044A37] px-3 py-2 text-xs text-white"
                      >
                        إصدار
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function GenericSection({ tab, data }: { tab: Tab; data: unknown }) {
  if (['payments', 'wallets', 'estimates', 'settings'].includes(tab))
    return (
      <State text="لا توجد بيانات تشغيلية بعد. ستظهر هنا فور إنشاء سجلات حقيقية عبر العقود المالية." />
    );
  const rows = Array.isArray(data) ? data : data ? [data] : [];
  if (!rows.length) return <State text="لا توجد سجلات حقيقية في هذا القسم." />;
  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <article
          key={String((row as { id?: string }).id || index)}
          className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm"
        >
          <pre className="overflow-auto whitespace-pre-wrap text-xs text-slate-700">
            {JSON.stringify(row, null, 2)}
          </pre>
        </article>
      ))}
    </div>
  );
}

function State({ icon, text, danger }: { icon?: React.ReactNode; text: string; danger?: boolean }) {
  return (
    <div
      className={`flex min-h-48 items-center justify-center gap-3 rounded-2xl border bg-white p-8 text-sm ${danger ? 'border-red-200 text-red-700' : 'border-emerald-100 text-slate-500'}`}
    >
      {icon}
      {text}
    </div>
  );
}
function value(input: number | null) {
  return input === null ? 'UNKNOWN' : String(input);
}
function commandHeaders() {
  return { 'Idempotency-Key': crypto.randomUUID(), 'X-Correlation-Id': crypto.randomUUID() };
}
function formatMoney(amount: Money) {
  const negative = amount.amountMinorUnits.startsWith('-');
  const digits = negative ? amount.amountMinorUnits.slice(1) : amount.amountMinorUnits;
  const padded = digits.padStart(amount.scale + 1, '0');
  const whole = amount.scale ? padded.slice(0, -amount.scale) : padded;
  const fraction = amount.scale ? `.${padded.slice(-amount.scale)}` : '';
  return `${negative ? '-' : ''}${whole}${fraction} ${amount.currencyCode}`;
}
