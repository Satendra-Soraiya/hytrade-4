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
    if (typeof window !== "undefined") {
      // Use same-origin proxy in local dev to avoid cross-origin issues
      const isLocalLanding = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port === '3000';
      if (isLocalLanding) {
        return '';
      }
      if (window.location.protocol === "https:") {
        const u = new URL(api);
        if (u.protocol === "http:") {
          u.protocol = "https:";
          api = u.toString().replace(/\/$/, "");
        }
      }
    }
  } catch {}
  return api;
};

export const storage = {
  setSession(data: { token: string; user?: any; sessionId?: string; session?: any }) {
    try {
      // Store the token
      localStorage.setItem("token", data.token);
      localStorage.setItem("authToken", data.token);
      
      // Store session data if provided
      if (data.sessionId) localStorage.setItem("sessionId", data.sessionId);
      if (data.session) localStorage.setItem("session", JSON.stringify(data.session));
      
      // Process and store user data if provided
      if (data.user) {
        // Ensure avatar URL is processed
        const user = processUser(data.user);
        localStorage.setItem("user", JSON.stringify(user));
      }
      
      // Update login state
      localStorage.setItem("isLoggedIn", "true");
      
      // Dispatch storage event to notify other tabs/windows
      window.dispatchEvent(new StorageEvent("storage", { 
        key: "token", 
        newValue: data.token,
        url: window.location.href
      }));
    } catch (error) {
      console.error('Error setting session:', error);
    }
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

export async function verify(): Promise<{ ok: boolean; status?: number }> {
  const API = getApiUrl();
  const token = storage.getToken();
  
  if (!token) {
    console.log('No token found in storage');
    return { ok: false };
  }
  
  console.log('Verifying token...');
  
  try {
    const verifyUrl = `${API}/api/auth/verify`;
    console.log('Verification URL:', verifyUrl);
    
    const res = await fetch(verifyUrl, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      cache: 'no-store'
    });
    
    console.log('Verification response status:', res.status);
    
    if (!res.ok) {
      if (res.status === 401) {
        console.log('Token verification failed: Unauthorized (401)');
        return { ok: false, status: 401 };
      } else {
        console.error(`Token verification failed with status: ${res.status}`);
      }
      return { ok: false, status: res.status };
    }
    
    console.log('Token verified successfully');
    return { ok: true, status: res.status };
  } catch (error) {
    console.error('Error verifying token:', error);
    // Network or CORS error: treat as non-fatal and keep session
    return { ok: false, status: 0 };
  }
}

// Helper function to process user object and ensure avatar URL is correct
function processUser(user: any): any {
  if (!user) return null;
  
  // Ensure avatar URL is absolute
  if (user.avatar && !user.avatar.startsWith('http')) {
    const baseUrl = getApiUrl();
    user.avatar = `${baseUrl}${user.avatar.startsWith('/') ? '' : '/'}${user.avatar}`;
  }
  
  return user;
}

export async function getProfile(): Promise<any | null> {
  const API = getApiUrl();
  const token = storage.getToken();
  if (!token) return null;
  
  try {
    const res = await fetch(`${API}/api/auth/profile`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      cache: 'no-store'
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        // Token is invalid or expired
        storage.clearSession();
      }
      return null;
    }
    
    const data = await res.json().catch(() => ({}));
    const user = data?.user || null;
    
    // Store the user data in localStorage if it exists
    if (user) {
      const processedUser = processUser(user);
      try {
        localStorage.setItem('user', JSON.stringify(processedUser));
      } catch (e) {
        console.error('Failed to store user in localStorage:', e);
      }
      return processedUser;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
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
