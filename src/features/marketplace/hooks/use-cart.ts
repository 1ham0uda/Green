"use client";

import { useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useCartStore } from "@/store/cart-store";

export function useCart() {
  const { user } = useAuth();
  const state = useCartStore();
  const hydrate = useCartStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate(user?.uid ?? null);
  }, [user?.uid, hydrate]);

  return state;
}
