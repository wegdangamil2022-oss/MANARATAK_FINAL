import { Award, CheckCircle2, ShieldCheck } from 'lucide-react';
import { AdminCertificateDto, AdminCertificateTemplateDto } from '../../../api/client';

type Props = {
  template: AdminCertificateTemplateDto;
  certificate?: Partial<AdminCertificateDto>;
  compact?: boolean;
};
export function CertificateCanvas({ template, certificate = {}, compact = false }: Props) {
  const accent = template.accentColor || '#075E45';
  const gold = template.secondaryColor || '#C9A227';
  const recipient = certificate.recipientDisplayName || 'اسم المتعلم الكامل';
  const course = certificate.courseDisplayName || 'مسار التميز المهني والمهارات المستقبلية';
  const serial = certificate.serialNumber || 'MNR-CRS-2026-DEMO7821';
  const code = certificate.verificationCode || 'MNR-DEMO-VERIFY';
  return (
    <article
      dir="rtl"
      className={`relative overflow-hidden bg-[#fffdf7] shadow-2xl ${compact ? 'rounded-xl p-5' : 'rounded-2xl p-8 sm:p-12'}`}
      style={{
        aspectRatio: template.layout === 'PORTRAIT' ? '0.707' : '1.414',
        border: `10px double ${accent}`,
      }}
    >
      <div
        className="absolute inset-3 border opacity-40 pointer-events-none"
        style={{ borderColor: gold }}
      />
      <div
        className="absolute -top-24 -right-24 h-52 w-52 rounded-full opacity-10"
        style={{ background: accent }}
      />
      <div
        className="absolute -bottom-24 -left-24 h-52 w-52 rounded-full opacity-10"
        style={{ background: gold }}
      />
      <div className="relative flex h-full flex-col justify-between text-center">
        <header
          className="flex items-start justify-between border-b pb-4"
          style={{ borderColor: `${gold}66` }}
        >
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Award style={{ color: gold }} />
              <strong style={{ color: accent }}>مـنـاراتـك</strong>
            </div>
            <p className="text-[10px] tracking-[0.25em] text-slate-500">MANARATAK CREDENTIALS</p>
          </div>
          <div className="rounded-full border-2 p-3" style={{ borderColor: gold, color: accent }}>
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div className="text-left text-[9px] text-slate-500">
            <p>رقم الشهادة</p>
            <strong className="font-mono" style={{ color: accent }}>
              {serial}
            </strong>
          </div>
        </header>
        <section className="space-y-3">
          <p className="text-[10px] font-semibold tracking-[0.35em]" style={{ color: gold }}>
            وثيقة إنجاز رقمية موثقة
          </p>
          <h1
            className={`${compact ? 'text-xl' : 'text-3xl sm:text-4xl'} font-black`}
            style={{ color: accent }}
          >
            {template.titleAr}
          </h1>
          <p className="text-[10px] font-bold tracking-[0.22em] text-slate-500">
            {template.titleEn}
          </p>
          <p className="text-xs text-slate-600">تُمنح بكل فخر إلى</p>
          <h2
            className={`${compact ? 'text-lg' : 'text-2xl sm:text-3xl'} mx-auto w-fit border-b-2 px-8 pb-1 font-black`}
            style={{ color: accent, borderColor: gold }}
          >
            {recipient}
          </h2>
          <p className="mx-auto max-w-2xl text-xs leading-6 text-slate-600">{template.bodyAr}</p>
          <h3 className={`${compact ? 'text-sm' : 'text-lg'} font-bold text-slate-900`}>
            {course}
          </h3>
          <p className="mx-auto max-w-xl text-[10px] leading-5 text-slate-500">{template.bodyEn}</p>
        </section>
        <footer
          className="grid grid-cols-3 items-end gap-3 border-t pt-4 text-[9px]"
          style={{ borderColor: `${gold}66` }}
        >
          <div>
            <div
              className="mx-auto mb-1 w-24 border-b pb-1 font-semibold"
              style={{ borderColor: accent }}
            >
              {template.signatoryNameAr || 'إدارة الاعتماد'}
            </div>
            <span className="text-slate-500">
              {template.signatoryTitleAr || 'توقيع رقمي معتمد'}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="relative grid h-14 w-14 place-items-center border-2 bg-white"
              style={{ borderColor: accent }}
            >
              <QrPreview value={code} color={accent} />
              <CheckCircle2 className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white text-emerald-600" />
            </div>
            <span className="mt-1 font-mono">{code}</span>
            <span className="text-slate-400">امسح للتحقق</span>
          </div>
          <div>
            <strong style={{ color: accent }}>
              {certificate.issuerName || template.issuerName}
            </strong>
            <p className="text-slate-500">
              تاريخ الإصدار:{' '}
              {certificate.issuedAt
                ? new Date(certificate.issuedAt).toLocaleDateString('ar')
                : new Date().toLocaleDateString('ar')}
            </p>
            <p className="font-mono text-slate-400">v{template.templateVersion}</p>
          </div>
        </footer>
      </div>
    </article>
  );
}

function QrPreview({ value, color }: { value: string; color: string }) {
  const size = 21;
  const seed = [...value].reduce((total, char) => (total * 31 + char.charCodeAt(0)) >>> 0, 2166136261);
  const finder = (x: number, y: number, ox: number, oy: number) => {
    const dx = x - ox; const dy = y - oy;
    return dx >= 0 && dx < 7 && dy >= 0 && dy < 7 && (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
  };
  const cells = Array.from({ length: size * size }, (_, index) => {
    const x = index % size; const y = Math.floor(index / size);
    const reserved = finder(x, y, 0, 0) || finder(x, y, size - 7, 0) || finder(x, y, 0, size - 7);
    const on = reserved || (((seed ^ (x * 374761393) ^ (y * 668265263)) >>> ((x + y) % 16)) & 1) === 1;
    return on ? <rect key={index} x={x} y={y} width="1" height="1" /> : null;
  });
  return <svg aria-label="معاينة رمز QR" viewBox={`0 0 ${size} ${size}`} className="h-11 w-11 bg-white p-0.5" fill={color} shapeRendering="crispEdges">{cells}</svg>;
}
