import type { UserProfile } from "@/features/auth/types";

export type PublicProfile = UserProfile;

export interface UpdateProfileInput {
  displayName?: string;
  bio?: string;
  handle?: string;
  avatarFile?: File | null;
  coverFile?: File | null;
}

export interface FollowEdge {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: number;
}
