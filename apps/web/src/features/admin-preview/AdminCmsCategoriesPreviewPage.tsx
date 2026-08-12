import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/I18nProvider';
import { 
  Tag, Search, Plus, ArrowLeft, ArrowRight, ShieldAlert, FolderTree
} from 'lucide-react';

export function AdminCmsCategoriesPreviewPage() {
  const navigate = useNavigate();
  const { isRTL } = useTranslation();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([
    { id: 'cat_10', nameAr: 'منح وقبولات', nameEn: 'Scholarships & Admissions', slug: 'scholarships-admissions', count: 48, status: 'ACTIVE' },
    { id: 'cat_11', nameAr: 'نصائح القبول', nameEn: 'Admission Tips', slug: 'admission-tips', count: 26, status: 'ACTIVE' },
    { id: 'cat_12', nameAr: 'الحياة الطلابية', nameEn: 'Student Life', slug: 'student-life', count: 19, status: 'ACTIVE' },
    { id: 'cat_13', nameAr: 'اختبارات دولية', nameEn: 'International Tests', slug: 'international-tests', count: 14, status: 'ACTIVE' },
    { id: 'cat_14', nameAr: 'توجيه أكاديمي', nameEn: 'Academic Guidance', slug: 'academic-guidance', count: 17, status: 'ACTIVE' }
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 dir-rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <button onClick={() => navigate('/admin/cms')} className="hover:text-emerald-600">إدارة المحتوى (CMS)</button>
            <span>/</span>
            <span className="text-emerald-600 font-medium">التصنيفات والوسوم التحريرية</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Tag className="w-6 h-6 text-purple-600" />
            <span>تصنيفات ووسوم المحتوى التحريري (Editorial Taxonomy)</span>
          </h1>
        </div>

        <button className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors">
          <Plus className="w-4 h-4" />
          <span>إضافة تصنيف تحريري جديد</span>
        </button>
      </div>

      {/* Boundary Reminder Banner */}
      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center gap-3 text-xs text-amber-900 dark:text-amber-300">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <span>تصنيفات CMS مخصصة لتنظيم المقالات والأدلة التحريرية فقط، ولا تستبدل التصنيفات الأكاديمية للدول والجامعات والتخصصات التابعة للـ Core Taxonomy (Phase 08).</span>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute right-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في التصنيفات..."
            className="w-full pr-9 pl-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {categories.map((cat) => (
            <div key={cat.id} className="p-4 flex items-center justify-between text-xs hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-gray-400">{cat.id}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{cat.nameAr}</span>
                  <span className="text-gray-400">({cat.nameEn})</span>
                </div>
                <p className="font-mono text-[11px] text-gray-500 dir-ltr text-right">slug: {cat.slug}</p>
              </div>

              <div className="flex items-center gap-4">
                <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-semibold text-[11px]">
                  {cat.count} عنصر مرتبط
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                  نشط (Active)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
