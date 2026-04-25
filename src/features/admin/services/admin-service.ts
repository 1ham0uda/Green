import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getAggregateFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  count,
  updateDoc,
  where,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { log } from "@/lib/logger";
import { createNotification } from "@/features/notifications/services/notification-service";
import { validateString, ValidationError } from "@/lib/security/validation";
import type { AdminUser, DashboardStats, ModerationLog } from "../types";
import type { UserProfile } from "@/features/auth/types";

const ID_RE = /^[A-Za-z0-9_-]{1,128}$/;
const ALLOWED_ROLES: ReadonlySet<UserProfile["role"]> = new Set<UserProfile["role"]>([
  "user", "business", "admin",
]);
const ALLOWED_COMPETITION_STATUSES = new Set(["upcoming", "active", "closed"]);
const ALLOWED_REPORT_ACTIONS = new Set(["resolved", "dismissed"]);

function mapUser(snap: QueryDocumentSnapshot): AdminUser {
  const d = snap.data();
  return {
    uid: snap.id,
    email: d.email ?? "",
    displayName: d.displayName ?? "",
    handle: d.handle ?? "",
    photoURL: d.photoURL ?? null,
    role: d.role ?? "user",
    isVerified: d.isVerified ?? false,
    verificationStatus: d.verificationStatus ?? "none",
    isBanned: d.isBanned ?? d.banned ?? false,
    bannedReason: d.bannedReason ?? null,
    postCount: d.postCount ?? 0,
    followerCount: d.followerCount ?? 0,
    createdAt: d.createdAt ?? null,
  };
}

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [
    usersSnap,
    postsSnap,
    ordersSnap,
    pendingProductsSnap,
    openReportsSnap,
    activeCompetitionsSnap,
    pendingVerificationsSnap,
  ] = await Promise.all([
    getAggregateFromServer(collection(firestore, COLLECTIONS.users), {
      total: count(),
    }),
    getAggregateFromServer(collection(firestore, COLLECTIONS.posts), {
      total: count(),
    }),
    getAggregateFromServer(collection(firestore, COLLECTIONS.orders), {
      total: count(),
    }),
    getAggregateFromServer(
      query(
        collection(firestore, COLLECTIONS.products),
        where("status", "==", "pending")
      ),
      { total: count() }
    ),
    getAggregateFromServer(
      query(
        collection(firestore, COLLECTIONS.reports),
        where("status", "==", "open")
      ),
      { total: count() }
    ),
    getAggregateFromServer(
      query(
        collection(firestore, COLLECTIONS.competitions),
        where("status", "==", "active")
      ),
      { total: count() }
    ),
    getAggregateFromServer(
      query(
        collection(firestore, COLLECTIONS.verificationRequests),
        where("status", "==", "pending")
      ),
      { total: count() }
    ),
  ]);

  return {
    totalUsers: usersSnap.data().total,
    totalPosts: postsSnap.data().total,
    totalOrders: ordersSnap.data().total,
    pendingProducts: pendingProductsSnap.data().total,
    openReports: openReportsSnap.data().total,
    activeCompetitions: activeCompetitionsSnap.data().total,
    pendingVerifications: pendingVerificationsSnap.data().total,
  };
}

// ─── USER MANAGEMENT ─────────────────────────────────────────────────────────

export async function fetchAllUsers(pageLimit = 50): Promise<AdminUser[]> {
  const q = query(
    collection(firestore, COLLECTIONS.users),
    orderBy("createdAt", "desc"),
    limit(pageLimit)
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapUser);
}

export async function searchUsers(term: string, pageLimit = 20): Promise<AdminUser[]> {
  const lower = term.toLowerCase().trim();
  if (!lower) return [];

  // Search by handle prefix (Firestore range query)
  const q = query(
    collection(firestore, COLLECTIONS.users),
    where("handle", ">=", lower),
    where("handle", "<=", lower + "\uf8ff"),
    limit(pageLimit)
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapUser);
}

