"use client";

import { useState } from "react";
import { useMyAds } from "@/features/ads/hooks/use-ads";
import { CreateAdForm } from "@/features/ads/components/create-ad-form";
import { Icon } from "@/components/ui/icon";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  paused: "bg-zinc-100 text-zinc-600",
  exhausted: "bg-zinc-100 text-zinc-600",
};

export default function VendorAdsPage() {
  const { data: ads, isLoading } = useMyAds();
  const [showForm, setShowForm] = useState(false);

  return (
    <main className="container max-w-3xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">My Ads</h1>
          <p className="text-sm text-zinc-500">Manage your sponsored content campaigns.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="btn-primary flex items-center gap-2"
        >
          <Icon.Plus size={16} />
          New Ad
        </button>
      </div>

      {showForm && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-zinc-900">Create Ad</h2>
          <CreateAdForm onSuccess={() => setShowForm(false)} />
        </div>
      )}

      {isLoading && <p className="text-sm text-zinc-500">Loading…</p>}

      {!isLoading && (!ads || ads.length === 0) && !showForm && (
        <div className="card flex flex-col items-center gap-3 py-16 text-center">
          <Icon.Megaphone size={32} className="text-zinc-300" />
          <p className="font-medium text-zinc-600">No ads yet</p>
          <p className="text-sm text-zinc-400">Create your first sponsored campaign to reach gardeners near you.</p>
        </div>
      )}

      <div className="space-y-3">
        {ads?.map((ad) => (
          <div key={ad.id} className="card p-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-zinc-900">{ad.headline}</p>
                {ad.body && <p className="text-sm text-zinc-500 line-clamp-1">{ad.body}</p>}
              </div>
              <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_STYLE[ad.status] ?? ""}`}>
                {ad.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-zinc-400">
              <span>
                Reach: {ad.impressionsDelivered.toLocaleString()} / {ad.reach.toLocaleString()}
              </span>
              {ad.targetGovernorates.length > 0 && (
                <span>Targeting: {ad.targetGovernorates.join(", ")}</span>
              )}
            </div>
            {ad.rejectionReason && (
              <p className="text-xs text-red-500">Rejected: {ad.rejectionReason}</p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
