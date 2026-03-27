import {
  getTimeSlots,
  isSlotAvailable,
  getComplaintAppointments,
  getComplaintAppointment,
  createAppointment,
  updateAppointment,
  rescheduleAppointment,
  completeAppointment,
  cancelAppointment,
  markNoShow,
  getAvailability,
  BUSINESS_DAYS,
  BUSINESS_START_HOUR,
  BUSINESS_END_HOUR,
  APPOINTMENT_STATUSES,
} from "../../services/sub-system-3/appointmentService";

jest.mock("../../homepage/services/loginService", () => ({
  isAuthenticated: jest.fn(),
  getToken: jest.fn(),
}));

import {
  isAuthenticated,
  getToken,
} from "../../homepage/services/loginService";

const API_BASE = "http://localhost:8000/api";

const mockFetch = (data, ok = true) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(data),
  });
};

beforeEach(() => {
  jest.resetAllMocks();
  isAuthenticated.mockReturnValue(true);
  getToken.mockReturnValue("test-token");
});

// ─── Exported constants ───────────────────────────────────────────────────────
describe("constants", () => {
  it("BUSINESS_DAYS contains Mon–Fri (1–5)", () => {
    expect(BUSINESS_DAYS).toEqual([1, 2, 3, 4, 5]);
  });

  it("BUSINESS_START_HOUR is 7 (7 AM)", () => {
    expect(BUSINESS_START_HOUR).toBe(7);
  });

  it("BUSINESS_END_HOUR is 17 (5 PM)", () => {
    expect(BUSINESS_END_HOUR).toBe(17);
  });

  it("APPOINTMENT_STATUSES contains all five valid statuses", () => {
    expect(APPOINTMENT_STATUSES).toEqual(
      expect.arrayContaining([
        "scheduled",
        "rescheduled",
        "completed",
        "cancelled",
        "no-show",
      ]),
    );
    expect(APPOINTMENT_STATUSES).toHaveLength(5);
  });
});

// ─── getTimeSlots ─────────────────────────────────────────────────────────────
describe("getTimeSlots", () => {
  it("returns exactly 10 slots (07:00 through 16:00)", () => {
    expect(getTimeSlots()).toHaveLength(10);
  });

  it("first slot is 07:00 AM", () => {
    expect(getTimeSlots()[0]).toEqual({ value: "07:00", label: "7:00 AM" });
  });

  it("last slot is 16:00 (4:00 PM)", () => {
    const slots = getTimeSlots();
    expect(slots[slots.length - 1]).toEqual({
      value: "16:00",
      label: "4:00 PM",
    });
  });

  it("includes the 12:00 PM slot", () => {
    const noon = getTimeSlots().find((s) => s.value === "12:00");
    expect(noon).toEqual({ value: "12:00", label: "12:00 PM" });
  });

  it("all value strings are zero-padded HH:00", () => {
    getTimeSlots().forEach((slot) => {
      expect(slot.value).toMatch(/^\d{2}:00$/);
    });
  });
});

