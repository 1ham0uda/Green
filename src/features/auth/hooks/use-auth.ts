"use client";

import { useCallback } from "react";
import { useAuthStore } from "@/store/auth-store";
import {
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  signUpWithEmail,
} from "../services/auth-service";
import type { SignInInput, SignUpInput } from "../types";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setError = useAuthStore((s) => s.setError);
  const setUser = useAuthStore((s) => s.setUser);

  const signUp = useCallback(
    async (input: SignUpInput) => {
      setLoading(true);
      setError(null);
      try {
        const profile = await signUpWithEmail(input);
        setUser(profile);
        return profile;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Sign up failed";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading, setUser]
  );

  const signIn = useCallback(
    async (input: SignInInput) => {
      setLoading(true);
      setError(null);
      try {
        const profile = await signInWithEmail(input);
        setUser(profile);
        return profile;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Sign in failed";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading, setUser]
  );

  const googleSignIn = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await signInWithGoogle();
      setUser(profile);
      return profile;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google sign in failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading, setUser]);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await signOutUser();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setUser]);

  return {
    user,
    initialized,
    loading,
    error,
    signUp,
    signIn,
    googleSignIn,
    signOut,
    isAuthenticated: Boolean(user),
  };
}
