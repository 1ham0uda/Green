import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { buildUserScopedPath, uploadImage } from "@/lib/firebase/storage";
import {
  validateImageFiles,
  validateOptionalString,
  validateString,
  ValidationError,
} from "@/lib/security/validation";
import { checkRateLimit } from "@/lib/security/rate-limit";
import type { CreateReturnInput, ReturnRequest, ReturnStatus } from "../types";

const COL = COLLECTIONS.returnRequests;
const ID_RE = /^[A-Za-z0-9_-]{1,128}$/;
const MAX_RETURN_IMAGES = 6;
const RETURN_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

const VALID_STATUSES: ReadonlySet<ReturnStatus> = new Set<ReturnStatus>([
  "pending",
  "approved",
  "rejected",
]);

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
  checkRateLimit("return.create");

  if (!ID_RE.test(buyerId)) throw new ValidationError("Invalid buyer id.");
  if (!ID_RE.test(input.orderId)) throw new ValidationError("Invalid order id.");
  if (!ID_RE.test(input.vendorId)) throw new ValidationError("Invalid vendor id.");

  const reason = validateString(input.reason,
    { field: "Reason", min: 5, max: 1000 });

  const files = validateImageFiles(input.imageFiles ?? [], {
    field: "Return photo",
    maxBytes: RETURN_IMAGE_MAX_BYTES,
    maxCount: MAX_RETURN_IMAGES,
  });

  const orderSnap = await getDoc(doc(firestore, COLLECTIONS.orders, input.orderId));
  if (!orderSnap.exists()) {
    throw new Error("Order not found.");
  }
  const orderData = orderSnap.data();
  if (orderData.buyerId !== buyerId) {
    throw new Error("You can only request a return for your own orders.");
  }
  if (orderData.vendorId !== input.vendorId) {
    throw new Error("Return vendor does not match the order.");
  }
  if (orderData.status !== "delivered") {
    throw new Error("Returns can only be requested for delivered orders.");
  }

  const duplicate = await hasReturnRequest(input.orderId, buyerId);
  if (duplicate) {
    throw new Error("A return request for this order has already been submitted.");
  }

  const imageURLs: string[] = await Promise.all(
    files.map((file, i) =>
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
    reason,
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

export async function fetchVendorReturns(vendorId: string): Promise<ReturnRequest[]> {
  const q = query(
    collection(firestore, COL),
    where("vendorId", "==", vendorId),
    orderBy("createdAt", "desc"),
    limit(100)
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
  checkRateLimit("return.review");
  if (!ID_RE.test(returnId)) throw new ValidationError("Invalid return id.");
  if (!VALID_STATUSES.has(status)) {
    throw new ValidationError("Invalid return status.");
  }
  const note = validateOptionalString(adminNote, { field: "Admin note", max: 1000 });
  await updateDoc(doc(firestore, COL, returnId), {
    status,
    adminNote: note,
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
