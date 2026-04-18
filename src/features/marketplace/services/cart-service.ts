import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { Cart, CartItem } from "../types";

const CARTS = COLLECTIONS.carts;

function emptyCart(userId: string): Cart {
  return { userId, items: [], updatedAt: null };
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
  await setDoc(
    doc(firestore, CARTS, userId),
    {
      userId,
      items,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function mergeCartItem(items: CartItem[], newItem: CartItem): CartItem[] {
  const idx = items.findIndex((i) => i.productId === newItem.productId);
  if (idx === -1) return [...items, newItem];
  const next = [...items];
  next[idx] = { ...next[idx], quantity: next[idx].quantity + newItem.quantity };
  return next;
}

export function updateQuantity(
  items: CartItem[],
  productId: string,
  quantity: number
): CartItem[] {
  if (quantity <= 0) return items.filter((i) => i.productId !== productId);
  return items.map((i) =>
    i.productId === productId ? { ...i, quantity } : i
  );
}

export function removeItem(items: CartItem[], productId: string): CartItem[] {
  return items.filter((i) => i.productId !== productId);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((total, i) => total + i.unitPrice * i.quantity, 0);
}
