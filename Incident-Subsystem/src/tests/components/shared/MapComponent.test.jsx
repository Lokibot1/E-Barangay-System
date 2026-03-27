import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";

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
  const TileLayer = () => null;
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

  const useMap = () => ({
    setMaxBounds: jest.fn(),
    setMinZoom: jest.fn(),
    setView: jest.fn(),
  });

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
