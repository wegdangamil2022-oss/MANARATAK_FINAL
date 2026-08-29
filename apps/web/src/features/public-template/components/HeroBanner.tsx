import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface HeroBannerProps {
  onExploreClick: () => void;
  onOpenAiHelper?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreClick }) => {
  return (
    <div className="w-full my-2.5 px-0.5 sm:px-1">
      {/* Compact Proportional Hero Card Container */}
      <div className="relative w-full overflow-hidden shadow-sm border border-[var(--mn-accent)]/25 rounded-2xl group bg-[var(--mn-primary)]">
        {/* Background Image: Scaled to a compact, well-proportioned height */}
        <div className="relative h-44 sm:h-52 md:h-56 w-full overflow-hidden bg-slate-950">
          <img
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
            alt="طالب متخرج في الحرم الجامعي"
            className="w-full h-full object-cover object-[20%_center] sm:object-center transform group-hover:scale-102 transition-transform duration-700 filter brightness-95"
            referrerPolicy="no-referrer"
            loading="eager"
          />

          {/* Vignette Gradient: Soft shadow on text side, leaves student visible */}
          <div className="absolute inset-0 bg-gradient-to-l from-[var(--mn-primary)]/95 via-[var(--mn-secondary)]/70 to-transparent pointer-events-none" />

          {/* Content Layer: Compact layout */}
          <div className="absolute inset-0 flex flex-col justify-center items-start p-3.5 sm:p-5 md:p-6 z-10 rtl:items-start ltr:items-end">
            {/* Elegant Slim High-Contrast Card */}
            <div className="max-w-[240px] sm:max-w-[280px] md:max-w-xs text-right rtl:text-right ltr:text-left backdrop-blur-md p-2.5 sm:p-3.5 rounded-xl bg-black/45 border border-white/15 shadow-lg">
              {/* Compact Headline */}
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-wide leading-tight mb-1 drop-shadow-md font-['Cairo',sans-serif]">
                مستقبلك الأكاديمي يبدأ
                <span className="inline-block mx-1 text-[var(--mn-accent-text)] font-extrabold">
                  من هنا
                </span>
              </h2>

              {/* Compact Subtitle */}
              <p className="text-[10px] sm:text-[11px] text-slate-200 font-medium leading-tight mb-2 drop-shadow-xs font-['Cairo',sans-serif] line-clamp-2">
                اكتشف آلاف المنح والفرص التعليمية من أفضل جامعات العالم
              </p>

              {/* Compact Golden Action Button */}
              <button
                id="btn-hero-explore"
                onClick={onExploreClick}
                className="w-auto px-3.5 py-1.5 sm:py-2 rounded-lg bg-[var(--mn-accent)] hover:bg-[#b58f38] text-slate-950 font-bold text-[11px] sm:text-xs shadow-sm hover:shadow-[var(--mn-accent)]/30 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer font-['Cairo',sans-serif]"
              >
                <span>اكتشف الفرص</span>
                <ArrowLeft className="w-3 h-3 text-slate-950" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
