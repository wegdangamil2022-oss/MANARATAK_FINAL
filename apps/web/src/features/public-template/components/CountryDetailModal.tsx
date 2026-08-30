import React from 'react';
import {
  ArrowLeft,
  Banknote,
  BookOpen,
  Building2,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  Flag,
  Globe2,
  GraduationCap,
  Languages,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
  X,
} from 'lucide-react';
import { CountryDestination, CountryEntityRef } from '../types';
import { RelatedArticlesStrip } from './RelatedArticlesStrip';
import { FavoriteButton } from './FavoriteButton';

interface CountryDetailModalProps {
  country: CountryDestination;
  onClose: () => void;
  onOpenUniversity?: (universityId: string) => void;
  onOpenScholarship?: (scholarshipId: string) => void;
  onOpenMajor?: (majorId: string) => void;
  onOpenExam?: (examId: string) => void;
  onBrowseScholarships?: (countryName: string) => void;
  onOpenArticle?: (articleId: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const SectionTitle: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}> = ({ icon, title, subtitle }) => (
  <div className="flex items-start justify-between gap-2 mb-2">
    <div className="flex items-center gap-2 min-w-0">
      <div className="w-7 h-7 rounded-xl bg-[var(--mn-primary)]/10 border border-[var(--mn-border-brand)]/30 flex items-center justify-center text-[var(--mn-heading)] shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-[12px] sm:text-[13px] font-black text-[var(--mn-heading)] leading-tight">{title}</h3>
        {subtitle && <p className="text-[9.5px] sm:text-[10px] text-[var(--mn-text-muted)] font-semibold mt-0.5 leading-4">{subtitle}</p>}
      </div>
    </div>
  </div>
);

const EntityCard: React.FC<{
  item: CountryEntityRef;
  onClick?: () => void;
  icon: React.ReactNode;
}> = ({ item, onClick, icon }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!onClick}
    className="min-w-[154px] max-w-[176px] flex-1 rounded-2xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface)] mn-dark:bg-[var(--mn-surface-elevated)] p-3 text-right shadow-2xs transition-all enabled:hover:border-[var(--mn-border-brand)] enabled:active:scale-[0.99] disabled:cursor-default mn-panel mn-dark:mn-panel "
  >
    <div className="flex items-start gap-2">
      <div className="w-7 h-7 rounded-lg bg-[var(--mn-page)] border border-[var(--mn-border-brand)]/20 flex items-center justify-center text-[var(--mn-accent-text)] shrink-0 mn-panel ">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] sm:text-[11px] font-black text-[var(--mn-heading)] leading-5 line-clamp-2">{item.name}</p>
        {item.nameEn && <p className="text-[8.5px] text-[var(--mn-text-muted)] font-bold truncate mt-0.5" dir="ltr">{item.nameEn}</p>}
      </div>
    </div>
    {item.meta && <p className="mt-2 text-[9px] leading-4 font-semibold text-[var(--mn-text-muted)] line-clamp-2">{item.meta}</p>}
  </button>
);

