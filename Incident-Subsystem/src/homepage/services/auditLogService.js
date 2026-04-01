import { INCIDENT_API_BASE_URL, PHP_API_BASE_URL } from "../../config/runtimeApi";
import { requestJson } from "../../services/shared/http";

const buildUrl = (params) => {
  const url = new URL(`${INCIDENT_API_BASE_URL}/audit-logs`);
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      url.searchParams.set(key, String(val));
    }
  });
  return url.toString();
};

const buildVerificationLogUrl = (params = {}) => {
  const url = new URL(`${PHP_API_BASE_URL}/shared/verification-admin-logs.php`);
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      url.searchParams.set(key, String(val));
    }
  });
  return url.toString();
};

export const fetchAuditLogs = async (params = {}) => {
  return requestJson(buildUrl(params), {
    errorMessage: "Failed to fetch audit logs.",
  }).catch((error) => {
    if (error.message === "The server is currently unavailable.") {
      throw new Error("Audit log backend is unavailable.");
    }
    throw error;
  });
};

export const fetchVerificationAdminLogs = async (params = {}) => {
  return requestJson(buildVerificationLogUrl(params), {
    errorMessage: "Failed to fetch verification logs.",
  }).catch((error) => {
    if (error.message === "The server is currently unavailable.") {
      throw new Error("Verification log backend is unavailable.");
    }
    throw error;
  });
};

export const createVerificationAdminLog = async (payload) => {
  return requestJson(buildVerificationLogUrl(), {
    method: "POST",
    includeJson: true,
    body: JSON.stringify(payload),
    errorMessage: "Failed to save verification log.",
  }).catch((error) => {
    if (error.message === "The server is currently unavailable.") {
      throw new Error("Verification log backend is unavailable.");
    }
    throw error;
  });
};
