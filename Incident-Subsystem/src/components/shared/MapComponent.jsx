import React, { useCallback, useEffect, useRef, useState } from "react";
import { Layers3 } from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import themeTokens from "../../Themetokens";
import {
  PUROK_CENTERS,
  PUROK_ZONES,
} from "../sub-system-1/analytics/analyticsConfig";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Barangay Gulod boundary coordinates (from OpenStreetMap Relation 270990)
const barangayBoundary = [
  [14.710492, 121.0335323],
  [14.7101886, 121.033562],
  [14.709774, 121.0338342],
  [14.7095436, 121.0339713],
  [14.7094757, 121.0345597],
  [14.7094277, 121.0350814],
  [14.7093446, 121.0362553],
  [14.7092669, 121.0363582],
  [14.709162, 121.0364442],
  [14.7089794, 121.0366244],
  [14.7089056, 121.036688],
  [14.7091458, 121.03699],
  [14.7091637, 121.0372903],
  [14.709336, 121.0375888],
  [14.7094565, 121.0382147],
  [14.709263, 121.0384845],
  [14.7091378, 121.03848],
  [14.7090308, 121.0384375],
  [14.708583, 121.0387608],
  [14.7084187, 121.0387662],
  [14.7083563, 121.0389081],
  [14.7080226, 121.0396347],
  [14.7080861, 121.0400809],
  [14.7080705, 121.0401844],
  [14.7075016, 121.0415248],
  [14.7066561, 121.0415217],
  [14.7058151, 121.0418078],
  [14.7052453, 121.0419812],
  [14.7052824, 121.0440479],
  [14.7052707, 121.0454888],
  [14.704594, 121.0455003],
  [14.7050443, 121.0468975],
  [14.7053168, 121.0474573],
  [14.7061441, 121.0472436],
  [14.7061633, 121.0472437],
  [14.7063696, 121.0471759],
  [14.7070541, 121.047172],
  [14.7074933, 121.0468812],
  [14.7079836, 121.0468267],
  [14.7084147, 121.0467387],
  [14.7087975, 121.0466027],
  [14.7088616, 121.0465728],
  [14.708988, 121.0465237],
  [14.7090729, 121.0465472],
  [14.7091216, 121.0466418],
  [14.7091885, 121.0467319],
  [14.7093433, 121.0467944],
  [14.709431, 121.0467645],
  [14.7095276, 121.0466762],
  [14.709637, 121.0464922],
  [14.7097706, 121.0459681],
  [14.7098262, 121.0459465],
  [14.7099749, 121.0459745],
  [14.7100253, 121.0459659],
  [14.7100798, 121.0460252],
  [14.7102054, 121.045984],
  [14.7104115, 121.0460574],
  [14.7105981, 121.046219],
  [14.7107014, 121.046361],
  [14.7109051, 121.0467486],
  [14.7110597, 121.0469001],
  [14.7112651, 121.0470558],
  [14.7113701, 121.0470603],
  [14.7118121, 121.0468657],
  [14.7120473, 121.04668],
  [14.7122458, 121.0463628],
  [14.7125295, 121.0461321],
  [14.712751, 121.0459071],
  [14.7128774, 121.04565],
  [14.7129189, 121.0452638],
  [14.7128681, 121.0449875],
  [14.7126643, 121.0446371],
  [14.7125356, 121.0444294],
  [14.7122657, 121.0441094],
  [14.7119655, 121.0436705],
  [14.7119718, 121.0434184],
  [14.7120946, 121.0432508],
  [14.7122324, 121.0431034],
  [14.7123962, 121.0429966],
  [14.7125755, 121.0429383],
  [14.7127791, 121.0429079],
  [14.7130402, 121.0429966],
  [14.7133731, 121.0431543],
  [14.7135, 121.0432095],
  [14.7136163, 121.0432103],
  [14.7139198, 121.0430658],
  [14.7146356, 121.0428879],
  [14.7148887, 121.0428612],
  [14.7150544, 121.0429258],
  [14.7151967, 121.0430697],
  [14.7154815, 121.0434241],
  [14.7157166, 121.0438905],
  [14.7158245, 121.0442338],
  [14.7159932, 121.0443492],
  [14.7161024, 121.0443099],
  [14.7162898, 121.0441341],
  [14.7165224, 121.0440041],
  [14.7173538, 121.0438154],
  [14.717601, 121.0437188],
  [14.7178396, 121.0436498],
  [14.7184845, 121.0434931],
  [14.7185908, 121.0434293],
  [14.7186606, 121.0433855],
  [14.718696, 121.0433491],
  [14.7187068, 121.0432445],
  [14.7186606, 121.0430669],
  [14.7184907, 121.0427013],
  [14.7184298, 121.042527],
  [14.7183594, 121.0421883],
  [14.7183753, 121.0420877],
  [14.7185368, 121.0418588],
  [14.7186873, 121.0416664],
  [14.7188422, 121.0414534],
  [14.7190733, 121.0411207],
  [14.7190759, 121.0409713],
  [14.7188598, 121.0404672],
  [14.7187086, 121.0401682],
  [14.7184233, 121.039773],
  [14.7176617, 121.0391703],
  [14.7175646, 121.0390905],
  [14.7174147, 121.0389286],
  [14.7173238, 121.0388499],
  [14.7172294, 121.0387788],
  [14.7171469, 121.0387494],
  [14.7170159, 121.0387334],
  [14.7168797, 121.0387279],
  [14.7167954, 121.0387239],
  [14.7167398, 121.0386924],
  [14.7166645, 121.0386199],
  [14.7164802, 121.0383958],
  [14.7159739, 121.0374912],
  [14.7159302, 121.0374116],
  [14.7159069, 121.0373821],
  [14.7158693, 121.0373667],
  [14.7158368, 121.0373533],
  [14.7157973, 121.0373462],
  [14.7157255, 121.0373377],
  [14.715513, 121.0373544],
  [14.7153563, 121.0373727],
  [14.7152856, 121.0373694],
  [14.7152214, 121.0373586],
  [14.7151652, 121.0373378],
  [14.71503, 121.0372433],
  [14.7148582, 121.0370918],
  [14.7146629, 121.0369087],
  [14.7146156, 121.0368524],
  [14.7145884, 121.0368115],
  [14.7145735, 121.0367752],
  [14.7145637, 121.0367116],
  [14.7145624, 121.0366505],
  [14.7145683, 121.0365533],
  [14.714615, 121.0361651],
  [14.7146798, 121.0357641],
  [14.7147687, 121.0351744],
  [14.7147602, 121.0351244],
  [14.7147391, 121.0350697],
  [14.7146952, 121.035004],
  [14.7145509, 121.0348887],
  [14.7140667, 121.0344099],
  [14.7138862, 121.0342536],
  [14.7136913, 121.0341839],
  [14.7135132, 121.0341969],
  [14.7133827, 121.0342312],
  [14.7132461, 121.0342965],
  [14.7130565, 121.0344816],
  [14.7129008, 121.0345607],
  [14.7127621, 121.0345812],
  [14.712633, 121.0345279],
  [14.7122626, 121.0341479],
  [14.712102, 121.0339345],
  [14.7118143, 121.0335527],
  [14.711682, 121.0334848],
  [14.7115454, 121.0334957],
  [14.7114846, 121.0335308],
  [14.7114333, 121.0335862],
  [14.7112641, 121.0337882],
  [14.7111092, 121.0339523],
  [14.7109148, 121.0340751],
  [14.7108099, 121.0341028],
  [14.7106753, 121.0340604],
  [14.7105621, 121.0339774],
  [14.7105114, 121.0338543],
  [14.7104859, 121.0336751],
];

