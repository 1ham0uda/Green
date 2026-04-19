import type { Timestamp } from "firebase/firestore";

export type VerificationRequestStatus = "pending" | "approved" | "rejected";

export interface VerificationRequest {
  id: string;
  userId: string;
  handle: string;
  displayName: string;
  role: string;
  reason: string;
  status: VerificationRequestStatus;
  reviewedBy: string | null;
  createdAt: Timestamp | null;
  reviewedAt: Timestamp | null;
}
