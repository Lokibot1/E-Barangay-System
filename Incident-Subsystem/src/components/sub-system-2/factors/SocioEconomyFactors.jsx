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
import {
  CHART_COLORS,
  indigencyDemographic,
  ageGenderDistribution,
  purposeOfRequests,
} from "./data";

const SocioEconomyFactors = ({ t, isDark }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <ChartCard title="Indigency Demographic" t={t}>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={indigencyDemographic}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#E5E7EB"} />
          <XAxis dataKey="group" tick={{ fontSize: 11, fill: isDark ? "#CBD5E1" : "#475569" }} />
          <YAxis tick={{ fontSize: 12, fill: isDark ? "#CBD5E1" : "#475569" }} />
          <Tooltip />
          <Bar dataKey="value" fill="#F97316" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>

    <ChartCard title="Age / Gender Distribution" t={t}>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={ageGenderDistribution}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#E5E7EB"} />
          <XAxis dataKey="age" tick={{ fontSize: 11, fill: isDark ? "#CBD5E1" : "#475569" }} />
          <YAxis tick={{ fontSize: 12, fill: isDark ? "#CBD5E1" : "#475569" }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Bar dataKey="male" stackId="a" fill="#3B82F6" />
          <Bar dataKey="female" stackId="a" fill="#EC4899" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>

    <ChartCard title="Purpose of Requests" t={t}>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={purposeOfRequests} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={76} label>
            {purposeOfRequests.map((entry, index) => (
              <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  </div>
);

export default SocioEconomyFactors;
