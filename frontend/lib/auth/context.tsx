"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { decodeToken, JwtPayload } from "./decode";
import { clearToken, getToken, setToken } from "./token";

type AuthContextType = {
  user: JwtPayload | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

function isTokenValid(payload: JwtPayload) {
  return payload.exp * 1000 > Date.now();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const token = getToken();

    if (token) {
      try {
        const decoded = decodeToken(token);
        if (isTokenValid(decoded)) {
          setUser(decoded);
        } else {
          clearToken();
        }
      } catch {
        clearToken();
      }
    }

    setIsHydrated(true);
  }, []);

  function login(token: string) {
    const decoded = decodeToken(token);
    if (!isTokenValid(decoded)) {
      clearToken();
      throw new Error("Invalid token");
    }
    setToken(token);
    setUser(decoded);
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user && isTokenValid(user),
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
