import { incidentService } from "../../services/sub-system-3/incidentService";

jest.mock("../../utils/remoteRequestControl", () => ({
  shouldAttemptRemoteRequest: () => true,
  rememberRemoteRequestSuccess: () => {},
  rememberRemoteRequestFailure: () => {},
  runDedupedRemoteRequest: (_key, fn) => fn(),
  createServerUnavailableError: () => new Error("The server is currently unavailable."),
}));

jest.mock("../../services/shared/cache", () => ({
  memCache: {
    remember: (_key, _ttl, fetcher) => fetcher(),
    get: () => null,
    set: () => {},
    invalidate: () => {},
  },
}));

jest.mock("../../homepage/services/loginService", () => {
  const getToken = jest.fn();
  return {
    isAuthenticated: jest.fn(),
    getToken,
    getUser: jest.fn(),
    buildAuthHeaders: ({ includeJson = false } = {}) => {
      const tok = getToken();
      const h = tok ? { Authorization: `Bearer ${tok}` } : {};
      if (includeJson) h["Content-Type"] = "application/json";
      return h;
    },
    handleUnauthorizedResponse: () => {},
  };
});

import {
  isAuthenticated,
  getToken,
  getUser,
} from "../../homepage/services/loginService";

const API_BASE = "http://localhost:8000/api";

const mockFetch = (data, ok = true) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(data),
  });
};

const baseFormData = {
  description: "Flooding near the barangay hall",
  location: "Barangay Hall",
  latitude: 14.5,
  longitude: 121.0,
  additionalNotes: "Water level rising",
  incidentTypes: [],
  customTypes: [],
  attachments: [],
  customFieldValues: {},
};

beforeEach(() => {
  jest.resetAllMocks();
  isAuthenticated.mockReturnValue(true);
  getToken.mockReturnValue("test-token");
  getUser.mockReturnValue(null);
});

