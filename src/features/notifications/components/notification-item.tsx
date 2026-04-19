"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils/cn";
import type { Notification } from "../types";

function message(n: Notification): string {
  if (n.type === "like") return "liked your post";
  if (n.type === "comment")
    return n.commentBody
      ? `commented: "${n.commentBody.slice(0, 60)}"`
      : "commented on your post";
  if (n.type === "follow") return "started following you";
  return "";
}

function formatTime(n: Notification): string {
  if (!n.createdAt) return "";
  const d = n.createdAt.toDate();
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function typeIcon(n: Notification) {
  if (n.type === "like")
    return <Icon.Heart size={12} className="text-red-500" />;
  if (n.type === "comment")
    return <Icon.MessageCircle size={12} className="text-blue-500" />;
  if (n.type === "follow")
    return <Icon.User size={12} className="text-brand-600" />;
  return null;
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
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={href}
        onClick={() => onRead?.(n.id)}
        className={cn(
          "group flex items-start gap-3 p-4 transition-colors hover:bg-surface-hover",
          !n.read && "bg-brand-50/40"
        )}
      >
        <div className="relative flex-shrink-0">
          <Avatar
            src={n.fromUserPhotoURL}
            name={n.fromUserDisplayName}
            size="md"
          />
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-surface bg-surface">
            {typeIcon(n)}
          </span>
        </div>

        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="text-sm text-ink">
            <span className="font-semibold">{n.fromUserDisplayName}</span>{" "}
            <span className="text-ink-muted">{message(n)}</span>
          </p>
          <p className="text-xs text-ink-subtle">{formatTime(n)}</p>
        </div>

        {n.postImageURL && (
          <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-surface-subtle">
            <Image
              src={n.postImageURL}
              alt=""
              fill
              sizes="44px"
              className="object-cover"
            />
          </div>
        )}

        {!n.read && (
          <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]" />
        )}
      </Link>
    </motion.div>
  );
}
