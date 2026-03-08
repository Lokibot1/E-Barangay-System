import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import ChartCard from "./ChartCard";
import { getFactorTheme } from "./chartTheme";
import {
  CHART_COLORS,
  GENDER_COLORS,
  indigencyDemographic,
  ageGenderDistribution,
  purposeOfRequests,
} from "./data";

const SocioEconomyFactors = ({ t, isDark, currentTheme = "modern" }) => {
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
      
    <ChartCard title="Age / Gender Distribution" subtitle="Population split by cohort" rightLabel="Cohorts" t={t} currentTheme={currentTheme}>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={ageGenderDistribution}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#E5E7EB"} />
          <XAxis dataKey="age" tick={{ fontSize: 11, fill: isDark ? "#CBD5E1" : "#475569" }} />
          <YAxis tick={{ fontSize: 12, fill: isDark ? "#CBD5E1" : "#475569" }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Bar dataKey="male" stackId="a" fill={GENDER_COLORS.male} radius={[8, 8, 0, 0]} />
          <Bar dataKey="female" stackId="a" fill={GENDER_COLORS.female} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>

    <ChartCard title="Purpose of Requests" subtitle="Service intent breakdown" rightLabel="Distribution" t={t} currentTheme={currentTheme}>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={purposeOfRequests} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={44} outerRadius={78} paddingAngle={2} label>
            {purposeOfRequests.map((entry, index) => (
              <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
    </div>
  );
};

export default SocioEconomyFactors;