// ─── getIncidentTypes ─────────────────────────────────────────────────────────
describe("getIncidentTypes", () => {
  it("throws if not authenticated", async () => {
    isAuthenticated.mockReturnValue(false);
    await expect(incidentService.getIncidentTypes()).rejects.toThrow(
      "You must be logged in to fetch incident types."
    );
  });

  it("sends GET /incident-types with the Bearer token", async () => {
    mockFetch([]);
    await incidentService.getIncidentTypes();
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/incident-types`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      })
    );
  });

  it("returns the response data on success", async () => {
    const types = [{ id: 1, name: "Flooding" }, { id: 2, name: "Fire" }];
    mockFetch(types);
    await expect(incidentService.getIncidentTypes()).resolves.toEqual(types);
  });

  it("throws the server error message on failure", async () => {
    mockFetch({ message: "Unauthenticated." }, false);
    await expect(incidentService.getIncidentTypes()).rejects.toThrow(
      "Unauthenticated."
    );
  });

  it("throws a fallback message when the server provides none", async () => {
    mockFetch({}, false);
    await expect(incidentService.getIncidentTypes()).rejects.toThrow(
      "Failed to fetch incident types."
    );
  });
});

// ─── submitReport ─────────────────────────────────────────────────────────────
describe("submitReport", () => {
  it("throws if not authenticated", async () => {
    isAuthenticated.mockReturnValue(false);
    await expect(incidentService.submitReport(baseFormData)).rejects.toThrow(
      "You must be logged in to submit an incident report."
    );
  });

  it("sends POST /incidents with multipart/form-data", async () => {
    mockFetch({ id: 1 });
    await incidentService.submitReport(baseFormData);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/incidents`,
      expect.objectContaining({ method: "POST" })
    );
  });

  it("sends the Bearer token in the Authorization header", async () => {
    mockFetch({ id: 1 });
    await incidentService.submitReport(baseFormData);
    expect(fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      })
    );
  });

  it("maps form fields to the correct FormData keys", async () => {
    mockFetch({ id: 1 });
    await incidentService.submitReport(baseFormData);
    const body = fetch.mock.calls[0][1].body;
    expect(body.get("description")).toBe("Flooding near the barangay hall");
    expect(body.get("location")).toBe("Barangay Hall");
    expect(body.get("latitude")).toBe("14.5");
    expect(body.get("longitude")).toBe("121");
    expect(body.get("additional_notes")).toBe("Water level rising");
  });

  it("appends reported_by from the logged-in user's full name", async () => {
    mockFetch({ id: 1 });
    getUser.mockReturnValue({
      first_name: "Juan",
      middle_name: "Santos",
      last_name: "dela Cruz",
    });
    await incidentService.submitReport(baseFormData);
    const body = fetch.mock.calls[0][1].body;
    expect(body.get("reported_by")).toBe("Juan Santos dela Cruz");
  });

  it("omits middle name from reported_by when it is absent", async () => {
    mockFetch({ id: 1 });
    getUser.mockReturnValue({ first_name: "Juan", last_name: "dela Cruz" });
    await incidentService.submitReport(baseFormData);
    const body = fetch.mock.calls[0][1].body;
    expect(body.get("reported_by")).toBe("Juan dela Cruz");
  });

  it("omits reported_by entirely when getUser returns null", async () => {
    mockFetch({ id: 1 });
    getUser.mockReturnValue(null);
    await incidentService.submitReport(baseFormData);
    const body = fetch.mock.calls[0][1].body;
    expect(body.get("reported_by")).toBeNull();
  });

  it("appends incident type IDs as indexed types[]", async () => {
    mockFetch({ id: 1 });
    await incidentService.submitReport({ ...baseFormData, incidentTypes: [3, 7] });
    const body = fetch.mock.calls[0][1].body;
    expect(body.get("types[0]")).toBe("3");
    expect(body.get("types[1]")).toBe("7");
  });

  it("omits types[] when incidentTypes is empty", async () => {
    mockFetch({ id: 1 });
    await incidentService.submitReport({ ...baseFormData, incidentTypes: [] });
    const body = fetch.mock.calls[0][1].body;
    expect(body.get("types[0]")).toBeNull();
  });

  it("appends custom types as indexed custom_types[]", async () => {
    mockFetch({ id: 1 });
    await incidentService.submitReport({
      ...baseFormData,
      customTypes: ["LandSlide", "Earthquake"],
    });
    const body = fetch.mock.calls[0][1].body;
    expect(body.get("custom_types[0]")).toBe("LandSlide");
    expect(body.get("custom_types[1]")).toBe("Earthquake");
  });

  it("appends the first attachment as 'evidence'", async () => {
    mockFetch({ id: 1 });
    const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });
    await incidentService.submitReport({ ...baseFormData, attachments: [file] });
    const body = fetch.mock.calls[0][1].body;
    expect(body.get("evidence")).toBe(file);
  });

  it("omits evidence when attachments is empty", async () => {
    mockFetch({ id: 1 });
    await incidentService.submitReport({ ...baseFormData, attachments: [] });
    const body = fetch.mock.calls[0][1].body;
    expect(body.get("evidence")).toBeNull();
  });

  it("appends scalar custom field values as custom_fields[name]", async () => {
    mockFetch({ id: 1 });
    await incidentService.submitReport({
      ...baseFormData,
      customFieldValues: { priority: "high" },
    });
    const body = fetch.mock.calls[0][1].body;
    expect(body.get("custom_fields[priority]")).toBe("high");
  });

  it("appends array custom field values with [] suffix per value", async () => {
    mockFetch({ id: 1 });
    await incidentService.submitReport({
      ...baseFormData,
      customFieldValues: { tags: ["urgent", "flood"] },
    });
    const body = fetch.mock.calls[0][1].body;
    expect(body.getAll("custom_fields[tags][]")).toEqual(["urgent", "flood"]);
  });

  it("omits empty-string custom field values", async () => {
    mockFetch({ id: 1 });
    await incidentService.submitReport({
      ...baseFormData,
      customFieldValues: { notes: "" },
    });
    const body = fetch.mock.calls[0][1].body;
    expect(body.get("custom_fields[notes]")).toBeNull();
  });

  it("returns the server response on success", async () => {
    const created = { id: 9, status: "pending" };
    mockFetch(created);
    await expect(incidentService.submitReport(baseFormData)).resolves.toEqual(
      created
    );
  });

  it("throws the server error message on failure", async () => {
    mockFetch({ message: "Validation failed." }, false);
    await expect(incidentService.submitReport(baseFormData)).rejects.toThrow(
      "Validation failed."
    );
  });
});

// ─── getMyIncidents ───────────────────────────────────────────────────────────
describe("getMyIncidents", () => {
  it("throws if not authenticated", async () => {
    isAuthenticated.mockReturnValue(false);
    await expect(incidentService.getMyIncidents()).rejects.toThrow(
      "You must be logged in to view incidents."
    );
  });

  it("sends GET /incidents with the Bearer token", async () => {
    mockFetch([]);
    await incidentService.getMyIncidents();
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/incidents?per_page=100`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Authorization: "Bearer test-token" }),
      })
    );
  });

  it("returns the response data on success", async () => {
    const incidents = [{ id: 1 }, { id: 2 }];
    mockFetch(incidents);
    await expect(incidentService.getMyIncidents()).resolves.toEqual(incidents);
  });

  it("throws the server error message on failure", async () => {
    mockFetch({ message: "Unauthorized" }, false);
    await expect(incidentService.getMyIncidents()).rejects.toThrow("Unauthorized");
  });
});

// ─── getAllIncidents ──────────────────────────────────────────────────────────
describe("getAllIncidents", () => {
  it("throws if not authenticated", async () => {
    isAuthenticated.mockReturnValue(false);
    await expect(incidentService.getAllIncidents()).rejects.toThrow(
      "You must be logged in to view incidents."
    );
  });

  it("sends GET /incidents with the Bearer token", async () => {
    mockFetch([]);
    await incidentService.getAllIncidents();
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/incidents?per_page=100`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Authorization: "Bearer test-token" }),
      })
    );
  });

  it("returns the response data on success", async () => {
    const incidents = [{ id: 3, status: "resolved" }];
    mockFetch(incidents);
    await expect(incidentService.getAllIncidents()).resolves.toEqual(incidents);
  });

  it("throws the server error message on failure", async () => {
    mockFetch({ message: "Failed to fetch all incidents." }, false);
    await expect(incidentService.getAllIncidents()).rejects.toThrow(
      "Failed to fetch all incidents."
    );
  });
});

