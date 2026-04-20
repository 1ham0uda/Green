"use client";

import { StatCard } from "@/features/admin/components/stat-card";
import { useDashboardStats } from "@/features/admin/hooks/use-admin";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/ui/icon";

export default function AdminOverviewPage() {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow mb-1">Dashboard</p>
        <h2 className="font-serif text-[24px] font-normal tracking-[-0.02em] text-ink">Overview</h2>
        <p className="mt-0.5 font-sans text-[13px] text-ink-muted">
          Real-time platform health and activity.
        </p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Total users"
            value={stats.totalUsers}
            accent="brand"
            icon={<Icon.Users size={18} />}
          />
          <StatCard
            label="Total posts"
            value={stats.totalPosts}
            accent="blue"
            icon={<Icon.Leaf size={18} />}
          />
          <StatCard
            label="Total orders"
            value={stats.totalOrders}
            accent="violet"
            icon={<Icon.ShoppingBag size={18} />}
          />
          <StatCard
            label="Pending products"
            value={stats.pendingProducts}
            accent={stats.pendingProducts > 0 ? "amber" : "zinc"}
            icon={<Icon.ShoppingBag size={18} />}
          />
          <StatCard
            label="Open reports"
            value={stats.openReports}
            accent={stats.openReports > 0 ? "red" : "zinc"}
            icon={<Icon.Flag size={18} />}
          />
          <StatCard
            label="Active competitions"
            value={stats.activeCompetitions}
            accent="brand"
            icon={<Icon.Trophy size={18} />}
          />
          <StatCard
            label="Pending verifications"
            value={stats.pendingVerifications}
            accent={stats.pendingVerifications > 0 ? "amber" : "zinc"}
            icon={<Icon.Check size={18} />}
          />
        </div>
      )}
    </div>
  );
}
