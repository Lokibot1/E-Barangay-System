import { INCIDENT_API_BASE_URL } from "../../config/runtimeApi";
import { requestJson } from "../shared/http";

const API_BASE = INCIDENT_API_BASE_URL;

/**
 * Fetch all custom fields from the backend.
 */
export const getAllCustomFields = async () => {
  return requestJson(`${API_BASE}/custom-fields`, {
    errorMessage: "Failed to fetch custom fields.",
  });
};

/**
 * Create a new custom field.
 */
export const createCustomField = async (payload) => {
  return requestJson(`${API_BASE}/custom-fields`, {
    method: "POST",
    includeJson: true,
    body: JSON.stringify(payload),
    errorMessage: "Failed to create custom field.",
  });
};

/**
 * Update an existing custom field (e.g. toggle is_active).
 */
export const updateCustomField = async (id, payload) => {
  return requestJson(`${API_BASE}/custom-fields/${id}`, {
    method: "PUT",
    includeJson: true,
    body: JSON.stringify(payload),
    errorMessage: "Failed to update custom field.",
  });
};
