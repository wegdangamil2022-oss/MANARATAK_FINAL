import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = '', showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 select-none sm:gap-4 ${className}`}>
      {/* 2. شكل وحجم إطار اللوجو (Circle Container) */}
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border border-gray-100 bg-white p-0 shadow-sm sm:h-20 sm:w-20 md:h-24 md:w-24">
        {/* Dynamic, pixel-perfect vector representation of the green-gold lighthouse logo, acting as object-cover fitting 100% */}
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full rounded-full object-cover flex-shrink-0"
        >
          {/* Deep Green Base Circle - using the #0F4B3A olive green specified */}
          <circle cx="60" cy="60" r="58" fill="#0b3763" />
          
          {/* Double Gold Ring Border - using #C8A24A gold specified */}
          <circle cx="60" cy="60" r="54" stroke="#C8A24A" strokeWidth="1.5" strokeOpacity="0.95" />
          <circle cx="60" cy="60" r="51.5" stroke="#C8A24A" strokeWidth="0.75" strokeOpacity="0.6" />

          {/* Golden Light Beam stretching to the right */}
          <path
            d="M48 36 L110 24 C114 36 114 44 110 52 L48 40 Z"
            fill="url(#lightBeamGrad)"
            opacity="0.8"
          />

          {/* The Monogram 'M' and Lighthouse structure combined */}
          {/* Stylized columns of the flanking 'M' */}
          <path
            d="M18 82 L18 42 L28 42 L38 64 L38 82 H28 V56 L20 44 L20 82 H18 Z"
            fill="#FFFFFF"
          />
          <path
            d="M102 82 L102 42 L92 42 L82 64 L82 82 H92 V56 L100 44 L100 82 H102 Z"
            fill="#FFFFFF"
          />

          {/* Central Lighthouse Body */}
          <path
            d="M44 82 L48 44 H72 L76 82 H44 Z"
            fill="#FFFFFF"
          />
          
          {/* Golden Central Pillar/Ray inside the lighthouse - using #C8A24A */}
          <path
            d="M58 80 L56 46 H64 L62 80 H58 Z"
            fill="#C8A24A"
          />

          {/* Balcony, Lantern Room, and Dome of Lighthouse */}
          <rect x="42" y="40" width="36" height="4" rx="1" fill="#FFFFFF" />
          <rect x="46" y="34" width="28" height="6" fill="#FFFFFF" />
          
          {/* Lantern room columns / glass */}
          <rect x="50" y="28" width="20" height="6" fill="#FFFFFF" />
          {/* Glowing Lantern Core */}
          <circle cx="60" cy="31" r="4" fill="#C8A24A" />

          {/* Dome / Pointed roof */}
          <path
            d="M48 28 C48 20 72 20 72 28 Z"
            fill="#FFFFFF"
          />
          <rect x="58" y="16" width="4" height="6" fill="#FFFFFF" />
          <circle cx="60" cy="14" r="2.5" fill="#FFFFFF" />

          {/* Glow Filters */}
          <defs>
            <linearGradient id="lightBeamGrad" x1="48" y1="36" x2="110" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C8A24A" stopOpacity="0.95" />
              <stop offset="25%" stopColor="#C8A24A" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#C8A24A" stopOpacity="0.0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="hidden flex-col text-right sm:flex">
          {/* نص اسم المنصة (MANARATAK) */}
          <span className="text-[18px] font-bold uppercase tracking-tight text-[#0b3763] font-display leading-tight">
            MANARATAK
          </span>
          {/* النص الفرعي (منارتك للمنح الدراسية) */}
          <span className="text-[11px] font-medium text-[#0b3763]/80 leading-snug">
            منارتك للمنح الدراسية
          </span>
        </div>
      )}
    </div>
  );
}
