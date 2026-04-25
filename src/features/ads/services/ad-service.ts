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
  Timestamp,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { buildUserScopedPath, uploadImage } from "@/lib/firebase/storage";
import { createNotification } from "@/features/notifications/services/notification-service";
import {
  sanitizeShortText,
  validateImageFile,
  validateInt,
  validateOptionalHttpUrl,
  validateOptionalString,
  validateString,
  ValidationError,
} from "@/lib/security/validation";
import { checkRateLimit } from "@/lib/security/rate-limit";
import type { UserProfile } from "@/features/auth/types";
import type { Ad, CreateAdInput } from "../types";

const AD_IMAGE_MAX_BYTES = 8 * 1024 * 1024;
const MAX_TARGETS = 30;
const ID_RE = /^[A-Za-z0-9_-]{1,128}$/;

function sanitizeTargetList(raw: unknown, field: string): string[] {
  if (raw == null) return [];
  if (!Array.isArray(raw)) throw new ValidationError(`${field} is invalid.`);
  if (raw.length > MAX_TARGETS) {
    throw new ValidationError(`Too many ${field.toLowerCase()} targets.`);
  }
  return raw.map((v) => {
    if (typeof v !== "string") throw new ValidationError(`${field} is invalid.`);
    const cleaned = sanitizeShortText(v).slice(0, 80);
    if (!cleaned) throw new ValidationError(`${field} contains an empty value.`);
    return cleaned;
  });
}

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
  checkRateLimit("ad.create");

  if (vendor.role !== "business" && vendor.role !== "admin") {
    throw new Error("Only business accounts can create ads.");
  }
  if (vendor.isBanned) {
    throw new Error("Your account is suspended.");
  }

  const headline = validateString(input.headline,
    { field: "Headline", min: 2, max: 120 });
  const body = validateOptionalString(input.body,
    { field: "Body", max: 500 });
  const linkURL = validateOptionalHttpUrl(input.linkURL, { field: "Link URL" });
  // Reach must be a positive, finite integer. Cap prevents a malicious admin
  // approval workflow from accidentally nuking a vendor's budget.
  validateInt(input.reach,
    { field: "Reach", min: 1, max: 10_000_000 });

  const targetGovernorates = sanitizeTargetList(
    input.targetGovernorates, "Governorate");
  const targetCities = sanitizeTargetList(input.targetCities, "City");

  if (input.startsAt && !(input.startsAt instanceof Date)) {
    throw new ValidationError("Start date is invalid.");
  }
  if (input.endsAt && !(input.endsAt instanceof Date)) {
    throw new ValidationError("End date is invalid.");
  }
  if (input.startsAt && input.endsAt && input.endsAt <= input.startsAt) {
    throw new ValidationError("End date must be after start date.");
  }

  let imageURL: string | null = null;
  if (input.imageFile) {
    const file = validateImageFile(input.imageFile,
      { field: "Ad image", maxBytes: AD_IMAGE_MAX_BYTES });
    const path = buildUserScopedPath("ads", vendor.uid, file.name);
    imageURL = await uploadImage(path, file);
  }

  const ref = await addDoc(collection(firestore, COLLECTIONS.ads), {
    vendorId: vendor.uid,
    vendorHandle: vendor.handle,
    vendorDisplayName: vendor.displayName,
    headline,
    body,
    imageURL,
    linkURL,
    targetCountries: ["EG"],
    targetGovernorates,
    targetCities,
    reach: input.reach,
    impressionsDelivered: 0,
    status: "pending" as const,
    rejectionReason: null,
    reviewedBy: null,
    createdAt: serverTimestamp(),
    reviewedAt: null,
    startsAt: input.startsAt ? Timestamp.fromDate(input.startsAt) : null,
    endsAt: input.endsAt ? Timestamp.fromDate(input.endsAt) : null,
  });

  return ref.id;
}

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
  checkRateLimit("ad.impression");
  if (!ID_RE.test(adId)) return;
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
  if (!ID_RE.test(adminId) || !ID_RE.test(adId)) {
    throw new ValidationError("Invalid identifier.");
  }
  const cleanReach = validateInt(reach,
    { field: "Reach", min: 1, max: 10_000_000 });

  const adRef = doc(firestore, COLLECTIONS.ads, adId);
  const adSnap = await getDoc(adRef);
  const vendorId = adSnap.data()?.vendorId as string | undefined;

  await updateDoc(adRef, {
    status: "approved",
    reach: cleanReach,
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
      message: `Your ad has been approved with a reach of ${cleanReach.toLocaleString()} impressions.`,
    });
  }
}

export async function rejectAd(
  adminId: string,
  adId: string,
  reason: string
): Promise<void> {
  if (!ID_RE.test(adminId) || !ID_RE.test(adId)) {
    throw new ValidationError("Invalid identifier.");
  }
  const cleanReason = validateString(reason,
    { field: "Reason", min: 1, max: 500 });

  const adRef = doc(firestore, COLLECTIONS.ads, adId);
  const adSnap = await getDoc(adRef);
  const vendorId = adSnap.data()?.vendorId as string | undefined;

  await updateDoc(adRef, {
    status: "rejected",
    rejectionReason: cleanReason,
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
      message: cleanReason,
    });
  }
}
