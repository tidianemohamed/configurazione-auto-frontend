import { api } from '../api/client';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  password_confirmation: string;
}

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export async function login(data: LoginData) {
  const response = await api.post('/login', data);
  return response.data;
}

export async function register(data: RegisterData) {
  const response = await api.post('/register', data);
  return response.data;
}

export default { login, register, setAuthToken };
