import type { Timestamp } from "firebase/firestore";

export type PostStatus = "pending" | "approved" | "rejected";

export interface Post {
  id: string;
  authorId: string;
  authorHandle: string;
  authorDisplayName: string;
  authorPhotoURL: string | null;
  authorIsVerified: boolean;
  caption: string;
  imageURLs: string[];
  plantId: string | null;
  status: PostStatus;
  rejectionReason: string | null;
  // Author location at time of posting
  country: string;
  governorate: string;
  city: string;
  likeCount: number;
  commentCount: number;
  createdAt: Timestamp | null;
}

export interface CreatePostInput {
  caption: string;
  imageFiles: File[];
  plantId?: string | null;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorHandle: string;
  authorDisplayName: string;
  body: string;
  createdAt: Timestamp | null;
}
