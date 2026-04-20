"use client";

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
  params: { postId: string };
}

export default function PostDetailPage({ params }: PageProps) {
  const { postId } = params;
  const { data: post, isLoading: postLoading } = usePostById(postId);
  const { data: comments, isLoading: commentsLoading } = useComments(postId);

  return (
    <main className="mx-auto w-full max-w-[640px] pb-24 md:pb-0">
      {postLoading && <SkeletonPostCard />}

      {!postLoading && !post && (
        <div className="px-4 pt-10">
          <EmptyState
            icon={<Icon.Flag size={22} />}
            title="Post not found"
            description="This post may have been deleted or never existed."
          />
        </div>
      )}

      {post && (
        <div>
          <PostCard post={post} />

          <section className="border-t border-surface-border px-4 py-5">
            <p className="eyebrow mb-4">
              {post.commentCount > 0 ? `${post.commentCount} comments` : "Comments"}
            </p>
            <CommentForm postId={post.id} postAuthorId={post.authorId} />

            {commentsLoading ? (
              <div className="mt-4 space-y-1">
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
