"use client";

import Image from "next/image";
import Link from "next/link";
import { LikeButton } from "./like-button";
import type { Post } from "../types";

function formatDate(post: Post): string {
  if (!post.createdAt) return "";
  const date = post.createdAt.toDate();
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="card overflow-hidden">
      <header className="flex items-center gap-3 p-4">
        <div className="h-10 w-10 overflow-hidden rounded-full bg-brand-100">
          {post.authorPhotoURL ? (
            <Image
              src={post.authorPhotoURL}
              alt={post.authorDisplayName}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-brand-700">
              {post.authorDisplayName.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <Link
            href={`/u/${post.authorHandle}`}
            className="text-sm font-semibold text-zinc-900 hover:text-brand-700"
          >
            {post.authorDisplayName}
          </Link>
          <span className="text-xs text-zinc-500">
            @{post.authorHandle} · {formatDate(post)}
          </span>
        </div>
      </header>

      <div className="relative aspect-square w-full bg-zinc-100">
        <Image
          src={post.imageURL}
          alt={post.caption || "Post image"}
          fill
          sizes="(max-width: 768px) 100vw, 640px"
          className="object-cover"
        />
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center gap-4">
          <LikeButton postId={post.id} count={post.likeCount} />
          <Link
            href={`/posts/${post.id}`}
            className="text-sm text-zinc-500 hover:text-brand-700"
          >
            {post.commentCount} comments
          </Link>
        </div>
        {post.caption && (
          <p className="text-sm text-zinc-800">
            <span className="font-semibold">{post.authorDisplayName}</span>{" "}
            {post.caption}
          </p>
        )}
      </div>
    </article>
  );
}
