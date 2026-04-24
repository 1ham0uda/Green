"use client";

import { useMemo } from "react";
import { Icon } from "@/components/ui/icon";
import { formatPrice } from "@/lib/utils/format";
import type { Order, OrderStatus } from "../types";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:   "text-amber-700 bg-amber-100",
  confirmed: "text-blue-700 bg-blue-100",
  shipped:   "text-violet-700 bg-violet-100",
  delivered: "text-brand-700 bg-brand-100",
  cancelled: "text-red-700 bg-red-100",
};

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent?: string;
}

function StatCard({ label, value, sub, icon, accent = "brand" }: StatCardProps) {
  const accentMap: Record<string, string> = {
    brand:  "bg-brand-50 text-brand-700 border-brand-200",
    amber:  "bg-amber-50 text-amber-700 border-amber-200",
    violet: "bg-violet-50 text-violet-700 border-violet-200",
    red:    "bg-red-50 text-red-700 border-red-200",
    blue:   "bg-blue-50 text-blue-700 border-blue-200",
    zinc:   "bg-zinc-50 text-zinc-600 border-zinc-200",
  };
  return (
    <div className={`rounded-2xl border p-4 ${accentMap[accent] ?? accentMap.zinc}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider opacity-70">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
        </div>
        <span className="opacity-60">{icon}</span>
      </div>
    </div>
  );
}

interface VendorAnalyticsProps {
  orders: Order[];
}

export function VendorAnalytics({ orders }: VendorAnalyticsProps) {
  const stats = useMemo(() => {
    const delivered = orders.filter((o) => o.status === "delivered");
    const revenue = delivered.reduce((sum, o) => sum + o.subtotal, 0);
    const pending = orders.filter((o) => o.status === "pending").length;
    const confirmed = orders.filter((o) => o.status === "confirmed").length;
    const shipped = orders.filter((o) => o.status === "shipped").length;
    const cancelled = orders.filter((o) => o.status === "cancelled").length;

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const recent = orders.filter(
      (o) => o.createdAt && o.createdAt.toMillis() >= thirtyDaysAgo
    ).length;

    return { total: orders.length, revenue, pending, confirmed, shipped, delivered: delivered.length, cancelled, recent };
  }, [orders]);

  const statusBreakdown: { status: OrderStatus; label: string; count: number }[] = [
    { status: "pending",   label: "Pending",   count: stats.pending   },
    { status: "confirmed", label: "Confirmed", count: stats.confirmed },
    { status: "shipped",   label: "Shipped",   count: stats.shipped   },
    { status: "delivered", label: "Delivered", count: stats.delivered },
    { status: "cancelled", label: "Cancelled", count: stats.cancelled },
  ];

  return (
    <div className="space-y-4">
      <p className="eyebrow">Analytics</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total orders"
          value={stats.total}
          sub={`${stats.recent} last 30 days`}
          icon={<Icon.ShoppingBag size={20} />}
          accent="brand"
        />
        <StatCard
          label="Revenue"
          value={formatPrice(stats.revenue)}
          sub="from delivered orders"
          icon={<Icon.TrendingUp size={20} />}
          accent="violet"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          sub="need attention"
          icon={<Icon.Clock size={20} />}
          accent={stats.pending > 0 ? "amber" : "zinc"}
        />
        <StatCard
          label="Delivered"
          value={stats.delivered}
          sub="completed orders"
          icon={<Icon.Check size={20} />}
          accent="brand"
        />
      </div>

      {/* Status breakdown bar */}
      {stats.total > 0 && (
        <div className="rounded-2xl border border-surface-border bg-surface p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Orders by status</p>
          <div className="flex h-3 w-full overflow-hidden rounded-full gap-px">
            {statusBreakdown.filter((s) => s.count > 0).map((s) => (
              <div
                key={s.status}
                className={`h-full transition-all ${STATUS_COLORS[s.status].split(" ")[1]}`}
                style={{ width: `${(s.count / stats.total) * 100}%` }}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {statusBreakdown.filter((s) => s.count > 0).map((s) => (
              <span key={s.status} className="flex items-center gap-1.5 text-xs text-ink-muted">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[s.status]}`}>
                  {s.label}
                </span>
                {s.count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
