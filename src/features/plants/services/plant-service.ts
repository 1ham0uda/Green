import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/config";
import { FirestorePatch } from "@/types/firestore";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { buildUserScopedPath, uploadImage } from "@/lib/firebase/storage";
import type {
  CreatePlantInput,
  Plant,
  UpdatePlantInput,
} from "../types";

const PLANTS = COLLECTIONS.plants;

function mapPlant(docSnap: QueryDocumentSnapshot | DocumentSnapshot): Plant {
  const data = docSnap.data();
  if (!data) throw new Error("Plant snapshot has no data");

  return {
    id: docSnap.id,
    ownerId: data.ownerId,
    name: data.name,
    type: data.type,
    description: data.description ?? "",
    imageURL: data.imageURL ?? null,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

export async function createPlant(
  ownerId: string,
  input: CreatePlantInput
): Promise<Plant> {
  let imageURL: string | null = null;

  if (input.imageFile) {
    const path = buildUserScopedPath("plants", ownerId, input.imageFile.name);
    imageURL = await uploadImage(path, input.imageFile);
  }

  const payload = {
    ownerId,
    name: input.name.trim(),
    type: input.type,
    description: input.description.trim(),
    imageURL,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const created = await addDoc(collection(firestore, PLANTS), payload);
  const snap = await getDoc(created);
  return mapPlant(snap);
}

export async function updatePlant(
  plantId: string,
  ownerId: string,
  input: UpdatePlantInput
): Promise<void> {
  const patch: FirestorePatch<Plant> = {
    updatedAt: serverTimestamp(),
  };

  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.type !== undefined) patch.type = input.type;
  if (input.description !== undefined) patch.description = input.description.trim();

  if (input.imageFile) {
    const path = buildUserScopedPath("plants", ownerId, input.imageFile.name);
    patch.imageURL = await uploadImage(path, input.imageFile);
  }

  await updateDoc(doc(firestore, PLANTS, plantId), patch);
}

export async function deletePlant(plantId: string): Promise<void> {
  await deleteDoc(doc(firestore, PLANTS, plantId));
}

export async function fetchPlantById(plantId: string): Promise<Plant | null> {
  const snap = await getDoc(doc(firestore, PLANTS, plantId));
  return snap.exists() ? mapPlant(snap) : null;
}

export async function fetchPlantsByOwner(ownerId: string): Promise<Plant[]> {
  const q = query(
    collection(firestore, PLANTS),
    where("ownerId", "==", ownerId),
    orderBy("createdAt", "desc"),
    limit(100)
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapPlant);
}
