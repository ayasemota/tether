"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { User, AuthState } from "@/lib/types";
import { currentUser } from "@/lib/mockData";

const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL || "demo@tether.app";
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD || "demo123";
const AUTH_STORAGE_KEY = "tether-auth";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getInitialAuthState(): { authState: AuthState; isReady: boolean } {
  if (typeof window === "undefined") {
    return {
      authState: { isAuthenticated: false, user: null },
      isReady: false,
    };
  }

  try {
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedAuth) {
      const parsed = JSON.parse(savedAuth);
      if (parsed.isAuthenticated && parsed.user) {
        return {
          authState: { isAuthenticated: true, user: parsed.user },
          isReady: true,
        };
      }
    }
  } catch {}

  return { authState: { isAuthenticated: false, user: null }, isReady: true };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        if (savedAuth) {
          const parsed = JSON.parse(savedAuth);
          if (parsed.isAuthenticated && parsed.user) {
            return { isAuthenticated: true, user: parsed.user };
          }
        }
      } catch {}
    }
    return { isAuthenticated: false, user: null };
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (authState.isAuthenticated) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, [authState, mounted]);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (
        (email === DEMO_EMAIL && password === DEMO_PASSWORD) ||
        (email.includes("@") && password.length >= 1)
      ) {
        const user: User = {
          ...currentUser,
          firstName: email.split("@")[0],
          lastName: "",
          username: email.split("@")[0].toLowerCase().replace(/\s/g, ""),
        };
        setAuthState({ isAuthenticated: true, user });
        return true;
      }

      return false;
    },
    []
  );

  const signup = useCallback(
    async (
      firstName: string,
      lastName: string,
      email: string,
      password: string
    ): Promise<boolean> => {
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (
        firstName &&
        lastName &&
        email.includes("@") &&
        password.length >= 1
      ) {
        const user: User = {
          ...currentUser,
          firstName,
          lastName,
          username: `${firstName}${lastName}`.toLowerCase().replace(/\s/g, ""),
        };
        setAuthState({ isAuthenticated: true, user });
        return true;
      }

      return false;
    },
    []
  );

  const logout = useCallback(() => {
    setAuthState({ isAuthenticated: false, user: null });
  }, []);

  const value = useMemo(
    () => ({
      ...authState,
      login,
      signup,
      logout,
    }),
    [authState, login, signup, logout]
  );

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-foreground-muted">Loading...</div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
