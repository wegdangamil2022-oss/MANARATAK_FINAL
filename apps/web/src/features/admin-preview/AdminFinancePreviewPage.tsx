import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/I18nProvider';
import { 
  CreditCard, DollarSign, Search, Filter, RefreshCw, Eye, CheckCircle2, 
  XCircle, Clock, AlertTriangle, ArrowRight, ArrowLeft, Download, FileText, 
  Building2, ArrowUpRight, TrendingUp, ShieldAlert, Check, X, Shield, Lock,
  PieChart, BarChart2, Tag, RefreshCcw, Landmark, Receipt
} from 'lucide-react';

export interface AdminInvoiceListItem {
  id: string;
  invoiceNumber: string;
  studentReferenceId: string;
  studentNameAr: string;
  studentNameEn: string;
  itemType: 'PAID_COURSE' | 'STUDENT_SERVICE' | 'EXAM_FEE' | 'CERTIFICATE_FEE';
  itemTypeLabelAr: string;
  itemNameAr: string;
  itemNameEn: string;
  amount: number;
  currency: string;
  paymentMethod: 'CREDIT_CARD' | 'MADA' | 'APPLE_PAY' | 'BANK_TRANSFER';
  paymentMethodLabelAr: string;
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED' | 'VOID';
  paymentStatusLabelAr: string;
  createdAt: string;
  eapReceiptAssetHandle: string;
}

export interface AdminRefundRequestItem {
  id: string;
  invoiceNumber: string;
  studentReferenceId: string;
  studentNameAr: string;
  refundAmount: number;
  currency: string;
  reasonAr: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED';
  requestedAt: string;
}

export interface AdminBankTransferReviewItem {
  id: string;
  invoiceNumber: string;
  studentReferenceId: string;
  studentNameAr: string;
  amount: number;
  currency: string;
  bankReferenceNumber: string;
  eapSlipAssetHandle: string;
  submittedAt: string;
  status: 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED' | 'NEEDS_CLEARER_RECEIPT';
}

export interface AdminPricingReferenceItem {
  id: string;
  itemType: 'PAID_COURSE' | 'STUDENT_SERVICE';
  sourceDomainPhase: 'Phase 13 (Paid Courses)' | 'Phase 20 (Services Catalog)';
  itemNameAr: string;
  itemNameEn: string;
  price: number;
  currency: string;
  isActive: boolean;
  lastUpdated: string;
}

