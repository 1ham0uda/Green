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
import { validateString, ValidationError } from "@/lib/security/validation";
import { checkRateLimit } from "@/lib/security/rate-limit";
import type { CreateReportInput, ReportTargetType } from "../types";

const ID_RE = /^[A-Za-z0-9_-]{1,128}$/;

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

const ALLOWED_TARGET_TYPES: ReadonlySet<ReportTargetType> = new Set<ReportTargetType>([
  "post",
  "comment",
  "user",
]);

export function containsBlockedContent(text: string): boolean {
  const lower = text.toLowerCase();
  return BLOCKED_KEYWORDS.some((kw) => lower.includes(kw));
}

export function getFlaggedKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  return BLOCKED_KEYWORDS.filter((kw) => lower.includes(kw));
}

export async function submitReport(input: CreateReportInput): Promise<void> {
  checkRateLimit("report.create");

  if (!ID_RE.test(input.reporterId) || !ID_RE.test(input.targetId)) {
    throw new ValidationError("Invalid identifier.");
  }
  if (input.reporterId === input.targetId) {
    throw new ValidationError("Cannot report yourself.");
  }
  if (!ALLOWED_TARGET_TYPES.has(input.targetType)) {
    throw new ValidationError("Invalid report target type.");
  }
  const reason = validateString(input.reason,
    { field: "Reason", min: 1, max: 1000 });

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
    reason,
    status: "open",
    createdAt: serverTimestamp(),
  });
}
