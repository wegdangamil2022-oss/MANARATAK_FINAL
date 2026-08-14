import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AlertCircle, BookOpen, Building2, Filter, GraduationCap, Loader2, Search } from 'lucide-react';
import { ApiClient } from '../../api/client';

interface CollegeFacet { name: string; supportedDegrees: string[]; majorCount: number }
const degrees = [
  ['', 'كل الدرجات'], ['Bachelor', 'بكالوريوس'], ['Master', 'ماجستير'], ['Doctorate', 'دكتوراه'], ['Fellowship', 'زمالة'],
] as const;
const degreeLabel = (value: string) => degrees.find(item => item[0] === value)?.[1] ?? value;

export function AdminFacultiesPage() {
  const adminSessionPresent = Boolean(localStorage.getItem('manaratak_access_token')) || import.meta.env.VITE_LOCAL_ADMIN_READ_ONLY === 'true';
  const [degree, setDegree] = useState('');
  const [search, setSearch] = useState('');
  const [facets, setFacets] = useState<CollegeFacet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    ApiClient.getAdminMajorCollegeFacets(degree || undefined)
      .then(result => { if (!cancelled) setFacets(result.data ?? []); })
      .catch(reason => { if (!cancelled) setError(reason instanceof Error ? reason.message : 'تعذر تحميل سياقات الكليات.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [degree]);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? facets.filter(item => item.name.toLowerCase().includes(query)) : facets;
  }, [facets, search]);

  if (!adminSessionPresent) return <Navigate to="/login" replace />;
  return (
    <main dir="rtl" className="min-h-screen bg-[#f7f8fa] px-4 py-5 text-slate-900 sm:px-6 lg:px-10" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[12px] font-bold text-emerald-800">Phase 10 · فهرس مشتق من التخصصات</p>
            <h1 className="mt-2 text-[28px] font-black">الكليات والمجالات الأكاديمية</h1>
            <p className="mt-1 text-[13px] leading-7 text-slate-500">تجميع سياقات الكليات المسجلة في مصادر التخصصات، دون إنشاء هوية كلية مستقلة أو بيانات افتراضية.</p>
          </div>
          <Link to="/admin/majors" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0f5d48] px-4 text-[13px] font-extrabold text-white"><BookOpen className="h-4 w-4" />كل التخصصات</Link>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-[13px] font-extrabold"><Filter className="h-4 w-4 text-emerald-700" />التصفية حسب الدرجة</div>
          <div className="flex flex-wrap gap-2">
            {degrees.map(([value, label]) => <button key={value || 'all'} onClick={() => setDegree(value)} className={`rounded-xl px-4 py-2 text-[12px] font-bold ${degree === value ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-700'}`}>{label}</button>)}
          </div>
          <label className="relative mt-4 block"><Search className="absolute right-3 top-3.5 h-4 w-4 text-slate-400" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="ابحث في الكليات والمجالات الموثقة" className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pr-10 pl-3 text-[13px] outline-none focus:border-emerald-500" /></label>
        </section>

        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}
        {loading ? <div className="flex min-h-52 items-center justify-center gap-2 text-sm font-bold text-slate-500"><Loader2 className="h-5 w-5 animate-spin" />جاري قراءة كتالوج التخصصات...</div> : visible.length === 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-900"><AlertCircle className="mx-auto h-7 w-7" /><h2 className="mt-2 font-black">لا توجد أسماء كليات موثقة لهذه الدرجة</h2><p className="mt-1 text-sm">التخصصات موجودة، لكن ملف المصدر لا يسجل سياق الكلية. لن تُنشأ أسماء كلية بالتخمين.</p></div>
        ) : (
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map(facet => (
              <article key={facet.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3"><Building2 className="h-5 w-5 text-emerald-700" /><span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-800">{facet.majorCount} تخصص</span></div>
                <h2 className="mt-3 text-[16px] font-black leading-7">{facet.name}</h2>
                <div className="mt-3 flex flex-wrap gap-1.5">{facet.supportedDegrees.map(item => <span key={item} className="rounded bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">{degreeLabel(item)}</span>)}</div>
                <Link to={`/admin/majors?field=${encodeURIComponent(facet.name)}${degree ? `&degree=${degree}` : ''}`} className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-[12px] font-extrabold hover:border-emerald-400"><GraduationCap className="h-4 w-4" />عرض التخصصات الحقيقية</Link>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
