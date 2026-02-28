// import React, { useState, useEffect } from "react";
// import AnalyticsCard from "../components/common/analyticscard";
// import {
//   MapPin, Lightbulb, ChevronRight, X, AlertTriangle, TrendingUp,
//   Users, Heart, Shield, Baby, GraduationCap, Briefcase, Home,
//   Activity, Bell, CheckCircle, Clock, ArrowUp, ArrowDown, Minus,
//   FileText, Zap, Target
// } from "lucide-react";
// import {
//   PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
//   LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
//   AreaChart, Area
// } from "recharts";

// // ─── Mock extended data (merge with your real getAnalyticsData) ───────────────
// const MOCK_EXTENDED = {
//   healthMetrics: {
//     hypertension: 142,
//     diabetes: 87,
//     malnutrition: 31,
//     dengue: 12,
//     vaccinationRate: 78,
//   },
//   livelihood: {
//     employed: 640,
//     unemployed: 210,
//     selfEmployed: 155,
//     student: 320,
//   },
//   housing: {
//     owned: 512,
//     rented: 198,
//     informal: 94,
//     sharedLiving: 62,
//   },
//   educationAttainment: [
//     { level: "No Schooling", count: 18 },
//     { level: "Elementary", count: 134 },
//     { level: "High School", count: 287 },
//     { level: "Vocational", count: 96 },
//     { level: "College", count: 312 },
//     { level: "Post-Grad", count: 44 },
//   ],
//   monthlyIncidents: [
//     { month: "Aug", incidents: 4 },
//     { month: "Sep", incidents: 7 },
//     { month: "Oct", incidents: 3 },
//     { month: "Nov", incidents: 6 },
//     { month: "Dec", incidents: 9 },
//     { month: "Jan", incidents: 5 },
//   ],
//   ageGroupDistribution: [
//     { group: "0-12", count: 198, label: "Children" },
//     { group: "13-17", count: 143, label: "Teens" },
//     { group: "18-35", count: 387, label: "Young Adults" },
//     { group: "36-59", count: 302, label: "Middle-Aged" },
//     { group: "60+", count: 161, label: "Senior" },
//   ],
//   beneficiaryPrograms: [
//     { program: "4Ps / Pantawid", enrolled: 134, eligible: 160 },
//     { program: "AICS", enrolled: 88, eligible: 120 },
//     { program: "TUPAD", enrolled: 55, eligible: 90 },
//     { program: "PhilHealth", enrolled: 710, eligible: 866 },
//     { program: "Solo Parent ID", enrolled: 42, eligible: 58 },
//   ],
//   purokDistribution: [
//     { name: "Purok 1", count: 420, seniors: 62, pwd: 18, minors: 97, employed: 190, healthCases: 45 },
//     { name: "Purok 2", count: 310, seniors: 44, pwd: 22, minors: 68, employed: 120, healthCases: 38 },
//     { name: "Purok 3", count: 185, seniors: 28, pwd: 9,  minors: 41, employed: 80,  healthCases: 19 },
//     { name: "Purok 4", count: 251, seniors: 38, pwd: 14, minors: 55, employed: 110, healthCases: 27 },
//     { name: "Purok 5", count: 180, seniors: 20, pwd: 7,  minors: 39, employed: 78,  healthCases: 14 },
//     { name: "Purok 6", count: 390, seniors: 57, pwd: 20, minors: 82, employed: 170, healthCases: 41 },
//     { name: "Purok 7", count: 110, seniors: 12, pwd: 4,  minors: 22, employed: 42,  healthCases: 8  },
//     { name: "Purok 8", count: 220, seniors: 31, pwd: 11, minors: 48, employed: 90,  healthCases: 22 },
//   ],
//   registeredVoters: [
//     { name: "Registered", value: 980, color: "#10b981" },
//     { name: "Unregistered", value: 286, color: "#f97316" },
//   ],
//   genderDistribution: [
//     { name: "Male", value: 645, color: "#3b82f6" },
//     { name: "Female", value: 621, color: "#ec4899" },
//   ],
// };

// // ─── Recommendation Engine ────────────────────────────────────────────────────
// function generateRecommendations(data) {
//   const recs = [];
//   const { healthMetrics, livelihood, housing, beneficiaryPrograms, purokDistribution } = data;

