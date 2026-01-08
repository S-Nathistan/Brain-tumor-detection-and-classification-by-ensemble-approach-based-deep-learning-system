export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function setToken(t) { localStorage.setItem("token", t); }
export function getToken() { return localStorage.getItem("token"); }
export function removeToken() { localStorage.removeItem("token"); }

export async function api(path, { method = "GET", body, isForm = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isForm) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}
