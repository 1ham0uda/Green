import Link from "next/link";
import { GoogleButton } from "@/features/auth/components/google-button";
import { SignupForm } from "@/features/auth/components/signup-form";

export const metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Join Green</h1>
        <p className="text-sm text-zinc-500">
          Start tracking your plants and sharing with fellow gardeners.
        </p>
      </div>

      <SignupForm />

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-surface-border" />
        <span className="text-xs uppercase tracking-wider text-zinc-400">or</span>
        <span className="h-px flex-1 bg-surface-border" />
      </div>

      <GoogleButton label="Sign up with Google" />

      <p className="text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
