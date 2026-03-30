import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useNavigate } from "react-router-dom";
import {
  ActivitySquare,
  BadgeCheck,
  Camera,
  Image,
  Info,
  KeyRound,
  MapPinned,
  MoreVertical,
  Pencil,
  QrCode,
  ShieldCheck,
  UserRound,
  Download,
  X,
} from "lucide-react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import themeTokens from "../../Themetokens";
import { authService } from "../../homepage/services/authService";
import { getUser, logout } from "../../homepage/services/loginService";
import { residentService } from "../../services/sub-system-1/residents";
import api from "../../services/sub-system-1/Api";
import { getInitials } from "../../utils/avatar";
import {
  getResidentProfilePhoto,
  isSupportedProfilePhoto,
  removeResidentProfilePhoto,
  saveResidentProfilePhoto,
  syncResidentProfilePhoto,
} from "../../utils/profilePhoto";
import ChangePasswordModal from "../../components/shared/ChangePasswordModal";
import ActivityLogsView from "../../components/shared/ActivityLogsView";
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

const toDateInputValue = (value) => {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().split("T")[0];
  const raw = String(value).trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().split("T")[0];
};

const resolveMaritalStatusId = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const raw = String(value).trim();
  if (!raw) return "";
  if (/^\d+$/.test(raw)) return raw;
  const match = Object.entries(MARITAL_STATUS_LABELS).find(
    ([, label]) => String(label).toLowerCase() === raw.toLowerCase(),
  );
  return match ? match[0] : "";
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

const applyProfileValue = (target, key, value) => {
  if (value === undefined || value === null || value === "") return;
  target[key] = value;
};

