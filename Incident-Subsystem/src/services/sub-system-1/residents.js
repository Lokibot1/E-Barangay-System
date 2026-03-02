import axios from "axios";
import { API_BASE_URL } from "../../config/api";

const transformResident = (r) => {
  if (!r) return null;

  return {
    ...r,

    sectorLabel: (typeof r.sector === "object" ? r.sector?.name : r.sector) || "GENERAL POPULATION",

    sector_id: r.sector?.id || r.sector_id || "",
    temp_purok_id: r.purok?.id || r.temp_purok_id || "",
    temp_street_id: r.street?.id || r.temp_street_id || "",
    marital_status_id: r.maritalStatus?.id || r.marital_status_id || "",
    nationality_id: r.nationality?.id || r.nationality_id || "",

    first_name: r.firstName || r.first_name || "",
    last_name: r.lastName || r.last_name || "",
    middle_name: r.middleName || r.middle_name || "",
    contact_number: r.contact || r.contact_number || "",
    birth_registration: r.birthRegistration || r.birth_registration || "",
    household_position: r.householdPosition || r.household_position || "",
    residency_start_date: r.residencyStartDate || r.residency_start_date || "",
    
    // Socio-Eco Fields
    employment_status: r.employmentStatus || r.employment_status || "",
    income_source: r.incomeSource || r.income_source || "",
    monthly_income: r.monthlyIncome || r.monthly_income || "",
    educational_status: r.educationalStatus || r.educational_status || "",
    school_type: r.schoolType || r.school_type || "",
    school_level: r.schoolLevel || r.school_level || "",
    highest_attainment: r.highestGrade || r.highest_attainment || "",
    
    // Voter helper
    is_voter: (r.isVoter == 1 || r.is_voter == 1 || r.isVoter === 'Yes' || r.is_voter === 'Yes') ? 'Yes' : 'No'
  };
};

export const residentService = {
  getResidents: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/residents`);
      
      // Handle Laravel paginated or simple array response
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
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Update Error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || error.message,
      };
    }
  },

  deleteResident: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/residents/${id}`);
      return { 
        success: true,
        data: response.data 
      };
    } catch (error) {
      console.error("Delete Error:", error.response?.data || error.message);
      return { 
        success: false,
        error: error.message 
      };
    }
  },
};