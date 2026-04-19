import type { Timestamp } from "firebase/firestore";
import type { LogEntry } from "@/lib/logger";

export type { LogEntry };

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  handle: string;
  photoURL: string | null;
  role: "user" | "business" | "admin";
  isVerified: boolean;
  verificationStatus: string;
  isBanned: boolean;
  bannedReason: string | null;
  postCount: number;
  followerCount: number;
  createdAt: Timestamp | null;
}

export interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalOrders: number;
  pendingProducts: number;
  openReports: number;
  activeCompetitions: number;
  pendingVerifications: number;
}

export interface ModerationLog {
  id: string;
  action: string;
  adminId: string;
  adminHandle: string;
  targetId: string;
  targetType: "user" | "post" | "comment" | "product" | "report";
  note: string;
  createdAt: Timestamp | null;
}
