"use client";

import Link from "next/link";
import type { Comment } from "../types";

function formatTime(comment: Comment): string {
  if (!comment.createdAt) return "just now";
  return comment.createdAt.toDate().toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CommentList({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-zinc-500">No comments yet. Start the conversation.</p>
    );
  }

  return (
    <ul className="space-y-4">
      {comments.map((comment) => (
        <li key={comment.id} className="flex gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            {comment.authorDisplayName.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <Link
                href={`/u/${comment.authorHandle}`}
                className="text-sm font-semibold text-zinc-900 hover:text-brand-700"
              >
                {comment.authorDisplayName}
              </Link>
              <span className="text-xs text-zinc-500">{formatTime(comment)}</span>
            </div>
            <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-zinc-800">
              {comment.body}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
