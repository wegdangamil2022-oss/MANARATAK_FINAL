import { FormEvent, useCallback, useEffect, useState } from 'react';
import { adminApiClient } from '../../api/client';

interface ContentSummary { id: string; title: string; status: string; updatedAt: string }
interface Redirect { id: string; sourcePath: string; destinationPath: string; statusCode: number; active: boolean }
interface NavigationMenu { id: string; locationKey: string; status: string; version: number; nodes: Array<{ id: string; displayText: string; targetValue: string }> }
interface BlockSchema { id: string; key: string; version: number; nameAr: string; status: string }
interface ContentBlock { id: string; name: string; status: string; version: number }
interface Announcement { id: string; title: string; urgency: string; status: string; startsAt: string; expiresAt?: string | null; version: number }
interface List<T> { data: T[] }

const input = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100';
const button = 'rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50';

export function CmsOperationsPanels({ contents }: { contents: ContentSummary[] }) {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [navigation, setNavigation] = useState<NavigationMenu[]>([]);
  const [schemas, setSchemas] = useState<BlockSchema[]>([]);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [redirectResult, navigationResult, schemaResult, blockResult, announcementResult] = await Promise.all([
        adminApiClient.request<List<Redirect>>('/admin/cms/redirects?siteIdentifier=manaratak&locale=ar'),
        adminApiClient.request<List<NavigationMenu>>('/admin/cms/navigation?siteIdentifier=manaratak&locale=ar'),
        adminApiClient.request<List<BlockSchema>>('/admin/cms/block-schemas'),
        adminApiClient.request<List<ContentBlock>>('/admin/cms/blocks?siteIdentifier=manaratak&locale=ar'),
        adminApiClient.request<List<Announcement>>('/admin/cms/announcements?siteIdentifier=manaratak&locale=ar'),
      ]);
      setRedirects(redirectResult.data);
      setNavigation(navigationResult.data);
      setSchemas(schemaResult.data);
      setBlocks(blockResult.data);
      setAnnouncements(announcementResult.data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'تعذر تحميل عمليات المحتوى.');
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const submit = async (operation: () => Promise<unknown>, success: string) => {
    setBusy(true); setError(null); setNotice(null);
    try { await operation(); setNotice(success); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'تعذر إكمال العملية.'); }
    finally { setBusy(false); }
  };

  const createRedirect = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    void submit(() => adminApiClient.request('/admin/cms/redirects', { method: 'POST', body: JSON.stringify({ siteIdentifier: 'manaratak', locale: 'ar', sourcePath: form.get('sourcePath'), destinationPath: form.get('destinationPath'), statusCode: 301, reason: form.get('reason'), active: true }) }), 'تم حفظ التحويل الدائم.');
  };

  const saveNavigation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    void submit(() => adminApiClient.request('/admin/cms/navigation', { method: 'PUT', body: JSON.stringify({ siteIdentifier: 'manaratak', locale: 'ar', locationKey: form.get('locationKey'), status: 'DRAFT', nodes: [{ displayText: form.get('displayText'), targetType: 'CMS_CONTENT', targetValue: form.get('targetValue'), sortOrder: 0, openInNewWindow: false }] }) }), 'تم حفظ قائمة التنقل كمسودة.');
  };

  const createSchema = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    void submit(() => adminApiClient.request('/admin/cms/block-schemas', { method: 'POST', body: JSON.stringify({ key: form.get('key'), version: 1, nameAr: form.get('nameAr'), nameEn: form.get('nameEn'), fieldSchema: { title: { type: 'string', required: true } }, localizedFields: ['title'], assetFields: [], status: 'ACTIVE' }) }), 'تم إنشاء مخطط الكتلة.');
  };

  const createBlock = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    void submit(() => adminApiClient.request('/admin/cms/blocks', { method: 'PUT', body: JSON.stringify({ siteIdentifier: 'manaratak', locale: 'ar', schemaId: form.get('schemaId'), name: form.get('name'), payload: { title: form.get('title') }, status: 'DRAFT' }) }), 'تم حفظ الكتلة الديناميكية كمسودة.');
  };

  const createAnnouncement = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    void submit(() => adminApiClient.request('/admin/cms/announcements', { method: 'PUT', body: JSON.stringify({ siteIdentifier: 'manaratak', locale: 'ar', title: form.get('title'), body: form.get('body'), urgency: form.get('urgency'), startsAt: new Date().toISOString(), status: 'DRAFT' }) }), 'تم حفظ الإعلان كمسودة؛ لا يوجد نشر تلقائي.');
  };

  const reviewQueue = contents.filter((item) => item.status === 'IN_REVIEW' || item.status === 'READY_TO_PUBLISH');
  const calendar = contents.filter((item) => item.status === 'SCHEDULED');

  return (
    <section aria-labelledby="cms-operations" className="space-y-5">
      <div className="rounded-3xl bg-emerald-950 p-6 text-white">
        <h2 id="cms-operations" className="text-2xl font-black">مركز عمليات المحتوى</h2>
        <p className="mt-2 text-sm text-emerald-100">المراجعات والجدولة والتنقل والتحويلات والكتل والإعلانات من عقود الخادم الحقيقية.</p>
      </div>
      {notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{notice}</p>}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <Card title="طابور المراجعة">
          <Items empty="لا توجد مواد بانتظار المراجعة." items={reviewQueue.map((x) => `${x.title} — ${x.status}`)} />
        </Card>
        <Card title="تقويم النشر">
          <Items empty="لا توجد مواد مجدولة." items={calendar.map((x) => `${x.title} — ${new Date(x.updatedAt).toLocaleDateString('ar')}`)} />
        </Card>
        <Card title="التحويلات الدائمة">
          <form onSubmit={createRedirect} className="space-y-2">
            <input className={input} name="sourcePath" dir="ltr" required placeholder="/ar/old-path" />
            <input className={input} name="destinationPath" dir="ltr" required placeholder="/ar/new-path" />
            <input className={input} name="reason" required minLength={3} placeholder="سبب التحويل" />
            <button className={button} disabled={busy}>حفظ التحويل</button>
          </form>
          <Items empty="لا توجد تحويلات." items={redirects.slice(0, 4).map((x) => `${x.sourcePath} ← ${x.destinationPath}`)} />
        </Card>
        <Card title="قوائم التنقل">
          <form onSubmit={saveNavigation} className="space-y-2">
            <select className={input} name="locationKey"><option value="HEADER">الرأس</option><option value="FOOTER">التذييل</option><option value="SIDEBAR">الجانبي</option></select>
            <input className={input} name="displayText" required placeholder="نص الرابط" />
            <input className={input} name="targetValue" dir="ltr" required placeholder="معرّف المحتوى" />
            <button className={button} disabled={busy}>حفظ كمسودة</button>
          </form>
          <Items empty="لا توجد قوائم." items={navigation.map((x) => `${x.locationKey} — ${x.status} — ${x.nodes.length} روابط`)} />
        </Card>
        <Card title="مخططات وكتل المحتوى">
          <form onSubmit={createSchema} className="space-y-2">
            <input className={input} name="key" dir="ltr" pattern="[A-Z][A-Z0-9_]+" required placeholder="HERO_BANNER" />
            <input className={input} name="nameAr" required placeholder="الاسم العربي" />
            <input className={input} name="nameEn" dir="ltr" required placeholder="English name" />
            <button className={button} disabled={busy}>إنشاء مخطط</button>
          </form>
          {schemas.length > 0 && <form onSubmit={createBlock} className="mt-3 space-y-2 border-t pt-3">
            <select className={input} name="schemaId">{schemas.map((x) => <option key={x.id} value={x.id}>{x.nameAr} v{x.version}</option>)}</select>
            <input className={input} name="name" required placeholder="اسم الكتلة" />
            <input className={input} name="title" required placeholder="عنوان الكتلة" />
            <button className={button} disabled={busy}>حفظ الكتلة</button>
          </form>}
          <Items empty="لا توجد كتل." items={blocks.map((x) => `${x.name} — ${x.status}`)} />
        </Card>
        <Card title="الإعلانات المؤسسية">
          <form onSubmit={createAnnouncement} className="space-y-2">
            <input className={input} name="title" required placeholder="عنوان الإعلان" />
            <textarea className={input} name="body" required placeholder="نص الإعلان" />
            <select className={input} name="urgency"><option value="LOW">منخفض</option><option value="MEDIUM">متوسط</option><option value="HIGH">مرتفع</option><option value="CRITICAL">حرج</option></select>
            <button className={button} disabled={busy}>حفظ كمسودة</button>
          </form>
          <Items empty="لا توجد إعلانات." items={announcements.map((x) => `${x.title} — ${x.status}`)} />
        </Card>
      </div>
    </section>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"><h3 className="mb-4 text-lg font-black text-emerald-950">{title}</h3>{children}</section>;
}
function Items({ items, empty }: { items: string[]; empty: string }) {
  return items.length ? <ul className="mt-4 space-y-2 text-sm text-slate-600">{items.map((item) => <li className="rounded-lg bg-slate-50 p-2" key={item}>{item}</li>)}</ul> : <p className="mt-4 text-sm text-slate-400">{empty}</p>;
}
