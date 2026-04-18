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
  type QueryDocumentSnapshot,
  type DocumentSnapshot,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type {
  CartItem,
  Order,
  OrderLine,
  OrderStatus,
} from "../types";
import { saveCart } from "./cart-service";

const ORDERS = COLLECTIONS.orders;

function mapOrder(snap: QueryDocumentSnapshot | DocumentSnapshot): Order {
  const data = snap.data();
  if (!data) throw new Error("Order snapshot has no data");
  return {
    id: snap.id,
    buyerId: data.buyerId,
    vendorId: data.vendorId,
    lines: (data.lines ?? []) as OrderLine[],
    subtotal: data.subtotal ?? 0,
    currency: data.currency ?? "USD",
    status: data.status ?? "pending",
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

function groupByVendor(items: CartItem[]): Map<string, CartItem[]> {
  const map = new Map<string, CartItem[]>();
  for (const item of items) {
    const list = map.get(item.vendorId) ?? [];
    list.push(item);
    map.set(item.vendorId, list);
  }
  return map;
}

export async function placeMockOrder(
  buyerId: string,
  items: CartItem[],
  currency = "USD"
): Promise<Order[]> {
  if (items.length === 0) throw new Error("Cart is empty");

  const grouped = groupByVendor(items);
  const orders: Order[] = [];

  for (const [vendorId, vendorItems] of grouped.entries()) {
    const lines: OrderLine[] = vendorItems.map((item) => ({
      productId: item.productId,
      vendorId: item.vendorId,
      name: item.name,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      imageURL: item.imageURL,
    }));

    const subtotal = lines.reduce(
      (total, l) => total + l.unitPrice * l.quantity,
      0
    );

    const payload = {
      buyerId,
      vendorId,
      lines,
      subtotal,
      currency,
      status: "pending" as OrderStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const created = await addDoc(collection(firestore, ORDERS), payload);
    orders.push({
      id: created.id,
      buyerId,
      vendorId,
      lines,
      subtotal,
      currency,
      status: "pending",
      createdAt: null,
      updatedAt: null,
    });
  }

  // Clear the buyer's cart after a successful mock checkout.
  await saveCart(buyerId, []);

  return orders;
}

export async function fetchBuyerOrders(buyerId: string): Promise<Order[]> {
  const q = query(
    collection(firestore, ORDERS),
    where("buyerId", "==", buyerId),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapOrder);
}

export async function fetchVendorOrders(vendorId: string): Promise<Order[]> {
  const q = query(
    collection(firestore, ORDERS),
    where("vendorId", "==", vendorId),
    orderBy("createdAt", "desc"),
    limit(100)
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapOrder);
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  await updateDoc(doc(firestore, ORDERS, orderId), {
    status,
    updatedAt: serverTimestamp(),
  });
}
