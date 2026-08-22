import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ExternalLink,
  Globe2,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { ApiClient } from '../../api/client';

export function AdminCourseImportProviderPage() {
  const { id } = useParams<{ id: string }>();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await ApiClient.getCourseImportProvider(id);
        if (active) setProvider(data);
      } catch (err: any) {
        if (active) {
          setProvider(null);
          setError(err?.message || 'تعذر تحميل المزود من سجل المزودين.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [id]);

  if (loading) {
    return (
      <main dir="rtl" className="min-h-screen bg-[#f8fafc] p-8">
        <div className="mx-auto flex min-h-[45vh] max-w-5xl items-center justify-center gap-2 rounded-3xl border bg-white text-sm font-black text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-[#0F4B3A]" />
          تحميل بيانات المزود...
        </div>
      </main>
    );
  }

  if (!provider) {
    return (
      <main dir="rtl" className="min-h-screen bg-[#f8fafc] p-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-rose-200 bg-white p-10 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
          <h1 className="mt-3 text-xl font-black">تعذر عرض المزود</h1>
          <p className="mt-2 text-sm font-bold text-slate-500">{error}</p>
          <Link to="/admin/imports/courses" className="mt-5 inline-flex rounded-xl bg-[#0F4B3A] px-4 py-3 text-sm font-black text-white">
            العودة إلى مركز الاستيراد
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#f8fafc] px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="text-sm font-bold text-slate-500">
          <Link to="/admin/imports/courses" className="hover:text-[#0F4B3A]">مركز استيراد الدورات</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">المزود</span>
        </div>

        <header className="rounded-3xl bg-[#0F4B3A] p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-emerald-200">
                <ShieldCheck className="h-4 w-4" />
                Provider Registry
              </div>
              <h1 className="mt-2 text-2xl font-black sm:text-4xl">{provider.displayName}</h1>
              <p className="mt-2 text-sm font-bold text-emerald-100">{provider.canonicalName}</p>
            </div>
            {provider.officialWebsite && (
              <a href={provider.officialWebsite} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-black text-[#0F4B3A]">
                <ExternalLink className="h-4 w-4" />
                الموقع الرسمي
              </a>
            )}
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['الحالة', provider.status],
            ['استراتيجية الاستيراد', provider.importStrategy],
            ['مستوى الثقة', provider.sourceTrustLevel],
            ['النطاق التشغيلي', provider.operatingScope || 'غير محدد'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-[11px] font-black text-slate-400">{label}</div>
              <div className="mt-1 text-sm font-black">{value}</div>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-[#0F4B3A]" />
            <h2 className="text-lg font-black">النطاقات المعتمدة للمصدر</h2>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {(provider.allowedDomains || []).map((domain: string) => (
              <span key={domain} dir="ltr" className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-800">
                {domain}
              </span>
            ))}
            {(!provider.allowedDomains || provider.allowedDomains.length === 0) && (
              <span className="text-xs font-bold text-slate-500">لا توجد نطاقات معتمدة.</span>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black">الأسماء البديلة المسجلة</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {(provider.aliases || []).map((alias: any) => (
              <span key={alias.id || alias.alias} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                {alias.alias}
              </span>
            ))}
            {(!provider.aliases || provider.aliases.length === 0) && (
              <span className="text-xs font-bold text-slate-500">لا توجد أسماء بديلة.</span>
            )}
          </div>
        </section>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-bold leading-6 text-amber-950">
          دولة مقر المزود — عند وجودها — هي خاصية للمزود فقط، ولا تُعامل كدولة دراسة للدورات.
        </div>
      </div>
    </main>
  );
}
