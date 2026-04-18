"use client";

import Link from "next/link";
import { useState } from "react";
import { FeedList } from "@/features/posts/components/feed-list";
import { FollowingFeedList } from "@/features/posts/components/following-feed-list";
import { useAuth } from "@/features/auth/hooks/use-auth";

type Tab = "all" | "following";

export default function FeedPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("all");

  return (
    <main className="container max-w-2xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Feed</h1>
          <p className="text-sm text-zinc-500">
            Latest from gardeners across the community.
          </p>
        </div>
        <Link href="/posts/new" className="btn-primary">
          New post
        </Link>
      </div>

      {user && (
        <div className="mb-4 flex gap-0 border-b border-surface-border">
          {(["all", "following"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize ${
                tab === t
                  ? "border-b-2 border-brand-600 text-brand-600"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {t === "all" ? "For You" : "Following"}
            </button>
          ))}
        </div>
      )}

      {tab === "all" || !user ? <FeedList /> : <FollowingFeedList userId={user.uid} />}
    </main>
  );
}
