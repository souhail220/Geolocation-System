import { create } from "zustand";
import type { Role, User } from "@/types/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  role: Role | null;
  hydrate: () => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  role: null,
  hydrate: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("auth_token");
    const raw = localStorage.getItem("auth_user");
    if (token && raw) {
      try {
        const user = JSON.parse(raw) as User;
        set({ token, user, isAuthenticated: true, role: user.role });
      } catch {
        /* ignore */
      }
    }
  },
  login: (token, user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(user));
    }
    set({ token, user, isAuthenticated: true, role: user.role });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    }
    set({ token: null, user: null, isAuthenticated: false, role: null });
  },
  setUser: (user) => set({ user, role: user.role }),
}));
