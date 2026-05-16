import { create } from "zustand";
import { User } from "@/types/auth";
import { ProgrammeType } from "@/types/nutrition";

const API_URL = "/auth";                       // DOCKER (dist servit de backend)

interface AuthState {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loadFromStorage: () => void;
  init: () => Promise<void>;
  updateProgramme: (programme: ProgrammeType | null) => Promise<void>;
}

const STORAGE_KEY = "auth.session";

export const useAuthStore = create<AuthState>((set, get) => ({
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

  init: async () => {

    //console.log("INIT RUNNING");

    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return;

    try{
      const { token } = JSON.parse(raw);
      if(!token) return;

      const res = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if(!res.ok) {
        localStorage.removeItem(STORAGE_KEY);
        set({ token: null, user: null });
        return;
      }

      const user = await res.json();
      set({ token, user });

    } catch {
      localStorage.removeItem(STORAGE_KEY);
      set({ token: null, user: null });
    }
  },

  updateProgramme: async (programme) => {
    const token = get().token;
    if (!token) return;

    const res = await fetch(`${API_URL}/programme`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ programme }),
    });

    if (!res.ok) {
      console.error("Failed to update programme");
      return;
    }

    const updatedUser = await res.json();

    // actualizăm userul în store + persistăm în localStorage
    set({ user: updatedUser });
    
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token, user: updatedUser })
    );
  },
}));
