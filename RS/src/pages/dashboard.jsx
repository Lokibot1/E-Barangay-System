// ============================================================
// pages/Analytics.jsx
// Main analytics page. Route: /analytics
// Fetches: GET /api/analytics/all
// ============================================================

import { useState, useEffect } from 'react';
import { Spinner }        from '../components/analytics/AnalyticsInterface';
import { TABS }           from '../components/analytics/analyticsConfig';
import OverviewTab        from '../components/analytics/tabs/OverviewTab';
import HeatmapTab         from '../components/analytics/tabs/HeatmapTab';
import DemographicsTab    from '../components/analytics/tabs/DemographicsTab';
import SectorsTab         from '../components/analytics/tabs/SectorsTab';
import RegistrationTab    from '../components/analytics/tabs/RegistrationTab';
import LivelihoodTab      from '../components/analytics/tabs/LivelihoodTab';
import DecisionGuideTab   from '../components/analytics/tabs/DecisionguideTab';
import { API_BASE_URL } from '@/config/api';

const API_BASE = import.meta.env.VITE_API_URL || API_BASE_URL;

function renderTab(id, data) {
  switch (id) {
    case 'overview':     return <OverviewTab      raw={data} />;
    case 'heatmap':      return <HeatmapTab       raw={data} />;
    case 'demographics': return <DemographicsTab  raw={data} />;
    case 'sectors':      return <SectorsTab       raw={data} />;
    case 'registration': return <RegistrationTab  raw={data} />;
    case 'livelihood':   return <LivelihoodTab    raw={data} />;
    case 'insights':     return <DecisionGuideTab raw={data} />;
    default:             return null;
  }
}

export default function Dashboard() {
  const [activeTab,    setActiveTab]    = useState('overview');
  const [data,         setData]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [lastUpdated,  setLastUpdated]  = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/analytics/all`, {
        headers: { Accept: 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      setData(await res.json());
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => { fetchData(); }, []);

  const tabMeta = TABS.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900/40 transition-colors duration-300">

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-base font-black text-[#0d2b4e] dark:text-slate-100">
            {tabMeta?.icon} Analytics — {tabMeta?.label}
          </h1>
          <p className="text-xs text-gray-400 dark:text-slate-400">
            {lastUpdated
              ? `Updated: ${lastUpdated.toLocaleTimeString('en-PH')} · Barangay Gulod`
              : 'Barangay Gulod, Novaliches, Quezon City'}
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="text-xs font-bold bg-[#1a5276] text-white px-3 py-1.5 rounded-lg
            hover:bg-[#154360] disabled:opacity-50 transition-colors"
        >
          {loading ? '⟳ Loading…' : '⟳ Refresh'}
        </button>
      </header>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 sm:px-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#1a5276] text-[#1a5276] dark:border-emerald-400 dark:text-emerald-400'
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-[#1a5276] dark:hover:text-emerald-300 hover:border-gray-300 dark:hover:border-slate-600'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="p-4 sm:p-6 max-w-7xl mx-auto">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-[#1a5276] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">Loading analytics data…</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">⚠️</div>
            <h3 className="font-black text-red-700 dark:text-red-300 text-lg mb-1">Cannot load data</h3>
            <p className="text-red-600 dark:text-red-300 text-sm mb-4">{error}</p>
            <p className="text-xs text-red-500 dark:text-red-300 bg-red-100 dark:bg-red-900/40 rounded p-3 mb-4 font-mono text-left">
              Endpoint: GET {API_BASE}/analytics/all
            </p>
            <button
              onClick={fetchData}
              className="bg-red-600 text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && data && renderTab(activeTab, data)}
      </main>
    </div>
  );
}




