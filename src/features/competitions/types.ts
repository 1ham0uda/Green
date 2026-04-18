import type { Timestamp } from "firebase/firestore";

export type CompetitionStatus = "upcoming" | "active" | "closed";

export interface Competition {
  id: string;
  title: string;
  description: string;
  coverImageURL: string | null;
  status: CompetitionStatus;
  startsAt: Timestamp | null;
  endsAt: Timestamp | null;
  entryCount: number;
  createdAt: Timestamp | null;
}

export interface CompetitionEntry {
  id: string;
  competitionId: string;
  postId: string;
  userId: string;
  userHandle: string;
  userDisplayName: string;
  postImageURL: string;
  postCaption: string;
  voteCount: number;
  createdAt: Timestamp | null;
}

export interface LeaderboardRow {
  entry: CompetitionEntry;
  rank: number;
}
