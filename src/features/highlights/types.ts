import type { Timestamp } from "firebase/firestore";

export interface Highlight {
  id: string;
  uid: string;
  title: string;
  coverImageURL: string;
  imageURLs: string[];
  createdAt: Timestamp | null;
}

export interface CreateHighlightInput {
  title: string;
  coverImageURL: string;
  imageURLs: string[];
}
