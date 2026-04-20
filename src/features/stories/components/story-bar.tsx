"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { useStories } from "../hooks/use-stories";
import { StoryViewer } from "./story-viewer";

export function StoryBar() {
  const { user } = useAuth();
  const { data: groups = [], isLoading } = useStories();
  const [viewingIdx, setViewingIdx] = useState<number | null>(null);

  const ownGroup = groups.find((g) => g.uid === user?.uid);

  if (isLoading) {
    return (
      <div className="mb-6 flex gap-4 overflow-x-auto pb-1 scrollbar-none">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="h-16 w-16 animate-pulse rounded-full bg-surface-subtle" />
            <div className="h-2 w-12 animate-pulse rounded bg-surface-subtle" />
          </div>
        ))}
      </div>
    );
  }

  if (!user && groups.length === 0) return null;

  return (
    <>
      <div className="mb-6 flex items-center gap-4 overflow-x-auto pb-1 scrollbar-none">
        {/* Own story / add button */}
        {user && (
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            {ownGroup ? (
              <button
                onClick={() =>
                  setViewingIdx(groups.findIndex((g) => g.uid === user.uid))
                }
                className="relative"
              >
                <div
                  className={`relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-offset-2 ${
                    ownGroup.hasUnviewed ? "ring-brand-500" : "ring-surface-border"
                  }`}
                >
                  <Image
                    src={ownGroup.stories[0].imageURL}
                    alt="Your story"
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-white ring-2 ring-white">
                  <Icon.Plus size={11} />
                </span>
              </button>
            ) : (
              <Link href="/stories/new" className="flex flex-col items-center gap-1.5">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-surface-border bg-surface-subtle hover:border-brand-400 transition-colors">
                  <Avatar src={user.photoURL} name={user.displayName} size="lg" />
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-white ring-2 ring-white">
                    <Icon.Plus size={11} />
                  </span>
                </div>
              </Link>
            )}
            <span className="w-16 truncate text-center text-[11px] text-ink-muted">
              Your story
            </span>
          </div>
        )}

        {/* Other users' stories */}
        {groups
          .filter((g) => g.uid !== user?.uid)
          .map((group) => {
            const idx = groups.findIndex((g) => g.uid === group.uid);
            return (
              <button
                key={group.uid}
                onClick={() => setViewingIdx(idx)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
              >
                <div
                  className={`relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-offset-2 ${
                    group.hasUnviewed
                      ? "ring-brand-500"
                      : "ring-surface-border"
                  }`}
                >
                  <Image
                    src={group.stories[0].imageURL}
                    alt={group.userDisplayName}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <span className="w-16 truncate text-center text-[11px] text-ink">
                  {group.userDisplayName}
                </span>
              </button>
            );
          })}
      </div>

      <AnimatePresence>
        {viewingIdx !== null && (
          <StoryViewer
            groups={groups}
            initialGroupIdx={viewingIdx}
            onClose={() => setViewingIdx(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
