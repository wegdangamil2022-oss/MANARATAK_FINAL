import React, { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ApiClient, MoneyAmountDto, StudentDashboardSummaryDto, StudentFinanceInvoiceDto, StudentFinancePaymentDto } from '../../api/client';
import { Button } from '@manaratak/ui';
import { useTranslation } from "../../i18n/I18nProvider";

export function StudentWorkspacePage() {
    const { t } = useTranslation();
  const { studentReferenceId: routeStudentReferenceId } = useParams<{ studentReferenceId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialStudentReferenceId = routeStudentReferenceId || searchParams.get('studentReferenceId') || 'demo-student';
  const [studentReferenceInput, setStudentReferenceInput] = useState(initialStudentReferenceId);
  const [dashboard, setDashboard] = useState<StudentDashboardSummaryDto | null>(null);
  const [invoices, setInvoices] = useState<StudentFinanceInvoiceDto[]>([]);
  const [paymentsByInvoice, setPaymentsByInvoice] = useState<Record<string, StudentFinancePaymentDto[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const studentReferenceId = routeStudentReferenceId || initialStudentReferenceId;

  const loadDashboard = async (referenceId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ApiClient.getStudentDashboard(referenceId);
      const invoiceResult = await ApiClient.getStudentInvoices(referenceId).catch(() => ({ data: [] }));
      setDashboard(result);
      setInvoices(invoiceResult.data);
    } catch (err: any) {
      setError(err.message || 'Unable to load student workspace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard(studentReferenceId);
  }, [studentReferenceId]);

  const handleSwitchStudent = (event: FormEvent) => {
    event.preventDefault();
    if (!studentReferenceInput.trim()) return;
    navigate(`/student/${encodeURIComponent(studentReferenceInput.trim())}`);
  };

  const toggleInvoicePayments = async (invoiceId: string) => {
    if (paymentsByInvoice[invoiceId]) {
      setPaymentsByInvoice((current) => {
        const next = { ...current };
        delete next[invoiceId];
        return next;
      });
      return;
    }
    try {
      const payments = await ApiClient.getStudentInvoicePayments(studentReferenceId, invoiceId);
      setPaymentsByInvoice((current) => ({ ...current, [invoiceId]: payments }));
    } catch (err: any) {
      setError(err.message || 'Unable to load payments');
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-gray-500">{t('loading_student_workspace')}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <section className="bg-gradient-to-br from-slate-900 to-blue-900 text-white rounded-3xl p-8 md:p-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="text-blue-200 text-sm font-semibold uppercase tracking-wide mb-3">{t('student_workspace')}</p>
            <h1 className="text-4xl font-bold mb-3">
              {dashboard?.workspace?.displayName || dashboard?.workspace?.studentReferenceId || 'Student'}
            </h1>
            <p className="text-blue-100 max-w-2xl">
              {t('your_private_manaratak_space_for_saved_opportuniti')}</p>
          </div>

          <form onSubmit={handleSwitchStudent} className="bg-white/10 border border-white/20 rounded-2xl p-4 w-full md:w-96">
            <label className="block text-sm text-blue-100 mb-2">{t('preview_student_reference')}</label>
            <div className="flex gap-2">
              <input
                value={studentReferenceInput}
                onChange={(event) => setStudentReferenceInput(event.target.value)}
                className="flex-1 rounded-lg px-3 py-2 text-gray-900"
              />
              <button className="bg-white text-slate-900 rounded-lg px-4 py-2 font-medium">{t('open')}</button>
            </div>
          </form>
        </div>
      </section>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          {error}
        </div>
      )}

      {dashboard && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StatCard label={t('saved_items')} value={dashboard.savedItems.length.toString()} />
            <StatCard label={t('active_courses')} value={dashboard.activeCourseEnrollmentCount.toString()} />
            <StatCard label={t('certificates')} value={dashboard.certificateCount.toString()} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white border rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold">{t('saved_items')}</h2>
                <Link to="/scholarships" className="text-sm text-blue-600 hover:underline">{t('discover_more')}</Link>
              </div>

              {dashboard.savedItems.length === 0 ? (
                <div className="border border-dashed rounded-xl p-8 text-center text-gray-500">
                  {t('no_saved_items_yet_browse_scholarships_universitie')}</div>
              ) : (
                <div className="space-y-3">
                  {dashboard.savedItems.map((item) => (
                    <div key={item.id} className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{formatLabel(item.entityType)}</p>
                        <h3 className="font-bold text-gray-900">{item.displayName || item.entityId}</h3>
                        {item.notes && <p className="text-sm text-gray-600 mt-1">{item.notes}</p>}
                      </div>
                      {item.entitySlug && (
                        <Link to={buildEntityLink(item.entityType, item.entitySlug)} className="text-blue-600 hover:underline text-sm">
                          {t('open')}</Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <aside className="space-y-5">
              <div className="bg-white border rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">{t('billing')}</h2>
                {invoices.length === 0 ? (
                  <div className="border border-dashed rounded-xl p-5 text-center text-gray-500 text-sm">
                    {t('no_invoices_yet_paid_courses_and_services_will_app')}</div>
                ) : (
                  <div className="space-y-3">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="border rounded-xl p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">{invoice.originDomain}</p>
                            <h3 className="font-bold">{invoice.invoiceNumber}</h3>
                            <p className="text-sm text-gray-600 mt-1">{t('due_1')}{formatMoney(invoice.amountDue)}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${invoice.status === 'PAID' ? 'bg-green-100 text-green-700' : invoice.status === 'VOIDED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {formatLabel(invoice.status)}
                          </span>
                        </div>
                        <div className="mt-3 text-xs text-gray-500">
                          {t('total_1')}{formatMoney(invoice.totalAmount)} {invoice.dueDate ? ` / Due date: ${formatDate(invoice.dueDate)}` : ''}
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleInvoicePayments(invoice.id)}
                          className="mt-3 text-sm text-blue-600 hover:underline"
                        >
                          {paymentsByInvoice[invoice.id] ? 'Hide payments' : 'View payments'}
                        </button>
                        {paymentsByInvoice[invoice.id] && (
                          <div className="mt-3 border-t pt-3 space-y-2">
                            {paymentsByInvoice[invoice.id].length ? paymentsByInvoice[invoice.id].map((payment) => (
                              <div key={payment.id} className="text-xs bg-gray-50 rounded-lg p-2">
                                <div className="font-medium">{formatMoney(payment.amount)} - {formatLabel(payment.status)}</div>
                                <div className="text-gray-500">{payment.paymentMethod} / {formatDate(payment.createdAt)}</div>
                              </div>
                            )) : <p className="text-xs text-gray-500">{t('no_payments_recorded_for_this_invoice')}</p>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white border rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">{t('quick_actions')}</h2>
                <div className="grid gap-3">
                  <Button asChild>
                    <Link to="/courses">{t('continue_learning')}</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/certificates/verify">{t('verify_certificate')}</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/scholarships">{t('find_scholarships_1')}</Link>
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-sm text-blue-900">
                <h3 className="font-bold mb-2">{t('boundary_note')}</h3>
                <p>
                  {t('this_workspace_displays_private_student_state_only')}</p>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border rounded-2xl shadow-sm p-6">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

function formatLabel(value: string): string {
  return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatMoney(amount: MoneyAmountDto): string {
  const value = Number(BigInt(amount.amountMinorUnits)) / Math.pow(10, amount.scale);
  return `${amount.currencyCode} ${value.toLocaleString(undefined, { minimumFractionDigits: amount.scale, maximumFractionDigits: amount.scale })}`;
}

function formatDate(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

function buildEntityLink(entityType: string, slug: string): string {
  switch (entityType) {
    case 'SCHOLARSHIP':
      return `/scholarships/${slug}`;
    case 'UNIVERSITY':
      return `/universities/${slug}`;
    case 'MAJOR':
      return `/majors/${slug}`;
    case 'COURSE':
      return `/courses/${slug}`;
    case 'CERTIFICATE':
      return `/certificates/verify?code=${encodeURIComponent(slug)}`;
    default:
      return '/';
  }
}