//   // Health
//   const highHyp = healthMetrics.hypertension > 100;
//   if (highHyp) recs.push({
//     id: "hlth-hyp",
//     priority: "high",
//     icon: Heart,
//     category: "Health",
//     title: "Hypertension Management Program",
//     detail: `${healthMetrics.hypertension} residents have recorded hypertension — above safe thresholds. Launch a monthly BP monitoring outreach and partner with RHU for free maintenance meds.`,
//     action: "Schedule Outreach",
//     affectedCount: healthMetrics.hypertension,
//   });

//   if (healthMetrics.malnutrition > 20) recs.push({
//     id: "hlth-mal",
//     priority: "high",
//     icon: Baby,
//     category: "Health",
//     title: "Child Nutrition Supplementation",
//     detail: `${healthMetrics.malnutrition} children are at-risk or malnourished. Activate Supplementary Feeding Program and coordinate with DSWD for Pamana ng Bata support.`,
//     action: "Coordinate with DSWD",
//     affectedCount: healthMetrics.malnutrition,
//   });

//   if (healthMetrics.vaccinationRate < 80) recs.push({
//     id: "hlth-vax",
//     priority: "medium",
//     icon: Shield,
//     category: "Health",
//     title: "Boost Vaccination Coverage",
//     detail: `Current vaccination rate is ${healthMetrics.vaccinationRate}%. Conduct a barangay vaccination drive targeting the remaining ${100 - healthMetrics.vaccinationRate}% of the population.`,
//     action: "Plan Vaccination Drive",
//     affectedCount: Math.round(1266 * (1 - healthMetrics.vaccinationRate / 100)),
//   });

//   // Livelihood
//   const unempRate = ((livelihood.unemployed / (livelihood.employed + livelihood.unemployed)) * 100).toFixed(1);
//   if (parseFloat(unempRate) > 20) recs.push({
//     id: "liv-unemp",
//     priority: "high",
//     icon: Briefcase,
//     category: "Livelihood",
//     title: "Unemployment Intervention Needed",
//     detail: `${unempRate}% unemployment rate (${livelihood.unemployed} residents). Endorse for TUPAD or DOLE SPES program, and coordinate with TESDA for skills training vouchers.`,
//     action: "Endorse to DOLE",
//     affectedCount: livelihood.unemployed,
//   });

//   // Housing
//   if (housing.informal > 80) recs.push({
//     id: "hous-inf",
//     priority: "medium",
//     icon: Home,
//     category: "Housing",
//     title: "Informal Settlers Documentation",
//     detail: `${housing.informal} households are in informal/makeshift housing. Begin community mapping for NHA relocation assistance and SHFC loan referrals.`,
//     action: "Begin Mapping",
//     affectedCount: housing.informal,
//   });

//   // Beneficiary programs — gaps
//   beneficiaryPrograms.forEach(prog => {
//     const gap = prog.eligible - prog.enrolled;
//     const gapPct = Math.round((gap / prog.eligible) * 100);
//     if (gapPct > 20) recs.push({
//       id: `prog-${prog.program}`,
//       priority: gapPct > 40 ? "high" : "medium",
//       icon: Target,
//       category: "Social Services",
//       title: `${prog.program} Enrollment Gap`,
//       detail: `Only ${prog.enrolled} of ${prog.eligible} eligible residents are enrolled in ${prog.program} (${gapPct}% gap). Conduct a benefits awareness campaign to maximize coverage.`,
//       action: "Run Info Drive",
//       affectedCount: gap,
//     });
//   });

//   // Purok hotspot
//   const topPurok = [...purokDistribution].sort((a, b) => b.healthCases - a.healthCases)[0];
//   recs.push({
//     id: "purok-health",
//     priority: "medium",
//     icon: MapPin,
//     category: "Area-Based",
//     title: `Health Hotspot: ${topPurok.name}`,
//     detail: `${topPurok.name} has the highest number of recorded health cases (${topPurok.healthCases}). Prioritize mobile clinic deployment in this area this quarter.`,
//     action: "Deploy Mobile Clinic",
//     affectedCount: topPurok.healthCases,
//   });

//   return recs.sort((a, b) => (a.priority === "high" ? -1 : b.priority === "high" ? 1 : 0));
// }

// // ─── Priority Badge ───────────────────────────────────────────────────────────
// const PriorityBadge = ({ level }) => {
//   const styles = {
//     high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
//     medium: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
//     low: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
//   };
//   return (
//     <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${styles[level]}`}>
//       {level}
//     </span>
//   );
// };

