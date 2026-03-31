import {
  getUser,
  isAuthenticated,
} from "../../homepage/services/loginService";
import { INCIDENT_API_BASE_URL } from "../../config/runtimeApi";
import { requestJson } from "../shared/http";
import { memCache } from "../shared/cache";

const INCIDENT_TYPES_CACHE_KEY = "incident:types";
const INCIDENT_TYPES_TTL = 60 * 60 * 1000; // 60 minutes — rarely changes

const API_BASE = INCIDENT_API_BASE_URL;

/**
 * Fetch available incident types from the backend.
 * Cached for 60 minutes — these change only when an admin edits them.
 */
const getIncidentTypes = async () => {
  if (!isAuthenticated()) {
    throw new Error("You must be logged in to fetch incident types.");
  }

  return memCache.remember(INCIDENT_TYPES_CACHE_KEY, INCIDENT_TYPES_TTL, () =>
    requestJson(`${API_BASE}/incident-types`, {
      errorMessage: "Failed to fetch incident types.",
    })
  );
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

  const user = getUser();
  if (user) {
    const name = [user.first_name, user.middle_name, user.last_name]
      .filter(Boolean)
      .join(" ");
    body.append("reported_by", name);
  }

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

  return requestJson(`${API_BASE}/incidents`, {
    method: "POST",
    body,
    errorMessage: "Failed to submit incident report.",
  });
};

const getMyIncidents = async () => {
  if (!isAuthenticated()) {
    throw new Error("You must be logged in to view incidents.");
  }

  return requestJson(`${API_BASE}/incidents`, {
    errorMessage: "Failed to fetch incidents.",
  });
};

const getAllIncidents = async () => {
  if (!isAuthenticated()) {
    throw new Error("You must be logged in to view incidents.");
  }

  return requestJson(`${API_BASE}/incidents`, {
    errorMessage: "Failed to fetch all incidents.",
  });
};

const updateIncident = async (id, updates) => {
  if (!isAuthenticated()) {
    throw new Error("You must be logged in to update an incident.");
  }

  return requestJson(`${API_BASE}/incidents/${id}`, {
    method: "PUT",
    includeJson: true,
    body: JSON.stringify(updates),
    errorMessage: "Failed to update incident.",
  });
};

const getIncidentUpdates = async (id) => {
  if (!isAuthenticated()) {
    throw new Error("You must be logged in to view updates.");
  }

  return requestJson(`${API_BASE}/incidents/${id}/updates`, {
    errorMessage: "Failed to fetch incident updates.",
  });
};

const addIncidentUpdate = async (id, updateData) => {
  if (!isAuthenticated()) {
    throw new Error("You must be logged in to add an update.");
  }

  const body = new FormData();
  if (updateData.message) body.append("message", updateData.message);
  if (updateData.attachment) body.append("attachment", updateData.attachment);

  return requestJson(`${API_BASE}/incidents/${id}/updates`, {
    method: "POST",
    body,
    errorMessage: "Failed to add incident update.",
  });
};

export const incidentService = {
  getIncidentTypes,
  submitReport,
  getMyIncidents,
  getAllIncidents,
  updateIncident,
  getIncidentUpdates,
  addIncidentUpdate,
};
