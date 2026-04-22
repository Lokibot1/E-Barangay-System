import {
  fileComplaint,
  getMyComplaints,
  updateComplaint,
  getAllComplaints,
  getComplaintUpdates,
  addComplaintUpdate,
} from "../../services/sub-system-3/complaintService";

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
    buildAuthHeaders: ({ includeJson = false } = {}) => {
      const tok = getToken();
      const h = tok ? { Authorization: `Bearer ${tok}` } : {};
      if (includeJson) h["Content-Type"] = "application/json";
      return h;
    },
    handleUnauthorizedResponse: () => {},
  };
});

import { isAuthenticated, getToken } from "../../homepage/services/loginService";

const API_BASE = "http://localhost:8000/api";

const mockFetch = (data, ok = true) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(data),
  });
};

const baseFormData = {
  complaintDate: "2025-01-15",
  complaintTime: "09:00",
  location: "Barangay Hall",
  complaintType: "noise",
  severity: "low",
  description: "Loud music late at night",
  complainantName: "Juan dela Cruz",
  complainantContact: "09171234567",
  respondentName: "Pedro Reyes",
  respondentAddress: "123 Main St",
  desiredResolution: "Cease the noise",
  additionalNotes: "",
  witnesses: [],
  attachments: [],
  customFieldValues: {},
};

beforeEach(() => {
  jest.resetAllMocks();
  isAuthenticated.mockReturnValue(true);
  getToken.mockReturnValue("test-token");
});

