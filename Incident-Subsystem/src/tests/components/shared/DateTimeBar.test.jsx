import React from "react";
import { render, screen } from "@testing-library/react";
import DateTimeBar from "../../../components/shared/DateTimeBar";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

describe("DateTimeBar", () => {
  describe("date display", () => {
    it("renders the current month name", () => {
      render(<DateTimeBar currentTheme="blue" />);
      const currentMonth = MONTHS[new Date().getMonth()];
      // At least one element contains the month name
      expect(screen.getAllByText(new RegExp(currentMonth, "i")).length).toBeGreaterThan(0);
    });

    it("renders the current year", () => {
      render(<DateTimeBar currentTheme="blue" />);
      const year = String(new Date().getFullYear());
      expect(screen.getAllByText(new RegExp(year)).length).toBeGreaterThan(0);
    });
  });

  describe("time display", () => {
    it("renders a time string with AM or PM", () => {
      render(<DateTimeBar currentTheme="blue" />);
      expect(screen.getByText(/\b(AM|PM)\b/)).toBeInTheDocument();
    });
  });

  describe("theme support", () => {
    it("renders without error for all valid themes", () => {
      ["blue", "green", "purple", "dark", "modern"].forEach((theme) => {
        const { unmount } = render(<DateTimeBar currentTheme={theme} />);
        unmount();
      });
    });
  });
});
