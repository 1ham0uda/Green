import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  doc,
  where,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { buildUserScopedPath, uploadImage } from "@/lib/firebase/storage";
import type { CreateReturnInput, ReturnRequest, ReturnStatus } from "../types";

const COL = COLLECTIONS.returnRequests;

function mapReturn(d: { id: string; data: () => Record<string, unknown> }): ReturnRequest {
  const data = d.data();
  return {
    id: d.id,
    orderId: data.orderId as string,
    buyerId: data.buyerId as string,
    vendorId: data.vendorId as string,
    reason: data.reason as string,
    imageURLs: (data.imageURLs as string[]) ?? [],
    status: (data.status as ReturnStatus) ?? "pending",
    adminNote: (data.adminNote as string | null) ?? null,
    createdAt: (data.createdAt as ReturnRequest["createdAt"]) ?? null,
    updatedAt: (data.updatedAt as ReturnRequest["updatedAt"]) ?? null,
  };
}

export async function createReturnRequest(
  buyerId: string,
  input: CreateReturnInput
): Promise<string> {
  const imageURLs: string[] = await Promise.all(
    input.imageFiles.map((file, i) =>
      uploadImage(
        buildUserScopedPath("returns", buyerId, `${input.orderId}-${i}-${file.name}`),
        file
      )
    )
  );

  const ref = await addDoc(collection(firestore, COL), {
    orderId: input.orderId,
    buyerId,
    vendorId: input.vendorId,
    reason: input.reason.trim(),
    imageURLs,
    status: "pending" as ReturnStatus,
    adminNote: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function fetchBuyerReturns(buyerId: string): Promise<ReturnRequest[]> {
  const q = query(
    collection(firestore, COL),
    where("buyerId", "==", buyerId),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapReturn({ id: d.id, data: d.data.bind(d) }));
}

export async function fetchAllReturns(): Promise<ReturnRequest[]> {
  const q = query(
    collection(firestore, COL),
    orderBy("createdAt", "desc"),
    limit(100)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapReturn({ id: d.id, data: d.data.bind(d) }));
}

export async function updateReturnStatus(
  returnId: string,
  status: ReturnStatus,
  adminNote?: string
): Promise<void> {
  await updateDoc(doc(firestore, COL, returnId), {
    status,
    adminNote: adminNote ?? null,
    updatedAt: serverTimestamp(),
  });
}

export async function hasReturnRequest(orderId: string, buyerId: string): Promise<boolean> {
  const q = query(
    collection(firestore, COL),
    where("orderId", "==", orderId),
    where("buyerId", "==", buyerId),
    limit(1)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}
