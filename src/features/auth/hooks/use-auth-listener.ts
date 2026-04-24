"use client";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect } from "react";
import { firebaseAuth } from "@/lib/firebase/config";
import { useAuthStore } from "@/store/auth-store";
import { fetchOrCreateProfile } from "../services/auth-service";

export function useAuthListener(): void {
  const setUser        = useAuthStore((s) => s.setUser);
  const setInitialized = useAuthStore((s) => s.setInitialized);
  const setError       = useAuthStore((s) => s.setError);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setUser(null);
          return;
        }

        // Reject unverified accounts — sign them out silently
        if (!firebaseUser.emailVerified) {
          setUser(null);
          await signOut(firebaseAuth).catch(() => null);
          return;
        }

        const profile = await fetchOrCreateProfile(firebaseUser);
        setUser(profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Auth error");
        setUser(null);
      } finally {
        setInitialized(true);
      }
    });

    return () => unsubscribe();
  }, [setUser, setInitialized, setError]);
}
