import type { Timestamp } from "firebase/firestore";

export type AdStatus = "pending" | "approved" | "rejected" | "paused" | "exhausted";

export interface Ad {
  id: string;
  vendorId: string;
  vendorHandle: string;
  vendorDisplayName: string;
  /** Headline text shown in the card */
  headline: string;
  /** Optional body copy */
  body: string | null;
  /** Optional image URL */
  imageURL: string | null;
  /** Optional CTA link */
  linkURL: string | null;
  /** Location targeting — empty array means nationwide */
  targetCountries: string[];
  targetGovernorates: string[];
  targetCities: string[];
  /** Max number of impressions purchased */
  reach: number;
  /** Impressions delivered so far */
  impressionsDelivered: number;
  status: AdStatus;
  rejectionReason: string | null;
  /** Admin who reviewed */
  reviewedBy: string | null;
  createdAt: Timestamp | null;
  reviewedAt: Timestamp | null;
  startsAt: Timestamp | null;
  endsAt: Timestamp | null;
}

export interface CreateAdInput {
  headline: string;
  body?: string;
  imageFile?: File | null;
  linkURL?: string;
  targetGovernorates?: string[];
  targetCities?: string[];
  reach: number;
  startsAt?: Date;
  endsAt?: Date;
}
