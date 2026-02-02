import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

/**
 * Props for ProtectedRoute
 * `children` represents the component tree that should be protected
 */
interface ProtectedRouteProps {
    children: JSX.Element;
}

/**
 * ProtectedRoute
 * Guards private routes by checking authentication state.
 *
 * - If user is authenticated → render protected content
 * - If user is NOT authenticated → redirect to login page
 *
 * This component should wrap any route that requires authentication.
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    /**
     * Read authentication state from Zustand store
     * Using `isAuthenticated` is preferred over checking token directly because it represents intent, not implementation detail.
     */
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    /**
     * Redirect unauthenticated users to login page
     * `replace` prevents going back to protected route using browser back button
     */
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    /**
     * Render protected content when authenticated
     */
    return children;
};
