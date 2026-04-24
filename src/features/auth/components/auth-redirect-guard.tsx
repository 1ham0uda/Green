"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/use-auth";

export function AuthRedirectGuard() {
  const { initialized, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && isAuthenticated) {
      router.replace("/feed");
    }
  }, [initialized, isAuthenticated, router]);

  return null;
}
