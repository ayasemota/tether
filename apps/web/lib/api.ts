// ==========================================
// TETHER - API Client
// ==========================================

const API_BASE_URL = "https://tether-huz3.onrender.com/api/v1";

// ==========================================
// Types
// ==========================================

export interface ApiUser {
  id: string;
  email: string;
  username: string;
  display_name: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  display_name: string;
}

export interface ApiError {
  detail: string;
}

// ==========================================
// API Response Types
// ==========================================

export interface LoginResponse extends AuthTokens {
  user: ApiUser;
}

export interface RegisterResponse {
  user: ApiUser;
  message: string;
}

// ==========================================
// Error Handling
// ==========================================

export class AuthApiError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = "An error occurred";
    try {
      const errorData = await response.json() as ApiError;
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new AuthApiError(errorMessage, response.status);
  }
  return response.json() as Promise<T>;
}

// ==========================================
// Token Storage
// ==========================================

const TOKEN_STORAGE_KEY = "tether-tokens";

export function getStoredTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null;
  try {
    const tokens = localStorage.getItem(TOKEN_STORAGE_KEY);
    return tokens ? JSON.parse(tokens) : null;
  } catch {
    return null;
  }
}

export function setStoredTokens(tokens: AuthTokens): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
}

export function clearStoredTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

// ==========================================
// API Client
// ==========================================

export const authApi = {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse<RegisterResponse>(response);
  },

  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await handleResponse<LoginResponse>(response);
    
    // Store tokens
    setStoredTokens({
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      token_type: result.token_type,
    });
    
    return result;
  },

  /**
   * Refresh the access token using the refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    const result = await handleResponse<AuthTokens>(response);
    setStoredTokens(result);
    return result;
  },

  /**
   * Get the current user's profile
   */
  async getMe(accessToken: string): Promise<ApiUser> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return handleResponse<ApiUser>(response);
  },

  /**
   * Send a password reset email
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/password-reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    return handleResponse<{ message: string }>(response);
  },
};
