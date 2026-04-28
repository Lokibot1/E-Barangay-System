import { useEffect, useMemo, useRef, useState } from "react";
import { MapPinned, Search, X } from "lucide-react";
import MapComponent from "../../components/shared/MapComponent";
import { PUROK_CENTERS } from "../../components/sub-system-1/analytics/analyticsConfig";
import { authService } from "../services/authService";
import {
  HOMEPAGE_MAP_LAYERS,
  HOMEPAGE_MAP_MARKERS,
  HOMEPAGE_PUROK_DETAILS,
  HOMEPAGE_SEARCH_ENTRIES,
} from "../data/homepageMapData";
import ScrollReveal from "./ScrollReveal";

const DEFAULT_MAP_VIEW = {
  id: "all",
  label: "All Puroks",
  center: { lat: 14.7111, lng: 121.0404 },
  zoom: 15,
};

const PUROK_FILTERS = [
  DEFAULT_MAP_VIEW,
  ...Object.entries(PUROK_CENTERS).map(([purokName, purokMeta]) => ({
    id: purokName,
    label: purokName,
    center: { lat: purokMeta.center[0], lng: purokMeta.center[1] },
    zoom: 17,
  })),
];

const normalizeValue = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\bst[.]?\b/g, "street")
    .replace(/\brd[.]?\b/g, "road")
    .replace(/\bave[.]?\b/g, "avenue")
    .replace(/\bbrgy[.]?\b/g, "barangay")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const createSearchSlug = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getPurokLabel = (purok) =>
  purok?.name ||
  purok?.label ||
  purok?.purok_name ||
  (purok?.number ? `Purok ${purok.number}` : null);

const getStreetLabel = (street) =>
  street?.name || street?.street_name || street?.label || null;

const getPurokViewByName = (purokName) =>
  PUROK_FILTERS.find(({ id }) => id === purokName) || DEFAULT_MAP_VIEW;

const getPurokNameByCoordinates = (lat, lng) =>
  Object.entries(PUROK_CENTERS).find(([, meta]) => {
    const [centerLat, centerLng] = meta.center;
    return (
      Math.abs(centerLat - lat) < 0.0035 && Math.abs(centerLng - lng) < 0.0035
    );
  })?.[0] || DEFAULT_MAP_VIEW.id;

const mergeSearchEntries = (entries) => {
  const mergedEntries = new Map();

  entries.forEach((entry) => {
    if (!entry?.label) return;

    const key = [
      normalizeValue(entry.label),
      normalizeValue(entry.type),
      normalizeValue(entry.purokId || DEFAULT_MAP_VIEW.id),
    ].join("::");

    if (!mergedEntries.has(key)) {
      mergedEntries.set(key, {
        ...entry,
        keywords: [...new Set((entry.keywords || []).filter(Boolean))],
      });
      return;
    }

    const existingEntry = mergedEntries.get(key);
    mergedEntries.set(key, {
      ...existingEntry,
      center: existingEntry.center || entry.center,
      zoom: Math.max(existingEntry.zoom || 0, entry.zoom || 0),
      openPanel: existingEntry.openPanel || entry.openPanel,
      keywords: [
        ...new Set([
          ...(existingEntry.keywords || []),
          ...(entry.keywords || []),
        ]),
      ],
    });
  });

  return Array.from(mergedEntries.values());
};

