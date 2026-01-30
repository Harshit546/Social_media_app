import { jwtDecode } from "jwt-decode";

export const getCurrentUser = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        return jwtDecode<{
            id: string;
            email: string;
            role?: string;
        }>(token);
    } catch {
        console.error("Invalid token");
        localStorage.removeItem("token");
        return null;
    }
};
