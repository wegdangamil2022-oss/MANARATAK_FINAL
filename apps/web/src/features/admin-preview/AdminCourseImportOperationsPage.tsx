import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Database,
  FileSearch,
  Loader2,
  Play,
  RefreshCw,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react';
import { ApiClient } from '../../api/client';

type Overview = {
  providersTotal: number;
  providersApproved: number;
  batchesTotal: number;
  recordsTotal: number;
  reviewRequired: number;
  transferred: number;
  latestBatch?: any;
};

export function AdminCourseImportOperationsPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [review, setReview] = useState<any>({ data: [], total: 0, page: 1, pageSize: 25, totalPages: 0 });
  const [assetId, setAssetId] = useState('');
  const [expectedSha256, setExpectedSha256] = useState('');
  const [preflight, setPreflight] = useState<any>(null);
  const [transferResult, setTransferResult] = useState<any>(null);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, providerData, batchData, reviewData] = await Promise.all([
        ApiClient.getCourseImportOverview(),
        ApiClient.getCourseImportProviders(),
        ApiClient.getCourseImportBatches(),
        ApiClient.getCourseImportReviewQueue({ page: 1, pageSize: 25 }),
      ]);
      setOverview(overviewData);
      setProviders(Array.isArray(providerData?.data) ? providerData.data : []);
      setBatches(Array.isArray(batchData) ? batchData : []);
      setReview(reviewData);
      if (!selectedBatchId && Array.isArray(batchData) && batchData[0]?.id) {
        setSelectedBatchId(batchData[0].id);
      }
    } catch (err: any) {
      setError(err?.message || 'تعذر تحميل مركز عمليات استيراد الدورات.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = async (name: string, fn: () => Promise<any>, onSuccess?: (value: any) => void) => {
    setBusy(name);
    setError(null);
    try {
      const value = await fn();
      onSuccess?.(value);
      await load();
    } catch (err: any) {
      setError(err?.message || 'تعذر تنفيذ العملية.');
    } finally {
      setBusy(null);
    }
  };

  const artifactPayload = () => ({
    assetId: assetId.trim(),
    expectedSha256: expectedSha256.trim() || undefined,
    sourceSystem: 'COURSE_MASTER_ARTIFACT',
  });

  const stats = overview ? [
    ['المزودون', overview.providersTotal],
    ['المزودون المعتمدون', overview.providersApproved],
    ['دفعات الاستيراد', overview.batchesTotal],
    ['السجلات المرحلية', overview.recordsTotal],
    ['تحتاج مراجعة', overview.reviewRequired],
    ['تم تحويلها', overview.transferred],
  ] : [];

  return (
    <main dir="rtl" className="min-h-screen bg-[#f8fafc] px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-bold text-slate-500">
            <Link to="/admin/imports" className="hover:text-[#0F4B3A]">الاستيراد</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900">مركز عمليات استيراد الدورات</span>
          </div>
          <Link to="/admin/courses/imported" className="rounded-xl bg-slate-900 px-4 py-3 text-xs font-black text-white">
            عرض الدورات المستوردة
          </Link>
        </div>

        <header className="rounded-3xl bg-gradient-to-r from-[#0F4B3A] via-[#155e49] to-[#0a382b] p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-emerald-200">
                <Database className="h-4 w-4" /> Import Operations Center
              </div>
              <h1 className="mt-2 text-2xl font-black sm:text-4xl">مركز عمليات استيراد الدورات</h1>
              <p className="mt-2 max-w-3xl text-sm font-bold leading-7 text-emerald-100">
                فحص الملف، إنشاء الدفعات، مراجعة الاختلافات، ومتابعة التحويل إلى Course عبر مسار WP-IC-05 الذري.
              </p>
            </div>
            <button onClick={() => void load()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-black">
              <RefreshCw className="h-4 w-4" /> تحديث
            </button>
          </div>
        </header>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-black text-rose-900">
            <AlertCircle className="h-5 w-5" /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-56 items-center justify-center gap-2 rounded-2xl border bg-white text-sm font-black text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-[#0F4B3A]" /> تحميل البيانات التشغيلية...
          </div>
        ) : (
          <>
            <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {stats.map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                  <div className="text-2xl font-black text-[#0F4B3A]">{value}</div>
                  <div className="mt-1 text-[11px] font-bold text-slate-500">{label}</div>
                </div>
              ))}
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <FileSearch className="h-5 w-5 text-[#0F4B3A]" />
                  <h2 className="text-lg font-black">Preflight وتهيئة الدفعة</h2>
                </div>
                <p className="mt-2 text-xs font-bold leading-6 text-slate-500">
                  استخدم Asset ID من منصة الأصول. لا يتم رفع ملف جديد أو تخزينه داخل هذا المركز.
                </p>
                <div className="mt-4 space-y-3">
                  <input value={assetId} onChange={(event) => setAssetId(event.target.value)} placeholder="Asset ID" className="w-full rounded-xl border border-slate-200 p-3 text-sm font-bold" dir="ltr" />
                  <input value={expectedSha256} onChange={(event) => setExpectedSha256(event.target.value)} placeholder="Expected SHA-256 (اختياري)" className="w-full rounded-xl border border-slate-200 p-3 text-sm font-bold" dir="ltr" />
                  <div className="flex flex-wrap gap-2">
                    <button
                      disabled={busy !== null || !assetId.trim()}
                      onClick={() => run('preflight', () => ApiClient.preflightCourseImport(artifactPayload()), setPreflight)}
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-slate-100 px-4 text-xs font-black disabled:opacity-50"
                    >
                      <ShieldCheck className="h-4 w-4" /> فحص Preflight
                    </button>
                    <button
                      disabled={busy !== null || !assetId.trim()}
                      onClick={() => run('stage', () => ApiClient.createCourseImportBatch(artifactPayload()), (value) => {
                        setPreflight(value?.preflight || null);
                        const batchId = value?.staging?.batch?.id || value?.existingBatchId;
                        if (batchId) setSelectedBatchId(batchId);
                      })}
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#0F4B3A] px-4 text-xs font-black text-white disabled:opacity-50"
                    >
                      <UploadCloud className="h-4 w-4" /> إنشاء/إعادة استخدام الدفعة
                    </button>
                  </div>
                </div>

                {preflight && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs font-bold">
                    <div className="flex items-center gap-2">
                      {preflight.valid ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-rose-600" />}
                      <span>{preflight.valid ? 'الملف اجتاز فحص preflight' : 'الملف يحتوي موانع قبل staging'}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <div>الصفوف: {preflight.summary?.rowsFound ?? 0}</div>
                      <div>الصالحة: {preflight.summary?.validRows ?? 0}</div>
                      <div>الناقصة: {preflight.summary?.incompleteRows ?? 0}</div>
                      <div>المزودون: {preflight.summary?.providersDiscovered ?? 0}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-[#0F4B3A]" />
                  <h2 className="text-lg font-black">التحويل المتحكم به</h2>
                </div>
                <p className="mt-2 text-xs font-bold leading-6 text-slate-500">
                  التحويل يستخدم CourseImportCoordinator من WP-IC-05. الحد الافتراضي 50 سجلًا في الطلب الواحد ولا ينشر الدورات تلقائيًا.
                </p>
                <select value={selectedBatchId} onChange={(event) => setSelectedBatchId(event.target.value)} className="mt-4 w-full rounded-xl border border-slate-200 p-3 text-sm font-bold">
                  <option value="">اختر دفعة</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>{batch.id} — {batch.batchStatus} — {batch.totalRecords}</option>
                  ))}
                </select>
                <button
                  disabled={busy !== null || !selectedBatchId}
                  onClick={() => run('transfer', () => ApiClient.transferCourseImportBatch(selectedBatchId, { limit: 50 }), setTransferResult)}
                  className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white disabled:opacity-50"
                >
                  <Play className="h-4 w-4" /> تحويل الدفعة الحالية
                </button>
                {transferResult && (
                  <div className="mt-4 rounded-xl bg-slate-50 p-4 text-xs font-bold">
                    <div>المحاولة: {transferResult.attempted}</div>
                    <div>تم التحويل: {transferResult.transferred}</div>
                    <div>محجوب/فشل: {transferResult.blockedOrFailed}</div>
                    {transferResult.hasMore && <div className="mt-2 text-amber-700">توجد سجلات إضافية؛ نفّذ دفعة تالية بعد مراجعة النتائج.</div>}
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black">سجل المزودين من Provider Registry</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {providers.map((provider) => (
                  <Link key={provider.id} to={`/admin/imports/courses/providers/${encodeURIComponent(provider.id)}`} className="block rounded-xl border border-slate-200 p-4 transition-colors hover:border-[#0F4B3A]/40 hover:bg-emerald-50/30">
                    <div className="font-black">{provider.displayName}</div>
                    <div className="mt-1 text-xs font-bold text-slate-500">{provider.status} — {provider.importStrategy}</div>
                    <div className="mt-2 text-[11px] font-bold text-slate-400">{Array.isArray(provider.allowedDomains) ? provider.allowedDomains.join(' • ') : ''}</div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-black">تاريخ الدفعات</h2>
                <div className="mt-4 space-y-2">
                  {batches.length === 0 && <div className="text-xs font-bold text-slate-500">لا توجد دفعات COURSES بعد.</div>}
                  {batches.slice(0, 20).map((batch) => (
                    <button key={batch.id} onClick={() => setSelectedBatchId(batch.id)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3 text-right text-xs hover:bg-slate-50">
                      <div>
                        <div className="font-black">{batch.id}</div>
                        <div className="mt-1 font-bold text-slate-500">{batch.sourceSystem}</div>
                      </div>
                      <div className="font-black">{batch.batchStatus} — {batch.totalRecords}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-black">قائمة المراجعة</h2>
                <div className="mt-4 space-y-2">
                  {review.data.length === 0 && <div className="text-xs font-bold text-slate-500">لا توجد سجلات مراجعة.</div>}
                  {review.data.map((item: any) => (
                    <div key={item.importRecordId} className="rounded-xl border border-slate-200 p-3 text-xs">
                      <div className="font-black">{item.courseName || item.importRecordId}</div>
                      <div className="mt-1 font-bold text-slate-500">{item.providerName || 'مزود غير محدد'} — {item.changeState || item.status}</div>
                      <div className="mt-1 break-all text-[11px] font-medium text-slate-400">{item.directCourseUrl || ''}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
