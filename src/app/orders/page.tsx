"use client";

import { AuthGate } from "@/features/auth/components/auth-gate";
import { OrderCard } from "@/features/marketplace/components/order-card";
import { useBuyerOrders } from "@/features/marketplace/hooks/use-orders";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";

export default function OrdersPage() {
  return (
    <main className="container max-w-2xl pb-24 md:pb-10">
      <AuthGate>
        <OrdersContent />
      </AuthGate>
    </main>
  );
}

function OrdersContent() {
  const { data: orders = [], isLoading, error } = useBuyerOrders();

  return (
    <div className="space-y-5">
      <div className="py-5">
        <p className="eyebrow">Account</p>
        <h1 className="font-serif text-[28px] font-normal leading-tight tracking-[-0.02em] text-ink">
          Your Orders
        </h1>
        <p className="mt-1 font-sans text-[13px] text-ink-muted">
          Track your orders and request returns for delivered items.
        </p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {error && (
        <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">Failed to load orders.</p>
      )}

      {!isLoading && !error && orders.length === 0 && (
        <EmptyState
          icon={<Icon.ShoppingBag size={22} />}
          title="No orders yet"
          description="Your placed orders will appear here."
          action={
            <a href="/marketplace" className="btn-primary">
              Browse marketplace
            </a>
          }
        />
      )}

      {!isLoading && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} buyerMode />
          ))}
        </div>
      )}
    </div>
  );
}
