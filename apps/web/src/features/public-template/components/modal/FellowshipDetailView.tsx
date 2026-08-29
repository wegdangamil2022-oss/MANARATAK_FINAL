import React from 'react';
import {
  BookOpen,
  FileText,
  GraduationCap,
  Layers,
  Activity,
  Award,
  ShieldAlert,
  Compass,
  Briefcase,
  Users,
  CheckCircle2,
  ListChecks,
  CheckCircle,
  Clock,
  FlaskConical,
  Target,
  ShieldCheck,
  GitCompare,
  UserCheck,
  Stethoscope,
  HeartPulse,
  Scale,
  Info,
} from 'lucide-react';
import { Major } from '../../types';

interface FellowshipDetailViewProps {
  major: Major;
}

export const FellowshipDetailView: React.FC<FellowshipDetailViewProps> = ({ major }) => {
  return (
    <div className="px-0 space-y-2.5 z-20 relative -mt-2.5 sm:-mt-3" dir="rtl">
      {/* 1. BASIC FELLOWSHIP INFORMATION CARD */}
      <div className="relative w-full bg-[var(--mn-surface)] rounded-none border-y border-[var(--mn-border-brand)]/40 shadow-md shadow-slate-200/60 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-secondary)] to-transparent z-10" />

        {/* Section Header */}
        <div className="flex flex-col items-center justify-center pt-3.5 pb-2.5 px-3.5 bg-gradient-to-b from-slate-50/70 to-[var(--mn-surface)]">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <div className="w-6.5 h-6.5 rounded-full bg-[var(--mn-primary)]/5 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
              <BookOpen className="w-3.5 h-3.5 text-[var(--mn-heading)]" />
            </div>
            <h2 className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] leading-tight">
              1. معلومات الزمالة الأساسية
            </h2>
          </div>
          {/* Glowing Gold Underline */}
          <div className="w-[140px] h-[1.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent shadow-[0_0_8px_rgba(200,162,74,0.7)]" />
        </div>

        {/* Table Header Row */}
        <div className="grid grid-cols-12 bg-gradient-to-r from-[var(--mn-primary)]/10 via-[var(--mn-secondary)]/5 to-[var(--mn-secondary)]/10 border-y border-[#F2E8D5] py-2.5 px-3.5 sm:px-4 items-center">
          <div className="col-span-4 text-[12px] font-black text-[var(--mn-heading)] text-right">
            الحقل
          </div>
          <div className="col-span-8 text-[12px] font-black text-[var(--mn-heading)] text-right">
            التفاصيل
          </div>
        </div>

        {/* Table Body Rows */}
        <div className="divide-y divide-[#F2E8D5]/60 bg-[var(--mn-surface)]">
          {/* Reference Code */}
          <div className="grid grid-cols-12 py-2.5 px-3.5 sm:px-4 items-center hover:bg-amber-50/20 transition-colors">
            <div className="col-span-4 text-[12px] font-black text-[var(--mn-heading)]">
              الرمز المرجعي
            </div>
            <div className="col-span-8 text-[11px] font-bold text-slate-700 font-mono tracking-wider">
              {major.code || 'FEL-0001'}
            </div>
          </div>

          {/* Arabic Name */}
          <div className="grid grid-cols-12 py-2.5 px-3.5 sm:px-4 items-center hover:bg-amber-50/20 transition-colors">
            <div className="col-span-4 text-[12px] font-black text-[var(--mn-heading)]">
              الاسم بالعربية
            </div>
            <div className="col-span-8 text-[11px] font-black text-slate-900">{major.name}</div>
          </div>

          {/* Name in English */}
          <div className="grid grid-cols-12 py-2.5 px-3.5 sm:px-4 items-center bg-amber-50/25 hover:bg-amber-50/40 transition-colors">
            <div className="col-span-4 text-[12px] font-black text-[var(--mn-heading)]">
              الاسم بالإنجليزية
            </div>
            <div className="col-span-8 text-[11px] font-black text-[var(--mn-accent-text)] font-sans tracking-wide">
              {major.nameEn}
            </div>
          </div>

          {/* Fellowship Type */}
          <div className="grid grid-cols-12 py-2.5 px-3.5 sm:px-4 items-center hover:bg-amber-50/20 transition-colors">
            <div className="col-span-4 text-[12px] font-black text-[var(--mn-heading)]">
              نوع الزمالة
            </div>
            <div className="col-span-8 text-[11px] font-bold text-slate-800">
              {major.fellowshipType || 'زمالة تدريبية سريرية — Clinical Training Fellowship'}
            </div>
          </div>

          {/* Field */}
          <div className="grid grid-cols-12 py-2.5 px-3.5 sm:px-4 items-center hover:bg-amber-50/20 transition-colors">
            <div className="col-span-4 text-[12px] font-black text-[var(--mn-heading)]">
              المجال المهني أو البحثي
            </div>
            <div className="col-span-8 text-[11px] font-bold text-slate-800">
              {major.professionalOrResearchField || major.academicField || 'القلب والأوعية'}
            </div>
          </div>

          {/* Associated Majors */}
          <div className="grid grid-cols-12 py-2.5 px-3.5 sm:px-4 items-start hover:bg-amber-50/20 transition-colors">
            <div className="col-span-4 text-[12px] font-black text-[var(--mn-heading)] pt-0.5">
              التخصصات المرتبطة
            </div>
            <div className="col-span-8 text-[11px] font-bold text-slate-800 leading-relaxed">
              {major.associatedMajor ||
                'الطب الباطني، طب القلب، وظائف الأعضاء القلبية، التصوير القلبي، والعناية القلبية'}
            </div>
          </div>

          {/* Target Audience Summary */}
          <div className="grid grid-cols-12 py-2.5 px-3.5 sm:px-4 items-start hover:bg-amber-50/20 transition-colors">
            <div className="col-span-4 text-[12px] font-black text-[var(--mn-heading)] pt-0.5">
              الفئة المستهدفة
            </div>
            <div className="col-span-8 text-[11px] font-bold text-slate-800 leading-relaxed">
              أطباء أكملوا تدريبًا تخصصيًا أساسيًا مناسبًا في الطب الباطني أو ما يعادله
            </div>
          </div>

          {/* Duration */}
          <div className="grid grid-cols-12 py-2.5 px-3.5 sm:px-4 items-start hover:bg-amber-50/20 transition-colors">
            <div className="col-span-4 text-[12px] font-black text-[var(--mn-heading)] pt-0.5">
              المدة الشائعة
            </div>
            <div className="col-span-8 text-[11px] font-bold text-slate-800 leading-relaxed">
              {major.duration ||
                'غالبًا نحو 3 سنوات بعد التدريب الأساسي، مع اختلاف واضح حسب النظام'}
            </div>
          </div>

          {/* Training Nature */}
          <div className="grid grid-cols-12 py-2.5 px-3.5 sm:px-4 items-start hover:bg-amber-50/20 transition-colors">
            <div className="col-span-4 text-[12px] font-black text-[var(--mn-heading)] pt-0.5">
              طبيعة التدريب
            </div>
            <div className="col-span-8 text-[11px] font-bold text-slate-800 leading-relaxed">
              {major.natureOfStudy ||
                'سريري عملي، دورانات، عيادات، مناوبات، مناقشات حالات، وبحث أو تحسين جودة'}
            </div>
          </div>

          {/* Licensing Requirement */}
          <div className="grid grid-cols-12 py-2.5 px-3.5 sm:px-4 items-center hover:bg-amber-50/20 transition-colors">
            <div className="col-span-4 text-[12px] font-black text-[var(--mn-heading)]">
              متطلب الترخيص العام
            </div>
            <div className="col-span-8 text-[11px] font-bold text-[var(--mn-heading)]">
              {major.licensingRequirement || 'مطلوب للممارسة السريرية'}
            </div>
          </div>

          {/* Short Description */}
          <div className="grid grid-cols-12 py-2.5 px-3.5 sm:px-4 items-start bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <div className="col-span-4 text-[12px] font-black text-[var(--mn-heading)] pt-0.5">
              الوصف المختصر
            </div>
            <div className="col-span-8 text-[11px] font-bold text-slate-700 leading-relaxed">
              {major.description}
            </div>
          </div>
        </div>
      </div>

      {/* 2. NATURE & OBJECTIVE OF FELLOWSHIP */}
      <div className="relative w-full bg-[var(--mn-surface)] rounded-none p-3.5 sm:p-4 border-y border-[var(--mn-border-brand)]/40 shadow-md shadow-slate-200/60 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-secondary)] to-transparent" />

        <div className="flex flex-col items-center justify-center mb-3 pt-0.5">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <div className="w-6.5 h-6.5 rounded-full bg-[var(--mn-primary)]/5 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
              <FileText className="w-3.5 h-3.5 text-[var(--mn-heading)]" />
            </div>
            <h2 className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] leading-tight">
              2. طبيعة الزمالة وهدفها
            </h2>
          </div>
          <div className="w-[140px] h-[1.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent shadow-[0_0_8px_rgba(200,162,74,0.7)]" />
        </div>

        <div className="space-y-2.5">
          <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-slate-50/90 to-amber-50/20 border border-[#F2E8D5]/70 text-right space-y-2">
            <p className="text-[11px] sm:text-[11.5px] font-bold text-slate-700 leading-[2] text-justify">
              تؤسس الزمالة كفاءة واسعة في أمراض القلب لدى البالغين قبل الانتقال إلى تخصصات أدق مثل
              التداخلات أو اضطرابات النظم أو قصور القلب. وتشمل تقييم الأعراض القلبية، وفهم الفحوص،
              وإدارة الحالات المزمنة والحادة، والتنسيق مع الطوارئ والعناية والجراحة.
            </p>
            <p className="text-[11px] sm:text-[11.5px] font-bold text-slate-700 leading-[2] text-justify pt-1.5 border-t border-[#F2E8D5]/50">
              لا تمنح الزمالة وحدها صلاحية عالمية؛ إذ ترتبط الصلاحيات بالترخيص والاعتماد والامتيازات
              السريرية المحلية.
            </p>
          </div>
        </div>
      </div>

      {/* 3. TYPE OF FELLOWSHIP */}
      <div className="relative w-full bg-[var(--mn-surface)] rounded-none p-3.5 sm:p-4 border-y border-[var(--mn-border-brand)]/40 shadow-md shadow-slate-200/60 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-secondary)] to-transparent" />

        <div className="flex flex-col items-center justify-center mb-3 pt-0.5">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <div className="w-6.5 h-6.5 rounded-full bg-[var(--mn-primary)]/5 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
              <Layers className="w-3.5 h-3.5 text-[var(--mn-heading)]" />
            </div>
            <h2 className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] leading-tight">
              3. نوع الزمالة
            </h2>
          </div>
          <div className="w-[140px] h-[1.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent shadow-[0_0_8px_rgba(200,162,74,0.7)]" />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 text-right">
          {(
            major.fellowshipTypeDetails || [
              'النوع الأساسي: زمالة تدريبية سريرية.',
              'تركز على تدريب تخصصي أو تخصص دقيق بعد إكمال تدريب أساسي مناسب.',
              'قد تتضمن مكونًا بحثيًا أو مشروع تحسين جودة.',
              'لا تعد درجة أكاديمية جديدة.',
              'لا تمنح تلقائيًا لقبًا أو اعتمادًا أو نطاق ممارسة خارج الجهة المنظمة.',
            ]
          ).map((item, idx) => (
            <div
              key={idx}
              className="flex flex-row items-start gap-2 p-2 sm:p-2.5 rounded-r-lg rounded-l-sm bg-amber-50/30 border-l-4 border-l-[var(--mn-accent)] border-y border-r border-[#F2E8D5]/40 hover:bg-amber-50/80 hover:border-l-[var(--mn-primary)] hover:shadow-sm transition-all duration-300 group text-right h-full"
            >
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[var(--mn-accent)] group-hover:bg-[var(--mn-primary)] shrink-0 mt-1.5 shadow-sm transition-colors" />
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-relaxed group-hover:text-[var(--mn-heading)] transition-colors flex-1">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. TARGET AUDIENCE */}
      <div className="relative w-full bg-[var(--mn-surface)] rounded-none p-3.5 sm:p-4 border-y border-[var(--mn-border-brand)]/40 shadow-md shadow-slate-200/60 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-secondary)] to-transparent" />

        <div className="flex flex-col items-center justify-center mb-3 pt-0.5">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <div className="w-6.5 h-6.5 rounded-full bg-[var(--mn-primary)]/5 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
              <Users className="w-3.5 h-3.5 text-[var(--mn-heading)]" />
            </div>
            <h2 className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] leading-tight">
              4. الفئة المستهدفة
            </h2>
          </div>
          <div className="w-[140px] h-[1.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent shadow-[0_0_8px_rgba(200,162,74,0.7)]" />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 text-right">
          {(
            major.targetAudience || [
              'أطباء أنهوا إقامة أو تدريبًا أساسيًا في الطب الباطني أو مسارًا معادلًا.',
              'ممارسون يريدون بناء اختصاص شامل في طب القلب للبالغين.',
              'أطباء لديهم ترخيص مهني ساري وأهلية للعمل السريري تحت الإشراف.',
              'ليست موجهة للمبتدئين قبل إكمال التدريب الأساسي.',
            ]
          ).map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 p-2 sm:p-2.5 rounded-full bg-slate-50 border border-slate-200 hover:border-[var(--mn-border-brand)] hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group text-right h-full"
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[var(--mn-primary)]/10 flex items-center justify-center shrink-0 group-hover:bg-[var(--mn-primary)] transition-colors">
                <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[var(--mn-heading)] group-hover:text-white transition-colors" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-700 leading-snug group-hover:text-[var(--mn-heading)] transition-colors flex-1">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. GENERAL PREVIOUS QUALIFICATIONS */}
      <div className="relative w-full bg-[var(--mn-surface)] rounded-none p-3.5 sm:p-4 border-y border-[var(--mn-border-brand)]/40 shadow-md shadow-slate-200/60 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-secondary)] to-transparent" />

        <div className="flex flex-col items-center justify-center mb-3 pt-0.5">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <div className="w-6.5 h-6.5 rounded-full bg-[var(--mn-primary)]/5 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
              <CheckCircle className="w-3.5 h-3.5 text-[var(--mn-heading)]" />
            </div>
            <h2 className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] leading-tight">
              5. المؤهلات السابقة العامة
            </h2>
          </div>
          <div className="w-[140px] h-[1.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent shadow-[0_0_8px_rgba(200,162,74,0.7)]" />
        </div>

        <div className="space-y-3 text-right">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(
              major.previousQualifications || [
                'درجة طب مهنية معترف بها.',
                'إكمال إقامة أو برنامج اختصاص أساسي مناسب.',
                'ترخيص طبي ساري أو أهلية ترخيص وفق الجهة.',
                'كفاءة في الإنعاش وتقييم المريض الحاد وفق متطلبات البرنامج.',
                'معرفة أساسية بتخطيط القلب والأدوية القلبية والطب الباطني.',
              ]
            ).map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl bg-[var(--mn-surface)] border border-[#F2E8D5]/90 hover:border-[var(--mn-accent)] hover:bg-slate-50/40 hover:shadow-2xs transition-all duration-200 group text-right"
              >
                <CheckCircle2 className="w-4 h-4 text-[var(--mn-heading)] shrink-0 mt-0.5" />
                <span className="text-[10.5px] sm:text-[11px] font-bold text-slate-800 leading-relaxed">
                  {item}
                </span>
              </div>
            ))}
          </div>

          {/* Phase 10 Note */}
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50/30 border border-[var(--mn-accent)]/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-[var(--mn-accent)]" />
            <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-[var(--mn-accent)] flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-3 h-3 text-[var(--mn-accent-text)]" />
            </div>
            <div className="flex-1 min-w-0 pr-1 text-right">
              <p className="text-[10.5px] sm:text-[11px] font-bold text-slate-700 leading-relaxed">
                {major.previousQualificationsNote ||
                  'تختلف شروط القبول الدقيقة حسب الدولة والهيئة والبرنامج، ولا تحفظ شروط مؤسسة بعينها داخل Phase 10.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 6. DURATION AND TRAINING PATTERN */}
      <div className="relative w-full bg-[var(--mn-surface)] rounded-none p-3.5 sm:p-4 border-y border-[var(--mn-border-brand)]/40 shadow-md shadow-slate-200/60 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-secondary)] to-transparent" />

        <div className="flex flex-col items-center justify-center mb-3 pt-0.5">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <div className="w-6.5 h-6.5 rounded-full bg-[var(--mn-primary)]/5 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-[var(--mn-heading)]" />
            </div>
            <h2 className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] leading-tight">
              6. المدة ونمط التدريب
            </h2>
          </div>
          <div className="w-[140px] h-[1.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent shadow-[0_0_8px_rgba(200,162,74,0.7)]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-right">
          {(
            major.durationAndPattern || [
              'دوام كامل غالبًا.',
              'دورانات داخلية وعيادات خارجية ووحدات عناية قلبية.',
              'مناوبات واستشارات قلبية بحسب البرنامج.',
              'مكون بحث أو تحسين جودة وتعليم سريري.',
              'تختلف المدة والحد الأدنى للحالات بحسب الهيئة المنظمة.',
            ]
          ).map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl bg-slate-50/80 border border-[#F2E8D5]/80 hover:border-[var(--mn-accent)] hover:bg-white hover:shadow-2xs transition-all text-right"
            >
              <div className="w-1.5 h-3.5 bg-[var(--mn-primary)] rounded-full shrink-0 mt-0.5" />
              <span className="text-[10.5px] sm:text-[11px] font-bold text-slate-800 leading-relaxed">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 7. TRAINING COMPONENTS */}
      <div className="relative w-full bg-[var(--mn-surface)] rounded-none p-3.5 sm:p-4 border-y border-[var(--mn-border-brand)]/40 shadow-md shadow-slate-200/60 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-secondary)] to-transparent" />

        <div className="flex flex-col items-center justify-center mb-3 pt-0.5">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <div className="w-6.5 h-6.5 rounded-full bg-[var(--mn-primary)]/5 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
              <Stethoscope className="w-3.5 h-3.5 text-[var(--mn-heading)]" />
            </div>
            <h2 className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] leading-tight">
              7. مكونات التدريب
            </h2>
          </div>
          <div className="w-[140px] h-[1.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent shadow-[0_0_8px_rgba(200,162,74,0.7)]" />
        </div>

        <div className="space-y-4 text-right">
          {/* Sub-block 1: الدورانات والخبرة السريرية */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-[var(--mn-heading)]" />
              <h3 className="text-[11.5px] font-black text-[var(--mn-heading)]">
                الدورانات والخبرة السريرية:
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {(
                major.rotationsAndClinical || [
                  'عيادات أمراض القلب العامة والمتابعة.',
                  'وحدة العناية القلبية والحالات الحادة.',
                  'استشارات القلب للمرضى المنومين.',
                  'قصور القلب ومرض الشرايين التاجية والصمامات.',
                  'ارتفاع الضغط واضطرابات الدهون والوقاية.',
                  'التعرض المنظم للتصوير والقسطرة واضطرابات النظم.',
                ]
              ).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2.5 rounded-xl bg-[var(--mn-surface)] border border-[#F2E8D5]/90"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--mn-primary)] shrink-0 mt-1.5" />
                  <span className="text-[10.5px] font-bold text-slate-800 leading-snug">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-block 2: الإجراءات أو التقنيات تحت الإشراف */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[var(--mn-accent-text)]" />
              <h3 className="text-[11.5px] font-black text-[var(--mn-heading)]">
                الإجراءات أو التقنيات تحت الإشراف:
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {(
                major.supervisedProcedures || [
                  'قراءة تخطيط القلب والمراقبة القلبية.',
                  'المشاركة في اختبارات الجهد والتصوير تحت الإشراف.',
                  'التعرض للقسطرة التشخيصية وفق الصلاحيات.',
                  'إجراءات سريرية أساسية مرتبطة بالعناية القلبية ضمن البرنامج.',
                  'تفسير الفحوص مع إشراف واعتماد تدريجي.',
                ]
              ).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2.5 rounded-xl bg-[var(--mn-surface)] border border-[#F2E8D5]/90"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--mn-accent)] shrink-0 mt-1.5" />
                  <span className="text-[10.5px] font-bold text-slate-800 leading-snug">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-block 3: البحث وتحسين الجودة */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-[var(--mn-heading)]" />
              <h3 className="text-[11.5px] font-black text-[var(--mn-heading)]">
                البحث وتحسين الجودة:
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {(
                major.researchAndQuality || [
                  'مشروع بحث سريري أو تحسين جودة.',
                  'مراجعة أدلة وإرشادات وتقديم حالات.',
                  'تحليل مؤشرات سلامة ونتائج الرعاية.',
                  'المشاركة في تعليم المقيمين والطلاب.',
                ]
              ).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50/20 border border-[#F2E8D5]/90"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--mn-primary)] shrink-0 mt-1.5" />
                  <span className="text-[10.5px] font-bold text-slate-800 leading-snug">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 8. TARGET COMPETENCIES */}
      <div className="relative w-full bg-[var(--mn-surface)] rounded-none p-3.5 sm:p-4 border-y border-[var(--mn-border-brand)]/40 shadow-md shadow-slate-200/60 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-secondary)] to-transparent" />

        <div className="flex flex-col items-center justify-center mb-3 pt-0.5">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <div className="w-6.5 h-6.5 rounded-full bg-[var(--mn-primary)]/5 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
              <Award className="w-3.5 h-3.5 text-[var(--mn-heading)]" />
            </div>
            <h2 className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] leading-tight">
              8. الكفاءات المستهدفة
            </h2>
          </div>
          <div className="w-[140px] h-[1.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent shadow-[0_0_8px_rgba(200,162,74,0.7)]" />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 pt-0.5 text-right">
          {(
            major.targetCompetencies || [
              'التقييم المتكامل للمريض القلبي.',
              'إدارة الأمراض القلبية الشائعة والمعقدة.',
              'تفسير الفحوص القلبية ضمن الصلاحيات.',
              'التعرف على الحالات الطارئة والتصعيد المناسب.',
              'اختيار العلاج المبني على الدليل.',
              'التواصل مع المريض والفريق متعدد التخصصات.',
              'إدارة المخاطر والسلامة الدوائية.',
            ]
          ).map((comp, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 p-2 sm:p-2.5 rounded-t-lg bg-gradient-to-b from-[var(--mn-surface)] to-slate-50 border-b-2 border-b-[#F2E8D5] hover:border-b-[var(--mn-primary)] hover:bg-slate-50 transition-all duration-300 group text-right h-full"
            >
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-300 group-hover:bg-[var(--mn-primary)] transition-colors shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-snug group-hover:text-[var(--mn-heading)] transition-colors flex-1">
                {comp}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 9. SUB-SPECIALTIES & PATHWAYS */}
      <div className="relative w-full bg-[var(--mn-surface)] rounded-none p-3.5 sm:p-4 border-y border-[var(--mn-border-brand)]/40 shadow-md shadow-slate-200/60 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-secondary)] to-transparent" />

        <div className="flex flex-col items-center justify-center mb-3 pt-0.5">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <div className="w-6.5 h-6.5 rounded-full bg-[var(--mn-primary)]/5 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
              <Compass className="w-3.5 h-3.5 text-[var(--mn-heading)]" />
            </div>
            <h2 className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] leading-tight">
              9. المسارات والتخصصات الدقيقة
            </h2>
          </div>
          <div className="w-[140px] h-[1.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent shadow-[0_0_8px_rgba(200,162,74,0.7)]" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-0.5 text-right">
          {(
            major.subSpecialties || [
              'مرض الشرايين التاجية',
              'أمراض الصمامات',
              'قصور القلب',
              'اضطرابات النظم',
              'الوقاية القلبية',
              'التصوير القلبي',
              'القلب عند كبار السن',
            ]
          ).map((track, idx) => (
            <div
              key={idx}
              className="flex items-center p-2.5 rounded-xl bg-[var(--mn-surface)] border border-[#F2E8D5]/80 hover:border-[var(--mn-accent)]/60 hover:shadow-2xs transition-all duration-200 group text-right overflow-hidden relative min-h-[44px]"
            >
              <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-[var(--mn-primary)]/80 group-hover:bg-[var(--mn-primary)] transition-colors" />
              <span className="text-[10.5px] sm:text-[11px] font-bold text-slate-800 leading-snug group-hover:text-[var(--mn-heading)] transition-colors pr-2">
                {track}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 10. SUPERVISION & TRAINING ENVIRONMENT */}
      <div className="relative w-full bg-[var(--mn-surface)] rounded-none p-3.5 sm:p-4 border-y border-[var(--mn-border-brand)]/40 shadow-md shadow-slate-200/60 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-secondary)] to-transparent" />

        <div className="flex flex-col items-center justify-center mb-3 pt-0.5">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <div className="w-6.5 h-6.5 rounded-full bg-[var(--mn-primary)]/5 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--mn-heading)]" />
            </div>
            <h2 className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] leading-tight">
              10. الإشراف وبيئة التدريب
            </h2>
          </div>
          <div className="w-[140px] h-[1.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent shadow-[0_0_8px_rgba(200,162,74,0.7)]" />
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 text-right">
          {(
            major.supervisionAndEnvironment || [
              'مشرفون معتمدون في طب القلب.',
              'حجم وتنوع كافيان من الحالات.',
              'وحدة عناية قلبية وعيادات وخدمات تشخيصية.',
              'تعاون مع الطوارئ والجراحة والأشعة والصيدلة.',
              'نظام تقييم ودعم ومراجعة سلامة واضح.',
            ]
          ).map((item, idx) => (
            <div
              key={idx}
              className="flex flex-row items-start gap-2 p-2 sm:p-2.5 rounded-lg bg-[var(--mn-surface)] border border-slate-300 shadow-[2px_2px_0px_#F2E8D5] hover:shadow-[3px_3px_0px_var(--mn-primary)] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all duration-300 text-right group h-full"
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 font-black text-[9px] sm:text-[10px] group-hover:bg-[var(--mn-primary)] group-hover:text-white transition-colors">
                {idx + 1}
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 leading-snug group-hover:text-[var(--mn-heading)] transition-colors flex-1 mt-0.5">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 11. ASSESSMENT & COMPLETION REQUIREMENTS */}
      <div className="relative w-full bg-[var(--mn-surface)] rounded-none p-3.5 sm:p-4 border-y border-[var(--mn-border-brand)]/40 shadow-md shadow-slate-200/60 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-secondary)] to-transparent" />

        <div className="flex flex-col items-center justify-center mb-3 pt-0.5">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <div className="w-6.5 h-6.5 rounded-full bg-[var(--mn-primary)]/5 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
              <ListChecks className="w-3.5 h-3.5 text-[var(--mn-heading)]" />
            </div>
            <h2 className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] leading-tight">
              11. التقييم ومتطلبات الإكمال
            </h2>
          </div>
          <div className="w-[140px] h-[1.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent shadow-[0_0_8px_rgba(200,162,74,0.7)]" />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 pt-0.5 text-right">
          {(
            major.assessmentAndCompletionRequirements || [
              'تقييم مستمر للمعرفة والقرار السريري.',
              'ملاحظات مباشرة في العيادات والدورانات.',
              'سجل حالات وخبرات وإجراءات.',
              'اختبارات تحريرية أو شفهية بحسب النظام.',
              'مشروع بحث أو تحسين جودة.',
              'تقييم نهائي للكفاءة المهنية.',
            ]
          ).map((req, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 p-2 sm:p-2.5 rounded-lg bg-[var(--mn-accent)]/5 border-2 border-dotted border-[var(--mn-accent)]/50 hover:border-[var(--mn-border-brand)] hover:bg-blue-50/60 hover:shadow-sm transition-all text-right group h-full"
            >
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm bg-[var(--mn-accent)]/20 text-[var(--mn-heading)] flex items-center justify-center shrink-0 mt-0.5 font-black text-[9px] group-hover:bg-[var(--mn-primary)] group-hover:text-white transition-colors rotate-45">
                <div className="-rotate-45">★</div>
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-snug group-hover:text-[var(--mn-heading)] transition-colors flex-1 pt-0.5">
                {req}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 12. RESULTING CERTIFICATE OR TITLE */}
      <div className="relative w-full bg-[var(--mn-surface)] rounded-none p-3.5 sm:p-4 border-y border-[var(--mn-border-brand)]/40 shadow-md shadow-slate-200/60 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-secondary)] to-transparent" />

        <div className="flex flex-col items-center justify-center mb-3 pt-0.5">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <div className="w-6.5 h-6.5 rounded-full bg-[var(--mn-primary)]/5 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
              <Award className="w-3.5 h-3.5 text-[var(--mn-heading)]" />
            </div>
            <h2 className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] leading-tight">
              12. الشهادة أو الصفة الناتجة
            </h2>
          </div>
          <div className="w-[140px] h-[1.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent shadow-[0_0_8px_rgba(200,162,74,0.7)]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-right">
          {(
            major.resultingCertificate || [
              'شهادة إكمال زمالة طب القلب للبالغين.',
              'خبرة تخصصية تؤهل للتقدم إلى اعتماد أو بورد حيثما ينطبق.',
              'قاعدة للتقدم إلى زمالات قلب دقيقة.',
              'لا تعد درجة أكاديمية جديدة.',
            ]
          ).map((cert, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl bg-slate-50/80 border border-[#F2E8D5]/80 hover:border-[var(--mn-accent)] hover:bg-white hover:shadow-2xs transition-all text-right group"
            >
              <div className="w-5 h-5 rounded-lg bg-amber-500/10 text-[var(--mn-accent-text)] flex items-center justify-center shrink-0 mt-0.5 font-black text-[10px] group-hover:bg-[var(--mn-accent)] group-hover:text-white transition-colors">
                ★
              </div>
              <span className="text-[10.5px] sm:text-[11px] font-bold text-slate-800 leading-relaxed">
                {cert}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 13. SCOPE OF PRACTICE & LICENSING */}
      <div className="relative w-full bg-[var(--mn-surface)] rounded-none p-3.5 sm:p-4 border-y border-[var(--mn-border-brand)]/40 shadow-md shadow-slate-200/60 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-secondary)] to-transparent" />

        <div className="flex flex-col items-center justify-center mb-3 pt-0.5">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <div className="w-6.5 h-6.5 rounded-full bg-[var(--mn-primary)]/5 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
              <Scale className="w-3.5 h-3.5 text-[var(--mn-heading)]" />
            </div>
            <h2 className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] leading-tight">
              13. نطاق الممارسة والترخيص
            </h2>
          </div>
          <div className="w-[140px] h-[1.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent shadow-[0_0_8px_rgba(200,162,74,0.7)]" />
        </div>

        <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-slate-50/90 to-amber-50/20 border border-[#F2E8D5]/70 text-right">
          <p className="text-[11px] sm:text-[11.5px] font-bold text-slate-700 leading-[2] text-justify">
            {major.practiceScopeAndLicensing ||
              'تدعم الزمالة ممارسة طب القلب للبالغين ضمن الترخيص والاعتماد والامتيازات الممنوحة. لا تسمح تلقائيًا بإجراء تدخلات متقدمة أو إجراءات كهربائية أو جراحية دون تدريب دقيق واعتماد منفصل.'}
          </p>
        </div>
      </div>

      {/* 14. WORK FIELDS AFTER FELLOWSHIP */}
      <div className="relative w-full bg-[var(--mn-surface)] rounded-none p-3.5 sm:p-4 border-y border-[var(--mn-border-brand)]/40 shadow-md shadow-slate-200/60 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-secondary)] to-transparent" />

        <div className="flex flex-col items-center justify-center mb-4 pt-0.5">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <div className="w-6.5 h-6.5 rounded-full bg-[var(--mn-primary)]/5 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
              <Briefcase className="w-3.5 h-3.5 text-[var(--mn-heading)]" />
            </div>
            <h2 className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] leading-tight">
              14. مجالات العمل بعد الزمالة
            </h2>
          </div>
          <div className="w-[140px] h-[1.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent shadow-[0_0_8px_rgba(200,162,74,0.7)]" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-right pt-0.5">
          {(
            major.workFields || [
              'أقسام وعيادات القلب',
              'وحدات العناية القلبية',
              'المستشفيات العامة والتخصصية',
              'التعليم والتدريب السريري',
              'البحث السريري في القلب',
              'الخدمات الاستشارية ضمن الترخيص',
            ]
          ).map((field, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-2.5 rounded-xl bg-[var(--mn-surface)] border border-[#F2E8D5]/80 hover:border-[var(--mn-accent)] hover:bg-slate-50/40 hover:shadow-2xs transition-all duration-200 group text-right"
            >
              <div className="w-2 h-[2.5px] bg-[var(--mn-primary)]/80 group-hover:bg-[var(--mn-primary)] group-hover:w-3.5 transition-all duration-300 shrink-0 mt-1.5 rounded-full" />
              <span className="text-[10.5px] font-bold text-slate-800 leading-snug group-hover:text-[var(--mn-heading)] transition-colors">
                {field}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 15. RELATION TO RESIDENCY, BOARD & PHD */}
      <div className="relative w-full bg-[var(--mn-surface)] rounded-none p-3.5 sm:p-4 border-y border-[var(--mn-border-brand)]/40 shadow-md shadow-slate-200/60 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-secondary)] to-transparent" />

        <div className="flex flex-col items-center justify-center mb-4 pt-0.5">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <div className="w-6.5 h-6.5 rounded-full bg-[var(--mn-primary)]/5 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
              <UserCheck className="w-3.5 h-3.5 text-[var(--mn-heading)]" />
            </div>
            <h2 className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] leading-tight">
              15. العلاقة بالإقامة والبورد والدكتوراه
            </h2>
          </div>
          <div className="w-[140px] h-[1.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent shadow-[0_0_8px_rgba(200,162,74,0.7)]" />
        </div>

        {/* Table 15 */}
        <div className="w-full overflow-x-auto no-scrollbar rounded-xl border border-[#F2E8D5]/80 shadow-2xs bg-[var(--mn-surface)]">
          <table className="w-full text-right border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-gradient-to-l from-[var(--mn-primary)]/5 to-[var(--mn-surface)] border-b border-[#F2E8D5]/80">
                <th className="py-3 px-4 text-[11px] sm:text-[11.5px] font-black text-[var(--mn-heading)] w-[35%] whitespace-nowrap">
                  المسار
                </th>
                <th className="py-3 px-4 text-[11px] sm:text-[11.5px] font-black text-[var(--mn-heading)] w-[65%]">
                  العلاقة بالزمالة
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {(
                major.relationToResidencyBoardPhD || [
                  {
                    pathway: 'الإقامة',
                    relation:
                      'تدريب تخصصي أساسي يسبق الزمالة، وغالبًا يكون في الطب الباطني أو مسار معادل.',
                  },
                  {
                    pathway: 'البورد أو شهادة الاختصاص',
                    relation: 'قد يكون شرط دخول أو اعتمادًا لاحقًا، ويختلف حسب النظام.',
                  },
                  {
                    pathway: 'الماجستير',
                    relation: 'درجة أكاديمية لا تستبدل التدريب السريري السابق أو الترخيص.',
                  },
                  {
                    pathway: 'الدكتوراه',
                    relation: 'درجة بحثية أو مهنية ولا تمنح وحدها صلاحية ممارسة التخصص السريري.',
                  },
                  { pathway: 'ما بعد الدكتوراه', relation: 'مسار بحثي مختلف عن الزمالة السريرية.' },
                ]
              ).map((row, index) => (
                <tr key={index} className="hover:bg-amber-50/20 transition-colors group">
                  <td className="py-2.5 px-4 text-[10.5px] sm:text-[11px] font-black text-[var(--mn-heading)] border-l border-slate-100/80 align-middle">
                    {row.pathway}
                  </td>
                  <td className="py-2.5 px-4 text-[10.5px] sm:text-[11px] font-bold text-slate-800 leading-relaxed align-middle">
                    {row.relation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 16. SIMILAR FELLOWSHIPS & DIFFERENCES */}
      <div className="relative w-full bg-[var(--mn-surface)] rounded-none p-3.5 sm:p-4 border-y border-[var(--mn-border-brand)]/40 shadow-md shadow-slate-200/60 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-secondary)] to-transparent" />

        <div className="flex flex-col items-center justify-center mb-4 pt-0.5">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <div className="w-6.5 h-6.5 rounded-full bg-[var(--mn-primary)]/5 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
              <GitCompare className="w-3.5 h-3.5 text-[var(--mn-heading)]" />
            </div>
            <h2 className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] leading-tight">
              16. الزمالات المشابهة والفروق
            </h2>
          </div>
          <div className="w-[140px] h-[1.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent shadow-[0_0_8px_rgba(200,162,74,0.7)]" />
        </div>

        {/* Table 16 */}
        <div className="w-full overflow-x-auto no-scrollbar rounded-xl border border-[#F2E8D5]/80 shadow-2xs bg-[var(--mn-surface)]">
          <table className="w-full text-right border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-gradient-to-l from-[var(--mn-primary)]/5 to-[var(--mn-surface)] border-b border-[#F2E8D5]/80">
                <th className="py-3 px-4 text-[11px] sm:text-[11.5px] font-black text-[var(--mn-heading)] w-[40%] whitespace-nowrap">
                  الزمالة أو المسار المشابه
                </th>
                <th className="py-3 px-4 text-[11px] sm:text-[11.5px] font-black text-[var(--mn-heading)] w-[60%]">
                  الفرق المختصر
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {(
                major.similarFellowships || [
                  {
                    name: 'زمالة أمراض القلب التداخلية',
                    difference: 'تركز على القسطرة والعلاج التداخلي بعد تدريب القلب العام.',
                  },
                  {
                    name: 'زمالة الفيزيولوجيا الكهربائية القلبية',
                    difference: 'تركز على اضطرابات النظم والأجهزة والإجراءات الكهربائية.',
                  },
                  {
                    name: 'زمالة قصور القلب المتقدم',
                    difference: 'تركز على الحالات المتقدمة والدعم الميكانيكي والزراعة.',
                  },
                  {
                    name: 'زمالة طب القلب الوقائي',
                    difference: 'تركز على خفض عوامل الخطورة والوقاية.',
                  },
                ]
              ).map((row, index) => (
                <tr key={index} className="hover:bg-amber-50/20 transition-colors group">
                  <td className="py-2.5 px-4 text-[10.5px] sm:text-[11px] font-bold text-slate-800 border-l border-slate-100/80 align-middle group-hover:text-[var(--mn-heading)] transition-colors">
                    {row.name}
                  </td>
                  <td className="py-2.5 px-4 text-[10.5px] sm:text-[11px] font-bold text-slate-800 leading-relaxed align-middle">
                    {row.difference}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 17. PROFESSIONAL & REGULATORY ALERT */}
      <div className="relative w-full bg-[var(--mn-surface)] rounded-none p-3.5 sm:p-4 border-y border-[var(--mn-border-brand)]/40 shadow-md shadow-slate-200/60 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--mn-secondary)] to-transparent" />

        <div className="flex flex-col items-center justify-center mb-3.5 pt-0.5">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <div className="w-6.5 h-6.5 rounded-full bg-[var(--mn-primary)]/5 border border-[var(--mn-accent)]/60 ring-2 ring-[var(--mn-focus)]/20 flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldAlert className="w-3.5 h-3.5 text-[var(--mn-heading)]" />
            </div>
            <h2 className="text-xs sm:text-[13px] font-black text-[var(--mn-heading)] leading-tight">
              17. التنبيه المهني والتنظيمي
            </h2>
          </div>
          <div className="w-[140px] h-[1.5px] bg-gradient-to-r from-transparent via-[var(--mn-accent-soft)] to-transparent shadow-[0_0_8px_rgba(200,162,74,0.7)]" />
        </div>

        <div className="space-y-2 text-right">
          <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-50/30 border border-[var(--mn-accent)]/40 text-right relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-[var(--mn-accent)]" />
            <p className="text-[11px] sm:text-[11.5px] font-bold text-slate-800 leading-[1.9]">
              {major.professionalRegulatoryAlert ||
                'الزمالة لا تمنح حق ممارسة طب القلب خارج الترخيص والاعتماد المحلي، ولا تسمح بإجراءات تخصصية دقيقة دون تدريب وامتيازات منفصلة. القرارات العاجلة والإجرائية يجب أن تتم داخل بيئة معتمدة وتحت حوكمة سريرية.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
