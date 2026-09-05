import {
  Activity,
  Award,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  Building2,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  GraduationCap,
  HeartPulse,
  Languages,
  LayoutDashboard,
  MapPinned,
  Settings,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Wrench,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from '../i18n/I18nProvider';

interface NavigationItem {
  to: string;
  labelKey: Parameters<ReturnType<typeof useTranslation>['t']>[0];
  icon: typeof LayoutDashboard;
}

interface NavigationGroup {
  labelKey: Parameters<ReturnType<typeof useTranslation>['t']>[0];
  items: NavigationItem[];
}

const groups: NavigationGroup[] = [
  {
    labelKey: 'admin_nav_group_overview',
    items: [
      { to: '/dashboard', labelKey: 'admin_nav_dashboard', icon: LayoutDashboard },
      { to: '/review-queue', labelKey: 'admin_nav_review', icon: ClipboardCheck },
    ],
  },
  {
    labelKey: 'admin_nav_group_academic',
    items: [
      { to: '/scholarships', labelKey: 'admin_nav_scholarships', icon: Sparkles },
      { to: '/universities', labelKey: 'admin_nav_universities', icon: Building2 },
      { to: '/majors', labelKey: 'admin_nav_majors', icon: GraduationCap },
      { to: '/international-tests', labelKey: 'admin_nav_tests', icon: FileText },
      { to: '/courses', labelKey: 'admin_nav_courses', icon: BookOpen },
      { to: '/study-destinations', labelKey: 'admin_nav_study_destinations', icon: MapPinned },
    ],
  },
  {
    labelKey: 'admin_nav_group_localization',
    items: [
      { to: '/translations', labelKey: 'admin_nav_translations', icon: Languages },
      { to: '/cms', labelKey: 'admin_nav_cms', icon: FileText },
    ],
  },
  {
    labelKey: 'admin_nav_group_operations',
    items: [
      { to: '/imports', labelKey: 'admin_nav_imports', icon: UploadCloud },
      { to: '/certificates', labelKey: 'admin_nav_certificates', icon: Award },
      { to: '/health-readiness', labelKey: 'admin_nav_health', icon: HeartPulse },
    ],
  },
  {
    labelKey: 'admin_nav_group_platform',
    items: [
      { to: '/services', labelKey: 'admin_nav_services', icon: Wrench },
      { to: '/finance', labelKey: 'admin_nav_finance', icon: CircleDollarSign },
      { to: '/careers', labelKey: 'admin_nav_careers', icon: BriefcaseBusiness },
      { to: '/ai', labelKey: 'admin_nav_ai', icon: Bot },
      { to: '/student-tools', labelKey: 'admin_nav_tools', icon: Activity },
    ],
  },
  {
    labelKey: 'admin_nav_group_governance',
    items: [
      { to: '/academic-taxonomy', labelKey: 'admin_nav_academic_taxonomy', icon: ShieldCheck },
      { to: '/settings', labelKey: 'admin_nav_settings', icon: Settings },
    ],
  },
];

function itemClass(active: boolean) {
  return [
    'group flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-xs font-extrabold transition',
    active
      ? 'bg-[#DDEFF2]/80 text-[#142B5F] shadow-sm ring-1 ring-[#21A7B4]/15'
      : 'text-[#203442]/68 hover:bg-[#FAF7F0] hover:text-[#0E7C86]',
  ].join(' ');
}

export function AdminNavigation() {
  const { t } = useTranslation();

  return (
    <aside className="w-full shrink-0 border-b border-[#DDEFF2] bg-white lg:w-[270px] lg:border-b-0 lg:border-e lg:min-h-[calc(100vh-73px)]">
      <div className="sticky top-[73px] max-h-[calc(100vh-73px)] overflow-y-auto p-4">
        <div className="mb-4 rounded-2xl border border-[#D6A43B]/25 bg-[#F4D999]/12 p-3">
          <div className="flex items-center gap-2 text-xs font-black text-[#142B5F]">
            <Languages className="h-4 w-4 text-[#0E7C86]" />
            {t('admin_bilingual_control')}
          </div>
          <p className="mt-1 text-[10px] font-semibold leading-5 text-[#203442]/58">{t('admin_bilingual_control_help')}</p>
        </div>

        <nav aria-label={t('admin_navigation')} className="space-y-5">
          {groups.map((group) => (
            <section key={group.labelKey}>
              <h2 className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.16em] text-[#203442]/38">
                {t(group.labelKey)}
              </h2>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/dashboard' || item.to === '/imports' || item.to === '/settings'}
                      className={({ isActive }) => itemClass(isActive)}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-[#0E7C86] transition group-hover:text-[#21A7B4]" />
                      <span>{t(item.labelKey)}</span>
                    </NavLink>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>
      </div>
    </aside>
  );
}
