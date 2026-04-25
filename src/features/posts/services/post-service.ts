import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { buildUserScopedPath, uploadImage } from "@/lib/firebase/storage";
import { log } from "@/lib/logger";
import { createNotification } from "@/features/notifications/services/notification-service";
import { validateString, validateImageFiles } from "@/lib/security/validation";
import { checkRateLimit } from "@/lib/security/rate-limit";
import type { UserProfile } from "@/features/auth/types";
import type { Comment, CreatePostInput, Post } from "../types";

const MAX_IMAGES_PER_POST = 10;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const POSTS = COLLECTIONS.posts;
const USERS = COLLECTIONS.users;

function mapPost(docSnap: QueryDocumentSnapshot | DocumentSnapshot): Post {
  const data = docSnap.data();
  if (!data) {
    throw new Error("Post snapshot has no data");
  }
  return {
    id: docSnap.id,
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

export async function createPost(
  author: UserProfile,
  input: CreatePostInput
): Promise<Post> {
  checkRateLimit("post.create");

  if (author.isBanned) {
    throw new Error("Your account is suspended.");
  }

  const caption = validateString(input.caption,
    { field: "Caption", min: 0, max: 2200 });
  const files = validateImageFiles(input.imageFiles, {
    field: "Image", maxBytes: MAX_IMAGE_BYTES, maxCount: MAX_IMAGES_PER_POST,
  });
  // Posts must have at least one image OR a caption — no empty posts.
  if (files.length === 0 && caption.length === 0) {
    throw new Error("Post must contain a caption or an image.");
  }
  // plantId, if set, must look like a Firestore document id (no path traversal).
  const plantId = input.plantId
    ? (typeof input.plantId === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(input.plantId)
        ? input.plantId
        : null)
    : null;

  const imageURLs = await Promise.all(
    files.map((file) => {
      const path = buildUserScopedPath("posts", author.uid, file.name);
      return uploadImage(path, file);
    })
  );

  const authorRef = doc(firestore, USERS, author.uid);
  const postRef   = doc(collection(firestore, POSTS));

  const payload = {
    authorId: author.uid,
    authorHandle: author.handle,
    authorDisplayName: author.displayName,
    authorPhotoURL: author.photoURL,
    authorIsVerified: author.isVerified ?? false,
    caption,
    imageURLs,
    plantId,
    status: "pending" as const,
    rejectionReason: null,
    country: author.country ?? "EG",
    governorate: author.governorate ?? "",
    city: author.city ?? "",
    likeCount: 0,
    commentCount: 0,
    createdAt: serverTimestamp(),
  };

  // Write the post document and increment postCount atomically so the counter
  // never drifts if one of the two writes fails.
  await runTransaction(firestore, async (tx) => {
    tx.set(postRef, payload);
    tx.update(authorRef, { postCount: increment(1) });
  });

  void log("post.create", author.uid, { targetId: postRef.id });

  const snap = await getDoc(postRef);
  return mapPost(snap);
}

export interface FeedPage {
  items: Post[];
  cursor: QueryDocumentSnapshot | null;
}

export async function fetchFeed(
  pageSize = 10,
  cursor: QueryDocumentSnapshot | null = null
): Promise<FeedPage> {
  const base = query(
    collection(firestore, POSTS),
    where("status", "==", "approved"),
    orderBy("createdAt", "desc"),
    limit(pageSize)
  );

  const q = cursor
    ? query(
        collection(firestore, POSTS),
        where("status", "==", "approved"),
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

export async function fetchPostsByAuthor(
  authorId: string,
  { approvedOnly = false }: { approvedOnly?: boolean } = {}
): Promise<Post[]> {
  const constraints = [
    where("authorId", "==", authorId),
    ...(approvedOnly ? [where("status", "==", "approved")] : []),
    orderBy("createdAt", "desc"),
    limit(50),
  ];
  const q = query(collection(firestore, POSTS), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(mapPost);
}

export async function fetchPostsByPlant(plantId: string): Promise<Post[]> {
  const q = query(
    collection(firestore, POSTS),
    where("plantId", "==", plantId),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapPost);
}

export async function fetchPostById(postId: string): Promise<Post | null> {
  const snap = await getDoc(doc(firestore, POSTS, postId));
  return snap.exists() ? mapPost(snap) : null;
}

export async function deletePost(postId: string, authorId: string): Promise<void> {
  checkRateLimit("post.delete");
  const postRef   = doc(firestore, POSTS, postId);
  const authorRef = doc(firestore, USERS, authorId);
  await runTransaction(firestore, async (tx) => {
    tx.delete(postRef);
    tx.update(authorRef, { postCount: increment(-1) });
  });
}

// Likes: subcollection doc id == userId
export async function likePost(
  postId: string,
  userId: string,
  liker: { handle: string; displayName: string },
  postAuthorId: string
): Promise<void> {
  checkRateLimit("post.like");
  const postRef = doc(firestore, POSTS, postId);
  const likeRef = doc(firestore, POSTS, postId, COLLECTIONS.likes, userId);

  let didLike = false;
  await runTransaction(firestore, async (tx) => {
    const existing = await tx.get(likeRef);
    if (existing.exists()) return;

    tx.set(likeRef, { userId, createdAt: serverTimestamp() });
    tx.update(postRef, { likeCount: increment(1) });
    didLike = true;
  });

  if (didLike && postAuthorId !== userId) {
    void createNotification({
      toUserId: postAuthorId,
      fromUserId: userId,
      fromUserHandle: liker.handle,
      fromUserDisplayName: liker.displayName,
      type: "like",
      postId,
    });
  }
}

export async function unlikePost(postId: string, userId: string): Promise<void> {
  checkRateLimit("post.like");
  const postRef = doc(firestore, POSTS, postId);
  const likeRef = doc(firestore, POSTS, postId, COLLECTIONS.likes, userId);

  await runTransaction(firestore, async (tx) => {
    const existing = await tx.get(likeRef);
    if (!existing.exists()) return;

    tx.delete(likeRef);
    tx.update(postRef, { likeCount: increment(-1) });
  });
}

export async function hasLiked(postId: string, userId: string): Promise<boolean> {
  const snap = await getDoc(
    doc(firestore, POSTS, postId, COLLECTIONS.likes, userId)
  );
  return snap.exists();
}

// Comments
export async function addComment(
  postId: string,
  author: UserProfile,
  body: string,
  postAuthorId?: string
): Promise<Comment> {
  checkRateLimit("post.comment");

  if (author.isBanned) {
    throw new Error("Your account is suspended.");
  }

  const cleanBody = validateString(body, { field: "Comment", min: 1, max: 1000 });

  const postRef = doc(firestore, POSTS, postId);
  const commentRef = doc(collection(firestore, POSTS, postId, COLLECTIONS.comments));

  const payload = {
    postId,
    authorId: author.uid,
    authorHandle: author.handle,
    authorDisplayName: author.displayName,
    body: cleanBody,
    createdAt: serverTimestamp(),
  };

  // Write comment and increment commentCount atomically.
  await runTransaction(firestore, async (tx) => {
    tx.set(commentRef, payload);
    tx.update(postRef, { commentCount: increment(1) });
  });

  void log("post.comment", author.uid, { targetId: postId });

  if (postAuthorId && postAuthorId !== author.uid) {
    void createNotification({
      toUserId: postAuthorId,
      fromUserId: author.uid,
      fromUserHandle: author.handle,
      fromUserDisplayName: author.displayName,
      type: "comment",
      postId,
    });
  }

  const snap = await getDoc(commentRef);
  const data = snap.data();
  if (!data) throw new Error("Comment write failed");
  return { id: snap.id, ...(data as Omit<Comment, "id">) };
}

export async function tagPostPlant(
  postId: string,
  plantId: string | null
): Promise<void> {
  await updateDoc(doc(firestore, POSTS, postId), {
    plantId: plantId ?? null,
    updatedAt: serverTimestamp(),
  });
}

export async function fetchComments(postId: string): Promise<Comment[]> {
  const q = query(
    collection(firestore, POSTS, postId, COLLECTIONS.comments),
    orderBy("createdAt", "asc"),
    limit(100)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      postId: data.postId,
      authorId: data.authorId,
      authorHandle: data.authorHandle,
      authorDisplayName: data.authorDisplayName,
      body: data.body,
      createdAt: data.createdAt ?? null,
    };
  });
}
