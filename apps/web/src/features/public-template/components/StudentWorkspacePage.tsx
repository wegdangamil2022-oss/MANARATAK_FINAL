import React, { useMemo, useState } from 'react';
import {
  User,
  Heart,
  Bell,
  ListChecks,
  Search,
  Sparkles,
  BookOpen,
  Award,
  CalendarClock,
  ChevronLeft,
  ShieldCheck,
  Settings2,
  History,
  Eye,
  SlidersHorizontal,
  Languages,
  Moon,
  Sun,
  LogIn,
  LayoutDashboard,
  MapPinned,
  GraduationCap,
  CheckCircle2,
  Clock3,
  ExternalLink,
  LockKeyhole,
  Smartphone,
  Info,
} from 'lucide-react';
import { ApplicationMilestone, FavoriteKind, Language, PushNotificationItem, UserProfile } from '../types';

type WorkspaceSection = 'hub' | 'vault' | 'journey' | 'control';

interface StudentWorkspacePageProps {
  profile?: UserProfile | null;
  language: Language;
  isDarkMode: boolean;
  favoriteTypeCounts: Partial<Record<FavoriteKind, number>>;
  favoritesCount: number;
  milestones: ApplicationMilestone[];
  notifications: PushNotificationItem[];
  onOpenFavorites: () => void;
  onOpenTracker: () => void;
  onOpenNotifications: () => void;
  onOpenGlobalSearch: () => void;
  onOpenSmartSearch: () => void;
  onOpenTools: () => void;
  onOpenAuth: () => void;
  onToggleLanguage: () => void;
  onToggleDarkMode: () => void;
}

const kindLabels: Partial<Record<FavoriteKind, string>> = {
  scholarship: 'منح',
  university: 'جامعات',
  major: 'تخصصات',
  country: 'دول',
  course: 'دورات',
  exam: 'اختبارات',
  article: 'مقالات',
  service: 'خدمات',
  tool: 'أدوات',
  career: 'وظائف وتدريب',
};