// ─── fileComplaint ────────────────────────────────────────────────────────────
describe("fileComplaint", () => {
  it("throws if not authenticated", async () => {
    isAuthenticated.mockReturnValue(false);
    await expect(fileComplaint(baseFormData)).rejects.toThrow(
      "You must be logged in to file a complaint."
    );
  });

  it("sends POST /complaints with multipart/form-data", async () => {
    mockFetch({ id: 1 });
    await fileComplaint(baseFormData);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/complaints`,
      expect.objectContaining({ method: "POST" })
    );
  });

  it("sends the Bearer token in the Authorization header", async () => {
    mockFetch({ id: 1 });
    await fileComplaint(baseFormData);
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
    await fileComplaint(baseFormData);
    const sentBody = fetch.mock.calls[0][1].body;
    expect(sentBody.get("incident_date")).toBe("2025-01-15");
    expect(sentBody.get("incident_time")).toBe("09:00");
    expect(sentBody.get("location")).toBe("Barangay Hall");
    expect(sentBody.get("type")).toBe("noise");
    expect(sentBody.get("severity")).toBe("low");
    expect(sentBody.get("description")).toBe("Loud music late at night");
    expect(sentBody.get("complainant_name")).toBe("Juan dela Cruz");
    expect(sentBody.get("complainant_contact")).toBe("09171234567");
    expect(sentBody.get("respondent_name")).toBe("Pedro Reyes");
    expect(sentBody.get("respondent_address")).toBe("123 Main St");
    expect(sentBody.get("desired_resolution")).toBe("Cease the noise");
  });

  it("appends latitude and longitude when provided", async () => {
    mockFetch({ id: 1 });
    await fileComplaint({ ...baseFormData, latitude: 14.5, longitude: 121.0 });
    const sentBody = fetch.mock.calls[0][1].body;
    expect(sentBody.get("latitude")).toBe("14.5");
    expect(sentBody.get("longitude")).toBe("121");
  });

  it("omits latitude and longitude when not provided", async () => {
    mockFetch({ id: 1 });
    await fileComplaint(baseFormData);
    const sentBody = fetch.mock.calls[0][1].body;
    expect(sentBody.get("latitude")).toBeNull();
    expect(sentBody.get("longitude")).toBeNull();
  });

  it("joins non-empty witness names into a comma-separated string", async () => {
    mockFetch({ id: 1 });
    await fileComplaint({
      ...baseFormData,
      witnesses: ["Alice", "Bob", ""],
    });
    const sentBody = fetch.mock.calls[0][1].body;
    expect(sentBody.get("witness")).toBe("Alice, Bob");
  });

  it("omits the witness field when all witness entries are blank", async () => {
    mockFetch({ id: 1 });
    await fileComplaint({ ...baseFormData, witnesses: ["", " "] });
    const sentBody = fetch.mock.calls[0][1].body;
    expect(sentBody.get("witness")).toBeNull();
  });

  it("omits the witness field when witnesses array is empty", async () => {
    mockFetch({ id: 1 });
    await fileComplaint({ ...baseFormData, witnesses: [] });
    const sentBody = fetch.mock.calls[0][1].body;
    expect(sentBody.get("witness")).toBeNull();
  });

  it("appends the first attachment as 'evidence'", async () => {
    mockFetch({ id: 1 });
    const file = new File(["content"], "photo.jpg", { type: "image/jpeg" });
    await fileComplaint({ ...baseFormData, attachments: [file] });
    const sentBody = fetch.mock.calls[0][1].body;
    expect(sentBody.get("evidence")).toBe(file);
  });

  it("omits evidence when attachments array is empty", async () => {
    mockFetch({ id: 1 });
    await fileComplaint({ ...baseFormData, attachments: [] });
    const sentBody = fetch.mock.calls[0][1].body;
    expect(sentBody.get("evidence")).toBeNull();
  });

  it("appends scalar custom field values as custom_fields[name]", async () => {
    mockFetch({ id: 1 });
    await fileComplaint({
      ...baseFormData,
      customFieldValues: { incident_type: "domestic" },
    });
    const sentBody = fetch.mock.calls[0][1].body;
    expect(sentBody.get("custom_fields[incident_type]")).toBe("domestic");
  });

  it("appends array custom field values with [] suffix per value", async () => {
    mockFetch({ id: 1 });
    await fileComplaint({
      ...baseFormData,
      customFieldValues: { tags: ["urgent", "noise"] },
    });
    const sentBody = fetch.mock.calls[0][1].body;
    expect(sentBody.getAll("custom_fields[tags][]")).toEqual(["urgent", "noise"]);
  });

  it("omits empty-string custom field values", async () => {
    mockFetch({ id: 1 });
    await fileComplaint({
      ...baseFormData,
      customFieldValues: { notes: "" },
    });
    const sentBody = fetch.mock.calls[0][1].body;
    expect(sentBody.get("custom_fields[notes]")).toBeNull();
  });

  it("returns the server response on success", async () => {
    const created = { id: 7, status: "pending" };
    mockFetch(created);
    await expect(fileComplaint(baseFormData)).resolves.toEqual(created);
  });

  it("throws the server error message on failure", async () => {
    mockFetch({ message: "Validation failed" }, false);
    await expect(fileComplaint(baseFormData)).rejects.toThrow("Validation failed");
  });
});

// ─── getMyComplaints ──────────────────────────────────────────────────────────
describe("getMyComplaints", () => {
  it("throws if not authenticated", async () => {
    isAuthenticated.mockReturnValue(false);
    await expect(getMyComplaints()).rejects.toThrow(
      "You must be logged in to view complaints."
    );
  });

  it("sends GET /complaints with the Bearer token", async () => {
    mockFetch([]);
    await getMyComplaints();
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/complaints?per_page=100`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Authorization: "Bearer test-token" }),
      })
    );
  });

  it("returns the response data on success", async () => {
    const complaints = [{ id: 1 }, { id: 2 }];
    mockFetch(complaints);
    await expect(getMyComplaints()).resolves.toEqual(complaints);
  });

  it("throws the server error message on failure", async () => {
    mockFetch({ message: "Unauthorized" }, false);
    await expect(getMyComplaints()).rejects.toThrow("Unauthorized");
  });
});

