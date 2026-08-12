import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/I18nProvider';
import { 
  FileText, Search, Plus, Filter, ArrowLeft, ArrowRight, 
  ExternalLink, CheckCircle2, AlertCircle, Clock, ShieldAlert, Sparkles
} from 'lucide-react';

export function AdminCmsArticlesPreviewPage() {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Sample Articles Data
  const [articles, setArticles] = useState([
    {
      id: 'art_101',
      titleAr: 'دليل الشامل للتقديم على المنح الدراسية التركية المباشرة YTB 2026',
      titleEn: 'Comprehensive Guide to YTB Turkish Scholarships 2026',
      contentType: 'STUDY_GUIDE',
      contentTypeLabelAr: 'دليل دراسي (Study Guide)',
      categoryAr: 'منح وقبولات',
      language: 'ar',
      status: 'PUBLISHED',
      updatedAt: '2026-07-28 09:15',
      author: 'فريق التحرير الأكاديمي'
    },
    {
      id: 'art_102',
      titleAr: 'كيفية كتابة خطاب الدافع المتميز (Motivation Letter) للجامعات الألمانية',
      titleEn: 'How to Write a Winning Motivation Letter for German Universities',
      contentType: 'ARTICLE',
      contentTypeLabelAr: 'مقال تحريري (Article)',
      categoryAr: 'نصائح القبول',
      language: 'ar',
      status: 'IN_REVIEW',
      updatedAt: '2026-07-27 16:40',
      author: 'مستشار التحرير'
    },
    {
      id: 'art_103',
      titleAr: 'قائمة التحقق الميدانية قبل السفر والدراسة في المملكة المتحدة',
      titleEn: 'Pre-departure Checklist for International Students in the UK',
      contentType: 'CHECKLIST',
      contentTypeLabelAr: 'قائمة تحقق (Checklist)',
      categoryAr: 'الحياة الطلابية',
      language: 'ar',
      status: 'DRAFT',
      updatedAt: '2026-07-26 11:20',
      author: 'محرر الشؤون الطلابية'
    },
    {
      id: 'art_104',
      titleAr: 'تحديثات معايير الكفاءة اللغوية المطلوبة باختبار IELTS لعام 2026',
      titleEn: '2026 Updated Language Proficiency IELTS Requirements',
      contentType: 'NEWS',
      contentTypeLabelAr: 'خبر صحفي (News)',
      categoryAr: 'اختبارات دولية',
      language: 'ar',
      status: 'PUBLISHED',
      updatedAt: '2026-07-25 14:00',
      author: 'قسم الأخبار الأكاديمية'
    },
    {
      id: 'art_105',
      titleAr: 'مقارنة شاملة بين تخصص الذكاء الاصطناعي وهندسة البرمجيات',
      titleEn: 'Comprehensive Comparison: AI vs Software Engineering',
      contentType: 'ARTICLE',
      contentTypeLabelAr: 'مقال تحريري (Article)',
      categoryAr: 'توجيه أكاديمي',
      language: 'ar',
      status: 'READY_TO_PUBLISH',
      updatedAt: '2026-07-24 10:05',
      author: 'فريق التوجيه المهني'
    }
  ]);

  const filteredArticles = articles.filter(art => {
    const matchesSearch = art.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || art.status === selectedStatus;
    const matchesType = selectedType === 'ALL' || art.contentType === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 dir-rtl">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <button onClick={() => navigate('/admin/cms')} className="hover:text-emerald-600">إدارة المحتوى (CMS)</button>
            <span>/</span>
            <span className="text-emerald-600 font-medium">المقالات والأدلة الدراسية</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            <span>قائمة المقالات والأدلة التحريرية (Articles & Guides)</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مقال جديد (Add Article)</span>
          </button>
        </div>
      </div>

      {/* Boundary Reminder Banner */}
      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center gap-3 text-xs text-amber-900 dark:text-amber-300">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <span>المقالات هنا محتوى تحريري تسويقي وتثقيفي فقط. لا يمكن تعديل سجلات المنح أو الجامعات المرفقة من هذه القائمة.</span>
      </div>

      {/* Controls & Search Filter Bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute right-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالعنوان أو المرجع..."
            className="w-full pr-9 pl-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Content Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            <option value="ALL">جميع أنواع المحتوى</option>
            <option value="ARTICLE">مقال تحريري (Article)</option>
            <option value="STUDY_GUIDE">دليل دراسي (Study Guide)</option>
            <option value="NEWS">خبر صحفي (News)</option>
            <option value="CHECKLIST">قائمة تحقق (Checklist)</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            <option value="ALL">جميع الحالات</option>
            <option value="DRAFT">مسودة (Draft)</option>
            <option value="IN_REVIEW">قيد المراجعة (In Review)</option>
            <option value="READY_TO_PUBLISH">جاهز للنشر (Ready)</option>
            <option value="PUBLISHED">منشور (Published)</option>
            <option value="ARCHIVED">مؤرشف (Archived)</option>
          </select>
        </div>
      </div>

      {/* Lightweight Vertical Table-like List */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {filteredArticles.map((art) => (
            <div 
              key={art.id}
              className="p-4 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] text-gray-400">{art.id}</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {art.contentTypeLabelAr}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    {art.categoryAr}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                  {art.titleAr}
                </h3>

                <p className="text-xs text-gray-500 dir-ltr text-right">
                  {art.titleEn}
                </p>
              </div>

              {/* Status & Action */}
              <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                <div className="text-xs space-y-1 text-left md:text-right">
                  <div>
                    {art.status === 'PUBLISHED' && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        منشور (Published)
                      </span>
                    )}
                    {art.status === 'IN_REVIEW' && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        قيد المراجعة (In Review)
                      </span>
                    )}
                    {art.status === 'DRAFT' && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        مسودة (Draft)
                      </span>
                    )}
                    {art.status === 'READY_TO_PUBLISH' && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                        جاهز للنشر (Ready)
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{art.updatedAt}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/admin/cms/articles/${art.id}`)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-gray-700 dark:text-gray-300 hover:text-emerald-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <span>عرض التفاصيل</span>
                  <ArrowIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Adding Article */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-gray-900 dark:text-white text-base border-b border-gray-100 dark:border-gray-800 pb-3">
              إضافة مقال تحريري جديد (Create New Article Draft)
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-500 mb-1 font-medium">عنوان المقال بالعربية:</label>
                <input 
                  type="text" 
                  placeholder="مثال: دليل التقديم على المنح التركية 2026..." 
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1 font-medium">نوع المحتوى:</label>
                <select className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option value="ARTICLE">مقال تحريري (Article)</option>
                  <option value="STUDY_GUIDE">دليل دراسي (Study Guide)</option>
                  <option value="NEWS">خبر صحفي (News)</option>
                  <option value="CHECKLIST">قائمة تحقق (Checklist)</option>
                </select>
              </div>

              <p className="text-gray-500 leading-relaxed pt-1">
                سيتم حفظ السجل كمسودة أولية (Draft) ويمكن استكمال المحتوى الغني، تحسين محركات البحث SEO، وإضافة أصول EAP عبر الشاشة التفصيلية.
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-medium"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  navigate('/admin/cms/articles/art_new');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
              >
                إنشاء والذهاب للتفاصيل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
