import {
  AlertTriangle,
  Building2,
  Cross,
  Flame,
  GraduationCap,
  Landmark,
  ShieldAlert,
  Siren,
  Users,
} from "lucide-react";

import { PUROK_CENTERS } from "../../components/sub-system-1/analytics/analyticsConfig";

export const HOMEPAGE_MAP_LAYERS = [
  {
    id: "hall",
    label: "Hall",
    shortLabel: "BH",
    color: "#10B981",
    description: "Official barangay hall and service desk",
    Icon: Landmark,
  },
  {
    id: "services",
    label: "Services",
    shortLabel: "SV",
    color: "#2563EB",
    description: "Health, daycare, and public service venues",
    Icon: Building2,
  },
  {
    id: "emergencies",
    label: "Emergency",
    shortLabel: "EM",
    color: "#DC2626",
    description: "Police, rescue, and evacuation points",
    Icon: Siren,
  },
  {
    id: "events",
    label: "Events",
    shortLabel: "EV",
    color: "#F59E0B",
    description: "Assembly, cleanup, and activity gathering points",
    Icon: Users,
  },
  {
    id: "incidents",
    label: "Incidents",
    shortLabel: "IN",
    color: "#7C3AED",
    description: "Recent community reports and awareness markers",
    Icon: AlertTriangle,
  },
];

const layerMetaMap = HOMEPAGE_MAP_LAYERS.reduce((layerMap, layer) => {
  layerMap[layer.id] = layer;
  return layerMap;
}, {});

const withLayerMeta = (marker, layerId, extraData = {}) => {
  const layer = layerMetaMap[layerId];

  return {
    ...marker,
    color: marker.color || layer.color,
    data: {
      layerId,
      layerLabel: layer.label,
      markerLabel: layer.shortLabel,
      ...marker.data,
      ...extraData,
    },
  };
};

export const HOMEPAGE_FACILITY_MARKERS = [
  withLayerMeta(
    {
      id: "facility-barangay-hall",
      lat: 14.71275,
      lng: 121.03859,
      title: "Barangay Gulod Hall",
      data: {
        description:
          "Official barangay hall location within the mapped Gulod service boundary.",
        address: "Villareal Street, Gulod, Quezon City",
        schedule: "Office hours: Monday to Friday, 8:00 AM to 5:00 PM",
        badge: "Main office",
        id: "GULOD-HALL",
      },
    },
    "hall",
  ),
  withLayerMeta(
    {
      id: "facility-health-center",
      lat: 14.71218,
      lng: 121.03945,
      title: "Barangay Health Center",
      data: {
        description:
          "Primary health consultation point for vaccination, checkups, and maternal care assistance.",
        address: "Health Center Wing, near Barangay Hall",
        schedule: "Clinic desk: Tuesday and Thursday, 9:00 AM to 3:00 PM",
        badge: "Health service",
      },
    },
    "services",
  ),
  withLayerMeta(
    {
      id: "facility-covered-court",
      lat: 14.71186,
      lng: 121.04154,
      title: "Barangay Covered Court",
      data: {
        description:
          "Common venue for assemblies, relief distribution, sports, and indoor barangay activities.",
        address: "Covered Court Complex, central Gulod",
        schedule: "Community use: subject to barangay scheduling",
        badge: "Community venue",
      },
    },
    "services",
  ),
  withLayerMeta(
    {
      id: "facility-daycare",
      lat: 14.71058,
      lng: 121.04092,
      title: "Gulod Daycare Center",
      data: {
        description:
          "Early childhood learning and parent support services for registered families.",
        address: "Service Cluster, Purok 5 side",
        schedule: "Enrollment and support desk: Monday to Friday, 8:00 AM to 3:00 PM",
        badge: "Family support",
      },
    },
    "services",
  ),
  withLayerMeta(
    {
      id: "facility-evacuation",
      lat: 14.71436,
      lng: 121.04094,
      title: "Upper Gulod Evacuation Area",
      data: {
        description:
          "Designated gathering point for storms, fire response, and temporary relief operations.",
        address: "Open evacuation zone, upper Gulod",
        schedule: "Activated during advisories and emergency response",
        badge: "Emergency shelter",
      },
    },
    "emergencies",
  ),
  withLayerMeta(
    {
      id: "facility-police-outpost",
      lat: 14.71356,
      lng: 121.04194,
      title: "Police Assistance Outpost",
      data: {
        description:
          "Public safety checkpoint for blotter coordination, patrol visibility, and rapid response handoff.",
        address: "Safety corner, east cluster",
        schedule: "Visibility post with barangay safety coordination",
        badge: "Peace and order",
      },
    },
    "emergencies",
  ),
  withLayerMeta(
    {
      id: "facility-rescue-post",
      lat: 14.71468,
      lng: 121.04018,
      title: "Rescue Access Post",
      data: {
        description:
          "Quick staging point for rescue volunteers, first aid kits, and emergency vehicle direction.",
        address: "North access lane, near Purok 7",
        schedule: "On-call during incidents and weather alerts",
        badge: "Rescue support",
      },
    },
    "emergencies",
  ),
];

