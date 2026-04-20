import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { PublicProfile } from "@/features/profiles/types";
import type { Post } from "@/features/posts/types";
import type { Product } from "@/features/marketplace/types";

// ─── User Search ─────────────────────────────────────────────────────────────

export async function searchUsersByUsername(
  term: string,
  pageLimit = 15
): Promise<PublicProfile[]> {
  const lower = term.toLowerCase().trim();
  if (lower.length < 2) return [];

  const q = query(
    collection(firestore, COLLECTIONS.users),
    where("handle", ">=", lower),
    where("handle", "<=", lower + "\uf8ff"),
    limit(pageLimit)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as PublicProfile);
}

// ─── Post Search ─────────────────────────────────────────────────────────────

export async function searchPosts(term: string, pageLimit = 20): Promise<Post[]> {
  const lower = term.toLowerCase().trim();
  if (lower.length < 2) return [];

  // Search by authorHandle prefix; status filter is required so Firestore
  // security rules (which restrict non-approved posts) don't reject the query.
  const q = query(
    collection(firestore, COLLECTIONS.posts),
    where("status", "==", "approved"),
    where("authorHandle", ">=", lower),
    where("authorHandle", "<=", lower + "\uf8ff"),
    orderBy("authorHandle"),
    orderBy("createdAt", "desc"),
    limit(pageLimit)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      authorId: data.authorId,
      authorHandle: data.authorHandle,
      authorDisplayName: data.authorDisplayName,
      authorPhotoURL: data.authorPhotoURL ?? null,
      authorIsVerified: data.authorIsVerified ?? false,
      caption: data.caption,
      imageURLs: Array.isArray(data.imageURLs) && data.imageURLs.length > 0
        ? (data.imageURLs as string[])
        : data.imageURL
        ? [data.imageURL as string]
        : [],
      plantId: data.plantId ?? null,
      status: (data.status as Post["status"]) ?? "approved",
      rejectionReason: (data.rejectionReason as string | null) ?? null,
      country: (data.country as string) ?? "",
      governorate: (data.governorate as string) ?? "",
      city: (data.city as string) ?? "",
      likeCount: data.likeCount ?? 0,
      commentCount: data.commentCount ?? 0,
      createdAt: data.createdAt ?? null,
    } as Post;
  });
}

// ─── Product Search ───────────────────────────────────────────────────────────

export async function searchProducts(
  term: string,
  pageLimit = 20
): Promise<Product[]> {
  const lower = term.toLowerCase().trim();
  if (lower.length < 2) return [];

  const q = query(
    collection(firestore, COLLECTIONS.products),
    where("isActive", "==", true),
    where("nameLower", ">=", lower),
    where("nameLower", "<=", lower + "\uf8ff"),
    limit(pageLimit)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      vendorId: data.vendorId,
      vendorDisplayName: data.vendorDisplayName ?? "",
      name: data.name,
      description: data.description ?? "",
      price: data.price,
      currency: data.currency ?? "EGP",
      imageURL: data.imageURL ?? null,
      stock: data.stock ?? 0,
      isActive: data.isActive ?? false,
      status: data.status ?? "pending",
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
    } as Product;
  });
}