// Barangay Gulod center (from OSM)
const barangayCenter = [14.7118, 121.0404];

const PUROK_ZONE_DETAILS = {
  "Purok 1": {
    title: "Northern Gateway Zone",
    description:
      "Covers the upper residential edge of Gulod and serves as one of the northern mapped clusters.",
    highlights: ["North approach", "Dense home blocks", "Quick route access"],
  },
  "Purok 2": {
    title: "Upper East Residential Zone",
    description:
      "Mapped for the upper east side where interior streets and neighborhood lanes branch out toward the boundary.",
    highlights: ["East-side blocks", "Interior lanes", "Residential pocket"],
  },
  "Purok 3": {
    title: "Southern Extension Zone",
    description:
      "Represents the lower stretch of Barangay Gulod, including the long southern extension of the service area.",
    highlights: ["Southern reach", "Lower corridor", "Wide coverage area"],
  },
  "Purok 4": {
    title: "Central East Activity Zone",
    description:
      "Focused on the center-east portion of the barangay where several connected streets meet the main inner routes.",
    highlights: ["Center-east lanes", "Connected routes", "Inner blocks"],
  },
  "Purok 5": {
    title: "West Side Neighborhood Zone",
    description:
      "Covers the west-facing neighborhood section and nearby inner roads leading toward the center of Gulod.",
    highlights: ["West cluster", "Inner streets", "Residential strip"],
  },
  "Purok 6": {
    title: "Core Barangay Zone",
    description:
      "This is the central purok cluster close to the core mapped area and key movement paths inside Gulod.",
    highlights: ["Core area", "Central access", "Shared routes"],
  },
  "Purok 7": {
    title: "Upper Central Connector Zone",
    description:
      "A connector purok that bridges the upper middle portion of the barangay toward both west and east sectors.",
    highlights: ["Upper middle", "Connector routes", "Mixed streets"],
  },
};

export const PUROK_ZONE_COLORS = {
  "Purok 1": "#22c55e",
  "Purok 2": "#06b6d4",
  "Purok 3": "#f59e0b",
  "Purok 4": "#3b82f6",
  "Purok 5": "#f97316",
  "Purok 6": "#10b981",
  "Purok 7": "#8b5cf6",
};

const BASE_MAP_CONFIGS = {
  default: {
    id: "default",
    label: "Street",
    description: "Modern roads and landmarks",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    previewStyle: {
      background: "linear-gradient(135deg, #e0f2fe 0%, #f8fafc 52%, #d1fae5 100%)",
    },
  },
  light: {
    id: "light",
    label: "Light",
    description: "Clean analytics view",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; CARTO',
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    previewStyle: {
      background: "linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)",
    },
  },
  satellite: {
    id: "satellite",
    label: "Satellite",
    description: "Aerial imagery view",
    attribution: "Tiles &copy; Esri",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    previewStyle: {
      background: "linear-gradient(135deg, #334155 0%, #14532d 45%, #854d0e 100%)",
    },
  },
  dark: {
    id: "dark",
    label: "Dark",
    description: "Low-light contrast view",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; CARTO',
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    previewStyle: {
      background: "linear-gradient(135deg, #111827 0%, #1f2937 55%, #334155 100%)",
    },
  },
};

const BASE_MAP_TYPE_OPTIONS = [
  BASE_MAP_CONFIGS.default,
  BASE_MAP_CONFIGS.light,
  BASE_MAP_CONFIGS.satellite,
  BASE_MAP_CONFIGS.dark,
];

const PUROK_PREVIEW_ZOOM = 18;
const PUROK_PREVIEW_TILE_SIZE = 256;
const PUROK_PREVIEW_FRAME_WIDTH = 236;
const PUROK_PREVIEW_FRAME_HEIGHT = 96;

const resolveBaseMapType = (tileStyle, currentTheme) => {
  if (tileStyle === "dark") return "dark";
  if (tileStyle === "light" || tileStyle === "modern") return "light";
  if (tileStyle === "auto") return currentTheme === "dark" ? "dark" : "light";
  return "default";
};

const projectLatLngToTile = ([lat, lng], zoom) => {
  const latRad = (lat * Math.PI) / 180;
  const scale = 2 ** zoom;

  return {
    x: ((lng + 180) / 360) * scale,
    y:
      ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
      scale,
  };
};

const buildSatelliteTileUrl = (x, y, zoom) =>
  `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`;

const buildGoogleMapsUrl = ([lat, lng]) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

const buildGoogleDirectionsUrl = ([lat, lng]) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

const buildPurokPreviewLayout = (
  center,
  zoom = PUROK_PREVIEW_ZOOM,
  frameWidth = PUROK_PREVIEW_FRAME_WIDTH,
  frameHeight = PUROK_PREVIEW_FRAME_HEIGHT,
) => {
  const projected = projectLatLngToTile(center, zoom);
  const startX = Math.max(Math.floor(projected.x - 0.5), 0);
  const startY = Math.max(Math.floor(projected.y - 0.5), 0);
  const centerPixelX = (projected.x - startX) * PUROK_PREVIEW_TILE_SIZE;
  const centerPixelY = (projected.y - startY) * PUROK_PREVIEW_TILE_SIZE;

  return {
    tiles: [0, 1].flatMap((row) =>
      [0, 1].map((col) => ({
        key: `${startX + col}-${startY + row}`,
        x: startX + col,
        y: startY + row,
        left: col * PUROK_PREVIEW_TILE_SIZE,
        top: row * PUROK_PREVIEW_TILE_SIZE,
      })),
    ),
    offsetX: frameWidth / 2 - centerPixelX,
    offsetY: frameHeight / 2 - centerPixelY,
  };
};

