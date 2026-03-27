import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ModernSelectField from "../../../components/shared/ModernSelectField";

const OPTIONS = [
  { value: "opt1", label: "Option 1" },
  { value: "opt2", label: "Option 2" },
  { value: "opt3", label: "Option 3" },
];

describe("ModernSelectField", () => {
  describe("initial state", () => {
    it("shows placeholder when no value is selected", () => {
      render(
        <ModernSelectField options={OPTIONS} value="" onChange={jest.fn()} placeholder="Choose one" />
      );
      expect(screen.getByText("Choose one")).toBeInTheDocument();
    });

    it("shows the selected option label when a value is set", () => {
      render(
        <ModernSelectField options={OPTIONS} value="opt2" onChange={jest.fn()} placeholder="Choose" />
      );
      expect(screen.getByText("Option 2")).toBeInTheDocument();
    });

    it("does not render dropdown options initially", () => {
      render(
        <ModernSelectField options={OPTIONS} value="" onChange={jest.fn()} placeholder="Choose" />
      );
      expect(screen.queryByRole("option")).not.toBeInTheDocument();
    });

    it("sets aria-expanded=false on the trigger initially", () => {
      render(
        <ModernSelectField options={OPTIONS} value="" onChange={jest.fn()} placeholder="Choose" />
      );
      expect(screen.getByRole("button", { name: "Choose" })).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("opening the dropdown", () => {
    it("shows all options when the trigger is clicked", () => {
      render(
        <ModernSelectField options={OPTIONS} value="" onChange={jest.fn()} placeholder="Choose" />
      );
      fireEvent.click(screen.getByRole("button", { name: "Choose" }));
      expect(screen.getByText("Option 1")).toBeInTheDocument();
      expect(screen.getByText("Option 2")).toBeInTheDocument();
      expect(screen.getByText("Option 3")).toBeInTheDocument();
    });

    it("sets aria-expanded=true when open", () => {
      render(
        <ModernSelectField options={OPTIONS} value="" onChange={jest.fn()} placeholder="Choose" />
      );
      const trigger = screen.getByRole("button", { name: "Choose" });
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("selecting an option", () => {
    it("calls onChange with the option value when an option is clicked", () => {
      const onChange = jest.fn();
      render(
        <ModernSelectField options={OPTIONS} value="" onChange={onChange} placeholder="Choose" />
      );
      fireEvent.click(screen.getByRole("button", { name: "Choose" }));
      fireEvent.click(screen.getByRole("option", { name: "Option 1" }));
      expect(onChange).toHaveBeenCalledWith("opt1");
    });

    it("closes the dropdown after an option is selected", () => {
      render(
        <ModernSelectField options={OPTIONS} value="" onChange={jest.fn()} placeholder="Choose" />
      );
      fireEvent.click(screen.getByRole("button", { name: "Choose" }));
      fireEvent.click(screen.getByRole("option", { name: "Option 1" }));
      expect(screen.queryByRole("option")).not.toBeInTheDocument();
    });

    it("marks the currently selected option with aria-selected=true", () => {
      render(
        <ModernSelectField options={OPTIONS} value="opt2" onChange={jest.fn()} placeholder="Choose" />
      );
      // The trigger's aria-label remains the placeholder, open it to see options
      fireEvent.click(screen.getByRole("button", { name: "Choose" }));
      expect(screen.getByRole("option", { name: "Option 2" })).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("keyboard interaction", () => {
    it("closes the dropdown when Escape is pressed", () => {
      render(
        <ModernSelectField options={OPTIONS} value="" onChange={jest.fn()} placeholder="Choose" />
      );
      fireEvent.click(screen.getByRole("button", { name: "Choose" }));
      expect(screen.getByText("Option 1")).toBeInTheDocument();
      fireEvent.keyDown(document, { key: "Escape" });
      expect(screen.queryByRole("option")).not.toBeInTheDocument();
    });
  });

  describe("disabled state", () => {
    it("disables the trigger button when disabled=true", () => {
      render(
        <ModernSelectField options={OPTIONS} value="" onChange={jest.fn()} placeholder="Choose" disabled />
      );
      expect(screen.getByRole("button", { name: "Choose" })).toBeDisabled();
    });

    it("does not open the dropdown when disabled", () => {
      render(
        <ModernSelectField options={OPTIONS} value="" onChange={jest.fn()} placeholder="Choose" disabled />
      );
      fireEvent.click(screen.getByRole("button", { name: "Choose" }));
      expect(screen.queryByRole("option")).not.toBeInTheDocument();
    });
  });

  describe("string options", () => {
    it("normalizes plain string options and renders their labels", () => {
      render(
        <ModernSelectField options={["Apple", "Banana"]} value="" onChange={jest.fn()} placeholder="Choose" />
      );
      fireEvent.click(screen.getByRole("button", { name: "Choose" }));
      expect(screen.getByText("Apple")).toBeInTheDocument();
      expect(screen.getByText("Banana")).toBeInTheDocument();
    });

    it("calls onChange with the string value when a string option is selected", () => {
      const onChange = jest.fn();
      render(
        <ModernSelectField options={["Apple", "Banana"]} value="" onChange={onChange} placeholder="Choose" />
      );
      fireEvent.click(screen.getByRole("button", { name: "Choose" }));
      fireEvent.click(screen.getByRole("option", { name: "Apple" }));
      expect(onChange).toHaveBeenCalledWith("Apple");
    });
  });
});
