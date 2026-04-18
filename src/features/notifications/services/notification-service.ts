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
import type { Notification, NotificationType } from "../types";

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
}

export async function createNotification(
  payload: CreateNotifPayload
): Promise<void> {
  // Don't notify yourself
  if (payload.toUserId === payload.fromUserId) return;

  await addDoc(notifRef(payload.toUserId), {
    type: payload.type,
    fromUserId: payload.fromUserId,
    fromUserHandle: payload.fromUserHandle,
    fromUserDisplayName: payload.fromUserDisplayName,
    fromUserPhotoURL: payload.fromUserPhotoURL,
    postId: payload.postId ?? null,
    postImageURL: payload.postImageURL ?? null,
    commentBody: payload.commentBody ?? null,
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
  await updateDoc(
    doc(firestore, "users", userId, "notifications", notifId),
    { read: true }
  );
}
