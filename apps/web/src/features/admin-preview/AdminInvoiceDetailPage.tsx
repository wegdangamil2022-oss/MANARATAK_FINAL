import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/I18nProvider';
import { 
  ArrowRight, ArrowLeft, Receipt, CheckCircle2, Clock, XCircle, RefreshCcw, 
  Download, Send, AlertTriangle, ShieldCheck, FileText, Building2, User, 
  CreditCard, DollarSign, Lock, MessageSquare, History, Tag, AlertCircle, Check, X
} from 'lucide-react';

export interface IInvoiceDetail {
  id: string;
  invoiceNumber: string;
  studentReferenceId: string;
  studentNameAr: string;
  studentNameEn: string;
  studentEmail: string;
  itemType: 'PAID_COURSE' | 'STUDENT_SERVICE' | 'EXAM_FEE' | 'CERTIFICATE_FEE';
  itemTypeLabelAr: string;
  itemNameAr: string;
  itemNameEn: string;
  subtotal: number;
  discount: number;
  taxVat: number;
  totalAmount: number;
  currency: string;
  paymentMethod: 'CREDIT_CARD' | 'MADA' | 'APPLE_PAY' | 'BANK_TRANSFER';
  paymentMethodLabelAr: string;
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED' | 'VOID';
  paymentStatusLabelAr: string;
  transactionReferenceId: string;
  paymentGatewayStatus: string;
  eapReceiptAssetHandle: string;
  eapBankSlipAssetHandle?: string;
  createdAt: string;
  paidAt?: string;
  adminNotes: string;
  auditEvents: Array<{
    id: string;
    timestamp: string;
    operator: string;
    action: string;
    details: string;
  }>;
}

