import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DatePickerField from "../../../components/shared/DatePickerField";

const noop = jest.fn();

afterEach(() => jest.clearAllMocks());

describe("DatePickerField", () => {
  describe("trigger — closed state", () => {
    it("shows placeholder text when value is empty", () => {
      render(<DatePickerField value="" onChange={noop} placeholder="mm/dd/yyyy" />);
      expect(screen.getByPlaceholderText("mm/dd/yyyy")).toBeInTheDocument();
    });

    it("formats and displays a YYYY-MM-DD value as MM/DD/YYYY", () => {
      render(<DatePickerField value="2024-03-15" onChange={noop} />);
      expect(screen.getByDisplayValue("03/15/2024")).toBeInTheDocument();
    });

    it("aria-expanded is false when closed", () => {
      render(<DatePickerField value="" onChange={noop} placeholder="Pick date" />);
      expect(screen.getByRole("group")).toHaveAttribute("aria-expanded", "false");
    });

    it("does not render the calendar initially", () => {
      render(<DatePickerField value="" onChange={noop} />);
      expect(screen.queryByRole("button", { name: /previous month/i })).not.toBeInTheDocument();
    });

    it("calendar icon button has accessible label 'Open calendar'", () => {
      render(<DatePickerField value="" onChange={noop} />);
      expect(screen.getByRole("button", { name: "Open calendar" })).toBeInTheDocument();
    });
  });

  describe("opening the calendar", () => {
    it("opens calendar when the calendar icon button is clicked", () => {
      render(<DatePickerField value="" onChange={noop} />);
      fireEvent.click(screen.getByRole("button", { name: "Open calendar" }));
      expect(screen.getByRole("button", { name: /previous month/i })).toBeInTheDocument();
    });

    it("sets aria-expanded to true when open", () => {
      render(<DatePickerField value="" onChange={noop} />);
      fireEvent.click(screen.getByRole("button", { name: "Open calendar" }));
      expect(screen.getByRole("group")).toHaveAttribute("aria-expanded", "true");
    });

    it("shows all day-of-week headers (Su, Mo, Tu, We, Th, Fr, Sa)", () => {
      render(<DatePickerField value="2024-01-01" onChange={noop} />);
      fireEvent.click(screen.getByRole("button", { name: "Open calendar" }));
      ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].forEach((d) => {
        expect(screen.getByText(d)).toBeInTheDocument();
      });
    });

    it("shows the current view month and year in the header", () => {
      render(<DatePickerField value="2024-03-15" onChange={noop} />);
      fireEvent.click(screen.getByRole("button", { name: "Open calendar" }));
      expect(screen.getByText("March 2024")).toBeInTheDocument();
    });

    it("shows the calendar icon button label 'Close calendar' when open", () => {
      render(<DatePickerField value="" onChange={noop} />);
      fireEvent.click(screen.getByRole("button", { name: "Open calendar" }));
      expect(screen.getByRole("button", { name: "Close calendar" })).toBeInTheDocument();
    });
  });

  describe("month navigation", () => {
    it("navigates to the previous month when Previous month is clicked", () => {
      render(<DatePickerField value="2024-03-15" onChange={noop} />);
      fireEvent.click(screen.getByRole("button", { name: "Open calendar" }));
      fireEvent.click(screen.getByRole("button", { name: /previous month/i }));
      expect(screen.getByText("February 2024")).toBeInTheDocument();
    });

    it("navigates to the next month when Next month is clicked", () => {
      render(<DatePickerField value="2024-03-15" onChange={noop} />);
      fireEvent.click(screen.getByRole("button", { name: "Open calendar" }));
      fireEvent.click(screen.getByRole("button", { name: /next month/i }));
      expect(screen.getByText("April 2024")).toBeInTheDocument();
    });
  });

  describe("day selection", () => {
    it("calls onChange with YYYY-MM-DD when a day is clicked", () => {
      const onChange = jest.fn();
      render(<DatePickerField value="2024-03-01" onChange={onChange} />);
      fireEvent.click(screen.getByRole("button", { name: "Open calendar" }));
      // Click day 10
      fireEvent.click(screen.getByRole("button", { name: "10" }));
      expect(onChange).toHaveBeenCalledWith("2024-03-10");
    });

    it("closes the calendar after a day is selected", () => {
      render(<DatePickerField value="2024-03-01" onChange={noop} />);
      fireEvent.click(screen.getByRole("button", { name: "Open calendar" }));
      fireEvent.click(screen.getByRole("button", { name: "10" }));
      expect(screen.queryByRole("button", { name: /previous month/i })).not.toBeInTheDocument();
    });
  });

  describe("Clear and Today buttons", () => {
    it("renders the Clear button inside the calendar", () => {
      render(<DatePickerField value="2024-03-01" onChange={noop} />);
      fireEvent.click(screen.getByRole("button", { name: "Open calendar" }));
      expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
    });

    it("calls onChange('') and closes calendar when Clear is clicked", () => {
      const onChange = jest.fn();
      render(<DatePickerField value="2024-03-01" onChange={onChange} />);
      fireEvent.click(screen.getByRole("button", { name: "Open calendar" }));
      fireEvent.click(screen.getByRole("button", { name: /clear/i }));
      expect(onChange).toHaveBeenCalledWith("");
      expect(screen.queryByRole("button", { name: /previous month/i })).not.toBeInTheDocument();
    });

    it("renders the Today button inside the calendar", () => {
      render(<DatePickerField value="" onChange={noop} />);
      fireEvent.click(screen.getByRole("button", { name: "Open calendar" }));
      expect(screen.getByRole("button", { name: /today/i })).toBeInTheDocument();
    });

    it("hides the Clear button when showClear=false", () => {
      render(<DatePickerField value="2024-03-01" onChange={noop} showClear={false} />);
      fireEvent.click(screen.getByRole("button", { name: "Open calendar" }));
      expect(screen.queryByRole("button", { name: /clear/i })).not.toBeInTheDocument();
    });

    it("hides the Today button when showToday=false", () => {
      render(<DatePickerField value="" onChange={noop} showToday={false} />);
      fireEvent.click(screen.getByRole("button", { name: "Open calendar" }));
      expect(screen.queryByRole("button", { name: /today/i })).not.toBeInTheDocument();
    });
  });

  describe("keyboard interaction", () => {
    it("closes the calendar when Escape is pressed", () => {
      render(<DatePickerField value="" onChange={noop} />);
      fireEvent.click(screen.getByRole("button", { name: "Open calendar" }));
      expect(screen.getByRole("button", { name: /previous month/i })).toBeInTheDocument();
      fireEvent.keyDown(document, { key: "Escape" });
      expect(screen.queryByRole("button", { name: /previous month/i })).not.toBeInTheDocument();
    });

    it("opens the calendar when ArrowDown is pressed on the text input", () => {
      render(<DatePickerField value="" onChange={noop} placeholder="Pick date" />);
      const input = screen.getByPlaceholderText("Pick date");
      fireEvent.keyDown(input, { key: "ArrowDown" });
      expect(screen.getByRole("button", { name: /previous month/i })).toBeInTheDocument();
    });
  });

  describe("disabled state", () => {
    it("disables the calendar icon button when disabled=true", () => {
      render(<DatePickerField value="" onChange={noop} disabled />);
      expect(screen.getByRole("button", { name: "Open calendar" })).toBeDisabled();
    });

    it("does not open the calendar when disabled and trigger is clicked", () => {
      render(<DatePickerField value="" onChange={noop} disabled />);
      // click the outer group
      fireEvent.click(screen.getByRole("group"));
      expect(screen.queryByRole("button", { name: /previous month/i })).not.toBeInTheDocument();
    });
  });
});
