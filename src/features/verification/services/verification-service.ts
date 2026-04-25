import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { validateString, ValidationError } from "@/lib/security/validation";
import { checkRateLimit } from "@/lib/security/rate-limit";
import type { VerificationRequest } from "../types";
import type { UserProfile } from "@/features/auth/types";

const ID_RE = /^[A-Za-z0-9_-]{1,128}$/;

function mapRequest(d: { id: string; data: () => Record<string, unknown> }): VerificationRequest {
  const data = d.data();
  return {
    id: d.id,
    userId: data.userId as string,
    handle: data.handle as string,
    displayName: data.displayName as string,
    role: data.role as string,
    reason: data.reason as string,
    status: data.status as VerificationRequest["status"],
    reviewedBy: (data.reviewedBy as string | null) ?? null,
    createdAt: (data.createdAt as VerificationRequest["createdAt"]) ?? null,
    reviewedAt: (data.reviewedAt as VerificationRequest["reviewedAt"]) ?? null,
    postCountSnapshot: (data.postCountSnapshot as number) ?? 0,
  };
}

export async function requestVerification(
  user: UserProfile,
  reason: string
): Promise<void> {
  checkRateLimit("verification.request");

  if (user.isBanned) {
    throw new Error("Your account is suspended.");
  }
  if (user.role !== "business" && user.postCount < 5) {
    throw new Error(
      "Verification is available for business accounts or users with at least 5 posts."
    );
  }

  const cleanReason = validateString(reason,
    { field: "Reason", min: 10, max: 1000 });

  const existing = await getDocs(
    query(
      collection(firestore, COLLECTIONS.verificationRequests),
      where("userId", "==", user.uid),
      where("status", "==", "pending"),
      limit(1)
    )
  );
  if (!existing.empty) {
    throw new Error("You already have a pending verification request.");
  }

  await addDoc(collection(firestore, COLLECTIONS.verificationRequests), {
    userId: user.uid,
    handle: user.handle,
    displayName: user.displayName,
    role: user.role,
    reason: cleanReason,
    status: "pending",
    reviewedBy: null,
    createdAt: serverTimestamp(),
    reviewedAt: null,
    postCountSnapshot: user.postCount,
  });
}

export async function getUserVerificationRequest(
  userId: string
): Promise<VerificationRequest | null> {
  const q = query(
    collection(firestore, COLLECTIONS.verificationRequests),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return mapRequest({ id: d.id, data: () => d.data() as Record<string, unknown> });
}

export async function fetchPendingVerifications(
  pageLimit = 50
): Promise<VerificationRequest[]> {
  const q = query(
    collection(firestore, COLLECTIONS.verificationRequests),
    where("status", "==", "pending"),
    orderBy("createdAt", "asc"),
    limit(pageLimit)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) =>
    mapRequest({ id: d.id, data: () => d.data() as Record<string, unknown> })
  );
}

export async function fetchAllVerifications(
  pageLimit = 100
): Promise<VerificationRequest[]> {
  const q = query(
    collection(firestore, COLLECTIONS.verificationRequests),
    orderBy("createdAt", "desc"),
    limit(pageLimit)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) =>
    mapRequest({ id: d.id, data: () => d.data() as Record<string, unknown> })
  );
}

export async function approveVerificationRequest(
  requestId: string,
  userId: string,
  adminId: string
): Promise<void> {
  if (!ID_RE.test(requestId) || !ID_RE.test(userId) || !ID_RE.test(adminId)) {
    throw new ValidationError("Invalid identifier.");
  }
  await updateDoc(
    doc(firestore, COLLECTIONS.verificationRequests, requestId),
    {
      status: "approved",
      reviewedBy: adminId,
      reviewedAt: serverTimestamp(),
    }
  );

  await updateDoc(doc(firestore, COLLECTIONS.users, userId), {
    isVerified: true,
    verificationStatus: "approved",
    updatedAt: serverTimestamp(),
  });
}

export async function rejectVerificationRequest(
  requestId: string,
  userId: string,
  adminId: string
): Promise<void> {
  if (!ID_RE.test(requestId) || !ID_RE.test(userId) || !ID_RE.test(adminId)) {
    throw new ValidationError("Invalid identifier.");
  }
  await updateDoc(
    doc(firestore, COLLECTIONS.verificationRequests, requestId),
    {
      status: "rejected",
      reviewedBy: adminId,
      reviewedAt: serverTimestamp(),
    }
  );

  await updateDoc(doc(firestore, COLLECTIONS.users, userId), {
    verificationStatus: "rejected",
    updatedAt: serverTimestamp(),
  });
}
