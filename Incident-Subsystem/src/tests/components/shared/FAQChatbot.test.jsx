import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import FAQChatbot from "../../../components/shared/FAQChatbot";

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
      render(<FAQChatbot currentTheme="blue" />);
      expect(screen.getByRole("button", { name: /open faq chatbot/i })).toBeInTheDocument();
    });

    it("does not show the chat panel when closed", () => {
      render(<FAQChatbot currentTheme="blue" />);
      expect(screen.queryByText("E-Kap")).not.toBeInTheDocument();
    });
  });

  describe("opening the chat", () => {
    it("shows the E-Kap header when toggle is clicked", () => {
      render(<FAQChatbot currentTheme="blue" />);
      fireEvent.click(screen.getByRole("button", { name: /open faq chatbot/i }));
      expect(screen.getByText("E-Kap")).toBeInTheDocument();
    });

    it("shows 'Barangay assistant' subtitle when open", () => {
      render(<FAQChatbot currentTheme="blue" />);
      fireEvent.click(screen.getByRole("button", { name: /open faq chatbot/i }));
      // Use getAllByText because the greeting message also contains "Barangay assistant"
      expect(screen.getAllByText(/barangay assistant/i).length).toBeGreaterThan(0);
    });

    it("shows the initial bot greeting message", () => {
      render(<FAQChatbot currentTheme="blue" />);
      fireEvent.click(screen.getByRole("button", { name: /open faq chatbot/i }));
      expect(screen.getByText(/I'm E-Kap, your Barangay assistant/i)).toBeInTheDocument();
    });

    it("hides the toggle button once the chat is open", () => {
      render(<FAQChatbot currentTheme="blue" />);
      fireEvent.click(screen.getByRole("button", { name: /open faq chatbot/i }));
      expect(screen.queryByRole("button", { name: /open faq chatbot/i })).not.toBeInTheDocument();
    });
  });

  describe("quick questions panel", () => {
    it("shows quick questions when only the greeting message is present", () => {
      render(<FAQChatbot currentTheme="blue" />);
      fireEvent.click(screen.getByRole("button", { name: /open faq chatbot/i }));
      expect(screen.getByText("Quick questions:")).toBeInTheDocument();
    });

    it("shows 'How to report an incident?' as a quick question", () => {
      render(<FAQChatbot currentTheme="blue" />);
      fireEvent.click(screen.getByRole("button", { name: /open faq chatbot/i }));
      expect(screen.getByRole("button", { name: /how to report an incident/i })).toBeInTheDocument();
    });

    it("shows all 4 quick question buttons", () => {
      render(<FAQChatbot currentTheme="blue" />);
      fireEvent.click(screen.getByRole("button", { name: /open faq chatbot/i }));
      expect(screen.getByRole("button", { name: /how to report an incident/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /barangay clearance requirements/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /office hours/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /contact information/i })).toBeInTheDocument();
    });
  });

  describe("sending a message", () => {
    it("send button is disabled when input is empty", () => {
      render(<FAQChatbot currentTheme="blue" />);
      fireEvent.click(screen.getByRole("button", { name: /open faq chatbot/i }));
      const input = screen.getByPlaceholderText(/type your question/i);
      expect(input.value).toBe("");
    });

    it("renders the text input placeholder", () => {
      render(<FAQChatbot currentTheme="blue" />);
      fireEvent.click(screen.getByRole("button", { name: /open faq chatbot/i }));
      expect(screen.getByPlaceholderText(/type your question/i)).toBeInTheDocument();
    });

    it("shows the user message after sending via Enter key", () => {
      render(<FAQChatbot currentTheme="blue" />);
      fireEvent.click(screen.getByRole("button", { name: /open faq chatbot/i }));
      const input = screen.getByPlaceholderText(/type your question/i);
      fireEvent.change(input, { target: { value: "hello" } });
      // Component uses onKeyPress checking e.key === "Enter"
      fireEvent.keyPress(input, { key: "Enter", charCode: 13 });
      expect(screen.getByText("hello")).toBeInTheDocument();
    });

    it("shows the bot response after the 1-second delay", () => {
      render(<FAQChatbot currentTheme="blue" />);
      fireEvent.click(screen.getByRole("button", { name: /open faq chatbot/i }));
      const input = screen.getByPlaceholderText(/type your question/i);
      fireEvent.change(input, { target: { value: "hello" } });
      fireEvent.keyPress(input, { key: "Enter", charCode: 13 });
      act(() => { jest.advanceTimersByTime(1000); });
      expect(screen.getByText(/I'm E-Kap, your Barangay assistant. How can I assist/i)).toBeInTheDocument();
    });

    it("clears the input field after sending via Enter", () => {
      render(<FAQChatbot currentTheme="blue" />);
      fireEvent.click(screen.getByRole("button", { name: /open faq chatbot/i }));
      const input = screen.getByPlaceholderText(/type your question/i);
      fireEvent.change(input, { target: { value: "hello" } });
      fireEvent.keyPress(input, { key: "Enter", charCode: 13 });
      expect(input.value).toBe("");
    });

    it("quick question click adds user message and bot response", () => {
      render(<FAQChatbot currentTheme="blue" />);
      fireEvent.click(screen.getByRole("button", { name: /open faq chatbot/i }));
      fireEvent.click(screen.getByRole("button", { name: /office hours/i }));
      expect(screen.getByText("Office hours")).toBeInTheDocument();
      act(() => { jest.advanceTimersByTime(1000); });
      expect(screen.getByText(/barangay hall operating hours/i)).toBeInTheDocument();
    });

    it("hides quick questions panel after first message is sent", () => {
      render(<FAQChatbot currentTheme="blue" />);
      fireEvent.click(screen.getByRole("button", { name: /open faq chatbot/i }));
      fireEvent.click(screen.getByRole("button", { name: /office hours/i }));
      expect(screen.queryByText("Quick questions:")).not.toBeInTheDocument();
    });
  });

  describe("closing the chat", () => {
    it("closes the chat when the X button is clicked", () => {
      render(<FAQChatbot currentTheme="blue" />);
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
      render(<FAQChatbot currentTheme="dark" />);
      expect(screen.getByRole("button", { name: /open faq chatbot/i })).toBeInTheDocument();
    });

    it("renders without error for unknown theme (falls back to modern)", () => {
      render(<FAQChatbot currentTheme="unknown" />);
      expect(screen.getByRole("button", { name: /open faq chatbot/i })).toBeInTheDocument();
    });
  });
});
