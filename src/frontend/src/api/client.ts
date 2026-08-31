const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

export class ApiRequestError extends Error {
  public code: string;
  public status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiRequestError(body.error?.code ?? 'NETWORK_ERROR', body.error?.message ?? 'Không thể kết nối máy chủ', response.status);
  }
  return body.data as T;
}

export const apiGet = <T,>(path: string) => apiRequest<T>(path);
export const apiPost = <T,>(path: string, data: unknown) => apiRequest<T>(path, { method: 'POST', body: JSON.stringify(data) });
<<<<<<< HEAD
export const apiPatch = <T,>(path: string, data: unknown) => apiRequest<T>(path, { method: 'PATCH', body: JSON.stringify(data) });
export const apiDelete = <T,>(path: string) => apiRequest<T>(path, { method: 'DELETE' });
=======
export const apiPatch = <T,>(path: string, data: unknown = {}) => apiRequest<T>(path, { method: 'PATCH', body: JSON.stringify(data) });
>>>>>>> MX
