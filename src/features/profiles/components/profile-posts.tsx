"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthorPosts } from "@/features/posts/hooks/use-post";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/icon";

export function ProfilePosts({ uid }: { uid: string }) {
  const { data: posts, isLoading, error } = useAuthorPosts(uid);

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
    return (
      <EmptyState
        icon={<Icon.Flag size={22} />}
        title="Failed to load posts"
      />
    );
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
        <motion.div
          key={post.id}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.03, duration: 0.25 }}
        >
          <Link
            href={`/posts/${post.id}`}
            className="group relative block aspect-square overflow-hidden rounded-xl bg-surface-subtle"
          >
            <Image
              src={post.imageURL}
              alt={post.caption || "Post"}
              fill
              sizes="(max-width: 768px) 33vw, 240px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
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
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
