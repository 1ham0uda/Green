"use client";

import Link from "next/link";
import { useState } from "react";
import { FeedList } from "@/features/posts/components/feed-list";
import { FollowingFeedList } from "@/features/posts/components/following-feed-list";
import { StoryBar } from "@/features/stories/components/story-bar";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Icon } from "@/components/ui/icon";

type Tab = "all" | "following";

export default function FeedPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("all");

  return (
    <main className="mx-auto w-full max-w-[640px] pb-24 md:pb-0">
      {/* Eyebrow header */}
      <div className="flex items-center justify-between px-4 pb-3 pt-5">
        <div>
          <p className="eyebrow">Community</p>
          <h1 className="font-serif text-[28px] font-normal leading-tight tracking-[-0.02em] text-ink">
            Your Feed
          </h1>
        </div>
        <Link
          href="/posts/new"
          className="btn-primary btn-sm flex items-center gap-1.5"
        >
          <Icon.Plus size={14} />
          Post
        </Link>
      </div>

      <StoryBar />

      {user && (
        <div className="mb-0 flex gap-0 border-b border-surface-border px-4">
          {(["all", "following"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={[
                "relative pb-3 pt-2 font-sans text-[13px] font-medium transition-colors",
                t === "all" ? "mr-6" : "",
                tab === t ? "text-ink" : "text-ink-subtle hover:text-ink-muted",
              ].join(" ")}
            >
              {t === "all" ? "For You" : "Following"}
              {tab === t && (
                <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-ink" />
              )}
            </button>
          ))}
        </div>
      )}

      {tab === "all" || !user ? (
        <FeedList />
      ) : (
        <FollowingFeedList userId={user.uid} />
      )}
    </main>
  );
}
