"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonPostCard } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/icon";
import { useFeed } from "../hooks/use-feed";
import { PostCard } from "./post-card";

export function FeedList() {
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFeed();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonPostCard />
        <SkeletonPostCard />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<Icon.Flag size={22} />}
        title="Failed to load feed"
        description={error.message}
      />
    );
  }

  const posts = data?.pages.flatMap((page) => page.items) ?? [];

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={<Icon.Leaf size={22} />}
        title="No posts yet"
        description="Be the first to share something growing in your garden!"
      />
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <Button
            variant="secondary"
            onClick={() => void fetchNextPage()}
            isLoading={isFetchingNextPage}
          >
            Load more posts
          </Button>
        </div>
      )}
    </div>
  );
}
