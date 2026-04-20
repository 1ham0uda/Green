"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  createStory,
  deleteStory,
  fetchActiveStories,
} from "../services/story-service";
import type { UserStories } from "../types";

const VIEWED_KEY = "green_viewed_stories";

function getViewedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(VIEWED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function markViewed(storyId: string) {
  try {
    const s = getViewedSet();
    s.add(storyId);
    localStorage.setItem(VIEWED_KEY, JSON.stringify([...s]));
  } catch {
    // ignore
  }
}

export function useStories() {
  return useQuery({
    queryKey: ["stories"],
    queryFn: async () => {
      const stories = await fetchActiveStories();
      const viewed = getViewedSet();

      const byUser = new Map<string, UserStories>();
      for (const story of stories) {
        if (!byUser.has(story.uid)) {
          byUser.set(story.uid, {
            uid: story.uid,
            userHandle: story.userHandle,
            userDisplayName: story.userDisplayName,
            userPhotoURL: story.userPhotoURL,
            stories: [],
            hasUnviewed: false,
          });
        }
        const entry = byUser.get(story.uid)!;
        entry.stories.push(story);
        if (!viewed.has(story.id)) entry.hasUnviewed = true;
      }

      return [...byUser.values()];
    },
    staleTime: 60_000,
  });
}

export function useCreateStory() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      imageFile,
      caption,
    }: {
      imageFile: File;
      caption: string;
    }) => {
      if (!user) throw new Error("Must be signed in");
      return createStory(
        {
          uid: user.uid,
          handle: user.handle,
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
        imageFile,
        caption
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stories"] }),
  });
}

export function useDeleteStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (storyId: string) => deleteStory(storyId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stories"] }),
  });
}
