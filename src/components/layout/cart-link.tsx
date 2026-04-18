"use client";

import Link from "next/link";
import { useCart } from "@/features/marketplace/hooks/use-cart";

export function CartLink() {
  const cart = useCart();
  const count = cart.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <Link
      href="/cart"
      className="relative text-zinc-600 hover:text-zinc-900"
      aria-label={`Cart with ${count} items`}
    >
      Cart
      {count > 0 && (
        <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
