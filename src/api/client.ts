import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://127.0.0.1:8000';

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export type ApiResponse<T> = T;

export default api;
