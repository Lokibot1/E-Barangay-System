import { jsPDF } from "jspdf";

/**
 * PDF Registration Slip Generator
 */
export const handleDownloadSlip = (data) => {
  try {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a6' });

    // Header Background
    doc.setFillColor(21, 128, 61);
    doc.rect(0, 0, 105, 30, 'F');
    
    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("BARANGAY GULOD NOVALICHES", 52.5, 12, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Quezon City, NCR - Philippines", 52.5, 18, { align: 'center' });
    
    doc.setFontSize(8);
    doc.text("OFFICIAL REGISTRATION SLIP", 52.5, 24, { align: 'center' });

    // Divider Line
    doc.setDrawColor(21, 128, 61);
    doc.setLineWidth(0.5);
    doc.line(10, 35, 95, 35);

    // Body Content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("FULL NAME:", 10, 45);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(String(data?.name || "APPLICANT").toUpperCase(), 10, 52);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("TRACKING NUMBER:", 10, 65);
    
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(21, 128, 61);
    doc.text(String(data?.trackingNumber || "N/A"), 10, 73);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("STATUS:", 10, 85);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(String(data?.status || "Pending").toUpperCase(), 10, 92);

    // Submission Date
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const dateStr = data?.date || new Date().toLocaleDateString();
    doc.text(`Date Processed: ${dateStr}`, 10, 103);

    // Footer/Reminder Box
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 115, 105, 33, 'F');
    
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text("IMPORTANT REMINDER:", 10, 122);
    
    doc.setFont("helvetica", "normal");
    doc.text("• Keep this slip for your records", 10, 127);
    doc.text("• Use tracking number to monitor status", 10, 132);
    doc.text("• Bring valid ID for verification visit", 10, 137);

    // Safe File Name (Remove illegal characters)
    const safeTracking = String(data?.trackingNumber || 'BGN-XXXX').replace(/[/\\?%*:|"<>]/g, '-');
    doc.save(`Slip-${safeTracking}.pdf`);

  } catch (err) {
    console.error("PDF Generation Error:", err);
    alert("Failed to generate PDF slip.");
  }
};

/**
 * QR Code PNG Downloader (Supports UTF-8 characters)
 */
export const downloadResidentQR = (qrElementId, residentData) => {
  try {
    const svg = document.getElementById(qrElementId);
    if (!svg) throw new Error("QR Code element not found");

    // Standardize SVG data to handle special characters (ñ, é, etc.)
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBase64 = btoa(unescape(encodeURIComponent(svgData)));
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // High resolution (1000x1000)
      canvas.width = 1000;
      canvas.height = 1000;
      
      // White Background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, 1000, 1000);
      
      // Draw QR centered
      ctx.drawImage(img, 100, 100, 800, 800);

      const link = document.createElement("a");
      const safeName = String(residentData?.name || 'Resident').replace(/\s+/g, '-');
      link.download = `QR-${residentData?.barangayId || 'BGN'}-${safeName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.src = "data:image/svg+xml;base64," + svgBase64;
  } catch (err) {
    console.error("QR Download Error:", err);
    alert("Failed to download QR code.");
  }
};