"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/features/marketplace/hooks/use-cart";
import { Icon } from "@/components/ui/icon";

export function CartLink() {
  const cart = useCart();
  const count = cart.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <Link
      href="/cart"
      className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
      aria-label={`Cart with ${count} items`}
    >
      <Icon.Cart size={20} />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-brand px-1 text-[10px] font-bold text-white shadow-soft ring-2 ring-surface"
          >
            {count > 99 ? "99+" : count}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
