import {
  getAllCustomFields,
  createCustomField,
  updateCustomField,
} from "../../services/sub-system-3/customFieldService";

jest.mock("../../homepage/services/loginService", () => ({
  getToken: jest.fn(),
}));

import { getToken } from "../../homepage/services/loginService";

const API_BASE = "http://localhost:8000/api";

const mockFetch = (data, ok = true) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(data),
  });
};

beforeEach(() => {
  jest.resetAllMocks();
  getToken.mockReturnValue("test-token");
});

// ─── getAllCustomFields ───────────────────────────────────────────────────────
describe("getAllCustomFields", () => {
  it("sends GET /custom-fields with the Bearer token", async () => {
    mockFetch([]);
    await getAllCustomFields();
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/custom-fields`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      })
    );
  });

  it("returns the response data on success", async () => {
    const fields = [{ id: 1, field_name: "priority", field_type: "select" }];
    mockFetch(fields);
    await expect(getAllCustomFields()).resolves.toEqual(fields);
  });

  it("throws the server error message on failure", async () => {
    mockFetch({ message: "Unauthenticated." }, false);
    await expect(getAllCustomFields()).rejects.toThrow("Unauthenticated.");
  });

  it("throws a fallback message when the server provides none", async () => {
    mockFetch({}, false);
    await expect(getAllCustomFields()).rejects.toThrow(
      "Failed to fetch custom fields."
    );
  });
});

// ─── createCustomField ────────────────────────────────────────────────────────
describe("createCustomField", () => {
  const payload = {
    field_name: "urgency",
    field_type: "radio",
    options: ["low", "medium", "high"],
    is_active: true,
  };

  it("sends POST /custom-fields with JSON body", async () => {
    mockFetch({ id: 1, ...payload });
    await createCustomField(payload);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/custom-fields`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(payload),
      })
    );
  });

  it("sends the Bearer token in the Authorization header", async () => {
    mockFetch({ id: 1 });
    await createCustomField(payload);
    expect(fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      })
    );
  });

  it("returns the created field on success", async () => {
    const created = { id: 5, field_name: "urgency" };
    mockFetch(created);
    await expect(createCustomField(payload)).resolves.toEqual(created);
  });

  it("throws the server error message on failure", async () => {
    mockFetch({ message: "Validation failed." }, false);
    await expect(createCustomField(payload)).rejects.toThrow("Validation failed.");
  });

  it("throws a fallback message when the server provides none", async () => {
    mockFetch({}, false);
    await expect(createCustomField(payload)).rejects.toThrow(
      "Failed to create custom field."
    );
  });
});

// ─── updateCustomField ────────────────────────────────────────────────────────
describe("updateCustomField", () => {
  const payload = { is_active: false };

  it("sends PUT /custom-fields/:id with JSON body", async () => {
    mockFetch({ id: 3, is_active: false });
    await updateCustomField(3, payload);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/custom-fields/3`,
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(payload),
      })
    );
  });

  it("sends the Bearer token in the Authorization header", async () => {
    mockFetch({ id: 3 });
    await updateCustomField(3, payload);
    expect(fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      })
    );
  });

  it("uses the correct ID in the URL", async () => {
    mockFetch({ id: 42 });
    await updateCustomField(42, payload);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/custom-fields/42`,
      expect.anything()
    );
  });

  it("returns the updated field on success", async () => {
    const updated = { id: 3, is_active: false };
    mockFetch(updated);
    await expect(updateCustomField(3, payload)).resolves.toEqual(updated);
  });

  it("throws the server error message on failure", async () => {
    mockFetch({ message: "Custom field not found." }, false);
    await expect(updateCustomField(99, payload)).rejects.toThrow(
      "Custom field not found."
    );
  });

  it("throws a fallback message when the server provides none", async () => {
    mockFetch({}, false);
    await expect(updateCustomField(1, payload)).rejects.toThrow(
      "Failed to update custom field."
    );
  });
});
