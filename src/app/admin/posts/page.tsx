"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  useAdminDeletePost,
  useApprovePost,
  usePendingPosts,
  useRejectPost,
} from "@/features/admin/hooks/use-admin";
import { useFeed } from "@/features/posts/hooks/use-feed";
import { Icon } from "@/components/ui/icon";

type Tab = "pending" | "all";

export default function AdminPostsPage() {
  const [tab, setTab] = useState<Tab>("pending");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: pendingData, isLoading: pendingLoading } = usePendingPosts();
  const { data: feedData, isLoading: feedLoading } = useFeed();
  const approvePost = useApprovePost();
  const rejectPost = useRejectPost();
  const deletePost = useAdminDeletePost();

  const pendingPosts = pendingData ?? [];
  const allPosts = feedData?.pages.flatMap((p) => p.items) ?? [];

  function handleReject(postId: string) {
    if (!rejectReason.trim()) return;
    rejectPost.mutate(
      { postId, reason: rejectReason.trim() },
      {
        onSuccess: () => {
          setRejectingId(null);
          setRejectReason("");
        },
      }
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Post Moderation</h2>
        <div className="flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5">
          <button
            onClick={() => setTab("pending")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === "pending"
                ? "bg-white shadow-sm text-zinc-900"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            Pending
            {pendingPosts.length > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                {pendingPosts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("all")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === "all"
                ? "bg-white shadow-sm text-zinc-900"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            All Posts
          </button>
        </div>
      </div>

      {tab === "pending" && (
        <div className="space-y-3">
          {pendingLoading && <p className="text-sm text-zinc-500">Loading…</p>}
          {!pendingLoading && pendingPosts.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-zinc-200 py-12 text-center">
              <Icon.Check size={28} className="text-green-500" />
              <p className="text-sm font-medium text-zinc-600">All caught up!</p>
              <p className="text-xs text-zinc-400">No posts awaiting review.</p>
            </div>
          )}
          {pendingPosts.map((post) => (
            <div key={post.id} className="card p-4 space-y-3">
              <div className="flex items-start gap-4">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                  {post.imageURLs?.[0] && (
                    <Image
                      src={post.imageURLs[0]}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                  {(post.imageURLs?.length ?? 0) > 1 && (
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-[9px] text-white">
                      {post.imageURLs.length}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/u/${post.authorHandle}`}
                    className="text-sm font-semibold text-zinc-900 hover:text-brand-700"
                  >
                    @{post.authorHandle}
                  </Link>
                  {post.caption && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-zinc-600">
                      {post.caption}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-zinc-400">
                    {post.governorate && post.city
                      ? `${post.city}, ${post.governorate}`
                      : post.governorate || ""}
                  </p>
                </div>
                <Link
                  href={`/posts/${post.id}`}
                  className="btn-secondary text-xs"
                  target="_blank"
                >
                  Preview
                </Link>
              </div>

              {rejectingId === post.id ? (
                <div className="space-y-2 rounded-xl border border-red-100 bg-red-50 p-3">
                  <p className="text-xs font-medium text-red-700">Rejection reason</p>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Explain why this post is rejected…"
                    rows={2}
                    className="w-full resize-none rounded-lg border border-red-200 bg-white px-3 py-2 text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(post.id)}
                      disabled={!rejectReason.trim() || rejectPost.isPending}
                      className="btn-secondary text-xs text-red-700 disabled:opacity-50"
                    >
                      Confirm Reject
                    </button>
                    <button
                      onClick={() => {
                        setRejectingId(null);
                        setRejectReason("");
                      }}
                      className="btn-secondary text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => approvePost.mutate(post.id)}
                    disabled={approvePost.isPending}
                    className="btn-secondary text-xs text-green-700 disabled:opacity-50"
                  >
                    <Icon.Check size={13} className="mr-1 inline" />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setRejectingId(post.id);
                      setRejectReason("");
                    }}
                    className="btn-secondary text-xs text-red-700"
                  >
                    <Icon.X size={13} className="mr-1 inline" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "all" && (
        <div className="space-y-2">
          {feedLoading && <p className="text-sm text-zinc-500">Loading…</p>}
          {allPosts.map((post) => (
            <div key={post.id} className="card flex items-center gap-4 p-4">
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                {post.imageURLs[0] && (
                  <Image
                    src={post.imageURLs[0]}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/u/${post.authorHandle}`}
                  className="text-sm font-semibold text-zinc-900 hover:text-brand-700"
                >
                  @{post.authorHandle}
                </Link>
                {post.caption && (
                  <p className="line-clamp-1 text-xs text-zinc-500">{post.caption}</p>
                )}
                <p className="text-xs text-zinc-400">
                  {post.likeCount} likes · {post.commentCount} comments
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    post.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : post.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {post.status}
                </span>
                <Link href={`/posts/${post.id}`} className="btn-secondary text-xs">
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
      )}
    </div>
  );
}
