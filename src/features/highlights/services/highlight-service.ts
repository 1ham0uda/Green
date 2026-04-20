import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { CreateHighlightInput, Highlight } from "../types";

const COL = COLLECTIONS.highlights;

export async function fetchHighlightsByUser(uid: string): Promise<Highlight[]> {
  const q = query(
    collection(firestore, COL),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      uid: data.uid,
      title: data.title,
      coverImageURL: data.coverImageURL,
      imageURLs: data.imageURLs ?? [],
      createdAt: data.createdAt ?? null,
    };
  });
}

export async function createHighlight(
  uid: string,
  input: CreateHighlightInput
): Promise<string> {
  const ref = await addDoc(collection(firestore, COL), {
    uid,
    title: input.title.trim(),
    coverImageURL: input.coverImageURL,
    imageURLs: input.imageURLs,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteHighlight(highlightId: string): Promise<void> {
  await deleteDoc(doc(firestore, COL, highlightId));
}
