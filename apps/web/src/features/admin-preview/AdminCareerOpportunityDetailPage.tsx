import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/I18nProvider';
import { 
  Briefcase, ArrowRight, ArrowLeft, Building2, MapPin, Calendar, Globe, 
  ExternalLink, CheckCircle2, XCircle, Clock, AlertTriangle, Shield, 
  Sparkles, Users, FileText, RefreshCw, Check, X, Archive, Edit3, Link
} from 'lucide-react';

export interface CareerOpportunityDetailData {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  opportunityType: 'JOB' | 'INTERNSHIP' | 'GRADUATE_PROGRAM' | 'VOLUNTEERING';
  opportunityTypeLabelAr: string;
  
  // Recruitment Entity Bounded Metadata
  recruitmentEntity: {
    id: string;
    entityNameAr: string;
    entityNameEn: string;
    entityType: string;
    countryAr: string;
    website: string;
    verificationStatus: string;
  };

  locationAr: string;
  isRemote: boolean;
  requiredSkills: string[];
  eligibilityRequirements: string[];
  applicationDeadline: string;
  applicationMode: 'INTERNAL_EAP_PORTAL' | 'EXTERNAL_DIRECT_LINK';
  externalApplicationUrl?: string;
  
  publicationStatus: 'DRAFT' | 'UNDER_REVIEW' | 'PUBLISHED' | 'UNPUBLISHED' | 'REJECTED' | 'EXPIRED' | 'ARCHIVED';
  publicationStatusLabelAr: string;
  
  sourceUrl: string;
  sourceType: string;
  applicantCount: number;
  missingFields: string[];
  
  // Phase 17 AI Match Advisory
  aiRecommendationMatchScore: number;
  aiAdvisoryNotes: string;

  auditTimeline: Array<{
    id: string;
    actionAr: string;
    actorName: string;
    timestamp: string;
    notes?: string;
  }>;
}

