"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  useGroup,
  useGroupPosts,
  useGroupMembers,
  useMemberStatus,
  useJoinGroup,
  useLeaveGroup,
  useCreateGroupPost,
} from "@/features/groups/hooks/use-groups";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import type { GroupPost } from "@/features/groups/types";

interface PageProps {
  params: { groupId: string };
}

export default function GroupPage({ params }: PageProps) {
  const { groupId } = params;
  const { user } = useAuth();
  const { data: group, isLoading } = useGroup(groupId);
  const { data: isMember } = useMemberStatus(groupId);
  const joinGroup = useJoinGroup(groupId);
  const leaveGroup = useLeaveGroup(groupId);

  if (isLoading) {
    return (
      <main className="container max-w-3xl pb-24 md:pb-0">
        <div className="skeleton mt-6 h-40 w-full rounded-2xl" />
        <div className="mt-4 space-y-3">
          <div className="skeleton h-6 w-48 rounded-full" />
          <div className="skeleton h-4 w-full rounded-full" />
        </div>
      </main>
    );
  }

  if (!group) {
    return (
      <main className="container max-w-3xl pt-10">
        <EmptyState icon={<Icon.Flag size={22} />} title="Group not found" />
      </main>
    );
  }

  const isCreator = user?.uid === group.creatorId;

  return (
    <main className="container max-w-3xl pb-24 md:pb-0">
      {/* Cover + header */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-surface-border bg-surface">
        <div className="relative h-36 sm:h-48 bg-surface-subtle">
          {group.coverImageURL && (
            <Image
              src={group.coverImageURL}
              alt={group.name}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          )}
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-[24px] font-normal leading-tight tracking-[-0.02em] text-ink">
                {group.name}
              </h1>
              {group.description && (
                <p className="mt-1 font-sans text-[13px] text-ink-muted">{group.description}</p>
              )}
            </div>
            {user && !isCreator && (
              isMember ? (
                <button
                  onClick={() => leaveGroup.mutate()}
                  disabled={leaveGroup.isPending}
                  className="btn-secondary btn-sm flex-shrink-0"
                >
                  {leaveGroup.isPending ? "Leaving…" : "Leave"}
                </button>
              ) : (
                <button
                  onClick={() => joinGroup.mutate()}
                  disabled={joinGroup.isPending}
                  className="btn-primary btn-sm flex-shrink-0"
                >
                  {joinGroup.isPending ? "Joining…" : "Join"}
                </button>
              )
            )}
          </div>
          <div className="mt-3 flex items-center gap-4 font-sans text-[11px] text-ink-subtle">
            <span className="flex items-center gap-1">
              <Icon.Users size={12} />
              {group.memberCount} member{group.memberCount === 1 ? "" : "s"}
            </span>
            <span className="flex items-center gap-1">
              <Icon.Leaf size={12} />
              {group.postCount} post{group.postCount === 1 ? "" : "s"}
            </span>
            {!group.isPublic && (
              <span className="flex items-center gap-1">
                <Icon.Shield size={11} />
                Private
              </span>
            )}
            <span>
              by{" "}
              <Link href={`/u/${group.creatorHandle}`} className="hover:text-ink transition-colors">
                @{group.creatorHandle}
              </Link>
            </span>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_240px]">
        <div className="space-y-4">
          {isMember && <GroupPostForm groupId={groupId} />}
          <GroupPostFeed groupId={groupId} />
        </div>
        <aside>
          <GroupMembersList groupId={groupId} />
        </aside>
      </div>
    </main>
  );
}

