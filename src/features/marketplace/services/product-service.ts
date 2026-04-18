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
import { COLLECTIONS } from "@/lib/firebase/collections";
import { buildUserScopedPath, uploadImage } from "@/lib/firebase/storage";
import type { UserProfile } from "@/features/auth/types";
import { FirestorePatch } from "@/types/firestore";

import type {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from "../types";

const PRODUCTS = COLLECTIONS.products;

function mapProduct(
  snap: QueryDocumentSnapshot | DocumentSnapshot
): Product {
  const data = snap.data();
  if (!data) throw new Error("Product snapshot has no data");
  return {
    id: snap.id,
    vendorId: data.vendorId,
    vendorDisplayName: data.vendorDisplayName ?? "",
    name: data.name,
    description: data.description ?? "",
    price: data.price ?? 0,
    currency: data.currency ?? "USD",
    imageURL: data.imageURL ?? null,
    stock: data.stock ?? 0,
    isActive: data.isActive ?? true,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

export async function fetchActiveProducts(): Promise<Product[]> {
  const q = query(
    collection(firestore, PRODUCTS),
    where("isActive", "==", true),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapProduct);
}

export async function fetchProductsByVendor(
  vendorId: string
): Promise<Product[]> {
  const q = query(
    collection(firestore, PRODUCTS),
    where("vendorId", "==", vendorId),
    orderBy("createdAt", "desc"),
    limit(100)
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapProduct);
}

export async function fetchProductById(
  productId: string
): Promise<Product | null> {
  const snap = await getDoc(doc(firestore, PRODUCTS, productId));
  return snap.exists() ? mapProduct(snap) : null;
}

export async function createProduct(
  vendor: UserProfile,
  input: CreateProductInput
): Promise<Product> {
  if (vendor.role !== "vendor") {
    throw new Error("Only vendors can create products");
  }
  if (input.price < 0) throw new Error("Price must be non-negative");
  if (input.stock < 0) throw new Error("Stock must be non-negative");

  let imageURL: string | null = null;
  if (input.imageFile) {
    const path = buildUserScopedPath("products", vendor.uid, input.imageFile.name);
    imageURL = await uploadImage(path, input.imageFile);
  }

  const payload = {
    vendorId: vendor.uid,
    vendorDisplayName: vendor.displayName,
    name: input.name.trim(),
    description: input.description.trim(),
    price: input.price,
    currency: input.currency ?? "USD",
    imageURL,
    stock: input.stock,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const created = await addDoc(collection(firestore, PRODUCTS), payload);
  const snap = await getDoc(created);
  return mapProduct(snap);
}

export async function updateProduct(
  productId: string,
  vendorId: string,
  input: UpdateProductInput
): Promise<void> {
  const patch: FirestorePatch<Product> = {
    updatedAt: serverTimestamp(),
  };

  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.description !== undefined) patch.description = input.description.trim();
  if (input.price !== undefined) {
    if (input.price < 0) throw new Error("Price must be non-negative");
    patch.price = input.price;
  }
  if (input.stock !== undefined) {
    if (input.stock < 0) throw new Error("Stock must be non-negative");
    patch.stock = input.stock;
  }
  if (input.isActive !== undefined) patch.isActive = input.isActive;

  if (input.imageFile) {
    const path = buildUserScopedPath("products", vendorId, input.imageFile.name);
    patch.imageURL = await uploadImage(path, input.imageFile);
  }

  await updateDoc(doc(firestore, PRODUCTS, productId), patch);
}

export async function deleteProduct(productId: string): Promise<void> {
  await deleteDoc(doc(firestore, PRODUCTS, productId));
}