export const HOMEPAGE_EVENT_MARKERS = [
  withLayerMeta(
    {
      id: "event-assembly-point",
      lat: 14.71141,
      lng: 121.04275,
      title: "Barangay Assembly Point",
      data: {
        description:
          "Main public meeting point for quarterly assemblies, open forums, and governance updates.",
        address: "Assembly zone, Purok 4 side",
        schedule: "Quarterly assembly, usually 9:00 AM",
        badge: "Governance event",
      },
    },
    "events",
  ),
  withLayerMeta(
    {
      id: "event-cleanup-staging",
      lat: 14.70804,
      lng: 121.04338,
      title: "Cleanup Drive Staging Area",
      data: {
        description:
          "Meet-up point for volunteers before purok-level street cleaning and waste collection drives.",
        address: "South volunteer meetup, Purok 3",
        schedule: "Cleanup drive, first Saturday, 6:00 AM",
        badge: "Volunteer activity",
      },
    },
    "events",
  ),
  withLayerMeta(
    {
      id: "event-youth-zone",
      lat: 14.71508,
      lng: 121.04138,
      title: "Youth Sports Activity Zone",
      data: {
        description:
          "Regular practice and youth program area for sports clinics, drills, and SK activities.",
        address: "Upper central activity strip",
        schedule: "Youth sessions every Wednesday and Saturday afternoon",
        badge: "SK event space",
      },
    },
    "events",
  ),
];

export const HOMEPAGE_INCIDENT_MARKERS = [
  withLayerMeta(
    {
      id: "incident-streetlight",
      lat: 14.70986,
      lng: 121.04006,
      title: "Recent Report: Streetlight Outage",
      data: {
        description:
          "Community report for a dim streetlight segment affecting evening visibility near the west cluster.",
        address: "Purok 5 inner lane",
        badge: "Monitoring",
        severity: "Low",
        status: "For maintenance follow-up",
        emphasis: true,
      },
    },
    "incidents",
    { markerLabel: "SL" },
  ),
  withLayerMeta(
    {
      id: "incident-drainage",
      lat: 14.70772,
      lng: 121.04308,
      title: "Recent Report: Drainage Buildup",
      data: {
        description:
          "Reported drainage obstruction after rainfall, tagged for inspection and clearing support.",
        address: "Southern corridor, Purok 3",
        badge: "Watch list",
        severity: "Moderate",
        status: "Inspection scheduled",
        emphasis: true,
      },
    },
    "incidents",
    { markerLabel: "DR" },
  ),
  withLayerMeta(
    {
      id: "incident-safety",
      lat: 14.71606,
      lng: 121.04126,
      title: "Recent Report: Safety Visibility Check",
      data: {
        description:
          "Residents requested extra patrol visibility around a busy evening passageway.",
        address: "North approach, Purok 1",
        badge: "Patrol request",
        severity: "Moderate",
        status: "Coordinated with barangay tanod",
        emphasis: true,
      },
    },
    "incidents",
    { markerLabel: "SV" },
  ),
];

