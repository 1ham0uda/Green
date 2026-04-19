import {
  addDoc,
  collection,
  deleteDoc,
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
import type { UserProfile } from "@/features/auth/types";
import type { Comment, CreatePostInput, Post } from "../types";

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
    imageURL: data.imageURL,
    plantId: data.plantId ?? null,
    likeCount: data.likeCount ?? 0,
    commentCount: data.commentCount ?? 0,
    createdAt: data.createdAt ?? null,
  };
}

export async function createPost(
  author: UserProfile,
  input: CreatePostInput
): Promise<Post> {
  const path = buildUserScopedPath("posts", author.uid, input.imageFile.name);
  const imageURL = await uploadImage(path, input.imageFile);

  const authorRef = doc(firestore, USERS, author.uid);
  const postsRef = collection(firestore, POSTS);

  const payload = {
    authorId: author.uid,
    authorHandle: author.handle,
    authorDisplayName: author.displayName,
    authorPhotoURL: author.photoURL,
    authorIsVerified: author.isVerified ?? false,
    caption: input.caption.trim(),
    imageURL,
    plantId: input.plantId ?? null,
    likeCount: 0,
    commentCount: 0,
    createdAt: serverTimestamp(),
  };

  const created = await addDoc(postsRef, payload);
  await updateDoc(authorRef, { postCount: increment(1) });

  void log("post.create", author.uid, { targetId: created.id });

  const snap = await getDoc(created);
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
    orderBy("createdAt", "desc"),
    limit(pageSize)
  );

  const q = cursor
    ? query(
        collection(firestore, POSTS),
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

export async function fetchPostsByAuthor(authorId: string): Promise<Post[]> {
  const q = query(
    collection(firestore, POSTS),
    where("authorId", "==", authorId),
    orderBy("createdAt", "desc"),
    limit(50)
  );
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
  await deleteDoc(doc(firestore, POSTS, postId));
  await updateDoc(doc(firestore, USERS, authorId), { postCount: increment(-1) });
}

// Likes: subcollection doc id == userId
export async function likePost(
  postId: string,
  userId: string,
  liker: { handle: string; displayName: string },
  postAuthorId: string
): Promise<void> {
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
  const postRef = doc(firestore, POSTS, postId);
  const commentsRef = collection(firestore, POSTS, postId, COLLECTIONS.comments);

  const payload = {
    postId,
    authorId: author.uid,
    authorHandle: author.handle,
    authorDisplayName: author.displayName,
    body: body.trim(),
    createdAt: serverTimestamp(),
  };

  const created = await addDoc(commentsRef, payload);
  await updateDoc(postRef, { commentCount: increment(1) });

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

  const snap = await getDoc(created);
  const data = snap.data();
  if (!data) throw new Error("Comment write failed");
  return { id: snap.id, ...(data as Omit<Comment, "id">) };
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
