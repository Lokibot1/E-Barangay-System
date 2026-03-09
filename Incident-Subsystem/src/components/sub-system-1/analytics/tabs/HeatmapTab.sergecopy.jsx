import { useState, useEffect, useRef } from 'react';
import { CircleDot, Map, Table2 } from 'lucide-react';
import { SectionHeader, EmptyState, ChartCard } from '../AnalyticsInterface';
import {
  BARANGAY_BOUNDARY,
  BARANGAY_CENTER,
  PUROK_CENTERS,
  HEATMAP_METRICS,
  HEATMAP_METRIC_COLORS,
  getHeatColor,
  calcVerifRate,
  COLORS,
} from '../analyticsConfig';

const baseMetrics = HEATMAP_METRICS.filter(Boolean);
const verifiedMetric = baseMetrics.find((metric) => metric.key === 'verified');

const MAP_METRICS = [
  ...(verifiedMetric ? [verifiedMetric] : []),
  { key: 'total', label: 'Total' },
  ...baseMetrics.filter((metric) => metric.key !== 'verified'),
];

const TABLE_ROWS = [
  { key: 'verified', label: 'Verified' },
  { key: 'pending', label: 'Pending' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'unregistered', label: 'Unregistered' },
  { key: 'seniors', label: 'Senior Citizens' },
  { key: 'pwd', label: 'PWD' },
  { key: 'minors', label: 'Minors (<18)' },
  { key: 'voters', label: 'Voters' },
  { key: 'ofw', label: 'OFW' },
  { key: 'solo_parent', label: 'Solo Parent' },
  { key: 'kasambahay', label: 'Kasambahay' },
];

const LABEL_OFFSETS = {
  'Purok 1': [0.00015, 0.00005],
  'Purok 2': [0.00002, 0.00020],
  'Purok 3': [-0.00010, 0.00016],
  'Purok 4': [-0.00002, 0.00020],
  'Purok 5': [-0.00008, -0.00020],
  'Purok 6': [0.00010, -0.00012],
  'Purok 7': [0.00012, -0.00018],
};

function getMetricFriendlyLabel(metricLabel) {
  const labelMap = {
    Verified: 'verified residents',
    Total: 'total residents',
    Seniors: 'senior residents',
    PWD: 'PWD residents',
    Unregistered: 'unregistered residents',
    Minors: 'minor residents',
    Voters: 'registered voters',
  };

  return labelMap[metricLabel] ?? metricLabel.toLowerCase();
}

function buildPurokInsight({ metric, metricLabel, purok, metricValue, verificationRate, sharePct, rank }) {
  const priorityText = rank === 1 ? 'Highest priority area for this metric.' : rank <= 3 ? 'High-priority area.' : 'Standard monitoring area.';
  const metricGuides = {
    verified: 'Sustain validation operations and replicate effective verification practices.',
    total: 'Allocate baseline manpower, forms, and logistics proportional to population load.',
    seniors: 'Coordinate senior-focused support (health checks, medicine assistance, pensions).',
    pwd: 'Prioritize accessibility support and disability-responsive household services.',
    unregistered: 'Run targeted house-to-house registration and document completion follow-up.',
    minors: 'Coordinate youth and child-protection interventions with schools and guardians.',
    voters: 'Plan voter-information campaigns and civic participation activities.',
  };

  return {
    title: `${purok}: ${metricLabel} insight`,
    priorityText,
    recommendation: metricGuides[metric] ?? 'Use this metric to prioritize local assistance planning.',
    summary: `${metricValue} (${sharePct}% of barangay ${metricLabel.toLowerCase()}) with ${verificationRate}% verification rate.`,
  };
}

