const resolveHost = () => {
  if (import.meta.env.VITE_API_HOST) return import.meta.env.VITE_API_HOST;
  if (typeof window !== "undefined" && window.location?.hostname) {
    return window.location.hostname;
  }
  return "127.0.0.1";
};

export const API_HOST = resolveHost();

export const BRANDING_API_URL =
  import.meta.env.VITE_BRANDING_API_URL ||
  `http://${API_HOST}/E-Barangay-System/api/branding/logo.php`;

export const PROFILE_PHOTO_API_URL =
  import.meta.env.VITE_PROFILE_PHOTO_API_URL ||
  `http://${API_HOST}/E-Barangay-System/api/profile/photo.php`;
