import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/I18nProvider';
import { 
  ArrowLeft, ArrowRight, Search, Filter, Plus, ExternalLink, 
  CheckCircle2, AlertCircle, RefreshCw, Eye, ShieldCheck, 
  DownloadCloud, Link2, Globe, Clock, Sparkles, Award, FileText, 
  Layers, AlertTriangle, ChevronRight, X, Building2
} from 'lucide-react';
import { ApiClient } from '../../api/client';

export function AdminImportedCoursesPreviewPage() {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.getAdminImportedCourses();
      setCourses(data);
    } catch {
      // Fallback sample dataset for Imported External Courses
      setCourses([
        {
          id: 'imp_crs_01',
          titleAr: 'تخصص الذكاء الاصطناعي والتعلّم العميق Deep Learning Specialization',
          titleEn: 'Deep Learning Specialization',
          originalTitle: 'Deep Learning Specialization by DeepLearning.AI',
          provider: 'Coursera',
          directUrl: 'https://www.coursera.org/specializations/deep-learning',
          officialSourceUrl: 'https://www.deeplearning.ai/courses/deep-learning-specialization/',
          language: 'English',
          level: 'Intermediate',
          duration: '3 Months (5 hrs/week)',
          externalPriceType: 'Paid ($49/mo)',
          certificateAvailable: true,
          status: 'PUBLISHED',
          category: 'Artificial Intelligence',
          linkedSkills: ['Neural Networks', 'TensorFlow', 'Convolutional Networks', 'Python'],
          linkedMajors: ['Computer Science', 'Artificial Intelligence'],
          sourceVerified: true,
          linkHealth: 'HEALTHY',
          missingFieldsCount: 0,
          updatedAt: '2026-07-25 11:20'
        },
        {
          id: 'imp_crs_02',
          titleAr: 'دورة هندسة الحوسبة السحابية AWS Cloud Architecting',
          titleEn: 'AWS Cloud Solutions Architecting',
          originalTitle: 'AWS Cloud Solutions Architecting Course',
          provider: 'AWS Skill Builder',
          directUrl: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/102',
          officialSourceUrl: 'https://aws.amazon.com/training/learning-paths/cloud-practitioner/',
          language: 'English',
          level: 'Advanced',
          duration: '20 Hours',
          externalPriceType: 'Free',
          certificateAvailable: true,
          status: 'READY_TO_PUBLISH',
          category: 'Cloud Computing',
          linkedSkills: ['AWS S3', 'EC2', 'IAM', 'Cloud Architecture'],
          linkedMajors: ['Computer Engineering', 'Cybersecurity'],
          sourceVerified: true,
          linkHealth: 'HEALTHY',
          missingFieldsCount: 0,
          updatedAt: '2026-07-24 16:45'
        },
        {
          id: 'imp_crs_03',
          titleAr: 'أساسيات الشبكات CCNA Networking Essentials',
          titleEn: 'Cisco CCNA Networking Essentials',
          originalTitle: 'Networking Essentials v2.0',
          provider: 'Cisco Networking Academy',
          directUrl: 'https://www.netacad.com/courses/networking/networking-essentials',
          officialSourceUrl: 'https://www.netacad.com',
          language: 'Bilingual (Ar/En)',
          level: 'Beginner',
          duration: '70 Hours',
          externalPriceType: 'Free',
          certificateAvailable: true,
          status: 'AWAITING_REVIEW',
          category: 'Networking',
          linkedSkills: ['IP Addressing', 'Subnetting', 'Routing', 'Switches'],
          linkedMajors: ['Information Technology', 'Computer Networks'],
          sourceVerified: false,
          linkHealth: 'NEEDS_VERIFICATION',
          missingFieldsCount: 1,
          updatedAt: '2026-07-23 09:15'
        },
        {
          id: 'imp_crs_04',
          titleAr: 'مبادئ البرمجة بلغة بايثون للعلوم والهندسة',
          titleEn: 'Programming for Everybody (Getting Started with Python)',
          originalTitle: 'Programming for Everybody (Getting Started with Python)',
          provider: 'edX',
          directUrl: 'https://www.edx.org/learn/python/university-of-michigan-programming-for-everybody-getting-started-with-python',
          officialSourceUrl: 'https://www.edx.org',
          language: 'English',
          level: 'Beginner',
          duration: '7 Weeks',
          externalPriceType: 'Free (Audit)',
          certificateAvailable: true,
          status: 'MISSING_DATA',
          category: 'Software Engineering',
          linkedSkills: ['Python', 'Data Structures', 'Variables', 'Loops'],
          linkedMajors: ['Computer Science', 'Software Engineering'],
          sourceVerified: false,
          linkHealth: 'HEALTHY',
          missingFieldsCount: 3,
          updatedAt: '2026-07-22 14:00'
        },
        {
          id: 'imp_crs_05',
          titleAr: 'أساسيات الحوسبة السحابية مع Microsoft Azure',
          titleEn: 'Microsoft Azure Fundamentals (AZ-900)',
          originalTitle: 'Microsoft Azure Fundamentals Training',
          provider: 'Microsoft Learn',
          directUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/',
          officialSourceUrl: 'https://learn.microsoft.com',
          language: 'English',
          level: 'Beginner',
          duration: '12 Hours',
          externalPriceType: 'Free',
          certificateAvailable: false,
          status: 'BROKEN_LINK',
          category: 'Cloud Computing',
          linkedSkills: ['Azure Services', 'Cloud Governance', 'Security'],
          linkedMajors: ['Information Systems'],
          sourceVerified: true,
          linkHealth: 'BROKEN',
          missingFieldsCount: 2,
          updatedAt: '2026-07-20 18:30'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 8 Top Counters Calculations
  const totalCount = courses.length;
  const awaitingReviewCount = courses.filter(c => c.status === 'AWAITING_REVIEW' || c.status === 'UNDER_REVIEW').length;
  const missingDataCount = courses.filter(c => c.status === 'MISSING_DATA' || c.missingFieldsCount > 0).length;
  const brokenLinksCount = courses.filter(c => c.status === 'BROKEN_LINK' || c.linkHealth === 'BROKEN').length;
  const needsSourceVerifyCount = courses.filter(c => c.sourceVerified === false || c.linkHealth === 'NEEDS_VERIFICATION').length;
  const readyToPublishCount = courses.filter(c => c.status === 'READY_TO_PUBLISH').length;
  const publishedCount = courses.filter(c => c.status === 'PUBLISHED').length;
  const archivedCount = courses.filter(c => c.status === 'ARCHIVED').length;

  // Filter Logic
  const filteredCourses = courses.filter(course => {
    const matchesSearch = searchQuery === '' || 
      course.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.titleEn && course.titleEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      course.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProvider = selectedProvider === 'ALL' || course.provider === selectedProvider;
    const matchesStatus = selectedStatus === 'ALL' || course.status === selectedStatus;

    return matchesSearch && matchesProvider && matchesStatus;
  });

  const providersList = ['Coursera', 'edX', 'Cisco Networking Academy', 'Microsoft Learn', 'AWS Skill Builder', 'FutureLearn'];

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link to="/admin/courses" className="hover:text-emerald-600 dark:hover:text-emerald-400">
          {t('admin_courses') || 'Courses Administration'}
        </Link>
        <span>/</span>
        <span className="text-slate-900 dark:text-white font-medium">
          {isRTL ? 'الدورات المستوردة' : 'Imported External Courses'}
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              {isRTL ? 'تغذية الكتالوج الخارجي (External Catalog Links)' : 'External Catalog Links Feed'}
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Phase 13 / Phase 06
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {isRTL ? 'إدارة الدورات المستوردة من المنصات الخارجية' : 'Imported External Courses Catalog'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {isRTL 
              ? 'إدارة وروابط الكتالوج الخارجي المستورد من المزوّدين المعتمدين (مثل Coursera, edX, Cisco, Microsoft, AWS). هذه الدورات هي روابط خارجية وليست مناهج مصممة داخل منارتك.'
              : 'Governance and catalog links for external academic training providers (e.g. Coursera, edX, Cisco, Microsoft, AWS). These entries are catalog links, not native MANARATAK curriculum.'}
          </p>
        </div>

        {/* Action Button Routing to /admin/imports/courses per Rule 4 */}
        <Link
          to="/admin/imports/courses"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 shadow-sm"
        >
          <DownloadCloud className="w-4 h-4" />
          <span>{isRTL ? 'فتح مركز استيراد الدورات' : 'Open Courses Import Center'}</span>
        </Link>
      </div>

      {/* 8 Top Statistics Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* 1. All Imported */}
        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
            {isRTL ? 'كل الدورات المستوردة' : 'All Imported'}
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-white">{totalCount}</span>
        </div>

        {/* 2. Awaiting Review */}
        <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/60 space-y-1">
          <span className="text-[11px] text-amber-800 dark:text-amber-300 block truncate">
            {isRTL ? 'بانتظار مراجعة' : 'Awaiting Review'}
          </span>
          <span className="text-lg font-bold text-amber-900 dark:text-amber-200">{awaitingReviewCount}</span>
        </div>

        {/* 3. Missing Data */}
        <div className="p-3 bg-rose-50/60 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800/60 space-y-1">
          <span className="text-[11px] text-rose-800 dark:text-rose-300 block truncate">
            {isRTL ? 'ناقصة البيانات' : 'Missing Data'}
          </span>
          <span className="text-lg font-bold text-rose-900 dark:text-rose-200">{missingDataCount}</span>
        </div>

        {/* 4. Broken Links */}
        <div className="p-3 bg-red-50/60 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800/60 space-y-1">
          <span className="text-[11px] text-red-800 dark:text-red-300 block truncate">
            {isRTL ? 'روابط معطلة' : 'Broken Links'}
          </span>
          <span className="text-lg font-bold text-red-900 dark:text-red-200">{brokenLinksCount}</span>
        </div>

        {/* 5. Needs Source Verification */}
        <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800/60 space-y-1">
          <span className="text-[11px] text-indigo-800 dark:text-indigo-300 block truncate">
            {isRTL ? 'تحتاج تحقق' : 'Needs Source Verification'}
          </span>
          <span className="text-lg font-bold text-indigo-900 dark:text-indigo-200">{needsSourceVerifyCount}</span>
        </div>

        {/* 6. Ready to Publish */}
        <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800/60 space-y-1">
          <span className="text-[11px] text-blue-800 dark:text-blue-300 block truncate">
            {isRTL ? 'جاهزة للنشر' : 'Ready to Publish'}
          </span>
          <span className="text-lg font-bold text-blue-900 dark:text-blue-200">{readyToPublishCount}</span>
        </div>

        {/* 7. Published */}
        <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-1">
          <span className="text-[11px] text-emerald-800 dark:text-emerald-300 block truncate">
            {isRTL ? 'منشورة' : 'Published'}
          </span>
          <span className="text-lg font-bold text-emerald-900 dark:text-emerald-200">{publishedCount}</span>
        </div>

        {/* 8. Archived */}
        <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
          <span className="text-[11px] text-slate-600 dark:text-slate-400 block truncate">
            {isRTL ? 'مؤرشفة' : 'Archived'}
          </span>
          <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{archivedCount}</span>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute top-3 ltr:left-3 rtl:right-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRTL ? 'البحث بالاسم، المزوّد، أو المجال...' : 'Search title, provider, or field...'}
            className="w-full py-2 ltr:pl-9 ltr:pr-3 rtl:pr-9 rtl:pl-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Provider Filter */}
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
          >
            <option value="ALL">{isRTL ? 'كل المزودين المعتمدين' : 'All Providers'}</option>
            {providersList.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
          >
            <option value="ALL">{isRTL ? 'كل الحالات' : 'All Statuses'}</option>
            <option value="PUBLISHED">{isRTL ? 'منشورة' : 'Published'}</option>
            <option value="READY_TO_PUBLISH">{isRTL ? 'جاهزة للنشر' : 'Ready to Publish'}</option>
            <option value="AWAITING_REVIEW">{isRTL ? 'بانتظار المراجعة' : 'Awaiting Review'}</option>
            <option value="MISSING_DATA">{isRTL ? 'ناقصة البيانات' : 'Missing Data'}</option>
            <option value="BROKEN_LINK">{isRTL ? 'روابط معطلة' : 'Broken Link'}</option>
            <option value="ARCHIVED">{isRTL ? 'مؤرشفة' : 'Archived'}</option>
          </select>
        </div>
      </div>

      {/* Lightweight Vertical List Table per Rule 2 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-600 dark:text-slate-300 ltr:text-left rtl:text-right">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">{isRTL ? 'عنوان الدورة المستوردة' : 'Imported Course Title'}</th>
                <th className="py-3 px-4">{isRTL ? 'المزوّد الخارجي' : 'External Provider'}</th>
                <th className="py-3 px-4">{isRTL ? 'المستوى واللغة' : 'Level & Language'}</th>
                <th className="py-3 px-4">{isRTL ? 'التسعير الخارجي' : 'External Price'}</th>
                <th className="py-3 px-4">{isRTL ? 'الشهادة' : 'Certificate'}</th>
                <th className="py-3 px-4">{isRTL ? 'صحة الرابط والتحقق' : 'Link Health & Verification'}</th>
                <th className="py-3 px-4">{isRTL ? 'الحالة' : 'Status'}</th>
                <th className="py-3 px-4 ltr:text-right rtl:text-left">{isRTL ? 'الإجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    {isRTL ? 'لا توجد دورات مستوردة مطابقة للفلاتر.' : 'No imported courses matching filters.'}
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Course Title */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white max-w-xs">
                      <div className="truncate">{isRTL ? course.titleAr : (course.titleEn || course.titleAr)}</div>
                      <div className="text-[11px] text-slate-400 font-normal truncate mt-0.5">{course.category}</div>
                    </td>

                    {/* External Provider */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
                        {course.provider}
                      </span>
                    </td>

                    {/* Level & Language */}
                    <td className="py-3.5 px-4 font-medium">
                      <div className="text-slate-800 dark:text-slate-200">{course.level}</div>
                      <div className="text-[11px] text-slate-400">{course.language}</div>
                    </td>

                    {/* External Price */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {course.externalPriceType}
                    </td>

                    {/* Certificate Available */}
                    <td className="py-3.5 px-4">
                      {course.certificateAvailable ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {isRTL ? 'متاحة' : 'Available'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {isRTL ? 'غير متاحة' : 'No'}
                        </span>
                      )}
                    </td>

                    {/* Link Health & Source Verification */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {course.linkHealth === 'HEALTHY' && (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isRTL ? 'سليم' : 'Healthy'}</span>
                          </span>
                        )}
                        {course.linkHealth === 'NEEDS_VERIFICATION' && (
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-[11px] font-medium">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>{isRTL ? 'يحتاج تحقق' : 'Needs Verify'}</span>
                          </span>
                        )}
                        {course.linkHealth === 'BROKEN' && (
                          <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 text-[11px] font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{isRTL ? 'معطل' : 'Broken'}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border ${
                        course.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800' :
                        course.status === 'READY_TO_PUBLISH' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800' :
                        course.status === 'BROKEN_LINK' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800' :
                        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                      }`}>
                        {course.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 ltr:text-right rtl:text-left">
                      <Link
                        to={`/admin/courses/imported/${course.id}`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isRTL ? 'عرض التفاصيل' : 'View Details'}</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
