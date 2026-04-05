import { API_HOST, RESIDENT_API_PORT } from "./runtimeApi";

const FRONTEND_PORT = import.meta.env.VITE_FRONTEND_PORT || "3000";

export const STORAGE_URL = `http://${API_HOST}:${RESIDENT_API_PORT}/storage`;
export const API_BASE_URL = `http://${API_HOST}:${RESIDENT_API_PORT}/api`;
export const VERIFY_URL = `http://${API_HOST}:${RESIDENT_API_PORT}`;
export const FRONTEND_URL =
  import.meta.env.VITE_FRONTEND_URL || `http://${API_HOST}:${FRONTEND_PORT}`;

/**
 * Use a backend document proxy endpoint instead of exposing raw storage URLs.
 * Set VITE_USE_RESIDENT_DOCUMENTS_PROXY=true when the backend route is available.
 */
export const RESIDENT_DOCUMENTS_PROXY_URL = `${API_BASE_URL}/resident-documents`;
export const USE_RESIDENT_DOCUMENTS_PROXY =
  import.meta.env.VITE_USE_RESIDENT_DOCUMENTS_PROXY === 'true';

export const getResidentDocumentUrl = (relativePath) => {
  if (!relativePath) return null;
  if (USE_RESIDENT_DOCUMENTS_PROXY) {
    return `${RESIDENT_DOCUMENTS_PROXY_URL}?path=${encodeURIComponent(relativePath)}`;
  }
  return `${STORAGE_URL}/${relativePath}`;
};