// ─── isSlotAvailable ──────────────────────────────────────────────────────────
describe("isSlotAvailable", () => {
  it("returns false when date is null", () => {
    expect(isSlotAvailable(null, "09:00", [])).toBe(false);
  });

  it("returns false when time is null", () => {
    expect(isSlotAvailable("2025-01-15", null, [])).toBe(false);
  });

  it("returns true when the appointments list is empty", () => {
    expect(isSlotAvailable("2025-01-15", "09:00", [])).toBe(true);
  });

  it("returns false when a 'scheduled' appointment occupies the slot", () => {
    const appts = [
      { id: 1, status: "scheduled", date: "2025-01-15", time: "09:00" },
    ];
    expect(isSlotAvailable("2025-01-15", "09:00", appts)).toBe(false);
  });

  it("returns false when a 'rescheduled' appointment occupies the slot", () => {
    const appts = [
      { id: 1, status: "rescheduled", date: "2025-01-15", time: "09:00" },
    ];
    expect(isSlotAvailable("2025-01-15", "09:00", appts)).toBe(false);
  });

  it("returns true when the occupying appointment is 'completed'", () => {
    const appts = [
      { id: 1, status: "completed", date: "2025-01-15", time: "09:00" },
    ];
    expect(isSlotAvailable("2025-01-15", "09:00", appts)).toBe(true);
  });

  it("returns true when the occupying appointment is 'cancelled'", () => {
    const appts = [
      { id: 1, status: "cancelled", date: "2025-01-15", time: "09:00" },
    ];
    expect(isSlotAvailable("2025-01-15", "09:00", appts)).toBe(true);
  });

  it("returns true when the occupying appointment is 'no-show'", () => {
    const appts = [
      { id: 1, status: "no-show", date: "2025-01-15", time: "09:00" },
    ];
    expect(isSlotAvailable("2025-01-15", "09:00", appts)).toBe(true);
  });

  it("returns true when excludeId matches the conflicting appointment", () => {
    const appts = [
      { id: 42, status: "scheduled", date: "2025-01-15", time: "09:00" },
    ];
    expect(isSlotAvailable("2025-01-15", "09:00", appts, 42)).toBe(true);
  });

  it("still blocks when excludeId does NOT match the conflicting appointment", () => {
    const appts = [
      { id: 42, status: "scheduled", date: "2025-01-15", time: "09:00" },
    ];
    expect(isSlotAvailable("2025-01-15", "09:00", appts, 99)).toBe(false);
  });

  it("parses date and time from an ISO scheduled_at string", () => {
    const appts = [
      { id: 1, status: "scheduled", scheduled_at: "2025-01-15T09:00:00" },
    ];
    expect(isSlotAvailable("2025-01-15", "09:00", appts)).toBe(false);
  });

  it("parses date and time from a space-separated scheduled_at string", () => {
    const appts = [
      { id: 1, status: "scheduled", scheduled_at: "2025-01-15 09:00:00" },
    ];
    expect(isSlotAvailable("2025-01-15", "09:00", appts)).toBe(false);
  });

  it("returns true when dates differ (same time, different date)", () => {
    const appts = [
      { id: 1, status: "scheduled", date: "2025-01-16", time: "09:00" },
    ];
    expect(isSlotAvailable("2025-01-15", "09:00", appts)).toBe(true);
  });

  it("returns true when times differ (same date, different time)", () => {
    const appts = [
      { id: 1, status: "scheduled", date: "2025-01-15", time: "10:00" },
    ];
    expect(isSlotAvailable("2025-01-15", "09:00", appts)).toBe(true);
  });
});

// ─── getComplaintAppointments ─────────────────────────────────────────────────
describe("getComplaintAppointments", () => {
  it("throws if not authenticated", async () => {
    isAuthenticated.mockReturnValue(false);
    await expect(getComplaintAppointments(1)).rejects.toThrow(
      "Not authenticated.",
    );
  });

  it("sends GET /complaints/:id/appointments with the Bearer token", async () => {
    mockFetch([]);
    await getComplaintAppointments(5);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/complaints/5/appointments`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      }),
    );
  });

  it("returns the array directly when the response is already an array", async () => {
    const data = [{ id: 1 }, { id: 2 }];
    mockFetch(data);
    await expect(getComplaintAppointments(1)).resolves.toEqual(data);
  });

  it("returns data.data when the response is a paginated object", async () => {
    mockFetch({ data: [{ id: 1 }], total: 1 });
    await expect(getComplaintAppointments(1)).resolves.toEqual([{ id: 1 }]);
  });

  it("returns an empty array when neither form is present", async () => {
    mockFetch({});
    await expect(getComplaintAppointments(1)).resolves.toEqual([]);
  });

  it("throws the server error message on failure", async () => {
    mockFetch({ message: "Not found" }, false);
    await expect(getComplaintAppointments(1)).rejects.toThrow("Not found");
  });
});

// ─── getComplaintAppointment ──────────────────────────────────────────────────
describe("getComplaintAppointment", () => {
  it("throws if not authenticated", async () => {
    isAuthenticated.mockReturnValue(false);
    await expect(getComplaintAppointment(1, 1)).rejects.toThrow(
      "Not authenticated.",
    );
  });

  it("sends GET /complaints/:cid/appointments/:aid", async () => {
    mockFetch({ data: { id: 10 } });
    await getComplaintAppointment(5, 10);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/complaints/5/appointments/10`,
      expect.anything(),
    );
  });

  it("unwraps data.data when present", async () => {
    mockFetch({ data: { id: 10, title: "Hearing" } });
    await expect(getComplaintAppointment(5, 10)).resolves.toEqual({
      id: 10,
      title: "Hearing",
    });
  });

  it("returns the raw response when data.data is absent", async () => {
    mockFetch({ id: 10, title: "Hearing" });
    await expect(getComplaintAppointment(5, 10)).resolves.toEqual({
      id: 10,
      title: "Hearing",
    });
  });

  it("throws the server error message on failure", async () => {
    mockFetch({ message: "Appointment not found" }, false);
    await expect(getComplaintAppointment(1, 99)).rejects.toThrow(
      "Appointment not found",
    );
  });
});

