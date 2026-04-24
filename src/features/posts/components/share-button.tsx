"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { ShareModal } from "./share-modal";
import type { Post } from "../types";

interface ShareButtonProps {
  post: Post;
}

export function ShareButton({ post }: ShareButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Share post"
        className="group flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <Icon.Share
          size={20}
          className="transition-transform group-hover:scale-110"
        />
      </button>
      {open && <ShareModal post={post} onClose={() => setOpen(false)} />}
    </>
  );
}
