import {create} from "zustand";

interface AuthState {
    user: any | null;
    token: string | null;
    login: (user: any, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: localStorage.getItem("token"),
    login: (user, token) => {
        localStorage.setItem("token", token);
        set({user, token});
    },
    logout: () => {
        localStorage.removeItem("token");
        set({user: null, token: null});
    }
}))