// // ─── Stat Mini Card ───────────────────────────────────────────────────────────
// const StatMini = ({ label, value, icon: Icon, color = "emerald", trend }) => {
//   const colors = {
//     emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
//     orange: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
//     blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
//     red: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
//     pink: "text-pink-600 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-400",
//   };
//   return (
//     <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl">
//       <div className={`p-2 rounded-xl ${colors[color]}`}>
//         {Icon && <Icon size={14} />}
//       </div>
//       <div>
//         <p className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">{label}</p>
//         <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">{value}</p>
//       </div>
//       {trend !== undefined && (
//         <div className="ml-auto">
//           {trend > 0 ? <ArrowUp size={12} className="text-red-500" /> :
//            trend < 0 ? <ArrowDown size={12} className="text-emerald-500" /> :
//            <Minus size={12} className="text-slate-400" />}
//         </div>
//       )}
//     </div>
//   );
// };

// // ─── Section Header ───────────────────────────────────────────────────────────
// const SectionHeader = ({ icon: Icon, title, subtitle }) => (
//   <div className="flex items-center gap-3 mb-4">
//     <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
//       {Icon && <Icon size={16} />}
//     </div>
//     <div>
//       <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{title}</h2>
//       {subtitle && <p className="text-[10px] text-slate-400 font-medium">{subtitle}</p>}
//     </div>
//   </div>
// );

// // ─── Main Component ───────────────────────────────────────────────────────────
// export default function Analytics() {
//   const [baseData, setBaseData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [activeFilter, setActiveFilter] = useState("total");
//   const [selectedPurok, setSelectedPurok] = useState(null);
//   const [activeTab, setActiveTab] = useState("overview");
//   const [dismissedRecs, setDismissedRecs] = useState([]);

//   useEffect(() => {
//     const load = async () => {
//       // Merge your real API data with extended mock data
//       // const result = await getAnalyticsData();
//       setBaseData(MOCK_EXTENDED);
//       setLoading(false);
//     };
//     load();
//   }, []);

//   if (loading || !baseData) return (
//     <div className="p-8 text-emerald-600 dark:text-emerald-400 font-black uppercase text-xs tracking-widest animate-pulse">
//       Loading Analytics Data...
//     </div>
//   );

//   const data = baseData;
//   const recommendations = generateRecommendations(data).filter(r => !dismissedRecs.includes(r.id));

//   const displayData = data.purokDistribution.map(p => ({
//     ...p,
//     currentCount: activeFilter === "total" ? p.count :
//                   activeFilter === "health" ? p.healthCases : p[activeFilter]
//   }));

//   const getBoxStyle = (count, filter) => {
//     const thresholds = filter === "total" ? [350, 180] :
//                        filter === "health" ? [35, 20] :
//                        [50, 20];
//     if (count >= thresholds[0]) return "bg-red-500 text-white border-red-600 shadow-lg shadow-red-500/20";
//     if (count >= thresholds[1]) return "bg-orange-500 text-white border-orange-600 shadow-lg shadow-orange-500/20";
//     return "bg-emerald-500 text-white border-emerald-600";
//   };

//   const totalPop = data.genderDistribution.reduce((s, i) => s + i.value, 0);
//   const unempRate = ((data.livelihood.unemployed / (data.livelihood.employed + data.livelihood.unemployed)) * 100).toFixed(1);

//   const TABS = [
//     { id: "overview", label: "Overview" },
//     { id: "health", label: "Health" },
//     { id: "livelihood", label: "Livelihood" },
//     { id: "housing", label: "Housing" },
//     { id: "programs", label: "Programs" },
//   ];

//   return (
//     <div className="space-y-6 animate-in fade-in duration-500 transition-colors">
//       {/* Page Header */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div>
//           <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
//             Barangay Analytics
//           </h1>
//           <p className="text-xs text-slate-400 font-medium mt-0.5">Data-driven insights & recommended actions</p>
//         </div>
//         <div className="flex items-center gap-2">
//           {recommendations.filter(r => r.priority === "high").length > 0 && (
//             <div className="flex items-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-[10px] font-black uppercase">
//               <Bell size={12} />
//               {recommendations.filter(r => r.priority === "high").length} urgent actions
//             </div>
//           )}
//         </div>
//       </div>

