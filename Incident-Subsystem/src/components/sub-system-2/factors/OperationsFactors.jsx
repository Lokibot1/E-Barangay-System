import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import ChartCard from "./ChartCard";
import { queueProcessingTime, backlogRate, heatmapRows } from "./data";

const HeatCell = ({ value, isDark }) => {
  let bg = "bg-green-100";
  if (value >= 20) bg = "bg-red-400";
  else if (value >= 15) bg = "bg-amber-300";
  else if (value >= 10) bg = "bg-yellow-200";

  return (
    <div className={`h-9 rounded-md flex items-center justify-center text-xs font-kumbh font-bold ${bg} ${isDark ? "text-slate-900" : "text-gray-800"}`}>
      {value}
    </div>
  );
};

const OperationsFactors = ({ t, isDark }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <ChartCard title="Queue Processing Time" t={t}>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={queueProcessingTime}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#E5E7EB"} />
          <XAxis dataKey="type" tick={{ fontSize: 12, fill: isDark ? "#CBD5E1" : "#475569" }} />
          <YAxis tick={{ fontSize: 12, fill: isDark ? "#CBD5E1" : "#475569" }} />
          <Tooltip />
          <Bar dataKey="minutes" fill="#14B8A6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>

    <ChartCard title="Backlog Rate" t={t}>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={backlogRate}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#E5E7EB"} />
          <XAxis dataKey="week" tick={{ fontSize: 12, fill: isDark ? "#CBD5E1" : "#475569" }} />
          <YAxis unit="%" tick={{ fontSize: 12, fill: isDark ? "#CBD5E1" : "#475569" }} />
          <Tooltip formatter={(value) => `${value}%`} />
          <Line type="monotone" dataKey="rate" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>

    <ChartCard title="Queue Heatmap (Busiest Time of Day)" t={t}>
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

export default OperationsFactors;
