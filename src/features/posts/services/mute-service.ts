import {
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { ValidationError } from "@/lib/security/validation";

const ID_RE = /^[A-Za-z0-9_-]{1,128}$/;

function muteDocId(muterId: string, mutedId: string) {
  return `${muterId}_${mutedId}`;
}

export async function muteUser(muterId: string, mutedId: string): Promise<void> {
  checkRateLimit("mute.toggle");
  if (!ID_RE.test(muterId) || !ID_RE.test(mutedId)) {
    throw new ValidationError("Invalid user id.");
  }
  if (muterId === mutedId) {
    throw new ValidationError("You cannot mute yourself.");
  }
  const ref = doc(firestore, COLLECTIONS.mutedUsers, muteDocId(muterId, mutedId));
  await setDoc(ref, { muterId, mutedId, mutedAt: serverTimestamp() });
}

export async function unmuteUser(muterId: string, mutedId: string): Promise<void> {
  checkRateLimit("mute.toggle");
  if (!ID_RE.test(muterId) || !ID_RE.test(mutedId)) {
    throw new ValidationError("Invalid user id.");
  }
  await deleteDoc(doc(firestore, COLLECTIONS.mutedUsers, muteDocId(muterId, mutedId)));
}

export async function isUserMuted(muterId: string, mutedId: string): Promise<boolean> {
  const snap = await getDoc(doc(firestore, COLLECTIONS.mutedUsers, muteDocId(muterId, mutedId)));
  return snap.exists();
}

export async function fetchMutedUserIds(muterId: string): Promise<string[]> {
  const snap = await getDocs(
    query(
      collection(firestore, COLLECTIONS.mutedUsers),
      where("muterId", "==", muterId)
    )
  );
  return snap.docs.map((d) => d.data().mutedId as string);
}
