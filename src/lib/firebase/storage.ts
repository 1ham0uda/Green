import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { firebaseStorage } from "./config";

export async function uploadImage(
  path: string,
  file: File | Blob
): Promise<string> {
  const fileRef = ref(firebaseStorage, path);
  const snapshot = await uploadBytes(fileRef, file);
  return getDownloadURL(snapshot.ref);
}

export function buildUserScopedPath(
  folder: "avatars" | "covers" | "posts" | "plants" | "products" | "stories" | "groups" | "ads" | "returns",
  uid: string,
  filename: string
): string {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${folder}/${uid}/${Date.now()}-${safeName}`;
}