function GroupPostForm({ groupId }: { groupId: string }) {
  const createPost = useCreateGroupPost(groupId);
  const [caption, setCaption] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    const merged = [...imageFiles, ...selected].slice(0, 5);
    setImageFiles(merged);
    setPreviews(merged.map((f) => URL.createObjectURL(f)));
    e.target.value = "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!caption.trim() && imageFiles.length === 0) {
      setError("Add a photo or caption.");
      return;
    }
    setError(null);
    try {
      await createPost.mutateAsync({ imageFiles, caption });
      setCaption("");
      setImageFiles([]);
      setPreviews([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-surface-border bg-surface space-y-3 p-4">
      <textarea
        rows={2}
        maxLength={500}
        className="input resize-none"
        placeholder="Share something with the group…"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />

      {previews.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {previews.map((src, i) => (
            <div key={i} className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  const n = imageFiles.filter((_, j) => j !== i);
                  setImageFiles(n);
                  setPreviews(n.map((f) => URL.createObjectURL(f)));
                }}
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <Icon.X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="font-sans text-[12px] text-red-600">{error}</p>}

      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-1.5 font-sans text-[13px] text-ink-muted hover:text-ink transition-colors">
          <Icon.ImagePlus size={16} />
          Photo
          <input type="file" accept="image/*" multiple className="sr-only" onChange={handleFiles} disabled={imageFiles.length >= 5} />
        </label>
        <button
          type="submit"
          disabled={createPost.isPending || (!caption.trim() && imageFiles.length === 0)}
          className="btn-primary btn-sm"
        >
          {createPost.isPending ? "Posting…" : "Post"}
        </button>
      </div>
    </form>
  );
}

function GroupPostFeed({ groupId }: { groupId: string }) {
  const { data: posts = [], isLoading } = useGroupPosts(groupId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-48 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={<Icon.Leaf size={22} />}
        title="No posts yet"
        description="Be the first to share something with the group."
      />
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <GroupPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

function GroupPostCard({ post }: { post: GroupPost }) {
  const [imgIdx, setImgIdx] = useState(0);

  function formatTime(ts: { toDate: () => Date } | null) {
    if (!ts) return "";
    const d = ts.toDate();
    const diff = Date.now() - d.getTime();
    const m = Math.round(diff / 60_000);
    if (m < 60) return `${m}m`;
    const h = Math.round(m / 60);
    if (h < 24) return `${h}h`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-surface-border bg-surface">
      <div className="flex items-center gap-3 p-4">
        <Avatar src={post.authorPhotoURL} name={post.authorDisplayName} size="md" />
        <div className="leading-tight">
          <Link href={`/u/${post.authorHandle}`} className="font-sans text-[13px] font-medium text-ink hover:opacity-75">
            {post.authorDisplayName}
          </Link>
          <p className="eyebrow">@{post.authorHandle} · {formatTime(post.createdAt)}</p>
        </div>
      </div>

      {post.imageURLs.length > 0 && (
        <div className="relative aspect-video w-full overflow-hidden bg-surface-subtle">
          <Image key={imgIdx} src={post.imageURLs[imgIdx]} alt={post.caption || "Group post"} fill sizes="(max-width: 768px) 100vw, 640px" className="object-cover" />
          {post.imageURLs.length > 1 && (
            <div className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 font-sans text-[11px] text-white">
              {imgIdx + 1}/{post.imageURLs.length}
            </div>
          )}
          {imgIdx > 0 && (
            <button onClick={() => setImgIdx((i) => i - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm">
              <Icon.ChevronLeft size={16} />
            </button>
          )}
          {imgIdx < post.imageURLs.length - 1 && (
            <button onClick={() => setImgIdx((i) => i + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm">
              <Icon.ChevronRight size={16} />
            </button>
          )}
        </div>
      )}

      {post.caption && (
        <p className="px-4 py-3 font-serif text-[15px] leading-relaxed text-ink">{post.caption}</p>
      )}

      <div className="flex items-center gap-4 border-t border-surface-border px-4 py-2 font-sans text-[11px] text-ink-subtle">
        <span className="flex items-center gap-1"><Icon.Heart size={12} />{post.likeCount}</span>
        <span className="flex items-center gap-1"><Icon.MessageCircle size={12} />{post.commentCount}</span>
      </div>
    </div>
  );
}

function GroupMembersList({ groupId }: { groupId: string }) {
  const { data: members = [], isLoading } = useGroupMembers(groupId);

  return (
    <div className="rounded-2xl border border-surface-border bg-surface space-y-3 p-4">
      <p className="eyebrow">Members ({members.length})</p>
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-10 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {members.map((m) => (
            <Link
              key={m.userId}
              href={`/u/${m.userHandle}`}
              className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-surface-hover"
            >
              <Avatar src={m.userPhotoURL} name={m.userDisplayName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-sans text-[13px] font-medium text-ink">{m.userDisplayName}</p>
                <p className="truncate font-sans text-[11px] text-ink-muted">@{m.userHandle}</p>
              </div>
              {m.role === "admin" && (
                <span className="badge badge-brand">Admin</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
