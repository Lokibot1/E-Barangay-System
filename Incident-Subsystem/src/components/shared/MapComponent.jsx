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

// Barangay San Bartolome boundary coordinates
const barangayBoundary = [
  [14.735, 121.035],
  [14.735, 121.065],
  [14.715, 121.065],
  [14.7, 121.055],
  [14.695, 121.045],
  [14.695, 121.035],
  [14.71, 121.03],
  [14.725, 121.03],
];

// Barangay San Bartolome center
const barangayCenter = [14.715, 121.0475];

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
            "Please pin a location within Barangay San Bartolome boundaries",
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
            "Your location is outside Barangay San Bartolome. Please pin manually.",
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
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = [position.coords.latitude, position.coords.longitude];

          // Check if GPS location is within barangay boundary
          if (isPointInPolygon(pos, barangayBoundary)) {
            setPinnedLocation(pos);
            reverseGeocode(pos);
          }
        },
        (error) => {
          console.warn("GPS location error:", error);
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
                      "Marker must be within Barangay San Bartolome boundaries",
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

      {/* Instructions for Pin Mode */}
      {mode === "pin" && !selectedAddress && (
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
                Pin Location within Barangay San Bartolome
              </p>
              <p className="text-xs text-blue-700">
                📍 Click on the map within the highlighted boundary to pin the
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
