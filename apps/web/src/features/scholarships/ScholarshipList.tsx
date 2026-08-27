import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarDays, ChevronDown, Coins, GraduationCap, MapPin, RotateCcw, Search, Sparkles } from 'lucide-react';
import { ApiClient, type PublicScholarshipDto, type PaginatedResult } from '../../api/client';
import { Seo } from '../../components/Seo';
import { useTranslation } from '../../i18n/I18nProvider';
import { localizePathname } from '../../i18n/localeRouting';

export function ScholarshipList() {
  const { t, language } = useTranslation();
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<PaginatedResult<PublicScholarshipDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(params.get('q') || '');
  const [country, setCountry] = useState(params.get('studyCountry') || '');
  const [degree, setDegree] = useState(params.get('degreeLevel') || '');
  const [funding, setFunding] = useState(params.get('fundingCoverage') || '');
  const page = Number(params.get('page') || 1);
  const ar = language === 'ar';

  useEffect(() => {
    let active = true;
    setLoading(true);
    ApiClient.getScholarships({ studyCountry: params.get('studyCountry') || undefined, degreeLevel: params.get('degreeLevel') || undefined, fundingCoverage: params.get('fundingCoverage') || undefined, page, pageSize: 12 })
      .then((result) => active && setData(result))
      .catch((reason: unknown) => active && setError(reason instanceof Error ? reason.message : t('not_available')))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [page, params, t]);

  const apply = () => {
    const next = new URLSearchParams();
    if (query.trim()) next.set('q', query.trim());
    if (country.trim()) next.set('studyCountry', country.trim());
    if (degree) next.set('degreeLevel', degree);
    if (funding) next.set('fundingCoverage', funding);
    next.set('page', '1'); setParams(next);
  };
  const reset = () => { setQuery(''); setCountry(''); setDegree(''); setFunding(''); setParams({ page: '1' }); };
  const changePage = (value: number) => { const next = new URLSearchParams(params); next.set('page', String(value)); setParams(next); };
  const normalizedQuery = params.get('q')?.trim().toLocaleLowerCase(language) || '';
  const visibleItems = data?.data.filter((item) => !normalizedQuery || [item.displayName, item.canonicalName, item.studyCountry, item.sponsorName, item.eligibleMajorsOrFields].flat().filter(Boolean).some((value) => String(value).toLocaleLowerCase(language).includes(normalizedQuery))) || [];

  return <div className="-mx-4 -my-6 min-h-screen bg-[#f7f9fc] pb-20 sm:-my-10">
    <Seo title={t('scholarships')} description={t('browse_published_scholarships_with_funding_eligibi')} />
    <section className="relative overflow-hidden bg-gradient-to-b from-[#071d3a] via-[#0b3763] to-[#0b2a50] px-4 pb-16 pt-10 text-center text-white">
      <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full border border-[#d6ae57]/20" />
      <div className="relative mx-auto max-w-2xl"><Sparkles className="mx-auto mb-2 h-5 w-5 text-[#e3bd67]" /><h1 className="text-3xl font-black sm:text-4xl">{ar ? <>ابحث عن <span className="text-[#e3bd67]">منحتك الدراسية</span></> : <>Find your <span className="text-[#e3bd67]">scholarship</span></>}</h1><p className="mt-3 text-sm font-medium text-blue-100/85">{ar ? 'اكتشف المنح المنشورة والموثقة وابنِ مستقبلك بثقة.' : 'Discover published and verified funding opportunities.'}</p><div className="relative mx-auto mt-6 max-w-xl"><Search className="absolute top-1/2 h-5 w-5 -translate-y-1/2 text-[#b68b34] ltr:left-4 rtl:right-4" /><input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && apply()} placeholder={ar ? 'اسم المنحة، التخصص أو الدولة...' : 'Scholarship, field or country...'} className="min-h-13 w-full rounded-full border border-white/20 bg-white px-12 text-sm font-bold text-[#071d3a] outline-none focus:border-[#d6ae57]" /></div></div>
    </section>
    <section className="relative z-10 mx-auto -mt-8 max-w-5xl px-4"><div className="grid gap-3 rounded-3xl border border-[#d6ae57]/45 bg-white p-3 shadow-xl sm:grid-cols-4">
      <FilterInput icon={MapPin} label={ar ? 'الدولة' : 'Country'} value={country} onChange={setCountry} placeholder={ar ? 'كل الدول' : 'All countries'} />
      <FilterSelect icon={GraduationCap} label={ar ? 'الدرجة' : 'Degree'} value={degree} onChange={setDegree} options={[['', ar ? 'كل الدرجات' : 'All degrees'], ['BACHELORS', t('bachelors')], ['MASTERS', t('masters')], ['PHD', t('phd')]]} />
      <FilterSelect icon={Coins} label={ar ? 'التمويل' : 'Funding'} value={funding} onChange={setFunding} options={[['', ar ? 'كل التمويل' : 'All funding'], ['FULLY_FUNDED', t('fully_funded')], ['PARTIAL', t('partial')], ['TUITION_ONLY', t('tuition_only')]]} />
      <button onClick={apply} className="min-h-14 rounded-2xl bg-[#0b3763] px-4 text-sm font-black text-white hover:bg-[#071d3a]">{ar ? 'عرض النتائج' : 'Show results'}</button>
    </div></section>
    <main className="mx-auto max-w-5xl px-4 pt-10"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-black text-[#0b2a50]">{ar ? `المنح المتاحة${data ? ` (${data.total})` : ''}` : `Available scholarships${data ? ` (${data.total})` : ''}`}</h2><button onClick={reset} className="flex items-center gap-2 text-xs font-black text-[#9a7427]"><RotateCcw className="h-4 w-4" />{ar ? 'إعادة الضبط' : 'Reset'}</button></div>
      {loading ? <div className="grid gap-4 md:grid-cols-2">{[0,1,2,3].map((x) => <div key={x} className="h-72 animate-pulse rounded-3xl bg-slate-100" />)}</div> : error ? <State text={error} error /> : !visibleItems.length ? <State text={t('no_scholarships_found_matching_your_criteria')} /> : <div className="grid gap-4 md:grid-cols-2">{visibleItems.map((item) => <ScholarshipCard key={item.publicId} item={item} language={language} />)}</div>}
      {data && data.totalPages > 1 && <div className="mt-8 flex items-center justify-center gap-3"><button disabled={page <= 1} onClick={() => changePage(page - 1)} className="rounded-xl border px-4 py-2 text-sm font-bold disabled:opacity-40">{ar ? 'السابق' : 'Previous'}</button><span className="text-sm font-black text-[#0b2a50]">{page} / {data.totalPages}</span><button disabled={page >= data.totalPages} onClick={() => changePage(page + 1)} className="rounded-xl bg-[#0b3763] px-4 py-2 text-sm font-bold text-white disabled:opacity-40">{ar ? 'التالي' : 'Next'}</button></div>}
    </main>
  </div>;
}

function ScholarshipCard({ item, language }: { item: PublicScholarshipDto; language: 'ar' | 'en' }) {
  const ar = language === 'ar';
  return <article className="group flex min-h-72 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#d6ae57]/60 hover:shadow-xl"><div className="h-1.5 bg-gradient-to-r from-[#0b3763] via-[#d6ae57] to-[#0b3763]" /><div className="flex flex-1 flex-col p-5"><div className="mb-4 flex items-start justify-between gap-3"><span className="rounded-full bg-[#eaf1f8] px-3 py-1.5 text-[11px] font-black text-[#0b3763]">{item.fundingCoverage}</span>{item.applicationDeadline && <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600"><CalendarDays className="h-3.5 w-3.5" />{new Date(item.applicationDeadline).toLocaleDateString(language)}</span>}</div><h3 className="text-xl font-black leading-8 text-[#0b2a50]">{item.displayName}</h3><p className="mt-3 line-clamp-3 text-sm font-medium leading-7 text-slate-500">{item.coverageDetails}</p><div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold text-slate-600">{item.studyCountry && <span className="rounded-full bg-slate-100 px-3 py-1.5">{item.studyCountry}</span>}<span className="rounded-full bg-[#fbf5e6] px-3 py-1.5 text-[#8b6721]">{item.degreeLevel}</span></div><Link to={localizePathname(`/scholarships/${item.slug}`, language)} className="mt-auto pt-5"><span className="flex min-h-11 items-center justify-center rounded-xl bg-[#0b3763] px-4 text-sm font-black text-white group-hover:bg-[#071d3a]">{ar ? 'عرض تفاصيل المنحة' : 'View scholarship details'}</span></Link></div></article>;
}
function FilterInput({ icon: Icon, label, value, onChange, placeholder }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; onChange: (v: string) => void; placeholder: string }) { return <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 px-3"><Icon className="h-5 w-5 text-[#b68b34]" /><span className="sr-only">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full border-0 bg-transparent text-xs font-bold outline-none" /></label>; }
function FilterSelect({ icon: Icon, label, value, onChange, options }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; onChange: (v: string) => void; options: string[][] }) { return <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 px-3"><Icon className="h-5 w-5 text-[#b68b34]" /><span className="sr-only">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="w-full appearance-none bg-transparent text-xs font-bold outline-none">{options.map(([v,x]) => <option key={v} value={v}>{x}</option>)}</select><ChevronDown className="h-4 w-4 text-slate-400" /></label>; }
function State({ text, error = false }: { text: string; error?: boolean }) { return <div className={`rounded-3xl border border-dashed px-6 py-16 text-center text-sm font-bold ${error ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-300 bg-white text-slate-500'}`}>{text}</div>; }
