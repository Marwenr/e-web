// API Configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

/**
 * Clear all cookies for the current domain
 */
function clearAllCookies(): void {
  if (typeof window === "undefined") return;

  // Get all cookies
  const cookies = document.cookie.split(";");
  const hostname = window.location.hostname;
  const paths = ["/", window.location.pathname];

  // Clear each cookie by setting it to expire in the past
  cookies.forEach((cookie) => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

    if (!name) return;

    // Clear cookie for different paths and domains
    paths.forEach((path) => {
      // Current domain
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path}`;
      // With domain
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};domain=${hostname}`;
      // With dot prefix domain
      if (hostname.indexOf(".") !== -1) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};domain=.${hostname}`;
      }
    });
  });
}

/**
 * Clear authentication data and disconnect user
 */
async function clearAuthAndDisconnect(): Promise<void> {
  if (typeof window === "undefined") return;

  // Clear localStorage
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  // Clear all cookies
  clearAllCookies();

  // Call logout from auth store to disconnect
  try {
    const { useAuthStore } = await import("@/store/auth");
    useAuthStore.getState().logout();
  } catch (error) {
    // If import fails, just continue
    console.error("Failed to call logout from auth store:", error);
  }
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
    code: string;
  };
}

export class ApiError extends Error {
  code: string;
  statusCode?: number;
  isSilentLogout?: boolean;

  constructor(
    message: string,
    code: string,
    statusCode?: number,
    isSilentLogout?: boolean
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = statusCode;
    this.isSilentLogout = isSilentLogout;
  }
}

/**
 * Check if an error is a silent logout (token expired)
 * This should not be displayed to the user
 */
export function isSilentLogoutError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message === "TOKEN_EXPIRED_SILENT_LOGOUT" ||
      (error instanceof ApiError && error.isSilentLogout === true)
    );
  }
  return false;
}

// Helper function to handle API responses
export async function handleApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    // Check if it's a 401 token expiration - handle silently
    if (response.status === 401) {
      const errorMessage = data.error?.message || data.message || "";
      const isTokenExpired =
        errorMessage.toLowerCase().includes("expired") ||
        errorMessage.toLowerCase().includes("token has expired");

      if (isTokenExpired && typeof window !== "undefined") {
        // Clear auth and redirect silently
        await clearAuthAndDisconnect();

        if (!window.location.pathname.includes("/auth/login")) {
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = `/auth/login?redirect=${encodeURIComponent(
            currentPath
          )}`;
        }

        // Throw silent logout error that won't be displayed
        throw new Error("TOKEN_EXPIRED_SILENT_LOGOUT");
      }
    }

    throw new ApiError(
      data.error?.message || data.message || "An error occurred",
      data.error?.code || "API_ERROR",
      response.status
    );
  }

  if (data.success && data.data) {
    return data.data;
  }

  return data;
}

// Helper function to get auth headers
export function getAuthHeaders(
  includeContentType: boolean = true
): HeadersInit {
  // On server-side, we don't have access to localStorage
  // So we only add auth token on client-side
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const headers: HeadersInit = {};

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

// Flag to prevent multiple simultaneous token refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

/**
 * Fetch with automatic token refresh on 401 errors
 * This wrapper handles token expiration by automatically refreshing and retrying the request
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {},
  skipAuth = false
): Promise<Response> {
  // If skipAuth is true or we're on server-side, use regular fetch
  if (skipAuth || typeof window === "undefined") {
    return fetch(url, options);
  }

  // Determine if we should include Content-Type (only for requests with body)
  const method = (options.method || "GET").toUpperCase();
  const hasBody = options.body !== undefined && options.body !== null;
  const includeContentType =
    hasBody && (method === "POST" || method === "PUT" || method === "PATCH");

  // Merge auth headers into the request options for the initial request
  const authHeaders = getAuthHeaders(includeContentType);
  const mergedHeaders = new Headers(options.headers as HeadersInit);
  Object.entries(authHeaders).forEach(([key, value]) => {
    if (value) {
      mergedHeaders.set(key, value as string);
    }
  });

  // Make the initial request with auth headers
  let response = await fetch(url, {
    ...options,
    headers: mergedHeaders,
    credentials: options.credentials || "include",
  });

  // If we get a 401 and this is not a refresh token request, try to refresh token
  if (
    response.status === 401 &&
    !url.includes("/auth/refresh") &&
    !url.includes("/auth/login")
  ) {
    // Check if we're already refreshing
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = attemptTokenRefresh();
    }

    // Wait for refresh to complete
    if (refreshPromise) {
      try {
        await refreshPromise;

        // Retry the original request with new token
        const newAuthHeaders = getAuthHeaders(includeContentType);
        // Merge headers properly - handle both Headers object and plain object
        const retryHeaders = new Headers(options.headers as HeadersInit);
        Object.entries(newAuthHeaders).forEach(([key, value]) => {
          if (value) {
            retryHeaders.set(key, value as string);
          }
        });

        response = await fetch(url, {
          ...options,
          headers: retryHeaders,
          credentials: options.credentials || "include",
        });

        // If retry still returns 401, the refresh didn't work or token is still invalid
        if (response.status === 401) {
          // Clear cookies and disconnect user (silent logout)
          await clearAuthAndDisconnect();

          // Redirect to login silently without throwing error
          if (
            typeof window !== "undefined" &&
            !window.location.pathname.includes("/auth/login")
          ) {
            const currentPath =
              window.location.pathname + window.location.search;
            window.location.href = `/auth/login?redirect=${encodeURIComponent(
              currentPath
            )}`;
            // Return a rejected promise that won't be caught/displayed
            return Promise.reject(new Error("TOKEN_EXPIRED_SILENT_LOGOUT"));
          }
          // If already on login page, just return a rejected promise silently
          return Promise.reject(new Error("TOKEN_EXPIRED_SILENT_LOGOUT"));
        }
      } catch {
        // Refresh failed - clear cookies and disconnect user (silent logout)
        await clearAuthAndDisconnect();

        // Redirect to login silently without throwing error
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/auth/login")
        ) {
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = `/auth/login?redirect=${encodeURIComponent(
            currentPath
          )}`;
          // Return a rejected promise that won't be caught/displayed
          return Promise.reject(new Error("TOKEN_EXPIRED_SILENT_LOGOUT"));
        }
        // If already on login page, just return a rejected promise silently
        return Promise.reject(new Error("TOKEN_EXPIRED_SILENT_LOGOUT"));
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    }
  }

  return response;
}

/**
 * Attempt to refresh the access token
 */
async function attemptTokenRefresh(): Promise<void> {
  const refreshToken =
    typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
      credentials: "include",
    });

    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = "Token refresh failed";
      try {
        const errorData = await response.json();
        errorMessage =
          errorData.error?.message || errorData.message || errorMessage;
      } catch {
        // If we can't parse error, use default message
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Handle both response formats: { success: true, data: {...} } or direct data
    let tokens;
    if (data.success && data.data) {
      tokens = data.data;
    } else if (data.accessToken) {
      tokens = data;
    } else {
      throw new Error("Token refresh failed - invalid response format");
    }

    // Validate that we have access token
    if (!tokens.accessToken) {
      throw new Error("Token refresh failed - no access token in response");
    }

    // Store new tokens
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", tokens.accessToken);
      if (tokens.refreshToken) {
        localStorage.setItem("refreshToken", tokens.refreshToken);
      }
    }
  } catch (error) {
    // Re-throw with more context
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Token refresh failed");
  }
}
