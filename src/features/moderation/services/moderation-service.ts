import {
  addDoc,
  collection,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { CreateReportInput } from "../types";

const BLOCKED_KEYWORDS = [
  "spam",
  "scam",
  "fake",
  "hate",
  "racist",
  "violence",
  "abuse",
  "harassment",
  "xxx",
  "porn",
];

export function containsBlockedContent(text: string): boolean {
  const lower = text.toLowerCase();
  return BLOCKED_KEYWORDS.some((kw) => lower.includes(kw));
}

export function getFlaggedKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  return BLOCKED_KEYWORDS.filter((kw) => lower.includes(kw));
}

export async function submitReport(input: CreateReportInput): Promise<void> {
  // prevent duplicate reports from same user for same target
  const existing = await getDocs(
    query(
      collection(firestore, COLLECTIONS.reports),
      where("reporterId", "==", input.reporterId),
      where("targetId", "==", input.targetId),
      where("status", "==", "open"),
      limit(1)
    )
  );

  if (!existing.empty) return;

  await addDoc(collection(firestore, COLLECTIONS.reports), {
    reporterId: input.reporterId,
    targetId: input.targetId,
    targetType: input.targetType,
    reason: input.reason,
    status: "open",
    createdAt: serverTimestamp(),
  });
}
