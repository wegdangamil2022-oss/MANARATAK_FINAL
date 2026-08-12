import { FormEvent, useEffect, useState } from 'react';
import { adminApiClient } from '../api/client';
import { Archive, CheckCircle2, Edit3, Filter, Loader2, Plus, Send } from 'lucide-react';
import { useTranslation } from "../i18n/I18nProvider";

interface CmsContent {
  id: string;
  publicId: string;
  slug: string;
  contentType: string;
  status: string;
  title: string;
  summary?: string | null;
  categorySlug?: string | null;
  featuredAssetId?: string | null;
  publishedAt?: string | null;
  updatedAt: string;
}

interface CmsListResponse {
  data: CmsContent[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function CmsAdminPage() {
    const { t } = useTranslation();
  const [content, setContent] = useState<CmsListResponse | null>(null);
  const [selectedContent, setSelectedContent] = useState<CmsContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState({
    title: '',
    slug: '',
    contentType: 'ARTICLE',
    summary: '',
    categorySlug: '',
    featuredAssetId: ''
  });

  const [localizedForm, setLocalizedForm] = useState({
    locale: 'en',
    title: '',
    summary: '',
    body: '',
    readingTimeMinutes: '5'
  });

  const loadContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: '1', pageSize: '20' });
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('contentType', typeFilter);
      const response = await adminApiClient.request<CmsListResponse>(`/admin/cms/content?${params.toString()}`);
      setContent(response);
    } catch (err: any) {
      setError(err.message || 'Unable to load CMS content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [statusFilter, typeFilter]);

  const createContent = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const created = await adminApiClient.request<CmsContent>('/admin/cms/content', {
        method: 'POST',
        body: JSON.stringify({
          title: createForm.title.trim(),
          slug: createForm.slug.trim(),
          contentType: createForm.contentType,
          summary: createForm.summary.trim() || null,
          categorySlug: createForm.categorySlug.trim() || null,
          featuredAssetId: createForm.featuredAssetId.trim() || null
        })
      });
      setMessage(`Created CMS content: ${created.title}`);
      setSelectedContent(created);
      setLocalizedForm((current) => ({
        ...current,
        title: created.title,
        summary: created.summary || ''
      }));
      setCreateForm({ title: '', slug: '', contentType: 'ARTICLE', summary: '', categorySlug: '', featuredAssetId: '' });
      await loadContent();
    } catch (err: any) {
      setError(err.message || 'Unable to create CMS content.');
    } finally {
      setSaving(false);
    }
  };

  const saveLocalizedPayload = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedContent) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await adminApiClient.request(`/admin/cms/content/${selectedContent.id}/localized`, {
        method: 'PUT',
        body: JSON.stringify({
          locale: localizedForm.locale.trim(),
          title: localizedForm.title.trim(),
          summary: localizedForm.summary.trim() || null,
          body: localizedForm.body,
          readingTimeMinutes: localizedForm.readingTimeMinutes ? Number(localizedForm.readingTimeMinutes) : null
        })
      });
      setMessage(`Localized payload saved for ${selectedContent.title}`);
    } catch (err: any) {
      setError(err.message || 'Unable to save localized payload.');
    } finally {
      setSaving(false);
    }
  };

  const publishContent = async (id: string) => {
    await transitionContent(id, 'publish');
  };

  const archiveContent = async (id: string) => {
    await transitionContent(id, 'archive');
  };

  const transitionContent = async (id: string, action: 'publish' | 'archive') => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await adminApiClient.request<CmsContent>(`/admin/cms/content/${id}/${action}`, { method: 'POST' });
      setMessage(`${action === 'publish' ? 'Published' : 'Archived'}: ${updated.title}`);
      setSelectedContent(updated);
      await loadContent();
    } catch (err: any) {
      setError(err.message || `Unable to ${action} CMS content.`);
    } finally {
      setSaving(false);
    }
  };

  const selectContent = (item: CmsContent) => {
    setSelectedContent(item);
    setLocalizedForm({
      locale: 'en',
      title: item.title,
      summary: item.summary || '',
      body: '',
      readingTimeMinutes: '5'
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t('cms_editorial_content')}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('create_and_publish_articles_guides_faqs_and_static')}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-black">
              <option value="">{t('all_statuses')}</option>
              <option value="DRAFT">{t('draft')}</option>
              <option value="IN_REVIEW">{t('in_review')}</option>
              <option value="PUBLISHED">{t('published')}</option>
              <option value="ARCHIVED">{t('archived')}</option>
            </select>
            <Filter className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-black">
              <option value="">{t('all_types')}</option>
              <option value="ARTICLE">{t('article')}</option>
              <option value="STUDY_GUIDE">{t('study_guide')}</option>
              <option value="NEWS">{t('news')}</option>
              <option value="FAQ">{t('faq')}</option>
              <option value="CHECKLIST">{t('checklist')}</option>
              <option value="STATIC_PAGE">{t('static_page')}</option>
            </select>
            <Filter className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{message}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {loading && !content ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3 font-medium">{t('content')}</th>
                  <th className="px-6 py-3 font-medium">{t('type')}</th>
                  <th className="px-6 py-3 font-medium">{t('status')}</th>
                  <th className="px-6 py-3 font-medium">{t('updated')}</th>
                  <th className="px-6 py-3 font-medium text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {content?.data.length ? content.data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.title}</div>
                      <div className="text-xs text-gray-500">/{item.slug}</div>
                    </td>
                    <td className="px-6 py-4">{formatLabel(item.contentType)}</td>
                    <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(item.updatedAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => selectContent(item)} className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
                          <Edit3 className="h-4 w-4" /> {t('edit')}</button>
                        <button onClick={() => publishContent(item.id)} disabled={saving || item.status === 'PUBLISHED'} className="text-green-600 hover:text-green-800 disabled:opacity-40 inline-flex items-center gap-1">
                          <Send className="h-4 w-4" /> {t('publish')}</button>
                        <button onClick={() => archiveContent(item.id)} disabled={saving || item.status === 'ARCHIVED'} className="text-red-600 hover:text-red-800 disabled:opacity-40 inline-flex items-center gap-1">
                          <Archive className="h-4 w-4" /> {t('archive')}</button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">{t('no_cms_content_yet')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="space-y-6">
          <form onSubmit={createContent} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold">{t('create_content')}</h3>
            </div>
            <Field label={t('title')} value={createForm.title} onChange={(value) => setCreateForm({ ...createForm, title: value, slug: createForm.slug || slugify(value) })} />
            <Field label={t('slug')} value={createForm.slug} onChange={(value) => setCreateForm({ ...createForm, slug: value })} />
            <label className="block">
              <span className="text-sm font-medium text-gray-700">{t('content_type')}</span>
              <select value={createForm.contentType} onChange={(event) => setCreateForm({ ...createForm, contentType: event.target.value })} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option value="ARTICLE">{t('article')}</option>
                <option value="STUDY_GUIDE">{t('study_guide')}</option>
                <option value="NEWS">{t('news')}</option>
                <option value="FAQ">{t('faq')}</option>
                <option value="CHECKLIST">{t('checklist')}</option>
                <option value="STATIC_PAGE">{t('static_page')}</option>
              </select>
            </label>
            <TextArea label={t('summary')} value={createForm.summary} onChange={(value) => setCreateForm({ ...createForm, summary: value })} rows={3} />
            <Field label={t('category_slug')} value={createForm.categorySlug} onChange={(value) => setCreateForm({ ...createForm, categorySlug: value })} optional />
            <Field label={t('featured_asset_id')} value={createForm.featuredAssetId} onChange={(value) => setCreateForm({ ...createForm, featuredAssetId: value })} optional />
            <button type="submit" disabled={saving || !createForm.title || !createForm.slug} className="w-full inline-flex items-center justify-center gap-2 bg-black text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {t('create_draft')}</button>
          </form>

          <form onSubmit={saveLocalizedPayload} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-4">
            <h3 className="font-bold">{t('localized_payload')}</h3>
            <p className="text-xs text-gray-500">{selectedContent ? `Editing: ${selectedContent.title}` : 'Select or create content first.'}</p>
            <Field label={t('locale')} value={localizedForm.locale} onChange={(value) => setLocalizedForm({ ...localizedForm, locale: value })} />
            <Field label={t('localized_title')} value={localizedForm.title} onChange={(value) => setLocalizedForm({ ...localizedForm, title: value })} />
            <TextArea label={t('localized_summary')} value={localizedForm.summary} onChange={(value) => setLocalizedForm({ ...localizedForm, summary: value })} rows={3} />
            <TextArea label={t('body')} value={localizedForm.body} onChange={(value) => setLocalizedForm({ ...localizedForm, body: value })} rows={8} />
            <Field label={t('reading_time_minutes')} value={localizedForm.readingTimeMinutes} onChange={(value) => setLocalizedForm({ ...localizedForm, readingTimeMinutes: value })} />
            <button type="submit" disabled={saving || !selectedContent || !localizedForm.body} className="w-full inline-flex items-center justify-center gap-2 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-50">
              {t('save_localized_content')}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, optional }: { label: string; value: string; onChange: (value: string) => void; optional?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}{optional ? ' (optional)' : ''}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black" />
    </label>
  );
}

function TextArea({ label, value, onChange, rows }: { label: string; value: string; onChange: (value: string) => void; rows: number }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <textarea value={value} rows={rows} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black" />
    </label>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color = status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : status === 'ARCHIVED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>{formatLabel(status)}</span>;
}

function formatLabel(value: string): string {
  return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(value));
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