// ─── createAppointment ────────────────────────────────────────────────────────
describe("createAppointment", () => {
  it("throws if not authenticated", async () => {
    isAuthenticated.mockReturnValue(false);
    await expect(createAppointment(1, {})).rejects.toThrow(
      "Not authenticated.",
    );
  });

  it("sends POST /complaints/:id/appointments with JSON body", async () => {
    const apptData = {
      title: "Mediation Hearing",
      scheduled_at: "2025-01-15T09:00:00",
    };
    mockFetch({ id: 1, ...apptData });
    await createAppointment(3, apptData);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/complaints/3/appointments`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(apptData),
      }),
    );
  });

  it("returns the created appointment on success", async () => {
    const created = { id: 1, title: "Hearing" };
    mockFetch(created);
    await expect(createAppointment(1, { title: "Hearing" })).resolves.toEqual(
      created,
    );
  });

  it("throws the server error message on failure", async () => {
    mockFetch({ message: "Slot already taken" }, false);
    await expect(createAppointment(1, {})).rejects.toThrow(
      "Slot already taken",
    );
  });
});

// ─── updateAppointment ────────────────────────────────────────────────────────
describe("updateAppointment", () => {
  it("throws if not authenticated", async () => {
    isAuthenticated.mockReturnValue(false);
    await expect(updateAppointment(1, 1, {})).rejects.toThrow(
      "Not authenticated.",
    );
  });

  it("sends PATCH /complaints/:cid/appointments/:aid with JSON body", async () => {
    mockFetch({ id: 10, status: "completed" });
    await updateAppointment(5, 10, { status: "completed" });
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/complaints/5/appointments/10`,
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ status: "completed" }),
      }),
    );
  });

  it("throws the server error message on failure", async () => {
    mockFetch({ message: "Appointment not found" }, false);
    await expect(updateAppointment(1, 99, {})).rejects.toThrow(
      "Appointment not found",
    );
  });
});

// ─── rescheduleAppointment ────────────────────────────────────────────────────
describe("rescheduleAppointment", () => {
  it("creates a new appointment and then marks the original as rescheduled", async () => {
    const newAppt = { id: 2, status: "scheduled" };
    global.fetch = jest
      .fn()
      // First call: createAppointment POST
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(newAppt) })
      // Second call: updateAppointment PATCH on original
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 1, status: "rescheduled" }),
      });

    const original = {
      id: 1,
      title: "First Hearing",
      description: "Initial mediation",
    };
    const result = await rescheduleAppointment(
      5,
      original,
      "2025-02-01T10:00:00",
    );

    expect(result).toEqual(newAppt);
    expect(fetch).toHaveBeenCalledTimes(2);
    // The second call must PATCH the original to "rescheduled"
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      `${API_BASE}/complaints/5/appointments/1`,
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ status: "rescheduled" }),
      }),
    );
  });

  it("uses the original title in the new appointment", async () => {
    const newAppt = { id: 2 };
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(newAppt) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

    await rescheduleAppointment(
      5,
      { id: 1, title: "Hearing A" },
      "2025-02-01T10:00:00",
    );
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      `${API_BASE}/complaints/5/appointments`,
      expect.objectContaining({
        body: expect.stringContaining('"title":"Hearing A"'),
      }),
    );
  });
});

