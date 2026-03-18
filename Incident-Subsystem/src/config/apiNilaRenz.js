import { API_HOST, DOCUMENTS_API_PORT } from "./runtimeApi";

const FRONTEND_PORT = import.meta.env.VITE_FRONTEND_PORT || "3000";

export const STORAGE_URL = `http://${API_HOST}:${DOCUMENTS_API_PORT}/storage`;
export const API_BASE_URL = `http://${API_HOST}:${DOCUMENTS_API_PORT}/api`;
export const VERIFY_URL = `http://${API_HOST}:${DOCUMENTS_API_PORT}`;
export const FRONTEND_URL =
  import.meta.env.VITE_FRONTEND_URL || `http://${API_HOST}:${FRONTEND_PORT}`;
