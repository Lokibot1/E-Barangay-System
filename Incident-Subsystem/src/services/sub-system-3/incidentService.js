import { getToken, isAuthenticated } from "./loginService";

const API_BASE = "http://localhost:8000/api";

/**
 * Submit a new incident report.
 * Sends a multipart/form-data POST so file attachments are included.
 */
const submitReport = async (formData) => {
  if (!isAuthenticated()) {
    throw new Error("You must be logged in to submit an incident report.");
  }

  const body = new FormData();

  body.append("type", JSON.stringify(formData.incidentTypes));
  body.append("other_incident_type", formData.otherIncidentType || "");
  body.append("description", formData.description || "");
  body.append("latitude", formData.latitude || "");
  body.append("longitude", formData.longitude || "");
  body.append("location", formData.location || "");
  body.append("additional_notes", formData.additionalNotes || "");

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
  submitReport,
  getMyIncidents,
  getAllIncidents,
  updateIncident,
};
