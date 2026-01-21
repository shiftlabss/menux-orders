import { api } from './api';

export const authService = {
    async login(email, password) {
        const response = await api.post('/auth/login', { email, password });
        if (response.access_token) {
            localStorage.setItem('token', response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }
        return response;
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    isAuthenticated() {
        return !!localStorage.getItem('token');
    }
};