const toPlanarPoint = ([lat, lng]) => ({ x: lng, y: lat });
const toLatLngPoint = ({ x, y }) => [y, x];

const getSquaredDistance = (pointA, pointB) => {
  const deltaX = pointA.x - pointB.x;
  const deltaY = pointA.y - pointB.y;
  return deltaX * deltaX + deltaY * deltaY;
};

const getBisectorValue = (point, sitePoint, otherPoint) =>
  getSquaredDistance(point, sitePoint) - getSquaredDistance(point, otherPoint);

const getBisectorIntersection = (start, end, sitePoint, otherPoint) => {
  const startValue = getBisectorValue(start, sitePoint, otherPoint);
  const endValue = getBisectorValue(end, sitePoint, otherPoint);
  const denominator = startValue - endValue;

  if (Math.abs(denominator) < 1e-12) {
    return end;
  }

  const ratio = Math.min(1, Math.max(0, startValue / denominator));
  return {
    x: start.x + (end.x - start.x) * ratio,
    y: start.y + (end.y - start.y) * ratio,
  };
};

const normalizePolygonPoints = (points) => {
  if (!points.length) return points;

  const deduped = points.filter((point, index) => {
    if (index === 0) return true;
    const previousPoint = points[index - 1];
    return (
      Math.abs(point.x - previousPoint.x) > 1e-9 ||
      Math.abs(point.y - previousPoint.y) > 1e-9
    );
  });

  if (deduped.length > 1) {
    const firstPoint = deduped[0];
    const lastPoint = deduped[deduped.length - 1];
    if (
      Math.abs(firstPoint.x - lastPoint.x) <= 1e-9 &&
      Math.abs(firstPoint.y - lastPoint.y) <= 1e-9
    ) {
      deduped.pop();
    }
  }

  return deduped;
};

const clipPolygonByNearestSite = (polygonPoints, siteLatLng, otherLatLng) => {
  if (!polygonPoints.length) return [];

  const sitePoint = toPlanarPoint(siteLatLng);
  const otherPoint = toPlanarPoint(otherLatLng);
  const clippedPoints = [];

  polygonPoints.forEach((currentPoint, index) => {
    const nextPoint = polygonPoints[(index + 1) % polygonPoints.length];
    const currentInside =
      getBisectorValue(currentPoint, sitePoint, otherPoint) <= 1e-12;
    const nextInside =
      getBisectorValue(nextPoint, sitePoint, otherPoint) <= 1e-12;

    if (currentInside && nextInside) {
      clippedPoints.push(nextPoint);
      return;
    }

    if (currentInside && !nextInside) {
      clippedPoints.push(
        getBisectorIntersection(currentPoint, nextPoint, sitePoint, otherPoint),
      );
      return;
    }

    if (!currentInside && nextInside) {
      clippedPoints.push(
        getBisectorIntersection(currentPoint, nextPoint, sitePoint, otherPoint),
      );
      clippedPoints.push(nextPoint);
    }
  });

  return normalizePolygonPoints(clippedPoints);
};

const buildFullCoveragePurokZones = () => {
  const boundaryPolygon = barangayBoundary.map(toPlanarPoint);
  const purokEntries = Object.entries(PUROK_CENTERS);

  return purokEntries.reduce((zoneMap, [purokName, purokMeta]) => {
    let clippedPolygon = boundaryPolygon;

    purokEntries.forEach(([otherPurokName, otherPurokMeta]) => {
      if (otherPurokName === purokName) return;
      clippedPolygon = clipPolygonByNearestSite(
        clippedPolygon,
        purokMeta.center,
        otherPurokMeta.center,
      );
    });

    zoneMap[purokName] =
      clippedPolygon.length >= 3
        ? clippedPolygon.map(toLatLngPoint)
        : PUROK_ZONES[purokName] || [];

    return zoneMap;
  }, {});
};

const fullCoveragePurokZones = buildFullCoveragePurokZones();

