import type { Timestamp } from "firebase/firestore";

export interface Story {
  id: string;
  uid: string;
  userHandle: string;
  userDisplayName: string;
  userPhotoURL: string | null;
  imageURL: string;
  caption: string;
  createdAt: Timestamp | null;
  expiresAt: Timestamp | null;
}

export interface UserStories {
  uid: string;
  userHandle: string;
  userDisplayName: string;
  userPhotoURL: string | null;
  stories: Story[];
  hasUnviewed: boolean;
}
