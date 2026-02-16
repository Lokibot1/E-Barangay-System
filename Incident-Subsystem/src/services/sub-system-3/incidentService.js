import { getToken, isAuthenticated } from "./loginService";

const API_BASE = "http://localhost:8000/api";

/**
 * Fetch available incident types from the backend.
 */
const getIncidentTypes = async () => {
  if (!isAuthenticated()) {
    throw new Error("You must be logged in to fetch incident types.");
  }

  const response = await fetch(`${API_BASE}/incident-types`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch incident types.");
  }

  return data;
};

/**
 * Submit a new incident report.
 * Sends a multipart/form-data POST so file attachments are included.
 */
const submitReport = async (formData) => {
  if (!isAuthenticated()) {
    throw new Error("You must be logged in to submit an incident report.");
  }

  const body = new FormData();

  body.append("description", formData.description || "");
  body.append("location", formData.location || "");
  body.append("latitude", formData.latitude || "");
  body.append("longitude", formData.longitude || "");
  body.append("additional_notes", formData.additionalNotes || "");

  // Append selected incident type IDs
  if (formData.incidentTypes && formData.incidentTypes.length > 0) {
    formData.incidentTypes.forEach((typeId, index) => {
      body.append(`types[${index}]`, typeId);
    });
  }

  // Append custom types (for "Others")
  if (formData.customTypes && formData.customTypes.length > 0) {
    formData.customTypes.forEach((customType, index) => {
      body.append(`custom_types[${index}]`, customType);
    });
  }

  if (formData.attachments && formData.attachments.length > 0) {
    body.append("evidence", formData.attachments[0]);
  }

  const response = await fetch(`${API_BASE}/incidents`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to submit incident report.");
  }

  return data;
};

const getMyIncidents = async () => {
  if (!isAuthenticated()) {
    throw new Error("You must be logged in to view incidents.");
  }

  const response = await fetch(`${API_BASE}/incidents`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch incidents.");
  }

  return data;
};

const getAllIncidents = async () => {
  if (!isAuthenticated()) {
    throw new Error("You must be logged in to view incidents.");
  }

  const response = await fetch(`${API_BASE}/incidents`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch all incidents.");
  }

  return data;
};

const updateIncident = async (id, updates) => {
  if (!isAuthenticated()) {
    throw new Error("You must be logged in to update an incident.");
  }

  const response = await fetch(`${API_BASE}/incidents/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(updates),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update incident.");
  }

  return data;
};

export const incidentService = {
  getIncidentTypes,
  submitReport,
  getMyIncidents,
  getAllIncidents,
  updateIncident,
};
