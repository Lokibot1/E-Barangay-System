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
import {
  CHART_COLORS,
  reportShare,
  monthlyDemandForecast,
  residentVsNonResident,
} from "./data";

const VolumesFactors = ({ t, isDark }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <ChartCard title="Chart of Percentage of Reports (BID/COR/COI)" t={t}>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={reportShare} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={80} label>
            {reportShare.map((entry, index) => (
              <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>

    <ChartCard title="Monthly Demand Forecast" t={t}>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={monthlyDemandForecast}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#E5E7EB"} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: isDark ? "#CBD5E1" : "#475569" }} />
          <YAxis tick={{ fontSize: 12, fill: isDark ? "#CBD5E1" : "#475569" }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Line type="monotone" dataKey="BID" stroke="#3B82F6" strokeWidth={2} />
          <Line type="monotone" dataKey="COR" stroke="#10B981" strokeWidth={2} />
          <Line type="monotone" dataKey="COI" stroke="#F59E0B" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>

    <ChartCard title="Resident and Non-Resident Requests" t={t}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={residentVsNonResident}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#E5E7EB"} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: isDark ? "#CBD5E1" : "#475569" }} />
          <YAxis tick={{ fontSize: 12, fill: isDark ? "#CBD5E1" : "#475569" }} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  </div>
);

export default VolumesFactors;
