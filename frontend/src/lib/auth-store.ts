import { create } from "zustand";
import { User } from "@/types/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

const STORAGE_KEY = "auth.session";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,

  login: (token, user) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token, user })
    );
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ token: null, user: null });
  },

  loadFromStorage: () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const { token, user } = JSON.parse(raw);
      set({ token, user });
    } catch {
      /* ignore */
    }
  },
}));
