// components/heatmap/HeatmapTable.jsx
// Matrix table heatmap — color-coded cells per metric per purok.
// Uses verified-only rate (not total-based) for accuracy.

import { calcVerifRate } from "./analyticsConfig";

const ROWS = [
  { key: 'total',        label: 'Total Residents', icon: '👥', colorFn: (v,mx) => `rgba(26,82,118,${0.1 + 0.75*(v/mx)})`,    textDark: true  },
  { key: 'verified',     label: 'Verified',        icon: '✅', colorFn: (v,mx) => `rgba(39,174,96,${0.1 + 0.75*(v/mx)})`,    textDark: true  },
  { key: 'pending',      label: 'Pending',         icon: '⏳', colorFn: (v,mx) => `rgba(243,156,18,${0.1 + 0.75*(v/mx)})`,   textDark: true  },
  { key: 'rejected',     label: 'Rejected',        icon: '❌', colorFn: (v,mx) => `rgba(231,76,60,${0.1 + 0.75*(v/mx)})`,    textDark: true  },
  { key: 'unregistered', label: 'Unregistered',    icon: '⚠️', colorFn: (v,mx) => `rgba(230,126,34,${0.1 + 0.75*(v/mx)})`,   textDark: true  },
  { key: 'seniors',      label: 'Senior Citizens', icon: '👴', colorFn: (v,mx) => `rgba(231,76,60,${0.1 + 0.75*(v/mx)})`,    textDark: true  },
  { key: 'pwd',          label: 'PWD',             icon: '♿', colorFn: (v,mx) => `rgba(243,156,18,${0.1 + 0.75*(v/mx)})`,   textDark: true  },
  { key: 'minors',       label: 'Minors (< 18)',   icon: '🧒', colorFn: (v,mx) => `rgba(142,68,173,${0.1 + 0.75*(v/mx)})`,   textDark: true  },
  { key: 'voters',       label: 'Voters',          icon: '🗳️', colorFn: (v,mx) => `rgba(22,160,133,${0.1 + 0.75*(v/mx)})`,   textDark: true  },
  { key: 'ofw',          label: 'OFW',             icon: '✈️', colorFn: (v,mx) => `rgba(41,128,185,${0.1 + 0.75*(v/mx)})`,   textDark: true  },
  { key: 'solo_parent',  label: 'Solo Parent',     icon: '👩‍👦', colorFn: (v,mx) => `rgba(22,160,133,${0.1 + 0.75*(v/mx)})`,   textDark: true  },
];

export default function HeatmapTable({ purokData, t }) {
  return (
    <div className={`overflow-x-auto rounded-xl border ${t ? t.cardBorder : 'border-gray-200'} shadow-sm`}>
      <table className="w-full min-w-max text-sm border-collapse">
        <thead>
          <tr className="bg-[#1a5276] text-white">
            <th className="px-5 py-3.5 text-left font-black text-xs uppercase tracking-wider sticky left-0 bg-[#1a5276] z-10">
              Indicator
            </th>
            {purokData.map(p => (
              <th key={p.purok} className="px-4 py-3.5 text-center font-black text-xs uppercase tracking-wider min-w-[100px]">
                {p.purok}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row, ri) => {
            const rowMax = Math.max(...purokData.map(p => Number(p[row.key] ?? 0)), 1);
            return (
              <tr key={row.key} className={ri % 2 === 0 ? (t ? t.inlineBg : 'bg-gray-50') : (t ? t.cardBg : 'bg-white')}>
                <td className={`px-5 py-3 font-bold ${t ? t.cardText : 'text-gray-700'} whitespace-nowrap sticky left-0 bg-inherit border-r ${t ? t.cardBorder : 'border-gray-100'}`}>
                  <span className="mr-2">{row.icon}</span>{row.label}
                </td>
                {purokData.map(p => {
                  const val = Number(p[row.key] ?? 0);
                  const bg  = row.colorFn(val, rowMax);
                  return (
                    <td
                      key={p.purok}
                      className="px-4 py-3 text-center font-black text-sm"
                      style={{ backgroundColor: bg, color: val > 0 ? '#111' : '#999' }}
                    >
                      {val > 0 ? val : '—'}
                    </td>
                  );
                })}
              </tr>
            );
          })}

          {/* Verification Rate row — uses submitted-only denominator */}
          <tr className="bg-blue-50 border-t-2 border-[#1a5276]">
            <td className="px-5 py-3 font-black text-[#1a5276] whitespace-nowrap sticky left-0 bg-blue-50 border-r border-blue-100">
              <span className="mr-2">📈</span>Verif. Rate*
            </td>
            {purokData.map(p => {
              const rate = calcVerifRate(p);
              const color = rate >= 80 ? '#27ae60' : rate >= 50 ? '#f39c12' : '#e74c3c';
              return (
                <td key={p.purok} className="px-4 py-3 text-center font-black text-sm" style={{ color }}>
                  {rate}%
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>

      {/* Footer note */}
      <div className="px-5 py-3 bg-blue-50 border-t border-blue-100">
        <p className="text-[11px] text-blue-600 font-semibold">
          * Verification Rate = Verified ÷ (Verified + Pending + Rejected). Excludes unregistered residents since they haven't submitted.
        </p>
      </div>
    </div>
  );
}
