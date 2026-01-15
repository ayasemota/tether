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
import {
  authApi,
  AuthApiError,
  getStoredTokens,
  setStoredTokens,
  clearStoredTokens,
  ApiUser,
} from "@/lib/api";

const AUTH_STORAGE_KEY = "tether-auth";

interface AuthContextType extends AuthState {
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Convert API user to local User format
 */
function apiUserToUser(apiUser: ApiUser): User {
  // Parse display_name into first/last name
  const nameParts = apiUser.display_name.split(" ");
  const firstName = nameParts[0] || apiUser.username;
  const lastName = nameParts.slice(1).join(" ") || "";

  return {
    id: apiUser.id,
    firstName,
    lastName,
    username: apiUser.username,
    email: apiUser.email,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${apiUser.username}`,
    status: "online",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Initialize auth state from stored tokens
  useEffect(() => {
    setMounted(true);

    const initializeAuth = async () => {
      const tokens = getStoredTokens();

      if (tokens?.access_token) {
        try {
          // Try to get user profile with stored token
          const apiUser = await authApi.getMe(tokens.access_token);
          const user = apiUserToUser(apiUser);
          setAuthState({ isAuthenticated: true, user });
          localStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify({ isAuthenticated: true, user })
          );
        } catch (error) {
          // Token might be expired, try to refresh
          if (tokens.refresh_token) {
            try {
              const newTokens = await authApi.refreshToken(
                tokens.refresh_token
              );
              const apiUser = await authApi.getMe(newTokens.access_token);
              const user = apiUserToUser(apiUser);
              setAuthState({ isAuthenticated: true, user });
              localStorage.setItem(
                AUTH_STORAGE_KEY,
                JSON.stringify({ isAuthenticated: true, user })
              );
            } catch {
              // Refresh failed, clear everything
              clearStoredTokens();
              localStorage.removeItem(AUTH_STORAGE_KEY);
              setAuthState({ isAuthenticated: false, user: null });
            }
          } else {
            clearStoredTokens();
            localStorage.removeItem(AUTH_STORAGE_KEY);
            setAuthState({ isAuthenticated: false, user: null });
          }
        }
      } else {
        // Check for cached auth state (for faster initial render)
        try {
          const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
          if (savedAuth) {
            const parsed = JSON.parse(savedAuth);
            if (parsed.isAuthenticated && parsed.user) {
              setAuthState({ isAuthenticated: true, user: parsed.user });
            }
          }
        } catch {}
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const response = await authApi.login({ email, password });
        const user = apiUserToUser(response.user);

        setAuthState({ isAuthenticated: true, user });
        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({ isAuthenticated: true, user })
        );

        return { success: true };
      } catch (error) {
        if (error instanceof AuthApiError) {
          return { success: false, error: error.message };
        }
        return {
          success: false,
          error: "Failed to connect. Please try again.",
        };
      }
    },
    []
  );

  const signup = useCallback(
    async (
      username: string,
      firstName: string,
      lastName: string,
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const displayName = `${firstName} ${lastName}`.trim();

        // Register the user
        await authApi.register({
          email,
          password,
          username,
          display_name: displayName,
        });

        // Login after successful registration
        const loginResponse = await authApi.login({ email, password });
        const user = apiUserToUser(loginResponse.user);

        setAuthState({ isAuthenticated: true, user });
        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({ isAuthenticated: true, user })
        );

        return { success: true };
      } catch (error) {
        if (error instanceof AuthApiError) {
          return { success: false, error: error.message };
        }
        return {
          success: false,
          error: "Failed to create account. Please try again.",
        };
      }
    },
    []
  );

  const logout = useCallback(() => {
    clearStoredTokens();
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthState({ isAuthenticated: false, user: null });
  }, []);

  const value = useMemo(
    () => ({
      ...authState,
      login,
      signup,
      logout,
      isLoading,
    }),
    [authState, login, signup, logout, isLoading]
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
