import { FormEvent, useEffect, useState } from 'react';
import { adminApiClient } from '../api/client';
import { Ban, Banknote, CheckCircle2, Filter, Loader2, Plus, ReceiptText, RefreshCw } from 'lucide-react';
import { useTranslation } from "../i18n/I18nProvider";

type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'VOIDED';
type PaymentStatus = 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED';

interface MoneyAmount {
  amountMinorUnits: string;
  currencyCode: string;
  scale: number;
}

interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: MoneyAmount;
  totalPrice: MoneyAmount;
}

interface FinanceInvoice {
  id: string;
  publicId: string;
  invoiceNumber: string;
  originDomain: string;
  originReferenceId: string;
  studentReferenceId?: string | null;
  payerReferenceId?: string | null;
  status: InvoiceStatus;
  totalAmount: MoneyAmount;
  amountDue: MoneyAmount;
  lineItems: InvoiceLineItem[];
  issuedAt?: string | null;
  dueDate?: string | null;
  paidAt?: string | null;
  updatedAt: string;
}

interface FinancePayment {
  id: string;
  publicId: string;
  invoiceId: string;
  amount: MoneyAmount;
  status: PaymentStatus;
  paymentMethod: string;
  gatewayProvider?: string | null;
  gatewayReference?: string | null;
  capturedAt?: string | null;
  createdAt: string;
}

