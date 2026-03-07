import React from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import ChartCard from "./ChartCard";
import { getFactorTheme } from "./chartTheme";
import { queueProcessingTime, backlogRate, heatmapRows, HEATMAP_CLASSES, REPORT_TYPE_COLORS } from "./data";

const HeatCell = ({ value, isDark }) => {
  let bg = HEATMAP_CLASSES.low;
  if (value >= 20) bg = HEATMAP_CLASSES.peak;
  else if (value >= 15) bg = HEATMAP_CLASSES.high;
  else if (value >= 10) bg = HEATMAP_CLASSES.medium;

  return (
    <div className={`h-9 rounded-md flex items-center justify-center text-xs font-kumbh font-bold ${bg} ${isDark ? "text-slate-900" : "text-gray-800"}`}>
      {value}
    </div>
  );
};

const OperationsFactors = ({ t, isDark, currentTheme = "modern" }) => {
  const factorTheme = getFactorTheme(currentTheme);
  const tooltipStyle = {
    borderRadius: "10px",
    border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
    backgroundColor: isDark ? "#1e293b" : "#ffffff",
    fontSize: "12px",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <ChartCard title="Queue Processing Time" subtitle="Average minutes per request type" rightLabel="Ops" t={t} currentTheme={currentTheme}>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={queueProcessingTime}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#E5E7EB"} />
          <XAxis dataKey="type" tick={{ fontSize: 12, fill: isDark ? "#CBD5E1" : "#475569" }} />
          <YAxis tick={{ fontSize: 12, fill: isDark ? "#CBD5E1" : "#475569" }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="minutes" radius={[8, 8, 0, 0]}>
            {queueProcessingTime.map((entry) => (
              <Cell key={entry.type} fill={REPORT_TYPE_COLORS[entry.type] || "#6366f1"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>

    <ChartCard title="Backlog Rate" subtitle="Weekly pending ratio" rightLabel="Weekly" t={t} currentTheme={currentTheme}>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={backlogRate}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#E5E7EB"} />
          <XAxis dataKey="week" tick={{ fontSize: 12, fill: isDark ? "#CBD5E1" : "#475569" }} />
          <YAxis unit="%" tick={{ fontSize: 12, fill: isDark ? "#CBD5E1" : "#475569" }} />
          <Tooltip
            formatter={(value) => `${value}%`}
            contentStyle={tooltipStyle}
          />
          <Line type="monotone" dataKey="rate" stroke="#F59E0B" strokeWidth={2.6} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>

    <ChartCard title="Queue Heatmap (Busiest Time of Day)" subtitle="Weekly activity intensity" rightLabel="Heatmap" t={t} currentTheme={currentTheme}>
      <div className="grid grid-cols-6 gap-2 text-center">
        <div className={`text-xs font-kumbh font-bold ${t.subtleText}`} />
        {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
          <div key={day} className={`text-xs font-kumbh font-bold ${t.subtleText}`}>{day}</div>
        ))}
        {heatmapRows.map((row) => (
          <React.Fragment key={row.hour}>
            <div className={`text-xs font-kumbh flex items-center ${t.cardText}`}>{row.hour}</div>
            <HeatCell value={row.mon} isDark={isDark} />
            <HeatCell value={row.tue} isDark={isDark} />
            <HeatCell value={row.wed} isDark={isDark} />
            <HeatCell value={row.thu} isDark={isDark} />
            <HeatCell value={row.fri} isDark={isDark} />
          </React.Fragment>
        ))}
      </div>
    </ChartCard>
    </div>
  );
};

export default OperationsFactors;