export default function ContactSection({ isDarkMode }) {
  const [activeMapFocus, setActiveMapFocus] = useState(DEFAULT_MAP_VIEW.id);
  const [activeMapPanel, setActiveMapPanel] = useState(null);
  const [mapViewport, setMapViewport] = useState(DEFAULT_MAP_VIEW);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(false);
  const [locationDirectory, setLocationDirectory] = useState({
    puroks: [],
    streets: [],
  });
  const [dynamicSearchEntries, setDynamicSearchEntries] = useState([]);
  const searchWrapperRef = useRef(null);

  const activeMapView = mapViewport || DEFAULT_MAP_VIEW;
  const filteredMarkers = HOMEPAGE_MAP_MARKERS;

  const searchEntries = useMemo(() => {
    const purokNameById = new Map(
      (locationDirectory.puroks || []).map((purok) => [
        String(purok.id),
        getPurokLabel(purok),
      ]),
    );

    const streetEntries = (locationDirectory.streets || []).map((street) => {
      const streetLabel = getStreetLabel(street);
      const purokName = purokNameById.get(String(street.purok_id));
      const purokView = getPurokViewByName(purokName);
      return {
        id: `search-street-${street.id}`,
        label: streetLabel,
        type: "street",
        center: purokView.center,
        zoom: purokView.zoom || 17,
        purokId: purokName || DEFAULT_MAP_VIEW.id,
        openPanel: Boolean(purokName),
        keywords: [
          streetLabel,
          streetLabel ? `${streetLabel} street` : null,
          streetLabel ? `${streetLabel} st` : null,
          purokName,
        ].filter(Boolean),
      };
    });

    const landmarkEntries = Object.entries(HOMEPAGE_PUROK_DETAILS).flatMap(
      ([purokName, details]) => {
        const purokView = getPurokViewByName(purokName);
        return (details.landmarks || []).map((landmark) => ({
          id: `search-landmark-${createSearchSlug(`${purokName}-${landmark}`)}`,
          label: landmark,
          type: "landmark",
          center: purokView.center,
          zoom: purokView.zoom || 17,
          purokId: purokName,
          openPanel: true,
          keywords: [landmark, purokName, ...(details.keywords || [])].filter(
            Boolean,
          ),
        }));
      },
    );

    const addressEntries = HOMEPAGE_MAP_MARKERS.flatMap((marker) => {
      const address = marker.data?.address?.trim();
      if (!address) return [];

      const purokName = getPurokNameByCoordinates(marker.lat, marker.lng);
      return [
        {
          id: `search-address-${marker.id}`,
          label: address,
          type: "location",
          center: { lat: marker.lat, lng: marker.lng },
          zoom: 17,
          purokId: purokName,
          openPanel: purokName !== DEFAULT_MAP_VIEW.id,
          keywords: [
            address,
            marker.title,
            marker.data?.layerLabel,
            marker.data?.badge,
            purokName,
          ].filter(Boolean),
        },
      ];
    });

    return mergeSearchEntries([
      ...HOMEPAGE_SEARCH_ENTRIES,
      ...streetEntries,
      ...landmarkEntries,
      ...addressEntries,
      ...dynamicSearchEntries,
    ]);
  }, [dynamicSearchEntries, locationDirectory.puroks, locationDirectory.streets]);

  const searchResults = useMemo(() => {
    const query = normalizeValue(searchQuery);
    if (!query) return [];

    return searchEntries.map((entry) => {
      const normalizedLabel = normalizeValue(entry.label);
      const normalizedType = normalizeValue(entry.type);
      const normalizedKeywords = (entry.keywords || [])
        .map(normalizeValue)
        .filter(Boolean);
      const searchTerms = [normalizedLabel, normalizedType, ...normalizedKeywords];
      const haystack = searchTerms.join(" ");
      const queryTokens = query.split(" ").filter(Boolean);
      const startsWith = normalizedLabel.startsWith(query);
      const includes = haystack.includes(query);
      const tokenMatch = queryTokens.every((token) =>
        searchTerms.some((term) => term.includes(token)),
      );
      const exactLabelMatch = normalizedLabel === query;
      const keywordStartsWith = normalizedKeywords.some((term) =>
        term.startsWith(query),
      );

      return {
        ...entry,
        matched: includes || tokenMatch,
        score: exactLabelMatch
          ? 5
          : startsWith
            ? 4
            : keywordStartsWith
              ? 3
              : includes
                ? 2
                : tokenMatch
                  ? 1
                  : 0,
      };
    })
      .filter((entry) => entry.matched)
      .sort((left, right) => right.score - left.score)
      .slice(0, 12);
  }, [searchEntries, searchQuery]);

  const handlePurokSelection = (purokName, details = {}) => {
    const nextView =
      PUROK_FILTERS.find(({ id }) => id === purokName) || DEFAULT_MAP_VIEW;

    setActiveMapFocus(purokName);
    setActiveMapPanel(details.source === "marker" ? purokName : null);
    setMapViewport(nextView);
  };

  const handleSearchSelect = (entry) => {
    const nextView = {
      id: entry.id,
      label: entry.label,
      center: entry.center,
      zoom: entry.zoom || 17,
    };

    setMapViewport(nextView);
    setActiveMapFocus(entry.purokId || DEFAULT_MAP_VIEW.id);
    setActiveMapPanel(entry.openPanel ? entry.purokId : null);
    setSearchQuery(entry.label);
    setIsSearchResultsOpen(false);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchResults[0]) {
      handleSearchSelect(searchResults[0]);
    }
  };

  useEffect(() => {
    if (!isSearchResultsOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!searchWrapperRef.current?.contains(event.target)) {
        setIsSearchResultsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsSearchResultsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isSearchResultsOpen]);

  useEffect(() => {
    let isMounted = true;

    const loadLocationDirectory = async () => {
      const response = await authService.getLocations();
      if (!isMounted || !response?.success) return;

      setLocationDirectory({
        puroks: (response.puroks || []).map((purok) => ({
          ...purok,
          id: String(purok.id),
        })),
        streets: (response.streets || []).map((street) => ({
          ...street,
          id: String(street.id),
          purok_id: street.purok_id ? String(street.purok_id) : null,
        })),
      });
    };

    loadLocationDirectory();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery.length < 2) {
      setDynamicSearchEntries([]);
      return undefined;
    }

    let isActive = true;
    const purokNameById = new Map(
      (locationDirectory.puroks || []).map((purok) => [
        String(purok.id),
        getPurokLabel(purok),
      ]),
    );

    const timer = setTimeout(async () => {
      try {
        const response = await authService.searchAddresses(trimmedQuery);
        if (!isActive) return;

        const addressRows = Array.isArray(response?.data) ? response.data : [];
        const liveEntries = mergeSearchEntries(
          addressRows.flatMap((addressRow) => {
            const streetLabel = getStreetLabel(addressRow);
            const purokName =
              purokNameById.get(String(addressRow.purok_id)) ||
              DEFAULT_MAP_VIEW.id;
            const purokView = getPurokViewByName(purokName);

            if (!streetLabel) return [];

            const entries = [
              {
                id: `search-live-street-${
                  addressRow.street_id ||
                  createSearchSlug(`${purokName}-${streetLabel}`)
                }`,
                label: streetLabel,
                type: "street",
                center: purokView.center,
                zoom: purokView.zoom || 17,
                purokId: purokName,
                openPanel: purokName !== DEFAULT_MAP_VIEW.id,
                keywords: [
                  streetLabel,
                  `${streetLabel} street`,
                  `${streetLabel} st`,
                  purokName,
                ].filter(Boolean),
              },
            ];

            if (addressRow.house_number) {
              entries.push({
                id: `search-live-address-${
                  addressRow.street_id ||
                  createSearchSlug(
                    `${purokName}-${addressRow.house_number}-${streetLabel}`,
                  )
                }-${addressRow.house_number}`,
                label: `${addressRow.house_number} ${streetLabel}`,
                type: "location",
                center: purokView.center,
                zoom: purokView.zoom || 17,
                purokId: purokName,
                openPanel: purokName !== DEFAULT_MAP_VIEW.id,
                keywords: [addressRow.house_number, streetLabel, purokName].filter(
                  Boolean,
                ),
              });
            }

            return entries;
          }),
        );

        setDynamicSearchEntries(liveEntries);
      } catch {
        if (isActive) {
          setDynamicSearchEntries([]);
        }
      }
    }, 220);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [locationDirectory.puroks, searchQuery]);

  return (
    <section
      id="contact"
      className="relative overflow-hidden px-6 py-14 scroll-mt-24 md:py-20"
    >
      <div className="relative mx-auto max-w-7xl">
        <ScrollReveal className="mx-auto max-w-3xl text-center">
          <h2 className="mb-3 text-[8px] font-black uppercase tracking-[0.28em] text-emerald-600 md:text-[9px]">
            Official Map
          </h2>
          <h3 className="text-3xl font-black uppercase tracking-tighter md:text-4xl">
            Barangay Gulod Map
          </h3>
        </ScrollReveal>

        <ScrollReveal delay={120} className="mt-10">
          <div
            className={`relative overflow-hidden rounded-[34px] border shadow-[0_28px_80px_-36px_rgba(15,23,42,0.45)] ${
              isDarkMode
                ? "border-white/10 bg-slate-950/70"
                : "border-emerald-200/60 bg-white/70"
            }`}
          >
            <div
              className={`pointer-events-none absolute -left-10 top-16 h-36 w-36 rounded-full blur-3xl ${
                isDarkMode ? "bg-teal-400/15" : "bg-teal-200/70"
              }`}
            />

            <div className="pointer-events-none absolute left-1/2 top-4 z-[1180] w-[calc(100%-2rem)] max-w-[24rem] -translate-x-1/2 md:top-6">
              <div ref={searchWrapperRef} className="pointer-events-auto mx-auto w-full">
                <form onSubmit={handleSearchSubmit}>
                  <div
                    className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-left shadow-[0_18px_36px_rgba(15,23,42,0.14)] backdrop-blur-xl ${
                      isDarkMode
                        ? "border-white/10 bg-slate-950/84 text-white"
                        : "border-white/80 bg-white/92 text-slate-900"
                    }`}
                  >
                    <Search className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                    <input
                      value={searchQuery}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        setSearchQuery(nextValue);
                        setIsSearchResultsOpen(nextValue.trim().length > 0);
                      }}
                      onFocus={() => {
                        if (searchQuery.trim()) {
                          setIsSearchResultsOpen(true);
                        }
                      }}
                      type="text"
                      placeholder="Search purok, street, or landmark"
                      className={`min-w-0 flex-1 bg-transparent text-[13px] font-normal placeholder:font-normal outline-none ${
                        isDarkMode
                          ? "placeholder:text-white/35"
                          : "placeholder:text-slate-400"
                      }`}
                    />
                    {searchQuery ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setIsSearchResultsOpen(false);
                        }}
                        className={`rounded-full p-1 ${
                          isDarkMode
                            ? "text-white/55 hover:bg-white/10"
                            : "text-slate-400 hover:bg-slate-100"
                        }`}
                        aria-label="Clear map search"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    ) : null}
                  </div>
                </form>

                {isSearchResultsOpen ? (
                  <div
                    className={`animate-map-results-reveal mt-3 overflow-hidden rounded-[24px] border shadow-[0_18px_36px_rgba(15,23,42,0.14)] backdrop-blur-xl ${
                      isDarkMode
                        ? "border-white/10 bg-slate-950/88"
                        : "border-white/80 bg-white/94"
                    }`}
                  >
                    {searchResults.length ? (
                      <div className="p-2">
                        {searchResults.map((entry) => (
                          <button
                            key={entry.id}
                            type="button"
                            onClick={() => handleSearchSelect(entry)}
                            className={`flex w-full items-center justify-between gap-3 rounded-[16px] px-4 py-3 text-left transition-colors ${
                              isDarkMode
                                ? "hover:bg-white/10"
                                : "hover:bg-slate-50"
                            }`}
                          >
                            <span className="min-w-0">
                              <span
                                className={`block truncate text-sm font-bold ${
                                  isDarkMode ? "text-white" : "text-slate-900"
                                }`}
                              >
                                {entry.label}
                              </span>
                              <span
                                className={`mt-1 block truncate text-[10px] font-black uppercase tracking-[0.16em] ${
                                  isDarkMode
                                    ? "text-white/50"
                                    : "text-slate-500"
                                }`}
                              >
                                {entry.purokId && entry.purokId !== DEFAULT_MAP_VIEW.id
                                  ? `${entry.type} • ${entry.purokId}`
                                  : entry.type}
                              </span>
                            </span>
                            <MapPinned className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-5 py-4">
                        <p
                          className={`text-sm font-semibold ${
                            isDarkMode ? "text-white/75" : "text-slate-700"
                          }`}
                        >
                          No matching location found.
                        </p>
                        <p
                          className={`mt-1 text-xs ${
                            isDarkMode ? "text-white/45" : "text-slate-500"
                          }`}
                        >
                          Try a purok name, street, or landmark inside Barangay Gulod.
                        </p>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            <MapComponent
              mode="view"
              markers={filteredMarkers}
              initialCenter={activeMapView.center}
              viewZoom={activeMapView.zoom}
              currentTheme={isDarkMode ? "dark" : "modern"}
              tileStyle={isDarkMode ? "dark" : "light"}
              height="clamp(455px, 55vw, 575px)"
              mapShellClassName="homepage-map-shell rounded-[34px] border-0 shadow-none"
              showPurokDividers
              showMapTypeControl
              activePurok={activeMapFocus}
              activePurokPanel={activeMapPanel}
              enablePurokInteractions
              onPurokSelect={handlePurokSelection}
              purokDetails={HOMEPAGE_PUROK_DETAILS}
            />

            <div
              className={`pointer-events-none absolute inset-x-0 bottom-0 z-[1100] bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent px-5 pb-4 pt-10 transition-all duration-300 md:px-6 md:pb-5 md:pt-12 ${
                activeMapPanel ? "opacity-0 md:opacity-100" : "opacity-100"
              }`}
            >
              <div className="flex justify-center">
                <div className="mx-auto max-w-4xl text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">
                    Multi-Layer Community Map
                  </p>
                  <h4 className="mt-2 text-xl font-black uppercase tracking-tight text-white md:text-2xl">
                    Search puroks, switch layers, and open directions in one view
                  </h4>
                  <p className="mt-2 text-xs leading-5 text-white/70 md:text-sm">
                    Use the search panel for puroks, streets, and landmarks.
                    Toggle service, emergency, event, and incident overlays, then
                    tap a purok number to open the detailed card on the map's right side.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`mt-5 rounded-[28px] border p-5 md:p-6 ${
              isDarkMode
                ? "border-white/10 bg-slate-950/70"
                : "border-emerald-200/60 bg-white/80 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.22)]"
            }`}
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">
                  Map Legend
                </p>
                <h4 className="mt-1 text-lg font-black uppercase tracking-tight md:text-xl">
                  Marker Guide
                </h4>
              </div>
              <p
                className={`text-xs md:max-w-md md:text-right ${
                  isDarkMode ? "text-white/60" : "text-slate-500"
                }`}
              >
                Each color group shows a different set of locations on the
                barangay map.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {HOMEPAGE_MAP_LAYERS.map((layer) => (
                <div
                  key={layer.id}
                  className={`rounded-[18px] border px-4 py-3 ${
                    isDarkMode
                      ? "border-white/10 bg-white/5"
                      : "border-black/5 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3.5 w-3.5 rounded-full"
                      style={{ backgroundColor: layer.color }}
                    />
                    <span className="text-sm font-bold">{layer.label}</span>
                  </div>
                  <p
                    className={`mt-2 text-[11px] leading-5 ${
                      isDarkMode ? "text-white/60" : "text-slate-500"
                    }`}
                  >
                    {layer.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            #contact .homepage-map-shell .leaflet-control-zoom {
              border: 0;
              box-shadow: 0 14px 32px rgba(15, 23, 42, 0.18);
            }

            #contact .homepage-map-shell .leaflet-control-zoom a {
              width: 38px;
              height: 38px;
              line-height: 38px;
              border: 0;
              background: rgba(255, 255, 255, 0.94);
              color: #0f172a;
            }

            #contact .homepage-map-shell .leaflet-control-zoom a:first-child {
              border-top-left-radius: 14px;
              border-top-right-radius: 14px;
            }

            #contact .homepage-map-shell .leaflet-control-zoom a:last-child {
              border-bottom-left-radius: 14px;
              border-bottom-right-radius: 14px;
            }

            #contact .homepage-map-shell .leaflet-popup-content-wrapper {
              border-radius: 18px;
              box-shadow: 0 24px 45px rgba(15, 23, 42, 0.22);
            }

            #contact .homepage-map-shell .leaflet-popup-content {
              margin: 14px 16px;
            }

            @keyframes mapResultsReveal {
              0% {
                opacity: 0;
                transform: translateY(-6px);
              }
              100% {
                opacity: 1;
                transform: translateY(0);
              }
            }

            #contact .animate-map-results-reveal {
              animation: mapResultsReveal 220ms cubic-bezier(0.16, 1, 0.3, 1);
            }
          `,
        }}
      />
    </section>
  );
}
