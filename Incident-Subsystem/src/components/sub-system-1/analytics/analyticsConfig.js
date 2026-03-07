// ============================================================
// analyticsConfig.js
// THE single source of truth for all analytics constants.
// Every tab imports ONLY from this file.
// DO NOT split this into multiple files.
// ============================================================

import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Users, 
  PieChart, 
  ClipboardList, 
  Briefcase, 
  Target,
  CheckCircle2,
  Users2,
  UserRound,
  Accessibility,
  AlertTriangle,
  Baby,
  Vote
} from 'lucide-react';

// ─── COLORS ──────────────────────────────────────────────────
export const COLORS = {
  primary:   '#6366f1',
  secondary: '#3b82f6',
  accent:    '#f59e0b',
  success:   '#10b981',
  danger:    '#ef4444',
  warning:   '#f97316',
  purple:    '#8b5cf6',
  teal:      '#14b8a6',
  gray:      '#94a3b8',
  pink:      '#ec4899',
};

export const SECTOR_COLORS = {
  'Solo Parent':         COLORS.teal,
  'PWD':                 COLORS.warning,
  'Senior Citizen':      COLORS.danger,
  'LGBTQIA+':           COLORS.purple,
  'Kasambahay':          COLORS.success,
  'OFW':                 COLORS.accent,
  'General Population': COLORS.primary,
  'Unclassified':        COLORS.gray,
};

// ─── ORDERING ────────────────────────────────────────────────
export const AGE_ORDER = ['0-17', '18-25', '26-35', '36-50', '51-59', '60+'];

export const INCOME_ORDER = [
  'No Income', 
  'Below 5,000', 
  '5,001-10,000', 
  '10,001-20,000', 
  '20,001-30,000', 
  '30,001-40,000', 
  '40,001-50,000', 
  '50,001-70,000', 
  '70,001-100,000', 
  'Above 100,000',
];

// ─── TABS ────────────────────────────────────────────────────
export const TABS = [
  { id: 'overview',     label: 'Overview',       icon: LayoutDashboard },
  { id: 'heatmap',      label: 'Purok Heatmap',  icon: MapIcon },
  { id: 'demographics', label: 'Demographics',   icon: Users },
  { id: 'sectors',      label: 'Sectors',        icon: PieChart },
  { id: 'registration', label: 'Registration',   icon: ClipboardList },
  { id: 'livelihood',   label: 'Livelihood',     icon: Briefcase },
  { id: 'insights',     label: 'Decision Guide', icon: Target },
];

// ─── HEATMAP METRICS ─────────────────────────────────────────
export const HEATMAP_METRICS = [
  { key: 'verified',     label: 'Verified',     icon: CheckCircle2 },
  { key: 'total',        label: 'Total',        icon: Users2 },
  { key: 'seniors',      label: 'Seniors',      icon: UserRound },
  { key: 'pwd',          label: 'PWD',          icon: Accessibility },
  { key: 'unregistered', label: 'Unregistered', icon: AlertTriangle },
  { key: 'minors',       label: 'Minors',       icon: Baby },
  { key: 'voters',       label: 'Voters',       icon: Vote },
];

export const HEATMAP_METRIC_COLORS = {
  verified: {
    accent: COLORS.success,
    text: '#059669',
    soft: '#ecfdf5',
    border: '#a7f3d0',
  },
  total: {
    accent: COLORS.secondary,
    text: '#2563eb',
    soft: '#eff6ff',
    border: '#bfdbfe',
  },
  seniors: {
    accent: COLORS.warning,
    text: '#ea580c',
    soft: '#fff7ed',
    border: '#fdba74',
  },
  pwd: {
    accent: COLORS.purple,
    text: '#7c3aed',
    soft: '#f5f3ff',
    border: '#ddd6fe',
  },
  unregistered: {
    accent: COLORS.danger,
    text: '#dc2626',
    soft: '#fef2f2',
    border: '#fecaca',
  },
  minors: {
    accent: '#06b6d4',
    text: '#0891b2',
    soft: '#ecfeff',
    border: '#a5f3fc',
  },
  voters: {
    accent: COLORS.teal,
    text: '#0f766e',
    soft: '#f0fdfa',
    border: '#99f6e4',
  },
};

// ─── MAP ─────────────────────────────────────────────────────
export const BARANGAY_CENTER = [14.71275, 121.03859];

