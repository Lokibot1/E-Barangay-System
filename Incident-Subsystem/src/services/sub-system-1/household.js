import api from "./Api";

export const householdService = {
  getAll: async () => {
    const res = await api.get("/households");
    return res.data;
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
    return res.data;
  },

  deactivate: async (db_id) => {
    const res = await api.delete(`/households/${db_id}/deactivate`);
    return res.data;
  },

  restore: async (db_id) => {
    const res = await api.post(`/households/${db_id}/restore`);
    return res.data;
  },
};