"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchFeed, type FeedPage } from "../services/post-service";

const PAGE_SIZE = 10;

export function useFeed() {
  return useInfiniteQuery<FeedPage, Error>({
    queryKey: ["feed"],
    initialPageParam: null,
    queryFn: ({ pageParam }) =>
      fetchFeed(PAGE_SIZE, pageParam as FeedPage["cursor"]),
    getNextPageParam: (lastPage) => lastPage.cursor ?? undefined,
  });
}
