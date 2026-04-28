import React from "react";
import { render, screen, fireEvent, act, within } from "@testing-library/react";

const mockLeafletMap = {
  setMaxBounds: jest.fn(),
  setMinZoom: jest.fn(),
  setView: jest.fn(),
  latLngToContainerPoint: jest.fn(() => ({ x: 120, y: 140 })),
  on: jest.fn(),
  off: jest.fn(),
};

// ── Mock leaflet before importing the component ──────────────────────────
jest.mock("leaflet", () => {
  const latLngBounds = jest.fn(() => ({
    pad: jest.fn(() => ({ isValid: () => true })),
  }));
  const divIcon = jest.fn(() => ({}));
  const Icon = { Default: { prototype: {}, mergeOptions: jest.fn() } };
  return { latLngBounds, divIcon, Icon };
});

// Mock leaflet.css import (no-op)
jest.mock("leaflet/dist/leaflet.css", () => {});

// ── Mock react-leaflet with stub components ──────────────────────────────
jest.mock("react-leaflet", () => {
  const React = require("react");

  const MapContainer = ({ children }) => (
    <div data-testid="map-container">{children}</div>
  );
  const TileLayer = ({ url }) => <div data-testid="tile-layer" data-url={url} />;
  const Polygon = ({ positions }) => (
    <div data-testid="polygon" data-positions={JSON.stringify(positions)} />
  );
  const Marker = ({ position, children }) => (
    <div data-testid="marker" data-lat={position[0]} data-lng={position[1]}>
      {children}
    </div>
  );
  const Popup = ({ children }) => <div data-testid="popup">{children}</div>;

  // Prefix with "mock" so Jest allows it inside the factory
  const useMapEvents = (handlers) => {
    global.__mapClickHandler__ = handlers.click;
    return null;
  };

  const useMap = () => mockLeafletMap;

  return { MapContainer, TileLayer, Polygon, Marker, Popup, useMapEvents, useMap };
});

import MapComponent from "../../../components/shared/MapComponent";

afterEach(() => {
  delete global.__mapClickHandler__;
  jest.clearAllMocks();
});

const makeMarker = (overrides = {}) => ({
  lat: 14.7118,
  lng: 121.0404,
  title: "Test Incident",
  color: "#EF4444",
  data: {},
  ...overrides,
});

