import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/I18nProvider';
import { 
  Award, Search, Plus, CheckCircle2, AlertCircle, RefreshCw, 
  FileText, ShieldCheck, Ban, ArrowRight, ArrowLeft, Eye, 
  QrCode, ExternalLink, Download, Layers, Shield, FileSpreadsheet, X, Check, Lock, Clock
} from 'lucide-react';
import { ApiClient } from '../../api/client';

export interface AdminCertificateRegistryItem {
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
  digitalSignatureStatus: 'VERIFIED' | 'PENDING_SIGNATURE' | 'INVALID';
  publicVerificationUrl: string;
  eapPdfAssetHandle: string;
  eligibilityVerificationSource: string;
}

export interface AdminPendingIssuanceRequest {
  id: string;
  studentReferenceId: string;
  studentNameAr: string;
  studentNameEn: string;
  courseOrProgramName: string;
  courseId: string;
  eligibilitySource: string;
  requestedAt: string;
  status: 'PENDING_REVIEW' | 'ELIGIBILITY_VERIFIED' | 'REJECTED';
  proposedTemplateId: string;
}

export interface AdminCertificateTemplate {
  id: string;
  nameAr: string;
  nameEn: string;
  language: 'ARABIC' | 'ENGLISH' | 'BILINGUAL';
  logoEapAssetHandle: string;
  signatureEapAssetHandle: string;
  accentColorHex: string;
  paperStyle: 'LUXURY_PARCHMENT' | 'MODERN_MINIMAL' | 'OFFICIAL_ACADEMIC';
  legalTextAr: string;
  legalTextEn: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  updatedAt: string;
}

