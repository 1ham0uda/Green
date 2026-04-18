import Link from "next/link";
import { GoogleButton } from "@/features/auth/components/google-button";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Welcome back</h1>
        <p className="text-sm text-zinc-500">
          Sign in to your Green account to continue.
        </p>
      </div>

      <LoginForm />

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-surface-border" />
        <span className="text-xs uppercase tracking-wider text-zinc-400">or</span>
        <span className="h-px flex-1 bg-surface-border" />
      </div>

      <GoogleButton />

      <p className="text-center text-sm text-zinc-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-brand-700 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
