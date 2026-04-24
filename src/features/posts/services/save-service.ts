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
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { Post } from "../types";

function savedDocId(userId: string, postId: string) {
  return `${userId}_${postId}`;
}

export async function savePost(userId: string, postId: string): Promise<void> {
  const ref = doc(firestore, COLLECTIONS.savedPosts, savedDocId(userId, postId));
  await setDoc(ref, { userId, postId, savedAt: serverTimestamp() });
}

export async function unsavePost(userId: string, postId: string): Promise<void> {
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
      orderBy("savedAt", "desc")
    )
  );
  return snap.docs.map((d) => d.data().postId as string);
}

export async function fetchSavedPosts(userId: string): Promise<Post[]> {
  const ids = await fetchSavedPostIds(userId);
  if (ids.length === 0) return [];
  const postDocs = await Promise.all(
    ids.map((id) => getDoc(doc(firestore, COLLECTIONS.posts, id)))
  );
  return postDocs
    .filter((d) => d.exists())
    .map((d) => {
      const data = d.data()!;
      return {
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
      } as Post;
    });
}
