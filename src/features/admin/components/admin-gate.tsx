"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";

export function AdminGate({ children }: { children: ReactNode }) {
  const { user, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && (!user || user.role !== "admin")) {
      router.replace("/");
    }
  }, [initialized, user, router]);

  if (!initialized) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-zinc-500">
        Checking permissions…
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return <>{children}</>;
}
