"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { PostCard } from "@/features/posts/components/post-card";
import { useSavedPosts } from "@/features/posts/hooks/use-saved-posts";
import { Icon } from "@/components/ui/icon";

export default function SavedPage() {
  const { user } = useAuth();
  const { data: posts, isLoading } = useSavedPosts(user?.uid);

  if (!user) {
    return (
      <div className="container max-w-lg py-20 text-center">
        <p className="text-ink-muted">Sign in to view your saved posts.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-lg py-6">
      <h1 className="font-serif text-[22px] font-normal text-ink mb-6 px-1">Saved</h1>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="post-card animate-pulse">
              <div className="flex items-center gap-3 px-4 py-4">
                <div className="h-9 w-9 rounded-full bg-surface-subtle" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-24 rounded bg-surface-subtle" />
                  <div className="h-2.5 w-16 rounded bg-surface-subtle" />
                </div>
              </div>
              <div className="h-72 bg-surface-subtle" style={{ aspectRatio: "4/5" }} />
            </div>
          ))}
        </div>
      )}

      {!isLoading && posts?.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-subtle">
            <Icon.Bookmark size={24} className="text-ink-muted" />
          </div>
          <p className="font-medium text-ink">No saved posts yet</p>
          <p className="text-sm text-ink-muted">Tap the bookmark on any post to save it here.</p>
        </div>
      )}

      {!isLoading && posts && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
