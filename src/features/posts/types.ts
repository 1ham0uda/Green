import type { Timestamp } from "firebase/firestore";

export interface Post {
  id: string;
  authorId: string;
  authorHandle: string;
  authorDisplayName: string;
  authorPhotoURL: string | null;
  authorIsVerified: boolean;
  caption: string;
  imageURL: string;
  plantId: string | null;
  likeCount: number;
  commentCount: number;
  createdAt: Timestamp | null;
}

export interface CreatePostInput {
  caption: string;
  imageFile: File;
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