export async function banUser(
  adminId: string,
  adminHandle: string,
  targetUserId: string,
  reason: string
): Promise<void> {
  if (!ID_RE.test(targetUserId)) throw new ValidationError("Invalid user id.");
  const cleanReason = validateString(reason, { field: "Reason", min: 1, max: 500 });
  await updateDoc(doc(firestore, COLLECTIONS.users, targetUserId), {
    isBanned: true,
    bannedAt: serverTimestamp(),
    bannedReason: cleanReason,
  });

  await writeModerationLog(adminId, adminHandle, {
    action: "ban_user",
    targetId: targetUserId,
    targetType: "user",
    note: reason,
  });

  await log("admin.ban_user", adminId, {
    targetId: targetUserId,
    targetType: "user",
    metadata: { reason },
  });
}

export async function unbanUser(
  adminId: string,
  adminHandle: string,
  targetUserId: string
): Promise<void> {
  await updateDoc(doc(firestore, COLLECTIONS.users, targetUserId), {
    isBanned: false,
    bannedAt: null,
    bannedReason: null,
  });

  await writeModerationLog(adminId, adminHandle, {
    action: "unban_user",
    targetId: targetUserId,
    targetType: "user",
    note: "",
  });

  await log("admin.unban_user", adminId, { targetId: targetUserId });
}

export async function updateUserRole(
  targetUserId: string,
  role: UserProfile["role"]
): Promise<void> {
  if (!ID_RE.test(targetUserId)) throw new ValidationError("Invalid user id.");
  if (!ALLOWED_ROLES.has(role)) throw new ValidationError("Invalid role.");
  await updateDoc(doc(firestore, COLLECTIONS.users, targetUserId), { role });
}

// ─── POST MANAGEMENT ─────────────────────────────────────────────────────────

export async function adminDeletePost(
  adminId: string,
  adminHandle: string,
  postId: string
): Promise<void> {
  await deleteDoc(doc(firestore, COLLECTIONS.posts, postId));

  await writeModerationLog(adminId, adminHandle, {
    action: "delete_post",
    targetId: postId,
    targetType: "post",
    note: "",
  });

  await log("admin.delete_post", adminId, { targetId: postId });
}

// ─── POST APPROVAL ───────────────────────────────────────────────────────────

export async function fetchPendingPosts() {
  const q = query(
    collection(firestore, COLLECTIONS.posts),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc"),
    limit(100)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      authorId: data.authorId as string,
      authorHandle: data.authorHandle as string,
      authorDisplayName: data.authorDisplayName as string,
      caption: (data.caption as string) ?? "",
      imageURLs: Array.isArray(data.imageURLs) ? (data.imageURLs as string[]) : [],
      status: (data.status as string) ?? "pending",
      governorate: (data.governorate as string) ?? "",
      city: (data.city as string) ?? "",
      createdAt: data.createdAt ?? null,
    };
  });
}

export async function approvePost(
  adminId: string,
  adminHandle: string,
  postId: string
): Promise<void> {
  const postRef = doc(firestore, COLLECTIONS.posts, postId);
  const postSnap = await getDoc(postRef);
  const authorId = postSnap.data()?.authorId as string | undefined;

  await updateDoc(postRef, {
    status: "approved",
    reviewedAt: serverTimestamp(),
    reviewedBy: adminId,
    rejectionReason: null,
  });

  await writeModerationLog(adminId, adminHandle, {
    action: "approve_post",
    targetId: postId,
    targetType: "post",
    note: "",
  });

  if (authorId) {
    void createNotification({
      toUserId: authorId,
      type: "post_approved",
      fromUserId: adminId,
      fromUserHandle: adminHandle,
      fromUserDisplayName: "Green Team",
      postId,
      message: "Your post has been approved and is now visible to everyone.",
    });
  }

  await log("admin.approve_post", adminId, { targetId: postId });
}

