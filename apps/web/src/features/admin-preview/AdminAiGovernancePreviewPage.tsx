import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { Activity, Bot, BrainCircuit, CircleDollarSign, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';

interface Overview {
  activeModels: number;
  activePrompts: number;
  executionsToday: number;
  blockedToday: number;
  costMonthToDate: number;
  currency: string;
  openIncidents: number;
}

interface ProviderStatus { key: string; status: string; capabilities: string[] }

export function AdminAiGovernancePreviewPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [overviewResponse, providersResponse] = await Promise.all([
        fetch('/api/v1/admin/ai/overview', { credentials: 'include' }),
        fetch('/api/v1/admin/ai/provider-statuses', { credentials: 'include' }),
      ]);
      if (!overviewResponse.ok || !providersResponse.ok) throw new Error('تعذر تحميل مركز الذكاء الاصطناعي. تحقق من جلسة الإدارة وصلاحية admin:ai:manage.');
      const [nextOverview, nextProviders] = await Promise.all([overviewResponse.json(), providersResponse.json()]);
      setOverview(nextOverview); setProviders(nextProviders.data ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر تحميل البيانات.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return <div dir="rtl" className="min-h-screen bg-slate-50 p-6 lg:p-10">
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="rounded-3xl bg-gradient-to-l from-emerald-950 to-emerald-700 p-8 text-white shadow-lg">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><div className="mb-3 flex items-center gap-2 text-sm text-emerald-100"><BrainCircuit className="h-5 w-5" /> Phase 17 · Provider-Neutral</div><h1 className="text-3xl font-black">مركز الذكاء الاصطناعي</h1><p className="mt-2 text-sm text-emerald-100">هذه الصفحة تقرأ الحالة الفعلية من Backend ولا تعرض بيانات تجريبية.</p></div><a href="/ai" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-900">فتح مركز الإدارة الكامل</a></div>
      </header>
      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">{error}</div> : null}
      {loading ? <div className="flex min-h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-700" /></div> : overview ? <><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric icon={<Activity />} label="تنفيذات اليوم" value={overview.executionsToday} /><Metric icon={<Bot />} label="النماذج النشطة" value={overview.activeModels} /><Metric icon={<ShieldCheck />} label="المحجوب اليوم" value={overview.blockedToday} /><Metric icon={<CircleDollarSign />} label="تكلفة الشهر" value={`${overview.costMonthToDate} ${overview.currency}`} /></div><section className="rounded-2xl border bg-white p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-black">حالة adapters</h2><p className="mt-1 text-xs text-slate-500">غياب السر يظهر NOT_CONFIGURED ولا ينشئ فشلًا وهميًا.</p></div><button onClick={() => void load()} aria-label="تحديث" className="rounded-xl border p-2"><RefreshCw className="h-4 w-4" /></button></div><div className="grid gap-3 md:grid-cols-3">{providers.map((provider) => <div key={provider.key} className="rounded-xl border p-4"><div className="flex justify-between"><strong>{provider.key}</strong><span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800">{provider.status}</span></div><p className="mt-3 text-xs text-slate-500">{provider.capabilities.join(' · ')}</p></div>)}</div></section></> : null}
    </div>
  </div>;
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) {
  return <div className="rounded-2xl border border-emerald-100 bg-white p-5"><div className="mb-4 text-emerald-700 [&>svg]:h-5 [&>svg]:w-5">{icon}</div><strong className="text-2xl">{value}</strong><div className="mt-1 text-xs text-slate-500">{label}</div></div>;
}
