import React, { useState } from 'react';
import { Scholarship } from '../types';
import {
  Building2,
  Calendar,
  Languages,
  DollarSign,
  Check,
  Globe,
  Bookmark,
  ArrowLeft,
  ArrowUpLeft,
  Coins,
  GraduationCap,
  Home,
  ShieldCheck,
  Plane,
  Wallet,
  Sparkles,
  BookOpen,
  FileText,
  User,
  PenTool,
  Users,
  Activity,
  Shield,
  FileCheck,
  Info,
  Link,
  ExternalLink,
  MousePointerClick,
  Share2,
  MapPin,
  Copy,
} from 'lucide-react';

interface ScholarshipDetailModalProps {
  scholarship: Scholarship | null;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
  onAddToTracker?: (scholarship: Scholarship) => void;
  onOpenAiLetter?: (scholarshipTitle: string) => void;
}

export const ScholarshipDetailModal: React.FC<ScholarshipDetailModalProps> = ({
  scholarship,
  onToggleFavorite,
  isFavorite,
}) => {
  const [saveToast, setSaveToast] = useState(false);
  const [activeMajorTab, setActiveMajorTab] = useState<
    'bachelor' | 'master' | 'phd' | 'fellowship'
  >('bachelor');

  if (!scholarship) return null;

  const handleSaveClick = () => {
    onToggleFavorite(scholarship.id);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto pt-0 pb-12 text-right font-['Cairo',sans-serif] animate-in fade-in duration-200 bg-[var(--mn-surface-muted)] min-h-screen">
      {/* 1. TOP HERO CONTAINER (Compact horizontal layout with glowing gold graduation emblem on the right + arrow + title) */}
      <div className="relative w-full overflow-hidden">
        {/* SVG background with matching vibrant 3-stop emerald gradient, subtle gold waves */}
        <div className="relative w-full h-[115px] sm:h-[120px]">
          <svg
            viewBox="0 0 500 115"
            preserveAspectRatio="none"
            className="w-full h-full absolute inset-0 block"
          >
            <defs>
              <linearGradient id="heroGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#002E52" />
                <stop offset="50%" stopColor="var(--mn-primary)" />
                <stop offset="100%" stopColor="var(--mn-primary)" />
              </linearGradient>
            </defs>

            {/* Main base background */}
            <path d="M 0,0 L 500,0 L 500,90 Q 250,112 0,90 Z" fill="url(#heroGreenGrad)" />

            {/* Decorative Gold Waves (stays high in the background, nothing dipping low) */}
            <g opacity="0.25">
              <path
                d="M -50,30 Q 120,-10 260,35 T 550,20"
                stroke="var(--mn-accent)"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M -30,60 Q 150,20 320,55 T 560,35"
                stroke="var(--mn-accent)"
                strokeWidth="1"
                fill="none"
              />

              {/* Gold Sparkle Dots */}
              <circle cx="35" cy="25" r="1.5" fill="var(--mn-accent)" />
              <circle cx="50" cy="18" r="1" fill="var(--mn-accent)" />
              <circle cx="42" cy="38" r="1.2" fill="var(--mn-accent)" />
              <circle cx="445" cy="22" r="1.5" fill="var(--mn-accent)" />
              <circle cx="460" cy="35" r="1" fill="var(--mn-accent)" />
              <circle cx="430" cy="42" r="1.2" fill="var(--mn-accent)" />
            </g>

            {/* The gold accent border following the bottom curve */}
            <path
              d="M 0,90 Q 250,112 500,90"
              fill="none"
              stroke="var(--mn-accent)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>

          {/* Hero Content: Horizontal Row (Glowing Gold Graduation Badge Right -> Arrow -> Title Left) */}
          <div
            className="absolute inset-0 flex items-center justify-between px-4 sm:px-6 pt-1 pb-4 z-10"
            dir="rtl"
          >
            {/* Right Side: Glowing Gold Graduation Badge + Arrow */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Circular Frame with Glowing Gold Graduation Cap inside */}
              <div className="w-11 h-11 rounded-full border-2 border-[var(--mn-accent)] flex items-center justify-center p-1.5 shadow-[0_0_12px_rgba(200,162,74,0.5)] bg-gradient-to-br from-[var(--mn-primary)] to-[#001C33] shrink-0">
                <svg viewBox="0 0 40 40" className="w-full h-full">
                  <defs>
                    <linearGradient id="goldCapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFEAA7" />
                      <stop offset="45%" stopColor="var(--mn-accent-soft)" />
                      <stop offset="100%" stopColor="#A87D1A" />
                    </linearGradient>
                    <filter id="goldShine" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="1" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Glowing Gold Diamond Top */}
                  <polygon
                    points="20,6 37,14 20,22 3,14"
                    fill="url(#goldCapGrad)"
                    stroke="#FFF2B2"
                    strokeWidth="0.8"
                    filter="url(#goldShine)"
                  />
                  {/* Cap Underneath Base */}
                  <path
                    d="M9,17.5 v6 c0,3.5 4.8,6.5 11,6.5 s11,-3 11,-6.5 v-6"
                    fill="url(#goldCapGrad)"
                    stroke="#FFF2B2"
                    strokeWidth="0.6"
                  />
                  {/* Tassel line & drop */}
                  <path
                    d="M20,14 L34,16.5 v8.5"
                    stroke="#FFEAA7"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <circle cx="34" cy="26" r="1.8" fill="#FFEAA7" filter="url(#goldShine)" />
                </svg>
              </div>

              {/* Simple subtle arrow pointing from the graduation cap to the title */}
              <ArrowLeft className="w-4 h-4 text-[var(--mn-accent-text)] shrink-0 opacity-90 drop-shadow-[0_0_4px_rgba(200,162,74,0.4)]" />
            </div>

            {/* Left Side (in RTL): Scholarship Title & English Subtitle */}
            <div className="flex flex-col text-right min-w-0 flex-1 pr-1.5">
              <h1 className="text-sm sm:text-base font-black text-white leading-tight truncate drop-shadow-sm">
                {scholarship.title}
              </h1>
              <p className="text-[11px] sm:text-[11px] font-bold text-[var(--mn-accent-text)] font-sans mt-0.5 tracking-wider truncate">
                {scholarship.titleEn}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT WRAPPER */}
      <div className="px-3 sm:px-4 space-y-2.5 z-20 relative -mt-2.5 sm:-mt-3">
        {/* 2. DONOR AUTHORITY CARD (Clean Distinctive Gold Accent Line on Top Border) */}
        <div
          className="relative w-full bg-[var(--mn-surface)] rounded-2xl py-3.5 px-3.5 border border-[#F2E8D5] shadow-md shadow-slate-200/60 flex items-center gap-3 overflow-hidden"
          dir="rtl"
        >
          {/* Distinctive Top Gold Accent Line (clean inside the top border) */}
          <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent" />

          {/* Emerald Green Circle with Gold Border & Building Icon */}
          <div className="w-9 h-9 rounded-full bg-[var(--mn-primary)] flex items-center justify-center shrink-0 shadow-sm border-1.5 border-[var(--mn-accent)] ring-2 ring-[var(--mn-focus)]/20">
            <Building2 className="w-4 h-4 text-[#FAFAFA]" />
          </div>

          {/* Vertical Gold Divider Line */}
          <div className="w-[1px] h-7 bg-[var(--mn-accent)]/40 shrink-0" />

          {/* Donor Text */}
          <div className="space-y-0.5 min-w-0 flex-1 text-right">
            <h2 className="text-[11px] sm:text-xs font-black text-[var(--mn-heading)] leading-tight">
              {scholarship.id === 'csc-china'
                ? 'مجلس المنح الدراسية الصيني (CSC) - وزارة التعليم الصينية'
                : scholarship.university || 'الجهة الحكومية المانحة'}
            </h2>
            <p className="text-[9px] font-medium text-slate-400 font-sans truncate">
              {scholarship.id === 'csc-china'
                ? 'China Scholarship Council (CSC) - Ministry of Education of PRC'
                : scholarship.universityEn || 'Official Government Donor'}
            </p>
          </div>
        </div>

        {/* 3. 2-COLUMN X 3-ROW GRID (Titles in prominent Green + Values in Gold) */}
        <div className="space-y-2 pt-0.5" dir="rtl">
          {/* ROW 1: دولة الدراسة | الدرجات العلمية */}
          <div className="flex items-center gap-2">
            {/* Right Card: دولة الدراسة */}
            <div className="flex-1 bg-[var(--mn-surface)] rounded-2xl p-2.5 border border-[#E9DFC8]/70 shadow-sm flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[var(--mn-primary)]/8 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 text-[var(--mn-heading)]" />
              </div>
              <div className="flex flex-col min-w-0 text-right">
                <span className="text-[10.5px] sm:text-[11px] font-black text-[var(--mn-heading)] leading-tight truncate">
                  دولة الدراسة
                </span>
                <span className="text-[9.5px] font-black text-slate-600 leading-tight truncate mt-0.5">
                  {scholarship.country}
                </span>
              </div>
            </div>

            {/* Gold Diamond Connector */}
            <div className="w-1.5 h-1.5 rotate-45 bg-slate-300 shrink-0" />

            {/* Left Card: الدرجات العلمية */}
            <div className="flex-1 bg-[var(--mn-surface)] rounded-2xl p-2.5 border border-[#E9DFC8]/70 shadow-sm flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[var(--mn-primary)]/8 flex items-center justify-center shrink-0">
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 text-[var(--mn-heading)] fill-none stroke-current"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <div className="flex flex-col min-w-0 text-right">
                <span className="text-[10.5px] sm:text-[11px] font-black text-[var(--mn-heading)] leading-tight truncate">
                  الدرجات العلمية
                </span>
                <span className="text-[9px] font-black text-slate-600 font-sans tracking-tight leading-tight truncate mt-0.5">
                  BSc • MSc • PhD
                </span>
              </div>
            </div>
          </div>

          {/* ROW 2: انتهاء التقديم | نوع التمويل */}
          <div className="flex items-center gap-2">
            {/* Right Card: انتهاء التقديم */}
            <div className="flex-1 bg-[var(--mn-surface)] rounded-2xl p-2.5 border border-[#E9DFC8]/70 shadow-sm flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[var(--mn-primary)]/8 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-[var(--mn-heading)]" />
              </div>
              <div className="flex flex-col min-w-0 text-right">
                <span className="text-[10.5px] sm:text-[11px] font-black text-[var(--mn-heading)] leading-tight truncate">
                  انتهاء التقديم
                </span>
                <span className="text-[9.5px] font-black text-slate-600 font-sans leading-tight truncate mt-0.5">
                  31-03-2027
                </span>
              </div>
            </div>

            {/* Gold Diamond Connector */}
            <div className="w-1.5 h-1.5 rotate-45 bg-slate-300 shrink-0" />

            {/* Left Card: نوع التمويل */}
            <div className="flex-1 bg-[var(--mn-surface)] rounded-2xl p-2.5 border border-[#E9DFC8]/70 shadow-sm flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[var(--mn-primary)]/8 flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4 text-[var(--mn-heading)]" />
              </div>
              <div className="flex flex-col min-w-0 text-right">
                <span className="text-[10.5px] sm:text-[11px] font-black text-[var(--mn-heading)] leading-tight truncate">
                  نوع التمويل
                </span>
                <span className="text-[9.5px] font-black text-slate-600 leading-tight truncate mt-0.5">
                  ممولة بالكامل
                </span>
              </div>
            </div>
          </div>

          {/* ROW 3: لغة الدراسة | الجهة المانحة */}
          <div className="flex items-center gap-2">
            {/* Right Card: لغة الدراسة */}
            <div className="flex-1 bg-[var(--mn-surface)] rounded-2xl p-2.5 border border-[#E9DFC8]/70 shadow-sm flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[var(--mn-primary)]/8 flex items-center justify-center shrink-0">
                <Languages className="w-4 h-4 text-[var(--mn-heading)]" />
              </div>
              <div className="flex flex-col min-w-0 text-right">
                <span className="text-[10.5px] sm:text-[11px] font-black text-[var(--mn-heading)] leading-tight truncate">
                  لغة الدراسة
                </span>
                <span className="text-[9.5px] font-black text-slate-600 leading-tight truncate mt-0.5">
                  الإنجليزية / الصينية
                </span>
              </div>
            </div>

            {/* Gold Diamond Connector */}
            <div className="w-1.5 h-1.5 rotate-45 bg-slate-300 shrink-0" />

            {/* Left Card: الجهة المانحة */}
            <div className="flex-1 bg-[var(--mn-surface)] rounded-2xl p-2.5 border border-[#E9DFC8]/70 shadow-sm flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[var(--mn-primary)]/8 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-[var(--mn-heading)]" />
              </div>
              <div className="flex flex-col min-w-0 text-right">
                <span className="text-[10.5px] sm:text-[11px] font-black text-[var(--mn-heading)] leading-tight truncate">
                  الجهة المانحة
                </span>
                <span className="text-[9.5px] font-black text-slate-600 leading-tight truncate mt-0.5">
                  حكومية
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. FUNDING & BENEFITS SECTION (المميزات والتمويل) */}
        <div
          className="relative w-full bg-[var(--mn-surface)] rounded-3xl p-3.5 sm:p-4 border border-[#F2E8D5] shadow-md shadow-slate-200/60 overflow-hidden"
          dir="rtl"
        >
          {/* Distinctive Top Gold Accent Line */}
          <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent" />

          {/* Section Header: Centered horizontally with icon beside title in one compact row */}
          <div className="flex flex-col items-center justify-center mb-3 pt-0.5 pl-12 sm:pl-16">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <div className="w-6.5 h-6.5 rounded-full bg-[var(--mn-primary)]/5 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
                <Coins className="w-3.5 h-3.5 text-[var(--mn-heading)]" />
              </div>
              <h3 className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] leading-tight">
                المميزات والتمويل
              </h3>
            </div>
            {/* Glowing Underline */}
            <div className="w-[140px] h-[1.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent shadow-[0_0_8px_rgba(200,162,74,0.7)]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {/* 1. Tuition */}
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-50/80 hover:bg-slate-50 border border-slate-100/90 transition-colors">
              <div className="w-4.5 h-4.5 rounded-full bg-[var(--mn-primary)] border border-[var(--mn-accent)] flex items-center justify-center shrink-0 shadow-2xs">
                <Check className="w-2.5 h-2.5 text-[var(--mn-accent-text)] stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 leading-tight truncate pt-0.5">
                إعفاء 100% من الرسوم الدراسية
              </span>
            </div>

            {/* 2. Stipend */}
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-50/80 hover:bg-slate-50 border border-slate-100/90 transition-colors">
              <div className="w-4.5 h-4.5 rounded-full bg-[var(--mn-primary)] border border-[var(--mn-accent)] flex items-center justify-center shrink-0 shadow-2xs">
                <Check className="w-2.5 h-2.5 text-[var(--mn-accent-text)] stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 leading-tight truncate pt-0.5">
                راتب شهري (2500¥ - 3500¥)
              </span>
            </div>

            {/* 3. Housing */}
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-50/80 hover:bg-slate-50 border border-slate-100/90 transition-colors">
              <div className="w-4.5 h-4.5 rounded-full bg-[var(--mn-primary)] border border-[var(--mn-accent)] flex items-center justify-center shrink-0 shadow-2xs">
                <Check className="w-2.5 h-2.5 text-[var(--mn-accent-text)] stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 leading-tight truncate pt-0.5">
                سكن جامعي مجاني
              </span>
            </div>

            {/* 4. Insurance */}
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-50/80 hover:bg-slate-50 border border-slate-100/90 transition-colors">
              <div className="w-4.5 h-4.5 rounded-full bg-[var(--mn-primary)] border border-[var(--mn-accent)] flex items-center justify-center shrink-0 shadow-2xs">
                <Check className="w-2.5 h-2.5 text-[var(--mn-accent-text)] stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 leading-tight truncate pt-0.5">
                تأمين طبي وصحي شامل
              </span>
            </div>

            {/* 5. Language */}
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-50/80 hover:bg-slate-50 border border-slate-100/90 transition-colors">
              <div className="w-4.5 h-4.5 rounded-full bg-[var(--mn-primary)] border border-[var(--mn-accent)] flex items-center justify-center shrink-0 shadow-2xs">
                <Check className="w-2.5 h-2.5 text-[var(--mn-accent-text)] stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 leading-tight truncate pt-0.5">
                سنة تحضيرية للغة مجاناً
              </span>
            </div>

            {/* 6. Visa/Residency */}
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-50/80 hover:bg-slate-50 border border-slate-100/90 transition-colors">
              <div className="w-4.5 h-4.5 rounded-full bg-[var(--mn-primary)] border border-[var(--mn-accent)] flex items-center justify-center shrink-0 shadow-2xs">
                <Check className="w-2.5 h-2.5 text-[var(--mn-accent-text)] stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 leading-tight truncate pt-0.5">
                إعفاء من رسوم التأشيرة والإقامة
              </span>
            </div>
          </div>
        </div>

        {/* 5. MAJORS SECTION (التخصصات المتاحة) */}
        <div
          className="relative w-full bg-[var(--mn-surface)] rounded-3xl p-3.5 sm:p-4 border border-[#F2E8D5] shadow-md shadow-slate-200/60 overflow-hidden"
          dir="rtl"
        >
          <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent" />

          {/* Section Header: Centered horizontally with icon beside title */}
          <div className="flex flex-col items-center justify-center mb-3 pt-0.5 pl-12 sm:pl-16">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <div className="w-6.5 h-6.5 rounded-full bg-[var(--mn-primary)]/5 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
                <BookOpen className="w-3.5 h-3.5 text-[var(--mn-heading)]" />
              </div>
              <h3 className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] leading-tight">
                التخصصات المتاحة
              </h3>
            </div>
            {/* Glowing Underline */}
            <div className="w-[140px] h-[1.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent shadow-[0_0_8px_rgba(200,162,74,0.7)]" />
          </div>

          {/* Degree Switcher */}
          <div className="flex gap-1.5 mb-3 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveMajorTab('bachelor')}
              className={`px-4 py-2 text-[11px] font-bold rounded-xl transition-all whitespace-nowrap border ${activeMajorTab === 'bachelor' ? 'bg-[var(--mn-primary)] text-white border-[var(--mn-border-brand)] shadow-md' : 'bg-[var(--mn-surface)] text-slate-500 border-slate-200 hover:bg-slate-50'}`}
            >
              بكالوريوس
            </button>
            <button
              onClick={() => setActiveMajorTab('master')}
              className={`px-4 py-2 text-[11px] font-bold rounded-xl transition-all whitespace-nowrap border ${activeMajorTab === 'master' ? 'bg-[var(--mn-primary)] text-white border-[var(--mn-border-brand)] shadow-md' : 'bg-[var(--mn-surface)] text-slate-500 border-slate-200 hover:bg-slate-50'}`}
            >
              ماجستير
            </button>
            <button
              onClick={() => setActiveMajorTab('phd')}
              className={`px-4 py-2 text-[11px] font-bold rounded-xl transition-all whitespace-nowrap border ${activeMajorTab === 'phd' ? 'bg-[var(--mn-primary)] text-white border-[var(--mn-border-brand)] shadow-md' : 'bg-[var(--mn-surface)] text-slate-500 border-slate-200 hover:bg-slate-50'}`}
            >
              دكتوراه
            </button>
            <button
              onClick={() => setActiveMajorTab('fellowship')}
              className={`px-4 py-2 text-[11px] font-bold rounded-xl transition-all whitespace-nowrap border ${activeMajorTab === 'fellowship' ? 'bg-[var(--mn-primary)] text-white border-[var(--mn-border-brand)] shadow-md' : 'bg-[var(--mn-surface)] text-slate-500 border-slate-200 hover:bg-slate-50'}`}
            >
              الزمالات
            </button>
          </div>

          {/* Majors List (Horizontal flex-wrap) */}
          <div className="flex flex-wrap gap-2 animate-in fade-in duration-300">
            {activeMajorTab === 'bachelor' && (
              <>
                {[
                  'الطب والجراحة',
                  'هندسة البرمجيات',
                  'الذكاء الاصطناعي',
                  'إدارة الأعمال',
                  'العمارة والتصميم',
                  'العلاقات الدولية',
                ].map((major) => (
                  <button
                    key={major}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-xl hover:bg-white hover:border-[var(--mn-accent)]/40 hover:shadow-sm active:scale-95 transition-all cursor-pointer group"
                  >
                    {major}
                    <ArrowUpLeft className="w-4 h-4 text-[var(--mn-heading)] drop-shadow-none opacity-80 group-hover:opacity-100 group-hover:text-[var(--mn-accent-text)] group-hover:drop-shadow-none group-hover:scale-110 transition-all duration-300 -mr-1" />
                  </button>
                ))}
              </>
            )}
            {activeMajorTab === 'master' && (
              <>
                {[
                  'علوم البيانات والذكاء الاصطناعي',
                  'الهندسة الطبية الحيوية',
                  'إدارة المشاريع الهندسية',
                  'الاقتصاد الرقمي',
                  'الصحة العامة',
                ].map((major) => (
                  <button
                    key={major}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-xl hover:bg-white hover:border-[var(--mn-accent)]/40 hover:shadow-sm active:scale-95 transition-all cursor-pointer group"
                  >
                    {major}
                    <ArrowUpLeft className="w-4 h-4 text-[var(--mn-heading)] drop-shadow-none opacity-80 group-hover:opacity-100 group-hover:text-[var(--mn-accent-text)] group-hover:drop-shadow-none group-hover:scale-110 transition-all duration-300 -mr-1" />
                  </button>
                ))}
              </>
            )}
            {activeMajorTab === 'phd' && (
              <>
                {[
                  'أبحاث النانو تكنولوجي',
                  'علوم الحاسوب المتقدمة',
                  'الهندسة الوراثية',
                  'السياسات العامة',
                ].map((major) => (
                  <button
                    key={major}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-xl hover:bg-white hover:border-[var(--mn-accent)]/40 hover:shadow-sm active:scale-95 transition-all cursor-pointer group"
                  >
                    {major}
                    <ArrowUpLeft className="w-4 h-4 text-[var(--mn-heading)] drop-shadow-none opacity-80 group-hover:opacity-100 group-hover:text-[var(--mn-accent-text)] group-hover:drop-shadow-none group-hover:scale-110 transition-all duration-300 -mr-1" />
                  </button>
                ))}
              </>
            )}
            {activeMajorTab === 'fellowship' && (
              <>
                {[
                  'زمالة البحث العلمي',
                  'زمالة الطب السريري',
                  'زمالة الدراسات المتقدمة',
                  'الزمالة البحثية لما بعد الدكتوراه',
                ].map((major) => (
                  <button
                    key={major}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-xl hover:bg-white hover:border-[var(--mn-accent)]/40 hover:shadow-sm active:scale-95 transition-all cursor-pointer group"
                  >
                    {major}
                    <ArrowUpLeft className="w-4 h-4 text-[var(--mn-heading)] drop-shadow-none opacity-80 group-hover:opacity-100 group-hover:text-[var(--mn-accent-text)] group-hover:drop-shadow-none group-hover:scale-110 transition-all duration-300 -mr-1" />
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* 6. ELIGIBILITY SECTION (الشروط ومعايير التقديم) */}
        <div
          className="relative w-full bg-[var(--mn-surface)] rounded-3xl p-3.5 sm:p-4 border border-[#F2E8D5] shadow-md shadow-slate-200/60 overflow-hidden"
          dir="rtl"
        >
          <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent" />

          {/* Section Header: Centered horizontally with icon beside title */}
          <div className="flex flex-col items-center justify-center mb-3 pt-0.5 pl-12 sm:pl-16">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <div className="w-6.5 h-6.5 rounded-full bg-[var(--mn-primary)]/5 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--mn-heading)]" />
              </div>
              <h3 className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] leading-tight">
                الشروط ومعايير التقديم
              </h3>
            </div>
            {/* Glowing Underline */}
            <div className="w-[140px] h-[1.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent shadow-[0_0_8px_rgba(200,162,74,0.7)]" />
          </div>

          <div className="flex flex-col gap-1">
            {[
              'ألا يكون المتقدم حاملاً للجنسية الصينية ويتمتع بصحة جيدة.',
              'العمر: أقل من 25 للبكالوريوس، 35 للماجستير، 40 للدكتوراه.',
              'امتلاك سجل أكاديمي متميز ومعدل تراكمي عالي.',
              'ألا يكون حاصلاً على منحة دراسية أخرى في الصين بنفس الوقت.',
            ].map((condition, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50/80 hover:bg-slate-50 border border-slate-100/90 transition-colors"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-[var(--mn-surface)] border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--mn-accent)]" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 leading-[14px]">
                  {condition}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 7. IMPORTANT NOTES SECTION (ملاحظات مهمة) */}
        <div
          className="relative w-full bg-gradient-to-br from-[var(--mn-primary)]/[0.03] to-transparent rounded-3xl p-3.5 sm:p-4 border border-[var(--mn-accent)]/40 shadow-md shadow-slate-200/60 overflow-hidden"
          dir="rtl"
        >
          <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent" />

          {/* Section Header: Centered horizontally with icon beside title */}
          <div className="flex flex-col items-center justify-center mb-3 pt-0.5 pl-12 sm:pl-16">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <div className="w-6.5 h-6.5 rounded-full bg-[var(--mn-surface)] border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
                <Info className="w-3.5 h-3.5 text-[var(--mn-heading)]" />
              </div>
              <h3 className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] leading-tight">
                ملاحظة مهمة
              </h3>
            </div>
            {/* Glowing Underline */}
            <div className="w-[140px] h-[1.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent shadow-[0_0_8px_rgba(200,162,74,0.7)]" />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-start gap-2.5 bg-[var(--mn-surface)] rounded-2xl p-3 border border-[var(--mn-accent)]/20 shadow-sm transition-all hover:border-[var(--mn-accent)]/40">
              <div className="w-6 h-6 rounded-full bg-[var(--mn-primary)] flex items-center justify-center shrink-0 border border-[var(--mn-accent)]/50 shadow-xs">
                <span className="text-[11px] font-black text-[var(--mn-accent-text)] leading-none mt-0.5">
                  A
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-700 leading-relaxed">
                <span className="text-[var(--mn-heading)] font-black">الفئة A:</span> التقديم يتم عن
                طريق الوزارات والسفارات التابعة لبلدك، وتشمل كافة الدرجات الأكاديمية (بكالوريوس،
                ماجستير، ودكتوراه).
              </p>
            </div>

            <div className="flex items-start gap-2.5 bg-[var(--mn-surface)] rounded-2xl p-3 border border-[var(--mn-accent)]/20 shadow-sm transition-all hover:border-[var(--mn-accent)]/40">
              <div className="w-6 h-6 rounded-full bg-[var(--mn-primary)] flex items-center justify-center shrink-0 border border-[var(--mn-accent)]/50 shadow-xs">
                <span className="text-[11px] font-black text-[var(--mn-accent-text)] leading-none mt-0.5">
                  B
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-700 leading-relaxed">
                <span className="text-[var(--mn-heading)] font-black">الفئة B:</span> التقديم يتم عن
                طريق الجامعات والحكومة الصينية، وتقتصر على مقاعد الدراسات العليا فقط.
              </p>
            </div>
          </div>
        </div>

        {/* 8. REQUIRED DOCUMENTS SECTION (المستندات المطلوبة) */}
        <div
          className="relative w-full bg-[var(--mn-surface)] rounded-3xl p-3.5 sm:p-4 border border-[#F2E8D5] shadow-md shadow-slate-200/60 overflow-hidden"
          dir="rtl"
        >
          <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent" />

          {/* Section Header: Centered horizontally with icon beside title */}
          <div className="flex flex-col items-center justify-center mb-3 pt-0.5 pl-12 sm:pl-16">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <div className="w-6.5 h-6.5 rounded-full bg-[var(--mn-primary)]/5 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
                <FileCheck className="w-3.5 h-3.5 text-[var(--mn-heading)]" />
              </div>
              <h3 className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] leading-tight">
                المستندات المطلوبة
              </h3>
            </div>
            {/* Glowing Underline */}
            <div className="w-[140px] h-[1.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent shadow-[0_0_8px_rgba(200,162,74,0.7)]" />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { name: 'جواز السفر', icon: Globe },
              { name: 'آخر شهادة دراسية', icon: GraduationCap },
              { name: 'كشف الدرجات', icon: FileText },
              { name: 'خطة الدراسة أو البحث', icon: PenTool },
              { name: 'خطابات توصية للدراسات العليا', icon: Users },
              { name: 'إثبات اللغة HSK4 أو IELTS', icon: Languages, isLink: true },
              { name: 'خطاب قبول مبدئي إذا كان مطلوبًا في مسار التقديم', icon: Building2 },
              { name: 'الفحص الطبي', icon: Activity },
              { name: 'شهادة خلو سوابق', icon: Shield },
              { name: 'نموذج طلب منحة CSC', icon: FileCheck },
            ].map((doc, idx) =>
              doc.isLink ? (
                <button
                  key={idx}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl hover:bg-white hover:border-[var(--mn-accent)]/40 hover:shadow-sm active:scale-95 transition-all group cursor-pointer text-right w-fit"
                >
                  <div className="text-slate-400 group-hover:text-[var(--mn-accent-text)] transition-colors shrink-0">
                    <doc.icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 group-hover:text-[var(--mn-heading)] transition-colors leading-tight">
                    {doc.name}
                  </span>
                  <ArrowUpLeft className="w-4 h-4 text-[var(--mn-heading)] drop-shadow-none opacity-80 group-hover:opacity-100 group-hover:text-[var(--mn-accent-text)] group-hover:drop-shadow-none group-hover:scale-110 transition-all duration-300 -mr-1 mr-1" />
                </button>
              ) : (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl hover:bg-white hover:border-[var(--mn-accent)]/50 hover:shadow-sm transition-all group cursor-default text-right w-fit"
                >
                  <div className="text-slate-400 group-hover:text-[var(--mn-accent-text)] transition-colors shrink-0">
                    <doc.icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 group-hover:text-[var(--mn-heading)] transition-colors leading-tight">
                    {doc.name}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>

        {/* 9. APPLICATION LINKS SECTION (طريقة التقديم) */}
        <div
          className="relative w-full bg-[var(--mn-surface)] rounded-3xl p-3.5 sm:p-4 border border-[#F2E8D5] shadow-md shadow-slate-200/60 overflow-hidden"
          dir="rtl"
        >
          <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent" />

          {/* Section Header: Centered horizontally with icon beside title */}
          <div className="flex flex-col items-center justify-center mb-3 pt-0.5 pl-12 sm:pl-16">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <div className="w-6.5 h-6.5 rounded-full bg-[var(--mn-primary)]/5 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
                <MousePointerClick className="w-3.5 h-3.5 text-[var(--mn-heading)]" />
              </div>
              <h3 className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] leading-tight">
                طريقة التقديم
              </h3>
            </div>
            {/* Glowing Underline */}
            <div className="w-[140px] h-[1.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent shadow-[0_0_8px_rgba(200,162,74,0.7)]" />
          </div>

          <div className="flex flex-col gap-1.5">
            {/* Primary Apply Button (Official Website - Gold/White Style) */}
            <a
              href={scholarship?.applicationUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 bg-[var(--mn-surface-muted)] rounded-2xl p-3 border border-slate-200/50 shadow-[inset_0_2px_6px_rgba(0,0,0,0.04)] transition-all hover:bg-slate-100 active:scale-95 group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[var(--mn-accent)]/10 flex items-center justify-center shrink-0 border border-[var(--mn-accent)]/30">
                  <Globe className="w-4 h-4 text-[var(--mn-accent-text)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-[var(--mn-heading)] leading-tight mb-0.5">
                    التقديم عن طريق الموقع الرسمي للمنحة
                  </span>
                  <span className="text-[9.5px] font-bold text-slate-500 leading-tight">
                    تقديم الطلب مباشرة عبر الموقع الرسمي للجهة المانحة
                  </span>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200 group-hover:border-[var(--mn-accent)]/40 group-hover:bg-[var(--mn-accent)]/10 transition-colors">
                <ExternalLink className="w-3 h-3 text-[var(--mn-heading)]" />
              </div>
            </a>

            {/* Secondary Apply Button (Manartak Platform - Green Style) */}
            <div
              className="flex items-center justify-between gap-3 bg-gradient-to-l from-[var(--mn-primary)] to-[var(--mn-secondary)] rounded-2xl p-3 shadow-md shadow-[var(--mn-primary)]/20 transition-all hover:scale-[0.99] active:scale-95 group cursor-pointer"
              onClick={(e) => {
                // Placeholder for future Manartak platform application flow
                e.preventDefault();
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                  <MousePointerClick className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-white leading-tight mb-0.5">
                    التقديم عن طريق منصة منارتك
                  </span>
                  <span className="text-[9.5px] font-bold text-white/80 leading-tight">
                    تقديم سهل وموثوق بملف احترافي (قريباً)
                  </span>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20 group-hover:bg-white/20 transition-colors">
                <Link className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* 9. ACTIONS BUTTONS (SAVE & SHARE) */}
        <div className="pt-2 pb-2 flex justify-center gap-3">
          <button
            onClick={() => {
              // Share functionality placeholder
              // Could use navigator.share() here in the future
            }}
            className="py-2.5 px-6 rounded-2xl font-black text-[11.5px] flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer bg-[var(--mn-surface)] text-[var(--mn-heading)] border border-[var(--mn-accent)]/40 hover:bg-[var(--mn-accent)]/5 hover:border-[var(--mn-accent)] flex-1 max-w-[170px]"
          >
            <span>مشاركة المنحة</span>
            <Share2 className="w-4 h-4 text-[var(--mn-accent-text)]" />
          </button>

          <button
            onClick={handleSaveClick}
            className={`py-2.5 px-6 rounded-2xl font-black text-[11.5px] flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer flex-1 max-w-[170px] ${
              isFavorite
                ? 'bg-[var(--mn-primary)] text-[var(--mn-accent-text)] border border-[var(--mn-accent)]'
                : 'bg-[var(--mn-primary)] text-white hover:bg-[var(--mn-primary)]'
            }`}
          >
            <span>{isFavorite ? 'تم الحفظ' : 'حفظ المنحة'}</span>
            <Bookmark
              className={`w-4 h-4 ${isFavorite ? 'fill-[var(--mn-accent)] text-[var(--mn-accent-text)]' : 'text-[var(--mn-accent-text)]'}`}
            />
          </button>
        </div>

        {/* 10. SIMILAR SCHOLARSHIPS SECTION */}
        <div
          className="relative w-full bg-[var(--mn-surface)] rounded-3xl p-3.5 sm:p-4 border border-[#F2E8D5] shadow-md shadow-slate-200/60 overflow-hidden mb-2"
          dir="rtl"
        >
          <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent" />

          {/* Section Header: Centered horizontally with icon beside title */}
          <div className="flex flex-col items-center justify-center mb-3 pt-0.5 pl-12 sm:pl-16">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <div className="w-6.5 h-6.5 rounded-full bg-[var(--mn-primary)]/5 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
                <Copy className="w-3.5 h-3.5 text-[var(--mn-heading)]" />
              </div>
              <h3 className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] leading-tight">
                منح مشابهة قد تهمك
              </h3>
            </div>
            {/* Glowing Underline */}
            <div className="w-[140px] h-[1.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent shadow-[0_0_8px_rgba(200,162,74,0.7)]" />
          </div>

          <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-2 snap-x snap-mandatory">
            {[
              {
                id: 1,
                country: 'الولايات المتحدة',
                title: 'منحة فولبرايت للطلاب الأجانب',
                degrees: ['ماجستير', 'دكتوراه'],
                deadline: 'ينتهي قريباً',
              },
              {
                id: 2,
                country: 'المملكة المتحدة',
                title: 'منحة تشيفنينغ للدراسات العليا',
                degrees: ['ماجستير'],
                deadline: 'متاح للتقديم',
              },
              {
                id: 3,
                country: 'ألمانيا',
                title: 'منح DAAD لدراسة الماجستير',
                degrees: ['بكالوريوس', 'ماجستير'],
                deadline: 'باقي 10 أيام',
              },
            ].map((item) => (
              <div
                key={item.id}
                className="min-w-[200px] bg-slate-50 border border-slate-200 rounded-2xl p-2.5 flex flex-col gap-2 snap-center transition-all hover:border-[var(--mn-accent)]/40 hover:bg-[var(--mn-accent)]/5 cursor-pointer"
              >
                {/* Header: Country and Funding Type */}
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] font-bold text-slate-600">{item.country}</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-[var(--mn-primary)]/10 text-[var(--mn-heading)] rounded-md text-[8px] font-bold">
                    ممولة بالكامل
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-[11px] font-black text-[var(--mn-heading)] line-clamp-2 leading-tight">
                  {item.title}
                </h4>

                {/* Degrees */}
                <div className="flex flex-wrap gap-1 mt-auto pt-0.5">
                  {item.degrees.map((deg) => (
                    <span
                      key={deg}
                      className="px-1.5 py-0.5 bg-[var(--mn-surface)] border border-slate-200 text-slate-500 rounded-lg text-[8.5px] font-bold"
                    >
                      {deg}
                    </span>
                  ))}
                </div>

                {/* Footer: Deadline */}
                <div className="flex items-center gap-1.5 pt-1.5 mt-0.5 border-t border-slate-200/60">
                  <Calendar className="w-3 h-3 text-[var(--mn-accent-text)]" />
                  <span className="text-[9px] font-bold text-slate-500">{item.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Notification Toast */}
      {saveToast && (
        <div className="fixed bottom-6 inset-x-4 max-w-xs mx-auto bg-[var(--mn-primary)] text-white px-4 py-2 rounded-full shadow-2xl z-50 flex items-center justify-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-3.5 h-3.5 text-[var(--mn-accent-text)]" />
          <span>{isFavorite ? 'تمت إضافة المنحة إلى مفضلتي' : 'تمت إزالة المنحة من مفضلتي'}</span>
        </div>
      )}
    </div>
  );
};
