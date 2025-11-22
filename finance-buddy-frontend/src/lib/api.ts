import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    register: (data: any) => api.post('/auth/register', data),
    login: (data: any) => api.post('/auth/login', data),
    getProfile: () => api.get('/auth/profile'),
};

// Teller APIs
export const tellerAPI = {
    getConnectUrl: () => api.get('/teller/connect'),
    connectAccount: (enrollmentId: string) => api.post('/teller/connect/callback', { enrollmentId }),
    getAccounts: () => api.get('/teller/accounts'),
    syncAccount: (accountId: string) => api.post(`/teller/accounts/${accountId}/sync`),
};

// Transaction APIs
export const transactionAPI = {
    getAll: (params?: any) => api.get('/transactions', { params }),
    getById: (id: string) => api.get(`/transactions/${id}`),
};

// Avatar/Chat APIs
export const chatAPI = {
    sendMessage: (message: string) => api.post('/avatar/chat', { message }),
    getHistory: () => api.get('/avatar/history'),
};

// Alert APIs
export const alertAPI = {
    getAll: (unread?: boolean) => api.get('/alerts', { params: { unread } }),
    markRead: (alertId: string) => api.patch(`/alerts/${alertId}/read`),
    markAllRead: () => api.patch('/alerts/read-all'),
};

// Budget APIs
export const budgetAPI = {
    getAll: () => api.get('/budgets'),
    create: (data: any) => api.post('/budgets', data),
    update: (id: string, data: any) => api.put(`/budgets/${id}`, data),
    delete: (id: string) => api.delete(`/budgets/${id}`),
};

// Analytics APIs
export const analyticsAPI = {
    getSpending: (days?: number) => api.get('/analytics/spending', { params: { days } }),
    getTrends: (months?: number) => api.get('/analytics/trends', { params: { months } }),
};
