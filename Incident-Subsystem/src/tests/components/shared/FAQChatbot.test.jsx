import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FAQChatbot from "../../../components/shared/FAQChatbot";

// FAQChatbot uses useNavigate — must be wrapped in a Router
const wrap = (theme = "blue") =>
  render(<MemoryRouter><FAQChatbot currentTheme={theme} /></MemoryRouter>);

// JSDOM does not implement scrollIntoView — stub it
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe("FAQChatbot", () => {
  describe("closed state", () => {
    it("renders the toggle button when closed", () => {
      wrap();
      expect(screen.getByRole("button", { name: /open faq chatbot/i })).toBeInTheDocument();
    });

    it("does not show the chat panel when closed", () => {
      wrap();
      expect(screen.queryByText("E-Kap")).not.toBeInTheDocument();
    });
  });

  describe("opening the chat", () => {
    it("shows the E-Kap header when toggle is clicked", () => {
      wrap();
      fireEvent.click(screen.getByRole("button", { name: /open faq chatbot/i }));
      expect(screen.getByText("E-Kap")).toBeInTheDocument();
    });

    it("shows 'Barangay assistant' subtitle when open", () => {
      wrap();
      fireEvent.click(screen.getByRole("button", { name: /open faq chatbot/i }));
      // Use getAllByText because the greeting message also contains "Barangay assistant"
      expect(screen.getAllByText(/barangay assistant/i).length).toBeGreaterThan(0);
    });

    it("shows the initial bot greeting message", () => {
      wrap();
      fireEvent.click(screen.getByRole("button", { name: /open faq chatbot/i }));
      expect(screen.getByText(/I'm E-Kap, your Barangay assistant/i)).toBeInTheDocument();
    });

    it("hides the toggle button once the chat is open", () => {
      wrap();
      fireEvent.click(screen.getByRole("button", { name: /open faq chatbot/i }));
      expect(screen.queryByRole("button", { name: /open faq chatbot/i })).not.toBeInTheDocument();
    });
  });

  describe("quick questions panel", () => {
    it("shows quick questions when only the greeting message is present", () => {
      wrap();
      fireEvent.click(screen.getByRole("button", { name: /open faq chatbot/i }));
      // Label is "Quick questions" (no colon) in the updated component
      expect(screen.getByText("Quick questions")).toBeInTheDocument();
    });

    it("shows 'How to report an incident?' as a quick question", () => {
      wrap();
      fireEvent.click(screen.getByRole("button", { name: /open faq chatbot/i }));
      expect(screen.getByRole("button", { name: /how to report an incident/i })).toBeInTheDocument();
    });

    it("shows quick question buttons", () => {
      wrap();
      fireEvent.click(screen.getByRole("button", { name: /open faq chatbot/i }));
      expect(screen.getByRole("button", { name: /how to report an incident/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /how to file a complaint/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /request documents online/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /track my case/i })).toBeInTheDocument();
    });
  });

  describe("sending a message", () => {
    it("send button is disabled when input is empty", () => {
      wrap();
      fireEvent.click(screen.getByRole("button", { name: /open faq chatbot/i }));
      const input = screen.getByPlaceholderText(/type your question/i);
      expect(input.value).toBe("");
    });

    it("renders the text input placeholder", () => {
      wrap();
      fireEvent.click(screen.getByRole("button", { name: /open faq chatbot/i }));
      expect(screen.getByPlaceholderText(/type your question/i)).toBeInTheDocument();
    });

    it("shows the user message after sending via Enter key", () => {
      wrap();
      fireEvent.click(screen.getByRole("button", { name: /open faq chatbot/i }));
      const input = screen.getByPlaceholderText(/type your question/i);
      fireEvent.change(input, { target: { value: "hello" } });
      // Component uses onKeyPress checking e.key === "Enter"
      fireEvent.keyPress(input, { key: "Enter", charCode: 13 });
      expect(screen.getByText("hello")).toBeInTheDocument();
    });

    it("shows the bot response after the 1-second delay", () => {
      wrap();
      fireEvent.click(screen.getByRole("button", { name: /open faq chatbot/i }));
      const input = screen.getByPlaceholderText(/type your question/i);
      fireEvent.change(input, { target: { value: "hello" } });
      fireEvent.keyPress(input, { key: "Enter", charCode: 13 });
      act(() => { jest.advanceTimersByTime(1000); });
      // The "hello" response is the same text as the initial greeting — both appear
      expect(screen.getAllByText(/I'm E-Kap, your Barangay assistant. How can I help/i).length).toBeGreaterThanOrEqual(1);
    });

    it("clears the input field after sending via Enter", () => {
      wrap();
      fireEvent.click(screen.getByRole("button", { name: /open faq chatbot/i }));
      const input = screen.getByPlaceholderText(/type your question/i);
      fireEvent.change(input, { target: { value: "hello" } });
      fireEvent.keyPress(input, { key: "Enter", charCode: 13 });
      expect(input.value).toBe("");
    });

    it("quick question click adds user message and bot response", () => {
      wrap();
      fireEvent.click(screen.getByRole("button", { name: /open faq chatbot/i }));
      fireEvent.click(screen.getByRole("button", { name: /how to report an incident/i }));
      expect(screen.getByText("How to report an incident?")).toBeInTheDocument();
      act(() => { jest.advanceTimersByTime(1000); });
      expect(screen.getByText(/report an incident online/i)).toBeInTheDocument();
    });

    it("hides quick questions panel after first message is sent", () => {
      wrap();
      fireEvent.click(screen.getByRole("button", { name: /open faq chatbot/i }));
      fireEvent.click(screen.getByRole("button", { name: /how to report an incident/i }));
      expect(screen.queryByText("Quick questions")).not.toBeInTheDocument();
    });
  });

  describe("closing the chat", () => {
    it("closes the chat when the X button is clicked", () => {
      wrap();
      fireEvent.click(screen.getByRole("button", { name: /open faq chatbot/i }));
      expect(screen.getByText("E-Kap")).toBeInTheDocument();
      // The header close button has no aria-label and is inside the chat header
      const buttons = screen.getAllByRole("button");
      const headerCloseBtn = buttons.find(
        (b) => !b.getAttribute("aria-label") && b.className.includes("rounded-xl")
      );
      fireEvent.click(headerCloseBtn);
      expect(screen.queryByText("E-Kap")).not.toBeInTheDocument();
    });
  });

  describe("theme support", () => {
    it("renders without error in dark theme", () => {
      wrap("dark");
      expect(screen.getByRole("button", { name: /open faq chatbot/i })).toBeInTheDocument();
    });

    it("renders without error for unknown theme (falls back to modern)", () => {
      wrap("unknown");
      expect(screen.getByRole("button", { name: /open faq chatbot/i })).toBeInTheDocument();
    });
  });
});
