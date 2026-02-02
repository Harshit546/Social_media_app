import { create } from "zustand";

/**
 * Interface for the Auth state and actions
 */
interface AuthState {
  user: any | null;                // Current user object
  token: string | null;            // JWT token
  isAuthenticated: boolean;        // True if logged in
  login: (user: any, token: string) => void;  // Login action
  logout: () => void;                        // Logout action
}

/**
 * Zustand store for authentication
 * Handles:
 * - Storing user info and token
 * - Persisting token in localStorage
 * - Updating authentication state
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,                                      // Default user is null
  token: localStorage.getItem("token"),            // Load token from localStorage
  isAuthenticated: !!localStorage.getItem("token"), // True if token exists

  /**
   * Login action
   * @param user - User object from backend
   * @param token - JWT token
   */
  login: (user, token) => {
    localStorage.setItem("token", token);          // Persist token
    set({ user, token, isAuthenticated: true });   // Update state
  },

  /**
   * Logout action
   * Clears token and resets auth state
   */
  logout: () => {
    localStorage.removeItem("token");              // Remove token
    set({ user: null, token: null, isAuthenticated: false }); // Reset state
  }
}));
