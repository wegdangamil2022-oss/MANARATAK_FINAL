import { FormEvent, useEffect, useState } from 'react';
import { adminApiClient } from '../api/client';
import { Archive, CheckCircle2, Edit3, Filter, Loader2, Plus, Send, XCircle } from 'lucide-react';
import { useTranslation } from "../i18n/I18nProvider";

type ServiceCategory = 'STUDENT_SERVICES' | 'DOCUMENT_SERVICES' | 'VISA_SERVICES' | 'TRAVEL_SERVICES' | 'ACADEMIC_SERVICES' | 'AUXILIARY_PROFESSIONAL_SERVICES' | 'ENTERPRISE_OPERATIONAL_SERVICES';
type ServiceStatus = 'IMPORTED' | 'READY_TO_REVIEW' | 'READY_TO_PUBLISH' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';
type ServiceCompletenessStatus = 'INCOMPLETE' | 'COMPLETE' | 'NEEDS_REVIEW';
type ServiceFulfillmentType = 'CONSULTATION' | 'DOCUMENT_PROCESSING' | 'BOOKING_OR_APPOINTMENT' | 'DIGITAL_DELIVERABLE' | 'MANUAL_FULFILLMENT' | 'HYBRID_WORKFLOW';
type ServiceDeliveryMode = 'ONLINE' | 'IN_PERSON' | 'HYBRID' | 'EXTERNAL_COORDINATION';
type ServiceAvailabilityStatus = 'AVAILABLE' | 'COMING_SOON' | 'LIMITED' | 'UNAVAILABLE';

interface ServiceCatalogItem {
  id: string;
  publicId: string;
  slug: string;
  displayName: string;
  serviceCategory: ServiceCategory;
  fulfillmentType: ServiceFulfillmentType;
  serviceDescription: string;
  serviceAvailabilityStatus: ServiceAvailabilityStatus;
  requiredInputsOrDocuments: string[];
  deliveryMode: ServiceDeliveryMode;
  responsibleServiceOwnerType: string;
  status: ServiceStatus;
  completenessStatus: ServiceCompletenessStatus;
  providerName?: string | null;
  estimatedDeliveryTime?: string | null;
  appointmentRequired?: boolean | null;
  supportedCountries?: string[] | null;
  supportedLanguages?: string[] | null;
  pricingReferenceId?: string | null;
  thumbnailAssetId?: string | null;
  updatedAt: string;
}

