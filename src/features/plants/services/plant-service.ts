import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
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
import {
  validateImageFile,
  validateString,
  ValidationError,
} from "@/lib/security/validation";
import { checkRateLimit } from "@/lib/security/rate-limit";
import type {
  CreatePlantInput,
  Plant,
  UpdatePlantInput,
} from "../types";

const PLANTS = COLLECTIONS.plants;
const ID_RE = /^[A-Za-z0-9_-]{1,128}$/;
const PLANT_IMAGE_MAX_BYTES = 8 * 1024 * 1024;

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
  checkRateLimit("plant.create");
  if (!ID_RE.test(ownerId)) throw new ValidationError("Invalid owner id.");

  const name = validateString(input.name, { field: "Plant name", min: 1, max: 100 });
  const type = validateString(input.type, { field: "Plant type", min: 1, max: 100 });
  const description = validateString(input.description,
    { field: "Description", min: 0, max: 1000 });

  let imageURL: string | null = null;
  if (input.imageFile) {
    const file = validateImageFile(input.imageFile,
      { field: "Plant image", maxBytes: PLANT_IMAGE_MAX_BYTES });
    const path = buildUserScopedPath("plants", ownerId, file.name);
    imageURL = await uploadImage(path, file);
  }

  const payload = {
    ownerId,
    name,
    type,
    description,
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
  checkRateLimit("plant.update");
  if (!ID_RE.test(plantId) || !ID_RE.test(ownerId)) {
    throw new ValidationError("Invalid plant or owner id.");
  }

  const patch: FirestorePatch<Plant> = {
    updatedAt: serverTimestamp(),
  };

  if (input.name !== undefined) {
    patch.name = validateString(input.name,
      { field: "Plant name", min: 1, max: 100 });
  }
  if (input.type !== undefined) {
    patch.type = validateString(input.type,
      { field: "Plant type", min: 1, max: 100 }) as Plant["type"];
  }
  if (input.description !== undefined) {
    patch.description = validateString(input.description,
      { field: "Description", min: 0, max: 1000 });
  }

  if (input.imageFile) {
    const file = validateImageFile(input.imageFile,
      { field: "Plant image", maxBytes: PLANT_IMAGE_MAX_BYTES });
    const path = buildUserScopedPath("plants", ownerId, file.name);
    patch.imageURL = await uploadImage(path, file);
  }

  await updateDoc(doc(firestore, PLANTS, plantId), patch);
}

export async function deletePlant(plantId: string): Promise<void> {
  if (!ID_RE.test(plantId)) throw new ValidationError("Invalid plant id.");
  await deleteDoc(doc(firestore, PLANTS, plantId));
}

export async function fetchPlantById(plantId: string): Promise<Plant | null> {
  if (!ID_RE.test(plantId)) return null;
  const snap = await getDoc(doc(firestore, PLANTS, plantId));
  return snap.exists() ? mapPlant(snap) : null;
}

export async function fetchPlantsByOwner(ownerId: string): Promise<Plant[]> {
  const q = query(
    collection(firestore, PLANTS),
    where("ownerId", "==", ownerId),
    limit(100)
  );
  const snap = await getDocs(q);
  const plants = snap.docs.map(mapPlant);
  return plants.sort((a, b) => {
    const ta = a.createdAt?.toMillis() ?? 0;
    const tb = b.createdAt?.toMillis() ?? 0;
    return tb - ta;
  });
}