// ─── completeAppointment ──────────────────────────────────────────────────────
describe("completeAppointment", () => {
  it("sends PATCH with status 'completed'", async () => {
    mockFetch({ id: 10, status: "completed" });
    await completeAppointment(5, 10);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/complaints/5/appointments/10`,
      expect.objectContaining({
        body: JSON.stringify({ status: "completed" }),
      }),
    );
  });
});

// ─── cancelAppointment ────────────────────────────────────────────────────────
describe("cancelAppointment", () => {
  it("sends PATCH with status 'cancelled'", async () => {
    mockFetch({ id: 10, status: "cancelled" });
    await cancelAppointment(5, 10);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/complaints/5/appointments/10`,
      expect.objectContaining({
        body: JSON.stringify({ status: "cancelled" }),
      }),
    );
  });
});

// ─── markNoShow ───────────────────────────────────────────────────────────────
describe("markNoShow", () => {
  it("sends PATCH with status 'no-show'", async () => {
    mockFetch({ id: 10, status: "no-show" });
    await markNoShow(5, 10);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/complaints/5/appointments/10`,
      expect.objectContaining({ body: JSON.stringify({ status: "no-show" }) }),
    );
  });
});

// ─── Business-hours schedule enforcement ──────────────────────────────────────
describe("business-hours schedule enforcement", () => {
  // ── Day constraints ──
  it("BUSINESS_DAYS excludes Sunday (0)", () => {
    expect(BUSINESS_DAYS).not.toContain(0);
  });

  it("BUSINESS_DAYS excludes Saturday (6)", () => {
    expect(BUSINESS_DAYS).not.toContain(6);
  });

  it("BUSINESS_DAYS covers exactly Monday through Friday", () => {
    expect(BUSINESS_DAYS).toEqual([1, 2, 3, 4, 5]);
  });

  // ── Hour constraints ──
  it("no time slot starts before 7 AM", () => {
    const slots = getTimeSlots();
    const beforeBusiness = slots.filter((s) => {
      const hour = parseInt(s.value.split(":")[0], 10);
      return hour < BUSINESS_START_HOUR;
    });
    expect(beforeBusiness).toHaveLength(0);
  });

  it("no time slot starts at or after 5 PM (17:00)", () => {
    const slots = getTimeSlots();
    const afterBusiness = slots.filter((s) => {
      const hour = parseInt(s.value.split(":")[0], 10);
      return hour >= BUSINESS_END_HOUR;
    });
    expect(afterBusiness).toHaveLength(0);
  });

  it("first slot is exactly 7:00 AM", () => {
    const first = getTimeSlots()[0];
    expect(parseInt(first.value.split(":")[0], 10)).toBe(7);
  });

  it("last slot starts at 4:00 PM (16:00) so the session ends by 5 PM", () => {
    const slots = getTimeSlots();
    const last = slots[slots.length - 1];
    expect(parseInt(last.value.split(":")[0], 10)).toBe(16);
  });

  it("every slot falls within the [7, 16] inclusive range", () => {
    getTimeSlots().forEach((slot) => {
      const hour = parseInt(slot.value.split(":")[0], 10);
      expect(hour).toBeGreaterThanOrEqual(BUSINESS_START_HOUR);
      expect(hour).toBeLessThan(BUSINESS_END_HOUR);
    });
  });
});

// ─── getAvailability ──────────────────────────────────────────────────────────
describe("getAvailability", () => {
  it("throws if not authenticated", async () => {
    isAuthenticated.mockReturnValue(false);
    await expect(getAvailability("2025-01-01", "2025-01-31")).rejects.toThrow(
      "Not authenticated.",
    );
  });

  it("sends GET /appointments/availability with start and end query params", async () => {
    mockFetch({ days: [] });
    await getAvailability("2025-01-01", "2025-01-07");
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/appointments/availability?start=2025-01-01&end=2025-01-07`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      }),
    );
  });

  it("returns the days array from the response", async () => {
    const days = [{ date: "2025-01-01", is_full: false, slots: [] }];
    mockFetch({ days });
    await expect(getAvailability("2025-01-01", "2025-01-07")).resolves.toEqual(
      days,
    );
  });

  it("returns an empty array when the days key is absent", async () => {
    mockFetch({});
    await expect(getAvailability("2025-01-01", "2025-01-07")).resolves.toEqual(
      [],
    );
  });

  it("throws the server error message on failure", async () => {
    mockFetch({ message: "Invalid date range" }, false);
    await expect(getAvailability("bad", "dates")).rejects.toThrow(
      "Invalid date range",
    );
  });
});
