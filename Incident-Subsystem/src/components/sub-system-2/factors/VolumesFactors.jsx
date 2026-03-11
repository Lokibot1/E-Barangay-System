import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable"; // optional for tables
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

// Sample Age Distribution Data
const ageDistribution = [
  { ageGroup: "18-25", value: 120 },
  { ageGroup: "26-35", value: 150 },
  { ageGroup: "36-45", value: 170 },
];

// Colors for gender bars
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

  const generateInsightPDF = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString();

    // --- Document Title ---
    doc.setFontSize(12);
    doc.setTextColor("#1F2937");
    doc.setFont("helvetica", "bold");
    doc.text(
      "Insight Report: Barangay ID, Certificate of Indigency, Certificate of Residency Requests",
      14,
      20
    );

    // --- Subtitle with Date ---
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#4B5563");
    doc.text(`Date Generated: ${today}`, 14, 28);

    // --- Section Header for Request Type ---
    doc.setDrawColor("#6366F1");
    doc.setLineWidth(0.8);
    doc.line(14, 32, 196, 32);

    doc.setFontSize(13);
    doc.setTextColor("#1F2937");
    doc.setFont("helvetica", "bold");
    doc.text("Insights & Recommendations:", 14, 40);

    let y = 48;

    // --- BID, COI, COR Insights ---
    reportShare.forEach((item) => {
      let recommendation = "";
      let suggestion = "";

      if (item.value > 200) {
        recommendation = "High volume: Ensure sufficient staffing.";
        suggestion = "Consider streamlining the request process.";
      } else if (item.value < 50) {
        recommendation = "Low volume: Investigate potential underreporting.";
        suggestion = "Promote awareness or simplify access for citizens.";
      } else {
        recommendation = "Moderate volume: Maintain current workflow.";
        suggestion = "Monitor for any sudden spikes or drops.";
      }

      const boxHeight = 30;
      const boxWidth = 182;
      const colorMap = { BID: "#FACC15", COI: "#3B82F6", COR: "#EC4899" };
      doc.setFillColor(colorMap[item.name] || "#9CA3AF");
      doc.roundedRect(14, y - 12, boxWidth, boxHeight, 3, 3, "F");

      doc.setTextColor("#111827");
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`${item.name}: ${item.value} requests`, 18, y);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Recommendation: ${recommendation}`, 18, y + 6);
      doc.text(`Suggestion: ${suggestion}`, 18, y + 12);

      y += 38;
    });

    // --- Section Header for Gender Insights ---
    doc.setDrawColor("#10B981");
    doc.setLineWidth(0.8);
    doc.line(14, y - 10, 196, y - 10);

    doc.setFontSize(13);
    doc.setTextColor("#1F2937");
    doc.setFont("helvetica", "bold");
    doc.text("Gender Insights:", 14, y);

    y += 8;

    // --- Gender Insights ---
    const totalGender = genderDistribution.reduce((sum, g) => sum + g.value, 0);
    genderDistribution.forEach((g) => {
      const percentage = totalGender > 0 ? ((g.value / totalGender) * 100).toFixed(1) : 0;
      let insight = "";

      if (percentage > 60) {
        insight = `Majority of requests (${percentage}%) are from ${g.name}. Consider outreach to other genders.`;
      } else if (percentage < 40) {
        insight = `Minority of requests (${percentage}%) are from ${g.name}. Promote services to ensure inclusivity.`;
      } else {
        insight = `Balanced distribution (${percentage}%) for ${g.name}. Maintain current engagement.`;
      }

      const boxHeight = 20;
      const boxWidth = 182;
      const colorMapGender = { Male: "#3B82F6", Female: "#EC4899" };
      doc.setFillColor(colorMapGender[g.name] || "#9CA3AF");
      doc.roundedRect(14, y - 10, boxWidth, boxHeight, 3, 3, "F");

      doc.setTextColor("#111827");
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`${g.name}: ${g.value} requests`, 18, y);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Insight: ${insight}`, 18, y + 6);

      y += 30;
    });

    // --- Footer ---
    doc.setFontSize(9);
    doc.setTextColor("#6B7280");
    doc.text("Generated by Barangay Insights System", 14, 280);

    doc.save(`insight-report-${today}.pdf`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Hidden download button */}
      <button
        onClick={generateInsightPDF}
        className="hidden"
        id="downloadInsight"
      >
        Download Insight
      </button>

      {/* BID, COI, COR Pie Chart */}
      <ChartCard
        title="Chart Report of BID, COI, COR"
        subtitle="Distribution by request type"
        rightLabel={
          <div className="flex items-center justify-end gap-2">
            <span>Overview</span>
            {/* 3-dot menu button */}
            <button
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => {
                document.getElementById("downloadInsight")?.click();
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600 dark:text-gray-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          </div>
        }
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
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
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
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "#334155" : "#E5E7EB"}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: isDark ? "#CBD5E1" : "#475569" }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: isDark ? "#CBD5E1" : "#475569" }}
              allowDecimals={false}
            />
            <Tooltip contentStyle={tooltipStyle} />
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

      {/* Age Distribution Chart */}
      <ChartCard
        title="Age Reports"
        subtitle="Requests by Age Group"
        rightLabel="Live"
        t={t}
        currentTheme={currentTheme}
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ageDistribution}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "#334155" : "#E5E7EB"}
            />
            <XAxis
              dataKey="ageGroup"
              tick={{ fontSize: 12, fill: isDark ? "#CBD5E1" : "#475569" }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: isDark ? "#CBD5E1" : "#475569" }}
              allowDecimals={false}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#6366F1" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Gender Distribution Chart */}
      {/* <ChartCard
        title="Gender Reports"
        subtitle="Requests by Gender"
        rightLabel="Live"
        t={t}
        currentTheme={currentTheme}
      >
        <ResponsiveContainer width="110%" height={300}>
          <BarChart data={genderDistribution}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "#334155" : "#E5E7EB"}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: isDark ? "#CBD5E1" : "#475569" }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: isDark ? "#CBD5E1" : "#475569" }}
              allowDecimals={false}
            />
            <Tooltip contentStyle={tooltipStyle} />
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
      </ChartCard> */}
    </div>
  );
};

export default VolumesFactors;