import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  FileText,
  ShieldCheck,
  Users,
} from "lucide-react";
import themeTokens from "../../Themetokens";
import {
  canAccessVerificationQueue,
  canViewAppointments,
  canViewDocuments,
  canViewIncidentCases,
  canViewResidents,
} from "../../homepage/services/loginService";
import { residentService } from "../../services/sub-system-1/residents";
import { incidentService } from "../../services/sub-system-3/incidentService";
import { getAllComplaints } from "../../services/sub-system-3/complaintService";
import { DOCUMENTS_API_BASE_URL } from "../../config/runtimeApi";
import { requestJson } from "../../services/shared/http";

const isPendingVerification = (resident) => {
  const status = String(
    resident?.status ||
      resident?.status_label ||
      resident?.verification_status ||
      "",
  ).toLowerCase();

  return [
    "pending",
    "for review",
    "submitted",
    "under review",
    "unverified",
  ].some((value) => status.includes(value));
};

const isOpenCase = (record) => {
  const status = String(record?.status || "").toLowerCase();
  return ![
    "resolved",
    "completed",
    "closed",
    "dismissed",
    "rejected",
    "denied",
  ].includes(status);
};

const isPendingDocument = (record) => {
  const status = String(record?.status || "").toLowerCase();
  return ![
    "released",
    "completed",
    "approved",
    "claimed",
    "done",
  ].includes(status);
};

const isSameDay = (value, compareDate = new Date()) => {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return false;

  return (
    date.getFullYear() === compareDate.getFullYear() &&
    date.getMonth() === compareDate.getMonth() &&
    date.getDate() === compareDate.getDate()
  );
};

const staffScopeItems = [
  "Can process residents, verification, documents, appointments, and cases.",
  "Cannot access account creation, payments, CMS, or system settings.",
  "Analytics-heavy admin reports stay exclusive to the admin panel.",
];

const SectionHeader = ({ title, description, t }) => (
  <div className="flex flex-col items-start text-left">
    <h2 className={`text-[1.4rem] font-bold font-spartan ${t.cardText}`}>
      {title}
    </h2>
    <p className={`mt-1.5 text-[14px] leading-6 font-kumbh ${t.subtleText}`}>
      {description}
    </p>
  </div>
);

