import type { Timestamp } from "firebase/firestore";

export type NotificationType = "like" | "comment" | "follow";

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
  read: boolean;
  createdAt: Timestamp | null;
}
