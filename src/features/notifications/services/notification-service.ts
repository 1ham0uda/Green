import {
  addDoc,
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  doc,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/config";
import {
  sanitizeShortText,
  validateOptionalHttpUrl,
  validateOptionalString,
  ValidationError,
} from "@/lib/security/validation";
import type { Notification, NotificationType } from "../types";

const ID_RE = /^[A-Za-z0-9_-]{1,128}$/;

const ALLOWED_TYPES: ReadonlySet<NotificationType> = new Set<NotificationType>([
  "like",
  "comment",
  "follow",
  "post_approved",
  "post_rejected",
  "product_approved",
  "product_rejected",
  "ad_approved",
  "ad_rejected",
]);

function notifRef(userId: string) {
  return collection(firestore, "users", userId, "notifications");
}

function mapNotif(
  snap: import("firebase/firestore").QueryDocumentSnapshot
): Notification {
  const d = snap.data();
  return {
    id: snap.id,
    type: d.type as NotificationType,
    fromUserId: d.fromUserId,
    fromUserHandle: d.fromUserHandle,
    fromUserDisplayName: d.fromUserDisplayName,
    fromUserPhotoURL: d.fromUserPhotoURL ?? null,
    postId: d.postId ?? null,
    postImageURL: d.postImageURL ?? null,
    commentBody: d.commentBody ?? null,
    message: d.message ?? null,
    read: d.read ?? false,
    createdAt: d.createdAt ?? null,
  };
}

interface CreateNotifPayload {
  toUserId: string;
  type: NotificationType;
  fromUserId: string;
  fromUserHandle: string;
  fromUserDisplayName: string;
  fromUserPhotoURL?: string | null;
  postId?: string;
  postImageURL?: string;
  commentBody?: string;
  message?: string;
}

export async function createNotification(
  payload: CreateNotifPayload
): Promise<void> {
  // Never notify yourself — prevents trivial self-spam.
  if (payload.toUserId === payload.fromUserId) return;

  // Structural checks: malformed ids, unknown types, or oversized attacker-
  // controlled strings never reach Firestore. Failing silently is intentional;
  // notifications are best-effort and a malformed payload usually means a bug
  // upstream rather than user-facing input.
  if (!ID_RE.test(payload.toUserId) || !ID_RE.test(payload.fromUserId)) return;
  if (!ALLOWED_TYPES.has(payload.type)) return;
  if (payload.postId && !ID_RE.test(payload.postId)) return;

  let fromUserHandle: string;
  let fromUserDisplayName: string;
  let fromUserPhotoURL: string | null;
  let postImageURL: string | null;
  let commentBody: string | null;
  let message: string | null;
  try {
    fromUserHandle = sanitizeShortText(payload.fromUserHandle).slice(0, 40);
    fromUserDisplayName = sanitizeShortText(payload.fromUserDisplayName).slice(0, 80);
    fromUserPhotoURL = validateOptionalHttpUrl(payload.fromUserPhotoURL, {
      field: "Photo URL",
    });
    postImageURL = validateOptionalHttpUrl(payload.postImageURL, {
      field: "Post image URL",
    });
    commentBody = validateOptionalString(payload.commentBody, {
      field: "Comment",
      max: 280,
    });
    message = validateOptionalString(payload.message, {
      field: "Message",
      max: 500,
    });
  } catch (err) {
    if (err instanceof ValidationError) return;
    throw err;
  }

  if (!fromUserHandle || !fromUserDisplayName) return;

  await addDoc(notifRef(payload.toUserId), {
    type: payload.type,
    fromUserId: payload.fromUserId,
    fromUserHandle,
    fromUserDisplayName,
    fromUserPhotoURL,
    postId: payload.postId ?? null,
    postImageURL,
    commentBody,
    message,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToNotifications(
  userId: string,
  onUpdate: (notifications: Notification[]) => void
): Unsubscribe {
  const q = query(
    notifRef(userId),
    orderBy("createdAt", "desc"),
    limit(50)
  );

  return onSnapshot(q, (snap) => {
    onUpdate(snap.docs.map(mapNotif));
  });
}

export async function markAllRead(userId: string): Promise<void> {
  const q = query(notifRef(userId), where("read", "==", false), limit(50));
  const snap = await getDocs(q);
  if (snap.empty) return;

  const batch = writeBatch(firestore);
  snap.docs.forEach((d) =>
    batch.update(doc(firestore, "users", userId, "notifications", d.id), {
      read: true,
    })
  );
  await batch.commit();
}

export async function markOneRead(
  userId: string,
  notifId: string
): Promise<void> {
  if (!ID_RE.test(userId) || !ID_RE.test(notifId)) return;
  await updateDoc(
    doc(firestore, "users", userId, "notifications", notifId),
    { read: true }
  );
}
