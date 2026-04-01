import {
  fetchNotifications,
  markNotificationsRead,
  createNotification,
  createNotifications,
  notifyAppointmentReschedule,
} from "../../services/sub-system-3/notificationService";

// ── Feature-flag mocks (import.meta.env is not available in Jest) ──────────────
// Default: both flags OFF. Individual tests override via jest.resetModules().
jest.mock("../../config/runtimeApi", () => ({
  INCIDENT_API_BASE_URL: "http://localhost:8000/api",
}));

// Stub import.meta.env before the module loads
const setEnvFlags = ({ createEnabled = false, externalIdsEnabled = false } = {}) => {
  global.importMeta = { env: {} }; // not actually used — flags are inlined at module load
  // The service reads the flags at module evaluation time, so we control them
  // by re-importing the module after calling jest.resetModules().
  // For the default test suite the flags are both "false" (falsy env var).
};

const API_BASE = "http://localhost:8000/api";
const NOTIF_ENDPOINT = `${API_BASE}/notifications`;

const mockFetch = (data, ok = true) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(data),
  });
};

beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
});

// ─── fetchNotifications ───────────────────────────────────────────────────────
describe("fetchNotifications", () => {
  it("returns null when no auth token is stored", async () => {
    await expect(fetchNotifications()).resolves.toBeNull();
  });

  it("sends GET /notifications with the Bearer token", async () => {
    localStorage.setItem("authToken", "tok");
    mockFetch({ data: [] });
    await fetchNotifications();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(`${NOTIF_ENDPOINT}?`),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer tok" }),
      })
    );
  });

  it("defaults to per_page=50 in the query string", async () => {
    localStorage.setItem("authToken", "tok");
    mockFetch({ data: [] });
    await fetchNotifications();
    const url = fetch.mock.calls[0][0];
    expect(url).toContain("per_page=50");
  });

  it("respects a custom perPage value", async () => {
    localStorage.setItem("authToken", "tok");
    mockFetch({ data: [] });
    await fetchNotifications({ perPage: 10 });
    expect(fetch.mock.calls[0][0]).toContain("per_page=10");
  });

  it("appends scope to the query string when provided", async () => {
    localStorage.setItem("authToken", "tok");
    mockFetch({ data: [] });
    await fetchNotifications({ scope: "admin" });
    expect(fetch.mock.calls[0][0]).toContain("scope=admin");
  });

  it("appends user_id to the query string when provided", async () => {
    localStorage.setItem("authToken", "tok");
    mockFetch({ data: [] });
    await fetchNotifications({ userId: 7 });
    expect(fetch.mock.calls[0][0]).toContain("user_id=7");
  });

  it("infers scope from the stored authUser role", async () => {
    localStorage.setItem("authToken", "tok");
    localStorage.setItem("authUser", JSON.stringify({ id: 1, role: "admin" }));
    mockFetch({ data: [] });
    await fetchNotifications();
    expect(fetch.mock.calls[0][0]).toContain("scope=admin");
  });

  it("returns the parsed response on success", async () => {
    localStorage.setItem("authToken", "tok");
    const payload = { data: [{ id: 1 }], total: 1 };
    mockFetch(payload);
    await expect(fetchNotifications()).resolves.toEqual(payload);
  });

  it("returns null when the server responds with a non-ok status", async () => {
    localStorage.setItem("authToken", "tok");
    mockFetch({ message: "Unauthorized" }, false);
    await expect(fetchNotifications()).resolves.toBeNull();
  });

  it("returns null when fetch throws a network error", async () => {
    localStorage.setItem("authToken", "tok");
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));
    await expect(fetchNotifications()).resolves.toBeNull();
  });
});

