"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useHighlights, useCreateHighlight, useDeleteHighlight } from "../hooks/use-highlights";
import { useAuthorPosts } from "@/features/posts/hooks/use-post";
import { Icon } from "@/components/ui/icon";
import type { Highlight } from "../types";

interface StoryHighlightsProps {
  uid: string;
}

export function StoryHighlights({ uid }: StoryHighlightsProps) {
  const { user } = useAuth();
  const isSelf = user?.uid === uid;
  const { data: highlights = [], isLoading } = useHighlights(uid);
  const [viewing, setViewing] = useState<Highlight | null>(null);
  const [creating, setCreating] = useState(false);
  const deleteHighlight = useDeleteHighlight(uid);

  if (isLoading) return null;
  if (!isSelf && highlights.length === 0) return null;

  return (
    <>
      <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
        {isSelf && (
          <button
            onClick={() => setCreating(true)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-surface-border bg-surface-subtle transition-colors hover:border-brand-400">
              <Icon.Plus size={22} className="text-ink-muted" />
            </div>
            <span className="text-xs text-ink-muted">New</span>
          </button>
        )}

        {highlights.map((h) => (
          <button
            key={h.id}
            onClick={() => setViewing(h)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0"
          >
            <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-brand-400 ring-offset-2">
              {h.coverImageURL ? (
                <Image
                  src={h.coverImageURL}
                  alt={h.title}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-brand-400 to-brand-700" />
              )}
            </div>
            <span className="w-16 truncate text-center text-xs text-ink">
              {h.title}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {viewing && (
          <HighlightViewer
            highlight={viewing}
            isSelf={isSelf}
            onDelete={() => {
              deleteHighlight.mutate(viewing.id);
              setViewing(null);
            }}
            onClose={() => setViewing(null)}
          />
        )}
        {creating && (
          <CreateHighlightModal uid={uid} onClose={() => setCreating(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

function HighlightViewer({
  highlight,
  isSelf,
  onDelete,
  onClose,
}: {
  highlight: Highlight;
  isSelf: boolean;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const images = highlight.imageURLs.length > 0
    ? highlight.imageURLs
    : [highlight.coverImageURL];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 24 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className="absolute top-3 left-3 right-3 z-10 flex gap-1">
          {images.map((_, i) => (
            <div
              key={i}
              className={`h-0.5 flex-1 rounded-full ${
                i <= idx ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>

        {/* Close + delete */}
        <div className="absolute top-7 right-3 z-10 flex gap-2">
          {isSelf && (
            <button
              onClick={onDelete}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm"
            >
              <Icon.Trash size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm"
          >
            <Icon.X size={16} />
          </button>
        </div>

        <div className="relative aspect-[9/16] w-full bg-zinc-900">
          <Image
            key={idx}
            src={images[idx]}
            alt={highlight.title}
            fill
            sizes="400px"
            className="object-cover"
          />

          {idx > 0 && (
            <button
              onClick={() => setIdx((i) => i - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white"
            >
              <Icon.ChevronLeft size={20} />
            </button>
          )}
          {idx < images.length - 1 && (
            <button
              onClick={() => setIdx((i) => i + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white"
            >
              <Icon.ChevronRight size={20} />
            </button>
          )}
        </div>

        <div className="p-4">
          <p className="font-semibold text-white">{highlight.title}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CreateHighlightModal({
  uid,
  onClose,
}: {
  uid: string;
  onClose: () => void;
}) {
  const { data: posts = [] } = useAuthorPosts(uid);
  const createHighlight = useCreateHighlight();

  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const allImages = posts.flatMap((p) => p.imageURLs);

  function toggle(url: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  }

  async function handleSave() {
    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }
    const imageURLs = Array.from(selected);
    if (imageURLs.length === 0) {
      setError("Select at least one image.");
      return;
    }
    setError(null);
    try {
      await createHighlight.mutateAsync({
        title,
        coverImageURL: imageURLs[0],
        imageURLs,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-surface-border px-6 py-4">
          <h2 className="font-semibold text-ink">New highlight</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink">
            <Icon.X size={20} />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink">Title</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Spring blooms"
              maxLength={30}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-ink">
              Select images{" "}
              <span className="font-normal text-ink-muted">
                ({selected.size} selected)
              </span>
            </p>
            {allImages.length === 0 ? (
              <p className="text-sm text-ink-muted">
                No post images found. Create some posts first.
              </p>
            ) : (
              <div className="grid max-h-64 grid-cols-4 gap-1.5 overflow-y-auto">
                {allImages.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggle(url)}
                    className={`relative aspect-square overflow-hidden rounded-xl ${
                      selected.has(url) ? "ring-2 ring-brand-500 ring-offset-1" : ""
                    }`}
                  >
                    <Image src={url} alt="" fill sizes="80px" className="object-cover" />
                    {selected.has(url) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-brand-600/30">
                        <Icon.Check size={18} className="text-white drop-shadow" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={createHighlight.isPending}
            className="btn-primary w-full"
          >
            {createHighlight.isPending ? "Saving…" : "Save highlight"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
