"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import type { Comment } from "../types";

function formatTime(comment: Comment): string {
  if (!comment.createdAt) return "just now";
  const d = comment.createdAt.toDate();
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function CommentList({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) {
    return (
      <p className="text-center text-sm text-ink-muted py-4">
        No comments yet. Start the conversation.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {comments.map((comment, i) => (
        <motion.li
          key={comment.id}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: i * 0.03 }}
          className="flex gap-3"
        >
          <Link href={`/u/${comment.authorHandle}`} className="flex-shrink-0">
            <Avatar name={comment.authorDisplayName} size="sm" />
          </Link>
          <div className="min-w-0 flex-1 rounded-2xl bg-surface-muted px-4 py-2.5">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <Link
                href={`/u/${comment.authorHandle}`}
                className="text-sm font-semibold text-ink hover:text-brand-700"
              >
                {comment.authorDisplayName}
              </Link>
              <span className="text-xs text-ink-subtle">
                {formatTime(comment)}
              </span>
            </div>
            <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-ink">
              {comment.body}
            </p>
          </div>
        </motion.li>
      ))}
    </ul>
  );
}
