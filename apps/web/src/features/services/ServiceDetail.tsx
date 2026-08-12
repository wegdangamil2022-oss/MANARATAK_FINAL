import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiClient, PublicServiceCatalogItemDto } from '../../api/client';
import { Button } from '@manaratak/ui';
import { RelatedPublicLinks } from '../../components/RelatedPublicLinks';
import { Seo } from '../../components/Seo';
import { useTranslation } from "../../i18n/I18nProvider";

export function ServiceDetail() {
    const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PublicServiceCatalogItemDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const result = await ApiClient.getServiceBySlug(slug);
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Error fetching service');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [slug]);

  if (loading) {
    return <div className="py-20 text-center text-gray-500">{t('loading_service_details')}</div>;
  }

  if (error || !data) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">{t('service_not_found')}</h2>
        <p className="text-gray-600 mb-6">{error || "The service you are looking for doesn't exist or is not published."}</p>
        <Button asChild><Link to="/services">{t('browse_all_services')}</Link></Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Seo title={data.displayName} description={data.serviceDescription || `${data.displayName} service details and requirements.`} />
      <Link to="/services" className="mb-4 inline-block text-sm font-bold text-blue-700 hover:underline">{t('lt_back_to_services')}</Link>

      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
        <div className="border-b bg-gradient-to-br from-cyan-50 to-white p-5 sm:p-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-cyan-700">{t('service_details')}</p>
          <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">{data.displayName}</h1>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-cyan-600 px-3 py-2 font-bold text-white shadow-sm">{formatLabel(data.serviceCategory)}</span>
            <span className="rounded-full bg-white px-3 py-2 font-bold shadow-sm">{formatLabel(data.deliveryMode)}</span>
            <span className="rounded-full bg-green-50 px-3 py-2 font-bold text-green-700 shadow-sm">{formatLabel(data.serviceAvailabilityStatus)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-3 lg:p-8">
          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border bg-white p-5">
              <h2 className="text-xl font-bold mb-3">{t('service_overview')}</h2>
              <p className="whitespace-pre-wrap text-base leading-8 text-gray-700">{data.serviceDescription}</p>
            </section>

            <section className="rounded-2xl border bg-white p-5">
              <h2 className="text-xl font-bold mb-3">{t('required_inputs_or_documents')}</h2>
              {renderList(data.requiredInputsOrDocuments, 'No required inputs are listed yet.')}
            </section>

            {data.servicePrerequisites && data.servicePrerequisites.length > 0 && (
              <section className="rounded-2xl border bg-white p-5">
                <h2 className="text-xl font-bold mb-3">{t('prerequisites')}</h2>
                {renderList(data.servicePrerequisites)}
              </section>
            )}

            {data.deliveryArtifactTypes && data.deliveryArtifactTypes.length > 0 && (
              <section className="rounded-2xl border bg-white p-5">
                <h2 className="text-xl font-bold mb-3">{t('deliverables')}</h2>
                {renderList(data.deliveryArtifactTypes)}
              </section>
            )}

            <section className="bg-gray-50 border rounded-xl p-4">
              <h2 className="text-lg font-bold mb-2">{t('service_boundary_notice')}</h2>
              <p className="text-gray-700 text-sm">
                {t('this_page_shows_published_service_catalog_informat')}</p>
            </section>
          </div>

          <aside className="order-first space-y-6 lg:order-none">
            <div className="rounded-2xl border bg-gray-50 p-5 lg:p-6">
              <h3 className="font-bold text-lg mb-4">{t('summary')}</h3>
              <dl className="space-y-3 text-sm">
                <SummaryRow label={t('category')} value={formatLabel(data.serviceCategory)} />
                <SummaryRow label={t('fulfillment')} value={formatLabel(data.fulfillmentType)} />
                <SummaryRow label={t('delivery_mode')} value={formatLabel(data.deliveryMode)} />
                <SummaryRow label={t('availability')} value={formatLabel(data.serviceAvailabilityStatus)} />
                {data.estimatedDeliveryTime && <SummaryRow label={t('estimated_delivery')} value={data.estimatedDeliveryTime} />}
                {data.providerName && <SummaryRow label={t('provider')} value={data.providerName} />}
                {data.appointmentRequired !== undefined && data.appointmentRequired !== null && <SummaryRow label={t('appointment')} value={data.appointmentRequired ? 'Required' : 'Not required'} />}
                {data.supportedCountries && data.supportedCountries.length > 0 && <SummaryRow label={t('countries')} value={data.supportedCountries.join(', ')} />}
                {data.supportedLanguages && data.supportedLanguages.length > 0 && <SummaryRow label={t('languages')} value={data.supportedLanguages.join(', ')} />}
              </dl>

              <div className="mt-6 pt-6 border-t space-y-3">
                <Button className="w-full" size="lg" disabled>
                  {t('request_service')}</Button>
                <p className="text-xs text-gray-500">{t('ordering_and_checkout_will_be_enabled_in_the_servi')}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <RelatedPublicLinks current="services" />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function renderList(items?: string[], emptyLabel = 'Not available') {
  if (!items || items.length === 0) {
    return <p className="text-gray-500">{emptyLabel}</p>;
  }

  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {items.map((item, index) => (
        <li key={index} className="rounded-xl border bg-gray-50 p-4 leading-7 text-gray-700">{item}</li>
      ))}
    </ul>
  );
}

function formatLabel(value: string) {
  return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}
