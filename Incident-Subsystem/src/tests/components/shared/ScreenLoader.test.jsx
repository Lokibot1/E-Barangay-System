import React from "react";
import { render, screen } from "@testing-library/react";
import ScreenLoader from "../../../components/shared/ScreenLoader";

describe("ScreenLoader", () => {
  describe("visibility", () => {
    it("renders nothing when show=false", () => {
      const { container } = render(<ScreenLoader show={false} />);
      expect(container).toBeEmptyDOMElement();
    });

    it("renders the overlay when show=true", () => {
      render(<ScreenLoader show={true} title="Saving" description="Please wait..." />);
      expect(screen.getByText("Saving")).toBeInTheDocument();
    });
  });

  describe("content", () => {
    it("renders the provided title", () => {
      render(<ScreenLoader show={true} title="Uploading" description="..." />);
      expect(screen.getByText("Uploading")).toBeInTheDocument();
    });

    it("renders the provided description", () => {
      render(<ScreenLoader show={true} title="Loading" description="Fetching data..." />);
      expect(screen.getByText("Fetching data...")).toBeInTheDocument();
    });

    it("uses default title 'Loading' when not provided", () => {
      render(<ScreenLoader show={true} />);
      expect(screen.getByText("Loading")).toBeInTheDocument();
    });

    it("uses default description 'Please wait...' when not provided", () => {
      render(<ScreenLoader show={true} />);
      expect(screen.getByText("Please wait...")).toBeInTheDocument();
    });
  });

  describe("portal", () => {
    it("renders into document.body via portal", () => {
      render(<ScreenLoader show={true} title="Processing" />);
      expect(document.body).toHaveTextContent("Processing");
    });
  });
});
