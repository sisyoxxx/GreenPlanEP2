import { defineStore } from 'pinia';
import { http } from '../http/client';
function safeParseJson(value, fallback) {
    if (!value)
        return fallback;
    try {
        return JSON.parse(value);
    }
    catch {
        return fallback;
    }
}
export const useAuthStore = defineStore('auth', {
    state: () => ({
        accessToken: localStorage.getItem('gp2_accessToken') || '',
        refreshToken: localStorage.getItem('gp2_refreshToken') || '',
        user: safeParseJson(localStorage.getItem('gp2_user'), null)
    }),
    getters: {
        isLoggedIn: (state) => !!state.accessToken,
        role: (state) => state.user?.role ?? null
    },
    actions: {
        async login(payload) {
            const res = await http.post('/api/auth/login', payload);
            this.applyAuth(res.data);
        },
        async register(payload) {
            const res = await http.post('/api/auth/register', payload);
            this.applyAuth(res.data);
        },
        applyAuth(data) {
            this.accessToken = data.accessToken;
            this.refreshToken = data.refreshToken;
            this.user = data.user;
            localStorage.setItem('gp2_accessToken', data.accessToken);
            localStorage.setItem('gp2_refreshToken', data.refreshToken);
            localStorage.setItem('gp2_user', JSON.stringify(data.user));
        },
        syncUserProfile(patch) {
            if (!this.user)
                return;
            this.user = { ...this.user, ...patch };
            localStorage.setItem('gp2_user', JSON.stringify(this.user));
        },
        logout() {
            this.accessToken = '';
            this.refreshToken = '';
            this.user = null;
            localStorage.removeItem('gp2_accessToken');
            localStorage.removeItem('gp2_refreshToken');
            localStorage.removeItem('gp2_user');
        }
    }
});