const mergeProfilePayload = (payload, fallback = {}) => {
  if (!payload) return { ...fallback };

  const resident = payload.resident || payload.data?.resident || {};
  const account = payload.account || payload.data?.account || {};
  const merged = { ...fallback, ...resident, ...account };

  applyProfileValue(
    merged,
    "contact_number",
    resident.contact_number ?? resident.contactNumber ?? resident.contact,
  );
  applyProfileValue(
    merged,
    "contact",
    resident.contact_number ?? resident.contactNumber ?? resident.contact,
  );
  applyProfileValue(merged, "email", resident.email ?? account.email);
  applyProfileValue(merged, "status", account.status_label ?? resident.status);
  applyProfileValue(merged, "status_label", account.status_label);
  applyProfileValue(merged, "role", account.role);
  applyProfileValue(merged, "username", account.username);
  applyProfileValue(merged, "resident_id", resident.id ?? account.resident_id);
  applyProfileValue(merged, "account_id", account.id);

  applyProfileValue(
    merged,
    "nationality",
    resident.nationality_name ?? resident.nationalityName ?? resident.nationality,
  );
  applyProfileValue(
    merged,
    "marital_status",
    resident.marital_status_name ?? resident.maritalStatusName ?? resident.marital_status,
  );
  applyProfileValue(
    merged,
    "sector_name",
    resident.sector_name ?? resident.sectorName ?? resident.sector_name,
  );
  applyProfileValue(
    merged,
    "sector",
    resident.sector_name ?? resident.sectorName ?? resident.sector,
  );

  applyProfileValue(merged, "house_number", resident.house_number ?? resident.houseNumber);
  applyProfileValue(merged, "purok_name", resident.purok_name ?? resident.purok);
  applyProfileValue(merged, "street_name", resident.street_name ?? resident.street);
  applyProfileValue(merged, "full_address", resident.full_address ?? resident.fullAddress);

  if (resident.is_voter !== undefined && resident.is_voter !== null) {
    merged.is_voter = resident.is_voter;
  } else if (resident.isVoter !== undefined && resident.isVoter !== null) {
    merged.is_voter = resident.isVoter;
  }

  applyProfileValue(
    merged,
    "birth_registration",
    resident.birth_registration ?? resident.birthRegistration,
  );
  applyProfileValue(
    merged,
    "residency_status",
    resident.residency_status ?? resident.residencyType,
  );
  applyProfileValue(
    merged,
    "residency_start_date",
    resident.residency_start_date ?? resident.residencyStartDate,
  );
  applyProfileValue(
    merged,
    "household_position",
    resident.household_position ?? resident.householdPosition,
  );

  applyProfileValue(
    merged,
    "registered_at",
    account.member_since ?? resident.member_since,
  );
  if (!merged.created_at && (account.member_since || resident.member_since)) {
    merged.created_at = account.member_since || resident.member_since;
  }

  return merged;
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

const ResidentProfileItem = ({
  label,
  value,
  badge = false,
  full = false,
  isDark,
  t,
}) => {
  const isMissing = value === "Not provided" || value === "No email on file";
  const normalized = String(value || "").toLowerCase();
  const positiveBadge =
    normalized.includes("active") ||
    normalized.includes("enabled") ||
    normalized.includes("uploaded") ||
    normalized.includes("verified") ||
    normalized === "yes";
  const mutedBadge =
    normalized.includes("unavailable") ||
    normalized.includes("not added") ||
    normalized === "no";

  const badgeClassName = positiveBadge
    ? isDark
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
      : "border-emerald-200 bg-emerald-50 text-emerald-600"
    : mutedBadge
      ? isDark
        ? "border-slate-700 bg-slate-900/70 text-slate-300"
        : "border-slate-200 bg-slate-100 text-slate-600"
      : isDark
        ? "border-slate-700 bg-slate-900/60 text-slate-200"
        : "border-slate-200 bg-slate-100 text-slate-700";

  return (
    <div className={`${full ? "sm:col-span-2" : ""} min-w-0 text-left`}>
      <p
        className={`text-left text-[11px] font-medium font-kumbh ${
          isDark ? "text-slate-400" : t.subtleText
        }`}
      >
        {label}
      </p>
      <div className="mt-1 text-left">
        {badge ? (
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold font-kumbh ${badgeClassName}`}
          >
            {value}
          </span>
        ) : (
          <p
            className={`break-words text-[13px] font-semibold font-kumbh ${
              isMissing ? t.subtleText : t.cardText
            }`}
          >
            {value}
          </p>
        )}
      </div>
    </div>
  );
};

const ResidentProfileCard = ({
  title,
  rows,
  actionLabel,
  onAction,
  isDark,
  t,
}) => (
  <section
    className={`${t.cardBg} rounded-[24px] border ${t.cardBorder} px-5 py-5 text-left shadow-[0_18px_45px_-32px_rgba(15,23,42,0.24)] sm:px-6 sm:py-6`}
  >
    <div className="flex items-start justify-between gap-3">
      <h2 className={`text-[15px] font-bold font-spartan leading-tight ${t.cardText}`}>
        {title}
      </h2>
      {onAction ? (
        <button
          type="button"
          onClick={onAction}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold font-kumbh transition ${
            isDark
              ? "border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-800"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <span>{actionLabel || "Edit"}</span>
          <Pencil className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>

    <div className="mt-5 grid gap-x-10 gap-y-5 sm:grid-cols-2">
      {rows.map((row) => (
        <ResidentProfileItem
          key={`${title}-${row.label}`}
          label={row.label}
          value={row.value}
          badge={row.badge}
          full={row.full}
          isDark={isDark}
          t={t}
        />
      ))}
    </div>
  </section>
);

export default function ProfilePage() {
  const { tr } = useLanguage();
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("appTheme") || "modern",
  );
  const [locationRefs, setLocationRefs] = useState({ puroks: [], streets: [] });
  const [menuOpen, setMenuOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [view, setView] = useState("profile");
  const [logsEverOpened, setLogsEverOpened] = useState(false);
  const [user, setUser] = useState(() => getUser() || {});
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [editTab, setEditTab] = useState("contact");
  const [contactDraft, setContactDraft] = useState("");
  const [emailDraft, setEmailDraft] = useState("");
  const [houseDraft, setHouseDraft] = useState("");
  const [purokDraft, setPurokDraft] = useState("");
  const [streetDraft, setStreetDraft] = useState("");
  const [householdDraft, setHouseholdDraft] = useState("");
  const [voterDraft, setVoterDraft] = useState("");
  const [genderDraft, setGenderDraft] = useState("");
  const [nationalityDraft, setNationalityDraft] = useState("");
  const [civilStatusDraft, setCivilStatusDraft] = useState("");
  const [birthRegDraft, setBirthRegDraft] = useState("");
  const [residencyTypeDraft, setResidencyTypeDraft] = useState("");
  const [residencyStartDraft, setResidencyStartDraft] = useState("");
  const [contactSaving, setContactSaving] = useState(false);
  const [contactError, setContactError] = useState("");
  const [qrOpen, setQrOpen] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState("");
  const [qrData, setQrData] = useState(null);
  const menuRef = useRef(null);
  const photoInputRef = useRef(null);
  const qrRef = useRef(null);
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
  const adminAccount = user?.role === "admin";
  const isResident = !adminAccount;
  const parsedName = useMemo(() => splitNameParts(user?.name), [user?.name]);

  useEffect(() => {
    if (!isResident) return undefined;

    let isMounted = true;
    const loadProfile = async () => {
      setProfileLoading(true);
      setProfileError("");
      try {
        const payload = await residentService.getMyProfile();
        if (!isMounted) return;

        if (payload?.success === false) {
          throw new Error(payload.error || payload.message || "Unable to load profile.");
        }

        setUser((prev) => {
          const merged = mergeProfilePayload(payload, prev);
          localStorage.setItem("authUser", JSON.stringify(merged));
          return merged;
        });
      } catch (error) {
        if (!isMounted) return;
        setProfileError(error?.message || "Unable to load profile.");
      } finally {
        if (!isMounted) return;
        setProfileLoading(false);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [isResident]);

  useEffect(() => {
    setContactDraft(user?.contact_number || user?.contact || "");
    setEmailDraft(user?.email || "");
    setHouseDraft(
      user?.temp_house_number || user?.house_number || user?.houseNumber || "",
    );

    const rawPurok =
      user?.temp_purok_id ?? user?.purok_id ?? user?.purok?.id ?? user?.purok;
    setPurokDraft(rawPurok !== undefined && rawPurok !== null ? String(rawPurok) : "");

    const rawStreet =
      user?.temp_street_id ?? user?.street_id ?? user?.street?.id ?? user?.street;
    setStreetDraft(rawStreet !== undefined && rawStreet !== null ? String(rawStreet) : "");

    setHouseholdDraft(user?.household_position || user?.householdPosition || "");

    const voterValue = user?.is_voter ?? user?.isVoter;
    if (voterValue === true || voterValue === 1 || String(voterValue).toLowerCase() === "yes") {
      setVoterDraft("1");
    } else if (voterValue === false || voterValue === 0 || String(voterValue).toLowerCase() === "no") {
      setVoterDraft("0");
    } else {
      setVoterDraft("");
    }

    setGenderDraft(user?.gender || user?.sex || "");
    setNationalityDraft(
      user?.nationality ||
        user?.nationality_name ||
        user?.nationalityName ||
        "",
    );
    const maritalRaw =
      user?.marital_status_id ||
      user?.marital_status ||
      user?.marital_status_name ||
      user?.maritalStatus ||
      user?.maritalStatusName ||
      "";
    setCivilStatusDraft(resolveMaritalStatusId(maritalRaw));
    setBirthRegDraft(user?.birth_registration || user?.birthRegistration || "");
    setResidencyTypeDraft(user?.residency_status || user?.residencyStatus || "");
    setResidencyStartDraft(
      toDateInputValue(user?.residency_start_date || user?.residencyStartDate),
    );
  }, [
    user?.contact_number,
    user?.contact,
    user?.email,
    user?.temp_house_number,
    user?.house_number,
    user?.houseNumber,
    user?.temp_purok_id,
    user?.purok_id,
    user?.purok,
    user?.temp_street_id,
    user?.street_id,
    user?.street,
    user?.household_position,
    user?.householdPosition,
    user?.is_voter,
    user?.isVoter,
    user?.gender,
    user?.sex,
    user?.nationality,
    user?.nationality_name,
    user?.nationalityName,
    user?.marital_status_id,
    user?.marital_status,
    user?.marital_status_name,
    user?.maritalStatus,
    user?.maritalStatusName,
    user?.birth_registration,
    user?.birthRegistration,
    user?.residency_status,
    user?.residencyStatus,
    user?.residency_start_date,
    user?.residencyStartDate,
  ]);

  useEffect(() => {
    if (!profileError) return;
    addToast({
      type: "error",
      title: "Unable to load profile",
      message: profileError,
      duration: 3000,
    });
  }, [profileError]);

  const userName = buildFullName(user);
  const userEmail = formatText(user.email, "No email on file");
  const userPhone = formatText(
    user.contact_number || user.contact || user.phone || user.mobile,
  );
  const roleLabel = normalizeRoleLabel(user.role, adminAccount);
  const statusValue = user.status_label || user.status;
  const accountStatus = statusValue
    ? normalizeRoleLabel(statusValue, false)
    : adminAccount
    ? "Active Staff Account"
    : "Active User Account";
  const trackingNumber = formatText(user.tracking_number || user.trackingNumber);
  const accountId = formatText(
    user.staff_id ||
      user.employee_id ||
      user.account_id ||
      user.barangay_id ||
      user.id,
  );
  const accountUsername = formatText(
    user.username ||
      user.user_name ||
      user.account_name ||
      (user.email ? String(user.email).split("@")[0] : ""),
  );
  const residentId = user?.resident_id || user?.residentId || user?.id;
  const canShowQr = isResident && Boolean(residentId);
  const PHOTO_MAX_BYTES = 2 * 1024 * 1024;
  const [residentPhoto, setResidentPhoto] = useState(() =>
    isResident ? getResidentProfilePhoto(user) : "",
  );
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoScale, setPhotoScale] = useState(1);
  const [photoError, setPhotoError] = useState("");
  const [photoSaving, setPhotoSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    if (!isResident) return;
    setResidentPhoto(getResidentProfilePhoto(user));
    syncResidentProfilePhoto(user)
      .then((remote) => {
        if (remote) {
          setResidentPhoto(remote);
        }
      })
      .catch(() => {});
  }, [isResident, user]);

  useEffect(() => {
    if (!photoPreview) return undefined;
    if (!photoPreview.startsWith("blob:")) return undefined;
    return () => URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  const openPhotoModal = () => {
    setPhotoModalOpen(true);
    setPhotoError("");
    setPhotoScale(1);
    setPhotoFile(null);
    setPhotoPreview(residentPhoto || "");
  };

  const closePhotoModal = () => {
    if (photoSaving) return;
    setPhotoModalOpen(false);
    setPhotoError("");
  };

  const openQrModal = () => {
    if (!canShowQr) return;
    setQrOpen(true);
    if (qrData || !residentId) return;
    setQrLoading(true);
    setQrError("");
    api
      .get(`/residents/${residentId}/qr`)
      .then((res) => {
        if (res?.data?.success) {
          setQrData(res.data);
        } else {
          setQrError(res?.data?.message || "Unable to load QR.");
        }
      })
      .catch((err) => {
        setQrError(err?.response?.data?.message || "Unable to load QR.");
      })
      .finally(() => setQrLoading(false));
  };

  const closeQrModal = () => {
    if (qrLoading) return;
    setQrOpen(false);
  };

  const downloadQr = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (canvas?.toDataURL) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `QR-${user?.barangay_id || user?.resident_id || "resident"}.png`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 100);
      return;
    }

    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      const canvasEl = document.createElement("canvas");
      const ctx = canvasEl.getContext("2d");
      canvasEl.width = 600;
      canvasEl.height = 600;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 600, 600);
      ctx.drawImage(img, 50, 50, 500, 500);
      const url = canvasEl.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `QR-${user?.barangay_id || user?.resident_id || "resident"}.png`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 100);
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  const handlePhotoSelect = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!isSupportedProfilePhoto(file)) {
      setPhotoError("Please upload a PNG or JPG image.");
      return;
    }

    if (file.size > PHOTO_MAX_BYTES) {
      setPhotoError("Profile photo must be 2MB or less.");
      return;
    }

    setPhotoError("");
    setPhotoFile(file);
    setPhotoScale(1);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const buildCroppedPhoto = (src, scaleValue) =>
    new Promise((resolve, reject) => {
      const image = new window.Image();
      image.onload = () => {
        const size = Math.min(image.width, image.height);
        const cropSize = size / Math.max(1, scaleValue || 1);
        const sx = (image.width - cropSize) / 2;
        const sy = (image.height - cropSize) / 2;
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Unable to process image."));
          return;
        }
        ctx.drawImage(image, sx, sy, cropSize, cropSize, 0, 0, 512, 512);
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      };
      image.onerror = () => reject(new Error("Failed to read image."));
      image.src = src;
    });

  const handlePhotoSave = async () => {
    if (!photoFile || !photoPreview) return;
    setPhotoSaving(true);
    setPhotoError("");
    try {
      const dataUrl = await buildCroppedPhoto(photoPreview, photoScale);
      const saved = await saveResidentProfilePhoto(user, dataUrl);
      setResidentPhoto(saved);
      window.dispatchEvent(new CustomEvent("residentPhotoUpdated"));
      addToast({
        type: "success",
        title: "Profile updated",
        message: "Your profile photo was updated.",
        duration: 2500,
      });
      setPhotoModalOpen(false);
    } catch (error) {
      setPhotoError(error?.message || "Unable to update profile photo.");
    } finally {
      setPhotoSaving(false);
    }
  };

  const handlePhotoRemove = async () => {
    if (!residentPhoto) return;
    setPhotoSaving(true);
    setPhotoError("");
    try {
      await removeResidentProfilePhoto(user);
      setResidentPhoto("");
      window.dispatchEvent(new CustomEvent("residentPhotoUpdated"));
      addToast({
        type: "success",
        title: "Photo removed",
        message: "Profile photo has been removed.",
        duration: 2500,
      });
      setPhotoModalOpen(false);
    } catch (error) {
      setPhotoError(error?.message || "Unable to remove profile photo.");
    } finally {
      setPhotoSaving(false);
    }
  };

  const openContactModal = () => {
    setContactModalOpen(true);
    setContactError("");
    setEditTab("contact");
  };

  const closeContactModal = () => {
    if (contactSaving) return;
    setContactModalOpen(false);
    setContactError("");
  };

  const handleContactSave = async () => {
    if (contactSaving) return;

    const trimmedContact = contactDraft.trim();
    const trimmedEmail = emailDraft.trim();
    const trimmedHouse = houseDraft.trim();
    const payload = {};

    if (trimmedContact) payload.contact_number = trimmedContact;
    if (trimmedEmail) payload.email = trimmedEmail;
    if (trimmedHouse) payload.temp_house_number = trimmedHouse;
    if (purokDraft) payload.temp_purok_id = purokDraft;
    if (streetDraft) payload.temp_street_id = streetDraft;
    if (householdDraft) payload.household_position = householdDraft;
    if (voterDraft !== "") payload.is_voter = voterDraft === "1" ? 1 : 0;
    if (genderDraft) payload.gender = genderDraft;
    if (nationalityDraft) payload.nationality = nationalityDraft;
    if (civilStatusDraft) payload.marital_status_id = civilStatusDraft;
    if (birthRegDraft) payload.birth_registration = birthRegDraft;
    if (residencyTypeDraft) payload.residency_status = residencyTypeDraft;
    if (residencyStartDraft) payload.residency_start_date = residencyStartDraft;

    if (Object.keys(payload).length === 0) {
      setContactError("Please update at least one field.");
      return;
    }

    setContactSaving(true);
    setContactError("");

    try {
      const response = await residentService.updateMyProfile(payload);
      if (response?.success === false) {
        throw new Error(response.error || response.message || "Unable to update profile.");
      }

      let nextPayload = response;
      try {
        const refreshed = await residentService.getMyProfile();
        if (refreshed && refreshed.success !== false) {
          nextPayload = refreshed;
        }
      } catch {
        // Keep optimistic response if refresh fails.
      }

      setUser((prev) => {
        const merged = mergeProfilePayload(nextPayload, prev);
        localStorage.setItem("authUser", JSON.stringify(merged));
        return merged;
      });

      addToast({
        type: "success",
        title: "Profile updated",
        message: "Your profile details were saved.",
        duration: 2500,
      });
      setContactModalOpen(false);
    } catch (error) {
      setContactError(error?.message || "Unable to update profile.");
    } finally {
      setContactSaving(false);
    }
  };

  const goToBranding = () => {
    navigate(adminAccount ? "/admin/settings?tab=branding" : "/settings?tab=branding");
  };
  const workspaceLabel = adminAccount
    ? "Admin Operations Workspace"
    : "Resident Services Workspace";
  const memberSince = formatDisplayDate(
    user.created_at || user.registered_at || user.member_since || user.updated_at,
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
  const nationality = formatText(
    user.nationality ||
      user.nationality_name ||
      user.nationalityName,
    "Filipino",
  );
  const civilStatus = normalizeMappedValue(
    user.marital_status ||
      user.maritalStatus ||
      user.marital_status_name ||
      user.maritalStatusName ||
      user.marital_status_id,
    MARITAL_STATUS_LABELS,
  );
  const sector = normalizeMappedValue(
    user.sector_name || user.sectorName || user.sector || user.sector_id,
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
  const hasPurokMatch = Boolean(
    purokDraft &&
      locationRefs.puroks.some((item) => String(item.id) === String(purokDraft)),
  );
  const hasStreetMatch = Boolean(
    streetDraft &&
      locationRefs.streets.some((item) => String(item.id) === String(streetDraft)),
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
    { label: tr.profilePage.firstName, value: firstName },
    { label: tr.profilePage.middleName, value: middleName },
    { label: tr.profilePage.lastName, value: lastName },
    { label: tr.profilePage.suffix, value: suffix },
    { label: tr.profilePage.contactNumberField, value: userPhone },
    { label: tr.profilePage.emailField, value: userEmail },
    { label: tr.profilePage.birthdate, value: birthDate },
    { label: tr.profilePage.age, value: age },
    { label: tr.profilePage.gender, value: gender },
    { label: tr.profilePage.nationality, value: nationality },
    { label: tr.profilePage.maritalStatus, value: civilStatus },
    { label: tr.profilePage.sector, value: sector },
    { label: tr.profilePage.birthRegistration, value: birthRegistration },
    { label: tr.profilePage.registeredVoter, value: registeredVoter },
  ];

  const residencyFields = [
    { label: tr.profilePage.houseNo, value: houseNumber },
    { label: tr.profilePage.purok, value: purok },
    { label: tr.profilePage.street, value: street },
    { label: tr.profilePage.householdPosition, value: householdPosition },
    { label: tr.profilePage.residencyType, value: residencyType },
    { label: tr.profilePage.dateStarted, value: residencyStartDate },
    {
      label: tr.profilePage.fullAddress,
      value: registeredAddress,
      full: true,
    },
  ];

  const accountFields = [
    { label: idLabel, value: idValue },
    { label: tr.profilePage.username, value: accountUsername },
    { label: tr.profilePage.role, value: roleLabel },
    { label: tr.profilePage.status, value: accountStatus },
    { label: tr.profilePage.workspace, value: workspaceLabel },
    { label: tr.profilePage.memberSince, value: memberSince },
    {
      label: tr.profilePage.accountProtection,
      value: protectionLabel,
      full: true,
    },
  ];

  const themePreferenceLabel =
    currentTheme === "dark"
      ? "Dark Mode"
      : currentTheme === "blue"
        ? "Blue Mode"
        : "Modern Theme";
  const photoStatus = residentPhoto ? "Uploaded" : "Not added";
  const qrAccess = canShowQr ? "Enabled" : "Unavailable";

  const residentPersonalRows = [
    { label: "Full name", value: userName },
    { label: tr.profilePage.birthdate, value: birthDate },
    { label: tr.profilePage.gender, value: gender },
    { label: tr.profilePage.nationality, value: nationality },
    { label: tr.profilePage.contactNumberField, value: userPhone },
    { label: tr.profilePage.emailField, value: userEmail },
    { label: tr.profilePage.fullAddress, value: registeredAddress, full: true },
  ];

  const residentAccountRows = [
    { label: idLabel, value: idValue },
    { label: tr.profilePage.username, value: accountUsername },
    { label: tr.profilePage.role, value: roleLabel },
    { label: tr.profilePage.status, value: accountStatus, badge: true },
    { label: tr.profilePage.memberSince, value: memberSince },
    { label: tr.profilePage.workspace, value: workspaceLabel, full: true },
  ];

  const residentResidencyRows = [
    { label: tr.profilePage.houseNo, value: houseNumber },
    { label: tr.profilePage.purok, value: purok },
    { label: tr.profilePage.street, value: street },
    { label: tr.profilePage.householdPosition, value: householdPosition },
    { label: tr.profilePage.residencyType, value: residencyType },
    { label: tr.profilePage.dateStarted, value: residencyStartDate },
  ];

  const residentAccessRows = [
    { label: tr.profilePage.accountProtection, value: protectionLabel },
    { label: tr.profilePage.registeredVoter, value: registeredVoter, badge: true },
    { label: tr.profilePage.birthRegistration, value: birthRegistration },
    { label: tr.profilePage.maritalStatus, value: civilStatus },
    { label: tr.profilePage.sector, value: sector },
    { label: "Profile photo", value: photoStatus, badge: true },
    { label: "Resident QR", value: qrAccess, badge: true },
    { label: "Theme", value: themePreferenceLabel },
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
      {photoModalOpen && (
        <div className="fixed inset-0 z-[96] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-[24px] border shadow-2xl ${
              isDark
                ? "bg-slate-900 border-slate-700 text-slate-100"
                : `bg-white border-slate-200 ${t.cardText}`
            }`}
          >
            <div
              className={`flex items-center justify-between border-b px-5 py-4 ${
                isDark ? "border-slate-700" : "border-slate-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                    isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Camera className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <h2
                    className={`text-[15px] font-bold font-spartan leading-tight ${
                      isDark ? "text-slate-100" : t.cardText
                    }`}
                  >
                    {tr.profilePage.changeProfilePhoto}
                  </h2>
                  <p className={`text-[11px] font-kumbh ${isDark ? "text-slate-400" : t.subtleText}`}>
                    {tr.profilePage.cropZoomDesc}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closePhotoModal}
                disabled={photoSaving}
                className={`rounded-lg p-1.5 transition-colors ${
                  isDark
                    ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                <span className="sr-only">Close</span>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div className="flex flex-col items-center gap-3">
                <div
                  className={`relative h-28 w-28 overflow-hidden rounded-full border ${
                    isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-100"
                  }`}
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                      style={{ transform: `scale(${photoScale})` }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-black font-spartan text-slate-500">
                      {getInitials(userName)}
                    </div>
                  )}
                </div>

                <label
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] font-semibold font-kumbh transition ${
                    isDark
                      ? "border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-800"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  } cursor-pointer`}
                >
                  {tr.profilePage.choosePhoto}
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
                <p className={`text-[11px] font-kumbh ${isDark ? "text-slate-400" : t.subtleText}`}>
                  {tr.profilePage.photoFormatDesc}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold font-kumbh">
                  <span className={isDark ? "text-slate-300" : "text-slate-600"}>{tr.profilePage.zoom}</span>
                  <span className={isDark ? "text-slate-400" : "text-slate-500"}>{photoScale.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="2.5"
                  step="0.05"
                  value={photoScale}
                  onChange={(e) => setPhotoScale(Number(e.target.value))}
                  disabled={!photoPreview || !photoFile}
                  className="w-full"
                />
              </div>

              {photoError && (
                <p className="text-[12px] font-kumbh text-rose-600">{photoError}</p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={handlePhotoRemove}
                  disabled={!residentPhoto || photoSaving}
                  className={`rounded-full border px-4 py-2 text-[12px] font-semibold font-kumbh transition ${
                    residentPhoto
                      ? isDark
                        ? "border-rose-400/30 text-rose-200 hover:bg-rose-500/10"
                        : "border-rose-200 text-rose-600 hover:bg-rose-50"
                      : "border-slate-200 text-slate-400 opacity-60 cursor-not-allowed"
                  }`}
                >
                  {tr.profilePage.removePhoto}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closePhotoModal}
                    disabled={photoSaving}
                    className={`rounded-full border px-4 py-2 text-[12px] font-semibold font-kumbh transition ${
                      isDark
                        ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {tr.profilePage.cancel}
                  </button>
                  <button
                    type="button"
                    onClick={handlePhotoSave}
                    disabled={!photoFile || photoSaving}
                    className={`rounded-full px-4 py-2 text-[12px] font-semibold font-kumbh text-white transition ${
                      photoFile && !photoSaving ? t.primarySolid : "bg-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {photoSaving ? tr.profilePage.saving : tr.profilePage.save}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {qrOpen && (
        <div className="fixed inset-0 z-[97] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-[20px] backdrop-saturate-150">
          <div
            className={`w-full max-w-sm rounded-[24px] border shadow-2xl ${
              isDark
                ? "bg-slate-900 border-slate-700 text-slate-100"
                : `bg-white border-slate-200 ${t.cardText}`
            }`}
          >
            <div
              className={`flex items-center justify-between border-b px-5 py-4 ${
                isDark ? "border-slate-700" : "border-slate-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                    isDark ? "bg-slate-800 text-slate-300" : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  <QrCode className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <h2
                    className={`text-[15px] font-bold font-spartan leading-tight ${
                      isDark ? "text-slate-100" : t.cardText
                    }`}
                  >
                    Resident QR Code
                  </h2>
                  <p className={`text-[11px] font-kumbh ${isDark ? "text-slate-400" : t.subtleText}`}>
                    View and download your official QR code.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeQrModal}
                disabled={qrLoading}
                className={`rounded-lg p-1.5 transition-colors ${
                  isDark
                    ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                <span className="sr-only">Close</span>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-5 py-6 text-center">
              {qrLoading ? (
                <p className={`text-[12px] font-kumbh ${t.subtleText}`}>Loading QR...</p>
              ) : qrError ? (
                <p className="text-[12px] font-kumbh text-rose-500">{qrError}</p>
              ) : qrData ? (
                <>
                  <button
                    type="button"
                    onClick={() => window.open(qrData.qr_url, "_blank", "noopener,noreferrer")}
                    className={`mx-auto mb-4 flex h-[220px] w-[220px] items-center justify-center rounded-[22px] border transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/40 ${
                      isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
                    }`}
                    title="Open QR link"
                  >
                    <span className="sr-only">Open QR link</span>
                    <div ref={qrRef} className="flex items-center justify-center">
                      <QRCodeSVG value={qrData.qr_url} size={180} level="H" includeMargin={true} />
                      <QRCodeCanvas value={qrData.qr_url} size={600} level="H" includeMargin={true} className="sr-only" />
                    </div>
                  </button>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={downloadQr}
                      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold font-kumbh text-white transition ${t.primarySolid}`}
                    >
                      <Download className="h-4 w-4" /> Download QR
                    </button>
                  </div>
                </>
              ) : (
                <p className={`text-[12px] font-kumbh ${t.subtleText}`}>QR unavailable.</p>
              )}
            </div>
          </div>
        </div>
      )}
      {contactModalOpen && (
        <div className="fixed inset-0 z-[97] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div
            className={`w-full max-w-xl max-h-[90vh] rounded-[24px] border shadow-2xl flex flex-col overflow-hidden ${
              isDark
                ? "bg-slate-900 border-slate-700 text-slate-100"
                : `bg-white border-slate-200 ${t.cardText}`
            }`}
          >
            <div
              className={`flex items-center justify-between border-b px-5 py-4 ${
                isDark ? "border-slate-700" : "border-slate-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                    isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <UserRound className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <h2
                    className={`text-[15px] font-bold font-spartan leading-tight ${
                      isDark ? "text-slate-100" : t.cardText
                    }`}
                  >
                    {tr.profilePage.updateContactInfo}
                  </h2>
                  <p className={`text-[11px] font-kumbh ${isDark ? "text-slate-400" : t.subtleText}`}>
                    {tr.profilePage.editContactDesc}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeContactModal}
                disabled={contactSaving}
                className={`rounded-lg p-1.5 transition-colors ${
                  isDark
                    ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                <span className="sr-only">Close</span>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              className={`border-b ${
                isDark ? "border-slate-800 bg-slate-900/70" : "border-slate-100 bg-white"
              }`}
            >
              <div className="px-5 py-3 overflow-x-auto">
                <div
                  className={`inline-flex items-center gap-1 rounded-full border p-1 ${
                    isDark ? "border-slate-800 bg-slate-900/40" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setEditTab("contact")}
                    className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold font-kumbh transition whitespace-nowrap ${
                      editTab === "contact"
                        ? `${t.primarySolid} text-white shadow-sm`
                        : isDark
                          ? "text-slate-300 hover:bg-slate-800"
                          : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Info className="h-3 w-3" />
                    {tr.profilePage.editTabContact}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditTab("personal")}
                    className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold font-kumbh transition whitespace-nowrap ${
                      editTab === "personal"
                        ? `${t.primarySolid} text-white shadow-sm`
                        : isDark
                          ? "text-slate-300 hover:bg-slate-800"
                          : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <UserRound className="h-3 w-3" />
                    {tr.profilePage.editTabPersonal}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditTab("residency")}
                    className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold font-kumbh transition whitespace-nowrap ${
                      editTab === "residency"
                        ? `${t.primarySolid} text-white shadow-sm`
                        : isDark
                          ? "text-slate-300 hover:bg-slate-800"
                          : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <MapPinned className="h-3 w-3" />
                    {tr.profilePage.editTabResidency}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4 px-5 py-5 overflow-y-auto">
              {editTab === "contact" && (
                <div
                  className={`rounded-xl border px-3 py-3 ${
                    isDark
                      ? "border-slate-800 bg-slate-900/40"
                      : "border-slate-200/70 bg-slate-50/70"
                  }`}
                >
                  <div className="text-left">
                    <p className={`text-[11px] font-semibold font-kumbh ${t.subtleText}`}>
                      {tr.profilePage.updateContactInfo}
                    </p>
                    <p className={`text-[10px] font-kumbh ${t.subtleText}`}>
                      {tr.profilePage.editContactDesc}
                    </p>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2 text-left">
                      <label className={`text-[11px] font-semibold font-kumbh ${t.subtleText}`}>
                        {tr.profilePage.contactNumber}
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        placeholder="09XXXXXXXXX"
                        value={contactDraft}
                        onChange={(e) => setContactDraft(e.target.value)}
                        disabled={contactSaving}
                        className={`w-full rounded-xl border px-3 py-2 text-[13px] font-kumbh outline-none transition ${
                          isDark
                            ? "border-slate-700 bg-slate-900/60 text-slate-100 focus:border-emerald-400/60"
                            : "border-slate-200 bg-white text-slate-700 focus:border-emerald-400"
                        }`}
                      />
                    </div>

                    <div className="space-y-2 text-left">
                      <label className={`text-[11px] font-semibold font-kumbh ${t.subtleText}`}>
                        {tr.profilePage.emailAddress}
                      </label>
                      <input
                        type="email"
                        placeholder="you@email.com"
                        value={emailDraft}
                        onChange={(e) => setEmailDraft(e.target.value)}
                        disabled={contactSaving}
                        className={`w-full rounded-xl border px-3 py-2 text-[13px] font-kumbh outline-none transition ${
                          isDark
                            ? "border-slate-700 bg-slate-900/60 text-slate-100 focus:border-emerald-400/60"
                            : "border-slate-200 bg-white text-slate-700 focus:border-emerald-400"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {editTab === "personal" && (
                <div
                  className={`rounded-xl border px-3 py-3 ${
                    isDark
                      ? "border-slate-800 bg-slate-900/40"
                      : "border-slate-200/70 bg-slate-50/70"
                  }`}
                >
                <div className="text-left">
                  <p className={`text-[11px] font-semibold font-kumbh ${t.subtleText}`}>
                    {tr.profilePage.personalInfoPanel}
                  </p>
                  <p className={`text-[10px] font-kumbh ${t.subtleText}`}>
                    {tr.profilePage.personalInfoSubtitle}
                  </p>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2 text-left">
                    <label className={`text-[11px] font-semibold font-kumbh ${t.subtleText}`}>
                      {tr.profilePage.gender}
                    </label>
                    <select
                      value={genderDraft}
                      onChange={(e) => setGenderDraft(e.target.value)}
                      disabled={contactSaving}
                      className={`w-full rounded-xl border px-3 py-2 text-[13px] font-kumbh outline-none transition ${
                        isDark
                          ? "border-slate-700 bg-slate-900/60 text-slate-100 focus:border-emerald-400/60"
                          : "border-slate-200 bg-white text-slate-700 focus:border-emerald-400"
                      }`}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className={`text-[11px] font-semibold font-kumbh ${t.subtleText}`}>
                      {tr.profilePage.maritalStatus}
                    </label>
                    <select
                      value={civilStatusDraft}
                      onChange={(e) => setCivilStatusDraft(e.target.value)}
                      disabled={contactSaving}
                      className={`w-full rounded-xl border px-3 py-2 text-[13px] font-kumbh outline-none transition ${
                        isDark
                          ? "border-slate-700 bg-slate-900/60 text-slate-100 focus:border-emerald-400/60"
                          : "border-slate-200 bg-white text-slate-700 focus:border-emerald-400"
                      }`}
                    >
                      <option value="">Select status</option>
                      {Object.entries(MARITAL_STATUS_LABELS).map(([value, label]) => (
                        <option key={`marital-${value}`} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className={`text-[11px] font-semibold font-kumbh ${t.subtleText}`}>
                      {tr.profilePage.nationality}
                    </label>
                    <input
                      type="text"
                      placeholder="Filipino"
                      value={nationalityDraft}
                      onChange={(e) => setNationalityDraft(e.target.value)}
                      disabled={contactSaving}
                      className={`w-full rounded-xl border px-3 py-2 text-[13px] font-kumbh outline-none transition ${
                        isDark
                          ? "border-slate-700 bg-slate-900/60 text-slate-100 focus:border-emerald-400/60"
                          : "border-slate-200 bg-white text-slate-700 focus:border-emerald-400"
                      }`}
                    />
                  </div>

                  <div className="space-y-2 text-left">
                    <label className={`text-[11px] font-semibold font-kumbh ${t.subtleText}`}>
                      {tr.profilePage.birthRegistration}
                    </label>
                    <select
                      value={birthRegDraft}
                      onChange={(e) => setBirthRegDraft(e.target.value)}
                      disabled={contactSaving}
                      className={`w-full rounded-xl border px-3 py-2 text-[13px] font-kumbh outline-none transition ${
                        isDark
                          ? "border-slate-700 bg-slate-900/60 text-slate-100 focus:border-emerald-400/60"
                          : "border-slate-200 bg-white text-slate-700 focus:border-emerald-400"
                      }`}
                    >
                      <option value="">Select status</option>
                      <option value="Registered">Registered</option>
                      <option value="Not Registered">Not Registered</option>
                    </select>
                  </div>
                </div>
                </div>
              )}

              {editTab === "residency" && (
                <div
                  className={`rounded-xl border px-3 py-3 ${
                    isDark
                      ? "border-slate-800 bg-slate-900/40"
                      : "border-slate-200/70 bg-slate-50/70"
                  }`}
                >
                <div className="text-left">
                  <p className={`text-[11px] font-semibold font-kumbh ${t.subtleText}`}>
                    {tr.profilePage.residencyInfoPanel}
                  </p>
                  <p className={`text-[10px] font-kumbh ${t.subtleText}`}>
                    {tr.profilePage.residencyInfoSubtitle}
                  </p>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2 text-left">
                    <label className={`text-[11px] font-semibold font-kumbh ${t.subtleText}`}>
                      {tr.profilePage.houseNo}
                    </label>
                    <input
                      type="text"
                      placeholder="House number"
                      value={houseDraft}
                      onChange={(e) => setHouseDraft(e.target.value)}
                      disabled={contactSaving}
                      className={`w-full rounded-xl border px-3 py-2 text-[13px] font-kumbh outline-none transition ${
                        isDark
                          ? "border-slate-700 bg-slate-900/60 text-slate-100 focus:border-emerald-400/60"
                          : "border-slate-200 bg-white text-slate-700 focus:border-emerald-400"
                      }`}
                    />
                  </div>

                  <div className="space-y-2 text-left">
                    <label className={`text-[11px] font-semibold font-kumbh ${t.subtleText}`}>
                      {tr.profilePage.purok}
                    </label>
                    <select
                      value={purokDraft}
                      onChange={(e) => setPurokDraft(e.target.value)}
                      disabled={contactSaving}
                      className={`w-full rounded-xl border px-3 py-2 text-[13px] font-kumbh outline-none transition ${
                        isDark
                          ? "border-slate-700 bg-slate-900/60 text-slate-100 focus:border-emerald-400/60"
                          : "border-slate-200 bg-white text-slate-700 focus:border-emerald-400"
                      }`}
                    >
                      <option value="">Select purok</option>
                      {purokDraft && !hasPurokMatch && (
                        <option value={purokDraft}>Current: {purokDraft}</option>
                      )}
                      {locationRefs.puroks.map((item) => (
                        <option key={`purok-${item.id}`} value={String(item.id)}>
                          {item.name || `Purok ${item.number || item.id}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className={`text-[11px] font-semibold font-kumbh ${t.subtleText}`}>
                      {tr.profilePage.street}
                    </label>
                    <select
                      value={streetDraft}
                      onChange={(e) => setStreetDraft(e.target.value)}
                      disabled={contactSaving}
                      className={`w-full rounded-xl border px-3 py-2 text-[13px] font-kumbh outline-none transition ${
                        isDark
                          ? "border-slate-700 bg-slate-900/60 text-slate-100 focus:border-emerald-400/60"
                          : "border-slate-200 bg-white text-slate-700 focus:border-emerald-400"
                      }`}
                    >
                      <option value="">Select street</option>
                      {streetDraft && !hasStreetMatch && (
                        <option value={streetDraft}>Current: {streetDraft}</option>
                      )}
                      {locationRefs.streets.map((item) => (
                        <option key={`street-${item.id}`} value={String(item.id)}>
                          {item.name || `Street ${item.id}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className={`text-[11px] font-semibold font-kumbh ${t.subtleText}`}>
                      {tr.profilePage.householdPosition}
                    </label>
                    <select
                      value={householdDraft}
                      onChange={(e) => setHouseholdDraft(e.target.value)}
                      disabled={contactSaving}
                      className={`w-full rounded-xl border px-3 py-2 text-[13px] font-kumbh outline-none transition ${
                        isDark
                          ? "border-slate-700 bg-slate-900/60 text-slate-100 focus:border-emerald-400/60"
                          : "border-slate-200 bg-white text-slate-700 focus:border-emerald-400"
                      }`}
                    >
                      <option value="">Select household position</option>
                      {Object.entries(HOUSEHOLD_POSITION_LABELS).map(([value, label]) => (
                        <option key={`household-${value}`} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className={`text-[11px] font-semibold font-kumbh ${t.subtleText}`}>
                      {tr.profilePage.residencyType}
                    </label>
                    <select
                      value={residencyTypeDraft}
                      onChange={(e) => setResidencyTypeDraft(e.target.value)}
                      disabled={contactSaving}
                      className={`w-full rounded-xl border px-3 py-2 text-[13px] font-kumbh outline-none transition ${
                        isDark
                          ? "border-slate-700 bg-slate-900/60 text-slate-100 focus:border-emerald-400/60"
                          : "border-slate-200 bg-white text-slate-700 focus:border-emerald-400"
                      }`}
                    >
                      <option value="">Select type</option>
                      <option value="Old Resident">Old Resident — 6+ months</option>
                      <option value="New Resident">New Resident — within 6 months</option>
                    </select>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className={`text-[11px] font-semibold font-kumbh ${t.subtleText}`}>
                      {tr.profilePage.dateStarted}
                    </label>
                    <input
                      type="date"
                      value={residencyStartDraft}
                      onChange={(e) => setResidencyStartDraft(e.target.value)}
                      disabled={contactSaving}
                      className={`w-full rounded-xl border px-3 py-2 text-[13px] font-kumbh outline-none transition ${
                        isDark
                          ? "border-slate-700 bg-slate-900/60 text-slate-100 focus:border-emerald-400/60"
                          : "border-slate-200 bg-white text-slate-700 focus:border-emerald-400"
                      }`}
                    />
                  </div>

                  <div className="space-y-2 text-left sm:col-span-2">
                    <label className={`text-[11px] font-semibold font-kumbh ${t.subtleText}`}>
                      {tr.profilePage.registeredVoter}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setVoterDraft("1")}
                        disabled={contactSaving}
                        className={`rounded-xl border px-3 py-2 text-[12px] font-semibold font-kumbh transition ${
                          voterDraft === "1"
                            ? t.primarySolid + " text-white"
                            : isDark
                              ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                              : "border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {tr.common.yes}
                      </button>
                      <button
                        type="button"
                        onClick={() => setVoterDraft("0")}
                        disabled={contactSaving}
                        className={`rounded-xl border px-3 py-2 text-[12px] font-semibold font-kumbh transition ${
                          voterDraft === "0"
                            ? t.primarySolid + " text-white"
                            : isDark
                              ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                              : "border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {tr.common.no}
                      </button>
                    </div>
                  </div>
                </div>
                </div>
              )}

            </div>

            <div
              className={`border-t px-5 py-4 ${
                isDark ? "border-slate-800 bg-slate-900" : "border-slate-100 bg-white"
              }`}
            >
              {contactError && (
                <p className="mb-2 text-left text-[12px] font-kumbh text-rose-600">
                  {contactError}
                </p>
              )}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeContactModal}
                  disabled={contactSaving}
                  className={`rounded-full border px-4 py-2 text-[12px] font-semibold font-kumbh transition ${
                    isDark
                      ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {tr.profilePage.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleContactSave}
                  disabled={contactSaving}
                  className={`rounded-full px-4 py-2 text-[12px] font-semibold font-kumbh text-white transition ${
                    contactSaving ? "bg-slate-400 cursor-not-allowed" : t.primarySolid
                  }`}
                >
                  {contactSaving ? tr.profilePage.saving : tr.profilePage.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-7xl space-y-4">
        {isResident ? (
          <>
            <div className="space-y-1 text-left">
              <h1 className={`text-base font-bold font-spartan sm:text-lg ${t.cardText}`}>
                My Profile
              </h1>
              <p className={`text-[11px] font-kumbh sm:text-xs ${t.subtleText}`}>
                Review your personal details and account information.
              </p>
            </div>

            <section
              className={`${t.cardBg} relative overflow-hidden rounded-[24px] border ${t.cardBorder} shadow-[0_18px_44px_-34px_rgba(15,23,42,0.35)]`}
            >
              <div
                className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-br ${t.primaryGrad} opacity-10`}
              />
              <div ref={menuRef} className="absolute right-4 top-4 z-20 sm:right-5 sm:top-5">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                    isDark
                      ? "border-slate-700 bg-slate-900/90 text-slate-200 hover:bg-slate-800"
                      : "border-slate-200 bg-white/95 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </button>

                {menuOpen && (
                  <div
                    className={`absolute right-0 top-11 z-50 min-w-[190px] overflow-hidden rounded-xl border shadow-lg ${
                      isDark
                        ? "border-slate-700 bg-slate-900"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        openContactModal();
                      }}
                      className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-semibold font-kumbh transition ${
                        isDark
                          ? "text-slate-200 hover:bg-slate-800"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <UserRound className="h-4 w-4 shrink-0" />
                      {tr.profilePage.editContactInfoBtn}
                    </button>
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
                      {tr.profilePage.changePassword}
                    </button>
                    {canShowQr && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          openQrModal();
                        }}
                        className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-semibold font-kumbh transition ${
                          isDark
                            ? "text-slate-200 hover:bg-slate-800"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <QrCode className="h-4 w-4 shrink-0" />
                        View QR
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="relative px-5 py-6 sm:px-7 sm:py-7">
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`group relative -translate-y-2 sm:-translate-y-3 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 ${
                      isDark ? "border-slate-700" : "border-white"
                    } bg-gradient-to-br ${t.primaryGrad} text-white shadow-[0_18px_36px_-24px_rgba(15,23,42,0.5)]`}
                  >
                    {residentPhoto ? (
                      <img
                        src={residentPhoto}
                        alt="Resident profile"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <>
                        <div className="absolute inset-2 rounded-full bg-white/10" />
                        <span className="relative text-[28px] font-black font-spartan">
                          {getInitials(userName)}
                        </span>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={openPhotoModal}
                      className="absolute inset-0 cursor-pointer"
                    >
                      <span
                        className={`absolute inset-0 flex items-center justify-center text-white opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 ${
                          isDark ? "bg-slate-950/50" : "bg-black/40"
                        }`}
                      >
                        <Camera className="h-5 w-5" />
                      </span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={openPhotoModal}
                    className={`inline-flex items-center justify-center gap-2 self-center rounded-full border px-3.5 py-1.5 text-[10px] font-semibold leading-none font-kumbh transition sm:text-[11px] ${
                      isDark
                        ? "border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-800"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Camera className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
                    {tr.profilePage.changeProfilePhoto}
                  </button>

                  <h1 className={`mt-3 text-[20px] font-bold leading-tight font-spartan sm:text-[24px] ${t.cardText}`}>
                    {userName}
                  </h1>

                  <p className={`mt-1 max-w-lg break-words text-[11px] font-medium font-kumbh sm:text-[12px] ${t.subtleText}`}>
                    {headerIdentity}
                  </p>

                  <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
                    <div
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-semibold font-kumbh sm:text-[10px] ${
                        isDark
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                          : "border-emerald-200 bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      <BadgeCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      {accountStatus}
                    </div>
                    <div
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[9px] font-semibold font-kumbh sm:text-[10px] ${
                        isDark
                          ? "border-slate-700 bg-slate-900/60 text-slate-200"
                          : "border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      {roleLabel}
                    </div>
                  </div>

                  {profileLoading && (
                    <p className={`mt-2.5 text-[11px] font-kumbh ${t.subtleText}`}>
                      {tr.profilePage.refreshingProfile}
                    </p>
                  )}
                  {profileError && !profileLoading && (
                    <p className="mt-2.5 text-[11px] font-kumbh text-rose-500">
                      {profileError}
                    </p>
                  )}

                </div>
              </div>
            </section>

            <div className="grid gap-4 xl:grid-cols-2">
              <ResidentProfileCard
                title="Personal information"
                rows={residentPersonalRows}
                actionLabel="Edit"
                onAction={openContactModal}
                isDark={isDark}
                t={t}
              />
              <ResidentProfileCard
                title="Account details"
                rows={residentAccountRows}
                isDark={isDark}
                t={t}
              />
              <ResidentProfileCard
                title="Address"
                rows={residentResidencyRows}
                actionLabel="Edit"
                onAction={openContactModal}
                isDark={isDark}
                t={t}
              />
              <ResidentProfileCard
                title="Access & settings"
                rows={residentAccessRows}
                isDark={isDark}
                t={t}
              />
            </div>
          </>
        ) : (
          <>
        <div className="space-y-4 text-left">
          <div>
            <h1 className={`text-lg font-bold font-spartan ${t.cardText}`}>
              {tr.profilePage.profile}
            </h1>
            <p className={`text-xs font-kumbh ${t.subtleText}`}>
              {tr.profilePage.reviewDesc}
            </p>
          </div>
        </div>
        {/* Compact header */}
        <section
          className={`${t.cardBg} relative rounded-[22px] border ${t.cardBorder} shadow-[0_24px_58px_-36px_rgba(15,23,42,0.35)]`}
        >
          <div
            className={`absolute inset-0 rounded-[22px] bg-gradient-to-br ${t.primaryGrad} opacity-10`}
          />
          <div className="relative flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5 sm:py-4">
            {/* Avatar */}
            <div
              className={`group relative flex h-[60px] w-[60px] flex-shrink-0 items-center justify-center self-start overflow-hidden rounded-[18px] border-2 ${
                isDark ? "border-slate-700" : "border-white"
              } bg-gradient-to-br ${t.primaryGrad} text-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.45)]`}
            >
              {residentPhoto ? (
                <img
                  src={residentPhoto}
                  alt="Resident profile"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <>
                  <div className="absolute inset-1 rounded-[14px] bg-white/10" />
                  <span className="relative text-[20px] font-black font-spartan">
                    {getInitials(userName)}
                  </span>
                </>
              )}
              {isResident && (
                <button
                  type="button"
                  onClick={openPhotoModal}
                  className="absolute inset-0 cursor-pointer"
                >
                  <span
                    className={`absolute inset-0 flex items-center justify-center text-white opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 ${
                      isDark ? "bg-slate-950/50" : "bg-black/40"
                    }`}
                  >
                    <Camera className="h-5 w-5" />
                  </span>
                </button>
              )}
            </div>

            {/* Identity */}
            <div className="min-w-0 flex-1 text-left">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <h1 className={`text-[20px] font-bold leading-tight font-spartan sm:text-[22px] ${t.cardText}`}>
                  {userName}
                </h1>
                <span className={`text-[13px] font-semibold font-kumbh ${infoAccent}`}>
                  {roleLabel}
                </span>
              </div>
              <p className={`mt-0.5 break-words text-left text-[12px] font-medium font-kumbh ${t.subtleText}`}>
                {headerIdentity}
              </p>
              {profileLoading && (
                <p className={`mt-1 text-left text-[11px] font-kumbh ${t.subtleText}`}>
                  {tr.profilePage.refreshingProfile}
                </p>
              )}
              {profileError && !profileLoading && (
                <p className="mt-1 text-left text-[11px] font-kumbh text-rose-500">
                  {profileError}
                </p>
              )}
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
                    {tr.profilePage.changePassword}
                  </button>

                  {isResident && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        openContactModal();
                      }}
                      className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-semibold font-kumbh transition ${
                        isDark
                          ? "text-slate-200 hover:bg-slate-800"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <UserRound className="h-4 w-4 shrink-0" />
                      {tr.profilePage.editContactInfoBtn}
                    </button>
                  )}

                  {adminAccount && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setView("logs");
                        setLogsEverOpened(true);
                      }}
                      className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-semibold font-kumbh transition ${
                        isDark
                          ? "text-slate-200 hover:bg-slate-800"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <ActivitySquare className="h-4 w-4 shrink-0" />
                      {tr.profilePage.viewActivityLogs}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        
        {isResident && (
          <div
            className={`relative overflow-hidden rounded-[18px] border px-4 py-3 text-left shadow-[0_14px_32px_-26px_rgba(15,23,42,0.25)] ${
              isDark
                ? "border-sky-700/40 bg-sky-900/10"
                : "border-sky-200/70 bg-sky-50/60"
            }`}
          >
            <div
              className={`absolute left-0 top-0 h-full w-1 ${
                isDark ? "bg-sky-400/70" : "bg-sky-500/80"
              }`}
            />
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                  isDark ? "bg-sky-500/10 text-sky-200" : "bg-sky-100 text-sky-700"
                }`}
              >
                <Info className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p
                  className={`text-[12px] font-semibold font-kumbh ${
                    isDark ? "text-sky-100" : "text-sky-900"
                  }`}
                >
                  {tr.profilePage.noteTitle}
                </p>
                <p className={`text-[11px] font-kumbh ${isDark ? "text-sky-100/80" : "text-sky-800"}`}>
                  {tr.profilePage.noteDesc}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Slide container — profile ←→ activity logs */}
        <div className="overflow-x-hidden">
          <div
            className="flex will-change-transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{
              width: "200%",
              transform: view === "profile" ? "translateX(0%)" : "translateX(-50%)",
            }}
          >
            {/* Profile panels */}
            <div className="min-w-0" style={{ width: "50%" }}>
              <div className="grid gap-4 xl:grid-cols-2 items-start">
                <div className="xl:col-span-2">
                  <ProfilePanel
                    title={tr.profilePage.personalInfoPanel}
                    subtitle={tr.profilePage.personalInfoSubtitle}
                    icon={UserRound}
                    fields={personalFields}
                    gridClassName="grid-cols-2 sm:grid-cols-3"
                    fullClassName="col-span-2 sm:col-span-3"
                    t={t}
                    isDark={isDark}
                  />
                </div>

                <ProfilePanel
                  title={tr.profilePage.residencyInfoPanel}
                  subtitle={tr.profilePage.residencyInfoSubtitle}
                  icon={MapPinned}
                  fields={residencyFields}
                  gridClassName="grid-cols-2"
                  fullClassName="col-span-2"
                  t={t}
                  isDark={isDark}
                />

                {canShowQr && (
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
                          <QrCode className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <h2 className={`text-[14px] font-bold font-spartan leading-tight ${t.cardText}`}>
                            Resident QR
                          </h2>
                          <p className={`text-[12px] font-kumbh leading-4 ${t.subtleText}`}>
                            View and download your official QR code.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-left">
                          <p className={`text-[12px] font-semibold font-kumbh ${t.cardText}`}>
                            Use this QR code for barangay verification and services.
                          </p>
                          <p className={`text-[11px] font-kumbh ${t.subtleText}`}>
                            Keep a copy on your phone or save it for quick access.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={openQrModal}
                          className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold font-kumbh text-white transition ${t.primarySolid}`}
                        >
                          <QrCode className="h-4 w-4" /> View QR
                        </button>
                      </div>
                      {qrError && (
                        <p className="mt-3 text-[11px] font-kumbh text-rose-500">{qrError}</p>
                      )}
                    </div>
                  </section>
                )}
                <ProfilePanel
                  title={tr.profilePage.accountInfoPanel}
                  subtitle={tr.profilePage.accountInfoSubtitle}
                  icon={ShieldCheck}
                  fields={accountFields}
                  gridClassName="grid-cols-2"
                  fullClassName="col-span-2"
                  t={t}
                  isDark={isDark}
                />
              </div>
            </div>

            {/* Activity logs panel */}
            <div className="min-w-0" style={{ width: "50%" }}>
              {logsEverOpened && (
                <ActivityLogsView
                  t={t}
                  isDark={isDark}
                  currentTheme={currentTheme}
                  onBack={() => setView("profile")}
                />
              )}
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
