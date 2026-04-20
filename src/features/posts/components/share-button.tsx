"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";

interface ShareButtonProps {
  postId: string;
}

export function ShareButton({ postId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/posts/${postId}`
        : `/posts/${postId}`;

    const shareData: ShareData = {
      title: "Green post",
      url,
    };

    const canNativeShare =
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare(shareData);

    if (canNativeShare) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // fall back to copy
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked; nothing more we can do silently
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleShare()}
      aria-label="Share post"
      className="group relative flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
    >
      <Icon.Share
        size={20}
        className="transition-transform group-hover:scale-110"
      />
      <AnimatePresence>
        {copied && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-xs font-medium text-surface shadow-elevated"
          >
            Link copied
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
