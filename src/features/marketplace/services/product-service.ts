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
import {
  validateImageFile,
  validateInt,
  validateNumber,
  validateString,
  ValidationError,
} from "@/lib/security/validation";
import { checkRateLimit } from "@/lib/security/rate-limit";
import type { UserProfile } from "@/features/auth/types";
import { FirestorePatch } from "@/types/firestore";

import type {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from "../types";

const PRODUCT_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_CURRENCIES = new Set(["EGP", "USD", "EUR", "GBP", "SAR", "AED"]);

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
    nameLower: data.nameLower ?? data.name?.toLowerCase() ?? "",
    description: data.description ?? "",
    price: data.price ?? 0,
    currency: data.currency ?? "EGP",
    imageURL: data.imageURL ?? null,
    stock: data.stock ?? 0,
    isActive: data.isActive ?? false,
    status: (data.status as Product["status"]) ?? "pending",
    rejectionReason: (data.rejectionReason as string | null) ?? null,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

// Public marketplace listing: approved AND active products only.
export async function fetchActiveProducts(): Promise<Product[]> {
  const q = query(
    collection(firestore, PRODUCTS),
    where("status", "==", "approved"),
    where("isActive", "==", true),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapProduct);
}

// Public vendor profile listing: approved AND active products only.
export async function fetchActiveProductsByVendor(
  vendorId: string
): Promise<Product[]> {
  const q = query(
    collection(firestore, PRODUCTS),
    where("vendorId", "==", vendorId),
    where("status", "==", "approved"),
    where("isActive", "==", true),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapProduct);
}

// Vendor dashboard: all products for this vendor (including pending/rejected).
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
  checkRateLimit("product.create");

  if (vendor.role !== "business" && vendor.role !== "admin") {
    throw new Error("Only business accounts can create products");
  }
  if (vendor.isBanned) {
    throw new Error("Your account is suspended.");
  }

  const name        = validateString(input.name, { field: "Name", min: 1, max: 200 });
  const description = validateString(input.description,
                        { field: "Description", min: 0, max: 2000 });
  const price       = validateNumber(input.price,
                        { field: "Price", min: 0, max: 10_000_000 });
  const stock       = validateInt(input.stock,
                        { field: "Stock", min: 0, max: 100_000 });
  const currency    = (input.currency ?? "EGP").toString().toUpperCase();
  if (!ALLOWED_CURRENCIES.has(currency)) {
    throw new ValidationError("Unsupported currency.");
  }

  let imageURL: string | null = null;
  if (input.imageFile) {
    const file = validateImageFile(input.imageFile,
      { field: "Product image", maxBytes: PRODUCT_IMAGE_MAX_BYTES });
    const path = buildUserScopedPath("products", vendor.uid, file.name);
    imageURL = await uploadImage(path, file);
  }

  const payload = {
    vendorId: vendor.uid,
    vendorDisplayName: vendor.displayName,
    name,
    nameLower: name.toLowerCase(),
    description,
    price,
    currency,
    imageURL,
    stock,
    isActive: false,
    status: "pending" as const,
    rejectionReason: null,
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
  checkRateLimit("product.update");

  const patch: FirestorePatch<Product> = {
    updatedAt: serverTimestamp(),
  };

  let contentChanged = false;

  if (input.name !== undefined) {
    const name = validateString(input.name, { field: "Name", min: 1, max: 200 });
    patch.name = name;
    patch.nameLower = name.toLowerCase();
    contentChanged = true;
  }
  if (input.description !== undefined) {
    patch.description = validateString(input.description,
      { field: "Description", min: 0, max: 2000 });
    contentChanged = true;
  }
  if (input.price !== undefined) {
    patch.price = validateNumber(input.price,
      { field: "Price", min: 0, max: 10_000_000 });
    contentChanged = true;
  }
  if (input.stock !== undefined) {
    patch.stock = validateInt(input.stock,
      { field: "Stock", min: 0, max: 100_000 });
  }
  if (input.isActive !== undefined) patch.isActive = Boolean(input.isActive);

  if (input.imageFile) {
    const file = validateImageFile(input.imageFile,
      { field: "Product image", maxBytes: PRODUCT_IMAGE_MAX_BYTES });
    const path = buildUserScopedPath("products", vendorId, file.name);
    patch.imageURL = await uploadImage(path, file);
    contentChanged = true;
  }

  // When content fields change, reset to pending so the admin re-reviews
  // before the updated listing goes live. Stock and isActive toggles do not
  // require re-review. Vendor CANNOT set status to anything other than
  // "pending" — Firestore rules enforce this even if a malicious client tries.
  if (contentChanged) {
    patch.status = "pending";
    patch.isActive = false;
    patch.rejectionReason = null;
  }

  await updateDoc(doc(firestore, PRODUCTS, productId), patch);
}

export async function deleteProduct(productId: string): Promise<void> {
  await deleteDoc(doc(firestore, PRODUCTS, productId));
}