export async function rejectPost(
  adminId: string,
  adminHandle: string,
  postId: string,
  reason: string
): Promise<void> {
  if (!ID_RE.test(postId)) throw new ValidationError("Invalid post id.");
  const cleanReason = validateString(reason, { field: "Reason", min: 1, max: 500 });
  const postRef = doc(firestore, COLLECTIONS.posts, postId);
  const postSnap = await getDoc(postRef);
  const authorId = postSnap.data()?.authorId as string | undefined;

  await updateDoc(postRef, {
    status: "rejected",
    reviewedAt: serverTimestamp(),
    reviewedBy: adminId,
    rejectionReason: cleanReason,
  });

  await writeModerationLog(adminId, adminHandle, {
    action: "reject_post",
    targetId: postId,
    targetType: "post",
    note: reason,
  });

  if (authorId) {
    void createNotification({
      toUserId: authorId,
      type: "post_rejected",
      fromUserId: adminId,
      fromUserHandle: adminHandle,
      fromUserDisplayName: "Green Team",
      postId,
      message: reason,
    });
  }

  await log("admin.reject_post", adminId, { targetId: postId, metadata: { reason } });
}

// ─── PRODUCT APPROVAL ────────────────────────────────────────────────────────

export async function approveProduct(
  adminId: string,
  adminHandle: string,
  productId: string
): Promise<void> {
  const productRef = doc(firestore, COLLECTIONS.products, productId);
  const productSnap = await getDoc(productRef);
  const vendorId = productSnap.data()?.vendorId as string | undefined;

  await updateDoc(productRef, {
    status: "approved",
    isActive: true,
    reviewedAt: serverTimestamp(),
    reviewedBy: adminId,
  });

  await writeModerationLog(adminId, adminHandle, {
    action: "approve_product",
    targetId: productId,
    targetType: "product",
    note: "",
  });

  if (vendorId) {
    void createNotification({
      toUserId: vendorId,
      type: "product_approved",
      fromUserId: adminId,
      fromUserHandle: adminHandle,
      fromUserDisplayName: "Green Team",
      message: "Your product listing has been approved and is now live.",
    });
  }

  await log("admin.approve_product", adminId, { targetId: productId });
}

export async function rejectProduct(
  adminId: string,
  adminHandle: string,
  productId: string,
  reason: string
): Promise<void> {
  if (!ID_RE.test(productId)) throw new ValidationError("Invalid product id.");
  const cleanReason = validateString(reason, { field: "Reason", min: 1, max: 500 });
  const productRef = doc(firestore, COLLECTIONS.products, productId);
  const productSnap = await getDoc(productRef);
  const vendorId = productSnap.data()?.vendorId as string | undefined;

  await updateDoc(productRef, {
    status: "rejected",
    isActive: false,
    reviewedAt: serverTimestamp(),
    reviewedBy: adminId,
    rejectionReason: cleanReason,
  });

  await writeModerationLog(adminId, adminHandle, {
    action: "reject_product",
    targetId: productId,
    targetType: "product",
    note: reason,
  });

  if (vendorId) {
    void createNotification({
      toUserId: vendorId,
      type: "product_rejected",
      fromUserId: adminId,
      fromUserHandle: adminHandle,
      fromUserDisplayName: "Green Team",
      message: reason,
    });
  }

  await log("admin.reject_product", adminId, {
    targetId: productId,
    metadata: { reason },
  });
}

export async function fetchPendingProducts() {
  const q = query(
    collection(firestore, COLLECTIONS.products),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      vendorId: data.vendorId as string,
      vendorDisplayName: data.vendorDisplayName as string,
      name: data.name as string,
      description: data.description as string,
      price: data.price as number,
      currency: (data.currency as string) ?? "EGP",
      imageURL: (data.imageURL as string | null) ?? null,
      stock: data.stock as number,
      status: data.status as string,
      createdAt: data.createdAt ?? null,
    };
  });
}

export async function fetchAllAdminProducts() {
  const q = query(
    collection(firestore, COLLECTIONS.products),
    orderBy("createdAt", "desc"),
    limit(100)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      vendorId: data.vendorId as string,
      vendorDisplayName: data.vendorDisplayName as string,
      name: data.name as string,
      description: data.description as string,
      price: data.price as number,
      currency: (data.currency as string) ?? "EGP",
      imageURL: (data.imageURL as string | null) ?? null,
      stock: data.stock as number,
      status: (data.status as string) ?? "approved",
      rejectionReason: (data.rejectionReason as string | null) ?? null,
      createdAt: data.createdAt ?? null,
    };
  });
}

