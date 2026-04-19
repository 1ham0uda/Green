"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { cn } from "@/lib/utils/cn";
import { useLikeMutations, useLikeStatus } from "../hooks/use-post";

interface LikeButtonProps {
  postId: string;
  postAuthorId: string;
  count: number;
}

export function LikeButton({ postId, postAuthorId, count }: LikeButtonProps) {
  const { user } = useAuth();
  const { data: liked } = useLikeStatus(postId);
  const { like, unlike } = useLikeMutations(postId, postAuthorId);

  const pending = like.isPending || unlike.isPending;

  function toggle() {
    if (!user || pending) return;
    if (liked) unlike.mutate();
    else like.mutate();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!user || pending}
      className={cn(
        "group flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors",
        liked ? "text-red-500" : "text-ink-muted hover:text-red-500",
        !user && "cursor-not-allowed opacity-60"
      )}
      aria-pressed={Boolean(liked)}
      aria-label={liked ? "Unlike" : "Like"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.svg
          key={liked ? "on" : "off"}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.85 }}
          transition={
            liked
              ? { type: "spring", stiffness: 500, damping: 14 }
              : { duration: 0.15 }
          }
          viewBox="0 0 24 24"
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "h-5 w-5 transition-transform",
            !liked && "group-hover:scale-110",
            liked && "animate-heartbeat"
          )}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </motion.svg>
      </AnimatePresence>
      <span className="tabular-nums">{count}</span>
    </button>
  );
}
