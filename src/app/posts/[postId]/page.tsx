"use client";

import { use } from "react";
import { CommentForm } from "@/features/posts/components/comment-form";
import { CommentList } from "@/features/posts/components/comment-list";
import { PostCard } from "@/features/posts/components/post-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonPostCard, SkeletonRow } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/icon";
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
    <main className="container max-w-2xl py-6 sm:py-10">
      {postLoading && <SkeletonPostCard />}

      {!postLoading && !post && (
        <EmptyState
          icon={<Icon.Flag size={22} />}
          title="Post not found"
          description="This post may have been deleted or never existed."
        />
      )}

      {post && (
        <div className="space-y-6">
          <PostCard post={post} />

          <section className="card space-y-5 p-6">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-ink">Comments</h2>
              <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-xs font-medium text-ink-muted">
                {post.commentCount}
              </span>
            </div>
            <CommentForm postId={post.id} postAuthorId={post.authorId} />

            {commentsLoading ? (
              <div className="space-y-1 pt-2">
                <SkeletonRow />
                <SkeletonRow />
              </div>
            ) : (
              <CommentList comments={comments ?? []} />
            )}
          </section>
        </div>
      )}
    </main>
  );
}
