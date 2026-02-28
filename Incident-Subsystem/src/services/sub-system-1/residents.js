import axios from "axios";
import { API_BASE_URL } from "../../config/api";

const transformResident = (r) => {
  if (!r) return null;
  return {
    ...r,
    sectorLabel:
      (typeof r.sector === "object" ? r.sector?.name : r.sector) ||
      "GENERAL POPULATION",
  };
};

export const residentService = {
  getResidents: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/residents`);
      const rawData = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];
      return rawData
        .filter((res) => res !== null && typeof res === "object")
        .map(transformResident);
    } catch (error) {
      console.error("Fetch Error:", error);
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch residents";
      throw new Error(message);
    }
  },

  updateResident: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/residents/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Update Error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },

  deleteResident: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/residents/${id}`);
      return response.data;
    } catch (error) {
      console.error("Delete Error:", error.response?.data || error.message);
      return { success: false };
    }
  },
};
