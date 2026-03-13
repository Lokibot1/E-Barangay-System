import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ActivitySquare,
  BadgeCheck,
  Camera,
  Image,
  KeyRound,
  MapPinned,
  MoreVertical,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import themeTokens from "../../Themetokens";
import { authService } from "../../homepage/services/authService";
import { getUser, isAdmin, logout } from "../../homepage/services/loginService";
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
  const [view, setView] = useState("profile");
  const [logsEverOpened, setLogsEverOpened] = useState(false);
  const menuRef = useRef(null);
  const photoInputRef = useRef(null);
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
  const isResident = !adminAccount;
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
  const goToBranding = () => {
    navigate(adminAccount ? "/admin/settings?tab=branding" : "/settings?tab=branding");
  };
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
                    Change Profile Photo
                  </h2>
                  <p className={`text-[11px] font-kumbh ${isDark ? "text-slate-400" : t.subtleText}`}>
                    Crop, zoom, and save your picture.
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
                  Choose photo
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
                  PNG or JPG up to 2MB. Camera capture supported.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold font-kumbh">
                  <span className={isDark ? "text-slate-300" : "text-slate-600"}>Zoom</span>
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
                  Remove photo
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
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePhotoSave}
                    disabled={!photoFile || photoSaving}
                    className={`rounded-full px-4 py-2 text-[12px] font-semibold font-kumbh text-white transition ${
                      photoFile && !photoSaving ? t.primarySolid : "bg-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {photoSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="space-y-4 text-left">
          <div>
            <h1 className={`text-lg font-bold font-spartan ${t.cardText}`}>
              Profile
            </h1>
            <p className={`text-xs font-kumbh ${t.subtleText}`}>
              Review your account information and security details.
            </p>
          </div>
          <div className={`flex items-center gap-5 border-b ${t.cardBorder} pt-3`}>
            <button
              type="button"
              className={`relative pb-2 text-[13px] font-semibold font-kumbh transition inline-flex items-center gap-2 ${t.primaryText}`}
            >
              <UserRound size={14} />
              View Profile
              <span className={`absolute left-0 right-0 -bottom-px h-0.5 ${t.primarySolid}`} />
            </button>
            {adminAccount && (
              <button
                type="button"
                onClick={goToBranding}
                className={`relative pb-2 text-[13px] font-semibold font-kumbh transition inline-flex items-center gap-2 ${t.subtleText} hover:opacity-80`}
              >
                <Image size={14} />
                Barangay Logo
              </button>
            )}
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
                      View Activity Logs
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

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
                    title="Personal information"
                    subtitle="Identity and contact details based on the user registration record."
                    icon={UserRound}
                    fields={personalFields}
                    gridClassName="grid-cols-2 sm:grid-cols-3"
                    fullClassName="col-span-2 sm:col-span-3"
                    t={t}
                    isDark={isDark}
                  />
                </div>

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
      </div>
    </div>
  );
}
