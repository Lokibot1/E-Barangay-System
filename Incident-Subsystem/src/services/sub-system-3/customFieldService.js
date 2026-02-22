import { getToken } from "./loginService";

const API_BASE = "http://localhost:8000/api";

/**
 * Fetch all custom fields from the backend.
 */
export const getAllCustomFields = async () => {
  const response = await fetch(`${API_BASE}/custom-fields`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch custom fields.");
  }
  return data;
};

/**
 * Create a new custom field.
 */
export const createCustomField = async (payload) => {
  const response = await fetch(`${API_BASE}/custom-fields`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to create custom field.");
  }
  return data;
};

/**
 * Update an existing custom field (e.g. toggle is_active).
 */
export const updateCustomField = async (id, payload) => {
  const response = await fetch(`${API_BASE}/custom-fields/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update custom field.");
  }
  return data;
};