interface InvoiceListResponse {
  data: FinanceInvoice[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const invoiceStatuses: InvoiceStatus[] = ['ISSUED', 'PARTIALLY_PAID', 'PAID', 'VOIDED'];

const emptyInvoiceForm = {
  originDomain: 'SERVICES',
  originReferenceId: '',
  studentReferenceId: '',
  payerReferenceId: '',
  description: '',
  quantity: '1',
  amountMinorUnits: '',
  currencyCode: 'USD',
  scale: '2',
  dueDate: ''
};

const emptyPaymentForm = {
  amountMinorUnits: '',
  currencyCode: 'USD',
  scale: '2',
  paymentMethod: 'MANUAL_BANK_TRANSFER',
  idempotencyKey: '',
  gatewayProvider: '',
  gatewayReference: ''
};

export function FinanceAdminPage() {
    const { t } = useTranslation();
  const [invoices, setInvoices] = useState<InvoiceListResponse | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<FinanceInvoice | null>(null);
  const [payments, setPayments] = useState<FinancePayment[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [originFilter, setOriginFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invoiceForm, setInvoiceForm] = useState(emptyInvoiceForm);
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);

  const loadInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: '1', pageSize: '20' });
      if (statusFilter) params.append('status', statusFilter);
      if (originFilter) params.append('originDomain', originFilter.trim());
      const response = await adminApiClient.request<InvoiceListResponse>(`/admin/finance/invoices?${params.toString()}`);
      setInvoices(response);
    } catch (err: any) {
      setError(err.message || 'Unable to load invoices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [statusFilter]);

  const issueInvoice = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const invoice = await adminApiClient.request<FinanceInvoice>('/admin/finance/invoices', {
        method: 'POST',
        body: JSON.stringify({
          originDomain: invoiceForm.originDomain.trim(),
          originReferenceId: invoiceForm.originReferenceId.trim(),
          studentReferenceId: invoiceForm.studentReferenceId.trim() || null,
          payerReferenceId: invoiceForm.payerReferenceId.trim() || null,
          dueDate: invoiceForm.dueDate ? new Date(invoiceForm.dueDate).toISOString() : null,
          lineItems: [
            {
              description: invoiceForm.description.trim(),
              quantity: Number(invoiceForm.quantity),
              unitPrice: {
                amountMinorUnits: invoiceForm.amountMinorUnits.trim(),
                currencyCode: invoiceForm.currencyCode.trim().toUpperCase(),
                scale: Number(invoiceForm.scale)
              }
            }
          ]
        })
      });
      setMessage(`Invoice issued: ${invoice.invoiceNumber}`);
      setInvoiceForm(emptyInvoiceForm);
      setSelectedInvoice(invoice);
      await loadPayments(invoice.id);
      await loadInvoices();
    } catch (err: any) {
      setError(err.message || 'Unable to issue invoice.');
    } finally {
      setSaving(false);
    }
  };

  const selectInvoice = async (invoice: FinanceInvoice) => {
    setSelectedInvoice(invoice);
    setPaymentForm({
      ...emptyPaymentForm,
      amountMinorUnits: invoice.amountDue.amountMinorUnits,
      currencyCode: invoice.amountDue.currencyCode,
      scale: invoice.amountDue.scale.toString()
    });
    await loadPayments(invoice.id);
  };

  const loadPayments = async (invoiceId: string) => {
    try {
      const response = await adminApiClient.request<FinancePayment[]>(`/admin/finance/invoices/${invoiceId}/payments`);
      setPayments(response);
    } catch (err: any) {
      setError(err.message || 'Unable to load payments.');
    }
  };

  const recordPayment = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedInvoice) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payment = await adminApiClient.request<FinancePayment>(`/admin/finance/invoices/${selectedInvoice.id}/payments/captured`, {
        method: 'POST',
        body: JSON.stringify({
          idempotencyKey: paymentForm.idempotencyKey.trim() || null,
          amount: {
            amountMinorUnits: paymentForm.amountMinorUnits.trim(),
            currencyCode: paymentForm.currencyCode.trim().toUpperCase(),
            scale: Number(paymentForm.scale)
          },
          paymentMethod: paymentForm.paymentMethod.trim(),
          gatewayProvider: paymentForm.gatewayProvider.trim() || null,
          gatewayReference: paymentForm.gatewayReference.trim() || null
        })
      });
      setMessage(`Payment captured: ${formatMoney(payment.amount)}`);
      const refreshed = await adminApiClient.request<FinanceInvoice>(`/admin/finance/invoices/${selectedInvoice.id}`);
      setSelectedInvoice(refreshed);
      setPaymentForm({
        ...emptyPaymentForm,
        amountMinorUnits: refreshed.amountDue.amountMinorUnits,
        currencyCode: refreshed.amountDue.currencyCode,
        scale: refreshed.amountDue.scale.toString()
      });
      await loadPayments(refreshed.id);
      await loadInvoices();
    } catch (err: any) {
      setError(err.message || 'Unable to record payment.');
    } finally {
      setSaving(false);
    }
  };

  const voidInvoice = async (invoice: FinanceInvoice) => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await adminApiClient.request(`/admin/finance/invoices/${invoice.id}/void`, { method: 'POST' });
      setMessage(`Invoice voided: ${invoice.invoiceNumber}`);
      if (selectedInvoice?.id === invoice.id) {
        const refreshed = await adminApiClient.request<FinanceInvoice>(`/admin/finance/invoices/${invoice.id}`);
        setSelectedInvoice(refreshed);
      }
      await loadInvoices();
    } catch (err: any) {
      setError(err.message || 'Unable to void invoice.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t('finance_payments')}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {t('issue_invoices_and_record_safe_manual_payment_capt')}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-black">
              <option value="">{t('all_statuses')}</option>
              {invoiceStatuses.map((status) => <option key={status} value={status}>{formatLabel(status)}</option>)}
            </select>
            <Filter className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="flex gap-2">
            <input
              value={originFilter}
              onChange={(event) => setOriginFilter(event.target.value)}
              placeholder={t('origin_domain')}
              className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
            <button onClick={loadInvoices} className="inline-flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white hover:bg-gray-50">
              <RefreshCw className="h-4 w-4" /> {t('refresh')}</button>
          </div>
        </div>
      </div>

      {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{message}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {loading && !invoices ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-3 font-medium">{t('invoice')}</th>
                    <th className="px-6 py-3 font-medium">{t('origin')}</th>
                    <th className="px-6 py-3 font-medium">{t('total')}</th>
                    <th className="px-6 py-3 font-medium">{t('due')}</th>
                    <th className="px-6 py-3 font-medium">{t('status')}</th>
                    <th className="px-6 py-3 font-medium text-right">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {invoices?.data.length ? invoices.data.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 align-top">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                        <div className="text-xs text-gray-500">{invoice.publicId}</div>
                        <div className="text-xs text-gray-500 mt-1">{t('issued_1')}{formatDate(invoice.issuedAt || invoice.updatedAt)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{invoice.originDomain}</div>
                        <div className="text-xs text-gray-500">{invoice.originReferenceId}</div>
                      </td>
                      <td className="px-6 py-4 font-medium">{formatMoney(invoice.totalAmount)}</td>
                      <td className="px-6 py-4 font-medium">{formatMoney(invoice.amountDue)}</td>
                      <td className="px-6 py-4"><StatusBadge status={invoice.status} /></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button onClick={() => selectInvoice(invoice)} className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
                            <ReceiptText className="h-4 w-4" /> {t('open')}</button>
                          <button onClick={() => voidInvoice(invoice)} disabled={saving || invoice.status === 'PAID' || invoice.status === 'VOIDED'} className="text-red-600 hover:text-red-800 disabled:opacity-40 inline-flex items-center gap-1">
                            <Ban className="h-4 w-4" /> {t('void')}</button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-500">{t('no_invoices_found')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <form onSubmit={issueInvoice} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold">{t('issue_invoice')}</h3>
            </div>
            <Field label={t('origin_domain_1')} value={invoiceForm.originDomain} onChange={(value) => setInvoiceForm({ ...invoiceForm, originDomain: value })} />
            <Field label={t('origin_reference_id')} value={invoiceForm.originReferenceId} onChange={(value) => setInvoiceForm({ ...invoiceForm, originReferenceId: value })} />
            <Field label={t('student_reference_id')} value={invoiceForm.studentReferenceId} onChange={(value) => setInvoiceForm({ ...invoiceForm, studentReferenceId: value })} optional />
            <Field label={t('payer_reference_id')} value={invoiceForm.payerReferenceId} onChange={(value) => setInvoiceForm({ ...invoiceForm, payerReferenceId: value })} optional />
            <Field label={t('line_description')} value={invoiceForm.description} onChange={(value) => setInvoiceForm({ ...invoiceForm, description: value })} />
            <div className="grid grid-cols-3 gap-2">
              <Field label={t('qty')} value={invoiceForm.quantity} onChange={(value) => setInvoiceForm({ ...invoiceForm, quantity: value })} />
              <Field label={t('minor_units')} value={invoiceForm.amountMinorUnits} onChange={(value) => setInvoiceForm({ ...invoiceForm, amountMinorUnits: value })} placeholder="5000" />
              <Field label={t('scale')} value={invoiceForm.scale} onChange={(value) => setInvoiceForm({ ...invoiceForm, scale: value })} />
            </div>
            <Field label={t('currency')} value={invoiceForm.currencyCode} onChange={(value) => setInvoiceForm({ ...invoiceForm, currencyCode: value.toUpperCase() })} />
            <label className="block">
              <span className="text-sm font-medium text-gray-700">{t('due_date')}<span className="text-gray-400">{t('optional')}</span></span>
              <input type="date" value={invoiceForm.dueDate} onChange={(event) => setInvoiceForm({ ...invoiceForm, dueDate: event.target.value })} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black" />
            </label>
            <button type="submit" disabled={saving || !invoiceForm.originReferenceId || !invoiceForm.description || !invoiceForm.amountMinorUnits} className="w-full inline-flex items-center justify-center gap-2 bg-black text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {t('issue_invoice')}</button>
          </form>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-green-600" />
              <h3 className="font-bold">{t('selected_invoice')}</h3>
            </div>
            {selectedInvoice ? (
              <>
                <div className="rounded-md bg-gray-50 p-3 text-sm">
                  <div className="font-medium">{selectedInvoice.invoiceNumber}</div>
                  <div className="text-gray-500">{t('due_1')}{formatMoney(selectedInvoice.amountDue)}</div>
                  <div className="mt-2"><StatusBadge status={selectedInvoice.status} /></div>
                </div>
                <form onSubmit={recordPayment} className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <Field label={t('minor_units')} value={paymentForm.amountMinorUnits} onChange={(value) => setPaymentForm({ ...paymentForm, amountMinorUnits: value })} />
                    <Field label={t('currency')} value={paymentForm.currencyCode} onChange={(value) => setPaymentForm({ ...paymentForm, currencyCode: value.toUpperCase() })} />
                    <Field label={t('scale')} value={paymentForm.scale} onChange={(value) => setPaymentForm({ ...paymentForm, scale: value })} />
                  </div>
                  <Field label={t('payment_method')} value={paymentForm.paymentMethod} onChange={(value) => setPaymentForm({ ...paymentForm, paymentMethod: value })} />
                  <Field label={t('idempotency_key')} value={paymentForm.idempotencyKey} onChange={(value) => setPaymentForm({ ...paymentForm, idempotencyKey: value })} optional />
                  <Field label={t('gateway_provider')} value={paymentForm.gatewayProvider} onChange={(value) => setPaymentForm({ ...paymentForm, gatewayProvider: value })} optional />
                  <Field label={t('gateway_reference')} value={paymentForm.gatewayReference} onChange={(value) => setPaymentForm({ ...paymentForm, gatewayReference: value })} optional />
                  <button type="submit" disabled={saving || selectedInvoice.status === 'PAID' || selectedInvoice.status === 'VOIDED' || !paymentForm.amountMinorUnits} className="w-full inline-flex items-center justify-center gap-2 bg-green-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50">
                    {t('capture_manual_payment')}</button>
                </form>
                <div className="border-t border-gray-100 pt-3">
                  <h4 className="text-sm font-semibold mb-2">{t('payments')}</h4>
                  {payments.length ? payments.map((payment) => (
                    <div key={payment.id} className="text-xs border border-gray-100 rounded p-2 mb-2">
                      <div className="font-medium">{formatMoney(payment.amount)} - {payment.status}</div>
                      <div className="text-gray-500">{payment.paymentMethod} / {formatDate(payment.createdAt)}</div>
                    </div>
                  )) : <p className="text-sm text-gray-500">{t('no_payments_recorded')}</p>}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">{t('open_an_invoice_to_record_manual_payment_captures')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, optional }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; optional?: boolean }) {
    const { t } = useTranslation();
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label} {optional && <span className="text-gray-400">{t('optional')}</span>}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
      />
    </label>
  );
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const classes: Record<InvoiceStatus, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    ISSUED: 'bg-blue-100 text-blue-700',
    PARTIALLY_PAID: 'bg-amber-100 text-amber-700',
    PAID: 'bg-green-100 text-green-700',
    VOIDED: 'bg-red-100 text-red-700'
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${classes[status]}`}>{formatLabel(status)}</span>;
}

function formatMoney(amount: MoneyAmount) {
  const value = Number(BigInt(amount.amountMinorUnits)) / Math.pow(10, amount.scale);
  return `${amount.currencyCode} ${value.toLocaleString(undefined, { minimumFractionDigits: amount.scale, maximumFractionDigits: amount.scale })}`;
}

function formatLabel(value: string) {
  return value.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}