interface ServiceListResponse {
  data: ServiceCatalogItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const serviceCategories: ServiceCategory[] = ['STUDENT_SERVICES', 'DOCUMENT_SERVICES', 'VISA_SERVICES', 'TRAVEL_SERVICES', 'ACADEMIC_SERVICES', 'AUXILIARY_PROFESSIONAL_SERVICES', 'ENTERPRISE_OPERATIONAL_SERVICES'];
const fulfillmentTypes: ServiceFulfillmentType[] = ['CONSULTATION', 'DOCUMENT_PROCESSING', 'BOOKING_OR_APPOINTMENT', 'DIGITAL_DELIVERABLE', 'MANUAL_FULFILLMENT', 'HYBRID_WORKFLOW'];
const deliveryModes: ServiceDeliveryMode[] = ['ONLINE', 'IN_PERSON', 'HYBRID', 'EXTERNAL_COORDINATION'];
const availabilityStatuses: ServiceAvailabilityStatus[] = ['AVAILABLE', 'COMING_SOON', 'LIMITED', 'UNAVAILABLE'];

const emptyForm = {
  displayName: '',
  serviceCategory: 'STUDENT_SERVICES' as ServiceCategory,
  fulfillmentType: 'CONSULTATION' as ServiceFulfillmentType,
  serviceDescription: '',
  serviceAvailabilityStatus: 'AVAILABLE' as ServiceAvailabilityStatus,
  requiredInputsOrDocuments: '',
  deliveryMode: 'ONLINE' as ServiceDeliveryMode,
  responsibleServiceOwnerType: 'MANARATAK_TEAM',
  providerName: '',
  estimatedDeliveryTime: '',
  appointmentRequired: false,
  supportedCountries: '',
  supportedLanguages: '',
  pricingReferenceId: '',
  thumbnailAssetId: ''
};

export function ServicesAdminPage() {
    const { t } = useTranslation();
  const [services, setServices] = useState<ServiceListResponse | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceCatalogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const loadServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: '1', pageSize: '20' });
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('serviceCategory', categoryFilter);
      const response = await adminApiClient.request<ServiceListResponse>(`/admin/services?${params.toString()}`);
      setServices(response);
    } catch (err: any) {
      setError(err.message || 'Unable to load services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [statusFilter, categoryFilter]);

  const createService = async (event: FormEvent) => {
    event.preventDefault();
    await saveService('create');
  };

  const updateService = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedService) return;
    await saveService('update');
  };

  const saveService = async (mode: 'create' | 'update') => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const payload = buildPayload();
      const endpoint = mode === 'create' ? '/admin/services' : `/admin/services/${selectedService?.id}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';
      const saved = await adminApiClient.request<ServiceCatalogItem>(endpoint, {
        method,
        body: JSON.stringify(payload)
      });
      setSelectedService(saved);
      setMessage(`${mode === 'create' ? 'Created' : 'Saved'} service: ${saved.displayName}`);
      if (mode === 'create') setForm(emptyForm);
      await loadServices();
    } catch (err: any) {
      setError(err.message || 'Unable to save service.');
    } finally {
      setSaving(false);
    }
  };

  const transitionService = async (id: string, action: 'mark-ready' | 'mark-publishable' | 'publish' | 'unpublish' | 'reject' | 'archive') => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await adminApiClient.request(`/admin/services/${id}/${action}`, { method: 'POST' });
      setMessage(`Service action completed: ${formatLabel(action)}`);
      await loadServices();
    } catch (err: any) {
      setError(err.message || 'Unable to update service lifecycle.');
    } finally {
      setSaving(false);
    }
  };

  const selectService = (service: ServiceCatalogItem) => {
    setSelectedService(service);
    setForm({
      displayName: service.displayName,
      serviceCategory: service.serviceCategory,
      fulfillmentType: service.fulfillmentType,
      serviceDescription: service.serviceDescription,
      serviceAvailabilityStatus: service.serviceAvailabilityStatus,
      requiredInputsOrDocuments: service.requiredInputsOrDocuments.join(', '),
      deliveryMode: service.deliveryMode,
      responsibleServiceOwnerType: service.responsibleServiceOwnerType,
      providerName: service.providerName || '',
      estimatedDeliveryTime: service.estimatedDeliveryTime || '',
      appointmentRequired: Boolean(service.appointmentRequired),
      supportedCountries: (service.supportedCountries || []).join(', '),
      supportedLanguages: (service.supportedLanguages || []).join(', '),
      pricingReferenceId: service.pricingReferenceId || '',
      thumbnailAssetId: service.thumbnailAssetId || ''
    });
  };

  const buildPayload = () => ({
    displayName: form.displayName.trim(),
    serviceCategory: form.serviceCategory,
    fulfillmentType: form.fulfillmentType,
    serviceDescription: form.serviceDescription.trim(),
    serviceAvailabilityStatus: form.serviceAvailabilityStatus,
    requiredInputsOrDocuments: splitList(form.requiredInputsOrDocuments),
    deliveryMode: form.deliveryMode,
    responsibleServiceOwnerType: form.responsibleServiceOwnerType.trim(),
    providerName: form.providerName.trim() || null,
    estimatedDeliveryTime: form.estimatedDeliveryTime.trim() || null,
    appointmentRequired: form.appointmentRequired,
    supportedCountries: splitList(form.supportedCountries),
    supportedLanguages: splitList(form.supportedLanguages),
    pricingReferenceId: form.pricingReferenceId.trim() || null,
    thumbnailAssetId: form.thumbnailAssetId.trim() || null
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t('enterprise_services')}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('manage_service_catalog_items_readiness_publication')}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-black">
              <option value="">{t('all_statuses')}</option>
              {['IMPORTED', 'READY_TO_REVIEW', 'READY_TO_PUBLISH', 'PUBLISHED', 'REJECTED', 'ARCHIVED'].map((status) => <option key={status} value={status}>{formatLabel(status)}</option>)}
            </select>
            <Filter className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-black">
              <option value="">{t('all_categories')}</option>
              {serviceCategories.map((category) => <option key={category} value={category}>{formatLabel(category)}</option>)}
            </select>
            <Filter className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{message}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {loading && !services ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-3 font-medium">{t('service')}</th>
                    <th className="px-6 py-3 font-medium">{t('category')}</th>
                    <th className="px-6 py-3 font-medium">{t('delivery')}</th>
                    <th className="px-6 py-3 font-medium">{t('status')}</th>
                    <th className="px-6 py-3 font-medium">{t('updated')}</th>
                    <th className="px-6 py-3 font-medium text-right">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {services?.data.length ? services.data.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50 align-top">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{service.displayName}</div>
                        <div className="text-xs text-gray-500">/{service.slug}</div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">{service.serviceDescription}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{formatLabel(service.serviceCategory)}</td>
                      <td className="px-6 py-4 text-gray-600">
                        <div>{formatLabel(service.deliveryMode)}</div>
                        <div className="text-xs text-gray-500">{formatLabel(service.fulfillmentType)}</div>
                      </td>
                      <td className="px-6 py-4 space-y-2">
                        <StatusBadge status={service.status} />
                        <CompletenessBadge status={service.completenessStatus} />
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(service.updatedAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button onClick={() => selectService(service)} className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
                            <Edit3 className="h-4 w-4" /> {t('edit')}</button>
                          <button onClick={() => transitionService(service.id, 'mark-publishable')} disabled={saving || service.completenessStatus !== 'COMPLETE'} className="text-indigo-600 hover:text-indigo-800 disabled:opacity-40 inline-flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" /> {t('ready')}</button>
                          <button onClick={() => transitionService(service.id, 'publish')} disabled={saving || service.status !== 'READY_TO_PUBLISH'} className="text-green-600 hover:text-green-800 disabled:opacity-40 inline-flex items-center gap-1">
                            <Send className="h-4 w-4" /> {t('publish')}</button>
                          <button onClick={() => transitionService(service.id, 'reject')} disabled={saving || service.status === 'PUBLISHED'} className="text-red-600 hover:text-red-800 disabled:opacity-40 inline-flex items-center gap-1">
                            <XCircle className="h-4 w-4" /> {t('reject')}</button>
                          <button onClick={() => transitionService(service.id, 'archive')} disabled={saving} className="text-gray-600 hover:text-gray-800 disabled:opacity-40 inline-flex items-center gap-1">
                            <Archive className="h-4 w-4" /> {t('archive')}</button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-500">{t('no_services_found')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <form onSubmit={selectedService ? updateService : createService} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold">{selectedService ? 'Edit Service' : 'Create Service'}</h3>
          </div>
          {selectedService && <p className="text-xs text-gray-500">{t('editing')}{selectedService.publicId}</p>}

          <Field label={t('service_name')} value={form.displayName} onChange={(value) => setForm({ ...form, displayName: value })} />
          <TextArea label={t('service_description')} value={form.serviceDescription} onChange={(value) => setForm({ ...form, serviceDescription: value })} rows={4} />
          <SelectField label={t('category')} value={form.serviceCategory} values={serviceCategories} onChange={(value) => setForm({ ...form, serviceCategory: value as ServiceCategory })} />
          <SelectField label={t('fulfillment_type')} value={form.fulfillmentType} values={fulfillmentTypes} onChange={(value) => setForm({ ...form, fulfillmentType: value as ServiceFulfillmentType })} />
          <SelectField label={t('delivery_mode')} value={form.deliveryMode} values={deliveryModes} onChange={(value) => setForm({ ...form, deliveryMode: value as ServiceDeliveryMode })} />
          <SelectField label={t('availability')} value={form.serviceAvailabilityStatus} values={availabilityStatuses} onChange={(value) => setForm({ ...form, serviceAvailabilityStatus: value as ServiceAvailabilityStatus })} />
          <Field label={t('required_inputs_documents')} value={form.requiredInputsOrDocuments} onChange={(value) => setForm({ ...form, requiredInputsOrDocuments: value })} placeholder={t('passport_transcript_cv')} />
          <Field label={t('responsible_owner_type')} value={form.responsibleServiceOwnerType} onChange={(value) => setForm({ ...form, responsibleServiceOwnerType: value })} />
          <Field label={t('estimated_delivery_time')} value={form.estimatedDeliveryTime} onChange={(value) => setForm({ ...form, estimatedDeliveryTime: value })} optional />
          <Field label={t('provider_name')} value={form.providerName} onChange={(value) => setForm({ ...form, providerName: value })} optional />
          <Field label={t('supported_countries')} value={form.supportedCountries} onChange={(value) => setForm({ ...form, supportedCountries: value })} optional />
          <Field label={t('supported_languages')} value={form.supportedLanguages} onChange={(value) => setForm({ ...form, supportedLanguages: value })} optional />
          <Field label={t('pricing_reference_id')} value={form.pricingReferenceId} onChange={(value) => setForm({ ...form, pricingReferenceId: value })} optional />
          <Field label={t('thumbnail_asset_id')} value={form.thumbnailAssetId} onChange={(value) => setForm({ ...form, thumbnailAssetId: value })} optional />

          <label className="flex items-center justify-between gap-3 text-sm text-gray-700">
            <span>{t('appointment_required')}</span>
            <input type="checkbox" checked={form.appointmentRequired} onChange={(event) => setForm({ ...form, appointmentRequired: event.target.checked })} className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button type="submit" disabled={saving || !form.displayName || !form.serviceDescription || !form.requiredInputsOrDocuments} className="inline-flex items-center justify-center gap-2 bg-black text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {selectedService ? 'Save Service' : 'Create Service'}
            </button>
            <button type="button" onClick={() => { setSelectedService(null); setForm(emptyForm); }} className="inline-flex items-center justify-center gap-2 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium bg-white hover:bg-gray-50">
              {t('clear')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, optional, placeholder }: { label: string; value: string; onChange: (value: string) => void; optional?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}{optional ? ' (optional)' : ''}</span>
      <input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black" />
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

function SelectField({ label, value, values, onChange }: { label: string; value: string; values: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black">
        {values.map((item) => <option key={item} value={item}>{formatLabel(item)}</option>)}
      </select>
    </label>
  );
}

function StatusBadge({ status }: { status: ServiceStatus }) {
  const color = status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : status === 'READY_TO_PUBLISH' ? 'bg-blue-100 text-blue-700' : status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>{formatLabel(status)}</span>;
}

function CompletenessBadge({ status }: { status: ServiceCompletenessStatus }) {
  const color = status === 'COMPLETE' ? 'bg-emerald-50 text-emerald-700' : status === 'NEEDS_REVIEW' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-700';
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>{formatLabel(status)}</span>;
}

function splitList(value: string): string[] {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function formatLabel(value: string): string {
  return value.replace(/_/g, ' ').replace(/-/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(value));
}
