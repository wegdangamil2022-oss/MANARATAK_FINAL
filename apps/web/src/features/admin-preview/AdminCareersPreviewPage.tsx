import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/I18nProvider';
import { 
  Briefcase, GraduationCap, Building2, Search, Filter, RefreshCw, Eye, 
  CheckCircle2, XCircle, Clock, AlertTriangle, ArrowRight, ArrowLeft, 
  Download, FileText, Check, X, Shield, Lock, Users, Sparkles, MapPin, 
  Globe, Calendar, Award, BarChart2, TrendingUp, Layers, ExternalLink
} from 'lucide-react';

export interface AdminCareerOpportunityListItem {
  id: string;
  titleAr: string;
  titleEn: string;
  type: 'JOB' | 'INTERNSHIP' | 'GRADUATE_PROGRAM' | 'VOLUNTEERING';
  typeLabelAr: string;
  recruitmentEntityNameAr: string;
  recruitmentEntityNameEn: string;
  locationAr: string;
  isRemote: boolean;
  deadline: string;
  status: 'DRAFT' | 'UNDER_REVIEW' | 'PUBLISHED' | 'EXPIRED' | 'ARCHIVED';
  statusLabelAr: string;
  applicantCount: number;
  createdAt: string;
}

export interface AdminCareerApplicationItem {
  id: string;
  studentReferenceId: string;
  studentNameAr: string;
  opportunityTitleAr: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'REJECTED' | 'WITHDRAWN' | 'ACCEPTED';
  submittedAt: string;
  eapCvAssetHandle: string; // Phase 05 EAP Handle
  adminNotes: string;
}

export interface AdminAlumniProfileItem {
  id: string;
  studentReferenceId: string;
  studentNameAr: string;
  graduationYear: number;
  currentRoleAr: string;
  industryAr: string;
  skillsSummary: string[];
  visibilityStatus: 'PRIVATE' | 'ALUMNI_NETWORK_ONLY' | 'PUBLIC_CONSENT';
  visibilityLabelAr: string;
  profileCompletenessPercentage: number;
}

export interface AdminRecruitmentEntityItem {
  id: string;
  entityNameAr: string;
  entityNameEn: string;
  entityType: 'COMPANY' | 'ACADEMIC_INSTITUTION' | 'NGO' | 'GOVERNMENT';
  entityTypeLabelAr: string;
  countryAr: string;
  website: string;
  verificationStatus: 'VERIFIED' | 'PENDING_REVIEW' | 'UNVERIFIED';
  relatedOpportunitiesCount: number;
  sourceTrustLevel: 'OFFICIAL_PARTNER' | 'VERIFIED_EMPLOYER' | 'EXTERNAL_AGGREGATOR';
}

