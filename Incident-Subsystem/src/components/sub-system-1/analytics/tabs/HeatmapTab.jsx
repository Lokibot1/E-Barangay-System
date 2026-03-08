import { useState, useEffect, useRef } from 'react';
import { SectionHeader, EmptyState } from '../AnalyticsInterface';
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
    if (!mapRef.current || leafletRef.current) return;
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
      html: `<div style="background:#334155;color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:10px;border:2px solid #ffffff;box-shadow:0 2px 5px rgba(0,0,0,.25)">BH</div>`,
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
    const L = window.L;
    if (!L || !leafletRef.current) return;
    const map = leafletRef.current;

    layersRef.current.forEach((layer) => map.removeLayer(layer));
    layersRef.current = [];

    const orderedPuroks = Object.keys(PUROK_CENTERS);
    const baseRgb = hexToRgb(metricStyle.accent);
    const LABEL_OFFSETS = {
      'Purok 1': [0.00015, 0.00005],
      'Purok 2': [0.00002, 0.00020],
      'Purok 3': [-0.00010, 0.00016],
      'Purok 4': [-0.00002, 0.00020],
      'Purok 5': [-0.00008, -0.00020],
      'Purok 6': [0.00010, -0.00012],
      'Purok 7': [0.00012, -0.00018],
    };
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

        if (right >= 0 && right !== current) {
          ctx.fillRect(x + step - 1, y, 1, step);
        }
        if (down >= 0 && down !== current) {
          ctx.fillRect(x, y + step - 1, step, 1);
        }
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
      const ratio = Math.min(val / maxVal, 1);
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
      className={`relative z-0 w-full rounded-xl overflow-hidden shadow border ${t ? t.cardBorder : 'border-gray-200'}`}
      style={{ height: 480 }}
    />
  );
}

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

