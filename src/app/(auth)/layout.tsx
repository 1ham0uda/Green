import type { ReactNode } from "react";
import { AuthRedirectGuard } from "@/features/auth/components/auth-redirect-guard";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="container flex min-h-[calc(100vh-3.5rem)] items-center justify-center py-10">
      <AuthRedirectGuard />
      <div className="w-full max-w-sm">
        <div className="rounded-3xl border border-surface-border bg-surface p-8 shadow-card">
          {children}
        </div>
      </div>
    </main>
  );
}
