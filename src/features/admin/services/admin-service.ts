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
import type { AdminUser, DashboardStats, ModerationLog } from "../types";
import type { UserProfile } from "@/features/auth/types";

function mapUser(snap: QueryDocumentSnapshot): AdminUser {
  const d = snap.data();
  return {
    uid: snap.id,
    email: d.email ?? "",
    displayName: d.displayName ?? "",
    handle: d.handle ?? "",
    photoURL: d.photoURL ?? null,
    role: d.role ?? "user",
    banned: d.banned ?? false,
    bannedAt: d.bannedAt ?? null,
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
  ]);

  return {
    totalUsers: usersSnap.data().total,
    totalPosts: postsSnap.data().total,
    totalOrders: ordersSnap.data().total,
    pendingProducts: pendingProductsSnap.data().total,
    openReports: openReportsSnap.data().total,
    activeCompetitions: activeCompetitionsSnap.data().total,
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

export async function banUser(
  adminId: string,
  adminHandle: string,
  targetUserId: string,
  reason: string
): Promise<void> {
  await updateDoc(doc(firestore, COLLECTIONS.users, targetUserId), {
    banned: true,
    bannedAt: serverTimestamp(),
    bannedReason: reason,
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
    banned: false,
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

// ─── PRODUCT APPROVAL ────────────────────────────────────────────────────────

export async function approveProduct(
  adminId: string,
  adminHandle: string,
  productId: string
): Promise<void> {
  await updateDoc(doc(firestore, COLLECTIONS.products, productId), {
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

  await log("admin.approve_product", adminId, { targetId: productId });
}

export async function rejectProduct(
  adminId: string,
  adminHandle: string,
  productId: string,
  reason: string
): Promise<void> {
  await updateDoc(doc(firestore, COLLECTIONS.products, productId), {
    status: "rejected",
    isActive: false,
    reviewedAt: serverTimestamp(),
    reviewedBy: adminId,
    rejectionReason: reason,
  });

  await writeModerationLog(adminId, adminHandle, {
    action: "reject_product",
    targetId: productId,
    targetType: "product",
    note: reason,
  });

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
      currency: (data.currency as string) ?? "USD",
      imageURL: (data.imageURL as string | null) ?? null,
      stock: data.stock as number,
      status: data.status as string,
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
  const ref = await addDoc(
    collection(firestore, COLLECTIONS.competitions),
    {
      title: payload.title.trim(),
      description: payload.description.trim(),
      rules: payload.rules.trim(),
      rewards: payload.rewards.trim(),
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
    await updateDoc(ref, { role: "admin", banned: false });
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
      banned: false,
      bannedAt: null,
      bannedReason: null,
      followerCount: 0,
      followingCount: 0,
      postCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  );
}
