"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { ShippingForm } from "@/features/marketplace/components/shipping-form";
import { useCart } from "@/features/marketplace/hooks/use-cart";
import { usePlaceCodOrder } from "@/features/marketplace/hooks/use-orders";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { formatPrice } from "@/lib/utils/format";
import { SHIPPING_FEE } from "@/features/marketplace/services/order-service";
import type { ShippingAddress } from "@/features/marketplace/types";

export default function CheckoutPage() {
  return (
    <main className="container max-w-2xl pb-24 md:pb-8">
      <AuthGate>
        <CheckoutContent />
      </AuthGate>
    </main>
  );
}

function CheckoutContent() {
  const cart = useCart();
  const placeOrder = usePlaceCodOrder();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const subtotal = cart.subtotal();
  const total = subtotal + SHIPPING_FEE;

  if (cart.items.length === 0) {
    return (
      <EmptyState
        icon={<Icon.ShoppingBag size={22} />}
        title="Your cart is empty"
        description="Add some products before checking out."
        action={
          <a href="/marketplace" className="btn-primary">
            Browse marketplace
          </a>
        }
      />
    );
  }

  async function handleSubmit(address: ShippingAddress) {
    setError(null);
    try {
      await placeOrder.mutateAsync({
        items: cart.items,
        shippingAddress: address,
      });
      router.push("/orders");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="py-5">
        <p className="eyebrow">Shop</p>
        <h1 className="font-serif text-[28px] font-normal leading-tight tracking-[-0.02em] text-ink">Checkout</h1>
        <p className="mt-1 font-sans text-[13px] text-ink-muted">
          Cash on delivery. Please provide complete shipping information.
        </p>
      </div>

      <section className="rounded-2xl border border-surface-border bg-surface p-6 space-y-4">
        <p className="eyebrow">Order Summary</p>
        <ul className="divide-y divide-surface-border">
          {cart.items.map((item) => (
            <li key={item.productId} className="flex items-center gap-3 py-3">
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-surface-subtle">
                {item.imageURL && (
                  <Image
                    src={item.imageURL}
                    alt={item.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {item.name}
                </p>
                <p className="text-xs text-ink-muted">
                  {item.quantity} × {formatPrice(item.unitPrice)}
                </p>
              </div>
              <p className="text-sm font-semibold text-ink tabular-nums">
                {formatPrice(item.unitPrice * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
        <div className="border-t border-surface-border pt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-muted">Subtotal</span>
            <span className="text-sm font-medium text-ink">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-muted">Shipping</span>
            <span className="text-sm font-medium text-ink">{formatPrice(SHIPPING_FEE)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-surface-border pt-2">
            <span className="text-sm font-semibold text-ink">Total</span>
            <span className="text-lg font-bold text-ink">{formatPrice(total)}</span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-surface-border bg-surface p-6 space-y-4">
        <div>
          <p className="eyebrow">Payment Method</p>
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
              <Icon.ShoppingBag size={20} className="text-brand-700" />
            </div>
            <div>
              <p className="font-medium text-ink">Cash on delivery</p>
              <p className="text-xs text-ink-muted">
                Pay the courier when your order arrives.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-surface-border bg-surface p-6 space-y-4">
        <p className="eyebrow">Shipping Information</p>
        <ShippingForm
          onSubmit={handleSubmit}
          submitLabel={`Place order · ${formatPrice(total)}`}
          pending={placeOrder.isPending}
        />
        {error && (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
      </section>
    </div>
  );
}
