import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { TABS } from '../../components/sub-system-1/analytics/analyticsConfig';
import OverviewTab from '../../components/sub-system-1/analytics/tabs/OverviewTab';
import HeatmapTab from '../../components/sub-system-1/analytics/tabs/HeatmapTab';
import DemographicsTab from '../../components/sub-system-1/analytics/tabs/DemographicsTab';
import SectorsTab from '../../components/sub-system-1/analytics/tabs/SectorsTab';
import RegistrationTab from '../../components/sub-system-1/analytics/tabs/RegistrationTab';
import LivelihoodTab from '../../components/sub-system-1/analytics/tabs/LivelihoodTab';
import DecisionGuideTab from '../../components/sub-system-1/analytics/tabs/DecisionguideTab';
import { analyticsService } from '../../services/sub-system-1/analytics';
import { API_BASE_URL } from '../../config/api';
import themeTokens from '../../Themetokens';

const API_BASE = import.meta.env.VITE_API_URL || API_BASE_URL;

function renderTab(id, data, t) {
  switch (id) {
    case 'overview':
      return <OverviewTab raw={data} t={t} />;
    case 'heatmap':
      return <HeatmapTab raw={data} t={t} />;
    case 'demographics':
      return <DemographicsTab raw={data} t={t} />;
    case 'sectors':
      return <SectorsTab raw={data} t={t} />;
    case 'registration':
      return <RegistrationTab raw={data} t={t} />;
    case 'livelihood':
      return <LivelihoodTab raw={data} t={t} />;
    case 'insights':
      return <DecisionGuideTab raw={data} t={t} />;
    default:
      return null;
  }
}

export default function Dashboard() {
  const { tr } = useLanguage();
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('appTheme') || 'modern');

  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener('themeChange', handler);
    return () => window.removeEventListener('themeChange', handler);
  }, []);

  const t = themeTokens[currentTheme] || themeTokens.modern || themeTokens.blue;
  const isDark = currentTheme === 'dark';

  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyticsService.getAllData();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err?.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const tabMeta = TABS.find((tb) => tb.id === activeTab);

  return (
    <div className={`flex flex-col min-h-full ${t.pageBg}`}>
      <div className={`sticky top-0 z-10 ${t.cardBg} border-b ${t.cardBorder} shadow-sm`}>
        <div className="flex items-center justify-between px-6 sm:px-8 py-4">
          <div>
            <h1 className={`text-base sm:text-lg font-spartan font-bold ${t.cardText} flex items-center gap-2`}>
              {tabMeta?.icon && <tabMeta.icon size={18} strokeWidth={2.4} />}
              {tr.sub1.dashboard} - {tabMeta?.label}
            </h1>
            <p className={`text-xs font-kumbh ${t.subtleText}`}>
              {lastUpdated
                ? `Updated: ${lastUpdated.toLocaleTimeString('en-PH')} - Barangay Gulod`
                : 'Barangay Gulod, Novaliches, Quezon City'}
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="text-xs font-kumbh font-normal bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {loading ? tr.sub1.loading : tr.sub1.refresh || 'Refresh'}
          </button>
        </div>

        <div className="px-6 sm:px-8 pb-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-2 text-[13px] font-kumbh font-normal whitespace-nowrap border rounded-lg transition-all ${
                    active
                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : `border-transparent ${t.subtleText} hover:border-slate-200 hover:bg-slate-50`
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="relative z-0 p-3 sm:p-5 w-full">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div
              className={`w-12 h-12 border-4 ${t.primaryText} border-t-transparent rounded-full animate-spin`}
              style={{ borderColor: isDark ? '#64748b' : '#2563eb', borderTopColor: 'transparent' }}
            />
            <p className={`${t.subtleText} font-kumbh text-sm font-medium`}>{tr.sub1.loading}</p>
          </div>
        )}

        {!loading && error && (
          <div className={`${t.cardBg} border ${t.cardBorder} rounded-xl p-6 text-center shadow-sm`}>
            <div className="text-3xl mb-2">!</div>
            <h3 className={`font-spartan font-bold ${t.cardText} text-lg mb-1`}>{tr.common.error}</h3>
            <p className={`${t.subtleText} font-kumbh text-sm mb-4`}>{error}</p>
            <p className={`text-xs ${t.subtleText} font-kumbh ${t.inlineBg} rounded p-3 mb-4 text-left font-mono`}>
              Endpoint: GET {API_BASE}/analytics/all
            </p>
            <button
              onClick={fetchData}
              className="bg-red-600 text-white font-kumbh font-normal px-4 py-2 rounded-lg text-sm hover:bg-red-700"
            >
              {tr.common.tryAgain}
            </button>
          </div>
        )}

        {!loading && !error && data && renderTab(activeTab, data, t)}
      </main>
    </div>
  );
}
