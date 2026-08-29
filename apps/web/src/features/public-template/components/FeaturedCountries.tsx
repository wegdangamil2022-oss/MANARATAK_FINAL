import React from 'react';
import { Globe, ChevronLeft } from 'lucide-react';

interface DestinationBubble {
  id: string;
  name: string;
  flag: string;
  scholarshipsCount: number;
  imageUrl: string;
}

const DESTINATION_BUBBLES: DestinationBubble[] = [
  {
    id: 'المملكة المتحدة',
    name: 'بريطانيا',
    flag: '🇬🇧',
    scholarshipsCount: 45,
    imageUrl:
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=400&q=80', // Big Ben London
  },
  {
    id: 'ألمانيا',
    name: 'ألمانيا',
    flag: '🇩🇪',
    scholarshipsCount: 38,
    imageUrl:
      'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=400&q=80', // Berlin
  },
  {
    id: 'الصين',
    name: 'الصين',
    flag: '🇨🇳',
    scholarshipsCount: 32,
    imageUrl:
      'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=400&q=80', // Great Wall / Beijing
  },
  {
    id: 'تركيا',
    name: 'تركيا',
    flag: '🇹🇷',
    scholarshipsCount: 28,
    imageUrl:
      'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=400&q=80', // Istanbul
  },
  {
    id: 'كندا',
    name: 'كندا',
    flag: '🇨🇦',
    scholarshipsCount: 24,
    imageUrl:
      'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=400&q=80', // Canada
  },
  {
    id: 'فرنسا',
    name: 'فرنسا',
    flag: '🇫🇷',
    scholarshipsCount: 21,
    imageUrl:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80', // Paris Eiffel
  },
  {
    id: 'السعودية',
    name: 'السعودية',
    flag: '🇸🇦',
    scholarshipsCount: 19,
    imageUrl:
      'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=400&q=80', // Saudi
  },
  {
    id: 'اليابان',
    name: 'اليابان',
    flag: '🇯🇵',
    scholarshipsCount: 16,
    imageUrl:
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80', // Tokyo
  },
];

interface FeaturedCountriesProps {
  onSelectCountry: (countryName: string) => void;
  onViewAllClick: () => void;
}

export const FeaturedCountries: React.FC<FeaturedCountriesProps> = ({
  onSelectCountry,
  onViewAllClick,
}) => {
  return (
    <section
      id="featured-countries-section"
      className="px-0.5 sm:px-1 py-3 w-full font-['Cairo',sans-serif]"
    >
      {/* Standard Framed Container with top accent border only */}
      <div className="relative rounded-3xl p-3.5 sm:p-4 bg-gradient-to-b from-[var(--mn-surface)] to-slate-50/80 border border-slate-200/90 shadow-sm border-t-2 border-t-[var(--mn-primary)]/40 overflow-hidden">
        {/* Content Inside the Framed Section */}
        <div className="relative z-10">
          {/* Centered Section Title */}
          <div className="text-center mb-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 inline-flex items-center justify-center gap-1.5">
              <Globe className="w-4 h-4 text-[var(--mn-accent-text)]" />
              <span>أشهر وجهات الدراسة والابتعاث</span>
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-600 font-medium mt-1 max-w-xs mx-auto font-['Cairo',sans-serif]">
              اكتشف أفضل الدول للدراسة في الخارج وتعرف على ثقافاتها والفرص التعليمية المتاحة بها.
            </p>
          </div>

          {/* Fixed 4x2 Grid with Larger Bubbles & High Contrast Typography */}
          <div className="grid grid-cols-4 gap-y-3.5 gap-x-2 sm:gap-x-3.5 w-full">
            {DESTINATION_BUBBLES.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectCountry(item.id)}
                className="group flex flex-col items-center cursor-pointer active:scale-95 transition-all text-center"
              >
                {/* Larger Circular Ring & Photo with Flag Badge */}
                <div className="relative mb-1.5">
                  {/* Outer Golden-Emerald Gradient Ring */}
                  <div className="w-[66px] h-[66px] sm:w-[78px] sm:h-[78px] rounded-full p-[2.5px] bg-gradient-to-tr from-[var(--mn-accent)] via-[var(--mn-secondary)] to-[var(--mn-secondary)] shadow-xs group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-slate-900">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Country Flag Badge Pin (Prominent & Elevated) */}
                  <div className="absolute -bottom-0.5 -right-0.5 bg-[var(--mn-surface)] rounded-full w-6 h-6 sm:w-6.5 sm:h-6.5 shadow-xs border border-slate-100 flex items-center justify-center">
                    <span className="text-xs sm:text-sm leading-none">{item.flag}</span>
                  </div>
                </div>

                {/* Country Name (Bigger & Bolder) */}
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[var(--mn-heading)] transition-colors truncate max-w-full leading-tight mb-0.5">
                  {item.name}
                </h4>

                {/* Opportunity Count Badge (Clear & Visible) */}
                <span className="text-[9px] sm:text-[10px] text-[var(--mn-heading)] font-bold bg-[var(--mn-primary)]/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {item.scholarshipsCount} فرصة
                </span>
              </div>
            ))}
          </div>

          {/* View All Countries Button Placed Below */}
          <div className="mt-3.5 flex justify-center">
            <button
              id="btn-view-all-countries"
              onClick={onViewAllClick}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-[var(--mn-surface)] hover:bg-[var(--mn-accent)]/10 text-[var(--mn-heading)] border border-[var(--mn-accent)]/50 rounded-full text-xs sm:text-sm font-bold transition-all shadow-[0_0_15px_rgba(200,162,74,0.3)] hover:shadow-[0_0_25px_rgba(200,162,74,0.5)] animate-pulse hover:animate-none active:scale-95 font-['Cairo',sans-serif]"
            >
              <span>تصفح جميع الوجهات والدول</span>
              <ChevronLeft className="w-4 h-4 text-[var(--mn-heading)] transition-transform group-hover:-translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
