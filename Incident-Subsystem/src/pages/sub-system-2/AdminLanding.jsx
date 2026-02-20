import React, { useEffect, useMemo, useState } from "react";
import themeTokens from "../../Themetokens";
import { getUser } from "../../services/sub-system-3/loginService";
import sanBartolomeImg from "../../assets/css/images/SanBartolome.jpg";
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
  LineChart,
  Line,
} from "recharts";

const CHART_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];

const reportShare = [
  { name: "BID", value: 44 },
  { name: "COR", value: 31 },
  { name: "COI", value: 25 },
];

const monthlyDemandForecast = [
  { month: "Jan", BID: 120, COR: 90, COI: 70 },
  { month: "Feb", BID: 135, COR: 96, COI: 74 },
  { month: "Mar", BID: 142, COR: 102, COI: 78 },
  { month: "Apr", BID: 155, COR: 110, COI: 84 },
  { month: "May", BID: 163, COR: 118, COI: 88 },
  { month: "Jun", BID: 171, COR: 126, COI: 92 },
];

const residentVsNonResident = [
  { name: "Resident", value: 368 },
  { name: "Non-Resident", value: 104 },
];

const queueProcessingTime = [
  { type: "BID", minutes: 18 },
  { type: "COR", minutes: 12 },
  { type: "COI", minutes: 15 },
];

const backlogRate = [
  { week: "W1", rate: 8 },
  { week: "W2", rate: 10 },
  { week: "W3", rate: 9 },
  { week: "W4", rate: 7 },
];

const heatmapRows = [
  { hour: "8-10 AM", mon: 14, tue: 16, wed: 13, thu: 18, fri: 12 },
  { hour: "10-12 NN", mon: 20, tue: 21, wed: 19, thu: 24, fri: 17 },
  { hour: "1-3 PM", mon: 17, tue: 18, wed: 16, thu: 19, fri: 14 },
  { hour: "3-5 PM", mon: 9, tue: 11, wed: 10, thu: 12, fri: 8 },
];

const indigencyDemographic = [
  { group: "Low Income", value: 58 },
  { group: "Unemployed", value: 24 },
  { group: "Senior", value: 10 },
  { group: "PWD", value: 8 },
];

const ageGenderDistribution = [
  { age: "18-24", male: 36, female: 42 },
  { age: "25-34", male: 49, female: 53 },
  { age: "35-44", male: 34, female: 37 },
  { age: "45+", male: 29, female: 31 },
];

const purposeOfRequests = [
  { name: "Employment", value: 34 },
  { name: "Scholarship", value: 22 },
  { name: "Medical", value: 20 },
  { name: "Legal", value: 14 },
  { name: "Other", value: 10 },
];

const transactionSummary = [
  { service: "BID", total: 210, approved: 186, pending: 24 },
  { service: "COR", total: 148, approved: 132, pending: 16 },
  { service: "COI", total: 114, approved: 101, pending: 13 },
];

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

const ChartCard = ({ title, t, isDark, children }) => (
  <div className={`${t.cardBg} border ${t.cardBorder} rounded-xl p-4 shadow-sm`}>
    <h3 className={`font-spartan text-base font-bold ${t.cardText} mb-3`}>{title}</h3>
    {children}
  </div>
);

