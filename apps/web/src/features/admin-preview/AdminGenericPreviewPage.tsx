import React, { useState } from 'react';
import { useTranslation } from '../../i18n/I18nProvider';
import { Link, Navigate } from 'react-router-dom';
import { AdminReviewQueuePreviewPage } from './AdminReviewQueuePreviewPage';
import { AdminImportsPreviewPage } from './AdminImportsPreviewPage';
import { 
  ArrowLeft,
  Activity,
  Search,
  Plus,
  Download,
  Check,
  X,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  AlertTriangle,
  UserCheck,
  Coins,
  TrendingUp,
  Sparkles,
  Lock,
  Sliders,
  Database,
  Bell,
  CheckCircle,
  FileSpreadsheet,
  Cpu,
  ShieldCheck,
  Award,
  Briefcase,
  BookMarked,
  Globe2,
  BookOpen,
  School,
  LayoutDashboard,
  Clock,
  Wrench,
  FileText,
  Settings,
  GraduationCap
} from 'lucide-react';

interface AdminGenericPreviewPageProps {
  titleKey: string;
  defaultTitle: string;
  descKey?: string;
  defaultDesc?: string;
  statusKey?: string;
  defaultStatus?: string;
}

export function AdminGenericPreviewPage({ 
  titleKey, 
  defaultTitle,
  descKey,
  defaultDesc,
  statusKey = 'preview_only',
  defaultStatus = 'Preview only'
}: AdminGenericPreviewPageProps) {
  const { t, dir, language } = useTranslation();
  const adminSessionPresent = import.meta.env.VITE_LOCAL_ADMIN_READ_ONLY === 'true';
  
  // Interactive preview state for buttons
  const [activeToast, setActiveToast] = useState<{ show: boolean; msg: string; type: 'success' | 'info' | 'warning' }>({
    show: false,
    msg: '',
    type: 'success'
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  if (!adminSessionPresent) {
    return <Navigate to="/login" replace />;
  }

  if (titleKey === 'admin_review_queue') {
    return <AdminReviewQueuePreviewPage />;
  }

  if (titleKey === 'admin_imports') {
    return <AdminImportsPreviewPage />;
  }

  const title = t(titleKey as any) || defaultTitle;
  const description = descKey ? (t(descKey as any) || defaultDesc) : (t('preview_only_desc') || 'Full admin operations will be implemented in the dedicated Admin Portal.');
  const status = t(statusKey as any) || defaultStatus;

  // Custom function to show a beautiful floating feedback toast when preview buttons are pressed
  const triggerButtonAction = (btnNameAr: string, btnNameEn: string, detailAr: string, detailEn: string) => {
    const actionName = language === 'ar' ? btnNameAr : btnNameEn;
    const actionDetail = language === 'ar' ? detailAr : detailEn;
    
    setActiveToast({
      show: true,
      msg: language === 'ar' 
        ? `✦ إجراء معاينة: تم الضغط على زر [${actionName}] - ${actionDetail}`
        : `✦ Preview Action: Clicked [${actionName}] - ${actionDetail}`,
      type: 'info'
    });
    
    setTimeout(() => {
      setActiveToast(prev => ({ ...prev, show: false }));
    }, 4500);
  };

  // Build the complete dataset of metadata, metrics, custom action buttons, and mock tables for each titleKey
  const getSectionMetadata = () => {
    switch (titleKey) {
      case 'admin_dashboard':
        return {
          icon: <LayoutDashboard className="w-8 h-8 text-blue-600" />,
          metrics: [
            { label: language === 'ar' ? 'إجمالي المنح النشطة' : 'Total Active Scholarships', value: '584', change: '+12%', color: 'border-emerald-500' },
            { label: language === 'ar' ? 'الجامعات المعتمدة' : 'Approved Universities', value: '42', change: '+3', color: 'border-purple-500' },
            { label: language === 'ar' ? 'الطلاب المسجلين' : 'Registered Students', value: '1,290', change: '+24%', color: 'border-blue-500' },
            { label: language === 'ar' ? 'جاهزية الخادم والنظام' : 'System Uptime', value: '99.94%', change: 'Stable', color: 'border-indigo-500' },
          ],
          actions: [
            { 
              nameAr: 'تصدير تقرير النظام الشامل', 
              nameEn: 'Export System Audit Report', 
              descAr: 'توليد ملف PDF متكامل لجميع نشاطات المنصة والعمليات الجارية والمقاييس لتقديمها للإدارة.', 
              descEn: 'Generate a comprehensive PDF of all platform activities, metrics, and operations.',
              icon: <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
            },
            { 
              nameAr: 'مزامنة قاعدة بيانات المنح', 
              nameEn: 'Sync Scholarship Databases', 
              descAr: 'سحب وتحديث معلومات المنح الخارجية بالتكامل مع محركات البحث العالمية بضغطة واحدة.', 
              descEn: 'Fetch and update international scholarship listings using custom API integrations.',
              icon: <RefreshCw className="w-5 h-5 text-amber-600" />
            },
            { 
              nameAr: 'إرسال تنبيه جماعي للطلاب', 
              nameEn: 'Broadcast Announcement', 
              descAr: 'إرسال إشعار فوري وتنبيه عبر البريد الإلكتروني لجميع الطلاب المشتركين حول التحديثات الهامة.', 
              descEn: 'Send instantaneous web and email announcements to all registered platform users.',
              icon: <Bell className="w-5 h-5 text-blue-600" />
            },
            { 
              nameAr: 'نسخ احتياطي فوري للنظام', 
              nameEn: 'Immediate Backup Database', 
              descAr: 'أخذ نسخة احتياطية مشفرة بالكامل لقاعدة البيانات الحالية وحفظها في التخزين السحابي الآمن.', 
              descEn: 'Generate an encrypted snapshot of the database and secure it to cloud storage.',
              icon: <Database className="w-5 h-5 text-slate-600" />
            },
            { 
              nameAr: 'فحص صحة الخادم والخدمات', 
              nameEn: 'Server Diagnostics Run', 
              descAr: 'تشغيل أداة التحقق الشامل من اتصالات قواعد البيانات، وبوابات الدفع ومزودات الذكاء الاصطناعي.', 
              descEn: 'Run continuous integration checks on the databases, payment gateways, and APIs.',
              icon: <Activity className="w-5 h-5 text-indigo-600" />
            },
            { 
              nameAr: 'تعديل نسب المطابقة الذكية', 
              nameEn: 'Adjust AI Match Coefficients', 
              descAr: 'إعادة معايرة أوزان معايير مطابقة المنح للطلاب (الدرجات، الرغبات، المهارات) لتعديل دقة النتائج.', 
              descEn: 'Recalibrate logic weights for student-scholarship matchmaking recommendations.',
              icon: <Sliders className="w-5 h-5 text-rose-600" />
            }
          ],
          tableHeader: [
            language === 'ar' ? 'العملية' : 'Activity',
            language === 'ar' ? 'المشرف' : 'Admin',
            language === 'ar' ? 'الوقت' : 'Timestamp',
            language === 'ar' ? 'الحالة' : 'Status'
          ],
          tableRows: [
            [language === 'ar' ? 'تحديث منحة البكالوريوس في اليابان' : 'Updated Japan Bachelor Scholarship', 'Admin-Wegdan', 'قبل دقيقتين', 'ناجح'],
            [language === 'ar' ? 'استيراد قائمة جامعات تركية جديدة' : 'Imported list of Turkish Universities', 'Admin-System', 'قبل ساعة', 'ناجح'],
            [language === 'ar' ? 'أخذ نسخة احتياطية مجدولة' : 'Automated Scheduled Backup', 'Admin-System', 'قبل ٤ ساعات', 'ناجح'],
          ]
        };

      case 'admin_review_queue':
        return {
          icon: <Clock className="w-8 h-8 text-amber-600" />,
          metrics: [
            { label: language === 'ar' ? 'بانتظار التدقيق' : 'Pending Review', value: '44', change: 'High Priority', color: 'border-amber-500' },
            { label: language === 'ar' ? 'تمت مراجعتها اليوم' : 'Reviewed Today', value: '18', change: 'Good Speed', color: 'border-emerald-500' },
            { label: language === 'ar' ? 'مرفوضة / بحاجة تعديل' : 'Rejected/Requires Edit', value: '6', change: 'Action Required', color: 'border-rose-500' },
          ],
          actions: [
            { 
              nameAr: 'قبول وتفعيل جميع المكتملة', 
              nameEn: 'Batch Approve Completed', 
              descAr: 'اعتماد ونشر جميع عناصر المحتوى والمنح التي حصلت على نسبة اكتمال ١٠٠٪ واجتازت التدقيق الآلي.', 
              descEn: 'Approve and publish all items that have passed automated content health checks.',
              icon: <CheckCircle className="w-5 h-5 text-emerald-600" />
            },
            { 
              nameAr: 'تعليق مراجعة الدفعة الحالية', 
              nameEn: 'Pause Current Batch Review', 
              descAr: 'تجميد مراجعة العناصر قيد التدقيق مؤقتاً لتحديث قواعد وسياسات الاعتماد الداخلي للمنصة.', 
              descEn: 'Temporarily freeze reviews to modify standard platform publication criteria.',
              icon: <Lock className="w-5 h-5 text-slate-600" />
            },
            { 
              nameAr: 'تنزيل تقرير التدقيق المعلق', 
              nameEn: 'Download Pending Audit Report', 
              descAr: 'استخراج وثيقة مفصلة بجميع العناصر العالقة في طابور المراجعة وتحديد أسباب تأخر اعتمادها.', 
              descEn: 'Generate an exhaustive list of pending items to analyze internal workflow bottlenecks.',
              icon: <Download className="w-5 h-5 text-indigo-600" />
            }
          ],
          tableHeader: [
            language === 'ar' ? 'العنصر المضاف' : 'Draft Item',
            language === 'ar' ? 'نوع القسم' : 'Module Section',
            language === 'ar' ? 'تاريخ التقديم' : 'Submission Date',
            language === 'ar' ? 'نسبة التدقيق' : 'Review Score'
          ],
          tableRows: [
            [language === 'ar' ? 'منحة التميز الأكاديمي لجامعة أكسفورد' : 'Oxford Academic Excellence Scholarship', language === 'ar' ? 'المنح الدراسية' : 'Scholarships', '2026/07-27', '95%'],
            [language === 'ar' ? 'جامعة الملك فهد للبترول والمعادن' : 'King Fahd University profile edit', language === 'ar' ? 'الجامعات' : 'Universities', '2026/07-26', '100%'],
            [language === 'ar' ? 'دورة الإعداد لاختبار الآيلتس IELTS' : 'Advanced IELTS Prep Bootcamp', language === 'ar' ? 'الدورات التدريبية' : 'Courses', '2026/07-25', '88%'],
          ]
        };

      case 'admin_universities':
        return {
          icon: <School className="w-8 h-8 text-purple-600" />,
          metrics: [
            { label: language === 'ar' ? 'جامعات حكومية' : 'Public Universities', value: '28', change: 'Verified', color: 'border-emerald-600' },
            { label: language === 'ar' ? 'جامعات خاصة ودولية' : 'Private & Foreign', value: '14', change: 'Global', color: 'border-blue-500' },
            { label: language === 'ar' ? 'برامج أكاديمية نشطة' : 'Active Programs', value: '320', change: '+14 programs', color: 'border-purple-500' },
          ],
          actions: [
            { 
              nameAr: 'إضافة جامعة جديدة', 
              nameEn: 'Add New University', 
              descAr: 'فتح نموذج إدخال بيانات جامعة جديدة بالكامل (الشعار، معلومات الاتصال، صور الحرم الجامعي).', 
              descEn: 'Open the profile builder to register a new university and its structural components.',
              icon: <Plus className="w-5 h-5 text-emerald-600" />
            },
            { 
              nameAr: 'استيراد جماعي من Excel', 
              nameEn: 'Bulk Import from Excel', 
              descAr: 'رفع ملف Excel وتعبئة قاعدة البيانات بأسماء وشروط ومواقع مئات الجامعات خلال ثوانٍ معدودة.', 
              descEn: 'Upload formatted spreadsheet to parse and batch-create university pages.',
              icon: <FileSpreadsheet className="w-5 h-5 text-teal-600" />
            },
            { 
              nameAr: 'مزامنة مع وزارة التعليم', 
              nameEn: 'Sync with Ministry Directories', 
              descAr: 'التحقق الآلي من حالة الاعتراف الأكاديمي لكل جامعة مدرجة عن طريق التكامل مع أدلة الوزارة.', 
              descEn: 'Validate accreditation status dynamically with Ministry of Education standards.',
              icon: <RefreshCw className="w-5 h-5 text-amber-600" />
            },
            { 
              nameAr: 'تحديث رتب وتصنيف الجامعات', 
              nameEn: 'Update Rank & Classification', 
              descAr: 'جلب وتحديث الترتيب العالمي والمحلي للجامعات (مثل تصنيف QS وتصنيف شنغهاي) للعام الحالي.', 
              descEn: 'Pull latest global QS and Shanghai academic ranking metrics into the registry.',
              icon: <TrendingUp className="w-5 h-5 text-blue-600" />
            }
          ],
          tableHeader: [
            language === 'ar' ? 'اسم الجامعة' : 'University Name',
            language === 'ar' ? 'النوع' : 'Classification',
            language === 'ar' ? 'البرامج المتاحة' : 'Listed Programs',
            language === 'ar' ? 'حالة الاعتماد' : 'Accreditation Status'
          ],
          tableRows: [
            [language === 'ar' ? 'جامعة الملك عبد العزيز' : 'King Abdulaziz University', language === 'ar' ? 'حكومية' : 'Public', '48', language === 'ar' ? 'معتمد بالكامل' : 'Fully Accredited'],
            [language === 'ar' ? 'جامعة القاهرة' : 'Cairo University', language === 'ar' ? 'حكومية' : 'Public', '62', language === 'ar' ? 'معتمد بالكامل' : 'Fully Accredited'],
            [language === 'ar' ? 'الجامعة الأمريكية في الشارقة' : 'American University of Sharjah', language === 'ar' ? 'خاصة' : 'Private', '24', language === 'ar' ? 'معتمد بالكامل' : 'Fully Accredited'],
          ]
        };

      case 'admin_majors':
        return {
          icon: <BookOpen className="w-8 h-8 text-amber-700" />,
          metrics: [
            { label: language === 'ar' ? 'التخصصات المسجلة' : 'Registered Majors', value: '142', change: 'Standardized', color: 'border-blue-500' },
            { label: language === 'ar' ? 'كليات رئيسية' : 'Major Colleges', value: '8', change: 'Categorized', color: 'border-purple-500' },
            { label: language === 'ar' ? 'نسبة مطابقة المهن' : 'Career Mapping Match', value: '94%', change: 'Excellent', color: 'border-emerald-500' },
          ],
          actions: [
            { 
              nameAr: 'إضافة تخصص جديد', 
              nameEn: 'Add Academic Major', 
              descAr: 'إدخال تخصص علمي أو أدبي جديد وتحديد تفاصيل الوصف ومجالات العمل المتاحة فيه.', 
              descEn: 'Register a new academic discipline, definition, and its career possibilities.',
              icon: <Plus className="w-5 h-5 text-emerald-600" />
            },
            { 
              nameAr: 'مزامنة ترميز CIP الدولي', 
              nameEn: 'Sync International CIP Standards', 
              descAr: 'تطبيق ترميز Classification of Instructional Programs العالمي على التخصصات لتسهيل الفرز.', 
              descEn: 'Apply international CIP classification codes to all registered study areas.',
              icon: <Sliders className="w-5 h-5 text-indigo-600" />
            },
            { 
              nameAr: 'ربط التخصص بالمهن والمهارات', 
              nameEn: 'Map Majors to Career Outlines', 
              descAr: 'تعديل خوارزميات ربط الخريجين بفرص التوظيف والمهن المطلوبة في السوق الخليجي والعالمي.', 
              descEn: 'Adjust mapping rules correlating student majors with real labor market demands.',
              icon: <Briefcase className="w-5 h-5 text-blue-600" />
            }
          ],
          tableHeader: [
            language === 'ar' ? 'اسم التخصص الأكاديمي' : 'Major Name',
            language === 'ar' ? 'تصنيف الكلية' : 'College Sector',
            language === 'ar' ? 'رمز CIP' : 'CIP Code',
            language === 'ar' ? 'المستقبل الوظيفي' : 'Career Demand'
          ],
          tableRows: [
            [language === 'ar' ? 'علوم الحاسب والذكاء الاصطناعي' : 'Computer Science & AI', language === 'ar' ? 'كلية الهندسة والحاسبات' : 'Engineering & Computing', '11.0701', language === 'ar' ? 'مرتفع جداً' : 'Very High'],
            [language === 'ar' ? 'الهندسة الميكانيكية' : 'Mechanical Engineering', language === 'ar' ? 'كلية الهندسة والحاسبات' : 'Engineering & Computing', '14.1901', language === 'ar' ? 'مرتفع' : 'High'],
            [language === 'ar' ? 'إدارة الأعمال والتسويق الرقمي' : 'Business Administration & Marketing', language === 'ar' ? 'كلية الإدارة والعلوم الإنسانية' : 'Business & Humanities', '52.0201', language === 'ar' ? 'متوسط' : 'Moderate'],
          ]
        };

      case 'admin_tests':
        return {
          icon: <Globe2 className="w-8 h-8 text-rose-600" />,
          metrics: [
            { label: language === 'ar' ? 'الاختبارات المعيارية' : 'Standardized Tests', value: '6', change: 'Configured', color: 'border-rose-500' },
            { label: language === 'ar' ? 'مراكز اختبار تابعة' : 'Approved Centers', value: '48', change: 'Verified', color: 'border-emerald-500' },
            { label: language === 'ar' ? 'مسارات تدريبية مدمجة' : 'Prep Tracks', value: '24', change: 'Interactive', color: 'border-blue-500' },
          ],
          actions: [
            { 
              nameAr: 'إدراج اختبار قياسي جديد', 
              nameEn: 'Register New Standardized Test', 
              descAr: 'إضافة اختبار وطني أو دولي جديد للوحة (مثل اختبار تحصيلي، قدرات، SAT، GRE) وتحديد معاييره.', 
              descEn: 'Add a new standardized assessment to the database and map its metrics.',
              icon: <Plus className="w-5 h-5 text-emerald-600" />
            },
            { 
              nameAr: 'تحديث جداول درجات القبول المقابلة', 
              nameEn: 'Update Equivalent Grades Tables', 
              descAr: 'تعديل معامل تحويل الدرجات ومقارنتها بين الأنظمة المختلفة (مثل مطابقة درجات IELTS بـ TOEFL).', 
              descEn: 'Recalibrate grade conversion rules and benchmark testing frameworks.',
              icon: <Sliders className="w-5 h-5 text-amber-600" />
            },
            { 
              nameAr: 'ربط متطلبات الاختبار بالمنح', 
              nameEn: 'Link Test Rules to Scholarships', 
              descAr: 'مزامنة المتطلبات بشكل تلقائي لتصفية المنح التي تلزم بالحصول على درجات لغة أو قدرات محددة.', 
              descEn: 'Map score thresholds automatically to global active scholarship filters.',
              icon: <BookMarked className="w-5 h-5 text-indigo-600" />
            }
          ],
          tableHeader: [
            language === 'ar' ? 'الاختبار القياسي' : 'Standard Test',
            language === 'ar' ? 'الجهة المانحة' : 'Provider/Body',
            language === 'ar' ? 'الدرجة الصغرى للقبول' : 'Typical Minimum Score',
            language === 'ar' ? 'التحقق الرقمي' : 'Verification API'
          ],
          tableRows: [
            ['IELTS Academic', 'British Council & IDP', '6.5', language === 'ar' ? 'نشط ومتصل' : 'Active & Connected'],
            ['TOEFL iBT', 'ETS', '80', language === 'ar' ? 'نشط ومتصل' : 'Active & Connected'],
            [language === 'ar' ? 'القدرات العامة (قياس)' : 'Qudrat (GAT)', 'ETEC Saudi Arabia', '85', language === 'ar' ? 'نشط ومتصل' : 'Active & Connected'],
          ]
        };

      case 'admin_courses':
        return {
          icon: <BookMarked className="w-8 h-8 text-cyan-600" />,
          metrics: [
            { label: language === 'ar' ? 'الدورات التدريبية' : 'Active Prep Courses', value: '36', change: 'Available', color: 'border-cyan-500' },
            { label: language === 'ar' ? 'ساعات التعلم المنجزة' : 'Learning Hours Streamed', value: '1,420', change: '+240 hours', color: 'border-emerald-500' },
            { label: language === 'ar' ? 'متوسط تقييم الطلاب' : 'Average Course Rating', value: '4.8', change: 'Excellent', color: 'border-amber-500' },
          ],
          actions: [
            { 
              nameAr: 'مراجعة وتدقيق سجلات الدورات المستوردة', 
              nameEn: 'Review Imported Course Records', 
              descAr: 'مراجعة سجلات الكورسات المستوردة تلقائياً من مغذيات البيانات والتحقق من اكتمال عناصرها قبل تفعيلها.', 
              descEn: 'Review imported course files to verify structural integrity and prevent auto-publishing of invalid data.',
              icon: <Plus className="w-5 h-5 text-emerald-600" />
            },
            { 
              nameAr: 'التحقق من مشاكل الجودة والتنبيهات', 
              nameEn: 'View Validation & Quality Issues', 
              descAr: 'فحص التحذيرات والعيوب الهيكلية مثل نقص المحاضرات أو ملفات المناهج أو متطلبات القبول الكافي.', 
              descEn: 'Inspect metadata warning markers, missing lesson PDFs, and curriculum structure validation alerts.',
              icon: <AlertTriangle className="w-5 h-5 text-rose-600" />
            },
            { 
              nameAr: 'التحقق من روابط الكورسات ومجانيتها', 
              nameEn: 'Verify Course URLs & Free-Study Claims', 
              descAr: 'تدقيق روابط التسجيل الخارجية ومطابقة صحة ادعاءات المجانية ومجانية الشهادات المصاحبة لها لمنع التلاعب.', 
              descEn: 'Verify deep-links validity, certificate requirements, and validate global free-study classifications.',
              icon: <Globe2 className="w-5 h-5 text-indigo-600" />
            },
            { 
              nameAr: 'إصدار قرار الاعتماد والنشر', 
              nameEn: 'Approve, Reject & Publish/Archive', 
              descAr: 'تغيير حالة ظهور الكورس في دورة حياته بين (مسودة، تحت المراجعة، معتمد، منشور، مؤرشف) حسب التدقيق.', 
              descEn: 'Execute lifecycle status commands to transition visibility and grant public composition to Phase 24.',
              icon: <CheckCircle className="w-5 h-5 text-emerald-600" />
            }
          ],
          tableHeader: [
            language === 'ar' ? 'اسم الدورة التحضيرية' : 'Course Title',
            language === 'ar' ? 'المحاضر الرئيسي' : 'Lead Instructor',
            language === 'ar' ? 'عدد المسجلين' : 'Active Students',
            language === 'ar' ? 'الرسوم' : 'Registration Price'
          ],
          tableRows: [
            [language === 'ar' ? 'المسار المكثف لاجتياز اختبار آيلتس ٧.٥' : 'IELTS Target 7.5 Intensive Course', 'Dr. Faisal Al-Sabah', '412', language === 'ar' ? 'مجاني للمبتعثين' : 'Free for Candidates'],
            [language === 'ar' ? 'التحضير لاختبار القدرات - القسم الكمي واللفظي' : 'GAT Comprehensive Preparation', 'Prof. Ahmed Mansoor', '580', language === 'ar' ? '١٢٠ ر.س' : '120 SAR'],
            [language === 'ar' ? 'إتقان كتابة الخطاب الشخصي للمنح التركية' : 'Crafting Perfect Turkish Scholarship SOPs', 'Advisor Wedad Gamil', '180', language === 'ar' ? 'مجاني' : 'Free'],
          ]
        };

      case 'admin_services':
        return {
          icon: <Settings className="w-8 h-8 text-slate-600" />,
          metrics: [
            { label: language === 'ar' ? 'الخدمات المتاحة للطلب' : 'Fulfillment Services', value: '8', change: 'Online', color: 'border-slate-500' },
            { label: language === 'ar' ? 'الطلبات المكتملة شهرياً' : 'Completed This Month', value: '240', change: '+18%', color: 'border-emerald-500' },
            { label: language === 'ar' ? 'نسبة رضا الطلاب' : 'Customer Satisfaction', value: '92%', change: 'Very Good', color: 'border-blue-500' },
          ],
          actions: [
            { 
              nameAr: 'إضافة خدمة استشارية جديدة', 
              nameEn: 'Add New Service Item', 
              descAr: 'إدراج خدمة مدفوعة أو مجانية جديدة للطلاب (مثل تدقيق المستندات، كتابة السير الذاتية بالذكاء الاصطناعي).', 
              descEn: 'Design and list a new core platform service with custom onboarding questionnaires.',
              icon: <Plus className="w-5 h-5 text-emerald-600" />
            },
            { 
              nameAr: 'تعديل أسعار وباقات الخدمات', 
              nameEn: 'Edit Pricing & Package Bundles', 
              descAr: 'تعديل أسعار وباقات الدعم والاستشارات وتنسيق كود الخصومات والفوترة للشركاء.', 
              descEn: 'Reconfigure item prices, bundle discounts, and active billing currencies.',
              icon: <Sliders className="w-5 h-5 text-amber-600" />
            },
            { 
              nameAr: 'تحديث النماذج القياسية المرفقة', 
              nameEn: 'Upload Standard Document Templates', 
              descAr: 'تنزيل أو استبدال ملفات الـ Templates التي يعتمد عليها المستشارين لكتابة الخطابات والملفات للطلاب.', 
              descEn: 'Upload guidelines or standardized templates utilized by student consultants.',
              icon: <Download className="w-5 h-5 text-indigo-600" />
            }
          ],
          tableHeader: [
            language === 'ar' ? 'الخدمة الاستشارية' : 'Service Item',
            language === 'ar' ? 'سعر الخدمة القياسي' : 'Standard Price',
            language === 'ar' ? 'فترة التسليم SLA' : 'Expected Delivery',
            language === 'ar' ? 'فريق العمل' : 'Responsible Crew'
          ],
          tableRows: [
            [language === 'ar' ? 'خدمة كتابة الخطاب التحفيزي ومراجعته' : 'SOP Writing & Expert Review', '150 SAR', language === 'ar' ? '٣ أيام عمل' : '3 Business Days', language === 'ar' ? 'فريق الاستشارات الأكاديمية' : 'Academic Advisors'],
            [language === 'ar' ? 'الترجمة المعتمدة للشهادات والوثائق' : 'Official Document Translation', '90 SAR', language === 'ar' ? 'يومي عمل' : '2 Business Days', language === 'ar' ? 'قسم الترجمة الرسمية' : 'Translation Desk'],
            [language === 'ar' ? 'التقديم المتكامل للمنح الأجنبية' : 'Full Application Management Pack', '450 SAR', language === 'ar' ? '٧ أيام عمل' : '7 Business Days', language === 'ar' ? 'اللجنة العليا للتقديم' : 'Admissions Board'],
          ]
        };

      case 'admin_cms':
        return {
          icon: <FileText className="w-8 h-8 text-indigo-600" />,
          metrics: [
            { label: language === 'ar' ? 'المقالات والكتب المنشورة' : 'Published Articles & Guides', value: '86', change: 'Indexed', color: 'border-indigo-500' },
            { label: language === 'ar' ? 'تفاعلات ومشاهدات المقالات' : 'Page Views & Reads', value: '4,290', change: '+32%', color: 'border-emerald-500' },
            { label: language === 'ar' ? 'مسودات قيد المراجعة' : 'Pending Drafts', value: '12', change: 'Review Needed', color: 'border-amber-500' },
          ],
          actions: [
            { 
              nameAr: 'إنشاء مقال أو دليل جديد', 
              nameEn: 'Create Article / Study Guide', 
              descAr: 'فتح محرر النصوص المتكامل (Rich Text Editor) لكتابة ونشر مقال تعليمي جديد في مدونة منارتك.', 
              descEn: 'Launch the rich text visual editor to compose and publish an educational guide.',
              icon: <Plus className="w-5 h-5 text-emerald-600" />
            },
            { 
              nameAr: 'إدارة تصنيفات مقالات المدونة', 
              nameEn: 'Manage Blog Categories & Tags', 
              descAr: 'إضافة أو تعديل تصنيفات المقالات الرئيسية (مثال: نصائح السفر، التحضير اللغوي، التمويل الدراسي).', 
              descEn: 'Organize, rename, or create article categories for easy frontend navigation.',
              icon: <Sliders className="w-5 h-5 text-indigo-600" />
            },
            { 
              nameAr: 'تحديث محتوى الأسئلة الشائعة FAQ', 
              nameEn: 'Edit Frequently Asked Questions', 
              descAr: 'تعديل أو تعديل إجابات الأسئلة الشائعة التي تظهر للطلاب لتقليل الضغط على الدعم الفني.', 
              descEn: 'Update system-wide dynamic FAQs to resolve student support inquiries instantly.',
              icon: <RefreshCw className="w-5 h-5 text-amber-600" />
            }
          ],
          tableHeader: [
            language === 'ar' ? 'عنوان المقال الأكاديمي' : 'Article Title',
            language === 'ar' ? 'التصنيف' : 'Category',
            language === 'ar' ? 'تاريخ النشر والجدولة' : 'Date Published',
            language === 'ar' ? 'حالة الظهور' : 'Visibility'
          ],
          tableRows: [
            [language === 'ar' ? 'دليل شامل للتقديم على المنحة الحكومية التركية لعام ٢٠٢٦' : 'Full Manual: Turkish Government Scholarship 2026', language === 'ar' ? 'أدلة التقديم' : 'Application Guides', '2026/07-27', language === 'ar' ? 'عام ومرئي' : 'Public'],
            [language === 'ar' ? 'كيف تجتاز مقابلة الابتعاث بنجاح وتجيب على أصعب الأسئلة' : 'How to Ace Scholarship Interviews Successfully', language === 'ar' ? 'التحضير والمقابلات' : 'Interview Prep', '2026/07-22', language === 'ar' ? 'عام ومرئي' : 'Public'],
            [language === 'ar' ? 'أفضل الجامعات في بريطانيا لدراسة هندسة البرمجيات وتكلفتها' : 'Top UK Software Engineering Universities & Tuition', language === 'ar' ? 'وجهات الدراسة' : 'Study Destinations', '2026/07-15', language === 'ar' ? 'عام ومرئي' : 'Public'],
          ]
        };

      case 'admin_tools':
        return {
          icon: <Wrench className="w-8 h-8 text-orange-600" />,
          metrics: [
            { label: language === 'ar' ? 'الأدوات التفاعلية النشطة' : 'Active Student Utilities', value: '7', change: 'Online', color: 'border-orange-500' },
            { label: language === 'ar' ? 'مجموع مرات استخدام الأدوات' : 'Total Uses Executed', value: '23,400', change: '+3.5k this week', color: 'border-emerald-500' },
            { label: language === 'ar' ? 'دقة حاسبة النسبة الموزونة' : 'GPA Calculator Precision', value: '99.1%', change: 'Calibrated', color: 'border-blue-500' },
          ],
          actions: [
            { 
              nameAr: 'مفتاح تجميد وتعطيل تشغيل الأدوات', 
              nameEn: 'Soft Enable/Disable Toggle with Audit Log', 
              descAr: 'إيقاف تشغيل أداة برمجية معينة فورياً مع تسجيل تبرير التعطيل في سجل تدقيق النظام لأمان المنصة.', 
              descEn: 'Soft disable tool execution and log rationale to Phase 05 audit trail to secure endpoints.',
              icon: <Lock className="w-5 h-5 text-rose-600" />
            },
            { 
              nameAr: 'التحكم بظهور الأداة في الواجهة العامة', 
              nameEn: 'Configure Tool Visibility Levels', 
              descAr: 'ضبط مستوى ظهور وحالة الأداة الطلابية في الفئات المحددة (نشط، قريباً، تحت التطوير، مشرفين فقط، متقاعد).', 
              descEn: 'Set tool lifecycle visibility boundaries: ACTIVE, COMING_SOON, HIDDEN_ADMIN_ONLY, etc.',
              icon: <Sliders className="w-5 h-5 text-indigo-600" />
            },
            { 
              nameAr: 'تعديل أولوية التطوير والفرق', 
              nameEn: 'Adjust Priority & Backlog Controls', 
              descAr: 'تعديل تصنيف أولوية الأداة في قائمة الانتظار الهندسية لتسريع الإطلاق (P1_CORE_LAUNCH, P2_EXPANSION, P3_LATER).', 
              descEn: 'Adjust engineering backlog priorities and roadmap tags to optimize resource allocation on tool deliverables.',
              icon: <TrendingUp className="w-5 h-5 text-blue-600" />
            },
            { 
              nameAr: 'فحص اتصالات الخدمات وصحة الاعتمادات', 
              nameEn: 'Run Dependency & AI Health Checks', 
              descAr: 'فحص فوري للتحقق من سلامة وصحة اتصال الأداة بواجهات برمجة التطبيقات وسيرفرات الذكاء الاصطناعي.', 
              descEn: 'Check real-time health and response latency of core platform databases and Gemini AI engines.',
              icon: <RefreshCw className="w-5 h-5 text-amber-600" />
            }
          ],
          tableHeader: [
            language === 'ar' ? 'الأداة التفاعلية' : 'Student Tool',
            language === 'ar' ? 'الوصف الوظيفي' : 'Functional Description',
            language === 'ar' ? 'مرات التشغيل' : 'Execution Counts',
            language === 'ar' ? 'الحالة التشغيلية' : 'Operational Health'
          ],
          tableRows: [
            [language === 'ar' ? 'حاسبة النسبة الموزونة والتحصيلي' : 'Weighted GPA & Admission Calculator', language === 'ar' ? 'حساب نسب القبول للجامعات السعودية' : 'Calculates Saudi university admission indices', '12,450', language === 'ar' ? 'مستقر' : 'Stable'],
            [language === 'ar' ? 'محول المعدل التراكمي الدولي' : 'Universal GPA converter', language === 'ar' ? 'تحويل المعدل بين المقاييس المختلفة' : 'Converts GPAs between global metrics', '8,120', language === 'ar' ? 'مستقر' : 'Stable'],
            [language === 'ar' ? 'محلل الخطاب الشخصي بالذكاء الاصطناعي' : 'AI SOP Smart Analyzer', language === 'ar' ? 'تقييم وصياغة خطابات الطلاب تلقائياً' : 'Evaluates and formats student essays automatically', '2,830', language === 'ar' ? 'مستقر' : 'Stable'],
          ]
        };

      case 'admin_certificates':
        return {
          icon: <Award className="w-8 h-8 text-violet-600" />,
          metrics: [
            { label: language === 'ar' ? 'الشهادات الصادرة والمثبتة' : 'Issued Certificates', value: '340', change: 'Verifiable', color: 'border-violet-500' },
            { label: language === 'ar' ? 'التحققات المشفرة الجارية' : 'Cryptographic Verifications', value: '290', change: '100% Valid', color: 'border-emerald-500' },
            { label: language === 'ar' ? 'طلبات إصدار معلقة' : 'Pending Issue Requests', value: '3', change: 'Immediate action', color: 'border-amber-500' },
          ],
          actions: [
            { 
              nameAr: 'إصدار شهادة جديدة يدوياً', 
              nameEn: 'Issue Manual Accomplishment Certificate', 
              descAr: 'إصدار شهادة باسم الطالب ورقم وطني فريد مدمج برابط تحقق رقمي مشفر يؤكد إتمامه للمتطلبات.', 
              descEn: 'Manually mint a certificate for a student, featuring secure hash links and signatures.',
              icon: <Plus className="w-5 h-5 text-emerald-600" />
            },
            { 
              nameAr: 'تخصيص قالب التصميم المرئي', 
              nameEn: 'Customize Certificate Design Template', 
              descAr: 'استيراد أو تعديل تصميم الشهادات (الشعار، التواقيع، الألوان، النصوص القانونية للإصدار).', 
              descEn: 'Upload design backgrounds, edit signatures, and align certificate text frames.',
              icon: <Sliders className="w-5 h-5 text-indigo-600" />
            },
            { 
              nameAr: 'التحقق من توقيع رقمي لشهادة', 
              nameEn: 'Verify Cryptographic Certificate Signature', 
              descAr: 'اختبار والتأكد من مطابقة الهاش الرقمي للشهادة مع السجلات المعتمدة في بلوكتشين/قاعدة البيانات.', 
              descEn: 'Run a hash check to authenticate and audit any issued digital credential.',
              icon: <ShieldCheck className="w-5 h-5 text-blue-600" />
            }
          ],
          tableHeader: [
            language === 'ar' ? 'رقم الشهادة ID' : 'Certificate Serial',
            language === 'ar' ? 'اسم الطالب المستلم' : 'Recipient Student',
            language === 'ar' ? 'اسم البرنامج التدريبي' : 'Certified Course',
            language === 'ar' ? 'تاريخ الإصدار والاعتماد' : 'Issue Date'
          ],
          tableRows: [
            ['MN-CERT-9082', 'Wegdan Gamil', language === 'ar' ? 'مسار الإعداد للابتعاث المتميز' : 'Elite Study Abroad Path', '2026/07-25'],
            ['MN-CERT-9081', 'Fahad Al-Qahtani', language === 'ar' ? 'المسار المتكامل لاجتياز توفل' : 'TOEFL Preparation Course', '2026/07-24'],
            ['MN-CERT-9080', 'Mona Al-Asiri', language === 'ar' ? 'مهارات كتابة خطابات النوايا والمقالات' : 'Advanced SOP & Resume Writing', '2026/07-20'],
          ]
        };

      case 'admin_finance':
        return {
          icon: <Coins className="w-8 h-8 text-emerald-700" />,
          metrics: [
            { label: language === 'ar' ? 'إجمالي الدفعات المقبولة' : 'Total Revenue Value', value: '$48,200', change: '+32% this month', color: 'border-emerald-600' },
            { label: language === 'ar' ? 'فواتير مكتملة ومسددة' : 'Paid Invoices Count', value: '142', change: 'No Discrepancy', color: 'border-blue-500' },
            { label: language === 'ar' ? 'حوالات معلقة للتأكيد' : 'Pending Bank Wire Captures', value: '5', change: 'Review Bank Slip', color: 'border-amber-500' },
          ],
          actions: [
            { 
              nameAr: 'إصدار فاتورة يدوية لطالب', 
              nameEn: 'Issue Custom Manual Invoice', 
              descAr: 'إنشاء فاتورة خدمات مخصصة لطالب مع حقل إدخال البنود والضرائب ووسائل السداد المفضلة.', 
              descEn: 'Create a custom invoice detailing unique consulting line-items and taxes.',
              icon: <Plus className="w-5 h-5 text-emerald-600" />
            },
            { 
              nameAr: 'تسجيل وتأكيد حوالة بنكية يدوياً', 
              nameEn: 'Manually Approve Bank Wire Transfer', 
              descAr: 'رفع ومطابقة إيصالات السداد البنكية اليدوية المرسلة من الطلاب وتفعيل الخدمات المرتبطة.', 
              descEn: 'Verify and reconcile manually uploaded bank wire receipts to unlock services.',
              icon: <UserCheck className="w-5 h-5 text-amber-600" />
            },
            { 
              nameAr: 'استرداد الأموال لخدمة ملغاة', 
              nameEn: 'Process Refund to Student Wallet', 
              descAr: 'استرجاع الأموال المدفوعة لخدمة ملغاة مع حقل إدخال تبرير الإلغاء وتعديل أرصدة المحفظة الالكترونية.', 
              descEn: 'Revert stripe payments or refund values directly back to student platform wallets.',
              icon: <X className="w-5 h-5 text-rose-600" />
            }
          ],
          tableHeader: [
            language === 'ar' ? 'رقم الفاتورة' : 'Invoice Reference',
            language === 'ar' ? 'الاسم والبريد' : 'Payer Information',
            language === 'ar' ? 'القيمة الإجمالية' : 'Total Amount Paid',
            language === 'ar' ? 'طريقة الدفع' : 'Payment Method'
          ],
          tableRows: [
            ['#INV-2026-104', 'Wegdan Gamil (wegdan@demo.com)', '450 SAR', language === 'ar' ? 'بطاقة مدى الإلكترونية' : 'Mada Debit Card'],
            ['#INV-2026-103', 'Ali Al-Hamed (ali@demo.com)', '150 SAR', language === 'ar' ? 'حوالة بنكية يدوية' : 'Manual Bank Wire'],
            ['#INV-2026-102', 'Yasmin Farooq (yasmin@demo.com)', '90 SAR', 'Apple Pay'],
          ]
        };

      case 'admin_careers':
        return {
          icon: <Briefcase className="w-8 h-8 text-blue-700" />,
          metrics: [
            { label: language === 'ar' ? 'الفرص المتاحة والتدريب' : 'Active Career Postings', value: '120', change: 'Updated', color: 'border-blue-500' },
            { label: language === 'ar' ? 'شراكات التوظيف المفعلة' : 'Active Corporate Partners', value: '35', change: 'Verified', color: 'border-indigo-500' },
            { label: language === 'ar' ? 'معدل توظيف الخريجين' : 'Graduate Placement Rate', value: '82%', change: 'Very High', color: 'border-emerald-500' },
          ],
          actions: [
            { 
              nameAr: 'إضافة فرصة وظيفية أو تدريب', 
              nameEn: 'Add Career / Internship Listing', 
              descAr: 'نشر إعلان وظيفي أو تدريبي مخصص لشركاء التوظيف يستهدف خريجي وطلاب منصة منارتك.', 
              descEn: 'Publish a job or internship description targeting qualified platform alumni.',
              icon: <Plus className="w-5 h-5 text-emerald-600" />
            },
            { 
              nameAr: 'تحليل إحصائيات التوظيف والرواتب', 
              nameEn: 'Generate Employment & Placement Stats', 
              descAr: 'تصدير إحصائيات تفصيلية عن الرواتب والشركات الأكثر توظيفاً لعرضها في تقارير الجهات الحكومية والشركاء.', 
              descEn: 'Export dynamic charts mapping average salaries, hiring timelines, and sectors.',
              icon: <TrendingUp className="w-5 h-5 text-indigo-600" />
            },
            { 
              nameAr: 'جدولة يوم التوظيف الافتراضي', 
              nameEn: 'Schedule Virtual Career Fair Event', 
              descAr: 'إعداد مواعيد وتفاصيل يوم المقابلات والتوظيف والورش المهنية الذي ينظمه فريق منارتك دورياً.', 
              descEn: 'Register time slots and virtual rooms for the periodic platform career fair event.',
              icon: <Clock className="w-5 h-5 text-amber-600" />
            }
          ],
          tableHeader: [
            language === 'ar' ? 'المسمى الوظيفي والفرصة' : 'Job Title & Placement',
            language === 'ar' ? 'الجهة الموظفة' : 'Hiring Organization',
            language === 'ar' ? 'الموقع ونظام العمل' : 'Work Arrangement',
            language === 'ar' ? 'متطلبات التخصص' : 'Target Major'
          ],
          tableRows: [
            [language === 'ar' ? 'مطور ذكاء اصطناعي متدرب' : 'AI Software Engineer Intern', 'Manaratak Tech Lab', language === 'ar' ? 'عن بعد - كامل' : 'Remote / Full-time', language === 'ar' ? 'علوم الحاسب / هندسة برمجيات' : 'Computer Science / SE'],
            [language === 'ar' ? 'مهندس طاقة متجددة مبتدئ' : 'Junior Renewable Energy Engineer', 'Saudi Green Energy Corp', language === 'ar' ? 'الرياض - حضوري' : 'Riyadh / On-site', language === 'ar' ? 'هندسة ميكانيكية / كهربائية' : 'Mechanical / Electrical Eng'],
            [language === 'ar' ? 'محلل تسويق رقمي وصناعة محتوى' : 'Digital Marketing & CRM Analyst', 'Gulf Media Group', language === 'ar' ? 'دبي - هجين' : 'Dubai / Hybrid', language === 'ar' ? 'إدارة أعمال / تسويق' : 'Business Admin / Marketing'],
          ]
        };

      case 'admin_ai_governance':
        return {
          icon: <Cpu className="w-8 h-8 text-fuchsia-600" />,
          metrics: [
            { label: language === 'ar' ? 'طلبات الذكاء الاصطناعي المنفذة' : 'Total AI Queries Executed', value: '14,800', change: '+18% this week', color: 'border-fuchsia-500' },
            { label: language === 'ar' ? 'متوسط زمن الاستجابة' : 'Average AI Response Latency', value: '0.02s', change: 'Very Fast', color: 'border-emerald-500' },
            { label: language === 'ar' ? 'الامتثال لضوابط أمان البيانات' : 'Safety Compliance Rating', value: '100%', change: 'Fully Compliant', color: 'border-blue-500' },
          ],
          actions: [
            { 
              nameAr: 'ضبط حساسية فلاتر الأمان والخصوصية', 
              nameEn: 'Configure AI Safety Filter Thresholds', 
              descAr: 'تعديل مستويات فلترة النصوص والمخرجات لمنع الردود الخارجة عن السياق وحفظ خصوصية بيانات الطلاب.', 
              descEn: 'Set API policy thresholds to secure user data and filter inappropriate prompts.',
              icon: <Lock className="w-5 h-5 text-rose-600" />
            },
            { 
              nameAr: 'تعديل موجهات النظام الأساسية', 
              nameEn: 'Edit System Base Prompts', 
              descAr: 'تحرير وتعديل التوجيهات الأساسية (System Prompts) لمساعد الذكاء الاصطناعي المسؤول عن صياغة الخطابات.', 
              descEn: 'Modify the background system guidelines that instruct the Gemini engine behaviors.',
              icon: <Sliders className="w-5 h-5 text-fuchsia-600" />
            },
            { 
              nameAr: 'تحديد سقف الاستهلاك والرموز اليومي', 
              nameEn: 'Set Daily Cost & Token Limits', 
              descAr: 'تخصيص الحد الأقصى من الـ Tokens والمصاريف المسموح للطلاب استهلاكها يومياً لحماية ميزانية السيرفر.', 
              descEn: 'Configure hard limits on daily API spend per student to mitigate billing spikes.',
              icon: <Sliders className="w-5 h-5 text-amber-600" />
            }
          ],
          tableHeader: [
            language === 'ar' ? 'نوع العملية والحدث' : 'Event ID & Log',
            language === 'ar' ? 'معامل الأمان' : 'Safety Status',
            language === 'ar' ? 'الرموز المستهلكة' : 'Token Usage',
            language === 'ar' ? 'تاريخ المعاملة' : 'Log Time'
          ],
          tableRows: [
            ['GEMINI-CALL-4890', language === 'ar' ? 'مأمون واجتاز الفحص' : 'Safe / Passed Audit', '1,420 tokens', '2026/07-27 13:50'],
            ['GEMINI-CALL-4889', language === 'ar' ? 'مأمون واجتاز الفحص' : 'Safe / Passed Audit', '980 tokens', '2026/07-27 13:48'],
            ['GEMINI-CALL-4888', language === 'ar' ? 'محجوب بواسطة جدار الأمان' : 'Blocked / Safety Guard Triggered', '240 tokens', '2026/07-27 13:42'],
          ]
        };

      case 'admin_settings':
        return {
          icon: <ShieldCheck className="w-8 h-8 text-gray-700" />,
          metrics: [
            { label: language === 'ar' ? 'المشرفون النشطون بالنظام' : 'Active System Administrators', value: '5', change: 'High Privilege', color: 'border-slate-500' },
            { label: language === 'ar' ? 'مستويات الصلاحيات والأدوار' : 'Pre-configured Access Levels', value: '2', change: 'RBAC Active', color: 'border-indigo-500' },
            { label: language === 'ar' ? 'نسبة حماية الجلسة والسرية' : 'Session Integrity Guard Score', value: '100%', change: 'Excellent', color: 'border-emerald-500' },
          ],
          actions: [
            { 
              nameAr: 'إضافة حساب مشرف جديد', 
              nameEn: 'Create New Admin / Staff User', 
              descAr: 'إنشاء حساب مستخدم جديد لفريق العمل، وتحديد الصلاحيات الخاصة بهم ومستوى الولوج للقوائم.', 
              descEn: 'Register a new administrator profile and dispatch custom onboarding invitations.',
              icon: <Plus className="w-5 h-5 text-emerald-600" />
            },
            { 
              nameAr: 'تعديل صلاحيات الأدوار والأذونات', 
              nameEn: 'Modify Role-Based Access Control', 
              descAr: 'تحرير صلاحيات المدراء (الأدمن والمراجعين ومدخلي البيانات) لضمان سرية وسلامة قاعدة البيانات.', 
              descEn: 'Configure fine-grained read/write privileges for staff roles system-wide.',
              icon: <Sliders className="w-5 h-5 text-indigo-600" />
            },
            { 
              nameAr: 'تفعيل وضع الصيانة الشامل', 
              nameEn: 'Toggle System Maintenance Mode', 
              descAr: 'قفل واجهات التسجيل والدخول والبحث مؤقتاً لعرض صفحة الصيانة وإجراء ترقية حية لقواعد البيانات.', 
              descEn: 'Lock the platform and route users to a safe placeholder page during database migrations.',
              icon: <Lock className="w-5 h-5 text-rose-600" />
            }
          ],
          tableHeader: [
            language === 'ar' ? 'المشرف' : 'Administrator',
            language === 'ar' ? 'الدور الوظيفي والمسؤولية' : 'Platform Role',
            language === 'ar' ? 'آخر تسجيل دخول' : 'Last Login IP',
            language === 'ar' ? 'الحالة تشغيلية' : 'Profile Status'
          ],
          tableRows: [
            ['Wegdan Gamil', language === 'ar' ? 'مدير منصة خارق (Super Admin)' : 'Super Platform Administrator', '192.168.1.1', language === 'ar' ? 'نشط' : 'Active'],
            ['Admissions Auditor', language === 'ar' ? 'مراجع ومصفي منح (Reviewer)' : 'Admissions & Review Officer', '192.168.1.24', language === 'ar' ? 'نشط' : 'Active'],
            ['Content Creator', language === 'ar' ? 'مدخل بيانات ومقالات (Editor)' : 'CMS Content Writer', '192.168.1.82', language === 'ar' ? 'نشط' : 'Active'],
          ]
        };

      default:
        return {
          icon: <Activity className="w-8 h-8 text-emerald-600" />,
          metrics: [
            { label: language === 'ar' ? 'إجمالي السجلات' : 'Total Listed Records', value: '184', change: 'Stable', color: 'border-emerald-500' },
            { label: language === 'ar' ? 'تم تحديثها مؤخراً' : 'Recently Updated', value: '12', change: 'Fresh Data', color: 'border-blue-500' },
          ],
          actions: [
            { 
              nameAr: 'إضافة سجل جديد', 
              nameEn: 'Add New Entry', 
              descAr: 'تسجيل وإدراج معلومات عنصر جديد يدوياً في لوحة الإدارة المتكاملة.', 
              descEn: 'Open builder interface to submit a new resource entry.',
              icon: <Plus className="w-5 h-5 text-emerald-600" />
            },
            { 
              nameAr: 'مزامنة وتصحيح تلقائي', 
              nameEn: 'Trigger System Auto-Sync', 
              descAr: 'إصلاح الأخطاء اللغوية وتدقيق البيانات وإجراء مزامنة مع السيرفر الرئيسي.', 
              descEn: 'Verify schema accuracy and trigger automatic system optimization filters.',
              icon: <RefreshCw className="w-5 h-5 text-amber-600" />
            },
            { 
              nameAr: 'تصدير كامل لقاعدة البيانات', 
              nameEn: 'Export Complete Dataset', 
              descAr: 'تحميل جميع السجلات النشطة والملغاة بصيغة ملف CSV للنسخ الاحتياطي والتحليل المتقدم.', 
              descEn: 'Download raw directory dataset structured as clean, ready CSV document.',
              icon: <Download className="w-5 h-5 text-indigo-600" />
            }
          ],
          tableHeader: [
            language === 'ar' ? 'اسم السجل' : 'Entry Reference',
            language === 'ar' ? 'نوع التصنيف' : 'Type Category',
            language === 'ar' ? 'آخر تعديل' : 'Last Modified',
            language === 'ar' ? 'الحالة' : 'Operational State'
          ],
          tableRows: [
            ['Sample Entry A', 'Academic', '2026/07-27', 'Active'],
            ['Sample Entry B', 'Operations', '2026/07-26', 'Active'],
            ['Sample Entry C', 'System Logs', '2026/07-25', 'Active'],
          ]
        };
    }
  };

  if (titleKey === 'admin_dashboard') {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4" dir={dir}>
        {/* Floating Feedback Toast */}
        {activeToast.show && (
          <div className="fixed bottom-6 right-6 left-6 md:left-auto md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-[#0F4B3A] border border-[#C8A24A]/30 text-white p-4 rounded-xl shadow-lg flex items-start gap-3 text-right">
              <Sparkles className="w-5 h-5 text-[#C8A24A] flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm font-semibold leading-relaxed">
                {activeToast.msg}
              </div>
              <button 
                onClick={() => setActiveToast(prev => ({ ...prev, show: false }))}
                className="text-white/70 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Selected Log Details Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-100 rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in zoom-in-95 duration-200 text-right" dir={dir}>
              <button 
                onClick={() => setSelectedLog(null)}
                className="absolute top-4 left-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                title={language === 'ar' ? 'إغلاق' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-50 rounded-lg text-[#0F4B3A]">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {language === 'ar' ? 'تفاصيل سجل النشاط الرقابي' : 'Audit Activity Details'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'ar' ? 'مؤشرات سلامة وحوكمة العمليات' : 'Operation safety & governance indicators'}
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 text-sm border-t border-slate-100 pt-4">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 font-bold">{language === 'ar' ? 'العملية:' : 'Operation:'}</span>
                  <span className="col-span-2 text-slate-800 font-semibold">{selectedLog.op}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 font-bold">{language === 'ar' ? 'النطاق / القسم:' : 'Domain / Sector:'}</span>
                  <span className="col-span-2 text-slate-800 font-semibold">{selectedLog.domain}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 font-bold">{language === 'ar' ? 'منفذ العملية:' : 'Actor:'}</span>
                  <span className="col-span-2 text-slate-800 font-semibold">{selectedLog.actor}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 font-bold">{language === 'ar' ? 'توقيت الحدث:' : 'Timestamp:'}</span>
                  <span className="col-span-2 text-slate-800 font-semibold">{selectedLog.time}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 font-bold">{language === 'ar' ? 'حالة السجل:' : 'Status:'}</span>
                  <span className="col-span-2">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                      selectedLog.statusAr === 'ناجح' || selectedLog.statusEn === 'Success'
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-rose-50 text-rose-700'
                    }`}>
                      {language === 'ar' ? selectedLog.statusAr : selectedLog.statusEn}
                    </span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 font-bold">{language === 'ar' ? 'تفاصيل المخرجات:' : 'Result details:'}</span>
                  <span className="col-span-2 text-slate-700 leading-relaxed font-medium">{selectedLog.result}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-50 pt-4">
                <button
                  disabled
                  className="px-4 py-2 bg-slate-100 text-slate-400 text-xs font-bold rounded-xl cursor-not-allowed flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {language === 'ar' ? 'تعديل السجل (مغلق)' : 'Edit Log (Locked)'}
                </button>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-[#0F4B3A] text-white text-xs font-bold rounded-xl hover:bg-[#0b382b] transition-colors"
                >
                  {language === 'ar' ? 'حسناً، إغلاق' : 'Close Details'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header and Back Link */}
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F4B3A] hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-[#0F4B3A]/10 transition-colors mb-6">
          <ArrowLeft className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
          {t('back_to_admin') || 'العودة للوحة القيادة'}
        </Link>

        {/* Governing Dashboard Header */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-1.5 bg-[#0F4B3A]/5 rounded-lg text-[#0F4B3A]">
                <LayoutDashboard className="w-8 h-8" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {language === 'ar' ? 'لوحة تحكم المشرف والرقابة الأمنية' : 'Admin Control & Governance Dashboard'}
              </h1>
            </div>
            <p className="text-slate-600 text-sm max-w-2xl leading-relaxed mt-1">
              {language === 'ar' 
                ? 'نظام رقابة وإشراف موحد ومتوافق بالكامل مع معايير حوكمة المرحلة ٢٣ لمنصة منارتك ٢.٠. تعرض اللوحة ملخصات طوابير المراجعة، وصحة خوادم النشر، وحالة محركات استيراد البيانات دون تنفيذ عمليات إنتاجية خطيرة مباشرة.'
                : 'A unified administration control plane fully compliant with Phase 23 governance guidelines for MANARATAK 2.0. This dashboard provides review queue metrics, publishing health signals, and import engine tracking without direct execution of risky production operations.'}
            </p>
          </div>
          <div className="flex flex-col sm:items-end gap-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#C8A24A]/10 text-[#a37f2e] border border-[#C8A24A]/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              {language === 'ar' ? 'الحوكمة والمراقبة الآمنة نشطة' : 'Secure Governance Active'}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {language === 'ar' ? 'وضع التشغيل الحالي: معاينة تجريبية آمنة' : 'Current mode: Demo / Preview'}
            </span>
          </div>
        </div>

        {/* SECTION A: SYSTEM STATUS (بوابة جودة وحالة خوادم النظام) */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-400 block uppercase tracking-wider mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-slate-400" />
            {language === 'ar' ? 'أولاً: مؤشرات حالة وجودة النظام والخدمات' : 'I. System & Services Status Indicators'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">{language === 'ar' ? 'واجهة التطبيقات (API)' : 'API Status'}</span>
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-[#0F4B3A]">{language === 'ar' ? 'نشط ومستقر' : 'Active & Stable'}</span>
                <span className="block text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mt-1.5 w-max">Active</span>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">{language === 'ar' ? 'قاعدة البيانات (Database)' : 'Database Mode'}</span>
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-amber-700">{language === 'ar' ? 'معاينة تجريبية' : 'Demo Data / Preview'}</span>
                <span className="block text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-1.5 w-max">Demo Data</span>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">{language === 'ar' ? 'طابور العمليات (Queue)' : 'Redis / Queue'}</span>
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-rose-600">{language === 'ar' ? 'بانتظار الدمج' : 'Pending Integration'}</span>
                <span className="block text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded mt-1.5 w-max">Requires Integration</span>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">{language === 'ar' ? 'محرك الاستيراد (Engine)' : 'Import Engine'}</span>
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-[#0F4B3A]">{language === 'ar' ? 'جاهز وفي الانتظار' : 'Ready (Idle)'}</span>
                <span className="block text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mt-1.5 w-max">Active</span>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">{language === 'ar' ? 'نمط الصلاحية (Auth)' : 'Admin Auth Mode'}</span>
                <span className="w-2.5 h-2.5 bg-slate-400 rounded-full" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-slate-600">{language === 'ar' ? 'جلسة مشرف تجريبية' : 'Demo Local Session'}</span>
                <span className="block text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-1.5 w-max">Preview</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row for REVIEW TASKS & RECENT IMPORTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* SECTION B: REVIEW TASKS (طابور المراجعة والتدقيق) */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                {language === 'ar' ? 'ثانياً: طابور المراجعة والتدقيق للمواد المعلقة' : 'II. Pending Review & Quality Verification Queue'}
              </h4>
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                {language === 'ar' ? 'تنبيهات جودة جارية' : 'Ongoing Quality Checks'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl">
                <span className="text-xs font-bold text-slate-500 block mb-1">
                  {language === 'ar' ? 'المنح بانتظار المراجعة' : 'Scholarships Needing Review'}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-[#0F4B3A]">12</span>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">P1 Priority</span>
                </div>
              </div>

              <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl">
                <span className="text-xs font-bold text-slate-500 block mb-1">
                  {language === 'ar' ? 'الجامعات بانتظار مراجعة الملف' : 'Universities Needing Review'}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-[#0F4B3A]">4</span>
                  <span className="text-[10px] font-bold text-[#C8A24A] bg-amber-50 px-1.5 py-0.5 rounded">Metadata</span>
                </div>
              </div>

              <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl">
                <span className="text-xs font-bold text-slate-500 block mb-1">
                  {language === 'ar' ? 'سجلات مستوردة بنواقص هيكلية' : 'Imported Records with Missing Fields'}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-amber-600">8</span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Fix Required</span>
                </div>
              </div>

              <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl">
                <span className="text-xs font-bold text-slate-500 block mb-1">
                  {language === 'ar' ? 'صفوف استيراد فاشلة / أخطاء' : 'Failed Import Rows'}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-rose-600">2</span>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Critical</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION C: RECENT IMPORTS (ملخص الاستيراد الأخير) */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-teal-600" />
                  {language === 'ar' ? 'ثالثاً: ملخص عمليات استيراد البيانات الأخيرة' : 'III. Recent Domain Imports & Data Synchronization'}
                </h4>
                <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full font-bold">
                  {language === 'ar' ? 'الدفعة الأخيرة ناجحة' : 'Latest batch succeeded'}
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">{language === 'ar' ? 'رقم دفعة الاستيراد:' : 'Latest Import Batch ID:'}</span>
                  <span className="font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 font-mono text-left">BATCH-2026-07-27-01</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">{language === 'ar' ? 'النطاق المستهدف لتنزيل البيانات:' : 'Target Domain Area:'}</span>
                  <span className="font-extrabold text-[#0F4B3A]">{language === 'ar' ? 'المنح الدراسية العالمية' : 'Scholarships / Global Feed'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">{language === 'ar' ? 'إجمالي السجلات المدخلة طيلة الدورة:' : 'Total Records Parsed:'}</span>
                  <span className="font-extrabold text-slate-800">150 {language === 'ar' ? 'سجل' : 'records'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">{language === 'ar' ? 'سجلات غير مكتملة (تتطلب تدقيق يدوي):' : 'Incomplete Records (Tagged for Review):'}</span>
                  <span className="font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">14 {language === 'ar' ? 'سجل' : 'records'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">{language === 'ar' ? 'سجلات تم ترحيلها وقبولها تلقائياً:' : 'Transferred Records (Auto-Promoted):'}</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">136 {language === 'ar' ? 'سجل' : 'records'}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-50 text-[11px] text-slate-400">
              {language === 'ar' 
                ? '• يخضع هذا الجدول لقواعد المطابقة (Phase 12) والتدقيق المعماري لبلوغ الجاهزية بنسبة ١٠٠٪.' 
                : '• Governed by completeness algorithms (Phase 12) checking for mandatory scholarship definitions.'}
            </div>
          </div>
        </div>

        {/* SECTION D: PUBLISH READINESS (جاهزية النشر العام للجمهور) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              {language === 'ar' ? 'رابعاً: جاهزية النشر العام ومؤشرات التكامل للمرحلة ٢٤' : 'IV. Content Public-Publishing Readiness Metrics'}
            </h4>
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
              {language === 'ar' ? 'مؤشرات النشر الآمن' : 'Safe Publishing Controls'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-slate-100 p-4 rounded-xl text-center">
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider mb-1">
                {language === 'ar' ? 'المنح الجاهزة للنشر الفوري' : 'Scholarships Ready'}
              </span>
              <span className="text-3xl font-extrabold text-[#0F4B3A]">18</span>
              <span className="block text-[9px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded mt-2 mx-auto w-max">
                100% Complete
              </span>
            </div>

            <div className="border border-slate-100 p-4 rounded-xl text-center">
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider mb-1">
                {language === 'ar' ? 'ملفات الجامعات المتكاملة بنسبة كاملة' : 'Universities Ready'}
              </span>
              <span className="text-3xl font-extrabold text-[#0F4B3A]">5</span>
              <span className="block text-[9px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded mt-2 mx-auto w-max">
                Fully Accredited
              </span>
            </div>

            <div className="border border-slate-100 p-4 rounded-xl text-center">
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider mb-1">
                {language === 'ar' ? 'الدورات التحضيرية المعتمدة للنشر' : 'Prep Courses Ready'}
              </span>
              <span className="text-3xl font-extrabold text-[#0F4B3A]">9</span>
              <span className="block text-[9px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded mt-2 mx-auto w-max">
                Syllabus Verified
              </span>
            </div>

            <div className="border border-slate-100 p-4 rounded-xl text-center">
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider mb-1">
                {language === 'ar' ? 'الاختبارات الدولية ومستنداتها' : 'Standard Tests Synced'}
              </span>
              <span className="text-3xl font-extrabold text-[#0F4B3A]">3</span>
              <span className="block text-[9px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded mt-2 mx-auto w-max">
                API Standardized
              </span>
            </div>
          </div>
        </div>

        {/* SECTION E: SAFE QUICK LINKS (الروابط المختصرة الآمنة) */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-400 block uppercase tracking-wider mb-4 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-slate-400" />
            {language === 'ar' ? 'خامساً: الاختصارات الآمنة للتحكم الفردي بالخدمات' : 'V. Safe Quick Shortcuts to Individual Control Planes'}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Link 
              to="/admin/imports"
              className="bg-white border border-slate-100 hover:border-[#C8A24A] rounded-xl p-4 text-center flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow transition-all group cursor-pointer"
            >
              <div className="p-2 bg-teal-50 rounded-lg text-teal-600 group-hover:bg-[#0F4B3A]/5 transition-colors">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-700 block mt-1 leading-tight group-hover:text-[#0F4B3A]">
                {language === 'ar' ? 'إدارة الاستيراد' : 'Import Admin'}
              </span>
            </Link>

            <Link 
              to="/admin/review-queue"
              className="bg-white border border-slate-100 hover:border-[#C8A24A] rounded-xl p-4 text-center flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow transition-all group cursor-pointer"
            >
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600 group-hover:bg-[#0F4B3A]/5 transition-colors">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-700 block mt-1 leading-tight group-hover:text-[#0F4B3A]">
                {language === 'ar' ? 'طابور التدقيق' : 'Review Queue'}
              </span>
            </Link>

            <Link 
              to="/admin/scholarships"
              className="bg-white border border-slate-100 hover:border-[#C8A24A] rounded-xl p-4 text-center flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow transition-all group cursor-pointer"
            >
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 group-hover:bg-[#0F4B3A]/5 transition-colors">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-700 block mt-1 leading-tight group-hover:text-[#0F4B3A]">
                {language === 'ar' ? 'إدارة المنح' : 'Scholarships'}
              </span>
            </Link>

            <Link 
              to="/admin/universities"
              className="bg-white border border-slate-100 hover:border-[#C8A24A] rounded-xl p-4 text-center flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow transition-all group cursor-pointer"
            >
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600 group-hover:bg-[#0F4B3A]/5 transition-colors">
                <School className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-700 block mt-1 leading-tight group-hover:text-[#0F4B3A]">
                {language === 'ar' ? 'الجامعات' : 'Universities'}
              </span>
            </Link>

            <Link 
              to="/admin/health"
              className="bg-white border border-slate-100 hover:border-[#C8A24A] rounded-xl p-4 text-center flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow transition-all group cursor-pointer"
            >
              <div className="p-2 bg-green-50 rounded-lg text-green-600 group-hover:bg-[#0F4B3A]/5 transition-colors">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-700 block mt-1 leading-tight group-hover:text-[#0F4B3A]">
                {language === 'ar' ? 'صحة النظام' : 'Diagnostics'}
              </span>
            </Link>

            <Link 
              to="/admin/settings"
              className="bg-white border border-slate-100 hover:border-[#C8A24A] rounded-xl p-4 text-center flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow transition-all group cursor-pointer"
            >
              <div className="p-2 bg-gray-50 rounded-lg text-gray-600 group-hover:bg-[#0F4B3A]/5 transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-700 block mt-1 leading-tight group-hover:text-[#0F4B3A]">
                {language === 'ar' ? 'التحكم بالوصول' : 'Settings / RBAC'}
              </span>
            </Link>
          </div>
        </div>

        {/* SECTION F: SAFE ACTIVITY LOG (سجل التدقيق الرقابي والنشاطات) */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Activity className="w-4.5 h-4.5 text-slate-500" />
                {language === 'ar' ? 'سادساً: سجل النشاطات والعمليات الرقابية في المنصة' : 'VI. Safe Operational & Audit Activity Log'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {language === 'ar' 
                  ? 'سجل النشاطات محمي ضد الحذف أو التعديل المباشر لأغراض الامتثال الأمني.' 
                  : 'Audit trail records are read-only and cannot be altered or removed for data compliance.'}
              </p>
            </div>
            <span className="inline-block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {language === 'ar' ? 'مجموع السجلات: ٣ حركات' : 'Logs Count: 3'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-400 border-b border-slate-100">
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider">{language === 'ar' ? 'العملية والمصطلح' : 'Operation / Event'}</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider">{language === 'ar' ? 'النطاق / الحقل' : 'Domain Area'}</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider">{language === 'ar' ? 'المشرف المنفذ' : 'Actor / System'}</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider">{language === 'ar' ? 'الوقت' : 'Timestamp'}</th>
                  <th className="px-6 py-3.5 font-bold uppercase tracking-wider">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="px-6 py-3.5 font-bold text-center">{language === 'ar' ? 'التحكم الرقابي الآمن' : 'Safe Audit Controls'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/75 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{language === 'ar' ? 'مراجعة وتدقيق كورس تدريبي' : 'Review Imported Course'}</td>
                  <td className="px-6 py-4 font-semibold text-slate-500">{language === 'ar' ? 'الدورات' : 'Courses'}</td>
                  <td className="px-6 py-4 font-semibold text-slate-700">Admin-Wegdan</td>
                  <td className="px-6 py-4 font-semibold text-slate-500">2026-07-27 14:15</td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      {language === 'ar' ? 'ناجح' : 'Success'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedLog({
                          op: language === 'ar' ? 'مراجعة وتدقيق كورس تدريبي' : 'Review Imported Course',
                          domain: language === 'ar' ? 'الدورات التدريبية' : 'Courses',
                          actor: 'Admin-Wegdan',
                          time: '2026-07-27 14:15',
                          statusAr: 'ناجح',
                          statusEn: 'Success',
                          result: language === 'ar' 
                            ? 'تمت مطابقة معايير جودة المحاضرات وسلامة روابط التسجيل لـ [المسار المكثف لاجتياز اختبار آيلتس ٧.٥] وتم اعتماد كفاءة المدونة.' 
                            : 'Verified lecture schedules, course curriculum, and registrations links for IELTS prep course. Approved successfully.'
                        })}
                        className="px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 rounded-lg transition-colors cursor-pointer"
                      >
                        {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                      </button>
                      <button
                        disabled
                        className="px-2.5 py-1 text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded-lg cursor-not-allowed flex items-center gap-1"
                        title={language === 'ar' ? 'تتطلب دمج الإنتاج' : 'Requires production integration'}
                      >
                        <Lock className="w-3 h-3" />
                        {language === 'ar' ? 'إضافة ملاحظة' : 'Add Note'}
                      </button>
                    </div>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/75 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{language === 'ar' ? 'تصدير تقرير التدقيق المعماري' : 'Export Audit Report'}</td>
                  <td className="px-6 py-4 font-semibold text-slate-500">{language === 'ar' ? 'النظام' : 'System'}</td>
                  <td className="px-6 py-4 font-semibold text-slate-700">Admin-Wegdan</td>
                  <td className="px-6 py-4 font-semibold text-slate-500">2026-07-27 13:40</td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      {language === 'ar' ? 'ناجح' : 'Success'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedLog({
                          op: language === 'ar' ? 'تصدير تقرير التدقيق المعماري' : 'Export Audit Report',
                          domain: language === 'ar' ? 'بنية وحوكمة النظام' : 'System',
                          actor: 'Admin-Wegdan',
                          time: '2026-07-27 13:40',
                          statusAr: 'ناجح',
                          statusEn: 'Success',
                          result: language === 'ar' 
                            ? 'تم توليد وتنزيل التقرير الشامل لبيانات الامتثال لمحددات الاستيراد وجودة سجلات المنح بنجاح بصيغة PDF.' 
                            : 'Generated complete system integration and import compliance report structured as clean PDF.'
                        })}
                        className="px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 rounded-lg transition-colors cursor-pointer"
                      >
                        {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                      </button>
                      <button
                        disabled
                        className="px-2.5 py-1 text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded-lg cursor-not-allowed flex items-center gap-1"
                      >
                        <Lock className="w-3 h-3" />
                        {language === 'ar' ? 'إضافة ملاحظة' : 'Add Note'}
                      </button>
                    </div>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/75 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{language === 'ar' ? 'محاولة استيراد خاطئة' : 'Failed Import Attempt'}</td>
                  <td className="px-6 py-4 font-semibold text-slate-500">{language === 'ar' ? 'المنح' : 'Scholarships'}</td>
                  <td className="px-6 py-4 font-semibold text-slate-700">Admin-System</td>
                  <td className="px-6 py-4 font-semibold text-slate-500">2026-07-27 11:20</td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700">
                      {language === 'ar' ? 'فشل' : 'Failed'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedLog({
                          op: language === 'ar' ? 'محاولة استيراد خاطئة' : 'Failed Import Attempt',
                          domain: language === 'ar' ? 'المنح الدراسية' : 'Scholarships',
                          actor: 'Admin-System',
                          time: '2026-07-27 11:20',
                          statusAr: 'فشل',
                          statusEn: 'Failed',
                          result: language === 'ar' 
                            ? 'الحدث: فشل استيراد ٣ حقول رئيسية متعلقة بنسب القبول وتصنيف شروط المنحة الألمانية. تم توجيه السجل إلى قائمة التدقيق والإنذار.' 
                            : 'Error: Failed to import 3 core fields regarding equivalent language certificates and eligibility of German grants. Sent to correction log.'
                        })}
                        className="px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 rounded-lg transition-colors cursor-pointer"
                      >
                        {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                      </button>
                      <button
                        disabled
                        className="px-2.5 py-1 text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded-lg cursor-not-allowed flex items-center gap-1"
                      >
                        <Lock className="w-3 h-3" />
                        {language === 'ar' ? 'إضافة ملاحظة' : 'Add Note'}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/20 text-center text-slate-400">
            <p className="text-[11px] font-semibold">
              {language === 'ar' 
                ? 'ملاحظة أمنية: لا توجد أي أدوات لحذف السجلات الرقابية أو تعديل النشاطات لحفظ النزاهة المعمارية لنظام منارتك ٢.٠.' 
                : 'Security Notice: Audit trails cannot be altered, archived or deleted directly in order to preserve absolute system integrity.'}
            </p>
          </div>
        </div>

        {/* SECTION G: DEMOTED / PENDING OPERATIONS (غرفة العمليات المعلقة) */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <div className="flex items-start gap-3.5 mb-5 text-right">
            <div className="p-2 bg-amber-50 rounded-xl text-amber-700">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm">
                {language === 'ar' ? 'غرفة العمليات الحساسة المعلقة والمحمية (قيد الحوكمة)' : 'Protected High-Risk Operations Room (Governance Enforced)'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {language === 'ar' 
                  ? 'تم تجميد وحجب هذه العمليات عالية المخاطر من لوحة القيادة العامة للوقاية من التغييرات الفوضوية غير المرغوبة. لإطلاقها، تحتاج هذه البوابات إلى دمج كامل لخدمات الإنتاج أو التحقق من هوية المشرفين عبر مسار موافقة صارم.'
                  : 'High-risk execution pipelines are demoted and disabled from the primary control panel to prevent operational chaos. Running these tasks requires multi-layer approvals, dedicated production integrations, or cryptographic keys.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200 opacity-75 rounded-xl p-5 flex flex-col justify-between h-40 text-right">
              <div className="flex items-center justify-between">
                <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                  <Database className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                  {language === 'ar' ? 'يتطلب وحدة مخصصة' : 'Requires Dedicated Module'}
                </span>
              </div>
              <div className="mt-3">
                <h5 className="font-bold text-slate-600 text-xs mb-1">
                  {language === 'ar' ? 'أخذ نسخ احتياطي كامل وفوري للنظام' : 'Immediate System-Wide Database Backup'}
                </h5>
                <p className="text-[10px] text-slate-400 leading-normal">
                  {language === 'ar' ? 'يجب تشغيلها فقط ضمن خادم سحابي مستقل متصل بنظام الأرشفة الدورية لتفادي العبء.' : 'Dedicated database snapshot trigger isolated within production cron setups.'}
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 opacity-75 rounded-xl p-5 flex flex-col justify-between h-40 text-right">
              <div className="flex items-center justify-between">
                <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                  <Bell className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  {language === 'ar' ? 'يتطلب مسار موافقة' : 'Requires Approval Workflow'}
                </span>
              </div>
              <div className="mt-3">
                <h5 className="font-bold text-slate-600 text-xs mb-1">
                  {language === 'ar' ? 'إرسال تنبيه جماعي عبر البريد لجميع المشتركين' : 'Broadcast Announcement to All Students'}
                </h5>
                <p className="text-[10px] text-slate-400 leading-normal">
                  {language === 'ar' ? 'يحتاج إطلاق البريد الجماعي لمراجعة لغوية مستقلة، وموافقة مدير الاتصال لسلامة السمعة.' : 'Mass broadcast requires editorial review and multi-agent approval cycles.'}
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 opacity-75 rounded-xl p-5 flex flex-col justify-between h-40 text-right">
              <div className="flex items-center justify-between">
                <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {language === 'ar' ? 'يتطلب دمج الإنتاج' : 'Requires Production Integration'}
                </span>
              </div>
              <div className="mt-3">
                <h5 className="font-bold text-slate-600 text-xs mb-1">
                  {language === 'ar' ? 'تعديل نسب وأوزان المطابقة بالذكاء الاصطناعي' : 'Adjust AI Recommendation Match Weights'}
                </h5>
                <p className="text-[10px] text-slate-400 leading-normal">
                  {language === 'ar' ? 'يجب معايرتها واختبار استقرارها داخل بيئة تجريبية معزولة Sandbox ومطابقة نتائجها أولاً.' : 'AI weight adjustment is locked until model simulation parameters are fully checked.'}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }

  const sectionData = getSectionMetadata();

  return (
    <div className="max-w-6xl mx-auto py-8 px-4" dir={dir}>
      
      {/* Floating Feedback Toast */}
      {activeToast.show && (
        <div className="fixed bottom-6 right-6 left-6 md:left-auto md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[#0F4B3A] border border-[#C8A24A]/30 text-white p-4 rounded-xl shadow-lg flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#C8A24A] flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm font-semibold leading-relaxed">
              {activeToast.msg}
            </div>
            <button 
              onClick={() => setActiveToast(prev => ({ ...prev, show: false }))}
              className="text-white/70 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header and Back Link */}
      <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F4B3A] hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-[#0F4B3A]/10 transition-colors mb-6">
        <ArrowLeft className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
        {t('back_to_admin') || 'العودة للوحة القيادة'}
      </Link>

      <div className="mb-8 flex items-start justify-between flex-wrap gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-1.5 bg-[#0F4B3A]/5 rounded-lg">
              {sectionData.icon}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{title}</h1>
          </div>
          <p className="text-slate-600 text-sm max-w-2xl">{description}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#C8A24A]/10 text-[#a37f2e] border border-[#C8A24A]/20">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          {language === 'ar' ? 'واجهة معاينة الأدوات للمرحلة ٢-٣' : 'Phase 2-3 Tools Mockup'}
        </span>
      </div>

      {/* 1. SECTION SPECIFIC STATS CARDS (بوابات المقاييس التشغيلية) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {sectionData.metrics.map((metric, idx) => (
          <div 
            key={idx} 
            className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all"
          >
            <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-1">
              {metric.label}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#0F4B3A]">
                {metric.value}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-lg border border-emerald-100/30">
                {metric.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 2. SPECIFICATION PHASE 2-3 REAL OPERATIONS BUTTONS (أزرار إجراءات المرحلة ٣ للوحة) */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#C8A24A]" />
          {language === 'ar' ? 'العمليات والإجراءات الأساسية (الوثيقة الفنية للمرحلة ٢-٣)' : 'Core Section Actions (Phase 2-3 Technical Document)'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {sectionData.actions.map((act, i) => (
            <button
              key={i}
              onClick={() => triggerButtonAction(act.nameAr, act.nameEn, act.descAr, act.descEn)}
              className="bg-white border border-slate-100 hover:border-[#0F4B3A]/30 rounded-2xl p-5 text-right flex flex-col gap-3 transition-all cursor-pointer hover:shadow-sm group active:scale-[0.99]"
            >
              <div className="flex items-center justify-between w-full">
                <div className="p-2 bg-emerald-50/50 rounded-xl group-hover:bg-[#0F4B3A]/5 transition-colors">
                  {act.icon}
                </div>
                <span className="text-[10px] font-bold text-[#C8A24A] bg-[#C8A24A]/10 px-2 py-0.5 rounded-full">
                  {language === 'ar' ? 'معاينة تفعيل' : 'Trigger Action'}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm group-hover:text-[#0F4B3A] transition-colors mb-1">
                  {language === 'ar' ? act.nameAr : act.nameEn}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {language === 'ar' ? act.descAr : act.descEn}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. SIMULATED INTERACTIVE RECORDS LISTING AND FILTERS (جدول تصفية ومعاينة السجلات الحية) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between gap-4 flex-wrap">
          <h4 className="font-bold text-slate-800 text-sm">
            {language === 'ar' ? 'سجل السجلات والتحديثات المجدولة' : 'Logged Registry Entries & Updates'}
          </h4>
          
          <div className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === 'ar' ? 'بحث وتصفية سريعة...' : 'Quick search...'}
                className="w-full text-xs pr-9 pl-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white transition-colors focus:outline-none focus:ring-1 focus:ring-[#0F4B3A] focus:border-[#0F4B3A]"
              />
            </div>
            
            <button
              onClick={() => {
                setActiveToast({
                  show: true,
                  msg: language === 'ar' ? 'تم تحديث وجلب البيانات الطازجة من السيرفر' : 'Data cache refreshed successfully',
                  type: 'success'
                });
              }}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title={language === 'ar' ? 'تحديث السجلات' : 'Refresh list'}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The data table structure */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50/75 text-slate-500 border-b border-slate-100">
                {sectionData.tableHeader.map((headerText, i) => (
                  <th key={i} className="px-6 py-3.5 font-bold uppercase tracking-wider">{headerText}</th>
                ))}
                <th className="px-6 py-3.5 font-bold text-center">{language === 'ar' ? 'التحكم' : 'Controls'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sectionData.tableRows
                .filter(row => row.some(col => col.toLowerCase().includes(searchTerm.toLowerCase())))
                .map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-emerald-50/10 transition-colors">
                    {row.map((colText, colIdx) => (
                      <td key={colIdx} className="px-6 py-4 font-semibold text-slate-700">
                        {colText}
                      </td>
                    ))}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => triggerButtonAction('معاينة السجل السريعة', 'Quick View Entry', 'سيقوم بفتح صفحة المعاينة العامة للعنصر المسجل.', 'Displays complete metadata layout for selected item.')}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          title={language === 'ar' ? 'عرض البيانات' : 'View'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => triggerButtonAction('تعديل فوري للبيانات', 'Edit Entry Details', 'يفتح نافذة التحرير والصياغة للمتغيرات المسجلة.', 'Launches editable fields form popup overlay.')}
                          className="p-1 text-amber-600 hover:bg-amber-50 rounded transition-colors cursor-pointer"
                          title={language === 'ar' ? 'تعديل السجل' : 'Edit'}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => triggerButtonAction('حذف العنصر نهائياً', 'Delete Entry Permanently', 'إلغاء وحذف السجل من قاعدة البيانات بشكل كامل ومؤرشف.', 'Archive and execute immediate deletion from database.')}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title={language === 'ar' ? 'حذف السجل' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/20 text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            {language === 'ar' 
              ? 'تنويه: جميع السجلات المعروضة أعلاه هي بيانات محاكاة تفاعلية لتوضيح آلية عمل النظام وتصميمها النهائي للمرحلة ٢-٣.' 
              : 'Notice: All records rendered above are simulated data points modeling the operational state for Phase 2-3.'}
          </p>
        </div>
      </div>

    </div>
  );
}
