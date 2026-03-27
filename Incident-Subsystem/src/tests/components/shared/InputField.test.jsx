import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import InputField from "../../../components/shared/InputField";

const defaults = {
  label: "Email",
  value: "",
  onChange: jest.fn(),
  currentTheme: "blue",
};

beforeEach(() => jest.resetAllMocks());

describe("InputField", () => {
  describe("label", () => {
    it("renders the label text", () => {
      render(<InputField {...defaults} />);
      expect(screen.getByText("Email")).toBeInTheDocument();
    });

    it("shows an asterisk when required=true", () => {
      render(<InputField {...defaults} required />);
      expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("does not show an asterisk when required=false", () => {
      render(<InputField {...defaults} />);
      expect(screen.queryByText("*")).not.toBeInTheDocument();
    });
  });

  describe("input behaviour", () => {
    it("renders the input with the provided value", () => {
      render(<InputField {...defaults} value="test@email.com" />);
      expect(screen.getByRole("textbox")).toHaveValue("test@email.com");
    });

    it("renders placeholder text", () => {
      render(<InputField {...defaults} placeholder="Enter email" />);
      expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
    });

    it("calls onChange when the user types", () => {
      const onChange = jest.fn();
      render(<InputField {...defaults} onChange={onChange} />);
      fireEvent.change(screen.getByRole("textbox"), { target: { value: "hello" } });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("renders a password input when type='password'", () => {
      render(<InputField {...defaults} label="Password" type="password" />);
      expect(document.querySelector("input[type='password']")).toBeInTheDocument();
    });
  });

  describe("icon", () => {
    it("renders an SVG icon when icon prop is provided", () => {
      render(<InputField {...defaults} icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8" />);
      expect(document.querySelector("svg")).toBeInTheDocument();
    });

    it("does not render an icon wrapper when icon is absent", () => {
      const { container } = render(<InputField {...defaults} />);
      // Only the error SVG would be present if there's an error — with no error and no icon, no SVG
      expect(container.querySelector(".absolute svg")).not.toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("shows the error message when error prop is provided", () => {
      render(<InputField {...defaults} error="This field is required" />);
      expect(screen.getByText("This field is required")).toBeInTheDocument();
    });

    it("does not show error message when error prop is absent", () => {
      render(<InputField {...defaults} />);
      expect(screen.queryByText("This field is required")).not.toBeInTheDocument();
    });
  });

  describe("theme fallback", () => {
    it("falls back to modern theme for unknown currentTheme", () => {
      render(<InputField {...defaults} currentTheme="unknown" />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });
  });
});