// ─── COMPETITION MANAGEMENT ──────────────────────────────────────────────────

export async function adminCreateCompetition(payload: {
  title: string;
  description: string;
  rules: string;
  rewards: string;
  startsAt: Date;
  endsAt: Date;
  createdByAdminId: string;
}): Promise<string> {
  const title = validateString(payload.title, { field: "Title", min: 2, max: 120 });
  const description = validateString(payload.description,
    { field: "Description", min: 10, max: 2000 });
  const rules = validateString(payload.rules, { field: "Rules", min: 10, max: 2000 });
  const rewards = validateString(payload.rewards, { field: "Rewards", min: 2, max: 500 });
  if (!(payload.startsAt instanceof Date) || !(payload.endsAt instanceof Date)) {
    throw new ValidationError("Invalid dates.");
  }
  if (payload.endsAt <= payload.startsAt) {
    throw new ValidationError("End date must be after start date.");
  }
  const ref = await addDoc(
    collection(firestore, COLLECTIONS.competitions),
    {
      title,
      description,
      rules,
      rewards,
      coverImageURL: null,
      status: "upcoming",
      startsAt: payload.startsAt,
      endsAt: payload.endsAt,
      entryCount: 0,
      createdByAdminId: payload.createdByAdminId,
      createdAt: serverTimestamp(),
    }
  );

  await log("admin.create_competition", payload.createdByAdminId, {
    targetId: ref.id,
  });

  return ref.id;
}

export async function adminUpdateCompetitionStatus(
  competitionId: string,
  status: "upcoming" | "active" | "closed",
  adminId: string
): Promise<void> {
  if (!ID_RE.test(competitionId)) throw new ValidationError("Invalid competition id.");
  if (!ALLOWED_COMPETITION_STATUSES.has(status)) {
    throw new ValidationError("Invalid status.");
  }
  await updateDoc(
    doc(firestore, COLLECTIONS.competitions, competitionId),
    { status }
  );

  if (status === "closed") {
    await log("admin.close_competition", adminId, { targetId: competitionId });
  }
}

export async function adminDeleteCompetition(
  competitionId: string,
  adminId: string
): Promise<void> {
  await deleteDoc(doc(firestore, COLLECTIONS.competitions, competitionId));
  await log("admin.delete_competition", adminId, { targetId: competitionId });
}

// ─── REPORTS ────────────────────────────────────────────────────────────────

export interface Report {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: "post" | "comment" | "user";
  reason: string;
  status: "open" | "resolved" | "dismissed";
  createdAt: { toDate: () => Date } | null;
}

export async function fetchOpenReports(pageLimit = 50): Promise<Report[]> {
  const q = query(
    collection(firestore, COLLECTIONS.reports),
    where("status", "==", "open"),
    orderBy("createdAt", "desc"),
    limit(pageLimit)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      reporterId: data.reporterId as string,
      targetId: data.targetId as string,
      targetType: data.targetType as Report["targetType"],
      reason: data.reason as string,
      status: data.status as Report["status"],
      createdAt: data.createdAt ?? null,
    };
  });
}

export async function resolveReport(
  adminId: string,
  adminHandle: string,
  reportId: string,
  action: "resolved" | "dismissed"
): Promise<void> {
  if (!ID_RE.test(reportId)) throw new ValidationError("Invalid report id.");
  if (!ALLOWED_REPORT_ACTIONS.has(action)) throw new ValidationError("Invalid action.");
  await updateDoc(doc(firestore, COLLECTIONS.reports, reportId), {
    status: action,
    resolvedBy: adminId,
    resolvedAt: serverTimestamp(),
  });

  await writeModerationLog(adminId, adminHandle, {
    action: `report_${action}`,
    targetId: reportId,
    targetType: "report",
    note: "",
  });

  await log("admin.resolve_report", adminId, {
    targetId: reportId,
    metadata: { action },
  });
}

