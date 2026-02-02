import { jwtDecode } from "jwt-decode";

/**
 * Shape of JWT payload used in the app
 */
interface JwtPayload {
  id: string;
  email: string;
  role?: string;
  exp?: number; // Token expiry (seconds since epoch)
}

/**
 * Returns the currently authenticated user from JWT token
 *
 * Flow:
 * 1. Read token from localStorage
 * 2. Decode token safely
 * 3. Optionally check expiration
 * 4. Return decoded user payload or null
 */
export const getCurrentUser = (): JwtPayload | null => {
  const token = localStorage.getItem("token");

  // No token → user is not logged in
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    // Optional: Check token expiration (recommended)
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      console.warn("Token expired");
      localStorage.removeItem("token");
      return null;
    }

    return decoded;
  } catch (error) {
    // Token is invalid or malformed
    console.error("Invalid token", error);
    localStorage.removeItem("token");
    return null;
  }
};
