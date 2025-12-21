"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiFetch } from "@/lib/api/client";


type JwtPayload = {
  id: string;
  email: string;
  role: "BUYER" | "SELLER" | "ADMIN";
};

type AuthContextType = {
  user: JwtPayload | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);



export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await apiFetch("/auth/me");
        setUser(user as JwtPayload);
      } catch {
        setUser(null);
      } finally {
        setIsHydrated(true);
      }
    }
    fetchUser();
  }, []);

  async function login() {
    // After login, re-fetch user from backend /auth/me
    setIsHydrated(false);
    await new Promise((r) => setTimeout(r, 200)); // allow cookie to propagate
    try {
      const user = await apiFetch("/auth/me");
      setUser(user as JwtPayload);
    } catch {
      setUser(null);
    } finally {
      setIsHydrated(true);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isHydrated,
      login,
      logout,
    }),
    [user, isHydrated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