const SummaryCard = ({
  title,
  value,
  caption,
  icon: Icon,
  themeClass,
  t,
  isDark,
}) => (
  <article
    className={`${t.cardBg} rounded-[20px] border ${t.cardBorder} p-4 shadow-[0_16px_32px_-28px_rgba(15,23,42,0.35)]`}
  >
    <div className="flex items-start justify-between gap-3">
      <p
        className={`max-w-[10rem] text-[9px] font-black uppercase tracking-[0.14em] ${t.subtleText}`}
      >
        {title}
      </p>
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-[16px] ${themeClass} ${
          isDark ? "border border-white/10" : "border border-black/5"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
    </div>
    <div className="mt-4">
      <p
        className={`text-[1.9rem] font-black leading-none font-spartan ${t.cardText}`}
      >
        {value}
      </p>
      <p className={`mt-2 text-[12px] leading-5 font-kumbh ${t.subtleText}`}>
        {caption}
      </p>
    </div>
  </article>
);

const QuickActionCard = ({ action, navigate, t, isDark }) => (
  <button
    type="button"
    onClick={() => navigate(action.path)}
    className={`group rounded-[18px] border p-4 text-left transition ${
      isDark
        ? "border-white/10 bg-slate-900/50 hover:border-white/20 hover:bg-slate-900"
        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className={`text-sm font-bold font-spartan ${t.cardText}`}>
          {action.label}
        </p>
        <p
          className={`mt-2 text-[13px] leading-5 font-kumbh ${t.subtleText}`}
        >
          {action.description}
        </p>
      </div>
      <ChevronRight
        className={`mt-0.5 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${t.subtleText}`}
      />
    </div>
  </button>
);

export default function StaffLanding() {
  const navigate = useNavigate();
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("appTheme") || "modern",
  );
  const [summary, setSummary] = useState({
    pendingVerifications: 0,
    residents: 0,
    pendingDocuments: 0,
    todaysAppointments: 0,
    openCases: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleThemeChange = (event) => {
      setCurrentTheme(event.detail);
    };

    window.addEventListener("themeChange", handleThemeChange);
    return () => window.removeEventListener("themeChange", handleThemeChange);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      setLoading(true);

      try {
        const [
          residentsResult,
          incidentsResult,
          complaintsResult,
          documentsResult,
        ] = await Promise.allSettled([
          residentService.getResidents(),
          incidentService.getAllIncidents(),
          getAllComplaints(),
          requestJson(`${DOCUMENTS_API_BASE_URL}/documents`, {
            errorMessage: "Failed to load document records.",
          }),
        ]);

        if (!isMounted) return;

        const residents =
          residentsResult.status === "fulfilled"
            ? Array.isArray(residentsResult.value)
              ? residentsResult.value
              : []
            : [];
        const incidents =
          incidentsResult.status === "fulfilled"
            ? Array.isArray(incidentsResult.value)
              ? incidentsResult.value
              : incidentsResult.value?.data || []
            : [];
        const complaints =
          complaintsResult.status === "fulfilled"
            ? Array.isArray(complaintsResult.value)
              ? complaintsResult.value
              : complaintsResult.value?.data || []
            : [];
        const documents =
          documentsResult.status === "fulfilled"
            ? Array.isArray(documentsResult.value)
              ? documentsResult.value
              : documentsResult.value?.data || []
            : [];

        const appointments = complaints.flatMap((complaint) =>
          Array.isArray(complaint?.appointments) ? complaint.appointments : [],
        );

        setSummary({
          pendingVerifications: residents.filter(isPendingVerification).length,
          residents: residents.length,
          pendingDocuments: documents.filter(isPendingDocument).length,
          todaysAppointments: appointments.filter((appointment) =>
            isSameDay(appointment?.scheduled_at),
          ).length,
          openCases: [...incidents, ...complaints].filter(isOpenCase).length,
        });
      } catch {
        if (!isMounted) return;
        setSummary({
          pendingVerifications: 0,
          residents: 0,
          pendingDocuments: 0,
          todaysAppointments: 0,
          openCases: 0,
        });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  const t = themeTokens[currentTheme] || themeTokens.modern;
  const isDark = currentTheme === "dark";

  const summaryCards = useMemo(
    () => [
      {
        title: "Pending Verification",
        value: summary.pendingVerifications,
        caption: "Resident accounts waiting for review",
        icon: ShieldCheck,
        themeClass: isDark
          ? "bg-emerald-500/15 text-emerald-300"
          : "bg-emerald-50 text-emerald-600",
      },
      {
        title: "Resident Records",
        value: summary.residents,
        caption: "Current registry entries available",
        icon: Users,
        themeClass: isDark
          ? "bg-sky-500/15 text-sky-300"
          : "bg-sky-50 text-sky-600",
      },
      {
        title: "Pending Documents",
        value: summary.pendingDocuments,
        caption: "Issuance requests still in queue",
        icon: FileText,
        themeClass: isDark
          ? "bg-violet-500/15 text-violet-300"
          : "bg-violet-50 text-violet-600",
      },
      {
        title: "Today's Appointments",
        value: summary.todaysAppointments,
        caption: "Schedules that need staff attention today",
        icon: CalendarDays,
        themeClass: isDark
          ? "bg-amber-500/15 text-amber-300"
          : "bg-amber-50 text-amber-600",
      },
      {
        title: "Open Cases",
        value: summary.openCases,
        caption: "Incidents and complaints not yet closed",
        icon: AlertTriangle,
        themeClass: isDark
          ? "bg-rose-500/15 text-rose-300"
          : "bg-rose-50 text-rose-600",
      },
    ],
    [isDark, summary],
  );

  const quickActions = [
    {
      label: "Verification Queue",
      description: "Review new registrations and profile updates.",
      path: "/staff/user-management",
      allowed: canAccessVerificationQueue(),
    },
    {
      label: "Residents",
      description: "Open resident records and household details.",
      path: "/staff/residents",
      allowed: canViewResidents(),
    },
    {
      label: "Documents",
      description: "Process certificates and document requests.",
      path: "/staff/documents-inquiry",
      allowed: canViewDocuments(),
    },
    {
      label: "Appointments",
      description: "Check scheduled meetings and hearing slots.",
      path: "/staff/appointments",
      allowed: canViewAppointments(),
    },
    {
      label: "Incidents",
      description: "Track incident and complaint case activity.",
      path: "/staff/incidents",
      allowed: canViewIncidentCases(),
    },
  ].filter((item) => item.allowed);

  return (
    <div className={`min-h-full ${t.pageBg} px-4 py-6 sm:px-6 lg:px-8`}>
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="space-y-4 text-left">
          <SectionHeader
            title="Overview"
            description={
              loading
                ? "Refreshing staff counters..."
                : "Quick view of the queues that need attention."
            }
            t={t}
          />

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {summaryCards.map((card) => (
              <SummaryCard
                key={card.title}
                {...card}
                t={t}
                isDark={isDark}
              />
            ))}
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
          <article
            className={`${t.cardBg} rounded-[24px] border ${t.cardBorder} p-6 shadow-[0_16px_36px_-30px_rgba(15,23,42,0.32)]`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-[16px] border ${
                  isDark
                    ? "border-white/10 bg-slate-900/50 text-sky-300"
                    : "border-slate-200 bg-slate-50 text-sky-600"
                }`}
              >
                <ClipboardCheck className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2
                  className={`text-[1.4rem] font-bold font-spartan ${t.cardText}`}
                >
                  Quick Actions
                </h2>
                <p
                  className={`text-[14px] leading-6 font-kumbh ${t.subtleText}`}
                >
                  Open the staff-approved modules from this dashboard.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {quickActions.map((action) => (
                <QuickActionCard
                  key={action.path}
                  action={action}
                  navigate={navigate}
                  t={t}
                  isDark={isDark}
                />
              ))}
            </div>
          </article>

          <article
            className={`${t.cardBg} rounded-[24px] border ${t.cardBorder} p-6 shadow-[0_16px_36px_-30px_rgba(15,23,42,0.32)]`}
          >
            <SectionHeader
              title="Staff Scope"
              description="Clear boundaries for what staff can handle in this workspace."
              t={t}
            />
            <div
              className={`mt-5 rounded-[20px] border ${
                isDark
                  ? "border-white/10 bg-slate-900/40 divide-y divide-white/10"
                  : "border-slate-200 bg-slate-50/80 divide-y divide-slate-200"
              }`}
            >
              {staffScopeItems.map((item) => (
                <div key={item} className="flex items-start gap-3 px-4 py-4">
                  <span
                    className={`mt-2 h-2 w-2 shrink-0 rounded-full ${
                      isDark ? "bg-slate-300" : "bg-slate-400"
                    }`}
                  />
                  <p
                    className={`text-[13px] leading-6 font-kumbh ${
                      isDark ? "text-slate-200" : "text-slate-700"
                    }`}
                  >
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