//       {/* KPI Strip */}
//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//         <StatMini label="Total Population" value={totalPop.toLocaleString()} icon={Users} color="emerald" />
//         <StatMini label="Unemployment" value={`${unempRate}%`} icon={Briefcase} color="orange" trend={1} />
//         <StatMini label="Health Cases" value={data.healthMetrics.hypertension + data.healthMetrics.diabetes} icon={Heart} color="red" trend={1} />
//         <StatMini label="Vaccination Rate" value={`${data.healthMetrics.vaccinationRate}%`} icon={Shield} color="blue" trend={-1} />
//       </div>

//       {/* Tab Navigation */}
//       <div className="flex overflow-x-auto bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-1 rounded-2xl shadow-sm gap-1 no-scrollbar">
//         {TABS.map(tab => (
//           <button
//             key={tab.id}
//             onClick={() => setActiveTab(tab.id)}
//             className={`flex-shrink-0 px-4 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${
//               activeTab === tab.id
//                 ? "bg-emerald-600 text-white shadow-sm"
//                 : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
//             }`}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       {/* ── OVERVIEW TAB ── */}
//       {activeTab === "overview" && (
//         <div className="space-y-6">
//           {/* Heat Map */}
//           <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm p-6 rounded-2xl">
//             <div className="flex flex-wrap items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
//               <SectionHeader icon={MapPin} title="District Heat Map" subtitle="Density by category" />
//               <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
//                 {['total', 'seniors', 'pwd', 'minors', 'health'].map(id => (
//                   <button key={id} onClick={() => setActiveFilter(id)}
//                     className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${
//                       activeFilter === id ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'
//                     }`}>
//                     {id}
//                   </button>
//                 ))}
//               </div>
//             </div>
//             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//               {displayData.map((p, i) => (
//                 <div key={i} onClick={() => setSelectedPurok(p)}
//                   className={`p-5 rounded-2xl border-2 transition-all cursor-pointer hover:scale-[1.03] active:scale-[0.98] ${getBoxStyle(p.currentCount, activeFilter)}`}>
//                   <div className="flex justify-between items-start mb-3">
//                     <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">{p.name}</span>
//                     <MapPin size={12} className="opacity-40" />
//                   </div>
//                   <div className="text-4xl font-black tracking-tighter">{p.currentCount ?? "—"}</div>
//                   <p className="text-[9px] font-bold uppercase opacity-60 mt-1">{activeFilter}</p>
//                 </div>
//               ))}
//             </div>
//             <div className="flex items-center gap-6 mt-4 text-[9px] font-black uppercase text-slate-400">
//               <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-red-500 rounded-full inline-block" /> High</span>
//               <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-orange-500 rounded-full inline-block" /> Moderate</span>
//               <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-emerald-500 rounded-full inline-block" /> Low</span>
//             </div>
//           </div>

//           {/* Population Charts Row */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             <AnalyticsCard title="Registered Voters">
//               <ResponsiveContainer width="100%" height={160}>
//                 <PieChart>
//                   <Pie data={data.registeredVoters} cx="50%" cy="50%" outerRadius={60} dataKey="value"
//                     label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
//                     {data.registeredVoters.map((e, i) => <Cell key={i} fill={e.color} />)}
//                   </Pie>
//                   <Tooltip formatter={(v) => `${v} voters`} />
//                 </PieChart>
//               </ResponsiveContainer>
//               <div className="mt-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/30 rounded-xl text-center">
//                 <p className="text-[9px] font-bold uppercase text-slate-400">Registration Rate</p>
//                 <p className="text-xl font-black text-slate-900 dark:text-white">
//                   {Math.round((data.registeredVoters[0].value / (data.registeredVoters[0].value + data.registeredVoters[1].value)) * 100)}%
//                 </p>
//               </div>
//             </AnalyticsCard>

//             <AnalyticsCard title="Gender Distribution">
//               <ResponsiveContainer width="100%" height={160}>
//                 <PieChart>
//                   <Pie data={data.genderDistribution} cx="50%" cy="50%" outerRadius={60} dataKey="value"
//                     label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
//                     {data.genderDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
//                   </Pie>
//                   <Tooltip formatter={(v) => `${v} residents`} />
//                 </PieChart>
//               </ResponsiveContainer>
//               <div className="mt-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/30 rounded-xl text-center">
//                 <p className="text-[9px] font-bold uppercase text-slate-400">Total Population</p>
//                 <p className="text-xl font-black text-slate-900 dark:text-white">{totalPop}</p>
//               </div>
//             </AnalyticsCard>

