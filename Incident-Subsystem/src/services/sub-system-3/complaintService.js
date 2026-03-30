import {
  isAuthenticated,
} from "../../homepage/services/loginService";
import { INCIDENT_API_BASE_URL } from "../../config/runtimeApi";
import { requestJson } from "../shared/http";

const API_BASE = INCIDENT_API_BASE_URL;

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

  // Append custom field values as custom_fields[field_name]
  if (
    formData.customFieldValues &&
    typeof formData.customFieldValues === "object"
  ) {
    Object.entries(formData.customFieldValues).forEach(([fieldName, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => body.append(`custom_fields[${fieldName}][]`, v));
      } else if (value !== null && value !== undefined && value !== "") {
        body.append(`custom_fields[${fieldName}]`, value);
      }
    });
  }

  return requestJson(`${API_BASE}/complaints`, {
    method: "POST",
    body,
    errorMessage: "Failed to submit complaint.",
  });
};

export const getMyComplaints = async () => {
  if (!isAuthenticated()) {
    throw new Error("You must be logged in to view complaints.");
  }

  return requestJson(`${API_BASE}/complaints`, {
    errorMessage: "Failed to fetch complaints.",
  });
};

export const updateComplaint = async (id, updates) => {
  if (!isAuthenticated()) {
    throw new Error("You must be logged in to update a complaint.");
  }

  // Build query string from updates (e.g. ?status=resolved)
  const params = new URLSearchParams(updates).toString();
  const url = `${API_BASE}/complaints/${id}${params ? `?${params}` : ""}`;

  return requestJson(url, {
    method: "PUT",
    errorMessage: "Failed to update complaint.",
  });
};

export const getAllComplaints = async () => {
  if (!isAuthenticated()) {
    throw new Error("You must be logged in to view complaints.");
  }

  return requestJson(`${API_BASE}/complaints`, {
    errorMessage: "Failed to fetch all complaints.",
  });
};

export const getComplaintUpdates = async (id) => {
  if (!isAuthenticated()) {
    throw new Error("You must be logged in to view updates.");
  }

  return requestJson(`${API_BASE}/complaints/${id}/updates`, {
    errorMessage: "Failed to fetch complaint updates.",
  });
};

export const addComplaintUpdate = async (id, updateData) => {
  if (!isAuthenticated()) {
    throw new Error("You must be logged in to add an update.");
  }

  const body = new FormData();
  if (updateData.message) body.append("message", updateData.message);
  if (updateData.attachment) body.append("attachment", updateData.attachment);

  return requestJson(`${API_BASE}/complaints/${id}/updates`, {
    method: "POST",
    body,
    errorMessage: "Failed to add complaint update.",
  });
};
