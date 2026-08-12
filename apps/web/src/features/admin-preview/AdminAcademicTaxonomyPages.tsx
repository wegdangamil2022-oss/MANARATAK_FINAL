import { AcademicTaxonomyAdminPage } from '../../../../admin/src/pages/AcademicTaxonomyAdminPage';
import { AcademicTaxonomyDetailPage } from '../../../../admin/src/pages/AcademicTaxonomyDetailPage';
import { I18nProvider as AdminI18nProvider } from '../../../../admin/src/i18n/I18nProvider';

export function AdminAcademicTaxonomyPage() {
  return (
    <AdminI18nProvider>
      <AcademicTaxonomyAdminPage />
    </AdminI18nProvider>
  );
}

export function AdminAcademicTaxonomyDetailPage() {
  return (
    <AdminI18nProvider>
      <AcademicTaxonomyDetailPage />
    </AdminI18nProvider>
  );
}
