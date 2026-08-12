import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  PlusCircle, 
  UploadCloud, 
  RefreshCw, 
  Search, 
  Building2, 
  Eye, 
  FilterX,
  Loader2
} from 'lucide-react';
import { ApiClient } from '../../api/client';

export function AdminUniversitiesPreviewPage() {
  const adminSessionPresent = Boolean(localStorage.getItem('manaratak_access_token'));

  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUniversities, setTotalUniversities] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('كل الجامعات');
  const [selectedContinent, setSelectedContinent] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const STATS_CARDS = [
    'كل الجامعات',
    'بيانات ناقصة',
    'بيانات مكتملة',
    'معتمدة',
    'منشورة',
    'مرفوضة أو مؤرشفة',
  ];

  function mapApiStatusToCard(status?: string, completeness?: string, verification?: string) {
    if (status === 'PUBLISHED') return 'منشورة';
    if (status === 'ARCHIVED') return 'مرفوضة أو مؤرشفة';
    if (completeness === 'incomplete') return 'بيانات ناقصة';
    if (status === 'READY_TO_PUBLISH') return 'بيانات مكتملة';
    return 'غير مصنف';
  }

  const loadData = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiClient.getAdminUniversities({
        page: currentPage,
        pageSize: 50,
        search: searchQuery.trim() || undefined,
        country: selectedCountry || undefined,
      }, signal);
      let items = res.data || [];
      
      const apiItems = items.map((item: any) => ({
        ...item,
        englishName: item.displayName || '',
        localName: item.originalName || '',
        abbreviation: '',
        referenceId: item.id,
        nationalCode: '',
        continent: 'Unknown',
        region: 'Unknown',
        city: item.city || 'Unknown',
        ownership: item.universityType === 'Private' ? 'Private' : 'Public',
        completeness: item.completenessStatus === 'incomplete' ? 'Incomplete' : 'Complete',
        mappedStatus: mapApiStatusToCard(item.status, item.completenessStatus, item.verificationStatus)
      }));

      setUniversities(apiItems);
      setTotalUniversities(res.total || 0);
      setTotalPages(Math.max(1, res.totalPages || 1));
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      setError(err.message || 'Failed to load universities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!adminSessionPresent) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => void loadData(controller.signal), 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [adminSessionPresent, currentPage, searchQuery, selectedCountry]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCountry]);

  // Reset dependent filters
  useEffect(() => {
    setSelectedCountry('');
    setSelectedRegion('');
    setSelectedCity('');
  }, [selectedContinent]);

  useEffect(() => {
    setSelectedRegion('');
    setSelectedCity('');
  }, [selectedCountry]);

  useEffect(() => {
    setSelectedCity('');
  }, [selectedRegion]);

  if (!adminSessionPresent) {
    return <Navigate to="/login" replace />;
  }

  // Filter Logic
  const filteredUniversities = universities.filter(u => {
    // 1. Status
    if (selectedStatus !== 'كل الجامعات' && u.mappedStatus !== selectedStatus) return false;
    
    // 2. Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        (u.englishName && u.englishName.toLowerCase().includes(q)) ||
        (u.localName && u.localName.toLowerCase().includes(q)) ||
        (u.abbreviation && u.abbreviation.toLowerCase().includes(q)) ||
        (u.referenceId && u.referenceId.toLowerCase().includes(q)) ||
        (u.nationalCode && u.nationalCode.toLowerCase().includes(q)) ||
        (u.officialWebsite && u.officialWebsite.toLowerCase().includes(q));
      if (!match) return false;
    }

    // 3. Location
    if (selectedContinent && u.continent !== selectedContinent) return false;
    if (selectedCountry && u.country !== selectedCountry) return false;
    if (selectedRegion && u.region !== selectedRegion) return false;
    if (selectedCity && u.city !== selectedCity) return false;

    return true;
  });

  const clearFilters = () => {
    setSelectedContinent('');
    setSelectedCountry('');
    setSelectedRegion('');
    setSelectedCity('');
    setSearchQuery('');
    setSelectedStatus('كل الجامعات');
  };

  const hasActiveFilters = selectedContinent || selectedCountry || selectedRegion || selectedCity || searchQuery || selectedStatus !== 'كل الجامعات';

  // Dynamic dropdown options based on the full list (or currently filtered list, but full list is usually better to avoid dead ends)
  const availableContinents = Array.from(new Set(universities.map(u => u.continent).filter(Boolean)));
  const availableCountries = Array.from(new Set(universities.filter(u => !selectedContinent || u.continent === selectedContinent).map(u => u.country).filter(Boolean)));
  const availableRegions = Array.from(new Set(universities.filter(u => (!selectedContinent || u.continent === selectedContinent) && (!selectedCountry || u.country === selectedCountry)).map(u => u.region).filter(Boolean)));
  const availableCities = Array.from(new Set(universities.filter(u => (!selectedContinent || u.continent === selectedContinent) && (!selectedCountry || u.country === selectedCountry) && (!selectedRegion || u.region === selectedRegion)).map(u => u.city).filter(Boolean)));

  return (
    <div dir="rtl" className="min-h-screen bg-[#f7f8fa] text-slate-900 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900">الجامعات</h1>
            <span className="px-2.5 py-0.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-full">
              {totalUniversities}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => void loadData()}
              title="تحديث القائمة"
              className="p-2.5 text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <span
              aria-disabled="true"
              title="University bulk import is blocked pending Google Studio"
              className="flex cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-400"
            >
              <UploadCloud className="w-4 h-4" />
              <span>فتح مركز الاستيراد الموحد</span>
            </span>
            <button
              type="button"
              disabled
              title="University creation is unavailable during readiness preparation"
              className="flex cursor-not-allowed items-center gap-2 rounded-lg bg-slate-300 px-4 py-2.5 text-sm font-bold text-slate-500"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة جامعة</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {STATS_CARDS.map(status => {
            const count = status === 'كل الجامعات' 
              ? totalUniversities 
              : universities.filter(u => u.mappedStatus === status).length;
            const isActive = selectedStatus === status;
            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all ${
                  isActive 
                    ? 'bg-[#0F4B3A] border-[#0F4B3A] text-white shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <span className={`text-lg font-black mb-1 ${isActive ? 'text-white' : 'text-slate-900'}`}>
                  {count}
                </span>
                <span className="text-[11px] font-bold leading-tight">
                  {status}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search and Cascading Filters */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                type="text"
                placeholder="ابحث باسم الجامعة أو المعرف أو الاختصار..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-3 py-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#0F4B3A] focus:border-[#0F4B3A] focus:outline-none bg-slate-50 hover:bg-white transition-colors text-sm"
              />
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-colors md:w-auto w-full shrink-0"
              >
                <FilterX className="w-4 h-4" />
                <span>مسح التصفية</span>
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <select
              value={selectedContinent}
              onChange={(e) => setSelectedContinent(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 text-sm focus:ring-1 focus:ring-[#0F4B3A] focus:border-[#0F4B3A] focus:outline-none hover:bg-white transition-colors"
            >
              <option value="">القارة (الكل)</option>
              {availableContinents.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              disabled={!selectedContinent && availableCountries.length > 50}
              className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 text-sm focus:ring-1 focus:ring-[#0F4B3A] focus:border-[#0F4B3A] focus:outline-none hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">الدولة (الكل)</option>
              {availableCountries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              disabled={!selectedCountry}
              className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 text-sm focus:ring-1 focus:ring-[#0F4B3A] focus:border-[#0F4B3A] focus:outline-none hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">المنطقة أو الولاية (الكل)</option>
              {availableRegions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={!selectedRegion && !selectedCountry}
              className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 text-sm focus:ring-1 focus:ring-[#0F4B3A] focus:border-[#0F4B3A] focus:outline-none hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">المدينة (الكل)</option>
              {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Universities Table */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-20 text-center text-slate-500 flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#0F4B3A] mb-4" />
              <p className="text-sm font-medium">جاري تحميل البيانات...</p>
            </div>
          ) : error ? (
            <div className="p-20 text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
                <FilterX className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-700 font-bold">{error}</p>
              <button onClick={() => void loadData()} className="mt-4 px-4 py-2 text-sm text-[#0F4B3A] bg-emerald-50 rounded-lg font-bold">إعادة المحاولة</button>
            </div>
          ) : filteredUniversities.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">لا توجد نتائج</h3>
              <p className="text-sm text-slate-500">لم نتمكن من العثور على أي جامعات تطابق معايير البحث الحالية.</p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="mt-6 px-5 py-2.5 text-sm bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-bold transition-colors">
                  مسح التصفية
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="p-4 whitespace-nowrap">اسم الجامعة</th>
                    <th className="p-4 whitespace-nowrap">المدينة</th>
                    <th className="p-4 whitespace-nowrap">الملكية</th>
                    <th className="p-4 whitespace-nowrap">حالة الاكتمال</th>
                    <th className="p-4 text-left whitespace-nowrap">التفاصيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredUniversities.map((uni) => (
                    <tr key={uni.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-slate-900">{uni.englishName}</span>
                          <span className="text-xs text-slate-500 mt-1 font-medium">{uni.localName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-slate-700 font-medium">{uni.city || '-'}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-slate-700 font-medium">
                          {uni.ownership === 'Public' ? 'حكومية' : uni.ownership === 'Private' ? 'خاصة' : uni.ownership || '-'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          {uni.completeness === 'Complete' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                              مكتملة
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                              {uni.completeness === 'Incomplete' ? 'ناقص 5 حقول' : uni.completeness}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-left">
                        <Link
                          to={`/admin/universities/${uni.id}`}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-[#0F4B3A] rounded-md text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          عرض التفاصيل
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <button
            type="button"
            disabled={currentPage <= 1 || loading}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-bold disabled:opacity-50"
          >
            Previous
          </button>
          <span className="font-bold text-slate-600">{currentPage} / {totalPages}</span>
          <button
            type="button"
            disabled={currentPage >= totalPages || loading}
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-bold disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
