import type { Timestamp } from "firebase/firestore";

export type UserRole = "user" | "vendor" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  handle: string;
  photoURL: string | null;
  bio: string;
  role: UserRole;
  followerCount: number;
  followingCount: number;
  postCount: number;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface SignUpInput {
  email: string;
  password: string;
  displayName: string;
}

export interface SignInInput {
  email: string;
  password: string;
}
