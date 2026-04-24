import Link from "next/link";
import { SignupForm } from "@/features/auth/components/signup-form";

export const metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <p className="eyebrow mb-1">Green.</p>
        <h1 className="font-serif text-[26px] font-normal leading-tight tracking-[-0.02em] text-ink">
          Join Green
        </h1>
        <p className="mt-1 font-sans text-[13px] text-ink-muted">
          Start tracking your plants and sharing with fellow gardeners.
        </p>
      </div>

      <SignupForm />

      <p className="mt-5 text-center font-sans text-[13px] text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-ink hover:opacity-75">
          Sign in
        </Link>
      </p>
    </div>
  );
}
