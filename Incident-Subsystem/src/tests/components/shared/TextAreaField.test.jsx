import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TextAreaField from "../../../components/shared/TextAreaField";

const defaults = {
  label: "Description",
  value: "",
  onChange: jest.fn(),
  currentTheme: "blue",
};

beforeEach(() => jest.resetAllMocks());

describe("TextAreaField", () => {
  describe("label", () => {
    it("renders the label text", () => {
      render(<TextAreaField {...defaults} />);
      expect(screen.getByText("Description")).toBeInTheDocument();
    });

    it("shows an asterisk when required=true", () => {
      render(<TextAreaField {...defaults} required />);
      expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("does not show an asterisk when required=false", () => {
      render(<TextAreaField {...defaults} />);
      expect(screen.queryByText("*")).not.toBeInTheDocument();
    });
  });

  describe("textarea behaviour", () => {
    it("renders with the provided value", () => {
      render(<TextAreaField {...defaults} value="Hello world" />);
      expect(screen.getByRole("textbox")).toHaveValue("Hello world");
    });

    it("renders the placeholder", () => {
      render(<TextAreaField {...defaults} placeholder="Describe the incident..." />);
      expect(screen.getByPlaceholderText("Describe the incident...")).toBeInTheDocument();
    });

    it("applies the rows prop to the textarea", () => {
      render(<TextAreaField {...defaults} rows={6} />);
      expect(screen.getByRole("textbox")).toHaveAttribute("rows", "6");
    });

    it("uses 4 rows by default", () => {
      render(<TextAreaField {...defaults} />);
      expect(screen.getByRole("textbox")).toHaveAttribute("rows", "4");
    });

    it("calls onChange when the user types", () => {
      const onChange = jest.fn();
      render(<TextAreaField {...defaults} onChange={onChange} />);
      fireEvent.change(screen.getByRole("textbox"), { target: { value: "new text" } });
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });

  describe("icon", () => {
    it("renders an SVG icon when icon prop is provided", () => {
      render(<TextAreaField {...defaults} icon="M12 4v16m8-8H4" />);
      expect(document.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("shows error message when error prop is provided", () => {
      render(<TextAreaField {...defaults} error="Description is required" />);
      expect(screen.getByText("Description is required")).toBeInTheDocument();
    });

    it("does not show error message when error is absent", () => {
      render(<TextAreaField {...defaults} />);
      expect(screen.queryByText("Description is required")).not.toBeInTheDocument();
    });
  });

  describe("theme fallback", () => {
    it("falls back to modern theme for unknown currentTheme", () => {
      render(<TextAreaField {...defaults} currentTheme="unknown" />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });
  });
});
