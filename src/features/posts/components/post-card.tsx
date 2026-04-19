"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { LikeButton } from "./like-button";
import { VerificationBadge } from "@/features/verification/components/verification-badge";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import type { Post } from "../types";

function formatRelative(post: Post): string {
  if (!post.createdAt) return "";
  const date = post.createdAt.toDate();
  const diff = Date.now() - date.getTime();
  const min = Math.round(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function PostCard({ post }: { post: Post }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
      className="card overflow-hidden transition-shadow hover:shadow-elevated"
    >
      <header className="flex items-center justify-between p-4">
        <Link
          href={`/u/${post.authorHandle}`}
          className="flex items-center gap-3 transition hover:opacity-90"
        >
          <Avatar
            src={post.authorPhotoURL}
            name={post.authorDisplayName}
            size="md"
          />
          <div className="flex flex-col leading-tight">
            <span className="flex items-center gap-1 text-sm font-semibold text-ink">
              {post.authorDisplayName}
              {post.authorIsVerified && <VerificationBadge />}
            </span>
            <span className="text-xs text-ink-muted">
              @{post.authorHandle} · {formatRelative(post)}
            </span>
          </div>
        </Link>
      </header>

      <Link href={`/posts/${post.id}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-surface-subtle">
          {!loaded && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-brand-50 via-surface-subtle to-brand-100/40" />
          )}
          <Image
            src={post.imageURL}
            alt={post.caption || "Post image"}
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            className={`object-cover transition-all duration-700 ${
              loaded ? "scale-100 blur-0" : "scale-105 blur-xl"
            }`}
            onLoad={() => setLoaded(true)}
          />
        </div>
      </Link>

      <div className="space-y-3 px-4 pb-4 pt-3">
        <div className="flex items-center gap-1">
          <LikeButton
            postId={post.id}
            postAuthorId={post.authorId}
            count={post.likeCount}
          />
          <Link
            href={`/posts/${post.id}`}
            aria-label="View comments"
            className="group flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            <Icon.MessageCircle size={20} className="transition-transform group-hover:scale-110" />
            <span className="text-sm">{post.commentCount}</span>
          </Link>
        </div>

        {post.caption && (
          <p className="text-sm leading-relaxed text-ink">
            <Link
              href={`/u/${post.authorHandle}`}
              className="font-semibold hover:text-brand-700"
            >
              {post.authorDisplayName}
            </Link>{" "}
            <span className="text-ink-muted">{post.caption}</span>
          </p>
        )}

        {post.commentCount > 0 && (
          <Link
            href={`/posts/${post.id}`}
            className="block text-xs text-ink-subtle transition hover:text-ink-muted"
          >
            View all {post.commentCount} comment{post.commentCount === 1 ? "" : "s"}
          </Link>
        )}
      </div>
    </motion.article>
  );
}