function HeatmapMap({ purokData, metric, t, onAreaClick }) {
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const layersRef = useRef([]);

  const metricStyle = HEATMAP_METRIC_COLORS[metric] ?? HEATMAP_METRIC_COLORS.total;
  const maxVal = Math.max(...purokData.map((p) => Number(p[metric] ?? 0)), 1);

  const isPointInPolygon = (point, polygon) => {
    const y = point[0];
    const x = point[1];
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const yi = polygon[i][0];
      const xi = polygon[i][1];
      const yj = polygon[j][0];
      const xj = polygon[j][1];
      const intersect = ((yi > y) !== (yj > y))
        && (x < ((xj - xi) * (y - yi)) / ((yj - yi) || 1e-12) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const hexToRgb = (hex) => {
    const normalized = hex.replace('#', '');
    const full = normalized.length === 3
      ? normalized.split('').map((char) => `${char}${char}`).join('')
      : normalized;
    const int = parseInt(full, 16);
    return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
  };

  useEffect(() => {
    if (!mapRef.current || leafletRef.current || typeof window === 'undefined') return;
    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current, { center: BARANGAY_CENTER, zoom: 15 });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: 'OpenStreetMap and CARTO',
      maxZoom: 19,
    }).addTo(map);

    L.polygon(BARANGAY_BOUNDARY, {
      color: COLORS.primary,
      weight: 2.5,
      fillOpacity: 0.04,
      dashArray: '6 4',
    })
      .addTo(map)
      .bindTooltip('Barangay Gulod, Novaliches, Quezon City');

    const hallIcon = L.divIcon({
      html: '<div style="background:#334155;color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:10px;border:2px solid #ffffff;box-shadow:0 2px 5px rgba(0,0,0,.25)">BH</div>',
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      className: '',
    });

    L.marker(BARANGAY_CENTER, { icon: hallIcon })
      .addTo(map)
      .bindPopup('<b>Barangay Gulod Hall</b><br/>Novaliches, Quezon City');

    leafletRef.current = map;
    return () => {
      map.remove();
      leafletRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const styleId = 'heatmap-map-stack-order';
    if (document.getElementById(styleId)) return undefined;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .heatmap-map-shell,
      .heatmap-map-shell .leaflet-container,
      .heatmap-map-shell .leaflet-pane,
      .heatmap-map-shell .leaflet-top,
      .heatmap-map-shell .leaflet-bottom,
      .heatmap-map-shell .leaflet-control {
        z-index: 0 !important;
      }

      .heatmap-map-shell .leaflet-tooltip-pane,
      .heatmap-map-shell .leaflet-marker-pane {
        z-index: 1 !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const L = window.L;
    if (!L || !leafletRef.current) return undefined;
    const map = leafletRef.current;

    layersRef.current.forEach((layer) => map.removeLayer(layer));
    layersRef.current = [];

    const orderedPuroks = Object.keys(PUROK_CENTERS);
    const baseRgb = hexToRgb(metricStyle.accent);
    const valueByPurok = purokData.reduce((acc, p) => {
      acc[p.purok] = Number(p[metric] ?? 0);
      return acc;
    }, {});

    const lats = BARANGAY_BOUNDARY.map((pt) => pt[0]);
    const lngs = BARANGAY_BOUNDARY.map((pt) => pt[1]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const width = 720;
    const height = 720;
    const step = 2;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const cols = Math.floor(width / step);
    const rows = Math.floor(height / step);
    const assignments = Array.from({ length: rows }, () => Array(cols).fill(-1));

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * step;
        const y = row * step;
        const lat = maxLat - (y / (height - 1)) * (maxLat - minLat);
        const lng = minLng + (x / (width - 1)) * (maxLng - minLng);
        if (!isPointInPolygon([lat, lng], BARANGAY_BOUNDARY)) continue;

        let nearestIdx = -1;
        let minDist = Infinity;
        orderedPuroks.forEach((name, idx) => {
          const c = PUROK_CENTERS[name].center;
          const dLat = lat - c[0];
          const dLng = lng - c[1];
          const dist = dLat * dLat + dLng * dLng;
          if (dist < minDist) {
            minDist = dist;
            nearestIdx = idx;
          }
        });
        assignments[row][col] = nearestIdx;

        const nearestPurok = orderedPuroks[nearestIdx];
        const ratio = Math.min((valueByPurok[nearestPurok] ?? 0) / maxVal, 1);
        const start = { r: 248, g: 250, b: 252 };
        const r = Math.round(start.r + (baseRgb.r - start.r) * ratio);
        const g = Math.round(start.g + (baseRgb.g - start.g) * ratio);
        const b = Math.round(start.b + (baseRgb.b - start.b) * ratio);
        ctx.fillStyle = `rgba(${r},${g},${b},0.9)`;
        ctx.fillRect(x, y, step, step);
      }
    }

    ctx.fillStyle = 'rgba(15,23,42,0.55)';
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const current = assignments[row][col];
        if (current < 0) continue;
        const right = col + 1 < cols ? assignments[row][col + 1] : current;
        const down = row + 1 < rows ? assignments[row + 1][col] : current;
        const x = col * step;
        const y = row * step;

        if (right >= 0 && right !== current) ctx.fillRect(x + step - 1, y, 1, step);
        if (down >= 0 && down !== current) ctx.fillRect(x, y + step - 1, step, 1);
      }
    }

    const overlay = L.imageOverlay(
      canvas.toDataURL('image/png'),
      [[minLat, minLng], [maxLat, maxLng]],
      { interactive: false, opacity: 1 }
    );
    overlay.addTo(map);
    layersRef.current.push(overlay);

    purokData.forEach((p) => {
      const meta = PUROK_CENTERS[p.purok];
      if (!meta) return;

      const val = Number(p[metric] ?? 0);
      const labelColor = metricStyle.accent;
      const offset = LABEL_OFFSETS[p.purok] ?? [0, 0];
      const labelPosition = [meta.center[0] + offset[0], meta.center[1] + offset[1]];

      const labelIcon = L.divIcon({
        html: `<div style="background:rgba(255,255,255,0.9);color:#0f172a;border-radius:16px;padding:3px 9px;font-size:12px;font-weight:800;white-space:nowrap;border:1px solid rgba(148,163,184,.7);box-shadow:0 2px 5px rgba(0,0,0,.2)">${p.purok} - <span style="color:${labelColor};font-weight:900">${val}</span></div>`,
        className: '',
        iconAnchor: [45, 12],
      });
      const label = L.marker(labelPosition, { icon: labelIcon, interactive: false });
      label.addTo(map);
      layersRef.current.push(label);
    });

    const handleMapClick = (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      if (!isPointInPolygon([lat, lng], BARANGAY_BOUNDARY)) return;

      let nearestPurok = null;
      let minDist = Infinity;
      Object.entries(PUROK_CENTERS).forEach(([name, meta]) => {
        const dLat = lat - meta.center[0];
        const dLng = lng - meta.center[1];
        const dist = dLat * dLat + dLng * dLng;
        if (dist < minDist) {
          minDist = dist;
          nearestPurok = name;
        }
      });

      const selected = purokData.find((p) => p.purok === nearestPurok);
      if (selected && onAreaClick) onAreaClick(selected);
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [metric, purokData, maxVal, metricStyle, onAreaClick]);

  return (
    <div
      ref={mapRef}
      className={`heatmap-map-shell relative z-0 w-full overflow-hidden rounded-[26px] border shadow-[0_18px_36px_rgba(15,23,42,0.08)] ${t ? t.cardBorder : 'border-gray-200'}`}
      style={{ height: 420 }}
    />
  );
}

