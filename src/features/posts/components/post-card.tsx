"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { LikeButton } from "./like-button";
import { ShareButton } from "./share-button";
import { PostOptionsMenu } from "./post-options-menu";
import { VerificationBadge } from "@/features/verification/components/verification-badge";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useFollowStatus, useFollowMutations } from "@/features/profiles/hooks/use-follow";
import { useIsPostSaved, useSavePost } from "../hooks/use-saved-posts";
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
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function PostCard({ post }: { post: Post }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const images = post.imageURLs;
  const hasMultiple = images.length > 1;

  const { user } = useAuth();
  const viewerId = user?.uid ?? null;
  const isOwnPost = viewerId === post.authorId;

  // Bookmark
  const { data: isSaved } = useIsPostSaved(viewerId, post.id);
  const { save, unsave } = useSavePost(viewerId, post.id);
  const savedLocal = isSaved ?? false;

  // Follow
  const { data: isFollowing } = useFollowStatus(viewerId, post.authorId);
  const { follow, unfollow } = useFollowMutations(
    viewerId,
    user?.handle ?? null,
    post.authorId,
    user?.displayName ?? null
  );

  function prev(e: React.MouseEvent) {
    e.preventDefault();
    setActiveIdx((i) => Math.max(0, i - 1));
  }
  function next(e: React.MouseEvent) {
    e.preventDefault();
    setActiveIdx((i) => Math.min(images.length - 1, i + 1));
  }

  function toggleSave() {
    if (!viewerId) return;
    if (savedLocal) unsave.mutate();
    else save.mutate();
  }

  return (
    <article className="post-card">
      {/* ── Header ── */}
      <header className="flex items-center gap-2.5 px-4 pb-3 pt-4">
        <Link href={`/u/${post.authorHandle}`} className="flex-shrink-0">
          <Avatar
            src={post.authorPhotoURL}
            name={post.authorDisplayName}
            size="md"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/u/${post.authorHandle}`}
              className="flex items-center gap-1.5 transition-opacity hover:opacity-75"
            >
              <span className="text-[13px] font-medium text-ink">
                {post.authorHandle}
              </span>
              {post.authorIsVerified && <VerificationBadge size="sm" />}
            </Link>
            {/* Follow button — only show for other users when logged in */}
            {viewerId && !isOwnPost && (
              isFollowing ? (
                <button
                  type="button"
                  onClick={() => unfollow.mutate()}
                  disabled={unfollow.isPending}
                  className="text-[11px] font-medium text-ink-muted border border-surface-border rounded-full px-2 py-0.5 hover:bg-surface-hover transition"
                >
                  Following
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => follow.mutate()}
                  disabled={follow.isPending}
                  className="flex items-center gap-1 text-[11px] font-medium text-brand-600 border border-brand-300 rounded-full px-2 py-0.5 hover:bg-brand-50 transition"
                >
                  <Icon.UserPlus size={11} />
                  Follow
                </button>
              )
            )}
          </div>
          {(post.governorate || post.city) && (
            <p className="mt-0.5 text-[11px] tracking-[0.01em] text-ink-muted">
              {[post.city, post.governorate].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-subtle transition hover:bg-surface-hover"
            aria-label="More options"
            aria-expanded={menuOpen}
          >
            <Icon.MoreHorizontal size={18} />
          </button>
          {menuOpen && viewerId && (
            <PostOptionsMenu
              postId={post.id}
              postAuthorId={post.authorId}
              postAuthorHandle={post.authorHandle}
              currentPlantId={post.plantId}
              viewerId={viewerId}
              onClose={() => setMenuOpen(false)}
              onDeleted={() => setMenuOpen(false)}
            />
          )}
        </div>
      </header>

      {/* ── Image ── */}
      {images.length > 0 && (
        <div className="relative w-full overflow-hidden bg-surface-subtle" style={{ aspectRatio: "4/5" }}>
          <Link href={`/posts/${post.id}`} className="block h-full w-full">
            <Image
              key={activeIdx}
              src={images[activeIdx]}
              alt={post.caption || "Post image"}
              fill
              sizes="(max-width: 768px) 100vw, 640px"
              className="object-cover"
            />
          </Link>

          {post.plantId && (
            <div className="absolute bottom-3 left-3">
              <span className="species-pill">{post.plantId}</span>
            </div>
          )}

          {hasMultiple && (
            <>
              {activeIdx > 0 && (
                <button
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/65"
                  aria-label="Previous"
                >
                  <Icon.ChevronLeft size={16} />
                </button>
              )}
              {activeIdx < images.length - 1 && (
                <button
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/65"
                  aria-label="Next"
                >
                  <Icon.ChevronRight size={16} />
                </button>
              )}
              <div className="absolute bottom-3 right-3 flex gap-1">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.preventDefault(); setActiveIdx(i); }}
                    className={`h-1.5 rounded-full transition-all ${
                      i === activeIdx ? "w-4 bg-white" : "w-1.5 bg-white/50"
                    }`}
                    aria-label={`Image ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Actions row ── */}
      <div className="flex items-center gap-4 px-4 pt-3">
        <LikeButton
          postId={post.id}
          postAuthorId={post.authorId}
          count={post.likeCount}
        />
        <Link
          href={`/posts/${post.id}`}
          aria-label="Comment"
          className="flex items-center gap-1.5 text-ink transition-opacity hover:opacity-70"
        >
          <Icon.MessageCircle size={20} />
        </Link>
        <ShareButton post={post} />
        <div className="flex-1" />
        <button
          type="button"
          onClick={toggleSave}
          disabled={save.isPending || unsave.isPending}
          aria-label={savedLocal ? "Unsave" : "Save"}
          className="flex items-center text-ink transition-opacity hover:opacity-70 disabled:opacity-40"
        >
          <Icon.Bookmark
            size={20}
            className={savedLocal ? "fill-ink" : "fill-none"}
          />
        </button>
      </div>

      {/* ── Like count ── */}
      <div className="px-4 pt-1.5">
        <span className="tabular-nums text-[12px] text-ink-muted">
          <strong className="font-medium text-ink">
            {post.likeCount.toLocaleString()}
          </strong>{" "}
          likes
        </span>
      </div>

      {/* ── Caption ── */}
      {post.caption && (
        <div className="px-4 pt-1.5 pb-1">
          <p className="font-serif text-[17px] leading-[1.4] tracking-[-0.005em] text-ink">
            <Link
              href={`/u/${post.authorHandle}`}
              className="mr-2 font-sans text-[13px] font-medium not-italic text-ink hover:opacity-75"
            >
              {post.authorHandle}
            </Link>
            {post.caption}
          </p>
        </div>
      )}

      {/* ── Timestamp ── */}
      <div className="px-4 pb-4 pt-1">
        <Link
          href={`/posts/${post.id}`}
          className="eyebrow transition-opacity hover:opacity-75"
        >
          {formatRelative(post)} ago
          {post.commentCount > 0 && ` · view all ${post.commentCount} comments`}
        </Link>
      </div>
    </article>
  );
}
