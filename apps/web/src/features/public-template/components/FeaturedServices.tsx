import React, { useState } from 'react';
import {
  ArrowUpLeft,
  Briefcase,
  Building2,
  ChevronLeft,
  FileText,
  GraduationCap,
} from 'lucide-react';
import { PUBLIC_SERVICES } from '../data/serviceData';
import { Service } from '../types';

interface FeaturedServicesProps {
  onViewAllClick?: () => void;
  onSelectService?: (service: Service) => void;
}

export const FeaturedServices: React.FC<FeaturedServicesProps> = ({
  onViewAllClick,
  onSelectService,
}) => {
  const [activeTab, setActiveTab] = useState<'student' | 'general'>('student');
  const services = PUBLIC_SERVICES.filter((service) => service.audience === activeTab);

  return (
    <section className="px-0.5 sm:px-1 py-3 w-full font-['Cairo',sans-serif]">
      <div className="relative overflow-hidden rounded-3xl border border-[var(--mn-border)] border-t-2 border-t-[var(--mn-accent)]/40 bg-gradient-to-b from-[var(--mn-surface)] to-[var(--mn-page)]/80 p-4 shadow-sm sm:p-5 mn-panel ">
        <div className="mb-5 flex flex-col items-center gap-4">
          <div className="text-center">
            <h3 className="inline-flex items-center justify-center gap-1.5 text-sm font-bold text-[var(--mn-heading)] sm:text-base">
              <Briefcase className="h-4 w-4 text-[var(--mn-accent-text)]" />
              <span>خدمات منارتك</span>
            </h3>
            <p className="mx-auto mt-1 max-w-xs text-[10px] font-medium text-[var(--mn-text-muted)] sm:text-xs">
              خدمات طلابية ودعم عام مرتبطة برحلة الدراسة والتقديم
            </p>
          </div>

          <div className="group relative w-full max-w-[320px] shrink-0 overflow-hidden rounded-[14px] p-[2px]">
            <div className="animate-button-orbit absolute inset-[-100%] bg-[conic-gradient(from_0deg,var(--mn-primary),var(--mn-accent),var(--mn-primary),var(--mn-accent),var(--mn-primary))]" />
            <div className="relative flex w-full rounded-xl bg-[var(--mn-page)] p-1 mn-panel ">
              <button
                type="button"
                onClick={() => setActiveTab('student')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[10px] font-bold transition-all sm:py-2 sm:text-xs ${
                  activeTab === 'student'
                    ? 'bg-[var(--mn-surface)] text-[var(--mn-heading)] shadow-sm ring-1 ring-[var(--mn-border)] mn-panel '
                    : 'text-[var(--mn-text-muted)] hover:bg-[var(--mn-surface-muted)]/50 hover:text-[var(--mn-text)]'
                }`}
              >
                <GraduationCap className={`h-3.5 w-3.5 ${activeTab === 'student' ? 'text-[var(--mn-accent-text)]' : 'text-[var(--mn-text-muted)]'}`} />
                <span>الخدمات الطلابية</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[10px] font-bold transition-all sm:py-2 sm:text-xs ${
                  activeTab === 'general'
                    ? 'bg-[var(--mn-surface)] text-[var(--mn-heading)] shadow-sm ring-1 ring-[var(--mn-border)] mn-panel '
                    : 'text-[var(--mn-text-muted)] hover:bg-[var(--mn-surface-muted)]/50 hover:text-[var(--mn-text)]'
                }`}
              >
                <Building2 className={`h-3.5 w-3.5 ${activeTab === 'general' ? 'text-[var(--mn-accent-text)]' : 'text-[var(--mn-text-muted)]'}`} />
                <span>العامة والدعم</span>
              </button>
            </div>
          </div>
        </div>

        <div key={activeTab} className="mt-4 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {services.map((service) => (
            <button
              type="button"
              key={service.id}
              onClick={() => onSelectService?.(service)}
              className="group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-3 text-right shadow-sm transition-all hover:border-[var(--mn-accent)]/30 hover:shadow-md mn-panel "
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--mn-primary)]/10 text-[var(--mn-heading)] transition-transform group-hover:scale-105 sm:h-14 sm:w-14">
                {activeTab === 'student' ? <GraduationCap className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="truncate text-xs font-bold text-[var(--mn-heading)] transition-colors group-hover:text-[var(--mn-heading)] sm:text-sm">
                  {service.title}
                </h4>
                <p className="mt-0.5 line-clamp-1 text-[10px] text-[var(--mn-text-muted)] sm:text-[11px]">{service.shortDescription}</p>
                <span className="mt-1 inline-flex items-center gap-1 text-[8.5px] font-black text-[var(--mn-accent-text)]">
                  عرض التفاصيل
                  <ChevronLeft className="h-3 w-3" />
                </span>
              </div>

              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--mn-page)] transition-all group-hover:bg-[var(--mn-primary)] mn-panel group-hover:mn-inverse ">
                <ArrowUpLeft className="h-3 w-3 text-[var(--mn-text-muted)] group-hover:text-white" />
              </div>
            </button>
          ))}
        </div>

        {onViewAllClick && (
          <div className="mt-5 flex w-full justify-center">
            <button
              type="button"
              onClick={onViewAllClick}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--mn-accent)]/50 bg-[var(--mn-surface)] px-6 py-2.5 text-xs font-bold text-[var(--mn-heading)] shadow-[0_0_15px_rgba(214,164,59,0.3)] transition-all hover:bg-[var(--mn-accent)]/10 hover:shadow-[0_0_25px_rgba(214,164,59,0.5)] active:scale-95 sm:w-auto sm:px-8 sm:py-3 sm:text-sm mn-panel "
            >
              <span>تصفح جميع الخدمات</span>
              <ChevronLeft className="h-4 w-4 text-[var(--mn-heading)] transition-transform group-hover:-translate-x-1" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