const AdminLanding = () => {
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem("appTheme") || "blue");

  useEffect(() => {
    const handleThemeChange = (e) => setCurrentTheme(e.detail);
    window.addEventListener("themeChange", handleThemeChange);
    return () => window.removeEventListener("themeChange", handleThemeChange);
  }, []);

  const t = themeTokens[currentTheme];
  const isDark = currentTheme === "dark";
  const user = getUser();
  const firstName = user?.name?.split(" ")[0] || "Admin";

  const totalTransactions = useMemo(
    () => transactionSummary.reduce((sum, row) => sum + row.total, 0),
    []
  );

  return (
    <div className="flex flex-col min-h-full">
      <div className="relative w-full h-[340px] sm:h-[420px] overflow-hidden">
        <img src={sanBartolomeImg} alt="Barangay Gulod" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex flex-col justify-center h-full px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto w-full">
          <p className="text-white/90 text-lg font-semibold font-kumbh mb-2">Hi, {firstName}!</p>
          <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold font-spartan leading-tight text-left">
            Document Services Analytics
          </h1>
          <p className="text-white/85 text-base sm:text-lg font-kumbh mt-3 text-left max-w-3xl">
            Volumes, operations, socio-economy, and transaction insights for BID, COR, and COI requests.
          </p>
        </div>
      </div>

      <div className={`${t.pageBg} px-6 sm:px-10 lg:px-16 py-6`}>
        <div className="max-w-7xl mx-auto w-full space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`${t.cardBg} border ${t.cardBorder} rounded-xl p-4`}>
              <p className={`text-xs uppercase font-kumbh ${t.subtleText}`}>BID/COR/COI Reports</p>
              <p className={`text-3xl font-spartan font-bold ${t.cardText} mt-1`}>{totalTransactions}</p>
            </div>
            <div className={`${t.cardBg} border ${t.cardBorder} rounded-xl p-4`}>
              <p className={`text-xs uppercase font-kumbh ${t.subtleText}`}>Queue Processing Avg</p>
              <p className={`text-3xl font-spartan font-bold ${t.cardText} mt-1`}>15 min</p>
            </div>
            <div className={`${t.cardBg} border ${t.cardBorder} rounded-xl p-4`}>
              <p className={`text-xs uppercase font-kumbh ${t.subtleText}`}>Backlog Rate</p>
              <p className={`text-3xl font-spartan font-bold ${t.cardText} mt-1`}>8.5%</p>
            </div>
          </div>

          <h2 className={`font-spartan text-2xl font-bold ${t.cardText}`}>Volumes</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartCard title="Chart of Percentage of Reports (BID/COR/COI)" t={t} isDark={isDark}>
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

            <ChartCard title="Monthly Demand Forecast" t={t} isDark={isDark}>
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

            <ChartCard title="Resident and Non-Resident Requests" t={t} isDark={isDark}>
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

          <h2 className={`font-spartan text-2xl font-bold ${t.cardText}`}>Operations</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartCard title="Queue Processing Time" t={t} isDark={isDark}>
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

            <ChartCard title="Backlog Rate" t={t} isDark={isDark}>
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

            <ChartCard title="Queue Heatmap (Busiest Time of Day)" t={t} isDark={isDark}>
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

          <h2 className={`font-spartan text-2xl font-bold ${t.cardText}`}>Socio-Economy</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartCard title="Indigency Demographic" t={t} isDark={isDark}>
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

            <ChartCard title="Age / Gender Distribution" t={t} isDark={isDark}>
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

            <ChartCard title="Purpose of Requests" t={t} isDark={isDark}>
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

          <h2 className={`font-spartan text-2xl font-bold ${t.cardText}`}>Reports & Transactions</h2>
          <div className={`${t.cardBg} border ${t.cardBorder} rounded-xl p-4 overflow-x-auto`}>
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className={`border-b ${t.cardBorder}`}>
                  <th className={`py-2 pr-4 font-spartan text-sm ${t.cardText}`}>Service</th>
                  <th className={`py-2 pr-4 font-spartan text-sm ${t.cardText}`}>Total Transactions</th>
                  <th className={`py-2 pr-4 font-spartan text-sm ${t.cardText}`}>Approved</th>
                  <th className={`py-2 pr-4 font-spartan text-sm ${t.cardText}`}>Pending</th>
                </tr>
              </thead>
              <tbody>
                {transactionSummary.map((row) => (
                  <tr key={row.service} className={`border-b ${t.cardBorder}`}>
                    <td className={`py-2 pr-4 font-kumbh ${t.cardText}`}>{row.service}</td>
                    <td className={`py-2 pr-4 font-kumbh ${t.cardText}`}>{row.total}</td>
                    <td className="py-2 pr-4 font-kumbh text-green-600">{row.approved}</td>
                    <td className="py-2 pr-4 font-kumbh text-amber-600">{row.pending}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLanding;
