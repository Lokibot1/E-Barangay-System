import { API_HOST, RESIDENT_API_PORT } from "./runtimeApi";

const FRONTEND_PORT = import.meta.env.VITE_FRONTEND_PORT || "3000";

export const STORAGE_URL = `http://${API_HOST}:${RESIDENT_API_PORT}/storage`;
export const API_BASE_URL = `http://${API_HOST}:${RESIDENT_API_PORT}/api`;
export const VERIFY_URL = `http://${API_HOST}:${RESIDENT_API_PORT}`;
export const FRONTEND_URL =
  import.meta.env.VITE_FRONTEND_URL || `http://${API_HOST}:${FRONTEND_PORT}`;

const safeDecode = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const normalizeResidentDocumentPath = (value) =>
  String(value || "")
    .trim()
    .replace(/^\/+/, "")
    .replace(/^storage\//, "");

/**
 * Use a backend document proxy endpoint instead of exposing raw storage URLs.
 * Set VITE_USE_RESIDENT_DOCUMENTS_PROXY=true when the backend route is available.
 */
export const RESIDENT_DOCUMENTS_PROXY_URL = `${API_BASE_URL}/resident-documents`;
export const USE_RESIDENT_DOCUMENTS_PROXY =
  import.meta.env.VITE_USE_RESIDENT_DOCUMENTS_PROXY === 'true';
export const FORCE_RESIDENT_DOCUMENTS_PROXY =
  import.meta.env.VITE_FORCE_RESIDENT_DOCUMENTS_PROXY === 'true';

const isLocalResidentApiHost = ["localhost", "127.0.0.1"].includes(
  String(API_HOST || "").toLowerCase(),
);

export const SHOULD_USE_RESIDENT_DOCUMENTS_PROXY =
  USE_RESIDENT_DOCUMENTS_PROXY &&
  (FORCE_RESIDENT_DOCUMENTS_PROXY || !isLocalResidentApiHost);

export const getResidentDocumentStorageUrl = (relativePath) => {
  const normalizedPath = normalizeResidentDocumentPath(relativePath);
  if (!normalizedPath) return null;
  return `${STORAGE_URL}/${normalizedPath}`;
};

export const extractResidentDocumentRelativePath = (value) => {
  const rawValue = String(value || "").trim();
  if (!rawValue) return null;

  if (!/^https?:\/\//i.test(rawValue)) {
    return normalizeResidentDocumentPath(safeDecode(rawValue));
  }

  try {
    const parsed = new URL(rawValue);
    const proxyUrl = new URL(RESIDENT_DOCUMENTS_PROXY_URL);
    const storageUrl = new URL(STORAGE_URL);

    if (
      parsed.origin === proxyUrl.origin &&
      parsed.pathname.replace(/\/+$/, "") === proxyUrl.pathname.replace(/\/+$/, "")
    ) {
      return normalizeResidentDocumentPath(
        safeDecode(parsed.searchParams.get("path") || ""),
      );
    }

    if (parsed.pathname.startsWith("/storage/")) {
      return normalizeResidentDocumentPath(safeDecode(parsed.pathname));
    }

    const storagePrefix = `${storageUrl.origin}${storageUrl.pathname.replace(/\/+$/, "")}/`;
    if (rawValue.startsWith(storagePrefix)) {
      return normalizeResidentDocumentPath(
        safeDecode(rawValue.slice(storagePrefix.length)),
      );
    }
  } catch {
    return normalizeResidentDocumentPath(rawValue);
  }

  return null;
};

export const getResidentDocumentUrl = (relativePath) => {
  const storageUrl = getResidentDocumentStorageUrl(relativePath);
  if (!storageUrl) return null;
  if (SHOULD_USE_RESIDENT_DOCUMENTS_PROXY) {
    const normalizedPath = extractResidentDocumentRelativePath(relativePath);
    return `${RESIDENT_DOCUMENTS_PROXY_URL}?path=${encodeURIComponent(normalizedPath)}`;
  }
  return storageUrl;
};
