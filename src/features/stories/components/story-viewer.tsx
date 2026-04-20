"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useDeleteStory, markViewed } from "../hooks/use-stories";
import type { UserStories } from "../types";

const STORY_DURATION_MS = 5000;

interface StoryViewerProps {
  groups: UserStories[];
  initialGroupIdx: number;
  onClose: () => void;
}

export function StoryViewer({ groups, initialGroupIdx, onClose }: StoryViewerProps) {
  const { user } = useAuth();
  const deleteStory = useDeleteStory();

  const [groupIdx, setGroupIdx] = useState(initialGroupIdx);
  const [storyIdx, setStoryIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const group = groups[groupIdx];
  const story = group?.stories[storyIdx];
  const isSelf = user?.uid === group?.uid;

  // Mark viewed + start progress timer
  useEffect(() => {
    if (!story) return;
    markViewed(story.id);
    setProgress(0);

    const interval = 100;
    const step = (interval / STORY_DURATION_MS) * 100;

    timerRef.current = setInterval(() => {
      setProgress((p) => {
        if (p + step >= 100) {
          advance();
          return 0;
        }
        return p + step;
      });
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupIdx, storyIdx]);

  function advance() {
    if (timerRef.current) clearInterval(timerRef.current);
    const nextStory = storyIdx + 1;
    if (nextStory < group.stories.length) {
      setStoryIdx(nextStory);
      return;
    }
    const nextGroup = groupIdx + 1;
    if (nextGroup < groups.length) {
      setGroupIdx(nextGroup);
      setStoryIdx(0);
      return;
    }
    onClose();
  }

  function goBack() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (storyIdx > 0) {
      setStoryIdx(storyIdx - 1);
      return;
    }
    if (groupIdx > 0) {
      setGroupIdx(groupIdx - 1);
      setStoryIdx(0);
    }
  }

  if (!story) return null;

  function formatTime(ts: { toDate: () => Date } | null) {
    if (!ts) return "";
    const diff = Date.now() - ts.toDate().getTime();
    const h = Math.floor(diff / 3_600_000);
    if (h < 1) return `${Math.round(diff / 60_000)}m ago`;
    return `${h}h ago`;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="relative mx-auto flex h-full max-h-[calc(100dvh)] w-full max-w-sm flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bars */}
        <div className="absolute left-0 right-0 top-3 z-10 flex gap-1 px-3">
          {group.stories.map((s, i) => (
            <div key={s.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full rounded-full bg-white transition-none"
                style={{
                  width:
                    i < storyIdx ? "100%" : i === storyIdx ? `${progress}%` : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute left-0 right-0 top-7 z-10 flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <Avatar
              src={group.userPhotoURL}
              name={group.userDisplayName}
              size="sm"
            />
            <div className="leading-tight">
              <p className="text-xs font-semibold text-white drop-shadow">
                {group.userDisplayName}
              </p>
              <p className="text-[10px] text-white/70">
                {formatTime(story.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSelf && (
              <button
                onClick={() => {
                  deleteStory.mutate(story.id);
                  advance();
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white"
              >
                <Icon.Trash size={15} />
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white"
            >
              <Icon.X size={16} />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="relative flex-1 bg-zinc-900">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${groupIdx}-${storyIdx}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0"
            >
              <Image
                src={story.imageURL}
                alt={story.caption || "Story"}
                fill
                sizes="400px"
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* Tap zones */}
          <button
            className="absolute bottom-0 left-0 top-0 w-1/3"
            onClick={goBack}
            aria-label="Previous"
          />
          <button
            className="absolute bottom-0 right-0 top-0 w-2/3"
            onClick={advance}
            aria-label="Next"
          />
        </div>

        {/* Caption */}
        {story.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-6 pt-10">
            <p className="text-sm leading-relaxed text-white drop-shadow">
              {story.caption}
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
