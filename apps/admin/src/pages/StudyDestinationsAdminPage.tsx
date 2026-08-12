import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/I18nProvider';
import { adminApiClient } from '../api/client';
import { Search, Filter, Loader2, Globe, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';

const API_BASE = '/reference-data';

interface Country {
  iso2Code: string;
  iso3Code?: string;
  name: string;
  officialName?: string;
  region: string | null;
  subregion?: string | null;
  defaultCurrencyCode?: string | null;
  defaultLanguageCode?: string | null;
  callingCode?: string | null;
  flagAssetId?: string | null;
  metadata?: any;
}

export function StudyDestinationsAdminPage() {
  const { language } = useTranslation();
  const isAr = language === 'ar';
  
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Localized string dictionary
  const text = {
    title: isAr ? 'دول الدراسة' : 'Study Destinations',
    subtitle: isAr ? 'إدارة ملفات دول الدراسة الغنية بالمعلومات.' : 'Manage rich country study destination profiles.',
    searchPlaceholder: isAr ? 'البحث باسم الدولة، الرمز (ISO2/ISO3) أو المنطقة...' : 'Search by country name, ISO2, ISO3, or region...',
    filterRegion: isAr ? 'المنطقة' : 'Region',
    filterStatus: isAr ? 'حالة الوجهة' : 'Destination Status',
    statusCandidate: isAr ? 'وجهات مقترحة فقط' : 'Candidates Only',
    statusUnreviewed: isAr ? 'غير مراجعة' : 'Unreviewed',
    statusDraft: isAr ? 'مسودة' : 'Draft',
    all: isAr ? 'الكل' : 'All',
    loading: isAr ? 'جاري تحميل الدول...' : 'Loading countries...',
    refresh: isAr ? 'تحديث' : 'Refresh',
    emptyStateTitle: isAr ? 'لا توجد نتائج مطابقة' : 'No countries found',
    emptyStateDesc: isAr ? 'لم يتم العثور على أي دول تطابق خيارات البحث والتصفية الخاصة بك.' : 'No countries found matching your search and filter criteria.',
    noCountriesInReferenceTitle: isAr ? 'لا توجد دول' : 'No Countries',
    noCountriesInReferenceDesc: isAr ? 'لا توجد دول مرجعية مضافة حتى الآن.' : 'No reference countries have been added yet.',
    notAvailableYet: isAr ? 'غير متوفر بعد' : 'Not available yet',
    openProfile: isAr ? 'فتح ملف الدولة' : 'Open Country Profile',
    apiUnavailable: isAr ? 'تعذر تحميل الدول من واجهة البيانات المرجعية.' : 'Unable to load countries from Reference Data API.',
    moreFilters: isAr ? 'خيارات تصفية إضافية' : 'More Filters',
    realFieldsTitle: isAr ? 'بيانات المرجع (المرحلة 07)' : 'Reference Fields (Phase 07)',
    currency: isAr ? 'العملة' : 'Currency',
    languageLabel: isAr ? 'اللغة' : 'Language',
    callingCodeLabel: isAr ? 'رمز الاتصال' : 'Calling Code'
  };

  const fetchCountries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApiClient.request<{ data: Country[] }>(`${API_BASE}/countries`);
      setCountries(res.data || []);
    } catch (err: any) {
      setError('UNAVAILABLE');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  // Standard flag emoji helper
  const getFlagEmoji = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0));
    try {
      return String.fromCodePoint(...codePoints);
    } catch {
      return '🏳️';
    }
  };

  // Perform multi-criteria client-side filtering on the real country list
  const filteredCountries = countries.filter((country) => {
    const matchesSearch =
      searchQuery === '' ||
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.iso2Code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (country.iso3Code && country.iso3Code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (country.region && country.region.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (country.subregion && country.subregion.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesRegion =
      selectedRegion === 'all' ||
      country.region === selectedRegion ||
      (selectedRegion === 'North America' && country.region === 'Americas' && ['North America', 'Northern America', 'Central America', 'Caribbean'].includes(country.subregion || '')) ||
      (selectedRegion === 'South America' && country.region === 'Americas' && country.subregion === 'South America');

    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'candidate' && country.metadata?.studyDestinationCandidate === true) ||
      (selectedStatus === 'unreviewed' && country.metadata?.destinationReviewStatus === 'UNREVIEWED') ||
      (selectedStatus === 'draft' && country.metadata?.publicStatus === 'DRAFT');

    return matchesSearch && matchesRegion && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6" id="study-destinations-admin-container">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="study-destinations-header">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{text.title}</h2>
          <p className="text-base text-gray-500 mt-1">{text.subtitle}</p>
        </div>
        <button
          onClick={fetchCountries}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          id="study-destinations-refresh-btn"
        >
          <RefreshCw className="h-4 w-4 text-gray-500" />
          {text.refresh}
        </button>
      </div>

      {/* Filter and search control panel */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4" id="study-destinations-filter-panel">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={text.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 text-sm"
              id="study-destinations-search-input"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-semibold transition-all ${
              showFilters
                ? 'bg-slate-100 border-slate-300 text-slate-800'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
            id="study-destinations-toggle-filters-btn"
          >
            <Filter className="h-4 w-4" />
            {text.moreFilters}
          </button>
        </div>

        {/* Extended filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 pt-4 border-t border-gray-100 animate-fadeIn" id="study-destinations-extended-filters">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{text.filterStatus}</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-slate-400 focus:outline-none"
              >
                <option value="all">{text.all}</option>
                <option value="candidate">{text.statusCandidate}</option>
                <option value="unreviewed">{text.statusUnreviewed}</option>
                <option value="draft">{text.statusDraft}</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{text.filterStatus}</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-slate-400 focus:outline-none"
              >
                <option value="all">{text.all}</option>
                <option value="candidate">{text.statusCandidate}</option>
                <option value="unreviewed">{text.statusUnreviewed}</option>
                <option value="draft">{text.statusDraft}</option>
              </select>
            </div>
            {/* Region Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{text.filterRegion}</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-slate-400 focus:outline-none"
              >
                <option value="all">{text.all}</option>
                <option value="Asia">Asia</option>
                <option value="Europe">Europe</option>
                <option value="North America">North America</option>
                <option value="South America">South America</option>
                <option value="Africa">Africa</option>
                <option value="Oceania">Oceania</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main content display */}
      {error ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-2xl flex items-start gap-3" id="study-destinations-error-state">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-amber-900">{isAr ? 'خطأ في التحميل' : 'Loading Error'}</h4>
            <p className="text-sm mt-1">{text.apiUnavailable}</p>
          </div>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center h-64" id="study-destinations-loading-state">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : filteredCountries.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm" id="study-destinations-empty-state">
          <Globe className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-bold text-lg text-gray-900 mb-1">
            {countries.length === 0 ? text.noCountriesInReferenceTitle : text.emptyStateTitle}
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            {countries.length === 0 ? text.noCountriesInReferenceDesc : text.emptyStateDesc}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn" id="study-destinations-grid">
          {filteredCountries.map((country) => (
            <div
              key={country.iso2Code}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              id={`country-card-${country.iso2Code}`}
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                      <span className="text-2xl" role="img" aria-label={`${country.name} flag`}>
                        {getFlagEmoji(country.iso2Code)}
                      </span>
                      {country.name}
                    </h3>
                    <span className="text-xs font-mono text-gray-500 uppercase mt-1 block">
                      {country.iso2Code} • {country.iso3Code || '-'} {country.region ? `• ${country.region}` : ''} {country.subregion ? `• ${country.subregion}` : ''}
                    </span>
                  </div>
                </div>

                {/* Real reference data fields */}
                <div className="border-t border-b border-gray-100 py-3 my-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                    {text.realFieldsTitle}
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                    <div>
                      <span className="block text-gray-400">{text.currency}</span>
                      <span className="font-semibold text-gray-700">
                        {country.defaultCurrencyCode || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-400">{text.languageLabel}</span>
                      <span className="font-semibold text-gray-700">
                        {country.defaultLanguageCode || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-400">{text.callingCodeLabel}</span>
                      <span className="font-semibold text-gray-700">
                        {country.callingCode ? `+${country.callingCode}` : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                to={`/study-destinations/${country.iso2Code}`}
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-semibold text-sm py-2.5 px-4 rounded-xl hover:bg-slate-800 transition-colors"
                id={`open-country-btn-${country.iso2Code}`}
              >
                {text.openProfile}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
