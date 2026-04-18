"use client";

import { useFollowingFeed } from "../hooks/use-following-feed";
import { PostCard } from "./post-card";

export function FollowingFeedList({ userId }: { userId: string }) {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFollowingFeed(userId);

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Loading feed…</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-red-600" role="alert">
        Failed to load feed: {error.message}
      </p>
    );
  }

  const posts = data?.pages.flatMap((page) => page.items) ?? [];

  if (posts.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-zinc-500">
          Follow some gardeners to see their posts here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {hasNextPage && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => void fetchNextPage()}
            disabled={isFetchingNextPage}
            className="btn-secondary"
          >
            {isFetchingNextPage ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
