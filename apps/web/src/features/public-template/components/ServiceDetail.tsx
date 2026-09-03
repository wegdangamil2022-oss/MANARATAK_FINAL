import React, {useState} from 'react';
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Check,
  ChevronLeft,
  DollarSign,
  Clock3,
  FileText,
  Globe2,
  GraduationCap,
  HelpCircle,
  Info,
  Layers3,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react';
import { CategoryType, Service } from '../types';
import { FavoriteButton } from './FavoriteButton';

interface ServiceDetailProps {
  service: Service;
  onBack: () => void;
  onOpenContext?: (category: CategoryType) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <header className="mb-2.5 flex items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--mn-accent)]/50 bg-[var(--mn-primary)] text-[var(--mn-accent-text)] shadow-sm mn-inverse ">
        {icon}
      </span>
      <div>
        <h2 className="text-[11px] font-black text-[var(--mn-heading)] sm:text-xs">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[8.5px] font-bold text-[var(--mn-text-muted)]">{subtitle}</p>}
      </div>
    </header>
  );
}

export const ServiceDetail: React.FC<ServiceDetailProps> = ({ service, onBack, onOpenContext, isFavorite = false, onToggleFavorite }) => {
  const [showRequestNotice, setShowRequestNotice] = useState(false);
  const isStudent = service.audience === 'student';

  return (
    <div className="min-h-screen bg-[var(--mn-page)] pb-24 font-['Cairo',sans-serif] text-[var(--mn-heading)] mn-panel " dir="rtl">
      <div className="relative overflow-hidden border-b-[3px] border-[var(--mn-accent)]/70 bg-gradient-to-b from-[var(--mn-primary)] via-[var(--mn-hero-secondary)] to-[var(--mn-primary)] px-4 pb-5 pt-4 text-white shadow-md mn-inverse ">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-4 top-2 grid grid-cols-5 gap-1.5 opacity-20">
            {Array.from({ length: 15 }).map((_, index) => (
              <div key={index} className="h-1 w-1 rounded-full bg-[var(--mn-accent)] mn-gold " />
            ))}
          </div>
          <div className="absolute -left-12 -top-12 h-48 w-48 rounded-full border border-[var(--mn-accent)]/25" />
          <div className="absolute -right-6 bottom-0 opacity-25">
            {isStudent ? <GraduationCap className="h-36 w-36" strokeWidth={1} /> : <FileText className="h-36 w-36" strokeWidth={1} />}
          </div>
        </div>

        {onToggleFavorite && (
          <FavoriteButton
            active={isFavorite}
            onToggle={(event) => {
              event.stopPropagation();
              onToggleFavorite(service.id);
            }}
            className="absolute left-4 top-4 z-20 bg-[var(--mn-surface)]/95 mn-panel "
          />
        )}

        <button
          type="button"
          onClick={onBack}
          className="relative z-20 mb-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/25 shadow-md backdrop-blur-md transition hover:bg-black/40 active:scale-95"
          title="العودة"
        >
          <ChevronLeft className="h-4 w-4 rotate-180" />
        </button>

        <div className="relative z-10 mx-auto max-w-md text-right sm:max-w-xl">
          <div className="mb-2 flex flex-wrap gap-1.5">
            <span className="rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[8.5px] font-black text-[var(--mn-accent-soft)]">
              {service.badge}
            </span>
            <span className="rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[8.5px] font-black text-white">
              {service.category}
            </span>
          </div>
          <h1 className="text-[19px] font-black leading-8 text-white sm:text-2xl">{service.title}</h1>
          <p className="mt-1.5 max-w-xl text-[10.5px] font-semibold leading-5 text-[var(--mn-on-dark-muted)] sm:text-xs">
            {service.shortDescription}
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-md px-3.5 pb-24 pt-3 sm:max-w-xl sm:px-4">
        <section className="mb-3 grid grid-cols-3 gap-1.5">
          <div className="rounded-xl border border-[var(--mn-border-gold)] bg-[var(--mn-surface)] p-2 text-center shadow-2xs mn-panel ">
            <Wallet className="mx-auto h-4 w-4 text-[var(--mn-accent-text)]" />
            <span className="mt-1 block text-[8px] font-black text-[var(--mn-text-muted)]">السعر</span>
            <span className="mt-0.5 block text-[9px] font-black text-[var(--mn-text)]">{service.priceLabel}</span>
          </div>
          <div className="rounded-xl border border-[var(--mn-border-gold)] bg-[var(--mn-surface)] p-2 text-center shadow-2xs mn-panel ">
            <Clock3 className="mx-auto h-4 w-4 text-[var(--mn-heading)]" />
            <span className="mt-1 block text-[8px] font-black text-[var(--mn-text-muted)]">مدة التنفيذ</span>
            <span className="mt-0.5 block text-[9px] font-black text-[var(--mn-text)]">{service.turnaround}</span>
          </div>
          <div className="rounded-xl border border-[var(--mn-border-gold)] bg-[var(--mn-surface)] p-2 text-center shadow-2xs mn-panel ">
            <Layers3 className="mx-auto h-4 w-4 text-[var(--mn-heading)]" />
            <span className="mt-1 block text-[8px] font-black text-[var(--mn-text-muted)]">التنفيذ</span>
            <span className="mt-0.5 block text-[9px] font-black leading-4 text-[var(--mn-text)]">{service.deliveryMode}</span>
          </div>
        </section>

        <section className="mb-3 rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-3 shadow-sm mn-panel ">
          <SectionTitle icon={<Info className="h-4 w-4" />} title="عن الخدمة" />
          <p className="text-[10px] font-semibold leading-5 text-[var(--mn-text-muted)]">{service.description}</p>
        </section>

        <section className="mb-3 rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-3 shadow-sm mn-panel ">
          <SectionTitle icon={<BadgeCheck className="h-4 w-4" />} title="ما الذي تشمل الخدمة؟" />
          <ul className="space-y-1.5">
            {service.includes.map((item) => (
              <li key={item} className="flex items-start gap-1.5 text-[9.5px] font-semibold leading-4 text-[var(--mn-text-muted)]">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--mn-success-text)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-3 rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-3 shadow-sm mn-panel ">
          <SectionTitle icon={<AlertCircle className="h-4 w-4" />} title="ما الذي لا تشمل الخدمة؟" />
          <ul className="space-y-1.5">
            {service.excludes.map((item) => (
              <li key={item} className="flex items-start gap-1.5 text-[9.5px] font-semibold leading-4 text-[var(--mn-text-muted)]">
                <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--mn-danger-text)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {service.packages?.length ? (
          <section className="mb-3 rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-3 shadow-sm mn-panel ">
            <SectionTitle icon={<DollarSign className="h-4 w-4" />} title="الباقات" subtitle="خيارات الخدمة المنشورة عند توفرها" />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {service.packages.map((pkg) => (
                <div key={pkg.name} className="rounded-xl border border-[var(--mn-border-gold)] bg-[var(--mn-page)] p-2.5 mn-panel ">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[10px] font-black text-[var(--mn-heading)]">{pkg.name}</h3>
                    <span className="rounded-full bg-[var(--mn-accent)]/10 px-2 py-0.5 text-[9px] font-black text-[var(--mn-accent-text)]">{pkg.price}</span>
                  </div>
                  <p className="mt-1 text-[9px] font-semibold leading-4 text-[var(--mn-text-muted)]">{pkg.description}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mb-3 rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-3 shadow-sm mn-panel ">
          <SectionTitle icon={<FileText className="h-4 w-4" />} title="ما الذي نحتاجه منك؟" />
          <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {service.requirements.map((item) => (
              <li key={item} className="rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] px-2.5 py-2 text-[9.5px] font-bold leading-4 text-[var(--mn-text-muted)] mn-panel ">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-3 rounded-2xl border border-[var(--mn-accent)]/25 bg-[var(--mn-accent)]/5 p-3 shadow-sm">
          <SectionTitle
            icon={<Globe2 className="h-4 w-4" />}
            title="استكشف في منارتك"
            subtitle="ظهور سياقي فقط — لا يعني أن الخدمة مرتبطة أو معتمدة من هذه الكيانات"
          />
          <div className="mb-2 rounded-xl border border-[var(--mn-accent)]/20 bg-[var(--mn-surface)] px-2.5 py-2 text-[9px] font-bold leading-4 text-[var(--mn-text-muted)] mn-panel ">
            <span className="font-black text-[var(--mn-heading)]">فصل الترابط:</span> اختيارات الطالب داخل الطلب لا تتحول إلى علاقات دائمة للخدمة. الروابط أدناه تساعده على الاستكشاف فقط.
          </div>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {service.contextualLinks.map((link) => (
              <button
                key={`${link.category}-${link.label}`}
                type="button"
                onClick={() => onOpenContext?.(link.category)}
                className="group flex min-h-12 items-center justify-between gap-2 rounded-xl border border-[var(--mn-border-gold)] bg-[var(--mn-surface)] px-2.5 py-2 text-right transition hover:border-[var(--mn-accent)] active:scale-[0.99] mn-panel "
              >
                <div className="min-w-0">
                  <span className="block text-[9.5px] font-black text-[var(--mn-heading)]">{link.label}</span>
                  <span className="mt-0.5 block text-[8.5px] font-semibold leading-4 text-[var(--mn-text-muted)]">{link.description}</span>
                </div>
                <ArrowLeft className="h-4 w-4 shrink-0 text-[var(--mn-accent-text)] transition-transform group-hover:-translate-x-0.5" />
              </button>
            ))}
          </div>
        </section>

        {service.availabilityNote && (
          <section className="mb-3 rounded-2xl border border-[var(--mn-border-brand)] bg-[var(--mn-surface-muted)]/60 p-3">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mn-heading)]" />
              <div>
                <h2 className="text-[10px] font-black text-[var(--mn-heading)]">التوفر ليس مجرد ظهور سياقي</h2>
                <p className="mt-1 text-[9px] font-semibold leading-4 text-[var(--mn-text-muted)]">{service.availabilityNote}</p>
              </div>
            </div>
          </section>
        )}

        <section className="mb-3 rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-3 shadow-sm mn-panel ">
          <SectionTitle icon={<MessageSquareText className="h-4 w-4" />} title="سياق طلب الطالب" subtitle="بيانات الطلب وليست تعريفًا ثابتًا للخدمة" />
          <div className="flex flex-wrap gap-1.5">
            {service.requestContextFields.map((field) => (
              <span key={field} className="rounded-full border border-[var(--mn-border)] bg-[var(--mn-page)] px-2 py-1 text-[8.5px] font-black text-[var(--mn-text-muted)] mn-panel ">
                {field}
              </span>
            ))}
          </div>
        </section>

        <section className="mb-3 rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-3 shadow-sm mn-panel ">
          <SectionTitle icon={<HelpCircle className="h-4 w-4" />} title="الأسئلة الشائعة" />
          <div className="space-y-2">
            {service.faqs.map((faq) => (
              <div key={faq.question} className="rounded-xl border border-[var(--mn-border)] bg-[var(--mn-page)] p-2.5 mn-panel ">
                <h3 className="text-[9.5px] font-black text-[var(--mn-text)]">{faq.question}</h3>
                <p className="mt-1 text-[9px] font-semibold leading-4 text-[var(--mn-text-muted)]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-4 rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-3 shadow-sm mn-panel ">
          <SectionTitle icon={<ShieldCheck className="h-4 w-4" />} title="سياسة الإلغاء" />
          <p className="text-[9.5px] font-semibold leading-4 text-[var(--mn-text-muted)]">{service.cancellationPolicy}</p>
        </section>

        <button
          type="button"
          onClick={() => setShowRequestNotice(true)}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-[var(--mn-primary)] to-[var(--mn-hero-secondary)] px-4 text-[11px] font-black text-white shadow-md transition active:scale-[0.99] mn-inverse "
        >
          <Sparkles className="h-4 w-4 text-[var(--mn-accent-text)]" />
          اطلب الخدمة
        </button>
        {showRequestNotice && <p role="status" className="mt-3 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-3 text-sm leading-6 text-[var(--mn-text-muted)]">لم يُرسل طلب بعد. إرسال الطلب يتطلب جلسة مستخدم وربط مسار الطلبات في بيئة التشغيل.</p>}
      </main>
    </div>
  );
};