export function AdminFinancePreviewPage() {
  const navigate = useNavigate();
  const { isRTL } = useTranslation();

  const [activeTab, setActiveTab] = useState<'INVOICES' | 'PAYMENTS' | 'REFUNDS' | 'BANK_TRANSFERS' | 'PRICING' | 'REPORTS'>('INVOICES');
  
  const [invoices, setInvoices] = useState<AdminInvoiceListItem[]>([]);
  const [refundRequests, setRefundRequests] = useState<AdminRefundRequestItem[]>([]);
  const [bankTransfers, setBankTransfers] = useState<AdminBankTransferReviewItem[]>([]);
  const [pricingReferences, setPricingReferences] = useState<AdminPricingReferenceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedItemTypeFilter, setSelectedItemTypeFilter] = useState<string>('ALL');

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    setLoading(true);
    try {
      // Seed rich dataset adhering strictly to Phase 19 & Phase 23 specifications
      setInvoices([
        {
          id: 'inv_3001',
          invoiceNumber: 'MNR-INV-2026-9001',
          studentReferenceId: 'STD-9921',
          studentNameAr: 'عبدالله أحمد الزهراني',
          studentNameEn: 'Abdullah Ahmed Al-Zahrani',
          itemType: 'PAID_COURSE',
          itemTypeLabelAr: 'دورة مدفوعة (Phase 13)',
          itemNameAr: 'دبلوم الذكاء الاصطناعي المتقدم والأمن السيبراني',
          itemNameEn: 'Advanced AI & Cybersecurity Diploma',
          amount: 2499,
          currency: 'SAR',
          paymentMethod: 'CREDIT_CARD',
          paymentMethodLabelAr: 'بطاقة ائتمانية (Mada / Visa)',
          paymentStatus: 'PAID',
          paymentStatusLabelAr: 'مدفوعة ومكتملة',
          createdAt: '2026-07-25 14:20',
          eapReceiptAssetHandle: 'eap_asset_receipt_inv_9001'
        },
        {
          id: 'inv_3002',
          invoiceNumber: 'MNR-INV-2026-9002',
          studentReferenceId: 'STD-8842',
          studentNameAr: 'نورة سعيد الغامدي',
          studentNameEn: 'Noura Said Al-Ghamdi',
          itemType: 'STUDENT_SERVICE',
          itemTypeLabelAr: 'خدمة طالب (Phase 20)',
          itemNameAr: 'خدمة الاستشارة الأكاديمية وصياغة السيرة الذاتية',
          itemNameEn: 'Academic Counseling & CV Mentorship',
          amount: 350,
          currency: 'SAR',
          paymentMethod: 'APPLE_PAY',
          paymentMethodLabelAr: 'Apple Pay',
          paymentStatus: 'PAID',
          paymentStatusLabelAr: 'مدفوعة ومكتملة',
          createdAt: '2026-07-26 10:15',
          eapReceiptAssetHandle: 'eap_asset_receipt_inv_9002'
        },
        {
          id: 'inv_3003',
          invoiceNumber: 'MNR-INV-2026-9003',
          studentReferenceId: 'STD-7711',
          studentNameAr: 'فهد محمد العتيبي',
          studentNameEn: 'Fahad Mohammed Al-Otaibi',
          itemType: 'PAID_COURSE',
          itemTypeLabelAr: 'دورة مدفوعة (Phase 13)',
          itemNameAr: 'برنامج هندسة البيانات السحابية الضخمة',
          itemNameEn: 'Big Data Cloud Engineering Program',
          amount: 1800,
          currency: 'SAR',
          paymentMethod: 'BANK_TRANSFER',
          paymentMethodLabelAr: 'تحويل بنكي مباشر',
          paymentStatus: 'PENDING',
          paymentStatusLabelAr: 'في انتظار مراجعة الحوالة',
          createdAt: '2026-07-27 16:45',
          eapReceiptAssetHandle: 'eap_asset_slip_inv_9003'
        },
        {
          id: 'inv_3004',
          invoiceNumber: 'MNR-INV-2026-9004',
          studentReferenceId: 'STD-6632',
          studentNameAr: 'سارة خالد الدوسري',
          studentNameEn: 'Sarah Khalid Al-Dossary',
          itemType: 'EXAM_FEE',
          itemTypeLabelAr: 'رسوم اختبار دولي (Phase 20)',
          itemNameAr: 'رسوم اختبار التأهيل للماجستير الأكاديمي',
          itemNameEn: 'Academic Master Qualification Test Fee',
          amount: 450,
          currency: 'SAR',
          paymentMethod: 'MADA',
          paymentMethodLabelAr: 'بطاقة مدى Mada',
          paymentStatus: 'REFUNDED',
          paymentStatusLabelAr: 'مسترجعة بالكامل',
          createdAt: '2026-07-20 11:00',
          eapReceiptAssetHandle: 'eap_asset_receipt_inv_9004'
        },
        {
          id: 'inv_3005',
          invoiceNumber: 'MNR-INV-2026-9005',
          studentReferenceId: 'STD-5521',
          studentNameAr: 'عمر طارق الشمري',
          studentNameEn: 'Omar Tariq Al-Shammari',
          itemType: 'CERTIFICATE_FEE',
          itemTypeLabelAr: 'رسوم شهادة ورقية (Phase 14)',
          itemNameAr: 'رسوم طباعة وشحن الشهادة المعتمدة',
          itemNameEn: 'Certificate Printing & Shipping Fee',
          amount: 150,
          currency: 'SAR',
          paymentMethod: 'CREDIT_CARD',
          paymentMethodLabelAr: 'بطاقة ائتمانية',
          paymentStatus: 'FAILED',
          paymentStatusLabelAr: 'فشلت عملية الخصم',
          createdAt: '2026-07-28 09:30',
          eapReceiptAssetHandle: 'eap_asset_receipt_inv_9005'
        }
      ]);

      setRefundRequests([
        {
          id: 'ref_501',
          invoiceNumber: 'MNR-INV-2026-9004',
          studentReferenceId: 'STD-6632',
          studentNameAr: 'سارة خالد الدوسري',
          refundAmount: 450,
          currency: 'SAR',
          reasonAr: 'إلغاء موعد الاختبار الدولي المعتمد قبل 48 ساعة وفق سياسة الاسترجاع الأكاديمية.',
          status: 'PROCESSED',
          requestedAt: '2026-07-21 08:30'
        },
        {
          id: 'ref_502',
          invoiceNumber: 'MNR-INV-2026-8890',
          studentReferenceId: 'STD-4401',
          studentNameAr: 'ريم عبدالأمير الحسين',
          refundAmount: 1200,
          currency: 'SAR',
          reasonAr: 'انسحاب من الدورة المدفوعة خلال فترة التجربة المجانية المحددة بـ 7 أيام.',
          status: 'PENDING',
          requestedAt: '2026-07-27 19:15'
        }
      ]);

      setBankTransfers([
        {
          id: 'bt_701',
          invoiceNumber: 'MNR-INV-2026-9003',
          studentReferenceId: 'STD-7711',
          studentNameAr: 'فهد محمد العتيبي',
          amount: 1800,
          currency: 'SAR',
          bankReferenceNumber: 'SA-ALRAJHI-20260727-9912',
          eapSlipAssetHandle: 'eap_asset_slip_inv_9003',
          submittedAt: '2026-07-27 17:00',
          status: 'PENDING_VERIFICATION'
        }
      ]);

      setPricingReferences([
        {
          id: 'pr_101',
          itemType: 'PAID_COURSE',
          sourceDomainPhase: 'Phase 13 (Paid Courses)',
          itemNameAr: 'دبلوم الذكاء الاصطناعي المتقدم والأمن السيبراني',
          itemNameEn: 'Advanced AI & Cybersecurity Diploma',
          price: 2499,
          currency: 'SAR',
          isActive: true,
          lastUpdated: '2026-07-01'
        },
        {
          id: 'pr_102',
          itemType: 'PAID_COURSE',
          sourceDomainPhase: 'Phase 13 (Paid Courses)',
          itemNameAr: 'برنامج هندسة البيانات السحابية الضخمة',
          itemNameEn: 'Big Data Cloud Engineering Program',
          price: 1800,
          currency: 'SAR',
          isActive: true,
          lastUpdated: '2026-07-10'
        },
        {
          id: 'pr_103',
          itemType: 'STUDENT_SERVICE',
          sourceDomainPhase: 'Phase 20 (Services Catalog)',
          itemNameAr: 'خدمة الاستشارة الأكاديمية وصياغة السيرة الذاتية',
          itemNameEn: 'Academic Counseling & CV Mentorship',
          price: 350,
          currency: 'SAR',
          isActive: true,
          lastUpdated: '2026-06-15'
        }
      ]);
    } catch (err) {
      console.error('Error loading finance preview data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBankTransfer = (transferId: string, invNum: string) => {
    setBankTransfers(bankTransfers.map(b => b.id === transferId ? { ...b, status: 'APPROVED' } : b));
    setInvoices(invoices.map(inv => inv.invoiceNumber === invNum ? { ...inv, paymentStatus: 'PAID', paymentStatusLabelAr: 'مدفوعة ومكتملة' } : inv));
  };

  const handleApproveRefund = (refundId: string, invNum: string) => {
    setRefundRequests(refundRequests.map(r => r.id === refundId ? { ...r, status: 'PROCESSED' } : r));
    setInvoices(invoices.map(inv => inv.invoiceNumber === invNum ? { ...inv, paymentStatus: 'REFUNDED', paymentStatusLabelAr: 'مسترجعة بالكامل' } : inv));
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.studentNameAr.includes(searchQuery) ||
      inv.studentNameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.studentReferenceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.itemNameAr.includes(searchQuery);

    const matchesStatus = selectedStatusFilter === 'ALL' || inv.paymentStatus === selectedStatusFilter;
    const matchesItemType = selectedItemTypeFilter === 'ALL' || inv.itemType === selectedItemTypeFilter;

    return matchesSearch && matchesStatus && matchesItemType;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-emerald-800/40">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-400/30">
              <Landmark className="w-8 h-8 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">إدارة الماليّة والمدفوعات والفواتير</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Phase 19 Standard
                </span>
              </div>
              <p className="text-sm text-emerald-200 mt-1">
                لوحة تحكم الفواتير، التحصيلات المالية، التدقيق البنكي، طلبات الاسترجاع، والمشاهد المرجعية للأسعار.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('BANK_TRANSFERS')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800/60 hover:bg-emerald-700/60 text-emerald-100 rounded-xl text-sm font-medium border border-emerald-700/50 transition-colors"
            >
              <Building2 className="w-4 h-4" />
              مراجعة الحوالات البنكية ({bankTransfers.filter(b => b.status === 'PENDING_VERIFICATION').length})
            </button>
            <button
              onClick={() => setActiveTab('REFUNDS')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              <RefreshCcw className="w-4 h-4" />
              طلبات الاسترجاع ({refundRequests.filter(r => r.status === 'PENDING').length})
            </button>
          </div>
        </div>

        {/* Boundary Disclaimer */}
        <div className="mt-4 pt-4 border-t border-emerald-800/60 flex flex-wrap items-center justify-between text-xs text-emerald-300 gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>حدود النطاق: Phase 19 تملك الفواتير والتحصيل | Phase 13 تملك الدورات | Phase 20 تملك الخدمات | Phase 05 تملك إيصالات EAP</span>
          </div>
          <div className="flex items-center gap-3">
            <span>تنبيه: يُمنع الحذف النهائي للسجلات المالية ويُكتفى بالتسوية أو الإلغاء بمبرر</span>
          </div>
        </div>
      </div>

      {/* Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl p-3.5 border shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">مدفوعات الشهر</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-gray-900">4,649 <span className="text-xs text-gray-500">ر.س</span></p>
          <span className="text-[10px] text-emerald-600">محصلة بنجاح</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">فواتير مدفوعة</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-emerald-700">
            {invoices.filter((i) => i.paymentStatus === 'PAID').length}
          </p>
          <span className="text-[10px] text-emerald-600">مكتملة ومستلمة</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">فواتير معلقة</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-bold text-amber-700">
            {invoices.filter((i) => i.paymentStatus === 'PENDING').length}
          </p>
          <span className="text-[10px] text-amber-600">بانتظار التحويل/الخصم</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">مدفوعات فاشلة</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-xl font-bold text-rose-700">
            {invoices.filter((i) => i.paymentStatus === 'FAILED').length}
          </p>
          <span className="text-[10px] text-rose-600">رفض البنك / خطأ خصم</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">طلبات الاسترجاع</span>
            <RefreshCcw className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-bold text-amber-700">
            {refundRequests.length}
          </p>
          <span className="text-[10px] text-amber-600">مراجعة السياسة المالية</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">حوالات قيد التدقيق</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl font-bold text-indigo-700">
            {bankTransfers.filter((b) => b.status === 'PENDING_VERIFICATION').length}
          </p>
          <span className="text-[10px] text-indigo-600">مطابقة إيصال الـ EAP</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl border p-1.5 flex flex-wrap items-center gap-1 shadow-sm text-xs font-semibold">
        <button
          onClick={() => setActiveTab('INVOICES')}
          className={`py-2 px-3.5 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'INVOICES' ? 'bg-emerald-700 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Receipt className="w-4 h-4" />
          سجل الفواتير ({invoices.length})
        </button>

        <button
          onClick={() => setActiveTab('REFUNDS')}
          className={`py-2 px-3.5 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'REFUNDS' ? 'bg-emerald-700 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <RefreshCcw className="w-4 h-4" />
          طلبات الاسترجاع ({refundRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('BANK_TRANSFERS')}
          className={`py-2 px-3.5 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'BANK_TRANSFERS' ? 'bg-emerald-700 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          تدقيق الحوالات البنكية ({bankTransfers.length})
        </button>

        <button
          onClick={() => setActiveTab('PRICING')}
          className={`py-2 px-3.5 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'PRICING' ? 'bg-emerald-700 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Tag className="w-4 h-4" />
          المشاهد المرجعية للأسعار ({pricingReferences.length})
        </button>

        <button
          onClick={() => setActiveTab('REPORTS')}
          className={`py-2 px-3.5 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'REPORTS' ? 'bg-emerald-700 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          التقارير المالية والتحليلات
        </button>
      </div>

      {/* TAB 1: INVOICES TABLE */}
      {activeTab === 'INVOICES' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute right-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث برقم الفاتورة، اسم الطالب، المعرف..."
                className="w-full pr-9 pl-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="border rounded-xl px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">جميع الحالات المالية</option>
                <option value="PAID">مدفوعة ومكتملة</option>
                <option value="PENDING">معلقة قيد الانتظار</option>
                <option value="FAILED">فشلت عملية الدفع</option>
                <option value="REFUNDED">مسترجعة</option>
                <option value="VOID">ملغاة</option>
              </select>

              <select
                value={selectedItemTypeFilter}
                onChange={(e) => setSelectedItemTypeFilter(e.target.value)}
                className="border rounded-xl px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">جميع أنواع البنود</option>
                <option value="PAID_COURSE">دورات مدفوعة (Phase 13)</option>
                <option value="STUDENT_SERVICE">خدمات الطلاب (Phase 20)</option>
                <option value="EXAM_FEE">رسوم اختبارات دولية</option>
                <option value="CERTIFICATE_FEE">رسوم طباعة شهادة</option>
              </select>

              <button
                onClick={loadFinanceData}
                className="p-2 border rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
                title="تحديث البيانات"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Simple Clean Vertical Table */}
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50 border-b text-gray-600 font-semibold text-xs uppercase">
                <tr>
                  <th className="py-3.5 px-4">رقم الفاتورة والتاريخ</th>
                  <th className="py-3.5 px-4">الطالب المستفيد</th>
                  <th className="py-3.5 px-4">نوع البند والاسم</th>
                  <th className="py-3.5 px-4">المبلغ والعملة</th>
                  <th className="py-3.5 px-4">وسيلة الدفع</th>
                  <th className="py-3.5 px-4">حالة الفاتورة</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-800">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      لا توجد فواتير مطابقة لمعايير البحث الحالية.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-emerald-950">
                        <div>{inv.invoiceNumber}</div>
                        <span className="text-[11px] text-gray-400 font-sans">{inv.createdAt}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">{inv.studentNameAr}</div>
                        <div className="text-xs text-gray-500 font-mono">{inv.studentReferenceId}</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium block w-fit mb-0.5">
                          {inv.itemTypeLabelAr}
                        </span>
                        <div className="text-gray-900 truncate font-medium">{inv.itemNameAr}</div>
                      </td>

                      <td className="py-3.5 px-4 font-bold font-mono text-gray-900">
                        {inv.amount.toLocaleString()} <span className="text-xs text-gray-500 font-normal">{inv.currency}</span>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-gray-700">
                        {inv.paymentMethodLabelAr}
                      </td>

                      <td className="py-3.5 px-4">
                        <PaymentStatusBadge status={inv.paymentStatus} label={inv.paymentStatusLabelAr} />
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/admin/finance/invoices/${inv.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-semibold border border-emerald-200 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          عرض التفاصيل
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: REFUND REQUESTS */}
      {activeTab === 'REFUNDS' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">إدارة طلبات استرجاع الأموال (Refunds Management)</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                مراجعة طلبات الطلاب للانسحاب أو الاسترجاع والتحقق من الأهلية المالية وفق سياسات المنصة.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {refundRequests.map((req) => (
              <div key={req.id} className="border rounded-xl p-4 hover:border-emerald-300 transition-all bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{req.studentNameAr}</span>
                    <span className="text-xs bg-slate-200 text-slate-800 font-mono px-2 py-0.5 rounded">
                      الفاتورة: {req.invoiceNumber}
                    </span>
                    <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                      المبلغ: {req.refundAmount} {req.currency}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700"><strong className="font-semibold">السبب الموثق:</strong> {req.reasonAr}</p>
                  <div className="text-[11px] text-gray-400">تاريخ الطلب: {req.requestedAt}</div>
                </div>

                <div className="flex items-center gap-2">
                  {req.status === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => handleApproveRefund(req.id, req.invoiceNumber)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        الموافقة ومعالجة الاسترجاع
                      </button>
                      <button
                        onClick={() => setRefundRequests(refundRequests.map(r => r.id === req.id ? { ...r, status: 'REJECTED' } : r))}
                        className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-semibold border border-rose-200 transition-colors"
                      >
                        رفض الطلب
                      </button>
                    </>
                  ) : (
                    <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-300">
                      الحالة: {req.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BANK TRANSFERS VERIFICATION */}
      {activeTab === 'BANK_TRANSFERS' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">تدقيق ومطابقة الحوالات البنكية المباشرة</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                مراجعة الإيصالات والتحقق من تحصيل المبالغ في الحساب البنكي الرسمي قبل اعتماد الفاتورة وتأكيد التسجيل.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {bankTransfers.map((bt) => (
              <div key={bt.id} className="border rounded-xl p-4 hover:border-emerald-300 transition-all bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{bt.studentNameAr}</span>
                    <span className="text-xs font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                      الفاتورة: {bt.invoiceNumber}
                    </span>
                    <span className="text-xs font-mono bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded">
                      {bt.amount} {bt.currency}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 font-mono">
                    رقم الحوالة المرجعي: {bt.bankReferenceNumber} | مقبض الإيصال (EAP): <span className="text-blue-700">{bt.eapSlipAssetHandle}</span>
                  </div>
                  <div className="text-[11px] text-gray-400">تاريخ الرفع: {bt.submittedAt}</div>
                </div>

                <div className="flex items-center gap-2">
                  {bt.status === 'PENDING_VERIFICATION' ? (
                    <>
                      <button
                        onClick={() => handleApproveBankTransfer(bt.id, bt.invoiceNumber)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        اعتماد وتأكيد استلام المبلغ
                      </button>
                      <button
                        onClick={() => alert(`طلب إعادة رفع الإيصال للحوالة ${bt.bankReferenceNumber}`)}
                        className="px-3 py-2 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-xl text-xs font-semibold border border-amber-200 transition-colors"
                      >
                        طلب إيصال أوضح
                      </button>
                    </>
                  ) : (
                    <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">
                      تم الاعتماد
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PRICING REFERENCES */}
      {activeTab === 'PRICING' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">المشاهد المرجعية للأسعار الرسمية</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                تُعرض أسعار الدورات والخدمات المجلوبة مرجعيًا من Phase 13 (الدورات) و Phase 20 (الخدمات) دون ملكية المحتوى أو التعديل المباشر المخل بالحدود.
              </p>
            </div>
          </div>

          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 border-b text-gray-600 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">المجال والنطاق المصدر</th>
                  <th className="py-3 px-4">اسم البند / الخدمة</th>
                  <th className="py-3 px-4">السعر المرجعي الرسمي</th>
                  <th className="py-3 px-4">حالة التسعير</th>
                  <th className="py-3 px-4">آخر تحديث</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-800">
                {pricingReferences.map((pr) => (
                  <tr key={pr.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-blue-900">{pr.sourceDomainPhase}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{pr.itemNameAr}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{pr.itemNameEn}</div>
                    </td>
                    <td className="py-3 px-4 font-bold font-mono text-emerald-800">
                      {pr.price.toLocaleString()} {pr.currency}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                        نشط ومعتمد
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-500">{pr.lastUpdated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: FINANCIAL REPORTS */}
      {activeTab === 'REPORTS' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
          <div className="border-b pb-3">
            <h2 className="text-lg font-bold text-gray-900">التقارير المالية والتحليلات الإحصائية</h2>
            <p className="text-xs text-gray-500">ملخصات الأداء المالي والتحصيل الإجمالي حسب البنود ووسائل الدفع.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-5 rounded-2xl border space-y-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-600" />
                توزيع الإيرادات حسب نوع البند
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border">
                  <span>الدورات المدفوعة (Phase 13)</span>
                  <span className="font-bold text-gray-900">4,299 ر.س (92%)</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border">
                  <span>خدمات الطلاب (Phase 20)</span>
                  <span className="font-bold text-gray-900">350 ر.س (8%)</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border space-y-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-600" />
                توزيع الإيرادات حسب وسيلة الدفع
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border">
                  <span>بطاقات مدى Mada & Credit Cards</span>
                  <span className="font-bold text-gray-900">2,499 ر.س (54%)</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border">
                  <span>Apple Pay</span>
                  <span className="font-bold text-gray-900">350 ر.س (8%)</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border">
                  <span>تحويل بنكي مباشر</span>
                  <span className="font-bold text-gray-900">1,800 ر.س (38%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentStatusBadge({ status, label }: { status: string; label: string }) {
  switch (status) {
    case 'PAID':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {label}
        </span>
      );
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
          <Clock className="w-3.5 h-3.5" />
          {label}
        </span>
      );
    case 'FAILED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-semibold">
          <XCircle className="w-3.5 h-3.5" />
          {label}
        </span>
      );
    case 'REFUNDED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
          <RefreshCcw className="w-3.5 h-3.5" />
          {label}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
          {label}
        </span>
      );
  }
}