export function AdminCertificatesPreviewPage() {
  const navigate = useNavigate();
  const { isRTL } = useTranslation();

  const [activeTab, setActiveTab] = useState<'REGISTRY' | 'REQUESTS' | 'TEMPLATES'>('REGISTRY');
  const [certificates, setCertificates] = useState<AdminCertificateRegistryItem[]>([]);
  const [pendingRequests, setPendingRequests] = useState<AdminPendingIssuanceRequest[]>([]);
  const [templates, setTemplates] = useState<AdminCertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Modal State for New Template
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [previewingTemplate, setPreviewingTemplate] = useState<AdminCertificateTemplate | null>(null);
  
  const [newTemplate, setNewTemplate] = useState({
    nameAr: '',
    nameEn: '',
    language: 'BILINGUAL' as const,
    logoEapAssetHandle: 'eap_asset_logo_manaratak_gold_v1',
    signatureEapAssetHandle: 'eap_asset_sig_rector_alrashed_v1',
    accentColorHex: '#1E3A8A',
    paperStyle: 'OFFICIAL_ACADEMIC' as const,
    legalTextAr: 'تشهد منصة مناراتك الأكاديمية ومؤسسة الاعتماد التعليمي بأن الطالب المذكور أعلاه قد أتم بنجاح كافة ومتطلبات البرنامج التدريبي المحدد وفق أعلى معايير الجودة الأكاديمية.',
    legalTextEn: 'Manaratak Academic Platform and the Educational Accreditation Body certify that the student named above has successfully fulfilled all academic requirements in accordance with quality standards.'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Seed rich dataset adhering strictly to Phase 14 & Phase 23 specifications
      setCertificates([
        {
          id: 'cert_101',
          certificateNumber: 'MNR-CERT-2026-8921',
          verificationCode: 'MNR-ABC8921',
          studentReferenceId: 'STD-9921',
          studentNameAr: 'عبدالله أحمد الزهراني',
          studentNameEn: 'Abdullah Ahmed Al-Zahrani',
          sourceProgramOrCourse: 'دبلوم الذكاء الاصطناعي والأمن السبراني (Phase 13)',
          courseId: 'crs_ai_sec_101',
          issuedAt: '2026-06-15',
          status: 'ISSUED',
          statusLabelAr: 'صادرة وموثقة',
          templateId: 'tmpl_gold_accreditation_v1',
          templateName: 'النموذج الذهبي الاعتمادي الشامل',
          digitalSignatureStatus: 'VERIFIED',
          publicVerificationUrl: '/verify-certificate?code=MNR-ABC8921',
          eapPdfAssetHandle: 'eap_asset_cert_pdf_8921',
          eligibilityVerificationSource: 'Phase 13 Course Completion Ledger #EVAL-8821'
        },
        {
          id: 'cert_102',
          certificateNumber: 'MNR-CERT-2026-8922',
          verificationCode: 'MNR-ABC8922',
          studentReferenceId: 'STD-8842',
          studentNameAr: 'نورة سعيد الغامدي',
          studentNameEn: 'Noura Said Al-Ghamdi',
          sourceProgramOrCourse: 'برنامج قيادة الابتكار الأكاديمي (Phase 13)',
          courseId: 'crs_inn_ldr_202',
          issuedAt: '2026-07-01',
          status: 'VERIFIABLE',
          statusLabelAr: 'قابلة للتحقق العام',
          templateId: 'tmpl_modern_minimal_v2',
          templateName: 'النموذج الأكاديمي الحديث',
          digitalSignatureStatus: 'VERIFIED',
          publicVerificationUrl: '/verify-certificate?code=MNR-ABC8922',
          eapPdfAssetHandle: 'eap_asset_cert_pdf_8922',
          eligibilityVerificationSource: 'Phase 13 Exam Verification #EXAM-9912'
        },
        {
          id: 'cert_103',
          certificateNumber: 'MNR-CERT-2026-8923',
          verificationCode: 'MNR-ABC8923',
          studentReferenceId: 'STD-7711',
          studentNameAr: 'فهد محمد العتيبي',
          studentNameEn: 'Fahad Mohammed Al-Otaibi',
          sourceProgramOrCourse: 'دورة هندسة البيانات الضخمة (Phase 13)',
          courseId: 'crs_big_data_301',
          issuedAt: '2026-07-20',
          status: 'PENDING',
          statusLabelAr: 'قيد التوقيع الرقمي',
          templateId: 'tmpl_gold_accreditation_v1',
          templateName: 'النموذج الذهبي الاعتمادي الشامل',
          digitalSignatureStatus: 'PENDING_SIGNATURE',
          publicVerificationUrl: '/verify-certificate?code=MNR-ABC8923',
          eapPdfAssetHandle: 'eap_asset_cert_pdf_8923',
          eligibilityVerificationSource: 'Phase 13 Project Pass Receipt #PRJ-3312'
        },
        {
          id: 'cert_104',
          certificateNumber: 'MNR-CERT-2026-8924',
          verificationCode: 'MNR-ABC8924',
          studentReferenceId: 'STD-6632',
          studentNameAr: 'سارة خالد الدوسري',
          studentNameEn: 'Sarah Khalid Al-Dossary',
          sourceProgramOrCourse: 'ماجستير إدارة البيانات السحابية (Phase 13)',
          courseId: 'crs_cloud_data_401',
          issuedAt: '2026-05-10',
          status: 'REVOKED',
          statusLabelAr: 'ملغاة رسميًا',
          templateId: 'tmpl_gold_accreditation_v1',
          templateName: 'النموذج الذهبي الاعتمادي الشامل',
          digitalSignatureStatus: 'INVALID',
          publicVerificationUrl: '/verify-certificate?code=MNR-ABC8924',
          eapPdfAssetHandle: 'eap_asset_cert_pdf_8924',
          eligibilityVerificationSource: 'Phase 13 Audit Discrepancy #AUD-1102'
        },
        {
          id: 'cert_105',
          certificateNumber: 'MNR-CERT-2025-7712',
          verificationCode: 'MNR-XYZ7712',
          studentReferenceId: 'STD-5521',
          studentNameAr: 'عمر طارق الشمري',
          studentNameEn: 'Omar Tariq Al-Shammari',
          sourceProgramOrCourse: 'شهادة أساسيات الأمن السيبراني 2025',
          courseId: 'crs_cyber_base_001',
          issuedAt: '2025-11-20',
          status: 'ARCHIVED',
          statusLabelAr: 'مؤرشفة',
          templateId: 'tmpl_official_archive_v1',
          templateName: 'النموذج الأرشيفي الأكاديمي',
          digitalSignatureStatus: 'VERIFIED',
          publicVerificationUrl: '/verify-certificate?code=MNR-XYZ7712',
          eapPdfAssetHandle: 'eap_asset_cert_pdf_7712',
          eligibilityVerificationSource: 'Phase 13 Legacy Verification'
        }
      ]);

      setPendingRequests([
        {
          id: 'req_201',
          studentReferenceId: 'STD-4401',
          studentNameAr: 'ريم عبدالأمير الحسين',
          studentNameEn: 'Reem Abdulamir Al-Hussain',
          courseOrProgramName: 'دبلوم تحليل البيانات الذكية (Phase 13)',
          courseId: 'crs_data_analytics_201',
          eligibilitySource: 'Phase 13 Verified Completion #EVAL-9901 - Score: 96/100',
          requestedAt: '2026-07-26',
          status: 'ELIGIBILITY_VERIFIED',
          proposedTemplateId: 'tmpl_gold_accreditation_v1'
        },
        {
          id: 'req_202',
          studentReferenceId: 'STD-3392',
          studentNameAr: 'ماجد بن سلمان القرني',
          studentNameEn: 'Majed Salman Al-Qarni',
          courseOrProgramName: 'برنامج الحوسبة السحابية المتقدمة (Phase 13)',
          courseId: 'crs_adv_cloud_302',
          eligibilitySource: 'Phase 13 Verified Completion #EVAL-9902 - Score: 91/100',
          requestedAt: '2026-07-27',
          status: 'PENDING_REVIEW',
          proposedTemplateId: 'tmpl_modern_minimal_v2'
        }
      ]);

      setTemplates([
        {
          id: 'tmpl_gold_accreditation_v1',
          nameAr: 'النموذج الذهبي الاعتمادي الشامل',
          nameEn: 'Golden Accreditation Standard Template',
          language: 'BILINGUAL',
          logoEapAssetHandle: 'eap_asset_logo_manaratak_gold_v1',
          signatureEapAssetHandle: 'eap_asset_sig_rector_alrashed_v1',
          accentColorHex: '#1E3A8A',
          paperStyle: 'LUXURY_PARCHMENT',
          legalTextAr: 'تشهد منصة مناراتك الأكاديمية ومؤسسة الاعتماد التعليمي بأن الطالب قد استوفى كافة ومتطلبات البرنامج بنجاح...',
          legalTextEn: 'Manaratak Academic Platform certifies that the student has successfully completed the required curriculum...',
          status: 'ACTIVE',
          updatedAt: '2026-07-10'
        },
        {
          id: 'tmpl_modern_minimal_v2',
          nameAr: 'النموذج الأكاديمي الحديث',
          nameEn: 'Modern Academic Minimal Template',
          language: 'ARABIC',
          logoEapAssetHandle: 'eap_asset_logo_manaratak_blue_v2',
          signatureEapAssetHandle: 'eap_asset_sig_dean_academic_v2',
          accentColorHex: '#0D9488',
          paperStyle: 'MODERN_MINIMAL',
          legalTextAr: 'شهادة إتمام معتمدة رسميًا صالحة للتحقق عبر رمز الاستجابة السريع والرمز الموحد...',
          legalTextEn: 'Officially verified completion certificate valid via QR code and unified verification code...',
          status: 'ACTIVE',
          updatedAt: '2026-07-18'
        }
      ]);
    } catch (err) {
      console.error('Error loading certificates data', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch = 
      cert.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.verificationCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.studentNameAr.includes(searchQuery) ||
      cert.studentNameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.studentReferenceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.sourceProgramOrCourse.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatusFilter === 'ALL' || cert.status === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const created: AdminCertificateTemplate = {
      id: `tmpl_custom_${Date.now()}`,
      nameAr: newTemplate.nameAr || 'نموذج شهادة جديد',
      nameEn: newTemplate.nameEn || 'New Custom Template',
      language: newTemplate.language,
      logoEapAssetHandle: newTemplate.logoEapAssetHandle,
      signatureEapAssetHandle: newTemplate.signatureEapAssetHandle,
      accentColorHex: newTemplate.accentColorHex,
      paperStyle: newTemplate.paperStyle,
      legalTextAr: newTemplate.legalTextAr,
      legalTextEn: newTemplate.legalTextEn,
      status: 'ACTIVE',
      updatedAt: '2026-07-28'
    };
    setTemplates([created, ...templates]);
    setShowTemplateModal(false);
  };

  const handleApprovePendingRequest = (reqId: string) => {
    const req = pendingRequests.find((r) => r.id === reqId);
    if (!req) return;

    const newCert: AdminCertificateRegistryItem = {
      id: `cert_new_${Date.now()}`,
      certificateNumber: `MNR-CERT-2026-${Math.floor(8000 + Math.random() * 1000)}`,
      verificationCode: `MNR-NEW${Math.floor(1000 + Math.random() * 9000)}`,
      studentReferenceId: req.studentReferenceId,
      studentNameAr: req.studentNameAr,
      studentNameEn: req.studentNameEn,
      sourceProgramOrCourse: req.courseOrProgramName,
      courseId: req.courseId,
      issuedAt: new Date().toISOString().split('T')[0],
      status: 'ISSUED',
      statusLabelAr: 'صادرة وموثقة',
      templateId: req.proposedTemplateId,
      templateName: 'النموذج الذهبي الاعتمادي الشامل',
      digitalSignatureStatus: 'VERIFIED',
      publicVerificationUrl: `/verify-certificate?code=MNR-NEW${Math.floor(1000 + Math.random() * 9000)}`,
      eapPdfAssetHandle: `eap_asset_cert_pdf_${Date.now()}`,
      eligibilityVerificationSource: req.eligibilitySource
    };

    setCertificates([newCert, ...certificates]);
    setPendingRequests(pendingRequests.filter((r) => r.id !== reqId));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-blue-800/40">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-400/30">
              <Award className="w-8 h-8 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">إدارة الشهادات والاعتمادات الأكاديمية</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Phase 14 Standard
                </span>
              </div>
              <p className="text-sm text-blue-200 mt-1">
                منظومة إصدار، توثيق، وإلغاء الشهادات الرسمية وإدارة نماذج التوثيق الرقمي والربط برمز التحقق العام.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('TEMPLATES')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-800/60 hover:bg-blue-700/60 text-blue-100 rounded-xl text-sm font-medium border border-blue-700/50 transition-colors"
            >
              <FileText className="w-4 h-4" />
              نماذج الشهادات ({templates.length})
            </button>
            <button
              onClick={() => setActiveTab('REQUESTS')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              طلبات الإصدار ({pendingRequests.length})
            </button>
          </div>
        </div>

        {/* Boundary Disclaimer */}
        <div className="mt-4 pt-4 border-t border-blue-800/60 flex flex-wrap items-center justify-between text-xs text-blue-300 gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>حدود النطاق: Phase 14 تملك حورة إصدار وإلغاء الشهادات | Phase 13 تملك الجدارة والدرجات | Phase 05 تملك الأصول والملفات عبر EAP</span>
          </div>
          <div className="flex items-center gap-3">
            <span>التحقق العام: مصان بدون كشف البيانات الشخصية للطلاب</span>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">إجمالي الشهادات</span>
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
          <span className="text-[10px] text-gray-500">مسجلة في دفتر التوثيق</span>
        </div>

        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">شهادات موثقة نشطة</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700">
            {certificates.filter((c) => c.status === 'ISSUED' || c.status === 'VERIFIABLE').length}
          </p>
          <span className="text-[10px] text-emerald-600">جاهزة للتحقق العام</span>
        </div>

        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">طلبات إصدار معلقة</span>
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700">{pendingRequests.length}</p>
          <span className="text-[10px] text-amber-600">تتطلب مراجعة الأهلية</span>
        </div>

        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">شهادات ملغاة</span>
            <Ban className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-700">
            {certificates.filter((c) => c.status === 'REVOKED').length}
          </p>
          <span className="text-[10px] text-rose-600">ملغاة مع مبرر موثق</span>
        </div>

        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">قوالب الشهادات</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-indigo-700">{templates.length}</p>
          <span className="text-[10px] text-indigo-600">نماذج معتمدة رسمية</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border p-1.5 flex items-center gap-1 shadow-sm">
        <button
          onClick={() => setActiveTab('REGISTRY')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'REGISTRY'
              ? 'bg-blue-600 text-white shadow'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Award className="w-4 h-4" />
          سجل الشهادات الصادرة ({certificates.length})
        </button>

        <button
          onClick={() => setActiveTab('REQUESTS')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'REQUESTS'
              ? 'bg-blue-600 text-white shadow'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          طلبات الإصدار المعلقة ({pendingRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('TEMPLATES')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'TEMPLATES'
              ? 'bg-blue-600 text-white shadow'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          نماذج وقوالب الشهادات ({templates.length})
        </button>
      </div>

      {/* TAB 1: CERTIFICATES REGISTRY */}
      {activeTab === 'REGISTRY' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute right-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث برقم الشهادة، اسم الطالب، الرمز الموحد..."
                className="w-full pr-9 pl-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="border rounded-xl px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">جميع الحالات</option>
                <option value="ISSUED">صادرة وموثقة</option>
                <option value="VERIFIABLE">قابلة للتحقق</option>
                <option value="PENDING">قيد التوقيع</option>
                <option value="REVOKED">ملغاة</option>
                <option value="ARCHIVED">مؤرشفة</option>
              </select>

              <button
                onClick={loadData}
                className="p-2 border rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
                title="تحديث البيانات"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Simple Clean Vertical List of Certificates */}
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50 border-b text-gray-600 font-semibold text-xs uppercase">
                <tr>
                  <th className="py-3.5 px-4">رقم الشهادة والرمز</th>
                  <th className="py-3.5 px-4">الطالب المستفيد</th>
                  <th className="py-3.5 px-4">البرنامج / الدورة المصدر</th>
                  <th className="py-3.5 px-4">تاريخ الاعتماد</th>
                  <th className="py-3.5 px-4">حالة الشهادة</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-800">
                {filteredCertificates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      لا توجد شهادات مطابقة لمعايير البحث الحالية.
                    </td>
                  </tr>
                ) : (
                  filteredCertificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-blue-900">
                        <div>{cert.certificateNumber}</div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded border">
                          كود: {cert.verificationCode}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">{cert.studentNameAr}</div>
                        <div className="text-xs text-gray-500 font-mono">{cert.studentReferenceId} | {cert.studentNameEn}</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate">
                        <span className="text-gray-900">{cert.sourceProgramOrCourse}</span>
                      </td>

                      <td className="py-3.5 px-4 text-gray-600 font-mono text-xs whitespace-nowrap">
                        {cert.issuedAt}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={cert.status} label={cert.statusLabelAr} />
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/admin/certificates/${cert.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold border border-blue-200 transition-colors"
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

      {/* TAB 2: PENDING ISSUANCE REQUESTS */}
      {activeTab === 'REQUESTS' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">طلبات إصدار الشهادات المعلقة</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                تتطلب الشهادات التحقق من جدارة إتمام الدورة من Phase 13 قبل الإصدار النهائي وتوقيع المفتاح الرقمي.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {pendingRequests.length === 0 ? (
              <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                لا توجد طلبات إصدار معلقة حاليًا.
              </div>
            ) : (
              pendingRequests.map((req) => (
                <div key={req.id} className="border rounded-xl p-4 hover:border-blue-300 transition-all bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{req.studentNameAr}</span>
                      <span className="text-xs bg-blue-100 text-blue-800 font-mono px-2 py-0.5 rounded">
                        {req.studentReferenceId}
                      </span>
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">
                        متحقق من الجدارة (Phase 13)
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-700">{req.courseOrProgramName}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>مصدر الأهلية: {req.eligibilitySource}</span>
                      <span>•</span>
                      <span>تاريخ الطلب: {req.requestedAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprovePendingRequest(req.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      اعتماد وإصدار الشهادة
                    </button>
                    <button
                      onClick={() => setPendingRequests(pendingRequests.filter(r => r.id !== req.id))}
                      className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-semibold border border-rose-200 transition-colors"
                    >
                      رفض الطلب
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CERTIFICATE TEMPLATES */}
      {activeTab === 'TEMPLATES' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">إدارة نماذج وقوالب الشهادات الرسمية</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                تكوين المظهر البصري، الشعارات، التواقيع الرسمية عبر مقبض أصول EAP (Phase 05)، والنصوص القانونية.
              </p>
            </div>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              إضافة نموذج جديد
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tmpl) => (
              <div key={tmpl.id} className="border rounded-2xl p-5 hover:shadow-md transition-all space-y-3 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{tmpl.nameAr}</h3>
                    <p className="text-xs text-gray-500 font-mono">{tmpl.nameEn}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
                    {tmpl.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl">
                  <div>
                    <span className="text-gray-500 block">اللغة:</span>
                    <span className="font-semibold text-gray-800">{tmpl.language}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">نمط الورق:</span>
                    <span className="font-semibold text-gray-800">{tmpl.paperStyle}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 block">شعار EAP:</span>
                    <span className="font-mono text-blue-700">{tmpl.logoEapAssetHandle}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 block">توقيع EAP:</span>
                    <span className="font-mono text-blue-700">{tmpl.signatureEapAssetHandle}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t text-xs">
                  <span className="text-gray-400">آخر تحديث: {tmpl.updatedAt}</span>
                  <button
                    onClick={() => setPreviewingTemplate(tmpl)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    معاينة النموذج
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE TEMPLATE MODAL */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-gray-900">إضافة نموذج شهادة معتمد جديد</h3>
              <button onClick={() => setShowTemplateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">اسم النموذج باللغة العربية</label>
                <input
                  type="text"
                  required
                  value={newTemplate.nameAr}
                  onChange={(e) => setNewTemplate({ ...newTemplate, nameAr: e.target.value })}
                  placeholder="مثال: النموذج الأكاديمي المعتمد 2026"
                  className="w-full border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">اسم النموذج باللغة الإنجليزية</label>
                <input
                  type="text"
                  required
                  value={newTemplate.nameEn}
                  onChange={(e) => setNewTemplate({ ...newTemplate, nameEn: e.target.value })}
                  placeholder="Example: Official Academic Accreditation Template 2026"
                  className="w-full border rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">اللغات المعتمدة</label>
                  <select
                    value={newTemplate.language}
                    onChange={(e: any) => setNewTemplate({ ...newTemplate, language: e.target.value })}
                    className="w-full border rounded-xl p-2.5 text-sm bg-white"
                  >
                    <option value="BILINGUAL">ثنائي اللغة (عربي / إنجليزي)</option>
                    <option value="ARABIC">اللغة العربية فقط</option>
                    <option value="ENGLISH">اللغة الإنجليزية فقط</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">نمط تصميم الورقة</label>
                  <select
                    value={newTemplate.paperStyle}
                    onChange={(e: any) => setNewTemplate({ ...newTemplate, paperStyle: e.target.value })}
                    className="w-full border rounded-xl p-2.5 text-sm bg-white"
                  >
                    <option value="OFFICIAL_ACADEMIC">أكاديمي رسمي مع إطار محفور</option>
                    <option value="LUXURY_PARCHMENT">فاخر مع وختم مذهب</option>
                    <option value="MODERN_MINIMAL">عصري مبسط حديث</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">مقبض الشعار الرسمي (Phase 05 EAP)</label>
                  <input
                    type="text"
                    value={newTemplate.logoEapAssetHandle}
                    onChange={(e) => setNewTemplate({ ...newTemplate, logoEapAssetHandle: e.target.value })}
                    className="w-full border rounded-xl p-2.5 text-xs font-mono bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">مقبض التوقيع الرسمي (Phase 05 EAP)</label>
                  <input
                    type="text"
                    value={newTemplate.signatureEapAssetHandle}
                    onChange={(e) => setNewTemplate({ ...newTemplate, signatureEapAssetHandle: e.target.value })}
                    className="w-full border rounded-xl p-2.5 text-xs font-mono bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">النص الاعتمادي القانوني باللغة العربية</label>
                <textarea
                  rows={2}
                  value={newTemplate.legalTextAr}
                  onChange={(e) => setNewTemplate({ ...newTemplate, legalTextAr: e.target.value })}
                  className="w-full border rounded-xl p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-gray-50 text-gray-700 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-sm"
                >
                  حفظ القالب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEMPLATE VISUAL PREVIEW MODAL */}
      {previewingTemplate && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-8 space-y-6 shadow-2xl border relative overflow-hidden">
            <button
              onClick={() => setPreviewingTemplate(null)}
              className="absolute left-4 top-4 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-2"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Visual Certificate Frame */}
            <div className="border-8 border-double border-amber-600/40 p-8 rounded-2xl bg-gradient-to-br from-amber-50/30 via-white to-blue-50/20 shadow-inner relative text-center space-y-6">
              {/* Header Badge & Seal */}
              <div className="flex items-center justify-between border-b border-amber-200 pb-4">
                <div className="text-right">
                  <h4 className="text-lg font-black text-blue-950">منصة مناراتك التعليمية</h4>
                  <p className="text-xs text-amber-800 font-medium">Manaratak Academic Platform</p>
                </div>

                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-md border-2 border-amber-200">
                  ختم التوثيق
                </div>

                <div className="text-left font-mono text-[10px] text-gray-500">
                  <div>EAP Logo: {previewingTemplate.logoEapAssetHandle}</div>
                  <div>Style: {previewingTemplate.paperStyle}</div>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-amber-900 tracking-wide">شهادة إتمام وتأهيل معتمدة</h2>
                <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">CERTIFICATE OF ACCOMPLISHMENT</p>
              </div>

              {/* Student Placeholder */}
              <div className="py-2 space-y-1">
                <p className="text-xs text-gray-500">تشهد المنصة بأن الطالب / الطالبة:</p>
                <div className="text-xl font-bold text-blue-900 border-b-2 border-dotted border-blue-400 inline-block px-8 py-1">
                  [ اسم الطالب المستفيد يظهر هنا ]
                </div>
              </div>

              {/* Legal Text */}
              <p className="text-xs text-gray-700 leading-relaxed max-w-xl mx-auto">
                {previewingTemplate.legalTextAr}
              </p>

              {/* Signatures & QR Placeholder Footer */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-amber-200 items-end text-xs">
                <div>
                  <div className="font-mono text-[10px] text-gray-500 mb-1">{previewingTemplate.signatureEapAssetHandle}</div>
                  <div className="border-t border-gray-400 pt-1 font-bold text-gray-800">توقيع العميد الأكاديمي</div>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-gray-700" />
                  </div>
                  <span className="text-[10px] font-mono text-gray-500 mt-1">رمز التحقق العام</span>
                </div>

                <div>
                  <div className="font-bold text-gray-800">تاريخ الإصدار والاعتماد</div>
                  <div className="font-mono text-[11px] text-gray-600">{new Date().toISOString().split('T')[0]}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewingTemplate(null)}
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

function StatusBadge({ status, label }: { status: string; label: string }) {
  switch (status) {
    case 'ISSUED':
    case 'VERIFIABLE':
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
    case 'REVOKED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-semibold">
          <Ban className="w-3.5 h-3.5" />
          {label}
        </span>
      );
    case 'ARCHIVED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
          <Lock className="w-3.5 h-3.5" />
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
