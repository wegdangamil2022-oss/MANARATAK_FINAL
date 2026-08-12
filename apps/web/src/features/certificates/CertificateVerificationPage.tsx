import React, { FormEvent, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ApiClient, CertificateVerificationDto } from '../../api/client';
import { Button } from '@manaratak/ui';
import { Seo } from '../../components/Seo';
import { useTranslation } from "../../i18n/I18nProvider";

export function CertificateVerificationPage() {
    const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  const [verificationCode, setVerificationCode] = useState(initialCode);
  const [result, setResult] = useState<CertificateVerificationDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedCode = useMemo(() => verificationCode.trim(), [verificationCode]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!normalizedCode) {
      setError('Please enter a certificate verification code.');
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const verification = await ApiClient.verifyCertificate(normalizedCode);
      setResult(verification);
      setSearchParams({ code: normalizedCode });
    } catch (err: any) {
      setError(err.message || 'Unable to verify certificate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Seo title={t('verify_certificate')} description={t('verify_issued_manaratak_certificates_using_a_publi')} />
      <Link to="/" className="mb-4 inline-block text-sm font-bold text-blue-700 hover:underline">
        {t('lt_back_to_home_1')}</Link>

      <section className="bg-gradient-to-br from-blue-50 to-white border rounded-3xl p-5 sm:p-8 md:p-12 mb-6">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">{t('certificate_verification')}</p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl mb-4">{t('verify_a_manaratak_certificate')}</h1>
          <p className="text-base leading-8 text-gray-700 sm:text-lg">
            {t('enter_the_verification_code_printed_on_the_certifi')}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border shadow-sm p-5 sm:p-6 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">{t('verification_code')}</span>
              <input
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value)}
                placeholder={t('example_mnr_abc123')}
                className="mt-2 w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <Button type="submit" disabled={loading || !normalizedCode} className="w-full">
              {loading ? 'Verifying...' : 'Verify Certificate'}
            </Button>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}
          </form>

          <div className="mt-6 bg-gray-50 border rounded-2xl p-5 text-sm text-gray-600">
            <h2 className="font-bold text-gray-900 mb-2">{t('trust_note')}</h2>
            <p>
              {t('certificate_files_qr_codes_signatures_and_visual_a')}</p>
          </div>
        </div>

        <div className="lg:col-span-2">
          {!result && !loading && (
            <div className="bg-white rounded-2xl border border-dashed p-10 text-center text-gray-500">
              {t('enter_a_verification_code_to_display_certificate_d')}</div>
          )}

          {loading && (
            <div className="bg-white rounded-2xl border p-10 text-center text-gray-500">
              {t('checking_certificate_registry')}</div>
          )}

          {result && (
            <div className="bg-white rounded-2xl border shadow-sm p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b pb-6 mb-6">
                <div>
                  <p className="text-sm text-gray-500">{t('certificate_status')}</p>
                  <h2 className="text-3xl font-bold mt-1">
                    {result.isValid ? 'Valid Certificate' : 'Certificate Not Valid'}
                  </h2>
                </div>
                <span className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${result.isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {result.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Info label={t('course')} value={result.courseDisplayName} />
                <Info label={t('recipient')} value={result.recipientDisplayName || 'Protected student reference'} />
                <Info label={t('serial_number')} value={result.serialNumber} />
                <Info label={t('verification_code')} value={result.verificationCode} />
                <Info label={t('issued_at')} value={formatDate(result.issuedAt)} />
                <Info label={t('course_completed_at')} value={formatDate(result.courseCompletedAt)} />
              </div>

              {result.revokedAt && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                  <h3 className="font-bold text-red-800">{t('revocation_details')}</h3>
                  <p className="text-red-700 text-sm mt-1">
                    {t('revoked_at')}{formatDate(result.revokedAt)}. {result.revocationReason ? `Reason: ${result.revocationReason}` : ''}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">{label}</p>
      <p className="text-gray-900 font-medium mt-1 break-words">{value}</p>
    </div>
  );
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return 'Not available';
  }
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(new Date(value));
}
