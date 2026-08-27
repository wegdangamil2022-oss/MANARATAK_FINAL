import React, { FormEvent, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Award, CheckCircle2, Search, ShieldCheck, XCircle } from 'lucide-react';
import { ApiClient, CertificateVerificationDto } from '../../api/client';
import { Button } from '@manaratak/ui';
import { Seo } from '../../components/Seo';
import { useTranslation } from '../../i18n/I18nProvider';

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
    <div dir="rtl" className="max-w-6xl mx-auto text-right">
      <Seo
        title={t('verify_certificate')}
        description={t('verify_issued_manaratak_certificates_using_a_publi')}
      />
      <Link to="/" className="mb-4 inline-block text-sm font-bold text-emerald-700 hover:underline">
        {t('lt_back_to_home_1')}
      </Link>

      <section className="mb-6 overflow-hidden rounded-3xl border border-[#d6ae57]/20 bg-gradient-to-l from-[#071d3a] via-[#0b3763] to-[#123f6b] p-5 text-white shadow-xl sm:p-8 md:p-12">
        <div className="max-w-3xl">
          <div className="mb-4 flex items-center gap-3">
            <Award className="h-9 w-9 text-amber-300" />
            <p className="text-sm font-semibold text-emerald-100">منصة التحقق من الشهادات</p>
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl mb-4">
            {t('verify_a_manaratak_certificate')}
          </h1>
          <p className="text-base leading-8 text-emerald-100 sm:text-lg">
            أدخل الرمز المطبوع على الشهادة أو امسح QR للتأكد من سلامة الختم الرقمي وحالة الاعتماد
            لحظيًا.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border shadow-sm p-5 sm:p-6 space-y-4"
          >
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">رمز التحقق من الشهادة</span>
              <input
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value)}
                placeholder={t('example_mnr_abc123')}
                className="mt-2 w-full border rounded-xl px-4 py-3 font-mono text-left focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </label>
            <Button
              type="submit"
              disabled={loading || !normalizedCode}
              className="w-full bg-emerald-700 hover:bg-emerald-800"
            >
              <Search className="ml-2 h-4 w-4" />
              {loading ? 'جارٍ التحقق...' : 'تحقق من الشهادة'}
            </Button>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}
          </form>

          <div className="mt-6 bg-gray-50 border rounded-2xl p-5 text-sm text-gray-600">
            <h2 className="font-bold text-gray-900 mb-2">الثقة والخصوصية</h2>
            <p>
              يتم فحص الحالة والختم المشفر مباشرة من سجل Phase 14. لا نعرض البريد أو بيانات الاتصال
              أو أي معلومات طالب خاصة.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          {!result && !loading && (
            <div className="bg-white rounded-2xl border border-dashed p-10 text-center text-gray-500">
              أدخل رمز التحقق لعرض نتيجة موثوقة من سجل الشهادات.
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-2xl border p-10 text-center text-gray-500">
              {t('checking_certificate_registry')}
            </div>
          )}

          {result && (
            <div className="bg-white rounded-2xl border shadow-sm p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b pb-6 mb-6">
                <div>
                  <p className="text-sm text-gray-500">{t('certificate_status')}</p>
                  <h2 className="text-3xl font-bold mt-1">
                    {result.isValid ? 'شهادة صحيحة وموثقة' : 'الشهادة غير صالحة'}
                  </h2>
                </div>
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${result.isValid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
                >
                  {result.isValid ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {result.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Info label="الدورة أو البرنامج" value={result.courseDisplayName} />
                <Info
                  label="صاحب الشهادة"
                  value={result.recipientDisplayName || 'مرجع طالب محمي'}
                />
                <Info label="رقم الشهادة" value={result.serialNumber} />
                <Info label="الجهة المصدرة" value={result.issuerName || 'MANARATAK'} />
                <Info label="تاريخ الإصدار" value={formatDate(result.issuedAt)} />
                <Info label="تاريخ الإكمال" value={formatDate(result.courseCompletedAt)} />
              </div>

              <div
                className={`mt-6 flex items-center gap-3 rounded-xl border p-4 ${result.integrityVerified ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}
              >
                <ShieldCheck className="h-6 w-6" />
                <div>
                  <strong className="block">
                    {result.integrityVerified ? 'الختم الرقمي سليم' : 'تعذر إثبات سلامة الختم'}
                  </strong>
                  <span className="text-xs">
                    تمت مقارنة البيانات المختومة مع البصمة المشفرة المحفوظة في سجل الشهادات.
                  </span>
                </div>
              </div>

              {result.skills.length ? (
                <div className="mt-6">
                  <h3 className="mb-2 text-sm font-bold">المهارات المثبتة</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {result.revokedAt && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                  <h3 className="font-bold text-red-800">{t('revocation_details')}</h3>
                  <p className="text-red-700 text-sm mt-1">
                    {t('revoked_at')}
                    {formatDate(result.revokedAt)}.{' '}
                    {result.revocationReason ? `Reason: ${result.revocationReason}` : ''}
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
    day: '2-digit',
  }).format(new Date(value));
}
