import React, { useEffect, useMemo, useState } from "react";
import themeTokens from "../../Themetokens";
import { getUser } from "../../services/sub-system-3/loginService";
import sanBartolomeImg from "../../assets/css/images/SanBartolome.jpg";
import VolumesFactors from "../../components/sub-system-2/factors/VolumesFactors";
import OperationsFactors from "../../components/sub-system-2/factors/OperationsFactors";
import SocioEconomyFactors from "../../components/sub-system-2/factors/SocioEconomyFactors";
import ReportsSection from "../../components/sub-system-2/reports/ReportsSection";
import AccountsSection from "../../components/sub-system-2/accounts/AccountsSection";
import { totalTransactionCount } from "../../components/sub-system-2/accounts/data";

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
    () => totalTransactionCount,
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
          <VolumesFactors t={t} isDark={isDark} />

          <h2 className={`font-spartan text-2xl font-bold ${t.cardText}`}>Operations</h2>
          <OperationsFactors t={t} isDark={isDark} />

          <h2 className={`font-spartan text-2xl font-bold ${t.cardText}`}>Socio-Economy</h2>
          <SocioEconomyFactors t={t} isDark={isDark} />

          <h2 className={`font-spartan text-2xl font-bold ${t.cardText}`}>Reports</h2>
          <ReportsSection />

          <h2 className={`font-spartan text-2xl font-bold ${t.cardText}`}>Transactions</h2>
          <AccountsSection />
        </div>
      </div>
    </div>
  );
};

export default AdminLanding;
