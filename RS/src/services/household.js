import axios from 'axios';
import { API_BASE_URL } from '../config/api'; 

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

export const householdService = {
    getAll: async () => {
        try {
            const res = await api.get('/households');
            return res.data;
        } catch (error) {
            console.error("Fetch Error:", error);
            throw error;
        }
    },
    delete: async (db_id) => {
        try {
            await api.delete(`/households/${db_id}`);
            return true;
        } catch (error) {
            console.error("Delete Error:", error);
            return false;
        }
    }
};