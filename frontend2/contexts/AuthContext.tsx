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

  useEffect(() => {
    const init = async () => {
      // Check for token in URL first
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');
        
        if (tokenFromUrl) {
          // Store the token from URL
          storage.setSession({ token: tokenFromUrl });
          // Clean up the URL
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        }
      }

      // Proceed with normal auth check
      const has = !!storage.getToken();
      setIsLoggedIn(has);
      
      if (has) {
        const ok = await verify();
        if (!ok) {
          storage.clearSession();
          setIsLoggedIn(false);
          setUser(null);
          return;
        }
        const u = await getProfile();
        if (u) setUser(u);
      }
    };
    init();

    const onStorage = (e: StorageEvent) => {
      if (!e.key || ["token", "authToken", "user", "isLoggedIn"].includes(e.key)) {
        const tok = storage.getToken();
        setIsLoggedIn(!!tok && (localStorage.getItem("isLoggedIn") === "true"));
        try {
          const raw = localStorage.getItem("user");
          setUser(raw ? JSON.parse(raw) : null);
        } catch {
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
