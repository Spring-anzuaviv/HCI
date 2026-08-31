import { apiGet, apiPost } from './client';

export interface StoreSession {
  storeId: number;
  name: string;
  email?: string;
  address?: string;
}

export const login = (email: string, password: string) =>
  apiPost<{ store: StoreSession }>('/auth/login', { email, password });

export const getCurrentStore = () => apiGet<StoreSession>('/auth/me');
export const logout = () => apiPost<{ loggedOut: boolean }>('/auth/logout', {});
