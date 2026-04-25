import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { validateString } from "@/lib/security/validation";

const ACTIVE_DOC = "current";

export interface Announcement {
  message: string;
  active: boolean;
  createdAt: Date | null;
}

function toAnnouncement(data: Record<string, unknown>): Announcement {
  return {
    message: (data.message as string) ?? "",
    active: (data.active as boolean) ?? false,
    createdAt: data.createdAt
      ? (data.createdAt as { toDate: () => Date }).toDate()
      : null,
  };
}

export async function getAnnouncement(): Promise<Announcement | null> {
  const ref = doc(firestore, COLLECTIONS.announcements, ACTIVE_DOC);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return toAnnouncement(snap.data() as Record<string, unknown>);
}

export function subscribeToAnnouncement(
  callback: (a: Announcement | null) => void
): Unsubscribe {
  const ref = doc(firestore, COLLECTIONS.announcements, ACTIVE_DOC);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    callback(toAnnouncement(snap.data() as Record<string, unknown>));
  });
}

export async function publishAnnouncement(message: string): Promise<void> {
  const cleanMessage = validateString(message,
    { field: "Announcement", min: 1, max: 500 });
  const ref = doc(firestore, COLLECTIONS.announcements, ACTIVE_DOC);
  await setDoc(ref, {
    message: cleanMessage,
    active: true,
    createdAt: serverTimestamp(),
  });
}

export async function clearAnnouncement(): Promise<void> {
  const ref = doc(firestore, COLLECTIONS.announcements, ACTIVE_DOC);
  await updateDoc(ref, { active: false });
}
