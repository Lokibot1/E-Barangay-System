import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";
import ChartCard from "./ChartCard";
import { getFactorTheme } from "./chartTheme";
import {
  CHART_COLORS,
  REPORT_TYPE_COLORS,
  RESIDENT_REQUEST_COLORS,
  reportShare,
  monthlyDemandForecast,
  residentVsNonResident,
} from "./data";

const VolumesFactors = ({ t, isDark, currentTheme = "modern" }) => {
  const factorTheme = getFactorTheme(currentTheme);
  const tooltipStyle = {
    borderRadius: "10px",
    border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
    backgroundColor: isDark ? "#1e293b" : "#ffffff",
    fontSize: "12px",
    color: isDark ? "#e2e8f0" : "#1e293b",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <ChartCard title="Chart of Percentage of Reports (BID/COR/COI)" subtitle="Distribution by request type" rightLabel="Overview" t={t} currentTheme={currentTheme}>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={reportShare} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={52} outerRadius={84} paddingAngle={2} label>
            {reportShare.map((entry, index) => (
              <Cell key={entry.name} fill={REPORT_TYPE_COLORS[entry.name] || CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>

    <ChartCard title="Monthly Demand Forecast" subtitle="Projection Jan to Jun" rightLabel="6 months" t={t} currentTheme={currentTheme}>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={monthlyDemandForecast}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#E5E7EB"} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: isDark ? "#CBD5E1" : "#475569" }} />
          <YAxis tick={{ fontSize: 12, fill: isDark ? "#CBD5E1" : "#475569" }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Line type="monotone" dataKey="BID" stroke={REPORT_TYPE_COLORS.BID} strokeWidth={2.6} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="COR" stroke={REPORT_TYPE_COLORS.COR} strokeWidth={2.6} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="COI" stroke={REPORT_TYPE_COLORS.COI} strokeWidth={2.6} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>

    <ChartCard title="Resident and Non-Resident Requests" subtitle="Request source comparison" rightLabel="Live" t={t} currentTheme={currentTheme}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={residentVsNonResident}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#E5E7EB"} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: isDark ? "#CBD5E1" : "#475569" }} />
          <YAxis tick={{ fontSize: 12, fill: isDark ? "#CBD5E1" : "#475569" }} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {residentVsNonResident.map((entry, index) => (
              <Cell key={entry.name} fill={RESIDENT_REQUEST_COLORS[index % RESIDENT_REQUEST_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
    </div>
  );
};

export default VolumesFactors;
