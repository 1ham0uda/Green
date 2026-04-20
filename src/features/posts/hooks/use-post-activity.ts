"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPostsByAuthor } from "../services/post-service";

export interface PostActivityResult {
  weeklyCount: number;
  monthlyCount: number;
  canOrder: boolean;
  isLoading: boolean;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export function usePostActivityCheck(uid: string | null | undefined): PostActivityResult {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts", "author", uid, "activity"],
    queryFn: () => fetchPostsByAuthor(uid as string),
    enabled: Boolean(uid),
    staleTime: 2 * 60 * 1000,
  });

  if (!posts || isLoading) {
    return { weeklyCount: 0, monthlyCount: 0, canOrder: false, isLoading };
  }

  const now = Date.now();
  const weekAgo = now - WEEK_MS;
  const monthAgo = now - MONTH_MS;

  let weeklyCount = 0;
  let monthlyCount = 0;

  for (const post of posts) {
    const ms = post.createdAt?.toMillis() ?? 0;
    if (ms >= monthAgo) monthlyCount++;
    if (ms >= weekAgo) weeklyCount++;
  }

  const canOrder = weeklyCount > 7 && monthlyCount > 30;
  return { weeklyCount, monthlyCount, canOrder, isLoading: false };
}
