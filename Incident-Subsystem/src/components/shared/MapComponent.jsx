import React, { useState, useEffect, useRef } from "react";
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
const createColoredIcon = (color) => {
  return L.divIcon({
    className: "custom-colored-marker",
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
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
          onError(
            "Please pin a location within Barangay Gulod boundaries",
          );
        }
      }
    },
  });
  return null;
}

// Component to set map bounds and fit markers
function MapController({ mode, markers }) {
  const map = useMap();

  useEffect(() => {
    if (mode === "pin") {
      // Set max bounds for pin mode
      const bounds = L.latLngBounds(barangayBoundary);
      map.setMaxBounds(bounds.pad(0.5));
    }
  }, [mode, map]);

  useEffect(() => {
    if (mode === "view" && markers && markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [mode, markers, map]);

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
 */
const MapComponent = ({
  mode = "view",
  markers = [],
  onLocationSelect,
  initialCenter = { lat: 14.676, lng: 121.0437 },
  initialZoom = 13,
  currentTheme = "blue",
  enableGPS = true,
  height = "400px",
}) => {
  const [pinnedLocation, setPinnedLocation] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOutsideBoundary, setIsOutsideBoundary] = useState(false);
  const t = themeTokens[currentTheme] || themeTokens.blue;

  // Use barangay center for pin mode, otherwise use provided center
  const mapCenter =
    mode === "pin" ? barangayCenter : [initialCenter.lat, initialCenter.lng];
  const mapZoom = mode === "pin" ? 15 : initialZoom;

  // Reverse geocode to get address
  const reverseGeocode = async (position) => {
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
  };

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
  }, [mode, enableGPS]);

  const boundaryColor = mode === "pin" ? "#2563EB" : "#10B981";
  const fillColor = mode === "pin" ? "#3B82F6" : "#34D399";
  const fillOpacity = mode === "pin" ? 0.15 : 0.1;

  return (
    <div className="relative">
      {/* Map Container */}
      <div
        style={{ height }}
        className={`w-full rounded-lg border-2 ${t.cardBorder} shadow-lg overflow-hidden relative`}
      >
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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

          {/* Click Handler for Pin Mode */}
          <ClickHandler
            mode={mode}
            onLocationClick={handleLocationClick}
            onError={handleError}
          />

          {/* Map Controller */}
          <MapController mode={mode} markers={markers} />

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
                icon={createColoredIcon(marker.color || "#3B82F6")}
              >
                {marker.data && (
                  <Popup>
                    <div style={{ minWidth: "200px" }}>
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
                    </div>
                  </Popup>
                )}
              </Marker>
            ))}
        </MapContainer>

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
        <div
          className="mt-3 p-4 rounded-lg border-2 border-amber-500 bg-amber-50"
        >
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
                Your current location could not be pinned automatically because you are outside the barangay boundary. Please manually click on the map within the highlighted area to pin the incident location.
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
