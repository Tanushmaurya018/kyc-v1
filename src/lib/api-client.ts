const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ENV_TOKEN = import.meta.env.VITE_AUTH_TOKEN;

// Persist token to localStorage on first load
if (ENV_TOKEN && !localStorage.getItem("auth_token")) {
  localStorage.setItem("auth_token", ENV_TOKEN);
}

function getAuthToken(): string | null {
  return localStorage.getItem("auth_token") || ENV_TOKEN || null;
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` }),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = body?.error?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),

  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),

  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),

  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
