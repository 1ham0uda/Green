"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
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

const PAGE_SIZE = 10;

async function fetchFollowingIds(userId: string): Promise<string[]> {
  const q = query(
    collection(firestore, COLLECTIONS.follows),
    where("followerId", "==", userId),
    limit(30)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data().followingId as string);
}

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
    imageURL: data.imageURL,
    plantId: data.plantId ?? null,
    likeCount: data.likeCount ?? 0,
    commentCount: data.commentCount ?? 0,
    createdAt: data.createdAt ?? null,
  };
}

async function fetchFollowingFeed(
  userId: string,
  pageSize: number,
  cursor: QueryDocumentSnapshot | null
): Promise<FeedPage> {
  const followingIds = await fetchFollowingIds(userId);

  if (followingIds.length === 0) {
    return { items: [], cursor: null };
  }

  const base = query(
    collection(firestore, COLLECTIONS.posts),
    where("authorId", "in", followingIds),
    orderBy("createdAt", "desc"),
    limit(pageSize)
  );

  const q = cursor
    ? query(
        collection(firestore, COLLECTIONS.posts),
        where("authorId", "in", followingIds),
        orderBy("createdAt", "desc"),
        startAfter(cursor),
        limit(pageSize)
      )
    : base;

  const snap = await getDocs(q);
  const items = snap.docs.map(mapPost);
  const nextCursor =
    snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1] : null;

  return { items, cursor: nextCursor };
}

export function useFollowingFeed(userId: string | null | undefined) {
  return useInfiniteQuery<FeedPage, Error>({
    queryKey: ["feed", "following", userId],
    initialPageParam: null,
    queryFn: ({ pageParam }) =>
      fetchFollowingFeed(
        userId as string,
        PAGE_SIZE,
        pageParam as FeedPage["cursor"]
      ),
    getNextPageParam: (lastPage) => lastPage.cursor ?? undefined,
    enabled: Boolean(userId),
  });
}
