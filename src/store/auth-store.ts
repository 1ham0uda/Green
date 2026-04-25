"use client";

import { create } from "zustand";
import type { UserProfile } from "@/features/auth/types";

// Middleware reads these cookies to decide whether to redirect before React
// hydrates. They do NOT grant any data access — Firestore rules enforce that.
// Max-age matches Firebase Auth token refresh interval (1 hour).
const SESSION_COOKIE = "__session";
const ROLE_COOKIE = "__session_role";
const COOKIE_MAX_AGE = 3600;

const IS_SECURE = typeof location !== "undefined" && location.protocol === "https:";
const SECURE_FLAG = IS_SECURE ? "; Secure" : "";

function setSessionCookies(user: UserProfile | null) {
  if (user) {
    document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Strict${SECURE_FLAG}`;
    document.cookie = `${ROLE_COOKIE}=${user.role}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Strict${SECURE_FLAG}`;
  } else {
    document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Strict${SECURE_FLAG}`;
    document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0; SameSite=Strict${SECURE_FLAG}`;
  }
}

interface AuthState {
  user: UserProfile | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;
  setUser: (user: UserProfile | null) => void;
  setInitialized: (initialized: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initialized: false,
  loading: false,
  error: null,
  setUser: (user) => {
    setSessionCookies(user);
    set({ user });
  },
  setInitialized: (initialized) => set({ initialized }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => {
    setSessionCookies(null);
    set({ user: null, loading: false, error: null, initialized: true });
  },
}));
