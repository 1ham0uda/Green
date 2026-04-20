"use client";

import { AuthGate } from "@/features/auth/components/auth-gate";
import { OrderList } from "@/features/marketplace/components/order-list";
import { useBuyerOrders } from "@/features/marketplace/hooks/use-orders";

export default function OrdersPage() {
  return (
    <main className="container max-w-2xl pb-24 md:pb-0">
      <AuthGate>
        <OrdersContent />
      </AuthGate>
    </main>
  );
}

function OrdersContent() {
  const { data, isLoading, error } = useBuyerOrders();

  return (
    <div className="space-y-5">
      <div className="py-5">
        <p className="eyebrow">Account</p>
        <h1 className="font-serif text-[28px] font-normal leading-tight tracking-[-0.02em] text-ink">Your Orders</h1>
      </div>
      {isLoading && <p className="font-sans text-[13px] text-ink-muted">Loading orders…</p>}
      {error && <p className="font-sans text-[13px] text-red-600">Failed to load orders.</p>}
      {data && <OrderList orders={data} />}
    </div>
  );
}
