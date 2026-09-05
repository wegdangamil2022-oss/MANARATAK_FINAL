import { Award, CheckCircle2, ShieldCheck } from 'lucide-react';
import { createQrMatrix } from '@manaratak/shared';

export interface CertificateTemplatePreviewModel {
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  accentColor?: string | null;
  secondaryColor?: string | null;
  layout?: 'LANDSCAPE' | 'PORTRAIT' | string;
  templateVersion?: string | null;
  signatoryNameAr?: string | null;
  signatoryTitleAr?: string | null;
  issuerName?: string | null;
}

export interface CertificatePreviewModel {
  recipientDisplayName?: string | null;
  achievementDisplayName?: string | null;
  courseDisplayName?: string | null;
  learningPathDisplayName?: string | null;
  serialNumber?: string | null;
  verificationCode?: string | null;
  verificationUrl?: string | null;
  issuerName?: string | null;
  issuedAt?: string | Date | null;
}

export function CertificatePreview({
  template,
  certificate,
  compact = false,
}: {
  template: CertificateTemplatePreviewModel;
  certificate?: CertificatePreviewModel;
  compact?: boolean;
}) {
  const accent = template.accentColor || '#142B5F';
  const gold = template.secondaryColor || '#D6A43B';
  const recipient = certificate?.recipientDisplayName || 'اسم المتعلم الكامل';
  const achievement = certificate?.achievementDisplayName || certificate?.courseDisplayName || certificate?.learningPathDisplayName || 'اسم الدورة أو المسار التعليمي';
  const serial = certificate?.serialNumber || 'MNR-CRS-2026-PREVIEW';
  const code = certificate?.verificationCode || 'MNR-PREVIEW-VERIFY';
  const verificationUrl = certificate?.verificationUrl || `https://app.manaratak.org/certificates/verify?code=${encodeURIComponent(code)}`;
  const issuedAt = certificate?.issuedAt ? new Date(certificate.issuedAt) : new Date();

  return (
    <article
      dir="rtl"
      className={`relative overflow-hidden bg-[#fffdf7] text-right shadow-xl ${compact ? 'rounded-xl p-5' : 'rounded-2xl p-7 sm:p-10'}`}
      style={{
        aspectRatio: template.layout === 'PORTRAIT' ? '0.707' : '1.414',
        border: `8px solid ${accent}`,
        fontFamily: 'Cairo, sans-serif',
      }}
    >
      <div className="pointer-events-none absolute inset-2 border" style={{ borderColor: `${gold}99` }} />
      <div className="pointer-events-none absolute inset-4 border" style={{ borderColor: `${accent}22` }} />
      <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full opacity-[0.07]" style={{ background: accent }} />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-44 w-44 rounded-full opacity-[0.09]" style={{ background: gold }} />

      <div className="relative flex h-full flex-col justify-between text-center">
        <header className="flex items-start justify-between gap-4 border-b pb-3" style={{ borderColor: `${gold}66` }}>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Award className="h-6 w-6" style={{ color: gold }} />
              <strong className="text-lg" style={{ color: accent }}>مـنـارتـك</strong>
            </div>
            <p className="text-[9px] font-bold tracking-[0.28em] text-slate-500">MANARATAK</p>
          </div>
          <div className="rounded-full border-2 p-2.5" style={{ borderColor: gold, color: accent }}>
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="text-left text-[9px] text-slate-500" dir="ltr">
            <p>Certificate No.</p>
            <strong className="font-mono" style={{ color: accent }}>{serial}</strong>
          </div>
        </header>

        <section className={`${compact ? 'space-y-2' : 'space-y-3'}`}>
          <p className="text-[9px] font-black tracking-[0.28em]" style={{ color: gold }}>
            شهادة إتمام رقمية قابلة للتحقق
          </p>
          <h1 className={`${compact ? 'text-xl' : 'text-3xl sm:text-4xl'} font-black`} style={{ color: accent }}>
            {template.titleAr || 'شهادة إتمام'}
          </h1>
          <p className="text-[9px] font-black tracking-[0.2em] text-slate-500" dir="ltr">
            {template.titleEn || 'CERTIFICATE OF COMPLETION'}
          </p>
          <p className="text-[11px] text-slate-600">تُمنح إلى</p>
          <h2 className={`${compact ? 'text-lg' : 'text-2xl sm:text-3xl'} mx-auto w-fit border-b-2 px-7 pb-1 font-black`} style={{ color: accent, borderColor: gold }}>
            {recipient}
          </h2>
          <p className="mx-auto max-w-2xl text-[10px] leading-5 text-slate-600">
            {template.bodyAr || 'تشهد منصة منارتك بأن المتعلم قد أتم بنجاح متطلبات هذه الدورة واستحق شهادة الإتمام الرقمية القابلة للتحقق.'}
          </p>
          <h3 className={`${compact ? 'text-sm' : 'text-lg'} font-black text-slate-900`}>{achievement}</h3>
          {!compact ? (
            <p className="mx-auto max-w-xl text-[9px] leading-4 text-slate-500" dir="ltr">
              {template.bodyEn || 'MANARATAK confirms successful completion of the course requirements and issuance of this digitally verifiable certificate of completion.'}
            </p>
          ) : null}
        </section>

        <footer className="grid grid-cols-3 items-end gap-3 border-t pt-3 text-[8px]" style={{ borderColor: `${gold}66` }}>
          <div>
            <div className="mx-auto mb-1 w-24 border-b pb-1 font-bold" style={{ borderColor: accent }}>
              {template.signatoryNameAr || 'إدارة الشهادات — منارتك'}
            </div>
            <span className="text-slate-500">{template.signatoryTitleAr || 'توقيع الإصدار الرقمي'}</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="relative grid h-16 w-16 place-items-center bg-white p-1 ring-1 ring-slate-200">
              <QrCode value={verificationUrl} foreground={accent} />
              <CheckCircle2 className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white text-emerald-600" />
            </div>
            <span className="mt-1 max-w-[140px] truncate font-mono text-[7px]" dir="ltr">{code}</span>
            <span className="text-slate-400">امسح للتحقق</span>
          </div>
          <div>
            <strong style={{ color: accent }}>{certificate?.issuerName || template.issuerName || 'MANARATAK'}</strong>
            <p className="text-slate-500">تاريخ الإصدار: {issuedAt.toLocaleDateString('ar')}</p>
            <p className="font-mono text-slate-400" dir="ltr">Template v{template.templateVersion || '1.0.0'}</p>
          </div>
        </footer>
      </div>
    </article>
  );
}

function QrCode({ value, foreground }: { value: string; foreground: string }) {
  const matrix = createQrMatrix(value);
  const quiet = 4;
  const size = matrix.length + quiet * 2;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full bg-white" shapeRendering="crispEdges" aria-label="رمز QR للتحقق">
      <rect width={size} height={size} fill="white" />
      <g fill={foreground}>
        {matrix.flatMap((row, y) => row.map((dark, x) => dark ? <rect key={`${x}-${y}`} x={x + quiet} y={y + quiet} width="1" height="1" /> : null))}
      </g>
    </svg>
  );
}
