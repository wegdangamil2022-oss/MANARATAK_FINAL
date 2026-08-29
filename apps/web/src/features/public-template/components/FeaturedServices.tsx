import React, { useState } from 'react';
import { Briefcase, GraduationCap, Building2, ArrowUpLeft, ChevronLeft } from 'lucide-react';

const STUDENT_SERVICES = [
  {
    id: 's1',
    title: 'التقديم الجامعي الشامل',
    description:
      'نتولى عملية التقديم بالكامل من اختيار الجامعة المناسبة لملفك وحتى الحصول على القبول النهائي.',
    imageUrl:
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=200',
    color: 'bg-blue-50/60 text-[var(--mn-heading)]',
  },
  {
    id: 's2',
    title: 'مراجعة وتدقيق الوثائق',
    description:
      'تدقيق احترافي لخطابات الدافع (Motivation Letter) والسيرة الذاتية (CV) لتضمن لفت انتباه لجان القبول.',
    imageUrl:
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=200',
    color: 'bg-amber-50 text-[var(--mn-accent-text)]',
  },
  {
    id: 's3',
    title: 'استشارات التأشيرة الدراسية',
    description:
      'توجيه خطوة بخطوة لتحضير متطلبات التأشيرة الدراسية للبلد الوجهة وتجاوز المقابلة بنجاح.',
    imageUrl:
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=200',
    color: 'bg-blue-50 text-blue-600',
  },
];

const CORPORATE_SERVICES = [
  {
    id: 'c1',
    title: 'بوابة المكاتب التعليمية (B2B)',
    description:
      'نظام سحابي متكامل لإدارة وكالات التعليم، ومتابعة ملفات الطلاب وحالة قبولهم مركزياً باحترافية.',
    imageUrl:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=200',
    color: 'bg-slate-50 text-slate-700',
  },
  {
    id: 'c2',
    title: 'عقد الشراكات الجامعية',
    description:
      'نربط الجامعات والمؤسسات التعليمية بوكلاء معتمدين لتوسيع قاعدة استقطاب الطلاب الدوليين.',
    imageUrl:
      'https://images.unsplash.com/photo-1556761175-5973dc0f32d7?auto=format&fit=crop&q=80&w=200',
    color: 'bg-[var(--mn-primary)]/10 text-[var(--mn-heading)]',
  },
];

interface FeaturedServicesProps {
  onViewAllClick?: () => void;
}

export const FeaturedServices: React.FC<FeaturedServicesProps> = ({ onViewAllClick }) => {
  const [activeTab, setActiveTab] = useState<'students' | 'corporate'>('students');

  return (
    <section className="px-0.5 sm:px-1 py-3 w-full font-['Cairo',sans-serif]">
      {/* Container */}
      <div className="relative rounded-3xl p-4 sm:p-5 bg-gradient-to-b from-[var(--mn-surface)] to-slate-50/80 border border-slate-200/90 shadow-sm overflow-hidden border-t-2 border-t-[var(--mn-accent)]/40">
        {/* Centered Header & Tabs */}
        <div className="flex flex-col items-center gap-4 mb-5">
          <div className="text-center">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 inline-flex items-center justify-center gap-1.5">
              <Briefcase className="w-4 h-4 text-[var(--mn-accent-text)]" />
              <span>الخدمات المخصصة</span>
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-600 font-medium mt-1 max-w-xs mx-auto">
              حلول متكاملة مصممة خصيصاً لتلبية احتياجات الطلاب الأفراد والمؤسسات
            </p>
          </div>

          {/* Smart Tabs / Segmented Control with Orbiting Animated Border */}
          <div className="relative p-[2px] rounded-[14px] overflow-hidden group w-full max-w-[320px] shrink-0">
            {/* Spinning Gradient Background */}
            <div className="absolute inset-[-100%] animate-button-orbit bg-[conic-gradient(from_0deg,var(--mn-primary),var(--mn-accent),var(--mn-primary),var(--mn-accent),var(--mn-primary))]" />

            {/* Inner Tabs Container */}
            <div className="relative flex bg-slate-50 p-1 rounded-xl w-full">
              <button
                onClick={() => setActiveTab('students')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'students'
                    ? 'bg-[var(--mn-surface)] text-[var(--mn-heading)] shadow-sm ring-1 ring-slate-200/50'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <GraduationCap
                  className={`w-3.5 h-3.5 ${activeTab === 'students' ? 'text-[var(--mn-accent-text)]' : 'text-slate-400'}`}
                />
                <span>خدمات الطلاب</span>
              </button>
              <button
                onClick={() => setActiveTab('corporate')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'corporate'
                    ? 'bg-[var(--mn-surface)] text-[var(--mn-heading)] shadow-sm ring-1 ring-slate-200/50'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <Building2
                  className={`w-3.5 h-3.5 ${activeTab === 'corporate' ? 'text-[var(--mn-accent-text)]' : 'text-slate-400'}`}
                />
                <span>الشركات والمكاتب</span>
              </button>
            </div>
          </div>
        </div>

        {/* Compact List Layout for Services */}
        <div
          key={activeTab}
          className="mt-4 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          {(activeTab === 'students' ? STUDENT_SERVICES : CORPORATE_SERVICES).map((service) => (
            <div
              key={service.id}
              className="group bg-[var(--mn-surface)] border border-slate-100 hover:border-[var(--mn-accent)]/30 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
            >
              {/* Minimalist Image Box */}
              <div
                className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden flex items-center justify-center ${service.color} transition-transform group-hover:scale-105`}
              >
                <img
                  src={service.imageUrl}
                  alt={service.title}
                  className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:opacity-100"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Compact Content */}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-[var(--mn-heading)] transition-colors truncate">
                  {service.title}
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {service.description}
                </p>
              </div>

              {/* Action Icon */}
              <div className="shrink-0 w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[var(--mn-primary)] transition-all">
                <ArrowUpLeft className="w-3 h-3 text-slate-400 group-hover:text-white" />
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        {onViewAllClick && (
          <div className="mt-5 flex justify-center w-full">
            <button
              onClick={onViewAllClick}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-[var(--mn-surface)] hover:bg-[var(--mn-accent)]/10 text-[var(--mn-heading)] border border-[var(--mn-accent)]/50 rounded-full text-xs sm:text-sm font-bold transition-all shadow-[0_0_15px_rgba(200,162,74,0.3)] hover:shadow-[0_0_25px_rgba(200,162,74,0.5)] animate-pulse hover:animate-none active:scale-95 font-['Cairo',sans-serif]"
            >
              <span>تصفح جميع الخدمات</span>
              <ChevronLeft className="w-4 h-4 text-[var(--mn-heading)] transition-transform group-hover:-translate-x-1" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
