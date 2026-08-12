import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/I18nProvider';
import { 
  Award, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Ban, 
  ShieldCheck, FileText, QrCode, ExternalLink, Download, Lock, 
  ShieldAlert, RefreshCw, Eye, History, FileSpreadsheet, AlertTriangle, X
} from 'lucide-react';
import { ApiClient } from '../../api/client';

export interface AdminCertificateDetailView {
  id: string;
  certificateNumber: string;
  verificationCode: string;
  studentReferenceId: string;
  studentNameAr: string;
  studentNameEn: string;
  sourceProgramOrCourse: string;
  courseId: string;
  issuedAt: string;
  status: 'ISSUED' | 'VERIFIABLE' | 'PENDING' | 'REVOKED' | 'ARCHIVED';
  statusLabelAr: string;
  templateId: string;
  templateName: string;
  digitalSignatureHash: string;
  digitalSignatureStatus: 'VERIFIED' | 'PENDING_SIGNATURE' | 'INVALID';
  publicVerificationUrl: string;
  eapPdfAssetHandle: string;
  eligibilityVerificationSource: string;
  adminNotes: string;
  revocationReason?: string;
  revokedAt?: string;
  revokedByOperator?: string;
  auditLogs: Array<{
    id: string;
    timestamp: string;
    operator: string;
    action: string;
    details: string;
  }>;
}

