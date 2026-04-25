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
import {
  validateImageFile,
  validateString,
  ValidationError,
} from "@/lib/security/validation";
import { checkRateLimit } from "@/lib/security/rate-limit";
import type { Story } from "../types";

const COL = COLLECTIONS.stories;
const STORY_TTL_MS = 24 * 60 * 60 * 1000;
const STORY_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
const ID_RE = /^[A-Za-z0-9_-]{1,128}$/;

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
  checkRateLimit("story.create");

  if (!ID_RE.test(author.uid)) throw new ValidationError("Invalid user id.");

  const file = validateImageFile(imageFile,
    { field: "Story image", maxBytes: STORY_IMAGE_MAX_BYTES });
  const cleanCaption = validateString(caption,
    { field: "Caption", min: 0, max: 500 });

  const path = buildUserScopedPath("stories", author.uid, file.name);
  const imageURL = await uploadImage(path, file);

  const now = Date.now();
  const expiresAt = Timestamp.fromMillis(now + STORY_TTL_MS);

  const ref = await addDoc(collection(firestore, COL), {
    uid: author.uid,
    userHandle: author.handle,
    userDisplayName: author.displayName,
    userPhotoURL: author.photoURL,
    imageURL,
    caption: cleanCaption,
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
    caption: cleanCaption,
    createdAt: null,
    expiresAt,
  };
}

export async function deleteStory(storyId: string): Promise<void> {
  if (!ID_RE.test(storyId)) throw new ValidationError("Invalid story id.");
  await deleteDoc(doc(firestore, COL, storyId));
}
