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
    <main className="container max-w-2xl pb-24 md:pb-0">
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
    <div className="space-y-5">
      <div className="py-5">
        <p className="eyebrow">Vendor</p>
        <h1 className="font-serif text-[28px] font-normal leading-tight tracking-[-0.02em] text-ink">Incoming Orders</h1>
      </div>
      {isLoading && <p className="font-sans text-[13px] text-ink-muted">Loading orders…</p>}
      {error && <p className="font-sans text-[13px] text-red-600">Failed to load orders.</p>}
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
