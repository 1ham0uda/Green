"use client";

import { useState } from "react";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { OrderList } from "@/features/marketplace/components/order-list";
import {
  useUpdateOrderStatus,
  useVendorOrders,
} from "@/features/marketplace/hooks/use-orders";
import type { OrderStatus } from "@/features/marketplace/types";

export default function VendorOrdersPage() {
  return (
    <main className="container max-w-3xl py-8">
      <AuthGate>
        <VendorOrdersContent />
      </AuthGate>
    </main>
  );
}

function VendorOrdersContent() {
  const { data, isLoading, error } = useVendorOrders();
  const updateStatus = useUpdateOrderStatus();
  const [activeId, setActiveId] = useState<string | null>(null);

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    setActiveId(orderId);
    try {
      await updateStatus.mutateAsync({ orderId, status });
    } finally {
      setActiveId(null);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Incoming orders</h1>
      {isLoading && <p className="text-sm text-zinc-500">Loading orders…</p>}
      {error && <p className="text-sm text-red-600">Failed to load orders.</p>}
      {data && (
        <OrderList
          orders={data}
          onStatusChange={handleStatusChange}
          statusUpdating={activeId}
        />
      )}
    </div>
  );
}
