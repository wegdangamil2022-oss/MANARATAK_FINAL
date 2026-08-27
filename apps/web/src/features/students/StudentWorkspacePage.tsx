import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ApiClient,
  MoneyAmountDto,
  StudentDashboardSummaryDto,
  StudentFinanceInvoiceDto,
  StudentFinancePaymentDto,
  StudentWorkspaceSnapshotDto,
} from '../../api/client';

type WorkspaceTab = 'HOME' | 'JOURNEY' | 'VAULT' | 'SETTINGS';

const tabs: Array<{ id: WorkspaceTab; label: string; icon: string }> = [
  { id: 'HOME', label: 'الرئيسية', icon: '⌂' },
  { id: 'JOURNEY', label: 'رحلتي', icon: '↗' },
  { id: 'VAULT', label: 'خزنتي', icon: '◇' },
  { id: 'SETTINGS', label: 'التحكم والخصوصية', icon: '⚙' },
];

export function StudentWorkspacePage() {
  const [studentReferenceId, setStudentReferenceId] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<StudentDashboardSummaryDto | null>(null);
  const [invoices, setInvoices] = useState<StudentFinanceInvoiceDto[]>([]);
  const [paymentsByInvoice, setPaymentsByInvoice] = useState<
    Record<string, StudentFinancePaymentDto[]>
  >({});
  const [tab, setTab] = useState<WorkspaceTab>('HOME');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [snapshots, setSnapshots] = useState<StudentWorkspaceSnapshotDto[]>([]);

  useEffect(() => {
    let active = true;
    async function loadWorkspace() {
      setLoading(true);
      setError(null);
      try {
        const identity = await ApiClient.getCurrentStudentIdentity();
        if (!active) return;
        setStudentReferenceId(identity.principalId);
        const [dashboardResult, invoiceResult, snapshotResult] = await Promise.allSettled([
          ApiClient.getMyStudentDashboard(),
          ApiClient.getStudentInvoices(identity.principalId),
          ApiClient.listMyStudentWorkspaceSnapshots(),
        ]);
        if (!active) return;
        if (dashboardResult.status === 'rejected') throw dashboardResult.reason;
        setDashboard(dashboardResult.value);
        setInvoices(invoiceResult.status === 'fulfilled' ? invoiceResult.value.data : []);
        setSnapshots(snapshotResult.status === 'fulfilled' ? snapshotResult.value : []);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : 'تعذر تحميل مساحة الطالب');
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadWorkspace();
    return () => {
      active = false;
    };
  }, [retryKey]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 12 ? 'صباح الخير' : hour < 18 ? 'مرحبًا بك' : 'مساء الخير';
  }, []);

  async function toggleInvoicePayments(invoiceId: string) {
    if (!studentReferenceId) return;
    if (paymentsByInvoice[invoiceId]) {
      setPaymentsByInvoice((current) => {
        const next = { ...current };
        delete next[invoiceId];
        return next;
      });
      return;
    }
    try {
      const payments = await ApiClient.getStudentInvoicePayments(studentReferenceId, invoiceId);
      setPaymentsByInvoice((current) => ({ ...current, [invoiceId]: payments }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر تحميل الدفعات');
    }
  }

  async function savePreferences(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dashboard || !studentReferenceId) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setNotice(null);
    setError(null);
    try {
      const workspace = await ApiClient.updateMyStudentWorkspace({
        expectedVersion: dashboard.workspace.version,
        displayName: String(form.get('displayName') || '').trim() || null,
        preferredLanguage: String(form.get('preferredLanguage') || 'ar'),
        timezone: String(form.get('timezone') || 'Asia/Aden'),
        theme: String(form.get('theme') || 'SYSTEM'),
        notificationMatrix: {
          inApp: form.get('notifyInApp') === 'on',
          email: form.get('notifyEmail') === 'on',
          push: form.get('notifyPush') === 'on',
          learning: form.get('notifyLearning') === 'on',
          certificates: form.get('notifyCertificates') === 'on',
          scholarships: form.get('notifyScholarships') === 'on',
          payments: form.get('notifyPayments') === 'on',
        },
        accessibilityPreferences: {
          textScale: String(form.get('textScale') || 'DEFAULT'),
          reduceMotion: form.get('reduceMotion') === 'on',
          highContrast: form.get('highContrast') === 'on',
        },
      });
      await ApiClient.updateMyStudentPrivacyConsent({
        expectedVersion: workspace.version,
        purpose: 'تحديث تفضيلات الخصوصية من مساحة الطالب',
        privacyPreferences: {
          retainSearchHistory: form.get('retainSearchHistory') === 'on',
          allowPersonalization: form.get('allowPersonalization') === 'on',
          allowProductAnalytics: form.get('allowProductAnalytics') === 'on',
          publicProfileEnabled: false,
        },
      });
      setDashboard(await ApiClient.getMyStudentDashboard());
      setNotice('حُفظت تفضيلاتك بأمان على جميع أجهزتك.');
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'تعذر حفظ الإعدادات';
      setNotice(null);
      setError(message.includes('VERSION_CONFLICT')
        ? 'تغيّرت الإعدادات في جلسة أخرى. تم تحديث البيانات؛ راجع اختياراتك ثم احفظ مجددًا.'
        : message);
      if (message.includes('VERSION_CONFLICT')) {
        try { setDashboard(await ApiClient.getMyStudentDashboard()); } catch { setRetryKey((value) => value + 1); }
      }
    } finally {
      setSaving(false);
    }
  }

  async function createCollection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!studentReferenceId) return;
    const form = new FormData(event.currentTarget);
    const name = String(form.get('collectionName') || '').trim();
    if (!name) return;
    setSaving(true);
    try {
      await ApiClient.createMyStudentCollection({
        name,
        description: String(form.get('collectionDescription') || '').trim() || undefined,
        color: '#087A55',
      });
      const refreshed = await ApiClient.getMyStudentDashboard();
      setDashboard(refreshed);
      event.currentTarget.reset();
      setNotice('أُنشئت المجموعة الجديدة.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر إنشاء المجموعة');
    } finally {
      setSaving(false);
    }
  }

  async function renameCollection(collectionId: string, currentName: string) {
    const name = window.prompt('الاسم الجديد للمجموعة', currentName)?.trim();
    if (!name || name === currentName) return;
    setSaving(true);
    try {
      await ApiClient.updateMyStudentCollection(collectionId, { name });
      setDashboard(await ApiClient.getMyStudentDashboard());
      setNotice('تم تحديث اسم المجموعة.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر تعديل المجموعة'); }
    finally { setSaving(false); }
  }

  async function deleteCollection(collectionId: string, name: string) {
    if (!window.confirm(`حذف مجموعة «${name}»؟ ستنتقل العناصر إلى المفضلة.`)) return;
    setSaving(true);
    try {
      await ApiClient.deleteMyStudentCollection(collectionId);
      setDashboard(await ApiClient.getMyStudentDashboard());
      setNotice('حُذفت المجموعة ونُقلت عناصرها بأمان إلى المفضلة.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر حذف المجموعة'); }
    finally { setSaving(false); }
  }

  async function moveSavedItem(itemId: string, collectionId: string | null) {
    setSaving(true);
    try {
      await ApiClient.moveMyStudentSavedItem(itemId, collectionId);
      setDashboard(await ApiClient.getMyStudentDashboard());
      setNotice('تم نقل العنصر إلى المجموعة المختارة.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر نقل العنصر'); }
    finally { setSaving(false); }
  }

  async function createSnapshot() {
    if (!studentReferenceId) return;
    setSaving(true);
    try {
      await ApiClient.createMyStudentWorkspaceSnapshot('نسخة إعداداتي');
      setSnapshots(await ApiClient.listMyStudentWorkspaceSnapshots());
      setNotice('حُفظت نسخة آمنة من إعدادات مساحة العمل.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر حفظ النسخة');
    } finally {
      setSaving(false);
    }
  }

  async function restoreSnapshot(snapshotId: string) {
    if (!dashboard) return;
    setSaving(true);
    try {
      const workspace = await ApiClient.restoreMyStudentWorkspaceSnapshot(snapshotId, dashboard.workspace.version);
      setDashboard((current) => current ? { ...current, workspace } : current);
      setNotice('تمت استعادة نسخة الإعدادات مع التحقق من تعارض الإصدارات.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر استعادة النسخة'); }
    finally { setSaving(false); }
  }

  async function resetLayout() {
    if (!dashboard) return;
    setSaving(true);
    try {
      const workspace = await ApiClient.resetMyStudentDashboardLayout(dashboard.workspace.version);
      setDashboard((current) => current ? { ...current, workspace } : current);
      setNotice('أُعيد تخطيط اللوحة إلى الإعدادات الآمنة.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر إعادة التخطيط'); }
    finally { setSaving(false); }
  }

  async function clearSearchHistory() {
    if (!studentReferenceId) return;
    setSaving(true);
    try {
      await ApiClient.clearMyStudentSearchHistory();
      setNotice('مُسح سجل البحث الشخصي.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'تعذر مسح سجل البحث');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <WorkspaceSkeleton />;

  if (error && !dashboard) {
    return (
      <main dir="rtl" className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="rounded-[2rem] border border-[#d6ae57]/35 bg-white p-10 shadow-sm">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[#eaf1f8] text-3xl">
            🔒
          </div>
          <h1 className="text-2xl font-black text-slate-900">مساحة الطالب محمية</h1>
          <p className="mt-3 leading-7 text-slate-600">{error}</p>
          <div className="mt-7 flex justify-center gap-3">
            <Link
              to="/login"
              className="rounded-xl bg-[#0b3763] px-6 py-3 font-bold text-white hover:bg-[#071d3a]"
            >
              تسجيل الدخول
            </Link>
            <button
              type="button"
              onClick={() => setRetryKey((value) => value + 1)}
              className="rounded-xl border border-slate-200 px-6 py-3 font-bold text-slate-700"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!dashboard) return null;
  const { workspace, statistics } = dashboard;
  const notifications = (workspace.notificationMatrix || {}) as Record<string, boolean>;
  const privacy = (workspace.privacyPreferences || {}) as Record<string, boolean>;
  const accessibility = (workspace.accessibilityPreferences || {}) as Record<string, unknown>;

  return (
    <main dir="rtl" className="min-h-screen bg-[#f7f9fc] pb-16 text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#071d3a] via-[#0b3763] to-[#123f6b] text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 30%, #f1c75b 0 2px, transparent 3px)',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="flex items-center gap-5">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl border border-white/20 bg-white/10 text-3xl font-black shadow-inner">
                {(workspace.displayName || 'ط').trim().charAt(0)}
              </div>
              <div>
                <p className="mb-2 text-sm font-bold text-[#e3bd67]">{greeting}</p>
                <h1 className="text-3xl font-black sm:text-4xl">
                  {workspace.displayName || 'طالب مناراتك'}
                </h1>
                <p className="mt-2 max-w-2xl text-blue-100/80">
                  مساحتك الخاصة لتنظيم التعلم والفرص والشهادات والقرارات المهمة.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/15 bg-black/10 p-2 backdrop-blur">
              <HeroMetric label="التقدم" value={`${statistics.averageCourseProgress}%`} />
              <HeroMetric label="الدورات" value={String(statistics.activeCourses)} />
              <HeroMetric label="الشهادات" value={String(statistics.certificates)} />
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-0 z-20 border-b border-blue-100 bg-white/95 shadow-sm backdrop-blur">
        <nav
          aria-label="أقسام مساحة الطالب"
          className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8"
        >
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              aria-current={tab === item.id ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${tab === item.id ? 'bg-[#0b3763] text-white shadow' : 'text-slate-600 hover:bg-blue-50 hover:text-[#0b3763]'}`}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {error && <Alert tone="error" message={error} onClose={() => setError(null)} />}
        {notice && <Alert tone="success" message={notice} onClose={() => setNotice(null)} />}
        {dashboard.partialFailures.length > 0 && (
          <Alert
            tone="warning"
            message="بعض البطاقات غير متاحة مؤقتًا، لكن بقية مساحة العمل تعمل بصورة طبيعية."
          />
        )}

        {tab === 'HOME' && (
          <HomeView
            dashboard={dashboard}
            invoices={invoices}
            paymentsByInvoice={paymentsByInvoice}
            onTogglePayments={toggleInvoicePayments}
          />
        )}
        {tab === 'JOURNEY' && <JourneyView dashboard={dashboard} />}
        {tab === 'VAULT' && (
          <VaultView dashboard={dashboard} saving={saving} onCreateCollection={createCollection} onRenameCollection={renameCollection} onDeleteCollection={deleteCollection} onMoveSavedItem={moveSavedItem} />
        )}
        {tab === 'SETTINGS' && (
          <SettingsView
            dashboard={dashboard}
            notifications={notifications}
            privacy={privacy}
            accessibility={accessibility}
            saving={saving}
            onSave={savePreferences}
            onSnapshot={createSnapshot}
            snapshots={snapshots}
            onRestoreSnapshot={restoreSnapshot}
            onResetLayout={resetLayout}
            onClearSearch={clearSearchHistory}
          />
        )}
      </div>
    </main>
  );
}

function HomeView({
  dashboard,
  invoices,
  paymentsByInvoice,
  onTogglePayments,
}: {
  dashboard: StudentDashboardSummaryDto;
  invoices: StudentFinanceInvoiceDto[];
  paymentsByInvoice: Record<string, StudentFinancePaymentDto[]>;
  onTogglePayments: (invoiceId: string) => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="ملخص الإنجاز">
          <StatCard
            icon="▶"
            label="دورات نشطة"
            value={dashboard.statistics.activeCourses}
            color="emerald"
          />
          <StatCard
            icon="✓"
            label="دورات مكتملة"
            value={dashboard.statistics.completedCourses}
            color="blue"
          />
          <StatCard
            icon="◇"
            label="عناصر محفوظة"
            value={dashboard.statistics.savedItems}
            color="amber"
          />
          <StatCard
            icon="✦"
            label="إشعارات جديدة"
            value={dashboard.statistics.unreadNotifications}
            color="violet"
          />
        </section>

        <Panel
          title="تابع من حيث توقفت"
          action={
            <Link to="/courses" className="text-sm font-bold text-emerald-700">
              كل الدورات
            </Link>
          }
        >
          {dashboard.courseEnrollments.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {dashboard.courseEnrollments.slice(0, 4).map((course) => (
                <CourseCard key={course.enrollmentId} course={course} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="📚"
              title="لم تبدأ دورة بعد"
              text="استكشف الدورات وابنِ أول خطوة في مسارك."
              href="/courses"
              action="استكشف الدورات"
            />
          )}
        </Panel>

        <Panel title="آخر ما حدث في رحلتك">
          <ActivityList items={[...dashboard.recentActivity, ...dashboard.timeline].slice(0, 6)} />
        </Panel>
      </div>

      <aside className="space-y-6">
        <Panel title="خطواتك التالية">
          <div className="space-y-3">
            {dashboard.quickActions.map((action, index) => (
              <Link
                key={action.id}
                to={action.href}
                className="group flex items-center gap-3 rounded-2xl border border-slate-100 p-4 hover:border-emerald-200 hover:bg-emerald-50/50"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 font-black text-emerald-800">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block text-sm">{action.label}</strong>
                  <span className="mt-1 block text-xs text-slate-500">{action.description}</span>
                </span>
                <span
                  aria-hidden="true"
                  className="text-emerald-700 transition group-hover:-translate-x-1"
                >
                  ←
                </span>
              </Link>
            ))}
          </div>
        </Panel>
        <Panel title="شاهدته مؤخرًا">
          {dashboard.recentlyViewed.length ? <div className="space-y-2">{dashboard.recentlyViewed.slice(0, 5).map((item) => (
            <Link key={item.id} to={item.entitySlug ? buildEntityLink(item.entityType, item.entitySlug) : '#'} className="block rounded-xl bg-slate-50 p-3 text-sm font-bold hover:bg-emerald-50">
              {arabicEntityType(item.entityType)} · {item.entitySlug || item.entityId}
            </Link>
          ))}</div> : <p className="text-sm text-slate-500">ستظهر هنا العناصر التي تفتحها بعد موافقتك على التحليلات.</p>}
        </Panel>
        <InvoicePanel
          invoices={invoices}
          paymentsByInvoice={paymentsByInvoice}
          onToggle={onTogglePayments}
        />
      </aside>
    </div>
  );
}

function JourneyView({ dashboard }: { dashboard: StudentDashboardSummaryDto }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Panel title="مساري التعليمي">
        {dashboard.courseEnrollments.length ? (
          <div className="space-y-4">
            {dashboard.courseEnrollments.map((course) => (
              <CourseCard key={course.enrollmentId} course={course} wide />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🧭"
            title="مسارك ينتظر البداية"
            text="عند التسجيل في دورة ستظهر هنا نسبة التقدم وآخر وصول."
            href="/courses"
            action="ابدأ التعلم"
          />
        )}
      </Panel>
      <div className="space-y-6">
        <Panel title="حصيلة الرحلة">
          <div className="space-y-4">
            <ProgressRow label="متوسط التقدم" value={dashboard.statistics.averageCourseProgress} />
            <ProgressRow
              label="الدورات المكتملة"
              value={dashboard.statistics.completedCourses ? 100 : 0}
            />
          </div>
        </Panel>
        <Panel title="السجل الشخصي">
          <ActivityList items={dashboard.timeline} />
        </Panel>
      </div>
    </div>
  );
}

function VaultView({
  dashboard,
  saving,
  onCreateCollection,
  onRenameCollection,
  onDeleteCollection,
  onMoveSavedItem,
}: {
  dashboard: StudentDashboardSummaryDto;
  saving: boolean;
  onCreateCollection: (event: FormEvent<HTMLFormElement>) => void;
  onRenameCollection: (collectionId: string, currentName: string) => void;
  onDeleteCollection: (collectionId: string, name: string) => void;
  onMoveSavedItem: (itemId: string, collectionId: string | null) => void;
}) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dashboard.collections.map((collection) => (
          <div
            key={collection.id}
            className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm"
          >
            <div className="mb-5 flex items-start justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-xl">
                ◇
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {collection.itemCount} عنصر
              </span>
            </div>
            <h3 className="font-black">{collection.name}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {collection.description || 'مجموعة شخصية لتنظيم اختياراتك'}
            </p>
            {collection.type === 'PERSONAL' && <div className="mt-4 flex gap-2">
              <button type="button" disabled={saving} onClick={() => onRenameCollection(collection.id, collection.name)} className="rounded-lg border px-3 py-1.5 text-xs font-bold text-emerald-800">تعديل الاسم</button>
              <button type="button" disabled={saving} onClick={() => onDeleteCollection(collection.id, collection.name)} className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-bold text-red-700">حذف</button>
            </div>}
          </div>
        ))}
        <form
          onSubmit={onCreateCollection}
          className="rounded-3xl border border-dashed border-emerald-300 bg-emerald-50/50 p-5"
        >
          <h3 className="font-black text-emerald-900">مجموعة جديدة</h3>
          <label className="mt-4 block text-xs font-bold text-slate-600" htmlFor="collectionName">
            اسم المجموعة
          </label>
          <input
            id="collectionName"
            name="collectionName"
            required
            maxLength={80}
            className="mt-2 w-full rounded-xl border border-emerald-100 bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-600"
            placeholder="مثال: منح أريد التقديم عليها"
          />
          <input
            name="collectionDescription"
            maxLength={240}
            className="mt-2 w-full rounded-xl border border-emerald-100 bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-600"
            placeholder="وصف اختياري"
          />
          <button
            disabled={saving}
            className="mt-3 w-full rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            إنشاء المجموعة
          </button>
        </form>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel
          title="محفوظاتي"
          action={
            <Link to="/scholarships" className="text-sm font-bold text-emerald-700">
              اكتشف فرصًا
            </Link>
          }
        >
          {dashboard.savedItems.length ? (
            <div className="divide-y divide-slate-100">
              {dashboard.savedItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-amber-700">
                    ★
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-emerald-700">
                      {arabicEntityType(item.entityType)}
                    </span>
                    <h3 className="truncate font-bold">{item.displayName || item.entityId}</h3>
                    {item.notes && <p className="mt-1 text-sm text-slate-500">{item.notes}</p>}
                  </div>
                  {item.entitySlug && (
                    <Link
                      to={buildEntityLink(item.entityType, item.entitySlug)}
                      className="rounded-lg border px-3 py-2 text-sm font-bold text-slate-600 hover:border-emerald-300"
                    >
                      فتح
                    </Link>
                  )}
                  <label className="sr-only" htmlFor={`move-${item.id}`}>نقل العنصر إلى مجموعة</label>
                  <select id={`move-${item.id}`} aria-label="نقل العنصر إلى مجموعة" value={item.collectionId ?? ''} disabled={saving} onChange={(event) => onMoveSavedItem(item.id, event.target.value || null)} className="rounded-lg border px-2 py-2 text-xs">
                    <option value="">دون مجموعة</option>
                    {dashboard.collections.map((collection) => <option key={collection.id} value={collection.id}>{collection.name}</option>)}
                  </select>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="☆"
              title="خزنتك فارغة"
              text="احفظ الدورات والمنح والجامعات والتخصصات للرجوع إليها."
              href="/scholarships"
              action="ابدأ الاستكشاف"
            />
          )}
        </Panel>
        <Panel title="شهاداتي">
          {dashboard.certificates.length ? (
            <div className="space-y-3">
              {dashboard.certificates.map((certificate) => (
                <div
                  key={certificate.id}
                  className="rounded-2xl border border-emerald-100 bg-gradient-to-l from-white to-emerald-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🏅</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold">{certificate.courseDisplayName}</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        صدرت في {formatDate(certificate.issuedAt)}
                      </p>
                      <p className="mt-1 truncate font-mono text-xs text-emerald-800">
                        {certificate.serialNumber}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/certificates/verify?code=${encodeURIComponent(certificate.verificationCode)}`}
                    className="mt-3 block rounded-xl bg-emerald-700 px-3 py-2 text-center text-sm font-bold text-white"
                  >
                    عرض والتحقق
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="🏅"
              title="لا توجد شهادات بعد"
              text="ستصل شهادات الدورات المكتملة إلى خزنتك تلقائيًا."
            />
          )}
        </Panel>
      </div>
    </div>
  );
}

function SettingsView({
  dashboard,
  notifications,
  privacy,
  accessibility,
  saving,
  onSave,
  onSnapshot,
  snapshots,
  onRestoreSnapshot,
  onResetLayout,
  onClearSearch,
}: {
  dashboard: StudentDashboardSummaryDto;
  notifications: Record<string, boolean>;
  privacy: Record<string, boolean>;
  accessibility: Record<string, unknown>;
  saving: boolean;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onSnapshot: () => void;
  snapshots: StudentWorkspaceSnapshotDto[];
  onRestoreSnapshot: (snapshotId: string) => void;
  onResetLayout: () => void;
  onClearSearch: () => void;
}) {
  return (
    <form onSubmit={onSave} className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
      <div className="space-y-6">
        <Panel title="الملف وتجربة العرض">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="الاسم الظاهر">
              <input
                name="displayName"
                defaultValue={dashboard.workspace.displayName || ''}
                maxLength={120}
                className="field"
              />
            </Field>
            <Field label="اللغة">
              <select
                name="preferredLanguage"
                defaultValue={dashboard.workspace.preferredLanguage || 'ar'}
                className="field"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </Field>
            <Field label="المنطقة الزمنية">
              <select
                name="timezone"
                defaultValue={dashboard.workspace.timezone || 'Asia/Aden'}
                className="field"
              >
                <option value="Asia/Aden">عدن</option>
                <option value="Asia/Riyadh">الرياض</option>
                <option value="Asia/Dubai">دبي</option>
                <option value="UTC">التوقيت العالمي</option>
              </select>
            </Field>
            <Field label="المظهر">
              <select
                name="theme"
                defaultValue={dashboard.workspace.theme || 'SYSTEM'}
                className="field"
              >
                <option value="SYSTEM">حسب الجهاز</option>
                <option value="LIGHT">فاتح</option>
                <option value="DARK">داكن</option>
              </select>
            </Field>
            <Field label="حجم النص">
              <select
                name="textScale"
                defaultValue={String(accessibility.textScale || 'DEFAULT')}
                className="field"
              >
                <option value="SMALL">صغير</option>
                <option value="DEFAULT">افتراضي</option>
                <option value="LARGE">كبير</option>
              </select>
            </Field>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Toggle
              name="reduceMotion"
              label="تقليل الحركة"
              defaultChecked={Boolean(accessibility.reduceMotion)}
            />
            <Toggle
              name="highContrast"
              label="تباين مرتفع"
              defaultChecked={Boolean(accessibility.highContrast)}
            />
          </div>
        </Panel>
        <Panel title="الإشعارات">
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle
              name="notifyInApp"
              label="داخل المنصة"
              defaultChecked={notifications.inApp ?? true}
            />
            <Toggle
              name="notifyEmail"
              label="البريد الإلكتروني"
              defaultChecked={notifications.email ?? true}
            />
            <Toggle
              name="notifyPush"
              label="الإشعارات الفورية"
              defaultChecked={notifications.push ?? false}
            />
            <Toggle
              name="notifyLearning"
              label="تحديثات التعلم"
              defaultChecked={notifications.learning ?? true}
            />
            <Toggle
              name="notifyCertificates"
              label="الشهادات"
              defaultChecked={notifications.certificates ?? true}
            />
            <Toggle
              name="notifyScholarships"
              label="المنح والمواعيد"
              defaultChecked={notifications.scholarships ?? true}
            />
            <Toggle
              name="notifyPayments"
              label="الفواتير والدفعات"
              defaultChecked={notifications.payments ?? true}
            />
          </div>
        </Panel>
      </div>
      <aside className="space-y-6">
        <Panel title="مركز الخصوصية">
          <p className="mb-4 text-sm leading-6 text-slate-500">
            بياناتك الشخصية خاصة افتراضيًا. أنت من يقرر ما يُحتفظ به لتحسين تجربتك.
          </p>
          <div className="space-y-3">
            <Toggle
              name="retainSearchHistory"
              label="الاحتفاظ بسجل البحث"
              defaultChecked={privacy.retainSearchHistory ?? false}
            />
            <Toggle
              name="allowPersonalization"
              label="السماح بالتخصيص"
              defaultChecked={privacy.allowPersonalization ?? false}
            />
            <Toggle
              name="allowProductAnalytics"
              label="تحليلات تحسين المنتج"
              defaultChecked={privacy.allowProductAnalytics ?? false}
            />
          </div>
          <button
            type="button"
            onClick={onClearSearch}
            disabled={saving}
            className="mt-5 w-full rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-50"
          >
            مسح سجل البحث الآن
          </button>
        </Panel>
        <Panel title="الأمان والتزامن">
          <div className="rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
            إصدار الإعدادات الحالي: <strong>{dashboard.workspace.version}</strong>
            <br />
            آخر مزامنة: {formatDate(dashboard.workspace.updatedAt)}
          </div>
          <button
            type="button"
            onClick={onSnapshot}
            disabled={saving}
            className="mt-4 w-full rounded-xl border border-emerald-200 px-4 py-2.5 text-sm font-bold text-emerald-800 hover:bg-emerald-50"
          >
            حفظ نسخة من الإعدادات
          </button>
          <button type="button" onClick={onResetLayout} disabled={saving} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
            إعادة التخطيط الافتراضي
          </button>
          <div className="mt-4 space-y-2" aria-label="نسخ الإعدادات المحفوظة">
            {snapshots.length === 0 ? <p className="text-xs text-slate-500">لا توجد نسخ محفوظة بعد.</p> : snapshots.slice(0, 5).map((snapshot) => (
              <button key={snapshot.id} type="button" onClick={() => onRestoreSnapshot(snapshot.id)} disabled={saving} className="flex w-full items-center justify-between rounded-xl bg-slate-50 p-3 text-right text-xs hover:bg-emerald-50">
                <span>{snapshot.label || 'نسخة إعدادات'}</span><span>استعادة</span>
              </button>
            ))}
          </div>
        </Panel>
        <button
          disabled={saving}
          className="w-full rounded-2xl bg-emerald-700 px-6 py-4 font-black text-white shadow-lg shadow-emerald-900/10 hover:bg-emerald-800 disabled:opacity-50"
        >
          {saving ? 'جارٍ الحفظ…' : 'حفظ جميع التفضيلات'}
        </button>
      </aside>
    </form>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-20 rounded-xl px-3 py-2 text-center">
      <strong className="block text-xl">{value}</strong>
      <span className="text-xs text-emerald-100">{label}</span>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
}) {
  const styles: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    violet: 'bg-violet-50 text-violet-700',
  };
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div
        className={`mb-4 grid h-11 w-11 place-items-center rounded-2xl text-xl ${styles[color]}`}
      >
        {icon}
      </div>
      <strong className="text-3xl font-black">{value}</strong>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-lg font-black">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function CourseCard({
  course,
  wide = false,
}: {
  course: StudentDashboardSummaryDto['courseEnrollments'][number];
  wide?: boolean;
}) {
  return (
    <Link
      to={`/courses/${course.courseSlug}`}
      className={`group block rounded-2xl border border-slate-100 p-4 hover:border-emerald-200 hover:shadow-sm ${wide ? 'sm:p-5' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-xs font-bold text-emerald-700">
            {course.status === 'COMPLETED' ? 'مكتملة' : 'قيد التعلم'}
          </span>
          <h3 className="mt-1 truncate font-black">{course.courseName}</h3>
        </div>
        <span className="text-sm font-black text-emerald-700">{course.progressPercentage}%</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-600"
          style={{ width: `${Math.min(100, Math.max(0, course.progressPercentage))}%` }}
        />
      </div>
      <div className="mt-3 flex justify-between text-xs text-slate-500">
        <span>
          {course.lastAccessedAt
            ? `آخر وصول ${formatDate(course.lastAccessedAt)}`
            : `التسجيل ${formatDate(course.enrolledAt)}`}
        </span>
        <span className="font-bold text-emerald-700 group-hover:-translate-x-1">متابعة ←</span>
      </div>
    </Link>
  );
}

function ActivityList({ items }: { items: StudentDashboardSummaryDto['timeline'] }) {
  return items.length ? (
    <ol className="space-y-1">
      {items.map((item) => (
        <li key={item.id} className="relative flex gap-4 pb-5 last:pb-0">
          <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-emerald-600 ring-4 ring-emerald-50" />
          <div>
            <h3 className="text-sm font-bold">{item.title}</h3>
            {item.description && <p className="mt-1 text-sm text-slate-500">{item.description}</p>}
            <time className="mt-1 block text-xs text-slate-400">{formatDate(item.occurredAt)}</time>
          </div>
        </li>
      ))}
    </ol>
  ) : (
    <p className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">
      سيظهر هنا سجل إنجازاتك ونشاطك المهم.
    </p>
  );
}

function ProgressRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="font-bold">{label}</span>
        <span className="text-slate-500">{value}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-l from-emerald-700 to-emerald-400"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function InvoicePanel({
  invoices,
  paymentsByInvoice,
  onToggle,
}: {
  invoices: StudentFinanceInvoiceDto[];
  paymentsByInvoice: Record<string, StudentFinancePaymentDto[]>;
  onToggle: (id: string) => void;
}) {
  return (
    <Panel title="الفواتير والدفعات">
      {invoices.length ? (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="rounded-2xl border border-slate-100 p-4">
              <div className="flex justify-between gap-3">
                <div>
                  <h3 className="font-bold">{invoice.invoiceNumber}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    المستحق {formatMoney(invoice.amountDue)}
                  </p>
                </div>
                <span
                  className={`h-fit rounded-full px-3 py-1 text-xs font-bold ${invoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
                >
                  {arabicStatus(invoice.status)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onToggle(invoice.id)}
                className="mt-3 text-xs font-bold text-emerald-700"
              >
                {paymentsByInvoice[invoice.id] ? 'إخفاء الدفعات' : 'عرض الدفعات'}
              </button>
              {paymentsByInvoice[invoice.id] && (
                <div className="mt-3 space-y-2 border-t pt-3">
                  {paymentsByInvoice[invoice.id].length ? (
                    paymentsByInvoice[invoice.id].map((payment) => (
                      <p key={payment.id} className="rounded-lg bg-slate-50 p-2 text-xs">
                        {formatMoney(payment.amount)} — {arabicStatus(payment.status)}
                      </p>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">لا توجد دفعات مسجلة.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">
          لا توجد فواتير حالية.
        </p>
      )}
    </Panel>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactElement<{ className?: string }>;
}) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}
      {React.cloneElement(children, {
        className: `${children.props.className || ''} mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100`,
      })}
    </label>
  );
}

function Toggle({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-100 p-4 hover:bg-slate-50">
      <span className="text-sm font-bold">{label}</span>
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-5 w-5 accent-emerald-700"
      />
    </label>
  );
}

function EmptyState({
  icon,
  title,
  text,
  href,
  action,
}: {
  icon: string;
  title: string;
  text: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
      <div className="text-3xl">{icon}</div>
      <h3 className="mt-3 font-black">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{text}</p>
      {href && action && (
        <Link
          to={href}
          className="mt-4 inline-block rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white"
        >
          {action}
        </Link>
      )}
    </div>
  );
}

function Alert({
  tone,
  message,
  onClose,
}: {
  tone: 'error' | 'success' | 'warning';
  message: string;
  onClose?: () => void;
}) {
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
  };
  return (
    <div
      role="status"
      className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-bold ${styles[tone]}`}
    >
      <span>{message}</span>
      {onClose && (
        <button type="button" aria-label="إغلاق الرسالة" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
}

function WorkspaceSkeleton() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#f4f8f6]">
      <div className="h-64 animate-pulse bg-emerald-900" />
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="h-40 animate-pulse rounded-3xl bg-white" />
        ))}
      </div>
    </div>
  );
}

function formatMoney(amount: MoneyAmountDto): string {
  const value = Number(BigInt(amount.amountMinorUnits)) / Math.pow(10, amount.scale);
  return `${value.toLocaleString('ar', { minimumFractionDigits: amount.scale, maximumFractionDigits: amount.scale })} ${amount.currencyCode}`;
}
function formatDate(value?: string | null): string {
  return value
    ? new Date(value).toLocaleDateString('ar', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';
}
function arabicStatus(value: string): string {
  return (
    (
      {
        PAID: 'مدفوعة',
        VOIDED: 'ملغاة',
        PENDING: 'معلقة',
        ACTIVE: 'نشطة',
        COMPLETED: 'مكتملة',
        REVOKED: 'ملغاة',
      } as Record<string, string>
    )[value] || value
  );
}
function arabicEntityType(value: string): string {
  return (
    (
      {
        COURSE: 'دورة',
        SCHOLARSHIP: 'منحة',
        UNIVERSITY: 'جامعة',
        MAJOR: 'تخصص',
        CERTIFICATE: 'شهادة',
        STUDENT_TOOL: 'أداة طالب',
      } as Record<string, string>
    )[value] || value
  );
}
function buildEntityLink(type: string, slug: string): string {
  const base = (
    {
      SCHOLARSHIP: 'scholarships',
      UNIVERSITY: 'universities',
      MAJOR: 'majors',
      COURSE: 'courses',
    } as Record<string, string>
  )[type];
  return base
    ? `/${base}/${slug}`
    : type === 'CERTIFICATE'
      ? `/certificates/verify?code=${encodeURIComponent(slug)}`
      : '/';
}
