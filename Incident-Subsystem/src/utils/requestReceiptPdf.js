import jsPDF from "jspdf";

const formatDateTime = (value) => {
  if (!value) return "Unavailable";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);

  return parsed.toLocaleString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const addWrappedText = (doc, text, x, y, maxWidth, lineHeight = 6) => {
  const lines = doc.splitTextToSize(String(text || "-"), maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
};

export const downloadRequestReceipt = (payload) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const receipt = {
    title: payload?.title || "Acknowledgment Receipt",
    reference: payload?.reference || "N/A",
    category: payload?.category || "request",
    status: payload?.status || "Pending",
    submittedAt: payload?.submittedAt || new Date().toISOString(),
    requesterName: payload?.requesterName || "Resident",
    contactNumber: payload?.contactNumber || "",
    email: payload?.email || "",
    address: payload?.address || "",
    purpose: payload?.purpose || "",
    documentType: payload?.documentType || "",
    verificationUrl: payload?.verificationUrl || "",
  };

  doc.setFillColor(15, 118, 110);
  doc.rect(0, 0, 210, 34, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Barangay Gulod", 14, 16);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Digital Acknowledgment Receipt", 14, 24);

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(receipt.title, 14, 48);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Reference: ${receipt.reference}`, 14, 58);
  doc.text(`Status: ${receipt.status}`, 14, 65);
  doc.text(`Submitted: ${formatDateTime(receipt.submittedAt)}`, 14, 72);

  doc.setDrawColor(203, 213, 225);
  doc.line(14, 78, 196, 78);

  let cursorY = 88;
  const maxWidth = 182;
  const addField = (label, value) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(label, 14, cursorY);
    doc.setFont("helvetica", "normal");
    cursorY = addWrappedText(doc, value || "-", 14, cursorY + 6, maxWidth);
    cursorY += 4;
  };

  addField("Requested by", receipt.requesterName);
  addField("Contact Number", receipt.contactNumber || "Not provided");
  addField("Email", receipt.email || "Not provided");
  addField("Address / Location", receipt.address || "Not provided");

  if (receipt.documentType) {
    addField("Document Type", receipt.documentType);
  }

  if (receipt.purpose) {
    addField("Purpose / Notes", receipt.purpose);
  }

  if (receipt.verificationUrl) {
    addField("Verification Link", receipt.verificationUrl);
  }

  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(
    "Present this receipt or reference number when following up your request.",
    14,
    Math.min(cursorY + 10, 280),
  );

  doc.save(`receipt-${String(receipt.reference).replace(/[^a-z0-9-]/gi, "_")}.pdf`);
};
