import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { firestore } from "./firebase/config";
import { COLLECTIONS } from "./firebase/collections";

export type LogAction =
  | "auth.signup"
  | "auth.login"
  | "auth.logout"
  | "post.create"
  | "post.delete"
  | "post.like"
  | "post.unlike"
  | "post.comment"
  | "comment.create"
  | "follow.add"
  | "follow.remove"
  | "plant.create"
  | "plant.delete"
  | "competition.enter"
  | "competition.vote"
  | "order.place"
  | "admin.ban_user"
  | "admin.unban_user"
  | "admin.delete_post"
  | "admin.delete_comment"
  | "admin.approve_product"
  | "admin.reject_product"
  | "admin.create_competition"
  | "admin.close_competition"
  | "admin.delete_competition"
  | "admin.resolve_report"
  | "admin.approve_verification"
  | "admin.reject_verification"
  | "moderation.report_create";

export interface LogEntry {
  id: string;
  action: LogAction;
  userId: string | null;
  targetId: string | null;
  targetType: string | null;
  metadata: Record<string, string | number | boolean> | null;
  createdAt: import("firebase/firestore").Timestamp | null;
}

export async function log(
  action: LogAction,
  userId: string | null,
  options: {
    targetId?: string;
    targetType?: string;
    metadata?: Record<string, string | number | boolean>;
  } = {}
): Promise<void> {
  try {
    await addDoc(collection(firestore, COLLECTIONS.logs), {
      action,
      userId,
      targetId: options.targetId ?? null,
      targetType: options.targetType ?? null,
      metadata: options.metadata ?? null,
      createdAt: serverTimestamp(),
    });
  } catch {
    // Logging must never crash the app
  }
}
