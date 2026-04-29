import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import {
    getToken,
    notifyAuthExpired,
    notifyAuthForbidden,
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
        if (error?.response?.status === 403) {
            notifyAuthForbidden({
                message: error?.response?.data?.message || '403 Forbidden',
                url: error?.config?.url,
            });
        }
        return Promise.reject(error);
    },
);

export default api;
