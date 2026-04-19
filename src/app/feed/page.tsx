"use client";

import Link from "next/link";
import { useState } from "react";
import { FeedList } from "@/features/posts/components/feed-list";
import { FollowingFeedList } from "@/features/posts/components/following-feed-list";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Tabs } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icon";

type Tab = "all" | "following";

export default function FeedPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("all");

  return (
    <main className="container max-w-2xl py-6 sm:py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-display-sm font-bold tracking-tight text-ink">
            Your feed
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Fresh from gardeners across the community.
          </p>
        </div>
        <Link
          href="/posts/new"
          className="btn-primary inline-flex items-center gap-1.5"
        >
          <Icon.Plus size={16} />
          <span className="hidden sm:inline">New post</span>
        </Link>
      </div>

      {user && (
        <div className="mb-6">
          <Tabs
            variant="pill"
            tabs={[
              { id: "all", label: "For You", icon: <Icon.Sparkle size={14} /> },
              { id: "following", label: "Following", icon: <Icon.Users size={14} /> },
            ]}
            active={tab}
            onChange={(id) => setTab(id as Tab)}
          />
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
