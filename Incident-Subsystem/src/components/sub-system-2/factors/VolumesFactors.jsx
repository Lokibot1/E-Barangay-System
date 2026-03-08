import React, { useState, useEffect } from "react";
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
  { ageGroup: "0-18", value: 120 },
  { ageGroup: "19-30", value: 200 },
  { ageGroup: "31-45", value: 150 },
  { ageGroup: "46-60", value: 90 },
  { ageGroup: "60+", value: 50 },
];

// Sample Gender Distribution Data
const genderDistribution = [
  { name: "Male", value: 250 },
  { name: "Female", value: 310 },
  { name: "Other", value: 15 },
];

// Colors for gender bars
const GENDER_COLORS = ["#3B82F6", "#EC4899", "#FACC15"];

const VolumesFactors = ({ t, isDark, currentTheme = "modern" }) => {
  const factorTheme = getFactorTheme(currentTheme);

  // State for BID, COI, COR counts
  const [reportShare, setReportShare] = useState([
    { name: "BID", value: 0 },
    { name: "COI", value: 0 },
    { name: "COR", value: 0 },
  ]);

  // Tooltip styling
  const tooltipStyle = {
    borderRadius: "10px",
    border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
    backgroundColor: isDark ? "#1e293b" : "#ffffff",
    fontSize: "12px",
    color: isDark ? "#e2e8f0" : "#1e293b",
  };

  // Fetch request counts from Laravel API
  useEffect(() => {
    async function fetchRequestCounts() {
      try {
        const response = await fetch(
          "http://127.0.0.1:8001/api/request-counts"
        ); // <- Laravel API URL
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* BID, COI, COR Pie Chart */}
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
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
          </PieChart>
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
    </div>
  );
};

export default VolumesFactors;