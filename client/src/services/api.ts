const API_BASE = '/api';

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include' // Sends httpOnly cookies
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    const error: any = new Error(errorMsg);
    error.status = response.status;
    error.details = data.details;
    throw error;
  }

  return data as T;
}

export const api = {
  get: <T>(url: string) => request<T>(url, { method: 'GET' }),
  post: <T>(url: string, body?: any) =>
    request<T>(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(url: string, body?: any) =>
    request<T>(url, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(url: string, body?: any) =>
    request<T>(url, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(url: string) => request<T>(url, { method: 'DELETE' })
};
