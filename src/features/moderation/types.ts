import type { Timestamp } from "firebase/firestore";

export type ReportTargetType = "post" | "comment" | "user";
export type ReportStatus = "open" | "resolved" | "dismissed";

export interface Report {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: ReportTargetType;
  reason: string;
  status: ReportStatus;
  createdAt: Timestamp | null;
}

export interface CreateReportInput {
  reporterId: string;
  targetId: string;
  targetType: ReportTargetType;
  reason: string;
}
