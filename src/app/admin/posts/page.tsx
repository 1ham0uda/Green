"use client";

import Image from "next/image";
import Link from "next/link";
import { useAdminDeletePost } from "@/features/admin/hooks/use-admin";
import { useFeed } from "@/features/posts/hooks/use-feed";

export default function AdminPostsPage() {
  const { data, isLoading } = useFeed();
  const deletePost = useAdminDeletePost();

  const posts = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-zinc-900">
        Posts ({posts.length})
      </h2>

      {isLoading && <p className="text-sm text-zinc-500">Loading…</p>}

      <div className="space-y-2">
        {posts.map((post) => (
          <div key={post.id} className="card flex items-center gap-4 p-4">
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded bg-zinc-100">
              <Image
                src={post.imageURL}
                alt=""
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <Link
                href={`/u/${post.authorHandle}`}
                className="text-sm font-semibold text-zinc-900 hover:text-brand-700"
              >
                @{post.authorHandle}
              </Link>
              {post.caption && (
                <p className="line-clamp-1 text-xs text-zinc-500">
                  {post.caption}
                </p>
              )}
              <p className="text-xs text-zinc-400">
                {post.likeCount} likes · {post.commentCount} comments
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/posts/${post.id}`}
                className="btn-secondary text-xs"
              >
                View
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Delete this post permanently?")) {
                    void deletePost.mutateAsync(post.id);
                  }
                }}
                disabled={deletePost.isPending}
                className="btn-secondary text-xs text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
