"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isPostSaved, savePost, unsavePost, fetchSavedPostIds, fetchSavedPosts } from "../services/save-service";

export function useIsPostSaved(userId: string | null | undefined, postId: string) {
  return useQuery({
    queryKey: ["saved", userId, postId],
    queryFn: () => isPostSaved(userId as string, postId),
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
}

export function useSavedPostIds(userId: string | null | undefined) {
  return useQuery({
    queryKey: ["saved-ids", userId],
    queryFn: () => fetchSavedPostIds(userId as string),
    enabled: Boolean(userId),
  });
}

export function useSavedPosts(userId: string | null | undefined) {
  return useQuery({
    queryKey: ["saved-posts", userId],
    queryFn: () => fetchSavedPosts(userId as string),
    enabled: Boolean(userId),
  });
}

export function useSavePost(userId: string | null | undefined, postId: string) {
  const qc = useQueryClient();

  const save = useMutation({
    mutationFn: () => savePost(userId as string, postId),
    onSuccess: () => {
      qc.setQueryData(["saved", userId, postId], true);
      qc.invalidateQueries({ queryKey: ["saved-ids", userId] });
    },
  });

  const unsave = useMutation({
    mutationFn: () => unsavePost(userId as string, postId),
    onSuccess: () => {
      qc.setQueryData(["saved", userId, postId], false);
      qc.invalidateQueries({ queryKey: ["saved-ids", userId] });
    },
  });

  return { save, unsave };
}
