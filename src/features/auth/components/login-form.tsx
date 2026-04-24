"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "../hooks/use-auth";
import { Icon } from "@/components/ui/icon";

export function LoginForm() {
  const { signIn, resendVerification, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setUnverified(false);
    try {
      await signIn({ email, password });
      router.push("/feed");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign in failed";
      if (msg === "EMAIL_NOT_VERIFIED") {
        setUnverified(true);
      } else {
        setError(msg);
      }
    }
  }

  async function handleResend() {
    setError(null);
    try {
      await resendVerification(email, password);
      setResendSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-zinc-800">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => { setEmail(e.target.value); setUnverified(false); setError(null); }}
          className="input"
        />
      </div>

      {/* Password */}
      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium text-zinc-800">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPw ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input pr-10"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPw((v) => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-600"
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? <Icon.EyeOff size={16} /> : <Icon.Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Unverified email state */}
      {unverified && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
          <div className="flex items-start gap-2">
            <Icon.Mail size={16} className="mt-0.5 flex-shrink-0 text-amber-600" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-800">Email not verified</p>
              <p className="text-xs text-amber-700">
                Please check your inbox and click the verification link before signing in.
              </p>
            </div>
          </div>
          {resendSent ? (
            <p className="text-xs font-medium text-brand-700">
              ✓ Verification email resent. Check your inbox.
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="text-xs font-medium text-amber-800 underline hover:no-underline disabled:opacity-50"
            >
              Resend verification email
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