//             <AnalyticsCard title="Age Group Distribution">
//               <ResponsiveContainer width="100%" height={200}>
//                 <BarChart data={data.ageGroupDistribution} layout="vertical" margin={{ left: 8 }}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
//                   <XAxis type="number" tick={{ fontSize: 9, fontWeight: 700 }} />
//                   <YAxis type="category" dataKey="group" tick={{ fontSize: 9, fontWeight: 700 }} width={36} />
//                   <Tooltip formatter={(v, n, p) => [`${v} residents`, p.payload.label]} />
//                   <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </AnalyticsCard>
//           </div>
//         </div>
//       )}

//       {/* ── HEALTH TAB ── */}
//       {activeTab === "health" && (
//         <div className="space-y-6">
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//             <StatMini label="Hypertension" value={data.healthMetrics.hypertension} icon={Heart} color="red" trend={1} />
//             <StatMini label="Diabetes" value={data.healthMetrics.diabetes} icon={Activity} color="orange" />
//             <StatMini label="Malnutrition" value={data.healthMetrics.malnutrition} icon={Baby} color="pink" trend={1} />
//             <StatMini label="Dengue Cases" value={data.healthMetrics.dengue} icon={AlertTriangle} color="orange" />
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-2xl">
//               <SectionHeader icon={Activity} title="Monthly Incidents" subtitle="Barangay health incidents over 6 months" />
//               <ResponsiveContainer width="100%" height={200}>
//                 <AreaChart data={data.monthlyIncidents}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
//                   <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 700 }} />
//                   <YAxis tick={{ fontSize: 10, fontWeight: 700 }} />
//                   <Tooltip />
//                   <Area type="monotone" dataKey="incidents" stroke="#ef4444" fill="#fee2e2" strokeWidth={2} />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </div>

//             <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-2xl">
//               <SectionHeader icon={Shield} title="Vaccination Status" />
//               <div className="flex flex-col items-center justify-center h-40 gap-4">
//                 <div className="relative w-32 h-32">
//                   <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
//                     <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="12" />
//                     <circle cx="60" cy="60" r="50" fill="none" stroke="#10b981" strokeWidth="12"
//                       strokeDasharray={`${2 * Math.PI * 50 * data.healthMetrics.vaccinationRate / 100} ${2 * Math.PI * 50}`}
//                       strokeLinecap="round" />
//                   </svg>
//                   <div className="absolute inset-0 flex flex-col items-center justify-center">
//                     <span className="text-2xl font-black text-slate-900 dark:text-white">{data.healthMetrics.vaccinationRate}%</span>
//                     <span className="text-[9px] font-bold text-slate-400 uppercase">Vaccinated</span>
//                   </div>
//                 </div>
//                 <p className="text-xs text-slate-500 text-center">
//                   <span className="font-black text-orange-500">{100 - data.healthMetrics.vaccinationRate}%</span> of residents still need vaccination coverage
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-2xl">
//             <SectionHeader icon={MapPin} title="Health Cases by Purok" />
//             <ResponsiveContainer width="100%" height={200}>
//               <BarChart data={data.purokDistribution}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
//                 <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700 }} />
//                 <YAxis tick={{ fontSize: 9, fontWeight: 700 }} />
//                 <Tooltip />
//                 <Bar dataKey="healthCases" fill="#ef4444" radius={[6, 6, 0, 0]} name="Health Cases" />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       )}

