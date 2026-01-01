import { create } from "zustand";
import type { AuthResponse } from "@/lib/api/auth";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role: string;
  status: string;
  emailVerified: boolean;
  storeId?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setAuthData: (data: AuthResponse) => void;
  updateUser: (userData: Partial<User>) => void;
  logout: () => void;
  initialize: () => void;
}

// Helper to format user name
function formatUserName(
  firstName?: string,
  lastName?: string,
  email?: string
): string {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  if (firstName) {
    return firstName;
  }
  if (lastName) {
    return lastName;
  }
  return email || "User";
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  setAuthData: (data: AuthResponse) => {
    const user: User = {
      id: data.user.id,
      email: data.user.email,
      firstName: data.user.firstName,
      lastName: data.user.lastName,
      name: formatUserName(
        data.user.firstName,
        data.user.lastName,
        data.user.email
      ),
      role: data.user.role,
      status: data.user.status,
      emailVerified: data.user.emailVerified,
      storeId: data.user.storeId,
    };
    // Store user data in localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
    }
    set({ user, isAuthenticated: true });
  },
  updateUser: (userData: Partial<User>) => {
    set((state) => {
      if (!state.user) return state;

      const updatedUser: User = {
        ...state.user,
        ...userData,
        name: formatUserName(
          userData.firstName !== undefined
            ? userData.firstName
            : state.user.firstName,
          userData.lastName !== undefined
            ? userData.lastName
            : state.user.lastName,
          state.user.email
        ),
      };

      // Store updated user data in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      return { user: updatedUser };
    });
  },
  logout: () => {
    // Clear localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // Clear all cookies
      const cookies = document.cookie.split(";");
      cookies.forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name =
          eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

        // Clear cookie for current path
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;

        // Also try to clear for parent paths
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
      });
    }
    set({ user: null, isAuthenticated: false });
  },
  initialize: async () => {
    // Check if user data exists in localStorage and restore auth state
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");

      if (accessToken) {
        if (storedUser) {
          try {
            // Restore user from localStorage
            const user = JSON.parse(storedUser);
            set({ user, isAuthenticated: true });
          } catch {
            // If parsing fails, try to fetch from API
            try {
              const { getCurrentUser } = await import("@/lib/api/user");
              const userData = await getCurrentUser();
              const user: User = {
                id: userData.id,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                name: formatUserName(
                  userData.firstName,
                  userData.lastName,
                  userData.email
                ),
                role: userData.role,
                status: userData.status,
                emailVerified: userData.emailVerified,
                storeId: userData.storeId,
              };
              localStorage.setItem("user", JSON.stringify(user));
              set({ user, isAuthenticated: true });
            } catch {
              // API call failed, clear everything
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("user");
              set({ user: null, isAuthenticated: false });
            }
          }
        } else {
          // Token exists but no user data - try to fetch from API
          try {
            const { getCurrentUser } = await import("@/lib/api/user");
            const userData = await getCurrentUser();
            const user: User = {
              id: userData.id,
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              name: formatUserName(
                userData.firstName,
                userData.lastName,
                userData.email
              ),
              role: userData.role,
              status: userData.status,
              emailVerified: userData.emailVerified,
              storeId: userData.storeId,
            };
            localStorage.setItem("user", JSON.stringify(user));
            set({ user, isAuthenticated: true });
          } catch {
            // API call failed, clear tokens
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            set({ user: null, isAuthenticated: false });
          }
        }
      } else {
        // No token
        set({ user: null, isAuthenticated: false });
      }
    }
  },
}));
