import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
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
import type { PublicProfile, UpdateProfileInput } from "../types";
import type { UserProfile } from "@/features/auth/types";
import { FirestorePatch } from "@/types/firestore";
import { createNotification } from "@/features/notifications/services/notification-service";

export async function getProfileById(uid: string): Promise<PublicProfile | null> {
  const ref = doc(firestore, COLLECTIONS.users, uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function getProfileByHandle(
  handle: string
): Promise<PublicProfile | null> {
  const q = query(
    collection(firestore, COLLECTIONS.users),
    where("handle", "==", handle),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as UserProfile;
}

export async function updateProfile(
  uid: string,
  input: UpdateProfileInput
): Promise<void> {
  const patch: FirestorePatch<UserProfile> = {
    updatedAt: serverTimestamp(),
  };

  if (input.displayName !== undefined) patch.displayName = input.displayName;
  if (input.bio !== undefined) patch.bio = input.bio;
  if (input.handle !== undefined) patch.handle = input.handle;

  if (input.avatarFile) {
    const path = buildUserScopedPath("avatars", uid, input.avatarFile.name);
    patch.photoURL = await uploadImage(path, input.avatarFile);
  }

  const ref = doc(firestore, COLLECTIONS.users, uid);
  await updateDoc(ref, patch);
}

function buildFollowId(followerId: string, followingId: string): string {
  return `${followerId}_${followingId}`;
}

export async function followUser(
  followerId: string,
  followerHandle: string,
  followingId: string
): Promise<void> {
  if (followerId === followingId) {
    throw new Error("Cannot follow yourself");
  }

  const followId = buildFollowId(followerId, followingId);
  const followRef = doc(firestore, COLLECTIONS.follows, followId);
  const followerRef = doc(firestore, COLLECTIONS.users, followerId);
  const followingRef = doc(firestore, COLLECTIONS.users, followingId);

  let didFollow = false;
  await runTransaction(firestore, async (tx) => {
    const existing = await tx.get(followRef);
    if (existing.exists()) return;

    tx.set(followRef, {
      followerId,
      followingId,
      createdAt: serverTimestamp(),
    });
    tx.update(followerRef, { followingCount: increment(1) });
    tx.update(followingRef, { followerCount: increment(1) });
    didFollow = true;
  });

  if (didFollow) {
    void createNotification({
      toUserId: followingId,
      fromUserId: followerId,
      fromUserHandle: followerHandle,
      fromUserDisplayName: followerHandle,
      type: "follow",
    });
  }
}

export async function unfollowUser(
  followerId: string,
  followingId: string
): Promise<void> {
  const followId = buildFollowId(followerId, followingId);
  const followRef = doc(firestore, COLLECTIONS.follows, followId);
  const followerRef = doc(firestore, COLLECTIONS.users, followerId);
  const followingRef = doc(firestore, COLLECTIONS.users, followingId);

  await runTransaction(firestore, async (tx) => {
    const existing = await tx.get(followRef);
    if (!existing.exists()) return;

    tx.delete(followRef);
    tx.update(followerRef, { followingCount: increment(-1) });
    tx.update(followingRef, { followerCount: increment(-1) });
  });
}

export async function isFollowing(
  followerId: string,
  followingId: string
): Promise<boolean> {
  const followId = buildFollowId(followerId, followingId);
  const snap = await getDoc(doc(firestore, COLLECTIONS.follows, followId));
  return snap.exists();
}

// Exported to avoid unused-symbol warnings; useful for admin / cleanup flows.
export async function deleteFollowEdge(followId: string): Promise<void> {
  await deleteDoc(doc(firestore, COLLECTIONS.follows, followId));
}

export async function seedProfileIfMissing(profile: UserProfile): Promise<void> {
  const ref = doc(firestore, COLLECTIONS.users, profile.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  await setDoc(ref, {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