export const StudentWorkspacePage: React.FC<StudentWorkspacePageProps> = ({
  profile,
  language,
  isDarkMode,
  favoriteTypeCounts,
  favoritesCount,
  milestones,
  notifications,
  onOpenFavorites,
  onOpenTracker,
  onOpenNotifications,
  onOpenGlobalSearch,
  onOpenSmartSearch,
  onOpenTools,
  onOpenAuth,
  onToggleLanguage,
  onToggleDarkMode,
}) => {
  const [section, setSection] = useState<WorkspaceSection>('hub');
  const [recommendationsEnabled, setRecommendationsEnabled] = useState(true);
  const [activityTrackingEnabled, setActivityTrackingEnabled] = useState(true);
  const [notificationPreviewEnabled, setNotificationPreviewEnabled] = useState(true);

  const unreadCount = notifications.filter((item) => !item.read).length;
  const activeMilestones = milestones.filter((item) => item.progress < 100);
  const completedTasks = milestones.reduce(
    (total, item) => total + item.checklist.filter((task) => task.completed).length,
    0,
  );
  const totalTasks = milestones.reduce((total, item) => total + item.checklist.length, 0);
  const journeyProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const profileCompletion = useMemo(() => {
    if (!profile) return 0;
    const values = [
      profile.name,
      profile.email,
      profile.degreeLevel,
      profile.targetMajor,
      profile.gpa,
      profile.englishLevel,
      profile.targetCountries?.length ? 'countries' : '',
    ];
    return Math.round((values.filter(Boolean).length / values.length) * 100);
  }, [profile]);

  const latestJourneyItems = useMemo(() => {
    const milestoneItems = milestones.slice(0, 2).map((item) => ({
      id: `milestone-${item.id}`,
      title: item.scholarshipTitle,
      meta: `${item.stage} • ${item.progress}%`,
      type: 'طلب/متابعة',
    }));
    const notificationItems = notifications.slice(0, 2).map((item) => ({
      id: `notification-${item.id}`,
      title: item.title,
      meta: item.timestamp,
      type: 'تنبيه',
    }));
    return [...milestoneItems, ...notificationItems].slice(0, 4);
  }, [milestones, notifications]);

  const savedGroups = Object.entries(favoriteTypeCounts)
    .filter(([, count]) => (count || 0) > 0)
    .sort((a, b) => (b[1] || 0) - (a[1] || 0))
    .slice(0, 6) as [FavoriteKind, number][];

  const navigation = [
    { id: 'hub' as const, label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'vault' as const, label: 'المحفوظات', icon: Heart },
    { id: 'journey' as const, label: 'رحلتي', icon: History },
    { id: 'control' as const, label: 'الإعدادات', icon: Settings2 },
  ];

  const EmptyWidget = ({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) => (
    <div className="rounded-2xl border border-dashed border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-page)]/70 mn-dark:bg-[var(--mn-surface-elevated)] p-4 text-center mn-dark:mn-panel ">
      <Icon className="w-6 h-6 mx-auto text-[var(--mn-text-muted)] mb-2" />
      <div className="text-xs font-black text-[var(--mn-heading)] mn-dark:text-white">{title}</div>
      <p className="text-[10px] leading-5 text-[var(--mn-text-muted)] mt-1">{text}</p>
    </div>
  );

  return (
    <section className="w-full max-w-4xl mx-auto px-3 sm:px-5 pb-8 text-right" dir="rtl">
      <div className="pt-3 sm:pt-5">
        <div className="relative overflow-hidden rounded-[26px] border border-[var(--mn-primary)]/10 bg-[var(--mn-primary)] p-4 sm:p-5 shadow-sm mn-inverse ">
          <div className="absolute -left-12 -top-12 w-36 h-36 rounded-full bg-[var(--mn-accent)]/12 blur-2xl" />
          <div className="absolute -right-12 -bottom-12 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
          <div className="relative flex items-start gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-[var(--mn-accent)]/60 flex items-center justify-center shrink-0 shadow-inner">
              <User className="w-7 h-7 text-[var(--mn-accent)]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-[var(--mn-accent)] text-[var(--mn-on-accent)] text-[9px] font-black mn-gold ">Student Workspace</span>
                {!profile && (
                  <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-white text-[9px] font-bold">معاينة UI</span>
                )}
              </div>
              <h1 className="text-lg sm:text-xl font-black text-white leading-tight">
                {profile?.name || 'حساب الطالب في منارتك'}
              </h1>
              <p className="text-[10px] sm:text-[11px] leading-5 text-[var(--mn-on-dark-muted)] mt-1 max-w-xl">
                {profile
                  ? 'مساحتك الخاصة لمتابعة رحلتك، محفوظاتك، تنبيهاتك وإعداداتك.'
                  : 'هذه معاينة لتجربة Phase 15. لا توجد هوية أو جلسة حقيقية مرتبطة بهذا النموذج بعد.'}
              </p>
            </div>
          </div>

          <div className="relative mt-4 rounded-2xl bg-[var(--mn-primary)]/55 border border-white/10 p-3">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div>
                <div className="text-[10px] font-bold text-[var(--mn-text-muted)]">اكتمال مساحة الطالب</div>
                <div className="text-xs font-black text-white mt-0.5">
                  {profile ? `${profileCompletion}%` : 'يبدأ بعد تسجيل الدخول'}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[var(--mn-accent)]" />
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--mn-accent)] transition-all mn-gold "
                style={{ width: `${profile ? profileCompletion : 8}%` }}
              />
            </div>
            {!profile && (
              <button
                onClick={onOpenAuth}
                className="mt-3 w-full min-h-[40px] rounded-xl bg-[var(--mn-accent)] text-[var(--mn-on-accent)] text-[11px] font-black flex items-center justify-center gap-2 active:scale-[0.98] transition-transform mn-gold "
              >
                <LogIn className="w-4 h-4" />
                تسجيل الدخول / إنشاء حساب
              </button>
            )}
          </div>
        </div>

        <div className="sticky top-[112px] z-20 mt-3 p-1.5 rounded-2xl bg-[var(--mn-surface)]/95 mn-dark:bg-[var(--mn-surface)]/95 backdrop-blur border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] shadow-sm grid grid-cols-4 gap-1 mn-panel mn-dark:mn-panel ">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`min-w-0 rounded-xl px-1 py-2 flex flex-col items-center gap-1 transition-colors ${
                  active
                    ? 'bg-[var(--mn-primary)] text-white shadow-sm mn-inverse '
                    : 'text-[var(--mn-text-muted)] hover:bg-[var(--mn-page)] mn-dark:hover:bg-[var(--mn-surface-elevated)] hover:mn-panel mn-dark:hover:mn-panel '
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[var(--mn-accent)]' : ''}`} />
                <span className="text-[9px] font-black whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>

        {section === 'hub' && (
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'محفوظ', value: favoritesCount, icon: Heart, action: onOpenFavorites },
                { label: 'تنبيهات', value: unreadCount, icon: Bell, action: onOpenNotifications },
                { label: 'متابعات', value: activeMilestones.length, icon: ListChecks, action: onOpenTracker },
                { label: 'التقدم', value: `${journeyProgress}%`, icon: CheckCircle2, action: onOpenTracker },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="rounded-2xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface)] p-2.5 min-h-[76px] text-center shadow-2xs active:scale-[0.98] transition-transform mn-panel "
                  >
                    <Icon className="w-4 h-4 mx-auto text-[var(--mn-accent-text)] mb-1.5" />
                    <div className="text-sm font-black text-[var(--mn-heading)] mn-dark:text-white leading-none">{item.value}</div>
                    <div className="text-[9px] font-bold text-[var(--mn-text-muted)] mt-1.5">{item.label}</div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-3xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface)] p-4 shadow-2xs mn-panel ">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h2 className="text-sm font-black text-[var(--mn-heading)] mn-dark:text-white">إجراءات سريعة</h2>
                  <p className="text-[10px] text-[var(--mn-text-muted)] mt-0.5">اختصارات تتغير لاحقًا حسب سياق الطالب.</p>
                </div>
                <Sparkles className="w-5 h-5 text-[var(--mn-accent-text)]" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'ابحث في منارتك', icon: Search, action: onOpenGlobalSearch },
                  { label: 'اسأل البحث الذكي', icon: Sparkles, action: onOpenSmartSearch },
                  { label: 'أدوات منارتك', icon: SlidersHorizontal, action: onOpenTools },
                  { label: 'متابعة الطلبات', icon: ListChecks, action: onOpenTracker },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="min-h-[48px] rounded-2xl bg-[var(--mn-page)] mn-dark:bg-[var(--mn-surface-elevated)] border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] px-3 flex items-center justify-between gap-2 active:scale-[0.98] transition-transform mn-panel mn-dark:mn-panel "
                    >
                      <span className="text-[10px] font-black text-[var(--mn-heading)] mn-dark:text-white">{item.label}</span>
                      <Icon className="w-4 h-4 text-[var(--mn-accent-text)] shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface)] p-4 shadow-2xs mn-panel ">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h2 className="text-sm font-black text-[var(--mn-heading)] mn-dark:text-white">ملفي الأكاديمي</h2>
                  <p className="text-[10px] text-[var(--mn-text-muted)] mt-0.5">عرض مختصر عبر Read Model؛ لا تنسخ Phase 15 السجل الأكاديمي الأصلي.</p>
                </div>
                <GraduationCap className="w-5 h-5 text-[var(--mn-accent-text)]" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  ['الدرجة المستهدفة', profile?.degreeLevel || 'غير محدد'],
                  ['التخصص المستهدف', profile?.targetMajor || 'غير محدد'],
                  ['المعدل', profile?.gpa || 'غير مرتبط'],
                  ['مستوى الإنجليزية', profile?.englishLevel || 'غير محدد'],
                  ['الدول المستهدفة', profile?.targetCountries?.length ? profile.targetCountries.join('، ') : 'غير محدد'],
                  ['حالة الحساب', profile ? 'مرتبط' : 'معاينة فقط'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-[var(--mn-page)] mn-dark:bg-[var(--mn-surface-elevated)] border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] p-3 mn-panel mn-dark:mn-panel ">
                    <div className="text-[9px] font-bold text-[var(--mn-text-muted)]">{label}</div>
                    <div className="text-[10px] font-black text-[var(--mn-heading)] mn-dark:text-white mt-1 line-clamp-2">{value}</div>
                  </div>
                ))}
              </div>
              {!profile && (
                <button onClick={onOpenAuth} className="mt-3 text-[10px] font-black text-[var(--mn-heading)] mn-dark:text-[var(--mn-accent-text)] flex items-center gap-1">
                  اربط حسابك لإكمال الملف <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-3xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface)] p-4 shadow-2xs mn-panel ">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div>
                    <h2 className="text-sm font-black text-[var(--mn-heading)] mn-dark:text-white">رحلتي الآن</h2>
                    <p className="text-[10px] text-[var(--mn-text-muted)] mt-0.5">ملخص من الـTimeline والمتابعات.</p>
                  </div>
                  <History className="w-5 h-5 text-[var(--mn-accent-text)]" />
                </div>
                {latestJourneyItems.length ? (
                  <div className="space-y-2">
                    {latestJourneyItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="rounded-2xl bg-[var(--mn-page)] mn-dark:bg-[var(--mn-surface-elevated)] p-3 border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] mn-panel mn-dark:mn-panel ">
                        <div className="text-[9px] font-black text-[var(--mn-accent-text)]">{item.type}</div>
                        <div className="text-[11px] font-black text-[var(--mn-heading)] mn-dark:text-white mt-0.5 line-clamp-1">{item.title}</div>
                        <div className="text-[9px] text-[var(--mn-text-muted)] mt-1">{item.meta}</div>
                      </div>
                    ))}
                    <button onClick={onOpenTracker} className="w-full text-[10px] font-black text-[var(--mn-heading)] mn-dark:text-[var(--mn-accent-text)] flex items-center justify-center gap-1 py-1">
                      عرض الرحلة والمتابعة <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <EmptyWidget icon={History} title="رحلتك ستظهر هنا" text="تظهر الأحداث بعد ربط الحساب بالدورات والطلبات والشهادات." />
                )}
              </div>

              <div className="rounded-3xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface)] p-4 shadow-2xs mn-panel ">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div>
                    <h2 className="text-sm font-black text-[var(--mn-heading)] mn-dark:text-white">المواعيد المهمة</h2>
                    <p className="text-[10px] text-[var(--mn-text-muted)] mt-0.5">المواعيد القادمة من الأنظمة المرتبطة.</p>
                  </div>
                  <CalendarClock className="w-5 h-5 text-[var(--mn-accent-text)]" />
                </div>
                {activeMilestones.length ? (
                  <div className="space-y-2">
                    {activeMilestones.slice(0, 2).map((item) => (
                      <button key={item.id} onClick={onOpenTracker} className="w-full rounded-2xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-page)] mn-dark:bg-[var(--mn-surface-elevated)] p-3 text-right mn-panel mn-dark:mn-panel ">
                        <div className="text-[11px] font-black text-[var(--mn-heading)] mn-dark:text-white line-clamp-1">{item.scholarshipTitle}</div>
                        <div className="mt-1.5 flex items-center justify-between gap-2 text-[9px] text-[var(--mn-text-muted)]">
                          <span>{item.stage}</span>
                          <span className="font-black text-[var(--mn-accent-text)]">{item.deadline}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <EmptyWidget icon={CalendarClock} title="لا توجد مواعيد مرتبطة" text="سيظهر هنا أي موعد نهائي أو خطوة تتطلب انتباهك." />
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-3xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface)] p-4 shadow-2xs mn-panel ">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-[var(--mn-accent-text)]" />
                  <div>
                    <h2 className="text-sm font-black text-[var(--mn-heading)] mn-dark:text-white">أكمل التعلم</h2>
                    <p className="text-[10px] text-[var(--mn-text-muted)]">Read Model من Phase 13 لاحقًا.</p>
                  </div>
                </div>
                <EmptyWidget icon={BookOpen} title="لا توجد دورة مرتبطة بالحساب التجريبي" text="عند التسجيل في دورة سيظهر تقدمها هنا دون نسخ بيانات الدورة داخل Phase 15." />
              </div>

              <div className="rounded-3xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface)] p-4 shadow-2xs mn-panel ">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-[var(--mn-accent-text)]" />
                  <div>
                    <h2 className="text-sm font-black text-[var(--mn-heading)] mn-dark:text-white">إنجازاتي</h2>
                    <p className="text-[10px] text-[var(--mn-text-muted)]">شهادات وإنجازات من مراحلها الأصلية.</p>
                  </div>
                </div>
                <EmptyWidget icon={Award} title="لا توجد إنجازات مرتبطة بعد" text="عند إصدار شهادة أو إنجاز موثق سيظهر ملخصه هنا عبر Read Model." />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-3xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface)] p-4 shadow-2xs mn-panel ">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-5 h-5 text-[var(--mn-accent-text)]" />
                  <div>
                    <h2 className="text-sm font-black text-[var(--mn-heading)] mn-dark:text-white">آخر ما شاهدته</h2>
                    <p className="text-[10px] text-[var(--mn-text-muted)]">Recently Viewed Items</p>
                  </div>
                </div>
                <EmptyWidget icon={Eye} title="لا يوجد سجل مشاهدة في المعاينة" text="بعد الموافقة على التتبع سيظهر آخر ما فتحته داخل مساحة الطالب الخاصة بك." />
              </div>
              <div className="rounded-3xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface)] p-4 shadow-2xs mn-panel ">
                <div className="flex items-center gap-2 mb-3">
                  <Search className="w-5 h-5 text-[var(--mn-accent-text)]" />
                  <div>
                    <h2 className="text-sm font-black text-[var(--mn-heading)] mn-dark:text-white">سجل البحث</h2>
                    <p className="text-[10px] text-[var(--mn-text-muted)]">Private Search History</p>
                  </div>
                </div>
                <EmptyWidget icon={Search} title="لا يوجد سجل بحث مرتبط" text="سيبقى سجل البحث خاصًا بكل StudentId عند ربط Phase 15." />
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--mn-accent)]/30 bg-[var(--mn-accent)]/5 mn-dark:bg-[var(--mn-accent)]/8 p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[var(--mn-accent-text)] shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-black text-[var(--mn-heading)] mn-dark:text-white">توصيات لك</h2>
                  <p className="text-[10px] leading-5 text-[var(--mn-text-muted)] mt-1">
                    Phase 15 يعرض التوصيات فقط؛ حسابها يأتي من AI/Analytics. لذلك لن نولد توصيات وهمية في هذه المعاينة.
                  </p>
                  <button onClick={onOpenSmartSearch} className="mt-2 inline-flex items-center gap-1 text-[10px] font-black text-[var(--mn-heading)] mn-dark:text-[var(--mn-accent-text)]">
                    استخدم البحث الذكي الآن <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {section === 'vault' && (
          <div className="mt-3 space-y-3">
            <div className="rounded-3xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface)] p-4 shadow-2xs mn-panel ">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[9px] font-black text-[var(--mn-accent-text)]">THE VAULT</span>
                  <h2 className="text-base font-black text-[var(--mn-heading)] mn-dark:text-white mt-0.5">المفضلة والمحفوظات</h2>
                  <p className="text-[10px] leading-5 text-[var(--mn-text-muted)] mt-1">خزنة موحدة لكل ما تحفظه من أقسام منارتك.</p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-[var(--mn-danger-soft)] mn-dark:bg-[var(--mn-danger-soft)]/20 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 text-[var(--mn-danger-text)] fill-red-500/15" />
                </div>
              </div>
              <div className="mt-4 text-3xl font-black text-[var(--mn-heading)] mn-dark:text-white">{favoritesCount}</div>
              <div className="text-[10px] text-[var(--mn-text-muted)]">عنصر محفوظ في هذه المعاينة</div>
            </div>

            {savedGroups.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {savedGroups.map(([kind, count]) => (
                  <button key={kind} onClick={onOpenFavorites} className="rounded-2xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface)] p-3 text-right shadow-2xs active:scale-[0.98] transition-transform mn-panel ">
                    <div className="text-xl font-black text-[var(--mn-heading)] mn-dark:text-white">{count}</div>
                    <div className="text-[10px] font-black text-[var(--mn-text-muted)] mt-1">{kindLabels[kind] || kind}</div>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyWidget icon={Heart} title="خزنتك فارغة" text="احفظ منحة أو جامعة أو دورة أو أي عنصر، وسيظهر هنا." />
            )}

            <button onClick={onOpenFavorites} className="w-full min-h-[46px] rounded-2xl bg-[var(--mn-primary)] text-white border border-[var(--mn-accent)]/40 font-black text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-transform mn-inverse ">
              فتح كل المفضلة والمحفوظات <ChevronLeft className="w-4 h-4 text-[var(--mn-accent)]" />
            </button>

            <div className="rounded-2xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-page)] mn-dark:bg-[var(--mn-surface-elevated)] p-3 flex items-start gap-2 mn-panel mn-dark:mn-panel ">
              <Info className="w-4 h-4 text-[var(--mn-accent-text)] shrink-0 mt-0.5" />
              <p className="text-[10px] leading-5 text-[var(--mn-text-muted)]">في Phase 15 الحقيقي تحفظ الخزنة مراجع فقط، ثم تجلب تفاصيل العنصر من مرحلته الأصلية عند العرض؛ وهذا هو نفس اتجاه المفضلة الموحّدة في Update 25.</p>
            </div>
          </div>
        )}

        {section === 'journey' && (
          <div className="mt-3 space-y-3">
            <div className="rounded-3xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface)] p-4 shadow-2xs mn-panel ">
              <span className="text-[9px] font-black text-[var(--mn-accent-text)]">THE JOURNEY</span>
              <h2 className="text-base font-black text-[var(--mn-heading)] mn-dark:text-white mt-0.5">رحلتي التعليمية</h2>
              <p className="text-[10px] leading-5 text-[var(--mn-text-muted)] mt-1">Timeline تاريخي يجمع الأحداث التي تصل من الأنظمة الأخرى دون امتلاك معاملاتها.</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-[var(--mn-page)] mn-dark:bg-[var(--mn-surface-elevated)] p-3 text-center mn-panel mn-dark:mn-panel ">
                  <div className="text-lg font-black text-[var(--mn-heading)] mn-dark:text-white">{activeMilestones.length}</div>
                  <div className="text-[9px] text-[var(--mn-text-muted)] mt-1">متابعة نشطة</div>
                </div>
                <div className="rounded-2xl bg-[var(--mn-page)] mn-dark:bg-[var(--mn-surface-elevated)] p-3 text-center mn-panel mn-dark:mn-panel ">
                  <div className="text-lg font-black text-[var(--mn-heading)] mn-dark:text-white">{journeyProgress}%</div>
                  <div className="text-[9px] text-[var(--mn-text-muted)] mt-1">تقدم المهام</div>
                </div>
                <div className="rounded-2xl bg-[var(--mn-page)] mn-dark:bg-[var(--mn-surface-elevated)] p-3 text-center mn-panel mn-dark:mn-panel ">
                  <div className="text-lg font-black text-[var(--mn-heading)] mn-dark:text-white">{notifications.length}</div>
                  <div className="text-[9px] text-[var(--mn-text-muted)] mt-1">أحداث/تنبيهات</div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface)] p-4 shadow-2xs mn-panel ">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-sm font-black text-[var(--mn-heading)] mn-dark:text-white">آخر النشاطات</h3>
                <Clock3 className="w-4 h-4 text-[var(--mn-accent-text)]" />
              </div>
              {latestJourneyItems.length ? (
                <div className="relative pr-4 space-y-3 before:absolute before:right-[5px] before:top-2 before:bottom-2 before:w-px before:bg-[var(--mn-surface-muted)] mn-dark:before:bg-[var(--mn-border)] before:mn-panel ">
                  {latestJourneyItems.map((item) => (
                    <div key={item.id} className="relative">
                      <span className="absolute -right-4 top-1.5 w-2.5 h-2.5 rounded-full bg-[var(--mn-accent)] ring-4 ring-[var(--mn-surface)] mn-dark:ring-[var(--mn-surface)] mn-gold " />
                      <div className="rounded-2xl bg-[var(--mn-page)] mn-dark:bg-[var(--mn-surface-elevated)] border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] p-3 mn-panel mn-dark:mn-panel ">
                        <div className="text-[9px] font-black text-[var(--mn-accent-text)]">{item.type}</div>
                        <div className="text-[11px] font-black text-[var(--mn-heading)] mn-dark:text-white mt-0.5">{item.title}</div>
                        <div className="text-[9px] text-[var(--mn-text-muted)] mt-1">{item.meta}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyWidget icon={History} title="لا توجد أحداث بعد" text="سيُبنى السجل تلقائيًا من أحداث الدورات والطلبات والشهادات." />
              )}
            </div>

            <button onClick={onOpenTracker} className="w-full min-h-[46px] rounded-2xl bg-[var(--mn-primary)] text-white border border-[var(--mn-accent)]/40 font-black text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-transform mn-inverse ">
              فتح متابعة الطلبات والمهام <ListChecks className="w-4 h-4 text-[var(--mn-accent)]" />
            </button>
          </div>
        )}

        {section === 'control' && (
          <div className="mt-3 space-y-3">
            <div className="rounded-3xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface)] p-4 shadow-2xs mn-panel ">
              <span className="text-[9px] font-black text-[var(--mn-accent-text)]">CONTROL CENTER</span>
              <h2 className="text-base font-black text-[var(--mn-heading)] mn-dark:text-white mt-0.5">الإعدادات والخصوصية</h2>
              <p className="text-[10px] leading-5 text-[var(--mn-text-muted)] mt-1">تفضيلات مساحة الطالب فقط؛ كلمة المرور وMFA تبقى في Identity Platform.</p>
            </div>

            <div className="rounded-3xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface)] overflow-hidden shadow-2xs mn-panel ">
              {[
                {
                  title: 'التوصيات المخصصة',
                  text: 'السماح بعرض توصيات مبنية على اهتماماتك بعد موافقتك.',
                  icon: Sparkles,
                  enabled: recommendationsEnabled,
                  toggle: () => setRecommendationsEnabled((value) => !value),
                },
                {
                  title: 'سجل النشاط والبحث',
                  text: 'حفظ النشاط الشخصي داخل مساحة الطالب لتحسين الاستمرارية.',
                  icon: History,
                  enabled: activityTrackingEnabled,
                  toggle: () => setActivityTrackingEnabled((value) => !value),
                },
                {
                  title: 'التنبيهات داخل التطبيق',
                  text: 'إظهار تنبيهات المواعيد والتغييرات المهمة في مركز الحساب.',
                  icon: Bell,
                  enabled: notificationPreviewEnabled,
                  toggle: () => setNotificationPreviewEnabled((value) => !value),
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className={`p-4 flex items-center gap-3 ${index ? 'border-t border-[var(--mn-border)] mn-dark:border-[var(--mn-border)]' : ''}`}>
                    <div className="w-9 h-9 rounded-xl bg-[var(--mn-page)] mn-dark:bg-[var(--mn-surface-elevated)] flex items-center justify-center shrink-0 mn-panel mn-dark:mn-panel ">
                      <Icon className="w-4 h-4 text-[var(--mn-accent-text)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-black text-[var(--mn-heading)] mn-dark:text-white">{item.title}</div>
                      <p className="text-[9px] leading-4 text-[var(--mn-text-muted)] mt-0.5">{item.text}</p>
                    </div>
                    <button
                      onClick={item.toggle}
                      className={`w-11 h-6 p-0.5 rounded-full transition-colors shrink-0 ${item.enabled ? 'bg-[var(--mn-primary)] mn-inverse ' : 'bg-[var(--mn-surface-muted)] mn-dark:bg-[var(--mn-surface-elevated)] mn-panel mn-dark:mn-panel '}`}
                      aria-label={`تبديل ${item.title}`}
                    >
                      <span className={`block w-5 h-5 rounded-full bg-[var(--mn-surface)] shadow-sm transition-transform  mn-panel ${item.enabled ? '-translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button onClick={onToggleLanguage} className="rounded-2xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface)] p-3 text-right flex items-center justify-between gap-2 mn-panel ">
                <div>
                  <div className="text-[10px] font-black text-[var(--mn-heading)] mn-dark:text-white">اللغة</div>
                  <div className="text-[9px] text-[var(--mn-text-muted)] mt-1">{language === 'ar' ? 'العربية' : 'English'}</div>
                </div>
                <Languages className="w-4 h-4 text-[var(--mn-accent-text)]" />
              </button>
              <button onClick={onToggleDarkMode} className="rounded-2xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface)] p-3 text-right flex items-center justify-between gap-2 mn-panel ">
                <div>
                  <div className="text-[10px] font-black text-[var(--mn-heading)] mn-dark:text-white">المظهر</div>
                  <div className="text-[9px] text-[var(--mn-text-muted)] mt-1">{isDarkMode ? 'ليلي' : 'نهاري'}</div>
                </div>
                {isDarkMode ? <Moon className="w-4 h-4 text-[var(--mn-accent-text)]" /> : <Sun className="w-4 h-4 text-[var(--mn-accent-text)]" />}
              </button>
            </div>

            <div className="rounded-3xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface)] divide-y divide-[var(--mn-border)] mn-dark:divide-[var(--mn-border)] shadow-2xs mn-panel ">
              {[
                { label: 'إدارة مركز التنبيهات', icon: Bell, action: onOpenNotifications },
                { label: 'البحث داخل مساحة الطالب', icon: Search, action: onOpenGlobalSearch },
                { label: 'إعدادات الحساب والأمان', icon: LockKeyhole, action: onOpenAuth },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.label} onClick={item.action} className="w-full min-h-[50px] px-4 flex items-center justify-between gap-3 text-right">
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-[var(--mn-accent-text)]" />
                      <span className="text-[10px] font-black text-[var(--mn-heading)] mn-dark:text-white">{item.label}</span>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-[var(--mn-text-muted)]" />
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-dashed border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-surface)] p-3 flex items-center justify-between gap-3 mn-panel ">
              <div className="min-w-0">
                <div className="text-[10px] font-black text-[var(--mn-heading)] mn-dark:text-white">تخصيص لوحة الحساب</div>
                <p className="text-[9px] leading-4 text-[var(--mn-text-muted)] mt-0.5">ترتيب وإخفاء الويدجت سيتم تفعيله عند ربط DashboardLayout API؛ لا يوجد حفظ وهمي في المعاينة.</p>
              </div>
              <LayoutDashboard className="w-5 h-5 text-[var(--mn-text-muted)] shrink-0" />
            </div>

            <div className="rounded-2xl border border-[var(--mn-border)] mn-dark:border-[var(--mn-border)] bg-[var(--mn-page)] mn-dark:bg-[var(--mn-surface-elevated)] p-3 space-y-2 mn-panel mn-dark:mn-panel ">
              <div className="flex items-center gap-2 text-[10px] font-black text-[var(--mn-heading)] mn-dark:text-white">
                <ShieldCheck className="w-4 h-4 text-[var(--mn-accent-text)]" />
                خصوصيتك في Phase 15
              </div>
              <p className="text-[9px] leading-5 text-[var(--mn-text-muted)]">مساحة الطالب لا تنسخ السجل الأكاديمي أو بيانات الأنظمة الأخرى. تعرض الحد الأدنى اللازم عبر Read Models، وتربط كل طلب بهوية الطالب المصادق عليها.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

