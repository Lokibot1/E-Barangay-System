const CLIENT_ERROR_LOG_KEY = "ebs:diagnostics:client-errors";
const BACKUPABLE_PREFIXES = ["ebs:"];
const BACKUPABLE_KEYS = [
  "appTheme",
  "barangay_logo_data_url",
  "complaint_draft",
  "incident_report_draft",
];
const BACKUPABLE_KEY_PREFIXES = [
  "userNotifications",
  "supportDraft",
  "supportQueue",
];

let installed = false;

const readJson = (key, fallback) => {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
};

export const listClientErrorLogs = () =>
  readJson(CLIENT_ERROR_LOG_KEY, []).sort(
    (left, right) =>
      new Date(right?.createdAt || 0).getTime() -
      new Date(left?.createdAt || 0).getTime(),
  );

export const clearClientErrorLogs = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CLIENT_ERROR_LOG_KEY);
};

export const logClientError = ({
  source = "client",
  message = "Unknown client error",
  stack = "",
  context = {},
  severity = "error",
}) => {
  const entry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    source,
    message: String(message),
    stack: String(stack || ""),
    context,
    severity,
    createdAt: new Date().toISOString(),
  };

  const existing = readJson(CLIENT_ERROR_LOG_KEY, []);
  writeJson(CLIENT_ERROR_LOG_KEY, [entry, ...existing].slice(0, 300));
  return entry;
};

export const installGlobalClientErrorLogging = () => {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (event) => {
    logClientError({
      source: "window.error",
      message: event?.message || "Unhandled window error",
      stack: event?.error?.stack || "",
      context: {
        filename: event?.filename || "",
        line: event?.lineno || 0,
        column: event?.colno || 0,
      },
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event?.reason;
    logClientError({
      source: "promise.rejection",
      message:
        reason?.message ||
        (typeof reason === "string" ? reason : "Unhandled promise rejection"),
      stack: reason?.stack || "",
      context: {
        reason:
          typeof reason === "string"
            ? reason
            : JSON.stringify(reason || {}),
      },
    });
  });
};

const shouldBackupKey = (key) =>
  BACKUPABLE_KEYS.includes(key) ||
  BACKUPABLE_PREFIXES.some((prefix) => key.startsWith(prefix)) ||
  BACKUPABLE_KEY_PREFIXES.some((prefix) => key.startsWith(prefix));

export const buildLocalBackupSnapshot = () => {
  if (typeof window === "undefined") {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      localStorage: {},
    };
  }

  const storageData = {};

  Object.keys(localStorage).forEach((key) => {
    if (!shouldBackupKey(key)) return;
    storageData[key] = localStorage.getItem(key);
  });

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    localStorage: storageData,
  };
};

export const restoreLocalBackupSnapshot = (snapshot) => {
  if (
    typeof window === "undefined" ||
    !snapshot ||
    typeof snapshot !== "object" ||
    typeof snapshot.localStorage !== "object"
  ) {
    throw new Error("Invalid backup file.");
  }

  Object.entries(snapshot.localStorage).forEach(([key, value]) => {
    if (!shouldBackupKey(key)) return;

    if (value === null || value === undefined) {
      localStorage.removeItem(key);
      return;
    }

    localStorage.setItem(key, String(value));
  });

  return true;
};
