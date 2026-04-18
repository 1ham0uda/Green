"use client";

import { use } from "react";
import { CommentForm } from "@/features/posts/components/comment-form";
import { CommentList } from "@/features/posts/components/comment-list";
import { PostCard } from "@/features/posts/components/post-card";
import {
  useComments,
  usePostById,
} from "@/features/posts/hooks/use-comments";

interface PageProps {
  params: Promise<{ postId: string }>;
}

export default function PostDetailPage({ params }: PageProps) {
  const { postId } = use(params);
  const { data: post, isLoading: postLoading } = usePostById(postId);
  const { data: comments, isLoading: commentsLoading } = useComments(postId);

  return (
    <main className="container max-w-2xl py-8">
      {postLoading && <p className="text-sm text-zinc-500">Loading post…</p>}

      {!postLoading && !post && (
        <p className="text-sm text-zinc-500">This post doesn&apos;t exist.</p>
      )}

      {post && (
        <div className="space-y-6">
          <PostCard post={post} />

          <section className="card space-y-4 p-6">
            <h2 className="text-lg font-semibold text-zinc-900">Comments</h2>
            <CommentForm postId={post.id} />
            {commentsLoading ? (
              <p className="text-sm text-zinc-500">Loading comments…</p>
            ) : (
              <CommentList comments={comments ?? []} />
            )}
          </section>
        </div>
      )}
    </main>
  );
}
