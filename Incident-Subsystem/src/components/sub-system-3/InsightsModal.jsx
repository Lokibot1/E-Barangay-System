import React, { useMemo, useEffect, useState } from "react";
import themeTokens from "../../Themetokens";
import { generateInsights } from "../../utils/insightsEngine";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import barangayLogoUrl from "../../assets/images/logo.jpg";
import quezonCityLogoUrl from "../../assets/images/quezon-city-logo.png";

// Load an image URL into a base64 data URL for jsPDF
const loadImageAsBase64 = (url) =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d").drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });

const SEVERITY_STYLES = {
  critical: {
    bg: "bg-red-50",
    darkBg: "bg-red-900/20",
    border: "border-red-300",
    darkBorder: "border-red-700",
    badge: "bg-red-600",
    text: "text-red-700",
    darkText: "text-red-400",
    label: "CRITICAL",
  },
  warning: {
    bg: "bg-amber-50",
    darkBg: "bg-amber-900/20",
    border: "border-amber-300",
    darkBorder: "border-amber-700",
    badge: "bg-amber-500",
    text: "text-amber-700",
    darkText: "text-amber-400",
    label: "WARNING",
  },
  info: {
    bg: "bg-blue-50",
    darkBg: "bg-blue-900/20",
    border: "border-blue-300",
    darkBorder: "border-blue-700",
    badge: "bg-blue-500",
    text: "text-blue-700",
    darkText: "text-blue-400",
    label: "INFO",
  },
};

