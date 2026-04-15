import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import {
    getToken,
    notifyAuthExpired,
} from '../../homepage/services/loginService';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Send cookies for authentication
});

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            notifyAuthExpired();
        }
        return Promise.reject(error);
    },
);

export default api;
