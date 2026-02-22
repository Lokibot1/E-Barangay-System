import { getToken, isAuthenticated } from "./loginService";

const API_BASE = "http://localhost:8000/api";

/**
 * File a new complaint.
 * Sends a multipart/form-data POST so file attachments are included.
 * Throws if the user is not logged in or the request fails.
 */
export const fileComplaint = async (formData) => {
  if (!isAuthenticated()) {
    throw new Error("You must be logged in to file a complaint.");
  }

  const body = new FormData();

  // Field names must match the Laravel Complaint model $fillable
  body.append("incident_date", formData.complaintDate);
  body.append("incident_time", formData.complaintTime);
  body.append("location", formData.location);
  body.append("type", formData.complaintType);
  body.append("severity", formData.severity);
  body.append("description", formData.description);
  body.append("complainant_name", formData.complainantName);
  body.append("complainant_contact", formData.complainantContact);
  body.append("respondent_name", formData.respondentName);
  body.append("respondent_address", formData.respondentAddress);
  body.append("desired_resolution", formData.desiredResolution);
  body.append("additional_notes", formData.additionalNotes);

  if (formData.latitude) body.append("latitude", formData.latitude);
  if (formData.longitude) body.append("longitude", formData.longitude);

  // Witnesses — join into a single string (backend stores as one field)
  const witnesses = formData.witnesses.filter((w) => w.trim() !== "");
  if (witnesses.length > 0) {
    body.append("witness", witnesses.join(", "));
  }

  // Evidence file (backend stores as evidence_path)
  if (formData.attachments && formData.attachments.length > 0) {
    body.append("evidence", formData.attachments[0]);
  }

  const response = await fetch(`${API_BASE}/complaints`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to submit complaint.");
  }

  return data;
};

export const getMyComplaints = async () => {
  if (!isAuthenticated()) {
    throw new Error("You must be logged in to view complaints.");
  }

  const response = await fetch(`${API_BASE}/complaints`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch complaints.");
  }

  return data;
};

export const updateComplaint = async (id, updates) => {
  if (!isAuthenticated()) {
    throw new Error("You must be logged in to update a complaint.");
  }

  // Build query string from updates (e.g. ?status=resolved)
  const params = new URLSearchParams(updates).toString();
  const url = `${API_BASE}/complaints/${id}${params ? `?${params}` : ""}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update complaint.");
  }

  return data;
};

export const getAllComplaints = async () => {
  if (!isAuthenticated()) {
    throw new Error("You must be logged in to view complaints.");
  }

  const response = await fetch(`${API_BASE}/complaints`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch all complaints.");
  }

  return data;
};

export const getComplaintUpdates = async (id) => {
  if (!isAuthenticated()) {
    throw new Error("You must be logged in to view updates.");
  }

  const response = await fetch(`${API_BASE}/complaints/${id}/updates`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch complaint updates.");
  }

  return data;
};

export const addComplaintUpdate = async (id, updateData) => {
  if (!isAuthenticated()) {
    throw new Error("You must be logged in to add an update.");
  }

  const response = await fetch(`${API_BASE}/complaints/${id}/updates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(updateData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to add complaint update.");
  }

  return data;
};
