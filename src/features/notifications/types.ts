import type { Timestamp } from "firebase/firestore";

export type NotificationType =
  | "like"
  | "comment"
  | "follow"
  | "post_approved"
  | "post_rejected"
  | "product_approved"
  | "product_rejected"
  | "ad_approved"
  | "ad_rejected";

export interface Notification {
  id: string;
  type: NotificationType;
  fromUserId: string;
  fromUserHandle: string;
  fromUserDisplayName: string;
  fromUserPhotoURL: string | null;
  postId: string | null;
  postImageURL: string | null;
  commentBody: string | null;
  /** Used for rejection reason or status messages */
  message: string | null;
  read: boolean;
  createdAt: Timestamp | null;
}
