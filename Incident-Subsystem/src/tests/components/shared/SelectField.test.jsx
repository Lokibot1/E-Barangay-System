import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SelectField from "../../../components/shared/SelectField";

const OPTIONS = [
  { value: "a", label: "Option A" },
  { value: "b", label: "Option B" },
  { value: "c", label: "Option C" },
];

const defaults = {
  label: "Category",
  value: "a",
  onChange: jest.fn(),
  options: OPTIONS,
  currentTheme: "blue",
};

beforeEach(() => jest.resetAllMocks());

describe("SelectField", () => {
  describe("label", () => {
    it("renders the label text", () => {
      render(<SelectField {...defaults} />);
      expect(screen.getByText("Category")).toBeInTheDocument();
    });

    it("shows an asterisk when required=true", () => {
      render(<SelectField {...defaults} required />);
      expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("does not show an asterisk when required=false", () => {
      render(<SelectField {...defaults} />);
      expect(screen.queryByText("*")).not.toBeInTheDocument();
    });
  });

  describe("options", () => {
    it("renders all provided options", () => {
      render(<SelectField {...defaults} />);
      expect(screen.getByRole("option", { name: "Option A" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Option B" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Option C" })).toBeInTheDocument();
    });

    it("renders exactly as many options as provided", () => {
      render(<SelectField {...defaults} />);
      expect(screen.getAllByRole("option")).toHaveLength(OPTIONS.length);
    });

    it("reflects the selected value", () => {
      render(<SelectField {...defaults} value="b" />);
      expect(screen.getByRole("combobox")).toHaveValue("b");
    });
  });

  describe("interaction", () => {
    it("calls onChange when a different option is selected", () => {
      const onChange = jest.fn();
      render(<SelectField {...defaults} onChange={onChange} />);
      fireEvent.change(screen.getByRole("combobox"), { target: { value: "b" } });
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });

  describe("icon", () => {
    it("renders an icon SVG when icon prop is provided", () => {
      render(<SelectField {...defaults} icon="M12 4v16m8-8H4" />);
      expect(document.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("shows error message when error prop is provided", () => {
      render(<SelectField {...defaults} error="Please select an option" />);
      expect(screen.getByText("Please select an option")).toBeInTheDocument();
    });

    it("does not show error when error prop is absent", () => {
      render(<SelectField {...defaults} />);
      expect(screen.queryByText("Please select an option")).not.toBeInTheDocument();
    });
  });

  describe("theme fallback", () => {
    it("falls back to modern theme for unknown currentTheme", () => {
      render(<SelectField {...defaults} currentTheme="unknown" />);
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });
});
