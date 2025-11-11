"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getProfile, login as apiLogin, logout as apiLogout, register as apiRegister, storage, verify } from "@/lib/auth";

type Ctx = {
  user: any | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<Ctx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Shared token cookie utilities for cross-subdomain SSO
  const getCookieToken = (): string | null => {
    if (typeof document === 'undefined') return null;
    try {
      const cookies = document.cookie?.split(';') || [];
      for (const c of cookies) {
        const [k, v] = c.trim().split('=');
        if (k === 'hytrade_token' && v) return decodeURIComponent(v);
      }
    } catch {}
    return null;
  };

  const setCookieToken = (token: string) => {
    if (typeof document === 'undefined') return;
    try {
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const host = typeof window !== 'undefined' ? window.location.hostname : '';
      const attrs = [`path=/`, `SameSite=Lax`, isHttps ? `Secure` : ``].filter(Boolean).join('; ');
      // Set cookie for current host
      document.cookie = `hytrade_token=${encodeURIComponent(token)}; ${attrs}`;
      // Also set for root domain when applicable
      if (host.endsWith('hytrade.in')) {
        document.cookie = `hytrade_token=${encodeURIComponent(token)}; domain=.hytrade.in; ${attrs}`;
      }
    } catch {}
  };

  const clearCookieToken = () => {
    if (typeof document === 'undefined') return;
    try {
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const host = typeof window !== 'undefined' ? window.location.hostname : '';
      const attrs = [`path=/`, `Max-Age=0`, `SameSite=Lax`, isHttps ? `Secure` : ``].filter(Boolean).join('; ');
      // Clear for current host
      document.cookie = `hytrade_token=; ${attrs}`;
      // Clear for root domain when applicable
      if (host.endsWith('hytrade.in')) {
        document.cookie = `hytrade_token=; domain=.hytrade.in; ${attrs}`;
      }
    } catch {}
  };

  useEffect(() => {
    const init = async () => {
      // Check for token in URL first
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');
        
        if (tokenFromUrl) {
          try {
            console.log('Token found in URL, processing...');
            // Store the token from URL
            storage.setSession({ token: tokenFromUrl });
            setCookieToken(tokenFromUrl);
            
            // Clean up the URL without causing a reload
            const newUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, '', newUrl);
            
            // Verify the token and get user profile
        const result = await verify();
        if (result.ok) {
          const u = await getProfile();
          if (u) {
            console.log('User profile loaded successfully', u);
            setUser(u);
            setIsLoggedIn(true);
            return;
          }
        } else if (result.status === 401) {
          console.error('Failed to verify token (401). Clearing session.');
          storage.clearSession();
          clearCookieToken();
        } else {
          // Network/CORS error or temporary failure – keep session and mark logged in
          console.warn('Verify failed due to network/CORS; keeping session.');
          setIsLoggedIn(true);
          try {
            const raw = localStorage.getItem('user');
            setUser(raw ? JSON.parse(raw) : null);
          } catch { setUser(null) }
          return;
        }
          } catch (error) {
            console.error('Error processing token from URL:', error);
            storage.clearSession();
            clearCookieToken();
          }
        } else {
          console.log('No token found in URL, checking existing session...');
        }
      }

      // Proceed with normal auth check if no token in URL or if token was invalid
      let token = storage.getToken();
      // If no token in storage, try shared cookie
      if (!token && typeof window !== 'undefined') {
        token = getCookieToken() || '';
        if (token) {
          storage.setSession({ token });
        }
      }
      const hasToken = !!token;
      
      if (hasToken) {
        try {
          const result = await verify();
          if (!result.ok && result.status === 401) {
            throw new Error('Token verification failed (401)');
          }

          const u = await getProfile();
          if (u) {
            setUser(u);
            setIsLoggedIn(true);
            return;
          }

          // If profile load fails but token likely valid, keep logged-in state
          if (result.ok) {
            setIsLoggedIn(true);
            try { const raw = localStorage.getItem('user'); setUser(raw ? JSON.parse(raw) : null); } catch { setUser(null) }
            return;
          }

          // Network/CORS or temporary failure: keep session and mark logged in
          if (!result.ok && result.status !== 401) {
            console.warn('Verify failed due to network/CORS; keeping session.');
            setIsLoggedIn(true);
            try {
              const raw = localStorage.getItem('user');
              setUser(raw ? JSON.parse(raw) : null);
            } catch { setUser(null) }
            return;
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          storage.clearSession();
          clearCookieToken();
        }
      }
      
      // If we get here, either there's no token or verification failed
      setUser(null);
      setIsLoggedIn(false);
    };
    init();

    const onStorage = (e: StorageEvent) => {
      // Only process events for relevant keys
      if (!e.key || ["token", "authToken", "user", "isLoggedIn"].includes(e.key)) {
        const token = storage.getToken();
        const isLoggedIn = !!token && (localStorage.getItem("isLoggedIn") === "true");
        
        // Update the logged-in state
        setIsLoggedIn(isLoggedIn);
        
        // Update the user data
        try {
          const rawUser = localStorage.getItem("user");
          if (rawUser) {
            const user = JSON.parse(rawUser);
            setUser(user);
          } else if (!isLoggedIn) {
            // If not logged in, ensure user is null
            setUser(null);
          }
        } catch (error) {
          console.error('Error parsing user data from storage:', error);
          setUser(null);
        }
      }
    };
    
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    if (res?.success && res.token) {
      storage.setSession({ token: res.token, user: res.user, sessionId: res.sessionId, session: res.session });
      setCookieToken(res.token);
      setIsLoggedIn(true);
      if (res.user) setUser(res.user);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await apiLogout();
    setIsLoggedIn(false);
    setUser(null);
    clearCookieToken();
  };

  const refreshProfile = async () => {
    const u = await getProfile();
    if (u) {
      setUser(u);
      try { localStorage.setItem("user", JSON.stringify(u)); } catch {}
    }
  };

  const value = useMemo(() => ({ user, isLoggedIn, login, logout, refreshProfile }), [user, isLoggedIn]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