function HeatmapTable({ purokData, t }) {
  return (
    <div className={`overflow-x-auto rounded-xl border ${t ? t.cardBorder : 'border-gray-300'} shadow-sm ${t ? t.cardBg : 'bg-white'}`}>
      <table className="w-full min-w-max text-base border-collapse">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="px-5 py-3 text-left font-semibold text-sm uppercase tracking-wider sticky left-0 bg-blue-600">
              Indicator
            </th>
            {purokData.map((p) => (
              <th key={p.purok} className="px-4 py-3 text-center font-semibold text-sm uppercase min-w-[90px]">
                {p.purok}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TABLE_ROWS.map((row, index) => (
            <tr key={row.key} className={index % 2 === 0 ? (t ? t.inlineBg : 'bg-gray-50') : (t ? t.cardBg : 'bg-white')}>
              <td className={`px-5 py-3 font-normal ${t ? t.cardText : 'text-gray-800'} whitespace-nowrap sticky left-0 bg-inherit border-r ${t ? t.cardBorder : 'border-gray-200'}`}>
                {row.label}
              </td>
              {purokData.map((p) => {
                const val = Number(p[row.key] ?? 0);
                return (
                  <td key={`${p.purok}-${row.key}`} className={`px-4 py-3 text-center font-normal ${t ? t.cardText : 'text-gray-900'} border-b ${t ? t.cardBorder : 'border-gray-100'}`}>
                    {val}
                  </td>
                );
              })}
            </tr>
          ))}

          <tr className={`${t ? t.inlineBg : 'bg-gray-100'} border-t-2 border-blue-600`}>
            <td className={`px-5 py-3 font-normal text-blue-700 whitespace-nowrap sticky left-0 ${t ? t.inlineBg : 'bg-gray-100'} border-r ${t ? t.cardBorder : 'border-gray-200'}`}>
              Verif. Rate*
            </td>
            {purokData.map((p) => {
              const rate = calcVerifRate(p);
              const status = rate >= 80 ? 'Good' : rate >= 50 ? 'Fair' : 'Needs attention';
              return (
                <td key={`rate-${p.purok}`} className={`px-4 py-3 text-center font-normal ${t ? t.cardText : 'text-gray-900'}`}>
                  {rate}% ({status})
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>

      <div className={`px-5 py-3 ${t ? t.inlineBg : 'bg-gray-50'} border-t ${t ? t.cardBorder : 'border-gray-200'} text-sm ${t ? t.cardText : 'text-gray-700'} font-semibold`}>
        * Verif. Rate = Verified / (Verified + Pending + Rejected). Unregistered excluded.
      </div>
    </div>
  );
}

export default function HeatmapTab({ raw, t }) {
  const purokData = raw?.heatmap?.puroks ?? [];
  const [metric, setMetric] = useState('verified');
  const [view, setView] = useState('map');
  const [leafletReady, setLeafletReady] = useState(!!window.L);
  const [selectedPurok, setSelectedPurok] = useState(null);
  const currentMetricStyle = HEATMAP_METRIC_COLORS[metric] ?? HEATMAP_METRIC_COLORS.total;
  const metricMeta = HEATMAP_METRICS.find((m) => m.key === metric) ?? HEATMAP_METRICS[0];

  useEffect(() => {
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
      metricLabel: metricMeta.label,
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

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1">
          {[
            { key: 'map', label: 'Map View' },
            { key: 'table', label: 'Table View' },
          ].map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={`px-4 py-2 text-sm font-normal rounded-lg border transition-all ${
                view === v.key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : `${t ? t.cardBg : 'bg-white'} text-blue-700 border-blue-200 hover:bg-blue-50`
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {view === 'map' && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Low</span>
            <div className="flex h-3 w-28 rounded overflow-hidden">
              {[0, 0.2, 0.4, 0.6, 0.8, 1].map((r, i) => (
                <div
                  key={i}
                  className="flex-1"
                  style={{ background: getHeatColor(r * 100, 100, 0.85, currentMetricStyle.accent) }}
                />
              ))}
            </div>
            <span>High</span>
          </div>
        )}
      </div>

      {view === 'map' && (
        <div className="flex gap-2 flex-wrap">
          {HEATMAP_METRICS.map((m) => (
            (() => {
              const metricStyle = HEATMAP_METRIC_COLORS[m.key] ?? HEATMAP_METRIC_COLORS.total;
              const isActive = metric === m.key;
              return (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={`px-3 py-1.5 text-sm font-normal rounded-lg border transition-all flex items-center gap-1 ${t ? t.cardBg : 'bg-white'}`}
              style={
                isActive
                  ? { backgroundColor: metricStyle.accent, color: '#ffffff', borderColor: metricStyle.accent }
                  : { color: metricStyle.text, borderColor: metricStyle.border }
              }
            >
              {m.label}
            </button>
              );
            })()
          ))}
        </div>
      )}

      {view === 'map' ? (
        leafletReady ? (
          <HeatmapMap purokData={purokData} metric={metric} t={t} onAreaClick={setSelectedPurok} />
        ) : (
          <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Loading map...</p>
          </div>
        )
      ) : (
        <HeatmapTable purokData={purokData} t={t} />
      )}

      {view === 'map' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {purokData.map((p) => {
            const val = Number(p[metric] ?? 0);
            const rate = calcVerifRate(p);
            const status = rate >= 80 ? 'Good' : rate >= 50 ? 'Fair' : 'Needs attention';
            const ratio = Math.min(val / maxVal, 1);
            const metricLevel = ratio >= 0.67 ? 'High' : ratio >= 0.34 ? 'Medium' : 'Low';
            const numberColor = val > 0
              ? currentMetricStyle.text
              : (t ? t.subtleText : '#94a3b8');
            return (
              <div key={p.purok} className={`${t ? t.cardBg : 'bg-white'} rounded-xl border ${t ? t.cardBorder : 'border-gray-100'} shadow-sm p-3 text-center`}>
                <div className="font-bold text-xs mb-1" style={{ color: currentMetricStyle.text }}>{p.purok}</div>
                <div className="text-2xl font-semibold" style={{ color: numberColor }}>
                  {val}
                </div>
                <div className={`text-[10px] ${t ? t.subtleText : 'text-gray-400'} uppercase`}>
                  {metricMeta.label}
                </div>
                <div className={`text-[11px] font-bold mt-1 ${metricLevel === 'High' ? 'text-emerald-600' : metricLevel === 'Medium' ? 'text-amber-600' : (t ? t.subtleText : 'text-slate-500')}`}>
                  {metricLevel}
                </div>
                <div className={`text-xs font-bold mt-1 ${t ? t.cardText : 'text-gray-700'}`}>{rate}% ({status})</div>
              </div>
            );
          })}
        </div>
      )}

      <div className={`${t ? t.inlineBg : 'bg-gray-50'} border ${t ? t.cardBorder : 'border-gray-200'} rounded-xl p-4 text-sm ${t ? t.cardText : 'text-gray-700'}`}>
        <span className="font-bold">Note:</span> Entire barangay area is filled and color-assigned per purok.
        Intensities reflect the selected metric.
        Verification rate counts only submitted residents - unregistered are excluded.
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
                    {metricMeta.label}: {Number(selectedPurok[metric] ?? 0)}
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
