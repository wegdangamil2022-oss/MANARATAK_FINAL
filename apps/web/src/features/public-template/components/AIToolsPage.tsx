import React from 'react';
import {
  ChevronLeft,
  Sparkles,
  Bot,
  FileText,
  Target,
  MessageSquare,
  Cpu,
  Zap,
} from 'lucide-react';

interface AIToolsPageProps {
  onBack?: () => void;
  onOpenTool?: (toolId: 'letter' | 'cv' | 'chat' | 'search') => void;
}

export const AIToolsPage: React.FC<AIToolsPageProps> = ({ onBack, onOpenTool }) => {
  return (
    <div
      className="min-h-screen bg-[var(--mn-page)] text-slate-900 pb-24 font-sans select-none"
      dir="rtl"
    >
      {/* ========================================================================= */}
      {/* HERO TECH BANNER - FUTURISTIC AI DESIGN WITH FALLING TOOLS               */}
      {/* ========================================================================= */}
      <div className="relative mn-search-hero text-white px-3 sm:px-4 pt-4 pb-12 sm:pb-14 overflow-hidden shadow-xs border-b border-[var(--mn-accent)]/20">
        {/* Custom CSS for Falling Animation */}
        <style>{`
          @keyframes fallDown {
            0% { top: -10%; transform: rotate(0deg) scale(0.7); opacity: 0; }
            10% { opacity: 0.25; }
            90% { opacity: 0.25; }
            100% { top: 110%; transform: rotate(360deg) scale(1.2); opacity: 0; }
          }
          .falling-icon {
            position: absolute;
            color: var(--mn-accent);
            animation: fallDown linear infinite;
            pointer-events: none;
            z-index: 0;
          }
        `}</style>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Cyber Grid */}
          <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:20px_20px]" />

          {/* Falling AI Icons */}
          <Cpu
            className="falling-icon w-8 h-8 left-[10%]"
            style={{ animationDuration: '6s', animationDelay: '0s' }}
          />
          <Bot
            className="falling-icon w-10 h-10 left-[30%]"
            style={{ animationDuration: '8s', animationDelay: '2s' }}
          />
          <Sparkles
            className="falling-icon w-6 h-6 left-[50%]"
            style={{ animationDuration: '5s', animationDelay: '1s' }}
          />
          <Zap
            className="falling-icon w-7 h-7 left-[70%]"
            style={{ animationDuration: '7s', animationDelay: '3s' }}
          />
          <FileText
            className="falling-icon w-9 h-9 left-[85%]"
            style={{ animationDuration: '9s', animationDelay: '0.5s' }}
          />

          <Target
            className="falling-icon w-8 h-8 left-[20%]"
            style={{ animationDuration: '7.5s', animationDelay: '4s' }}
          />
          <MessageSquare
            className="falling-icon w-6 h-6 left-[60%]"
            style={{ animationDuration: '6.5s', animationDelay: '2.5s' }}
          />
          <Cpu
            className="falling-icon w-5 h-5 left-[80%]"
            style={{ animationDuration: '5.5s', animationDelay: '1.5s' }}
          />
          <Bot
            className="falling-icon w-7 h-7 left-[40%]"
            style={{ animationDuration: '8.5s', animationDelay: '3.5s' }}
          />
        </div>

        {/* Top-Right Circular Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 bg-black/25 hover:bg-black/40 border border-white/15 backdrop-blur-md rounded-full flex items-center justify-center transition-all z-30 cursor-pointer text-white shadow-md active:scale-95"
            title="العودة"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 rotate-180 text-white" />
          </button>
        )}

        {/* Content */}
        <div className="max-w-md sm:max-w-xl mx-auto text-center relative z-10 space-y-2 pt-4">
          {/* Top Tech Icon */}
          <div className="flex justify-center mb-3">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--mn-accent)] blur-md opacity-40 rounded-full animate-pulse" />
              <Cpu className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--mn-accent-text)] relative z-10" />
            </div>
          </div>

          {/* Main Title */}
          <div className="pt-2 pb-1 space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white font-['Cairo',sans-serif] tracking-tight leading-tight flex flex-col items-center justify-center gap-1">
              <span>
                أدوات{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--mn-accent-soft)] to-[var(--mn-accent-soft)]">
                  الذكاء الاصطناعي
                </span>
              </span>
            </h1>

            {/* Divider */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-16 h-1 bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent rounded-full opacity-80" />
            </div>

            {/* Subtitle */}
            <p className="text-[12px] sm:text-sm text-slate-200 font-medium font-['Cairo',sans-serif] leading-relaxed max-w-xs sm:max-w-md mx-auto pt-2">
              مجموعة متكاملة من الأدوات الذكية المصممة خصيصاً لمضاعفة فرص قبولك الأكاديمي وتسهيل
              خطوات التقديم.
            </p>
          </div>

          {/* Glowing Tech Stats/Tags */}
          <div className="flex justify-center gap-3 pt-4">
            <span className="px-3 py-1.5 bg-[var(--mn-accent)]/10 border border-[var(--mn-accent)]/40 rounded-full text-[10px] sm:text-xs text-[var(--mn-accent-text)] font-bold shadow-[0_0_12px_rgba(200,162,74,0.25)] backdrop-blur-sm flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              معالجة فورية
            </span>
            <span className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-[10px] sm:text-xs text-white font-bold shadow-[0_0_12px_rgba(255,255,255,0.1)] backdrop-blur-sm flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              دقة احترافية
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