function HeatmapTable({ purokData, t }) {
  return (
    <div className={`overflow-x-auto rounded-xl border ${t ? t.cardBorder : 'border-gray-300'} shadow-sm ${t ? t.cardBg : 'bg-white'}`}>
      <table className="w-full min-w-max border-collapse text-base">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="sticky left-0 bg-blue-600 px-5 py-3 text-left text-sm font-semibold uppercase tracking-wider">
              Indicator
            </th>
            {purokData.map((purok) => (
              <th key={purok.purok} className="min-w-[90px] px-4 py-3 text-center text-sm font-semibold uppercase">
                {purok.purok}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TABLE_ROWS.map((row, index) => (
            <tr key={row.key} className={index % 2 === 0 ? (t ? t.inlineBg : 'bg-gray-50') : (t ? t.cardBg : 'bg-white')}>
              <td className={`sticky left-0 whitespace-nowrap border-r px-5 py-3 font-normal ${t ? t.cardText : 'text-gray-800'} ${t ? t.cardBorder : 'border-gray-200'} bg-inherit`}>
                {row.label}
              </td>
              {purokData.map((purok) => {
                const val = Number(purok[row.key] ?? 0);
                return (
                  <td
                    key={`${purok.purok}-${row.key}`}
                    className={`border-b px-4 py-3 text-center font-normal ${t ? t.cardText : 'text-gray-900'} ${t ? t.cardBorder : 'border-gray-100'}`}
                  >
                    {val.toLocaleString()}
                  </td>
                );
              })}
            </tr>
          ))}

          <tr className={`${t ? t.inlineBg : 'bg-gray-100'} border-t-2 border-blue-600`}>
            <td className={`sticky left-0 whitespace-nowrap border-r px-5 py-3 font-normal text-blue-700 ${t ? t.inlineBg : 'bg-gray-100'} ${t ? t.cardBorder : 'border-gray-200'}`}>
              Verif. Rate*
            </td>
            {purokData.map((purok) => {
              const rate = calcVerifRate(purok);
              const status = rate >= 80 ? 'Good' : rate >= 50 ? 'Fair' : 'Needs attention';
              return (
                <td key={`rate-${purok.purok}`} className={`px-4 py-3 text-center font-normal ${t ? t.cardText : 'text-gray-900'}`}>
                  {rate}% ({status})
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>

      <div className={`border-t px-5 py-3 text-sm font-semibold ${t ? t.inlineBg : 'bg-gray-50'} ${t ? t.cardBorder : 'border-gray-200'} ${t ? t.cardText : 'text-gray-700'}`}>
        * Verif. Rate = Verified / (Verified + Pending + Rejected). Unregistered excluded.
      </div>
    </div>
  );
}

export default function HeatmapTab({ raw, t }) {
  const purokData = raw?.heatmap?.puroks ?? [];
  const [metric, setMetric] = useState('verified');
  const [view, setView] = useState('map');
  const [leafletReady, setLeafletReady] = useState(typeof window !== 'undefined' && !!window.L);
  const [selectedPurok, setSelectedPurok] = useState(null);

  const currentMetricStyle = HEATMAP_METRIC_COLORS[metric] ?? HEATMAP_METRIC_COLORS.total;
  const selectedMetric = MAP_METRICS.find((item) => item.key === metric) ?? MAP_METRICS[0];
  const friendlyMetricLabel = getMetricFriendlyLabel(selectedMetric.label);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (view !== 'map' || window.L) {
      setLeafletReady(!!window.L);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.onload = () => setLeafletReady(true);
    document.head.appendChild(script);
  }, [view]);

  if (!purokData.length) return <EmptyState message="No purok data available." />;

  const maxVal = Math.max(...purokData.map((p) => Number(p[metric] ?? 0)), 1);
  const metricTotal = purokData.reduce((sum, p) => sum + Number(p[metric] ?? 0), 0);
  const sortedByMetric = [...purokData].sort((a, b) => Number(b[metric] ?? 0) - Number(a[metric] ?? 0));

  const selectedMetricValue = Number(selectedPurok?.[metric] ?? 0);
  const selectedSharePct = metricTotal > 0 ? Math.round((selectedMetricValue / metricTotal) * 100) : 0;
  const selectedRank = selectedPurok
    ? (sortedByMetric.findIndex((p) => p.purok === selectedPurok.purok) + 1 || sortedByMetric.length)
    : null;
  const selectedInsight = selectedPurok
    ? buildPurokInsight({
      metric,
      metricLabel: selectedMetric.label,
      purok: selectedPurok.purok,
      metricValue: selectedMetricValue,
      verificationRate: calcVerifRate(selectedPurok),
      sharePct: selectedSharePct,
      rank: selectedRank,
    })
    : null;

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Purok Heatmap"
        subtitle="Barangay Gulod, Novaliches, Quezon City - click a purok for details"
        t={t}
      />

      <div className="grid grid-cols-1 gap-5">
        <ChartCard
          title={view === 'map' ? 'Purok Distribution Map' : 'Purok Metric Table'}
          subtitle={view === 'map' ? '' : 'Detailed purok breakdown across all tracked barangay metrics.'}
          rightLabel={view === 'map' ? 'Map view' : 'Table view'}
          t={t}
        >
          <div className="mb-4 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { key: 'map', label: 'Map View', icon: Map },
                  { key: 'table', label: 'Table View', icon: Table2 },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.key}
                      onClick={() => setView(item.key)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-all ${
                        view === item.key
                          ? 'border-slate-900 bg-slate-900 text-white shadow-[0_12px_24px_rgba(15,23,42,0.12)]'
                          : `${t ? t.cardBorder : 'border-[#d9dfec]'} ${t ? t.cardBg : 'bg-white'} ${t ? t.subtleText : 'text-slate-600'} hover:border-slate-300 hover:text-slate-800`
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {view === 'map' ? (
                <div className="flex flex-wrap items-center gap-2.5 text-[13px] text-slate-500">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 shadow-[0_4px_12px_rgba(15,23,42,0.05)]">
                    <CircleDot className="h-3.5 w-3.5" style={{ color: currentMetricStyle.text }} />
                    <span>Low</span>
                    <div className="flex h-2.5 w-24 overflow-hidden rounded-full">
                      {[0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio, index) => (
                        <div
                          key={index}
                          className="flex-1"
                          style={{ background: getHeatColor(ratio * 100, 100, 0.85, currentMetricStyle.accent) }}
                        />
                      ))}
                    </div>
                    <span>High</span>
                  </div>
                </div>
              ) : null}
            </div>

            {view === 'map' ? (
              <div className="flex flex-wrap justify-start gap-2.5 pt-8">
                {MAP_METRICS.map((item) => {
                  const metricStyle = HEATMAP_METRIC_COLORS[item.key] ?? HEATMAP_METRIC_COLORS.total;
                  const isActive = metric === item.key;
                  const metricTotalValue = purokData.reduce((sum, purok) => sum + Number(purok[item.key] ?? 0), 0);

                  return (
                    <button
                      key={item.key}
                      onClick={() => setMetric(item.key)}
                      className={`min-w-[148px] flex-1 rounded-full border px-3.5 py-2 text-left transition-all sm:min-w-[156px] sm:flex-none ${
                        isActive
                          ? 'translate-y-[-1px] shadow-[0_10px_22px_rgba(15,23,42,0.08)]'
                          : 'bg-white hover:border-slate-300 hover:shadow-[0_8px_18px_rgba(15,23,42,0.05)]'
                      }`}
                      style={
                        isActive
                          ? { backgroundColor: metricStyle.soft, color: metricStyle.text, borderColor: metricStyle.border }
                          : { color: metricStyle.text, borderColor: metricStyle.border }
                      }
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {isActive ? (
                              <span className="inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: metricStyle.accent }} />
                            ) : (
                              <span className="inline-flex h-2 w-2 rounded-full border" style={{ borderColor: metricStyle.border }} />
                            )}
                            <span className="truncate text-[12px] font-semibold">{item.label}</span>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <div className="text-[12px] font-semibold">{metricTotalValue.toLocaleString()}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          {view === 'map' ? (
            leafletReady ? (
              <HeatmapMap purokData={purokData} metric={metric} t={t} onAreaClick={setSelectedPurok} />
            ) : (
              <div className="flex h-64 items-center justify-center gap-3 text-gray-400">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                <p className="text-sm">Loading map...</p>
              </div>
            )
          ) : (
            <HeatmapTable purokData={purokData} t={t} />
          )}

          {view === 'map' ? (
            <div className="mt-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                  Purok at a glance
                </div>
                <span className="text-xs font-semibold text-slate-500">{purokData.length} puroks</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 xl:grid-cols-7">
                {purokData.map((purok) => {
                  const val = Number(purok[metric] ?? 0);
                  const rate = calcVerifRate(purok);

                  return (
                    <div
                      key={purok.purok}
                      className="rounded-[16px] border border-slate-200 bg-white px-3 py-2.5 text-center shadow-[0_6px_14px_rgba(15,23,42,0.03)]"
                    >
                      <div
                        className="truncate text-[10px] font-black uppercase tracking-[0.14em]"
                        style={{ color: currentMetricStyle.text }}
                      >
                        {purok.purok}
                      </div>
                      <div className="mt-2 text-2xl font-bold leading-none text-slate-900">{val.toLocaleString()}</div>
                      <div className="mt-2 text-[10px] text-slate-500">{friendlyMetricLabel}</div>
                      <div className="mt-1 text-[10px] font-semibold text-slate-600">Verification rate: {rate}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </ChartCard>
      </div>

      {selectedPurok && (
        <div className="fixed inset-0 z-[1400] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSelectedPurok(null)}
          />
          <div className={`relative w-full max-w-lg rounded-2xl border shadow-xl ${t ? `${t.cardBg} ${t.cardBorder}` : 'bg-white border-gray-200'}`}>
            <div className={`px-5 py-4 border-b ${t ? t.cardBorder : 'border-gray-200'} flex items-center justify-between`}>
              <div>
                <p className={`text-[11px] uppercase font-bold ${t ? t.subtleText : 'text-gray-500'}`}>Purok Details</p>
                <h3 className={`text-lg font-bold ${t ? t.cardText : 'text-gray-800'}`}>{selectedPurok.purok}</h3>
              </div>
              <button
                className={`text-sm font-semibold ${t ? t.subtleText : 'text-gray-500'}`}
                onClick={() => setSelectedPurok(null)}
              >
                Close
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className={`${t ? t.inlineBg : 'bg-gray-50'} rounded-lg p-3`}>
                  <p className={`text-[10px] uppercase ${t ? t.subtleText : 'text-gray-500'}`}>Selected Metric</p>
                  <p className="font-bold" style={{ color: currentMetricStyle.text }}>
                    {selectedMetric.label}: {Number(selectedPurok[metric] ?? 0)}
                  </p>
                </div>
                <div className={`${t ? t.inlineBg : 'bg-gray-50'} rounded-lg p-3`}>
                  <p className={`text-[10px] uppercase ${t ? t.subtleText : 'text-gray-500'}`}>Verification Rate</p>
                  <p className={`font-bold ${t ? t.cardText : 'text-gray-800'}`}>{calcVerifRate(selectedPurok)}%</p>
                </div>
              </div>

              {selectedInsight && (
                <div className={`${t ? t.inlineBg : 'bg-gray-50'} rounded-lg border ${t ? t.cardBorder : 'border-gray-200'} p-3`}>
                  <p className={`text-[10px] uppercase font-bold mb-1 ${t ? t.subtleText : 'text-gray-500'}`}>Decision Guide</p>
                  <p className={`text-sm font-bold ${t ? t.cardText : 'text-gray-800'}`}>{selectedInsight.title}</p>
                  <p className={`text-xs mt-1 ${t ? t.subtleText : 'text-gray-600'}`}>{selectedInsight.summary}</p>
                  <p className={`text-xs mt-2 ${t ? t.cardText : 'text-gray-700'}`}>
                    <span className="font-bold">Priority:</span> {selectedInsight.priorityText}
                  </p>
                  <p className={`text-xs mt-1 ${t ? t.cardText : 'text-gray-700'}`}>
                    <span className="font-bold">Recommended action:</span> {selectedInsight.recommendation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