// ─── updateIncident ───────────────────────────────────────────────────────────
describe("updateIncident", () => {
  it("throws if not authenticated", async () => {
    isAuthenticated.mockReturnValue(false);
    await expect(
      incidentService.updateIncident(1, { status: "resolved" })
    ).rejects.toThrow("You must be logged in to update an incident.");
  });

  it("sends PUT /incidents/:id with JSON body", async () => {
    mockFetch({ id: 1, status: "resolved" });
    await incidentService.updateIncident(1, { status: "resolved" });
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/incidents/1`,
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
        body: JSON.stringify({ status: "resolved" }),
      })
    );
  });

  it("sends the Bearer token in the Authorization header", async () => {
    mockFetch({ id: 1 });
    await incidentService.updateIncident(1, {});
    expect(fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer test-token" }),
      })
    );
  });

  it("returns the updated incident on success", async () => {
    const updated = { id: 1, status: "resolved" };
    mockFetch(updated);
    await expect(
      incidentService.updateIncident(1, { status: "resolved" })
    ).resolves.toEqual(updated);
  });

  it("throws the server error message on failure", async () => {
    mockFetch({ message: "Incident not found." }, false);
    await expect(incidentService.updateIncident(99, {})).rejects.toThrow(
      "Incident not found."
    );
  });
});

// ─── getIncidentUpdates ───────────────────────────────────────────────────────
describe("getIncidentUpdates", () => {
  it("throws if not authenticated", async () => {
    isAuthenticated.mockReturnValue(false);
    await expect(incidentService.getIncidentUpdates(1)).rejects.toThrow(
      "You must be logged in to view updates."
    );
  });

  it("sends GET /incidents/:id/updates with the Bearer token", async () => {
    mockFetch([]);
    await incidentService.getIncidentUpdates(5);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/incidents/5/updates`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Authorization: "Bearer test-token" }),
      })
    );
  });

  it("returns the updates on success", async () => {
    const updates = [{ id: 1, message: "Under review" }];
    mockFetch(updates);
    await expect(incidentService.getIncidentUpdates(5)).resolves.toEqual(updates);
  });

  it("throws the server error message on failure", async () => {
    mockFetch({ message: "Incident not found." }, false);
    await expect(incidentService.getIncidentUpdates(99)).rejects.toThrow(
      "Incident not found."
    );
  });
});

// ─── addIncidentUpdate ────────────────────────────────────────────────────────
describe("addIncidentUpdate", () => {
  it("throws if not authenticated", async () => {
    isAuthenticated.mockReturnValue(false);
    await expect(
      incidentService.addIncidentUpdate(1, { message: "test" })
    ).rejects.toThrow("You must be logged in to add an update.");
  });

  it("sends POST /incidents/:id/updates", async () => {
    mockFetch({ id: 1 });
    await incidentService.addIncidentUpdate(5, { message: "Flooding resolved" });
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/incidents/5/updates`,
      expect.objectContaining({ method: "POST" })
    );
  });

  it("sends the Bearer token in the Authorization header", async () => {
    mockFetch({ id: 1 });
    await incidentService.addIncidentUpdate(5, { message: "test" });
    expect(fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer test-token" }),
      })
    );
  });

  it("appends message to the FormData body", async () => {
    mockFetch({ id: 1 });
    await incidentService.addIncidentUpdate(5, { message: "Flooding resolved" });
    const body = fetch.mock.calls[0][1].body;
    expect(body.get("message")).toBe("Flooding resolved");
  });

  it("appends attachment to the FormData body when provided", async () => {
    mockFetch({ id: 1 });
    const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });
    await incidentService.addIncidentUpdate(5, {
      message: "See photo",
      attachment: file,
    });
    const body = fetch.mock.calls[0][1].body;
    expect(body.get("attachment")).toBe(file);
  });

  it("omits attachment from FormData when not provided", async () => {
    mockFetch({ id: 1 });
    await incidentService.addIncidentUpdate(5, { message: "No file" });
    const body = fetch.mock.calls[0][1].body;
    expect(body.get("attachment")).toBeNull();
  });

  it("returns the server response on success", async () => {
    const created = { id: 10, message: "Flooding resolved" };
    mockFetch(created);
    await expect(
      incidentService.addIncidentUpdate(5, { message: "Flooding resolved" })
    ).resolves.toEqual(created);
  });

  it("throws the server error message on failure", async () => {
    mockFetch({ message: "Update failed." }, false);
    await expect(
      incidentService.addIncidentUpdate(5, { message: "test" })
    ).rejects.toThrow("Update failed.");
  });
});
