// components/heatmap/HeatmapMap.jsx
// Leaflet map using circle markers per purok — no polygon issues.
// Circle size + color intensity = heat value.

import { useEffect, useRef } from 'react';
import { BARANGAY_BOUNDARY, BARANGAY_CENTER, PUROK_CENTERS } from './constants/purok';
import { getHeatColor } from './analyticsConfig';
import { HEATMAP_METRICS } from './constants/data';

export default function HeatmapMap({ purokData, metric }) {
  const mapRef     = useRef(null);
  const leafletRef = useRef(null);
  const circlesRef = useRef([]);

  const maxVal = Math.max(...purokData.map(p => Number(p[metric] ?? 0)), 1);

  // Init map once
  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;
    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current, {
      center: BARANGAY_CENTER,
      zoom: 15,
      zoomControl: true,
    });

    // Dark-ish tile layer for better contrast
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
      maxZoom: 19,
    }).addTo(map);

    // Barangay boundary outline
    L.polygon(BARANGAY_BOUNDARY, {
      color: '#1a5276',
      weight: 2.5,
      fillOpacity: 0.04,
      dashArray: '6 4',
    }).addTo(map).bindTooltip('Barangay Gulod', { permanent: false });

    // Barangay hall marker
    const hallIcon = L.divIcon({
      html: `<div style="background:#1a5276;color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">🏛️</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      className: '',
    });
    L.marker(BARANGAY_CENTER, { icon: hallIcon })
      .addTo(map)
      .bindPopup('<b>Barangay Gulod Hall</b><br/>Novaliches, Quezon City');

    leafletRef.current = map;
    return () => { map.remove(); leafletRef.current = null; };
  }, []);

  // Redraw circles when metric changes
  useEffect(() => {
    const L = window.L;
    if (!L || !leafletRef.current) return;
    const map = leafletRef.current;

    // Remove old circles
    circlesRef.current.forEach(c => map.removeLayer(c));
    circlesRef.current = [];

    const metaLabel = HEATMAP_METRICS.find(m => m.key === metric)?.label ?? metric;

    purokData.forEach(p => {
      const purokMeta = PUROK_CENTERS[p.purok];
      if (!purokMeta) return;

      const val  = Number(p[metric] ?? 0);
      const fill = getHeatColor(val, maxVal, 0.75);

      // Scale radius: base 80m → up to 280m based on value
      const scaledRadius = purokMeta.radius + (val / maxVal) * 150;

      // Verification rate (only from submitted, not unregistered)
      const submitted = (p.verified ?? 0) + (p.pending ?? 0) + (p.rejected ?? 0);
      const verifRate = submitted > 0 ? Math.round((p.verified / submitted) * 100) : 0;

      const circle = L.circle(purokMeta.center, {
        radius: scaledRadius,
        color: '#1a5276',
        weight: 1.5,
        fillColor: fill,
        fillOpacity: 0.72,
      });

      circle.bindPopup(`
        <div style="font-family:'Segoe UI',sans-serif;min-width:210px">
          <div style="font-weight:900;color:#1a5276;font-size:16px;margin-bottom:8px;border-bottom:2px solid #eee;padding-bottom:6px">
            ${p.purok}
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:12.5px">
            <tr><td style="padding:3px 0;color:#555">Total Residents</td>
                <td style="font-weight:800;text-align:right">${p.total}</td></tr>
            <tr><td style="padding:3px 0;color:#27ae60">✅ Verified</td>
                <td style="font-weight:800;text-align:right;color:#27ae60">${p.verified}</td></tr>
            <tr><td style="padding:3px 0;color:#f39c12">⏳ Pending</td>
                <td style="font-weight:800;text-align:right;color:#f39c12">${p.pending}</td></tr>
            <tr><td style="padding:3px 0;color:#e74c3c">❌ Rejected</td>
                <td style="font-weight:800;text-align:right;color:#e74c3c">${p.rejected}</td></tr>
            <tr><td style="padding:3px 0;color:#e67e22">⚠️ Unregistered</td>
                <td style="font-weight:800;text-align:right;color:#e67e22">${p.unregistered}</td></tr>
            <tr><td style="padding:3px 0;color:#e74c3c">👴 Seniors</td>
                <td style="font-weight:800;text-align:right">${p.seniors}</td></tr>
            <tr><td style="padding:3px 0;color:#f39c12">♿ PWD</td>
                <td style="font-weight:800;text-align:right">${p.pwd}</td></tr>
            <tr><td style="padding:3px 0;color:#8e44ad">🧒 Minors</td>
                <td style="font-weight:800;text-align:right">${p.minors}</td></tr>
            <tr><td style="padding:3px 0;color:#16a085">🗳️ Voters</td>
                <td style="font-weight:800;text-align:right">${p.voters}</td></tr>
          </table>
          <div style="margin-top:8px;background:#f0f7ff;border-radius:8px;padding:8px;text-align:center">
            <div style="font-size:11px;color:#666;font-weight:600">VERIFICATION RATE (submitted only)</div>
            <div style="font-size:20px;font-weight:900;color:${verifRate >= 80 ? '#27ae60' : verifRate >= 50 ? '#f39c12' : '#e74c3c'}">${verifRate}%</div>
          </div>
          <div style="margin-top:6px;background:#1a5276;border-radius:8px;padding:6px 10px;text-align:center;color:white;font-weight:900;font-size:12px">
            ${metaLabel}: ${val}
          </div>
        </div>
      `);

      // Hover
      circle.on('mouseover', function () {
        this.setStyle({ weight: 3, fillOpacity: 0.9 });
        this.openPopup();
      });
      circle.on('mouseout', function () {
        this.setStyle({ weight: 1.5, fillOpacity: 0.72 });
      });

      // Purok label marker
      const labelIcon = L.divIcon({
        html: `<div style="
          background:rgba(26,82,118,0.88);
          color:white;
          border-radius:20px;
          padding:2px 10px;
          font-size:11px;
          font-weight:900;
          letter-spacing:0.05em;
          white-space:nowrap;
          border:1.5px solid rgba(255,255,255,0.5);
          pointer-events:none;
          box-shadow:0 2px 6px rgba(0,0,0,0.25)
        ">${p.purok} <span style="opacity:0.75">· ${val}</span></div>`,
        className: '',
        iconAnchor: [45, 12],
      });
      const label = L.marker(purokMeta.center, { icon: labelIcon, interactive: false });

      circle.addTo(map);
      label.addTo(map);
      circlesRef.current.push(circle, label);
    });
  }, [metric, purokData, maxVal]);

  return (
    <div
      ref={mapRef}
      className="w-full rounded-xl overflow-hidden shadow border border-gray-200 dark:border-slate-700"
      style={{ height: 480 }}
    />
  );
}