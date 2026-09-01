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

/**
 * In-flight request deduplication:
 * Nếu cùng một GET request đang chờ, các lần gọi sau sẽ dùng chung Promise đó
 * thay vì tạo thêm network request. Điều này ngăn tình trạng click nhiều lần
 * gửi cùng lúc nhiều request giống hệt nhau đến backend.
 */
const inFlightGets = new Map<string, Promise<unknown>>();

export async function apiRequest<T>(path: string, options: RequestInit = {}) {
  const method = options.method?.toUpperCase() ?? 'GET';

  // Chỉ deduplicate GET không gắn AbortSignal. Request có signal thuộc vòng đời
  // riêng của component; dùng chung Promise có thể khiến một nơi huỷ request của nơi khác.
  if (method === 'GET' && !options.signal) {
    const key = `${API_BASE_URL}${path}`;
    const existing = inFlightGets.get(key);
    if (existing) return existing as Promise<T>;

    const promise = fetchOnce<T>(path, options);
    inFlightGets.set(key, promise);
    const clearInFlight = () => {
      if (inFlightGets.get(key) === promise) inFlightGets.delete(key);
    };
    // Xử lý cả resolve và reject trên Promise phụ để không tạo unhandled rejection.
    void promise.then(clearInFlight, clearInFlight);
    return promise;
  }

  return fetchOnce<T>(path, options);
}

async function fetchOnce<T>(path: string, options: RequestInit): Promise<T> {
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

export const apiGet = <T,>(path: string, options?: RequestInit) => apiRequest<T>(path, options);
export const apiPost = <T,>(path: string, data: unknown, options: RequestInit = {}) =>
  apiRequest<T>(path, { ...options, method: 'POST', body: JSON.stringify(data) });
export const apiPatch = <T,>(path: string, data: unknown = {}) => apiRequest<T>(path, { method: 'PATCH', body: JSON.stringify(data) });
export const apiDelete = <T,>(path: string) => apiRequest<T>(path, { method: 'DELETE' });
