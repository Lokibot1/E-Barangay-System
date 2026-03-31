import { renderHook, act, waitFor } from "@testing-library/react";
import { useAuthLogic } from "../../homepage/hooks/useAuthLogic";

jest.mock("../../homepage/services/authService", () => ({
  authService: {
    getLocations: jest.fn(),
    searchAddresses: jest.fn(),
    checkHouseholdHead: jest.fn(),
    register: jest.fn(),
    adminEntry: jest.fn(),
    track: jest.fn(),
  },
}));

import { authService } from "../../homepage/services/authService";

const mockNavigate = jest.fn();

beforeEach(() => {
  jest.resetAllMocks();
  authService.getLocations.mockResolvedValue({ puroks: [], streets: [] });
  authService.searchAddresses.mockResolvedValue({ data: [] });
  authService.checkHouseholdHead.mockResolvedValue({ exists: false });
});

// ─── Initial state ────────────────────────────────────────────────────────────
describe("initial state", () => {
  it("initialises loading as false", () => {
    const { result } = renderHook(() => useAuthLogic(mockNavigate));
    expect(result.current.loading).toBe(false);
  });

  it("initialises authSuccess as null", () => {
    const { result } = renderHook(() => useAuthLogic(mockNavigate));
    expect(result.current.authSuccess).toBeNull();
  });

  it("initialises formData with nationality set to Filipino", () => {
    const { result } = renderHook(() => useAuthLogic(mockNavigate));
    expect(result.current.formData.nationality).toBe("Filipino");
  });

  it("initialises trackingNum as empty string", () => {
    const { result } = renderHook(() => useAuthLogic(mockNavigate));
    expect(result.current.trackingNum).toBe("");
  });

  it("fetches locations on mount", async () => {
    renderHook(() => useAuthLogic(mockNavigate));
    await waitFor(() =>
      expect(authService.getLocations).toHaveBeenCalledTimes(1)
    );
  });

  it("populates purokList from getLocations response", async () => {
    authService.getLocations.mockResolvedValue({
      puroks: [{ id: 1, name: "Purok 1" }],
      streets: [],
    });
    const { result } = renderHook(() => useAuthLogic(mockNavigate));
    await waitFor(() =>
      expect(result.current.purokList).toHaveLength(1)
    );
    expect(result.current.purokList[0].name).toBe("Purok 1");
  });
});

// ─── handleChange ─────────────────────────────────────────────────────────────
describe("handleChange", () => {
  it("updates a text field value", () => {
    const { result } = renderHook(() => useAuthLogic(mockNavigate));
    act(() => {
      result.current.handleChange({
        target: { name: "firstName", value: "Juan", type: "text" },
      });
    });
    expect(result.current.formData.firstName).toBe("Juan");
  });

  it("strips non-numeric characters from the contact field", () => {
    const { result } = renderHook(() => useAuthLogic(mockNavigate));
    act(() => {
      result.current.handleChange({
        target: { name: "contact", value: "0917-123-4567", type: "text" },
      });
    });
    expect(result.current.formData.contact).toBe("09171234567");
  });

  it("limits contact field to 11 digits", () => {
    const { result } = renderHook(() => useAuthLogic(mockNavigate));
    act(() => {
      result.current.handleChange({
        target: { name: "contact", value: "123456789012345", type: "text" },
      });
    });
    expect(result.current.formData.contact).toHaveLength(11);
  });

  it("calculates age from birthdate", () => {
    const { result } = renderHook(() => useAuthLogic(mockNavigate));
    // Use a birthdate 30 years ago
    const thirtyYearsAgo = new Date();
    thirtyYearsAgo.setFullYear(thirtyYearsAgo.getFullYear() - 30);
    const bd = thirtyYearsAgo.toISOString().split("T")[0];
    act(() => {
      result.current.handleChange({
        target: { name: "birthdate", value: bd, type: "text" },
      });
    });
    expect(result.current.formData.age).toBe(30);
  });

  it("sets sector to '3' (senior) when age is 60 or above", () => {
    const { result } = renderHook(() => useAuthLogic(mockNavigate));
    const sixtyYearsAgo = new Date();
    sixtyYearsAgo.setFullYear(sixtyYearsAgo.getFullYear() - 60);
    const bd = sixtyYearsAgo.toISOString().split("T")[0];
    act(() => {
      result.current.handleChange({
        target: { name: "birthdate", value: bd, type: "text" },
      });
    });
    expect(result.current.formData.sector).toBe("3");
  });

  it("clears street when purok changes", () => {
    const { result } = renderHook(() => useAuthLogic(mockNavigate));
    act(() => {
      result.current.handleChange({
        target: { name: "street", value: "5", type: "text" },
      });
    });
    act(() => {
      result.current.handleChange({
        target: { name: "purok", value: "2", type: "text" },
      });
    });
    expect(result.current.formData.street).toBe("");
    expect(result.current.formData.purok).toBe("2");
  });

  it("handles checkbox input", () => {
    const { result } = renderHook(() => useAuthLogic(mockNavigate));
    act(() => {
      result.current.handleChange({
        target: { name: "isVoter", type: "checkbox", checked: true },
      });
    });
    expect(result.current.formData.isVoter).toBe(true);
  });
});

