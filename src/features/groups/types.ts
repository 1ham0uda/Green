import type { Timestamp } from "firebase/firestore";

export interface Group {
  id: string;
  name: string;
  description: string;
  coverImageURL: string | null;
  creatorId: string;
  creatorHandle: string;
  memberCount: number;
  postCount: number;
  isPublic: boolean;
  createdAt: Timestamp | null;
}

export interface GroupMember {
  userId: string;
  userHandle: string;
  userDisplayName: string;
  userPhotoURL: string | null;
  role: "admin" | "member";
  joinedAt: Timestamp | null;
}

export interface GroupPost {
  id: string;
  groupId: string;
  authorId: string;
  authorHandle: string;
  authorDisplayName: string;
  authorPhotoURL: string | null;
  caption: string;
  imageURLs: string[];
  likeCount: number;
  commentCount: number;
  createdAt: Timestamp | null;
}

export interface CreateGroupInput {
  name: string;
  description: string;
  isPublic: boolean;
  coverFile?: File | null;
}
