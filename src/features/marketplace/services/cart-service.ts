import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { validateInt, ValidationError } from "@/lib/security/validation";
import type { Cart, CartItem } from "../types";

const CARTS = COLLECTIONS.carts;
const ID_RE = /^[A-Za-z0-9_-]{1,128}$/;
const MAX_CART_ITEMS = 50;

function emptyCart(userId: string): Cart {
  return { userId, items: [], updatedAt: null };
}

function validateCartItems(items: CartItem[]): CartItem[] {
  if (!Array.isArray(items)) throw new ValidationError("Invalid cart.");
  if (items.length > MAX_CART_ITEMS) {
    throw new ValidationError("Cart has too many items.");
  }
  return items.filter((item) => {
    // Drop malformed items silently — they're client-side local state.
    return (
      typeof item.productId === "string" && ID_RE.test(item.productId) &&
      typeof item.vendorId === "string" && ID_RE.test(item.vendorId) &&
      typeof item.quantity === "number" && item.quantity >= 1 && item.quantity <= 999
    );
  });
}

export async function fetchCart(userId: string): Promise<Cart> {
  const snap = await getDoc(doc(firestore, CARTS, userId));
  if (!snap.exists()) return emptyCart(userId);
  const data = snap.data();
  return {
    userId,
    items: (data.items ?? []) as CartItem[],
    updatedAt: data.updatedAt ?? null,
  };
}

export async function saveCart(userId: string, items: CartItem[]): Promise<void> {
  if (!ID_RE.test(userId)) throw new ValidationError("Invalid user id.");
  const cleanItems = validateCartItems(items);
  await setDoc(
    doc(firestore, CARTS, userId),
    {
      userId,
      items: cleanItems,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function mergeCartItem(items: CartItem[], newItem: CartItem): CartItem[] {
  const qty = validateInt(newItem.quantity, { field: "Quantity", min: 1, max: 999 });
  const idx = items.findIndex((i) => i.productId === newItem.productId);
  if (idx === -1) return [...items, { ...newItem, quantity: qty }];
  const next = [...items];
  const combined = next[idx].quantity + qty;
  next[idx] = { ...next[idx], quantity: Math.min(combined, 999) };
  return next;
}

export function updateQuantity(
  items: CartItem[],
  productId: string,
  quantity: number
): CartItem[] {
  if (quantity <= 0) return items.filter((i) => i.productId !== productId);
  const clampedQty = Math.min(Math.max(Math.floor(quantity), 1), 999);
  return items.map((i) =>
    i.productId === productId ? { ...i, quantity: clampedQty } : i
  );
}

export function removeItem(items: CartItem[], productId: string): CartItem[] {
  return items.filter((i) => i.productId !== productId);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((total, i) => total + i.unitPrice * i.quantity, 0);
}
