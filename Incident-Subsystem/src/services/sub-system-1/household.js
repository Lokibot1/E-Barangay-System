import api from "./Api";
import { memCache } from "../shared/cache";

const HOUSEHOLDS_CACHE_KEY = "households:list";
const HOUSEHOLDS_TTL = 5 * 60 * 1000; // 5 minutes

export const householdService = {
  getAll: async () => {
    return memCache.remember(HOUSEHOLDS_CACHE_KEY, HOUSEHOLDS_TTL, async () => {
      const res = await api.get("/households");
      return res.data;
    });
  },

  getArchived: async () => {
    const res = await api.get("/households/archived");
    return res.data;
  },

  getAllLogs: async () => {
    const res = await api.get("/households/logs");
    return res.data;
  },

  getHistory: async (db_id) => {
    const res = await api.get(`/households/${db_id}/history`);
    return res.data;
  },

  update: async (db_id, payload) => {
    const res = await api.put(`/households/${db_id}`, payload);
    memCache.invalidate(HOUSEHOLDS_CACHE_KEY);
    return res.data;
  },

  deactivate: async (db_id) => {
    const res = await api.delete(`/households/${db_id}/deactivate`);
    memCache.invalidate(HOUSEHOLDS_CACHE_KEY);
    return res.data;
  },

  restore: async (db_id) => {
    const res = await api.post(`/households/${db_id}/restore`);
    memCache.invalidate(HOUSEHOLDS_CACHE_KEY);
    return res.data;
  },
};