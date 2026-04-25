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
import { validateString, ValidationError } from "@/lib/security/validation";
import type { CreateHighlightInput, Highlight } from "../types";

const COL = COLLECTIONS.highlights;
const ID_RE = /^[A-Za-z0-9_-]{1,128}$/;
const MAX_HIGHLIGHT_IMAGES = 20;
const URL_RE = /^https:\/\//;

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
  if (!ID_RE.test(uid)) throw new ValidationError("Invalid user id.");

  const title = validateString(input.title, { field: "Title", min: 1, max: 80 });

  // coverImageURL and imageURLs come from already-uploaded Firebase Storage URLs.
  if (typeof input.coverImageURL !== "string" || !URL_RE.test(input.coverImageURL)) {
    throw new ValidationError("Cover image URL is invalid.");
  }
  if (!Array.isArray(input.imageURLs) || input.imageURLs.length > MAX_HIGHLIGHT_IMAGES) {
    throw new ValidationError("Too many images in highlight.");
  }
  const imageURLs = input.imageURLs.filter(
    (u) => typeof u === "string" && URL_RE.test(u)
  );

  const ref = await addDoc(collection(firestore, COL), {
    uid,
    title,
    coverImageURL: input.coverImageURL,
    imageURLs,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteHighlight(highlightId: string): Promise<void> {
  if (!ID_RE.test(highlightId)) throw new ValidationError("Invalid highlight id.");
  await deleteDoc(doc(firestore, COL, highlightId));
}
