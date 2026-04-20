import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { buildUserScopedPath, uploadImage } from "@/lib/firebase/storage";
import { createNotification } from "@/features/notifications/services/notification-service";
import type { UserProfile } from "@/features/auth/types";
import type { Ad, CreateAdInput } from "../types";

function mapAd(d: { id: string; data: () => Record<string, unknown> }): Ad {
  const data = d.data();
  return {
    id: d.id,
    vendorId: data.vendorId as string,
    vendorHandle: data.vendorHandle as string,
    vendorDisplayName: data.vendorDisplayName as string,
    headline: data.headline as string,
    body: (data.body as string | null) ?? null,
    imageURL: (data.imageURL as string | null) ?? null,
    linkURL: (data.linkURL as string | null) ?? null,
    targetCountries: (data.targetCountries as string[]) ?? [],
    targetGovernorates: (data.targetGovernorates as string[]) ?? [],
    targetCities: (data.targetCities as string[]) ?? [],
    reach: (data.reach as number) ?? 0,
    impressionsDelivered: (data.impressionsDelivered as number) ?? 0,
    status: (data.status as Ad["status"]) ?? "pending",
    rejectionReason: (data.rejectionReason as string | null) ?? null,
    reviewedBy: (data.reviewedBy as string | null) ?? null,
    createdAt: (data.createdAt as Ad["createdAt"]) ?? null,
    reviewedAt: (data.reviewedAt as Ad["reviewedAt"]) ?? null,
    startsAt: (data.startsAt as Ad["startsAt"]) ?? null,
    endsAt: (data.endsAt as Ad["endsAt"]) ?? null,
  };
}

export async function createAd(
  vendor: UserProfile,
  input: CreateAdInput
): Promise<string> {
  let imageURL: string | null = null;
  if (input.imageFile) {
    const path = buildUserScopedPath("ads", vendor.uid, input.imageFile.name);
    imageURL = await uploadImage(path, input.imageFile);
  }

  const ref = await addDoc(collection(firestore, COLLECTIONS.ads), {
    vendorId: vendor.uid,
    vendorHandle: vendor.handle,
    vendorDisplayName: vendor.displayName,
    headline: input.headline.trim(),
    body: input.body?.trim() ?? null,
    imageURL,
    linkURL: input.linkURL?.trim() ?? null,
    targetCountries: ["EG"],
    targetGovernorates: input.targetGovernorates ?? [],
    targetCities: input.targetCities ?? [],
    reach: input.reach,
    impressionsDelivered: 0,
    status: "pending" as const,
    rejectionReason: null,
    reviewedBy: null,
    createdAt: serverTimestamp(),
    reviewedAt: null,
    startsAt: input.startsAt ?? null,
    endsAt: input.endsAt ?? null,
  });

  return ref.id;
}

/** Fetch ads eligible for a user based on their location. */
export async function fetchAdsForUser(
  governorate: string,
  city: string
): Promise<Ad[]> {
  const snap = await getDocs(
    query(
      collection(firestore, COLLECTIONS.ads),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc"),
      limit(50)
    )
  );

  const ads = snap.docs.map((d) =>
    mapAd({ id: d.id, data: () => d.data() as Record<string, unknown> })
  );

  // Client-side targeting: no governorate targets = nationwide
  return ads.filter((ad) => {
    if (ad.impressionsDelivered >= ad.reach) return false;
    const govMatch =
      ad.targetGovernorates.length === 0 ||
      ad.targetGovernorates.includes(governorate);
    const cityMatch =
      ad.targetCities.length === 0 || ad.targetCities.includes(city);
    return govMatch && cityMatch;
  });
}

export async function fetchMyAds(vendorId: string): Promise<Ad[]> {
  const snap = await getDocs(
    query(
      collection(firestore, COLLECTIONS.ads),
      where("vendorId", "==", vendorId),
      orderBy("createdAt", "desc"),
      limit(50)
    )
  );
  return snap.docs.map((d) =>
    mapAd({ id: d.id, data: () => d.data() as Record<string, unknown> })
  );
}

export async function recordImpression(adId: string): Promise<void> {
  await updateDoc(doc(firestore, COLLECTIONS.ads, adId), {
    impressionsDelivered: increment(1),
  });
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export async function fetchPendingAds(): Promise<Ad[]> {
  const snap = await getDocs(
    query(
      collection(firestore, COLLECTIONS.ads),
      where("status", "==", "pending"),
      orderBy("createdAt", "asc"),
      limit(50)
    )
  );
  return snap.docs.map((d) =>
    mapAd({ id: d.id, data: () => d.data() as Record<string, unknown> })
  );
}

export async function fetchAllAds(): Promise<Ad[]> {
  const snap = await getDocs(
    query(
      collection(firestore, COLLECTIONS.ads),
      orderBy("createdAt", "desc"),
      limit(100)
    )
  );
  return snap.docs.map((d) =>
    mapAd({ id: d.id, data: () => d.data() as Record<string, unknown> })
  );
}

export async function approveAd(
  adminId: string,
  adId: string,
  reach: number
): Promise<void> {
  const adRef = doc(firestore, COLLECTIONS.ads, adId);
  const adSnap = await getDoc(adRef);
  const vendorId = adSnap.data()?.vendorId as string | undefined;

  await updateDoc(adRef, {
    status: "approved",
    reach,
    reviewedBy: adminId,
    reviewedAt: serverTimestamp(),
  });

  if (vendorId) {
    void createNotification({
      toUserId: vendorId,
      type: "ad_approved",
      fromUserId: adminId,
      fromUserHandle: "green_team",
      fromUserDisplayName: "Green Team",
      message: `Your ad has been approved with a reach of ${reach.toLocaleString()} impressions.`,
    });
  }
}

export async function rejectAd(
  adminId: string,
  adId: string,
  reason: string
): Promise<void> {
  const adRef = doc(firestore, COLLECTIONS.ads, adId);
  const adSnap = await getDoc(adRef);
  const vendorId = adSnap.data()?.vendorId as string | undefined;

  await updateDoc(adRef, {
    status: "rejected",
    rejectionReason: reason,
    reviewedBy: adminId,
    reviewedAt: serverTimestamp(),
  });

  if (vendorId) {
    void createNotification({
      toUserId: vendorId,
      type: "ad_rejected",
      fromUserId: adminId,
      fromUserHandle: "green_team",
      fromUserDisplayName: "Green Team",
      message: reason,
    });
  }
}
