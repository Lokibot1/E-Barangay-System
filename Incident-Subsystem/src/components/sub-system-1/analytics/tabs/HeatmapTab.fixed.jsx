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

function HeatmapMap({ purokData, metric, metricMeta, t }) {
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

    return {
      r: (int >> 16) & 255,
      g: (int >> 8) & 255,
      b: int & 255,
    };
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
    if (typeof window === 'undefined') return undefined;

    const L = window.L;
    if (!L || !leafletRef.current) return undefined;

    const map = leafletRef.current;
    layersRef.current.forEach((layer) => map.removeLayer(layer));
    layersRef.current = [];

    const orderedPuroks = Object.keys(PUROK_CENTERS);
    const baseRgb = hexToRgb(metricStyle.accent);
    const valueByPurok = purokData.reduce((acc, purok) => {
      acc[purok.purok] = Number(purok[metric] ?? 0);
      return acc;
    }, {});

    const lats = BARANGAY_BOUNDARY.map((point) => point[0]);
    const lngs = BARANGAY_BOUNDARY.map((point) => point[1]);
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
          const center = PUROK_CENTERS[name].center;
          const dLat = lat - center[0];
          const dLng = lng - center[1];
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

    purokData.forEach((purok) => {
      const meta = PUROK_CENTERS[purok.purok];
      if (!meta) return;

      const val = Number(purok[metric] ?? 0);
      const fill = getHeatColor(val, maxVal, 0.72, metricStyle.accent);
      const radius = 100 + (val / maxVal) * 160;
      const rate = calcVerifRate(purok);
      const labelColor = metricStyle.accent;
      const offset = LABEL_OFFSETS[purok.purok] ?? [0, 0];
      const labelPosition = [meta.center[0] + offset[0], meta.center[1] + offset[1]];
      const rateColor = rate >= 80 ? '#059669' : rate >= 50 ? '#d97706' : '#dc2626';
      const popupValueColors = {
        total: '#334155',
        verified: '#059669',
        pending: '#d97706',
        rejected: '#dc2626',
        unregistered: '#dc2626',
        seniors: '#ea580c',
        pwd: '#7c3aed',
        minors: '#0891b2',
        voters: '#0f766e',
      };

      const popup = `
        <div style="font-family:Segoe UI,Arial,sans-serif;min-width:188px;color:#0f172a;padding:2px 0">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;padding-bottom:8px;border-bottom:1px solid #e2e8f0">
            <div style="font-size:14px;line-height:1.1;font-weight:900;color:#0f172a">${purok.purok}</div>
            <div style="padding:3px 6px;border-radius:999px;background:${metricStyle.soft};border:1px solid ${metricStyle.border};font-size:8px;font-weight:800;color:${metricStyle.text}">
              ${metricMeta.label}: ${val}
            </div>
          </div>

          <div style="margin-top:9px;display:grid;grid-template-columns:1fr auto;gap:5px 9px;font-size:10px;line-height:1.28;border-radius:11px;border:1px solid #eef2f7;background:#fbfcfe;padding:8px 9px">
            <div style="color:${popupValueColors.total}">Total residents</div><div style="font-weight:800;color:${popupValueColors.total}">${Number(purok.total ?? 0).toLocaleString()}</div>
            <div style="color:${popupValueColors.verified}">Verified</div><div style="font-weight:800;color:${popupValueColors.verified}">${Number(purok.verified ?? 0).toLocaleString()}</div>
            <div style="color:${popupValueColors.pending}">Pending</div><div style="font-weight:800;color:${popupValueColors.pending}">${Number(purok.pending ?? 0).toLocaleString()}</div>
            <div style="color:${popupValueColors.rejected}">Rejected</div><div style="font-weight:800;color:${popupValueColors.rejected}">${Number(purok.rejected ?? 0).toLocaleString()}</div>
            <div style="color:${popupValueColors.unregistered}">Unregistered</div><div style="font-weight:800;color:${popupValueColors.unregistered}">${Number(purok.unregistered ?? 0).toLocaleString()}</div>
            <div style="color:${popupValueColors.seniors}">Senior citizens</div><div style="font-weight:800;color:${popupValueColors.seniors}">${Number(purok.seniors ?? 0).toLocaleString()}</div>
            <div style="color:${popupValueColors.pwd}">PWD</div><div style="font-weight:800;color:${popupValueColors.pwd}">${Number(purok.pwd ?? 0).toLocaleString()}</div>
            <div style="color:${popupValueColors.minors}">Minors</div><div style="font-weight:800;color:${popupValueColors.minors}">${Number(purok.minors ?? 0).toLocaleString()}</div>
            <div style="color:${popupValueColors.voters}">Voters</div><div style="font-weight:800;color:${popupValueColors.voters}">${Number(purok.voters ?? 0).toLocaleString()}</div>
          </div>

          <div style="margin-top:9px;border-radius:11px;border:1px solid #e7ecf3;background:#f8fafc;padding:8px 9px;text-align:center">
            <div style="font-size:8px;font-weight:900;letter-spacing:0.16em;text-transform:uppercase;color:#94a3b8">Verification rate</div>
            <div style="margin-top:3px;font-size:18px;line-height:1;font-weight:900;color:${rateColor}">${rate}%</div>
            <div style="margin-top:3px;font-size:8px;color:#64748b">Submitted records only</div>
          </div>
        </div>
      `;

      const circle = L.circle(meta.center, {
        radius,
        color: metricStyle.accent,
        weight: 1.5,
        fillColor: fill,
        fillOpacity: 0.72,
      }).bindPopup(popup);

      circle.on('mouseover', function handleMouseOver() {
        this.setStyle({ weight: 3, fillOpacity: 0.9 });
      });

      circle.on('mouseout', function handleMouseOut() {
        this.setStyle({ weight: 1.5, fillOpacity: 0.72 });
      });

      circle.addTo(map);
      layersRef.current.push(circle);

      const labelIcon = L.divIcon({
        html: `<div style="background:rgba(255,255,255,0.9);color:#0f172a;border-radius:16px;padding:3px 9px;font-size:12px;font-weight:800;white-space:nowrap;border:1px solid rgba(148,163,184,.7);box-shadow:0 2px 5px rgba(0,0,0,.2)">${purok.purok} - <span style="color:${labelColor};font-weight:900">${val}</span></div>`,
        className: '',
        iconAnchor: [45, 12],
      });

      const label = L.marker(labelPosition, { icon: labelIcon, interactive: false });
      label.addTo(map);
      layersRef.current.push(label);
    });

    return undefined;
  }, [metric, metricMeta.label, purokData, maxVal, metricStyle]);

  return (
    <div
      ref={mapRef}
      className={`relative z-0 w-full overflow-hidden rounded-[26px] border shadow-[0_18px_36px_rgba(15,23,42,0.08)] ${t ? t.cardBorder : 'border-gray-200'}`}
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
                  const metricTotal = purokData.reduce((sum, purok) => sum + Number(purok[item.key] ?? 0), 0);

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
                          <div className="text-[12px] font-semibold">{metricTotal.toLocaleString()}</div>
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
              <HeatmapMap purokData={purokData} metric={metric} metricMeta={selectedMetric} t={t} />
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
    </div>
  );
}
