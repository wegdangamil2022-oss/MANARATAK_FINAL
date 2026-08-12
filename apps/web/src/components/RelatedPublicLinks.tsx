import { Link } from 'react-router-dom';
import { useTranslation } from "../i18n/I18nProvider";

interface RelatedPublicLinksProps {
  current?: string;
}

const links = [
  { key: 'scholarships', to: '/scholarships', label: 'Scholarships' },
  { key: 'universities', to: '/universities', label: 'Universities' },
  { key: 'majors', to: '/majors', label: 'Majors' },
  { key: 'courses', to: '/courses', label: 'Courses' },
  { key: 'tests', to: '/international-tests', label: 'International Tests' },
  { key: 'services', to: '/services', label: 'Services' },
  { key: 'tools', to: '/tools', label: 'Student Tools' },
  { key: 'search', to: '/search', label: 'Search' },
  { key: 'compare', to: '/compare', label: 'Compare' },
];

export function RelatedPublicLinks({ current }: RelatedPublicLinksProps) {
    const { t } = useTranslation();
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black">{t('continue_exploring')}</h2>
      <p className="mt-1 text-sm leading-6 text-gray-600">{t('jump_to_related_public_pages_without_losing_your_p')}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {links.filter((link) => link.key !== current).slice(0, 6).map((link) => (
          <Link key={link.key} to={link.to} className="min-h-11 rounded-xl bg-slate-50 px-3 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100">
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
