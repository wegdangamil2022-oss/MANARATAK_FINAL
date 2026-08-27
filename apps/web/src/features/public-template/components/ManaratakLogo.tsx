import React from 'react';

interface ManaratakLogoProps {
  className?: string;
  size?: number;
}

export const ManaratakLogo: React.FC<ManaratakLogoProps> = ({ className = '', size = 48 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="شعار منارتك | MANARATAK"
    >
      {/* Outer Deep Dark Green Circle */}
      <circle cx="250" cy="250" r="240" fill="#064D83" />

      {/* Outer Double Gold Border Ring */}
      <circle cx="250" cy="250" r="236" stroke="#D9A93A" strokeWidth="8" />

      {/* Inner Thin Gold Ring */}
      <circle cx="250" cy="250" r="222" stroke="#D9A93A" strokeWidth="3" strokeOpacity="0.9" />

      {/* Golden Light Beam from Lighthouse Lantern */}
      <path d="M170 148 L460 115 L460 178 Z" fill="url(#goldLightBeam)" opacity="0.9" />

      {/* Lantern Glowing Core */}
      <circle cx="145" cy="148" r="22" fill="#FFE57F" opacity="0.6" filter="blur(6px)" />

      {/* Lighthouse Top Spire & Dome */}
      <path d="M145 92 L148 112 L142 112 Z" fill="#FFFFFF" />
      <circle cx="145" cy="90" r="4.5" fill="#FFFFFF" />
      <path d="M125 125 C125 112, 165 112, 165 125 Z" fill="#FFFFFF" />

      {/* Lantern Room Cage */}
      <rect x="127" y="125" width="36" height="28" fill="#FFF8E1" rx="2" />
      <rect x="131" y="127" width="28" height="24" fill="#FFD54F" />
      <line x1="145" y1="125" x2="145" y2="153" stroke="#064D83" strokeWidth="2.5" />
      <line x1="127" y1="139" x2="163" y2="139" stroke="#064D83" strokeWidth="2" />

      {/* Lantern Balcony Railing */}
      <rect x="120" y="153" width="50" height="7" fill="#FFFFFF" rx="2" />
      <line x1="122" y1="156" x2="168" y2="156" stroke="#064D83" strokeWidth="1.5" />

      {/* Letter 'M' Shape (White Serif Pillars) */}
      {/* Left Pillar */}
      <path d="M60 188 L105 188 L105 348 L60 348 Z" fill="#FFFFFF" />
      {/* Left Serif Top/Bottom */}
      <path d="M50 188 L115 188 L115 194 L50 194 Z" fill="#FFFFFF" />
      <path d="M50 342 L115 342 L115 348 L50 348 Z" fill="#FFFFFF" />

      {/* Left Diagonal connecting to Lighthouse */}
      <path d="M105 200 L135 270 L115 270 L90 215 Z" fill="#FFFFFF" />

      {/* Center Lighthouse Tower (forms center of M) */}
      {/* Lighthouse White Body */}
      <polygon points="130,160 160,160 172,348 118,348" fill="#FFFFFF" />

      {/* Golden Center Stripe / Tie on Lighthouse */}
      <polygon points="140,185 150,185 155,335 145,348 135,335" fill="url(#goldGradPillar)" />

      {/* Right Diagonal from Lighthouse */}
      <path d="M155 270 L185 200 L200 215 L175 270 Z" fill="#FFFFFF" />

      {/* Right Pillar */}
      <path d="M185 188 L230 188 L230 348 L185 348 Z" fill="#FFFFFF" />
      {/* Right Serif Top/Bottom */}
      <path d="M175 188 L240 188 L240 194 L175 194 Z" fill="#FFFFFF" />
      <path d="M175 342 L240 342 L240 348 L175 348 Z" fill="#FFFFFF" />

      {/* English Text "MANARATAK" in clean letterspaced serif */}
      <text
        x="355"
        y="235"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="'Plus Jakarta Sans', 'Times New Roman', serif"
        fontSize="29"
        fontWeight="700"
        letterSpacing="8"
      >
        MANARATAK
      </text>

      {/* Arabic Text "منارتك" in Bold Typography */}
      <text
        x="355"
        y="300"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="'Cairo', sans-serif"
        fontSize="54"
        fontWeight="800"
      >
        منارتك
      </text>

      {/* Subtitle "للفرص التعليمية" with Golden Diamond accents */}
      <path d="M255 326 L260 321 L265 326 L260 331 Z" fill="#D9A93A" />
      <line x1="267" y1="326" x2="288" y2="326" stroke="#D9A93A" strokeWidth="2.5" />
      <text
        x="355"
        y="333"
        textAnchor="middle"
        fill="#D9A93A"
        fontFamily="'Cairo', sans-serif"
        fontSize="16"
        fontWeight="700"
      >
        للفرص التعليمية
      </text>
      <line x1="422" y1="326" x2="443" y2="326" stroke="#D9A93A" strokeWidth="2.5" />
      <path d="M445 326 L450 321 L455 326 L450 331 Z" fill="#D9A93A" />

      {/* Linear Gradients */}
      <defs>
        <linearGradient
          id="goldLightBeam"
          x1="170"
          y1="148"
          x2="460"
          y2="148"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFE082" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#D9A93A" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#D9A93A" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="goldGradPillar"
          x1="145"
          y1="185"
          x2="145"
          y2="348"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FDD835" />
          <stop offset="50%" stopColor="#D9A93A" />
          <stop offset="100%" stopColor="#A87D1A" />
        </linearGradient>
      </defs>
    </svg>
  );
};