describe("MapComponent", () => {
  describe("rendering", () => {
    it("renders the map container", () => {
      render(<MapComponent />);
      expect(screen.getByTestId("map-container")).toBeInTheDocument();
    });

    it("renders the barangay boundary polygon", () => {
      render(<MapComponent />);
      expect(screen.getByTestId("polygon")).toBeInTheDocument();
    });

    it("renders no markers when markers array is empty", () => {
      render(<MapComponent markers={[]} />);
      expect(screen.queryByTestId("marker")).not.toBeInTheDocument();
    });

    it("renders one marker per entry in the markers array", () => {
      const markers = [
        makeMarker({ lat: 14.711, lng: 121.040 }),
        makeMarker({ lat: 14.712, lng: 121.041 }),
      ];
      render(<MapComponent markers={markers} mode="view" />);
      expect(screen.getAllByTestId("marker")).toHaveLength(2);
    });

    it("renders a popup for each marker in view mode", () => {
      render(<MapComponent markers={[makeMarker()]} mode="view" />);
      expect(screen.getByTestId("popup")).toBeInTheDocument();
    });

    it("shows the marker title inside the popup", () => {
      render(<MapComponent markers={[makeMarker({ title: "Theft Report" })]} mode="view" />);
      expect(screen.getByText("Theft Report")).toBeInTheDocument();
    });

    it("renders clickable purok points and overlays when the purok map is enabled", () => {
      render(<MapComponent mode="view" showPurokDividers />);
      expect(screen.getAllByTestId("marker").length).toBeGreaterThanOrEqual(7);
      expect(screen.queryByTestId("purok-side-panel")).not.toBeInTheDocument();
    });

    it("does not show the side panel from map focus alone", () => {
      render(
        <MapComponent
          mode="view"
          showPurokDividers
          activePurok="Purok 1"
        />,
      );

      expect(screen.queryByTestId("purok-side-panel")).not.toBeInTheDocument();
      expect(screen.queryByTestId("purok-connector")).not.toBeInTheDocument();
    });

    it("shows a fixed right-side panel for a marker-selected purok", () => {
      render(
        <MapComponent
          mode="view"
          showPurokDividers
          activePurok="Purok 1"
          activePurokPanel="Purok 1"
        />,
      );

      const purokPanel = screen.getByTestId("purok-side-panel");
      const mapsLink = within(purokPanel).getByRole("link", {
        name: "Open in Google Maps",
      });

      expect(within(purokPanel).getByText("Purok Focus")).toBeInTheDocument();
      expect(within(purokPanel).getByText("Purok 1")).toBeInTheDocument();
      expect(
        within(purokPanel).getByText(/Covers the upper residential edge of Gulod/i),
      ).toBeInTheDocument();
      expect(mapsLink).toHaveAttribute(
        "href",
        "https://www.google.com/maps/search/?api=1&query=14.7161,121.0412",
      );
      expect(
        within(purokPanel).getAllByAltText("Purok 1 aerial preview"),
      ).toHaveLength(4);
    });

    it("keeps the simplified panel content without extra purok actions", () => {
      render(
        <MapComponent
          mode="view"
          showPurokDividers
          activePurok="Purok 1"
          activePurokPanel="Purok 1"
        />,
      );

      const purokPanel = screen.getByTestId("purok-side-panel");

      expect(within(purokPanel).queryByText("Show all puroks")).not.toBeInTheDocument();
      expect(within(purokPanel).queryByText("Focus this purok")).not.toBeInTheDocument();
      expect(within(purokPanel).queryByText("Selected on map")).not.toBeInTheDocument();
    });

    it("renders a map type control and switches base map layers", () => {
      render(<MapComponent mode="view" tileStyle="light" showMapTypeControl />);

      expect(
        screen.getByRole("button", { name: "Change map type" }),
      ).toBeInTheDocument();
      expect(screen.getByText("Light")).toBeInTheDocument();
      expect(screen.getByTestId("tile-layer")).toHaveAttribute(
        "data-url",
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      );

      fireEvent.click(screen.getByRole("button", { name: "Change map type" }));

      expect(screen.getByText("Clean analytics view")).toBeInTheDocument();
      fireEvent.click(
        screen.getByRole("button", { name: /Satellite Aerial imagery view/i }),
      );

      expect(screen.getByTestId("tile-layer")).toHaveAttribute(
        "data-url",
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      );
      expect(screen.queryByText("Clean analytics view")).not.toBeInTheDocument();
      expect(screen.getByText("Satellite")).toBeInTheDocument();
    });
  });

  describe("pin mode", () => {
    it("renders the map container in pin mode", () => {
      render(<MapComponent mode="pin" onLocationSelect={jest.fn()} />);
      expect(screen.getByTestId("map-container")).toBeInTheDocument();
    });

    it("shows an error message when a click outside the boundary is detected", () => {
      render(<MapComponent mode="pin" onLocationSelect={jest.fn()} />);
      // Simulate a click far outside Barangay Gulod
      act(() => {
        if (global.__mapClickHandler__) {
          global.__mapClickHandler__({ latlng: { lat: 0, lng: 0 } });
        }
      });
      expect(screen.getByText(/please pin a location within barangay gulod/i)).toBeInTheDocument();
    });
  });

  describe("height prop", () => {
    it("applies the height style to the map wrapper", () => {
      const { container } = render(<MapComponent height="500px" />);
      // The map container wrapper uses inline style for height
      const wrapper = container.querySelector('[style*="500px"]');
      expect(wrapper).not.toBeNull();
    });
  });

  describe("view centering", () => {
    it("uses the provided initialCenter in view mode", () => {
      render(
        <MapComponent
          mode="view"
          initialCenter={{ lat: 14.7111, lng: 121.0404 }}
        />,
      );

      expect(mockLeafletMap.setView).toHaveBeenCalledWith(
        [14.7111, 121.0404],
        15,
      );
    });

    it("uses the provided viewZoom in view mode", () => {
      render(
        <MapComponent
          mode="view"
          initialCenter={{ lat: 14.7111, lng: 121.0404 }}
          viewZoom={16}
        />,
      );

      expect(mockLeafletMap.setView).toHaveBeenCalledWith(
        [14.7111, 121.0404],
        16,
      );
    });
  });

  describe("theme support", () => {
    it("renders without error in dark theme", () => {
      render(<MapComponent currentTheme="dark" />);
      expect(screen.getByTestId("map-container")).toBeInTheDocument();
    });

    it("renders without error for unknown theme (falls back to modern)", () => {
      render(<MapComponent currentTheme="unknown" />);
      expect(screen.getByTestId("map-container")).toBeInTheDocument();
    });
  });
});
