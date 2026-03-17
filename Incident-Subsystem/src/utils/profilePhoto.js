import { PROFILE_PHOTO_API_URL } from "../config/runtimeApi";

const PHOTO_KEY_PREFIX = "resident_profile_photo_";

const resolveResidentIdentifier = (user) => {
  if (!user) return "";
  const keySeed =
    user.id ||
    user.barangay_id ||
    user.resident_id ||
    user.tracking_number ||
    user.email ||
    user.username;
  return keySeed ? String(keySeed).trim() : "";
};

const resolveResidentKey = (user) => {
  const identifier = resolveResidentIdentifier(user);
  if (!identifier) return "";
  return `${PHOTO_KEY_PREFIX}${identifier}`;
};

export const getResidentProfilePhoto = (user) => {
  const key = resolveResidentKey(user);
  if (!key) return "";
  return localStorage.getItem(key) || "";
};

const setCachedResidentPhoto = (user, dataUrl) => {
  const key = resolveResidentKey(user);
  if (!key) return false;
  if (dataUrl) {
    localStorage.setItem(key, dataUrl);
  } else {
    localStorage.removeItem(key);
  }
  return true;
};

export const syncResidentProfilePhoto = async (user) => {
  const identifier = resolveResidentIdentifier(user);
  if (!identifier) return "";

  const response = await fetch(
    `${PROFILE_PHOTO_API_URL}?identifier=${encodeURIComponent(identifier)}`,
  );
  if (!response.ok) {
    throw new Error("Failed to fetch profile photo.");
  }
  const data = await response.json();
  const dataUrl = data?.dataUrl || "";
  setCachedResidentPhoto(user, dataUrl);
  return dataUrl;
};

export const saveResidentProfilePhoto = async (user, dataUrl) => {
  const identifier = resolveResidentIdentifier(user);
  if (!identifier) {
    throw new Error("Missing resident identifier.");
  }
  if (!dataUrl) {
    throw new Error("Profile photo data is required.");
  }

  const response = await fetch(PROFILE_PHOTO_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ identifier, dataUrl }),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || "Failed to save profile photo.");
  }
  setCachedResidentPhoto(user, payload?.dataUrl || dataUrl);
  return payload?.dataUrl || dataUrl;
};

export const removeResidentProfilePhoto = async (user) => {
  const identifier = resolveResidentIdentifier(user);
  if (!identifier) {
    throw new Error("Missing resident identifier.");
  }

  const response = await fetch(PROFILE_PHOTO_API_URL, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ identifier }),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || "Failed to remove profile photo.");
  }
  setCachedResidentPhoto(user, "");
};

export const isSupportedProfilePhoto = (file) =>
  file && ["image/png", "image/jpeg"].includes(file.type);