export function AdminInvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isRTL } = useTranslation();

  const [invoice, setInvoice] = useState<IInvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals & inputs
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadInvoiceDetails();
  }, [id]);

  const loadInvoiceDetails = () => {
    setLoading(true);
    // Seed detail object adhering strictly to Phase 19 specifications
    const mockInvoice: IInvoiceDetail = {
      id: id || 'inv_3001',
      invoiceNumber: id === 'inv_3003' ? 'MNR-INV-2026-9003' : 'MNR-INV-2026-9001',
      studentReferenceId: id === 'inv_3003' ? 'STD-7711' : 'STD-9921',
      studentNameAr: id === 'inv_3003' ? 'فهد محمد العتيبي' : 'عبدالله أحمد الزهراني',
      studentNameEn: id === 'inv_3003' ? 'Fahad Mohammed Al-Otaibi' : 'Abdullah Ahmed Al-Zahrani',
      studentEmail: 'student@manaratak.edu.sa',
      itemType: id === 'inv_3003' ? 'PAID_COURSE' : 'PAID_COURSE',
      itemTypeLabelAr: 'دورة أكاديمية مدفوعة (Phase 13)',
      itemNameAr: id === 'inv_3003' ? 'برنامج هندسة البيانات السحابية الضخمة' : 'دبلوم الذكاء الاصطناعي المتقدم والأمن السيبراني',
      itemNameEn: id === 'inv_3003' ? 'Big Data Cloud Engineering Program' : 'Advanced AI & Cybersecurity Diploma',
      subtotal: id === 'inv_3003' ? 1800 : 2173.04,
      discount: 0,
      taxVat: id === 'inv_3003' ? 0 : 325.96, // 15% VAT
      totalAmount: id === 'inv_3003' ? 1800 : 2499,
      currency: 'SAR',
      paymentMethod: id === 'inv_3003' ? 'BANK_TRANSFER' : 'CREDIT_CARD',
      paymentMethodLabelAr: id === 'inv_3003' ? 'تحويل بنكي مباشر' : 'بطاقة ائتمانية (Mada / Visa)',
      paymentStatus: id === 'inv_3003' ? 'PENDING' : 'PAID',
      paymentStatusLabelAr: id === 'inv_3003' ? 'في انتظار مراجعة الحوالة' : 'مدفوعة ومكتملة',
      transactionReferenceId: id === 'inv_3003' ? 'SA-ALRAJHI-20260727-9912' : 'ch_3M882190AXK0912',
      paymentGatewayStatus: id === 'inv_3003' ? 'PENDING_MANUAL_REVIEW' : 'succeeded (100% captured)',
      eapReceiptAssetHandle: 'eap_asset_receipt_inv_9001',
      eapBankSlipAssetHandle: id === 'inv_3003' ? 'eap_asset_slip_inv_9003' : undefined,
      createdAt: '2026-07-25 14:20:00 UTC',
      paidAt: id === 'inv_3003' ? undefined : '2026-07-25 14:21:12 UTC',
      adminNotes: 'تم التأكد من صحة بيانات الخصم والضريبة وتوليد إيصال EAP رسمياً.',
      auditEvents: [
        {
          id: 'aud_1',
          timestamp: '2026-07-25 14:20:00',
          operator: 'SYSTEM_GATEWAY',
          action: 'INVOICE_GENERATED',
          details: 'إنشاء الفاتورة المالية وتحديد مبلغ الضريبة والخصم المستحق.'
        },
        {
          id: 'aud_2',
          timestamp: id === 'inv_3003' ? '2026-07-27 17:00:00' : '2026-07-25 14:21:12',
          operator: id === 'inv_3003' ? 'STUDENT_PORTAL' : 'PAYMENT_GATEWAY',
          action: id === 'inv_3003' ? 'BANK_SLIP_UPLOADED' : 'PAYMENT_CAPTURED',
          details: id === 'inv_3003' ? 'رفع إيصال تحويل بنكي تحت مقبض EAP eap_asset_slip_inv_9003' : 'تم خصم مبلغ 2499.00 ر.س بنجاح عبر البوابة المالية.'
        }
      ]
    };

    setInvoice(mockInvoice);
    setLoading(false);
  };

  const handleConfirmPayment = () => {
    if (!invoice) return;
    setInvoice({
      ...invoice,
      paymentStatus: 'PAID',
      paymentStatusLabelAr: 'مدفوعة ومكتملة',
      paidAt: new Date().toISOString(),
      auditEvents: [
        ...invoice.auditEvents,
        {
          id: `aud_${Date.now()}`,
          timestamp: new Date().toISOString(),
          operator: 'ADMIN_OPERATOR',
          action: 'PAYMENT_CONFIRMED_MANUALLY',
          details: 'تأكيد استلام المبلغ وحسبانه مدفوعاً يدويًا من قبل مسؤول الماليّة.'
        }
      ]
    });
    setActionSuccessMessage('تم تأكيد الفاتورة واحتساب الدفع بنجاح.');
  };

  const handleProcessRefund = () => {
    if (!invoice || !refundReason.trim()) return;
    setInvoice({
      ...invoice,
      paymentStatus: 'REFUNDED',
      paymentStatusLabelAr: 'مسترجعة بالكامل',
      auditEvents: [
        ...invoice.auditEvents,
        {
          id: `aud_${Date.now()}`,
          timestamp: new Date().toISOString(),
          operator: 'ADMIN_OPERATOR',
          action: 'INVOICE_REFUNDED',
          details: `استرجاع المبلغ المالي. السبب الموثق: ${refundReason}`
        }
      ]
    });
    setShowRefundModal(false);
    setRefundReason('');
    setActionSuccessMessage('تم إصدار أمر استرجاع المبلغ وتسجيل السبب في دفتر التدقيق.');
  };

  if (loading || !invoice) {
    return (
      <div className="p-12 text-center text-gray-500">
        جاري تحميل تفاصيل الفاتورة المالية...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Navigation & Status Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/finance')}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-700 font-semibold transition-colors"
        >
          {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          العودة لسجل الفواتير والمالية
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">رقم المرجع:</span>
          <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg">
            {invoice.invoiceNumber}
          </span>
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button onClick={() => setActionSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-950">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="bg-white rounded-2xl border p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <Receipt className="w-7 h-7 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  {invoice.itemTypeLabelAr}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                تاريخ الإنشاء: {invoice.createdAt} | وسيلة الدفع: {invoice.paymentMethodLabelAr}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-left">
            <span className="text-xs text-gray-500 block">الإجمالي المالي:</span>
            <span className="text-2xl font-extrabold font-mono text-emerald-900">
              {invoice.totalAmount.toLocaleString()} <span className="text-sm font-normal text-gray-500">{invoice.currency}</span>
            </span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            invoice.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
            invoice.paymentStatus === 'PENDING' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
            invoice.paymentStatus === 'REFUNDED' ? 'bg-purple-100 text-purple-800 border border-purple-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
          }`}>
            حالة الفاتورة: {invoice.paymentStatusLabelAr}
          </span>
        </div>
      </div>

      {/* Grid: Details & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Breakdown & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Item Reference */}
          <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              بيانات الطالب البند المشترى
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-gray-500">الطالب المستفيد:</span>
                <p className="font-bold text-gray-900 text-sm">{invoice.studentNameAr}</p>
                <p className="text-gray-500 font-mono">{invoice.studentNameEn}</p>
                <p className="text-gray-500 font-mono mt-1">الرقم المرجعي: {invoice.studentReferenceId}</p>
                <p className="text-gray-500 font-mono">البريد: {invoice.studentEmail}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-gray-500">البند أو الخدمة:</span>
                <p className="font-bold text-gray-900 text-sm">{invoice.itemNameAr}</p>
                <p className="text-gray-500 font-mono">{invoice.itemNameEn}</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-semibold text-[11px]">
                  مجلوب مرجعياً من {invoice.itemTypeLabelAr}
                </span>
              </div>
            </div>

            {/* Financial Breakdown Table */}
            <div className="border rounded-xl p-4 bg-slate-50/50 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>المبلغ الأساسي (Subtotal):</span>
                <span className="font-mono font-semibold">{invoice.subtotal.toLocaleString()} {invoice.currency}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>الخصم أو العرض المطبق:</span>
                <span className="font-mono font-semibold text-rose-600">-{invoice.discount} {invoice.currency}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>ضريبة القيمة المضافة (VAT 15%):</span>
                <span className="font-mono font-semibold">{invoice.taxVat.toLocaleString()} {invoice.currency}</span>
              </div>
              <div className="flex justify-between text-gray-900 font-bold text-sm pt-2 border-t">
                <span>المبلغ الإجمالي المستحق:</span>
                <span className="font-mono text-emerald-800">{invoice.totalAmount.toLocaleString()} {invoice.currency}</span>
              </div>
            </div>
          </div>

          {/* Payment Gateway & EAP Asset Handles */}
          <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              تفاصيل الدفع ومقابض أصول EAP
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-gray-500 block">رقم المعاملة المرجعي:</span>
                <span className="font-mono font-bold text-gray-900 bg-gray-100 p-2 rounded-lg block overflow-x-auto">
                  {invoice.transactionReferenceId}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-gray-500 block">حالة بوابة الدفع:</span>
                <span className="font-mono text-emerald-800 font-semibold bg-emerald-50 p-2 rounded-lg block border border-emerald-200">
                  {invoice.paymentGatewayStatus}
                </span>
              </div>

              <div className="space-y-1 md:col-span-2">
                <span className="text-gray-500 block">مقبض إيصال الفاتورة المعتمد (Phase 05 EAP Asset Handle):</span>
                <span className="font-mono text-blue-900 font-semibold bg-blue-50 p-2 rounded-lg block border border-blue-200">
                  {invoice.eapReceiptAssetHandle}
                </span>
              </div>

              {invoice.eapBankSlipAssetHandle && (
                <div className="space-y-1 md:col-span-2">
                  <span className="text-gray-500 block">مقبض إيصال التحويل البنكي المرفوع:</span>
                  <span className="font-mono text-amber-900 font-semibold bg-amber-50 p-2 rounded-lg block border border-amber-200">
                    {invoice.eapBankSlipAssetHandle}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline & Audit Events */}
          <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" />
              دفتر أحداث التدقيق المالي (Audit Ledger)
            </h2>

            <div className="space-y-3">
              {invoice.auditEvents.map((evt) => (
                <div key={evt.id} className="p-3 bg-slate-50 rounded-xl border-r-4 border-emerald-600 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">{evt.action}</span>
                    <span className="text-[11px] text-gray-400 font-mono">{evt.timestamp}</span>
                  </div>
                  <p className="text-gray-700">{evt.details}</p>
                  <span className="text-[10px] text-gray-500 font-mono">المشغل: {evt.operator}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Admin Action Controls */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              الإجراءات المالية الآمنة
            </h2>

            <div className="space-y-2">
              {invoice.paymentStatus === 'PENDING' && (
                <button
                  onClick={handleConfirmPayment}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  تأكيد واعتماد استلام المبلغ
                </button>
              )}

              {invoice.paymentStatus === 'PAID' && (
                <button
                  onClick={() => setShowRefundModal(true)}
                  className="w-full py-2.5 px-4 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-xl text-xs font-semibold border border-amber-300 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCcw className="w-4 h-4" />
                  إصدار أمر استرجاع (Refund)
                </button>
              )}

              <button
                onClick={() => alert(`توليد تنزيل الفاتورة بصيغة PDF عبر EAP Asset ${invoice.eapReceiptAssetHandle}`)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                تنزيل الفاتورة الرسمية (PDF)
              </button>

              <button
                onClick={() => alert(`إرسال إشعار الدفع للبريد ${invoice.studentEmail}`)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                إرسال إشعار وسند للطالب
              </button>
            </div>

            {/* Permanent Deletion Prohibition Notice */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span>ضابط الحوكمة المالية:</span>
              </div>
              <p className="leading-relaxed">
                يُمنع منعًا باتاً الحذف النهائي للفواتير أو المدفوعات. الإلغاء يتم فقط عبر الاسترجاع الرسمية أو الاستبعاد بمبرر تدقيقي موثق.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Refund Input Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <RefreshCcw className="w-5 h-5 text-amber-600" />
              تأكيد أمر استرجاع المبلغ المالي
            </h3>
            <p className="text-xs text-gray-600">
              يرجى كتابة سبب الاسترجاع المالي بدقة ليتم توثيقه في سجل التدقيق غير القابل للتعديل.
            </p>

            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="اكتب مبرر وسبب الاسترجاع المالي..."
              className="w-full border rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 h-24"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRefundModal(false)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleProcessRefund}
                disabled={!refundReason.trim()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                تأكيد الاسترجاع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
