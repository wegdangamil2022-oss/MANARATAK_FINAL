import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiClient, PublicInternationalTestDto } from '../../api/client';
import { Button } from '@manaratak/ui';
import { RelatedPublicLinks } from '../../components/RelatedPublicLinks';
import { Seo } from '../../components/Seo';
import { useTranslation } from "../../i18n/I18nProvider";
import { 
  Globe, Calendar, GraduationCap, Monitor, Info, RefreshCw, 
  ShieldCheck, Star, BookOpen, Briefcase, FileText, Award, 
  Lightbulb, Languages, ArrowLeft, ArrowRight, CheckCircle2,
  Plane, School, IdCard, MoreHorizontal, Search, Scale,
  Clock, Coffee, HelpCircle, PenTool, MessageSquare, Headphones,
  Check, ClipboardList, Timer, ChevronDown, ExternalLink, MessageCircle,
  XCircle, UserX
} from 'lucide-react';

export function InternationalTestDetail() {
  const { t, language } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PublicInternationalTestDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTest = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const result = await ApiClient.getInternationalTestBySlug(slug);
        setData(result);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error fetching international test';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [slug, language]);

  if (loading) {
    return <div className="py-20 text-center text-gray-500">{t('loading_international_test_details') || 'Loading...'}</div>;
  }

  if (!data) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-500 font-bold mb-4">{error || (language === 'ar' ? 'الاختبار غير موجود' : 'Test not found')}</p>
        <Link to="/international-tests" className="text-emerald-700 font-bold hover:underline">
          {language === 'ar' ? 'العودة للاختبارات الدولية' : 'Back to International Tests'}
        </Link>
      </div>
    );
  }

  const isRtl = language === 'ar';

  const regLinks = data.officialLinks?.filter(l => l.linkType === 'REGISTRATION') || [];
  const infoLinks = data.officialLinks?.filter(l => l.linkType === 'INFORMATION') || [];
  const prepLinks = data.officialLinks?.filter(l => l.linkType === 'PREPARATION') || [];
  const scoreLinks = data.officialLinks?.filter(l => l.linkType === 'SCORE_REPORTING') || [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Seo title={data.displayName} description={`Official test information for ${data.displayName}.`} />
      <Link to="/international-tests" className="mb-4 inline-block text-sm font-bold text-emerald-700 hover:underline">
        {t('lt_back_to_international_tests') || 'Back'}
      </Link>
      
      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
        <div className="border-b bg-gradient-to-br from-indigo-50 to-white p-5 sm:p-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#044A37]">{t('international_test') || 'International Test'}</p>
          <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">{data.displayName}</h1>
          <p className="mb-4 mt-3 text-base leading-7 text-gray-600 sm:text-lg">{data.providerName} {data.testCode ? `- ${data.testCode}` : ''}</p>
          
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-[#044A37] px-3 py-2 font-bold text-white shadow-sm">{formatLabel(data.testCategory)}</span>
            {data.scoreScale?.overallMaximum !== undefined && (
               <span className="rounded-full bg-white px-3 py-2 font-bold shadow-sm">{t('score') || 'Score'}: {data.scoreScale.overallMinimum} - {data.scoreScale.overallMaximum}</span>
            )}
            {data.scoreScale?.resultValidityDurationMonths && (
               <span className="rounded-full bg-white px-3 py-2 font-bold shadow-sm">{t('valid') || 'Valid'}: {data.scoreScale.resultValidityDurationMonths} {t('months') || 'months'}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-3 lg:p-8">
          <div className="space-y-5 lg:col-span-2">
            
            {/* Variants */}
            {data.variants && data.variants.length > 0 && (
              <section className="rounded-2xl border bg-white p-5">
                <h2 className="text-xl font-bold mb-3">{isRtl ? 'أنماط التقديم' : 'Delivery Modes'}</h2>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {data.variants.map((v) => (
                    <li key={v.id} className="rounded-xl border bg-gray-50 p-4 leading-7 text-gray-700">
                      <strong>{v.variantName}</strong> - {formatLabel(v.deliveryMode)}
                      {v.isActive ? (
                        <span className="ml-2 text-green-600 text-xs">({isRtl ? 'نشط' : 'Active'})</span>
                      ) : (
                        <span className="ml-2 text-red-600 text-xs">({isRtl ? 'غير نشط' : 'Inactive'})</span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Sections */}
            {data.sections && data.sections.length > 0 && (
              <section className="rounded-2xl border bg-white p-5">
                <h2 className="text-xl font-bold mb-3">{isRtl ? 'أقسام الاختبار' : 'Test Sections'}</h2>
                <ul className="space-y-3">
                  {data.sections.sort((a,b)=>a.order-b.order).map(s => (
                    <li key={s.id} className="rounded-xl border bg-gray-50 p-4">
                      <div className="font-bold text-gray-900">{s.sectionName} <span className="text-gray-500 font-normal text-sm">({s.sectionType})</span></div>
                      <div className="text-sm text-gray-600 mt-1 flex gap-4">
                        {s.durationMinutes && <span>{s.durationMinutes} {isRtl ? 'دقيقة' : 'minutes'}</span>}
                        {(s.scoreMinimum !== undefined || s.scoreMaximum !== undefined) && (
                          <span>{isRtl ? 'الدرجة:' : 'Score:'} {s.scoreMinimum} - {s.scoreMaximum}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Preparation Materials */}
            {data.preparationMaterials && data.preparationMaterials.length > 0 && (
              <section className="rounded-2xl border bg-white p-5">
                <h2 className="text-xl font-bold mb-3">{isRtl ? 'مواد التحضير والاستعداد' : 'Preparation Materials'}</h2>
                <ul className="space-y-3">
                  {data.preparationMaterials.map((m) => (
                    <li key={m.id} className="rounded-xl border bg-gray-50 p-4">
                      <div className="font-bold text-gray-900">{m.title} <span className="text-xs px-2 py-1 bg-gray-200 rounded-md ml-2">{formatLabel(m.materialType)}</span></div>
                      {m.description && <p className="text-sm text-gray-600 mt-1">{m.description}</p>}
                      {m.url && <a href={m.url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm hover:underline mt-2 inline-block">{isRtl ? 'عرض المادة' : 'View Material'}</a>}
                      {!m.url && !m.assetId && <span className="text-gray-400 text-sm mt-2 block">{isRtl ? 'لا يوجد رابط متاح' : 'No link available'}</span>}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Additional Notes */}
            {(data.registrationRequirements || data.identificationRequirements || data.retakePolicy) && (
              <section className="rounded-2xl border bg-white p-5">
                <h2 className="text-xl font-bold mb-3">{isRtl ? 'ملاحظات هامة' : 'Important Notes'}</h2>
                <div className="space-y-4 text-sm text-gray-700">
                  {data.registrationRequirements && <div><strong className="block mb-1">{isRtl ? 'متطلبات التسجيل:' : 'Registration Requirements:'}</strong> {data.registrationRequirements}</div>}
                  {data.identificationRequirements && <div><strong className="block mb-1">{isRtl ? 'متطلبات الهوية:' : 'ID Requirements:'}</strong> {data.identificationRequirements}</div>}
                  {data.retakePolicy && <div><strong className="block mb-1">{isRtl ? 'سياسة إعادة الاختبار:' : 'Retake Policy:'}</strong> {data.retakePolicy}</div>}
                </div>
              </section>
            )}

          </div>
          
          <aside className="order-first space-y-6 lg:order-none">
            
            {/* Score Scale Summary */}
            {data.scoreScale && (
              <div className="rounded-2xl border bg-gray-50 p-5 lg:p-6">
                <h3 className="font-bold text-lg mb-4">{isRtl ? 'نظام الدرجات' : 'Score Scale'}</h3>
                <dl className="space-y-3 text-sm">
                  <SummaryRow label={isRtl ? 'النطاق' : 'Range'} value={`${data.scoreScale.overallMinimum} - ${data.scoreScale.overallMaximum}`} />
                  {data.scoreScale.cefrEquivalency && <SummaryRow label={isRtl ? 'معادلة CEFR' : 'CEFR'} value={data.scoreScale.cefrEquivalency} />}
                  {data.scoreScale.resultValidityDurationMonths && <SummaryRow label={isRtl ? 'الصلاحية' : 'Validity'} value={`${data.scoreScale.resultValidityDurationMonths} ${isRtl ? 'شهراً' : 'months'}`} />}
                </dl>
              </div>
            )}

            {/* Fees */}
            {data.fees && data.fees.length > 0 && (
              <div className="rounded-2xl border bg-gray-50 p-5 lg:p-6">
                <h3 className="font-bold text-lg mb-4">{isRtl ? 'رسوم الاختبار' : 'Test Fees'}</h3>
                <p className="text-xs text-gray-500 mb-4">{isRtl ? 'هذه رسوم تقديرية/وصفية فقط، ولا يتم تنفيذ أي دفع من هذه الصفحة.' : 'These fees are informational metadata only. No payment is executed on this page.'}</p>
                <ul className="space-y-3 text-sm">
                  {data.fees.map(f => (
                    <li key={f.id} className="flex justify-between border-b pb-2 last:border-0">
                      <span className="text-gray-600">{formatLabel(f.feeType)}</span>
                      <strong className="font-mono">{f.amount} {f.currencyCode}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Availability */}
            {data.availability && (
              <div className="rounded-2xl border bg-gray-50 p-5 lg:p-6">
                <h3 className="font-bold text-lg mb-4">{isRtl ? 'التوفر الجغرافي والإلكتروني' : 'Availability'}</h3>
                {data.availability.onlineAvailabilityRegions && data.availability.onlineAvailabilityRegions.length > 0 && (
                  <div className="mb-3 text-sm">
                    <strong className="block text-gray-700">{isRtl ? 'التوفر عبر الإنترنت' : 'Online Regions'}:</strong>
                    <span className="text-gray-600">{data.availability.onlineAvailabilityRegions.join(', ')}</span>
                  </div>
                )}
                {data.availability.availableCountryIds && data.availability.availableCountryIds.length > 0 && (
                  <div className="mb-3 text-sm">
                    <strong className="block text-gray-700">{isRtl ? 'الدول المتاحة' : 'Available Countries'}:</strong>
                    <span className="text-gray-600">{data.availability.availableCountryIds.join(', ')}</span>
                  </div>
                )}
              </div>
            )}

            {/* Links */}
            <div className="rounded-2xl border bg-blue-50 p-5 lg:p-6 space-y-3">
              <h3 className="font-bold text-lg mb-4 text-blue-900">{isRtl ? 'الروابط الرسمية' : 'Official Links'}</h3>
              {regLinks.map(l => (
                <a key={l.id} href={l.url} target="_blank" rel="noreferrer" className="block w-full rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-700">
                  {isRtl ? 'التسجيل الرسمي' : 'Official Registration'}
                </a>
              ))}
              {infoLinks.map(l => (
                <a key={l.id} href={l.url} target="_blank" rel="noreferrer" className="block w-full rounded-xl bg-white border border-blue-200 px-4 py-3 text-center text-sm font-bold text-blue-800 hover:bg-blue-100">
                  {isRtl ? 'المعلومات الرسمية' : 'Official Information'}
                </a>
              ))}
              {scoreLinks.map(l => (
                <a key={l.id} href={l.url} target="_blank" rel="noreferrer" className="block w-full rounded-xl bg-white border border-blue-200 px-4 py-3 text-center text-sm font-bold text-blue-800 hover:bg-blue-100">
                  {isRtl ? 'تقارير الدرجات' : 'Score Reporting'}
                </a>
              ))}
            </div>

          </aside>
        </div>
      </div>
      <RelatedPublicLinks current="tests" />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function formatLabel(value: string) {
  if (!value) return '';
  const translations: Record<string, string> = {
    'LANGUAGE': 'اختبار لغة',
    'ACADEMIC_ADMISSION': 'قبول جامعي',
    'GRADUATE_ADMISSION': 'قبول دراسات عليا',
    'PROFESSIONAL': 'ترخيص مهني',
    'LANGUAGE_PROFICIENCY': 'اختبار لغة',
    'UNDERGRAD_ADMISSION': 'قبول جامعي',
    'GRAD_ADMISSION': 'قبول دراسات عليا',
    'PROFESSIONAL_LICENSING': 'ترخيص مهني',
    'ACADEMIC_PLACEMENT': 'تحديد مستوى أكاديمي',
    'ONLINE': 'عبر الإنترنت',
    'IN_PERSON': 'حضوري',
    'HYBRID': 'هجين',
  };
  if (translations[value]) return translations[value];
  return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}
