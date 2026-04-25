import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  doc,
  where,
  increment,
  type QueryDocumentSnapshot,
  type DocumentSnapshot,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import {
  validateInt,
  validateString,
  ValidationError,
} from "@/lib/security/validation";
import { checkRateLimit } from "@/lib/security/rate-limit";
import type {
  CartItem,
  Order,
  OrderLine,
  OrderStatus,
  ShippingAddress,
} from "../types";
import { saveCart } from "./cart-service";

export const SHIPPING_FEE = 90;

const ORDERS = COLLECTIONS.orders;
const ID_RE = /^[A-Za-z0-9_-]{1,128}$/;
const ALLOWED_CURRENCIES = new Set(["EGP", "USD", "EUR", "GBP", "SAR", "AED"]);
const MAX_CART_LINES = 50;
const PHONE_RE = /^[+\d][\d\s\-()]{4,24}$/;

const EMPTY_SHIPPING: ShippingAddress = {
  recipientName: "",
  phone: "",
  governorate: "",
  city: "",
  addressLine: "",
  notes: "",
};

const VALID_STATUSES: ReadonlySet<OrderStatus> = new Set<OrderStatus>([
  "pending",
  "accepted",
  "processing",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
]);

function mapOrder(snap: QueryDocumentSnapshot | DocumentSnapshot): Order {
  const data = snap.data();
  if (!data) throw new Error("Order snapshot has no data");
  return {
    id: snap.id,
    buyerId: data.buyerId,
    vendorId: data.vendorId,
    lines: (data.lines ?? []) as OrderLine[],
    subtotal: data.subtotal ?? 0,
    shippingFee: data.shippingFee ?? SHIPPING_FEE,
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

function validateShippingAddress(raw: unknown): ShippingAddress {
  if (!raw || typeof raw !== "object") {
    throw new ValidationError("Shipping address is required.");
  }
  const src = raw as Record<string, unknown>;
  const recipientName = validateString(src.recipientName,
    { field: "Recipient name", min: 2, max: 80 });
  const rawPhone = typeof src.phone === "string" ? src.phone.trim() : "";
  if (!PHONE_RE.test(rawPhone)) {
    throw new ValidationError("Phone number is invalid.");
  }
  const governorate = validateString(src.governorate,
    { field: "Governorate", min: 1, max: 80 });
  const city = validateString(src.city, { field: "City", min: 1, max: 80 });
  const addressLine = validateString(src.addressLine,
    { field: "Address", min: 3, max: 300 });
  const notes = typeof src.notes === "string" && src.notes.length > 0
    ? validateString(src.notes, { field: "Notes", min: 0, max: 300 })
    : "";
  return { recipientName, phone: rawPhone, governorate, city, addressLine, notes };
}

function validateCartItem(raw: unknown, index: number): CartItem {
  if (!raw || typeof raw !== "object") {
    throw new ValidationError(`Cart line ${index + 1} is invalid.`);
  }
  const src = raw as Record<string, unknown>;
  const productId = typeof src.productId === "string" ? src.productId : "";
  const vendorId = typeof src.vendorId === "string" ? src.vendorId : "";
  if (!ID_RE.test(productId) || !ID_RE.test(vendorId)) {
    throw new ValidationError(`Cart line ${index + 1} references an invalid product.`);
  }
  const name = validateString(src.name, { field: "Product name", min: 1, max: 200 });
  const quantity = validateInt(src.quantity,
    { field: "Quantity", min: 1, max: 999 });
  // unitPrice / imageURL from the cart are informational; the transaction
  // re-reads both from Firestore before charging. We only sanity-check shape.
  const unitPrice = typeof src.unitPrice === "number" && Number.isFinite(src.unitPrice)
    ? src.unitPrice
    : 0;
  const imageURL = typeof src.imageURL === "string" ? src.imageURL : null;
  return { productId, vendorId, name, quantity, unitPrice, imageURL };
}

export async function placeCodOrder(
  buyerId: string,
  items: CartItem[],
  shippingAddress: ShippingAddress,
  currency = "EGP"
): Promise<Order[]> {
  checkRateLimit("order.place");
  if (!ID_RE.test(buyerId)) throw new ValidationError("Invalid buyer id.");
  if (!Array.isArray(items) || items.length === 0) {
    throw new ValidationError("Cart is empty.");
  }
  if (items.length > MAX_CART_LINES) {
    throw new ValidationError("Too many items in cart.");
  }
  const cleanCurrency = currency.toString().toUpperCase();
  if (!ALLOWED_CURRENCIES.has(cleanCurrency)) {
    throw new ValidationError("Unsupported currency.");
  }

  const cleanItems = items.map((it, i) => validateCartItem(it, i));
  const cleanAddress = validateShippingAddress(shippingAddress);

  const grouped = groupByVendor(cleanItems);
  const orders: Order[] = [];

  for (const [vendorId, vendorItems] of grouped.entries()) {
    const productRefs = vendorItems.map((item) =>
      doc(firestore, COLLECTIONS.products, item.productId)
    );
    const orderRef = doc(collection(firestore, ORDERS));

    let committedLines: OrderLine[] = [];
    let committedSubtotal = 0;

    await runTransaction(firestore, async (tx) => {
      const productSnaps = await Promise.all(productRefs.map((r) => tx.get(r)));

      const lines: OrderLine[] = [];
      let subtotal = 0;

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

        // Always use the live price from Firestore — never trust cart state.
        const livePrice: number = data.price ?? 0;

        lines.push({
          productId: item.productId,
          vendorId: item.vendorId,
          name: item.name,
          unitPrice: livePrice,
          quantity: item.quantity,
          imageURL: item.imageURL,
        });

        subtotal += livePrice * item.quantity;

        tx.update(snap.ref, { stock: increment(-item.quantity) });
      }

      committedLines = lines;
      committedSubtotal = subtotal;

      tx.set(orderRef, {
        buyerId,
        vendorId,
        lines,
        subtotal,
        shippingFee: SHIPPING_FEE,
        currency: cleanCurrency,
        status: "pending" as OrderStatus,
        paymentMethod: "cod" as const,
        shippingAddress: cleanAddress,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    orders.push({
      id: orderRef.id,
      buyerId,
      vendorId,
      lines: committedLines,
      subtotal: committedSubtotal,
      shippingFee: SHIPPING_FEE,
      currency: cleanCurrency,
      status: "pending",
      paymentMethod: "cod",
      shippingAddress: cleanAddress,
      createdAt: null,
      updatedAt: null,
    });
  }

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

// Valid order status transitions.
// Buyers may only cancel pending orders (enforced in Firestore rules too).
// Vendors drive the forward flow; terminal states block all transitions.
const VENDOR_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending:    ["accepted", "cancelled"],
  accepted:   ["processing", "cancelled"],
  processing: ["confirmed"],
  confirmed:  ["shipped"],
  shipped:    ["delivered"],
  // delivered and cancelled are terminal — no further transitions allowed.
};

export function getValidVendorTransitions(current: OrderStatus): OrderStatus[] {
  return VENDOR_TRANSITIONS[current] ?? [];
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  checkRateLimit("order.status");
  if (!ID_RE.test(orderId)) throw new ValidationError("Invalid order id.");
  if (!VALID_STATUSES.has(status)) {
    throw new ValidationError("Invalid order status.");
  }
  await updateDoc(doc(firestore, ORDERS, orderId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function cancelOrder(
  orderId: string,
  buyerId: string
): Promise<void> {
  checkRateLimit("order.cancel");
  if (!ID_RE.test(orderId) || !ID_RE.test(buyerId)) {
    throw new ValidationError("Invalid order or buyer id.");
  }
  const orderRef = doc(firestore, ORDERS, orderId);
  await runTransaction(firestore, async (tx) => {
    const snap = await tx.get(orderRef);
    if (!snap.exists()) throw new Error("Order not found.");
    const data = snap.data();
    if (data.buyerId !== buyerId) throw new Error("Not authorized.");
    if (data.status !== "pending") {
      throw new Error("Only pending orders can be cancelled.");
    }
    tx.update(orderRef, { status: "cancelled", updatedAt: serverTimestamp() });
  });
}
