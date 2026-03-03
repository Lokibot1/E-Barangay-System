import { useState, useEffect } from 'react';
import { Spinner } from '../../components/sub-system-1/analytics/AnalyticsInterface';
import { TABS } from '../../components/sub-system-1/analytics/analyticsConfig';
import OverviewTab from '../../components/sub-system-1/analytics/tabs/OverviewTab';
import HeatmapTab from '../../components/sub-system-1/analytics/tabs/HeatmapTab';
import DemographicsTab from '../../components/sub-system-1/analytics/tabs/DemographicsTab';
import SectorsTab from '../../components/sub-system-1/analytics/tabs/SectorsTab';
import RegistrationTab from '../../components/sub-system-1/analytics/tabs/RegistrationTab';
import LivelihoodTab from '../../components/sub-system-1/analytics/tabs/LivelihoodTab';
import DecisionGuideTab from '../../components/sub-system-1/analytics/tabs/DecisionguideTab';
import { API_BASE_URL } from '../../config/api';
import themeTokens from '../../Themetokens';

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
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem('appTheme') || 'blue'
  );

  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener('themeChange', handler);
    return () => window.removeEventListener('themeChange', handler);
  }, []);

  const t = themeTokens[currentTheme];
  const isDark = currentTheme === 'dark';

  const [activeTab, setActiveTab]   = useState('overview');
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

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

  const tabMeta = TABS.find(tb => tb.id === activeTab);

  return (
    <div className="flex flex-col min-h-full">
      {/* Tab header bar */}
      <div className={`sticky top-0 z-20 ${t.cardBg} border-b ${t.cardBorder} shadow-sm`}>
        {/* Title row */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-3">
          <div>
           <h1 className={`text-base font-spartan font-bold ${t.cardText} flex items-center gap-2`}>
  {tabMeta?.icon && <tabMeta.icon size={18} strokeWidth={2.5} />} 
  Analytics — {tabMeta?.label}
</h1>
            <p className={`text-xs font-kumbh ${t.subtleText}`}>
              {lastUpdated
                ? `Updated: ${lastUpdated.toLocaleTimeString('en-PH')} · Barangay Gulod`
                : 'Barangay Gulod, Novaliches, Quezon City'}
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className={`text-xs font-kumbh font-bold bg-gradient-to-r ${t.primaryGrad} text-white px-3 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all`}
          >
            {loading ? '⟳ Loading…' : '⟳ Refresh'}
          </button>
        </div>

        {/* Tabs scroll row */}
        <div className={`px-6 sm:px-8 overflow-x-auto`}>
          <div className="flex gap-1 min-w-max">
  {TABS.map(tab => {
    const Icon = tab.icon; 
    return (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`flex items-center gap-2 px-3 py-3 text-sm font-kumbh font-bold whitespace-nowrap border-b-2 transition-colors ${
          activeTab === tab.id
            ? `${t.sidebarActiveBorder} ${t.sidebarActiveText}`
            : `border-transparent ${t.subtleText} hover:${t.sidebarActiveText}`
        }`}
      >
        <Icon size={16} /> {tab.label}
      </button>
    );
  })}
</div>
        </div>
      </div>

      {/* Content */}
      <main className="p-6 sm:p-8 max-w-7xl mx-auto w-full">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className={`w-12 h-12 border-4 ${t.primaryText} border-t-transparent rounded-full animate-spin`}
              style={{ borderColor: isDark ? '#64748b' : '#3b82f6', borderTopColor: 'transparent' }}
            />
            <p className={`${t.subtleText} font-kumbh text-sm font-medium`}>
              Loading analytics data…
            </p>
          </div>
        )}

        {!loading && error && (
          <div className={`${t.cardBg} border ${t.cardBorder} rounded-xl p-6 text-center shadow-sm`}>
            <div className="text-3xl mb-2">⚠️</div>
            <h3 className={`font-spartan font-bold ${t.cardText} text-lg mb-1`}>
              Cannot load data
            </h3>
            <p className={`${t.subtleText} font-kumbh text-sm mb-4`}>{error}</p>
            <p className={`text-xs ${t.subtleText} font-kumbh ${t.inlineBg} rounded p-3 mb-4 text-left font-mono`}>
              Endpoint: GET {API_BASE}/analytics/all
            </p>
            <button
              onClick={fetchData}
              className="bg-red-600 text-white font-kumbh font-bold px-4 py-2 rounded-lg text-sm hover:bg-red-700"
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