export const BARANGAY_BOUNDARY = [
  [14.710492,  121.0335323], [14.7101886, 121.033562],  [14.709774,  121.0338342],
  [14.7095436, 121.0339713], [14.7094757, 121.0345597], [14.7094277, 121.0350814],
  [14.7093446, 121.0362553], [14.7092669, 121.0363582], [14.709162,  121.0364442],
  [14.7089794, 121.0366244], [14.7089056, 121.036688],  [14.7091458, 121.03699],
  [14.7091637, 121.0372903], [14.709336,  121.0375888], [14.7094565, 121.0382147],
  [14.709263,  121.0384845], [14.7091378, 121.03848],   [14.7090308, 121.0384375],
  [14.708583,  121.0387608], [14.7084187, 121.0387662], [14.7083563, 121.0389081],
  [14.7080226, 121.0396347], [14.7080861, 121.0400809], [14.7080705, 121.0401844],
  [14.7075016, 121.0415248], [14.7066561, 121.0415217], [14.7058151, 121.0418078],
  [14.7052453, 121.0419812], [14.7052824, 121.0440479], [14.7052707, 121.0454888],
  [14.704594,  121.0455003], [14.7050443, 121.0468975], [14.7053168, 121.0474573],
  [14.7061441, 121.0472436], [14.7070541, 121.047172],  [14.7074933, 121.0468812],
  [14.7079836, 121.0468267], [14.7084147, 121.0467387], [14.7087975, 121.0466027],
  [14.7091216, 121.0466418], [14.7093433, 121.0467944], [14.709431,  121.0467645],
  [14.7095276, 121.0466762], [14.7097706, 121.0459681], [14.7099749, 121.0459745],
  [14.7104115, 121.0460574], [14.7107014, 121.046361],  [14.7110597, 121.0469001],
  [14.7113701, 121.0470603], [14.7118121, 121.0468657], [14.7122458, 121.0463628],
  [14.7125295, 121.0461321], [14.712751,  121.0459071], [14.7128774, 121.04565],
  [14.7128681, 121.0449875], [14.7126643, 121.0446371], [14.7122657, 121.0441094],
  [14.7119718, 121.0434184], [14.7122324, 121.0431034], [14.7125755, 121.0429383],
  [14.7130402, 121.0429966], [14.7133731, 121.0431543], [14.7136163, 121.0432103],
  [14.7139198, 121.0430658], [14.7146356, 121.0428879], [14.7148887, 121.0428612],
  [14.7151967, 121.0430697], [14.7154815, 121.0434241], [14.7158245, 121.0442338],
  [14.7161024, 121.0443099], [14.7165224, 121.0440041], [14.7173538, 121.0438154],
  [14.7178396, 121.0436498], [14.7184845, 121.0434931], [14.7186606, 121.0433491],
  [14.7187068, 121.0432445], [14.7186606, 121.0430669], [14.7184907, 121.0427013],
  [14.7183594, 121.0421883], [14.7185368, 121.0418588], [14.7188422, 121.0414534],
  [14.7190759, 121.0409713], [14.7188598, 121.0404672], [14.7184233, 121.039773],
  [14.7175646, 121.0390905], [14.7172294, 121.0387788], [14.7170159, 121.0387334],
  [14.7166645, 121.0386199], [14.7164802, 121.0383958], [14.7159302, 121.0374116],
  [14.7155130, 121.0373544], [14.7152856, 121.0373694], [14.71503,   121.0372433],
  [14.7148582, 121.0370918], [14.7146629, 121.0369087], [14.7145637, 121.0367116],
  [14.7145683, 121.0365533], [14.714615,  121.0361651], [14.7147687, 121.0351744],
  [14.7147602, 121.0351244], [14.7146952, 121.035004],  [14.7145509, 121.0348887],
  [14.7140667, 121.0344099], [14.7136913, 121.0341839], [14.7133827, 121.0342312],
  [14.7130565, 121.0344816], [14.7127621, 121.0345812], [14.712633,  121.0345279],
  [14.7122626, 121.0341479], [14.712102,  121.0339345], [14.7118143, 121.0335527],
  [14.711682,  121.0334848], [14.7114846, 121.0335308], [14.7112641, 121.0337882],
  [14.7111092, 121.0339523], [14.7108099, 121.0341028], [14.7105621, 121.0339774],
  [14.7104859, 121.0336751], [14.710492,  121.0335323],
];

// Purok circle marker positions for the heatmap.
export const PUROK_CENTERS = {
  'Purok 1': { center: [14.7169, 121.0413], label: 'Purok 1' },
  'Purok 2': { center: [14.7125, 121.0432], label: 'Purok 2' },
  'Purok 3': { center: [14.7072, 121.0440], label: 'Purok 3' },
  'Purok 4': { center: [14.7108, 121.0463], label: 'Purok 4' },
  'Purok 5': { center: [14.7070, 121.0375], label: 'Purok 5' },
  'Purok 6': { center: [14.7115, 121.0368], label: 'Purok 6' },
  'Purok 7': { center: [14.7155, 121.0362], label: 'Purok 7' },
};

// ─── UTILITY FUNCTIONS ────────────────────────────────────────
export function pct(part, total) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

export function calcVerifRate(p) {
  const submitted = (Number(p.verified) || 0) + (Number(p.pending) || 0) + (Number(p.rejected) || 0);
  return submitted > 0 ? Math.round(((Number(p.verified) || 0) / submitted) * 100) : 0;
}

function hexToRgb(hex) {
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
}

export function getHeatColor(value, max, alpha = 0.75, baseColor = COLORS.primary) {
  if (!max || max === 0) {
    const start = hexToRgb('#f8fafc');
    return `rgba(${start.r},${start.g},${start.b},0.35)`;
  }
  const ratio = Math.min(value / max, 1);
  const start = hexToRgb('#f8fafc');
  const end = hexToRgb(baseColor);
  const r = Math.round(start.r + (end.r - start.r) * ratio);
  const g = Math.round(start.g + (end.g - start.g) * ratio);
  const b = Math.round(start.b + (end.b - start.b) * ratio);
  return `rgba(${r},${g},${b},${alpha})`;
}
