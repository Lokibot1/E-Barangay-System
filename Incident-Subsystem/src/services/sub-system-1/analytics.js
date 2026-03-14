import api from "./Api"; 

/**
 * Service to handle all analytics-related API calls.
 * Uses the centralized 'api' instance to ensure authToken is included.
 */
export const analyticsService = {
  /**
   * Fetches the complete analytics dataset for all tabs.
   * Endpoint: GET /analytics/all
   */
  getAllData: async () => {
    try {
      const response = await api.get('/analytics/all');

      return response.data;
    } catch (error) {
      console.error("Analytics Service Error:", error);
 
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        "Failed to fetch analytics data";
        
      throw new Error(errorMessage);
    }
  },

  getSpecificMetric: async (metric) => {
    const response = await api.get(`/analytics/${metric}`);
    return response.data;
  }
};