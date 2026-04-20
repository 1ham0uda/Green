import {
  collection,
  getDocs,
  limit,
  query,
  runTransaction,
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
  ShippingAddress,
} from "../types";
import { saveCart } from "./cart-service";

const ORDERS = COLLECTIONS.orders;

const EMPTY_SHIPPING: ShippingAddress = {
  recipientName: "",
  phone: "",
  governorate: "",
  city: "",
  addressLine: "",
  notes: "",
};

function mapOrder(snap: QueryDocumentSnapshot | DocumentSnapshot): Order {
  const data = snap.data();
  if (!data) throw new Error("Order snapshot has no data");
  return {
    id: snap.id,
    buyerId: data.buyerId,
    vendorId: data.vendorId,
    lines: (data.lines ?? []) as OrderLine[],
    subtotal: data.subtotal ?? 0,
    currency: data.currency ?? "EGP",
    status: data.status ?? "pending",
    paymentMethod: data.paymentMethod ?? "cod",
    shippingAddress: {
      ...EMPTY_SHIPPING,
      ...(data.shippingAddress ?? {}),
    },
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

export async function placeCodOrder(
  buyerId: string,
  items: CartItem[],
  shippingAddress: ShippingAddress,
  currency = "EGP"
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
      paymentMethod: "cod" as const,
      shippingAddress,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const productRefs = vendorItems.map((item) =>
      doc(firestore, COLLECTIONS.products, item.productId)
    );
    const orderRef = doc(collection(firestore, ORDERS));

    // Transaction reads product docs to validate availability and stock at the
    // moment of order creation, then atomically writes the order document.
    // Stock decrement must be handled server-side (Cloud Function on order create)
    // because the buyer role cannot write to product documents per security rules.
    await runTransaction(firestore, async (tx) => {
      const productSnaps = await Promise.all(productRefs.map((r) => tx.get(r)));

      for (let i = 0; i < vendorItems.length; i++) {
        const snap = productSnaps[i];
        const item = vendorItems[i];
        if (!snap.exists()) {
          throw new Error(`Product "${item.name}" is no longer available.`);
        }
        const data = snap.data();
        if (data.status !== "approved" || data.isActive === false) {
          throw new Error(`Product "${item.name}" is not currently available.`);
        }
        const currentStock: number = data.stock ?? 0;
        if (currentStock < item.quantity) {
          throw new Error(
            `"${item.name}" only has ${currentStock} unit(s) in stock.`
          );
        }
      }

      tx.set(orderRef, payload);
    });

    orders.push({
      id: orderRef.id,
      buyerId,
      vendorId,
      lines,
      subtotal,
      currency,
      status: "pending",
      paymentMethod: "cod",
      shippingAddress,
      createdAt: null,
      updatedAt: null,
    });
  }

  await saveCart(buyerId, []);

  return orders;
}

function sortByCreatedDesc(orders: Order[]): Order[] {
  return orders.sort((a, b) => {
    const ta = a.createdAt?.toMillis() ?? 0;
    const tb = b.createdAt?.toMillis() ?? 0;
    return tb - ta;
  });
}

export async function fetchBuyerOrders(buyerId: string): Promise<Order[]> {
  const q = query(
    collection(firestore, ORDERS),
    where("buyerId", "==", buyerId),
    limit(50)
  );
  const snap = await getDocs(q);
  return sortByCreatedDesc(snap.docs.map(mapOrder));
}

export async function fetchVendorOrders(vendorId: string): Promise<Order[]> {
  const q = query(
    collection(firestore, ORDERS),
    where("vendorId", "==", vendorId),
    limit(100)
  );
  const snap = await getDocs(q);
  return sortByCreatedDesc(snap.docs.map(mapOrder));
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
