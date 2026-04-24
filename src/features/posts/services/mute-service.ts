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

function muteDocId(muterId: string, mutedId: string) {
  return `${muterId}_${mutedId}`;
}

export async function muteUser(muterId: string, mutedId: string): Promise<void> {
  const ref = doc(firestore, COLLECTIONS.mutedUsers, muteDocId(muterId, mutedId));
  await setDoc(ref, { muterId, mutedId, mutedAt: serverTimestamp() });
}

export async function unmuteUser(muterId: string, mutedId: string): Promise<void> {
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
