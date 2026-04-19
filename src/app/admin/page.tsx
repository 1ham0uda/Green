"use client";

import { StatCard } from "@/features/admin/components/stat-card";
import { useDashboardStats } from "@/features/admin/hooks/use-admin";

export default function AdminOverviewPage() {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-zinc-900">Overview</h2>

      {isLoading && <p className="text-sm text-zinc-500">Loading stats…</p>}

      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="Total users" value={stats.totalUsers} accent="brand" />
          <StatCard label="Total posts" value={stats.totalPosts} accent="brand" />
          <StatCard label="Total orders" value={stats.totalOrders} accent="zinc" />
          <StatCard
            label="Pending products"
            value={stats.pendingProducts}
            accent={stats.pendingProducts > 0 ? "amber" : "zinc"}
          />
          <StatCard
            label="Open reports"
            value={stats.openReports}
            accent={stats.openReports > 0 ? "red" : "zinc"}
          />
          <StatCard
            label="Active competitions"
            value={stats.activeCompetitions}
            accent="brand"
          />
          <StatCard
            label="Pending verifications"
            value={stats.pendingVerifications}
            accent={stats.pendingVerifications > 0 ? "amber" : "zinc"}
          />
        </div>
      )}
    </div>
  );
}
