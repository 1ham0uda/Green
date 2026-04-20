"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthorPosts } from "@/features/posts/hooks/use-post";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/icon";
import type { Post } from "@/features/posts/types";

interface ProfilePostsProps {
  uid: string;
  /** Pass true when the viewer is the post owner — shows pending/rejected posts with labels */
  isSelf?: boolean;
}

const STATUS_OVERLAY: Record<string, { label: string; className: string } | undefined> = {
  pending: { label: "Pending review", className: "bg-amber-500/80" },
  rejected: { label: "Rejected", className: "bg-red-600/80" },
};

export function ProfilePosts({ uid, isSelf = false }: ProfilePostsProps) {
  const { data: posts, isLoading, error } = useAuthorPosts(uid, {
    approvedOnly: !isSelf,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-1 sm:gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return <EmptyState icon={<Icon.Flag size={22} />} title="Failed to load posts" />;
  }

  if (!posts || posts.length === 0) {
    return (
      <EmptyState
        icon={<Icon.Leaf size={22} />}
        title="No posts yet"
        description="When this gardener shares their journey, you'll see it here."
      />
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2">
      {posts.map((post, i) => (
        <PostThumbnail key={post.id} post={post} index={i} isSelf={isSelf} />
      ))}
    </div>
  );
}

function PostThumbnail({
  post,
  index,
  isSelf,
}: {
  post: Post;
  index: number;
  isSelf: boolean;
}) {
  const overlay = isSelf ? STATUS_OVERLAY[post.status] : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
    >
      <Link
        href={`/posts/${post.id}`}
        className="group relative block aspect-square overflow-hidden rounded-xl bg-surface-subtle"
      >
        {post.imageURLs[0] ? (
          <Image
            src={post.imageURLs[0]}
            alt={post.caption || "Post"}
            fill
            sizes="(max-width: 768px) 33vw, 240px"
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
              post.status !== "approved" ? "opacity-60" : ""
            }`}
          />
        ) : (
          <div className="h-full w-full bg-surface-subtle" />
        )}

        {/* Multi-image badge */}
        {post.imageURLs.length > 1 && !overlay && (
          <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white">
            <Icon.ImagePlus size={11} />
          </span>
        )}

        {/* Status overlay for own posts */}
        {overlay && (
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center gap-1 ${overlay.className}`}
          >
            <Icon.Eye size={16} className="text-white" />
            <span className="px-1 text-center text-[10px] font-semibold leading-tight text-white">
              {overlay.label}
            </span>
          </div>
        )}

        {/* Hover stats — only show for approved */}
        {post.status === "approved" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex items-center gap-4 text-sm font-semibold text-white">
              <span className="flex items-center gap-1">
                <Icon.Heart size={18} />
                {post.likeCount}
              </span>
              <span className="flex items-center gap-1">
                <Icon.MessageCircle size={18} />
                {post.commentCount}
              </span>
            </div>
          </div>
        )}

        {/* Rejection reason tooltip */}
        {isSelf && post.status === "rejected" && post.rejectionReason && (
          <div className="absolute bottom-0 left-0 right-0 hidden bg-black/80 px-1.5 py-1 group-hover:block">
            <p className="text-[9px] leading-tight text-white line-clamp-2">
              {post.rejectionReason}
            </p>
          </div>
        )}
      </Link>
    </motion.div>
  );
}
