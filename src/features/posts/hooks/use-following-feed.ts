"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { Post } from "../types";
import type { FeedPage } from "../services/post-service";

const PAGE_SIZE  = 10;
const IN_LIMIT   = 30; // Firestore `in` operator maximum per query

// ─── Following IDs ─────────────────────────────────────────────────────────
// Fetched once, cached by TanStack Query with a long staleTime so that every
// feed page request does NOT re-query the follows collection.

async function fetchAllFollowingIds(userId: string): Promise<string[]> {
  const snap = await getDocs(
    query(
      collection(firestore, COLLECTIONS.follows),
      where("followerId", "==", userId)
      // No limit — we need the full list to chunk into `in` batches.
    )
  );
  return snap.docs.map((d) => d.data().followingId as string);
}

export function useFollowingIds(userId: string | null | undefined) {
  return useQuery({
    queryKey: ["followingIds", userId],
    queryFn: () => fetchAllFollowingIds(userId!),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000, // 5 min — only refetch after follow/unfollow
  });
}

// ─── Feed query ──────────────────────────────────────────────────────────────

function mapPost(d: QueryDocumentSnapshot): Post {
  const data = d.data();
  return {
    id: d.id,
    authorId: data.authorId,
    authorHandle: data.authorHandle,
    authorDisplayName: data.authorDisplayName,
    authorPhotoURL: data.authorPhotoURL ?? null,
    authorIsVerified: data.authorIsVerified ?? false,
    caption: data.caption,
    imageURLs: Array.isArray(data.imageURLs) && data.imageURLs.length > 0
      ? (data.imageURLs as string[])
      : data.imageURL
      ? [data.imageURL as string]
      : [],
    plantId: data.plantId ?? null,
    status: (data.status as Post["status"]) ?? "approved",
    rejectionReason: (data.rejectionReason as string | null) ?? null,
    country: (data.country as string) ?? "",
    governorate: (data.governorate as string) ?? "",
    city: (data.city as string) ?? "",
    likeCount: data.likeCount ?? 0,
    commentCount: data.commentCount ?? 0,
    createdAt: data.createdAt ?? null,
  };
}

async function fetchFollowingFeedPage(
  followingIds: string[],
  pageSize: number,
  cursor: QueryDocumentSnapshot | null
): Promise<FeedPage> {
  if (followingIds.length === 0) return { items: [], cursor: null };

  // Split into batches of IN_LIMIT and run parallel queries, then merge and
  // re-sort the combined results by createdAt descending.
  const chunks: string[][] = [];
  for (let i = 0; i < followingIds.length; i += IN_LIMIT) {
    chunks.push(followingIds.slice(i, i + IN_LIMIT));
  }

  const snapshots = await Promise.all(
    chunks.map((chunk) => {
      const base = [
        where("authorId", "in", chunk),
        where("status", "==", "approved"),
        orderBy("createdAt", "desc"),
        // Over-fetch per chunk so after merging we have enough for one page.
        limit(pageSize * chunks.length),
      ];
      const q = cursor
        ? query(collection(firestore, COLLECTIONS.posts), ...base, startAfter(cursor))
        : query(collection(firestore, COLLECTIONS.posts), ...base);
      return getDocs(q);
    })
  );

  // Merge all docs, deduplicate by id, sort by createdAt desc, take one page.
  const seen = new Set<string>();
  const allDocs: QueryDocumentSnapshot[] = [];
  for (const snap of snapshots) {
    for (const d of snap.docs) {
      if (!seen.has(d.id)) {
        seen.add(d.id);
        allDocs.push(d);
      }
    }
  }
  allDocs.sort((a, b) => {
    const at = a.data().createdAt?.toMillis() ?? 0;
    const bt = b.data().createdAt?.toMillis() ?? 0;
    return bt - at;
  });

  const pageDocs = allDocs.slice(0, pageSize);
  const items = pageDocs.map(mapPost);
  const nextCursor = pageDocs.length === pageSize ? pageDocs[pageDocs.length - 1] : null;

  return { items, cursor: nextCursor };
}

export function useFollowingFeed(userId: string | null | undefined) {
  const { data: followingIds } = useFollowingIds(userId);

  return useInfiniteQuery<FeedPage, Error>({
    queryKey: ["feed", "following", userId, followingIds],
    initialPageParam: null,
    queryFn: ({ pageParam }) =>
      fetchFollowingFeedPage(
        followingIds ?? [],
        PAGE_SIZE,
        pageParam as FeedPage["cursor"]
      ),
    getNextPageParam: (lastPage) => lastPage.cursor ?? undefined,
    enabled: Boolean(userId) && followingIds !== undefined,
  });
}