// Check if point is inside polygon
const isPointInPolygon = (point, polygon) => {
  let inside = false;
  const x = point[0]; // lat
  const y = point[1]; // lng

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

// Custom pin icon
const createPinIcon = () => {
  return L.divIcon({
    className: "custom-pin-marker",
    html: `<div style="position: relative; width: 30px; height: 40px;">
      <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C8.373 0 3 5.373 3 12c0 9 12 28 12 28s12-19 12-28c0-6.627-5.373-12-12-12z" 
              fill="#EF4444" stroke="white" stroke-width="2"/>
        <circle cx="15" cy="12" r="4" fill="white"/>
      </svg>
    </div>`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
  });
};

// Create custom colored marker icon
const createColoredIcon = (color, options = {}) => {
  const {
    label = "",
    size = 20,
    borderWidth = 2,
    emphasis = false,
    glow = "0 14px 26px rgba(15,23,42,0.22)",
  } = options;
  const fontSize = label.length > 2 ? 8 : label.length > 1 ? 9 : 10;
  const haloSize = size + 18;
  const haloOffset = (haloSize - size) / 2;

  return L.divIcon({
    className: "custom-colored-marker",
    html: `<div style="position: relative; width: ${size}px; height: ${size}px;">
      ${
        emphasis
          ? `<span style="
              position: absolute;
              width: ${haloSize}px;
              height: ${haloSize}px;
              left: -${haloOffset}px;
              top: -${haloOffset}px;
              border-radius: 999px;
              background: ${color}2f;
              box-shadow: 0 0 0 1px ${color}35;
            "></span>`
          : ""
      }
      <div style="
        position: relative;
        background: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 999px;
        border: ${borderWidth}px solid rgba(255,255,255,0.98);
        box-shadow: ${glow};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: ${fontSize}px;
        font-weight: 900;
        letter-spacing: 0.02em;
        text-transform: uppercase;
      ">${label}</div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const getMarkerIconOptions = (marker) => {
  const layerId = marker?.data?.layerId;

  switch (layerId) {
    case "hall":
      return {
        size: 28,
        borderWidth: 3,
        emphasis: true,
        label: marker?.data?.markerLabel || "BH",
        glow: "0 18px 30px rgba(5,150,105,0.36)",
      };
    case "services":
      return {
        size: 26,
        borderWidth: 3,
        label: marker?.data?.markerLabel || "SV",
        glow: "0 16px 28px rgba(37,99,235,0.28)",
      };
    case "emergencies":
      return {
        size: 28,
        borderWidth: 3,
        emphasis: true,
        label: marker?.data?.markerLabel || "EM",
        glow: "0 18px 30px rgba(220,38,38,0.34)",
      };
    case "events":
      return {
        size: 26,
        borderWidth: 3,
        label: marker?.data?.markerLabel || "EV",
        glow: "0 16px 28px rgba(245,158,11,0.3)",
      };
    case "incidents":
      return {
        size: 28,
        borderWidth: 3,
        emphasis: true,
        label: marker?.data?.markerLabel || "IN",
        glow: "0 18px 30px rgba(124,58,237,0.32)",
      };
    default:
      return {
        size: 20,
        borderWidth: 2,
        label: marker?.data?.markerLabel || "",
        emphasis: Boolean(marker?.data?.emphasis),
      };
  }
};

const createPurokPointIcon = (purokName, color, isDark, isActive = false) => {
  const labelNumber = purokName.match(/\d+/)?.[0] || purokName;
  const markerSize = isActive ? 36 : 30;
  const borderWidth = isActive ? 4 : 3;
  const outerShadow = isDark
    ? isActive
      ? "0 0 0 10px rgba(45, 212, 191, 0.22), 0 16px 32px rgba(2, 6, 23, 0.52)"
      : "0 0 0 7px rgba(45, 212, 191, 0.16), 0 14px 28px rgba(2, 6, 23, 0.42)"
    : isActive
      ? "0 0 0 10px rgba(16, 185, 129, 0.18), 0 16px 28px rgba(15, 23, 42, 0.24)"
      : "0 0 0 7px rgba(16, 185, 129, 0.14), 0 12px 24px rgba(15, 23, 42, 0.18)";

  return L.divIcon({
    className: "custom-purok-point-marker",
    html: `<div style="
      width: ${markerSize}px;
      height: ${markerSize}px;
      border-radius: 999px;
      background: ${color};
      border: ${borderWidth}px solid rgba(255,255,255,0.96);
      box-shadow: ${outerShadow};
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: ${isActive ? 12 : 11}px;
      font-weight: 900;
      letter-spacing: 0.02em;
    ">${labelNumber}</div>`,
    iconSize: [markerSize, markerSize],
    iconAnchor: [markerSize / 2, markerSize / 2],
    popupAnchor: [0, 0],
  });
};

// Component to handle map clicks in pin mode
function ClickHandler({ mode, onLocationClick, onError }) {
  useMapEvents({
    click(e) {
      if (mode === "pin") {
        const clickedPoint = [e.latlng.lat, e.latlng.lng];

        // Only allow pinning within barangay boundary
        if (isPointInPolygon(clickedPoint, barangayBoundary)) {
          onLocationClick(clickedPoint);
        } else {
          onError("Please pin a location within Barangay Gulod boundaries");
        }
      }
    },
  });
  return null;
}

// Component to set map bounds and fit markers
function MapController({ mode, viewCenter, viewZoom }) {
  const map = useMap();

  useEffect(() => {
    // Lock map to Barangay Gulod boundaries for all modes
    const bounds = L.latLngBounds(barangayBoundary);
    map.setMaxBounds(bounds.pad(0.3));
    map.setMinZoom(14);

    if (mode === "view") {
      // Keep the homepage map center adjustable so overlaid captions
      // can be balanced without affecting pin-mode behavior.
      map.setView(viewCenter, viewZoom);
    }
  }, [mode, map, viewCenter, viewZoom]);

  return null;
}

function MapInstanceBridge({ onReady }) {
  const map = useMap();

  useEffect(() => {
    onReady(map);
  }, [map, onReady]);

  return null;
}

/**
 * Reusable Map Component using React-Leaflet
 *
 * Modes:
 * - "view": Display markers for existing cases (read-only)
 * - "pin": Allow user to pin a location (interactive)
 *
 * @param {string} mode - "view" or "pin"
 * @param {Array} markers - Array of marker objects for "view" mode: [{lat, lng, title, color, data}]
 * @param {Function} onLocationSelect - Callback for "pin" mode when user selects location: (lat, lng, address) => {}
 * @param {Object} initialCenter - Initial map center: {lat, lng}
 * @param {number} initialZoom - Initial zoom level (default: 13)
 * @param {string} currentTheme - Theme name for styling
 * @param {boolean} enableGPS - Enable GPS auto-location (default: true for pin mode)
 * @param {string} height - Map container height (default: "400px")
 * @param {number} viewZoom - View mode zoom level (default: 15)
 */
const MapComponent = ({
  mode = "view",
  markers = [],
  onLocationSelect,
  initialCenter = { lat: 14.676, lng: 121.0437 },
  initialZoom = 13,
  viewZoom = 15,
  currentTheme = "blue",
  enableGPS = true,
  height = "400px",
  tileStyle = "default",
  mapShellClassName = "",
  showPurokDividers = false,
  activePurok = "all",
  activePurokPanel = null,
  enablePurokInteractions = false,
  onPurokSelect,
  showMapTypeControl = false,
  purokDetails = {},
}) => {
  const [pinnedLocation, setPinnedLocation] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOutsideBoundary, setIsOutsideBoundary] = useState(false);
  const [activeBaseMapType, setActiveBaseMapType] = useState(() =>
    resolveBaseMapType(tileStyle, currentTheme),
  );
  const [isMapTypeMenuOpen, setIsMapTypeMenuOpen] = useState(false);
  const [leafletMap, setLeafletMap] = useState(null);
  const [connectorLayout, setConnectorLayout] = useState(null);
  const mapShellRef = useRef(null);
  const purokPanelRef = useRef(null);
  const t = themeTokens[currentTheme] || themeTokens.modern;

  // Use barangay center for pin mode, otherwise use provided center
  const mapCenter =
    mode === "pin" ? barangayCenter : [initialCenter.lat, initialCenter.lng];
  const mapZoom = mode === "pin" ? 15 : viewZoom || initialZoom;

  // Reverse geocode to get address
  const reverseGeocode = useCallback(
    async (position) => {
      try {
        const [lat, lng] = position;
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        );
        const data = await response.json();

        const address =
          data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setSelectedAddress(address);

        if (onLocationSelect) {
          onLocationSelect(lat, lng, address);
        }
      } catch (error) {
        console.error("Reverse geocoding error:", error);
        const [lat, lng] = position;
        const fallbackAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setSelectedAddress(fallbackAddress);

        if (onLocationSelect) {
          onLocationSelect(lat, lng, fallbackAddress);
        }
      }
    },
    [onLocationSelect],
  );

  // Handle location click in pin mode
  const handleLocationClick = (position) => {
    setPinnedLocation(position);
    reverseGeocode(position);
    setError(null);
    setIsOutsideBoundary(false);
  };

  // Handle error display
  const handleError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 3000);
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      handleError("Geolocation is not supported by your browser");
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = [position.coords.latitude, position.coords.longitude];

        // Check if current location is within barangay boundary
        if (mode === "pin" && !isPointInPolygon(pos, barangayBoundary)) {
          handleError(
            "Your location is outside Barangay Gulod. Please pin manually.",
          );
          setIsLoading(false);
          return;
        }

        setPinnedLocation(pos);
        reverseGeocode(pos);
        setIsLoading(false);
      },
      (error) => {
        console.error("GPS error:", error);
        handleError(
          "Unable to get your location. Please check location permissions.",
        );
        setIsLoading(false);
      },
    );
  };

  // Auto-locate on mount for pin mode
  useEffect(() => {
    if (mode === "pin" && enableGPS && navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = [position.coords.latitude, position.coords.longitude];

          // Check if GPS location is within barangay boundary
          if (isPointInPolygon(pos, barangayBoundary)) {
            setPinnedLocation(pos);
            reverseGeocode(pos);
            setIsOutsideBoundary(false);
          } else {
            setIsOutsideBoundary(true);
          }
          setIsLoading(false);
        },
        (error) => {
          console.warn("GPS location error:", error);
          setIsLoading(false);
        },
      );
    }
  }, [mode, enableGPS, reverseGeocode]);

  const boundaryColor = mode === "pin" ? "#2563EB" : "#10B981";
  const fillColor = mode === "pin" ? "#3B82F6" : "#34D399";
  const fillOpacity = mode === "pin" ? 0.15 : 0.1;
  const resolvedBaseMapType = showMapTypeControl
    ? activeBaseMapType
    : resolveBaseMapType(tileStyle, currentTheme);
  const activeBaseMapConfig =
    BASE_MAP_CONFIGS[resolvedBaseMapType] || BASE_MAP_CONFIGS.default;
  const activeBasemap = activeBaseMapConfig;
  const useDarkOverlayStyling = resolvedBaseMapType === "dark";
  const shouldShowPurokDividers = mode === "view" && showPurokDividers;
  const focusedPurokName = activePurok === "all" ? null : activePurok;
  const detailPurokName =
    activePurokPanel && activePurokPanel !== "all" ? activePurokPanel : null;
  const selectedPurokMeta = detailPurokName
    ? PUROK_CENTERS[detailPurokName]
    : null;
  const selectedZoneColor =
    (detailPurokName && PUROK_ZONE_COLORS[detailPurokName]) || "#10b981";
  const selectedZoneDetails = detailPurokName
    ? PUROK_ZONE_DETAILS[detailPurokName]
    : null;
  const selectedPurokDetails = detailPurokName
    ? purokDetails[detailPurokName]
    : null;
  const selectedPreviewLayout = selectedPurokMeta
    ? buildPurokPreviewLayout(selectedPurokMeta.center)
    : null;
  const selectedMapsUrl = selectedPurokMeta
    ? buildGoogleMapsUrl(selectedPurokMeta.center)
    : null;
  const selectedDirectionsUrl = selectedPurokMeta
    ? buildGoogleDirectionsUrl(selectedPurokMeta.center)
    : null;
  const selectedLandmarks = Array.from(
    new Set([
      ...(selectedPurokDetails?.landmarks || []),
      ...(selectedZoneDetails?.highlights || []),
    ]),
  );
  const selectedPurokStats = selectedPurokDetails
    ? [
        { label: "Population", value: selectedPurokDetails.population },
        { label: "Households", value: selectedPurokDetails.households },
      ]
    : [];
  const selectedPurokInfoItems = selectedPurokDetails
    ? [
        {
          label: "Assigned Official",
          value: selectedPurokDetails.assignedOfficial,
        },
        {
          label: "Contact Point",
          value: selectedPurokDetails.contactPerson,
        },
        {
          label: "Next Cleanup or Drill",
          value: selectedPurokDetails.nextSchedule,
        },
        {
          label: "Next Assembly",
          value: selectedPurokDetails.nextAssembly,
        },
      ]
    : [];

  useEffect(() => {
    if (
      !selectedPurokMeta ||
      !leafletMap ||
      typeof leafletMap.latLngToContainerPoint !== "function" ||
      !mapShellRef.current ||
      !purokPanelRef.current
    ) {
      setConnectorLayout(null);
      return undefined;
    }

    const updateConnectorLayout = () => {
      const shellRect = mapShellRef.current?.getBoundingClientRect?.();
      const panelRect = purokPanelRef.current?.getBoundingClientRect?.();

      if (
        !shellRect ||
        !panelRect ||
        !shellRect.width ||
        !shellRect.height ||
        !panelRect.width ||
        !panelRect.height
      ) {
        setConnectorLayout(null);
        return;
      }

      const point = leafletMap.latLngToContainerPoint(selectedPurokMeta.center);
      const markerRadius = detailPurokName ? 18 : 15;
      const startX = point.x + markerRadius;
      const startY = point.y;
      const endX = panelRect.left - shellRect.left - 14;
      const endY = panelRect.top - shellRect.top + panelRect.height / 2;

      if (endX <= startX) {
        setConnectorLayout(null);
        return;
      }

      setConnectorLayout({
        startX,
        startY,
        endX,
        endY,
      });
    };

    const scheduleConnectorUpdate = () => {
      if (typeof window !== "undefined") {
        window.requestAnimationFrame(updateConnectorLayout);
      } else {
        updateConnectorLayout();
      }
    };

    scheduleConnectorUpdate();

    if (typeof leafletMap.on === "function") {
      leafletMap.on("move zoom resize moveend zoomend", scheduleConnectorUpdate);
    }
    if (typeof window !== "undefined") {
      window.addEventListener("resize", scheduleConnectorUpdate);
    }

    return () => {
      if (typeof leafletMap.off === "function") {
        leafletMap.off(
          "move zoom resize moveend zoomend",
          scheduleConnectorUpdate,
        );
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", scheduleConnectorUpdate);
      }
    };
  }, [detailPurokName, leafletMap, selectedPurokMeta]);

  const handlePurokSelect = (purokName, source = "zone") => {
    if (enablePurokInteractions && onPurokSelect) {
      onPurokSelect(purokName, { source });
    }
  };

  return (
    <div className="relative">
      <style>{`
        .map-purok-panel-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.9) transparent;
          scrollbar-gutter: stable;
        }

        .map-purok-panel-scroll::-webkit-scrollbar {
          width: 10px;
        }

        .map-purok-panel-scroll::-webkit-scrollbar-track {
          margin: 12px 0;
          background: transparent;
        }

        .map-purok-panel-scroll::-webkit-scrollbar-thumb {
          border: 2px solid rgba(255, 255, 255, 0.9);
          border-radius: 999px;
          background: rgba(148, 163, 184, 0.9);
          background-clip: padding-box;
        }

        .map-purok-panel-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.92);
        }

        .map-purok-panel-scroll::-webkit-scrollbar-button {
          width: 0;
          height: 0;
          display: none;
        }

        .map-purok-panel-scroll::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>

      {/* Map Container */}
      <div
        ref={mapShellRef}
        style={{ height }}
        className={`relative w-full overflow-hidden rounded-lg border-2 ${t.cardBorder} shadow-lg ${mapShellClassName}`}
      >
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            key={resolvedBaseMapType}
            attribution={activeBaseMapConfig.attribution}
            url={activeBaseMapConfig.url}
          />

          {/* Barangay Boundary */}
          <Polygon
            positions={barangayBoundary}
            pathOptions={{
              color: boundaryColor,
              weight: mode === "pin" ? 3 : 2,
              fillColor: fillColor,
              fillOpacity: fillOpacity,
            }}
          />

          {shouldShowPurokDividers &&
            Object.entries(fullCoveragePurokZones).map(([purokName, zone]) => {
              const zoneColor = PUROK_ZONE_COLORS[purokName] || "#10b981";
              const isActiveZone = focusedPurokName === purokName;
              const isMutedZone = focusedPurokName && !isActiveZone;
              const zonePathStyle = useDarkOverlayStyling
                ? {
                    color: zoneColor,
                    weight: isActiveZone ? 3.4 : 1.7,
                    opacity: isMutedZone ? 0.45 : isActiveZone ? 0.98 : 0.92,
                    fillColor: zoneColor,
                    fillOpacity: isMutedZone
                      ? 0.08
                      : isActiveZone
                        ? 0.24
                        : 0.14,
                    lineCap: "round",
                    lineJoin: "round",
                  }
                : {
                    color: zoneColor,
                    weight: isActiveZone ? 2.8 : 1.35,
                    opacity: isMutedZone ? 0.34 : isActiveZone ? 0.96 : 0.68,
                    fillColor: zoneColor,
                    fillOpacity: isMutedZone
                      ? 0.05
                      : isActiveZone
                        ? 0.18
                        : 0.11,
                    lineCap: "round",
                    lineJoin: "round",
                  };

              return (
                <Polygon
                  key={`purok-divider-${purokName}`}
                  positions={zone}
                  pathOptions={zonePathStyle}
                  eventHandlers={
                    enablePurokInteractions
                      ? {
                          click: () => handlePurokSelect(purokName, "zone"),
                        }
                      : undefined
                  }
                />
              );
            })}

          {/* Click Handler for Pin Mode */}
          <ClickHandler
            mode={mode}
            onLocationClick={handleLocationClick}
            onError={handleError}
          />

          {/* Map Controller */}
          <MapController
            mode={mode}
            viewCenter={mapCenter}
            viewZoom={mapZoom}
          />
          <MapInstanceBridge onReady={setLeafletMap} />

          {/* Pin Mode Marker */}
          {mode === "pin" && pinnedLocation && (
            <Marker
              position={pinnedLocation}
              icon={createPinIcon()}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const newPos = [
                    e.target.getLatLng().lat,
                    e.target.getLatLng().lng,
                  ];

                  // Check if new position is within boundary
                  if (isPointInPolygon(newPos, barangayBoundary)) {
                    setPinnedLocation(newPos);
                    reverseGeocode(newPos);
                  } else {
                    // Snap back to previous position
                    e.target.setLatLng(pinnedLocation);
                    handleError(
                      "Marker must be within Barangay Gulod boundaries",
                    );
                  }
                },
              }}
            />
          )}

          {/* View Mode Markers */}
          {mode === "view" &&
            markers.map((marker, index) => (
              <Marker
                key={index}
                position={[marker.lat, marker.lng]}
                icon={createColoredIcon(
                  marker.color || "#3B82F6",
                  getMarkerIconOptions(marker),
                )}
              >
                {marker.data && (
                  <Popup>
                    <div style={{ minWidth: "200px" }}>
                      {marker.data.layerLabel && (
                        <p
                          style={{
                            display: "inline-flex",
                            marginBottom: "8px",
                            borderRadius: "999px",
                            padding: "4px 10px",
                            backgroundColor: `${marker.color}18`,
                            color: marker.color || "#2563eb",
                            fontSize: "11px",
                            fontWeight: 800,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                          }}
                        >
                          {marker.data.layerLabel}
                        </p>
                      )}
                      <h3
                        style={{
                          fontWeight: "bold",
                          marginBottom: "8px",
                          color: "#1f2937",
                        }}
                      >
                        {marker.title}
                      </h3>
                      {marker.data.description && (
                        <p
                          style={{
                            marginBottom: "8px",
                            fontSize: "14px",
                            color: "#4b5563",
                          }}
                        >
                          {marker.data.description}
                        </p>
                      )}
                      {marker.data.address && (
                        <p
                          style={{
                            marginBottom: "8px",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#334155",
                          }}
                        >
                          {marker.data.address}
                        </p>
                      )}
                      {marker.data.schedule && (
                        <p
                          style={{
                            marginBottom: "8px",
                            fontSize: "12px",
                            color: "#64748b",
                          }}
                        >
                          {marker.data.schedule}
                        </p>
                      )}
                      {marker.data.status && (
                        <p
                          style={{
                            marginBottom: "8px",
                            fontSize: "12px",
                            color: "#475569",
                          }}
                        >
                          Status: {marker.data.status}
                        </p>
                      )}
                      {marker.data.severity && (
                        <div style={{ marginTop: "8px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: "600",
                              backgroundColor: `${marker.color}20`,
                              color: marker.color,
                            }}
                          >
                            {marker.data.severity} Severity
                          </span>
                        </div>
                      )}
                      {marker.data.badge && (
                        <p
                          style={{
                            marginTop: "8px",
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#0f766e",
                          }}
                        >
                          {marker.data.badge}
                        </p>
                      )}
                      {marker.data.id && (
                        <p
                          style={{
                            marginTop: "8px",
                            fontSize: "12px",
                            color: "#6b7280",
                          }}
                        >
                          ID: {marker.data.id}
                        </p>
                      )}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "8px",
                          marginTop: "12px",
                        }}
                      >
                        <a
                          href={buildGoogleMapsUrl([marker.lat, marker.lng])}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "999px",
                            padding: "10px 12px",
                            backgroundColor: marker.color || "#2563eb",
                            color: "#ffffff",
                            fontSize: "12px",
                            fontWeight: 800,
                            textDecoration: "none",
                          }}
                        >
                          Open Map
                        </a>
                        <a
                          href={buildGoogleDirectionsUrl([marker.lat, marker.lng])}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "999px",
                            padding: "10px 12px",
                            border: `1px solid ${marker.color || "#2563eb"}30`,
                            color: marker.color || "#2563eb",
                            fontSize: "12px",
                            fontWeight: 800,
                            textDecoration: "none",
                            backgroundColor: "#ffffff",
                          }}
                        >
                          Directions
                        </a>
                      </div>
                    </div>
                  </Popup>
                )}
              </Marker>
            ))}

          {shouldShowPurokDividers &&
            Object.entries(PUROK_CENTERS).map(([purokName, purokMeta]) => {
              const isActiveZone = focusedPurokName === purokName;
              const zoneColor = PUROK_ZONE_COLORS[purokName] || "#10b981";

              return (
                <Marker
                  key={`purok-point-${purokName}`}
                  position={purokMeta.center}
                  icon={createPurokPointIcon(
                    purokName,
                    zoneColor,
                    useDarkOverlayStyling,
                    isActiveZone,
                  )}
                  eventHandlers={
                    enablePurokInteractions
                      ? {
                          click: () => handlePurokSelect(purokName, "marker"),
                        }
                      : undefined
                  }
                />
              );
            })}
        </MapContainer>

        {shouldShowPurokDividers && detailPurokName && connectorLayout ? (
          <svg
            data-testid="purok-connector"
            className="pointer-events-none absolute inset-0 z-[1140] overflow-visible"
            width="100%"
            height="100%"
            viewBox={`0 0 ${mapShellRef.current?.clientWidth || 1} ${mapShellRef.current?.clientHeight || 1}`}
            preserveAspectRatio="none"
          >
            <line
              x1={connectorLayout.startX}
              y1={connectorLayout.startY}
              x2={connectorLayout.endX}
              y2={connectorLayout.endY}
              stroke={selectedZoneColor}
              strokeWidth="2.5"
              strokeOpacity="0.78"
              strokeLinecap="round"
            />
            <circle
              cx={connectorLayout.startX}
              cy={connectorLayout.startY}
              r="6"
              fill={selectedZoneColor}
              stroke="rgba(255,255,255,0.96)"
              strokeWidth="3"
            />
            <circle
              cx={connectorLayout.endX}
              cy={connectorLayout.endY}
              r="5"
              fill={selectedZoneColor}
              stroke="rgba(255,255,255,0.96)"
              strokeWidth="3"
            />
          </svg>
        ) : null}

        {shouldShowPurokDividers && detailPurokName && selectedPurokMeta ? (
          <div className="pointer-events-none absolute inset-y-0 right-3 z-[1150] flex items-start py-6 md:right-5 md:items-center md:py-7">
            <div
              ref={purokPanelRef}
              data-testid="purok-side-panel"
              className="map-purok-panel-scroll pointer-events-auto w-[324px] max-w-[calc(100vw-1rem)] max-h-full overflow-y-auto rounded-[24px] border border-white/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(248,250,252,0.985)_100%)] p-3 shadow-[0_24px_56px_rgba(15,23,42,0.2)] backdrop-blur-xl sm:p-[13px]"
              style={{
                maxHeight: "calc(100% - 8rem)",
              }}
            >
              <p
                style={{
                  marginBottom: "6px",
                  fontSize: "9px",
                  fontWeight: 800,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: selectedZoneColor,
                }}
              >
                Purok Focus
              </p>
              <h3
                style={{
                  fontWeight: "800",
                  marginBottom: "4px",
                  color: "#0f172a",
                  fontSize: "17px",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.05,
                }}
              >
                {detailPurokName}
              </h3>
              {selectedZoneDetails?.title && (
                <p
                  style={{
                    marginBottom: "10px",
                    fontSize: "9px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#64748b",
                  }}
                >
                  {selectedZoneDetails.title}
                </p>
              )}
              <div
                style={{
                  position: "relative",
                  width: `${PUROK_PREVIEW_FRAME_WIDTH}px`,
                  height: `${PUROK_PREVIEW_FRAME_HEIGHT}px`,
                  margin: "0 auto 10px",
                  overflow: "hidden",
                  borderRadius: "16px",
                  background:
                    "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 42%, #bbf7d0 100%)",
                  border: "1px solid rgba(255,255,255,0.75)",
                  boxShadow: "0 12px 22px rgba(15, 23, 42, 0.09)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    transform: `translate(${selectedPreviewLayout.offsetX}px, ${selectedPreviewLayout.offsetY}px)`,
                    width: `${PUROK_PREVIEW_TILE_SIZE * 2}px`,
                    height: `${PUROK_PREVIEW_TILE_SIZE * 2}px`,
                  }}
                >
                  {selectedPreviewLayout.tiles.map((tile) => (
                    <img
                      key={`${detailPurokName}-${tile.key}`}
                      src={buildSatelliteTileUrl(
                        tile.x,
                        tile.y,
                        PUROK_PREVIEW_ZOOM,
                      )}
                      alt={`${detailPurokName} aerial preview`}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      style={{
                        position: "absolute",
                        left: `${tile.left}px`,
                        top: `${tile.top}px`,
                        width: `${PUROK_PREVIEW_TILE_SIZE}px`,
                        height: `${PUROK_PREVIEW_TILE_SIZE}px`,
                        objectFit: "cover",
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(15,23,42,0.02) 0%, rgba(15,23,42,0.16) 100%)",
                  }}
                />
              </div>
              <p
                style={{
                  marginBottom: "0",
                  padding: "10px 12px",
                  borderRadius: "15px",
                  background: "rgba(255,255,255,0.72)",
                  border: "1px solid rgba(226,232,240,0.9)",
                  fontSize: "11px",
                  lineHeight: "1.5",
                  color: "#475569",
                }}
              >
                {selectedZoneDetails?.description ||
                  "Interactive zone point inside the mapped Barangay Gulod purok layout."}
              </p>
              {selectedPurokStats.length ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                    marginTop: "10px",
                    marginBottom: "10px",
                  }}
                >
                  {selectedPurokStats.map((stat) => (
                    <div
                      key={stat.label}
                      style={{
                        borderRadius: "15px",
                        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                        border: "1px solid rgba(226,232,240,0.95)",
                        padding: "10px",
                        boxShadow: "0 6px 14px rgba(15, 23, 42, 0.04)",
                      }}
                    >
                      <p
                        style={{
                          marginBottom: "4px",
                          fontSize: "9px",
                          fontWeight: 800,
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          color: "#64748b",
                        }}
                      >
                        {stat.label}
                      </p>
                      <p
                        style={{
                          marginBottom: "0",
                          fontSize: "12px",
                          fontWeight: 800,
                          lineHeight: "1.3",
                          color: "#0f172a",
                        }}
                      >
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
              {selectedPurokInfoItems.length ? (
                <div
                  style={{
                    display: "grid",
                    gap: "7px",
                    marginBottom: selectedLandmarks.length ? "10px" : "0",
                  }}
                >
                  {selectedPurokInfoItems.map((item) => (
                    <div
                      key={item.label}
                      style={{
                        borderRadius: "15px",
                        padding: "9px 11px",
                        background: "rgba(255,255,255,0.8)",
                        border: "1px solid rgba(226,232,240,0.9)",
                      }}
                    >
                      <p
                        style={{
                          marginBottom: "3px",
                          fontSize: "9px",
                          fontWeight: 800,
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          color: "#64748b",
                        }}
                      >
                        {item.label}
                      </p>
                      <p
                        style={{
                          marginBottom: "0",
                          fontSize: "11px",
                          lineHeight: "1.35",
                          fontWeight: 700,
                          color: "#0f172a",
                        }}
                      >
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
              {selectedLandmarks.length ? (
                <div style={{ marginBottom: "10px" }}>
                  <p
                    style={{
                      marginBottom: "6px",
                      fontSize: "9px",
                      fontWeight: 800,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "#64748b",
                    }}
                  >
                    Landmarks and Highlights
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    {selectedLandmarks.map((landmark) => (
                      <span
                        key={landmark}
                        style={{
                          display: "inline-flex",
                          borderRadius: "999px",
                          padding: "6px 9px",
                          border: `1px solid ${selectedZoneColor}22`,
                          backgroundColor: "#ffffff",
                          color: "#1e3a8a",
                          fontSize: "10px",
                          fontWeight: 700,
                          boxShadow: "0 8px 18px rgba(15, 23, 42, 0.05)",
                        }}
                      >
                        {landmark}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              <div
                style={{
                  display: "grid",
                  gap: "8px",
                  marginTop: "10px",
                }}
              >
                <a
                  href={selectedMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "13px",
                    padding: "10px 12px",
                    background: `linear-gradient(135deg, ${selectedZoneColor} 0%, #0f172a 160%)`,
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    textDecoration: "none",
                    boxShadow: "0 12px 24px rgba(15, 23, 42, 0.18)",
                  }}
                >
                  Open in Google Maps
                </a>
                <a
                  href={selectedDirectionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "13px",
                    padding: "10px 12px",
                    border: "1px solid rgba(203,213,225,0.95)",
                    color: "#0f172a",
                    backgroundColor: "#ffffff",
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    textDecoration: "none",
                  }}
                >
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        ) : null}

        {showMapTypeControl && (
          <div className="pointer-events-none absolute bottom-5 left-4 z-[1200] md:bottom-6 md:left-5">
            <div className="pointer-events-auto flex flex-col items-start gap-2">
              {isMapTypeMenuOpen ? (
                <div className="w-[292px] max-w-[calc(100vw-3rem)] rounded-[28px] border border-slate-200/90 bg-white/96 p-2 shadow-[0_18px_36px_rgba(15,23,42,0.16)] backdrop-blur-sm">
                  {BASE_MAP_TYPE_OPTIONS.map((option) => {
                    const isActive = option.id === resolvedBaseMapType;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setActiveBaseMapType(option.id);
                          setIsMapTypeMenuOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 rounded-[22px] px-3 py-3 text-left transition-all ${
                          isActive
                            ? "bg-slate-900 text-white shadow-[0_10px_24px_rgba(15,23,42,0.14)]"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                        aria-pressed={isActive}
                        data-tile-url={option.url}
                      >
                        <span
                          className={`h-10 w-10 flex-shrink-0 rounded-[14px] border shadow-sm ${
                            isActive ? "border-white/15" : "border-slate-200"
                          }`}
                          style={option.previewStyle}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12px] font-semibold">
                            {option.label}
                          </span>
                          <span
                            className={`block truncate text-[10px] ${
                              isActive ? "text-slate-300" : "text-slate-500"
                            }`}
                          >
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
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-[1000]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-3 text-sm text-gray-600">Loading location...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] max-w-md w-full px-4">
            <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 shadow-lg">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-red-600 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* GPS Button for Pin Mode */}
      {mode === "pin" && !isLoading && (
        <button
          onClick={getCurrentLocation}
          className={`absolute top-3 right-3 ${t.cardBg} p-3 rounded-lg shadow-lg border ${t.cardBorder} hover:shadow-xl transition-all group z-[500]`}
          title="Get current location"
        >
          <svg
            className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      )}

      {/* Selected Address Display for Pin Mode */}
      {mode === "pin" && selectedAddress && (
        <div
          className={`mt-3 p-3 ${t.cardBg} rounded-lg border ${t.cardBorder} shadow-sm`}
        >
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <div className="flex-1">
              <p className={`text-xs font-semibold ${t.subtleText} mb-1`}>
                Selected Location:
              </p>
              <p className={`text-sm ${t.cardText} font-medium`}>
                {selectedAddress}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Outside Boundary Warning */}
      {mode === "pin" && isOutsideBoundary && !pinnedLocation && (
        <div className="mt-3 p-4 rounded-lg border-2 border-amber-500 bg-amber-50">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-900 mb-1">
                Current location is outside Barangay Gulod
              </p>
              <p className="text-xs text-amber-700">
                Your current location could not be pinned automatically because
                you are outside the barangay boundary. Please manually click on
                the map within the highlighted area to pin the incident
                location.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions for Pin Mode */}
      {mode === "pin" && !selectedAddress && !isOutsideBoundary && (
        <div
          className={`mt-3 p-4 ${t.cardBg} rounded-lg border-2 border-blue-500 bg-blue-50`}
        >
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">
                Pin Location within Barangay Gulod
              </p>
              <p className="text-xs text-blue-700">
                Click on the map within the highlighted boundary to pin the
                incident location, or use the GPS button to auto-locate
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
