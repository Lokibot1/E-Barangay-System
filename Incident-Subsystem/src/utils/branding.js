import { BRANDING_API_URL } from "../config/runtimeApi";
import {
  createServerUnavailableError,
  rememberRemoteRequestFailure,
  rememberRemoteRequestSuccess,
  runDedupedRemoteRequest,
  shouldAttemptRemoteRequest,
} from "./remoteRequestControl";

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
  if (!shouldAttemptRemoteRequest(BRANDING_API_URL)) {
    return null;
  }

  try {
    const result = await runDedupedRemoteRequest(
      `GET:${BRANDING_API_URL}`,
      async () => {
        const response = await fetch(BRANDING_API_URL, {
          headers: { Accept: "application/json" },
        });
        const data = await response.json().catch(() => ({}));

        return {
          ok: response.ok,
          data,
        };
      },
    );
    if (!result.ok) return null;
    rememberRemoteRequestSuccess(BRANDING_API_URL);
    return result.data?.dataUrl || result.data?.imageUrl || "";
  } catch (error) {
    rememberRemoteRequestFailure(BRANDING_API_URL, error);
    return null;
  }
};

const buildBrandingHeaders = (includeJson = false) => {
  const headers = { Accept: "application/json" };

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

export const saveBarangayLogoDataUrlRemote = async (dataUrl) => {
  try {
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
    rememberRemoteRequestSuccess(BRANDING_API_URL);
    return data?.dataUrl || data?.imageUrl || dataUrl || "";
  } catch (error) {
    if (error instanceof TypeError) {
      rememberRemoteRequestFailure(BRANDING_API_URL, error);
      throw createServerUnavailableError();
    }
    throw error;
  }
};

export const clearBarangayLogoDataUrlRemote = async () => {
  try {
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
    rememberRemoteRequestSuccess(BRANDING_API_URL);
  } catch (error) {
    if (error instanceof TypeError) {
      rememberRemoteRequestFailure(BRANDING_API_URL, error);
      throw createServerUnavailableError();
    }
    throw error;
  }
};
