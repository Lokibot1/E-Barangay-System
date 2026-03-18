const resolveHost = () => {
  if (import.meta.env.VITE_API_HOST) return import.meta.env.VITE_API_HOST;
  if (typeof window !== "undefined" && window.location?.hostname) {
    return window.location.hostname;
  }
  return "127.0.0.1";
};

export const API_HOST = resolveHost();
export const INCIDENT_API_PORT = import.meta.env.VITE_INCIDENT_API_PORT || "8000";
export const INCIDENT_API_BASE_URL =
  import.meta.env.VITE_INCIDENT_API_BASE_URL ||
  `http://${API_HOST}:${INCIDENT_API_PORT}/api`;
export const DOCUMENTS_API_PORT = import.meta.env.VITE_DOCUMENTS_API_PORT || "8001";
export const DOCUMENTS_API_BASE_URL =
  import.meta.env.VITE_DOCUMENTS_API_BASE_URL ||
  `http://${API_HOST}:${DOCUMENTS_API_PORT}/api`;
export const RESIDENT_API_PORT = import.meta.env.VITE_RESIDENT_API_PORT || "8002";
export const RESIDENT_API_BASE_URL =
  import.meta.env.VITE_RESIDENT_API_BASE_URL ||
  `http://${API_HOST}:${RESIDENT_API_PORT}/api`;
export const PHP_API_BASE_URL =
  import.meta.env.VITE_PHP_API_BASE_URL ||
  `http://${API_HOST}/E-Barangay-System/api`;

export const BRANDING_API_URL =
  import.meta.env.VITE_BRANDING_API_URL ||
  `${PHP_API_BASE_URL}/branding/logo.php`;

export const PROFILE_PHOTO_API_URL =
  import.meta.env.VITE_PROFILE_PHOTO_API_URL ||
  `${PHP_API_BASE_URL}/profile/photo.php`;
