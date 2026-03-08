import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ActivitySquare,
  BadgeCheck,
  KeyRound,
  MapPinned,
  MoreVertical,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import themeTokens from "../../Themetokens";
import { authService } from "../../homepage/services/authService";
import { getUser, isAdmin, logout } from "../../homepage/services/loginService";
import { getInitials } from "../../utils/avatar";
import ChangePasswordModal from "../../components/shared/ChangePasswordModal";
import Toast from "../../components/shared/modals/Toast";

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
        className={`h-full rounded-xl border px-3 py-2.5 ${
          isDark
            ? "border-slate-700 bg-slate-900/50"
            : "border-slate-200/70 bg-slate-50/85"
        }`}
      >
        <p
          className={`text-left text-[9px] font-semibold uppercase tracking-[0.18em] font-kumbh ${t.subtleText}`}
        >
          {label}
        </p>
        <p
          className={`mt-1 break-words text-left text-[13px] font-semibold leading-5 font-kumbh ${
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
    className={`${t.cardBg} overflow-hidden rounded-[22px] border ${t.cardBorder} text-left shadow-[0_18px_45px_-32px_rgba(15,23,42,0.28)]`}
  >
    <div
      className={`border-b px-4 py-3 ${
        isDark ? "border-slate-700" : "border-slate-200"
      }`}
      style={{
        background: isDark
          ? "linear-gradient(135deg, rgba(15,23,42,0.55), rgba(30,41,59,0.35))"
          : "linear-gradient(135deg, rgba(248,250,252,0.98), rgba(241,245,249,0.88))",
      }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${
            isDark
              ? "bg-slate-900 text-slate-200"
              : "bg-white text-slate-700 shadow-sm"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h2 className={`text-[14px] font-bold font-spartan leading-tight ${t.cardText}`}>
            {title}
          </h2>
          <p className={`text-[12px] font-kumbh leading-4 ${t.subtleText}`}>
            {subtitle}
          </p>
        </div>
      </div>
    </div>

    <div className={`grid gap-2 px-3 py-3 sm:px-4 sm:py-4 ${gridClassName}`}>
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const addToast = (toast) => setToasts((prev) => [...prev, { ...toast, id: Date.now() }]);
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      <Toast toasts={toasts} onRemove={removeToast} currentTheme={currentTheme} />
      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        currentTheme={currentTheme}
        onToast={addToast}
        onLogout={handleLogout}
      />
      <div className="mx-auto max-w-7xl space-y-4">
        {/* Compact header */}
        <section
          className={`${t.cardBg} relative rounded-[22px] border ${t.cardBorder} shadow-[0_24px_58px_-36px_rgba(15,23,42,0.35)]`}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${t.primaryGrad} opacity-10`}
          />
          <div className="relative flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5 sm:py-4">
            {/* Avatar */}
            <div
              className={`flex h-[60px] w-[60px] flex-shrink-0 items-center justify-center self-start rounded-[18px] border-2 ${
                isDark ? "border-slate-700" : "border-white"
              } bg-gradient-to-br ${t.primaryGrad} text-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.45)]`}
            >
              <div className="absolute inset-1 rounded-[14px] bg-white/10" />
              <span className="relative text-[20px] font-black font-spartan">
                {getInitials(userName)}
              </span>
            </div>

            {/* Identity */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <h1 className={`text-[20px] font-bold leading-tight font-spartan sm:text-[22px] ${t.cardText}`}>
                  {userName}
                </h1>
                <span className={`text-[13px] font-semibold font-kumbh ${infoAccent}`}>
                  {roleLabel}
                </span>
              </div>
              <p className={`mt-0.5 break-words text-[12px] font-medium font-kumbh ${t.subtleText}`}>
                {headerIdentity}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <div
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold font-kumbh ${
                    isDark
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                      : "border-emerald-200 bg-emerald-50 text-emerald-600"
                  }`}
                >
                  <BadgeCheck className="h-3 w-3" />
                  {accountStatus}
                </div>
                <div
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold font-kumbh ${
                    isDark
                      ? "border-slate-700 bg-slate-900/60 text-slate-200"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {protectionLabel}
                </div>
              </div>
            </div>

            {/* Kebab menu */}
            <div ref={menuRef} className="relative self-start">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                  isDark
                    ? "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {menuOpen && (
                <div
                  className={`absolute right-0 top-9 z-50 min-w-[180px] overflow-hidden rounded-xl border shadow-lg ${
                    isDark
                      ? "border-slate-700 bg-slate-900"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setChangePasswordOpen(true);
                    }}
                    className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-semibold font-kumbh transition ${
                      isDark
                        ? "text-slate-200 hover:bg-slate-800"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <KeyRound className="h-4 w-4 shrink-0" />
                    Change Password
                  </button>

                  {adminAccount && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/admin/activity-logs");
                      }}
                      className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-semibold font-kumbh transition ${
                        isDark
                          ? "text-slate-200 hover:bg-slate-800"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <ActivitySquare className="h-4 w-4 shrink-0" />
                      View Activity Logs
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Panels: Personal (left, wider) + Residency & Account (right column) */}
        <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
          <ProfilePanel
            title="Personal information"
            subtitle="Identity and contact details based on the user registration record."
            icon={UserRound}
            fields={personalFields}
            gridClassName="grid-cols-2 sm:grid-cols-3"
            fullClassName="col-span-2 sm:col-span-3"
            t={t}
            isDark={isDark}
          />

          <div className="flex flex-col gap-4">
            <ProfilePanel
              title="Residency information"
              subtitle="Registered household and barangay address."
              icon={MapPinned}
              fields={residencyFields}
              gridClassName="grid-cols-2"
              fullClassName="col-span-2"
              t={t}
              isDark={isDark}
            />

            <ProfilePanel
              title="Account information"
              subtitle="System access, role, and login details."
              icon={ShieldCheck}
              fields={accountFields}
              gridClassName="grid-cols-2"
              fullClassName="col-span-2"
              t={t}
              isDark={isDark}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
