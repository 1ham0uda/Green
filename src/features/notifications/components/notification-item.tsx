"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { Notification } from "../types";

function message(n: Notification): string {
  if (n.type === "like") return "liked your post.";
  if (n.type === "comment")
    return n.commentBody ? `commented: "${n.commentBody.slice(0, 60)}"` : "commented on your post.";
  if (n.type === "follow") return "started following you.";
  return "";
}

function formatTime(n: Notification): string {
  if (!n.createdAt) return "";
  const d = n.createdAt.toDate();
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

interface Props {
  notification: Notification;
  onRead?: (id: string) => void;
}

export function NotificationItem({ notification: n, onRead }: Props) {
  const href =
    n.type === "follow"
      ? `/u/${n.fromUserHandle}`
      : n.postId
      ? `/posts/${n.postId}`
      : "#";

  return (
    <Link
      href={href}
      onClick={() => onRead?.(n.id)}
      className={cn(
        "flex items-start gap-3 p-4 transition hover:bg-surface-muted",
        !n.read && "bg-brand-50"
      )}
    >
      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-brand-100">
        {n.fromUserPhotoURL ? (
          <Image
            src={n.fromUserPhotoURL}
            alt={n.fromUserDisplayName}
            fill
            sizes="40px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-brand-700">
            {n.fromUserDisplayName.slice(0, 1).toUpperCase()}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm text-zinc-800">
          <span className="font-semibold">{n.fromUserDisplayName}</span>{" "}
          {message(n)}
        </p>
        <p className="mt-0.5 text-xs text-zinc-500">{formatTime(n)}</p>
      </div>

      {n.postImageURL && (
        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-zinc-100">
          <Image
            src={n.postImageURL}
            alt=""
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
      )}

      {!n.read && (
        <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-brand-600" />
      )}
    </Link>
  );
}
