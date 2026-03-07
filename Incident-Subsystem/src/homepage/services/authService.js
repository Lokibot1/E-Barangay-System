/**
 * authService.js
 * Handles all registration-related API calls.
 * Backend: http://localhost:8002
 */

const API_BASE_URL = "http://localhost:8002/api";

export const authService = {

  // 1. Get Purok & Street locations
  getLocations: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/locations`);
      const data = await response.json();
      return data;
    } catch (error) {
      // Fallback data if backend is unreachable
      return {
        success: true,
        puroks: [
          { id: 1, number: "1", name: "Purok 1" },
          { id: 2, number: "2", name: "Purok 2" },
          { id: 3, number: "3", name: "Purok 3" },
          { id: 4, number: "4", name: "Purok 4" },
          { id: 5, number: "5", name: "Purok 5" },
          { id: 6, number: "6", name: "Purok 6" },
          { id: 7, number: "7", name: "Purok 7" },
        ],
        streets: [
          { id: 1, purok_id: 1, name: "Sisa St." },
          { id: 2, purok_id: 1, name: "Crisostomo St." },
          { id: 3, purok_id: 2, name: "Ibarra St." },
          { id: 4, purok_id: 2, name: "Elias St." },
          { id: 5, purok_id: 3, name: "Maria Clara St." },
          { id: 6, purok_id: 3, name: "Basilio St." },
          { id: 7, purok_id: 4, name: "Salvi St." },
          { id: 8, purok_id: 4, name: "Victoria St." },
          { id: 9, purok_id: 5, name: "Tiago St." },
          { id: 10, purok_id: 5, name: "Tasio St." },
          { id: 11, purok_id: 6, name: "Guevarra St." },
          { id: 12, purok_id: 6, name: "Sinang St." },
          { id: 13, purok_id: 7, name: "Alfarez St." },
          { id: 14, purok_id: 7, name: "Dona Victorina St." },
        ],
        source: "fallback",
      };
    }
  },

  // 2. Check if a household head already exists at a given address
  checkHouseholdHead: async ({ houseNumber, street, purok }) => {
    try {
      if (!houseNumber || !street || !purok) return { exists: false };

      const params = new URLSearchParams({
        house_number: houseNumber,
        street_id: street,
        purok_id: purok,
      });

      const response = await fetch(
        `${API_BASE_URL}/households/check-head?${params}`
      );
      return await response.json();
    } catch (error) {
      console.error("Check household head error:", error);
      return { exists: false, error: true };
    }
  },

  // 3. Register a new resident
  register: async (formData) => {
    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === "idFront" || key === "idBack") return;

        let value = formData[key];
        if (typeof value === "boolean") value = value ? 1 : 0;
        if (value !== null && value !== undefined) {
          data.append(key, value);
        }
      });

      if (formData.idFront) data.append("idFront", formData.idFront);
      if (formData.idBack) data.append("idBack", formData.idBack);

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });

      const result = await response.json();
      if (!response.ok) {
        throw { response: { data: result } };
      }
      return result;
    } catch (error) {
      console.error("Registration error:", error?.response?.data || error);
      throw error;
    }
  },

  // 4. Track an application by tracking number
  track: async (trackingNumber) => {
    try {
      const cleaned = trackingNumber.toUpperCase().trim();
      const response = await fetch(`${API_BASE_URL}/track/${cleaned}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Not found");
      return data;
    } catch (error) {
      console.error("Tracking error:", error);
      throw error;
    }
  },
};