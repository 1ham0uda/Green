"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { CartLink } from "./cart-link";

export function NavBar() {
  const { user, signOut, initialized } = useAuth();

  return (
    <header className="border-b border-surface-border bg-white">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-brand-700">
          Green
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          <Link href="/feed" className="text-zinc-600 hover:text-zinc-900">
            Feed
          </Link>
          <Link href="/plants" className="text-zinc-600 hover:text-zinc-900">
            Plants
          </Link>
          <Link href="/competitions" className="text-zinc-600 hover:text-zinc-900">
            Competitions
          </Link>
          <Link href="/marketplace" className="text-zinc-600 hover:text-zinc-900">
            Marketplace
          </Link>
          {user && <CartLink />}

          {!initialized ? (
            <span className="text-xs text-zinc-400">…</span>
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link
                href={`/u/${user.handle}`}
                className="text-zinc-800 hover:text-brand-700"
              >
                @{user.handle}
              </Link>
              <button
                type="button"
                onClick={() => void signOut()}
                className="btn-secondary"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-secondary">
                Sign in
              </Link>
              <Link href="/signup" className="btn-primary">
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
