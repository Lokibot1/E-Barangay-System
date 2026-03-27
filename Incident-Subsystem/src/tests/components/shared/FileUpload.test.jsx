import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FileUpload from "../../../components/shared/FileUpload";

beforeAll(() => {
  global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
  global.URL.revokeObjectURL = jest.fn();
});

afterEach(() => jest.clearAllMocks());

const makePdf = (name = "doc.pdf") =>
  new File(["content"], name, { type: "application/pdf" });

const defaults = {
  label: "Attachments",
  files: [],
  onChange: jest.fn(),
  currentTheme: "blue",
};

describe("FileUpload", () => {
  describe("label and description", () => {
    it("renders the label", () => {
      render(<FileUpload {...defaults} />);
      expect(screen.getByText("Attachments")).toBeInTheDocument();
    });

    it("renders the description when provided", () => {
      render(<FileUpload {...defaults} description="Upload supporting files" />);
      expect(screen.getByText("Upload supporting files")).toBeInTheDocument();
    });

    it("does not render a description when not provided", () => {
      render(<FileUpload {...defaults} />);
      expect(screen.queryByText("Upload supporting files")).not.toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("renders the drop zone prompt when no files", () => {
      render(<FileUpload {...defaults} />);
      expect(screen.getByText(/drop files here or click to browse/i)).toBeInTheDocument();
    });

    it("renders the accepted file types hint", () => {
      render(<FileUpload {...defaults} />);
      expect(screen.getByText(/images, videos, pdf/i)).toBeInTheDocument();
    });
  });

  describe("with files", () => {
    it("renders the 'Add more' button when files are present", () => {
      render(<FileUpload {...defaults} files={[makePdf()]} />);
      expect(screen.getByRole("button", { name: /add more files/i })).toBeInTheDocument();
    });

    it("shows the filename for non-media files in the thumbnail", () => {
      render(<FileUpload {...defaults} files={[makePdf("report.pdf")]} />);
      // filename appears in both the thumbnail text and the hover overlay
      expect(screen.getAllByText("report.pdf").length).toBeGreaterThan(0);
    });

    it("does not show the empty drop zone when files are present", () => {
      render(<FileUpload {...defaults} files={[makePdf()]} />);
      expect(screen.queryByText(/drop files here or click to browse/i)).not.toBeInTheDocument();
    });

    it("renders one thumbnail per file", () => {
      render(
        <FileUpload {...defaults} files={[makePdf("a.pdf"), makePdf("b.pdf")]} />
      );
      expect(screen.getAllByText("a.pdf").length).toBeGreaterThan(0);
      expect(screen.getAllByText("b.pdf").length).toBeGreaterThan(0);
    });
  });

  describe("file selection via input", () => {
    it("calls onChange with merged files when new files are selected", () => {
      const existing = makePdf("existing.pdf");
      const onChange = jest.fn();
      render(<FileUpload {...defaults} files={[existing]} onChange={onChange} />);

      const newFile = makePdf("new.pdf");
      const input = document.querySelector('input[type="file"]');
      fireEvent.change(input, { target: { files: [newFile] } });

      expect(onChange).toHaveBeenCalledWith([existing, newFile]);
    });

    it("calls onChange with the new file when adding to empty list", () => {
      const onChange = jest.fn();
      render(<FileUpload {...defaults} onChange={onChange} />);

      const file = makePdf("first.pdf");
      const input = document.querySelector('input[type="file"]');
      fireEvent.change(input, { target: { files: [file] } });

      expect(onChange).toHaveBeenCalledWith([file]);
    });
  });

  describe("file removal", () => {
    it("calls onChange without the file when the remove button is clicked", () => {
      const file = makePdf("remove-me.pdf");
      const onChange = jest.fn();
      render(<FileUpload {...defaults} files={[file]} onChange={onChange} />);

      fireEvent.click(screen.getByRole("button", { name: /remove file/i }));
      expect(onChange).toHaveBeenCalledWith([]);
    });

    it("removes only the targeted file when multiple files are present", () => {
      const fileA = makePdf("a.pdf");
      const fileB = makePdf("b.pdf");
      const onChange = jest.fn();
      render(<FileUpload {...defaults} files={[fileA, fileB]} onChange={onChange} />);

      // Click the first remove button
      fireEvent.click(screen.getAllByRole("button", { name: /remove file/i })[0]);
      expect(onChange).toHaveBeenCalledWith([fileB]);
    });
  });

  describe("theme fallback", () => {
    it("falls back to modern theme for unknown currentTheme", () => {
      render(<FileUpload {...defaults} currentTheme="unknown" />);
      expect(screen.getByText(/drop files here/i)).toBeInTheDocument();
    });
  });
});
