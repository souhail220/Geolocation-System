import { create } from "zustand";
import type { Role, User } from "@/types/auth";
import {
  clearStoredAuthSession,
  getStoredAuthToken,
  getStoredUser,
  storeAuthSession,
} from "@/lib/authStorage";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  role?: Role | null;
  hydrate: () => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  hydrate: () => {
    const token = getStoredAuthToken();
    const user = getStoredUser();

    if (token && user) {
      set({ token, user, isAuthenticated: true, role: user.role });
    }
  },
  login: (token, user) => {
    storeAuthSession(token, user);
    set({ token, user, isAuthenticated: true, role: user.role });
  },
  logout: () => {
    clearStoredAuthSession();
    set({ token: null, user: null, isAuthenticated: false, role: null });
  },
  setUser: (user) => set({ user, role: user.role }),
}));
