import Link from "next/link";
import { GoogleButton } from "@/features/auth/components/google-button";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <p className="eyebrow mb-1">Green.</p>
        <h1 className="font-serif text-[26px] font-normal leading-tight tracking-[-0.02em] text-ink">
          Welcome back
        </h1>
        <p className="mt-1 font-sans text-[13px] text-ink-muted">
          Sign in to your Green account to continue.
        </p>
      </div>

      <LoginForm />

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-surface-border" />
        <span className="eyebrow">or</span>
        <span className="h-px flex-1 bg-surface-border" />
      </div>

      <GoogleButton />

      <p className="mt-5 text-center font-sans text-[13px] text-ink-muted">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-ink hover:opacity-75">
          Sign up
        </Link>
      </p>
    </div>
  );
}
