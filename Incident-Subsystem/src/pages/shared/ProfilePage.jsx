import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  MapPinned,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import themeTokens from "../../Themetokens";
import { authService } from "../../homepage/services/authService";
import { getUser, isAdmin } from "../../homepage/services/loginService";
import { getInitials } from "../../utils/avatar";

const MARITAL_STATUS_LABELS = {
  1: "Single",
  2: "Married",
  3: "Living-In",
  4: "Widowed",
  5: "Separated",
  6: "Divorced",
};

const SECTOR_LABELS = {
  1: "Solo Parent",
  2: "PWD",
  3: "Senior Citizen",
  4: "LGBTQIA+",
  5: "Kasambahay",
  6: "OFW",
  7: "General Population",
};

const HOUSEHOLD_POSITION_LABELS = {
  Head: "Head of Family",
  Spouse: "Spouse",
  Son: "Son",
  Daughter: "Daughter",
  Relative: "Relative",
  Househelp: "Househelp",
  Others: "Others",
};

const formatDisplayDate = (value) => {
  if (!value) return "Not provided";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not provided";

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatText = (value, fallback = "Not provided") =>
  value && String(value).trim() ? String(value) : fallback;

const calculateAge = (value) => {
  if (!value) return "";

  const birthDate = new Date(value);
  if (Number.isNaN(birthDate.getTime())) return "";

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age >= 0 ? String(age) : "";
};

const splitNameParts = (value) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return { firstName: "", middleName: "", lastName: "" };
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], middleName: "", lastName: "" };
  }

  return {
    firstName: parts[0] || "",
    middleName: parts.length > 2 ? parts.slice(1, -1).join(" ") : "",
    lastName: parts[parts.length - 1] || "",
  };
};

const buildFullName = (user) => {
  if (!user) return "Barangay User";

  const parts = [
    user.first_name || user.firstName,
    user.middle_name || user.middleName,
    user.last_name || user.lastName,
    user.suffix,
  ]
    .filter(Boolean)
    .map((part) => String(part).trim())
    .filter(Boolean);

  if (parts.length > 0) {
    return parts.join(" ");
  }

  return formatText(user.name, "Barangay User");
};

const normalizeMappedValue = (value, labelMap, fallback = "Not provided") => {
  if (value === null || value === undefined || value === "") return fallback;

  if (typeof value === "object") {
    const objectLabel =
      value.name || value.label || value.status || labelMap[String(value.id)];
    return formatText(objectLabel, fallback);
  }

  const normalized = String(value).trim();
  if (!normalized) return fallback;

  return labelMap[normalized] || normalized;
};

const normalizeYesNo = (value, fallback = "Not provided") => {
  if (value === null || value === undefined || value === "") return fallback;

  if (
    value === true ||
    value === 1 ||
    String(value).toLowerCase() === "yes" ||
    String(value).toLowerCase() === "true"
  ) {
    return "Yes";
  }

  if (
    value === false ||
    value === 0 ||
    String(value).toLowerCase() === "no" ||
    String(value).toLowerCase() === "false"
  ) {
    return "No";
  }

  return fallback;
};

const resolvePurokName = (user, puroks) => {
  const direct =
    user?.purok_name ||
    user?.resolved_purok ||
    (typeof user?.purok === "object"
      ? user.purok.name || `Purok ${user.purok.number || user.purok.id || ""}`.trim()
      : "");

  if (direct) return direct;

  const rawId = user?.temp_purok_id || user?.purok_id || user?.purok;
  if (rawId === null || rawId === undefined || rawId === "") {
    return "Not provided";
  }

  const match = puroks.find((item) => String(item.id) === String(rawId));
  if (match) {
    return match.name || `Purok ${match.number || match.id}`;
  }

  if (typeof rawId === "string" && /[A-Za-z]/.test(rawId)) {
    return rawId;
  }

  return `Purok ${rawId}`;
};

const resolveStreetName = (user, streets) => {
  const direct =
    user?.street_name ||
    (typeof user?.street === "object" ? user.street.name : "");

  if (direct) return direct;

  const rawId = user?.temp_street_id || user?.street_id || user?.street;
  if (rawId === null || rawId === undefined || rawId === "") {
    return "Not provided";
  }

  const match = streets.find((item) => String(item.id) === String(rawId));
  if (match) return match.name || `Street ${match.id}`;

  if (typeof rawId === "string" && /[A-Za-z]/.test(rawId)) {
    return rawId;
  }

  return `Street ${rawId}`;
};

