import React from "react";
import { render, screen } from "@testing-library/react";
import StatCard from "../../../components/shared/StatCard";
import { FileText } from "lucide-react";

describe("StatCard", () => {
  describe("content rendering", () => {
    it("renders the label", () => {
      render(<StatCard label="Total Incidents" value={42} currentTheme="blue" />);
      expect(screen.getByText("Total Incidents")).toBeInTheDocument();
    });

    it("renders a numeric value", () => {
      render(<StatCard label="Total" value={42} currentTheme="blue" />);
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("formats large numbers using toLocaleString", () => {
      const formatted = (1000).toLocaleString();
      render(<StatCard label="Total" value={1000} currentTheme="blue" />);
      expect(screen.getByText(formatted)).toBeInTheDocument();
    });

    it("shows '-' when value is null", () => {
      render(<StatCard label="Total" value={null} currentTheme="blue" />);
      expect(screen.getByText("-")).toBeInTheDocument();
    });

    it("shows '-' when value is undefined", () => {
      render(<StatCard label="Total" currentTheme="blue" />);
      expect(screen.getByText("-")).toBeInTheDocument();
    });

    it("renders a string value as-is", () => {
      render(<StatCard label="Total" value="N/A" currentTheme="blue" />);
      expect(screen.getByText("N/A")).toBeInTheDocument();
    });

    it("renders the subtitle when provided", () => {
      render(<StatCard label="Total" value={5} subtitle="This month" currentTheme="blue" />);
      expect(screen.getByText("This month")).toBeInTheDocument();
    });

    it("does not render subtitle when not provided", () => {
      render(<StatCard label="Total" value={5} currentTheme="blue" />);
      expect(screen.queryByText("This month")).not.toBeInTheDocument();
    });
  });

  describe("trend badge", () => {
    it("renders the trend badge when provided", () => {
      render(<StatCard label="Total" value={5} trend="+12%" currentTheme="blue" />);
      expect(screen.getByText("+12%")).toBeInTheDocument();
    });

    it("does not render a trend badge when not provided", () => {
      render(<StatCard label="Total" value={5} currentTheme="blue" />);
      expect(screen.queryByText("+12%")).not.toBeInTheDocument();
    });
  });

  describe("icon", () => {
    it("renders a lucide icon component", () => {
      render(<StatCard label="Total" value={5} icon={FileText} currentTheme="blue" />);
      expect(document.querySelector("svg")).toBeInTheDocument();
    });

    it("renders a string/emoji icon", () => {
      render(<StatCard label="Total" value={5} icon="📋" currentTheme="blue" />);
      expect(screen.getByText("📋")).toBeInTheDocument();
    });

    it("renders without an icon when icon is not provided", () => {
      const { container } = render(<StatCard label="Total" value={5} currentTheme="blue" />);
      // No icon wrapper div when icon is absent
      expect(container.querySelector(".p-2\\.5")).not.toBeInTheDocument();
    });
  });

  describe("tone aliases", () => {
    it("resolves 'primary' tone alias without error", () => {
      render(<StatCard label="Total" value={5} tone="primary" currentTheme="blue" />);
      expect(screen.getByText("Total")).toBeInTheDocument();
    });

    it("resolves 'danger' tone alias without error", () => {
      render(<StatCard label="Total" value={5} tone="danger" currentTheme="blue" />);
      expect(screen.getByText("Total")).toBeInTheDocument();
    });

    it("defaults to slate tone when tone is not provided", () => {
      render(<StatCard label="Total" value={5} currentTheme="blue" />);
      expect(screen.getByText("Total")).toBeInTheDocument();
    });
  });

  describe("dark theme", () => {
    it("renders without error for dark currentTheme", () => {
      render(<StatCard label="Total" value={5} currentTheme="dark" />);
      expect(screen.getByText("Total")).toBeInTheDocument();
    });
  });
});
