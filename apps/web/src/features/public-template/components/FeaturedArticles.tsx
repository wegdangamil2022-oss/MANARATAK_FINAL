import React from 'react';
import { Newspaper, Clock, ArrowUpLeft, ChevronLeft } from 'lucide-react';

const MOCK_ARTICLES = [
  {
    id: 1,
    title: 'كيف تكتب خطاب دافع (Motivation Letter) يضمن لك القبول؟',
    summary:
      'دليلك الشامل لخطوات كتابة خطاب دافع احترافي يعكس شخصيتك الأكاديمية ويقنع لجان القبول في الجامعات العالمية.',
    category: 'نصائح قبول',
    readTime: '5 دقائق',
    image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600',
    isFeatured: true,
  },
  {
    id: 2,
    title: 'أهم 5 منح دراسية ممولة بالكامل في أوروبا لعام 2024',
    category: 'دليل المنح',
    readTime: '3 دقائق',
    image:
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600',
    isFeatured: false,
  },
  {
    id: 3,
    title: 'الفرق بين اختباري IELTS و TOEFL وأيهما الأنسب لك؟',
    category: 'اختبارات اللغة',
    readTime: '4 دقائق',
    image:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600',
    isFeatured: false,
  },
];

interface FeaturedArticlesProps {
  onViewAllClick: () => void;
}

export const FeaturedArticles: React.FC<FeaturedArticlesProps> = ({ onViewAllClick }) => {
  const featuredArticle = MOCK_ARTICLES.find((a) => a.isFeatured)!;
  const standardArticles = MOCK_ARTICLES.filter((a) => !a.isFeatured);

  return (
    <section
      id="featured-articles-section"
      className="px-0.5 sm:px-1 py-3 w-full font-['Cairo',sans-serif]"
    >
      {/* Container with top accent border */}
      <div className="relative rounded-3xl p-3.5 sm:p-4 bg-gradient-to-b from-[var(--mn-surface)] to-slate-50/80 border border-slate-200/90 shadow-sm border-t-2 border-t-[var(--mn-primary)]/40 overflow-hidden">
        <div className="relative z-10">
          {/* Centered Section Title */}
          <div className="text-center mb-5">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 inline-flex items-center justify-center gap-1.5">
              <Newspaper className="w-4 h-4 text-[var(--mn-heading)]" />
              <span>منصة المعرفة والمقالات</span>
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-600 font-medium mt-0.5 max-w-xs mx-auto">
              أحدث النصائح والأدلة الشاملة لرحلتك الدراسية
            </p>
          </div>

          {/* Horizontal Scrollable Articles List */}
          <div className="flex overflow-x-auto pb-4 -mx-1 px-1 gap-3 snap-x snap-mandatory no-scrollbar">
            {MOCK_ARTICLES.map((article) => (
              <div
                key={article.id}
                className="snap-start shrink-0 w-[160px] sm:w-[180px] group flex flex-col rounded-2xl bg-[var(--mn-surface)] border border-slate-100 hover:border-[var(--mn-accent)]/40 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Thumbnail Header */}
                <div className="w-full h-24 sm:h-28 relative overflow-hidden bg-slate-100">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {/* Category Badge on top of image */}
                  <div className="absolute top-2 right-2 bg-[var(--mn-surface-elevated)]/90 backdrop-blur-sm text-[var(--mn-heading)] text-[8px] sm:text-[9px] font-bold px-2 py-1 rounded-full shadow-sm">
                    {article.category}
                  </div>
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
                </div>

                {/* Content Body */}
                <div className="flex flex-col p-2.5 sm:p-3 flex-1">
                  <h4 className="font-bold text-[11px] sm:text-xs text-slate-800 leading-snug line-clamp-2 group-hover:text-[var(--mn-heading)] transition-colors mb-2">
                    {article.title}
                  </h4>
                  {article.isFeatured && (
                    <p className="text-[9px] sm:text-[10px] text-slate-500 line-clamp-2 mb-2.5 leading-relaxed hidden sm:block">
                      {article.summary}
                    </p>
                  )}

                  {/* Footer (Time & Icon) */}
                  <div className="mt-auto flex items-center justify-between pt-1.5 border-t border-slate-50">
                    <span className="flex items-center gap-1 text-slate-400 text-[8px] sm:text-[9px]">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </span>
                    <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[var(--mn-primary)] transition-colors">
                      <ArrowUpLeft className="w-2.5 h-2.5 text-slate-400 group-hover:text-white" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="mt-1 flex justify-center">
            <button
              onClick={onViewAllClick}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-[var(--mn-surface)] hover:bg-[var(--mn-accent)]/10 text-[var(--mn-heading)] border border-[var(--mn-accent)]/50 rounded-full text-xs sm:text-sm font-bold transition-all shadow-[0_0_15px_rgba(200,162,74,0.3)] hover:shadow-[0_0_25px_rgba(200,162,74,0.5)] animate-pulse hover:animate-none active:scale-95 font-['Cairo',sans-serif]"
            >
              <span>المزيد من المقالات</span>
              <ChevronLeft className="w-4 h-4 text-[var(--mn-heading)] transition-transform group-hover:-translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
