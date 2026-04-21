import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CircleDot, Layers3, Map, Table2, X } from 'lucide-react';
import { EmptyState, ChartCard } from '../AnalyticsInterface';
import {
  BARANGAY_BOUNDARY,
  BARANGAY_CENTER,
  PUROK_CENTERS,
  PUROK_ZONES,
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
  ...baseMetrics.filter((metric) => metric.key !== 'verified' && metric.key !== 'unregistered'),
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

const BASEMAP_OPTIONS = [
  {
    key: 'light',
    label: 'Light',
    description: 'Clean analytics view',
    tileUrl: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO',
    maxZoom: 19,
    previewStyle: { background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)' },
  },
  {
    key: 'street',
    label: 'Street',
    description: 'Modern roads and landmarks',
    tileUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO',
    maxZoom: 19,
    previewStyle: { background: 'linear-gradient(135deg, #e0f2fe 0%, #f8fafc 52%, #d1fae5 100%)' },
  },
  {
    key: 'satellite',
    label: 'Satellite',
    description: 'Aerial imagery view',
    tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19,
    previewStyle: { background: 'linear-gradient(135deg, #334155 0%, #14532d 45%, #854d0e 100%)' },
  },
];

const DEFAULT_BASEMAP_KEY = BASEMAP_OPTIONS[0].key;
const BASEMAPS_BY_KEY = Object.fromEntries(BASEMAP_OPTIONS.map((option) => [option.key, option]));

function getBasemapConfig(basemapKey) {
  return BASEMAPS_BY_KEY[basemapKey] ?? BASEMAPS_BY_KEY[DEFAULT_BASEMAP_KEY];
}

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

function getPriorityByShare(sharePct, metricValue) {
  const pct = Number(sharePct ?? 0);
  const count = Number(metricValue ?? 0);
  const highPct = pct >= 50;
  const medPct = pct >= 25;
  const highCount = count >= 30;
  const medCount = count >= 15;

  if (highPct && highCount) {
    return {
      level: 'High',
      text: `High share (${pct}%) with strong volume (${count}).`,
    };
  }

  if ((highPct && medCount) || (medPct && medCount)) {
    return {
      level: 'Medium',
      text: `Medium priority at ${pct}% share with ${count} volume.`,
    };
  }

  return {
    level: 'Low',
    text: `Low priority at ${pct}% share with ${count} volume.`,
  };
}

function buildPurokInsight({ metric, metricLabel, purok, metricValue, verificationRate, sharePct }) {
  const priority = getPriorityByShare(sharePct, metricValue);
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
    priorityLabel: priority.level,
    priorityText: priority.text,
    recommendation: metricGuides[metric] ?? 'Use this metric to prioritize local assistance planning.',
    summary: `${metricValue} (${sharePct}% of barangay ${metricLabel.toLowerCase()}) with ${verificationRate}% verification rate.`,
  };
}

function getZoneLayerStyle({ ratio, isSelected, mapType, metricStyle }) {
  const fillOpacityBase = mapType === 'satellite' ? 0.2 : 0.14;
  const fillOpacitySpread = mapType === 'satellite' ? 0.16 : 0.18;

  return {
    haloWeight: isSelected ? 7 : 5,
    haloOpacity: mapType === 'satellite' ? 0.58 : 0.82,
    strokeWeight: isSelected ? 3 : 2.15,
    strokeOpacity: mapType === 'satellite' ? 0.94 : 0.82,
    fillOpacity: Math.min((fillOpacityBase + ratio * fillOpacitySpread) * (isSelected ? 1.18 : 1), 0.42),
    accent: metricStyle.accent,
  };
}

