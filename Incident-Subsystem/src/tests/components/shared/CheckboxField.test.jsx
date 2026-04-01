import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CheckboxField from "../../../components/shared/CheckboxField";

describe("CheckboxField", () => {
  it("renders the label text", () => {
    render(<CheckboxField label="Accept terms" checked={false} onChange={jest.fn()} currentTheme="blue" />);
    expect(screen.getByText("Accept terms")).toBeInTheDocument();
  });

  it("renders a checked checkbox when checked=true", () => {
    render(<CheckboxField label="Accept" checked={true} onChange={jest.fn()} currentTheme="blue" />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("renders an unchecked checkbox when checked=false", () => {
    render(<CheckboxField label="Accept" checked={false} onChange={jest.fn()} currentTheme="blue" />);
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("calls onChange when the checkbox is clicked", () => {
    const onChange = jest.fn();
    render(<CheckboxField label="Accept" checked={false} onChange={onChange} currentTheme="blue" />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("passes extra props to the input element", () => {
    render(
      <CheckboxField
        label="Accept"
        checked={false}
        onChange={jest.fn()}
        currentTheme="blue"
        data-testid="my-checkbox"
      />
    );
    expect(screen.getByTestId("my-checkbox")).toBeInTheDocument();
  });

  it("falls back to modern theme for unknown currentTheme", () => {
    render(<CheckboxField label="Accept" checked={false} onChange={jest.fn()} currentTheme="nonexistent" />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("renders without error for all valid themes", () => {
    ["blue", "green", "purple", "dark", "modern"].forEach((theme) => {
      const { unmount } = render(
        <CheckboxField label="Test" checked={false} onChange={jest.fn()} currentTheme={theme} />
      );
      unmount();
    });
  });
});
