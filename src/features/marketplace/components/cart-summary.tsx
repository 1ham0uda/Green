"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPrice } from "@/lib/utils/format";
import { useCart } from "../hooks/use-cart";
import { usePlaceMockOrder } from "../hooks/use-orders";

export function CartSummary() {
  const cart = useCart();
  const placeOrder = usePlaceMockOrder();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const subtotal = cart.subtotal();

  async function handleCheckout() {
    setError(null);
    try {
      await placeOrder.mutateAsync(cart.items);
      router.push("/orders");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-zinc-500">
        Your cart is empty.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ul className="divide-y divide-surface-border overflow-hidden rounded-lg border border-surface-border bg-white">
        {cart.items.map((item) => (
          <li key={item.productId} className="flex items-center gap-4 p-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-md bg-brand-50">
              {item.imageURL && (
                <Image
                  src={item.imageURL}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-900">
                {item.name}
              </p>
              <p className="text-xs text-zinc-500">
                {formatPrice(item.unitPrice)}
              </p>
            </div>

            <input
              type="number"
              min={0}
              value={item.quantity}
              onChange={(e) =>
                void cart.setQuantity(item.productId, Number(e.target.value) || 0)
              }
              className="input w-20"
            />

            <button
              type="button"
              onClick={() => void cart.remove(item.productId)}
              className="text-sm text-zinc-500 hover:text-red-600"
              aria-label={`Remove ${item.name}`}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-600">Subtotal</span>
        <span className="text-lg font-semibold text-zinc-900">
          {formatPrice(subtotal)}
        </span>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => void handleCheckout()}
          disabled={placeOrder.isPending}
          className="btn-primary"
        >
          {placeOrder.isPending ? "Placing order…" : "Checkout (mock)"}
        </button>
        <button
          type="button"
          onClick={() => void cart.clear()}
          className="btn-secondary"
        >
          Clear cart
        </button>
      </div>

      <p className="text-xs text-zinc-500">
        Payments are not implemented. Checkout creates a pending order record
        only.
      </p>
    </div>
  );
}