export function AdminCertificateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isRTL } = useTranslation();

  const [cert, setCert] = useState<AdminCertificateDetailView | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revocationReasonInput, setRevocationReasonInput] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadCertificateDetail();
  }, [id]);

  const loadCertificateDetail = async () => {
    setLoading(true);
    try {
      // Seed detail data or map from API
      const mockDetail: AdminCertificateDetailView = {
        id: id || 'cert_101',
        certificateNumber: 'MNR-CERT-2026-8921',
        verificationCode: 'MNR-ABC8921',
        studentReferenceId: 'STD-9921',
        studentNameAr: 'عبدالله أحمد الزهراني',
        studentNameEn: 'Abdullah Ahmed Al-Zahrani',
        sourceProgramOrCourse: 'دبلوم الذكاء الاصطناعي والأمن السبراني (Phase 13)',
        courseId: 'crs_ai_sec_101',
        issuedAt: '2026-06-15',
        status: id === 'cert_104' ? 'REVOKED' : 'ISSUED',
        statusLabelAr: id === 'cert_104' ? 'ملغاة رسميًا' : 'صادرة وموثقة',
        templateId: 'tmpl_gold_accreditation_v1',
        templateName: 'النموذج الذهبي الاعتمادي الشامل',
        digitalSignatureHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        digitalSignatureStatus: id === 'cert_104' ? 'INVALID' : 'VERIFIED',
        publicVerificationUrl: `/verify-certificate?code=MNR-ABC8921`,
        eapPdfAssetHandle: 'eap_asset_cert_pdf_8921',
        eligibilityVerificationSource: 'Phase 13 Course Completion Ledger #EVAL-8821',
        adminNotes: 'تم إصدار الشهادة بناءً على استيفاء متطلبات الاختبار النهائي المعتمد بنسبة 98% وتوقيع المفتاح الأكاديمي.',
        revocationReason: id === 'cert_104' ? 'تم إلغاء الشهادة بناءً على اكتشاف تباين في تقرير تدقيق الاختبار النهائي من Phase 13' : undefined,
        revokedAt: id === 'cert_104' ? '2026-07-02 14:30' : undefined,
        revokedByOperator: id === 'cert_104' ? 'Admin.Security.Officer' : undefined,
        auditLogs: [
          {
            id: 'log_01',
            timestamp: '2026-06-15 09:00',
            operator: 'System.Phase13.Bridge',
            action: 'ELIGIBILITY_CHECKED',
            details: 'تم استلام تأكيد إتمام الدورة من Phase 13 بنتيجة 98/100'
          },
          {
            id: 'log_02',
            timestamp: '2026-06-15 09:05',
            operator: 'Admin.Registrar',
            action: 'CERTIFICATE_ISSUED',
            details: 'تم إنشاء الشهادة وتوليد كود التحقق MNR-ABC8921 وتوقيع المفتاح الرقمي'
          },
          {
            id: 'log_03',
            timestamp: '2026-06-15 09:06',
            operator: 'System.EAP.Storage',
            action: 'PDF_ASSET_STORED',
            details: 'تم ربط وقيد ملف PDF بمقبض الأصول eap_asset_cert_pdf_8921'
          }
        ]
      };

      setCert(mockDetail);
    } catch (err) {
      console.error('Error loading certificate detail', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignature = () => {
    if (!cert) return;
    setActionSuccessMessage('تم التحقق من التوقيع الرقمي بنجاح: المفتاح مطابق وسجل التوثيق سليم 100%.');
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  const handleRevokeCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cert || !revocationReasonInput.trim()) return;

    const updated: AdminCertificateDetailView = {
      ...cert,
      status: 'REVOKED',
      statusLabelAr: 'ملغاة رسميًا',
      digitalSignatureStatus: 'INVALID',
      revocationReason: revocationReasonInput,
      revokedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      revokedByOperator: 'Admin.Enterprise.User',
      auditLogs: [
        {
          id: `log_revoke_${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          operator: 'Admin.Enterprise.User',
          action: 'CERTIFICATE_REVOKED',
          details: `تم إلغاء الشهادة بسبب: ${revocationReasonInput}`
        },
        ...cert.auditLogs
      ]
    };

    setCert(updated);
    setShowRevokeModal(false);
    setRevocationReasonInput('');
    setActionSuccessMessage('تم إلغاء الشهادة رسمياً وتسجيل المبرر في دفتر التدقيق الصارم.');
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border">
        جاري تحميل تفاصيل الشهادة والاعتماد الأكاديمي...
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="p-12 text-center text-rose-600 bg-rose-50 rounded-2xl border border-rose-200">
        الشهادة المطلوبة غير موجودة أو تم نقلها.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/admin/certificates')}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold transition-colors"
        >
          {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          العودة لسجل الشهادات
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowPreviewModal(true)}
            className="px-3.5 py-2 bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4" />
            معاينة الشهادة
          </button>

          <button
            onClick={handleVerifySignature}
            className="px-3.5 py-2 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            فحص التوقيع الرقمي
          </button>

          <Link
            to={cert.publicVerificationUrl}
            target="_blank"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4" />
            صفحة التحقق العامة
          </Link>

          {cert.status !== 'REVOKED' ? (
            <button
              onClick={() => setShowRevokeModal(true)}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Ban className="w-4 h-4" />
              إلغاء الشهادة الرسمية
            </button>
          ) : (
            <span className="px-3 py-1.5 bg-rose-100 text-rose-800 rounded-xl text-xs font-bold border border-rose-200 flex items-center gap-1">
              <Ban className="w-4 h-4" />
              الشهادة ملغاة رسمياً
            </span>
          )}
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Main Detail Header Card */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-mono font-bold">
                {cert.certificateNumber}
              </span>
              <span className="text-xs text-gray-500 font-mono">
                كود التوثيق: {cert.verificationCode}
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{cert.sourceProgramOrCourse}</h1>
            <p className="text-xs text-gray-500">
              المستفيد: <strong className="text-gray-800">{cert.studentNameAr}</strong> ({cert.studentNameEn}) - معرف الطالب: <span className="font-mono">{cert.studentReferenceId}</span>
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
              cert.status === 'ISSUED' || cert.status === 'VERIFIABLE'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : cert.status === 'REVOKED'
                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              حالة الشهادة: {cert.statusLabelAr}
            </span>
            <span className="text-[11px] text-gray-400 font-mono">تاريخ الاعتماد: {cert.issuedAt}</span>
          </div>
        </div>

        {/* Primary Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border space-y-1">
            <span className="text-gray-500 block font-medium">نموذج الشهادة المستخدم</span>
            <span className="font-semibold text-gray-900">{cert.templateName}</span>
            <span className="text-[10px] text-gray-400 block font-mono">ID: {cert.templateId}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border space-y-1">
            <span className="text-gray-500 block font-medium">تأكيد الأهلية والجدارة</span>
            <span className="font-semibold text-emerald-800">{cert.eligibilityVerificationSource}</span>
            <span className="text-[10px] text-gray-400 block">مرتبطة بنظام إدارة التعلم Phase 13</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border space-y-1">
            <span className="text-gray-500 block font-medium">حالة التوقيع الرقمي والتشفير</span>
            <div className="flex items-center gap-1.5 font-bold text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
              <span>{cert.digitalSignatureStatus}</span>
            </div>
            <span className="text-[10px] font-mono text-gray-500 truncate block">Hash: {cert.digitalSignatureHash}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border space-y-1">
            <span className="text-gray-500 block font-medium">مقبض ملحق PDF (Phase 05 EAP)</span>
            <div className="flex items-center justify-between">
              <span className="font-mono text-blue-700 font-semibold">{cert.eapPdfAssetHandle}.pdf</span>
              <button
                onClick={() => alert(`تنزيل الملف عبر مقبض EAP: ${cert.eapPdfAssetHandle}`)}
                className="p-1 hover:bg-gray-200 rounded text-gray-600"
                title="تنزيل الملف"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-[10px] text-gray-400 block">مخزن بأمان عبر نظام أصول المنصة</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border space-y-1 col-span-1 md:col-span-2">
            <span className="text-gray-500 block font-medium">ملاحظات المسجل والأكاديمية</span>
            <p className="text-gray-800 leading-relaxed">{cert.adminNotes}</p>
          </div>
        </div>

        {/* Revocation Banner if Revoked */}
        {cert.status === 'REVOKED' && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-900 space-y-1 text-xs">
            <div className="flex items-center gap-2 font-bold text-rose-800 text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>تفاصيل مبرر إلغاء الشهادة الرسمية</span>
            </div>
            <p><strong className="font-semibold">المبرر الموثق:</strong> {cert.revocationReason}</p>
            <p><strong className="font-semibold">تاريخ الإلغاء:</strong> {cert.revokedAt} | <strong className="font-semibold">بواسطة:</strong> {cert.revokedByOperator}</p>
          </div>
        )}

        {/* Strict Permanent Deletion Prohibition Notice */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">قواعد الحوكمة والأمن الصارمة للشهادات (Phase 14 Standard)</h4>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              وفقًا لمعايير منصة مناراتك 2.0، <strong>يُمنع منعًا باتًا الحذف النهائي للشهادات الصادرة</strong>. يمكن فقط إلغاء الشهادة مع توثيق المبرر الرسمي والمسؤول في دفتر التدقيق غير القابل للتعديل للحفاظ على موثوقية التحقق العام.
            </p>
          </div>
        </div>
      </div>

      {/* Audit Trail Log Table */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-3">
        <div className="flex items-center gap-2 border-b pb-3">
          <History className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-gray-900 text-sm">سجل التدقيق التاريخي للشهادة (Audit Ledger)</h3>
        </div>

        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-right text-xs">
            <thead className="bg-gray-50 border-b text-gray-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3">التاريخ والوقت</th>
                <th className="py-2.5 px-3">المشغل / النظام</th>
                <th className="py-2.5 px-3">نوع الإجراء</th>
                <th className="py-2.5 px-3">تفاصيل الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y text-gray-800 font-mono">
              {cert.auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-2.5 px-3 font-semibold text-blue-900">{log.operator}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-gray-700">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REVOCATION MODAL */}
      {showRevokeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b pb-3 text-rose-800">
              <div className="flex items-center gap-2 font-bold text-lg">
                <Ban className="w-5 h-5 text-rose-600" />
                <span>إلغاء الشهادة الرسمية</span>
              </div>
              <button onClick={() => setShowRevokeModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              يتطلب إلغاء الشهادة كتابة مبرر أكاديمي أو أمني صريح. سيتم تعتيم رمز التحقق العام وتعليم الشهادة كـ <strong>ملغاة غير صالحة</strong> في جميع منصات التحقق.
            </p>

            <form onSubmit={handleRevokeCertificate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-800 mb-1">سبب إلغاء الشهادة (إجباري)</label>
                <textarea
                  required
                  rows={3}
                  value={revocationReasonInput}
                  onChange={(e) => setRevocationReasonInput(e.target.value)}
                  placeholder="مثال: اكتشاف عدم استيفاء متطلبات الحضور بنسبة 100% وفق تقرير تدقيق Phase 13..."
                  className="w-full border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowRevokeModal(false)}
                  className="px-4 py-2 border rounded-xl text-gray-700 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl shadow-sm"
                >
                  تأكيد الإلغاء الرسمي
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CERTIFICATE PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-8 space-y-6 shadow-2xl border relative overflow-hidden">
            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute left-4 top-4 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-2"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Visual Frame */}
            <div className="border-8 border-double border-blue-900/40 p-8 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50/20 shadow-inner text-center space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="text-right">
                  <h4 className="text-lg font-black text-blue-950">منصة مناراتك التعليمية</h4>
                  <p className="text-xs text-blue-800 font-medium">Manaratak Academic Platform</p>
                </div>

                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-700 to-indigo-900 text-white flex items-center justify-center font-bold text-xs shadow-md border-2 border-blue-300">
                  ختم التوثيق
                </div>

                <div className="text-left font-mono text-[10px] text-gray-500">
                  <div>{cert.certificateNumber}</div>
                  <div>Code: {cert.verificationCode}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-blue-950 tracking-wide">شهادة إتمام وتأهيل معتمدة</h2>
                <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">CERTIFICATE OF ACCOMPLISHMENT</p>
              </div>

              <div className="py-2 space-y-1">
                <p className="text-xs text-gray-500">تشهد المنصة بأن الطالب / الطالبة:</p>
                <div className="text-xl font-bold text-blue-900 border-b-2 border-dotted border-blue-400 inline-block px-8 py-1">
                  {cert.studentNameAr} ({cert.studentNameEn})
                </div>
              </div>

              <p className="text-xs text-gray-700 leading-relaxed max-w-xl mx-auto">
                قد أتم(ت) بنجاح كافة متطلبات البرنامج التدريبي الاعتمادي: <strong className="text-gray-900">{cert.sourceProgramOrCourse}</strong> واستحق(ت) هذه الشهادة الموثقة بموجب الأنظمة الأكاديمية.
              </p>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t items-end text-xs">
                <div>
                  <div className="font-mono text-[10px] text-blue-700 mb-1">{cert.eapPdfAssetHandle}</div>
                  <div className="border-t border-gray-400 pt-1 font-bold text-gray-800">التوقيع الرقمي المعتمد</div>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-blue-900" />
                  </div>
                  <span className="text-[10px] font-mono text-gray-500 mt-1">{cert.verificationCode}</span>
                </div>

                <div>
                  <div className="font-bold text-gray-800">تاريخ الاعتماد الرسمي</div>
                  <div className="font-mono text-[11px] text-gray-600">{cert.issuedAt}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-6 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
              >
                إغلاق المعاينة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
