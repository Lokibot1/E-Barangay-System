import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Toast from "../../../../components/shared/modals/Toast";

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

const makeToast = (overrides = {}) => ({
  id: "toast-1",
  type: "success",
  title: "Success!",
  message: "Operation completed.",
  duration: 4000,
  ...overrides,
});

describe("Toast", () => {
  describe("rendering", () => {
    it("renders no toast items when the toasts array is empty", () => {
      render(<Toast toasts={[]} onRemove={jest.fn()} currentTheme="blue" />);
      expect(screen.queryByText("Success!")).not.toBeInTheDocument();
    });

    it("renders the toast title", () => {
      render(<Toast toasts={[makeToast()]} onRemove={jest.fn()} currentTheme="blue" />);
      expect(screen.getByText("Success!")).toBeInTheDocument();
    });

    it("renders the toast message", () => {
      render(<Toast toasts={[makeToast()]} onRemove={jest.fn()} currentTheme="blue" />);
      expect(screen.getByText("Operation completed.")).toBeInTheDocument();
    });

    it("renders multiple toasts", () => {
      const toasts = [
        makeToast({ id: "1", title: "First" }),
        makeToast({ id: "2", title: "Second" }),
      ];
      render(<Toast toasts={toasts} onRemove={jest.fn()} currentTheme="blue" />);
      expect(screen.getByText("First")).toBeInTheDocument();
      expect(screen.getByText("Second")).toBeInTheDocument();
    });

    it("renders for error type without crashing", () => {
      render(
        <Toast
          toasts={[makeToast({ type: "error", title: "Error!" })]}
          onRemove={jest.fn()}
          currentTheme="blue"
        />
      );
      expect(screen.getByText("Error!")).toBeInTheDocument();
    });

    it("does not render the message paragraph when message is absent", () => {
      render(
        <Toast
          toasts={[makeToast({ message: undefined })]}
          onRemove={jest.fn()}
          currentTheme="blue"
        />
      );
      expect(screen.queryByText("Operation completed.")).not.toBeInTheDocument();
    });
  });

  describe("auto-dismiss", () => {
    it("calls onRemove after duration + 300ms exit animation", () => {
      const onRemove = jest.fn();
      render(
        <Toast toasts={[makeToast({ duration: 4000 })]} onRemove={onRemove} currentTheme="blue" />
      );
      act(() => { jest.advanceTimersByTime(4000); }); // triggers setExiting(true)
      act(() => { jest.advanceTimersByTime(300); });  // triggers onRemove
      expect(onRemove).toHaveBeenCalledWith("toast-1");
    });

    it("does not call onRemove before the duration elapses", () => {
      const onRemove = jest.fn();
      render(
        <Toast toasts={[makeToast({ duration: 4000 })]} onRemove={onRemove} currentTheme="blue" />
      );
      act(() => { jest.advanceTimersByTime(3999); });
      expect(onRemove).not.toHaveBeenCalled();
    });

    it("uses 4000ms as default duration when not specified", () => {
      const onRemove = jest.fn();
      const toast = makeToast();
      delete toast.duration;
      render(<Toast toasts={[toast]} onRemove={onRemove} currentTheme="blue" />);
      act(() => { jest.advanceTimersByTime(4000); });
      act(() => { jest.advanceTimersByTime(300); });
      expect(onRemove).toHaveBeenCalledWith("toast-1");
    });
  });

  describe("close button", () => {
    it("calls onRemove when the close button is clicked (after exit animation)", () => {
      const onRemove = jest.fn();
      render(
        <Toast toasts={[makeToast()]} onRemove={onRemove} currentTheme="blue" />
      );
      fireEvent.click(screen.getByRole("button"));
      act(() => { jest.advanceTimersByTime(300); });
      expect(onRemove).toHaveBeenCalledWith("toast-1");
    });
  });

  describe("dark theme", () => {
    it("renders without error in dark theme", () => {
      render(
        <Toast toasts={[makeToast()]} onRemove={jest.fn()} currentTheme="dark" />
      );
      expect(screen.getByText("Success!")).toBeInTheDocument();
    });
  });
});
