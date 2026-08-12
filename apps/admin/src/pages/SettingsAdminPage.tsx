import { useTranslation } from "../i18n/I18nProvider";
import { ShieldCheck, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SettingsAdminPage() {
  const { t } = useTranslation();
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t('admin_settings') || 'Settings & Access Control'}</h2>
        <p className="text-sm text-gray-500 mt-1">Configure platform access control, role permissions, and system parameters.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-sm">
          <ShieldCheck className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-2">Platform Settings & Access Control</h3>
          <p className="text-gray-600 text-sm max-w-md mx-auto">
            Configure security roles, API keys, platform feature flags, and administrative permissions.
          </p>
        </div>
        <Link to="/settings/reference-data" className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-sm hover:border-blue-300 hover:shadow-md transition-all group">
          <Database className="w-12 h-12 text-gray-700 mx-auto mb-3 group-hover:text-blue-600" />
          <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600">Reference Data</h3>
          <p className="text-gray-600 text-sm max-w-md mx-auto group-hover:text-gray-900">
            Foundational Settings for Countries, Currencies, Languages, and Cities.
          </p>
        </Link>
      </div>
    </div>
  );
}
