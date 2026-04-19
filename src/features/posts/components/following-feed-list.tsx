"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonPostCard } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/icon";
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
        icon={<Icon.Users size={22} />}
        title="Your feed is empty"
        description="Follow other gardeners to see their posts in this feed."
        action={
          <Link href="/search" className="btn-primary">
            Discover gardeners
          </Link>
        }
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
