import { BRANDING_API_URL } from "../config/runtimeApi";

const STORAGE_KEY = "barangay_logo_data_url";

export const getBarangayLogoDataUrl = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEY) || "";
};

export const setBarangayLogoDataUrl = (dataUrl) => {
  if (typeof window === "undefined") return;
  if (dataUrl) {
    localStorage.setItem(STORAGE_KEY, dataUrl);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export const clearBarangayLogoDataUrl = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
};

export const isSupportedLogoFile = (file) => {
  if (!file) return false;
  return ["image/png", "image/jpeg", "image/jpg"].includes(file.type);
};

export const readImageFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });

export const fetchBarangayLogoDataUrlRemote = async () => {
  try {
    const res = await fetch(BRANDING_API_URL, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => ({}));
    return data?.dataUrl || "";
  } catch {
    return null;
  }
};

export const saveBarangayLogoDataUrlRemote = async (dataUrl) => {
  const res = await fetch(BRANDING_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ dataUrl }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || "Failed to save logo.");
  }
  return data?.dataUrl || dataUrl || "";
};

export const clearBarangayLogoDataUrlRemote = async () => {
  const res = await fetch(BRANDING_API_URL, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || "Failed to remove logo.");
  }
};