function buildPurokChipHtml({ purok, value, accent, isSelected }) {
  const countBackground = isSelected ? accent : '#0f172a';
  const countBorder = isSelected ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.94)';
  const labelBorder = isSelected ? 'rgba(15,23,42,0.12)' : 'rgba(226,232,240,0.92)';

  return `
    <div class="heatmap-purok-chip${isSelected ? ' is-selected' : ''}">
      <span
        class="heatmap-purok-chip__count"
        style="
          background:${countBackground};
          border-color:${countBorder};
        "
      >
        ${value}
      </span>
      <span
        class="heatmap-purok-chip__label"
        style="
          border-color:${labelBorder};
        "
      >
        ${purok}
      </span>
    </div>
  `;
}

function HeatmapMap({ purokData, metric, metricLabel, mapType, t, onAreaClick, selectedPurokKey }) {
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const baseLayerRef = useRef(null);
  const layersRef = useRef([]);

  const metricStyle = HEATMAP_METRIC_COLORS[metric] ?? HEATMAP_METRIC_COLORS.total;
  const maxVal = Math.max(...purokData.map((p) => Number(p[metric] ?? 0)), 1);

  useEffect(() => {
    if (!mapRef.current || leafletRef.current || typeof window === 'undefined') return;

    const map = L.map(mapRef.current, { center: BARANGAY_CENTER, zoom: 15, keyboard: false });
    const container = map.getContainer();
    let removeFocusHandlers;
    if (container) {
      container.setAttribute('tabindex', '-1');
      container.style.outline = 'none';
      container.style.boxShadow = 'none';

      const blurOnFocus = () => {
        if (document.activeElement === container) {
          container.blur();
        }
      };
      container.addEventListener('focus', blurOnFocus);
      container.addEventListener('mousedown', blurOnFocus);
      removeFocusHandlers = () => {
        container.removeEventListener('focus', blurOnFocus);
        container.removeEventListener('mousedown', blurOnFocus);
      };
    }

    L.polygon(BARANGAY_BOUNDARY, {
      color: '#4f46e5',
      weight: 2.2,
      opacity: 0.78,
      fillOpacity: 0.03,
      dashArray: '8 6',
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
      if (removeFocusHandlers) removeFocusHandlers();
      map.remove();
      leafletRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const map = leafletRef.current;
    if (!map) return undefined;

    const config = getBasemapConfig(mapType);

    if (baseLayerRef.current) {
      map.removeLayer(baseLayerRef.current);
      baseLayerRef.current = null;
    }

    const nextBaseLayer = L.tileLayer(config.tileUrl, {
      attribution: config.attribution,
      maxZoom: config.maxZoom ?? 19,
    });

    nextBaseLayer.addTo(map);
    baseLayerRef.current = nextBaseLayer;

    const container = map.getContainer();
    if (container) {
      container.dataset.basemapType = mapType;
    }

    return () => {
      if (baseLayerRef.current === nextBaseLayer) {
        map.removeLayer(nextBaseLayer);
        baseLayerRef.current = null;
      }
    };
  }, [mapType]);

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

      .heatmap-map-shell,
      .heatmap-map-shell .leaflet-container,
      .heatmap-map-shell .leaflet-pane,
      .heatmap-map-shell .leaflet-map-pane,
      .heatmap-map-shell .leaflet-tile-pane,
      .heatmap-map-shell .leaflet-overlay-pane,
      .heatmap-map-shell .leaflet-image-layer,
      .heatmap-map-shell canvas,
      .heatmap-map-shell svg,
      .heatmap-map-shell img {
        outline: none !important;
        box-shadow: none !important;
      }

      .heatmap-map-shell:focus,
      .heatmap-map-shell:focus-visible,
      .heatmap-map-shell:focus-within,
      .heatmap-map-shell *:focus,
      .heatmap-map-shell *:focus-visible,
      .heatmap-map-shell .leaflet-container:focus,
      .heatmap-map-shell .leaflet-container:focus-visible,
      .heatmap-map-shell .leaflet-container:focus-within {
        outline: none !important;
        box-shadow: none !important;
      }

      .heatmap-map-shell[data-basemap-type="street"] .leaflet-control-zoom a {
        background: rgba(255, 255, 255, 0.92);
        border-color: rgba(226, 232, 240, 0.95);
        color: #0f172a;
        backdrop-filter: blur(10px);
      }

      .heatmap-map-shell[data-basemap-type="satellite"] .leaflet-control-zoom a {
        background: rgba(15, 23, 42, 0.88);
        border-color: rgba(255, 255, 255, 0.14);
        color: #ffffff;
        backdrop-filter: blur(12px);
      }

      .heatmap-map-shell .heatmap-zone-halo {
        filter: drop-shadow(0 8px 18px rgba(15, 23, 42, 0.08));
      }

      .heatmap-map-shell .heatmap-zone-fill {
        mix-blend-mode: multiply;
      }

      .heatmap-purok-chip {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        transform: translate(-50%, -50%);
        filter: drop-shadow(0 14px 24px rgba(15, 23, 42, 0.18));
      }

      .heatmap-purok-chip__count {
        min-width: 40px;
        height: 40px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0 10px;
        color: #ffffff;
        font-size: 15px;
        font-weight: 800;
        letter-spacing: -0.02em;
        border: 3px solid rgba(255, 255, 255, 0.95);
        box-shadow: 0 10px 22px rgba(15, 23, 42, 0.12);
      }

      .heatmap-purok-chip__label {
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.94);
        backdrop-filter: blur(12px);
        color: #0f172a;
        font-size: 11px;
        font-weight: 800;
        line-height: 1;
        white-space: nowrap;
        padding: 6px 10px;
        border: 1px solid rgba(226, 232, 240, 0.92);
        box-shadow: 0 10px 22px rgba(15, 23, 42, 0.1);
      }

      .heatmap-purok-chip.is-selected .heatmap-purok-chip__label {
        background: rgba(255, 255, 255, 0.98);
      }
    `;
    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    if (!leafletRef.current) return undefined;
    const map = leafletRef.current;

    layersRef.current.forEach((layer) => map.removeLayer(layer));
    layersRef.current = [];

    purokData.forEach((p) => {
      const meta = PUROK_CENTERS[p.purok];
      if (!meta) return;

      const val = Number(p[metric] ?? 0);
      const zone = PUROK_ZONES[p.purok];
      const ratio = Math.min(val / maxVal, 1);
      const isSelected = selectedPurokKey === p.purok;
      const zoneStyle = getZoneLayerStyle({ ratio, isSelected, mapType, metricStyle });

      if (zone?.length) {
        const halo = L.polygon(zone, {
          color: '#ffffff',
          weight: zoneStyle.haloWeight,
          opacity: zoneStyle.haloOpacity,
          fillOpacity: 0,
          className: 'heatmap-zone-halo',
          lineCap: 'round',
          lineJoin: 'round',
        });

        const polygon = L.polygon(zone, {
          color: zoneStyle.accent,
          weight: zoneStyle.strokeWeight,
          opacity: zoneStyle.strokeOpacity,
          fillColor: zoneStyle.accent,
          fillOpacity: zoneStyle.fillOpacity,
          className: 'heatmap-zone-fill',
          lineCap: 'round',
          lineJoin: 'round',
        });

        halo.addTo(map);

        polygon
          .addTo(map)
          .bindTooltip(
            `<strong>${p.purok}</strong><br/>${metricLabel ?? 'Metric'}: ${val}`,
            { direction: 'top', offset: [0, -4] },
          );

        polygon.on('click', () => {
          if (onAreaClick) onAreaClick(p);
        });

        halo.on('click', () => {
          if (onAreaClick) onAreaClick(p);
        });

        layersRef.current.push(halo);
        layersRef.current.push(polygon);
      }

      const offset = LABEL_OFFSETS[p.purok] ?? [0, 0];
      const labelPosition = [meta.center[0] + offset[0], meta.center[1] + offset[1]];

      const labelIcon = L.divIcon({
        html: buildPurokChipHtml({
          purok: p.purok,
          value: val,
          accent: metricStyle.accent,
          isSelected,
        }),
        className: '',
        iconSize: [112, 74],
        iconAnchor: [56, 37],
      });
      const label = L.marker(labelPosition, { icon: labelIcon, interactive: true });
      label.on('click', () => {
        if (onAreaClick) onAreaClick(p);
      });
      label.addTo(map);
      layersRef.current.push(label);
    });
  }, [mapType, metric, metricLabel, purokData, maxVal, metricStyle, onAreaClick, selectedPurokKey]);

  return (
    <div
      ref={mapRef}
      data-basemap-type={mapType}
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
  const leafletReady = true;
  const [selectedPurok, setSelectedPurok] = useState(null);
  const [mapType, setMapType] = useState(DEFAULT_BASEMAP_KEY);
  const [isMapTypeMenuOpen, setIsMapTypeMenuOpen] = useState(false);

  const currentMetricStyle = HEATMAP_METRIC_COLORS[metric] ?? HEATMAP_METRIC_COLORS.total;
  const selectedMetric = MAP_METRICS.find((item) => item.key === metric) ?? MAP_METRICS[0];
  const friendlyMetricLabel = getMetricFriendlyLabel(selectedMetric.label);
  const activeBasemap = getBasemapConfig(mapType);

  useEffect(() => {
    if (view !== 'map') {
      setIsMapTypeMenuOpen(false);
    }
  }, [view]);

  if (!purokData.length) return <EmptyState message="No purok data available." />;

  const maxVal = Math.max(...purokData.map((p) => Number(p[metric] ?? 0)), 1);
  const metricTotal = purokData.reduce((sum, p) => sum + Number(p[metric] ?? 0), 0);

  const selectedMetricValue = Number(selectedPurok?.[metric] ?? 0);
  const selectedSharePct = metricTotal > 0 ? Math.round((selectedMetricValue / metricTotal) * 100) : 0;
  const selectedInsight = selectedPurok
    ? buildPurokInsight({
      metric,
      metricLabel: selectedMetric.label,
      purok: selectedPurok.purok,
      metricValue: selectedMetricValue,
      verificationRate: calcVerifRate(selectedPurok),
      sharePct: selectedSharePct,
    })
    : null;

  return (
    <div className="space-y-4">
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
              <div className="flex flex-wrap justify-start gap-2.5 pt-4">
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
              <div className="relative isolate z-0">
                <div className="pointer-events-none absolute bottom-4 left-4 z-10">
                  <div className="pointer-events-auto flex flex-col items-start gap-2">
                    {isMapTypeMenuOpen ? (
                      <div className={`w-[220px] rounded-[22px] border p-1.5 shadow-[0_18px_36px_rgba(15,23,42,0.14)] backdrop-blur-sm ${
                        t ? `${t.cardBg} ${t.cardBorder}` : 'border-gray-200 bg-white/95'
                      }`}>
                        {BASEMAP_OPTIONS.map((option) => {
                          const isActive = option.key === mapType;

                          return (
                            <button
                              key={option.key}
                              type="button"
                              onClick={() => {
                                setMapType(option.key);
                                setIsMapTypeMenuOpen(false);
                              }}
                              className={`flex w-full items-center gap-3 rounded-[16px] px-3 py-2 text-left transition-all ${
                                isActive
                                  ? 'bg-slate-900 text-white shadow-[0_10px_24px_rgba(15,23,42,0.14)]'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                              aria-pressed={isActive}
                            >
                              <span
                                className={`h-8 w-8 flex-shrink-0 rounded-[12px] border shadow-sm ${
                                  isActive ? 'border-white/15' : 'border-slate-200'
                                }`}
                                style={option.previewStyle}
                              />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[12px] font-semibold">
                                  {option.label}
                                </span>
                                <span className={`block truncate text-[10px] ${
                                  isActive ? 'text-slate-300' : 'text-slate-500'
                                }`}>
                                  {option.description}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => setIsMapTypeMenuOpen((open) => !open)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-2 text-[12px] font-semibold text-slate-700 shadow-[0_12px_30px_rgba(15,23,42,0.16)] backdrop-blur-sm transition-all hover:border-slate-300 hover:text-slate-900"
                      aria-expanded={isMapTypeMenuOpen}
                      aria-label="Change map type"
                    >
                      <span
                        className="h-3 w-3 rounded-full border border-white/70 shadow-sm"
                        style={activeBasemap.previewStyle}
                      />
                      <Layers3 className="h-3.5 w-3.5" />
                      <span>{activeBasemap.label}</span>
                    </button>
                  </div>
                </div>

                <HeatmapMap
                  purokData={purokData}
                  metric={metric}
                  metricLabel={selectedMetric.label}
                  mapType={mapType}
                  t={t}
                  onAreaClick={setSelectedPurok}
                  selectedPurokKey={selectedPurok?.purok ?? null}
                />

                {selectedPurok ? (
                  <div className="pointer-events-none absolute right-24 top-4 z-10 w-[240px] max-w-[75%] sm:w-[260px]">
                    <div className={`pointer-events-auto max-h-[340px] overflow-y-auto rounded-[22px] border shadow-[0_18px_36px_rgba(15,23,42,0.14)] backdrop-blur-sm ${t ? `${t.cardBg} ${t.cardBorder}` : 'bg-white border-gray-200'} bg-white/90`}>
                      <div className={`px-4 py-3 border-b ${t ? t.cardBorder : 'border-gray-200'} flex items-center justify-between`}>
                        <div>
                          <h3 className={`text-[13px] font-bold ${t ? t.cardText : 'text-gray-800'}`}>{selectedPurok.purok}</h3>
                        </div>
                        <button
                          className={`inline-flex items-center justify-center rounded-full p-1 text-[12px] font-semibold ${t ? t.subtleText : 'text-gray-500'}`}
                          onClick={() => setSelectedPurok(null)}
                          aria-label="Close"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div className="p-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className={`${t ? t.inlineBg : 'bg-gray-50'} rounded-lg p-3 text-center`}>
                            <p className={`text-[9px] uppercase ${t ? t.subtleText : 'text-gray-500'}`}>Selected Metric</p>
                            <p className="mt-1 font-bold" style={{ color: currentMetricStyle.text }}>
                              {selectedMetric.label}: {Number(selectedPurok[metric] ?? 0)}
                            </p>
                          </div>
                          <div className={`${t ? t.inlineBg : 'bg-gray-50'} rounded-lg p-3 text-center`}>
                            <p className={`text-[9px] uppercase ${t ? t.subtleText : 'text-gray-500'}`}>Verification Rate</p>
                            <p className={`mt-1 font-bold ${t ? t.cardText : 'text-gray-800'}`}>{calcVerifRate(selectedPurok)}%</p>
                          </div>
                        </div>

                        {selectedInsight ? (
                          <div className={`${t ? t.inlineBg : 'bg-gray-50'} rounded-lg border ${t ? t.cardBorder : 'border-gray-200'} p-3 text-left`}>
                            <p className={`text-[9px] uppercase font-bold mb-1 ${t ? t.subtleText : 'text-gray-500'}`}>Decision Guide</p>
                            <p className={`text-[12px] font-bold ${t ? t.cardText : 'text-gray-800'}`}>{selectedInsight.title}</p>
                            <p className={`text-[11px] mt-1 ${t ? t.subtleText : 'text-gray-600'}`}>{selectedInsight.summary}</p>
                            <p className={`text-[11px] mt-2 ${t ? t.cardText : 'text-gray-700'}`}>
                              <span className="font-bold">Priority:</span> {selectedInsight.priorityLabel} - {selectedInsight.priorityText}
                            </p>
                            <p className={`text-[11px] mt-1 ${t ? t.cardText : 'text-gray-700'}`}>
                              <span className="font-bold">Recommended action:</span> {selectedInsight.recommendation}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
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
