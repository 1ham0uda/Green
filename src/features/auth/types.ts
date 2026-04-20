import type { Timestamp } from "firebase/firestore";

export type UserRole = "user" | "business" | "admin";
export type VerificationStatus = "none" | "pending" | "approved" | "rejected";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  /** Unique @handle — also exposed as `username` in the UI */
  handle: string;
  photoURL: string | null;
  coverPhotoURL: string | null;
  bio: string;
  role: UserRole;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  isBanned: boolean;
  bannedReason: string | null;
  followerCount: number;
  followingCount: number;
  postCount: number;
  // Location — required at signup
  country: string;
  governorate: string;
  city: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface SignUpInput {
  email: string;
  password: string;
  displayName: string;
  /** Unique username — stored as `handle` in Firestore */
  username: string;
  role: "user" | "business";
  country: string;
  governorate: string;
  city: string;
}

export interface SignInInput {
  email: string;
  password: string;
}
