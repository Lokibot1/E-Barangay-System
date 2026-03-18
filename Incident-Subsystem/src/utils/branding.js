import { BRANDING_API_URL } from "../config/runtimeApi";
import { getToken } from "../homepage/services/loginService";

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
    return data?.dataUrl || data?.imageUrl || "";
  } catch {
    return null;
  }
};

const buildBrandingHeaders = (includeJson = false) => {
  const token = getToken();
  const headers = { Accept: "application/json" };

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const saveBarangayLogoDataUrlRemote = async (dataUrl) => {
  const res = await fetch(BRANDING_API_URL, {
    method: "POST",
    headers: buildBrandingHeaders(true),
    body: JSON.stringify({ dataUrl }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data?.message ||
      (res.status === 401 || res.status === 403
        ? "Only an authenticated admin can update the barangay logo."
        : "Failed to save logo."),
    );
  }
  return data?.dataUrl || data?.imageUrl || dataUrl || "";
};

export const clearBarangayLogoDataUrlRemote = async () => {
  const res = await fetch(BRANDING_API_URL, {
    method: "DELETE",
    headers: buildBrandingHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      data?.message ||
      (res.status === 401 || res.status === 403
        ? "Only an authenticated admin can update the barangay logo."
        : "Failed to remove logo."),
    );
  }
};
