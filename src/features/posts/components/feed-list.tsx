"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonPostCard } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/icon";
import { AdCard } from "@/features/ads/components/ad-card";
import { useAdsForFeed } from "@/features/ads/hooks/use-ads";
import { useFeed } from "../hooks/use-feed";
import { PostCard } from "./post-card";

const AD_INTERVAL = 5;

export function FeedList() {
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFeed();
  const { data: ads } = useAdsForFeed();

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
      {posts.map((post, i) => (
        <div key={post.id}>
          <PostCard post={post} />
          {ads && ads.length > 0 && (i + 1) % AD_INTERVAL === 0 && (
            <div className="mt-6">
              <AdCard ad={ads[Math.floor(i / AD_INTERVAL) % ads.length]} />
            </div>
          )}
        </div>
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
