"use client";

import { AuthGate } from "@/features/auth/components/auth-gate";
import { OrderList } from "@/features/marketplace/components/order-list";
import { useBuyerOrders } from "@/features/marketplace/hooks/use-orders";

export default function OrdersPage() {
  return (
    <main className="container max-w-3xl py-8">
      <AuthGate>
        <OrdersContent />
      </AuthGate>
    </main>
  );
}

function OrdersContent() {
  const { data, isLoading, error } = useBuyerOrders();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Your orders</h1>
      {isLoading && <p className="text-sm text-zinc-500">Loading orders…</p>}
      {error && <p className="text-sm text-red-600">Failed to load orders.</p>}
      {data && <OrderList orders={data} />}
    </div>
  );
}
