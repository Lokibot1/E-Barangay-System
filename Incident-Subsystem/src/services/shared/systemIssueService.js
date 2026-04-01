import { PHP_API_BASE_URL } from "../../config/runtimeApi";
import { requestJson } from "./http";

const buildSystemIssueUrl = (params = {}) => {
  const url = new URL(`${PHP_API_BASE_URL}/support/system-issues.php`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
};

export const fetchSystemIssues = async (params = {}) => {
  return requestJson(buildSystemIssueUrl(params), {
    errorMessage: "Failed to load issue reports.",
  }).catch((error) => {
    if (error.message === "The server is currently unavailable.") {
      throw new Error("Issue report backend is unavailable.");
    }
    throw error;
  });
};

export const createSystemIssue = async (payload) => {
  return requestJson(buildSystemIssueUrl(), {
    method: "POST",
    includeJson: true,
    body: JSON.stringify(payload),
    errorMessage: "Failed to submit issue report.",
  }).catch((error) => {
    if (error.message === "The server is currently unavailable.") {
      throw new Error("Issue report backend is unavailable.");
    }
    throw error;
  });
};

export const updateSystemIssue = async (id, payload) => {
  return requestJson(buildSystemIssueUrl({ id }), {
    method: "PATCH",
    includeJson: true,
    body: JSON.stringify(payload),
    errorMessage: "Failed to update issue report.",
  }).catch((error) => {
    if (error.message === "The server is currently unavailable.") {
      throw new Error("Issue report backend is unavailable.");
    }
    throw error;
  });
};
