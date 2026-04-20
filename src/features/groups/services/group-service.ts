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
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { buildUserScopedPath, uploadImage } from "@/lib/firebase/storage";
import type {
  CreateGroupInput,
  Group,
  GroupMember,
  GroupPost,
} from "../types";
import type { UserProfile } from "@/features/auth/types";

const G = COLLECTIONS.groups;
const GM = COLLECTIONS.groupMembers;
const GP = COLLECTIONS.groupPosts;

function mapGroup(id: string, d: Record<string, unknown>): Group {
  return {
    id,
    name: d.name as string,
    description: (d.description as string) ?? "",
    coverImageURL: (d.coverImageURL as string | null) ?? null,
    creatorId: d.creatorId as string,
    creatorHandle: d.creatorHandle as string,
    memberCount: (d.memberCount as number) ?? 1,
    postCount: (d.postCount as number) ?? 0,
    isPublic: (d.isPublic as boolean) ?? true,
    createdAt: (d.createdAt as Group["createdAt"]) ?? null,
  };
}

function mapGroupPost(id: string, d: Record<string, unknown>): GroupPost {
  return {
    id,
    groupId: d.groupId as string,
    authorId: d.authorId as string,
    authorHandle: d.authorHandle as string,
    authorDisplayName: d.authorDisplayName as string,
    authorPhotoURL: (d.authorPhotoURL as string | null) ?? null,
    caption: (d.caption as string) ?? "",
    imageURLs: Array.isArray(d.imageURLs) ? (d.imageURLs as string[]) : [],
    likeCount: (d.likeCount as number) ?? 0,
    commentCount: (d.commentCount as number) ?? 0,
    createdAt: (d.createdAt as GroupPost["createdAt"]) ?? null,
  };
}

export async function fetchPublicGroups(): Promise<Group[]> {
  const q = query(
    collection(firestore, G),
    where("isPublic", "==", true),
    orderBy("memberCount", "desc"),
    limit(30)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapGroup(d.id, d.data() as Record<string, unknown>));
}

export async function fetchGroupById(groupId: string): Promise<Group | null> {
  const snap = await getDoc(doc(firestore, G, groupId));
  return snap.exists() ? mapGroup(snap.id, snap.data() as Record<string, unknown>) : null;
}

export async function fetchUserGroups(userId: string): Promise<Group[]> {
  const q = query(
    collection(firestore, GM),
    where("userId", "==", userId),
    limit(50)
  );
  const snap = await getDocs(q);
  const groupIds = snap.docs.map((d) => (d.data() as Record<string, unknown>).groupId as string);
  if (groupIds.length === 0) return [];

  const groups = await Promise.all(groupIds.map(fetchGroupById));
  return groups.filter((g): g is Group => g !== null);
}

export async function createGroup(
  creator: UserProfile,
  input: CreateGroupInput
): Promise<Group> {
  let coverImageURL: string | null = null;
  if (input.coverFile) {
    const path = buildUserScopedPath("groups", creator.uid, input.coverFile.name);
    coverImageURL = await uploadImage(path, input.coverFile);
  }

  const payload = {
    name: input.name.trim(),
    description: input.description.trim(),
    coverImageURL,
    creatorId: creator.uid,
    creatorHandle: creator.handle,
    memberCount: 1,
    postCount: 0,
    isPublic: input.isPublic,
    createdAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(firestore, G), payload);

  // Auto-join creator as admin
  await setDoc(doc(firestore, GM, `${ref.id}_${creator.uid}`), {
    groupId: ref.id,
    userId: creator.uid,
    userHandle: creator.handle,
    userDisplayName: creator.displayName,
    userPhotoURL: creator.photoURL,
    role: "admin",
    joinedAt: serverTimestamp(),
  });

  return mapGroup(ref.id, { ...payload, createdAt: null });
}

function memberDocId(groupId: string, userId: string) {
  return `${groupId}_${userId}`;
}

export async function joinGroup(
  groupId: string,
  user: UserProfile
): Promise<void> {
  const memberId = memberDocId(groupId, user.uid);
  const memberRef = doc(firestore, GM, memberId);
  const groupRef = doc(firestore, G, groupId);

  await runTransaction(firestore, async (tx) => {
    const existing = await tx.get(memberRef);
    if (existing.exists()) return;
    tx.set(memberRef, {
      groupId,
      userId: user.uid,
      userHandle: user.handle,
      userDisplayName: user.displayName,
      userPhotoURL: user.photoURL,
      role: "member",
      joinedAt: serverTimestamp(),
    });
    tx.update(groupRef, { memberCount: increment(1) });
  });
}

export async function leaveGroup(groupId: string, userId: string): Promise<void> {
  const memberId = memberDocId(groupId, userId);
  const memberRef = doc(firestore, GM, memberId);
  const groupRef = doc(firestore, G, groupId);

  await runTransaction(firestore, async (tx) => {
    const existing = await tx.get(memberRef);
    if (!existing.exists()) return;
    tx.delete(memberRef);
    tx.update(groupRef, { memberCount: increment(-1) });
  });
}

export async function isMember(groupId: string, userId: string): Promise<boolean> {
  const snap = await getDoc(doc(firestore, GM, memberDocId(groupId, userId)));
  return snap.exists();
}

export async function fetchGroupMembers(groupId: string): Promise<GroupMember[]> {
  const q = query(
    collection(firestore, GM),
    where("groupId", "==", groupId),
    limit(100)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    return {
      userId: data.userId as string,
      userHandle: data.userHandle as string,
      userDisplayName: data.userDisplayName as string,
      userPhotoURL: (data.userPhotoURL as string | null) ?? null,
      role: (data.role as "admin" | "member") ?? "member",
      joinedAt: (data.joinedAt as GroupMember["joinedAt"]) ?? null,
    };
  });
}

export async function createGroupPost(
  groupId: string,
  author: UserProfile,
  imageFiles: File[],
  caption: string
): Promise<GroupPost> {
  const imageURLs = await Promise.all(
    imageFiles.map((f) => {
      const path = buildUserScopedPath("posts", author.uid, f.name);
      return uploadImage(path, f);
    })
  );

  const payload = {
    groupId,
    authorId: author.uid,
    authorHandle: author.handle,
    authorDisplayName: author.displayName,
    authorPhotoURL: author.photoURL,
    caption: caption.trim(),
    imageURLs,
    likeCount: 0,
    commentCount: 0,
    createdAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(firestore, GP), payload);
  await updateDoc(doc(firestore, G, groupId), { postCount: increment(1) });

  return mapGroupPost(ref.id, { ...payload, createdAt: null });
}

export async function fetchGroupPosts(groupId: string): Promise<GroupPost[]> {
  const q = query(
    collection(firestore, GP),
    where("groupId", "==", groupId),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapGroupPost(d.id, d.data() as Record<string, unknown>));
}

export async function deleteGroupPost(postId: string, groupId: string): Promise<void> {
  await deleteDoc(doc(firestore, GP, postId));
  await updateDoc(doc(firestore, G, groupId), { postCount: increment(-1) });
}