export function AdminCareersPreviewPage() {
  const navigate = useNavigate();
  const { isRTL } = useTranslation();

  const [activeTab, setActiveTab] = useState<'OPPORTUNITIES' | 'APPLICATIONS' | 'ALUMNI' | 'ENTITIES' | 'REVIEW' | 'ANALYTICS'>('OPPORTUNITIES');

  const [opportunities, setOpportunities] = useState<AdminCareerOpportunityListItem[]>([]);
  const [applications, setApplications] = useState<AdminCareerApplicationItem[]>([]);
  const [alumniProfiles, setAlumniProfiles] = useState<AdminAlumniProfileItem[]>([]);
  const [recruitmentEntities, setRecruitmentEntities] = useState<AdminRecruitmentEntityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    loadCareerData();
  }, []);

  const loadCareerData = async () => {
    setLoading(true);
    try {
      setOpportunities([
        {
          id: 'opp_8001',
          titleAr: 'مهندس أول ذكاء اصطناعي وحلول سحابية',
          titleEn: 'Senior AI & Cloud Solutions Engineer',
          type: 'JOB',
          typeLabelAr: 'وظيفة دوام كامل',
          recruitmentEntityNameAr: 'شركة التقنيات السحابية المتقدمة',
          recruitmentEntityNameEn: 'Advanced Cloud Technologies Corp',
          locationAr: 'الرياض، المملكة العربية السعودية',
          isRemote: true,
          deadline: '2026-08-30',
          status: 'PUBLISHED',
          statusLabelAr: 'منشورة ومتاحة',
          applicantCount: 24,
          createdAt: '2026-07-20'
        },
        {
          id: 'opp_8002',
          titleAr: 'برنامج التدريب التعاوني في علوم البيانات',
          titleEn: 'Data Science Coop Internship Program',
          type: 'INTERNSHIP',
          typeLabelAr: 'تدريب تعاوُني / صيفي',
          recruitmentEntityNameAr: 'مركز الابتكار الرقمي الوطني',
          recruitmentEntityNameEn: 'National Digital Innovation Center',
          locationAr: 'جدة، المملكة العربية السعودية',
          isRemote: false,
          deadline: '2026-08-15',
          status: 'PUBLISHED',
          statusLabelAr: 'منشورة ومتاحة',
          applicantCount: 42,
          createdAt: '2026-07-22'
        },
        {
          id: 'opp_8003',
          titleAr: 'برنامج تطوير الخريجين في الأمن السيبراني 2026',
          titleEn: 'Cybersecurity Graduate Development Program 2026',
          type: 'GRADUATE_PROGRAM',
          typeLabelAr: 'برنامج تطوير الخريجين',
          recruitmentEntityNameAr: 'الهيئة الوطنية للأمن الرقمي',
          recruitmentEntityNameEn: 'National Cybersecurity Authority',
          locationAr: 'الرياض، المملكة العربية السعودية',
          isRemote: false,
          deadline: '2026-09-01',
          status: 'UNDER_REVIEW',
          statusLabelAr: 'قيد المراجعة والاعتماد',
          applicantCount: 0,
          createdAt: '2026-07-27'
        },
        {
          id: 'opp_8004',
          titleAr: 'فرصة تطوع تخصصي في تطوير منصات التعليم',
          titleEn: 'Pro-Bono EdTech Developer Volunteering',
          type: 'VOLUNTEERING',
          typeLabelAr: 'تطوع تخصصي',
          recruitmentEntityNameAr: 'مؤسسة مناراتك غير الربحية',
          recruitmentEntityNameEn: 'Manaratak Non-Profit Org',
          locationAr: 'عن بُعد (Remote)',
          isRemote: true,
          deadline: '2026-07-15',
          status: 'EXPIRED',
          statusLabelAr: 'منتهية الصلاحية (تتطلب الأرشفة)',
          applicantCount: 15,
          createdAt: '2026-06-01'
        }
      ]);

      setApplications([
        {
          id: 'app_901',
          studentReferenceId: 'STD-9921',
          studentNameAr: 'عبدالله أحمد الزهراني',
          opportunityTitleAr: 'مهندس أول ذكاء اصطناعي وحلول سحابية',
          status: 'SHORTLISTED',
          submittedAt: '2026-07-21 11:30',
          eapCvAssetHandle: 'eap_asset_cv_std_9921',
          adminNotes: 'تمت مطابقة المؤهلات بنسبة 94% عبر محرك الذكاء الاصطناعي Phase 17.'
        },
        {
          id: 'app_902',
          studentReferenceId: 'STD-8842',
          studentNameAr: 'نورة سعيد الغامدي',
          opportunityTitleAr: 'برنامج التدريب التعاوني في علوم البيانات',
          status: 'UNDER_REVIEW',
          submittedAt: '2026-07-23 15:45',
          eapCvAssetHandle: 'eap_asset_cv_std_8842',
          adminNotes: 'قيد التدقيق الأكاديمي لملاءمة الساعات المعتمدة للكلية.'
        }
      ]);

      setAlumniProfiles([
        {
          id: 'alm_101',
          studentReferenceId: 'STD-3301',
          studentNameAr: 'سليمان خالد الماجد',
          graduationYear: 2025,
          currentRoleAr: 'محلل بيانات أول في البنك السعودي المركزي',
          industryAr: 'القطاع المصرفي والمالي',
          skillsSummary: ['Python', 'SQL', 'TensorFlow', 'Financial Risk AI'],
          visibilityStatus: 'PUBLIC_CONSENT',
          visibilityLabelAr: 'موافق على الظهور العام',
          profileCompletenessPercentage: 100
        },
        {
          id: 'alm_102',
          studentReferenceId: 'STD-2204',
          studentNameAr: 'هند إبراهيم القحطاني',
          graduationYear: 2024,
          currentRoleAr: 'مهندسة أمن شبكات في شركة علم',
          industryAr: 'الأمن السيبراني وتقنية المعلومات',
          skillsSummary: ['Network Security', 'SIEM', 'ISO 27001'],
          visibilityStatus: 'ALUMNI_NETWORK_ONLY',
          visibilityLabelAr: 'شبكة الخريجين فقط',
          profileCompletenessPercentage: 85
        }
      ]);

      setRecruitmentEntities([
        {
          id: 'ent_301',
          entityNameAr: 'شركة التقنيات السحابية المتقدمة',
          entityNameEn: 'Advanced Cloud Technologies Corp',
          entityType: 'COMPANY',
          entityTypeLabelAr: 'شركة قطاع خاص',
          countryAr: 'المملكة العربية السعودية',
          website: 'https://act-corp.sa',
          verificationStatus: 'VERIFIED',
          relatedOpportunitiesCount: 5,
          sourceTrustLevel: 'OFFICIAL_PARTNER'
        },
        {
          id: 'ent_302',
          entityNameAr: 'مركز الابتكار الرقمي الوطني',
          entityNameEn: 'National Digital Innovation Center',
          entityType: 'GOVERNMENT',
          entityTypeLabelAr: 'جهة حكومية / شبه حكومية',
          countryAr: 'المملكة العربية السعودية',
          website: 'https://ndic.gov.sa',
          verificationStatus: 'VERIFIED',
          relatedOpportunitiesCount: 3,
          sourceTrustLevel: 'OFFICIAL_PARTNER'
        }
      ]);
    } catch (err) {
      console.error('Error loading career preview data', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch = 
      opp.titleAr.includes(searchQuery) ||
      opp.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.recruitmentEntityNameAr.includes(searchQuery);
    const matchesType = selectedTypeFilter === 'ALL' || opp.type === selectedTypeFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || opp.status === selectedStatusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-blue-800/40">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-400/30">
              <Briefcase className="w-8 h-8 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">إدارة الوظائف والتأهيل المهني وشبكة الخريجين</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Phase 21 Standard
                </span>
              </div>
              <p className="text-sm text-blue-200 mt-1">
                التحكم بالفرص الوظيفية والتدريبية، مراجعة طلبات التقديم، إدارات أسر الخريجين، وميتا بيانات الجهات الموظفة.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('REVIEW')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              <Clock className="w-4 h-4" />
              مراجعة فرص قيد اعتماد النشر ({opportunities.filter(o => o.status === 'UNDER_REVIEW').length})
            </button>
          </div>
        </div>

        {/* Boundary Disclaimer */}
        <div className="mt-4 pt-4 border-t border-blue-800/60 flex flex-wrap items-center justify-between text-xs text-blue-200 gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>حدود النطاق: Phase 21 تملك الفرص والطلبات والملفات المحدودة | Phase 15 تملك بيانات الهوية | Phase 17 تملك محرك التوصيات AI</span>
          </div>
          <div className="flex items-center gap-3">
            <span>تنبيه: يُمنع النشر التلقائي للفرص المستوردة دون مراجعة المسؤول واعتماده صراحة</span>
          </div>
        </div>
      </div>

      {/* Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl p-3.5 border shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">الفرص النشطة</span>
            <Briefcase className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-emerald-700">
            {opportunities.filter(o => o.status === 'PUBLISHED').length}
          </p>
          <span className="text-[10px] text-emerald-600">منشورة ومتاحة</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">طلبات جديدة</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-blue-700">
            {applications.length}
          </p>
          <span className="text-[10px] text-blue-600">قيد المعالجة والتدقيق</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">تتطلب المراجعة</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-bold text-amber-700">
            {opportunities.filter(o => o.status === 'UNDER_REVIEW').length}
          </p>
          <span className="text-[10px] text-amber-600">بانتظار القرار</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">سجلات الخريجين</span>
            <GraduationCap className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl font-bold text-indigo-700">
            {alumniProfiles.length}
          </p>
          <span className="text-[10px] text-indigo-600">ملفات مسجلة</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">جهات موظفة</span>
            <Building2 className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-xl font-bold text-slate-900">
            {recruitmentEntities.length}
          </p>
          <span className="text-[10px] text-slate-500">ميتا بيانات فقط</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">فرص منتهية</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-xl font-bold text-rose-700">
            {opportunities.filter(o => o.status === 'EXPIRED').length}
          </p>
          <span className="text-[10px] text-rose-600">تتطلب الأرشفة</span>
        </div>
      </div>

      {/* Workstation Tabs */}
      <div className="bg-white rounded-xl border p-1.5 flex flex-wrap items-center gap-1 shadow-sm text-xs font-semibold">
        <button
          onClick={() => setActiveTab('OPPORTUNITIES')}
          className={`py-2 px-3.5 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'OPPORTUNITIES' ? 'bg-blue-700 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          سجل فرص التوظيف والتدريب ({opportunities.length})
        </button>

        <button
          onClick={() => setActiveTab('APPLICATIONS')}
          className={`py-2 px-3.5 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'APPLICATIONS' ? 'bg-blue-700 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Users className="w-4 h-4" />
          طلبات التقديم والـ CVs ({applications.length})
        </button>

        <button
          onClick={() => setActiveTab('ALUMNI')}
          className={`py-2 px-3.5 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'ALUMNI' ? 'bg-blue-700 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          ملفات شبكة الخريجين ({alumniProfiles.length})
        </button>

        <button
          onClick={() => setActiveTab('ENTITIES')}
          className={`py-2 px-3.5 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'ENTITIES' ? 'bg-blue-700 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          ميتا بيانات الجهات التوظيفية ({recruitmentEntities.length})
        </button>

        <button
          onClick={() => setActiveTab('REVIEW')}
          className={`py-2 px-3.5 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'REVIEW' ? 'bg-blue-700 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          المراجعة والنشر
        </button>

        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`py-2 px-3.5 rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'ANALYTICS' ? 'bg-blue-700 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          تحليلات المهارات وسوق العمل
        </button>
      </div>

      {/* TAB 1: OPPORTUNITIES LIST */}
      {activeTab === 'OPPORTUNITIES' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute right-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بعنوان الفرصة، الجهة التوظيفية..."
                className="w-full pr-9 pl-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="border rounded-xl px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">جميع أنواع الفرص</option>
                <option value="JOB">وظائف دوام كامل</option>
                <option value="INTERNSHIP">تدريب تعاوُني / صيفي</option>
                <option value="GRADUATE_PROGRAM">برامج تطوير الخريجين</option>
                <option value="VOLUNTEERING">تطوع تخصصي</option>
              </select>

              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="border rounded-xl px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">جميع الحالات</option>
                <option value="PUBLISHED">منشورة ومتاحة</option>
                <option value="UNDER_REVIEW">قيد المراجعة</option>
                <option value="EXPIRED">منتهية الصلاحية</option>
                <option value="ARCHIVED">مؤرشفة</option>
              </select>

              <button
                onClick={loadCareerData}
                className="p-2 border rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
                title="تحديث البيانات"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Simple Clean Vertical Table Layout */}
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50 border-b text-gray-600 font-semibold text-xs uppercase">
                <tr>
                  <th className="py-3.5 px-4">مسمى الفرصة والتصنيف</th>
                  <th className="py-3.5 px-4">الجهة الموظفة</th>
                  <th className="py-3.5 px-4">الموقع الجغرافي</th>
                  <th className="py-3.5 px-4">الموعد النهائي</th>
                  <th className="py-3.5 px-4">المتقدمون</th>
                  <th className="py-3.5 px-4">الحالة</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-800">
                {filteredOpportunities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      لا توجد فرص مطابقة لمعايير البحث الحالية.
                    </td>
                  </tr>
                ) : (
                  filteredOpportunities.map((opp) => (
                    <tr key={opp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-gray-900">{opp.titleAr}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">{opp.titleEn}</div>
                        <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-medium">
                          {opp.typeLabelAr}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-gray-900 font-medium">
                        <div>{opp.recruitmentEntityNameAr}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{opp.recruitmentEntityNameEn}</div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-gray-700">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span>{opp.locationAr}</span>
                        </div>
                        {opp.isRemote && (
                          <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                            Remote
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-gray-800">
                        {opp.deadline}
                      </td>

                      <td className="py-3.5 px-4 font-bold font-mono text-gray-900">
                        {opp.applicantCount} متقدم
                      </td>

                      <td className="py-3.5 px-4">
                        <OpportunityStatusBadge status={opp.status} label={opp.statusLabelAr} />
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/admin/careers/opportunities/${opp.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-lg text-xs font-semibold border border-blue-200 transition-colors"
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

      {/* TAB 2: APPLICATIONS */}
      {activeTab === 'APPLICATIONS' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">طلبات التقديم والسير الذاتية (Phase 05 EAP CV Assets)</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                مراجعة طلبات التقديم المرفوعة من الطلاب مع المقابض الآمنة للسير الذاتية.
              </p>
            </div>
          </div>

          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 border-b text-gray-600 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">المتقدم (الطالب)</th>
                  <th className="py-3 px-4">الفرصة التوظيفية</th>
                  <th className="py-3 px-4">مقبض الـ CV (Phase 05 EAP)</th>
                  <th className="py-3 px-4">حالة التقديم</th>
                  <th className="py-3 px-4">تاريخ التقديم</th>
                  <th className="py-3 px-4">ملاحظات مسؤول التوظيف</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-800">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{app.studentNameAr}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{app.studentReferenceId}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{app.opportunityTitleAr}</td>
                    <td className="py-3 px-4 font-mono text-blue-800 bg-blue-50/50">{app.eapCvAssetHandle}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-[10px]">
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-500">{app.submittedAt}</td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{app.adminNotes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ALUMNI PROFILES */}
      {activeTab === 'ALUMNI' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">سجل وسيرة شبكة الخريجين (Alumni Network Profiles)</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                بيانات الخريجين ومستويات الظهور المحددة من الطالب مع حماية بيانات الهوية الشخصية (Phase 15 Boundary).
              </p>
            </div>
          </div>

          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 border-b text-gray-600 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">الخريج (المرجع)</th>
                  <th className="py-3 px-4">سنة التخرج</th>
                  <th className="py-3 px-4">المسمى الوظيفي والقطاع</th>
                  <th className="py-3 px-4">المهارات المعتمدة</th>
                  <th className="py-3 px-4">مستوى الخصوصية والظهور</th>
                  <th className="py-3 px-4">اكتتمال الملف</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-800">
                {alumniProfiles.map((alm) => (
                  <tr key={alm.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{alm.studentNameAr}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{alm.studentReferenceId}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-900">{alm.graduationYear}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{alm.currentRoleAr}</div>
                      <div className="text-[11px] text-gray-500">{alm.industryAr}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {alm.skillsSummary.map((s, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                        {alm.visibilityLabelAr}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      {alm.profileCompletenessPercentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: RECRUITMENT ENTITY METADATA */}
      {activeTab === 'ENTITIES' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">ميتا بيانات الجهات التوظيفية والمؤسسات الموظفة</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                ميتا بيانات محددة فقط لمنع إنشاء منصة شركات منفصلة غير معتمدة مع ضبط مستويات الموثوقية.
              </p>
            </div>
          </div>

          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 border-b text-gray-600 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">اسم الجهة</th>
                  <th className="py-3 px-4">نوع المؤسسة</th>
                  <th className="py-3 px-4">الدولة والموقع الرسمية</th>
                  <th className="py-3 px-4">حالة التوثيق</th>
                  <th className="py-3 px-4">عدد الفرص المرتبطة</th>
                  <th className="py-3 px-4">مستوى الثقة المصدرية</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-800">
                {recruitmentEntities.map((ent) => (
                  <tr key={ent.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{ent.entityNameAr}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{ent.entityNameEn}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-700 font-medium">{ent.entityTypeLabelAr}</td>
                    <td className="py-3 px-4">
                      <div>{ent.countryAr}</div>
                      <a href={ent.website} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 underline font-mono">
                        {ent.website}
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                        جهة موثوقة ومفعلة
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">{ent.relatedOpportunitiesCount} فرص</td>
                    <td className="py-3 px-4 font-mono text-xs text-blue-900 font-semibold">{ent.sourceTrustLevel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: REVIEW & PUBLISHING */}
      {activeTab === 'REVIEW' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <div className="border-b pb-3">
            <h2 className="text-lg font-bold text-gray-900">فرص قيد الاعتماد والمراجعة قبل النشر العامة</h2>
            <p className="text-xs text-gray-500">يتطلب الاعتماد تدقيق المتطلبات للتأكد من عدم وجود حقول مفقودة.</p>
          </div>

          <div className="space-y-3">
            {opportunities.filter(o => o.status === 'UNDER_REVIEW').map((opp) => (
              <div key={opp.id} className="border rounded-xl p-4 bg-amber-50/50 border-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-gray-900 text-base">{opp.titleAr}</div>
                  <div className="text-xs text-gray-600">الجهة: {opp.recruitmentEntityNameAr} | الموقع: {opp.locationAr}</div>
                  <span className="text-[11px] text-amber-800 font-semibold bg-amber-100 px-2 py-0.5 rounded">
                    بانتظار موافقة المسؤول صراحة
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/admin/careers/opportunities/${opp.id}`)}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                  >
                    مراجعة واعتماد الفرصة
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: CAREER ANALYTICS */}
      {activeTab === 'ANALYTICS' && (
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
          <div className="border-b pb-3">
            <h2 className="text-lg font-bold text-gray-900">تحليلات المهارات وسوق العمل وتوصيات Phase 17 AI</h2>
            <p className="text-xs text-gray-500">مؤشرات الملاءمة والمهارات الأكثر طلباً المجلوبة من محرك AI Phase 17 بصفة استشارية فقط.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-5 rounded-2xl border space-y-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                أكثر المهارات المطلوبة في الفرص التوظيفية
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border">
                  <span>الذكاء الاصطناعي وتعلم الآلة (AI / ML)</span>
                  <span className="font-bold text-gray-900">78% طلب</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border">
                  <span>الأمن السيبراني والشبكات (Cybersecurity)</span>
                  <span className="font-bold text-gray-900">65% طلب</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border">
                  <span>هندسة البيانات السحابية (Cloud Data)</span>
                  <span className="font-bold text-gray-900">54% طلب</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border space-y-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                تغطية محرك التوصيات (Phase 17 AI Engine)
              </h3>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs space-y-1.5 text-purple-900">
                <p className="font-bold">مؤشر التوصية والاستشارة الآلية:</p>
                <p className="leading-relaxed">
                  تغطية مطابقة المهارات بنسبة 89% لدفعات الخريجين لعام 2025 و 2026. المخرج هو مخرج استشاري للقراءة فقط (Read-Only Advisory Output).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OpportunityStatusBadge({ status, label }: { status: string; label: string }) {
  switch (status) {
    case 'PUBLISHED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {label}
        </span>
      );
    case 'UNDER_REVIEW':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
          <Clock className="w-3.5 h-3.5" />
          {label}
        </span>
      );
    case 'EXPIRED':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-semibold">
          <XCircle className="w-3.5 h-3.5" />
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
