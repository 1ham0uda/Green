"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { formatPrice } from "@/lib/utils/format";
import type { Order, OrderStatus } from "../types";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:    "text-amber-700 bg-amber-100",
  accepted:   "text-sky-700 bg-sky-100",
  processing: "text-indigo-700 bg-indigo-100",
  confirmed:  "text-blue-700 bg-blue-100",
  shipped:    "text-violet-700 bg-violet-100",
  delivered:  "text-brand-700 bg-brand-100",
  cancelled:  "text-red-700 bg-red-100",
};

type Range = "7d" | "30d" | "90d" | "all";
const RANGES: { value: Range; label: string }[] = [
  { value: "7d",  label: "7 days"  },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "all", label: "All time" },
];

function getRangeMs(range: Range): number | null {
  if (range === "all") return null;
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

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
  const [range, setRange] = useState<Range>("30d");

  const filtered = useMemo(() => {
    const cutoff = getRangeMs(range);
    if (!cutoff) return orders;
    return orders.filter((o) => o.createdAt && o.createdAt.toMillis() >= cutoff);
  }, [orders, range]);

  const stats = useMemo(() => {
    const delivered  = filtered.filter((o) => o.status === "delivered");
    const revenue    = delivered.reduce((sum, o) => sum + o.subtotal, 0);
    const pending    = filtered.filter((o) => o.status === "pending").length;
    const accepted   = filtered.filter((o) => o.status === "accepted").length;
    const processing = filtered.filter((o) => o.status === "processing").length;
    const confirmed  = filtered.filter((o) => o.status === "confirmed").length;
    const shipped    = filtered.filter((o) => o.status === "shipped").length;
    const cancelled  = filtered.filter((o) => o.status === "cancelled").length;
    return {
      total: filtered.length,
      revenue,
      pending,
      accepted,
      processing,
      confirmed,
      shipped,
      delivered: delivered.length,
      cancelled,
    };
  }, [filtered]);

  const statusBreakdown: { status: OrderStatus; label: string; count: number }[] = [
    { status: "pending",    label: "Pending",    count: stats.pending    },
    { status: "accepted",   label: "Accepted",   count: stats.accepted   },
    { status: "processing", label: "Processing", count: stats.processing },
    { status: "confirmed",  label: "Confirmed",  count: stats.confirmed  },
    { status: "shipped",    label: "Shipped",    count: stats.shipped    },
    { status: "delivered",  label: "Delivered",  count: stats.delivered  },
    { status: "cancelled",  label: "Cancelled",  count: stats.cancelled  },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="eyebrow">Analytics</p>
        <div className="flex items-center gap-1 rounded-xl bg-surface-subtle p-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                range === r.value
                  ? "bg-surface text-ink shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Orders"
          value={stats.total}
          icon={<Icon.ShoppingBag size={20} />}
          accent="brand"
        />
        <StatCard
          label="Revenue"
          value={formatPrice(stats.revenue)}
          sub="delivered only"
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
          icon={<Icon.Check size={20} />}
          accent="brand"
        />
      </div>

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
