"use client";

export type LoginResponse = {
  success: boolean;
  message?: string;
  token?: string;
  sessionId?: string;
  user?: any;
  session?: any;
};

const getApiUrl = () => {
  let api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
  try {
    if (typeof window !== "undefined" && window.location.protocol === "https:") {
      const u = new URL(api);
      if (u.protocol === "http:") {
        u.protocol = "https:";
        api = u.toString().replace(/\/$/, "");
      }
    }
  } catch {}
  return api;
};

export const storage = {
  setSession(data: { token: string; user?: any; sessionId?: string; session?: any }) {
    try {
      localStorage.setItem("token", data.token);
      localStorage.setItem("authToken", data.token);
      if (data.sessionId) localStorage.setItem("sessionId", data.sessionId);
      if (data.session) localStorage.setItem("session", JSON.stringify(data.session));
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("isLoggedIn", "true");
      window.dispatchEvent(new StorageEvent("storage", { key: "token", newValue: data.token }));
    } catch {}
  },
  clearSession() {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("sessionId");
      localStorage.removeItem("session");
      localStorage.removeItem("user");
      localStorage.setItem("isLoggedIn", "false");
      window.dispatchEvent(new StorageEvent("storage", { key: "isLoggedIn", newValue: "false" }));
    } catch {}
  },
  getToken(): string | null {
    try {
      return localStorage.getItem("token") || localStorage.getItem("authToken");
    } catch {
      return null;
    }
  }
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  const API = getApiUrl();
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password })
  });
  const data = await res.json().catch(() => ({ success: false, message: `Login failed (${res.status})` }));
  return data as LoginResponse;
}

export async function register(payload: { firstName: string; lastName: string; email: string; password: string }): Promise<LoginResponse> {
  const API = getApiUrl();
  const res = await fetch(`${API}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload })
  });
  const data = await res.json().catch(() => ({ success: false, message: `Register failed (${res.status})` }));
  return data as LoginResponse;
}

export async function verify(): Promise<boolean> {
  const API = getApiUrl();
  const token = storage.getToken();
  if (!token) return false;
  const res = await fetch(`${API}/api/auth/verify`, {
    headers: { Authorization: `Bearer ${token}` }
  }).catch(() => null as any);
  return !!(res && res.ok);
}

export async function getProfile(): Promise<any | null> {
  const API = getApiUrl();
  const token = storage.getToken();
  if (!token) return null;
  const res = await fetch(`${API}/api/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  }).catch(() => null as any);
  if (!res || !res.ok) return null;
  const data = await res.json().catch(() => ({}));
  return data?.user || null;
}

export async function logout(): Promise<void> {
  const API = getApiUrl();
  const token = storage.getToken();
  if (token) {
    try {
      await fetch(`${API}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {}
  }
  storage.clearSession();
}
