import {create} from "zustand";

interface AuthState {
    user: any | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: any, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: localStorage.getItem("token"),
    isAuthenticated: !!localStorage.getItem("token"),
    login: (user, token) => {
        localStorage.setItem("token", token);
        set({user, token, isAuthenticated: true});
    },
    logout: () => {
        localStorage.removeItem("token");
        set({user: null, token: null, isAuthenticated: false});
    }
}))