// ─── markNotificationsRead ────────────────────────────────────────────────────
describe("markNotificationsRead", () => {
  it("returns null when no auth token is stored", async () => {
    await expect(markNotificationsRead({ ids: [1] })).resolves.toBeNull();
  });

  it("returns null when called with no ids and markAll is false", async () => {
    localStorage.setItem("authToken", "tok");
    await expect(markNotificationsRead({})).resolves.toBeNull();
  });

  it("sends PATCH /notifications with ids and read:true by default", async () => {
    localStorage.setItem("authToken", "tok");
    mockFetch({ updated: 1 });
    await markNotificationsRead({ ids: [1, 2] });
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.ids).toEqual([1, 2]);
    expect(body.read).toBe(true);
  });

  it("sends read:false when explicitly set", async () => {
    localStorage.setItem("authToken", "tok");
    mockFetch({ updated: 1 });
    await markNotificationsRead({ ids: [3], read: false });
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.read).toBe(false);
  });

  it("sends mark_all:true when markAll is set", async () => {
    localStorage.setItem("authToken", "tok");
    mockFetch({ updated: 10 });
    await markNotificationsRead({ markAll: true });
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.mark_all).toBe(true);
  });

  it("sends the Bearer token in the Authorization header", async () => {
    localStorage.setItem("authToken", "my-tok");
    mockFetch({ updated: 1 });
    await markNotificationsRead({ ids: [1] });
    expect(fetch).toHaveBeenCalledWith(
      NOTIF_ENDPOINT,
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({ Authorization: "Bearer my-tok" }),
      })
    );
  });

  it("includes scope in the body when resolved from authUser", async () => {
    localStorage.setItem("authToken", "tok");
    localStorage.setItem("authUser", JSON.stringify({ id: 5, role: "admin" }));
    mockFetch({ updated: 1 });
    await markNotificationsRead({ ids: [1] });
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.scope).toBe("admin");
  });

  it("includes user_id in the body when provided", async () => {
    localStorage.setItem("authToken", "tok");
    mockFetch({ updated: 1 });
    await markNotificationsRead({ ids: [1], userId: 99 });
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.user_id).toBe(99);
  });

  it("returns the server response on success", async () => {
    localStorage.setItem("authToken", "tok");
    const payload = { updated: 3 };
    mockFetch(payload);
    await expect(markNotificationsRead({ markAll: true })).resolves.toEqual(payload);
  });

  it("returns null when the server responds with a non-ok status", async () => {
    localStorage.setItem("authToken", "tok");
    mockFetch({}, false);
    await expect(markNotificationsRead({ ids: [1] })).resolves.toBeNull();
  });

  it("returns null when fetch throws a network error", async () => {
    localStorage.setItem("authToken", "tok");
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));
    await expect(markNotificationsRead({ ids: [1] })).resolves.toBeNull();
  });
});

// ─── createNotification ───────────────────────────────────────────────────────
// VITE_NOTIFICATION_CREATE_ENABLED is falsy in the test environment,
// so createNotification always returns null — we test the guard behavior.
describe("createNotification (feature flag OFF)", () => {
  it("returns null when notification is null", async () => {
    localStorage.setItem("authToken", "tok");
    await expect(createNotification(null)).resolves.toBeNull();
  });

  it("returns null when the feature flag is disabled (default in tests)", async () => {
    localStorage.setItem("authToken", "tok");
    await expect(
      createNotification({ type: "test", message: "hello" })
    ).resolves.toBeNull();
  });

  it("returns null when no auth token is stored even with a valid notification", async () => {
    await expect(
      createNotification({ type: "test", message: "hello" })
    ).resolves.toBeNull();
  });
});

// ─── createNotifications ──────────────────────────────────────────────────────
describe("createNotifications", () => {
  it("returns an empty array when called with an empty array", async () => {
    await expect(createNotifications([])).resolves.toEqual([]);
  });

  it("returns an empty array when called with a non-array", async () => {
    await expect(createNotifications(null)).resolves.toEqual([]);
  });

  it("returns an empty array when all individual creates return null (flag OFF)", async () => {
    localStorage.setItem("authToken", "tok");
    const notifications = [{ type: "a" }, { type: "b" }];
    await expect(createNotifications(notifications)).resolves.toEqual([]);
  });
});

// ─── notifyAppointmentReschedule ──────────────────────────────────────────────
describe("notifyAppointmentReschedule", () => {
  it("returns null when no auth token is stored", async () => {
    await expect(notifyAppointmentReschedule(1)).resolves.toBeNull();
  });

  it("sends POST /appointments/:id/notify-reschedule with the Bearer token", async () => {
    localStorage.setItem("authToken", "tok");
    mockFetch({ notified: true });
    await notifyAppointmentReschedule(42);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/appointments/42/notify-reschedule`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer tok" }),
      })
    );
  });

  it("includes appointment_id in the request body", async () => {
    localStorage.setItem("authToken", "tok");
    mockFetch({ notified: true });
    await notifyAppointmentReschedule(42);
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.appointment_id).toBe(42);
  });

  it("includes scope and user_id in the request body from authUser", async () => {
    localStorage.setItem("authToken", "tok");
    localStorage.setItem("authUser", JSON.stringify({ id: 5, role: "user" }));
    mockFetch({ notified: true });
    await notifyAppointmentReschedule(42);
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.scope).toBe("user");
    expect(body.user_id).toBe(5);
  });

  it("returns the server response on success", async () => {
    localStorage.setItem("authToken", "tok");
    const payload = { notified: true };
    mockFetch(payload);
    await expect(notifyAppointmentReschedule(1)).resolves.toEqual(payload);
  });

  it("returns null when the server responds with a non-ok status", async () => {
    localStorage.setItem("authToken", "tok");
    mockFetch({}, false);
    await expect(notifyAppointmentReschedule(1)).resolves.toBeNull();
  });

  it("returns null when fetch throws a network error", async () => {
    localStorage.setItem("authToken", "tok");
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));
    await expect(notifyAppointmentReschedule(1)).resolves.toBeNull();
  });
});
