"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useCart } from "../hooks/use-cart";
import type { Product } from "../types";

export function AddToCartButton({ product }: { product: Product }) {
  const { user } = useAuth();
  const cart = useCart();
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const disabled = product.stock <= 0;

  async function handleAdd() {
    if (!user) {
      setFeedback("Sign in to add items to your cart.");
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      await cart.addItem({
        productId: product.id,
        vendorId: product.vendorId,
        name: product.name,
        unitPrice: product.price,
        imageURL: product.imageURL,
        quantity,
      });
      setFeedback("Added to cart.");
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Failed to add");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <label htmlFor="qty" className="text-sm text-zinc-700">
          Qty
        </label>
        <input
          id="qty"
          type="number"
          min={1}
          max={Math.max(product.stock, 1)}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          className="input w-24"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => void handleAdd()}
          disabled={disabled || busy}
          className="btn-primary"
        >
          {disabled ? "Out of stock" : busy ? "Adding…" : "Add to cart"}
        </button>
      </div>
      {feedback && <p className="text-sm text-zinc-600">{feedback}</p>}
    </div>
  );
}
