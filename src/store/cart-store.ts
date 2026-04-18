"use client";

import { create } from "zustand";
import {
  cartSubtotal,
  fetchCart,
  mergeCartItem,
  removeItem,
  saveCart,
  updateQuantity,
} from "@/features/marketplace/services/cart-service";
import type { CartItem } from "@/features/marketplace/types";

interface CartState {
  userId: string | null;
  items: CartItem[];
  loading: boolean;
  error: string | null;
  hydrate: (userId: string | null) => Promise<void>;
  addItem: (item: CartItem) => Promise<void>;
  setQuantity: (productId: string, quantity: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
  subtotal: () => number;
}

async function persist(userId: string | null, items: CartItem[]) {
  if (!userId) return;
  await saveCart(userId, items);
}

export const useCartStore = create<CartState>((set, get) => ({
  userId: null,
  items: [],
  loading: false,
  error: null,

  async hydrate(userId) {
    if (!userId) {
      set({ userId: null, items: [] });
      return;
    }
    set({ loading: true, error: null, userId });
    try {
      const cart = await fetchCart(userId);
      set({ items: cart.items, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load cart",
        loading: false,
      });
    }
  },

  async addItem(item) {
    const { userId, items } = get();
    const next = mergeCartItem(items, item);
    set({ items: next });
    await persist(userId, next);
  },

  async setQuantity(productId, quantity) {
    const { userId, items } = get();
    const next = updateQuantity(items, productId, quantity);
    set({ items: next });
    await persist(userId, next);
  },

  async remove(productId) {
    const { userId, items } = get();
    const next = removeItem(items, productId);
    set({ items: next });
    await persist(userId, next);
  },

  async clear() {
    const { userId } = get();
    set({ items: [] });
    await persist(userId, []);
  },

  subtotal() {
    return cartSubtotal(get().items);
  },
}));