//       {/* ── LIVELIHOOD TAB ── */}
//       {activeTab === "livelihood" && (
//         <div className="space-y-6">
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//             <StatMini label="Employed" value={data.livelihood.employed} icon={Briefcase} color="emerald" />
//             <StatMini label="Unemployed" value={data.livelihood.unemployed} icon={AlertTriangle} color="red" trend={1} />
//             <StatMini label="Self-Employed" value={data.livelihood.selfEmployed} icon={TrendingUp} color="blue" />
//             <StatMini label="Students" value={data.livelihood.student} icon={GraduationCap} color="orange" />
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-2xl">
//               <SectionHeader icon={Briefcase} title="Employment Breakdown" />
//               <ResponsiveContainer width="100%" height={220}>
//                 <PieChart>
//                   <Pie
//                     data={[
//                       { name: "Employed", value: data.livelihood.employed, color: "#10b981" },
//                       { name: "Unemployed", value: data.livelihood.unemployed, color: "#ef4444" },
//                       { name: "Self-Employed", value: data.livelihood.selfEmployed, color: "#3b82f6" },
//                       { name: "Student", value: data.livelihood.student, color: "#f97316" },
//                     ]}
//                     cx="50%" cy="50%" outerRadius={80} dataKey="value"
//                     label={({ name, value }) => `${name}: ${value}`} labelLine={false}
//                   >
//                     {[{ color: "#10b981" }, { color: "#ef4444" }, { color: "#3b82f6" }, { color: "#f97316" }].map((e, i) =>
//                       <Cell key={i} fill={e.color} />)}
//                   </Pie>
//                   <Tooltip />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>

//             <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-2xl">
//               <SectionHeader icon={GraduationCap} title="Education Attainment" />
//               <ResponsiveContainer width="100%" height={220}>
//                 <BarChart data={data.educationAttainment} layout="vertical">
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
//                   <XAxis type="number" tick={{ fontSize: 9, fontWeight: 700 }} />
//                   <YAxis type="category" dataKey="level" tick={{ fontSize: 9, fontWeight: 700 }} width={70} />
//                   <Tooltip />
//                   <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── HOUSING TAB ── */}
//       {activeTab === "housing" && (
//         <div className="space-y-6">
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//             <StatMini label="Owned" value={data.housing.owned} icon={Home} color="emerald" />
//             <StatMini label="Rented" value={data.housing.rented} icon={FileText} color="blue" />
//             <StatMini label="Informal Settlers" value={data.housing.informal} icon={AlertTriangle} color="red" trend={1} />
//             <StatMini label="Shared Living" value={data.housing.sharedLiving} icon={Users} color="orange" />
//           </div>

//           <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-2xl">
//             <SectionHeader icon={Home} title="Housing Tenure Distribution" />
//             <ResponsiveContainer width="100%" height={240}>
//               <BarChart
//                 data={[
//                   { type: "Owned", count: data.housing.owned, fill: "#10b981" },
//                   { type: "Rented", count: data.housing.rented, fill: "#3b82f6" },
//                   { type: "Informal", count: data.housing.informal, fill: "#ef4444" },
//                   { type: "Shared", count: data.housing.sharedLiving, fill: "#f97316" },
//                 ]}
//               >
//                 <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
//                 <XAxis dataKey="type" tick={{ fontSize: 10, fontWeight: 700 }} />
//                 <YAxis tick={{ fontSize: 10, fontWeight: 700 }} />
//                 <Tooltip />
//                 <Bar dataKey="count" radius={[8, 8, 0, 0]}>
//                   {[{ fill: "#10b981" }, { fill: "#3b82f6" }, { fill: "#ef4444" }, { fill: "#f97316" }].map((e, i) =>
//                     <Cell key={i} fill={e.fill} />)}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       )}

//       {/* ── PROGRAMS TAB ── */}
//       {activeTab === "programs" && (
//         <div className="space-y-6">
//           <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-2xl">
//             <SectionHeader icon={Target} title="Beneficiary Program Coverage" subtitle="Enrolled vs. eligible residents" />
//             <div className="space-y-4 mt-2">
//               {data.beneficiaryPrograms.map((prog, i) => {
//                 const pct = Math.round((prog.enrolled / prog.eligible) * 100);
//                 const gap = prog.eligible - prog.enrolled;
//                 return (
//                   <div key={i} className="space-y-1.5">
//                     <div className="flex justify-between items-center">
//                       <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{prog.program}</span>
//                       <div className="flex items-center gap-3">
//                         <span className="text-[10px] text-slate-400 font-bold">{prog.enrolled}/{prog.eligible}</span>
//                         <span className={`text-[10px] font-black ${pct >= 80 ? 'text-emerald-600' : pct >= 60 ? 'text-orange-500' : 'text-red-500'}`}>{pct}%</span>
//                         {gap > 0 && <span className="text-[9px] text-red-500 font-black bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">-{gap} gap</span>}
//                       </div>
//                     </div>
//                     <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
//                       <div
//                         className={`h-full rounded-full transition-all duration-700 ${pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-orange-500' : 'bg-red-500'}`}
//                         style={{ width: `${pct}%` }}
//                       />
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── RECOMMENDATIONS PANEL ── */}
//       <div className="space-y-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400">
//               <Lightbulb size={16} />
//             </div>
//             <div>
//               <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Recommended Actions</h2>
//               <p className="text-[10px] text-slate-400 font-medium">AI-generated from current barangay data</p>
//             </div>
//           </div>
//           <span className="text-[10px] font-black uppercase text-slate-400">{recommendations.length} actions</span>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {recommendations.map((rec) => {
//             const Icon = rec.icon;
//             return (
//               <div key={rec.id}
//                 className={`relative bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm transition-all hover:shadow-md ${
//                   rec.priority === "high"
//                     ? "border-red-200 dark:border-red-900/50"
//                     : "border-gray-200 dark:border-slate-800"
//                 }`}
//               >
//                 <button
//                   onClick={() => setDismissedRecs(prev => [...prev, rec.id])}
//                   className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 transition-colors"
//                 >
//                   <X size={14} />
//                 </button>

