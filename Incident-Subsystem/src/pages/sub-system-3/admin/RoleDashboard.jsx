// import React, { useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import themeTokens from "../../../Themetokens";
// import { getUserRole } from "../../../homepage/services/loginService";
// import { getRoleLabel, normalizeRole } from "../../../utils/roles";

// const DashboardShell = ({ title, subtitle, cards }) => {
//   const navigate = useNavigate();
//   const currentTheme = useMemo(
//     () => localStorage.getItem("appTheme") || "modern",
//     [],
//   );
//   const t = themeTokens[currentTheme] || themeTokens.modern;
//   const isDark = currentTheme === "dark";

//   return (
//     <div className={`min-h-full ${t.pageBg} px-4 sm:px-6 py-6 font-kumbh`}>
//       <div className="max-w-6xl mx-auto space-y-5">
//         <div className="text-left">
//           <h1 className={`text-xl sm:text-2xl font-bold font-spartan ${t.cardText}`}>
//             {title}
//           </h1>
//           {subtitle ? (
//             <p className={`mt-1 text-sm ${t.subtleText}`}>{subtitle}</p>
//           ) : null}
//         </div>

//         <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
//           {cards.map((card) => (
//             <button
//               key={card.path}
//               type="button"
//               onClick={() => navigate(card.path)}
//               className={`text-left rounded-2xl border p-4 transition-colors ${
//                 isDark
//                   ? "border-slate-800 bg-slate-900/60 hover:bg-slate-900"
//                   : "border-slate-200 bg-white hover:bg-slate-50"
//               }`}
//             >
//               <p className={`text-sm font-semibold ${t.cardText}`}>{card.title}</p>
//               <p className={`mt-1 text-[12px] ${t.subtleText}`}>{card.description}</p>
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// const RoleDashboard = () => {
//   const role = normalizeRole(getUserRole());

//   const cards = [];

//   // Shared layout for Admin + Staff 1/2/3
//   if (role === "admin" || role === "super_admin" || role === "staff1") {
//     cards.push(
//       { title: "Analytics", description: "Overview reports and metrics.", path: "/admin/reports" },
//       { title: "Verification", description: "Review pending verifications.", path: "/admin/user-management" },
//       { title: "Residents", description: "Search and manage resident records.", path: "/admin/residents" },
//       { title: "Households", description: "View and update household information.", path: "/admin/households" },
//     );
//   }

//   if (role === "admin" || role === "super_admin" || role === "staff2") {
//     cards.push(
//       { title: "Case Tracker", description: "Incident/complaint case management.", path: "/admin/incidents" },
//       { title: "Requests", description: "View requests queue.", path: "/admin/requests" },
//       { title: "Appointments", description: "Manage appointments.", path: "/admin/appointments" },
//     );
//   }

//   if (role === "admin" || role === "super_admin" || role === "staff3") {
//     cards.push(
//       { title: "Payments", description: "Payments and account-related tracking.", path: "/admin/payments" },
//       { title: "Issuance Application", description: "Document issuance applications.", path: "/admin/documents-inquiry" },
//       { title: "Certificates", description: "Certificate modules.", path: "/admin/certificates" },
//     );
//   }

//   if (role === "admin" || role === "super_admin") {
//     cards.push(
//       { title: "Account Management", description: "Create and manage staff accounts.", path: "/admin/accounts" },
//       { title: "System Settings", description: "Branding, settings, and activity logs.", path: "/admin/settings" },
//     );
//   }

//   // Always available within back-office layout
//   cards.push({ title: "Profile", description: "View your profile and activity.", path: "/admin/profile" });

//   // Dedupe in case roles overlap (super_admin/admin)
//   const uniqueCards = Array.from(new Map(cards.map((c) => [c.path, c])).values());

//   return (
//     <DashboardShell
//       title="Dashboard"
//       subtitle={role ? `Signed in as ${getRoleLabel(role)}` : ""}
//       cards={uniqueCards}
//     />
//   );
// };

// export default RoleDashboard;