export const HOMEPAGE_PUROK_DETAILS = {
  "Purok 1": {
    population: "530 residents",
    households: "142 households",
    assignedOfficial: "Hon. Jose M. Santos",
    contactPerson: "North zone barangay tanod desk",
    nextSchedule: "Safety visibility round every Friday, 7:00 PM",
    nextAssembly: "Monthly assembly every second Wednesday, 4:00 PM",
    landmarks: ["North approach", "Upper residential edge", "Rapid access lane"],
    keywords: ["north", "upper gulod", "gateway"],
  },
  "Purok 2": {
    population: "498 residents",
    households: "131 households",
    assignedOfficial: "Hon. Carlos P. Garcia",
    contactPerson: "East-side service volunteer team",
    nextSchedule: "Block clean-up every first Saturday, 6:00 AM",
    nextAssembly: "Residents huddle every third Tuesday, 4:30 PM",
    landmarks: ["East residential pocket", "Inner lanes", "Neighborhood junction"],
    keywords: ["east", "inner lane", "residential pocket"],
  },
  "Purok 3": {
    population: "612 residents",
    households: "168 households",
    assignedOfficial: "Hon. Maria A. Ramos",
    contactPerson: "Southern health and sanitation desk",
    nextSchedule: "Drainage inspection and clean-up every first Saturday, 6:00 AM",
    nextAssembly: "Community assembly every second Friday, 4:00 PM",
    landmarks: ["Southern reach", "Drainage watch zone", "Volunteer meetup"],
    keywords: ["south", "drainage", "cleanup staging"],
  },
  "Purok 4": {
    population: "456 residents",
    households: "118 households",
    assignedOfficial: "Hon. Reynaldo B. Rivera",
    contactPerson: "Assembly coordination desk",
    nextSchedule: "Assembly prep every quarter, 8:00 AM",
    nextAssembly: "Quarterly assembly point, 9:00 AM call time",
    landmarks: ["Assembly zone", "Center-east lane", "Community corridor"],
    keywords: ["assembly", "center east", "governance"],
  },
  "Purok 5": {
    population: "479 residents",
    households: "126 households",
    assignedOfficial: "Hon. Sofia L. Mercado",
    contactPerson: "Family support and youth volunteers",
    nextSchedule: "Streetlight check every Thursday, 6:30 PM",
    nextAssembly: "Family support meetup every second Saturday, 3:00 PM",
    landmarks: ["West cluster", "Daycare service area", "Inner residential strip"],
    keywords: ["west", "daycare", "streetlight"],
  },
  "Purok 6": {
    population: "548 residents",
    households: "149 households",
    assignedOfficial: "Hon. Reynaldo B. Rivera",
    contactPerson: "Central service counter support",
    nextSchedule: "Core service lane clean-up every first Friday, 5:30 PM",
    nextAssembly: "Central residents assembly every third Wednesday, 4:00 PM",
    landmarks: ["Barangay core", "Hall-adjacent routes", "Shared movement path"],
    keywords: ["core", "barangay hall", "villareal street"],
  },
  "Purok 7": {
    population: "437 residents",
    households: "112 households",
    assignedOfficial: "Hon. Jose M. Santos",
    contactPerson: "Upper connector rescue volunteers",
    nextSchedule: "Emergency route readiness drill every last Saturday, 8:00 AM",
    nextAssembly: "Connector zone meetup every first Wednesday, 4:30 PM",
    landmarks: ["Upper connector", "Rescue access lane", "Mixed street corridor"],
    keywords: ["connector", "rescue", "upper central"],
  },
};

export const HOMEPAGE_SEARCH_ENTRIES = [
  {
    id: "search-all",
    label: "All Puroks",
    type: "view",
    center: { lat: 14.7111, lng: 121.0404 },
    zoom: 15,
    keywords: ["all puroks", "gulod map", "barangay gulod"],
  },
  ...Object.entries(PUROK_CENTERS).map(([purokName, purokMeta]) => ({
    id: `search-${purokName.toLowerCase().replace(/\s+/g, "-")}`,
    label: purokName,
    type: "purok",
    center: { lat: purokMeta.center[0], lng: purokMeta.center[1] },
    zoom: 17,
    purokId: purokName,
    openPanel: true,
    keywords: [
      purokName,
      ...(HOMEPAGE_PUROK_DETAILS[purokName]?.keywords || []),
      ...(HOMEPAGE_PUROK_DETAILS[purokName]?.landmarks || []),
    ],
  })),
  ...[
    ...HOMEPAGE_FACILITY_MARKERS,
    ...HOMEPAGE_EVENT_MARKERS,
    ...HOMEPAGE_INCIDENT_MARKERS,
  ].map((marker) => ({
    id: `search-${marker.id}`,
    label: marker.title,
    type: marker.data.layerId,
    center: { lat: marker.lat, lng: marker.lng },
    zoom: 17,
    purokId:
      Object.entries(PUROK_CENTERS).find(([, meta]) => {
        const [lat, lng] = meta.center;
        return (
          Math.abs(lat - marker.lat) < 0.0035 && Math.abs(lng - marker.lng) < 0.0035
        );
      })?.[0] || "all",
    keywords: [
      marker.title,
      marker.data.layerLabel,
      marker.data.address,
      marker.data.badge,
      marker.data.status,
    ].filter(Boolean),
  })),
  {
    id: "search-villareal-street",
    label: "Villareal Street",
    type: "street",
    center: { lat: 14.71275, lng: 121.03859 },
    zoom: 17,
    purokId: "Purok 6",
    openPanel: true,
    keywords: [
      "villareal",
      "villareal st",
      "villareal st.",
      "street",
      "barangay hall road",
    ],
  },
];

export const HOMEPAGE_MAP_MARKERS = [
  ...HOMEPAGE_FACILITY_MARKERS,
  ...HOMEPAGE_EVENT_MARKERS,
  ...HOMEPAGE_INCIDENT_MARKERS,
];

export const HOMEPAGE_MAP_FEATURES = [
  {
    label: "Search + Layers",
    Icon: Cross,
  },
  {
    label: "Emergency Points",
    Icon: Flame,
  },
  {
    label: "Purok Insights",
    Icon: GraduationCap,
  },
  {
    label: "Community Overlay",
    Icon: ShieldAlert,
  },
];