export const CountryDetailModal: React.FC<CountryDetailModalProps> = ({
  country,
  onClose,
  onOpenUniversity,
  onOpenScholarship,
  onOpenMajor,
  onOpenExam,
  onBrowseScholarships,
  onOpenArticle,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const facts = [
    { label: 'العاصمة', value: country.capitalCity || country.popularCities[0] || 'غير متوفر', icon: <MapPin className="w-3.5 h-3.5" /> },
    { label: 'العملة', value: country.currencyCode || 'غير متوفر', icon: <Banknote className="w-3.5 h-3.5" /> },
    { label: 'رمز الدولة', value: [country.iso2Code, country.iso3Code].filter(Boolean).join(' / ') || 'غير متوفر', icon: <Flag className="w-3.5 h-3.5" /> },
    { label: 'الاتصال', value: country.callingCode || 'غير متوفر', icon: <Phone className="w-3.5 h-3.5" /> },
    { label: 'اللغة الرسمية', value: country.officialLanguages?.join('، ') || country.languageOfStudy[0] || 'غير متوفر', icon: <Languages className="w-3.5 h-3.5" /> },
    { label: 'المنطقة', value: country.subregion || country.continent, icon: <Globe2 className="w-3.5 h-3.5" /> },
    { label: 'التوقيت', value: country.timezones?.join('، ') || 'غير متوفر', icon: <Globe2 className="w-3.5 h-3.5" /> },
    { label: 'لغات الدراسة', value: country.languageOfStudy.join('، ') || 'غير متوفر', icon: <Languages className="w-3.5 h-3.5" /> },
  ];

  const costItems = country.costHighlights?.length
    ? country.costHighlights
    : [
        { label: 'متوسط المعيشة', value: country.averageLivingCostUsd },
        { label: 'تصنيف التكلفة', value: country.livingCost },
      ];

  return (
    <div className="fixed inset-0 z-[70] bg-[var(--mn-page)] overflow-y-auto animate-fade-in font-['Cairo',sans-serif] mn-panel " dir="rtl">
      {/* Compact mobile-first hero */}
      <header className="relative overflow-hidden bg-gradient-to-b from-[var(--mn-primary)] via-[var(--mn-hero-secondary)] to-[var(--mn-primary)] text-white border-b-[3px] border-[var(--mn-accent)]/75 shadow-md mn-inverse ">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute -top-16 -left-12 w-52 h-52 rounded-full border border-[var(--mn-accent)]" />
          <div className="absolute -top-6 -left-4 w-64 h-64 rounded-full border border-[var(--mn-accent)]" />
          <div className="absolute -right-12 bottom-[-60px] w-52 h-52 rounded-full bg-black/25" />
        </div>

        <div className="relative max-w-4xl mx-auto px-3.5 sm:px-6 pt-3 pb-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/20 hover:bg-black/30 border border-white/15 flex items-center justify-center shrink-0 active:scale-95"
              aria-label="إغلاق تفاصيل الدولة"
            >
              <X className="w-4.5 h-4.5" />
            </button>
            <div className="flex items-center gap-2">
              {onToggleFavorite && (
                <FavoriteButton
                  active={isFavorite}
                  onToggle={(event) => {
                    event.stopPropagation();
                    onToggleFavorite(country.id);
                  }}
                  className="bg-[var(--mn-surface)]/95 mn-panel "
                />
              )}
              <div className="flex items-center gap-1.5 text-[9px] font-black text-[var(--mn-accent-text)] bg-white/10 border border-white/10 rounded-full px-2.5 py-1">
              <Sparkles className="w-3 h-3" />
                <span>وجهة دراسية</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[var(--mn-surface)] border-2 border-[var(--mn-accent)] shadow-md flex items-center justify-center text-3xl shrink-0 mn-panel ">
              {country.flagEmoji}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-[22px] sm:text-2xl font-black leading-tight">{country.name}</h1>
              <p className="text-[11px] sm:text-xs font-bold text-[var(--mn-accent-text)] mt-0.5" dir="ltr">
                {country.nameEn}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-[9px] font-bold">{country.continent}</span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-[9px] font-bold">{country.universitiesCount} جامعة</span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-[9px] font-bold">{country.scholarshipsCount} منحة</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3.5 sm:px-6 py-3 pb-24 space-y-3">
        {/* 1. Canonical reference facts — dense 2-column tiles */}
        <section className="grid grid-cols-2 gap-2">
          {facts.map((fact) => (
            <div key={fact.label} className="rounded-xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface)] mn-dark:bg-[var(--mn-surface-elevated)] px-2.5 py-2.5 shadow-2xs min-h-[58px] mn-panel mn-dark:mn-panel ">
              <div className="flex items-center gap-1.5 text-[var(--mn-accent-text)] mb-1">
                {fact.icon}
                <span className="text-[8.5px] font-black text-[var(--mn-text-muted)]">{fact.label}</span>
              </div>
              <p className="text-[10px] sm:text-[10.5px] font-black text-[var(--mn-heading)] leading-4 line-clamp-2">{fact.value}</p>
            </div>
          ))}
        </section>

        {/* 2. Overview */}
        <section className="rounded-2xl border border-[var(--mn-border-brand)]/25 bg-[var(--mn-surface-muted)] mn-dark:bg-[var(--mn-surface)] px-3 py-3 shadow-2xs mn-panel mn-dark:mn-panel ">
          <SectionTitle icon={<Globe2 className="w-4 h-4" />} title={`الدراسة في ${country.name}`} subtitle="نظرة سريعة تساعد الطالب على تقييم الوجهة" />
          <p className="text-[10.5px] sm:text-[11px] leading-[1.9] font-semibold text-[var(--mn-text)] mn-dark:text-[var(--mn-text)]">{country.description}</p>
          {country.studySystemSummary && (
            <p className="mt-2 pt-2 border-t border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] text-[10px] leading-[1.8] font-semibold text-[var(--mn-text-muted)] mn-dark:text-[var(--mn-text-muted)]">
              {country.studySystemSummary}
            </p>
          )}
        </section>

        {/* 3. Universities — horizontal cards */}
        {country.featuredUniversities && country.featuredUniversities.length > 0 && (
          <section className="rounded-2xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface-muted)] mn-dark:bg-[var(--mn-surface)] px-3 py-3 shadow-2xs mn-panel mn-dark:mn-panel ">
            <SectionTitle icon={<Building2 className="w-4 h-4" />} title="جامعات بارزة" subtitle="روابط داخلية إلى قالب الجامعة" />
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {country.featuredUniversities.map((item) => (
                <EntityCard key={item.id} item={item} icon={<Building2 className="w-3.5 h-3.5" />} onClick={onOpenUniversity ? () => onOpenUniversity(item.id) : undefined} />
              ))}
            </div>
          </section>
        )}

        {/* 4. Scholarships */}
        {country.featuredScholarships && country.featuredScholarships.length > 0 && (
          <section className="rounded-2xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface-muted)] mn-dark:bg-[var(--mn-surface)] px-3 py-3 shadow-2xs mn-panel mn-dark:mn-panel ">
            <div className="flex items-start justify-between gap-2 mb-2">
              <SectionTitle icon={<GraduationCap className="w-4 h-4" />} title="منح دراسية" subtitle="منح مرتبطة بهذه الدولة" />
              {onBrowseScholarships && (
                <button type="button" onClick={() => onBrowseScholarships(country.name)} className="text-[9px] font-black text-[var(--mn-heading)] border border-[var(--mn-border-brand)]/30 bg-[var(--mn-page)] rounded-full px-2 py-1 whitespace-nowrap mn-panel ">
                  عرض الكل
                </button>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {country.featuredScholarships.map((item) => (
                <EntityCard key={item.id} item={item} icon={<GraduationCap className="w-3.5 h-3.5" />} onClick={onOpenScholarship ? () => onOpenScholarship(item.id) : undefined} />
              ))}
            </div>
          </section>
        )}

        {/* 5. Majors */}
        {country.featuredMajors && country.featuredMajors.length > 0 && (
          <section className="rounded-2xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface-muted)] mn-dark:bg-[var(--mn-surface)] px-3 py-3 shadow-2xs mn-panel mn-dark:mn-panel ">
            <SectionTitle icon={<BookOpen className="w-4 h-4" />} title="تخصصات بارزة للدراسة" subtitle="علاقة مشتقة من برامج الجامعات في الدولة" />
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {country.featuredMajors.map((item) => (
                <EntityCard key={item.id} item={item} icon={<BookOpen className="w-3.5 h-3.5" />} onClick={onOpenMajor ? () => onOpenMajor(item.id) : undefined} />
              ))}
            </div>
          </section>
        )}

        {/* 6. Admission + tests in compact horizontal blocks */}
        <section className="rounded-2xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface-muted)] mn-dark:bg-[var(--mn-surface)] px-3 py-3 shadow-2xs mn-panel mn-dark:mn-panel ">
          <SectionTitle icon={<FileCheck2 className="w-4 h-4" />} title="القبول والاختبارات" subtitle="المتطلبات النهائية تختلف حسب الجامعة والبرنامج" />
          {country.admissionHighlights && country.admissionHighlights.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-2.5">
              {country.admissionHighlights.map((item, index) => (
                <div key={index} className="rounded-xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface)] px-2.5 py-2 flex items-start gap-1.5 min-h-[66px] mn-panel ">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--mn-accent-text)] mt-0.5 shrink-0" />
                  <p className="text-[9px] sm:text-[9.5px] font-semibold leading-[1.7] text-[var(--mn-text-muted)] mn-dark:text-[var(--mn-text-muted)]">{item}</p>
                </div>
              ))}
            </div>
          )}
          {country.requiredExams && country.requiredExams.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {country.requiredExams.map((item) => (
                <EntityCard key={item.id} item={item} icon={<Languages className="w-3.5 h-3.5" />} onClick={onOpenExam ? () => onOpenExam(item.id) : undefined} />
              ))}
            </div>
          )}
        </section>

        {/* 7. Visa */}
        <section className="rounded-2xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface-muted)] mn-dark:bg-[var(--mn-surface)] px-3 py-3 shadow-2xs mn-panel mn-dark:mn-panel ">
          <SectionTitle icon={<ShieldCheck className="w-4 h-4" />} title="التأشيرة وشروط الدراسة" subtitle={country.visaEase} />
          <div className="grid grid-cols-2 gap-2">
            {(country.visaHighlights?.length ? country.visaHighlights : [country.visaEase]).map((item, index) => (
              <div key={index} className="rounded-xl bg-[var(--mn-surface)] border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] px-2.5 py-2 min-h-[58px] flex items-start gap-1.5 mn-panel ">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--mn-accent-text)] mt-0.5 shrink-0" />
                <p className="text-[9px] sm:text-[9.5px] font-semibold leading-[1.7] text-[var(--mn-text-muted)] mn-dark:text-[var(--mn-text-muted)]">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 8. Cost */}
        <section className="rounded-2xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface-muted)] mn-dark:bg-[var(--mn-surface)] px-3 py-3 shadow-2xs mn-panel mn-dark:mn-panel ">
          <SectionTitle icon={<WalletCards className="w-4 h-4" />} title="تكاليف المعيشة والدراسة" />
          <div className="grid grid-cols-2 gap-2">
            {costItems.map((item) => (
              <div key={item.label} className="rounded-xl bg-[var(--mn-surface)] border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] px-2.5 py-2.5 min-h-[58px] mn-panel ">
                <p className="text-[8.5px] font-black text-[var(--mn-text-muted)]">{item.label}</p>
                <p className="text-[10px] font-black text-[var(--mn-heading)] mt-1 leading-4">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 9. Student cities and life */}
        <section className="rounded-2xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface-muted)] mn-dark:bg-[var(--mn-surface)] px-3 py-3 shadow-2xs mn-panel mn-dark:mn-panel ">
          <SectionTitle icon={<Users className="w-4 h-4" />} title="المدن والحياة الطلابية" />
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none mb-2.5">
            {country.popularCities.map((city) => (
              <div key={city} className="min-w-[104px] rounded-xl bg-[var(--mn-surface)] border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] px-2.5 py-2 text-center mn-panel ">
                <MapPin className="w-3.5 h-3.5 text-[var(--mn-accent-text)] mx-auto mb-1" />
                <p className="text-[9.5px] font-black text-[var(--mn-heading)]">{city}</p>
              </div>
            ))}
          </div>
          {country.studentLifeHighlights && (
            <div className="grid grid-cols-2 gap-2">
              {country.studentLifeHighlights.map((item, index) => (
                <div key={index} className="rounded-xl bg-[var(--mn-surface)] border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] p-2.5 flex gap-1.5 items-start mn-panel ">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--mn-accent-text)] shrink-0 mt-0.5" />
                  <p className="text-[9px] leading-[1.7] font-semibold text-[var(--mn-text-muted)] mn-dark:text-[var(--mn-text-muted)]">{item}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <RelatedArticlesStrip articles={country.relatedArticles} onOpenArticle={onOpenArticle} />

        {/* 10. Official links; source/audit and SEO stay admin-only */}
        {country.officialLinks && country.officialLinks.length > 0 && (
          <section className="rounded-2xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface-muted)] mn-dark:bg-[var(--mn-surface)] px-3 py-3 shadow-2xs mn-panel mn-dark:mn-panel ">
            <SectionTitle icon={<ExternalLink className="w-4 h-4" />} title="روابط رسمية" subtitle="مصادر حكومية أو رسمية مرتبطة بالدراسة" />
            <div className="grid grid-cols-2 gap-2">
              {country.officialLinks.map((link) => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-[var(--mn-border-brand)]/30 bg-[var(--mn-surface)] px-2.5 py-2.5 min-h-[62px] flex items-start gap-2 hover:border-[var(--mn-accent)] transition-colors mn-panel ">
                  <ExternalLink className="w-3.5 h-3.5 text-[var(--mn-accent-text)] mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9.5px] font-black text-[var(--mn-heading)] leading-4">{link.label}</p>
                    {link.note && <p className="text-[8.5px] font-semibold text-[var(--mn-text-muted)] mt-0.5 leading-4">{link.note}</p>}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {onBrowseScholarships && (
          <button
            type="button"
            onClick={() => onBrowseScholarships(country.name)}
            className="w-full min-h-11 rounded-xl bg-gradient-to-r from-[var(--mn-primary)] via-[var(--mn-hero-secondary)] to-[var(--mn-primary)] text-white font-black text-[11px] flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] mn-inverse "
          >
            <GraduationCap className="w-4 h-4 text-[var(--mn-accent-text)]" />
            <span>استعرض جميع منح {country.name}</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </main>
    </div>
  );
};

