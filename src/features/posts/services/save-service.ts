import {
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  collection,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  limit,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { ValidationError } from "@/lib/security/validation";
import type { Post } from "../types";

const SAVED_LIMIT = 200;
const BATCH_SIZE  = 30; // Firestore `in` operator maximum
const ID_RE = /^[A-Za-z0-9_-]{1,128}$/;

function assertId(value: string, field: string): void {
  if (typeof value !== "string" || !ID_RE.test(value)) {
    throw new ValidationError(`Invalid ${field}.`);
  }
}

function savedDocId(userId: string, postId: string) {
  return `${userId}_${postId}`;
}

export async function savePost(userId: string, postId: string): Promise<void> {
  checkRateLimit("post.save");
  assertId(userId, "user id");
  assertId(postId, "post id");
  const ref = doc(firestore, COLLECTIONS.savedPosts, savedDocId(userId, postId));
  await setDoc(ref, { userId, postId, savedAt: serverTimestamp() });
}

export async function unsavePost(userId: string, postId: string): Promise<void> {
  checkRateLimit("post.save");
  assertId(userId, "user id");
  assertId(postId, "post id");
  await deleteDoc(doc(firestore, COLLECTIONS.savedPosts, savedDocId(userId, postId)));
}

export async function isPostSaved(userId: string, postId: string): Promise<boolean> {
  const snap = await getDoc(doc(firestore, COLLECTIONS.savedPosts, savedDocId(userId, postId)));
  return snap.exists();
}

export async function fetchSavedPostIds(userId: string): Promise<string[]> {
  const snap = await getDocs(
    query(
      collection(firestore, COLLECTIONS.savedPosts),
      where("userId", "==", userId),
      orderBy("savedAt", "desc"),
      limit(SAVED_LIMIT)
    )
  );
  return snap.docs.map((d) => d.data().postId as string);
}

export async function fetchSavedPosts(userId: string): Promise<Post[]> {
  const ids = await fetchSavedPostIds(userId);
  if (ids.length === 0) return [];

  // Batch into chunks of BATCH_SIZE to stay within Firestore `in` limit.
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    chunks.push(ids.slice(i, i + BATCH_SIZE));
  }

  const results = await Promise.all(
    chunks.map((chunk) =>
      getDocs(
        query(
          collection(firestore, COLLECTIONS.posts),
          where("__name__", "in", chunk)
        )
      )
    )
  );

  // Flatten and preserve the savedAt ordering by sorting against the original ids array.
  const postMap = new Map<string, Post>();
  for (const snap of results) {
    for (const d of snap.docs) {
      const data = d.data();
      postMap.set(d.id, {
        id: d.id,
        authorId: data.authorId,
        authorHandle: data.authorHandle,
        authorDisplayName: data.authorDisplayName,
        authorPhotoURL: data.authorPhotoURL ?? null,
        authorIsVerified: data.authorIsVerified ?? false,
        caption: data.caption,
        imageURLs: Array.isArray(data.imageURLs) ? data.imageURLs : data.imageURL ? [data.imageURL] : [],
        plantId: data.plantId ?? null,
        status: data.status ?? "approved",
        rejectionReason: data.rejectionReason ?? null,
        country: data.country ?? "",
        governorate: data.governorate ?? "",
        city: data.city ?? "",
        likeCount: data.likeCount ?? 0,
        commentCount: data.commentCount ?? 0,
        createdAt: data.createdAt ?? null,
      } as Post);
    }
  }

  // Return in saved-at order, dropping any deleted posts.
  return ids.map((id) => postMap.get(id)).filter((p): p is Post => p !== undefined);
}
