import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ApiClient, PaginatedResult, PublicServiceCatalogItemDto } from '../../api/client';
import { Button } from '@manaratak/ui';
import { Seo } from '../../components/Seo';
import { useTranslation } from "../../i18n/I18nProvider";

const serviceCategories = [
  'STUDENT_SERVICES',
  'DOCUMENT_SERVICES',
  'VISA_SERVICES',
  'TRAVEL_SERVICES',
  'ACADEMIC_SERVICES',
  'AUXILIARY_PROFESSIONAL_SERVICES',
  'ENTERPRISE_OPERATIONAL_SERVICES'
];

const deliveryModes = ['ONLINE', 'IN_PERSON', 'HYBRID', 'EXTERNAL_COORDINATION'];

export function ServiceList() {
    const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<PaginatedResult<PublicServiceCatalogItemDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [serviceCategory, setServiceCategory] = useState(searchParams.get('serviceCategory') || '');
  const [deliveryMode, setDeliveryMode] = useState(searchParams.get('deliveryMode') || '');
  const page = parseInt(searchParams.get('page') || '1', 10);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await ApiClient.getServices({
        serviceCategory: searchParams.get('serviceCategory') || undefined,
        deliveryMode: searchParams.get('deliveryMode') || undefined,
        page,
        pageSize: 10
      });
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Error fetching services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [searchParams]);

  const applyFilters = () => {
    const nextParams = new URLSearchParams(searchParams);
    if (serviceCategory) nextParams.set('serviceCategory', serviceCategory);
    else nextParams.delete('serviceCategory');
    if (deliveryMode) nextParams.set('deliveryMode', deliveryMode);
    else nextParams.delete('deliveryMode');
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const changePage = (nextPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', nextPage.toString());
    setSearchParams(nextParams);
  };

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:gap-8">
      <Seo title={t('services')} description={t('browse_manaratak_student_document_visa_travel_acad')} />
      <aside className="w-full flex-shrink-0 lg:w-72">
        <div className="rounded-2xl border bg-white p-4 shadow-sm lg:sticky lg:top-4">
          <h2 className="text-lg font-bold mb-1">{t('find_services')}</h2>
          <p className="mb-4 text-sm text-gray-500">{t('filter_by_category_or_delivery_mode')}</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('service_category')}</label>
              <select value={serviceCategory} onChange={(event) => setServiceCategory(event.target.value)} className="w-full rounded-xl border px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">{t('all')}</option>
                {serviceCategories.map((category) => <option key={category} value={category}>{formatLabel(category)}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t('delivery_mode')}</label>
              <select value={deliveryMode} onChange={(event) => setDeliveryMode(event.target.value)} className="w-full rounded-xl border px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">{t('all')}</option>
                {deliveryModes.map((mode) => <option key={mode} value={mode}>{formatLabel(mode)}</option>)}
              </select>
            </div>

            <Button onClick={applyFilters} className="w-full">{t('apply_filters')}</Button>
          </div>
        </div>
      </aside>

      <main className="flex-1">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">{t('student_support')}</p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{t('services')}</h1>
          <p className="mt-2 text-base leading-7 text-gray-600">{t('browse_student_document_visa_travel_academic_and_a')}</p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">{t('loading_services')}</div>
        ) : error ? (
          <div className="py-12 text-center text-red-500 bg-red-50 rounded-lg">{error}</div>
        ) : !data || data.data.length === 0 ? (
          <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg">{t('no_services_found_matching_your_criteria')}</div>
        ) : (
          <div className="space-y-4">
            {data.data.map((service) => (
              <article key={service.publicId} className="rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
                <h3 className="mb-2 text-xl font-black leading-snug sm:text-2xl">
                  <Link to={`/services/${service.slug}`} className="hover:text-blue-600 transition-colors">
                    {service.displayName}
                  </Link>
                </h3>
                <p className="mb-4 line-clamp-3 text-base leading-7 text-gray-600">{service.serviceDescription}</p>

                <div className="mb-3 flex flex-wrap gap-2 text-sm font-medium text-gray-600">
                  <span className="bg-blue-50 text-blue-700 rounded-full px-3 py-2">{formatLabel(service.serviceCategory)}</span>
                  <span className="bg-gray-100 rounded-full px-3 py-2">{formatLabel(service.deliveryMode)}</span>
                  <span className="bg-gray-100 rounded-full px-3 py-2">{formatLabel(service.fulfillmentType)}</span>
                  <span className="bg-green-50 text-green-700 rounded-full px-3 py-2">{formatLabel(service.serviceAvailabilityStatus)}</span>
                </div>

                <div className="text-sm text-gray-600">
                  {service.estimatedDeliveryTime && <span className="mr-4"><span className="font-medium">{t('delivery_1')}</span> {service.estimatedDeliveryTime}</span>}
                  {service.appointmentRequired && <span><span className="font-medium">{t('appointment_1')}</span> {t('required_1')}</span>}
                </div>
                <Link to={`/services/${service.slug}`} className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white">
                  {t('view_service')}</Link>
              </article>
            ))}

            {data.totalPages > 1 && (
              <div className="mt-8 flex flex-col justify-center gap-2 border-t pt-4 sm:flex-row">
                <Button variant="outline" disabled={page <= 1} onClick={() => changePage(page - 1)}>{t('previous')}</Button>
                <div className="flex items-center px-4">{t('page')}{page} {t('of')}{data.totalPages}</div>
                <Button variant="outline" disabled={page >= data.totalPages} onClick={() => changePage(page + 1)}>{t('next')}</Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function formatLabel(value: string) {
  return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