// ─── getAllComplaints ─────────────────────────────────────────────────────────
describe("getAllComplaints", () => {
  it("throws if not authenticated", async () => {
    isAuthenticated.mockReturnValue(false);
    await expect(getAllComplaints()).rejects.toThrow(
      "You must be logged in to view complaints."
    );
  });

  it("sends GET /complaints with the Bearer token", async () => {
    mockFetch([]);
    await getAllComplaints();
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/complaints?per_page=100`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Authorization: "Bearer test-token" }),
      })
    );
  });

  it("returns the response data on success", async () => {
    const complaints = [{ id: 3, status: "resolved" }];
    mockFetch(complaints);
    await expect(getAllComplaints()).resolves.toEqual(complaints);
  });

  it("throws the server error message on failure", async () => {
    mockFetch({ message: "Failed to fetch all complaints." }, false);
    await expect(getAllComplaints()).rejects.toThrow("Failed to fetch all complaints.");
  });
});

// ─── updateComplaint ──────────────────────────────────────────────────────────
describe("updateComplaint", () => {
  it("throws if not authenticated", async () => {
    isAuthenticated.mockReturnValue(false);
    await expect(updateComplaint(1, { status: "resolved" })).rejects.toThrow(
      "You must be logged in to update a complaint."
    );
  });

  it("sends PUT /complaints/:id?status=resolved", async () => {
    mockFetch({ id: 1, status: "resolved" });
    await updateComplaint(1, { status: "resolved" });
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/complaints/1?status=resolved`,
      expect.objectContaining({ method: "PUT" })
    );
  });

  it("sends PUT /complaints/:id with no query string when updates is empty", async () => {
    mockFetch({ id: 1 });
    await updateComplaint(1, {});
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/complaints/1`,
      expect.objectContaining({ method: "PUT" })
    );
  });

  it("includes the Bearer token in the Authorization header", async () => {
    mockFetch({ id: 1 });
    await updateComplaint(1, { status: "closed" });
    expect(fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer test-token" }),
      })
    );
  });

  it("returns the updated complaint on success", async () => {
    const updated = { id: 1, status: "resolved" };
    mockFetch(updated);
    await expect(updateComplaint(1, { status: "resolved" })).resolves.toEqual(updated);
  });

  it("throws the server error message on failure", async () => {
    mockFetch({ message: "Complaint not found" }, false);
    await expect(updateComplaint(99, {})).rejects.toThrow("Complaint not found");
  });
});

// ─── getComplaintUpdates ──────────────────────────────────────────────────────
describe("getComplaintUpdates", () => {
  it("throws if not authenticated", async () => {
    isAuthenticated.mockReturnValue(false);
    await expect(getComplaintUpdates(1)).rejects.toThrow(
      "You must be logged in to view updates."
    );
  });

  it("sends GET /complaints/:id/updates with the Bearer token", async () => {
    mockFetch([]);
    await getComplaintUpdates(5);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/complaints/5/updates`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Authorization: "Bearer test-token" }),
      })
    );
  });

  it("returns the updates array on success", async () => {
    const updates = [{ id: 1, message: "Under review" }];
    mockFetch(updates);
    await expect(getComplaintUpdates(5)).resolves.toEqual(updates);
  });

  it("throws the server error message on failure", async () => {
    mockFetch({ message: "Complaint not found" }, false);
    await expect(getComplaintUpdates(99)).rejects.toThrow("Complaint not found");
  });
});

// ─── addComplaintUpdate ───────────────────────────────────────────────────────
describe("addComplaintUpdate", () => {
  it("throws if not authenticated", async () => {
    isAuthenticated.mockReturnValue(false);
    await expect(addComplaintUpdate(1, { message: "test" })).rejects.toThrow(
      "You must be logged in to add an update."
    );
  });

  it("sends POST /complaints/:id/updates", async () => {
    mockFetch({ id: 1 });
    await addComplaintUpdate(5, { message: "Resolved" });
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/complaints/5/updates`,
      expect.objectContaining({ method: "POST" })
    );
  });

  it("includes the Bearer token in the Authorization header", async () => {
    mockFetch({ id: 1 });
    await addComplaintUpdate(5, { message: "Resolved" });
    expect(fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer test-token" }),
      })
    );
  });

  it("appends message to the FormData body", async () => {
    mockFetch({ id: 1 });
    await addComplaintUpdate(5, { message: "Case escalated" });
    const sentBody = fetch.mock.calls[0][1].body;
    expect(sentBody.get("message")).toBe("Case escalated");
  });

  it("appends attachment to the FormData body when provided", async () => {
    mockFetch({ id: 1 });
    const file = new File(["data"], "evidence.pdf", { type: "application/pdf" });
    await addComplaintUpdate(5, { message: "See attached", attachment: file });
    const sentBody = fetch.mock.calls[0][1].body;
    expect(sentBody.get("attachment")).toBe(file);
  });

  it("omits attachment from FormData when not provided", async () => {
    mockFetch({ id: 1 });
    await addComplaintUpdate(5, { message: "No file" });
    const sentBody = fetch.mock.calls[0][1].body;
    expect(sentBody.get("attachment")).toBeNull();
  });

  it("returns the server response on success", async () => {
    const created = { id: 10, message: "Resolved" };
    mockFetch(created);
    await expect(addComplaintUpdate(5, { message: "Resolved" })).resolves.toEqual(created);
  });

  it("throws the server error message on failure", async () => {
    mockFetch({ message: "Update failed" }, false);
    await expect(addComplaintUpdate(5, { message: "test" })).rejects.toThrow("Update failed");
  });
});