const buildRegisteredAddress = (user, puroks, streets) => {
  if (!user) return "Barangay Gulod, Novaliches, Quezon City";

  const directAddress = user.full_address || user.address;
  if (directAddress) return directAddress;

  const parts = [
    user.temp_house_number || user.house_number || user.houseNumber,
    resolveStreetName(user, streets),
    resolvePurokName(user, puroks),
    "Barangay Gulod, Novaliches, Quezon City",
  ].filter(Boolean);

  return parts.length > 0
    ? parts.filter((part) => part !== "Not provided").join(", ")
    : "Barangay Gulod, Novaliches, Quezon City";
};

const normalizeRoleLabel = (role, adminAccount) => {
  if (!role) return adminAccount ? "Barangay Administrator" : "Resident User";
  if (role === "admin") return "Barangay Administrator";

  return String(role)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const ProfileField = ({
  label,
  value,
  full = false,
  fullClassName = "sm:col-span-2",
  t,
  isDark,
}) => {
  const isMissing = value === "Not provided" || value === "No email on file";

  return (
    <div className={`${full ? fullClassName : ""} text-left`}>
      <div
        className={`h-full rounded-2xl border px-4 py-3.5 sm:px-5 ${
          isDark
            ? "border-slate-700 bg-slate-900/50"
            : "border-slate-200/70 bg-slate-50/85"
        }`}
      >
        <p
          className={`text-left text-[10px] font-semibold uppercase tracking-[0.18em] font-kumbh ${t.subtleText}`}
        >
          {label}
        </p>
        <p
          className={`mt-1.5 break-words text-left text-[15px] font-semibold leading-6 font-kumbh ${
            isMissing ? t.subtleText : t.cardText
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
};

const ProfilePanel = ({
  title,
  subtitle,
  icon: Icon,
  fields,
  gridClassName = "sm:grid-cols-2",
  fullClassName = "sm:col-span-2",
  t,
  isDark,
}) => (
  <section
    className={`${t.cardBg} overflow-hidden rounded-[26px] border ${t.cardBorder} text-left shadow-[0_18px_45px_-32px_rgba(15,23,42,0.28)]`}
  >
    <div
      className={`border-b px-4 py-4 sm:px-5 ${
        isDark ? "border-slate-700" : "border-slate-200"
      }`}
      style={{
        background: isDark
          ? "linear-gradient(135deg, rgba(15,23,42,0.55), rgba(30,41,59,0.35))"
          : "linear-gradient(135deg, rgba(248,250,252,0.98), rgba(241,245,249,0.88))",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl ${
            isDark
              ? "bg-slate-900 text-slate-200"
              : "bg-white text-slate-700 shadow-sm"
          }`}
        >
          <Icon className="h-[18px] w-[18px]" />
        </div>
        <div className="min-w-0">
          <h2 className={`text-base font-bold font-spartan sm:text-lg ${t.cardText}`}>
            {title}
          </h2>
          <p className={`mt-1 text-sm leading-6 font-kumbh ${t.subtleText}`}>
            {subtitle}
          </p>
        </div>
      </div>
    </div>

    <div className={`grid gap-3 px-4 py-4 sm:px-5 sm:py-5 ${gridClassName}`}>
      {fields.map((field) => (
        <ProfileField
          key={`${title}-${field.label}`}
          label={field.label}
          value={field.value}
          full={field.full}
          fullClassName={fullClassName}
          t={t}
          isDark={isDark}
        />
      ))}
    </div>
  </section>
);

export default function ProfilePage() {
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("appTheme") || "modern",
  );
  const [locationRefs, setLocationRefs] = useState({ puroks: [], streets: [] });
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => setCurrentTheme(e.detail);
    window.addEventListener("themeChange", handler);
    return () => window.removeEventListener("themeChange", handler);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadLocations = async () => {
      try {
        const res = await authService.getLocations();
        if (!isMounted) return;

        setLocationRefs({
          puroks: Array.isArray(res?.puroks) ? res.puroks : [],
          streets: Array.isArray(res?.streets) ? res.streets : [],
        });
      } catch {
        if (!isMounted) return;
        setLocationRefs({ puroks: [], streets: [] });
      }
    };

    loadLocations();

    return () => {
      isMounted = false;
    };
  }, []);

  const t = themeTokens[currentTheme] || themeTokens.modern;
  const isDark = currentTheme === "dark";
  const user = useMemo(() => getUser() || {}, []);
  const adminAccount = isAdmin();
  const parsedName = useMemo(() => splitNameParts(user.name), [user.name]);

  const userName = buildFullName(user);
  const userEmail = formatText(user.email, "No email on file");
  const userPhone = formatText(
    user.contact_number || user.contact || user.phone || user.mobile,
  );
  const roleLabel = normalizeRoleLabel(user.role, adminAccount);
  const accountStatus = user.status
    ? normalizeRoleLabel(user.status, false)
    : adminAccount
    ? "Active Staff Account"
    : "Active User Account";
  const trackingNumber = formatText(user.tracking_number || user.trackingNumber);
  const accountId = formatText(
    user.staff_id ||
      user.employee_id ||
      user.barangay_id ||
      user.id,
  );
  const accountUsername = formatText(
    user.username ||
      user.user_name ||
      user.account_name ||
      (user.email ? String(user.email).split("@")[0] : ""),
  );
  const workspaceLabel = adminAccount
    ? "Admin Operations Workspace"
    : "Resident Services Workspace";
  const memberSince = formatDisplayDate(
    user.created_at || user.registered_at || user.updated_at,
  );
  const firstName = formatText(user.first_name || user.firstName || parsedName.firstName);
  const middleName = formatText(
    user.middle_name || user.middleName || parsedName.middleName,
  );
  const lastName = formatText(user.last_name || user.lastName || parsedName.lastName);
  const suffix = formatText(user.suffix, "None");
  const gender = formatText(user.gender || user.sex);
  const birthDate = formatDisplayDate(user.birthdate || user.date_of_birth);
  const age = formatText(user.age || calculateAge(user.birthdate || user.date_of_birth));
  const nationality = formatText(user.nationality, "Filipino");
  const civilStatus = normalizeMappedValue(
    user.marital_status || user.maritalStatus || user.marital_status_id,
    MARITAL_STATUS_LABELS,
  );
  const sector = normalizeMappedValue(
    user.sector_name || user.sector || user.sector_id,
    SECTOR_LABELS,
  );
  const birthRegistration = formatText(
    user.birth_registration || user.birthRegistration,
  );
  const registeredVoter = normalizeYesNo(user.is_voter ?? user.isVoter);
  const purok = resolvePurokName(user, locationRefs.puroks);
  const street = resolveStreetName(user, locationRefs.streets);
  const houseNumber = formatText(
    user.temp_house_number || user.house_number || user.houseNumber,
  );
  const householdPosition = normalizeMappedValue(
    user.household_position || user.householdPosition,
    HOUSEHOLD_POSITION_LABELS,
  );
  const residencyType = formatText(
    user.residency_status || user.residencyStatus,
  );
  const residencyStartDate = formatDisplayDate(
    user.residency_start_date || user.residencyStartDate,
  );
  const registeredAddress = buildRegisteredAddress(
    user,
    locationRefs.puroks,
    locationRefs.streets,
  );
  const infoAccent = isDark ? "text-slate-300" : "text-emerald-500";
  const idLabel = adminAccount
    ? "Staff ID"
    : trackingNumber !== "Not provided"
    ? "Tracking Number"
    : "Account ID";
  const idValue = trackingNumber !== "Not provided" ? trackingNumber : accountId;
  const protectionLabel = adminAccount
    ? "Protected administrator account"
    : "Protected resident account";
  const headerIdentity =
    userEmail !== "No email on file" ? userEmail : `${idLabel}: ${idValue}`;

  const personalFields = [
    { label: "First Name", value: firstName },
    { label: "Middle Name", value: middleName },
    { label: "Last Name", value: lastName },
    { label: "Suffix", value: suffix },
    { label: "Contact Number", value: userPhone },
    { label: "Email Address", value: userEmail },
    { label: "Birthdate", value: birthDate },
    { label: "Age", value: age },
    { label: "Gender", value: gender },
    { label: "Nationality", value: nationality },
    { label: "Marital Status", value: civilStatus },
    { label: "Sector", value: sector },
    { label: "Birth Registration", value: birthRegistration },
    { label: "Registered Voter", value: registeredVoter },
  ];

  const residencyFields = [
    { label: "House No.", value: houseNumber },
    { label: "Purok", value: purok },
    { label: "Street", value: street },
    { label: "Household Position", value: householdPosition },
    { label: "Residency Type", value: residencyType },
    { label: "Date Started", value: residencyStartDate },
    {
      label: "Full Registered Address",
      value: registeredAddress,
      full: true,
    },
  ];

  const accountFields = [
    { label: idLabel, value: idValue },
    { label: "Username", value: accountUsername },
    { label: "Role", value: roleLabel },
    { label: "Status", value: accountStatus },
    { label: "Workspace", value: workspaceLabel },
    { label: "Member Since", value: memberSince },
    {
      label: "Account Protection",
      value: protectionLabel,
      full: true,
    },
  ];

  return (
    <div className={`min-h-full ${t.pageBg} p-4 sm:p-5 lg:p-6`}>
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex w-full justify-start">
          <button
            onClick={() => navigate(-1)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-semibold font-kumbh transition ${
              isDark
                ? "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
        </div>

        <section
          className={`${t.cardBg} relative overflow-hidden rounded-[30px] border ${t.cardBorder} shadow-[0_24px_58px_-36px_rgba(15,23,42,0.35)]`}
        >
          <div
            className={`relative h-[108px] bg-gradient-to-br sm:h-[132px] ${t.primaryGrad}`}
          >
            <div className="absolute inset-0 bg-slate-950/45" />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/30 to-transparent" />
            <div className="absolute -left-10 top-4 h-28 w-28 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute right-4 top-3 h-20 w-20 rounded-full border border-white/10 bg-white/10 blur-2xl" />
            <div className="absolute inset-x-6 bottom-4 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
          </div>
          <div className="relative px-5 pb-5 pt-0 sm:px-6 sm:pb-6 lg:px-7">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <div
                className={`relative -mt-9 flex h-[72px] w-[72px] items-center justify-center rounded-[24px] border-4 ${
                  isDark ? "border-slate-800" : "border-white"
                } bg-gradient-to-br ${t.primaryGrad} text-white shadow-[0_22px_40px_-22px_rgba(15,23,42,0.55)] sm:-mt-11 sm:h-[84px] sm:w-[84px]`}
              >
                <div className="absolute inset-1 rounded-[18px] bg-white/10 sm:rounded-[20px]" />
                <span className="relative text-[23px] font-black font-spartan sm:text-[26px]">
                  {getInitials(userName)}
                </span>
              </div>

              <div className="mt-3 min-w-0">
                <h1
                  className={`text-[24px] font-bold leading-tight font-spartan sm:text-[30px] ${t.cardText}`}
                >
                  {userName}
                </h1>
                <p
                  className={`mt-1 break-words text-[13px] font-medium font-kumbh sm:text-sm ${t.subtleText}`}
                >
                  {headerIdentity}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2 text-[13px] font-kumbh sm:text-sm">
                  <span className={`font-semibold ${infoAccent}`}>{roleLabel}</span>
                  <span className={t.subtleText}>|</span>
                  <span className={t.subtleText}>{workspaceLabel}</span>
                </div>

                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold font-kumbh sm:px-3 sm:text-[13px] ${
                      isDark
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                        : "border-emerald-200 bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    <BadgeCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    {accountStatus}
                  </div>
                  <div
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold font-kumbh sm:px-3 sm:text-[13px] ${
                      isDark
                        ? "border-slate-700 bg-slate-900/60 text-slate-200"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {protectionLabel}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-2">
          <ProfilePanel
            title="Personal information"
            subtitle="Identity and contact details based on the user registration record."
            icon={UserRound}
            fields={personalFields}
            gridClassName="sm:grid-cols-2 xl:grid-cols-3"
            fullClassName="sm:col-span-2 xl:col-span-3"
            t={t}
            isDark={isDark}
          />

          <ProfilePanel
            title="Residency information"
            subtitle="Registered household and barangay address information."
            icon={MapPinned}
            fields={residencyFields}
            gridClassName="sm:grid-cols-2"
            fullClassName="sm:col-span-2"
            t={t}
            isDark={isDark}
          />

          <div className="xl:col-span-2">
            <ProfilePanel
              title="Account information"
              subtitle="System access, account role, and login-related details."
              icon={ShieldCheck}
              fields={accountFields}
              gridClassName="sm:grid-cols-2 xl:grid-cols-3"
              fullClassName="sm:col-span-2 xl:col-span-3"
              t={t}
              isDark={isDark}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
