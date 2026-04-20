import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { buildUserScopedPath, uploadImage } from "@/lib/firebase/storage";
import type { Story } from "../types";

const COL = COLLECTIONS.stories;
const STORY_TTL_MS = 24 * 60 * 60 * 1000;

function mapStory(id: string, data: Record<string, unknown>): Story {
  return {
    id,
    uid: data.uid as string,
    userHandle: data.userHandle as string,
    userDisplayName: data.userDisplayName as string,
    userPhotoURL: (data.userPhotoURL as string | null) ?? null,
    imageURL: data.imageURL as string,
    caption: (data.caption as string) ?? "",
    createdAt: (data.createdAt as Timestamp | null) ?? null,
    expiresAt: (data.expiresAt as Timestamp | null) ?? null,
  };
}

export async function fetchActiveStories(): Promise<Story[]> {
  const nowTs = Timestamp.fromMillis(Date.now());
  const q = query(
    collection(firestore, COL),
    where("expiresAt", ">", nowTs),
    orderBy("expiresAt", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapStory(d.id, d.data() as Record<string, unknown>));
}

export async function createStory(
  author: { uid: string; handle: string; displayName: string; photoURL: string | null },
  imageFile: File,
  caption: string
): Promise<Story> {
  const path = buildUserScopedPath("stories", author.uid, imageFile.name);
  const imageURL = await uploadImage(path, imageFile);

  const now = Date.now();
  const expiresAt = Timestamp.fromMillis(now + STORY_TTL_MS);

  const ref = await addDoc(collection(firestore, COL), {
    uid: author.uid,
    userHandle: author.handle,
    userDisplayName: author.displayName,
    userPhotoURL: author.photoURL,
    imageURL,
    caption: caption.trim(),
    createdAt: serverTimestamp(),
    expiresAt,
  });

  return {
    id: ref.id,
    uid: author.uid,
    userHandle: author.handle,
    userDisplayName: author.displayName,
    userPhotoURL: author.photoURL,
    imageURL,
    caption: caption.trim(),
    createdAt: null,
    expiresAt,
  };
}

export async function deleteStory(storyId: string): Promise<void> {
  await deleteDoc(doc(firestore, COL, storyId));
}