// ─── VERIFICATION MANAGEMENT ──────────────────────────────────────────────────

export {
  fetchAllVerifications,
  fetchPendingVerifications,
} from "@/features/verification/services/verification-service";

export async function adminApproveVerification(
  adminId: string,
  adminHandle: string,
  requestId: string,
  userId: string
): Promise<void> {
  const { approveVerificationRequest } = await import(
    "@/features/verification/services/verification-service"
  );
  await approveVerificationRequest(requestId, userId, adminId);

  await writeModerationLog(adminId, adminHandle, {
    action: "approve_verification",
    targetId: userId,
    targetType: "user",
    note: "",
  });

  await log("admin.approve_verification" as Parameters<typeof log>[0], adminId, {
    targetId: userId,
  });
}

export async function adminRejectVerification(
  adminId: string,
  adminHandle: string,
  requestId: string,
  userId: string
): Promise<void> {
  const { rejectVerificationRequest } = await import(
    "@/features/verification/services/verification-service"
  );
  await rejectVerificationRequest(requestId, userId, adminId);

  await writeModerationLog(adminId, adminHandle, {
    action: "reject_verification",
    targetId: userId,
    targetType: "user",
    note: "",
  });

  await log("admin.reject_verification" as Parameters<typeof log>[0], adminId, {
    targetId: userId,
  });
}

// ─── LOGS ────────────────────────────────────────────────────────────────────

export interface SystemLog {
  id: string;
  action: string;
  userId: string;
  targetId?: string;
  createdAt: { toDate: () => Date } | null;
}

export async function fetchLogs(pageLimit = 100): Promise<SystemLog[]> {
  const q = query(
    collection(firestore, COLLECTIONS.logs),
    orderBy("createdAt", "desc"),
    limit(pageLimit)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      action: data.action as string,
      userId: data.userId as string,
      targetId: data.targetId as string | undefined,
      createdAt: data.createdAt ?? null,
    };
  });
}

// ─── MODERATION LOG HELPER ────────────────────────────────────────────────────

async function writeModerationLog(
  adminId: string,
  adminHandle: string,
  opts: {
    action: string;
    targetId: string;
    targetType: ModerationLog["targetType"];
    note: string;
  }
): Promise<void> {
  await addDoc(collection(firestore, COLLECTIONS.moderationLogs), {
    action: opts.action,
    adminId,
    adminHandle,
    targetId: opts.targetId,
    targetType: opts.targetType,
    note: opts.note,
    createdAt: serverTimestamp(),
  });
}

export async function fetchModerationLogs(
  pageLimit = 100
): Promise<ModerationLog[]> {
  const q = query(
    collection(firestore, COLLECTIONS.moderationLogs),
    orderBy("createdAt", "desc"),
    limit(pageLimit)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      action: data.action,
      adminId: data.adminId,
      adminHandle: data.adminHandle,
      targetId: data.targetId,
      targetType: data.targetType,
      note: data.note ?? "",
      createdAt: data.createdAt ?? null,
    } as ModerationLog;
  });
}

// ─── ADMIN ACCOUNT SEED ───────────────────────────────────────────────────────

export async function checkAdminExists(): Promise<boolean> {
  const q = query(
    collection(firestore, COLLECTIONS.users),
    where("role", "==", "admin"),
    limit(1)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

export async function seedAdminProfile(uid: string): Promise<void> {
  const ref = doc(firestore, COLLECTIONS.users, uid);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    await updateDoc(ref, { role: "admin", isBanned: false });
    return;
  }

  await import("firebase/firestore").then(({ setDoc }) =>
    setDoc(ref, {
      uid,
      email: "admin@app.com",
      displayName: "Admin",
      handle: "admin",
      photoURL: null,
      bio: "",
      role: "admin",
      isVerified: true,
      verificationStatus: "approved",
      isBanned: false,
      bannedReason: null,
      followerCount: 0,
      followingCount: 0,
      postCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  );
}
