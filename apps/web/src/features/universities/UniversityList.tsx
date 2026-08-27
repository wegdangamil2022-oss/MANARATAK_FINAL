import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Building2, Globe2, MapPin, RotateCcw, Search, Sparkles } from 'lucide-react';
import { type PaginatedResult, type PublicUniversityDto } from '../../api/client';
import { getLocalizedUniversities } from '../../api/localizedEntities';
import { useTranslation } from '../../i18n/I18nProvider';
import { localizePathname } from '../../i18n/localeRouting';

export function UniversityList() {
  const { t, language } = useTranslation();
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<PaginatedResult<PublicUniversityDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(params.get('q') || '');
  const [country, setCountry] = useState(params.get('country') || '');
  const [type, setType] = useState(params.get('institutionType') || '');
  const [city, setCity] = useState(params.get('city') || '');
  const page = Number(params.get('page') || 1);
  const ar = language === 'ar';

  useEffect(() => { let active = true; setLoading(true); getLocalizedUniversities({ country: params.get('country') || undefined, institutionType: params.get('institutionType') || undefined, city: params.get('city') || undefined, page, pageSize: 12 }, language).then((x) => active && setData(x)).catch((reason: unknown) => active && setError(reason instanceof Error ? reason.message : t('not_available'))).finally(() => active && setLoading(false)); return () => { active = false; }; }, [language, page, params, t]);
  const apply = () => { const next = new URLSearchParams(); if (query.trim()) next.set('q', query.trim()); if (country.trim()) next.set('country', country.trim()); if (type.trim()) next.set('institutionType', type.trim()); if (city.trim()) next.set('city', city.trim()); next.set('page', '1'); setParams(next); };
  const reset = () => { setQuery(''); setCountry(''); setType(''); setCity(''); setParams({ page: '1' }); };
  const q = params.get('q')?.trim().toLocaleLowerCase(language) || '';
  const items = data?.data.filter((x) => !q || [x.displayName, x.canonicalName, x.country, x.city, x.description].filter(Boolean).some((v) => String(v).toLocaleLowerCase(language).includes(q))) || [];
  const changePage = (value: number) => { const next = new URLSearchParams(params); next.set('page', String(value)); setParams(next); };

  return <div className="-mx-4 -my-6 min-h-screen bg-[#f7f9fc] pb-20 sm:-my-10">
    <section className="relative overflow-hidden bg-gradient-to-b from-[#071d3a] via-[#0b3763] to-[#0b2a50] px-4 pb-16 pt-10 text-center text-white"><div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-[#d6ae57]/20" /><div className="relative mx-auto max-w-2xl"><Sparkles className="mx-auto mb-2 h-5 w-5 text-[#e3bd67]" /><h1 className="text-3xl font-black sm:text-4xl">{ar ? <>اكتشف <span className="text-[#e3bd67]">جامعتك القادمة</span></> : <>Discover your <span className="text-[#e3bd67]">next university</span></>}</h1><p className="mt-3 text-sm font-medium text-blue-100/85">{ar ? 'استكشف الجامعات المنشورة وبياناتها الأكاديمية ومصادرها الرسمية.' : 'Explore published universities and their official academic profiles.'}</p><div className="relative mx-auto mt-6 max-w-xl"><Search className="absolute top-1/2 h-5 w-5 -translate-y-1/2 text-[#b68b34] ltr:left-4 rtl:right-4" /><input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && apply()} placeholder={ar ? 'اسم الجامعة، الدولة أو المدينة...' : 'University, country or city...'} className="min-h-13 w-full rounded-full bg-white px-12 text-sm font-bold text-[#071d3a] outline-none" /></div></div></section>
    <section className="relative z-10 mx-auto -mt-8 max-w-5xl px-4"><div className="grid gap-3 rounded-3xl border border-[#d6ae57]/45 bg-white p-3 shadow-xl sm:grid-cols-4"><Input icon={Globe2} label={ar ? 'الدولة' : 'Country'} value={country} onChange={setCountry} /><Input icon={MapPin} label={ar ? 'المدينة' : 'City'} value={city} onChange={setCity} /><Input icon={Building2} label={ar ? 'نوع المؤسسة' : 'Institution type'} value={type} onChange={setType} /><button onClick={apply} className="min-h-14 rounded-2xl bg-[#0b3763] text-sm font-black text-white">{ar ? 'عرض الجامعات' : 'Show universities'}</button></div></section>
    <main className="mx-auto max-w-5xl px-4 pt-10"><div className="mb-5 flex justify-between"><h2 className="text-xl font-black text-[#0b2a50]">{ar ? `الجامعات المتاحة${data ? ` (${data.total})` : ''}` : `Available universities${data ? ` (${data.total})` : ''}`}</h2><button onClick={reset} className="flex items-center gap-2 text-xs font-black text-[#9a7427]"><RotateCcw className="h-4 w-4" />{ar ? 'إعادة الضبط' : 'Reset'}</button></div>
      {loading ? <div className="grid gap-4 md:grid-cols-2">{[0,1,2,3].map((x) => <div key={x} className="h-60 animate-pulse rounded-3xl bg-slate-100" />)}</div> : error ? <State text={error} error /> : !items.length ? <State text={t('no_universities_found_matching_your_criteria')} /> : <div className="grid gap-4 md:grid-cols-2">{items.map((item) => <UniversityCard key={item.publicId} item={item} language={language} />)}</div>}
      {data && data.totalPages > 1 && <div className="mt-8 flex items-center justify-center gap-3"><button disabled={page <= 1} onClick={() => changePage(page - 1)} className="rounded-xl border px-4 py-2 text-sm font-bold disabled:opacity-40">{ar ? 'السابق' : 'Previous'}</button><span className="text-sm font-black">{page} / {data.totalPages}</span><button disabled={page >= data.totalPages} onClick={() => changePage(page + 1)} className="rounded-xl bg-[#0b3763] px-4 py-2 text-sm font-bold text-white disabled:opacity-40">{ar ? 'التالي' : 'Next'}</button></div>}
    </main>
  </div>;
}
function UniversityCard({ item, language }: { item: PublicUniversityDto; language: 'ar' | 'en' }) { const ar = language === 'ar'; return <Link to={localizePathname(`/universities/${item.slug}`, language)} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#d6ae57]/60 hover:shadow-xl"><div className="flex min-h-40 items-center justify-center bg-gradient-to-br from-[#eaf1f8] to-white"><div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#0b3763] text-[#e3bd67] shadow-lg"><Building2 className="h-10 w-10" /></div></div><div className="p-5"><div className="mb-2 flex gap-2 text-[11px] font-black"><span className="rounded-full bg-[#fbf5e6] px-3 py-1 text-[#8b6721]">{item.country}</span><span className="rounded-full bg-[#eaf1f8] px-3 py-1 text-[#0b3763]">{item.institutionType}</span></div><h3 className="text-xl font-black text-[#0b2a50]">{item.displayName}</h3><p className="mt-2 line-clamp-2 text-sm font-medium leading-7 text-slate-500">{item.description || item.city}</p><span className="mt-4 inline-flex text-xs font-black text-[#0b3763]">{ar ? 'عرض الجامعة' : 'View university'}</span></div></Link>; }
function Input({ icon: Icon, label, value, onChange }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; onChange: (v: string) => void }) { return <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 px-3"><Icon className="h-5 w-5 text-[#b68b34]" /><input aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} placeholder={label} className="w-full border-0 bg-transparent text-xs font-bold outline-none" /></label>; }
function State({ text, error = false }: { text: string; error?: boolean }) { return <div className={`rounded-3xl border border-dashed px-6 py-16 text-center text-sm font-bold ${error ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-300 bg-white text-slate-500'}`}>{text}</div>; }
