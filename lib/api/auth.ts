import {
  API_BASE_URL,
  handleApiResponse,
  apiFetch,
  ApiError,
} from "./config";

export interface LoginCredentials {
  email: string;
  password: string;
  storeId?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  storeId?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    status: string;
    emailVerified: boolean;
    storeId?: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Store tokens in localStorage
function storeTokens(accessToken: string, refreshToken: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }
}

// Remove tokens from localStorage
export function clearTokens(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
}

// Get stored tokens
export function getTokens(): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  if (typeof window !== "undefined") {
    return {
      accessToken: localStorage.getItem("accessToken"),
      refreshToken: localStorage.getItem("refreshToken"),
    };
  }
  return { accessToken: null, refreshToken: null };
}

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include", // REQUIRED for CORS with credentials
    });

    const result = await handleApiResponse<AuthResponse>(response);

    // Store tokens
    storeTokens(result.tokens.accessToken, result.tokens.refreshToken);

    return result;
  } catch (error) {
    if (error instanceof Error) {
      const apiError: ApiError = {
        message: error.message,
        code: "REGISTRATION_ERROR",
      };
      throw apiError;
    }
    throw error;
  }
}

/**
 * Login user
 */
export async function login(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      credentials: "include", // REQUIRED for CORS with credentials
    });

    const result = await handleApiResponse<AuthResponse>(response);

    // Store tokens
    storeTokens(result.tokens.accessToken, result.tokens.refreshToken);

    return result;
  } catch (error) {
    if (error instanceof Error) {
      const apiError: ApiError = {
        message: error.message,
        code: "LOGIN_ERROR",
      };
      throw apiError;
    }
    throw error;
  }
}

/**
 * Refresh access token
 */
export async function refreshToken(): Promise<RefreshTokenResponse> {
  try {
    const { refreshToken: storedRefreshToken } = getTokens();

    if (!storedRefreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken: storedRefreshToken }),
      credentials: "include", // REQUIRED for CORS with credentials
    });

    const result = await handleApiResponse<RefreshTokenResponse>(response);

    // Store new tokens
    storeTokens(result.accessToken, result.refreshToken);

    return result;
  } catch (error) {
    // Clear tokens on refresh failure
    clearTokens();
    throw error;
  }
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    const { refreshToken: storedRefreshToken } = getTokens();

    if (storedRefreshToken) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
        credentials: "include", // REQUIRED for CORS with credentials
      });
    }
  } catch (error) {
    // Continue with logout even if API call fails
    console.error("Logout error:", error);
  } finally {
    // Always clear tokens
    clearTokens();
  }
}

/**
 * Logout from all devices
 */
export async function logoutAll(): Promise<void> {
  try {
    const response = await apiFetch(`${API_BASE_URL}/auth/logout-all`, {
      method: "POST",
      credentials: "include", // REQUIRED for CORS with credentials
    });

    await handleApiResponse(response);
    clearTokens();
  } catch (error) {
    throw error;
  }
}

/**
 * Forgot password - request reset link
 */
export async function forgotPassword(
  email: string
): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
      credentials: "include", // REQUIRED for CORS with credentials
    });

    return await handleApiResponse<{ message: string }>(response);
  } catch (error) {
    throw error;
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, newPassword }),
      credentials: "include", // REQUIRED for CORS with credentials
    });

    return await handleApiResponse<{ message: string }>(response);
  } catch (error) {
    throw error;
  }
}

/**
 * Change password (authenticated)
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> {
  try {
    const response = await apiFetch(`${API_BASE_URL}/auth/change-password`, {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
      credentials: "include", // REQUIRED for CORS with credentials
    });

    return await handleApiResponse<{ message: string }>(response);
  } catch (error) {
    throw error;
  }
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
      credentials: "include", // REQUIRED for CORS with credentials
    });

    return await handleApiResponse<{ message: string }>(response);
  } catch (error) {
    throw error;
  }
}

/**
 * Resend email verification
 */
export async function resendVerification(
  email: string
): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
      credentials: "include", // REQUIRED for CORS with credentials
    });

    return await handleApiResponse<{ message: string }>(response);
  } catch (error) {
    throw error;
  }
}
