"use client";

import { useAuthorPosts } from "@/features/posts/hooks/use-post";
import { PostCard } from "@/features/posts/components/post-card";

export function ProfilePosts({ uid }: { uid: string }) {
  const { data: posts, isLoading, error } = useAuthorPosts(uid);

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Loading posts…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">Failed to load posts.</p>;
  }

  if (!posts || posts.length === 0) {
    return (
      <p className="text-sm text-zinc-500">No posts yet.</p>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
