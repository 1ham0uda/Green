"use client";

import { useState } from "react";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { VendorAnalytics } from "@/features/marketplace/components/vendor-analytics";
import { OrderCard } from "@/features/marketplace/components/order-card";
import { useVendorOrders, useUpdateOrderStatus } from "@/features/marketplace/hooks/use-orders";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import type { OrderStatus } from "@/features/marketplace/types";

const FILTERS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all",        label: "All"        },
  { value: "pending",    label: "Pending"    },
  { value: "accepted",   label: "Accepted"   },
  { value: "processing", label: "Processing" },
  { value: "confirmed",  label: "Confirmed"  },
  { value: "shipped",    label: "Shipped"    },
  { value: "delivered",  label: "Delivered"  },
  { value: "cancelled",  label: "Cancelled"  },
];

export default function VendorDashboardPage() {
  return (
    <main className="container max-w-3xl pb-24 md:pb-10">
      <AuthGate>
        <VendorDashboardContent />
      </AuthGate>
    </main>
  );
}

function VendorDashboardContent() {
  const { data: orders = [], isLoading, error } = useVendorOrders();
  const updateStatus = useUpdateOrderStatus();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    setUpdatingId(orderId);
    try {
      await updateStatus.mutateAsync({ orderId, status });
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="py-5">
        <p className="eyebrow">Vendor</p>
        <h1 className="font-serif text-[28px] font-normal leading-tight tracking-[-0.02em] text-ink">
          Dashboard
        </h1>
        <p className="mt-1 font-sans text-[13px] text-ink-muted">
          Manage your incoming orders and track your sales.
        </p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {error && (
        <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">Failed to load orders.</p>
      )}

      {!isLoading && !error && (
        <>
          {orders.length > 0 && <VendorAnalytics orders={orders} />}

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {FILTERS.map((f) => {
              const count = f.value === "all"
                ? orders.length
                : orders.filter((o) => o.status === f.value).length;
              return (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    filter === f.value
                      ? "bg-ink text-white"
                      : "bg-surface-subtle text-ink-muted hover:bg-surface-border hover:text-ink"
                  }`}
                >
                  {f.label}
                  {count > 0 && (
                    <span className={`ml-1.5 ${filter === f.value ? "opacity-70" : "opacity-50"}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Icon.ShoppingBag size={22} />}
              title={filter === "all" ? "No orders yet" : `No ${filter} orders`}
              description={filter === "all" ? "Orders from buyers will appear here." : ""}
            />
          ) : (
            <div className="space-y-4">
              {filtered.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  vendorMode
                  onStatusChange={handleStatusChange}
                  statusUpdating={updatingId === order.id}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
