import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import ChartCard from "./ChartCard";
import { getFactorTheme } from "./chartTheme";
import { CHART_COLORS, REPORT_TYPE_COLORS } from "./data";

const GENDER_COLORS = ["#3B82F6", "#EC4899", "#FACC15"];

const VolumesFactors = ({ t, isDark, currentTheme = "modern" }) => {
  const factorTheme = getFactorTheme(currentTheme);

  const [reportShare, setReportShare] = useState([
    { name: "BID", value: 0 },
    { name: "COI", value: 0 },
    { name: "COR", value: 0 },
  ]);

  const [genderDistribution, setGenderDistribution] = useState([
    { name: "Male", value: 0 },
    { name: "Female", value: 0 },
  ]);

  const [ageDistribution, setAgeDistribution] = useState([
    { ageGroup: "18-25", value: 0 },
    { ageGroup: "26-35", value: 0 },
    { ageGroup: "36-45", value: 0 },
    { ageGroup: "46-60", value: 0 },
    { ageGroup: "60+", value: 0 },
  ]);

  const tooltipStyle = {
    borderRadius: "10px",
    border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
    backgroundColor: isDark ? "#1e293b" : "#ffffff",
    fontSize: "12px",
    color: isDark ? "#e2e8f0" : "#1e293b",
  };

  useEffect(() => {
    async function fetchRequestCounts() {
      try {
        const response = await fetch(
          "http://127.0.0.1:8001/api/request-counts"
        );
        const data = await response.json();

        setReportShare([
          { name: "BID", value: data.bid },
          { name: "COI", value: data.coi },
          { name: "COR", value: data.cor },
        ]);
      } catch (error) {
        console.error("Failed to fetch request counts:", error);
      }
    }
    fetchRequestCounts();
  }, []);

  useEffect(() => {
    async function fetchGenderCounts() {
      try {
        const response = await fetch("http://127.0.0.1:8001/api/gender-counts");
        const data = await response.json();

        setGenderDistribution([
          { name: "Male", value: data.Male },
          { name: "Female", value: data.Female },
        ]);
      } catch (error) {
        console.error("Failed to fetch gender counts:", error);
      }
    }

    fetchGenderCounts();
  }, []);

  useEffect(() => {
    async function fetchAgeCounts() {
      try {
        const response = await fetch("http://127.0.0.1:8001/api/age-counts");
        const data = await response.json();

        setAgeDistribution([
          { ageGroup: "18-25", value: data["18-25"] },
          { ageGroup: "26-35", value: data["26-35"] },
          { ageGroup: "36-45", value: data["36-45"] },
          { ageGroup: "46-60", value: data["46-60"] },
          { ageGroup: "60+", value: data["60+"] },
        ]);
      } catch (error) {
        console.error("Failed to fetch age counts:", error);
      }
    }

    fetchAgeCounts();
  }, []);

  const generateInsightPDF = () => {
  const doc = new jsPDF();
  const today = new Date().toLocaleDateString();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentX = 14;
  const contentWidth = pageWidth - 28;
  const footerY = pageHeight - 16;

  const totalRequests = reportShare.reduce((sum, item) => sum + item.value, 0);

  const getPercentage = (value, total) =>
    total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";

  const ensurePageSpace = (currentY, requiredHeight) => {
    if (currentY + requiredHeight <= footerY - 8) {
      return currentY;
    }
    doc.addPage();
    return 20;
  };

  const drawInfoBox = ({ y, fillColor, title, lines }) => {
    const textX = contentX + 4;
    const titleLines = doc.splitTextToSize(title, contentWidth - 8);
    const wrappedLines = lines.flatMap((line) =>
      doc.splitTextToSize(line, contentWidth - 8)
    );

    const lineHeight = 6;
    const boxHeight =
      10 + titleLines.length * lineHeight + wrappedLines.length * lineHeight;

    const nextY = ensurePageSpace(y, boxHeight + 8);

    doc.setFillColor(fillColor);
    doc.roundedRect(contentX, nextY, contentWidth, boxHeight, 3, 3, "F");

    doc.setTextColor("#111827");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(titleLines, textX, nextY + 8);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(
      wrappedLines,
      textX,
      nextY + 8 + titleLines.length * lineHeight
    );

    return nextY + boxHeight + 8;
  };

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(
    doc.splitTextToSize(
      "Insight Report: Barangay ID, Certificate of Indigency, Certificate of Residency Requests",
      contentWidth
    ),
    contentX,
    20
  );

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Date Generated: ${today}`, contentX, 32);

  doc.line(contentX, 36, pageWidth - contentX, 36);

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Request Type Insights:", contentX, 44);

  let y = 50;

  reportShare.forEach((item) => {
    let recommendation = "";
    let suggestion = "";

    const percentage = getPercentage(item.value, totalRequests);

    if (item.value > 200) {
      recommendation = "High volume: Ensure sufficient staffing.";
      suggestion = "Consider streamlining the request process.";
    } else if (item.value < 50) {
      recommendation = "Low volume: Investigate potential underreporting.";
      suggestion = "Promote awareness or simplify access for citizens.";
    } else {
      recommendation = "Moderate volume: Maintain current workflow.";
      suggestion = "Monitor sudden spikes or drops.";
    }

    const colorMap = { BID: "#FACC15", COI: "#3B82F6", COR: "#EC4899" };

    y = drawInfoBox({
      y,
      fillColor: colorMap[item.name] || "#9CA3AF",
      title: `${item.name}: ${item.value} requests (${percentage}%)`,
      lines: [
        `Recommendation: ${recommendation}`,
        `Suggestion: ${suggestion}`,
      ],
    });
  });

  // -------------------------
  // GENDER INSIGHTS
  // -------------------------

  y = ensurePageSpace(y + 6, 40);

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Gender Insights:", contentX, y);

  y += 10;

  const totalGender = genderDistribution.reduce((sum, g) => sum + g.value, 0);

  genderDistribution.forEach((g) => {
    const percentage = getPercentage(g.value, totalGender);

    let insight = "";

    if (percentage > 60) {
      insight = `Majority of requests (${percentage}%) come from ${g.name}.`;
    } else if (percentage < 40) {
      insight = `Lower participation (${percentage}%) from ${g.name}. Consider outreach programs.`;
    } else {
      insight = `Balanced participation (${percentage}%) from ${g.name}.`;
    }

    const colorMap = { Male: "#3B82F6", Female: "#EC4899" };

    y = drawInfoBox({
      y,
      fillColor: colorMap[g.name] || "#9CA3AF",
      title: `${g.name}: ${g.value} requests (${percentage}%)`,
      lines: [`Insight: ${insight}`],
    });
  });

  // -------------------------
  // AGE INSIGHTS
  // -------------------------

  y = ensurePageSpace(y + 6, 40);

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Age Group Insights:", contentX, y);

  y += 10;

  const totalAge = ageDistribution.reduce((sum, a) => sum + a.value, 0);

  ageDistribution.forEach((a) => {
    const percentage = getPercentage(a.value, totalAge);

    let insight = "";

    if (percentage > 35) {
      insight = `This age group represents the highest request participation.`;
    } else if (percentage < 10) {
      insight = `Low request activity detected for this age group. Outreach may be needed.`;
    } else {
      insight = `Moderate request activity from this age group.`;
    }

    y = drawInfoBox({
      y,
      fillColor: "#6366F1",
      title: `${a.ageGroup}: ${a.value} requests (${percentage}%)`,
      lines: [`Insight: ${insight}`],
    });
  });

  doc.setFontSize(9);
  doc.text("Generated by Barangay Insights System", contentX, footerY);

  // PDF PREVIEW
  const blobURL = doc.output("bloburl");
  window.open(blobURL);
};

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Issuance Application Factors
        </h2>

        <button
          onClick={generateInsightPDF}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
        >
          Preview the Insight
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard
          title="Chart Report of BID, COI, COR"
          subtitle="Distribution by request type"
          rightLabel="Overview"
          t={t}
          currentTheme={currentTheme}
        >
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={reportShare}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                innerRadius={52}
                outerRadius={84}
                paddingAngle={2}
                label
              >
                {reportShare.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={
                      REPORT_TYPE_COLORS[entry.name] ||
                      CHART_COLORS[index % CHART_COLORS.length]
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Gender Reports"
          subtitle="Requests by Gender"
          rightLabel="Live"
          t={t}
          currentTheme={currentTheme}
        >
          <ResponsiveContainer width="110%" height={300}>
            <BarChart data={genderDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {genderDistribution.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={GENDER_COLORS[index % GENDER_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Age Reports"
          subtitle="Requests by Age Group"
          rightLabel="Live"
          t={t}
          currentTheme={currentTheme}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ageGroup" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#6366F1" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default VolumesFactors;