const InsightsModal = ({ isOpen, onClose, incidents, complaints, context = "dashboard" }) => {
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("appTheme") || "blue",
  );

  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener("themeChange", handler);
    return () => window.removeEventListener("themeChange", handler);
  }, []);

  const t = themeTokens[currentTheme] || themeTokens.blue;
  const isDark = currentTheme === "dark";

  const insights = useMemo(
    () => (isOpen ? generateInsights(incidents, complaints, { context }) : []),
    [isOpen, incidents, complaints, context],
  );

  const generatedAt = useMemo(
    () =>
      isOpen
        ? new Date().toLocaleString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
    [isOpen],
  );

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleDownloadPDF = async () => {
    // Load both logos in parallel
    const [brgyLogo, qcLogo] = await Promise.all([
      loadImageAsBase64(barangayLogoUrl),
      loadImageAsBase64(quezonCityLogoUrl),
    ]);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const logoSize = 22;
    const margin = 14;

    // ── Header with logos ──────────────────────────────────────────
    // Barangay Gulod logo (left)
    if (brgyLogo) {
      doc.addImage(brgyLogo, "JPEG", margin, 8, logoSize, logoSize);
    }
    // Quezon City logo (right)
    if (qcLogo) {
      doc.addImage(qcLogo, "PNG", pageWidth - margin - logoSize, 8, logoSize, logoSize);
    }

    // Center text between logos
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text("Republic of the Philippines", pageWidth / 2, 12, { align: "center" });
    doc.text("Quezon City", pageWidth / 2, 17, { align: "center" });

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("Barangay Gulod", pageWidth / 2, 23, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text("Sangguniang Kabataan", pageWidth / 2, 28, { align: "center" });

    // Horizontal rule
    doc.setDrawColor(180);
    doc.setLineWidth(0.5);
    doc.line(margin, 33, pageWidth - margin, 33);

    // Report title
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("Insights & Recommendations Report", pageWidth / 2, 40, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Generated: ${generatedAt}`, pageWidth / 2, 46, { align: "center" });
    doc.text(
      `Data: ${incidents?.length || 0} incidents, ${complaints?.length || 0} complaints`,
      pageWidth / 2,
      51,
      { align: "center" },
    );
    doc.setTextColor(0);

    // Summary counts
    const criticalCount = insights.filter((i) => i.severity === "critical").length;
    const warningCount = insights.filter((i) => i.severity === "warning").length;
    const infoCount = insights.filter((i) => i.severity === "info").length;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Summary:  ${criticalCount} Critical  |  ${warningCount} Warning  |  ${infoCount} Info`,
      margin,
      59,
    );

    // Insights table
    const tableData = insights.map((insight) => [
      insight.severity.toUpperCase(),
      insight.category,
      insight.title + "\n" + insight.description,
      insight.recommendation,
    ]);

    autoTable(doc, {
      startY: 64,
      head: [["Severity", "Category", "Finding", "Recommended Action"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [31, 41, 55],
        textColor: 255,
        fontSize: 9,
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: { fontSize: 8, cellPadding: 4 },
      columnStyles: {
        0: {
          cellWidth: 22,
          halign: "center",
          fontStyle: "bold",
          cellPadding: 3,
        },
        1: { cellWidth: 30 },
        2: { cellWidth: 68 },
        3: { cellWidth: 68 },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 0) {
          const val = data.cell.raw;
          if (val === "CRITICAL") {
            data.cell.styles.textColor = [220, 38, 38];
          } else if (val === "WARNING") {
            data.cell.styles.textColor = [217, 119, 6];
          } else {
            data.cell.styles.textColor = [37, 99, 235];
          }
        }
      },
      margin: { left: margin, right: margin },
    });

    // Footer
    const finalY = doc.lastAutoTable.finalY || 70;
    doc.setDrawColor(180);
    doc.setLineWidth(0.3);
    doc.line(margin, finalY + 6, pageWidth - margin, finalY + 6);
    doc.setFontSize(8);
    doc.setTextColor(130);
    doc.text(
      "Generated by E-Barangay Integrated Services Platform  •  Barangay Gulod, Quezon City",
      pageWidth / 2,
      finalY + 12,
      { align: "center" },
    );

    doc.save(`Barangay-Gulod-Insights-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`relative ${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-800 text-white px-5 py-3.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h2 className="text-sm font-bold font-spartan tracking-wide uppercase">
              Insights & Recommendations
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold font-kumbh uppercase rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Severity summary bar */}
        <div className={`px-5 py-3 flex items-center gap-4 border-b ${isDark ? "border-slate-700 bg-slate-750" : "border-gray-200 bg-gray-50"}`}>
          <span className={`text-xs font-kumbh ${isDark ? "text-slate-400" : "text-gray-500"}`}>
            Generated: {generatedAt}
          </span>
          <div className="flex items-center gap-3 ml-auto">
            {["critical", "warning", "info"].map((sev) => {
              const count = insights.filter((i) => i.severity === sev).length;
              if (count === 0) return null;
              const style = SEVERITY_STYLES[sev];
              return (
                <span key={sev} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${style.badge}`} />
                  <span className={`text-xs font-bold font-kumbh ${isDark ? style.darkText : style.text}`}>
                    {count} {style.label}
                  </span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Body — scrollable insights list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {insights.length === 0 ? (
            <div className="text-center py-16">
              <svg className={`w-12 h-12 mx-auto mb-3 ${isDark ? "text-slate-600" : "text-gray-300"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className={`text-sm font-kumbh ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                No insights available. Add more data to generate insights.
              </p>
            </div>
          ) : (
            insights.map((insight) => {
              const style = SEVERITY_STYLES[insight.severity];
              return (
                <div
                  key={insight.id}
                  className={`rounded-xl border p-4 ${isDark ? `${style.darkBg} ${style.darkBorder}` : `${style.bg} ${style.border}`} transition-all`}
                >
                  {/* Top row: badge + category */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`${style.badge} text-white text-[10px] font-bold font-kumbh uppercase px-2 py-0.5 rounded`}>
                      {style.label}
                    </span>
                    <span className={`text-xs font-bold font-kumbh uppercase ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                      {insight.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className={`text-sm font-bold font-spartan ${isDark ? "text-slate-100" : "text-gray-900"} mb-1`}>
                    {insight.title}
                  </h4>

                  {/* Description */}
                  <p className={`text-xs font-kumbh leading-relaxed ${isDark ? "text-slate-300" : "text-gray-600"} mb-3`}>
                    {insight.description}
                  </p>

                  {/* Recommendation */}
                  <div className={`rounded-lg p-3 ${isDark ? "bg-slate-700/50" : "bg-white/70"}`}>
                    <div className="flex items-start gap-2">
                      <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? style.darkText : style.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className={`text-[10px] font-bold font-kumbh uppercase mb-1 ${isDark ? style.darkText : style.text}`}>
                          Recommended Action
                        </p>
                        <p className={`text-xs font-kumbh leading-relaxed ${isDark ? "text-slate-200" : "text-gray-700"}`}>
                          {insight.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className={`flex-shrink-0 border-t px-5 py-3 flex items-center justify-between ${isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-gray-50"}`}>
          <p className={`text-xs font-kumbh ${isDark ? "text-slate-500" : "text-gray-400"}`}>
            E-Barangay Integrated Services Platform
          </p>
          <button
            onClick={handleDownloadPDF}
            className={`flex items-center gap-1.5 text-xs font-bold font-kumbh uppercase ${isDark ? "text-green-400 hover:text-green-300" : "text-green-700 hover:text-green-800"} transition-colors`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download as PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsightsModal;
