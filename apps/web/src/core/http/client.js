import axios from 'axios';
import { useAuthStore } from '../auth/useAuthStore';
export const http = axios.create({
    // Use same-origin requests by default. In dev, Vite proxy will forward `/api`
    // to the backend. In production/preview, you can override via `VITE_API_BASE_URL`.
    baseURL: import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || ''),
    timeout: 10000
});
http.interceptors.request.use((config) => {
    const store = useAuthStore();
    if (store.accessToken) {
        config.headers.Authorization = `Bearer ${store.accessToken}`;
    }
    return config;
});
http.interceptors.response.use((res) => res.data, (err) => {
    const status = err.response?.status;
    if (status === 401 || status === 403) {
        const store = useAuthStore();
        const hadToken = !!store.accessToken;
        store.logout();
        if (hadToken && typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.assign('/login');
        }
    }
    return Promise.reject(err);
});
