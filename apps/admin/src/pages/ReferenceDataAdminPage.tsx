import React, { useState, useEffect } from 'react';
import { CsrfClientManager } from '@manaratak/shared';

const API_BASE = '/api/v1/reference-data';
const ADMIN_API_BASE = '/api/v1/admin/reference-data';

function useFetchData(endpoint: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const separator = endpoint.includes('?') ? '&' : '?';
      const res = await CsrfClientManager.getInstance().fetchWithCsrf(`${API_BASE}${endpoint}${separator}page=1&pageSize=50`);
      if (!res.ok) throw new Error(`Error: ${res.statusText}`);
      const json = await res.json();
      setData(json.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  return { data, loading, error, refetch: fetchData };
}

export function ReferenceDataAdminPage() {
  const [activeTab, setActiveTab] = useState<'countries' | 'currencies' | 'languages' | 'cities'>('countries');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reference Data</h2>
        <p className="text-sm text-gray-500 mt-1">Foundational Settings for Countries, Currencies, Languages, and Cities.</p>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {['countries', 'currencies', 'languages', 'cities'].map(tab => (
            <button 
              key={tab}
              className={`px-4 py-3 text-sm font-medium capitalize whitespace-nowrap ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab(tab as any)}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="p-6">
          {activeTab === 'countries' && <CountriesTab />}
          {activeTab === 'currencies' && <CurrenciesTab />}
          {activeTab === 'languages' && <LanguagesTab />}
          {activeTab === 'cities' && <CitiesTab />}
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, required = false }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label} {required && '*'}</label>
      <input 
        type="text" 
        value={value} 
        onChange={e => onChange(e.target.value)}
        required={required}
        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function CountriesTab() {
  const { data, loading, error, refetch } = useFetchData('/countries');
  const [form, setForm] = useState({ iso2Code: '', iso3Code: '', name: '', region: '' });
  const [saveStatus, setSaveStatus] = useState<{loading: boolean, error?: string, success?: string}>({ loading: false });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus({ loading: true });
    try {
      const res = await CsrfClientManager.getInstance().fetchWithCsrf(`${ADMIN_API_BASE}/countries/${form.iso2Code}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, region: form.region || null })
      });
      if (!res.ok) throw new Error(await res.text());
      setSaveStatus({ loading: false, success: 'Saved successfully' });
      setForm({ iso2Code: '', iso3Code: '', name: '', region: '' });
      refetch();
    } catch (err: any) {
      setSaveStatus({ loading: false, error: err.message });
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSave} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
        <h3 className="font-bold text-lg">Manual Upsert Country</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="ISO2 Code" required value={form.iso2Code} onChange={(v: string) => setForm({...form, iso2Code: v})} />
          <Input label="ISO3 Code" required value={form.iso3Code} onChange={(v: string) => setForm({...form, iso3Code: v})} />
          <Input label="Name" required value={form.name} onChange={(v: string) => setForm({...form, name: v})} />
          <Input label="Region (optional)" value={form.region} onChange={(v: string) => setForm({...form, region: v})} />
        </div>
        <div className="flex items-center gap-4">
          <button type="submit" disabled={saveStatus.loading} className="bg-black text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
            {saveStatus.loading ? 'Saving...' : 'Save'}
          </button>
          {saveStatus.success && <span className="text-green-600 text-sm">{saveStatus.success}</span>}
          {saveStatus.error && <span className="text-red-600 text-sm">{saveStatus.error}</span>}
        </div>
      </form>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Active Records ({data.length})</h3>
          <button onClick={refetch} className="text-sm text-blue-600 hover:underline">Refresh</button>
        </div>
        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && data.length === 0 && <p className="text-gray-500 text-sm">No records found.</p>}
        {data.length > 0 && (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr><th className="p-3">ISO2</th><th className="p-3">ISO3</th><th className="p-3">Name</th><th className="p-3">Region</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map(item => (
                  <tr key={item.iso2Code} className="hover:bg-gray-50">
                    <td className="p-3 font-mono">{item.iso2Code}</td><td className="p-3 font-mono">{item.iso3Code}</td><td className="p-3">{item.name}</td><td className="p-3">{item.region || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function CurrenciesTab() {
  const { data, loading, error, refetch } = useFetchData('/currencies');
  const [form, setForm] = useState({ isoCode: '', name: '', symbol: '', numericCode: '' });
  const [saveStatus, setSaveStatus] = useState<{loading: boolean, error?: string, success?: string}>({ loading: false });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus({ loading: true });
    try {
      const res = await CsrfClientManager.getInstance().fetchWithCsrf(`${ADMIN_API_BASE}/currencies/${form.isoCode}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, symbol: form.symbol || null, numericCode: form.numericCode || null })
      });
      if (!res.ok) throw new Error(await res.text());
      setSaveStatus({ loading: false, success: 'Saved successfully' });
      setForm({ isoCode: '', name: '', symbol: '', numericCode: '' });
      refetch();
    } catch (err: any) {
      setSaveStatus({ loading: false, error: err.message });
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSave} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
        <h3 className="font-bold text-lg">Manual Upsert Currency</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="ISO Code" required value={form.isoCode} onChange={(v: string) => setForm({...form, isoCode: v})} />
          <Input label="Name" required value={form.name} onChange={(v: string) => setForm({...form, name: v})} />
          <Input label="Symbol (optional)" value={form.symbol} onChange={(v: string) => setForm({...form, symbol: v})} />
          <Input label="Numeric Code (optional)" value={form.numericCode} onChange={(v: string) => setForm({...form, numericCode: v})} />
        </div>
        <div className="flex items-center gap-4">
          <button type="submit" disabled={saveStatus.loading} className="bg-black text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
            {saveStatus.loading ? 'Saving...' : 'Save'}
          </button>
          {saveStatus.success && <span className="text-green-600 text-sm">{saveStatus.success}</span>}
          {saveStatus.error && <span className="text-red-600 text-sm">{saveStatus.error}</span>}
        </div>
      </form>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Active Records ({data.length})</h3>
          <button onClick={refetch} className="text-sm text-blue-600 hover:underline">Refresh</button>
        </div>
        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && data.length === 0 && <p className="text-gray-500 text-sm">No records found.</p>}
        {data.length > 0 && (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr><th className="p-3">ISO Code</th><th className="p-3">Name</th><th className="p-3">Symbol</th><th className="p-3">Numeric</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map(item => (
                  <tr key={item.isoCode} className="hover:bg-gray-50">
                    <td className="p-3 font-mono">{item.isoCode}</td><td className="p-3">{item.name}</td><td className="p-3">{item.symbol || '-'}</td><td className="p-3">{item.numericCode || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function LanguagesTab() {
  const { data, loading, error, refetch } = useFetchData('/languages');
  const [form, setForm] = useState({ isoCode: '', name: '', nativeName: '', direction: 'LTR' });
  const [saveStatus, setSaveStatus] = useState<{loading: boolean, error?: string, success?: string}>({ loading: false });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus({ loading: true });
    try {
      const res = await CsrfClientManager.getInstance().fetchWithCsrf(`${ADMIN_API_BASE}/languages/${form.isoCode}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, nativeName: form.nativeName || null })
      });
      if (!res.ok) throw new Error(await res.text());
      setSaveStatus({ loading: false, success: 'Saved successfully' });
      setForm({ isoCode: '', name: '', nativeName: '', direction: 'LTR' });
      refetch();
    } catch (err: any) {
      setSaveStatus({ loading: false, error: err.message });
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSave} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
        <h3 className="font-bold text-lg">Manual Upsert Language</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="ISO Code" required value={form.isoCode} onChange={(v: string) => setForm({...form, isoCode: v})} />
          <Input label="Name" required value={form.name} onChange={(v: string) => setForm({...form, name: v})} />
          <Input label="Native Name (optional)" value={form.nativeName} onChange={(v: string) => setForm({...form, nativeName: v})} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Direction *</label>
            <select 
              value={form.direction} 
              onChange={e => setForm({...form, direction: e.target.value})}
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="LTR">LTR</option>
              <option value="RTL">RTL</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button type="submit" disabled={saveStatus.loading} className="bg-black text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
            {saveStatus.loading ? 'Saving...' : 'Save'}
          </button>
          {saveStatus.success && <span className="text-green-600 text-sm">{saveStatus.success}</span>}
          {saveStatus.error && <span className="text-red-600 text-sm">{saveStatus.error}</span>}
        </div>
      </form>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Active Records ({data.length})</h3>
          <button onClick={refetch} className="text-sm text-blue-600 hover:underline">Refresh</button>
        </div>
        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && data.length === 0 && <p className="text-gray-500 text-sm">No records found.</p>}
        {data.length > 0 && (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr><th className="p-3">ISO Code</th><th className="p-3">Name</th><th className="p-3">Native</th><th className="p-3">Dir</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map(item => (
                  <tr key={item.isoCode} className="hover:bg-gray-50">
                    <td className="p-3 font-mono">{item.isoCode}</td><td className="p-3">{item.name}</td><td className="p-3">{item.nativeName || '-'}</td><td className="p-3">{item.direction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function CitiesTab() {
  const { data, loading, error, refetch } = useFetchData('/cities');
  const [form, setForm] = useState({ countryIso2Code: '', name: '', region: '', timezone: '' });
  const [saveStatus, setSaveStatus] = useState<{loading: boolean, error?: string, success?: string}>({ loading: false });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus({ loading: true });
    try {
      const res = await CsrfClientManager.getInstance().fetchWithCsrf(`${ADMIN_API_BASE}/cities`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, region: form.region || null, timezone: form.timezone || null })
      });
      if (!res.ok) throw new Error(await res.text());
      setSaveStatus({ loading: false, success: 'Saved successfully' });
      setForm({ countryIso2Code: '', name: '', region: '', timezone: '' });
      refetch();
    } catch (err: any) {
      setSaveStatus({ loading: false, error: err.message });
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSave} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
        <h3 className="font-bold text-lg">Manual Upsert City</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Country ISO2 Code" required value={form.countryIso2Code} onChange={(v: string) => setForm({...form, countryIso2Code: v})} />
          <Input label="Name" required value={form.name} onChange={(v: string) => setForm({...form, name: v})} />
          <Input label="Region (optional)" value={form.region} onChange={(v: string) => setForm({...form, region: v})} />
          <Input label="Timezone (optional)" value={form.timezone} onChange={(v: string) => setForm({...form, timezone: v})} />
        </div>
        <div className="flex items-center gap-4">
          <button type="submit" disabled={saveStatus.loading} className="bg-black text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
            {saveStatus.loading ? 'Saving...' : 'Save'}
          </button>
          {saveStatus.success && <span className="text-green-600 text-sm">{saveStatus.success}</span>}
          {saveStatus.error && <span className="text-red-600 text-sm">{saveStatus.error}</span>}
        </div>
      </form>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Active Records ({data.length})</h3>
          <button onClick={refetch} className="text-sm text-blue-600 hover:underline">Refresh</button>
        </div>
        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && data.length === 0 && <p className="text-gray-500 text-sm">No records found.</p>}
        {data.length > 0 && (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr><th className="p-3">Country</th><th className="p-3">City Name</th><th className="p-3">Region</th><th className="p-3">Timezone</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map(item => (
                  <tr key={`${item.countryIso2Code}-${item.name}`} className="hover:bg-gray-50">
                    <td className="p-3 font-mono">{item.countryIso2Code}</td><td className="p-3">{item.name}</td><td className="p-3">{item.region || '-'}</td><td className="p-3">{item.timezone || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