// ─── submitAuth (public registration) ────────────────────────────────────────
describe("submitAuth", () => {
  it("calls authService.register with formData", async () => {
    authService.register.mockResolvedValue({
      success: true,
      trackingNumber: "TRK-001",
    });
    const { result } = renderHook(() => useAuthLogic(mockNavigate));
    await act(async () => {
      await result.current.submitAuth({ preventDefault: jest.fn() });
    });
    expect(authService.register).toHaveBeenCalledTimes(1);
  });

  it("sets authSuccess with type PUBLIC_REG on success", async () => {
    authService.register.mockResolvedValue({
      success: true,
      trackingNumber: "TRK-001",
    });
    const { result } = renderHook(() => useAuthLogic(mockNavigate));
    await act(async () => {
      await result.current.submitAuth({ preventDefault: jest.fn() });
    });
    expect(result.current.authSuccess?.type).toBe("PUBLIC_REG");
  });

  it("throws an error when register fails", async () => {
    authService.register.mockRejectedValue(new Error("Registration failed."));
    const { result } = renderHook(() => useAuthLogic(mockNavigate));
    await expect(
      act(async () => {
        await result.current.submitAuth({ preventDefault: jest.fn() });
      })
    ).rejects.toThrow("Registration failed.");
  });

  it("resets loading to false after completion", async () => {
    authService.register.mockResolvedValue({
      success: true,
      trackingNumber: "TRK-001",
    });
    const { result } = renderHook(() => useAuthLogic(mockNavigate));
    await act(async () => {
      await result.current.submitAuth({ preventDefault: jest.fn() });
    });
    expect(result.current.loading).toBe(false);
  });
});

// ─── submitAdminEntry ─────────────────────────────────────────────────────────
describe("submitAdminEntry", () => {
  it("calls authService.adminEntry with formData merged with overrides", async () => {
    authService.adminEntry.mockResolvedValue({
      account: { id: 1, username: "juan", temp_password: "pass123", token: "tok" },
      resident: { name: "Juan dela Cruz" },
    });
    const { result } = renderHook(() => useAuthLogic(mockNavigate));
    await act(async () => {
      await result.current.submitAdminEntry(
        { preventDefault: jest.fn() },
        { isIndigent: 1 }
      );
    });
    const callArg = authService.adminEntry.mock.calls[0][0];
    expect(callArg.isIndigent).toBe(1);
  });

  it("sets authSuccess with type ADMIN_ENTRY on success", async () => {
    authService.adminEntry.mockResolvedValue({
      account: { id: 1, username: "juan", temp_password: "pass123", token: "tok" },
      resident: { name: "Juan dela Cruz" },
    });
    const { result } = renderHook(() => useAuthLogic(mockNavigate));
    await act(async () => {
      await result.current.submitAdminEntry({ preventDefault: jest.fn() });
    });
    expect(result.current.authSuccess?.type).toBe("ADMIN_ENTRY");
  });

  it("throws when adminEntry fails", async () => {
    authService.adminEntry.mockRejectedValue(new Error("Failed to add resident."));
    const { result } = renderHook(() => useAuthLogic(mockNavigate));
    await expect(
      act(async () => {
        await result.current.submitAdminEntry({ preventDefault: jest.fn() });
      })
    ).rejects.toThrow("Failed to add resident.");
  });
});

// ─── handleTrackSearch ────────────────────────────────────────────────────────
describe("handleTrackSearch", () => {
  it("keeps only the numeric portion in trackingNum", async () => {
    const { result } = renderHook(() => useAuthLogic(mockNavigate));
    await act(async () => {
      await result.current.handleTrackSearch("bgn12a34!5");
    });
    expect(result.current.trackingNum).toBe("12345");
  });

  it("does not call authService.track when input is shorter than 5 digits", async () => {
    const { result } = renderHook(() => useAuthLogic(mockNavigate));
    await act(async () => {
      await result.current.handleTrackSearch("1234");
    });
    expect(authService.track).not.toHaveBeenCalled();
  });

  it("calls authService.track with the BGN prefix when input reaches 5 digits", async () => {
    authService.track.mockResolvedValue({ success: true, data: { status: "pending" } });
    const { result } = renderHook(() => useAuthLogic(mockNavigate));
    await act(async () => {
      await result.current.handleTrackSearch("12345");
    });
    expect(authService.track).toHaveBeenCalledWith("BGN12345");
  });

  it("sets searchResult to NOT_FOUND when track throws", async () => {
    authService.track.mockRejectedValue(new Error("Not found"));
    const { result } = renderHook(() => useAuthLogic(mockNavigate));
    await act(async () => {
      await result.current.handleTrackSearch("12345");
    });
    expect(result.current.searchResult?.status).toBe("NOT_FOUND");
  });
});

// ─── selectAddress ────────────────────────────────────────────────────────────
describe("selectAddress", () => {
  it("updates houseNumber, purok, and street from the selected address", () => {
    const { result } = renderHook(() => useAuthLogic(mockNavigate));
    act(() => {
      result.current.selectAddress({
        house_number: "12",
        purok_id: 3,
        street_id: 7,
        street_name: "Sampaguita St",
      });
    });
    expect(result.current.formData.houseNumber).toBe("12");
    expect(result.current.formData.purok).toBe("3");
    expect(result.current.formData.street).toBe("7");
  });

  it("clears address fields when house_number is absent", () => {
    const { result } = renderHook(() => useAuthLogic(mockNavigate));
    act(() => {
      result.current.selectAddress({ street_name: "Sampaguita" });
    });
    expect(result.current.formData.houseNumber).toBe("");
    expect(result.current.formData.purok).toBe("");
    expect(result.current.formData.street).toBe("");
  });
});
