import {
  getUser,
} from "../homepage/services/loginService";
import {
  getCurrentUserContactInfo,
  getCurrentUserDisplayName,
  getCurrentUserScope,
} from "./requestCenter";

const NOTIFICATION_PREFS_KEY = "ebs:security:notification-prefs";
const COMMUNICATION_LOG_KEY = "ebs:security:communication-log";
const TWO_FACTOR_KEY = "ebs:security:two-factor";
const TWO_FACTOR_SESSION_PREFIX = "ebs:security:two-factor:session:";

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

const isAdminLikeUser = (user) => {
  const role = String(user?.role || "").toLowerCase();
  return ["super_admin", "admin", "staff", "encoder", "viewer"].includes(role);
};

const defaultNotificationPreferences = {
  inApp: true,
  email: true,
  sms: false,
  documents: true,
  cases: true,
  appointments: true,
  security: true,
};

const createBackupCodes = () =>
  Array.from({ length: 6 }, () =>
    Math.random().toString(36).slice(2, 8).toUpperCase(),
  );

const getScope = (userScope) => String(userScope || getCurrentUserScope());

export const getNotificationPreferences = (userScope) => {
  const map = readJson(NOTIFICATION_PREFS_KEY, {});
  return {
    ...defaultNotificationPreferences,
    ...(map[getScope(userScope)] || {}),
  };
};

export const saveNotificationPreferences = (nextPreferences, userScope) => {
  const scope = getScope(userScope);
  const map = readJson(NOTIFICATION_PREFS_KEY, {});
  const merged = {
    ...defaultNotificationPreferences,
    ...nextPreferences,
  };

  writeJson(NOTIFICATION_PREFS_KEY, {
    ...map,
    [scope]: merged,
  });

  return merged;
};

export const listCommunicationLogs = (userScope) => {
  const scope = getScope(userScope);
  return readJson(COMMUNICATION_LOG_KEY, [])
    .filter((entry) => String(entry?.userScope || "") === scope)
    .sort(
      (left, right) =>
        new Date(right?.createdAt || 0).getTime() -
        new Date(left?.createdAt || 0).getTime(),
    );
};

export const queueCommunicationEvent = ({
  category,
  title,
  message,
  metadata = {},
  userScope,
  recipients = {},
}) => {
  const scope = getScope(userScope);
  const preferences = getNotificationPreferences(scope);
  const { email, phone } = {
    ...getCurrentUserContactInfo(),
    ...recipients,
  };
  const displayName = getCurrentUserDisplayName();

  const categoryEnabled = {
    documents: preferences.documents,
    cases: preferences.cases,
    appointments: preferences.appointments,
    security: preferences.security,
  }[category] ?? true;

  if (!categoryEnabled) {
    return [];
  }

  const channelDefinitions = [
    {
      enabled: preferences.inApp,
      channel: "In-App",
      recipient: displayName,
    },
    {
      enabled: preferences.email && email,
      channel: "Email",
      recipient: email,
    },
    {
      enabled: preferences.sms && phone,
      channel: "SMS",
      recipient: phone,
    },
  ].filter((entry) => Boolean(entry.enabled));

  if (channelDefinitions.length === 0) {
    return [];
  }

  const entries = channelDefinitions.map((channelEntry, index) => ({
    id: `${Date.now()}-${index}-${Math.random().toString(16).slice(2, 8)}`,
    userScope: scope,
    category,
    title,
    message,
    channel: channelEntry.channel,
    recipient: channelEntry.recipient,
    status: "queued",
    createdAt: new Date().toISOString(),
    metadata,
  }));

  const existing = readJson(COMMUNICATION_LOG_KEY, []);
  writeJson(COMMUNICATION_LOG_KEY, [...entries, ...existing].slice(0, 300));

  return entries;
};

export const getTwoFactorConfig = (userScope) => {
  const map = readJson(TWO_FACTOR_KEY, {});
  const config = map[getScope(userScope)] || {};
  return {
    enabled: false,
    passcode: "",
    backupCodes: [],
    updatedAt: "",
    ...config,
  };
};

export const saveTwoFactorConfig = (nextConfig, userScope) => {
  const scope = getScope(userScope);
  const map = readJson(TWO_FACTOR_KEY, {});
  const current = getTwoFactorConfig(scope);
  const merged = {
    ...current,
    ...nextConfig,
    updatedAt: new Date().toISOString(),
  };

  writeJson(TWO_FACTOR_KEY, {
    ...map,
    [scope]: merged,
  });

  return merged;
};

export const enableTwoFactor = ({ passcode }, userScope) => {
  const normalizedPasscode = String(passcode || "")
    .replace(/\D/g, "")
    .slice(0, 6);

  if (normalizedPasscode.length !== 6) {
    throw new Error("Use a 6-digit verification code.");
  }

  const config = saveTwoFactorConfig(
    {
      enabled: true,
      passcode: normalizedPasscode,
      backupCodes: createBackupCodes(),
    },
    userScope,
  );

  return config;
};

export const disableTwoFactor = (userScope) => {
  const scope = getScope(userScope);
  const map = readJson(TWO_FACTOR_KEY, {});
  const nextMap = { ...map };
  delete nextMap[scope];
  writeJson(TWO_FACTOR_KEY, nextMap);
  clearSecondFactorSession(scope);
};

const getSecondFactorSessionKey = (userScope) =>
  `${TWO_FACTOR_SESSION_PREFIX}${getScope(userScope)}`;

export const isSecondFactorVerified = (userScope) => {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(getSecondFactorSessionKey(userScope)) === "verified";
};

export const markSecondFactorVerified = (userScope) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(getSecondFactorSessionKey(userScope), "verified");
};

export const clearSecondFactorSession = (userScope) => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(getSecondFactorSessionKey(userScope));
};

export const requiresSecondFactor = (user = getUser()) => {
  if (!user || !isAdminLikeUser(user)) return false;

  const scope = String(
    user?.id ?? user?.resident_id ?? user?.residentId ?? user?.email ?? "",
  );
  const config = getTwoFactorConfig(scope);

  return Boolean(config.enabled) && !isSecondFactorVerified(scope);
};

export const verifySecondFactorCode = (code, userScope) => {
  const scope = getScope(userScope);
  const config = getTwoFactorConfig(scope);
  const normalizedCode = String(code || "").trim().toUpperCase();

  if (!config.enabled) {
    return { success: true, backupUsed: false };
  }

  if (normalizedCode === String(config.passcode || "").toUpperCase()) {
    markSecondFactorVerified(scope);
    return { success: true, backupUsed: false };
  }

  if (config.backupCodes.includes(normalizedCode)) {
    saveTwoFactorConfig(
      {
        ...config,
        backupCodes: config.backupCodes.filter(
          (entry) => entry !== normalizedCode,
        ),
      },
      scope,
    );
    markSecondFactorVerified(scope);
    return { success: true, backupUsed: true };
  }

  return { success: false, backupUsed: false };
};