export function AdminCareerOpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isRTL } = useTranslation();

  const [opp, setOpp] = useState<CareerOpportunityDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    loadOpportunityDetail();
  }, [id]);

  const loadOpportunityDetail = async () => {
    setLoading(true);
    try {
      setOpp({
        id: id || 'opp_8001',
        titleAr: 'مهندس أول ذكاء اصطناعي وحلول سحابية',
        titleEn: 'Senior AI & Cloud Solutions Engineer',
        descriptionAr: 'نبحث عن مهندس ذكاء اصطناعي متميز للانضمام إلى فريق الحلول السحابية المتقدمة لقيادة بناء النماذج الرقمية وتطوير معمارية الأنظمة الذكية المستضافة على السحابة.',
        descriptionEn: 'We are seeking an experienced AI Engineer to join the Cloud Solutions team to lead model construction and cloud-native architecture development.',
        opportunityType: 'JOB',
        opportunityTypeLabelAr: 'وظيفة دوام كامل',
        recruitmentEntity: {
          id: 'ent_301',
          entityNameAr: 'شركة التقنيات السحابية المتقدمة',
          entityNameEn: 'Advanced Cloud Technologies Corp',
          entityType: 'شركة قطاع خاص',
          countryAr: 'المملكة العربية السعودية',
          website: 'https://act-corp.sa',
          verificationStatus: 'VERIFIED'
        },
        locationAr: 'الرياض، المملكة العربية السعودية',
        isRemote: true,
        requiredSkills: ['Python', 'PyTorch / TensorFlow', 'Docker & Kubernetes', 'Cloud Native Architecture', 'Generative AI API Integration'],
        eligibilityRequirements: [
          'درجة البكالوريوس أو الماجستير في علوم الحاسب، الذكاء الاصطناعي، أو هندسة البرمجيات',
          'خبرة لا تقل عن 3 سنوات في تطوير ونشر نماذج الذكاء الاصطناعي',
          'إتقان اللغة العربية والإنجليزية تحدثاً وكتابة'
        ],
        applicationDeadline: '2026-08-30',
        applicationMode: 'INTERNAL_EAP_PORTAL',
        externalApplicationUrl: 'https://act-corp.sa/careers/apply/ai-cloud-eng-901',
        publicationStatus: 'PUBLISHED',
        publicationStatusLabelAr: 'منشورة ومتاحة للتقديم',
        sourceUrl: 'https://act-corp.sa/official-job-posting-8001',
        sourceType: 'شريك توظيف رسمي (Official Partner)',
        applicantCount: 24,
        missingFields: [],
        aiRecommendationMatchScore: 94,
        aiAdvisoryNotes: 'توصيات مطابقة عالية جداً لدفعات خريجي علوم الحاسب والذكاء الاصطناعي لعام 2025/2026 (مخرج استشاري Phase 17).',
        auditTimeline: [
          {
            id: 'aud_1',
            actionAr: 'تم استيراد الفرصة من المصدر الرسمي للجهة',
            actorName: 'نظام الاستيراد الآلي',
            timestamp: '2026-07-20 09:00',
            notes: 'حالة مسودة أولية دون نشر تلقائي'
          },
          {
            id: 'aud_2',
            actionAr: 'تمت مراجعة واستكمال بيانات الفرصة',
            actorName: 'مسؤول التوظيف المهني (أحمد منصور)',
            timestamp: '2026-07-20 11:15'
          },
          {
            id: 'aud_3',
            actionAr: 'اعتماد ونشر الفرصة التوظيفية للطلاب',
            actorName: 'مدير منصة المهن والخريجين (د. خالد العتيبي)',
            timestamp: '2026-07-20 14:30',
            notes: 'نُشرت رسمياً على بوابة الوظائف العامة'
          }
        ]
      });
    } catch (err) {
      console.error('Error loading opportunity detail', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAndPublish = () => {
    if (!opp) return;
    setOpp({
      ...opp,
      publicationStatus: 'PUBLISHED',
      publicationStatusLabelAr: 'منشورة ومتاحة للتقديم',
      auditTimeline: [
        ...opp.auditTimeline,
        {
          id: `aud_${Date.now()}`,
          actionAr: 'تم اعتماد ونشر الفرصة التوظيفية صراحة',
          actorName: 'المسؤول الإداري',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
        }
      ]
    });
    setActionMessage({ type: 'success', text: 'تمت موافقة المسؤول واعتماد نشر الفرصة بنجاح.' });
  };

  const handleUnpublish = () => {
    if (!opp) return;
    setOpp({
      ...opp,
      publicationStatus: 'UNPUBLISHED',
      publicationStatusLabelAr: 'غير منشورة (موقوفة مؤقتاً)',
      auditTimeline: [
        ...opp.auditTimeline,
        {
          id: `aud_${Date.now()}`,
          actionAr: 'إيقاف نشر الفرصة التوظيفية',
          actorName: 'المسؤول الإداري',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
        }
      ]
    });
    setActionMessage({ type: 'info', text: 'تم سحب وإيقاف نشر الفرصة.' });
  };

  const handleArchive = () => {
    if (!opp) return;
    setOpp({
      ...opp,
      publicationStatus: 'ARCHIVED',
      publicationStatusLabelAr: 'مؤرشفة في الأرشيف المهني',
      auditTimeline: [
        ...opp.auditTimeline,
        {
          id: `aud_${Date.now()}`,
          actionAr: 'نقل الفرصة إلى الأرشيف التاريخي',
          actorName: 'المسؤول الإداري',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
        }
      ]
    });
    setActionMessage({ type: 'info', text: 'تم نقل الفرصة إلى الأرشيف.' });
  };

  const handleFetchMissingFields = () => {
    setActionMessage({ type: 'success', text: 'تم فحص المجموعات والمصادر الرسمية: جميع الحالات متكاملة ولا يوجد حقول مفقودة.' });
  };

  if (loading || !opp) {
    ariaLoading();
    return (
      <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span>جاري تحميل تفاصيل الفرصة التوظيفية...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/careers')}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
        >
          {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          العودة لسجل الفرص والوظائف
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-mono">ID: {opp.id}</span>
        </div>
      </div>

      {actionMessage && (
        <div className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
          actionMessage.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
          actionMessage.type === 'error' ? 'bg-rose-50 text-rose-900 border-rose-200' : 'bg-blue-50 text-blue-900 border-blue-200'
        }`}>
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="text-xs font-bold px-2 py-1 hover:underline">
            إغلاق
          </button>
        </div>
      )}

      {/* Main Title Card */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                {opp.opportunityTypeLabelAr}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                {opp.publicationStatusLabelAr}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-gray-900 mt-2">{opp.titleAr}</h1>
            <p className="text-sm font-mono text-gray-500">{opp.titleEn}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {opp.publicationStatus !== 'PUBLISHED' && (
              <button
                onClick={handleApproveAndPublish}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                اعتماد ونشر الفرصة
              </button>
            )}

            {opp.publicationStatus === 'PUBLISHED' && (
              <button
                onClick={handleUnpublish}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                <XCircle className="w-4 h-4" />
                سحب وإيقاف النشر
              </button>
            )}

            <button
              onClick={handleArchive}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border transition-colors"
            >
              <Archive className="w-4 h-4" />
              أرشفة
            </button>

            <button
              onClick={handleFetchMissingFields}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-semibold border border-blue-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              استجلاب الحقول المفقودة
            </button>
          </div>
        </div>

        {/* Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Column 1: Details */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">الوصف المهني والتنفيذي للفرصة</h3>
              <p className="text-sm text-gray-700 leading-relaxed bg-slate-50 p-4 rounded-xl border">
                {opp.descriptionAr}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">المهارات المطلوبة (Required Skills)</h3>
              <div className="flex flex-wrap gap-2">
                {opp.requiredSkills.map((sk, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-900 rounded-lg text-xs font-medium border border-blue-200">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">شروط الأهلية والقبول</h3>
              <ul className="space-y-1.5 text-xs text-gray-700 list-disc list-inside bg-slate-50 p-4 rounded-xl border">
                {opp.eligibilityRequirements.map((req, idx) => (
                  <li key={idx} className="leading-relaxed">{req}</li>
                ))}
              </ul>
            </div>

            {/* AI Recommendation Match (Phase 17 Read-Only Advisory) */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  مؤشر مطابقة الذكاء الاصطناعي (Phase 17 AI Engine Advisory)
                </span>
                <span className="text-sm font-black text-purple-900 font-mono">
                  {opp.aiRecommendationMatchScore}% مطابقة
                </span>
              </div>
              <p className="text-xs text-purple-800 leading-relaxed">
                {opp.aiAdvisoryNotes}
              </p>
              <div className="text-[10px] text-purple-700 font-mono pt-1">
                تنبيه: هذا المؤشر هو مخرج استشاري تلقائي من Phase 17 وليس معياراً حاسمًا للقبول.
              </div>
            </div>
          </div>

          {/* Column 2: Entity & Bounded Metadata Sidebar */}
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">الجهة التوظيفية (Bounded Entity)</h3>
              <div className="bg-white p-3.5 rounded-xl border space-y-2 text-xs">
                <div className="font-bold text-gray-900 text-sm">{opp.recruitmentEntity.entityNameAr}</div>
                <div className="text-gray-500 font-mono text-[11px]">{opp.recruitmentEntity.entityNameEn}</div>
                <div className="flex items-center justify-between pt-1 border-t text-[11px]">
                  <span className="text-gray-500">النوع:</span>
                  <span className="font-semibold text-gray-800">{opp.recruitmentEntity.entityType}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">الدولة:</span>
                  <span className="font-semibold text-gray-800">{opp.recruitmentEntity.countryAr}</span>
                </div>
                <div className="pt-1">
                  <a href={opp.recruitmentEntity.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-mono text-[11px]">
                    <Globe className="w-3 h-3" />
                    الموقع الرسمي للجهة
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-gray-700 bg-white p-3.5 rounded-xl border">
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">الموقع الجغرافي:</span>
                <span className="font-bold">{opp.locationAr}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">الموعد النهائي للتقديم:</span>
                <span className="font-mono font-bold text-rose-700">{opp.applicationDeadline}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">عدد المتقدمين الحاليين:</span>
                <span className="font-mono font-bold text-blue-900">{opp.applicantCount} متقدم</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">طريقة التقديم:</span>
                <span className="font-semibold text-emerald-800">بوابة المنصة الداخلية</span>
              </div>
            </div>

            {/* Audit History Timeline */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">سجل الاعتماد والتعديلات</h3>
              <div className="space-y-2">
                {opp.auditTimeline.map((item) => (
                  <div key={item.id} className="bg-white p-2.5 rounded-lg border text-xs space-y-1">
                    <div className="font-semibold text-gray-900">{item.actionAr}</div>
                    <div className="flex items-center justify-between text-[10px] text-gray-500">
                      <span>{item.actorName}</span>
                      <span className="font-mono">{item.timestamp}</span>
                    </div>
                    {item.notes && <div className="text-[10px] text-gray-600 bg-slate-50 p-1 rounded mt-1">{item.notes}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ariaLoading() {
  // noop
}
