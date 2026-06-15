export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const USER_STORAGE_KEY = "session_user";
const DEFAULT_TIMEOUT_MS = 15000;

export function setToken(t) { localStorage.setItem("token", t); }
export function getToken() { return localStorage.getItem("token"); }
export function removeToken() { localStorage.removeItem("token"); }
export function setCurrentUser(user) { localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user)); }
export function getCurrentUser() {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}
export function removeCurrentUser() { localStorage.removeItem(USER_STORAGE_KEY); }
export function clearAuth() {
  removeToken();
  removeCurrentUser();
}

export async function api(path, { method = "GET", body, isForm = false, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isForm) headers["Content-Type"] = "application/json";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: isForm ? body : body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(await res.text());
    if (res.status === 204) return {};
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(JSON.stringify({ detail: "Request timed out. Please try again." }));
    }
    if (error?.name === "TypeError") {
      throw new Error(JSON.stringify({ detail: `Cannot reach backend at ${API_BASE}.` }));
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchCurrentUser(timeoutMs = DEFAULT_TIMEOUT_MS) {
  const user = await api("/auth/me", { timeoutMs });
  setCurrentUser(user);
  return user;
}
