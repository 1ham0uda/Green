"use client";

import { useCallback } from "react";
import { useAuthStore } from "@/store/auth-store";
import {
  resendVerificationEmail,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
} from "../services/auth-service";
import type { SignInInput, SignUpInput } from "../types";

export function useAuth() {
  const user         = useAuthStore((s) => s.user);
  const initialized  = useAuthStore((s) => s.initialized);
  const loading      = useAuthStore((s) => s.loading);
  const error        = useAuthStore((s) => s.error);
  const setLoading   = useAuthStore((s) => s.setLoading);
  const setError     = useAuthStore((s) => s.setError);
  const setUser      = useAuthStore((s) => s.setUser);

  const signUp = useCallback(
    async (input: SignUpInput) => {
      setLoading(true);
      setError(null);
      try {
        const profile = await signUpWithEmail(input);
        // Do NOT call setUser — user must verify email before being authenticated
        return profile;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Sign up failed";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading]
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

  const resendVerification = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        await resendVerificationEmail(email, password);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to resend";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading]
  );

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
    resendVerification,
    signOut,
    isAuthenticated: Boolean(user),
  };
}