//                 <div className="flex items-start gap-3 mb-3">
//                   <div className={`p-2 rounded-xl flex-shrink-0 ${
//                     rec.priority === "high"
//                       ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
//                       : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
//                   }`}>
//                     <Icon size={16} />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center gap-2 flex-wrap mb-1">
//                       <PriorityBadge level={rec.priority} />
//                       <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{rec.category}</span>
//                     </div>
//                     <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight leading-tight">
//                       {rec.title}
//                     </h3>
//                   </div>
//                 </div>

//                 <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4 pl-1">
//                   {rec.detail}
//                 </p>

//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-400">
//                     <Users size={10} />
//                     {rec.affectedCount} affected
//                   </div>
//                   <button className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase rounded-xl transition-all active:scale-95 ${
//                     rec.priority === "high"
//                       ? "bg-red-600 hover:bg-red-500 text-white"
//                       : "bg-emerald-600 hover:bg-emerald-500 text-white"
//                   }`}>
//                     <Zap size={10} />
//                     {rec.action}
//                   </button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {recommendations.length === 0 && (
//           <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
//             <CheckCircle size={40} className="text-emerald-500" />
//             <p className="font-black text-slate-700 dark:text-slate-300 uppercase text-sm">All Clear!</p>
//             <p className="text-xs text-slate-400">No pending recommended actions. Great job, Barangay!</p>
//           </div>
//         )}
//       </div>

//       {/* Purok Detail Modal */}
//       {selectedPurok && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
//           <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
//             <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
//               <div>
//                 <h3 className="font-black text-slate-800 dark:text-white uppercase text-sm">{selectedPurok.name}</h3>
//                 <p className="text-[10px] text-slate-400 font-medium mt-0.5">Full population breakdown</p>
//               </div>
//               <button onClick={() => setSelectedPurok(null)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
//                 <X size={18} />
//               </button>
//             </div>
//             <div className="p-6 space-y-3">
//               <ModalRow label="Total Residents" val={selectedPurok.count} highlight />
//               <ModalRow label="Senior Citizens" val={selectedPurok.seniors} />
//               <ModalRow label="PWD Population" val={selectedPurok.pwd} />
//               <ModalRow label="Minors" val={selectedPurok.minors} />
//               <ModalRow label="Employed" val={selectedPurok.employed} />
//               <ModalRow label="Recorded Health Cases" val={selectedPurok.healthCases} warn={selectedPurok.healthCases > 30} />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// const ModalRow = ({ label, val, highlight, warn }) => (
//   <div className={`flex justify-between items-center p-4 rounded-2xl border transition-colors ${
//     highlight ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" :
//     warn ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" :
//     "bg-slate-50 dark:bg-slate-800/30 border-transparent hover:border-slate-100 dark:hover:border-slate-700"
//   }`}>
//     <span className={`text-xs font-bold uppercase tracking-tighter ${
//       warn ? "text-red-500" : "text-slate-500 dark:text-slate-400"
//     }`}>{label}</span>
//     <span className={`font-black ${
//       highlight ? "text-emerald-700 dark:text-emerald-400" :
//       warn ? "text-red-600 dark:text-red-400" :
//       "text-slate-900 dark:text-white"
//     }`}>{val}</span>
//   </div>
// );